from secrets import token_urlsafe
from typing import Annotated
from requests import HTTPError
from podium import db
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pyairtable.formulas import EQ, RECORD_ID, match
from podium.routers.auth import get_current_user
from podium.db.user import UserPrivate
from podium.db.project import PrivateProject, Project, PublicProjectCreationPayload
from podium.constants import BAD_AUTH, BAD_ACCESS

router = APIRouter(prefix="/projects", tags=["projects"])


# Get the current user's projects
@router.get("/mine")
def get_projects(
    user: Annotated[UserPrivate, Depends(get_current_user)],
) -> list[PrivateProject]:
    """
    Get the current user's projects and projects they are collaborating on.
    """

    if user is None:
        raise BAD_AUTH

    projects = [
        PrivateProject.model_validate(project["fields"])
        for project in [
            db.projects.get(project_id)
            for project_id in user.projects
        ] + 
            [db.projects.get(project_id)
            for project_id in user.collaborations]
    ]
    return projects


# It's up to the client to provide the event record ID
@router.post("/")
def create_project(
    project: PublicProjectCreationPayload,
    user: Annotated[UserPrivate, Depends(get_current_user)],
):
    """
    Create a new project. The current user is automatically added as an owner of the project.
    """
    if user is None:
        raise BAD_AUTH
    owner = [user.id]

    # Fetch all events that have a record ID matching the project's event ID
    records = db.events.all(formula=EQ(RECORD_ID(), project.event[0]))
    if not records:
        # If the event does not exist, raise a 404
        raise HTTPException(status_code=404, detail="Event not found")

    # If the owner is not part of the event that the project is going to be associated with, raise a 403
    # Might be good to put a try/except block here to check for a 404 but shouldn't be necessary as the event isn't user-provided, it's in the DB
    event_attendees = db.events.get(project.event[0])["fields"].get("attendees", [])
    if not any(i in event_attendees for i in owner):
        raise HTTPException(status_code=403, detail="Owner not part of event")

    while True:
        join_code = token_urlsafe(3).upper()
        if not db.projects.first(formula=match({"join_code": join_code})):
            break

    # https://docs.pydantic.dev/latest/concepts/serialization/#model_copy
    full_project = PrivateProject(
        **project.model_dump(),
        join_code=join_code,
        owner=owner,
        id="",  # Placeholder to prevent an unnecessary class
    )
    db.projects.create(full_project.model_dump(exclude={"id", "points"}))["fields"]


@router.post("/join")
def join_project(
    join_code: Annotated[
        str, Query(description="A unique code used to join a project as a collaborator")
    ],
    user: Annotated[UserPrivate, Depends(get_current_user)],
):
    if user is None:
        raise BAD_AUTH

    project = db.projects.first(formula=match({"join_code": join_code.upper()}))
    if project is None:
        raise HTTPException(status_code=404, detail="No project found")

    project = Project.model_validate(project["fields"])

    # Ensure the user isn't already a collaborator
    if user.id in project.collaborators or user.id in project.owner:
        raise HTTPException(
            status_code=400,
            detail="User is already a collaborator or owner of the project",
        )

    # Ensure the user is part of the event that the project is associated with
    event_attendees = db.events.get(project.event[0])["fields"].get("attendees", [])
    if user.id not in event_attendees:
        raise BAD_ACCESS

    db.projects.update(project.id, {"collaborators": project.collaborators + [user.id]})


# Update project
@router.put("/{project_id}")
def update_project(
    project_id: Annotated[str, Path(pattern=r"^rec\w*$")],
    project: db.ProjectUpdate,
    user: Annotated[UserPrivate, Depends(get_current_user)],
):
    """
    Update a project by replacing it
    """
    # Check if the user is an owner of the project or if they even exist
    if user is None or user.id not in db.projects.get(project_id)["fields"].get("owner", []):
        raise BAD_ACCESS

    return db.projects.update(project_id, project.model_dump())["fields"]


# Delete project
@router.delete("/{project_id}")
def delete_project(
    project_id: Annotated[str, Path(pattern=r"^rec\w*$")],
    user: Annotated[UserPrivate, Depends(get_current_user)],
):
    # Check if the user is an owner of the project or if they even exist
    if user is None or user.id not in db.projects.get(project_id)["fields"].get("owner", []):
        raise BAD_ACCESS

    return db.projects.delete(project_id)


@router.get("/{project_id}")
# The regex here is to ensure that the path parameter starts with "rec" and is followed by any number of alphanumeric characters
def get_project(project_id: Annotated[str, Path(pattern=r"^rec\w*$")]):
    try:
        project = db.projects.get(project_id)
    except HTTPError as e:
        raise (
            HTTPException(status_code=404, detail="Project not found")
            if e.response.status_code in [404, 403]
            else e
        )
    return Project.model_validate(project["fields"])

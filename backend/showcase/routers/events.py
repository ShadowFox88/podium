from fastapi import APIRouter
from typing import Annotated, Self, Set
from fastapi import Depends, HTTPException, Query
from pyairtable.formulas import match
from secrets import token_urlsafe

from pydantic import BaseModel, ConfigDict, Field, model_validator
from requests import HTTPError

# from showcase import db
from showcase.routers.auth import get_current_user
from showcase import db
from showcase.db import Event, events

router = APIRouter(prefix="/events", tags=["events"]) 


@router.get("/")
def get_events():
    """Get a list of all events"""
    return events.all()

@router.get("/attending")
def get_attending_events(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Get a list of all events that the current user is attending.
    """
    user_id = db.user.get_user_record_id_by_email(current_user["email"])
    attending_events = []
    # TODO: Just check the "owned_events" and "attending_events" fields instead of iterating through all events
    for event in events.all():
        if user_id in event["fields"].get("attendees", []) or user_id in event["fields"].get("owner", []):
            attending_events.append(event)

    # TODO: Replace this with Pydantic
    okay_fields = ["name", "description"]
    to_return = [{
        "id": event["id"],
        **{field: event["fields"].get(field) for field in okay_fields}
    } for event in attending_events]
    return to_return


@router.post("/")
def create_event(
    event: Event, current_user: Annotated[dict, Depends(get_current_user)]
):
    """
    Create a new event. The current user is automatically added as an owner of the event.
    """
    # No matter what email the user provides, the owner is always the current user
    event.owner = [db.user.get_user_record_id_by_email(current_user["email"])]
    # If any owner is None, raise a 404
    if any(owner is None for owner in event.owner):
        raise HTTPException(status_code=404, detail="Owner not found")

    # Generate a join code
    event.join_code = token_urlsafe(8)

    # print(event.model_dump())
    return events.create(event.model_dump())


@router.post("/attend")
def attend_event(
    join_code: Annotated[str, Query(description="A unique code used to join an event")],
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Attend an event. The client must supply a join code that matches the event's join code.
    """
    # Accomplish this by trying to match the join code against the table and if nothing matches, return a 404
    event = events.first(formula=match({"join_code": join_code}))
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    # If the event is found, add the current user to the attendees list
    # But first, ensure that the user is not already in the list
    if db.user.get_user_record_id_by_email(current_user["email"]) in event[
        "fields"
    ].get("attendees", []):
        raise HTTPException(status_code=400, detail="User already attending event")
    events.update(
        event["id"],
        {
            "attendees": event["fields"].get("attendees", [])
            + [db.user.get_user_record_id_by_email(current_user["email"])]
        },
    )

# Voting! The client should POST to /events/{event_id}/vote with their top 3 favorite projects, in no particular order. If there are less than 20 projects in the event, only accept the top 2

# ... signifies that the field is required: https://docs.pydantic.dev/latest/concepts/models/#required-fields
class Vote(BaseModel):
    event_id : str = Field(..., description="The ID of the event to vote in.")
    # Sets prevent duplicates so they're perfect for this use case
    projects: Set[str] = Field(..., min_items=2, max_items=3, description="In no particular order, the top 3 (or 2 if there are less than 20 projects) projects that the user is voting for.")

    # https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict.extra
    model_config = ConfigDict(extra="allow")


    @model_validator(mode='after')
    def validate_projects(self) -> Self:
        try:
            self.event = db.events.get(self.event_id)
        except HTTPError as e:
            raise HTTPException(status_code=404, detail="Event not found") if e.response.status_code == 404 else e
        if len(self.projects) < 2:
            raise HTTPException(status_code=400, detail="At least 2 projects are required")
        elif len(self.projects) < 3 and len(self.event["fields"]["projects"]) >= 20:
            raise HTTPException(status_code=400, detail="3 projects are required for events with 20 or more projects")
        elif len(self.projects) > 3:
            raise HTTPException(status_code=400, detail="At most 3 projects are allowed")
        
        # Ensure that the projects exist, they match the event, and the string starts with 'rec'
        for project_id in self.projects:
            try:
                project = db.projects.get(project_id)
            except HTTPError as e:
                raise HTTPException(status_code=404, detail="Project not found") if e.response.status_code == 404 else e
            if project["fields"]["event"][0] != self.event_id:
                raise HTTPException(status_code=400, detail="Project does not belong to event")
        return self
    
# @router.post("/{event_id}/vote")
@router.post("/vote")
def vote(vote: Vote, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Vote for the top 3 projects in an event. The client must provide the event ID and a list of the top 3 projects. If there are less than 20 projects in the event, only the top 2 projects are required.
    """

    # TODO: Ensure that the user has not already voted

    # Update the votes (increment the `points` field of the nominated projects by 1)
    for project_id in vote.projects:
        try:
            project = db.projects.get(project_id)
            db.projects.update(project_id, {"points": project["fields"].get("points", 0) + 1})
        except HTTPError as e:
            raise HTTPException(status_code=404, detail="Project not found") if e.response.status_code == 404 else e

    return {"message": "Vote successful"}
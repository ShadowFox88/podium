// This file is auto-generated by @hey-api/openapi-ts

export type CheckAuthResponse = {
    email: string;
};

export type CreateVotes = {
    projects: Array<(string)>;
    event: string;
};

export type Event = {
    name: string;
    description?: (string | null);
    votable?: boolean;
    leaderboard_enabled?: boolean;
    id: string;
    owner: [
        string
    ];
};

export type EventCreationPayload = {
    name: string;
    description?: (string | null);
    votable?: boolean;
    leaderboard_enabled?: boolean;
};

export type EventUpdate = {
    name: string;
    description?: (string | null);
    votable?: boolean;
    leaderboard_enabled?: boolean;
};

export type HTTPValidationError = {
    detail?: Array<ValidationError>;
};

export type MagicLinkVerificationResponse = {
    access_token: string;
    token_type: string;
    email: string;
};

/**
 * All data loaded from the event table. Should only be used internally or by the owner of the event.
 */
export type PrivateEvent = {
    name: string;
    description?: (string | null);
    votable?: boolean;
    leaderboard_enabled?: boolean;
    id: string;
    owner: [
        string
    ];
    attendees?: Array<(string)>;
    join_code: string;
    projects?: Array<(string)>;
    referrals?: Array<(string)>;
    /**
     * The maximum number of votes a user can cast for this event. This is based on the number of projects in the event. If there are 20 or more projects, the user can vote for 3 projects. Otherwise, they can vote for 2 projects.
     */
    readonly max_votes_per_user: number;
};

export type PrivateProject = {
    name: string;
    repo: string;
    image_url: string;
    demo: string;
    description?: (string | null);
    event: [
        string
    ];
    /**
     * A lower-bound estimate of the number of hours spent on the project. Only used for general statistics.
     */
    hours_spent?: number;
    id: string;
    points?: number;
    votes?: Array<(string)>;
    collaborators?: Array<(string)>;
    owner: [
        string
    ];
    join_code: string;
};

export type Project = {
    name: string;
    repo: string;
    image_url: string;
    demo: string;
    description?: (string | null);
    event: [
        string
    ];
    /**
     * A lower-bound estimate of the number of hours spent on the project. Only used for general statistics.
     */
    hours_spent?: number;
    id: string;
    points?: number;
    votes?: Array<(string)>;
    collaborators?: Array<(string)>;
    owner: [
        string
    ];
};

export type ProjectUpdate = {
    name: string;
    repo: string;
    image_url: string;
    demo: string;
    description?: (string | null);
    event: [
        string
    ];
    /**
     * A lower-bound estimate of the number of hours spent on the project. Only used for general statistics.
     */
    hours_spent?: number;
};

export type PublicProjectCreationPayload = {
    name: string;
    repo: string;
    image_url: string;
    demo: string;
    description?: (string | null);
    event: [
        string
    ];
    /**
     * A lower-bound estimate of the number of hours spent on the project. Only used for general statistics.
     */
    hours_spent?: number;
};

/**
 * Return information regarding what the events the user owns and what events they are attending. If they are only attending an event, don't return sensitive information like participants.
 */
export type UserEvents = {
    owned_events: Array<PrivateEvent>;
    attending_events: Array<Event>;
};

export type UserExistsResponse = {
    exists: boolean;
};

export type UserLoginPayload = {
    email: string;
};

export type UserPrivate = {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    street_1?: (string | null);
    street_2?: (string | null);
    city?: (string | null);
    state?: (string | null);
    zip_code?: (string | null);
    country?: (string | null);
    dob?: (string | null);
    id: string;
    votes?: Array<(string)>;
    projects?: Array<(string)>;
    collaborations?: Array<(string)>;
    owned_events?: Array<(string)>;
    attending_events?: Array<(string)>;
    referral?: Array<(string)>;
};

export type UserPublic = {
    first_name: string;
    last_name?: string;
};

export type UserSignupPayload = {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    street_1?: (string | null);
    street_2?: (string | null);
    city?: (string | null);
    state?: (string | null);
    zip_code?: (string | null);
    country?: (string | null);
    dob?: (string | null);
};

export type ValidationError = {
    loc: Array<(string | number)>;
    msg: string;
    type: string;
};

export type RequestLoginRequestLoginPostData = {
    body: UserLoginPayload;
    query: {
        redirect: string;
    };
};

export type RequestLoginRequestLoginPostResponse = (unknown);

export type RequestLoginRequestLoginPostError = (HTTPValidationError);

export type VerifyTokenVerifyGetData = {
    query: {
        token: string;
    };
};

export type VerifyTokenVerifyGetResponse = (MagicLinkVerificationResponse);

export type VerifyTokenVerifyGetError = (HTTPValidationError);

export type ProtectedRouteProtectedRouteGetResponse = (CheckAuthResponse);

export type ProtectedRouteProtectedRouteGetError = unknown;

export type GetEventEventsEventIdGetData = {
    path: {
        event_id: string;
    };
};

export type GetEventEventsEventIdGetResponse = ((PrivateEvent | Event));

export type GetEventEventsEventIdGetError = (HTTPValidationError);

export type UpdateEventEventsEventIdPutData = {
    body: EventUpdate;
    path: {
        event_id: string;
    };
};

export type UpdateEventEventsEventIdPutResponse = (unknown);

export type UpdateEventEventsEventIdPutError = (HTTPValidationError);

export type DeleteEventEventsEventIdDeleteData = {
    path: {
        event_id: string;
    };
};

export type DeleteEventEventsEventIdDeleteResponse = (unknown);

export type DeleteEventEventsEventIdDeleteError = (HTTPValidationError);

export type GetAttendingEventsEventsGetResponse = (UserEvents);

export type GetAttendingEventsEventsGetError = unknown;

export type CreateEventEventsPostData = {
    body: EventCreationPayload;
};

export type CreateEventEventsPostResponse = (unknown);

export type CreateEventEventsPostError = (HTTPValidationError);

export type AttendEventEventsAttendPostData = {
    query: {
        /**
         * A unique code used to join an event
         */
        join_code: string;
        /**
         * How did you hear about this event?
         */
        referral: string;
    };
};

export type AttendEventEventsAttendPostResponse = (unknown);

export type AttendEventEventsAttendPostError = (HTTPValidationError);

export type VoteEventsVotePostData = {
    body: CreateVotes;
};

export type VoteEventsVotePostResponse = (unknown);

export type VoteEventsVotePostError = (HTTPValidationError);

export type GetLeaderboardEventsEventIdLeaderboardGetData = {
    path: {
        event_id: string;
    };
};

export type GetLeaderboardEventsEventIdLeaderboardGetResponse = (Array<Project>);

export type GetLeaderboardEventsEventIdLeaderboardGetError = (HTTPValidationError);

export type GetEventProjectsEventsEventIdProjectsGetData = {
    path: {
        event_id: string;
    };
};

export type GetEventProjectsEventsEventIdProjectsGetResponse = (Array<Project>);

export type GetEventProjectsEventsEventIdProjectsGetError = (HTTPValidationError);

export type GetProjectsProjectsMineGetResponse = (Array<PrivateProject>);

export type GetProjectsProjectsMineGetError = unknown;

export type CreateProjectProjectsPostData = {
    body: PublicProjectCreationPayload;
};

export type CreateProjectProjectsPostResponse = (unknown);

export type CreateProjectProjectsPostError = (HTTPValidationError);

export type JoinProjectProjectsJoinPostData = {
    query: {
        /**
         * A unique code used to join a project as a collaborator
         */
        join_code: string;
    };
};

export type JoinProjectProjectsJoinPostResponse = (unknown);

export type JoinProjectProjectsJoinPostError = (HTTPValidationError);

export type UpdateProjectProjectsProjectIdPutData = {
    body: ProjectUpdate;
    path: {
        project_id: string;
    };
};

export type UpdateProjectProjectsProjectIdPutResponse = (unknown);

export type UpdateProjectProjectsProjectIdPutError = (HTTPValidationError);

export type DeleteProjectProjectsProjectIdDeleteData = {
    path: {
        project_id: string;
    };
};

export type DeleteProjectProjectsProjectIdDeleteResponse = (unknown);

export type DeleteProjectProjectsProjectIdDeleteError = (HTTPValidationError);

export type GetProjectProjectsProjectIdGetData = {
    path: {
        project_id: string;
    };
};

export type GetProjectProjectsProjectIdGetResponse = (unknown);

export type GetProjectProjectsProjectIdGetError = (HTTPValidationError);

export type UserExistsUsersExistsGetData = {
    query: {
        email: string;
    };
};

export type UserExistsUsersExistsGetResponse = (UserExistsResponse);

export type UserExistsUsersExistsGetError = (HTTPValidationError);

export type GetUserPublicUsersUserIdGetData = {
    path: {
        user_id: string;
    };
};

export type GetUserPublicUsersUserIdGetResponse = (UserPublic);

export type GetUserPublicUsersUserIdGetError = (HTTPValidationError);

export type GetCurrentUserUsersCurrentGetResponse = (UserPrivate);

export type GetCurrentUserUsersCurrentGetError = unknown;

export type CreateUserUsersPostData = {
    body: UserSignupPayload;
};

export type CreateUserUsersPostResponse = (unknown);

export type CreateUserUsersPostError = (HTTPValidationError);
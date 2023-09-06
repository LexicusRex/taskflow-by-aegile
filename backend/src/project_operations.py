import os.path
from src.helpers import (
    add_project_to_user_reports,
    delete_project_from_user_reports,
)
from src.classes.project import Project
from src.classes.connection import Connection
from src.classes.user import User
from src.classes.invite import Invite
from src.classes.performance import Performance

TASK_STATUS_INDEX = 6
TASK_COMPLETED = "completed"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def add_project(creator, data):
    project = Project()
    project.new(
        creator,
        data["name"],
        data["subheading"],
        data["description"],
        data["endDate"],
        data["members"],
    )
    Performance(creator).new_project(project.p_id)
    add_project_to_user_reports(creator, project.p_id)
    return {}


def edit_project(creator, project_data):
    Project().edit(creator, project_data)
    return {}


def delete_project(creator, project_id):
    Project(project_id).delete(creator)
    delete_project_from_user_reports(creator, project_id)
    file_path = os.path.join(BASE_DIR, f"analytics/projects/{project_id}.csv")
    try:
        os.unlink(file_path)
    except OSError as err:
        print(f"ERROR. Could not delete {file_path} due to {err}.")
    # TODO - notifications
    return {}


def get_projects(handle):
    return {"projects": Project.get_all(handle)}


# Single project information query
def get_project(handle, project_id):
    # TODO - double check
    return {"project": Project(project_id).data}


def get_all_project_members(handle, project_id):
    # TODO - double check
    return Project(project_id).get_members(handle)


def get_project_members(handle, project_id):
    connections = set(Connection(handle).accepted)
    invites = set(Project(project_id).pending_invites())
    project_members = Project(project_id).members
    members = set(member["handle"] for member in project_members)
    # TODO - double check
    return {
        "members": project_members,
        "connections": [
            User(handle).data for handle in ((connections - invites) - members)
        ],
    }


def invite_users(inviter_handle: str, project_id: int, invitees: list):
    for invitee in invitees:
        Invite(inviter_handle, "has").send(
            ["inviter", "user", "project", "role", "accepted"],
            (inviter_handle, invitee, project_id, "member", "FALSE"),
        )
    # TODO - notification
    return {}


def get_invites(handle):
    return {
        "pending": Invite(handle, "has").get("user", "inviter", "project", "projectId"),
        "accept": Invite(handle, "has").get("inviter", "user", "project", "projectId"),
    }


def accept_invite(handle, inviter_handle, project_id):
    Invite(handle, "has").accept("project", project_id)
    add_project_to_user_reports(handle, project_id)
    Performance(handle).new_project_member(project_id)
    # TODO - notification


def delete_invite(handle, project_id, target_handle):
    Invite(handle, "has").delete(handle, target_handle, "project", project_id)
    Invite(handle, "has").delete(target_handle, handle, "project", project_id)
    # TODO - notification
    return {}


def remove_member(handle, project_id, target_handle):
    Project(project_id).remove_member(target_handle)
    delete_project_from_user_reports(target_handle, project_id)
    Performance(target_handle).remove_project_member(project_id)
    # TODO - notification
    return {}


def update_member_permissions(handle, project_id, target_handle):
    # * Check permissions before change
    Project(project_id).change_permissions(handle, target_handle)
    # TODO - notification
    return {}

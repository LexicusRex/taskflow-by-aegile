import os.path
from datetime import datetime
from zoneinfo import ZoneInfo
import pandas as pd
from src.helpers import (
    get_db,
    add_notification,
    add_project_to_user_reports,
    delete_project_from_user_reports,
    update_achievement,
)
from src.error import InputError, AccessError
from src.performance import calc_total_busyness
from src.task_operations import get_task
from src.__config__ import ANALYTICS_TIMESPAN
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

    # # Add new project to projects table
    # conn = get_db()
    # with conn:
    #     cur = conn.cursor()
    #     sql = "INSERT INTO projects (creator, name, subheading, description, end_date) VALUES (?, ?, ?, ?, ?)"
    #     val = (creator, name, subheading, description, end_date)
    #     cur.execute(sql, val)
    #     conn.commit()
    #     # Add creator of project into the has table (automatically admin)
    #     project_id = cur.lastrowid
    #     sql = "INSERT INTO has (user, project, role) VALUES (?, ?, ?)"
    #     val = (creator, project_id, "creator")
    #     cur.execute(sql, val)
    #     conn.commit()
    #     # Add each member into the project
    #     invite_users(creator, project_id, members)
    #     cur.close()
    #     handle = conn.execute(
    #         "SELECT handle FROM users WHERE id = ?", (creator,)
    #     ).fetchone()["handle"]
    #     # Add a csv file to store task analytics for the project and its members
    #     curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%H:%M")
    #     if ANALYTICS_TIMESPAN == 86400:
    #         curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%d/%m/%Y")
    #     path = os.path.join(BASE_DIR, "analytics/projects")
    #     new_data = [[curr_date, 0, 0, 0]]
    #     new_df = pd.DataFrame(
    #         data=new_data,
    #         columns=["date", handle, "total_tasks_completed", "daily_tasks_completed"],
    #     )
    #     new_df.to_csv(path + f"/{project_id}.csv", mode="w", index=False)

    #     add_project_to_user_reports(handle, project_id)
    # # Achievements: Create projects
    # update_achievement("Creator", creator)
    # return {}


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
    return {}

    conn = get_db()
    with conn:
        creator_info = conn.execute(
            "SELECT email, handle FROM users WHERE id = ?", (creator,)
        ).fetchone()
        email, handle = creator_info["email"], creator_info["handle"]
        project_name = conn.execute(
            "SELECT name FROM projects WHERE id = ?", (project_id,)
        ).fetchone()["name"]
        role = conn.execute(
            "SELECT role FROM has WHERE user = ? AND project = ?", (creator, project_id)
        ).fetchone()["role"]
        if role != "creator":
            raise AccessError("Only the creator can delete the project.")

        proj_tasks = get_task(project_id)
        proj_members = get_project_members(email, project_id)["members"]
        cur = conn.cursor()
        # Delete assigned members, then comments, then the task itself
        for task in proj_tasks:
            cur.execute("DELETE FROM assigned WHERE task = ?", (task["id"],))
            cur.execute("DELETE FROM comments WHERE task = ?", (task["id"],))
            cur.execute("DELETE FROM tasks WHERE id = ?", (task["id"],))
            conn.commit()

        # Delete all members, the project and exisiting project invites
        cur.execute("DELETE FROM has WHERE project = ?", (project_id,))
        cur.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        cur.execute("DELETE FROM project_invites WHERE project = ?", (project_id,))
        conn.commit()
        # Delete csv file for project
        delete_project_from_user_reports(handle, project_id)
        file_path = os.path.join(BASE_DIR, f"analytics/projects/{project_id}.csv")
        try:
            os.unlink(file_path)
        except OSError as err:
            print(f"ERROR. Could not delete {file_path} due to {err}.")

        # Send notification to all project members except creator
        for member in proj_members:
            if member["handle"] != handle:
                member_email = conn.execute(
                    "SELECT email FROM users WHERE handle = ?", (member["handle"],)
                ).fetchone()["email"]
                add_notification(
                    member_email,
                    handle,
                    "project",
                    "delete",
                    f"has deleted {project_name}. You have been removed from all \
                    your assigned tasks in the project.",
                    project_id,
                )


def get_projects(handle):
    return {"projects": Project.get_all(handle)}

    # conn = get_db()
    # with conn:
    #     user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchall()
    #     user_id = user[0]["id"]
    #     project_info = []

    #     sql = """
    #         SELECT projects.id, projects.name, projects.subheading, projects.description, projects.end_date
    #         FROM projects
    #         JOIN has
    #         ON projects.id = has.project
    #         WHERE has.user = ?
    #     """
    #     val = (user_id,)
    #     projects = conn.execute(sql, val).fetchall()

    #     for project in projects:
    #         # Get the number of tasks for that project
    #         tasks = conn.execute(
    #             "SELECT * FROM tasks WHERE project = ?", (project[0],)
    #         ).fetchall()

    #         # Counting up completed tasks to get progress
    #         # Assuming the following task statuses:
    #         # 0 - todo, 1 - in progress, 2 - complete, 3 - overdue
    #         completed = 0
    #         for task in tasks:
    #             if task[TASK_STATUS_INDEX] == TASK_COMPLETED:
    #                 completed += 1
    #         progress = int((completed / len(tasks)) * 100) if len(tasks) > 0 else 0

    #         # Might need to add number of members/connections for next sprint
    #         project_info.append(
    #             {
    #                 "id": project[0],
    #                 "name": project[1],
    #                 "subheading": project[2],
    #                 "description": project[3],
    #                 "endDate": project[4],
    #                 "tasks": len(tasks),
    #                 "progress": progress,
    #                 "members": get_project_members(email, project[0])["members"],
    #             }
    #         )
    # return {"projects": project_info}


# Single project information query
def get_project(handle, project_id):
    return {"project": Project(project_id).data}
    conn = get_db()
    with conn:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        user_id = user["id"]

        sql = """
            SELECT projects.id, projects.name, projects.subheading, projects.description, projects.end_date
            FROM projects
            JOIN has
            ON projects.id = has.project
            WHERE has.user = ? AND projects.id = ?
        """
        val = (user_id, project_id)
        project = conn.execute(sql, val).fetchone()

        if project:
            # Get the number of tasks for that project
            tasks = conn.execute(
                "SELECT * FROM tasks WHERE project = ?", (project_id,)
            ).fetchall()

            completed = sum(
                1 for task in tasks if task[TASK_STATUS_INDEX] == TASK_COMPLETED
            )
            progress = int((completed / len(tasks)) * 100) if tasks else 0

            project_info = {
                "id": project[0],
                "name": project[1],
                "subheading": project[2],
                "description": project[3],
                "endDate": project[4],
                "tasks": len(tasks),
                "progress": progress,
                "members": get_project_members(email, project_id)["members"],
            }

            return {"project": project_info}
        else:
            return {"error": "Project not found"}


def get_all_project_members(handle, project_id):
    return Project(project_id).get_members(handle)


def get_project_members(handle, project_id):
    connections = set(Connection(handle).accepted)
    invites = set(Project(project_id).pending_invites())
    project_members = Project(project_id).members
    members = set(member["handle"] for member in project_members)
    return {
        "members": project_members,
        "connections": [
            User(handle).data for handle in ((connections - invites) - members)
        ],
    }
    conn = get_db()
    with conn:
        cur = conn.cursor()
        sql = """
            SELECT *
            FROM users
            JOIN has
            ON users.id = has.user
            WHERE has.project = ?
        """
        val = (project_id,)
        members = cur.execute(sql, val).fetchall()
        member_handles = [member["handle"] for member in members]
        user = cur.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

        query = """
            SELECT *
            FROM connections c
            JOIN users u
            ON c.addressee = u.id
            WHERE c.requestor = ?
            AND c.accepted = ?
        """
        connections = cur.execute(query, (user["id"], "TRUE")).fetchall()
        connections = [
            connection
            for connection in connections
            if connection["handle"] not in member_handles
        ]

        members_list = []
        connections_list = []
        for member in members:
            members_list.append(
                {
                    "name": f"{member['first_name']} {member['last_name']}",
                    "handle": member["handle"],
                    "image": member["image"],
                    "skills": member["skills"],
                    "role": member["role"],
                }
            )
        for connection in connections:
            connections_list.append(
                {
                    "name": f"{connection['first_name']} {connection['last_name']}",
                    "handle": connection["handle"],
                    "image": connection["image"],
                    "skills": connection["skills"],
                    "busyness": calc_total_busyness(connection["email"]),
                }
            )

    return {"members": members_list, "connections": connections_list}


def invite_users(inviter_handle: str, project_id: int, invitees: list):
    for invitee in invitees:
        Invite(inviter_handle, "has").send(
            ["inviter", "user", "project", "role", "accepted"],
            (inviter_handle, invitee, project_id, "member", "FALSE"),
        )
    # TODO - notification
    return {}
    """
    Invites other users to a project

    Parameters:
    inviter_id (integer): Id of inviter
    project_id (integer): Id of project
    invitees (string): List of user handles

    Returns:
    None
    """
    # Adds connections to the project specified
    # Assuming that invitees is an array of user handles
    conn = get_db()
    with conn:
        # Check that inviter is an admin of the project
        project = conn.execute(
            "SELECT * FROM has WHERE user = ? AND project = ?", (inviter_id, project_id)
        ).fetchall()
        if len(project) <= 0 or project[0]["role"] == "member":
            raise AccessError("Inviter is not an admin of the project.")
        project_name = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()["name"]

        inviter_handle = conn.execute(
            "SELECT * FROM users WHERE id = ?", (inviter_id,)
        ).fetchone()["handle"]

        invitee_info = []
        for invitee_handle in invitees:
            info = conn.execute(
                "SELECT * FROM users WHERE handle = ?", (invitee_handle,)
            ).fetchone()
            invitee_id, invitee_email = info["id"], info["email"]
            invitee_info.append((invitee_id, invitee_email))

            # Check that invitee is a connection of the inviter
            connection = conn.execute(
                "SELECT * FROM connections WHERE requestor = ? AND addressee = ?",
                (inviter_id, invitee_id),
            ).fetchall()
            if len(connection) <= 0 or connection[0]["accepted"] != "TRUE":
                raise AccessError(f"{invitee_handle} is not a connection.")
            # Check that invitee is not currently in the project already
            member = conn.execute(
                "SELECT * FROM has WHERE user = ? AND project = ?",
                (invitee_id, project_id),
            ).fetchall()
            if len(member) > 0:
                raise InputError(
                    f"{invitee_handle} is already a member of the project."
                )

        cur = conn.cursor()
        for info_tup in invitee_info:
            # Insert invite into project_invites table, check if invite has
            # already been sent
            invites = cur.execute(
                "SELECT * FROM project_invites WHERE inviter = ? AND invitee = ? AND project = ?",
                (inviter_id, info_tup[0], project_id),
            ).fetchall()
            if len(invites) <= 0:
                cur.execute(
                    "INSERT INTO project_invites (inviter, invitee, project) VALUES (?, ?, ?)",
                    (inviter_id, info_tup[0], project_id),
                )
                conn.commit()
            add_notification(
                info_tup[1],
                inviter_handle,
                "project",
                "invite",
                f"has invited you to {project_name}.",
                project_id,
            )
        cur.close()

    return {}


def get_invites(handle):
    return {
        "pending": Invite(handle, "has").get("user", "inviter", "project", "projectId"),
        "accept": Invite(handle, "has").get("inviter", "user", "project", "projectId"),
    }

    """
    Retrieves project invites

    Parameters:
    email (string): Email of user

    Returns:
    None
    """
    my_invites = {"pending": [], "accept": []}
    conn = get_db()
    with conn:
        cur = conn.cursor()
        user_id = cur.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()["id"]

        sql = """
            SELECT users.handle, users.image, projects.id, projects.name
            FROM users
            JOIN project_invites
            ON users.id = project_invites.invitee
            JOIN projects
            ON projects.id = project_invites.project
            WHERE project_invites.inviter = ?
        """
        outgoing = cur.execute(sql, (user_id,)).fetchall()

        sql = """
            SELECT users.handle, users.image, projects.id, projects.name
            FROM users
            JOIN project_invites
            ON users.id = project_invites.inviter
            JOIN projects
            ON projects.id = project_invites.project
            WHERE project_invites.invitee = ?
        """
        incoming = cur.execute(sql, (user_id,)).fetchall()

        for invite in outgoing:
            my_invites["pending"].append(
                {
                    "handle": invite[0],
                    "image": invite[1],
                    "projectId": invite[2],
                    "projectName": invite[3],
                }
            )
        for invite in incoming:
            my_invites["accept"].append(
                {
                    "handle": invite[0],
                    "image": invite[1],
                    "projectId": invite[2],
                    "projectName": invite[3],
                }
            )

    return my_invites


def accept_invite(handle, inviter_handle, project_id):
    Invite(handle, "has").accept("project", project_id)
    add_project_to_user_reports(handle, project_id)
    Performance(handle).new_project_member(project_id)
    # TODO - notification

    return {}
    """
    Accepts a project invite

    Parameters:
    email (string): Email of user
    project_id (integer): Id of project
    inviter_handle (string): Handle of inviter

    Returns:
    None
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        user_info = cur.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        user_id, user_handle = user_info["id"], user_info["handle"]

        inviter_info = cur.execute(
            "SELECT * FROM users WHERE handle = ?", (inviter_handle,)
        ).fetchone()
        inviter_id, inviter_email = inviter_info["id"], inviter_info["email"]

        # Check that project still exists in case it is deleted
        project_info = cur.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not project_info:
            raise AccessError("This project no longer exists. Please reload.")
        project_name = project_info["name"]

        # Check that the invite still exists
        pending = cur.execute(
            "SELECT * FROM project_invites WHERE inviter = ? AND invitee = ? AND project = ?",
            (inviter_id, user_id, project_id),
        ).fetchall()
        if len(pending) <= 0:
            raise InputError(
                "No pending invite from this user for this project. Please reload."
            )

        # Remove all outstanding invites for the project
        cur.execute(
            "DELETE FROM project_invites WHERE invitee = ? AND project = ?",
            (user_id, project_id),
        )
        conn.commit()
        # Add user to the project
        cur.execute(
            "INSERT INTO has (user, project, role) VALUES (?, ?, ?)",
            (user_id, project_id, "member"),
        )
        conn.commit()
        add_notification(
            inviter_email,
            user_handle,
            "project",
            "accept",
            f"has accepted your invite to join {project_name}",
            project_id,
        )
        # Add new column to project csv for new user
        add_project_to_user_reports(user_handle, project_id)
        path = os.path.join(BASE_DIR, f"analytics/projects")
        curr_df = pd.read_csv(path + f"/{project_id}.csv")
        num_rows = len(curr_df)
        num_cols = len(curr_df.columns)
        row_entries = [-1] * (num_rows - 1)
        row_entries.append(0)
        curr_df.insert(num_cols - 2, user_handle, row_entries)
        curr_df.to_csv(path + f"/{project_id}.csv", mode="w", index=False)

    return {}


def delete_invite(handle, project_id, target_handle):
    Invite(handle, "has").delete(handle, target_handle, "project", project_id)
    Invite(handle, "has").delete(target_handle, handle, "project", project_id)
    return {}

    """
    Deletes a project invite
    Parameters:
    email (string): Email of user
    project_id (integer): Id of project
    inviter_handle (string): Handle of inviter
    Returns:
    None
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        user_info = cur.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        user_id, user_handle = user_info["id"], user_info["handle"]

        inviter_info = cur.execute(
            "SELECT * FROM users WHERE handle = ?", (inviter_handle,)
        ).fetchone()
        inviter_id, inviter_email = inviter_info["id"], inviter_info["email"]

        # Check that project still exists in case it is deleted
        project_info = cur.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not project_info:
            raise AccessError("This project no longer exists. Please reload.")
        project_name = project_info["name"]

        # Check that the invite still exists
        pending1 = cur.execute(
            "SELECT * FROM project_invites WHERE inviter = ? AND invitee = ? AND project = ?",
            (inviter_id, user_id, project_id),
        ).fetchall()
        pending2 = cur.execute(
            "SELECT * FROM project_invites WHERE inviter = ? AND invitee = ? AND project = ?",
            (user_id, inviter_id, project_id),
        ).fetchall()
        if len(pending1) <= 0 and len(pending2) <= 0:
            raise InputError("This invite no longer exists. Please reload.")

        # Remove all outstanding invites for the project
        cur.execute(
            "DELETE FROM project_invites WHERE inviter = ? AND invitee = ? AND project = ?",
            (inviter_id, user_id, project_id),
        )
        conn.commit()
        cur.execute(
            "DELETE FROM project_invites WHERE inviter = ? AND invitee = ? AND project = ?",
            (user_id, inviter_id, project_id),
        )
        conn.commit()
        add_notification(
            inviter_email,
            user_handle,
            "project",
            "delete",
            f"has declined your invite to join {project_name}",
            project_id,
        )

    return {}


def remove_member(handle, project_id, target_handle):
    Project(project_id).remove_member(target_handle)
    delete_project_from_user_reports(target_handle, project_id)
    Performance(target_handle).remove_project_member(project_id)
    # TODO - notification
    return {}
    """
    Removes a user from the project

    Parameters:
    email (string): Email of user
    project_id (integer): Id of project
    target_handle (string): Handle of user being removed

    Returns:
    None
    """
    # Removes a user from the specified project
    conn = get_db()
    with conn:
        user_info = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        user_id, user_handle = user_info["id"], user_info["handle"]

        target_info = conn.execute(
            "SELECT * FROM users WHERE handle = ?", (target_handle,)
        ).fetchone()
        target_id, target_email = target_info["id"], target_info["email"]

        # Check that project still exists
        project_info = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not project_info:
            raise AccessError("This project no longer exists. Please reload.")
        project_name = project_info["name"]

        user_role = conn.execute(
            "SELECT * FROM has WHERE user = ? AND project = ?", (user_id, project_id)
        ).fetchone()["role"]
        target_role = conn.execute(
            "SELECT * FROM has WHERE user = ? AND project = ?", (target_id, project_id)
        ).fetchone()["role"]

        # Project creators can remove admins and members, but not creators (themself)
        if user_role == "creator" and target_role == "creator":
            raise AccessError("Creators can only remove admins and members.")
        # Admins can only remove members
        if user_role == "admin" and target_role != "member":
            raise AccessError("Admins can only remove members.")
        # Members cannot remove anyone
        if user_role == "member":
            raise AccessError("Members cannot remove anyone.")

        # Remove user from project and their assigned tasks
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM has WHERE user = ? AND project = ?", (target_id, project_id)
        )
        conn.commit()
        sql = """
            SELECT tasks.id
            FROM tasks
            JOIN assigned
            ON tasks.id = assigned.task
            WHERE assigned.user = ? AND tasks.project = ?
        """
        assigned_tasks = cur.execute(sql, (target_id, project_id)).fetchall()
        for task in assigned_tasks:
            cur.execute(
                "DELETE FROM assigned WHERE task = ? AND user = ?",
                (task["id"], target_id),
            )
            conn.commit()
        # Sending notification to the removed user
        add_notification(
            target_email,
            user_handle,
            "project",
            "remove",
            f"removed you from {project_name}",
            project_id,
        )
        cur.close()
        # Remove the user's column in the project csv
        delete_project_from_user_reports(target_handle, project_id)
        path = os.path.join(BASE_DIR, "analytics/projects")
        curr_df = pd.read_csv(path + f"/{project_id}.csv")
        curr_df.drop(target_handle, axis=1, inplace=True)
        curr_df.to_csv(path + f"/{project_id}.csv", mode="w", index=False)

    return {}


def update_member_permissions(handle, project_id, target_handle):
    Project(project_id).change_permissions(handle, target_handle)
    # TODO - notification
    return {}

    conn = get_db()
    with conn:
        cur = conn.cursor()
        user_info = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        user_id, user_handle = user_info["id"], user_info["handle"]

        target_info = conn.execute(
            "SELECT * FROM users WHERE handle = ?", (target_handle,)
        ).fetchone()
        target_id, target_email = target_info["id"], target_info["email"]

        project_name = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()["name"]

        user_role = conn.execute(
            "SELECT * FROM has WHERE user = ? AND project = ?",
            (user_id, project_id),
        ).fetchone()["role"]
        target_role = conn.execute(
            "SELECT * FROM has WHERE user = ? AND project = ?",
            (target_id, project_id),
        ).fetchone()["role"]

        # For now, only creators can change permissions. They can only add and
        # remove admins, they cannot change creator status
        if user_role != "creator":
            raise AccessError("Only the project creator may change user permissions.")
        if target_role == "creator":
            raise InputError("Creator permissions cannot be changed.")

        # If the user is currently a manager, make them a member
        # if target_role == "admin":
        #     cur.execute(
        #         "UPDATE has SET role = ? WHERE user = ? AND project = ?",
        #         ("member", target_id, project_id),
        #     )
        #     conn.commit()
        #     add_notification(
        #         target_email,
        #         user_handle,
        #         "project",
        #         "permissions",
        #         f"has demoted you to member in {project_name}",
        #         project_id,
        #     )

        # # Else the user is currently a member, make them a manager
        # else:
        #     cur.execute(
        #         "UPDATE has SET role = ? WHERE user = ? AND project = ?",
        #         ("admin", target_id, project_id),
        #     )
        #     conn.commit()
        #     add_notification(
        #         target_email,
        #         user_handle,
        #         "project",
        #         "permissions",
        #         f"has promoted you to admin in {project_name}",
        #         project_id,
        #     )
        cur.close()
    return {}

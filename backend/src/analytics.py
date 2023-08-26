import os.path
from datetime import datetime
from zoneinfo import ZoneInfo
from time import time
import pandas as pd
from src.helpers import get_db
from src.task_operations import get_user_tasks, get_task
from src.performance import calc_total_busyness
from src.project_operations import get_projects, get_project_members
from src.__config__ import ANALYTICS_TIMESPAN

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def update_analytics():
    """
    Records the performance metrics of every user and every project.

    Parameters:
    None

    Returns:
    None
    """
    # Need to update each user's and each project's analytics
    conn = get_db()
    with conn:
        curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%H:%M")
        if ANALYTICS_TIMESPAN == 86400:
            curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%d/%m/%Y")
        all_users = conn.execute("SELECT id, email, handle FROM users").fetchall()
        path = os.path.join(BASE_DIR, f"analytics/users")

        for user in all_users:
            busyness = calc_total_busyness(user["email"])
            user_tasks = get_user_tasks(user["email"], False)["tasks"]
            daily_completed = 0
            num_completed = 0
            completion_hours = 0
            task_time_till_due = 0

            for task in user_tasks:
                if task["status"] == "completed":
                    if task["time_end"] >= time() - ANALYTICS_TIMESPAN:
                        daily_completed += 1
                    num_completed += 1

                    completion_hours += (task["time_end"] - task["time_start"]) / 3600
                    if task["deadline"] != "Invalid Date":
                        task_time_till_due += task["complete_till_due"]

            average_time = (
                round(completion_hours / num_completed, 3) if num_completed else 0
            )

            average_time_till_due = (
                round(task_time_till_due / num_completed, 3) if num_completed else 0
            )

            row = [
                [
                    curr_date,
                    int(busyness),
                    daily_completed,
                    num_completed,
                    average_time,
                    average_time_till_due,
                ]
            ]
            row_df = pd.DataFrame(data=row)
            # row_df.drop_duplicates(ignore_index=True, inplace=True)
            row_df.to_csv(
                path + f"/{user['handle']}.csv", mode="a", index=False, header=False
            )

        # Update overall analytics for projects
        all_projects = conn.execute("SELECT id FROM projects").fetchall()
        proj_path = os.path.join(BASE_DIR, "analytics/projects")
        email = conn.execute("SELECT email FROM users").fetchone()["email"]
        for project in all_projects:
            proj_tasks = get_task(project["id"])
            members = get_project_members(email, project["id"])["members"]
            # mem_dict stores total completed tasks for each member hashed to
            # their handle
            mem_dict = {}
            for member in members:
                mem_dict[member["handle"]] = 0
            # Iterate through all project tasks to sum up user's completed tasks
            proj_completed = 0
            daily_proj_completed = 0
            for task in proj_tasks:
                if task["status"] == "completed":
                    if task["time_end"] >= time() - ANALYTICS_TIMESPAN:
                        daily_proj_completed += 1
                    proj_completed += 1
                    for handle in task["assignees"]:
                        mem_dict[handle] += 1

            data = [curr_date]
            curr_df = pd.read_csv(proj_path + f"/{project['id']}.csv")
            # curr_df.drop_duplicates(ignore_index=True, inplace=True)
            for col in curr_df.columns[1:-2]:
                data.append(mem_dict[col])
            data.append(proj_completed)
            data.append(daily_proj_completed)
            proj_df = pd.DataFrame(data=[data])
            proj_df.to_csv(
                proj_path + f"/{project['id']}.csv", mode="a", index=False, header=False
            )


def get_performance_analytics(handle):
    """Returns total user contribution and overall performance metrics as dataframes

    Args:
        handle (string): the auth user's handle

    Returns:
        dict: Dictionary object containg the user's contribution and performance dataframes
    """
    # Need user's overall task completion data
    # Overall contribution data (could be tasks you complete / all completed tasks
    # across your projects)
    # Busyness data
    conn = get_db()
    with conn:
        handle = conn.execute(
            "SELECT handle FROM users WHERE handle = ?", (handle,)
        ).fetchone()["handle"]
        path = os.path.join(BASE_DIR, f"analytics/users")
        df = pd.read_csv(path + f"/{handle}.csv")
        # df.drop_duplicates(ignore_index=True, inplace=True)

        # User contribution calculated as tasks user completed / all completed
        # tasks in their projects
        user_completed = 0
        proj_completed = 0
        user_projects = get_projects(handle)["projects"]
        for project in user_projects:
            proj_tasks = get_task(project["id"])
            for task in proj_tasks:
                if task["status"] == "completed":
                    proj_completed += 1
                    if handle in task["assignees"]:
                        user_completed += 1
        contribution = (
            int((user_completed / proj_completed) * 100) if proj_completed else 0
        )

    # "analytics" stores a dataframe with the user's completion and busyness data
    # "contribution" is the user's average contribution across all their projects
    return {"analytics": df.to_dict(), "contribution": contribution}


def get_project_analytics(handle, project_id):
    """
    Fetches a projects analytics

    Args:
        handle (string): the auth user's handle
        project_id (int): the id of the project to fetch analytics for

    Returns:
        dict: dictionary object containg the project's analytics and the user's contribution
    """
    # Need to fetch completion analytics for project and for each member
    conn = get_db()
    with conn:
        path = os.path.join(BASE_DIR, f"analytics/projects")
        df = pd.read_csv(path + f"/{project_id}.csv")
        # df.drop_duplicates(ignore_index=True, inplace=True)

        handle = conn.execute(
            "SELECT handle FROM users WHERE handle = ?", (handle,)
        ).fetchone()["handle"]
        user_completed = 0
        proj_completed = 0
        # Count up all user's and project's completed tasks
        proj_tasks = get_task(project_id)
        for task in proj_tasks:
            if task["status"] == "completed":
                proj_completed += 1
                if handle in task["assignees"]:
                    user_completed += 1
        contribution = (
            int((user_completed / proj_completed) * 100) if proj_completed else 0
        )

    # "analytics" is the dataframe with the project's, and each member's completion rate
    # "contribution" is the user's contribution in the project (e.g. 50)
    return {"analytics": df.to_dict(), "contribution": contribution}


def get_user_project_contribution(handle):
    """
    Returns the user's contribution to each project they are a member of,
    and the contribution of other members within each project

    Args:
        handle (string): the auth user's handle

    Returns:
        list: list of dictionaries containing the user's contribution relative
        to the contribution of other members for each project the user is part of

    """

    with get_db() as conn:
        cur = conn.cursor()
        query = """
            SELECT p.id, p.name
            FROM has h
            JOIN projects p
            ON h.project = p.id
            WHERE user = (SELECT id FROM users WHERE handle = ?)
        """

        projects = cur.execute(query, (handle,)).fetchall()
        handle = cur.execute(
            "SELECT handle FROM users WHERE handle = ?", (handle,)
        ).fetchone()["handle"]
        results = {}
        path = os.path.join(BASE_DIR, "analytics/projects")
        for project in projects:
            df = pd.read_csv(path + f"/{project['id']}.csv")
            results[project["name"]] = [
                {"label": "Your contribution", "data": int(df[handle].sum())},
                {"label": "Others", "data": int(df["total_tasks_completed"].sum())},
            ]
        return results


def get_user_line_data(handle):
    """
    Parses all the user's analytics data and returns it in a format that can be
    rendered as a dataset in the form of a line graph.

    Args:
        handle (string): the auth user's handle

    Returns:
        tuple: tuple of lists of dictionaries, with each dict being a datapoint
        in of a user performance metric. The first list is the user's daily tasks
    """
    with get_db() as conn:
        cur = conn.cursor()
        query = """
            SELECT handle
            FROM users
            WHERE handle = ?
        """
        handle = cur.execute(query, (handle,)).fetchone()["handle"]
        analytics_path = os.path.join(BASE_DIR, "analytics/users")
        df = pd.read_csv(analytics_path + f"/{handle}.csv")
        # df.drop_duplicates(ignore_index=True, inplace=True)
        daily_tasks = []
        total_tasks = []
        busyness = []
        avg_hours_for_completion = []
        avg_hours_till_due = []
        sum_weekly_tasks = 0
        for _, row in df.tail(7).iterrows():
            date_string = row["date"]
            if ANALYTICS_TIMESPAN == 86400:
                date = row["date"].split("/")
                date_string = f"{date[0]}/{date[1]}"
            daily_tasks.append(
                {"label": date_string, "data": row["daily_tasks_completed"]}
            )
            sum_weekly_tasks += row["daily_tasks_completed"]
            total_tasks.append({"label": date_string, "data": sum_weekly_tasks})
            busyness.append({"label": date_string, "data": row["daily_busyness"]})
            avg_hours_for_completion.append(
                {"label": date_string, "data": row["average_task_duration_(hours)"]}
            )
            avg_hours_till_due.append(
                {
                    "label": date_string,
                    "data": row["average_hours_left_at_task_completion"],
                }
            )
        return (
            daily_tasks,
            total_tasks,
            busyness,
            avg_hours_for_completion,
            avg_hours_till_due,
        )


def get_project_member_contributions(handle, project_id):
    """
    Get the contribution of each member in a project as well as the
    number of tasks completed daily and the total number of tasks completed
    for the project.

    Args:
        handle (string): the auth user's handle
        project_id (int): the id of the project to fetch analytics for

    Returns:
        dict: dictionary object mapping multiple lists containing multiple datapoints
        across the last 7 days. The user handle to list mappings represent
        each member in the project and contains their contribution.
    """
    with get_db() as conn:
        cur = conn.cursor()
        query = """
            SELECT u.handle, u.first_name, u.last_name
            FROM has h
            JOIN projects p
            ON h.project = p.id
            JOIN users u
            ON h.user = u.id
            WHERE p.id = ?
            ORDER BY handle = ? DESC
        """

        handle = cur.execute(
            "SELECT handle FROM users WHERE handle = ?", (handle,)
        ).fetchone()["handle"]
        members = cur.execute(query, (project_id, handle)).fetchall()
        results = {}
        path = os.path.join(BASE_DIR, "analytics/projects")
        df = pd.read_csv(path + f"/{project_id}.csv")
        total_tasks_completed = []
        daily_tasks_completed = []
        for _, row in df.tail(7).iterrows():
            date_string = row["date"]
            if ANALYTICS_TIMESPAN == 86400:
                date = row["date"].split("/")
                date_string = f"{date[0]}/{date[1]}"

            for member in members:
                member_key = f"{member['first_name']} {member['last_name']} → @{member['handle']}"
                if member_key not in results:
                    results[member_key] = []
                results[member_key].append(
                    {"label": date_string, "data": row[member["handle"]]}
                )

            daily_tasks_completed.append(
                {"label": date_string, "data": row["daily_tasks_completed"]}
            )
            total_tasks_completed.append(
                {"label": date_string, "data": row["total_tasks_completed"]}
            )
        results["Total Tasks Completed"] = total_tasks_completed
        results["Daily Tasks Completed"] = daily_tasks_completed
        return results

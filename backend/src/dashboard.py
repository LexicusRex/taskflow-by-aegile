import os.path
from src.helpers import get_db
from src.performance import calc_total_busyness
import pandas as pd
import time
from datetime import datetime
from src.__config__ import ANALYTICS_TIMESPAN
from pprint import pprint

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
analytics_path = os.path.join(BASE_DIR, "analytics/users")


def get_dashboard_connections(handle):
    """
    Retrieves all current connections of a user

    Parameters:
    email (string): Verified Email (Format checked in Frontend)

    Returns:
    List: A list of dictionaries where each dictonary contains details of a
    connection
    """
    with get_db() as conn:
        cur = conn.cursor()
        query = """
            SELECT u.image, u.first_name, u.last_name, u.handle, u.email 
            FROM connections c
            JOIN users u 
            ON c.user = u.handle
            WHERE c.inviter = ? AND c.accepted = 'TRUE'
        """
        connections = cur.execute(query, (handle,))
        results = []

        for connection in connections:
            results.append(
                {
                    "image": connection["image"],
                    "name": connection["first_name"] + " " + connection["last_name"],
                    "handle": connection["handle"],
                    "busyness": calc_total_busyness(connection["handle"]),
                }
            )
        return results


def get_dashboard_tasks(handle):
    """
    Retrieves all current tasks and projects of a user

    Parameters:
    email (string): Verified Email (Format checked in Frontend)

    Returns:
    List: A list of dictionaries where each dictonary contains details of a
    task
    """
    with get_db() as conn:
        cur = conn.cursor()
        query = """
            SELECT p.id, p.name as project, t.name as task, t.deadline, t.status, t.weighting, t.priority 
            FROM tasks t
            JOIN assigned a  
            ON t.id = a.task
            JOIN projects p
            ON p.id = t.project
            WHERE a.user = ?
        """
        tasks = cur.execute(query, (handle,))
        results = []

        for task in tasks:
            results.append(
                {
                    "id": task["id"],
                    "project": task["project"],
                    "task": task["task"],
                    "deadline": task["deadline"],
                    "status": task["status"],
                    "workload": task["weighting"],
                    "priority": task["priority"],
                }
            )
        return results


def get_dashboard_task_chart(handle):
    """
    Retrieves task statistics of a user

    Parameters:
    email (string): Verified Email (Format checked in Frontend)

    Returns:
    List
    """

    df = pd.read_csv(analytics_path + f"/{handle}.csv")
    result = []
    for _, row in df.tail(7).iterrows():
        date_string = row["date"]
        if ANALYTICS_TIMESPAN == 86400:
            date = row["date"].split("/")
            date_string = f"{date[1]}/{date[0]}"
        result.append({"date": date_string, "count": row["daily_tasks_completed"]})
    return result

def get_overview(handle):
    """
    Retrieves number of projects, tasks and connections of a user

    Parameters:
    handle (string): Verified handle (Format checked in Frontend)

    Returns:
    Dictionary: Number of projects, tasks and connections
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        num_projects = cur.execute(
            """
            SELECT count(*) 
            FROM has
            WHERE has.user = ?
            """,
            (handle,),
        ).fetchone()[0]

        num_tasks = cur.execute(
            """
            SELECT COUNT(*)
            FROM assigned
            JOIN tasks
            ON assigned.task = tasks.id
            WHERE assigned.user = ?
            AND tasks.status <> ?
            """,
            (handle, "completed"),
        ).fetchone()[0]

        num_connections = cur.execute(
            """
            SELECT COUNT(*)
            FROM connections
            WHERE inviter = ?
            AND accepted = ?
            """,
            (handle, "TRUE"),
        ).fetchone()[0]

        return {
            "projects": num_projects,
            "tasks": num_tasks,
            "connections": num_connections,
        }

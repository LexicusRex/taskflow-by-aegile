from src.helpers import get_db
import time
import datetime
import math
import json
import os.path

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(BASE_DIR, "keywords.json")


def num_compelete_tasks(handle):
    with get_db() as conn:
        query = """
        SELECT COUNT(*)
        FROM tasks t
        JOIN assigned a
            ON t.id = a.task
        WHERE status = ?
        AND a.user = ?
        """

        cur = conn.cursor()
        num_complete = cur.execute(query, ("completed", handle)).fetchone()["count"]


def calc_task_busyness(deadline: str, workload: int, priority: str, assigned: int):
    """
    Calculates the busyness value of a task

    Parameters:
    deadline (string): Due date of task
    workload (int): Workload value of task
    priority (int): Priority value of task
    assigned (int): Number of people assigned to the task

    Returns:
    int: Busyness value of task
    """
    due_date = time.mktime(datetime.datetime.strptime(deadline, "%d/%m/%Y").timetuple())
    diff_hours = (due_date - time.time()) / 3600

    if diff_hours <= 24:
        deadline_weight = 50
        workload_weight = 27.5
        priority_weight = 15
        delegation_weight = 7.5
    else:
        deadline_weight = 50 / math.sqrt(diff_hours / 24)
        remainder_weight = 100 - deadline_weight
        workload_weight = 0.55 * remainder_weight
        priority_weight = 0.3 * remainder_weight
        delegation_weight = 0.15 * remainder_weight

    deadline_score = -(1 / 6) * ((diff_hours / 24) - 1) + 1
    deadline_score = max(0, min(deadline_score, 1))
    workload_score = max(0, min(workload / 5, 1))
    priority_score = 0
    if priority == "low":
        priority_score = 0.3
    elif priority == "medium":
        priority_score = 0.75
    elif priority == "high":
        priority_score = 1

    delegation_score = 0
    if assigned == 0:
        delegation_score = 0
    else:
        delegation_score = 1 / assigned

    return (
        deadline_weight * deadline_score
        + workload_weight * workload_score
        + priority_weight * priority_score
        + delegation_weight * delegation_score
    )


def calc_total_busyness(handle, days_offset: int = 7):
    """
    Calculates the busyness of a user

    Parameters:
    email (string): Email of user
    days_offset (int): Offset number of days

    Returns:
    int: Busyness value of user
    """
    with get_db() as conn:
        cur = conn.cursor()
        query = """
            SELECT id, deadline, priority, weighting, num_assignees
            FROM tasks t
            JOIN assigned a
                ON t.id = a.task
            WHERE a.user = ? AND (status = ? OR status = ?)
        """
        tasks_ongoing = cur.execute(
            query, (handle, "notstarted", "inprogress")
        ).fetchall()
        total_busyness = 0
        for task in tasks_ongoing:
            if task["deadline"] == "Invalid Date":
                continue
            deadline = time.mktime(
                datetime.datetime.strptime(task["deadline"], "%d/%m/%Y").timetuple()
            )
            if time.time() < deadline <= time.time() + days_offset * 86400:
                total_busyness += calc_task_busyness(
                    task["deadline"],
                    task["weighting"],
                    task["priority"],
                    task["num_assignees"],
                )
        return round(total_busyness / 10, 1)


def match_skills_to_keywords(skills):
    """
    Matches skills provided by user to keywords stored in the database

    Parameters:
    skills (string): Comma separated string of user's skills

    Returns:
    int: Busyness value of user
    """
    skills_list = skills.lower().split(",")
    matches = []
    with open(json_path, "r", encoding="utf-8") as json_file:
        keywords = json.load(json_file)
        for skill in skills_list:
            try:
                matches.extend(keywords[skill])
            except KeyError:
                pass
        return ",".join(set(matches))

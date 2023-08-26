import os.path
import hashlib
import pandas as pd

from src.project_operations import get_projects
from src.helpers import get_db, update_achievement
from src.performance import calc_total_busyness, match_skills_to_keywords
from src.classes.user import User

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def get_user(handle):
    return User(handle).data


def get_user_from_handle(handle):
    return User(handle).data


def edit_profile(handle, profile_data):
    user = User(handle)
    user.edit_user(profile_data)
    # return user.handle
    # If handle is being changed, need to update analytics files
    # if old_handle != profile_data["handle"]:
    #     path = os.path.join(BASE_DIR, "analytics/users")
    #     os.rename(path + f"/{old_handle}.csv", path + f"/{profile_data['handle']}.csv")

    #     # Update handle column in all user projects
    #     projects = get_projects(email)["projects"]
    #     for project in projects:
    #         proj_path = os.path.join(BASE_DIR, "analytics/projects")
    #         curr_df = pd.read_csv(proj_path + f"/{project['id']}.csv")
    #         curr_df.rename(columns={old_handle: profile_data["handle"]}, inplace=True)
    #         curr_df.to_csv(proj_path + f"/{project['id']}.csv", mode="w", index=False)

    # Achievements: Skills
    # if profile_data["skills"]:
    #     if len(profile_data["skills"].split(",")) > 0:
    #         update_achievement("One Trick", user_id)

    #     if len(profile_data["skills"].split(",")) >= 5:
    #         update_achievement("Skillful", user_id)

    # Return token since user's email may have changed
    # return profile_data["email"]


def divide_cols(progress, requirement):
    return progress / requirement


def get_achievements(handle):
    conn = get_db()
    with conn:
        cur = conn.cursor()

        user_id = cur.execute(
            "SELECT id FROM users WHERE handle=?", (handle,)
        ).fetchone()[0]

        achievements_payload = []

        finished_achievements = cur.execute(
            """
                SELECT a.name, a.description, a.icon, e.progress, a.requirement
                FROM achievements a
                JOIN earned e
                ON e.achievement = a.id
                WHERE e.user = ?
                AND e.progress >= a.requirement
            """,
            (user_id,),
        ).fetchall()

        for achievement in finished_achievements:
            achievements_payload.append(
                {
                    "name": achievement["name"],
                    "description": achievement["description"],
                    "icon": achievement["icon"],
                    "progress": achievement["progress"],
                    "requirement": achievement["requirement"],
                }
            )

        conn.create_function("divide_cols", 2, divide_cols)

        ongoing_achievements = cur.execute(
            """
                SELECT a.name, a.description, a.icon, e.progress, a.requirement, divide_cols(e.progress, a.requirement) as col
                FROM achievements a
                JOIN earned e
                ON e.achievement = a.id
                WHERE e.user = ?
                AND e.progress < a.requirement
                ORDER BY col DESC
            """,
            (user_id,),
        ).fetchall()

        for achievement in ongoing_achievements:
            achievements_payload.append(
                {
                    "name": achievement["name"],
                    "description": achievement["description"],
                    "icon": achievement["icon"],
                    "progress": achievement["progress"],
                    "requirement": achievement["requirement"],
                }
            )

        for x in achievements_payload:
            name = x["name"]
            progress = x["progress"]
            requirement = x["requirement"]
            if progress > requirement:
                progress = requirement

        return achievements_payload

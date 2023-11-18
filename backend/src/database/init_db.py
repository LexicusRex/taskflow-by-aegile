import sqlite3
import os.path
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "database.db")
sys.path.insert(0, BASE_DIR[:-9])

from src.auth import register_new_user
from src.project_operations import add_project, invite_users, accept_invite
from src.connections import accept_connection_request, create_connection_request
from src.task_operations import create_task
from src.users import edit_profile


def initialise_db():
    connection = sqlite3.connect(db_path)

    schema_path = os.path.join(BASE_DIR, "schema.sql")

    with open(schema_path) as f:
        connection.executescript(f.read())

    cur = connection.cursor()
    cur.execute("PRAGMA foreign_keys = ON")

    achievement_data = []

    achievement_data.append(
        ("Not Alone", "Make 1 connection", 1, "icon_achievement_lonely")
    )
    achievement_data.append(
        ("Networker", "Make 10 connections", 10, "icon_achievement_connection")
    )
    achievement_data.append(
        ("Social Butterfly", "Make 100 connections", 100, "icon_achievement_butterfly")
    )
    achievement_data.append(
        ("Baby Steps", "Complete 3 tasks", 3, "icon_achievement_baby_steps")
    )
    achievement_data.append(
        ("Getting Productive", "Complete 20 tasks", 20, "icon_achievement_productive")
    )
    achievement_data.append(
        ("Taskmaster", "Complete 100 tasks", 100, "icon_achievement_teacher")
    )

    achievement_data.append(
        ("Taskmaker", "Create 10 tasks", 10, "icon_achievement_pencil")
    )
    achievement_data.append(
        ("Creator", "Create 3 projects", 3, "icon_achievement_project")
    )
    achievement_data.append(
        ("One Trick", "Add a skill to your profile", 1, "icon_achievement_pony")
    )
    achievement_data.append(
        (
            "Skillful",
            "Have 5 skills addeded to your profile",
            1,
            "icon_achievement_skilled",
        )
    )
    achievement_data.append(
        ("First!", "Write 1 comment", 1, "icon_achievement_writing")
    )

    achievement_data.append(
        ("Thread Weaver", "Write 10 comments ", 10, "icon_achievement_web")
    )

    achievement_data.append(
        (
            "Early Bird",
            "Finish a task within 30 minutes of it being set",
            1,
            "icon_achievement_early_bird",
        )
    )

    for data in achievement_data:
        cur.execute(
            "INSERT INTO achievements (name, description, requirement, icon) VALUES (?, ?, ?, ?)",
            (data[0], data[1], data[2], data[3]),
        )

    connection.commit()

    # Create 5 users
    register_new_user("alex@email.com", "AlexXu123!", "Alex", "Xu")
    register_new_user("sam@email.com", "SamYu123!", "Sam", "Yu")
    register_new_user("philip@email.com", "PhilipTran123!", "Philip", "Tran")
    register_new_user("terrance@email.com", "TerranceNguyen123!", "Terrance", "Nguyen")
    register_new_user("vincent@email.com", "VincentWong123!", "Vincent", "Wong")


    connection.commit()

    alex_handle = cur.execute(
        "SELECT handle FROM users WHERE email='alex@email.com'"
    ).fetchone()[0]
    sam_handle = cur.execute(
        "SELECT handle FROM users WHERE email='sam@email.com'"
    ).fetchone()[0]
    philip_handle = cur.execute(
        "SELECT handle FROM users WHERE email='philip@email.com'"
    ).fetchone()[0]
    terrance_handle = cur.execute(
        "SELECT handle FROM users WHERE email='terrance@email.com'"
    ).fetchone()[0]
    print(f"{alex_handle=}\n{sam_handle=}\n{philip_handle=}\n{terrance_handle=}\n")
    edit_profile(alex_handle, {
        "email": "alex@email.com",
        "firstName": "Alex",
        "lastName": "Xu",
        "skills": None,
        "description": "",
        "image": "http://unsplash.it/50/50",
        "rawImage": "http://unsplash.it/50/50",
        "banner": "",
        "password": "AlexXu123!"
    })
    edit_profile(sam_handle, {
        "email": "sam@email.com",
        "firstName": "Sam",
        "lastName": "Yu",
        "skills": None,
        "description": "",
        "image": "http://unsplash.it/60/60",
        "rawImage": "http://unsplash.it/60/60",
        "banner": "",
        "password": "SamYu123!"
    })

    # Create 2 projects
    add_project(
        alex_handle,
        {
            "name": "COMP3900 Project MAIN",
            "subheading": "Sub heading 1",
            "description": "UNSW COMP3900 Project for 2023 t2",
            "endDate": "12/12/2023",
            "members": [],
        },
    )
    add_project(
        alex_handle,
        {
            "name": "Project A",
            "subheading": "Sub heading 2",
            "description": "Project A is a project for the UNSW COMP SCI degree",
            "endDate": "12/12/2023",
            "members": [],
        },
    )

    add_project(
        sam_handle,
        {
            "name": "Project B",
            "subheading": "Sub heading 2",
            "description": "Project B is a project for the UNSW COMP SCI degree",
            "endDate": "12/12/2023",
            "members": [],
        },
    )

    invite_users(alex_handle, 2, [sam_handle])
    invite_users(sam_handle, 3, [alex_handle])

    # cur.execute(
    #     "INSERT INTO project_invites (inviter, invitee, project) VALUES (?, ?, ?)",
    #     (alex_handle, sam_handle, 2),
    # )
    # cur.execute(
    #     "INSERT INTO project_invites (inviter, invitee, project) VALUES (?, ?, ?)",
    #     (sam_handle, alex_handle, 3),
    # )

    connection.commit()

    create_connection_request(sam_handle, alex_handle)
    create_connection_request(philip_handle, alex_handle)
    create_connection_request(terrance_handle, alex_handle)

    accept_connection_request(alex_handle, sam_handle)
    accept_connection_request(alex_handle, philip_handle)
    accept_connection_request(alex_handle, terrance_handle)

    connection.commit()
    connection.close()


def initialise_test_db():
    connection = sqlite3.connect(db_path)

    schema_path = os.path.join(BASE_DIR, "schema.sql")

    with open(schema_path) as f:
        connection.executescript(f.read())

    cur = connection.cursor()
    # cur.execute("PRAGMA foreign_keys = ON")
    register_new_user("alex@email.com", "AlexXu123!", "Alex", "Xu")
    register_new_user("sam@email.com", "SamYu123!", "Sam", "Yu")
    register_new_user("philip@email.com", "PhilipTran123!", "Philip", "Tran")
    connection.commit()
    connection.close()

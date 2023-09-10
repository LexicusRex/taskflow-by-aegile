import pytest
from src.classes.task import Task
from src.classes.project import Project
from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_test_db
from src.__init_app__ import initialise_analytics


@pytest.fixture
def _init_database():
    initialise_analytics()
    initialise_test_db()
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]
    target1_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("philip@email.com",)
    )[0]["handle"]
    return handle, target_handle, target1_handle


def test_new_task(_init_database):
    mine, user_a, user_b = _init_database

    data = {
        "name": "test_task",
        "description": "test_description",
        "deadline": "10/10/2023",
        "status": "complete",
        "attachment": "",
        "attachment_name": "",
        "weighting": 1,
        "priority": "low",
        "assignees": [],
    }

    project = Project()
    project.new(
        mine,
        "Project A",
        "Sub heading 2",
        "Project A is a project for the UNSW COMP SCI degree",
        "12/12/2023",
        [],
    )

    new_task = Task()
    new_task.new(mine, project.p_id, data)


def test_new_task_invalid_assignees(_init_database):
    # FIXME - check for invalid assignees
    mine, user_a, user_b = _init_database

    data = {
        "name": "test_task",
        "description": "test_description",
        "deadline": "10/10/2023",
        "status": "complete",
        "attachment": "",
        "attachment_name": "",
        "weighting": 1,
        "priority": "low",
        "assignees": [user_a, user_b],
    }

    project = Project()
    project.new(
        mine,
        "Project A",
        "Sub heading 2",
        "Project A is a project for the UNSW COMP SCI degree",
        "12/12/2023",
        [],
    )

    new_task = Task()
    new_task.new(mine, project.p_id, data)

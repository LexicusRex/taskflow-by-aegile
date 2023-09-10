import pytest
from src.classes.task import Task
from src.classes.project import Project
from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_test_db
from src.__init_app__ import initialise_analytics
from src.task_operations import get_task_edit, update_task_edit


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
        handle,
        "Project A",
        "Sub heading 2",
        "Project A is a project for the UNSW COMP SCI degree",
        "12/12/2023",
        [],
    )

    new_task = Task()
    new_task.new(handle, project.p_id, data)

    return handle, target_handle, target1_handle, project, new_task


def test_new_task_content_edit(_init_database):
    mine, user_a, user_b, project, new_task = _init_database
    update_task_edit(new_task.t_id, {"id": "b1s4525s5s21"})
    assert get_task_edit(new_task.t_id) == {"id": "b1s4525s5s21"}

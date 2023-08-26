import pytest
from src.classes.project import Project

# from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_db
from src.__init_app__ import initialise_analytics


@pytest.fixture
def _init_database():
    initialise_analytics()
    initialise_db()
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]
    target1_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("terrance@email.com",)
    )[0]["handle"]
    return handle, target_handle, target1_handle


def test_project_creation(_init_database):
    mine, user_a, user_b = _init_database

    project = Project()
    project.new(
        mine,
        "Project A",
        "Sub heading 2",
        "Project A is a project for the UNSW COMP SCI degree",
        "12/12/2023",
        [user_a, user_b],
    )

    assert project.name == "Project A"
    assert project.subheading == "Sub heading 2"
    assert project.description == "Project A is a project for the UNSW COMP SCI degree"
    assert project.end_date == "12/12/2023"
    assert project.members == [mine]

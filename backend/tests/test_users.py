import pytest
from src.classes.user import User
from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_test_db
from src.__init_app__ import initialise_analytics


@pytest.fixture
def _init_database():
    initialise_analytics()
    initialise_test_db()


def test_user_login_valid(_init_database):
    new_user = User()
    new_user.login("alex@email.com", "AlexXu123!")
    assert new_user.email == "alex@email.com"
    assert new_user.first_name == "Alex"
    assert new_user.last_name == "Xu"


def test_user_login_invalid_email(_init_database):
    with pytest.raises(InputError):
        User().login("aagasg@email.com", "AlexXu123!")


def test_user_login_invalid_password(_init_database):
    with pytest.raises(InputError):
        User().login("alex@email.com", "Aajkhgadkh")


def test_user_profile_fetch_by_handle(_init_database):
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    user_data = User(handle).data
    assert user_data["email"] == "alex@email.com"
    assert user_data["first_name"] == "Alex"
    assert user_data["last_name"] == "Xu"


def test_user_profile_invalid_fetch_by_handle(_init_database):
    with pytest.raises(InputError):
        User("loremupsum").data()


def test_user_update_profile(_init_database):
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    user = User(handle)
    user.edit_user(
        {
            "email": "xu@email.com",
            "firstName": "Xu",
            "lastName": "Alex",
            "password": "AlexXu123!",
            # "handle": handle,
            "skills": "",
            "description": "",
            "image": "",
            "rawImage": "",
            "banner": "",
        }
    )

    user_data = user.data
    assert user_data["email"] == "xu@email.com"
    assert user_data["first_name"] == "Xu"
    assert user_data["last_name"] == "Alex"

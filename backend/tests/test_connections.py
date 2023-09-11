import pytest
from src.classes.connection import Connection
from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_test_db
from src.__init_app__ import initialise_analytics


@pytest.fixture
def _init_database():
    initialise_analytics()
    initialise_test_db()


def test_connection_request(_init_database):
    """Test that a connection request is successfully made."""
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]
    result = exec_query(
        "SELECT * FROM connections",
        (),
    )
    for row in result:
        print(tuple(row))
    Connection(handle).request(target_handle)
    result = exec_query(
        "SELECT * FROM connections WHERE inviter=?",
        (handle,),
    )
    assert result[0]["accepted"] == "FALSE"
    assert result[0]["user"] == target_handle


def test_connection_accept():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]

    Connection(target_handle).accept(handle)
    result = exec_query(
        "SELECT * FROM connections WHERE inviter=? AND user=?",
        (handle, target_handle),
    )[0]["accepted"]
    assert result == "TRUE"


def test_connection_incoming():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    inviter_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("philip@email.com",)
    )[0]["handle"]

    Connection(inviter_handle).request(handle)
    result = exec_query(
        "SELECT * FROM connections WHERE inviter=? AND user=?",
        (inviter_handle, handle),
    )[0]["accepted"]
    assert result == "FALSE"


def test_connections():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]
    inviter_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("philip@email.com",)
    )[0]["handle"]

    user = Connection(handle)
    assert user.accepted[0] == target_handle
    assert user.incoming[0] == inviter_handle


def test_connections_delete():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]

    user = Connection(handle)
    user.delete(target_handle)
    assert len(user.accepted) == 0


def test_connections_suggest():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]

    user = Connection(handle)
    # Sam should be the only connection suggestion
    assert len(user.suggestions) == 1


def test_connections_suggest_fresh_db(_init_database):
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]

    user = Connection(handle)
    # Sam and Philip should be the only connection suggestions
    assert len(user.suggestions) == 2


if __name__ == "__main__":
    test_connections()

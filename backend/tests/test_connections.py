import pytest
from src.classes.connection import Connection
from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_db
from src.__init_app__ import initialise_analytics


@pytest.fixture
def _init_database():
    initialise_analytics()
    initialise_db()


def test_connection_request(_init_database):
    """Test that a connection request is successfully made."""
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]
    target1_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("terrance@email.com",)
    )[0]["handle"]

    Connection(handle).request(target_handle)
    Connection(handle).request(target1_handle)
    result = exec_query(
        "SELECT * FROM connections WHERE requestor=?",
        (handle,),
    )
    assert result[0]["accepted"] == "FALSE"
    assert result[0]["addressee"] == target_handle
    assert result[1]["accepted"] == "FALSE"
    assert result[1]["addressee"] == target1_handle


def test_connection_accept():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]

    Connection(target_handle).accept(handle)
    result = exec_query(
        "SELECT * FROM connections WHERE requestor=? AND addressee=?",
        (handle, target_handle),
    )[0]["accepted"]
    assert result == "TRUE"


def test_connection_incoming():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    requestor_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("vincent@email.com",)
    )[0]["handle"]

    Connection(requestor_handle).request(handle)
    result = exec_query(
        "SELECT * FROM connections WHERE requestor=? AND addressee=?",
        (requestor_handle, handle),
    )[0]["accepted"]
    assert result == "FALSE"


def test_connections():
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]
    target_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("sam@email.com",)
    )[0]["handle"]
    requestor_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("vincent@email.com",)
    )[0]["handle"]
    target1_handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("terrance@email.com",)
    )[0]["handle"]

    user = Connection(handle)
    assert user.accepted[0]["addressee"] == target_handle
    assert user.accepted[0]["requestor"] == handle
    assert user.accepted[0]["accepted"] == "TRUE"

    assert user.incoming[0]["addressee"] == handle
    assert user.incoming[0]["requestor"] == requestor_handle
    assert user.incoming[0]["accepted"] == "FALSE"

    assert user.outgoing[0]["addressee"] == target1_handle
    assert user.outgoing[0]["requestor"] == handle
    assert user.outgoing[0]["accepted"] == "FALSE"


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
    assert len(user.suggestions) == 2


def test_connections_suggest_fresh_db(_init_database):
    handle = exec_query(
        """SELECT handle from users WHERE email=?""", ("alex@email.com",)
    )[0]["handle"]

    user = Connection(handle)
    assert len(user.suggestions) == 4


if __name__ == "__main__":
    test_connections()

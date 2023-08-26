import pytest
from src.classes.metrics import Metric
from src.error import InputError
from src.helpers import exec_query
from src.database.init_db import initialise_db
from src.__init_app__ import initialise_analytics


@pytest.fixture
def _init_database():
    initialise_analytics()
    initialise_db()

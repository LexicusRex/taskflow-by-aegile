from src.helpers import get_db
from src.error import InputError, AccessError


class Metric:
    def __init__(self, project=None):
        self.metric_name = None
        self.metric_type = "linear"
        self.ceiling = None
        self.floor = None
        self.unit = "days"
        self.unit_min = 0
        self.unit_max = None
        self.flip = False
        self.negative = False
        self.n_value = 1
        self.project = project

        self.fetch()

    def fetch(self):
        query = """
            SELECT * FROM metrics 
            WHERE project = ?
        """
        if not self.project:
            return

        # Projects must have a metrics on creation
        with get_db() as conn:
            cur = conn.cursor()
            metrics = cur.execute(query, (self.project,)).fetchone()
            self.metric_name = metrics["metric_name"]
            self.metric_type = metrics["metric_type"]
            self.ceiling = metrics["ceiling"]
            self.floor = metrics["floor"]
            self.unit = metrics["unit"]
            self.unit_min = metrics["unit_min"]
            self.unit_max = metrics["unit_max"]
            self.flip = metrics["flip"]
            self.negative = metrics["negative"]
            self.n_value = metrics["n"]

    def adjust(
        self,
        metric_name,
        metric_type,
        ceiling,
        floor,
        unit,
        unit_min,
        unit_max,
        flip,
        nagative,
        n_value,
        project,
        is_new=False,
    ):
        query = """
            UPDATE metrics 
            SET metric_name = ?, metric_type = ?, ceiling = ?, floor = ?, unit = ?, unit_min = ?, unit_max = ?, flip = ?, negative = ?, n_value = ?
            WHERE project = ?
        """
        if is_new:
            query = """
                INSERT INTO metrics (metric_name, metric_type, ceiling, floor, unit, unit_min, unit_max, flip, negative, n_value, project)
            """

        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                query,
                (
                    metric_name,
                    metric_type,
                    ceiling,
                    floor,
                    unit,
                    unit_min,
                    unit_max,
                    flip,
                    nagative,
                    n_value,
                    project,
                ),
            )
        self.fetch()

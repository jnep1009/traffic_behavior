import psycopg2 as DB
from traffic_research.settings import DATABASES

DEFAULT_DB = DATABASES['default']

DB_CONN_SETTINGS = 'host=%s port=%s dbname=%s user=%s' % (
    DEFAULT_DB['HOST'],
    DEFAULT_DB['PORT'],
    DEFAULT_DB['NAME'],
    DEFAULT_DB['USER']
)
postgis_conn = DB.connect(
    DB_CONN_SETTINGS
)

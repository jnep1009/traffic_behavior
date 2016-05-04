from django.db import models
import psycopg2 as DB
from traffic_research import DB_CONN_SETTINGS

class stnMeta(models.Model):
    """ Traffic Stations' Meta Data"""
    stn_id = models.CharField(max_length=15, blank=True, primary_key=True)
    stn_loc = models.CharField(max_length=100, blank=True, null=True)
    lat = models.FloatField(max_length=20, blank=True, null=True)
    lng = models.FloatField(max_length=20, blank=True, null=True)
    county = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        db_table = 'stnmeta'


class stnRecord(models.Model):
    stn_id = models.CharField(max_length=15,  primary_key=True)
    datestamp = models.DateTimeField(primary_key=True)
    record = models.IntegerField(blank=True, null=True)
    idw = models.FloatField(max_length=20, blank=True, null=True)
    rbf = models.FloatField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'stn_record'

class weatherStation(models.Model):
    stn_id = models.CharField(max_length=15,  primary_key=True)
    prec_v = models.FloatField(max_length=20, blank=True, null=True)
    date = models.DateTimeField(primary_key=True)
    lat = models.FloatField(max_length=20, blank=True, null=True)
    lng = models.FloatField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'ish_record'

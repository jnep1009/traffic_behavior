import json
import requests
import numpy as np
import datetime as datetime
from dateutil.relativedelta import relativedelta
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseBadRequest
from django.db import connection
from traffic_viz.models import stnMeta, stnRecord, weatherStation


# Create your views here.
def get_stn(request):
    """ Get Lat,Lng of each camera"""

    if request.method != 'GET':
        return HttpResponseBadRequest()

    """ Get Station From Database. """
    stn_queryset = stnMeta.objects.all()
    stn_set = {
        'type': 'FeatureCollection',
        'features': []
    }
    for each_stn in stn_queryset:
        stn_set['features'].append({
            'type': 'Feature',
            'properties': {
                'id': each_stn.stn_id,
                'title': 'Stn Id: ' + each_stn.stn_id + '<br>' + 'Location: ' + each_stn.stn_loc,
                'icon': {
                    'className': 'fa-icon',
                    'html': '<i style ="color:red" class="fa fa-circle fa-1x"></i>',
                    'iconSize': [1, 1]
                }
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [each_stn.lng, each_stn.lat]
            }

        })

    """ Get geojson for Georgia."""

    countylist = []
    geo_map = {"type": "FeatureCollection", "features": []}
    stn_county = stnMeta.objects.distinct('county')
    for county in stn_county:
        countylist.append(county.county.lower())
    params = {"state": "ga", "meta": "geojson,id,name"}
    response = requests.get('http://data.srcc.rcc-acis.org/General/county', params=params).json()
    for count in response['meta']:
        if count['name'].lower().split(" ")[0] in countylist:
            geo_map['features'].append({
                'type': 'Feature',
                'geometry': count['geojson'],
                'properties': {
                    'id': count['id'],
                    'county': count['name']
                }
            })
    output = {'cam': stn_set, 'geo': geo_map}
    return HttpResponse(json.dumps(output))

def get_RainStn(request):
    """ Get Lat,Lng of each wstn"""
    if request.method != 'GET':
        return HttpResponseBadRequest()

    """ Get Station From Database. """
    stn_queryset = weatherStation.objects.distinct('stn_id')
    stn_set = {
        'type': 'FeatureCollection',
        'features': []
    }
    for each_stn in stn_queryset:
        stn_set['features'].append({
            'type': 'Feature',
            'properties': {
                'title': 'Stn Id: ' + each_stn.stn_id + '<br>',
                'icon': {
                    'className': 'fa-icon',
                    'html': '<i style ="color:blue" class="fa fa-circle fa-1x"></i>',
                    'iconSize': [0.5, 0.5]
                }
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [each_stn.lng, each_stn.lat]
            }

        })

    output = {'wstn': stn_set}
    return HttpResponse(json.dumps(output))

def get_record(request):
    """ Get record for a given station"""
    if request.method != 'GET':
        return HttpResponseBadRequest()
    stn_id = request.GET.get('stn_id')
    stn_id = str(stn_id)
    # q_str = "select stn_id as id, date_trunc('day',datestamp), " \
    #         "cast (avg(record) as integer) from stn_record " \
    #         "where stn_id='17696' group by stn_id, date_trunc('day', datestamp) " \
    #         "order by date_trunc('day', datestamp);"

    record_all = []
    cursor = connection.cursor()
    cursor.execute("select stn_id as id, date_trunc('day',datestamp)::date, " \
                   "cast (sum(record) as integer) as daily, sum(avg_hourly_record) as avg_daily "
                   "from stn_record where stn_id=%s"
                   "group by stn_id, date_trunc('day', datestamp)::date "
                   "order by date_trunc('day', datestamp)::date;", [stn_id])
    total_rows = cursor.fetchall()
    # record_queryset = stnRecord.objects.raw(q_str)
    for record in total_rows:
        record_all.append({
            'date': record[1].strftime("%Y-%m-%d"),
            'rec_num': record[2],
            'rec_sum': record[3]
        })
    return HttpResponse(json.dumps(record_all))

def sum_hourly(request):
    """ Get average daily record"""
    if request.method != 'GET':
        return HttpResponseBadRequest()
    stn_id = request.GET.get('stn_id')
    weather_var = request.GET.get('var')
    if weather_var == 'prec':
        w_query = "select hour,no_rain,rain from compare_traffic where stn_id ='%s'" %stn_id
    elif weather_var == 'vis':
        w_query = "select hour,good_vis,bad_vis from compare_traffic where stn_id ='%s'" %stn_id
    elif weather_var == 'wind':
        w_query = "select hour,no_wind,wind from compare_traffic where stn_id = '%s'" %stn_id
    elif weather_var == 'temp':
        w_query = "select hour,good_temp,bad_temp from compare_traffic where stn_id = '%s'" %stn_id
    stn_id = str(stn_id)
    records_arr = []
    cursor = connection.cursor()
    cursor.execute(w_query)
    record_rows = cursor.fetchall()
    for record in record_rows:
        records_arr.append({
            'hour': record[0],
            # 'without_rain': record[1],
            # 'with_rain': record[2],
            'basecase': record[1],
            'extreme': record[2],
            # 'no_wind': record[5],
            # 'windy': record[6],
            # 'light_rain': record[8],
            # 'heavy_rain': record[9]
        })
    return HttpResponse(json.dumps(records_arr))

def daily_hour(request):
    """ Get average hourly record"""
    if request.method != 'GET':
        return HttpResponseBadRequest()
    stn_id = request.GET.get('stn_id')
    date = request.GET.get('date')
    date_split = datetime.date(year=int(date.split("-")[0]),month=int(date.split("-")[1]),day=int(date.split("-")[2]))
    next_day = date_split + relativedelta(days=1)
    print(date, next_day)
    hour_arr = []
    cursor = connection.cursor()
    # cursor.execute("select t.stn, t.hour_of_day, avg(record) from("
    #                " select stn_id as stn, extract(dow from datestamp) as date_of_week, "
    #                "extract(hour from datestamp) as hour_of_day, record "
    #                "from stn_record where stn_id = '%s') as t "
    #                "where t.date_of_week in ('1','2','3','4','5') group by 1,2 order by 2;", [stn_id, date])
    cursor.execute("select extract(hour from datestamp), record, avg_hourly_record, prec_idw, vis_idw, temp_idw, wind_idw "
                   "from stn_record where stn_id = %s and datestamp >= %s and datestamp < %s "
                   "order by datestamp", [stn_id, date, next_day])
    hourly_rows = cursor.fetchall()
    for record in hourly_rows:
        hour_record = int(record[0]) + 1
        # print(round((float(record[1])/float(record[2])),2))
        # record
        hour_arr.append({
                'day': 1,
                'hour': hour_record,
                'value': round((float(record[1])/float(record[2])),4)
        })
        # prec
        # if record[3] is None :
        #      print(record[3])
        #      hour_arr.append({
        #         'day': 2,
        #         'hour': hour_record,
        #         'value': ""
        # })
        # else:
        #     print(record[3])
        #     hour_arr.append({
        #             'day': 2,
        #             'hour': hour_record,
        #             'value': record[3]/0.05
        #     })
        # # vis
        # if record[4] is None :
        #     hour_arr.append({
        #         'day': 3,
        #         'hour': hour_record,
        #         'value': ""
        # })
        # else:
        #     hour_arr.append({
        #             'day': 3,
        #             'hour': hour_record,
        #             'value': record[4]/9
        #     })
        # # temp
        # if record[5] is None:
        #     hour_arr.append({
        #         'day': 4,
        #         'hour': hour_record,
        #         'value': ""
        # })
        # else:
        #     hour_arr.append({
        #             'day': 4,
        #             'hour': hour_record,
        #             'value': record[5]/60
        #     })
        # # wind
        # if record[6] is None:
        #     hour_arr.append({
        #         'day': 5,
        #         'hour': hour_record,
        #         'value': ""
        # })
        # else:
        #     hour_arr.append({
        #             'day': 5,
        #             'hour': hour_record,
        #             'value': record[6]/6
        #     })
    return HttpResponse(json.dumps(hour_arr))

def index(request):
    """Handle index page request."""
    return render_to_response('index.html', RequestContext(request))

from django.shortcuts import render_to_response
from django.template import RequestContext
import json
import requests
import pandas as pd
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
        print(each_stn)
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
    # stnId = request.GET.get('stm_id')
    # q_str = "select stn_id as id, date_trunc('day',datestamp), " \
    #         "cast (avg(record) as integer) from stn_record " \
    #         "where stn_id='17696' group by stn_id, date_trunc('day', datestamp) " \
    #         "order by date_trunc('day', datestamp);"

    record_all = []
    cursor = connection.cursor()
    cursor.execute("select stn_id as id, date_trunc('day',datestamp)::date, " \
                   "cast (sum(record) as integer) as daily, sum(avg_record) as avg_daily "
                   "from stn_record where stn_id=%s "
                   "group by stn_id, date_trunc('day', datestamp)::date "
                   "order by date_trunc('day', datestamp)::date;", ['15451'])
    total_rows = cursor.fetchall()
    # record_queryset = stnRecord.objects.raw(q_str)
    for record in total_rows:
        print record
        record_all.append({
            'date': record[1].strftime("%Y-%m-%d"),
            'rec_num': record[2],
            'rec_sum': record[3]
        })
    return HttpResponse(json.dumps(record_all))


def index(request):
    """Handle index page request."""
    return render_to_response('index.html', RequestContext(request))

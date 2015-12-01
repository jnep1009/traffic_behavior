from django.shortcuts import render_to_response
from django.template import RequestContext
import json
import requests
import pandas as pd
from django.http import HttpResponse, HttpResponseBadRequest

from traffic_viz.models import stnMeta, stnRecord


# Create your views here.
def get_stn(request):
    if request.method != 'GET':
        return HttpResponseBadRequest()

    """ Get Station From Database. """
    stn_queryset = stnMeta.objects.all()
    stn_set = []
    for each_stn in stn_queryset:
        stn_set.append({
            'stn_id': each_stn.stn_id,
            'location': each_stn.stn_loc,
            'lat': each_stn.lat,
            'lng': each_stn.lng,
            'county': each_stn.county
        })

    """ Get geojson for Georgia."""
    countylist = []
    geoJson = {"type": "FeatureCollection", "features": []}
    stn_county = stnMeta.objects.distinct('county')
    for county in stn_county:
        countylist.append(county.county.lower())
    print countylist
    params = {"state": "al", "meta": "geojson,id,name"}
    response = requests.get('http://data.srcc.rcc-acis.org/General/county', params=params).json()
    for count in response['meta']:
        if count['name'].lower() in countylist:
            geoJson['features'].append({
                'type': 'Feature',
                'geometry': count['geojson'],
                'properties': {
                    'id': count['id'],
                    'county': count['name']
                }
            })

    return HttpResponse(json.dumps(stn_set))



def index(request):
    """Handle index page request."""
    return render_to_response('index.html', RequestContext(request))
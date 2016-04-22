"""traffic_research URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import patterns, url
from traffic_viz.views import index, get_stn, get_record, get_RainStn, sum_hourly

urlpatterns = patterns(
    '',
    url(r'^$', index, name='traffic'),
    url(r'^getStation/', get_stn),
    url(r'^getRecord/', get_record),
    url(r'^getWeatherStation/', get_RainStn),
    url(r'^avgHourly/', sum_hourly),
)

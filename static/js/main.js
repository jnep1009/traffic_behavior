/**
 * JS for Traffic Behavior Analytics.
 */

requirejs.config({
    'baseUrl': '/static/js/',
    'paths': {
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
        'bootstrap': '//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min',
        'mapbox': '//api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox',
        'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min',
        'd3_legend': 'https://cdnjs.cloudflare.com/ajax/libs/d3-legend/1.10.0/d3-legend.min',
        'socket_io': '//cdn.socket.io/socket.io-1.3.6',
        'datatables': '//cdn.datatables.net/1.10.7/js/jquery.dataTables.min',
        'table_tools': 'https://cdnjs.cloudflare.com/ajax/libs/datatables-tabletools/2.1.5/js/TableTools.min'
    },
    'shim': {
        bootstrap: {
            deps: ['jquery']
        },
        d3: {
            deps: ['jquery'],
            exports: 'd3'
        },
        d3_legend:{
            deps: ['jquery','d3'],
            exports: 'd3_legend'
        },
        datatables: {
            deps: ['jquery']
        },
        table_tools: {
            deps: ['jquery', 'datatables']
        },
        traffic_base: {
            deps: ['jquery','mapbox','d3_chart', 'd3_linechart']
        },
        d3_chart:{
            deps: ['jquery','d3', 'd3_hourly_heatmap']
        },
        d3_linechart:{
            deps: ['jquery', 'd3', 'd3_legend']
        },
        d3_hourly_heatmap:{
            deps: ['jquery', 'd3']
        }
    }
});


require(['jquery', 'bootstrap','d3'], function ($) {
    require(['traffic_base'], function (tf_b) {
        tf_b.initialize();
    });
    //require(['d3_chart'],function(chart){
    //   chart.initialize();
    //});
});
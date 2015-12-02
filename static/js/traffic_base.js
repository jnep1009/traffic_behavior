/**
 * Created by june on 11/23/15.
 */
define(['jquery', 'mapbox', 'd3'], function ($) {

    L.mapbox.accessToken = 'pk.eyJ1Ijoic3JjYyIsImEiOiJlTGVCUUZJIn0.wtVBLySJsD08rO1jtAQNJg';
    var map = L.mapbox.map('map_canvas', 'srcc.o8jkobgn', {attributionControl: false}).setView([33.7550, -84.3900], 9);
    var countyLayer = L.mapbox.featureLayer().addTo(map);

    // Get geoJSON and Camera Location
    $.get('getStation',
        function (data) {
            var json_dat = JSON.parse(data);
            var geoCounty = json_dat['geo'];
            var camLoc = json_dat['cam'];

        });


    function initialize() {

    }

    return {
        initialize: initialize
    }
});
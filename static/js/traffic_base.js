/**
 * Created by june on 11/23/15.
 */
define(['jquery', 'mapbox', 'd3', 'd3_chart'], function ($, _, _, d3_chart) {

  L.mapbox.accessToken = 'pk.eyJ1Ijoic3JjYyIsImEiOiJlTGVCUUZJIn0.wtVBLySJsD08rO1jtAQNJg';
  var map = L.mapbox.map('map_canvas', 'srcc.26921695', {attributionControl: false}).setView([33.7550, -84.3900], 9);
  var countyLayer = L.mapbox.featureLayer().addTo(map);
  var camLoc = L.mapbox.featureLayer().addTo(map);
  var wstnLayer = L.mapbox.featureLayer().addTo(map);
  L.control.scale().addTo(map);

  // Set Customize Marker
  camLoc.on('layeradd', function (e) {
    var marker = e.layer,
      feature = marker.feature;

    marker.setIcon(L.divIcon(feature.properties.icon));
  });
  camLoc.on('mouseover', function (e) {
      e.layer.openPopup();
  });

  camLoc.on('click', function (e){
      console.log(e.target);
  });

  wstnLayer.on('layeradd', function (e) {
    var marker = e.layer,
      feature = marker.feature;

    marker.setIcon(L.divIcon(feature.properties.icon));
  });

  // Get geoJSON and Camera Location
  $.get('getStation',
    function (data) {
      var json_dat = JSON.parse(data);
      var geoCounty = json_dat['geo'];
      var cam_mark = json_dat['cam'];

      // Add Layer for county
      //countyLayer.setGeoJSON(geoCounty);
      //countyLayer.setStyle({
      //  fillColor: '#536872',
      //  color: '#36454f',
      //  fillOpacity: 0.2
      //
      //});
      camLoc.setGeoJSON(cam_mark);
      // Add Marker for cam
    });

  // // Get weather Station Sites
  //$.get('getWeatherStation',
  //  function (data) {
  //    var json_dat = JSON.parse(data);
  //    var wstn_locations = json_dat['wstn'];
  //
  //    // Add Layer for county
  //    //countyLayer.setGeoJSON(geoCounty);
  //    //countyLayer.setStyle({
  //    //  fillColor: '#536872',
  //    //  color: '#36454f',
  //    //  fillOpacity: 0.2
  //    //
  //    //});
  //    wstnLayer.setGeoJSON(wstn_locations);
  //    // Add Marker for cam
  //  });



  function initialize() {
    d3_chart.InitialChart();
  }

  return {
    initialize: initialize
  }
});
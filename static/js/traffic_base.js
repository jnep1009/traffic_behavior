/**
 * Created by june on 11/23/15.
 */
define(['jquery', 'mapbox', 'd3', 'd3_chart','d3_linechart'], function ($, _, _, d3_chart, d3_linechart) {

  L.mapbox.accessToken = 'pk.eyJ1Ijoic3JjYyIsImEiOiJlTGVCUUZJIn0.wtVBLySJsD08rO1jtAQNJg';
  var map = L.mapbox.map('map_canvas', 'srcc.26921695', {attributionControl: false}).setView([33.7550, -84.3900], 9);
  var countyLayer = L.mapbox.featureLayer().addTo(map);
  var camLoc = L.mapbox.featureLayer().addTo(map);
  var wstnLayer = L.mapbox.featureLayer().addTo(map);
  L.control.scale().addTo(map);
  var line_prec = $('#line_prec');
  var line_vis = $('#line_vis');
  var line_temp = $('#line_temp');
  var line_wind = $('#line_wind');



  /**
   * Add Events to Layer
   * @param layer
   * @private
   */

  function layerPopupDefault_(layer) {
    layer.on({
      mouseover: function (e) {
        e.target.openPopup();
      },
      click: function (e) {
        var stn_id = e.target.feature.properties.id;
        d3_chart.InitialChart(stn_id);
        d3_linechart.InitialChart(stn_id, 'prec');
        $("#stn_id_hid").text(stn_id);
        $("#button_weather").show();
      }
    })
  }

  /**
   * Set customize marker
   */
  camLoc.on('layeradd', function (e) {
    var marker = e.layer,
      feature = marker.feature;

    marker.setIcon(L.divIcon(feature.properties.icon));
  });

  wstnLayer.on('layeradd', function (e) {
    var marker = e.layer,
      feature = marker.feature;
    marker.setIcon(L.divIcon(feature.properties.icon));
  });

  /**
   * Get Traffic Sites locations
   */
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
      camLoc.eachLayer(function (layer) {
        layerPopupDefault_(layer);
      });
    });

  // // Get weather Station Sites
  //$.get('getWeatherStation',
  //  function (data) {
  //    var json_dat = JSON.parse(data);
  //    var wstn_locations = json_dat['wstn'];
  //    wstnLayer.setGeoJSON(wstn_locations);
  //    // Add Marker for cam
  //  });





  function initialize() {
    line_prec.click(function(){
      var stn_id = $('#stn_id_hid').text();
      d3_linechart.InitialChart(stn_id,'prec');
      line_prec.css("background-color","#6C7B8B");
      line_vis.css("background-color","#222222");
      line_temp.css("background-color","#222222");
      line_wind.css("background-color","#222222");
    });
    line_vis.click(function(){
      var stn_id = $('#stn_id_hid').text();
      d3_linechart.InitialChart(stn_id,'vis');
      line_prec.css("background-color","#222222");
      line_vis.css("background-color","#6C7B8B");
      line_temp.css("background-color","#222222");
      line_wind.css("background-color","#222222");
    });
    line_temp.click(function(){
      var stn_id = $('#stn_id_hid').text();
      d3_linechart.InitialChart(stn_id,'temp');
      line_prec.css("background-color","#222222");
      line_vis.css("background-color","#222222");
      line_temp.css("background-color","#6C7B8B");
      line_wind.css("background-color","#222222");
    });
    line_wind.click(function(){
      var stn_id = $('#stn_id_hid').text();
      d3_linechart.InitialChart(stn_id,'wind');
      line_prec.css("background-color","#222222");
      line_vis.css("background-color","#222222");
      line_temp.css("background-color","#222222");
      line_wind.css("background-color","#6C7B8B");
    });
    $("#hourly_heatmap").hide();
    $("#button_weather").hide();
  }

  return {
    initialize: initialize
  }
});
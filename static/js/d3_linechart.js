/**
 * Created by june on 4/21/16.
 */
define(['jquery', 'd3'], function ($, d3) {


  var margin = {top: 20, right: 130, bottom: 30, left: 80},
    width = 730 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom,
    contextHeight = 50,
    contextWidth = width * .5;
  var legendRectSize = 12;
  var legendSpacing = 4;


  function InitialChart(stn_id, weather_var) {

    var exist = d3.select("#corre_chart").selectAll("svg");
    if (exist) {
      exist.remove();
    }

    var x = d3.scale.linear()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var color = d3.scale.ordinal().range(["#9EE89D", "#8CABFF", "#E86A81"]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .interpolate("basis")
      .x(function (d) {
        return x(d.hour);
      })
      .y(function (d) {
        return y(d.all_factor);
      });

    var svg = d3.select("#corre_chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function make_y_axis() {
      return d3.svg.axis()
        .scale(y)
        .orient("left")
    }

    /**
     * Get JSON from postgresql
     */
    var get_url = 'avgHourly?stn_id=' + stn_id + '&var=' + weather_var;

    d3.json(get_url, function (error, data) {
      if (error) throw error;

      color.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "hour";
      }));

      var traffic_factor = color.domain().map(function (each_factor) {
        return {
          each_factor: each_factor,
          values: data.map(function (d) {
            return {hour: d.hour, all_factor: +d[each_factor]}
          })
        }
      });

      x.domain(d3.extent(data, function (d) {
          return d.hour;
        })
      );

      y.domain([
        d3.min(traffic_factor, function (c) {
          return d3.min(c.values, function (v) {
            return v.all_factor;
          });
        }),
        d3.max(traffic_factor, function (c) {
          return d3.max(c.values, function (v) {
            return v.all_factor;
          });
        })
      ]);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", 550)
        .style("text-anchor", "middle")
        .text("hour");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate(-65," + 20 * 3.5 + ")rotate(-90)")
        .attr("y", 0)
        .style("text-anchor", "middle")
        .text("average traffic volume");


      //.attr("transform", "translate(-40," + cellSize * 3.5 + ")rotate(-90)")
      //  .style("text-anchor", "middle")
      //  .text(function (d) {
      //    return d;
      //  });

      svg.append("g")
        .attr("class", "grid")
        .call(make_y_axis()
          .tickSize(-width, 0, 0)
          .tickFormat("")
        );

      var legend = svg.selectAll('.legend')                     // NEW
        .data(color.domain())                                   // NEW
        .enter()                                                // NEW
        .append('g')                                            // NEW
        .attr('class', 'legend')                                // NEW
        .attr('transform', function (d, i) {                     // NEW
          var height = legendRectSize + legendSpacing;          // NEW
          var offset = height * color.domain().length / 2;     // NEW
          var horz = width + 10;                       // NEW
          var vert = i * height - offset;                       // NEW
          return 'translate(' + horz + ',' + vert + ')';        // NEW
        });

      legend.append('rect')                                     // NEW
        .attr('width', legendRectSize)                          // NEW
        .attr('height', legendRectSize)                         // NEW
        .style('fill', color)                                   // NEW
        .style('stroke', color);

      legend.append('text')                                     // NEW
        .attr('x', legendRectSize + legendSpacing)              // NEW
        .attr('y', legendRectSize - legendSpacing)              // NEW
        .text(function (d) {
          return d;
        });                       // NEW

      var traffic = svg.selectAll(".traffic")
        .data(traffic_factor)
        .enter().append("g")
        .attr("class", "traffic");

      traffic.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
          return line(d.values);
        })
        .style("stroke", function (d) {
          return color(d.each_factor)
        });

    });
  }

  function initialize() {

  }

  return {
    initialize: initialize,
    InitialChart: InitialChart
  }

});

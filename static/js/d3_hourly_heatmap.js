/**
 * Created by june on 4/21/16.
 */
define(['jquery', 'd3'], function ($) {

  var margin = margin = {top: 50, right: 0, bottom: 100, left: 30},
    height = 300 - margin.top - margin.bottom,
    width = 430 - margin.left - margin.right,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize * 2,
    buckets = 9,
    colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
    days = ["am", "pm"],
    times = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  var svg = d3.select("#hourly_heatmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var timesLabels = svg.selectAll(".timeLabel")
    .data(times)
    .enter().append("text")
    .text(function (d) {
      return d;
    })
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i * gridSize
    })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", function (d, i) {
      return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
    });

  var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
    .text(function (d) {
      return d;
    })
    .attr("x", function (d, i) {
      return i * gridSize;
    })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", "dayLabel mono axis axis-workweek");

  function getDailySummary(stn_id, date) {
    var get_url = 'avgEachDay?stn_id=' + stn_id + '&date=' + date;
    d3.json(get_url, function (error, data) {
      var colorScale = d3.scale.quantile()
        .domain([0, buckets - 1, d3.max(data, function (d) {
          return d.value
        })])
        .range(colors);

      var cards = svg.selectAll(".hour")
        .data(data, function (d) {
          console.log(d);
          return d.day + ':' + d.hour
        });

      cards.enter().append("rect")
        .attr("x", function (d) {
          console.log(d.day);
          return (d.day - 1) * gridSize;
        })
        .attr("y", function (d) {
          return (d.hour - 1) * gridSize;
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0]);

      cards.transition().duration(1000)
        .style("fill", function (d) {
          return colorScale(d.value);
        });

      cards.select("title").text(function (d) {
        return d.value;
      });

      cards.exit().remove();
    });
  }

  return {
    getDailySummary: getDailySummary
  }

});
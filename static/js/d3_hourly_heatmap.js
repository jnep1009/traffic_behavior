/**
 * Created by june on 4/21/16.
 */
define(['jquery', 'd3'], function ($) {


    var margin = margin = {top: 50, right: 0, bottom: 50, left: 40},
        height = 330 - margin.top - margin.bottom,
        width = 320 - margin.left - margin.right,
        gridSize = Math.floor(width / 24),
        legendElementWidth = gridSize * 2,
        buckets = 9,
        //colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9] // alternatively colorbrewer.YlGnBu[9]
        colors = ["#1a9850","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#d73027"],
        //days = ["Traffic", "Precipitation", "Visibility", "Temperature", "Wind Speed"],
        days=["Traffic"],
        times = [
            "12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm",
            "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
        ];

    var symbols = {
        'Traffic': '\uf1b9'
        //'Precipitation': '\uf043',
        //'Visibility': '\uf06e',
        //'Temperature': '\uf185',
        //'Wind Speed': '\uf11d'
    };

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
        .attr("transform", "translate(-6," + gridSize / 1.1 + ")")
        .attr("class", function (d, i) {
            return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
        });

    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter()
        //.append("image")
        //.attr("xlink:href", "https://github.com/favicon.ico")
        //.attr("x", -8)
        //.attr("y", -8)
        //.attr("width", 15)
        //.attr("height", 15)

        .append('text')
        .style('font-family', 'FontAwesome')
        .style('font-size', '10px')
        .text(function (d) {
            return symbols[d]
        })

        .attr("x", function (d, i) {
            return i * gridSize;
        })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -10)")
        .attr("class", "dayLabel mono axis axis-workweek");

    function getDailySummary(stn_id, date) {
        var get_url = 'avgEachDay?stn_id=' + stn_id + '&date=' + date;
        d3.json(get_url, function (error, data) {

            var colorScale = d3.scale.quantize()
                .domain([0, 2, d3.max(data, function (d) {
                    return d.value
                })])
                .range(colors);

            var cards = svg.selectAll(".hour")
                .data(data, function (d) {
                    return d.day + ':' + d.hour
                });

            cards.enter().append("rect")
                .attr("x", function (d) {
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
                .style("fill", function (d) {;
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
/**
 * Created by june on 12/2/15.
 */
define(['jquery', 'd3', 'd3_hourly_heatmap'], function ($, _, hourly_heatmap) {

    var width = 1200;
    var height = 105;
    var cellSize = 12;

    var week_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var day = d3.time.format("%w");
    var week = d3.time.format("%U");
    var format = d3.time.format("%Y-%m-%d");

    var color = d3.scale.quantize()
        .domain([0, 1.5])
        .range(d3.range(11).map(function (d) {
            return "q" + d + "-11";
        }));


    /**
     * Initialize the chart
     * @constructor
     */
    var InitialChart = function (stn_id) {
        var exist = d3.select("#conviz").selectAll("svg");
        if (exist) {
            exist.remove();
        }


        var svg = d3.select("#conviz")
            .selectAll("svg")
            .data(d3.range(2011, 2016))
            .enter().append("svg")
            .attr("width", '220%')
            .attr("height", '350%')
            .attr("data-height", '0.5678')
            .attr("viewBox", '220 0 1200 105')
            .attr("class", "RdYlGn")
            .append("g")
            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-40," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function (d) {
                return d;
            });

        /**
         * Generate day
         */

        for (var i = 0; i < 7; i++) {
            svg.append("text")
                .attr("transform", "translate(-5," + cellSize * (i + 1) + ")")
                .style("text-anchor", "end")
                .attr("dy", "-.5em")
                .text(function (d) {
                    return week_days[i];
                });
        }

        var rect = svg.selectAll(".day")
            .data(function (d) {
                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            })
            .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function (d) {
                return d3.time.weekOfYear(d) * cellSize;
            })
            .attr("y", function (d) {
                return d.getDay() * cellSize;
            })
            .datum(format);

        /**
         * Generate month
         */

        function monthPath(t0) {
            var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = +day(t0), w0 = +week(t0),
                d1 = +day(t1), w1 = +week(t1);
            return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                + "H" + w0 * cellSize + "V" + 7 * cellSize
                + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                + "H" + (w1 + 1) * cellSize + "V" + 0
                + "H" + (w0 + 1) * cellSize + "Z";
        }

        var legend = svg.selectAll(".legend")
            .data(month)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(" + (((i + 1) * 50) + 20) + ",0)";
            });

        legend.append("text")
            .attr("class", function (d, i) {
                return month[i]
            })
            .style("text-anchor", "end")
            .attr("dy", "-.25em")
            .text(function (d, i) {
                return month[i]
            });


        svg.selectAll(".month")
            .data(function (d) {
                return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            })
            .enter().append("path")
            .attr("class", "month")
            .attr("id", function (d, i) {
                return month[i]
            })
            .attr("d", monthPath);

        /**
         * Get JSON from postgresql
         */
        var get_url = 'getRecord?stn_id=' + stn_id;

        d3.json(get_url, function (error, json_p) {
            if (error) throw error;
            var data = d3.nest()
                .key(function (d) {
                    return d.date;
                })
                .rollup(function (d) {
                    return d[0].rec_num / d[0].rec_sum;
                })
                .map(json_p);

            rect.filter(function (d) {
                return d in data;
            })
                .attr("class", function (d) {
                    return color(data[d]);
                })
                .attr("data-title", function (d) {
                    return "value : " + Math.round(data[d] * 100)
                })
                .on('click', function (d) {
                    // d -> date, stn_id
                    hourly_heatmap.getDailySummary(stn_id, d);
                });
            $("rect").tooltip({container: 'body', html: true, placement: 'top'});
        });

    };

    function initialize() {
        InitialChart();
    }

    return {
        initialize: initialize,
        InitialChart: InitialChart
    }

});
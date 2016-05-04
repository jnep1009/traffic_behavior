/**
 * Created by june on 4/21/16.
 */
define(['jquery', 'd3'], function ($) {

    function createChart(data) {
      var exist = d3.select("#corre_chart").selectAll("svg");
      if (exist) {
        exist.remove();
      }
      var margin = {top: 20, right: 90, bottom: 50, left: 100},
        width = 780 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom,
        contextHeight = 50,
        contextWidth = width * .5;

      var svg = d3.select('#corre_chart')
        .append("svg")
        .attr("width", (width + margin.left + margin.right))
        .attr("height", (height + margin.top + margin.bottom));

      svg.append("text")
        .attr("transform", "translate(10,300)rotate(-90)")
        .style("text-anchor", "middle")
        .text("Traffic Volume");

      svg.append("text")
        .attr("font-size", "15px")
        .attr("transform", "translate(695,385)")
        .text("Hour");
      var factors = [],
        charts = [],
        maxDataPoint = 0;

      var dataNest = d3.nest()
        .key(function (d) {
          return d.hour
        })
        .entries(data);



      for (var prop in dataNest[0].values[0]) {
        if (prop != 'hour') {
          factors.push(prop);
        }
      }
      var factorCounts = factors.length,
        startHour = 0,
        endHour = 24,
        chartHeight = height * (1 / factorCounts);

      dataNest.forEach(function (d) {
        if (d['values'][0]['precipitation'][0] > maxDataPoint) {
          maxDataPoint = d['values'][0]['precipitation'][0] + 100;
        }
      });

      for (var i = 0; i < factorCounts; i++) {
        charts.push(new Chart({
          data: data.slice(), // copy the array
          id: i,
          name: factors[i],
          width: width,
          height: height * (1 / factorCounts),
          maxDataPoint: maxDataPoint,
          svg: svg,
          margin: margin,
          showBottomAxis: (i == factors.length - 1)
        }));
      }
    }

    function Chart(options) {
      this.chartData = options.data;
      this.width = options.width;
      this.height = options.height;
      this.maxDataPoint = options.maxDataPoint;
      this.svg = options.svg;
      this.id = options.id;
      this.name = options.name;
      this.margin = options.margin;
      this.showBottomAxis = options.showBottomAxis;
      var localName = this.name;


      /* XScale is time based */
      this.xScale = d3.scale.linear()
        .range([0, this.width])
        .domain(d3.extent(this.chartData.map(function (d) {
          return d.hour;
        })));

      /* YScale is linear based on the maxData Point we found earlier */
      this.yScale = d3.scale.linear()
        .range([this.height, 0])
        .domain([0, this.maxDataPoint]);

      var xS = this.xScale;
      var yS = this.yScale;

      this.area = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
          return xS(d.hour);
        })
        .y(function (d) {
          return yS(d[localName][0]);
        });

      this.line2 = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
          return xS(d.hour);
        })
        .y(function (d) {
          return yS(d[localName][1]);
        });

      this.svg.append("defs").append("clipPath")
        .attr("id", "clip-" + this.id)
        .append("rect")
        .attr("width", this.width)
        .attr("height", this.height);

      /*
       Assign it a class so we can assign a fill color
       And position it on the page
       */

      this.chartContainer = this.svg.append("g")
        .attr('class', this.name.toLowerCase())
        .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (this.height * this.id) + (10 * this.id)) + ")");

      /* We've created everything, let's actually add it to the page */

      this.chartContainer.append("path")
        .data([this.chartData])
        .attr("class", "line")
        .attr("clip-path", "url(#clip-" + this.id + ")")
        .attr("d", this.area);

      /* For second dataset */
      this.chartContainer.append("path")
        .data([this.chartData])
        .style("stroke", "red")
        .attr("class", "line2")
        .attr("clip-path", "url(#clip-" + this.id + ")")
        .attr("d", this.line2);

      this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("bottom");

      /* Only want a bottom axis on the last country */

      if (this.showBottomAxis) {
        this.chartContainer.append("g")
          .attr("class", "x axis bottom")
          .attr("transform", "translate(0," + this.height + ")")
          .call(this.xAxisBottom);
      }

      this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);

      this.chartContainer.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-15,0)")
        .call(this.yAxis);

      this.chartContainer.append("text")
        .attr("class", "country-title")
        .attr("transform", "translate(15,40)")
        .text(this.name);

    }


    function InitialChart(stn_id) {
      var get_url = 'avgHourly?stn_id=' + stn_id;
      d3.json(get_url, function (error, data) {
        createChart(data);
      });
    }


    function initialize() {

    }

    return {
      initialize: initialize,
      InitialChart: InitialChart
    }

  }
);

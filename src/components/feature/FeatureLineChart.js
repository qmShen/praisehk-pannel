import * as d3 from 'd3'
import {limitTimeRange} from "element-ui/src/utils/date-util";
import TimeLabelPanel from "./TimeLabelPanel";

let BrushLineChart = function(el, colorSchema){
  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight - 20;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.margin = {'top': 20,'bottom': 20, 'left': 30, 'right':10};
  this.obsColor = colorSchema.obs;
  this.modelColor = colorSchema.model;
};

function toDateTime(secs) {
  return new Date(parseInt(secs) * 1000);
}

BrushLineChart.prototype.setTimeRange = function(timerange){
  this.timerange = timerange;
  if(this.data){
    this.render();
  }
};

BrushLineChart.prototype.render = function(){
  let data = [];
  this.data.forEach(d=>{
    if(d.timestamp > this.timerange[0] && d.timestamp < this.timerange[1]){
      d['time'] = new Date(d.timestamp * 1000);
      data.push(d)
    }
  });
  this.svg.selectAll('g').remove();
  this.container = this.svg.append('g');
  let dateRange = [new Date(this.timerange[0] * 1000), new Date(this.timerange[1] * 1000)];
  this.xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);
  let xScale = this.xScale;

  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d=>{
    return   d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +  d.getHours() + ":00";
  });

  var yMax = d3.max([d3.max(data, d => d.val_aq), d3.max(data, d => d.val_cmaq)]);
  this.yMax = yMax;
  this.yMax = 200; // Given by domain expert
  var yScale = d3.scaleLinear()
    .domain([0,  this.yMax]).range([this.svgHeight - this.margin.bottom, this.margin.top]);
  var yAxis = d3.axisLeft().scale(yScale);

  var cmaq_line = d3.line()
    .x(d => xScale(d.time))
    .y(d => {
      if(d.val_cmaq == null || d.val_cmaq == 'null'){
        return  yScale(0)
      }
      return yScale(d.val_cmaq)
    });

  let cmaq_container = this.container.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')');
  cmaq_container.selectAll('path')
    .data([data]).enter().append('path')
    .attr('d', cmaq_line)
    .attr('fill', 'none')
    .attr('stroke', this.modelColor);

  cmaq_container.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[0, this.svgHeight - this.margin.bottom] +')');

  cmaq_container.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  let obs_container = this.container.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')');

  obs_container.selectAll('circle')
    .data(data).enter().append('circle')
    .attr('cx', d=>xScale(d.time))
    .attr('cy', d=>{
      if(d.val_aq == 'null' || d.val_aq == undefined){
        return yScale(this.yMax);
      }
      return yScale(d.val_aq)
    })
    .attr('r',1.5)
    .attr('fill', d=>{
      if(d.val_aq == 'null' || d.val_aq == undefined){
        return 'grey'
      }
      return this.obsColor
    });

  this.currentTimeLine = obs_container.append('line')
    .attr('stroke-width', 0)
    .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);

  // Time Brush
  this.setTimeBrush(this.timerange[0], this.timerange[1]);
};
BrushLineChart.prototype.setData = function(data, stationId){
  this.data = data;
  this.stationId = stationId;
  this.render();
};

BrushLineChart.prototype.setCurrentTimestamp = function(t){
  if(this.data == undefined || this.data == null || this.currentTimeLine == undefined){
    return
  }
  let x = this.xScale(new Date(t * 1000));
  this.currentTimeLine.style("stroke", '#984a23').attr('stroke-width', 1)
    .attr("x1", x).attr("y1", this.margin['top']).attr("x2", x).attr("y2", this.svgHeight - this.margin['bottom']);

};

let dateToSecs = function(date){
  return parseInt(date.getTime() / 1000);
};
BrushLineChart.prototype.on = function(msg, func){
  if(msg == 'brushEnd'){
    this.brushEnd = func
  }
};

BrushLineChart.prototype.setTimeBrush = function(startTimestamp, endTimestamp){
  let _this = this;
  startTimestamp = startTimestamp == undefined? 1451739600: startTimestamp;
  endTimestamp = endTimestamp == undefined? 1451750400: endTimestamp;

  let dateRange = [new Date(this.timerange[0] * 1000), new Date(this.timerange[1] * 1000)];
  let xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);;

  var brush = d3.brushX()
    .extent([[0, 0], [this.svgWidth - this.margin.left - this.margin.right, this.svgHeight]])
    .on("end", brushed);

  this.svg.append("g").attr('transform', 'translate(' + [this.margin.left, 0]+')')
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [0, this.svgWidth / 40]);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || xScale.range();
    let filter_range = s.map(xScale.invert, xScale);
    _this.brushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1]), _this.stationId]);
  }
};

export default BrushLineChart

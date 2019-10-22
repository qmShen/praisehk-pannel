import * as d3 from 'd3'
import TimeLabelLineChart from "./TimeLabelLineChart";

let FeatureLineChart = function(el){
  this.$el = el;
  this.svgWidth = this.$el.clientWidth;
  this.svgHeight = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.margin = {'top': 20,'bottom': 20, 'left': 30, 'right':10};
};

let dateToSecs = function(date){
  return parseInt(date.getTime() / 1000);
};

let featureYMax = {
  'PM25': 100,
  'NO2': 200
};

FeatureLineChart.prototype.render = function(){
  let data = [];
  this.data.forEach(d=>{
    if(d.timestamp > this.startTime && d.timestamp < this.endTime){
      d['time'] = new Date(d.timestamp * 1000);
      data.push(d)
    }
  });

  this.svg.selectAll('g').remove();
  let container = this.svg.append('g');

  let dateRange = [new Date(this.startTime * 1000), new Date(this.endTime * 1000)];
  this.xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);
  let xScale = this.xScale;
  let xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(d3.timeDay.every(1))
    .tickFormat(d=>{
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;
    return [month, day].join('/');
  });

  let yMax = featureYMax[this.selectFeature];
  let yScale = d3.scaleLinear()
    .domain([0,  yMax]).range([this.svgHeight - this.margin.top - this.margin.bottom, this.margin.top]);
  let yAxis = d3.axisLeft().scale(yScale);

  let cmaq_line = d3.line()
    .x(d => xScale(d.time))
    .y(d => {
      return (d.val_cmaq == null || d.val_cmaq === 'null')? yScale(0): yScale(d.val_cmaq);
    });

  let cmaq_container = container.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')');
  cmaq_container.selectAll('path')
    .data([data]).enter().append('path')
    .attr('d', cmaq_line)
    .attr('fill', 'none')
    .attr('stroke', this.colorScheme.model);

  cmaq_container.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[0, this.svgHeight- this.margin.top - this.margin.bottom] +')');

  cmaq_container.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  let obs_container = container.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')');

  obs_container.selectAll('circle')
    .data(data).enter().append('circle')
    .attr('cx', d=>xScale(d.time))
    .attr('cy', d=>{
      return (d.val_aq === undefined || d.val_aq === 'null' )? yScale(yMax): yScale(d.val_aq);
    })
    .attr('r',1.5)
    .attr('fill', d=>{
      return (d.val_aq === undefined || d.val_aq === 'null' )? 'grey': this.colorScheme.obs;
    });

  this.currentTimeLine = obs_container.append('line')
    .attr('stroke-width', 0)
    .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);

  // Time Brush
  this.setTimeBrush();
};

FeatureLineChart.prototype.setData = function(data, stationId){
  this.data = data;
  this.stationId = stationId;
  this.render();
};

FeatureLineChart.prototype.setTime = function(st, et){
  this.startTime = st;
  this.endTime = et;

  if ( this.data != null ) {
    this.render();
  }
};


FeatureLineChart.prototype.setCurrentTimestamp = function(t){
  if( this.data == null || this.currentTimeLine == null ) return;

  let x = this.xScale(new Date(t * 1000));
  this.currentTimeLine.style("stroke", '#984a23').attr('stroke-width', 1)
    .attr("x1", x).attr("y1", this.margin['top']).attr("x2", x).attr("y2", this.svgHeight - this.margin['bottom']);

};

FeatureLineChart.prototype.on = function(msg, func){
  if(msg === 'brushEnd'){
    this.brushEnd = func
  }
};

FeatureLineChart.prototype.setTimeBrush = function(){
  let _this = this;

  let brush = d3.brushX()
    .extent([[0, 0], [this.svgWidth - this.margin.left - this.margin.right, this.svgHeight]])
    .on("end", brushed);

  this.svg.append("g").attr('transform', 'translate(' + [this.margin.left, 0]+')')
    .attr("class", "brush")
    .call(brush);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.selection === null) return; // ignore click
    let s = d3.event.selection || _this.xScale.range();
    let filter_range = s.map(_this.xScale.invert, _this.xScale);
    _this.brushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1]), _this.stationId]);
  }
};

export default FeatureLineChart

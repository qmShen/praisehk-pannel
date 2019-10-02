/**
 * Created by qshen on 17/9/2019.
 */


import * as d3 from "d3";

let globalStart = 1451739600;
let globalEnd = 1546261200;

let dateToSecs = function(date){
  return parseInt(date.getTime() / 1000);
};
let BrushPannel = function(el) {

  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight - 20;
  this.margin = {'top': 20,'bottom': 20, 'left': 40, 'right':0};
  this.svg = d3.select(el).append('svg')
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight)
    .style('position', 'absolute');

  this.canvas = d3.select(el).append('canvas')
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight)
    .attr('id', 'error_canvas')


  this.context = this.svg.append("g").attr("class", "context");



};

BrushPannel.prototype.colors = [
  "#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb",
  "#41b6c4", "#1d91c0", "#225ea8", "#253494",
  "#081d58"
];

BrushPannel.prototype.render_error = function(mean_error){
  let domain = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50]

  let c=document.getElementById("error_canvas");
  let t = c.getContext('2d');

  let n_time = (globalEnd - globalStart)/3600
  let error_width = (this.svgWidth - this.margin.left)/n_time
  let error_height = this.svgHeight - this.margin.bottom - (this.svgHeight)/5

  let colorScale = d3.scaleQuantile()
    .domain(domain)
    .range(this.colors);

  let fakedata = new Array();
  for(let i=0; i<n_time;i++){
    fakedata[i] = i*100/n_time
  }

  for(let i=0;i<n_time;i++){
    var fillColor = colorScale(mean_error[i]['error'])
    drawRect(t,this.margin.left+error_width*i,(this.svgHeight)/5,error_width,error_height,fillColor);
  }

  function drawRect(txc,x,y,w,h,fillColor) {
      txc.beginPath();
      txc.moveTo(x, y);
      txc.lineTo(w + x, y);
      txc.lineTo(w + x, h + y);
      txc.lineTo(x, y + h);
      txc.closePath();
      txc.fillStyle = fillColor;
      txc.fill();
  }
}

BrushPannel.prototype.on = function(msg, func){
  if(msg == 'brushEnd'){
    this.brushEnd = func
  }
};


BrushPannel.prototype.initTimeBrush = function(startTimestamp, endTimestamp){

  let _this = this;
  startTimestamp = startTimestamp == undefined? globalStart: startTimestamp;
  endTimestamp = endTimestamp == undefined? globalEnd: endTimestamp;
  let dateRange = [new Date(startTimestamp * 1000), new Date(endTimestamp * 1000)];
  this.xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left]).domain(dateRange);
  let xScale = this.xScale;


  var brush = d3.brushX()
    .extent([[0, 0], [this.svgWidth, this.svgHeight]])
    .on("end", brushed);

  this.context.append("g").attr('transform', 'translate(' + [this.margin.left, 0]+')')
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [0, this.svgWidth / 75]);


  var xAxis = d3.axisBottom().scale(this.xScale);

  this.context.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[this.margin.left, this.svgHeight - this.margin.bottom] +')');

  function brushed() {
    console.log('hereherehere');
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || _this.xScale.range();
    let filter_range = s.map(xScale.invert, xScale);
    _this.brushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1])])
  }
};

// BrushPannel.prototype.setData = function(dataList){
//   console.log('update data', dataList);
//   let _this = this;
//   let _timerange = [];
//   dataList.forEach(featureValues=>{
//     _timerange.push(d3.extent(featureValues.value, d=>d['timestamp']))
//   });
//
//   let timeRange = [d3.min(_timerange,d=>d[0]), d3.max(_timerange, d=>d[1])];
//   let dateRange = [new Date(timeRange[0] * 1000), new Date(timeRange[1] * 1000)];
//
//   this.xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left]).domain(dateRange);
//   let xScale = this.xScale;
//
//
//   var brush = d3.brushX()
//     .extent([[0, 0], [this.svgWidth, this.svgHeight]])
//     .on("end", brushed);
//
//   this.context.append("g").attr('transform', 'translate(' + [this.margin.left, 0]+')')
//     .attr("class", "brush")
//     .call(brush)
//     .call(brush.move, [0, this.svgWidth / 75]);
//
//
//   var xAxis = d3.axisBottom().scale(this.xScale);
//
//   this.context.append('g')
//     .attr('class', 'xAxis')
//     .call(xAxis)
//     .attr('transform', 'translate('+[this.margin.left, this.svgHeight - this.margin.bottom] +')');
//
//   function brushed() {
//     if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
//     var s = d3.event.selection || _this.xScale.range();
//     let filter_range = s.map(xScale.invert, xScale);
//     _this.brushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1])])
//   }
// };

export default BrushPannel

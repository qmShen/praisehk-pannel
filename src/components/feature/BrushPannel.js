/**
 * Created by qshen on 17/9/2019.
 */


import * as d3 from "d3";
import BrushLineChart from "./linechart";


let globalStart = 1522540800;
let globalEnd = 1569884400;

//let globalStart = 1451739600;
// let globalStart = 1514811600; // 2018 Jan 02
// let globalEnd = 1546261200;


let dateToSecs = function(date){
  return parseInt(date.getTime() / 1000);
};
let BrushPannel = function(el) {

  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight;
  this.margin = {'top': 0,'bottom': 20, 'left': 40, 'right':0};
  this.svg = d3.select(el).append('svg')
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight)
    .style('position', 'absolute');

  this.canvas = d3.select(el).append('canvas')
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight)
    .attr('id', 'error_canvas')

  this.labels = this.svg.append("g").attr("class", "labels").attr('height', this.svgHeight/5);
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

  t.clearRect(0, 0, this.svgWidth, this.svgHeight);

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

BrushPannel.prototype.render_labels = function(label_info){
  let label_size = this.svgHeight/7;
  let symbolGenerator = d3.symbol().size(label_size*10);
  let margin = this.margin.left;

  let dateRange = [new Date(globalStart * 1000), new Date(globalEnd * 1000)];
  let _xscale = d3.scaleTime().range([0, this.svgWidth - this.margin.left]).domain(dateRange);

  this.labels.selectAll('.label_triangle').remove();
  let labels = this.labels.selectAll('.label_triangle')
    .data(label_info)
    .enter()
    .append('path')
    .attr('class', 'label_triangle')
    .attr('transform', function(d) {
      return 'translate(' + (margin+_xscale(d['startTime']*1000)) + ', ' + label_size/2 + ') rotate(180)';
    })
    .attr('d', symbolGenerator.type(d3['symbolTriangle']))
    .style('fill', "#d77451");

  let _this = this;
  labels.on('click', function(d){
    _this.labelClick(d);
  })
};

BrushPannel.prototype.on = function(msg, func){
  if(msg == 'brushEnd'){
    this.brushEnd = func
  } else if (msg === 'labelClick') {
    this.labelClick = func
  }
};


BrushPannel.prototype.initTimeBrush = function(startTimestamp, endTimestamp){

  let _this = this;
  this.maxBrushSize = this.svgWidth / 75;
  let maxBrushSize = this.maxBrushSize
  startTimestamp = startTimestamp == undefined? globalStart: startTimestamp;
  endTimestamp = endTimestamp == undefined? globalEnd: endTimestamp;
  let dateRange = [new Date(startTimestamp * 1000), new Date(endTimestamp * 1000)];
  this.xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left]).domain(dateRange);
  let xScale = this.xScale;


  var brush = d3.brushX()
    .extent([[0, 0], [this.svgWidth - this.margin.left, this.svgHeight]])
    .on("end", brushed);

  let brushHanlder = this.context.append("g").attr('transform', 'translate(' + [this.margin.left, this.svgHeight/5]+')')
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [0, this.svgWidth / 75]);



  var xAxis = d3.axisBottom().scale(this.xScale);

  this.context.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[this.margin.left, this.svgHeight - this.margin.bottom] +')');

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.selection === null) return; // ignore click
    var s = d3.event.selection || _this.xScale.range();
    console.log('s1', s);
    let filter_range = s.map(xScale.invert, xScale);

    if (d3.event.selection[1] - d3.event.selection[0] > maxBrushSize) {
      console.log('large', d3.event.selection[1] - d3.event.selection[0],  maxBrushSize)
      brushHanlder.transition()
        .duration(400)
        .call(brush.move, [
          d3.event.selection[0],
          d3.event.selection[0] + maxBrushSize - 0.01
        ]);
    }else{
      _this.brushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1])])
    }

  }
};

BrushLineChart.prototype.setSavedLabels = function(t){
  let x = this.xScale(new Date(t * 1000));
  this.currentTimeLine = obs_container.append('line')
    .attr('stroke-width', 0)
    .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);
  this.currentTimeLine.style("stroke", '#984a23').attr('stroke-width', 1)
    .attr("x1", x).attr("y1", this.margin['top']).attr("x2", x).attr("y2", this.svgHeight - this.margin['bottom']);
};

export default BrushPannel

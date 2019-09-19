/**
 * Created by qshen on 17/9/2019.
 */


import * as d3 from "d3";


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
    .attr('height', this.svgHeight);

  this.context = this.svg.append("g").attr("class", "context");

};

BrushPannel.prototype.on = function(msg, func){
  if(msg == 'brushEnd'){
    this.brushEnd = func
  }
};

BrushPannel.prototype.setData = function(dataList){
  console.log('update data', dataList);
  let _this = this;
  let _timerange = [];
  dataList.forEach(featureValues=>{
    _timerange.push(d3.extent(featureValues.value, d=>d['timestamp']))
  });

  let timeRange = [d3.min(_timerange,d=>d[0]), d3.max(_timerange, d=>d[1])];
  let dateRange = [new Date(timeRange[0] * 1000), new Date(timeRange[1] * 1000)];

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
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || _this.xScale.range();
    // console.log('this', _this.xScale.range())
    // console.log('sss',s, d3.event.selection);
    let filter_range = s.map(xScale.invert, xScale);
    _this.brushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1])])
  }
};

export default BrushPannel

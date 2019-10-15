/**
 * Created by qshen on 17/9/2019.
 */


import * as d3 from "d3";

let TimeLabelPanel = function(el) {
  this.$el = el;

  this.svgWidth = this.$el.clientWidth;
  this.svgHeight = this.$el.clientHeight;
  this.margin = {'top': 0,'bottom': 20, 'left': 30, 'right': 10};
  this.svg = d3.select(el).append('svg')
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight)
    .style('position', 'absolute');

  this.canvas = d3.select(el).append('canvas')
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight)
    .attr('id', 'error_canvas');
  this.labels = this.svg.append("g").attr("class", "labels").attr('height', this.svgHeight/5);
  this.context = this.svg.append("g").attr("class", "context");
};

TimeLabelPanel.prototype.colors = [
  "#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb",
  "#41b6c4", "#1d91c0", "#225ea8", "#253494",
  "#081d58"
];

TimeLabelPanel.prototype.render_error = function(meanErrorData){
  let domain = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50];

  let c = document.getElementById("error_canvas");
  let t = c.getContext('2d');
  t.clearRect(0, 0, this.svgWidth, this.svgHeight);

  let n_time = (this.globalEndTime - this.globalStartTime)/3600;
  let error_width = (this.svgWidth - this.margin.left - this.margin.right)/n_time;
  let error_height = this.svgHeight - this.margin.bottom - this.svgHeight/5;

  let colorScale = d3.scaleQuantile()
    .domain(domain)
    .range(this.colors);

  for ( let i = 0; i < n_time; i++ ) {
    let fillColor = colorScale(meanErrorData[i]['error']);
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
};

TimeLabelPanel.prototype.render_labels = function(label_info){
  let label_size = this.svgHeight/7;
  let symbolGenerator = d3.symbol().size(label_size*10);
  let margin = this.margin.left;

  let dateRange = [new Date(this.globalStartTime * 1000), new Date(this.globalEndTime * 1000)];
  let xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);

  this.labels.selectAll('.label_triangle').remove();
  let labels = this.labels.selectAll('.label_triangle')
    .data(label_info)
    .enter()
    .append('path')
    .attr('class', 'label_triangle')
    .attr('transform', function(d) {
      return 'translate(' + (margin+xScale(d['startTime']*1000)) + ', ' + label_size/2 + ') rotate(180)';
    })
    .attr('d', symbolGenerator.type(d3['symbolTriangle']))
    .attr('stroke', 'black')
    .style('fill', "#d77451");

  let _this = this;
  labels.on('click', function(d){
    _this.labelClick(d);
  })
};

TimeLabelPanel.prototype.on = function(msg, func){
  if(msg === 'brushEnd'){
    this.brushEnd = func
  } else if (msg === 'labelClick') {
    this.labelClick = func
  }
};

let dateToSecs = function(date){
  return date.getTime() / 1000;
};

TimeLabelPanel.prototype.initTimeBrush = function(){
  let _this = this;
  let dateRange = [new Date(this.globalStartTime * 1000), new Date(this.globalEndTime * 1000)];
  let xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);
  let maxBrushSize = xScale((this.globalStartTime + 24 * 3600 * 14) * 1000);

  let brush = d3.brushX()
    .extent([[0, 0], [this.svgWidth - this.margin.left - this.margin.right, this.svgHeight]])
    .on("end", brushed);

  let brushHandler = this.context.append("g").attr('transform', 'translate(' + [this.margin.left, this.svgHeight/5]+')')
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [0, maxBrushSize]);

  this.context.append('g')
    .attr('class', 'xAxis')
    .call(d3.axisBottom().scale(xScale).ticks(d3.timeMonth.every(1)))
    .attr('transform', 'translate('+[this.margin.left, this.svgHeight - this.margin.bottom] +')');

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.selection === null) return; // ignore click
    let s = d3.event.selection || xScale.range();
    let filter_range = s.map(xScale.invert, xScale);

    if (d3.event.selection[1] - d3.event.selection[0] > maxBrushSize) {
      brushHandler.transition()
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

export default TimeLabelPanel

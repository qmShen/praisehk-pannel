import * as d3 from 'd3'

let LabelLineChart = function(el){
  this.$el = el;
  this.svgWidth = this.$el.clientWidth;
  this.svgHeight = 200;
  //this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', 200);
  this.margin = {'top': 20,'bottom': 20, 'left': 30, 'right': 10};
  this.obsColor = "#479886";
  this.modelColor = '#d77451';
};


LabelLineChart.prototype.setData = function(data, st, et){
  this.data = data;
  this.startTime = st;
  this.endTime = et;
  this.render();
};

LabelLineChart.prototype.on = function(msg, func){
  if(msg == 'dialogBrushEnd'){
    this.dialogBrushEnd = func
  }
};

let dateToSecs = function(date){
  return parseInt(date.getTime() / 1000);
};

LabelLineChart.prototype.render = function(){
  let data = [];
  let startTimestamp = this.startTime - 24 * 3600 * 2;
  let endTimestamp = this.startTime + 24 * 3600 * 4;
  this.data.forEach(d=>{
    if(d.timestamp > startTimestamp && d.timestamp < endTimestamp){
      d['time'] = new Date(d.timestamp * 1000);
      data.push(d)
    }
  });

  this.svg.selectAll('g').remove();
  this.container = this.svg.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')')
  let dateRange = [new Date(startTimestamp * 1000), new Date(endTimestamp * 1000)];
  this.xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);

  let _this = this;
  let xScale = this.xScale;

  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d=>{
    return   d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +  d.getHours() + ":00";
  });

  var yMax = d3.max([d3.max(data, d => d.val_aq), d3.max(data, d => d.val_cmaq)]);
  this.yMax = yMax;
  this.yMax = 100; // Given by domain expert
  var yScale = d3.scaleLinear()
    .domain([0,  this.yMax]).range([this.svgHeight - this.margin.bottom, this.margin.top]);
  var yAxis = d3.axisLeft().scale(yScale);

  var cmaq_line = d3.line()
    .x(d => xScale(d.time))
    .y(d => {
      if(d.val_cmaq == null || d.val_cmaq == 'null'){
        return yScale(0)
      }
      return yScale(d.val_cmaq)
    });

  let cmaq_container = this.container.append('g');
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

  let obs_container = this.container.append('g');

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

  // Time Brush
  var brush = d3.brushX()
    .extent([[this.margin.left, this.margin.top], [this.svgWidth - this.margin.right, this.svgHeight-this.margin.bottom]])
    .on("end", brushed);

  this.svg.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [xScale(this.startTime*1000), xScale(this.endTime*1000)]);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.selection === null) return; // ignore click
    var s = d3.event.selection || xScale.range();
    let filter_range = s.map(xScale.invert, xScale);
    _this.dialogBrushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1])]);
  }
};

export default LabelLineChart

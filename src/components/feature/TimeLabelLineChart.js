import * as d3 from 'd3'

let TimeLabelLineChart = function(el){
  this.$el = el;
  this.svgWidth = this.$el.clientWidth;
  this.svgHeight = 200;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.margin = {'top': 20,'bottom': 20, 'left': 30, 'right': 10};
};

TimeLabelLineChart.prototype.setData = function(data, st, et){
  this.data = data;
  this.startTime = st;
  this.endTime = et;
  this.render();
};

TimeLabelLineChart.prototype.setTime = function(st, et){
  this.startTime = st;
  this.endTime = et;
  this.render();
};

TimeLabelLineChart.prototype.on = function(msg, func){
  if(msg === 'dialogBrushEnd'){
    this.dialogBrushEnd = func
  }
};

let dateToSecs = function(date){
  return parseInt(date.getTime() / 1000);
};

let featureYMax = {
  'PM25': 100,
  'NO2': 200
};

TimeLabelLineChart.prototype.render = function(){
  let _this = this;

  // 3 days before the label start date, 7 days after
  let startTimestamp = this.startTime - 24 * 3600 * 3;
  let endTimestamp = this.startTime + 24 * 3600 * 7;
  let dateRange = [new Date(startTimestamp * 1000), new Date(endTimestamp * 1000)];

  // Get all data that are within the time frame
  let data = [];
  this.data.forEach(d=>{
    if(d.timestamp > startTimestamp && d.timestamp < endTimestamp){
      d['time'] = new Date(d.timestamp * 1000);
      data.push(d)
    }
  });

  // Re-rendering
  this.svg.selectAll('g').remove();
  let container = this.svg.append('g');

  // scale of x-axis of the chart
  let xScale = d3.scaleTime().range([0, this.svgWidth - this.margin.left - this.margin.right]).domain(dateRange);
  let xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(d3.timeDay.every(1))
    .tickFormat(d => {
      let year = d.getFullYear();
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;
      return [year, month, day].join('/');
    });

  // scale of y-axis of the chart
  let yMax = featureYMax[this.selectFeature];
  let yScale = d3.scaleLinear()
    .domain([0, yMax]).range([this.svgHeight - this.margin.bottom, this.margin.top]);

  // plot CMAQ data
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
    .attr('transform', 'translate('+[0, this.svgHeight - this.margin.bottom] +')');

  let yAxis = d3.axisLeft().scale(yScale);
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

  // Time Brush
  let brush = d3.brushX()
    .extent([[0, this.margin.top], [this.svgWidth - this.margin.left - this.margin.right, this.svgHeight-this.margin.bottom]])
    .on("end", brushed);

  this.svg.append("g").attr('transform', 'translate(' + [this.margin.left, 0]+')')
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [xScale(this.startTime*1000), xScale(this.endTime*1000)]);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.selection === null) return; // ignore click
    let s = d3.event.selection || xScale.range();
    let filter_range = s.map(xScale.invert, xScale);
    _this.dialogBrushEnd([dateToSecs(filter_range[0]), dateToSecs(filter_range[1])]);
  }
};

export default TimeLabelLineChart

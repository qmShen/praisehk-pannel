import * as d3 from 'd3'
import {limitTimeRange} from "element-ui/src/utils/date-util";

let BrushLineChart = function(el){

  let _this = this;
  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight - 20;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.margin = {'top': 20,'bottom': 20, 'left': 40, 'right':0};

};
function toDateTime(secs) {
  // var t = new Date(1970, 0, 1); // Epoch
  // t.setSeconds(secs);
  return new Date(parseInt(secs) * 1000);
}

BrushLineChart.prototype.set_currentTIme = function(data){


};


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
  var xExtent = d3.extent(data, d => d.time);
  var xScale = d3.scaleTime()
    .domain(xExtent).range([0, this.svgWidth - this.margin.right - this.margin.left]);

  this.xScale = xScale;
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d=>{
    // console.log('ddd', d, typeof (d));
    return   d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +  d.getHours() + ":00"
    // return d
  })

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
        return  yScale(0)
      }
      return yScale(d.val_cmaq)
    });

  let cmaq_contaienr = this.container.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')');
  cmaq_contaienr.selectAll('path')
    .data([data]).enter().append('path')
    .attr('d', cmaq_line)
    .attr('fill', 'none')
    .attr('stroke', 'blue');

  cmaq_contaienr.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[0, this.svgHeight - this.margin.bottom] +')');

  cmaq_contaienr.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  let obs_container = this.container.append('g').attr('transform', 'translate(40,0)');

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
      return 'red'
    });


  this.currentTimeLine = obs_container.append('line')
    .attr('stroke-width', 0)
    .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);
};
BrushLineChart.prototype.setData = function(data){
  this.data  = data;
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

export default BrushLineChart

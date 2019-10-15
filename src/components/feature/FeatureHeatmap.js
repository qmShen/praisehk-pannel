/**
 * Created by qshen on 17/9/2019.
 */

import * as d3 from "d3";
import pipeService from '../../service/pipeService.js'

let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let hkStationList = [67, 68, 70, 74, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 87, 90];
let hkStationRoadList = [78, 81, 83];
let hkStationDict = {
  '83': 'CB_R', '78': 'CL_R', '81': 'MKaR', '77': 'CW_A',
  '84': 'EN_A', '76': 'KC_A', '85': 'KT_A', '82': 'ST_A',
  '79': 'SP_A', '80': 'TP_A', '90': 'MB_A', '87': 'TK_A',
  '74': 'TW_A', '68': 'TM_A', '67': 'TC_A', '70': 'YL_A',
};

let lengthStationGap = 10;

let gradientBoundary = [-100,100];
let gradientColorsAbs = [
  "#d7191c", "#e76818", "#f29e2e", "#f9d057",
  "#ffff8c", "#90eb9d", "#00ccbc", "#00a6ca",
  "#2c7bb6"
];
let gradientColors = [
  "#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb",
  "#41b6c4", "#1d91c0", "#225ea8", "#253494",
  "#081d58"
];

let format_date = function(date){
  let month = date.getMonth() >= 9?date.getMonth() + 1:'0' + (date.getMonth() + 1);
  let day = date.getDate() >= 10?date.getDate():'0' + date.getDate();
  let hour = date.getHours() >= 10?date.getHours():'0' + date.getHours();
  return date.getFullYear() + '-' + month + '-' + day + ' ' + hour +':00 ' + weekDay[date.getDay()];
};

let FeatureHeatmap = function(el) {
  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.margin = {'top': 10,'bottom': 10, 'left': 40, 'right': 10};

  this.container = this.svg.append('g').attr('transform', 'translate(' + [this.margin.left, this.margin.top] + ')');
};

FeatureHeatmap.prototype.setData = function(dataFeatureError){
  this.featureData = dataFeatureError['value'];
  this.renderHeatmap();
};

FeatureHeatmap.prototype.sortStation = function(stationAQList){
  let hkStationSet = new Set(hkStationList);
  let hkStationRoadSet = new Set(hkStationRoadList);

  let hkStation = [];
  let pearlDeltaStation = [];
  stationAQList.forEach(d=>{
    let key = d['id'];
    if( key === 'timestamp' ) return;

    if( hkStationRoadSet.has(key) ) hkStation.unshift(key);
    else if ( hkStationSet.has(key) ) hkStation.push(key);
    else pearlDeltaStation.push(key);
  });

  this.stationAQList = hkStation;
  this.stationAQListPearlDelta = pearlDeltaStation;
};

FeatureHeatmap.prototype.renderHeatmap = function(){
  let _this = this;
  this.initScale();
  this.svg.selectAll('.row').remove();
  let aqList = this.showPearlDelta? this.stationAQList.concat(this.stationAQListPearlDelta): this.stationAQList;

  // Row container
  let rowContainer = this.container
    .selectAll('.row')
    .data(aqList)
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform',(d, i) => {
      let gap = (i >= hkStationList.length)? lengthStationGap: 0;
      return 'translate('+[0, _this.rowHeight * i + gap] + ')'
    })
    .each(function(stationId) {
      _this.generateNewCells(this, stationId);
    });

  this.renderGradientLegend();
};

FeatureHeatmap.prototype.initScale = function() {
  this.rowHeight = this.svgHeight - this.margin.top - this.margin.bottom*2 - lengthStationGap;
  this.unitWidth = this.svgWidth - this.margin.left - this.margin.right;
  if ( this.showPearlDelta ) {
    this.rowHeight /= (this.stationAQList.length+this.stationAQListPearlDelta.length);
    this.unitWidth = this.rowHeight;
  } else {
    this.rowHeight /= this.stationAQList.length;
    this.unitWidth /= this.featureData.length;
  }

  // scale of x-axis
  let timeRange = d3.extent(this.featureData, d=>d.timestamp);
  this.xScale = d3.scaleLinear().domain(timeRange).range([0, this.svgWidth - this.margin.left - this.margin.right - this.unitWidth]);

  // Color scale
  let colorRange = d3.range(0, 1, 1.0 / (gradientColorsAbs.length - 1));
  colorRange.push(1);
  this.colorScale = d3.scaleLinear()
    .domain(colorRange)
    .range(gradientColorsAbs)
    .interpolate(d3.interpolateHcl);
  this.dataScale = d3.scaleLinear()
    .domain(gradientBoundary)
    .range([0, 1]);
};

FeatureHeatmap.prototype.generateNewCells = function (rowContainer, stationId) {
  let _this = this;

  let cell_containers = d3.select(rowContainer)
    .selectAll('.cell')
    .data(_this.featureData)
    .enter()
    .append('g')
    .attr('class', 'cell')
    .attr('transform', d => 'translate(' + [_this.xScale(d.timestamp), 0] + ')');

  let rects = cell_containers
    .append('rect')
    .attr('width', _this.unitWidth > 1?_this.unitWidth-1: _this.unitWidth)
    .attr('height', _this.rowHeight-1 > 1? _this.rowHeight-1: _this.rowHeight)
    .attr('rx', _this.unitWidth / 5)
    .attr('fill', d => {
      return (d[stationId] === null || d[stationId] === 'null')?
        '#d4d4d4':
        _this.colorScale(_this.dataScale(d[stationId]))
    })
    .attr('stroke', 'white')
    .attr('stroke-width', 1);

  rects
    .append('title')
    .text(d=>{
      let _id = stationId in hkStationDict? hkStationDict[stationId]: stationId;
      let value = (d[stationId] === null || d[stationId] === 'null')? 'Null': parseInt(d[stationId] * 100) / 100;
      return 'Id: '+ _id + ' error: ' + value + '\nTimestamp: ' + format_date(new Date(d.timestamp * 1000));
    });

  //Handle mouse event
  rects.on('mouseout', function(){
    this.setAttribute('stroke', 'white');
  });
  rects.on('mouseover', function(d){
    this.setAttribute('stroke', 'red');
    let msg = {
      'timestamp': d.timestamp,
      'stationId': stationId,
      'action': 'over'
    };
    pipeService.emitMouseOverCell(msg);
  });
  rects.on('click', function(d){
    let msg = {
      'timestamp': d.timestamp,
      'stationId': stationId,
      'action': 'click'
    };
    pipeService.emitMouseOverCell(msg);
  });
};

FeatureHeatmap.prototype.renderGradientLegend = function() {
  if ( this.gradientLegendGroup !== undefined ) return;

  this.gradientLegendGroup = this.svg.append('g')
    .attr('class', 'gradient_legend_group');

  // gradient rainbow
  let gradientLegendRainbow = this.gradientLegendGroup.append('linearGradient')
    .attr('id', 'gradient_legend_rainbow')
    .attr('x1', '0%')
    .attr('y1', '100%')
    .attr('x2', '0%')
    .attr('y2', '0%')
    .selectAll('stop')
    .data(gradientColorsAbs)
    .enter()
    .append('stop')
    .attr('offset', (d, i) => i/(gradientColorsAbs.length-1) )
    .attr('stop-color', d => d);

  // gradient Yellow-Green-Blue
  let gradientLegendYGB = this.gradientLegendGroup.append('linearGradient')
    .attr('id', 'gradient_legend_y_g_b')
    .attr('x1', '0%')
    .attr('y1', '100%')
    .attr('x2', '0%')
    .attr('y2', '0%')
    .selectAll('stop')
    .data(gradientColors)
    .enter()
    .append('stop')
    .attr('offset', (d, i) => i/(gradientColors.length-1) )
    .attr('stop-color', d => d);

  this.gradientLegendGroup.append('rect')
    .attr('transform', "translate(" + [23, 10] + ")")
    .attr('width', 15)
    .attr('height', 200)
    .style('fill', 'url(#gradient_legend_rainbow)');

  let gradientLegendScale = d3.scaleLinear()
    .domain(gradientBoundary)
    .range([200, 0]);

  let gradientLegendAxis = d3.axisLeft()
    .scale(gradientLegendScale)
    .ticks(6)
    .tickSize(0);

  this.gradientLegendGroup.append('g')
    .call(gradientLegendAxis)
    .attr('transform', "translate(" + [23, 10] + ")");
};

FeatureHeatmap.prototype.on = function(msg, func){
  if(msg === 'mouseover'){
    this.mouseover = func;
  }else if(msg === 'click'){
    this.click = func;
  }
};

export default FeatureHeatmap

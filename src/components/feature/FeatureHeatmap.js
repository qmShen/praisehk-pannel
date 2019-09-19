/**
 * Created by qshen on 17/9/2019.
 */


import * as d3 from "d3";
let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let format_date = function(date){
  let month = date.getMonth() >= 9?date.getMonth() + 1:'0' + (date.getMonth() + 1);
  let day = date.getDate() >= 10?date.getDate():'0' + date.getDate();
  let hour = date.getHours() >= 10?date.getHours():'0' + date.getHours();
  let string = date.getFullYear() + '-' + month + '-' + day + ' ' + hour +':00:00  ' + weekDay[date.getDay()];
  return string;
};


let FeatureHeatmap = function(el, featureObj) {

  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  // this.margin = {'top': 20,'bottom': 0, 'left': 0, 'right':0};
   this.margin = {'top': 20,'bottom': 20, 'left': 40, 'right':0};
  // initial data
  let _value = featureObj['value'];
  if(_value.length == 0){
    console.log('No data collected!')
    return
  }
  let _item = featureObj['value'][0];
  this.station_list = [];
  for(let key in _item){
    if(key == "timestamp") continue

    this.station_list.push(key);
  }

  this.feature = featureObj['feature'];
  this.valueArray = featureObj['value'];
  // console.log('station_ids', this.valueArray)
  this.renderHeatmap()
};
FeatureHeatmap.prototype.colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb",
  "#41b6c4", "#1d91c0", "#225ea8", "#253494",
  "#081d58"];

FeatureHeatmap.prototype.renderHeatmap = function(start_time, end_time){
  // Hard code
  let _this = this;

  this.stationTimeMap = {};

  let rowHeight = (this.svgHeight - this.margin['top'] - this.margin['bottom']) / this.station_list.length;
  let unitWidth = rowHeight;
  // hard code

  start_time = start_time == undefined ?this.valueArray[0].timestamp: start_time;
  end_time = end_time == undefined ? this.valueArray[parseInt(this.svgWidth / unitWidth)].timestamp: end_time;
  this.svg.selectAll('g').remove();
  this.container = this.svg.append('g').attr('transform', 'translate(' + [this.margin.left, 0]+')');

  let rowContainer = this.container.selectAll('.row').data(this.station_list).enter().append('g').attr('class', 'row')
    .attr('transform',(d, i) => 'translate('+[0,rowHeight * i] + ')');


  let renderList = [];
  this.valueArray.forEach((d,i)=>{
    if(d.timestamp > start_time && d.timestamp < end_time){
      renderList.push(d)
    }
  });

  let _maxArray = [];
  this.station_list.forEach(station_id=>{
    _maxArray.push(d3.max(this.valueArray, d=>d[station_id]));
  });

  let maxFeaturValue = d3.max(_maxArray);

  let timeRange = d3.extent(renderList, d=>d['timestamp']);

  let xScale = d3.scaleLinear().domain(timeRange).range([0, _this.svgWidth - _this.margin['right'] - _this.margin.left]);


  let colorBucketes = this.colors.length;
  let domain = []
  if(this.feature == 'PM25'){
    domain = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
    maxFeaturValue = 100;
  }else if(this.feature == 'wind'){
    domain = [0,2,4,6,8,10,12,14,16]
    maxFeaturValue = 10;
  }else if(this.feature == 'windDir'){
    domain = [18,36,54,72,90,108,126,144,162]
    maxFeaturValue = 180;
  }
  let colorScale = d3.scaleQuantile()
    // .domain([0, colorBucketes - 1, maxFeaturValue])
    .domain(domain)
    .range(this.colors);


  rowContainer.each(function(stationId){

    let _container = d3.select(this);
    if(_this.stationTimeMap[stationId] == undefined){
      _this.stationTimeMap[stationId] = {}
    }
    // _container.append('rect').attr('width', _this.svgWidth).attr('height', rowHeight).attr('stroke', 'red').attr('fill', 'none').attr('stroke-width', 0.3);

    let featureRange = d3.extent(renderList, d=>d[stationId]);


    let cell_containers = _container.selectAll('.cell').data(renderList).enter().append('g').attr('class', 'cell')
      .attr('transform', d => 'translate(' + [xScale(d.timestamp), 0] + ')')

    cell_containers.each(function(d){
      _this.stationTimeMap[stationId][d.timestamp] = this;
    });
    let rects = cell_containers.append('rect')
      .attr('width',unitWidth)
      .attr('height', rowHeight)
      .attr('fill', d=>{
        if(d[stationId] == 'null' || d[stationId] == null){
          return '#d4d4d4'
        }
        return colorScale(d[stationId]);
      })
      .attr('rx', unitWidth / 5)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    rects.append('title').text(d=>{
      let value = d[stationId];
      if(d[stationId] == null || d[stationId] == 'null'){
        value = 'Null'
      }
      else{
        value = parseInt(value * 100) / 100;
      }
      return 'Id: '+ stationId + ' error: ' + value + '\n timestamp: ' + format_date(new Date(d.timestamp * 1000));
    });
    rects.on('mouseover', function(d){
      _this.mouseover({
        'timestamp': d.timestamp,
        'stationId': stationId
      });
    });
    rects.on('mouseout', function(d){
      _this.mouseout({
        'timestamp': d.timestamp,
        'stationId': stationId
      });
    });
    rects.on('click', function(d){
      _this.click({
        'timestamp': d.timestamp,
        'stationId': stationId
      })
    })
  })
};

FeatureHeatmap.prototype.on = function(msg, func){
  if(msg == 'mouseover'){
    this.mouseover = func;
  }else if(msg == 'mouseout'){
    this.mouseout = func;
  }else if(msg == 'click'){
    this.click = func;
  }

};

FeatureHeatmap.prototype.onMouseInter = function(msg){
  let timestamp = msg['timestamp'];
  let stationId = msg['stationId'];
  let element = this.stationTimeMap[stationId][timestamp];

  if(msg['action'] == 'over'){
    d3.select(element).select('rect').attr('stroke', 'red');
    // element.parentNode.appendChild(element);
    // element.parentNode.parentNode.appendChild(element.parentNode);
  }else if(msg['action'] == 'out'){
    d3.select(element).select('rect').attr('stroke', 'white');
  }
};

FeatureHeatmap.prototype.updateByTimeRange = function(timeRange){
  this.renderHeatmap(timeRange[0], timeRange[1]);
}




export default FeatureHeatmap

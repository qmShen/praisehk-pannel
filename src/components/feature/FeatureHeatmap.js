/**
 * Created by qshen on 17/9/2019.
 */


import * as d3 from "d3";

let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let HongKongStationList = [67, 68, 70, 74, 77, 78, 79, 80, 81, 82, 83, 84, 85, 87, 89, 90];
let HongKongStationMap = {};
HongKongStationList.forEach(d=>HongKongStationMap[d] = true);

let format_date = function(date){
  let month = date.getMonth() >= 9?date.getMonth() + 1:'0' + (date.getMonth() + 1);
  let day = date.getDate() >= 10?date.getDate():'0' + date.getDate();
  let hour = date.getHours() >= 10?date.getHours():'0' + date.getHours();
  let string = date.getFullYear() + '-' + month + '-' + day + ' ' + hour +':00:00  ' + weekDay[date.getDay()];
  return string;
};

let FeatureHeatmap = function(el,featureObj) {

  this.$el = el;
  this.svgWidth = this.$el.clientWidth ;
  this.svgHeight = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg').attr('width', this.svgWidth).attr('height', this.svgHeight);
  this.stationGap = 10;
  this.margin = {'top': 35,'bottom': 10, 'left': 40, 'right':0};
  // initial data
  this.update(featureObj);

  this.HongKongSatationIdMap = {};
};

FeatureHeatmap.prototype.update = function(featureObj){
  let _value = featureObj['value'];
  if(_value.length == 0){
    console.log('No data collected!')
    return
  }
  let _item = featureObj['value'][0];
  this.station_list = [];
  let HongKongStation = [];
  let OtherStation = [];
  for(let key in _item){
    if(key == "timestamp") continue
    if(HongKongStationMap[key] == true){
      HongKongStation.push(key)
    }else{
      OtherStation.push(key)
    }
  }
  this.station_list = HongKongStation.concat(OtherStation);
  this.feature = featureObj['feature'];
  this.valueArray = featureObj['value'];

  console.log('featureObject', featureObj);

  // console.log('station_ids', this.valueArray)
  this.HongKongSatationIdMap = {};
  if(this.feature == 'PM25'){
    HongKongStationList.forEach(d=>{
      this.HongKongSatationIdMap[d] = true;
    })
  }

  this.renderHeatmap()
};

FeatureHeatmap.prototype.colors = [
  "#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb",
  "#41b6c4", "#1d91c0", "#225ea8", "#253494",
  "#081d58"
];

FeatureHeatmap.prototype.renderHeatmap = function(valueArray){
  // Hard code

  let _this = this;
  this.stationTimeMap = {};
  this.stationMap = {};
  let rowHeight = (this.svgHeight - this.margin['top'] - this.margin['bottom'] - this.stationGap - 25) / this.station_list.length;
  let unitWidth = rowHeight;
  // hard code

  // start_time = start_time == undefined ?this.valueArray[0].timestamp: start_time;
  // end_time = end_time == undefined ? this.valueArray[parseInt(this.svgWidth / unitWidth)].timestamp: end_time;
  this.svg.selectAll('g').remove();
  this.container = this.svg.append('g').attr('transform', 'translate(' + [this.margin.left, this.margin.top ]+')');


  valueArray = valueArray == undefined ? this.valueArray : valueArray;
  let rowContainer = this.container.selectAll('.row').data(this.station_list).enter().append('g').attr('class', 'row')
    .attr('transform',(d, i) => {
      let gap = i >= HongKongStationList.length?10:0
      return 'translate('+[0,rowHeight * i + gap] + ')'
    });

  let renderList = [];
  if(valueArray == undefined) return
  valueArray.forEach((d,i)=>{
    // if(d.timestamp > start_time && d.timestamp < end_time){
    //   renderList.push(d)
    // }
    renderList.push(d)
  });

  let _maxArray = [];
  this.station_list.forEach(station_id=>{
    _maxArray.push(d3.max(valueArray, d=>d[station_id]));
  });

  let maxFeaturValue = d3.max(_maxArray);

  let timeRange = d3.extent(renderList, d=>d['timestamp']);

  let xScale = d3.scaleLinear().domain(timeRange).range([0, _this.svgWidth - _this.margin['right'] - _this.margin.left - 10]);


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


  rowContainer.each(function(stationId, row_i){
    let _container = d3.select(this);

    if(_this.HongKongSatationIdMap[stationId] == true){
      _container.append('circle').attr('cx', -1 * 1 * unitWidth).attr('cy', unitWidth / 2).attr('r',unitWidth / 3).attr('fill','grey')
    }

    if(_this.stationTimeMap[stationId] == undefined){
      _this.stationTimeMap[stationId] = {}
    }
    let featureRange = d3.extent(renderList, d=>d[stationId]);
    let cell_containers = _container.selectAll('.cell').data(renderList).enter().append('g').attr('class', 'cell')
      .attr('transform', d => 'translate(' + [xScale(d.timestamp), 0] + ')')

    cell_containers.each(function(d, col_j){
      if(_this.stationTimeMap[stationId][d.timestamp] == undefined){
        _this.stationTimeMap[stationId][d.timestamp] = {};
      }
      let gap = row_i >= HongKongStationList.length?10:0
      _this.stationTimeMap[stationId][d.timestamp]['e'] = this;
      _this.stationTimeMap[stationId][d.timestamp]['x'] = xScale(d.timestamp);
      _this.stationTimeMap[stationId][d.timestamp]['y'] = row_i*rowHeight+gap;
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
      // return d.timestamp;
      return 'Id: '+ stationId + ' error: ' + value + '\nTimestamp: ' + format_date(new Date(d.timestamp * 1000));
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
  });

  this.HightLightRowRect = this.container.append('rect').attr('fill', 'none')
    .attr('stroke', '#fd8d3c').attr('width', this.svgWidth - this.margin['left']- this.margin['right']).attr('height', unitWidth).attr('stroke-width', 0);
  this.HightLightColumnRect = this.container.append('rect').attr('fill', 'none')
    .attr('stroke', '#fd8d3c').attr('width', unitWidth).attr('height', this.svgHeight - this.margin['top'] - this.margin['bottom']).attr('stroke-width', 0);


  let rowRects = rowContainer.append('rect').attr('fill', 'none')
    .attr('stroke', 'red').attr('width', _this.svgWidth - _this.margin['left']- _this.margin['right']).attr('height', unitWidth).attr('stroke-width', 0);
  rowRects.each(function(stationId){
    _this.stationMap[stationId] = this;
  })




  var blueColor = d3.rgb('#1f78b4')
  var yellowColor = d3.rgb('#ffffb3');
  var redColor = d3.rgb('#e41a1c');

  var computeColor = d3.interpolate(blueColor, yellowColor);
  var computeColor2 = d3.interpolate(yellowColor, redColor);
  var linearColor = d3.scaleLinear()
    .domain([0, 20])
    .range([0, 1])
  var linearColor2 = d3.scaleLinear()
    .domain([20, 40])
    .range([0, 1])


  var gradientLegendGroup = this.svg.append('g')
    .attr('class', 'gradient_legend_group')
    .attr('transform', "translate(" + this.margin['left'] + "," + 0 + ")")


  var gradientLegend = gradientLegendGroup.append('defs')
    .append('linearGradient')
    .attr('id', 'gradient_legend')
    .attr('x1', '0%') // bottom
    .attr('y1', '0%')
    .attr('x2', '100%') // to top
    .attr('y2', '0%')
    .attr('spreadMethod', 'pad')


  gradientLegend.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#ffffd9')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '10%')
    .attr('stop-color', '#edf8b1')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '20%')
    .attr('stop-color', '#c7e9b4')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '30%')
    .attr('stop-color', '#7fcdbb')
    .attr('stop-opacity', 1)


  gradientLegend.append('stop')
    .attr('offset', '40%')
    .attr('stop-color', '#41b6c4')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '50%')
    .attr('stop-color', '#1d91c0')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '60%')
    .attr('stop-color', '#225ea8')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '90%')
    .attr('stop-color', '#253494')
    .attr('stop-opacity', 1)

  gradientLegend.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#081d58')
    .attr('stop-opacity', 1)


  let test = 220
  let width = this.svgWidth/2
  let height = this.svgHeight - 50
  let height2 = this.svgHeight - 35

  gradientLegendGroup.append('rect')
    .attr('width', 180)
    .attr('height', 15)
    .style('fill', 'url(#gradient_legend)')
  // .attr('transform', "translate(" + width + "," + height + ")")

  var gradientLegendScale = d3.scaleLinear()
    .domain([100, 0])
    .range([180, 0])

  var gradientLegendAxis = d3.axisBottom()
    .scale(gradientLegendScale)
    .ticks(6)

  gradientLegendGroup.append('g')
    .attr('class', 'gradient legend axis')
    .attr('transform', "translate(" + 0 + "," + 15 + ")")
    .call(gradientLegendAxis)
    .append('text')
    .attr('transform', 'rotate(90)')
    .attr('y', 0)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('axis title')
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
  let dataObj = this.stationTimeMap[stationId][timestamp]
  if(dataObj == undefined){
    return
  }
  // let element = dataObj['e'];
  // for(let key in this.stationMap){
  //   d3.select(this.stationMap[key]).attr('stroke-width', 0.0);
  // }
  // d3.select(this.stationMap[stationId]).attr('stroke-width', 0.5);

  // this.HightLightRowRect.attr('y', dataObj['y']).attr('stroke-width', 0.5);
  // this.HightLightColumnRect.attr('x', dataObj['x']).attr('stroke-width', 0.5);

  let element = dataObj['e'];
  if(msg['action'] == 'over'){
    d3.select(element).select('rect').attr('stroke', 'red');
  }else if(msg['action'] == 'out'){
    d3.select(element).select('rect').attr('stroke', 'white');
  }

};

FeatureHeatmap.prototype.clickToSelect = function(msg){
  let timestamp = msg['timestamp'];
  let stationId = msg['stationId'];
  let dataObj = this.stationTimeMap[stationId][timestamp];
  if(dataObj == undefined){
    return
  }
  this.HightLightRowRect.attr('y', dataObj['y']).attr('stroke-width', 0.5);
};

FeatureHeatmap.prototype.updateByTimeRange = function(timeRange){
  // this.renderHeatmap(timeRange[0], timeRange[1]);
};

export default FeatureHeatmap

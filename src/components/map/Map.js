/**
 * Created by qshen on 15/8/2019.
 */

import L from "leafLet"
import * as d3 from "d3";
import 'leaflet/dist/leaflet.css'
let HongKongStationList = [67, 68, 70, 74, 77, 78, 79, 80, 81, 82, 83, 84, 85, 87, 89, 90];
let Map = function(el, el_svg, ceneterLoc, featureType) {
  this.map = L.map(el, { zoomControl:false }).setView(ceneterLoc.loc, 9);
  this.featureType = featureType;
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 24,
    id: 'mapbox.light'
  }).addTo(this.map);

  L.circle(ceneterLoc.loc, 100, {
    color: 'steelblue',
    fillColor: '#f03',
    fillOpacity: 0.5
  }).addTo(this.map);

  this.svg = d3.select('#' + el_svg);
  this.signLoadData = false;
  this.initializeVisualization();

  this.HongKongSatationIdMap = {};
  if(this.featureType == "AQ"){
    HongKongStationList.forEach(d=>{
      this.HongKongSatationIdMap[d] = true
    })
  }
};

Map.prototype.focus = function(loc){
  this.map.setView(loc, this.map.getZoom());
  this.update_visualization();
};

Map.prototype.mouseoverCircle = function(msg){
  if(this.featureType == 'AQ'){
    this.showAQCMAQ(msg);
  }else if(this.featureType == 'Mete'){
    this.showMeteWRF(msg);
  }
};

Map.prototype.setCurrentTimestamp = function(msg){
  if(this.featureType == 'AQ'){
    this.showAQCMAQ(msg);
  }else if(this.featureType == 'Mete'){
    this.showMeteWRF(msg);
  }

};
Map.prototype.mouseoutCircle = function(msg){
  // if(this.idMap[msg.stationId]){
  //   d3.select(this.idMap[msg.stationId]['render']['stationCircle']).attr('stroke', 'none')
  // }
};
Map.prototype.initializeVisualization = function(){
  let aqSizeScale = d3.scaleLinear().domain([0, 150]).range([0, 400]);
  this.aqSizeScale = function(val){
    return Math.sqrt(aqSizeScale(val))
  };
  let windScale = d3.scaleLinear().domain([0, 10]).range([0, 70]);
  this.windScale = windScale;

  if ( this.featureType == 'AQ') {
    let valuesToShow = [50, 150];
    let size = this.aqSizeScale;
    let xCircle = 30;
    let yCircle = 30;
    let xLabel = 60;

    // Add legend: circles
    this.legend = this.svg.selectAll('.legend').data(valuesToShow).enter().append('g').attr('class', 'legend');
    this.legend.append('circle')
      .attr("cx", xCircle).attr("cy", yCircle).attr("r", size)
      .attr('fill', 'None').attr('stroke', 'black');

    // Add legend: segments
    this.legend.append("line")
      .attr('x1', xCircle).attr('x2', xLabel).attr('y1', function(d){ return yCircle - size(d) }).attr('y2', function(d){ return yCircle - size(d) })
      .attr('stroke', 'black').style('stroke-dasharray', ('2,2'));

    // Add legend: labels
    this.legend.append("text")
      .attr('x', xLabel + 2).attr('y', function(d){ return yCircle - size(d) })
      .text(function(d){ return d }).style("font-size", 10).attr('alignment-baseline', 'middle');
  } else if ( this.featureType == 'Mete' ) {
    let valuesToShow = [5, 10];
    let size = this.windScale;
    let xCircle = 10;
    let yCircle = 15;

    // Add legend: line
    this.legend = this.svg.selectAll('.legend').data(valuesToShow).enter().append('g').attr('class', 'legend');
    this.legend.append("line")
      .attr('x1', xCircle).attr('x2', function(d){ return xCircle + size(d) }).attr('y1', yCircle).attr('y2', yCircle)
      .attr('stroke', 'black').attr('stroke-width', 1.7);
    this.legend.append("line")
      .attr('x1', function(d){ return xCircle + size(d) }).attr('x2', function(d){ return xCircle + size(d) })
      .attr('y1', yCircle).attr('y2', yCircle - 5)
      .attr('stroke', 'black').attr('stroke-width', 1);

    // Add legend: labels
    this.legend.append("text")
      .attr('x', function(d){return xCircle - 5 + size(d)}).attr('y', yCircle - 10)
      .text(function(d){ return d }).style("font-size", 10).attr('alignment-baseline', 'middle');
  }
};
Map.prototype.showAQCMAQ = function(msg){
  let timestamp = msg['timestamp'];
  if(this.timeStationMapAQ == undefined ||this.timeStationMapCMAQ == undefined){
    return;
  }
  let AQData = this.timeStationMapAQ[timestamp];
  let CMAQData = this.timeStationMapCMAQ[timestamp];
  if(AQData == undefined || CMAQData == undefined){
    return
  }
  for(let id in this.idMap){
    this.visualizeCMAQAQunit(id, AQData[id], CMAQData[id]);
  }
};

let valid = function(d){
  if(d != undefined && d != null && d != 'null'){
    return true
  }else{
    return false
  }
};

Map.prototype.on = function(msg, func){
  if(msg == 'click'){
    this.clickOnStation = func;
  }
};

Map.prototype.loadStations = function(stations){
  /*
  * Load air quality station information
  * Parameters:
  * stations: List[{latitude, longitude, id}]
  * */
  let _this = this;
  this.stations = stations;
  /*
  * idMap: station_id => station data
  * loc.render: the visual element(leaflet or d3 element)
  * */
  this.idMap = {};
  this.stations.forEach(d=>{
    if(d['render'] == undefined){
      d['render'] = {};
    }
    d['render']['screen_loc'] = this.map.latLngToContainerPoint([d.latitude, d.longitude]);
    this.idMap[d.id] = d;
  });

  /*
  * Initialize the svg elements
  * */
  this.stationsContainers = this.svg.selectAll('.station_point').data(this.stations).enter().append('g').attr('class', 'station_point');
  this.stationsContainers.each(function(d){
    d['render']['svg_container'] = this;
  });

  let color = this.featureType == 'AQ'? '#ff5b0d': "#2ca25f";
  this.color = color;

  let stationCircles = this.stationsContainers.append('circle')
    .attr('fill', color).attr('fill-opacity', 0.4)
    .attr('stroke', color)
    .attr('stroke-width', 1);
  stationCircles.each(function(d){
    d['render']['stationCircle'] = this;
  });


  if(this.featureType == 'AQ'){
    let CMAQCircles = this.stationsContainers.append('circle').attr('class', 'CMAQCircles').attr('r', 0)
      .attr('fill', '#479886').attr('stroke', '#479886').attr('stroke-width', 0.5).attr('stroke', 'white')
    CMAQCircles.each(function(d){
      d['render']['CMAQCircle'] = this;
    });
    let AQCircles = this.stationsContainers.append('circle').attr('class', 'AQCircles').attr('r', 0)
      .attr('fill', '#d77451').attr('stroke', '#d77451').attr('stroke-width', 0.5).attr('stroke', 'white')
    AQCircles.each(function(d){
      d['render']['AQCircle'] = this;
    });
  }else if(this.featureType == 'Mete'){
    let WindLines = this.stationsContainers.append("line")
      .style("stroke", '#d77451').attr('stroke-width', 1.7)
      .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);

    let WindWRFLines = this.stationsContainers.append("line")
      .style("stroke", '#479886').attr('stroke-width', 1.7)
      .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);

    let WindArcs = this.stationsContainers.append("path").attr('fill', 'none').attr('stroke', 'grey');
    WindLines.each(function(d){
      d['render']['WindLine'] = this;
    });
    WindWRFLines.each(function(d){
      d['render']['WindWRFLine'] = this;
    });
    WindArcs.each(function(d){
      d['render']['WindArc'] = this;
    });
  }


  /*
  * Initialize visualization, by the initial center and scale
  * */
  this.update_visualization();
  /*
  * Update the visualization, when the center and scale of map are changed
  * */
  this.map.on('move', (e)=>{
    // this.previousZoomLevel = this.zoomLevel
    this.update_visualization();
  });
  if(this.featureType == 'AQ'){
    let valuesToShow = [10, 50, 150];
    let size = this.aqSizeScale;
    let xCircle = 30;
    let yCircle = 30;
    let xLabel = 60;

    // Add legend: circles
    this.legend = this.svg.selectAll('.legendAQ').data(valuesToShow).enter().append('g').attr('class', 'legendAQ');
    this.legend.append('circle')
      .attr("cx", xCircle).attr("cy", yCircle).attr("r", size)
      .attr('fill', 'None').attr('stroke', 'grey').attr('stroke-width', 1.5)

    // Add legend: segments
    this.legend.append("line")
      .attr('x1', xCircle).attr('x2', xLabel).attr('y1', function(d){ return yCircle - size(d) }).attr('y2', function(d){ return yCircle - size(d) })
      .attr('stroke', 'black').style('stroke-dasharray', ('2,2'));

    // Add legend: labels
    this.legend.append("text")
      .attr('x', xLabel + 2).attr('y', function(d){ return yCircle - size(d) })
      .text(function(d){ return d }).style("font-size", 10).attr('alignment-baseline', 'middle');
  }else if (this.featureType == 'Mete') {
    let valuesToShow = [5, 10, 15];
    let size = this.windScale;
    let xCircle = 10;
    let yCircle = 15;

    // Add legend: line
    this.legend = this.svg.selectAll('.legend').data(valuesToShow).enter().append('g').attr('class', 'legend');
    this.legend.append("line")
      .attr('x1', xCircle).attr('x2', function(d){ return xCircle + size(d) }).attr('y1', yCircle).attr('y2', yCircle)
      .attr('stroke', 'grey').attr('stroke-width', 1.7);
    this.legend.append("line")
      .attr('x1', function(d){ return xCircle + size(d) }).attr('x2', function(d){ return xCircle + size(d) })
      .attr('y1', yCircle).attr('y2', yCircle - 5)
      .attr('stroke', 'grey').attr('stroke-width', 1);

    // Add legend: labels
    this.legend.append("text")
      .attr('x', function(d){return xCircle - 5 + size(d)}).attr('y', yCircle - 10)
      .text(function(d){ return d }).style("font-size", 10).attr('alignment-baseline', 'middle');
  }
};


Map.prototype.update_visualization = function(action_type) {
  /*
  * Update the visual encoding map scale and center location
  * */
  this.zoomLevel = this.map.getZoom();
  let max_r = 30;
  let min_r = 1;
  let r = 0;
  if(this.zoomLevel > 11){
    r = max_r;
  }else{
    r = (max_r - min_r) / (11 - 1) * this.zoomLevel / 6;
  }
  this.stations.forEach(d=>{
    // Calculate the screen coordinate by map latlng to x, y
    d['render']['screen_loc'] = this.map.latLngToContainerPoint([d.latitude, d.longitude]);
    this.visualize_unit(d['render']['svg_container'], r, action_type);
  });
  this.stationsContainers.attr('transform', d=>'translate(' + [d['render']['screen_loc'].x, d['render']['screen_loc'].y] + ')');
};

Map.prototype.visualize_unit = function(container, r, action_type){ //this.color
  let _container = d3.select(container);
  _container.select('circle').attr('r', 2).attr('class', 'station').attr('fill', 'none').attr('opacity', 0.4);
};



Map.prototype.loadAQFeatureValue = function(data){
  let start_time = new Date();
  let timeStationMapAQ = {};
  data.forEach(function(d){
    let t = d['timestamp'];
    if(timeStationMapAQ[t] == undefined || timeStationMapAQ[t] == null || timeStationMapAQ[t] == "null" ){
      timeStationMapAQ[t] = {}
    }
    for(let key in d){
      let val = d[key];
      timeStationMapAQ[t][key] = val;
    }
  });
  this.timeStationMapAQ = timeStationMapAQ;
};

Map.prototype.loadCMAQValue = function(data){
  let start_time = new Date();
  let timeStationMapCMAQ = {};
  data.forEach(function(d){
    let t = d['timestamp'];
    if(timeStationMapCMAQ[t] == undefined || timeStationMapCMAQ[t] == null || timeStationMapCMAQ[t] == "null" ){
      timeStationMapCMAQ[t] = {}
    }
    for(let key in d){
      let val = d[key];
      timeStationMapCMAQ[t][key] = val;
    }
  });
  this.timeStationMapCMAQ = timeStationMapCMAQ;
};
/*
* Used in the air quality map
*
* */
Map.prototype.visualizeCMAQAQunit = function(id, aqValue, CMAQValue){

  let container = d3.select(this.idMap[id]['render']['svg_container']);

  let strokeColor = (valid(aqValue) == true && valid(CMAQValue) == true) ? "white": "black";
  if(aqValue != undefined && aqValue != null && aqValue != 'null'){

    let element = d3.select(this.idMap[id]['render']['AQCircle']);

    element.transition().attr('r', this.aqSizeScale(aqValue)).attr('stroke', strokeColor);//.attr('fill', '#d77451').attr('stroke', '#d77451')
    let circleElement = this.idMap[id]['render']['AQCircle'];
    if(valid(CMAQValue) && aqValue < CMAQValue){
      circleElement.parentNode.appendChild(circleElement);
    }
  }else{
    d3.select(this.idMap[id]['render']['AQCircle']).attr('r', 0).attr('stroke-width', 1);
  }
  if(CMAQValue != undefined && CMAQValue != null && CMAQValue != 'null'){
    let element = d3.select(this.idMap[id]['render']['CMAQCircle']);
    element.transition().attr('r', this.aqSizeScale(CMAQValue)).attr('stroke', strokeColor)//.attr('fill', '#479886').attr('stroke', '#479886')
    let circleElement = this.idMap[id]['render']['CMAQCircle'];
    if(valid(CMAQValue) && aqValue > CMAQValue){
      circleElement.parentNode.appendChild(circleElement);
    }
  }else{
    d3.select(this.idMap[id]['render']['CMAQCircle']).attr('r', 0).attr('stroke-width', 1);
  }
};


Map.prototype.loadWindValue = function(data){
  let start_time = new Date();
  let timeStationMapWind = {};
  data.forEach(function(d){
    let t = d['timestamp'];
    if(!valid(timeStationMapWind[t])){
      timeStationMapWind[t] = {}
    }
    for(let key in d){
      let val = d[key];
      timeStationMapWind[t][key] = val;
    }
  });
  this.timeStationMapWind = timeStationMapWind;
};

Map.prototype.loadWindDirValue = function(data){
  let start_time = new Date();
  let timeStationMapWindDir = {};
  data.forEach(function(d){
    let t = d['timestamp'];
    if(!valid(timeStationMapWindDir[t])){
      timeStationMapWindDir[t] = {}
    }
    for(let key in d){
      let val = d[key];
      timeStationMapWindDir[t][key] = val;
    }
  });
  this.timeStationMapWindDir = timeStationMapWindDir;
};

Map.prototype.loadWindWRFValue = function(data){
  let start_time = new Date();
  let timeStationMapWindWRF = {};
  data.forEach(function(d){
    let t = d['timestamp'];
    if(!valid(timeStationMapWindWRF[t])){
      timeStationMapWindWRF[t] = {}
    }
    for(let key in d){
      let val = d[key];
      timeStationMapWindWRF[t][key] = val;
    }
  });
  this.timeStationMapWindWRF = timeStationMapWindWRF;
};

Map.prototype.loadWindDirWRFValue = function(data){
  let start_time = new Date();
  let timeStationMapWindDirWRF = {};
  data.forEach(function(d){
    let t = d['timestamp'];
    if(!valid(timeStationMapWindDirWRF[t])){
      timeStationMapWindDirWRF[t] = {}
    }
    for(let key in d){
      let val = d[key];
      timeStationMapWindDirWRF[t][key] = val;
    }
  });
  this.timeStationMapWindDirWRF = timeStationMapWindDirWRF;
};


Map.prototype.showMeteWRF = function(msg){
  if(this.timeStationMapWind == undefined ||this.timeStationMapWindDir == undefined ||this.timeStationMapWindWRF == undefined ||this.timeStationMapWindDirWRF == undefined){
    return
  }
  let timestamp = msg['timestamp'];
  let WindData = this.timeStationMapWind[timestamp];
  let WindDirData = this.timeStationMapWindDir[timestamp];
  let WindWRFData = this.timeStationMapWindWRF[timestamp];
  let WindDirWRFData = this.timeStationMapWindDirWRF[timestamp];
  if(WindData == undefined || WindDirData == undefined || WindWRFData == undefined || WindDirWRFData == undefined){
    // should render None
    for(let id in this.idMap){
      this.visualizeNothing(id);
    }
    return
  }
  for(let id in this.idMap){
    this.visualizeWindDirUnit(id, WindData[id], WindDirData[id], WindWRFData[id], WindDirWRFData[id]);
  }
};
Map.prototype.visualizeNothing = function(id){
  let container = d3.select(this.idMap[id]['render']['svg_container']);
  var arc = d3.arc()
    .outerRadius(0)
    .innerRadius(0)
    .startAngle(0)
    .endAngle(0);

  d3.select(this.idMap[id]['render']['WindArc']).attr("d", arc).attr('fill-opacity', 0).attr('stroke-opacity', 0);
  d3.select(this.idMap[id]['render']['WindArc']).transition().attr('fill-opacity', 0.5).attr('stroke-opacity', 0.5);
  d3.select(this.idMap[id]['render']['WindLine']).transition()
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0);

  d3.select(this.idMap[id]['render']['WindWRFLine']).transition()
    .attr("x1", 0)
    .attr("y1",0)
    .attr("x2", 0 )
    .attr("y2", 0);

};
Map.prototype.visualizeWindDirUnit = function(id, windData, windDirData, windWRFData, windDirWRFData){
  let container = d3.select(this.idMap[id]['render']['svg_container']);

  //windData, windDirData, windWRFData, windDirWRFData
  if(valid(windData) && valid(windDirData) && valid(windWRFData) && valid(windDirWRFData)){

    d3.select(this.idMap[id]['render']['WindArc']);
    let lWRF = this.windScale(windWRFData);
    let lWind = this.windScale(windData);
    let _windDir = (windDirData ) % 360;
    let _windWRFDir = (windDirWRFData) % 360;
    let _startAngle = null;
    let _endAngle = null;

    let outer = 0;
    let inner = 0;
    let color =  null;
    if(lWRF > lWind){
      outer = lWRF;
      inner = lWind;
      color = '#479886';
    }else{
      outer = lWind;
      inner = lWRF;
      color = '#d77451';
    }

    if(_windDir>_windWRFDir){
      _startAngle = _windWRFDir;
      _endAngle = _windDir;
    }else{
      _startAngle = _windDir;
      _endAngle = _windWRFDir;
    }

    if(_endAngle - _startAngle > 180){
      _endAngle = _endAngle - 360;
    }
    let startAngle = _startAngle  / 180 * Math.PI;
    let endAngle = _endAngle  / 180 * Math.PI;

    var arc = d3.arc()
      .outerRadius(outer)
      .innerRadius(inner)
      .startAngle(startAngle)
      .endAngle(endAngle);

    d3.select(this.idMap[id]['render']['WindArc']).attr("d", arc).attr('fill', color).attr('fill-opacity', 0).attr('stroke', color).attr('stroke-opacity', 0);
    d3.select(this.idMap[id]['render']['WindArc']).transition().attr('fill-opacity', 0.5).attr('stroke-opacity', 0.5);


    let l = this.windScale(windData);
    let radius = l;

    let direction_pi = (windDirData - 90)  / 180 * Math.PI;

    d3.select(this.idMap[id]['render']['WindLine']).transition()
      .attr("x1", 0)
      .attr("y1",0)
      .attr("x2", _=>{
        return 0 + radius * Math.cos(direction_pi)
      })
      .attr("y2", 0 + radius * Math.sin(direction_pi))

    l = this.windScale(windWRFData);
    radius = l;
    direction_pi = (windDirWRFData - 90) / 180 * Math.PI;
    d3.select(this.idMap[id]['render']['WindWRFLine']).transition()
      .attr("x1", 0)
      .attr("y1",0)
      .attr("x2", 0 + radius * Math.cos(direction_pi))
      .attr("y2", 0 + radius * Math.sin(direction_pi))
  }else{
    this.visualizeNothing(id);
  }

  // if(valid(windData) && valid(windDirData)){
  //   let l = this.windScale(windData);
  //   let radius = l;
  //
  //   let direction_pi = (windDirData + 90)  / 180 * Math.PI;
  //
  //   d3.select(this.idMap[id]['render']['WindLine']).transition()
  //     .attr("x1", 0)
  //     .attr("y1",0)
  //     .attr("x2", _=>{
  //       return 0 + radius * Math.cos(direction_pi)
  //     })
  //     .attr("y2", 0 + radius * Math.sin(direction_pi))
  // }else{
  // }
  //
  // if(valid(windWRFData) && valid(windDirWRFData)){
  //   let l = this.windScale(windWRFData);
  //   let radius = l;
  //   let direction_pi = (windDirWRFData + 90) / 180 * Math.PI;
  //   d3.select(this.idMap[id]['render']['WindWRFLine']).transition()
  //     .attr("x1", 0)
  //     .attr("y1",0)
  //     .attr("x2", 0 + radius * Math.cos(direction_pi))
  //     .attr("y2", 0 + radius * Math.sin(direction_pi))
  // }else{
  //
  // }
};

export default Map

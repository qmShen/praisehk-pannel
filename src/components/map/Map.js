/**
 * Created by qshen on 15/8/2019.
 */

import L from "leafLet"
import * as d3 from "d3";
import 'leaflet/dist/leaflet.css'

let Map = function(el, el_svg, ceneterLoc, featureType) {
  // console.log('leaflet', leaflet)
  this.map = L.map(el, { zoomControl:false }).setView(ceneterLoc.loc, 8);
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

  this.initializeVisualization();
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
Map.prototype.mouseoutCircle = function(msg){
  // if(this.idMap[msg.stationId]){
  //   d3.select(this.idMap[msg.stationId]['render']['stationCircle']).attr('stroke', 'none')
  // }
};
Map.prototype.initializeVisualization = function(){
  this.aqSizeScale = d3.scaleLinear().domain([0, 150]).range([0, 20]);
  this.windScale = d3.scaleLinear().domain([0, 20]).range([0, 200]);
};
Map.prototype.showAQCMAQ = function(msg){
  let timestamp = msg['timestamp'];
  let AQData = this.timeStationMapAQ[timestamp];
  let CMAQData = this.timeStationMapCMAQ[timestamp];
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
    let CMAQCircles = this.stationsContainers.append('circle').attr('r', 0)
      .attr('fill', '#479886').attr('stroke', '#479886').attr('stroke-width', 1).attr('stroke', 'white')
    CMAQCircles.each(function(d){
      d['render']['CMAQCircle'] = this;
    });
    let AQCircles = this.stationsContainers.append('circle').attr('r', 0)
      .attr('fill', '#d77451').attr('stroke', '#d77451').attr('stroke-width', 1).attr('stroke', 'white')
    AQCircles.each(function(d){
      d['render']['AQCircle'] = this;
    });
  }else if(this.featureType == 'Mete'){
    let WindLines = this.stationsContainers.append("line")
      .style("stroke", '#479886').attr('stroke-width', 1.7)
      .attr("x1", 0).attr("y1",0).attr("x2", 0).attr("y2", 0);

    let WindWRFLines = this.stationsContainers.append("line")
      .style("stroke", '#d77451').attr('stroke-width', 1.7)
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
  console.log('AQ Feature Value', new Date() - start_time);
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
  console.log('AQ CMAQ Value', new Date() - start_time);
};
/*
* Used in the air quality map
*
* */
Map.prototype.visualizeCMAQAQunit = function(id, aqValue, CMAQValue){

  let container = d3.select(this.idMap[id]['render']['svg_container']);
  if(aqValue != undefined && aqValue != null && aqValue != 'null'){

    let element = d3.select(this.idMap[id]['render']['AQCircle'])
    element.transition().attr('r', this.aqSizeScale(aqValue))//.attr('fill', '#d77451').attr('stroke', '#d77451')
    let circleElement = this.idMap[id]['render']['AQCircle'];
    if(valid(CMAQValue) && aqValue < CMAQValue){
      circleElement.parentNode.appendChild(circleElement);
    }
  }else{
    d3.select(this.idMap[id]['render']['AQCircle']).attr('r', 0).attr('stroke-width', 1);
  }
  if(CMAQValue != undefined && CMAQValue != null && CMAQValue != 'null'){
    let element = d3.select(this.idMap[id]['render']['CMAQCircle']);
    element.transition().attr('r', this.aqSizeScale(CMAQValue))//.attr('fill', '#479886').attr('stroke', '#479886')
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
  console.log('Wind Feature Value', new Date() - start_time);
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
  console.log('WindDir Feature Value', new Date() - start_time);
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
  console.log('WindWRF Feature Value', new Date() - start_time);
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
  console.log('WindDirWRF Feature Value', new Date() - start_time);
};


Map.prototype.showMeteWRF = function(msg){

  let timestamp = msg['timestamp'];
  let WindData = this.timeStationMapWind[timestamp];
  let WindDirData = this.timeStationMapWindDir[timestamp];
  let WindWRFData = this.timeStationMapWindWRF[timestamp];
  let WindDirWRFData = this.timeStationMapWindDirWRF[timestamp];
  for(let id in this.idMap){
    this.visualizeWindDirUnit(id, WindData[id], WindDirData[id], WindWRFData[id], WindDirWRFData[id]);
  }
};

Map.prototype.visualizeWindDirUnit = function(id, windData, windDirData, windWRFData, windDirWRFData){
  let container = d3.select(this.idMap[id]['render']['svg_container']);

  //windData, windDirData, windWRFData, windDirWRFData
  if(valid(windData) && valid(windDirData) && valid(windWRFData) && valid(windDirWRFData)){
    d3.select(this.idMap[id]['render']['WindArc']);
    let lWRF = this.windScale(windWRFData);
    let lWind = this.windScale(windData);
    let _windDir = windDirData + 180;
    let _windWRFDir = windDirWRFData + 180;
    let _startAngle = null;
    let _endAngle = null;

    let outer = 0;
    let color =  null;
    if(lWRF > lWind){
      outer = lWind;
      color = '#d77451';
    }else{
      outer = lWRF;
      color = '#479886';
    }

    if(_windDir>_windWRFDir){
      _startAngle = _windWRFDir;
      _endAngle = _windDir;
    }else{
      _startAngle = _windDir;
      _endAngle = _windWRFDir;
    }

    let startAngle = _startAngle  / 180 * Math.PI;
    let endAngle = _endAngle  / 180 * Math.PI;

    if(endAngle - startAngle > 180){
      let _ = endAngle;
      endAngle = startAngle;
      startAngle = _;
    }
    var arc = d3.arc()
      .outerRadius(outer)
      .innerRadius(0)
      .startAngle(startAngle)
      .endAngle(endAngle);

    d3.select(this.idMap[id]['render']['WindArc']).attr("d", arc).attr('fill', color).attr('fill-opacity', 0.5).attr('stroke', 'none')

  }

  if(valid(windData) && valid(windDirData)){
    let l = this.windScale(windData);
    let radius = l;

    let direction_pi = (windDirData + 90)  / 180 * Math.PI;

    d3.select(this.idMap[id]['render']['WindLine']).transition()
      .attr("x1", 0)
      .attr("y1",0)
      .attr("x2", _=>{
        return 0 + radius * Math.cos(direction_pi)
      })
      .attr("y2", 0 + radius * Math.sin(direction_pi))
  }else{
  }

  if(valid(windWRFData) && valid(windDirWRFData)){
    let l = this.windScale(windWRFData);
    let radius = l;
    let direction_pi = (windDirWRFData + 90) / 180 * Math.PI;
    d3.select(this.idMap[id]['render']['WindWRFLine']).transition()
      .attr("x1", 0)
      .attr("y1",0)
      .attr("x2", 0 + radius * Math.cos(direction_pi))
      .attr("y2", 0 + radius * Math.sin(direction_pi))
  }else{

  }
};

export default Map

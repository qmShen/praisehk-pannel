/**
 * Created by qshen on 15/8/2019.
 */

import L from "leafLet"
import * as d3 from "d3";
import 'leaflet/dist/leaflet.css'

let MeteMap = function(el, el_svg, station) {
  // console.log('leaflet', leaflet)
  this.map = L.map(el, { zoomControl:false }).setView(station.location, 6);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 24,
    id: 'mapbox.light'
  }).addTo(this.map);


  L.circle(station.location, 100, {
    color: 'steelblue',
    fillColor: '#f03',
    fillOpacity: 0.5
  }).addTo(this.map).bindPopup(station.station_name);

  this.svg = d3.select('#' + el_svg);
};

MeteMap.prototype.focus = function(station_id){
  // if(this.meteIdMap[station_id] != undefined){
  //   this.meteIdMap[station_id]['e'].setStyle({color: 'yellow'});
  //   this.map.setView(this.meteIdMap[station_id].loc, 11);
  // }
};

MeteMap.prototype.highlightCircle = function(station_id){
  // if(this.meteIdMap[station_id] != undefined){
  //   this.meteIdMap[station_id]['e'].setStyle({color: 'yellow'});
  // }
};

MeteMap.prototype.removeHighlightCircle = function(station_id){
  // if(this.meteIdMap[station_id] != undefined){
  //   this.meteIdMap[station_id]['e'].setStyle({color: '#2e9fa5'});
  // }
};

MeteMap.prototype.on = function(msg, func){
  if(msg == 'click'){
    this.clickOnStation = func;
  }
};


MeteMap.prototype.loadMetestations = function(stations){
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
  this.stations_containers = this.svg.selectAll('.station_point').data(this.stations).enter().append('g').attr('class', 'station_point');

  this.stations_containers.append('circle')
    .attr('fill', '#2ca25f').attr('fill-opacity', 0.4)
    .attr('stroke', '#2ca25f')
    .attr('stroke-width', 1);

  this.stations_containers.each(function(d){
    d['render']['svg_container'] = this;
  });
  /*
  * Initialize visualization, by the initial center and scale
  * */
  this.update_visualization();
  /*
  * Update the visualization, when the center and scale of map are changed
  * */
  this.map.on('move', (e)=>{
    this.update_visualization();
  });
};


MeteMap.prototype.update_visualization = function() {
  /*
  * Update the visual encoding map scale and center location
  * */
  let zoomLevel = this.map.getZoom();
  console.log('zoom level', zoomLevel);
  let max_r = 30;
  let min_r = 1;
  let r = 0;
  if(zoomLevel > 11){
      r = max_r;
  }else{
    r = (max_r - min_r) / (11 - 1) * zoomLevel / 6;
  }
  this.stations.forEach(d=>{
    // Calculate the screen coordinate by map latlng to x, y
    d['render']['screen_loc'] = this.map.latLngToContainerPoint([d.latitude, d.longitude])
    d3.select(d['render']['svg_container']).select('circle').attr('r', r);
  });
  this.stations_containers.attr('transform', d=>'translate(' + [d['render']['screen_loc'].x, d['render']['screen_loc'].y] + ')');
};
export default MeteMap

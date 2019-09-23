/**
 * Created by qshen on 15/8/2019.
 */

/**
 * Created by qshen on 13/7/2019.
 */

import L from "leafLet"

import 'leaflet/dist/leaflet.css'

let AQMap = function(el, station) {
  // console.log('leaflet', leaflet)
  this.map = L.map(el, { zoomControl:false }).setView(station.location, 6);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 12,
    id: 'mapbox.light'
  }).addTo(this.map);



  L.circle(station.location, 100, {
    color: 'steelblue',
    fillColor: '#f03',
    fillOpacity: 0.5
  }).addTo(this.map).bindPopup(station.station_name);


};


AQMap.prototype.focus = function(station_id){
  if(this.meteIdMap[station_id] != undefined){
    this.meteIdMap[station_id]['e'].setStyle({color: 'yellow'});
    this.map.setView(this.meteIdMap[station_id].loc, 9);
  }
};

AQMap.prototype.highlightCircle = function(station_id){
  if(this.meteIdMap[station_id] != undefined){
    this.meteIdMap[station_id]['e'].setStyle({color: 'yellow'});
  }
};

AQMap.prototype.removeHighlightCircle = function(station_id){
  if(this.meteIdMap[station_id] != undefined){
    this.meteIdMap[station_id]['e'].setStyle({color: '#2e9fa5'});
  }
};

AQMap.prototype.on = function(msg, func){
  if(msg == 'click'){
    this.clickOnStation = func;
  }
};

AQMap.prototype.set_region_data = function(testPoints){
  let _this = this;

  this.meteIdMap = {};
  testPoints.forEach((loc,i)=>{
    let element1= L.circle([loc['latitude_aq'], loc['longitude_aq']], 1300, {
      color: '#ff5b0d',
      fillColor: '#ff5b0d',
      fillOpacity: 0.2
    }).addTo(this.map).bindPopup(loc.aq_loc_id + ',' + loc.mete_loc_id + ' AQ');

    element1.on("click", (e) =>{
      _this.clickOnStation(e.target.aq_loc_id);
    });

    let element = L.circle([loc['latitude_mete'], loc['longitude_mete']], 1300, {
      color: '#2e9fa5',
      fillColor: '#2e9fa5',
      fillOpacity: 0.2
    }).addTo(this.map).bindPopup(loc.aq_loc_id + ',' + loc.mete_loc_id + ' Mete');

    element['aq_loc_id'] = loc.aq_loc_id;

    this.meteIdMap[loc.aq_loc_id] = {
      e: element,
      loc: [loc['latitude_aq'], loc['longitude_aq']]
    };

    element.on("click",(e)=>{
      _this.clickOnStation(e.target.aq_loc_id);
    });

    var latlngs = [
      [loc['latitude_mete'], loc['longitude_mete']],
      [loc['latitude_aq'], loc['longitude_aq']]
    ];
    var polyline = L.polyline(latlngs, {color: '#4ba507'}).addTo(this.map);

  })

};


export default AQMap

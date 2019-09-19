/**
 * Created by qshen on 15/8/2019.
 */

/**
 * Created by qshen on 13/7/2019.
 */

import L from "leafLet"

import 'leaflet/dist/leaflet.css'

let Map = function(el, station) {
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

  // var popup = L.popup();
  // let _this = this;
  // function onMapClick(e) {
  //   console.log('e', e);
  //   popup
  //     .setLatLng(e.latlng)
  //     .setContent(e.latlng.toString())
  //     .openOn(_this.map);
  // }
  //
  // this.map.on('click', onMapClick);
};



// Map.prototype.set_region_data = function(testPoints){
//   let boundaries = testPoints;
//   for(let i = 0, ilen = boundaries.length; i< ilen; i++){
//     let _polygon = boundaries[i]['region']
//     L.polygon(boundaries[i]['region'], {'weight':1}).addTo(this.map).bindPopup(boundaries[i].parameter.region_name)
//   }
// };
Map.prototype.focus = function(station_id){
  if(this.meteIdMap[station_id] != undefined){
    this.meteIdMap[station_id]['e'].setStyle({color: 'yellow'});
    this.map.setView(this.meteIdMap[station_id].loc, 9);
  }
};

Map.prototype.highlightCircle = function(station_id){
  if(this.meteIdMap[station_id] != undefined){
    this.meteIdMap[station_id]['e'].setStyle({color: 'yellow'});
  }
};

Map.prototype.removeHighlightCircle = function(station_id){
  if(this.meteIdMap[station_id] != undefined){
    this.meteIdMap[station_id]['e'].setStyle({color: '#2e9fa5'});
  }
};

Map.prototype.on = function(msg, func){
  if(msg == 'click'){
    this.clickOnStation = func;
  }
};

Map.prototype.set_region_data = function(testPoints){
  let _this = this;
  // let render_list = [];
  // testPoints.forEach((d, i)=>{
  //   if(i > 30) return
  //   render_list.push({
  //     "type": "Feature",
  //     "properties": {
  //       "radius": 100.0003055263856,
  //     },
  //     "geometry": { "type": "Point", "coordinates": [ d['longitude'],d['latitude']] }
  //   })
  // });
  //
  // L.geoJSON([render_list]).addTo(this.map);
  // console.log('render', render_list);
  //
  //
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

    // L.circle([loc['latitude'], loc['longitude']], 1300, {
    //   color: '#ff5b0d',
    //   fillColor: '#ff5b0d',
    //   fillOpacity: 0.3
    // }).addTo(this.map).bindPopup(' Mete');

  })



  // for(let i = 0, ilen = testPoints.length; i < ilen; i++){
  //   if(i > 30)
  //     break;
  //
  //
  //   let d = testPoints[i];
  //
  //   L.circle([d['latitude'],d['longitude']], 100, {
  //     color: 'steelblue',
  //     fillColor: '#f03',
  //     fillOpacity: 0.5
  //   }).addTo(this.map);
  // }

};


export default Map

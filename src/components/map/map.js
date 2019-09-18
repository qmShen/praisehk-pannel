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

  var popup = L.popup();
  let _this = this;
  function onMapClick(e) {
    popup
      .setLatLng(e.latlng)
      .setContent(e.latlng.toString())
      .openOn(_this.map);
  }

  this.map.on('click', onMapClick);
};



// Map.prototype.set_region_data = function(testPoints){
//   let boundaries = testPoints;
//   for(let i = 0, ilen = boundaries.length; i< ilen; i++){
//     let _polygon = boundaries[i]['region']
//     L.polygon(boundaries[i]['region'], {'weight':1}).addTo(this.map).bindPopup(boundaries[i].parameter.region_name)
//   }
// };


Map.prototype.set_region_data = function(testPoints){
  console.log('test', testPoints);
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

  testPoints.forEach((loc,i)=>{
    L.circle([loc['latitude_aq'], loc['longitude_aq']], 1300, {
      color: '#ff5b0d',
      fillColor: '#ff5b0d',
      fillOpacity: 0.2
    }).addTo(this.map).bindPopup(loc.aq_loc_id + ',' + loc.mete_loc_id + ' AQ');

    L.circle([loc['latitude_mete'], loc['longitude_mete']], 1300, {
      color: '#2e9fa5',
      fillColor: '#2e9fa5',
      fillOpacity: 0.2
    }).addTo(this.map).bindPopup(loc.aq_loc_id + ',' + loc.mete_loc_id + ' Mete');


    // L.circle([loc['latitude'], loc['longitude']], 1300, {
    //   color: '#ff5b0d',
    //   fillColor: '#ff5b0d',
    //   fillOpacity: 0.3
    // }).addTo(this.map).bindPopup(' Mete');


    var latlngs = [
      [loc['latitude_mete'], loc['longitude_mete']],
      [loc['latitude_aq'], loc['longitude_aq']]
    ];
    var polyline = L.polyline(latlngs, {color: '#4ba507'}).addTo(this.map);
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

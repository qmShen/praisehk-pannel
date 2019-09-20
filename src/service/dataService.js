/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource);

const dataServerUrl = "http://127.0.0.1:9950";
// const dataServerUrl = "/sv-analysis";
// const dataServerUrl = Config.serverLink == ""? "" : Config.serverLink.substring(0,  Config.serverLink.length - 1);
const $http = Vue.http;

function loadAQStations(callback){
  const url = `${dataServerUrl}/aq_stations`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}



function loadRegions(callback){
  const url = `${dataServerUrl}/cmaq_region`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}


function loadFeatureData(callback){
  const url = `${dataServerUrl}/feature_data`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function loadCMAQOBSData(station_id, callback){
  const url = `${dataServerUrl}/load_cmaq_obs`
  $http.post(url, {'station_id': station_id}).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

export default{
  loadRegions,
  loadFeatureData,
  loadCMAQOBSData
}

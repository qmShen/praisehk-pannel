/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource);


const dataServerUrl = "http://127.0.0.1:9950";
// const dataServerUrl = "/praise-vis";


// const dataServerUrl = "/sv-analysis";
// const dataServerUrl = Config.serverLink == ""? "" : Config.serverLink.substring(0,  Config.serverLink.length - 1);
const $http = Vue.http;

// function loadAQStations(callback){
//   const url = `${dataServerUrl}/aq_stations`
//   $http.get(url).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }



function loadRegions(callback){
  const url = `${dataServerUrl}/cmaq_region`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}


function loadFeatureData(param, callback){
  const url = `${dataServerUrl}/feature_data`
  $http.post(url, param).then(response => {
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

//  Version 0 --------------------------
function loadAQStations(callback){
  const url = `${dataServerUrl}/aq_stations`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function loadMeteStations(callback){
  const url = `${dataServerUrl}/mete_stations`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function loadFeatureValue(param, callback){
  const url = `${dataServerUrl}/load_observation`
  $http.post(url, param).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}


function loadModelValue(param, callback){
  const url = `${dataServerUrl}/load_model_value`
  $http.post(url, param).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function loadFeatureErrorValue(callback){
  const url = `${dataServerUrl}/load_errors`
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}


function loadMeanError(param, callback){
  const url = `${dataServerUrl}/load_mean_error`
      $http.post(url, param).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

// param includes {username, label, feature, startTime, endTime}
function saveLabelValue(param, callback){
  const url = `${dataServerUrl}/save_labels`

  $http.post(url, param).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function saveLabelValue(param, callback){
  const url = `${dataServerUrl}/save_labels`
  $http.post(url, param).then(response => {}, errResponse => {
    console.log(errResponse)
  })
}

export default{
  loadRegions,
  loadFeatureData,
  loadCMAQOBSData,
//  --------------------------
  loadAQStations,
  loadMeteStations,
  loadFeatureValue,
  loadModelValue,
  loadMeanError,
  saveLabelValue

}

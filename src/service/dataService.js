/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource);

const dataServerUrl = "http://127.0.0.1:9950";
// const dataServerUrl = "/praise-vis";

const $http = Vue.http;


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

function loadCMAQOBSData(param, callback){
  const url = `${dataServerUrl}/load_cmaq_obs`
  $http.post(url, param).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

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
  const url = `${dataServerUrl}/load_mean_error`;
  $http.post(url, param)
    .then(response => {
      callback(response.data)
    }, errResponse => {
      console.log(errResponse)
    })
}

function loadLabelValue(param, callback){
  const url = `${dataServerUrl}/load_labels`
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

function modifyLabelValue(param, callback){
  const url = `${dataServerUrl}/modify_labels`
  $http.post(url, param).then(response => {}, errResponse => {
    console.log(errResponse)
  })
}

function deleteLabel(param, callback){
  const url = `${dataServerUrl}/delete_labels`
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
  loadLabelValue,
  saveLabelValue,
  modifyLabelValue,
  deleteLabel
}

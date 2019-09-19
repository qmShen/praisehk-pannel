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



//
// function loadModelList(callback){
//   const url = `${dataServerUrl}/model_list`
//   $http.post(url).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function loadSelectedModel(mid, callback){
//   const url = `${dataServerUrl}/load_selected_model`
//   $http.post(url, {'mid': mid}).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function getInputFeatureGradientStatistics(mid, target_feature, callback) {
//   const url = `${dataServerUrl}/input_feature_gradient_statistics`
//   $http.post(url, {'mid': mid, 'target_feature': target_feature}).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function getGradientProject(mid, target_feature, callback) {
//   const url = `${dataServerUrl}/get_gradient_projection`
//   $http.post(url, {'mid': mid, 'target_feature': target_feature}).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }

//------------------------------------------------------------------------------------------------

// function getTemporal(callback){
//   const url = `${dataServerUrl}/temporal_trend`;
//   $http.get(url).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function getInitScatter(callback){
//   const url = `${dataServerUrl}/scatter_data`;
//   $http.get(url).then(response => {
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
//
// function getTestScatterPlot(callback){
//   const url = `${dataServerUrl}/testscatterplot`
//   $http.get(url).then(response => {
//
//     callback(response.data)
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
// function getTestData (callback) {
//   const url = `${dataServerUrl}/test`
//   $http.get(url).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }




export default{
  loadRegions,
  loadFeatureData,
  loadCMAQOBSData
}

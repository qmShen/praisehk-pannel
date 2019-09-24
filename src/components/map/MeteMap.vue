<template>
  <!--<div style="display: block; position: relative">-->
  <!--<div style="height: 100%; width: 100%" id='map_container'></div>-->
  <!--<div style="position:absolute; left: 0px; top:0px; z-index: 999; font-size: 10px" >Model Name: {{model_name}}</div>-->
  <!--</div>-->
  <div style="display: block; position: relative" class="boundary">
    <div class="mini_head">Mete Map</div>
    <!--    <el-checkbox size="mini">Match</el-checkbox> <el-checkbox size="mini">Mete</el-checkbox> <el-checkbox size="mini">AQ</el-checkbox>-->
    <div style="height: calc(100%  - 20px); width: 100%; position: relative">
      <div style="height: 100%; width: 100%" id='mete_map_container'></div>
      <svg style="height: 100%; width: 100%; position: absolute; left:0; top:0; pointer-events: none; z-index: 1000" id="mete_svg"></svg>
    </div>
  </div>
</template>

<script>

    import Map from './Map.js'
    import dataService from '../../service/dataService.js'
    import pipeService from '../../service/pipeService.js'
    export default {
        name: "Map",
        props:['stations','centerLoc', "WindFeatureValue", "WindWRFFeatureValue", "WindDirFeatureValue","WindDirWRFFeatureValue"],
        data() {
            return {
                featureType: 'Mete',
                station: {
                    'station_id': 'KC_A',
                    'station_name': 'Kwai Chung ' + 'Station',
                    'location':[22.3586, 114.1271]
                },
                type: 'Mete',
                timestamp: null
            }
        },
        mounted: function(){
            this.handler = new Map('mete_map_container', 'mete_svg', this.centerLoc, this.type);

            this.handler.on('mouseover', this,)
            // this.handler.on('click', this.clickOnStation);
            // pipeService.onMouseOverCell(msg=>{
            //     if(msg['action'] == 'click'){
            //         this.handler.focus(msg['stationId'])
            //     }
            // else if(msg['action'] == 'over'){
            //     this.handler.highlightCircle(msg['stationId']);
            // }else if(msg['action'] == 'out'){
            //     this.handler.removeHighlightCircle(msg['stationId']);
            // }
            // })
        },
        watch:{
            stations:function(new_stations){
                this.handler.loadAQstations(new_stations);
            },
            centerLoc: function(new_data){
                console.log('new' , new_data)
                this.handler.focus(new_data.loc)
            },
            WindFeatureValue: function(new_data){

            },
            WindWRFFeatureValue: function(new_data){

            },
            WindDirFeatureValue: function(new_data){

            },
            WindDirWRFFeatureValue: function(new_data){

            }
        },
        methods:{
            clickOnStation(msg){
                if(msg == undefined) return;
                console.log('station click component', msg);
            },

        }

    }
</script>

<style>

</style>

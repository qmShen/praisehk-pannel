<template>
  <!--<div style="display: block; position: relative">-->
  <!--<div style="height: 100%; width: 100%" id='map_container'></div>-->
  <!--<div style="position:absolute; left: 0px; top:0px; z-index: 999; font-size: 10px" >Model Name: {{model_name}}</div>-->
  <!--</div>-->
  <div style="display: block; position: relative" class="boundary">
    <div class="mini_head">Map</div>
    <!--    <el-checkbox size="mini">Match</el-checkbox> <el-checkbox size="mini">Mete</el-checkbox> <el-checkbox size="mini">AQ</el-checkbox>-->
    <div style="height: calc(100%  - 20px); width: 100%; position: relative">
      <div style="height: 100%; width: 100%" id='AQ_map_container'></div>
      <svg style="height: 100%; width: 100%; position: absolute; left:0; top:0; pointer-events: none; z-index: 1000" id="AQ_svg"></svg>
    </div>
  </div>
</template>

<script>

    import Map from './Map.js'
    import dataService from '../../service/dataService.js'
    import pipeService from '../../service/pipeService.js'

    export default {
        name: "Map",
        props:['stations', 'centerLoc', 'AQFeatureValue', 'CMAQFeatureValue', 'currentTime'],
        data() {
            return {
                featureType: 'AQ',
                station: {
                    'station_id': 'KC_A',
                    'station_name': 'Kwai Chung ' + 'Station',
                    'location':[22.3586, 114.1271]
                },
                type: 'AQ'
            }
        },
        mounted: function(){
            this.handler = new Map('AQ_map_container', 'AQ_svg', this.centerLoc,this.type);

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] == 'click'){
                    this.handler.showAQCMAQ(msg);
                    console.log('click')
                }
                else if(msg['action'] == 'over'){
                    this.handler.setCurrentTimestamp(msg);
                }else if(msg['action'] == 'out'){
                    // this.handler.mouseoutCircle(msg);
                }
            });

        },
        watch:{
            stations:function(new_stations){
                this.handler.loadStations(new_stations);
            },
            centerLoc: function(new_data){
                this.handler.focus(new_data.loc)
            },
            AQFeatureValue: function(new_data){
                this.handler.loadAQFeatureValue(new_data);
            },
            CMAQFeatureValue: function(new_data){
                this.handler.loadCMAQValue(new_data);
            },
            // currentTime: function(t){
            //     this.handler.setCurrentTimestamp({'timestamp'};
            // }
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

<template>
  <!--<div style="display: block; position: relative">-->
  <!--<div style="height: 100%; width: 100%" id='map_container'></div>-->
  <!--<div style="position:absolute; left: 0px; top:0px; z-index: 999; font-size: 10px" >Model Name: {{model_name}}</div>-->
  <!--</div>-->
  <div style="display: block; position: relative" class="boundary">
    <div class="mini_head">Map</div>
<!--    <el-checkbox size="mini">Match</el-checkbox> <el-checkbox size="mini">Mete</el-checkbox> <el-checkbox size="mini">AQ</el-checkbox>-->
    <div style="height: calc(100%  - 20px); width: 100%" id='AQ_map_container'></div>
  </div>
</template>

<script>

    import AQMap from './AQMap.js'
    import dataService from '../../service/dataService.js'
    import pipeService from '../../service/pipeService.js'
    export default {
        name: "Map",
        data() {
            return {
                station: {
                    'station_id': 'KC_A',
                    'station_name': 'Kwai Chung ' + 'Station',
                    'location':[22.3586, 114.1271]
                },
            }
        },
        mounted: function(){
            this.handler = new AQMap('AQ_map_container', this.station);

            this.handler.on('click', this.clickOnStation);
            dataService.loadRegions((region)=>{
                console.log('region', region);
                this.handler.set_region_data(region);
            });

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] == 'click'){
                    this.handler.focus(msg['stationId'])
                }else if(msg['action'] == 'over'){
                    this.handler.highlightCircle(msg['stationId']);
                }else if(msg['action'] == 'out'){
                    this.handler.removeHighlightCircle(msg['stationId']);
                }

            })
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

<template>
  <div class="main">
    <el-row :gutter="10" class="horizontal_stripe">
      <el-col :span="8" class="left">
        <AQMap style="height: 50%; width: 100%"
               v-bind:stations="AQStations"
               v-bind:centerLoc="centerLoc"
               v-bind:AQFeatureValue="AQFeatureValue"
               v-bind:CMAQFeatureValue="CMAQFeatureValue"
        />
        <MeteMap v-bind:stations="meteStations"
                 v-bind:centerLoc="centerLoc"
                 v-bind:WindFeatureValue = "WindFeatureValue"
                 v-bind:WindWRFFeatureValue = "WindWRFFeatureValue"
                 v-bind:WindDirFeatureValue = "WindDirFeatureValue"
                 v-bind:WindDirWRFFeatureValue = "WindDirWRFFeatureValue"
                 style="height: 50%; width: 100%"/>
      </el-col>
      <el-col :span="16" class="right">
        <BrushPannel v-bind:featureValues='featureValues' style="width: 100%; height: 8%;" class="boundary"/>
        <TargetFeatureValue style="width: 100%; height: 17%;" class="boundarys"/>
        <FeatureHeatmap style="width: 100%; height: calc(100% / 4);" v-for="item in featureValues" v-bind:item="item" v-bind:key="item.feature">
          {{item.feature}}
        </FeatureHeatmap>
      </el-col>
    </el-row>
  </div>
</template>

<script>
    import AQMap from './map/AQMap.vue'
    import MeteMap from './map/MeteMap.vue'
    import BrushPannel from './feature/BrushPannel.vue'
    import pipeService from '../service/pipeService.js'
    import dataService from '../service/dataService.js'
    import Statistics from './statistics/Statistics.vue'
    import FeatureHeatmap from './feature/FeatureHeatmap.vue'
    import TargetFeatureValue from './feature/TargetFeatureValue.vue'

    export default {
        name: 'MainView',
        data () {
            return {
                station: {
                    'station_id': 'KC_A',
                    'station_name': 'Kwai Chung ' + 'Station',
                    'location':[22.3586, 114.1271]
                },
                msg: 'Welcome to Your Vue.js App',
                featureValues:[],
                AQStations:[],
                meteStations:[],
                centerLoc:{loc: [22.3586, 114.1271]},
                AQFeatureValue: null,
                CMAQFeatureValue: null,
                WindFeatureValue: null,
                WindWRFFeatureValue: null,
                WindDirFeatureValue: null,
                WindDirWRFFeatureValue: null,


            }
        },
        mounted: function(){
            /*
            * Previous version -1
            * */
            dataService.loadFeatureData((data)=>{
                this.featureValues = data;
            });
            // Version -1 ending

            /*
            * Previous version 0
            * */
            dataService.loadAQStations((AQStations)=>{
                this.AQStations = AQStations;
            });

            dataService.loadMeteStations((meteStations)=>{
                this.meteStations = meteStations;
            });

            let para = null;
            /*
            * Load PM25 CMAQ and observation value
            * */
            para = {'ids': 'all', 'feature': 'PM25', 'timeRange': 1}
            dataService.loadFeatureValue(para, (data)=>{
                this.AQFeatureValue = data;
            });

            dataService.loadModelValue(para, (data)=>{
                this.CMAQFeatureValue = data;
            });

            /*
           * Load Wind WRF and observation value
           * */
            para = {'ids': 'all', 'feature': 'wind', 'timeRange': 1}
            dataService.loadFeatureValue(para, (data)=>{
                this.WindFeatureValue = data;
            });

            dataService.loadModelValue(para, (data)=>{
                this.WindWRFFeatureValue = data;
            });

            /*
            * Load Winddir WRF and observation value
            * */
            para = {'ids': 'all', 'feature': 'winddir', 'timeRange': 1}
            dataService.loadFeatureValue(para, (data)=>{
                this.WindDirFeatureValue = data;
            });

            dataService.loadModelValue(para, (data)=>{
                this.WindDirWRFFeatureValue = data;
            });

            // version 0 --- end
            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] == 'click'){
                    this.AQStations.forEach(d=>{
                        if(d.id == msg['stationId']){
                            this.centerLoc= {
                                'loc':[d.latitude, d.longitude]
                            }
                        }
                    })
                }
            })
        },
        components:{
            AQMap,
            MeteMap,
            Statistics,
            FeatureHeatmap,
            BrushPannel,
            TargetFeatureValue
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main{
    /*background: #efedf2;*/
    height: 100%;
  }
  .horizontal_stripe{
    height: 100%;
  }
  .left{
    height: 100%;
  }
  .right{
    height: 100%;
    /*background-color: #e3ebf2;*/
  }
</style>

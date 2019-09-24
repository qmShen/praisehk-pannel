<template>
  <div class="main">
    <el-row :gutter="10" class="horizontal_stripe">
      <el-col :span="8" class="left">
        <AQMap v-bind:stations="AQStations"
               v-bind:centerLoc="centerLoc"
               v-bind:AQFeatureValue="AQFeatureValue"
               v-bind:CMAQFeatureValue="CMAQFeatureValue"
               v-bind:currentTime="currentTime"
               v-loading="MeteMapLoading"
               element-loading-text="Loading"
               element-loading-background="rgba(0, 0, 0, 0.5)"
               style="height: 50%; width: 100%"
        />
        <MeteMap v-bind:stations="meteStations"
                 v-bind:centerLoc="centerLoc"
                 v-bind:WindFeatureValue = "WindFeatureValue"
                 v-bind:WindWRFFeatureValue = "WindWRFFeatureValue"
                 v-bind:WindDirFeatureValue = "WindDirFeatureValue"
                 v-bind:WindDirWRFFeatureValue = "WindDirWRFFeatureValue"
                 v-bind:currentTime="currentTime"
                 v-loading="AQMapLoading"
                 element-loading-text="Loading"
                 element-loading-background="rgba(0, 0, 0, 0.5)"
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
                currentTime: null,
                timeRange:[],
                AQMapLoading: true,
                MeteMapLoading: true,
                AQDataN: 0,
                MeteDataN: 0


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
            pipeService.onTimeRangeSelected(range=>{
                this.AQMapLoading = true;
                this.MeteMapLoading = true;

                console.log('timerange selected', range);
                this.timeRange = range;
                this.AQDataN = 0;
                this.MeteDataN = 0;
                para = {'ids': 'all', 'feature': 'PM25', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]}
                dataService.loadFeatureValue(para, (data)=>{
                    this.AQFeatureValue = data;
                    this.AQDataN += 1;

                });

                dataService.loadModelValue(para, (data)=>{
                    this.CMAQFeatureValue = data;
                    this.AQDataN += 1;
                });

                para = {'ids': 'all', 'feature': 'wind', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]}
                dataService.loadFeatureValue(para, (data)=>{
                    this.WindFeatureValue = data;
                    this.MeteDataN +=1;
                });

                dataService.loadModelValue(para, (data)=>{
                    this.WindWRFFeatureValue = data;
                    this.MeteDataN +=1;
                });

                para = {'ids': 'all', 'feature': 'winddir', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]}
                dataService.loadFeatureValue(para, (data)=>{
                    this.WindDirFeatureValue = data;
                    this.MeteDataN +=1;
                });

                dataService.loadModelValue(para, (data)=>{
                    this.WindDirWRFFeatureValue = data;
                    this.MeteDataN +=1;
                });
            });


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
            // para = {'ids': 'all', 'feature': 'PM25', 'timeRange': 1}
            // dataService.loadFeatureValue(para, (data)=>{
            //     this.AQFeatureValue = data;
            // });
            //
            // dataService.loadModelValue(para, (data)=>{
            //     this.CMAQFeatureValue = data;
            // });

            /*
           * Load Wind WRF and observation value
           * */
            // para = {'ids': 'all', 'feature': 'wind', 'timeRange': 1}
            // dataService.loadFeatureValue(para, (data)=>{
            //     this.WindFeatureValue = data;
            // });
            //
            // dataService.loadModelValue(para, (data)=>{
            //     this.WindWRFFeatureValue = data;
            // });

            /*
            * Load Winddir WRF and observation value
            * */
            // para = {'ids': 'all', 'feature': 'winddir', 'timeRange': 1}
            // dataService.loadFeatureValue(para, (data)=>{
            //     this.WindDirFeatureValue = data;
            // });
            //
            // dataService.loadModelValue(para, (data)=>{
            //     this.WindDirWRFFeatureValue = data;
            // });

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
                }else if(msg['action'] == 'over'){
                    this.currentTime = msg['timestamp'];
                    let i = 0;
                    // let hand = setInterval(function(){
                    //     i+=1;
                    //     if(i > 10){
                    //         clearInterval(hand);
                    //     }
                    //     this.currentTime  = this.currentTime + 3600;
                    //     if(this.currentTime >= this.timeRange[1]){
                    //         clearInterval(hand);
                    //     }
                    // }, 1000)
                }
            })
        },
        watch:{
            AQDataN:function(n){
                if(n == 2){
                    this.AQMapLoading = false;
                }
            },
            MeteDataN:function(n){
                if(n == 4){
                    this.MeteMapLoading = false;
                }
            }
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

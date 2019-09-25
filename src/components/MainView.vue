<template>
  <div class="main">
    <el-row :gutter="10" class="horizontal_stripe">
      <el-col :span="8" class="left">
        <AQMap v-bind:stations="AQStations"
               v-bind:centerLoc="centerLoc"
               v-bind:AQFeatureValue="AQFeatureValue"
               v-bind:CMAQFeatureValue="CMAQFeatureValue"
               v-bind:currentTime="currentTime"
               v-loading="AQMapLoading"
               element-loading-text="Loading"
               element-loading-background="rgba(0, 0, 0, 0.7)"
               style="height: 50%; width: 100%"
        />
        <MeteMap v-bind:stations="meteStations"
                 v-bind:centerLoc="centerLoc"
                 v-bind:WindFeatureValue = "WindFeatureValue"
                 v-bind:WindWRFFeatureValue = "WindWRFFeatureValue"
                 v-bind:WindDirFeatureValue = "WindDirFeatureValue"
                 v-bind:WindDirWRFFeatureValue = "WindDirWRFFeatureValue"
                 v-bind:currentTime="currentTime"
                 v-loading="MeteMapLoading"
                 element-loading-text="Loading"
                 element-loading-background="rgba(0, 0, 0, 0.7)"
                 style="height: 50%; width: 100%"/>
      </el-col>
      <el-col :span="16" class="right">
        <BrushPannel v-bind:featureValues='featureValues' style="width: 100%; height: 8%;" class="boundary"

        />
        <TargetFeatureValue style="width: 100%; height: 17%; position: relative" class="boundary"
                            v-loading="AQMapLoading"
                            v-bind:currentTime="currentTime"
                            element-loading-text="Loading"
                            element-loading-background="rgba(0, 0, 0, 0.4)"
        >
          <div style="position: absolute; right: 10px; top: 25px" >
            <el-button type="success" icon="el-icon-video-play" size="mini"  v-bind:disabled="buttonDisable" v-on:click="playAnimation" plain></el-button>
            <el-button type="success"  icon="el-icon-video-pause" size="mini"  v-bind:disabled="buttonDisable" v-on:click="stopAnimation" plain></el-button>
          </div>
        </TargetFeatureValue>
        <div style="width: 100%; height: calc(75%); " class="boundary"

        >
          <FeatureHeatmap style="width: 100%; height: calc(100% );" v-for="item in featureValues" v-bind:item="item" v-bind:key="item.feature"
          >
            {{item.feature}}
          </FeatureHeatmap>
        </div>
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
                FeatureValueLoading: true,
                AQDataN: 0,
                MeteDataN: 0,
                timeHandler:null,
                buttonDisable: false,
                mapReadyN:0
            }
        },
        mounted: function(){
            /*
            * Previous version 0
            * */
            let para = null;
            para = {'startTime': null, 'endTime': null}

            pipeService.onTimeRangeSelected(range=>{

                this.AQMapLoading = true;
                this.MeteMapLoading = true;
                this.FeatureValueLoading = true;
                para = {'startTime': range[0], 'endTime': range[1]};

                dataService.loadFeatureData(para, (data)=>{
                    this.featureValues = data;
                    this.FeatureValueLoading = false;
                });

                this.timeRange = range;
                this.AQDataN = 0;
                this.MeteDataN = 0;
                this.mapReadyN = 0;
                para = {'ids': 'all', 'feature': 'PM25', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]}
                dataService.loadFeatureValue(para, (data)=>{
                    console.log('AQ feature Value', data);
                    this.AQFeatureValue = data;
                    this.AQDataN += 1;
                });

                dataService.loadModelValue(para, (data)=>{
                    console.log('CMAQ feature Value', data);
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

            // Done
            dataService.loadAQStations((AQStations)=>{
                this.AQStations = AQStations;
            });

            dataService.loadMeteStations((meteStations)=>{
                this.meteStations = meteStations;
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
                }else if(msg['action'] == 'over'){
                    this.currentTime = msg['timestamp'];
                    let i = 0;

                }
            })
        },
        watch:{
            AQDataN:function(n){
                if(n == 2){
                    this.AQMapLoading = false;
                    this.mapReadyN += 1;
                }
            },
            MeteDataN:function(n){
                if(n == 4){
                    this.MeteMapLoading = false;
                    this.FeatureValueLoading = false;
                    this.mapReadyN += 1;
                }
            },
            mapReadyN: function(n){
                if(n == 2){
                    this.buttonDisable = false
                }else{
                    this.buttonDisable = true
                }
            }
        },
        methods:{
            playAnimation:function(){
                let _this = this;
                this.timeHandler = setInterval(()=>{
                    if(_this.currentTime == undefined){
                        _this.currentTime = _this.timeRange[0]
                    }
                    this.currentTime  = this.currentTime + 3600;
                    if(this.currentTime >= this.timeRange[1]){
                        clearInterval(this.timeHandler);
                    }

                }, 1000)
            },
            stopAnimation: function(){
                if(this.timeHandler){
                    clearInterval(this.timeHandler);
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

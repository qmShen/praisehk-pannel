<template>
  <div class="mainview">
    <el-row :gutter="10" class="horizontal_stripe">
      <el-col :span="8" class="left">
        <AQMap
          v-bind:colorSchema="colorSchema"
          v-bind:stations="AQStations"
          v-bind:centerLoc="centerLoc"
          v-bind:AQFeatureValue="AQFeatureValue"
          v-bind:CMAQFeatureValue="CMAQFeatureValue"
          v-bind:currentTime="currentTime"
          v-loading="AQMapLoading"
          element-loading-text="Loading"
          element-loading-background="rgba(0, 0, 0, 0.7)"
          style="height: 50%; width: 100%"
        />
        <MeteMap
          v-bind:colorSchema="colorSchema"
          v-bind:stations="meteStations"
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
        <BrushPannel v-bind:featureValues='featureValues' v-bind:mean_error='mean_error' style="width: 100%; height: 8%;position: relative;" class="boundary">
          <div style="font-size: 10px; position:absolute; right: 0px">Username: {{username}}</div>
        </BrushPannel>
        <TargetFeatureValue style="width: 100%; height: 17%; position: relative" class="boundary"
                            v-loading="AQMapLoading"
                            v-bind:colorSchema="colorSchema"
                            v-bind:currentTime="currentTime"
                            element-loading-text="Loading"
                            element-loading-background="rgba(0, 0, 0, 0.4)">
          <div style="position: absolute; right: 10px; top: 25px" >
            <el-button type="success" icon="el-icon-video-play" size="mini"  v-bind:disabled="buttonDisable" v-on:click="toggleAnimation" plain></el-button>
            <input type="text" v-model="labelName" size="10" style="height: 20px"></input>

            <select v-model="selected" style="height: 26px">
              <option disabled value="">Select</option>
              <option v-for="item in types">{{item}}</option>
            </select>

            <el-button type="success" icon="el-icon-upload" size="mini"  v-on:click="saveTimeInterval" plain></el-button>
          </div>
        </TargetFeatureValue>
        <div style="width: 100%; height: calc(75%); " class="boundary"
             v-loading="AQMapLoading"
             v-bind:currentTime="currentTime"
             element-loading-text="Loading"
             element-loading-background="rgba(0, 0, 0, 0.4)" >
          <FeatureHeatmap style="width: 100%; height: calc(100% );" v-for="item in featureValues" v-bind:item="item" v-bind:key="item.feature" v-bind:AQStations="AQStations">
            {{item.feature}}
          </FeatureHeatmap>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      title="Enter username:" center
      :visible.sync="dialogVisible"
      width="20%"
      :before-close="handleClose">
      <span>Please input your user name:</span>
      <el-input size = "mini" style="margin-top: 25px"  v-model="username" placeholder="User name:" @keyup.enter.native="handleClose"></el-input>
      <span  slot="footer" class="dialog-footer">
        <el-button style="margin-top: -10px" size = "mini" type="primary" @click="handleClose">Confirm</el-button>
      </span>
    </el-dialog>
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
                colorSchema:{'obs': "#479886", 'model': '#d77451'},
                featureValues:[],
                mean_error:[],
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
                isButtonClicked: false,
                mapReadyN:0,
                dialogVisible: true,
                username: '',
                labelName: '',
                labelStartTime: null,
                labelEndTime: null,
                labelStationId: null,
                types:['other', 'lead', 'lag', 'over', 'under'],
                selected:'other'
            }
        },
        mounted: function(){
            /*
            * Previous version 0
            * */
            let para = null;
            para = {'startTime': null, 'endTime': null}

            dataService.loadMeanError({'startTime': 1451739600, 'endTime': 1546261200}, (data)=>{
                this.mean_error = data;
            });

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

            // Done
            dataService.loadAQStations((AQStations)=>{
                AQStations.sort((a, b)=>{
                    let x = a.longitude;
                    let y = b.longitude;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
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
            });

            pipeService.onTimeRangeBrushed(range=>{
                this.labelStartTime = range[0];
                this.labelEndTime = range[1];
                this.labelStationId = range[2];
            });
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
            saveTimeInterval: function(){
                if (this.username == '' || this.username == null || this.username == 'null') {
                    this.$alert('Username is missing. Please refresh to enter your username if you want to record the label.')
                    return;
                } else if (this.labelName == '' || this.labelName == null || this.labelName == 'null') {
                    this.$alert('The label cannot be empty. Please enter a label for the selected time interval.')
                    return;
                }

                let para = {
                    'username': this.username, 'label': this.labelName, 'feature': 'PM25',
                    'startTime': this.labelStartTime, 'endTime': this.labelEndTime, 'StationId': this.labelStationId, 'type': this.selected
                };
                console.log(para);
                dataService.saveLabelValue(para);
            },
            toggleAnimation:function(){
                this.isButtonClicked = !this.isButtonClicked;
                if (this.isButtonClicked) {
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
                } else {
                    clearInterval(this.timeHandler);
                }
            },
            handleClose(done) {
                if(this.username == '' || this.username == null || this.username == 'null'){
                    this.$confirm('Use system without username? Your labeling will not be recorded.')
                        .then(_ => {
                            this.dialogVisible = false
                            done();
                        })
                        .catch(_ => {
                            // cancel
                        });
                }else{
                    this.dialogVisible = false;
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
<style>
  .mainview{
    /*background: #efedf2;*/
    height: 98%;
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

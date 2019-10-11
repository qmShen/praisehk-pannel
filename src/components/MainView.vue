<template>
  <div class="MainView">
    <div class="mini_head">
      Select Feature
      <select v-model="selectFeature" style="height: 17px">
        <option disabled value="">Select</option>
        <option v-for="item in featureList">{{item}}</option>
      </select>

    </div>
    <el-row :gutter="10" class="horizontal_stripe">
      <el-col :span="8" class="left">
        <AQMap
          :colorSchema="colorSchema"
          :stations="stationAQList"
          :centerLoc="centerLoc"
          :AQFeatureValue="dataFeatureAQ"
          :CMAQFeatureValue="dataFeatureCMAQ"
          :currentTime="currentTime"
          v-loading="AQMapLoading" element-loading-text="Loading" element-loading-background="rgba(0, 0, 0, 0.7)"
          style="height: 50%; width: 100%"
        />
        <MeteMap
          :colorSchema="colorSchema"
          :stations="stationMeteList"
          :centerLoc="centerLoc"
          :WindFeatureValue = "dataFeatureWind"
          :WindWRFFeatureValue = "dataFeatureWindWRF"
          :WindDirFeatureValue = "dataFeatureWindDir"
          :WindDirWRFFeatureValue = "dataFeatureWindDirWRF"
          :currentTime="currentTime"
          v-loading="MeteMapLoading" element-loading-text="Loading" element-loading-background="rgba(0, 0, 0, 0.7)"
          style="height: 50%; width: 100%"/>
      </el-col>
      <el-col :span="16" class="right">
        <TimeLabelPanel
          :globalStartTime="globalStartTime"
          :globalEndTime="globalEndTime"
          :hkStationDict="HKStationDict"
          :labelTypeList="labelTypeList"
          :username="username"
          :labelQueryId="labelQueryId"
          :selectFeature="selectFeature"
          style="width: 100%; height: 8%;position: relative;" class="boundary">
          <div style="font-size: 10px; position:absolute; right: 0">Username: {{username}}</div>
        </TimeLabelPanel>
        <TargetFeatureValue
          style="width: 100%; height: 17%; position: relative" class="boundary"
          :colorSchema="colorSchema"
          :currentTime="currentTime"
          :selectFeature="selectFeature"
          v-loading="AQMapLoading" element-loading-text="Loading" element-loading-background="rgba(0, 0, 0, 0.4)">
          <div style="position: absolute; right: 10px; top: 25px" >
            <el-button type="success" icon="el-icon-video-play" size="mini"  v-bind:disabled="buttonDisable" v-on:click="toggleAnimation" plain></el-button>
            <input type="text" v-model="labelName" size="10" style="height: 20px" placeholder="label name"></input>

            <select v-model="selected" style="height: 26px">
              <option disabled value="">Select</option>
              <option v-for="item in labelTypeList">{{item}}</option>
            </select>

            <el-button type="success" icon="el-icon-upload" size="mini"  v-on:click="saveTimeInterval" plain></el-button>
          </div>
        </TargetFeatureValue>
        <div style="width: 100%; height: calc(75%); " class="boundary"
             v-loading="AQMapLoading"
             v-bind:currentTime="currentTime"
             element-loading-text="Loading"
             element-loading-background="rgba(0, 0, 0, 0.4)" >
          <FeatureHeatmap style="width: 100%; height: calc(100% );" v-for="item in featureValues" v-bind:item="item" v-bind:key="item.feature" v-bind:AQStations="stationAQList">
            {{item.feature}}
          </FeatureHeatmap>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      title="Enter username:" center
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">

      <span>Please input your user name (case insensitive):</span>
      <el-input size = "mini" style="margin-top: 10px"  v-model="username" placeholder="Username" @keyup.enter.native="handleClose"></el-input>

      <span>Station of Interest:</span>
        <el-select style="margin-top: 10px" v-model="labelQueryId" placeholder="Select...">
          <el-option v-for="(station, index) in HKStationList" :key="index" :label="HKStationDict[station]" :value="station"></el-option>
        </el-select>
      <span  slot="footer" class="dialog-footer">
        <el-button style="margin-top: -10px" size = "mini" type="primary" @click="handleClose">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
    import AQMap from './map/AQMap.vue'
    import MeteMap from './map/MeteMap.vue'
    import TimeLabelPanel from './feature/TimeLabelPanel.vue'
    import FeatureHeatmap from './feature/FeatureHeatmap.vue'
    import TargetFeatureValue from './feature/FeatureLineChart.vue'

    import pipeService from '../service/pipeService.js'
    import dataService from '../service/dataService.js'

    export default {
        name: 'MainView',
        data () {
            return {
                // Constant
                globalStartTime: 1522512000, // 01 Apr 2018 00:00
                globalEndTime: 1569855600,   // 30 Sep 2019 23:00
                HKStationList: [67, 68, 70, 74, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 87, 90],  // 16 HK stations
                HKStationDict: {
                    '83': 'CB_R', '78': 'CL_R', '81': 'MKaR', '77': 'CW_A',
                    '84': 'EN_A', '76': 'KC_A', '85': 'KT_A', '82': 'ST_A',
                    '79': 'SP_A', '80': 'TP_A', '90': 'MB_A', '87': 'TK_A',
                    '74': 'TW_A', '68': 'TM_A', '67': 'TC_A', '70': 'YL_A',
                },
                featureList: ['NO2', 'PM25'],
                labelTypeList: ['other', 'lead', 'lag', 'over', 'under'],
                colorSchema:{'obs': "#479886", 'model': '#d77451'},

                // Data
                stationAQList:[],
                stationMeteList:[],
                dataErrorMean:[],
                dataFeatureAQ: null,
                dataFeatureCMAQ: null,
                dataFeatureWind: null,
                dataFeatureWindWRF: null,
                dataFeatureWindDir: null,
                dataFeatureWindDirWRF: null,

                // Data loading system
                AQMapLoading: true,
                MeteMapLoading: true,
                FeatureValueLoading: true,
                AQDataN: 0,
                MeteDataN: 0,
                mapReadyN:0,


                featureValues:[],
                centerLoc:{loc: [22.3586, 114.1271]},
                currentTime: null,
                timeRange:[],
                timeHandler:null,
                buttonDisable: false,
                isButtonClicked: false,
                dialogVisible: true,
                username: '',
                labelName: '',
                labelStartTime: null,
                labelEndTime: null,
                labelStationId: null,
                labelQueryId: null,

                selected:'other',
                selectFeature:'NO2',
            }
        },
        mounted: function(){
            dataService.loadAQStations((data)=>{
                data.sort((a, b)=>{
                    let x = a.longitude;
                    let y = b.longitude;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
                this.stationAQList = data;
            });

            dataService.loadMeteStations((data)=>{
                this.stationMeteList = data;
            });

            pipeService.onTimeRangeSelected(range=>{
                this.AQMapLoading = true;
                this.MeteMapLoading = true;
                this.FeatureValueLoading = true;
                let para = {'startTime': range[0], 'endTime': range[1], 'feature':this.selectFeature};

                dataService.loadFeatureData(para, (data)=>{
                    this.featureValues = data;
                    this.FeatureValueLoading = false;
                });

                this.timeRange = range;
                this.AQDataN = 0;
                this.MeteDataN = 0;
                this.mapReadyN = 0;
                para = {'ids': 'all', 'feature': this.selectFeature, 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]};
                dataService.loadFeatureValue(para, (data)=>{
                    this.dataFeatureAQ = data;
                    this.AQDataN += 1;
                });

                dataService.loadModelValue(para, (data)=>{

                    this.dataFeatureCMAQ = data;
                    this.AQDataN += 1;
                });

                para = {'ids': 'all', 'feature': 'wind', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]};
                dataService.loadFeatureValue(para, (data)=>{
                    this.dataFeatureWind = data;
                    this.MeteDataN +=1;
                });

                dataService.loadModelValue(para, (data)=>{
                    this.dataFeatureWindWRF = data;
                    this.MeteDataN +=1;
                });

                para = {'ids': 'all', 'feature': 'winddir', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]};
                dataService.loadFeatureValue(para, (data)=>{
                    this.dataFeatureWindDir = data;
                    this.MeteDataN +=1;
                });

                dataService.loadModelValue(para, (data)=>{
                    this.dataFeatureWindDirWRF = data;
                    this.MeteDataN +=1;
                });
            });

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] === 'click'){
                    this.stationAQList.forEach(d=>{
                        if(d.id === msg['stationId']){
                            this.centerLoc= {
                                'loc':[d.latitude, d.longitude]
                            }
                        }
                    })
                }else if(msg['action'] === 'over'){
                    this.currentTime = msg['timestamp'];
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
                if(n === 2){
                    this.AQMapLoading = false;
                    this.mapReadyN += 1;
                }
            },
            MeteDataN:function(n){
                if(n === 4){
                    this.MeteMapLoading = false;
                    this.FeatureValueLoading = false;
                    this.mapReadyN += 1;
                }
            },
            mapReadyN: function(n){
                this.buttonDisable = n !== 2;
            },
        },
        methods:{
            saveTimeInterval: function(){
                if (this.username === '' || this.username == null || this.username === 'null') {
                    this.$alert('Username is missing. Please refresh to enter your username if you want to record the label.');
                    return;
                }

                let para = {
                    'username': this.username, 'label': this.labelName, 'feature': this.selectFeature,
                    'startTime': this.labelStartTime, 'endTime': this.labelEndTime, 'StationId': this.labelStationId, 'type': this.selected
                };
                dataService.saveLabelValue(para);
                pipeService.emitLabelUpdate();
            },
            toggleAnimation:function(){
                this.isButtonClicked = !this.isButtonClicked;
                if (this.isButtonClicked) {
                    let _this = this;
                    this.timeHandler = setInterval(()=>{
                        if(_this.currentTime === undefined){
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
                if(this.username === '' || this.username == null || this.username === 'null'){
                    this.$confirm('Use system without username? Your labeling will not be recorded.')
                        .then(_ => {
                            this.dialogVisible = false;
                            done();
                        })
                        .catch(_ => {
                            // cancel
                        });
                }else{
                    this.dialogVisible = false;
                    pipeService.emitLabelUpdate();
                }
            }
        },

        components:{
            AQMap,
            MeteMap,
            FeatureHeatmap,
            TimeLabelPanel,
            TargetFeatureValue
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .MainView{
    /*background: #efedf2;*/
    height: 96%;
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

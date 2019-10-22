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
          :colorSchema="colorScheme"
          :stations="stationAQList"
          :centerLoc="centerLoc"
          :AQFeatureValue="dataFeatureAQ"
          :CMAQFeatureValue="dataFeatureCMAQ"
          :currentTime="currentTime"
          v-loading="AQMapLoading" element-loading-text="Loading" element-loading-background="rgba(0, 0, 0, 0.7)"
          style="height: 50%; width: 100%"
        />
        <MeteMap
          :colorSchema="colorScheme"
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
          :global-start-time="globalStartTime"
          :global-end-time="globalEndTime"
          :color-scheme="colorScheme"
          :hk-station-dict="HKStationDict"
          :label-type-list="labelTypeList"
          :username="username"
          :label-query-id="labelQueryId"
          :select-feature="selectFeature"
          style="width: 100%; height: 8%;position: relative;" class="boundary">
          <div style="font-size: 10px; position:absolute; right: 0">Username: {{username}}</div>
        </TimeLabelPanel>
        <FeatureLineChart
          style="width: 100%; height: 17%; position: relative" class="boundary"
          :color-scheme="colorScheme"
          :current-time="currentTime"
          :select-feature="selectFeature"
          :hk-station-dict="HKStationDict"
          v-loading="AQMapLoading" element-loading-text="Loading" element-loading-background="rgba(0, 0, 0, 0.4)">
          <div style="position: absolute; right: 10px; top: 25px" >
            <el-button type="success" icon="el-icon-video-play" size="mini"  v-bind:disabled="buttonDisable" v-on:click="toggleAnimation" circle></el-button>
            <input type="text" v-model="labelName" size="10" style="height: 20px" placeholder="label name"></input>

            <select v-model="labelSelected" style="height: 26px">
              <option disabled value="">Select</option>
              <option v-for="item in labelTypeList">{{item}}</option>
            </select>

            <el-button type="primary" icon="el-icon-edit" size="mini"  v-on:click="saveTimeInterval" circle></el-button>
          </div>
        </FeatureLineChart>

        <div style="width: 100%; height: calc(75%); " class="boundary"
             :currentTime="currentTime"
             v-loading="AQMapLoading"
             element-loading-text="Loading"
             element-loading-background="rgba(0, 0, 0, 0.4)" >
          <FeatureHeatmap
            style="width: 100%; height: calc(100% );"
            :global-start-time="globalStartTime"
            :global-end-time="globalEndTime"
            :data-feature-error="dataFeatureError"
            :station-a-q-list="stationAQList">
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
        <el-select style="margin-top: 10px" v-model="labelQueryId" placeholder="Select..." value="null">
          <el-option
            v-for="station in HKStationList"
            :key="station.index"
            :label="HKStationDict[station]"
            :value="station">
          </el-option>
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
    import FeatureHeatmap from './feature/FeatureHeatMap.vue'
    import FeatureLineChart from './feature/FeatureLineChart.vue'

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
                colorScheme:{'obs': "#d77451", 'model': '#479886'},

                // Data
                stationAQList:[],
                stationMeteList:[],
                dataErrorMean: null,
                dataFeatureError: null,
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

                // Label system
                username: '',
                labelName: '',
                labelStartTime: null,
                labelEndTime: null,
                labelStationId: null,
                labelQueryId: null,
                labelSelected:'other',

                // Not yet classified
                selectFeature:'PM25',
                centerLoc:{loc: [22.3586, 114.1271]},
                currentTime: null,
                timeRange:[],
                timeHandler:null,
                buttonDisable: false,
                isButtonClicked: false,
                dialogVisible: true,
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
                this.timeRange = range;
                this.AQMapLoading = true;
                this.MeteMapLoading = true;
                this.FeatureValueLoading = true;

                // Three hours average of feature values
                let para = {'startTime': range[0], 'endTime': range[1], 'feature':this.selectFeature};
                dataService.loadFeatureData(para, (data)=>{
                    this.dataFeatureError = data[0];
                    this.FeatureValueLoading = false;
                });

                this.AQDataN = 0;
                this.MeteDataN = 0;
                this.mapReadyN = 0;

                // Feature values
                para = {'ids': 'all', 'feature': this.selectFeature, 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]};
                dataService.loadFeatureValue(para, (data)=>{
                    this.dataFeatureAQ = data;
                    this.AQDataN += 1;
                });
                dataService.loadModelValue(para, (data)=>{
                    this.dataFeatureCMAQ = data;
                    this.AQDataN += 1;
                });

                // Wind Speed
                para = {'ids': 'all', 'feature': 'wind', 'timeRange': 1, 'startTime': range[0], 'endTime': range[1]};
                dataService.loadFeatureValue(para, (data)=>{
                    this.dataFeatureWind = data;
                    this.MeteDataN +=1;
                });
                dataService.loadModelValue(para, (data)=>{
                    this.dataFeatureWindWRF = data;
                    this.MeteDataN +=1;
                });

                // Wind direction
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
                    // Recenter the maps
                    this.stationAQList.forEach(d=>{
                        if(d.id === msg['stationId']){
                            this.centerLoc= {
                                'loc':[d.latitude, d.longitude]
                            };
                        }
                    });

                    // Refresh Labels
                    this.labelQueryId = msg['stationId'];
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
                    'userName': this.username,
                    'label': this.labelName,
                    'feature': this.selectFeature,
                    'startTime': this.labelStartTime,
                    'endTime': this.labelEndTime,
                    'stationId': this.labelStationId,
                    'labelType': this.labelSelected
                };
                dataService.saveLabelValue(para);

                let _this = this;
                let timeHandler = setInterval(()=>{
                    pipeService.emitLabelUpdate(_this.labelQueryId);
                    clearInterval(timeHandler);
                }, 1000);
            },
            toggleAnimation:function(){
                this.isButtonClicked = !this.isButtonClicked;
                if (this.isButtonClicked) {
                    let _this = this;
                    this.timeHandler = setInterval(()=>{
                        if(_this.currentTime === undefined){
                            _this.currentTime = _this.timeRange[0]
                        }
                        this.currentTime = this.currentTime + 3600;
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
                    pipeService.emitLabelUpdate(this.labelQueryId);
                }
            }
        },

        components:{
            AQMap,
            MeteMap,
            FeatureHeatmap,
            TimeLabelPanel,
            FeatureLineChart
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

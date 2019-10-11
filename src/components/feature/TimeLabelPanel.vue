<template>
  <div
    v-loading="timeLabelPanelLoading"
    element-loading-text="Loading"
    element-loading-background="rgba(0, 0, 0, 0.4)">
    <slot></slot>

    <el-dialog title="Detail information of the label" :visible.sync="labelDialogVisible" width="80%" :before-close="handleCloseLabel">
      <el-form :model="labelData">
        <el-row :gutter="10">
          <el-col :span="8" style="margin-top: 10px">
            <el-form-item label="Station">
              <el-tag>{{hkStationDict[this.labelData.stationId]}}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="8" style="margin-top: 10px">
            <el-form-item label="Label">
              <el-col :span="20">
                <el-input v-model="labelData.label" autocomplete="off" placeholder="Enter label if any"></el-input>
              </el-col>
            </el-form-item>
          </el-col>
          <el-col :span="8" style="margin-top: 10px">
            <el-form-item label="Label Type">
              <el-select v-model="labelData.labelType" placeholder="Please select the label type" value="other">
                <el-option v-for="label in labelTypeList" :key="label.id" :label="label" :value="label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <TimeLabelLineChart
            :color-scheme="colorScheme"
            :select-feature="selectFeature"
            :station-id="labelData.stationId"
            :start-time="labelData.startTime"
            :end-time="labelData.endTime">
          </TimeLabelLineChart>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="handleDeleteLabel">Delete</el-button>
        <el-button type="primary" @click="handleModifyLabel">Update</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import TimeLabelPanel from './TimeLabelPanel.js'
    import TimeLabelLineChart from "./TimeLabelLineChart.vue";
    import pipeService from '../../service/pipeService.js'
    import dataService from "../../service/dataService.js";
    export default {
        name: "TimeLabelPanel",
        props:{
            "globalStartTime": Number,
            "globalEndTime": Number,
            "colorScheme": Object,
            "hkStationDict": Object,
            "labelTypeList": Array,
            "username": String,
            "selectFeature": String,
            "labelQueryId": String,
        },
        data () {
            return {
                timeLabelPanelLoading: false,

                // Error Mean
                meanErrorData: [],

                // Label system
                labelList: [],
                labelData: {
                    'id': 0,
                    'username': '',
                    'label': '',
                    'feature': '',
                    'startTime': 0,
                    'endTime': 0,
                    'StationId': 0,
                    'type': ''
                },
                labelDialogVisible: false,
            }
        },
        watch:{
            selectFeature: function(){
                this.loadMeanError();
                this.loadLabels();
            },
            meanErrorData: function(new_data) {
                this.timeLabelPanel.render_error(new_data);
            },
            labelList: function(new_data) {
                this.timeLabelPanel.render_labels(new_data);
            },
        },
        mounted: function(){
            // initialise the panel
            this.timeLabelPanel = new TimeLabelPanel(this.$el);
            this.timeLabelPanel.globalStartTime = this.globalStartTime;
            this.timeLabelPanel.globalEndTime = this.globalEndTime;
            this.timeLabelPanel.on('labelClick', this.handleLabelClick);
            this.timeLabelPanel.on('brushEnd', this.handleBrushEnd);
            this.timeLabelPanel.initTimeBrush();

            // load relevant data
            this.loadMeanError();
            this.loadLabels();

            // set up listener
            pipeService.onLabelUpdate(()=>{
                this.loadLabels();
            });
            pipeService.onDialogTimeRangeBrushed(range=>{
                this.labelData.startTime = range[0];
                this.labelData.endTime = range[1];
            });
        },
        methods:{
            loadMeanError(){
                this.timeLabelPanelLoading = true;
                let para = {'startTime': this.globalStartTime, 'endTime': this.globalEndTime, 'feature': this.selectFeature};
                dataService.loadMeanError( para, (data) => {
                    this.meanErrorData = data;
                    this.timeLabelPanelLoading = false;
                });
            },
            loadLabels(){
                let para = {'username': this.username, 'feature': this.selectFeature, 'station': this.labelQueryId};
                dataService.loadLabelValue( para, (data) => {
                    this.labelList = data;
                });
            },
            handleLabelClick(data) {
                this.labelData = data;
                this.labelDialogVisible = true;
            },
            handleCloseLabel(){
                this.labelDialogVisible = false;
                pipeService.emitLabelUpdate();
            },
            handleModifyLabel(){
                this.labelDialogVisible = false;
                let para = {
                    'id': this.labelData.id, 'username': this.labelData.userName, 'label': this.labelData.label,
                    'feature': this.labelData.feature, 'startTime': this.labelData.startTime, 'endTime': this.labelData.endTime,
                    'StationId': this.labelData.stationId, 'type': this.labelData.labelType
                };
                dataService.modifyLabelValue(para);

                let timeHandler = setInterval(()=>{
                    pipeService.emitLabelUpdate();
                    clearInterval(timeHandler);
                }, 1000);
            },
            handleDeleteLabel(){
                this.labelDialogVisible = false;
                dataService.deleteLabel({'id': this.labelData.id});

                let timeHandler = setInterval(()=>{
                    pipeService.emitLabelUpdate();
                    clearInterval(timeHandler);
                }, 1000);
            },
            handleBrushEnd(timeRange){
                pipeService.emitTimeRangeSelected(timeRange);
            },
        },
        components: {
            TimeLabelLineChart
        }
    }
</script>

<style scoped>

</style>

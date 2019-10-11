<template>
  <div>
    <slot></slot>

    <el-dialog title="Label detail" :visible.sync="dialogLabelVisible" width="80%" :before-close="handleCloseLabel">
      <el-form :model="labelData">
        <el-col :span="8">
          <el-form-item label="Station">
            <el-tag>{{hkStationDict[this.labelData.stationId]}}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Label">
            <el-col :span="20">
              <el-input v-model="labelData.label" autocomplete="off" placeholder="Enter label if any"></el-input>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Label Type">
            <el-select v-model="labelData.labelType" placeholder="Please select the label type" value="other">
              <el-option v-for="label in labelTypeList" :key="label.id" :label="label" :value="label"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <TimeLabelLineChart
          :station_id="labelData.stationId"
          :start_time="labelData.startTime"
          :end_time="labelData.endTime"
          :selectFeature="selectFeature">
        </TimeLabelLineChart>
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
            "hkStationDict": Object,
            "labelTypeList": Array,
            "username": String,
            "selectFeature": String,
            "labelQueryId": String,
        },
        data () {
            return {
                // constant
                globalStartTime: this.globalStartTime,
                globalEndTime: this.globalEndTime,

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
                dialogLabelVisible: false,
            }
        },
        watch:{
            selectFeature: function(){
                this.loadMeanError();
                this.loadLabels();
            },
            meanErrorData: function(new_data) {
                this.handler.render_error(new_data);
            },
            labelList: function(new_data) {
                this.handler.render_labels(new_data);
            },
        },
        mounted: function(){
            // initialise the panel
            this.handler = new TimeLabelPanel(this.$el);
            this.handler.on('labelClick', this.handleLabelClick);
            this.handler.on('brushEnd', this.handleBrushEnd);
            this.handler.initTimeBrush();

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
                dataService.loadMeanError(
                    {'startTime': this.globalStartTime, 'endTime': this.globalEndTime, 'feature': this.selectFeature},
                    (data) => {
                        this.meanErrorData = data;
                    }
                );
            },
            loadLabels(){
                dataService.loadLabelValue(
                    {'username': this.username, 'feature': this.selectFeature, 'station': this.labelQueryId},
                    (data) => {
                        this.labelList = data;
                    }
                );
            },
            handleLabelClick(data) {
                this.labelData = data;
                this.dialogLabelVisible = true;
            },
            handleCloseLabel(){
                this.dialogLabelVisible = false;
                pipeService.emitLabelUpdate();
            },
            handleModifyLabel(){
                this.dialogLabelVisible = false;
                let para = {
                    'id': this.labelData.id, 'username': this.labelData.userName, 'label': this.labelData.label,
                    'feature': this.labelData.feature, 'startTime': this.labelData.startTime, 'endTime': this.labelData.endTime,
                    'StationId': this.labelData.stationId, 'type': this.labelData.labelType
                };
                dataService.modifyLabelValue(para);
                pipeService.emitLabelUpdate();
            },
            handleDeleteLabel(){
                this.dialogLabelVisible = false;
                dataService.deleteLabel({'id': this.label_data.id});
                pipeService.emitLabelUpdate();
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

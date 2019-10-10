<template>
  <div>
    <slot></slot>

    <el-dialog title="Label detail" :visible.sync="dialogLabelVisible" width="80%" :before-close="handleCloseLabel">
      <el-form :model="label_data">
        <el-col :span="8">
          <el-form-item label="Station">
            <el-tag>{{HongKongStationDict[this.label_data.stationId]}}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Label">
            <el-col :span="20">
              <el-input v-model="label_data.label" autocomplete="off" placeholder="Enter label if any"></el-input>
            </el-col>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Label Type">
            <el-select v-model="label_data.labelType" placeholder="Please select the label type">
              <el-option label="other" value="other"></el-option>
              <el-option label="lead" value="lead"></el-option>
              <el-option label="lag" value="lag"></el-option>
              <el-option label="over" value="over"></el-option>
              <el-option label="under" value="under"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <LabelLineChart :station_id="label_data.stationId"
                        :selectFeature="selectFeature"
                        :start_time="label_data.startTime"
                        :end_time="label_data.endTime">
        </LabelLineChart>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCloseLabel">Dismiss</el-button>
        <el-button type="danger" @click="handleDeleteLabel">Delete</el-button>
        <el-button type="primary" @click="handleModifyLabel">Update</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import BrushPannel from './BrushPannel.js'
    import LabelLineChart from "./LabelLineChart.vue";
    import pipeService from '../../service/pipeService.js'
    import dataService from "../../service/dataService";
    export default {
        name: "BrushPannel",
        props:["mean_error", "label_info", "selectFeature"],
        data () {
            return {
                dialogLabelVisible: false,
                label_data: {
                    'id': '',
                    'startTime': 1539811600,
                    'endTime': 1540261200,
                    'userName': '',
                    'label': '',
                    'feature': '',
                    'stationId': '',
                    'labelType': ''
                },
                startTimeToUpdate: 1539811600,
                endTimeToUpdate: 1540261200,
                HongKongStationDict: {
                    '83': 'CB_R', '78': 'CL_R', '81': 'MKaR', '77': 'CW_A',
                    '84': 'EN_A', '76': 'KC_A', '85': 'KT_A', '82': 'ST_A',
                    '79': 'SP_A', '80': 'TP_A', '90': 'MB_A', '87': 'TK_A',
                    '74': 'TW_A', '68': 'TM_A', '67': 'TC_A', '70': 'YL_A',
                },
            }
        },
        watch:{
            mean_error: function(new_data) {
                this.handler.render_error(new_data);
            },
            label_info: function(new_data) {
                this.handler.render_labels(new_data);
            }
        },
        mounted: function(){
            this.handler = new BrushPannel(this.$el);
            this.handler.on('brushEnd', this.handleBrushEnd);
            this.handler.on('labelClick', this.handleLabelClick);
            this.handler.initTimeBrush();

            pipeService.onDialogTimeRangeBrushed(range=>{
                this.startTimeToUpdate = range[0];
                this.endTimeToUpdate = range[1];
            });
        },
        methods:{
            handleBrushEnd(timerange){
                pipeService.emitTimeRangeSelected(timerange);
            },
            handleLabelClick(data) {
                this.label_data = data;
                this.dialogLabelVisible = true;
            },
            handleCloseLabel(){
                this.dialogLabelVisible = false;
                pipeService.emitLabelUpdate();
            },
            handleModifyLabel(){
                this.dialogLabelVisible = false;
                let para = {
                    'id': this.label_data.id, 'username': this.label_data.userName, 'label': this.label_data.label,
                    'feature': this.label_data.feature, 'startTime': this.startTimeToUpdate, 'endTime': this.endTimeToUpdate,
                    'StationId': this.label_data.stationId, 'type': this.label_data.labelType
                };
                dataService.modifyLabelValue(para);
                pipeService.emitLabelUpdate();
            },
            handleDeleteLabel(){
                this.dialogLabelVisible = false;
                dataService.deleteLabel({'id': this.label_data.id});
                pipeService.emitLabelUpdate();
            }
        },
        components: {
            LabelLineChart
        }
    }
</script>

<style scoped>

</style>

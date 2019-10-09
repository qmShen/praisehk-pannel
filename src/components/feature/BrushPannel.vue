<template>
  <div>
    <slot></slot>

    <el-dialog title="Label detail" :visible.sync="dialogLabelVisible">
      <el-form :model="label_data">
        <el-form-item label="Label" :label-width="dialogLabelWidth">
          <el-input v-model="label_data.label" autocomplete="off" placeholder="Enter label if any"></el-input>
        </el-form-item>
        <el-form-item label="Label type" :label-width="dialogLabelWidth">
          <el-select v-model="label_data.labelType" placeholder="Please select the label type">
            <el-option label="other" value="other"></el-option>
            <el-option label="lead" value="lead"></el-option>
            <el-option label="lag" value="lag"></el-option>
            <el-option label="over" value="over"></el-option>
            <el-option label="under" value="under"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <TargetFeatureValue v-bind:colorSchema="{'obs': '#479886', 'model': '#d77451'}"
                          element-loading-text="Loading"
                          element-loading-background="rgba(0, 0, 0, 0.4)">
      </TargetFeatureValue>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogLabelVisible = false">Dismiss</el-button>
        <el-button type="danger" @click="dialogLabelVisible = false">Delete</el-button>
        <el-button type="primary" @click="dialogLabelVisible = false">Update</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import BrushPannel from './BrushPannel.js'
    import TargetFeatureValue from './TargetFeatureValue.vue'
    import pipeService from '../../service/pipeService.js'
    export default {
        name: "BrushPannel",
        props:["mean_error", "label_info"],
        data () {
            return {
                dialogLabelVisible: false,
                dialogLabelWidth: '100px',
                label_data: {
                    'id': '',
                    'startTime': 1539811600,
                    'endTime': 1540261200,
                    'userName': '',
                    'label': '',
                    'feature': '',
                    'stationId': '80',
                    'labelType': ''
                }
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
        },
        methods:{
            handleBrushEnd(timerange){
                pipeService.emitTimeRangeSelected(timerange);
            },
            handleLabelClick(data) {
                this.label_data = data;
                this.dialogLabelVisible = true;
            }
        },
        components: {
            TargetFeatureValue
        }
    }
</script>

<style scoped>

</style>

<template>
  <div style="display: block; position: relative" class="boundary">
    <div class="mini_head">{{dataFeatureError === null?'':dataFeatureError.feature}}
      <div style="position: absolute; right: 10px; top: 0;">
        <el-switch
          v-model="showHK"
          active-text="HK"
          inactive-text="Pearl Delta">
        </el-switch>
      </div>
    </div>
  </div>

</template>
<script>
    import FeatureHeatmap from './FeatureHeatmap.js'
    import pipeService from '../../service/pipeService.js'

    export default {
        name: "FeatureValue",
        props:{
            dataFeatureError: Object,
            stationAQList: Array,
        },
        data() {
            return {
                showHK: false,
            }
        },
        watch:{
            dataFeatureError:function(new_data){
                this.handler.setData(new_data);
            },
            stationAQList:function(new_data){
                this.handler.sortStation(new_data, this.showHK);
            },
            showHK:function (new_data) {
                this.handler.sortStation(this.stationAQList, new_data);
            }
        },
        mounted: function(){
            this.handler = new FeatureHeatmap(this.$el);

            this.handler.on('mouseover', this.handleMouseover);
            this.handler.on('click', this.handleMouseClick);
        },
        methods:{
            handleMouseover(msg){
                msg['action'] = 'over';
                pipeService.emitMouseOverCell(msg)
            },
            handleMouseClick(msg){
                msg['action'] = 'click';
                pipeService.emitMouseOverCell(msg)
            },
        },

    }
</script>

<style scoped>

</style>

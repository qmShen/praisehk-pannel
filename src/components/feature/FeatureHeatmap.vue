<template>
  <div
    style="display: block; position: relative"
    class="boundary">
    <div class="mini_head">{{dataFeatureError === null?'':dataFeatureError.feature}}
      <div style="position: absolute; right: 10px; top: 0;">
        <el-switch
          v-model="showPearlDelta"
          active-text="Pearl Delta"
          inactive-text="HK"
          inactive-color="#13ce66">
        </el-switch>
      </div>
    </div>
  </div>

</template>
<script>
    import FeatureHeatmap from './FeatureHeatmap.js'

    export default {
        name: "FeatureValue",
        props:{
            globalStartTime: Number,
            globalEndTime: Number,
            dataFeatureError: Object,
            stationAQList: Array,
        },
        data() {
            return {
                showPearlDelta: true,
            }
        },
        watch:{
            dataFeatureError:function(new_data){
                this.handler.setData(new_data);
            },
            stationAQList:function(new_data){
                this.handler.sortStation(new_data);
            },
            showPearlDelta:function (new_data) {
                this.handler.showPearlDelta = new_data;
                this.handler.renderHeatmap();
            }
        },
        mounted: function(){
            this.handler = new FeatureHeatmap(this.$el);
            this.handler.showPearlDelta = this.showPearlDelta;
        },
    }
</script>

<style scoped>

</style>

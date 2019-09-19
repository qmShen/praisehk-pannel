<template>
  <div class="main">
    <el-row :gutter="10" class="horizontal_stripe">
      <el-col :span="8" class="left">
        <Map style="height: 50%; width: 100%" />
        <Statistics style="height: 50%; width: 100%"/>
      </el-col>
      <el-col :span="16" class="right">
        <BrushPannel v-bind:featureValues='featureValues' style="width: 100%; height: 8%;" class="boundary"/>
        <TargetFeatureValue style="width: 100%; height: 17%;" class="boundarys"/>
        <FeatureHeatmap style="width: 100%; height: calc(100% / 4);" v-for="item in featureValues" v-bind:item="item" v-bind:key="item.feature">
          {{item.feature}}
        </FeatureHeatmap>
      </el-col>
    </el-row>
  </div>
</template>

<script>
    import Map from './map/Map.vue'
    import BrushPannel from './feature/BrushPannel.vue'
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
                featureValues:[]

            }
        },
        mounted: function(){
            dataService.loadFeatureData((data)=>{
                console.log('feature data', data);
                this.featureValues = data;
            });
        },
        components:{
            Map,
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

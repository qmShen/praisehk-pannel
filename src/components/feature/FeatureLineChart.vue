<template>
  <div class="boundary">
    <div class="mini_head">{{this.selectFeature}} at </div>
    <slot></slot>
  </div>
</template>

<script>
    import FeatureLineChart from './FeatureLineChart.js'
    import pipeService from '../../service/pipeService.js'
    import dataService from '../../service/dataService.js'

    export default {
        name: "FeatureLineChart",
        props:["currentTime", 'colorScheme', 'selectFeature'],
        mounted:function(){
            this.LineChart = new FeatureLineChart(this.$el);
            this.LineChart.colorScheme = this.colorScheme;
            this.LineChart.selectFeature = this.selectFeature;
            this.LineChart.on('brushEnd', this.handleBrushEnd);

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] === 'click'){
                    this.queryModelObs(msg['stationId']);
                }
            });

            pipeService.onTimeRangeSelected(timerange=>{
                this.LineChart.setTimeRange(timerange);
            });
        },
        watch:{
            currentTime(t){
                this.LineChart.setCurrentTimestamp(t);
            }
        },
        methods:{
            queryModelObs(stationId){
                let para = {'feature': this.selectFeature, 'stationId': stationId};
                dataService.loadCMAQOBSData(para, d=>{
                    this.LineChart.setData(d, stationId);
                });
            },
            handleBrushEnd(timeRange){
                pipeService.emitTimeRangeBrushed(timeRange);
            },
        }
    }
</script>


<style scoped>
  /*svg{*/
  /*height: 100%;*/
  /*width: 100%*/
  /*}*/
  .line {

  }
  .zoom {
    cursor: move;
    fill: none;
    pointer-events: all;
  }
</style>

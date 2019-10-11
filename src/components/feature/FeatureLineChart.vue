<template>
  <div class="boundary">
    <div class="mini_head">Obs VS CMAQ ({{this.selectFeature}})</div>
    <slot></slot>
  </div>
</template>

<script>

    import BrushLineChart from './FeatureLineChart.js'

    import pipeService from '../../service/pipeService.js'
    import dataService from '../../service/dataService.js'
    export default {
        name: "LineChart",
        props:["currentTime", 'colorSchema', 'selectFeature'],
        mounted:function(){
            this.LineChart = new BrushLineChart(this.$el, this.colorSchema);
            this.LineChart.on('brushEnd', this.handleBrushEnd);

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] == 'click'){
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
                console.log('station id test', stationId);
                let para = {'feature': this.selectFeature, 'stationId': stationId};
                dataService.loadCMAQOBSData(para, d=>{
                    this.LineChart.setData(d, stationId);
                });
            },
            handleBrushEnd(timerange){
                pipeService.emitTimeRangeBrushed(timerange);
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

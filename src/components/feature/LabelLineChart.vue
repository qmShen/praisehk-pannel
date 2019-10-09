<template>
  <div class="boundary">
  </div>
</template>

<script>

    import LabelLineChart from './LabelLineChart.js'
    import pipeService from '../../service/pipeService.js'
    import dataService from '../../service/dataService.js'

    export default {
        name: "LabelLineChart",
        props:['station_id', 'startTime', 'endTime'],
        mounted:function(){
            this.LineChart = new LabelLineChart(this.$el);
            this.LineChart.on('open', function() {
                this.queryModelObs(this.station_id)
            });
            this.LineChart.on('dialogBrushEnd', this.handleBrushEnd);

            pipeService.onTimeRangeSelected(timerange=>{
                this.LineChart.setTimeRange(timerange);
            });

        },
        data (){
            return {
                colorSchema:{'obs': "#479886", 'model': '#d77451'},
                startTimestamp: 1539811600,
                endTimestamp: 1540261200,
            }
        },
        methods:{
            queryModelObs(stationId){
                console.log('dialog station id test', stationId);
                dataService.loadCMAQOBSData(stationId, d=>{
                    this.LineChart.setData(d);
                });
            },
            handleBrushEnd(timerange){
                pipeService.emitDialogTimeRangeBrushed(timerange);
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

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
        props:['station_id', 'start_time', 'end_time', 'selectFeature'],
        watch:{
            station_id: function(new_data) {
                let para = {'feature': this.selectFeature, 'stationId': this.station_id};
                dataService.loadCMAQOBSData(para, d=>{
                    this.LineChart.setData(d, this.start_time, this.end_time);
                });
            },
            start_time: function(new_data) {
                this.LineChart.setTime(this.start_time, this.end_time);
            }
        },
        mounted:function(){
            this.LineChart = new LabelLineChart(this.$el);
            this.LineChart.on('dialogBrushEnd', this.handleBrushEnd);

            dataService.loadCMAQOBSData({'feature': this.selectFeature, 'stationId': this.station_id}, d=>{
                this.LineChart.setData(d, this.start_time, this.end_time);
            });
        },
        methods:{
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

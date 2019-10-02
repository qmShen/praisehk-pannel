<template>
  <div class="boundary">
    <div class="mini_head">Obs VS CMAQ</div>
    <slot></slot>
  </div>
</template>

<script>

    import BrushLineChart from './linechart.js'

    import pipeService from '../../service/pipeService.js'
    import dataService from '../../service/dataService.js'
    export default {
        name: "LineChart",
        props:["currentTime"],
        mounted:function(){
            this.LineChart = new BrushLineChart(this.$el);

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] == 'click'){
                    this.queryModelObs(msg['stationId']);
                }

            })

            pipeService.onTimeRangeSelected(timerange=>{
                this.LineChart.setTimeRange(timerange);
            })

        },
        watch:{
            currentTime(t){
                this.LineChart.setCurrentTimestamp(t);
            }
        },
        methods:{
            queryModelObs(stationId){
                console.log('station id test', stationId);
                dataService.loadCMAQOBSData(stationId, d=>{
                    this.LineChart.setData(d);
                })
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

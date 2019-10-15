<template>
  <div class="boundary">
    <div class="mini_head">{{this.selectFeature}} at {{this.stationName}}</div>
    <slot></slot>
  </div>
</template>

<script>
    import FeatureLineChart from './FeatureLineChart.js'
    import pipeService from '../../service/pipeService.js'
    import dataService from '../../service/dataService.js'

    export default {
        name: "FeatureLineChart",
        props:{
            "currentTime": Number,
            'colorScheme': Object,
            'selectFeature': String,
            'hkStationDict': Object
        },
        data() {
            return {
                stationId: null
            }
        },
        computed: {
            stationName() {
                return this.stationId in this.hkStationDict? this.hkStationDict[this.stationId]: this.stationId;
            }
        },
        mounted:function(){
            this.LineChart = new FeatureLineChart(this.$el);
            this.LineChart.colorScheme = this.colorScheme;
            this.LineChart.selectFeature = this.selectFeature;
            this.LineChart.on('brushEnd', this.handleBrushEnd);

            pipeService.onMouseOverCell(msg=>{
                if(msg['action'] === 'click'){
                    this.stationId = msg['stationId'];
                    this.queryModelObs(msg['stationId']);
                }
            });

            pipeService.onTimeRangeSelected(timeRange=>{
                this.LineChart.setTime(timeRange[0], timeRange[1]);
            });
        },
        watch:{
            currentTime(t){
                this.LineChart.setCurrentTimestamp(t);
            },
            selectFeature: function(new_data) {
                this.LineChart.selectFeature = new_data;
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

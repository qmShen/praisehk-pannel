<template>
  <div
    v-loading="timeLabelLineChartLoading"
    element-loading-text="Loading"
    element-loading-background="rgba(0, 0, 0, 0.4)">
  </div>
</template>

<script>
    import TimeLabelLineChart from './TimeLabelLineChart.js'
    import pipeService from '../../service/pipeService.js'
    import dataService from '../../service/dataService.js'

    export default {
        name: "TimeLabelLineChart",
        props:{
            'colorScheme': Object,
            'stationId': Number,
            'startTime': Number,
            'endTime': Number,
            'selectFeature': String,
        },
        watch:{
            stationId: function() {
                this.loadCMAQOBSData();
            },
            startTime: function() {
                this.LineChart.setTime(this.startTime, this.endTime);
            }
        },
        data () {
            return {
                timeLabelLineChartLoading: false,
            }
        },
        mounted:function(){
            this.LineChart = new TimeLabelLineChart(this.$el);
            this.LineChart.colorScheme = this.colorScheme;
            this.LineChart.selectFeature = this.selectFeature;
            this.LineChart.on('dialogBrushEnd', this.handleBrushEnd);

            this.loadCMAQOBSData();
        },
        methods:{
            loadCMAQOBSData(){
                this.timeLabelLineChartLoading = true;
                let para = {'feature': this.selectFeature, 'stationId': this.stationId};
                dataService.loadCMAQOBSData( para, d => {
                    this.LineChart.setData(d, this.startTime, this.endTime);
                    this.timeLabelLineChartLoading = false;
                });
            },
            handleBrushEnd(timeRange){
                pipeService.emitDialogTimeRangeBrushed(timeRange);
            },
        }
    }
</script>


<style scoped>
</style>

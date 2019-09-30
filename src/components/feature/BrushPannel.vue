<template>
  <div>
    <div class="mini_head">brush</div>
  </div>
</template>

<script>
    import BrushPannel from './BrushPannel.js'
    import pipeService from '../../service/pipeService.js'
    export default {
        name: "BrushPannel",
        props:["featureValues"],
        data() {
            return {

            }
        },

        watch:{
            featureValues:function(new_data){
                // this.handler.setData(new_data);
            }
        },
        mounted: function(){
            this.handler = new BrushPannel(this.$el);
            this.handler.on('brushEnd', this.handleBrushEnd);
            this.handler.initTimeBrush();
        },
        methods:{
            handleBrushEnd(timerange){
                pipeService.emitTimeRangeSelected(timerange);
                //Here
            },
        }
    }
</script>

<style scoped>

</style>

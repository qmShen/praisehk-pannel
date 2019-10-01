<template>
  <div>
    <div class="mini_head" style="position: relative">Brush</div>
    <slot></slot>
  </div>
</template>

<script>
    import BrushPannel from './BrushPannel.js'
    import pipeService from '../../service/pipeService.js'
    export default {
        name: "BrushPannel",
        props:["featureValues", "mean_error"],
        data() {
            return {

            }
        },

        watch:{
            featureValues:function(new_data){
                // this.handler.setData(new_data);
            },

            mean_error: function(new_data){
              this.handler.render_error(new_data);  
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

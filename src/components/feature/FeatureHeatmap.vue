<template>
  <!--<div style="display: block; position: relative">-->
  <!--<div style="height: 100%; width: 100%" id='map_container'></div>-->
  <!--<div style="position:absolute; left: 0px; top:0px; z-index: 999; font-size: 10px" >Model Name: {{model_name}}</div>-->
  <!--</div>-->
  <div style="display: block; position: relative" class="boundary">
    <div class="mini_head">{{item.feature}}</div>
  </div>

</template>

<script>
    import FeatureHeatmap from './FeatureHeatmap.js'
    import pipeService from '../../service/pipeService.js'
    export default {
        name: "FeatureValue",
        props:["item"],
        data() {
            return {
              type: null
            }
        },

        watch:{
            item:function(){
                console.log('item changed', this.item);
                this.handler.update(this.item)
            }
        },
        mounted: function(){
            console.log('item', this.item);
            if(this.item.feature == 'PM25'){
                this.type = 'AQ'
            }else if(this.item.feature == 'Wind' || this.item.feature == 'WindDir' ){
                this.type = 'Mete'
            }
            this.handler = new FeatureHeatmap(this.$el, this.item);
            this.handler.on('mouseover', this.handleMouseover);
            this.handler.on('mouseout', this.handleMouseout);
            this.handler.on('click', this.handleMouseClick);
            pipeService.onMouseOverCell(msg=>{
                this.handler.onMouseInter(msg)
            })
            pipeService.onTimeRangeSelected(timerange=>{
                this.handler.updateByTimeRange(timerange);
            })
        },
        methods:{
            handleMouseover(msg){
                msg['action'] = 'over';
                msg['type'] = this.type;
                pipeService.emitMouseOverCell(msg)
            },
            handleMouseout(msg){
                msg['action'] = 'out';
                msg['type'] = this.type;
                pipeService.emitMouseOverCell(msg)
            },
            handleMouseClick(msg){
                msg['action'] = 'click';
                msg['type'] = this.type;
                pipeService.emitMouseOverCell(msg)
            }
        }

    }
</script>

<style scoped>

</style>

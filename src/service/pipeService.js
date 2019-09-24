/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

var pipeService = new Vue({
  data:{
    SELECTEDSCATTER: 'select_scatter_plot',
    SEQUENCESELECTED: 'sequence_selected',
    SUBGROUPSELECTED: 'subgroup_selected',
    SELECTEDINIDIVUDUAL: 'selected_indiviual_selected',

    MOUSEOVERINDIVIDUAL: 'mosueover_individual',
    CHECKINDIVIDUAL: 'check_individual',

    MOUSEOVERFEATUREIMPORTANCE: 'mouseover_featureimportance_boxplot',
    TIMERANGESELECTED : 'time_range_selected',

    TIMERTICKED: 'timer_ticked',
  },

  methods:{
    emitSelectedScatterPlot: function(msg){
      this.$emit(this.SELECTEDSCATTER, msg);
    },
    onSelectedScatterPlot: function(callback){
      this.$on(this.SELECTEDSCATTER,function(msg){
        callback(msg);
      })
    },
    //------------------------------------------------------------
    //This is for select cities
    emitSequenceSelected: function(msg){
      this.$emit(this.SEQUENCESELECTED, msg);
    },
    onSequenceSelected: function(callback){
      this.$on(this.SEQUENCESELECTED,function(msg){
        callback(msg);
      })
    },

    //------------------------------------------------------------
    //When a subgroup is selected in distribution view, emit this message
    emitSubgroupSelected: function(msg){
      this.$emit(this.SUBGROUPSELECTED, msg);
    },
    onSubgroupSelected: function(callback){
      this.$on(this.SUBGROUPSELECTED,function(msg){
        callback(msg);
      })
    },



    //------------------------------------------------------------
    //When an individual view is selected
    // If msg is {'timestamp': timestamp, checked: 'true/false')

    emitCheckIndividual: function(msg){
      this.$emit(this.CHECKINDIVIDUAL, msg);
    },
    onCheckIndividual: function(callback){
      this.$on(this.CHECKINDIVIDUAL,function(msg){
        callback(msg);
      })
    },



    //------------------------------------------------------------
    //When an feature importance boxplot is hovered
    //If msg is undefined(not set), remove the mouseover effect, if msg is timestamp, add mouseover effect
    emitMouseoverFeature: function(msg){
      this.$emit(this.MOUSEOVERFEATUREIMPORTANCE, msg);
    },
    onMouseoverFeature: function(callback){
      this.$on(this.MOUSEOVERFEATUREIMPORTANCE,function(msg){
        callback(msg);
      })
    },





    //Not used yet
    //When a subgroup is selected in distribution view, emit this message
    emitSelectedIndividuals: function(msg){
      this.$emit(this.SELECTEDINIDIVUDUAL, msg);
    },
    onSelectedIndividuals: function(callback){
      this.$on(this.SELECTEDINIDIVUDUAL,function(msg){
        callback(msg);
      })
    },

    //------------------------------------------------------------
    //When a subgroup is selected in distribution view, emit this message
    // If msg is {action: over/out, timestamp:000000, stationId:0}

    emitMouseOverCell: function(msg){
      this.$emit(this.MOUSEOVERINDIVIDUAL, msg);
    },
    onMouseOverCell: function(callback){
      this.$on(this.MOUSEOVERINDIVIDUAL,function(msg){
        callback(msg);
      })
    },


    //------------------------------------------------------------
    //When time range in time series view is selected this will triger
    //msg{start: sec, end: sec}
    emitTimeRangeSelected: function(msg){
      this.$emit(this.TIMERANGESELECTED, msg);
    },
    onTimeRangeSelected: function(callback){
      this.$on(this.TIMERANGESELECTED, function(msg){
        callback(msg);
      })
    },


    //------------------------------------------------------------
    //When the timer has ticked, this will trigger
    //msg{start: sec, end: sec}
    emitTimerTicked: function(){
      this.$emit(this.TIMERTICKED);
    },
    onTimerTicked: function(callback){
      this.$on(this.TIMERTICKED, function(){
        callback();
      })
    },




  }
});

export default pipeService

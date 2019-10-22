/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

let pipeService = new Vue({
  data:{

    MOUSEOVERINDIVIDUAL: 'mosueover_individual',
    CHECKINDIVIDUAL: 'check_individual',

    MOUSEOVERFEATUREIMPORTANCE: 'mouseover_featureimportance_boxplot',
    TIMERANGESELECTED : 'time_range_selected',
    TIMERANGEBRUSHED: 'time_range_brushed',
    DIALOGTIMERANGEBRUSHED: 'dialog_time_range_brushed',

    LABELUPDATE: 'label_update',
    LABELLINECHARTUPDATE: 'label_line_chart_update',
  },

  methods:{
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
    //When time range in time series view is selected this will triger
    //msg{start: sec, end: sec}
    emitTimeRangeBrushed: function(msg){
      this.$emit(this.TIMERANGEBRUSHED, msg);
    },
    onTimeRangeBrushed: function(callback){
      this.$on(this.TIMERANGEBRUSHED, function(msg){
        callback(msg);
      })
    },

    //------------------------------------------------------------
    //When time range in time series view is selected this will triger
    //msg{start: sec, end: sec}
    emitDialogTimeRangeBrushed: function(msg){
      this.$emit(this.DIALOGTIMERANGEBRUSHED, msg);
    },
    onDialogTimeRangeBrushed: function(callback){
      this.$on(this.DIALOGTIMERANGEBRUSHED, function(msg){
        callback(msg);
      })
    },


    //------------------------------------------------------------
    //When time range in time series view is selected this will trigger
    //msg{start: sec, end: sec}
    emitLabelUpdate: function(msg){
      this.$emit(this.LABELUPDATE, msg);
    },
    onLabelUpdate: function(callback){
      this.$on(this.LABELUPDATE, function(msg){
        callback(msg);
      })
    },

  }
});

export default pipeService

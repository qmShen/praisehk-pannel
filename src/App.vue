<template>
  <div id="app">
    <MainView/>
  </div>
</template>

<script>
  import MainView from './components/MainView.vue'
  export default {
    name: 'App',
    components: {
      MainView
    }
  }
</script>

<style>
  #app {
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: calc(98vh - 0px);
  }
  .boundary{
    border-style: dashed;
    border-color: #d3dce6;
    border-width: 1px;
  }

  .mini_head{
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    background: rgb(243,243,243);
    width: 100%;
    height: 20px;
  }
</style>

<template>
  <div id="container" class="container" @mousemove="getLocation">

  </div>
</template>

<script>
import {SceneCreator} from "@/utils/scene";
import * as THREE from "three";
const ThreeBSP = require('tthreebsp')(THREE);
export default {
  name: "ThreeFloorOne",
  mounted() {
    setTimeout(this.createScene, 100);
  },
  data(){
    return{
      mouseX: 0,
      mouseY: 0,
      creator: null,
      materialBuffer: null,
      objectBuffer: null,
    }
  },
  beforeDestroy() {
    this.creator = null;
  },
  methods: {
    createScene() {
      this.creator = new SceneCreator(document.getElementById('container'));
      this.creator.init();

    },
    getLocation(e){
      // console.log(e.offsetX, e.offsetY)
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;
    }
  }
}
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 0;
}
</style>
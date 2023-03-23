<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script> -->

<template>
  <div class="wrapper">
    <div class="left">
      <input v-model="leftValue"/>
      <div>test</div>
    </div>
    <div class="right">
      <input v-model="rightValue"/>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
const leftValue = ref("")
const rightValue = ref("")
</script>
<style scoped lang="less">
.wrapper{
  display: flex;
  align-items: center;
}

</style>

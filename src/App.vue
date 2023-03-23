<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script> -->

<template>
  <div class="wrapper">
    <div class="left">
      <div> 输入keys，以英文逗号分隔</div>
      <a-textarea v-model:value="leftValue"  rows="6"/>
      <a-button class="btn" @click="add" type="primary">Add</a-button>
      <div class="listWrapper" v-if="keysList?.length">
        <div :class="['item', (selected === index) && 'select']" v-for="(i, index) in keysList" @click="select(index)">
          <div class="desc">{{ i }}</div>
          <a-button @click="(e) => {e.stopPropagation(); deleteItem(index)}" type="text" danger> 删除</a-button>
        </div>
      </div>
    </div>
    <div class="right">
      <div> 输入JSON </div>
      <a-textarea v-model:value="rightValue" rows="10" />
    </div>
  </div>
</template>
<script setup>
import { ref, toRaw } from 'vue'
import { message } from 'ant-design-vue';
const leftValue = ref("")
const rightValue = ref("")
let store = localStorage.getItem('list');
const selected = ref(null)
if(store){
  try{
    store = JSON.parse(store)
  }catch(e){
    store = localStorage.setItem('list', '');
    window.location.reload()
  }
}else{
  store = []
}
const keysList = ref(store)
function add() {
  let value = leftValue.value;
  value = value.trim();
  if (!value) {
    message.error('请输入内容！！！')
  } else {
    keysList.value = [value, ...keysList.value]
    localStorage.setItem('list', JSON.stringify(toRaw(keysList.value)) )
  }
}

function deleteItem(index){
  keysList.value.splice(index, 1);
  localStorage.setItem('list', JSON.stringify(toRaw(keysList.value)) )
  if(index === selected.value){
    selected.value = null;
  }
  if(index < selected.value){
    selected.value = selected.value - 1
  }
}

function select(index){
  selected.value = index;
}

</script>
<style scoped lang="less">
.wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: space-around;

  // align-items: center;
  .left {
    margin-top: 20px;
    width: 40%;

    .listWrapper {
      width: 100%;

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;

        &:hover {
          background-color: #eee;
        }

        .desc{
          word-break: break-all;
        }
      }

      .select{
        border-color: rgb(90, 90, 199);
      }
    }
  }

  .right {
    width: 50%;
    // padding: 20px;
    margin-top: 20px;
  }

  .btn {
    margin-top: 10px
  }
}
</style>

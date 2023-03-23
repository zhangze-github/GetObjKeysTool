<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script> -->

<template>
  <div class="wrapper">
    <div class="left">
      <div> 输入keys，以英文逗号分隔， eg: a,b</div>
      <div> 支持定义多个层级，以英文句号分隔，eg: a.b</div>
      <a-textarea v-model:value="leftValue" rows="6" />
      <a-button class="btn" @click="add" type="primary">Add</a-button>
      <div class="listWrapper" v-if="keysList?.length">
        <div :class="['item', (selected === index) && 'select']" v-for="(i, index) in keysList" @click="select(index)">
          <div class="desc">{{ i }}</div>
          <a-button @click="(e) => { e.stopPropagation(); deleteItem(index) }" type="text" danger>删除</a-button>
        </div>
      </div>
    </div>
    <div class="right">
      <div> 输入JSON </div>
      <a-textarea v-model:value="rightValue" rows="10" />
      <a-table :dataSource="tableList" :columns="columns" v-if="tableList.length" :pagination="{hideOnSinglePage: true}" class="table"/>
    </div>
  </div>
</template>
<script setup>
import { ref, toRaw, watch } from 'vue'
import { message } from 'ant-design-vue';
import {get, isUndefined, isBoolean} from 'lodash';
const leftValue = ref("")
const rightValue = ref("")
let store = localStorage.getItem('list');
const selected = ref(null)
if (store) {
  try {
    store = JSON.parse(store)
  } catch (e) {
    store = localStorage.setItem('list', '');
    window.location.reload()
  }
} else {
  store = []
}
const keysList = ref(store)
const tableList = ref([])
const columns = [
  {
    title: 'KEY',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'VALUE',
    dataIndex: 'value',
    key: 'value',
  },
]


function add() {
  let value = leftValue.value;
  value = value.trim();
  if (!value) {
    message.error('请输入内容！！！')
  } else {
    keysList.value = [value, ...keysList.value]
    localStorage.setItem('list', JSON.stringify(toRaw(keysList.value)))
    leftValue.value = ''
    if(selected.value !== null){
      selected.value = selected.value + 1
    }
  }
}

function deleteItem(index) {
  keysList.value.splice(index, 1);
  localStorage.setItem('list', JSON.stringify(toRaw(keysList.value)))
  if (index === selected.value) {
    selected.value = null;
  }
  if (index < selected.value) {
    selected.value = selected.value - 1
  }
}

function select(index) {
  selected.value = index;
}

watch([selected, rightValue] , () => {
  let obj = {};
  if(!rightValue.value){
    message.error('请输入右侧 JSON')
    tableList.value = []
    return;
  }
  try{
    obj = JSON.parse(rightValue.value);
  }catch(e){
    message.error('JSON 解析失败')
    tableList.value = []
    return;
  }
  let key = get(keysList.value, selected.value, '');
  if (!key){
    message.error('请选中一个key list')
    tableList.value = []
    return;
  }
  let returnArr = []
  key.split(',').map(item => {
    let value = get(obj, item);
    if(!isUndefined(value)){
      if(isBoolean(value)){
        returnArr.push({key: item, value: JSON.stringify(value)})
      }else{
        returnArr.push({key: item, value: value})
      }
    }
  })
  tableList.value = returnArr;
})

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

        .desc {
          word-break: break-all;
        }
      }

      .select {
        border-color: rgb(90, 90, 199);
      }
    }
  }

  .right {
    width: 50%;
    // padding: 20px;
    margin-top: 20px;
    .table{
      margin-top: 20px;
    }
  }

  .btn {
    margin-top: 10px
  }
}
</style>

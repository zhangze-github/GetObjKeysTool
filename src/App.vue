<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script> -->

<template>
  <div class="wrapper">
    <div class="left">
      <div>解析框</div>
      <a-textarea v-model:value="leftAdvanceValue" rows="6"/>
      <div>
        <a-button class="btn" @click="addAdvance" type="primary">解析</a-button>
        <a-button class="btn" @click="addAdvanceForClipboard" type="primary" style="margin-left: 20px">使用剪贴板填入 & 解析</a-button>
      </div>
     
      <div> 输入框，以回车或者英文逗号为分割，注意每个参数间不能有多个回车</div>
      <div> 支持定义多个层级，以英文句号分隔，eg: a.b</div>
      <a-textarea v-model:value="leftValue" rows="6"/>
      <a-button class="btn" @click="add" type="primary">ADD</a-button>
      <div class="listWrapper" v-if="keysList?.length">
        <div :class="['item', (selected === index) && 'select']" v-for="(i, index) in keysList" @click="select(index)">
          <div class="desc">{{ i }}</div>
          <a-button @click="(e) => { e.stopPropagation(); deleteItem(index) }" type="text" danger>删除</a-button>
        </div>
      </div>
    </div>
    <div class="right">
      <div> 输入JSON</div>
      <a-textarea v-model:value="rightValue" rows="10"/>
      <div class="action">
        <a-button @click="autoFill" type="primary">使用剪贴板填入</a-button>
      </div>
      <a-table :dataSource="tableList" :columns="columns" v-if="tableList.length"
               :pagination="{hideOnSinglePage: true, defaultPageSize: 100}" class="table">

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'value'">
            <span v-if="record.value === '参数未上报'" style="color: #f40">
              {{ record.value }}
            </span>
            <span v-else>
              {{ record.value }}
            </span>
          </template>
        </template>
      </a-table>

    </div>
  </div>
</template>
<script setup>
import {ref, toRaw, watch} from 'vue'
import {message} from 'ant-design-vue';
import {get, isUndefined, isBoolean, isNull} from 'lodash';

message.config({
  duration: 1,
  maxCount: 2,
});

const leftValue = ref("")
const rightValue = ref("")
const leftAdvanceValue = ref('');
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
    title: '',
    dataIndex: 'index',
    key: 'index',
    width: "18px"
  },
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
  value = value.replaceAll(/\n/g, ",")
  if (!value) {
    message.error('请输入内容！！！')
  } else {
    keysList.value = [value, ...keysList.value]
    localStorage.setItem('list', JSON.stringify(toRaw(keysList.value)))
    leftValue.value = ''
    leftAdvanceValue.value = ''
    if (selected.value !== null) {
      selected.value = selected.value + 1
    }
  }
}

async function addAdvanceForClipboard(){
  let text = '';
  try{
    text = await navigator.clipboard.readText(); 
  }catch(e){
    message.error('获取剪贴板内容失败')
    return;
  }
  if(!text){
    message.error('获取剪贴板值为空')
    return;
  }
  leftAdvanceValue.value = text;
  addAdvance()
}

function addAdvance() {
  let value = leftAdvanceValue.value;
  value = value.trim();
  if (!value) {
    message.error('请输入内容！！！')
    return;
  }
  let listArr = value.split("\n");
  let retrunArr = [];
  listArr.map(item => {
    // let str = item?.split('、')[1];
    // // console.log('1111')
    // // console.log(str)
    // str = str?.split('（')[0]
    // // console.log('222')
    // // console.log(str)
    // str = str?.trim();
   
    // str && retrunArr.push(str);
    console.log(item)
    console.log(item.match(/[a-zA-Z_]+/))
    let s =  get(item.match(/[a-zA-Z_]+/), '0', '')
    console.log(s)
    if(s){
      retrunArr.push(s);
    } 
  })
  if (retrunArr.length === 0) {
    message.error('解析失败！！！')
    return;
  }

  message.success(`成功解析${retrunArr.length}个参数`)
  leftValue.value = retrunArr.join('\n')
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

 async function autoFill(){
  let text = '';
  try{
    text = await navigator.clipboard.readText(); 
  }catch(e){
    message.error('获取剪贴板内容失败')
    return;
  }
  if(!text){
    message.error('获取剪贴板值为空')
    return;
  }
  rightValue.value = text
}

watch([selected, rightValue], () => {
  let obj = {};
  if (!rightValue.value) {
    message.error('请输入右侧 JSON')
    tableList.value = []
    return;
  }
  try {
    obj = JSON.parse(rightValue.value);
  } catch (e) {
    message.error('JSON 解析失败')
    tableList.value = []
    return;
  }
  let key = get(keysList.value, selected.value, '');
  if (!key) {
    message.error('请选中一个key list')
    tableList.value = []
    return;
  }
  let returnArr = []
  let i = 1;
  key.split(',').map(item => {
    item = item.trim();
    if (!item) {
      message.error('检测到有key值为空，请检查所选keyList')
      return;
    }
    let value = get(obj, item)
    if(isUndefined(value)){
      value = get(obj, ['params', item])
    }
    if (!isUndefined(value)) {
      if (isBoolean(value)) {
        returnArr.push({index: i, key: item, value: JSON.stringify(value)})
      } else if(isNull(value)){
        returnArr.push({index: i, key: item, value: 'null'})
      }else{
        returnArr.push({index: i, key: item, value: value})
      }
    } else {
      returnArr.push({index: i, key: item, value: "参数未上报"})
    }
    i++;
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

    .table {
      margin-top: 20px;
    }

    .action{
      margin: 10px 0;
    }
  }

  .btn {
    margin-top: 10px;
    margin-bottom: 10px;
  }
}
</style>

<style>
.ant-message-notice-content {
  margin-left: -240px !important;
}
</style>

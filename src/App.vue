<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script> -->

<template>
  <div class="wrapper">
    <div class="left">
      <!-- <div>解析框</div> -->
      <a-typography-title :level="5">Key 解析框</a-typography-title>
      <a-textarea v-model:value="leftAdvanceValue" rows="6"/>
      <div>
        <a-button class="btn" @click="addAdvance" type="primary">解析</a-button>
        <a-button class="btn" @click="addAdvanceForClipboard" type="primary" style="margin-left: 20px">使用剪贴板填入 & 解析</a-button>
        <a-button class="btn" @click="addAdvanceForClipboardUniq" type="primary" style="margin-left: 20px">使用剪贴板填入 & 解析 & 去重</a-button>
      </div>
      <a-divider />
      <a-typography-title :level="5">Key 输入框</a-typography-title>
      <div> 以回车或者英文逗号为分割，注意每个参数间不能有多个回车</div>
      <a-textarea v-model:value="leftValue" rows="6"/>
      <a-button class="btn" @click="add" type="primary">添加到列表</a-button>
      <a-divider v-if="keysList?.length"/>
      <div class="listWrapper" v-if="keysList?.length">
        <div :class="['item', (selected === index) && 'select']" v-for="(i, index) in keysList" @click="select(index)">
          <div class="desc">{{ i }}</div>
          <a-button @click="(e) => { e.stopPropagation(); deleteItem(index) }" type="text" danger>删除</a-button>
        </div>
      </div>
    </div>
    <div class="right">
      <!-- <div> 输入JSON</div> -->
      <a-typography-title :level="5">JSON 输入框</a-typography-title>
      <a-textarea v-model:value="rightValue" rows="10"/>
      <div class="action">
        <a-button @click="autoFill" type="primary">使用剪贴板填入</a-button>
      </div>
      <a-divider  v-if="tableList.length"/>
      <a-table :dataSource="tableList" :columns="columns" v-if="tableList.length"
               :pagination="{hideOnSinglePage: true, defaultPageSize: 100}" class="table"
               :row-key="() => generateRandomString()"
               >
        <template #bodyCell="{ column, record }" :key="generateRandomString()">
          <template v-if="column.key === 'value'">
            <span v-if="record.value === '参数未上报'" style="color: #ff4d4f">
              {{ record.value }}
            </span>
            <span v-else>
              <span :class="isNumber(record.value) && 'number-element'">
                {{ record.value }}
              </span>
            
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
import {get, isUndefined, isBoolean, isNull, trim, toNumber, isNaN, uniq, rando, isNumber} from 'lodash';

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

async function addAdvanceForClipboardUniq(){
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
  addAdvance(true)
}


function addAdvance(flag) {
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
    console.log(item.match(/[a-zA-Z_0-9]+/g))
    let s =  get(item.match(/[a-zA-Z_0-9]+/g), '0', '')
    console.log(s)
    if(s){
      if(!isNaN(toNumber(s))){
        s =  get(item.match(/[a-zA-Z_0-9]+/g), '1', '')
        s && retrunArr.push(s);
      }else{
        retrunArr.push(s);
      }
    } 
  })
  if (retrunArr.length === 0) {
    message.error('解析失败！！！')
    return;
  }
  if(flag){
    retrunArr = uniq(retrunArr)
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
  try {
    obj = JSON.parse( trim(rightValue.value) || "{}" );
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

function generateRandomString() {
  let lenth = 20;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

</script>
<style scoped lang="less">
.wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;

  // align-items: center;
  .left {
    margin-top: 20px;
    width: 42%;

    .listWrapper {
      width: 100%;

      max-height: 650px;
      overflow-y: scroll;
      padding: 10px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      border-radius: 4px;


      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 5px;
        margin-bottom: 5px;
        border: 1px solid #ccc;
        border-radius: 10px;
        padding: 10px;

        &:hover {
          box-shadow: #64646f33 0px 7px 29px 0px;
        }

        .desc {
          word-break: break-all;
          cursor: pointer;
        }
      }

      .select {
        border-color: #3277de;
        box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      }


    }
  }

  .right {
    width: 52%;
    // padding: 20px;
    margin-top: 20px;
    .table {
      margin-top: 20px;
      margin-bottom: 100px;
      .number-element{
        background-color: #dfbefd;
        padding: 6px;
        border-radius: 4px;
      }
    }

    .action{
      margin-top: 10px;
    }
  }

  .btn {
    margin-top: 10px;
    margin-bottom: 0px;
  }
}
</style>

<style>
.ant-message-notice-content {
  margin-left: -260px !important;
}

.ant-divider-horizontal{
  margin: 14px 0 !important;
}
</style>

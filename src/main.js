import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Antd from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.less'
import "./theme.less";


createApp(App).use(Antd).mount('#app')

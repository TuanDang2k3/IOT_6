// Sửa lại import cho Vue Router 3 (dành cho Vue 2)
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './views/Home.vue'
import Devices from './views/Devices.vue'
import Channels from './views/Channels.vue'
import SensorDataView from './views/SensorDataView.vue'
import Commands from './views/Commands.vue'

// Đăng ký VueRouter plugin
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/devices',
    name: 'Devices',
    component: Devices
  },
  {
    path: '/channels',
    name: 'Channels',
    component: Channels
  },
  {
    path: '/sensor-data',
    name: 'SensorData',
    component: SensorDataView
  },
  {
    path: '/sensor-data/:id',
    name: 'ChannelData',
    component: SensorDataView
  },
  {
    path: '/commands',
    name: 'Commands',
    component: Commands
  }
]

// Sửa lại cách tạo router cho Vue Router 3
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
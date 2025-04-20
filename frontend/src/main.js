import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'

// Hằng số toàn cục
Vue.config.productionTip = false

// Định nghĩa biến toàn cục
Vue.prototype.$currentDate = '2025-03-23'
Vue.prototype.$currentUser = 'Tuan'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
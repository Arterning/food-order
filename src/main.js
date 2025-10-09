import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import store from './store'

Vue.config.productionTip = false

App.mpType = 'app'

// 添加全局导航守卫
const app = new Vue({
  store,
  ...App,
  onLaunch() {
    // 监听路由变化，实现登录验证
    uni.addInterceptor('navigateTo', {
      invoke: (options) => {
        checkLogin(options)
      }
    })
    
    uni.addInterceptor('redirectTo', {
      invoke: (options) => {
        checkLogin(options)
      }
    })
    
    uni.addInterceptor('switchTab', {
      invoke: (options) => {
        checkLogin(options)
      }
    })
    
    // 检查登录状态的函数
    function checkLogin(options) {
      // 获取当前页面路径
      const currentPath = getCurrentPages().length > 0 ? getCurrentPages()[getCurrentPages().length - 1].route : ''
      // 不需要登录的页面列表
      const noNeedLoginPages = ['pages/login/index']
      // 如果目标页面需要登录且用户未登录，则跳转到登录页面
      if (!noNeedLoginPages.includes(options.url.replace(/^\//, '')) && 
          !noNeedLoginPages.includes(currentPath) && 
          !uni.getStorageSync('token')) {
        // 保存当前页面路径，方便登录后返回
        uni.setStorageSync('redirectAfterLogin', options.url)
        // 跳转到登录页面
        uni.redirectTo({
          url: '/pages/login/index'
        })
        // 阻止原页面跳转
        return false
      }
      return true
    }
  }
})
app.$mount()

import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import store from './store'

Vue.config.productionTip = false

App.mpType = 'app'

// 检查登录状态的函数
function checkLogin(options) {
  console.log('checkLogin', options)
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

// 添加全局导航守卫
const app = new Vue({
  store,
  ...App,
  onLaunch() {
    uni.addInterceptor('request', {
      invoke(args) {
        // request 触发前拼接 url
        console.log('request', args)
      },
      success(args) {
        // 请求成功后，修改code值为1
        console.log('success', args.statusCode)
        if (args.statusCode === 401) {
          // 401 表示未登录，跳转到登录页面
          uni.redirectTo({
            url: '/pages/login/index'
          })
        }
      },
      fail(err) {
        console.log('interceptor-fail',err)
      },
      complete(res) {
        console.log('interceptor-complete',res)
      }
    })
    // 监听路由变化，实现登录验证
    uni.addInterceptor('navigateTo', {
      invoke: (options) => {
        console.log('navigateTo', options)
        return checkLogin(options)
      }
    })
    
    uni.addInterceptor('redirectTo', {
      invoke: (options) => {
        console.log('redirectTo', options)
        return checkLogin(options)
      }
    })
    
    uni.addInterceptor('switchTab', {
      invoke: (options) => {
        console.log('switchTab', options)
        return checkLogin(options)
      }
    })
  }
})
app.$mount()

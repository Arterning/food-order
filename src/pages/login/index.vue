<template>
  <view class="login-container">
    <view class="logo-area">
      <image src="/static/logo.png" class="logo" mode="aspectFit"></image>
      <text class="app-name">家庭点菜</text>
    </view>
    
    <view class="form-container">
      <!-- 用户名输入 -->
      <view class="input-item">
        <view class="input-icon">
          <image src="/static/user.png" mode="aspectFit"></image>
        </view>
        <input 
          class="input" 
          v-model="loginForm.username" 
          placeholder="请输入用户名" 
          placeholder-class="placeholder"
        />
      </view>
      
      <!-- 密码输入 -->
      <view class="input-item">
        <view class="input-icon">
          <image src="/static/lock.png" mode="aspectFit"></image>
        </view>
        <input 
          class="input" 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入密码" 
          placeholder-class="placeholder"
        />
      </view>
      
      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :disabled="isSubmitting || !isFormValid"
        @tap="handleLogin"
      >
        {{ isSubmitting ? '登录中...' : '登录' }}
      </button>
      
      <!-- 错误提示 -->
      <view class="error-message" v-if="errorMessage">
        {{ errorMessage }}
      </view>
    </view>
  </view>
</template>

<script>
import { getApiUrl, API_PATHS } from '../../api/config'

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      isSubmitting: false,
      errorMessage: ''
    }
  },
  computed: {
    // 表单验证
    isFormValid() {
      return this.loginForm.username.trim() && this.loginForm.password.trim()
    }
  },
  methods: {
    // 处理登录
    async handleLogin() {
      if (!this.isFormValid || this.isSubmitting) return
      
      this.isSubmitting = true
      this.errorMessage = ''
      
      try {
        // 发送登录请求
        const res = await uni.request({
          url: getApiUrl(API_PATHS.login),
          method: 'POST',
          data: this.loginForm
        })
        
        if (res.statusCode === 200 && res.data.token) {
          // 保存token到本地存储
          uni.setStorageSync('token', res.data.token)

          // 保存用户信息到本地存储
          uni.setStorageSync('user', res.data.user)
          
          // 显示成功提示
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 获取登录前想要访问的页面
          const redirectUrl = uni.getStorageSync('redirectAfterLogin')
          
          // 延迟跳转
          setTimeout(() => {
            if (redirectUrl) {
              // 跳转到登录前想要访问的页面
              uni.navigateTo({
                url: redirectUrl
              })
              // 清除重定向地址
              uni.removeStorageSync('redirectAfterLogin')
            } else {
              // 默认跳转到菜谱页面
              uni.switchTab({
                url: '/pages/menu/index'
              })
            }
          }, 1500)
        } else {
          this.errorMessage = res.data?.error || '登录失败，请重试'
        }
      } catch (error) {
        console.error('登录请求失败', error)
        this.errorMessage = '网络错误，请检查网络连接'
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 60rpx 40rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 100rpx 0;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.form-container {
  flex: 1;
}

.input-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 30rpx;
  padding: 0 20rpx;
  height: 100rpx;
}

.input-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon image {
  width: 40rpx;
  height: 40rpx;
}

.input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
  color: #333;
  padding-left: 20rpx;
}

.placeholder {
  color: #999;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  background-color: #ff6b35;
  color: #fff;
  font-size: 34rpx;
  border-radius: 50rpx;
  margin-top: 50rpx;
}

.login-btn:disabled {
  background-color: #ccc;
}

.error-message {
  color: #ff4d4f;
  font-size: 28rpx;
  text-align: center;
  margin-top: 20rpx;
}
</style>
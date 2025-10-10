<template>
  <view class="cart-container">
    <view class="header">
      <text class="title">购物车</text>
    </view>
    
    <!-- 购物车列表 -->
    <view class="cart-section">
      <text class="section-title">我的购物车</text>
      <view class="cart-list" v-if="cart.length > 0">
        <view class="cart-item" v-for="(item, index) in cart" :key="`${item.id}-${index}`">
          <image :src="item.image" mode="aspectFill" class="cart-image"></image>
          <view class="cart-info">
            <text class="cart-name">{{ item.name }}</text>
            <text class="cart-ingredients">{{ item.ingredients }}</text>
          </view>
          <view class="remove-button" @click="removeFromCart(index)">
            <text>×</text>
          </view>
        </view>
      </view>
      <view class="empty-cart" v-else>
        <text>购物车是空的</text>
      </view>
    </view>
    
    <!-- 提交订单按钮 -->
    <view class="submit-section">
      <button class="submit-button" @click="submitOrder" :disabled="cart.length === 0">
        提交订单
      </button>
    </view>
  </view>
</template>

<script>
import { API_PATHS, request } from '../../api/config'

export default {
  data() {
    return {
      // 购物车数据
      cart: []
    }
  },
  onShow() {
    // 在页面显示时加载购物车数据
    this.loadCartFromStorage()
  },
  methods: {
    // 从本地存储加载购物车数据
    loadCartFromStorage() {
      try {
        const cartData = uni.getStorageSync('cart')
        if (cartData) {
          this.cart = JSON.parse(cartData)
        }
      } catch (e) {
        console.error('加载购物车数据失败', e)
      }
    },
    
    // 从购物车移除
    removeFromCart(index) {
      this.cart.splice(index, 1)
      this.saveCartToStorage()
    },
    
    // 保存购物车数据到本地存储
    saveCartToStorage() {
      try {
        uni.setStorageSync('cart', JSON.stringify(this.cart))
      } catch (e) {
        console.error('保存购物车数据失败', e)
      }
    },
    
    // 提交订单到后端API
    async submitOrder() {
      if (this.cart.length === 0) {
        uni.showToast({
          title: '购物车为空',
          icon: 'none'
        })
        return
      }
      
      try {
        // 显示加载提示
        uni.showLoading({ title: '提交中' })
        
        // 准备订单数据 - 提取recipe_ids
        const recipeIds = this.cart.map(item => item.id)
        
        // 发送请求到后端API创建订单
        const res = await request({
          url: API_PATHS.orders,
          method: 'POST',
          data: {
            recipe_ids: recipeIds
          }
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 201 && res.data) {
          // 清空购物车
          this.cart = []
          
          // 保存购物车数据
          this.saveCartToStorage()
          
          // 提示订单提交成功
          uni.showToast({
            title: '订单提交成功',
            icon: 'success'
          })
          
          // 跳转到订单页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/orders/index'
            })
          }, 1500)
        } else {
          // 处理错误情况
          const errorMessage = res.data?.error || '订单提交失败'
          uni.showToast({
            title: errorMessage,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交订单失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    }
  },
  onLoad() {
    // 从本地存储加载购物车数据
    this.loadCartFromStorage()
  }
}
</script>

<style scoped>
.cart-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  padding: 30rpx 0;
  text-align: center;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  margin: -20rpx -20rpx 30rpx -20rpx;
  padding: 30rpx 20rpx;
}

.header .title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin: 30rpx 0 20rpx 0;
  display: block;
}

/* 购物车样式 */
.cart-section {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
}

.cart-info {
  flex: 1;
  padding-left: 20rpx;
}

.cart-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.cart-ingredients {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 10rpx;
}

.remove-button {
  width: 60rpx;
  height: 60rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.empty-cart {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 提交订单按钮 */
.submit-section {
  margin-top: 30rpx;
}

.submit-button {
  background-color: #ff6b35;
  color: #fff;
  font-size: 32rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
}

.submit-button[disabled] {
  background-color: #ccc;
}
</style>
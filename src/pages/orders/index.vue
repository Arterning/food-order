<template>
  <view class="order-container">
    <view class="order-header">
      <text class="header-title">我的订单</text>
    </view>
    
    <!-- 购物车列表 -->
    <view class="cart-section">
      <text class="section-title">购物车</text>
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
    
    <!-- 历史订单 -->
    <view class="history-section" v-if="orders.length > 0">
      <text class="section-title">历史订单</text>
      <view class="order-history">
        <view class="history-item" v-for="order in orders" :key="order.id">
          <view class="order-header">
            <text class="order-time">{{ formatDate(order.createTime) }}</text>
            <text class="order-status" :class="order.status">
              {{ order.status === 'pending' ? '待处理' : '已完成' }}
            </text>
            <button 
              class="complete-button" 
              v-if="order.status === 'pending'" 
              @click="completeOrder(order.id)"
            >
              标记完成
            </button>
          </view>
          <view class="order-items">
            <view class="order-item" v-for="item in order.items" :key="item.id">
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 购物车数据
      cart: [],
      // 订单历史
      orders: []
    }
  },
  methods: {
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
    
    // 提交订单
    submitOrder() {
      if (this.cart.length === 0) {
        uni.showToast({
          title: '购物车为空',
          icon: 'none'
        })
        return
      }
      
      // 创建新订单
      const newOrder = {
        id: Date.now(), // 使用时间戳作为订单ID
        createTime: new Date(),
        status: 'pending', // pending: 待处理, completed: 已完成
        items: [...this.cart]
      }
      
      // 添加到订单历史
      this.orders.unshift(newOrder)
      
      // 清空购物车
      this.cart = []
      
      // 保存数据到本地存储
      this.saveOrdersToStorage()
      this.saveCartToStorage()
      
      // 提示订单提交成功
      uni.showToast({
        title: '订单提交成功',
        icon: 'success'
      })
    },
    
    // 保存订单历史到本地存储
    saveOrdersToStorage() {
      try {
        // 将Date对象转换为字符串
        const ordersToSave = this.orders.map(order => ({
          ...order,
          createTime: order.createTime.toISOString()
        }))
        uni.setStorageSync('orders', JSON.stringify(ordersToSave))
      } catch (e) {
        console.error('保存订单数据失败', e)
      }
    },
    
    // 格式化日期
    formatDate(date) {
      if (typeof date === 'string') {
        date = new Date(date)
      }
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    // 标记订单为已完成
    completeOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.status = 'completed'
        this.saveOrdersToStorage()
        uni.showToast({
          title: '订单已完成',
          icon: 'success'
        })
      }
    }
  },
  onLoad() {
    // 从本地存储加载购物车数据
    try {
      const cartData = uni.getStorageSync('cart')
      if (cartData) {
        this.cart = JSON.parse(cartData)
      }
    } catch (e) {
      console.error('加载购物车数据失败', e)
    }
    
    // 从本地存储加载订单历史
    try {
      const ordersData = uni.getStorageSync('orders')
      if (ordersData) {
        // 将字符串转换回Date对象
        this.orders = JSON.parse(ordersData).map(order => ({
          ...order,
          createTime: new Date(order.createTime)
        }))
      }
    } catch (e) {
      console.error('加载订单数据失败', e)
    }
  }
}
</script>

<style scoped>
.order-container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.order-header {
  padding: 30rpx 0;
  text-align: center;
}

.header-title {
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

/* 历史订单样式 */
.history-section {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-top: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-history {
  max-height: 600rpx;
  overflow-y: auto;
}

.history-item {
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  font-size: 24rpx;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.order-status.pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.order-status.completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.complete-button {
  font-size: 24rpx;
  background-color: #1890ff;
  color: #fff;
  padding: 5rpx 20rpx;
  border-radius: 20rpx;
  min-height: 0;
  line-height: 1.5;
}

.order-items {
  margin-top: 20rpx;
}

.order-item {
  font-size: 26rpx;
  color: #333;
  padding: 10rpx 0;
}
</style>
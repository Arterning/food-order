<template>
  <view class="order-container">
    <view class="order-header">
      <text class="header-title">我的订单</text>
    </view>
    
    <!-- 待处理订单 -->
    <view class="pending-section" v-if="orders.filter(o => o.status === 'pending').length > 0">
      <text class="section-title">待处理订单</text>
      <view class="order-history">
        <view class="history-item" v-for="order in orders.filter(o => o.status === 'pending')" :key="order.id">
          <view class="order-header">
            <text class="order-time">{{ formatDate(order.created_at) }}</text>
            <text class="order-username">{{ order.username || '用户' }}</text>
            <text class="order-status" :class="order.status">
              {{ order.status === 'pending' ? '待处理' : '已完成' }}
            </text>
          </view>
          <view class="order-items">
            <view class="order-item" v-for="item in order.items" :key="item.id">
              <text>{{ item.recipe_name }}</text>
            </view>
            <button 
              class="complete-button" 
              v-if="order.status === 'pending'" 
              @click="completeOrder(order.id)"
            >
              标记完成
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 历史订单 -->
    <view class="history-section" v-if="orders.filter(o => o.status === 'completed').length > 0">
      <text class="section-title">历史订单</text>
      <view class="order-history">
        <view class="history-item" v-for="order in orders.filter(o => o.status === 'completed')" :key="order.id">
          <view class="order-header">
            <text class="order-time">{{ formatDate(order.created_at) }}</text>
            <text class="order-username">{{ order.username || '用户' }}</text>
            <text class="order-status" :class="order.status">
              {{ order.status === 'pending' ? '待处理' : '已完成' }}
            </text>
          </view>
          <view class="order-items">
            <view class="order-item" v-for="item in order.items" :key="item.id">
              <text>{{ item.recipe_name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空订单提示 -->
    <view class="empty-orders" v-if="orders.length === 0">
      <text>暂无订单记录</text>
    </view>
  </view>
</template>

<script>
import { API_PATHS, request } from '../../api/config'

export default {
  data() {
    return {
      // 订单历史
      orders: []
    }
  },
  methods: {
    // 从API获取订单数据
    async fetchOrdersFromAPI() {
      try {
        // 显示加载提示
        uni.showLoading({ title: '加载中' })
        
        // 发送请求获取订单数据
        const res = await request({
          url: API_PATHS.orders,
          method: 'GET'
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200 && res.data) {
          this.orders = res.data
        } else {
          uni.showToast({
            title: '订单数据加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取订单失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) {
        const date = new Date()
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
      }
      
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    // 标记订单为已完成
    async completeOrder(orderId) {
      try {
        // 显示加载提示
        uni.showLoading({ title: '处理中' })
        
        // 发送请求更新订单状态
        const res = await request({
          url: `${API_PATHS.orders}/${orderId}/complete`,
          method: 'PUT'
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200) {
          // 更新本地订单数据
          const order = this.orders.find(o => o.id === orderId)
          if (order) {
            order.status = 'completed'
          }
          
          uni.showToast({
            title: '订单已完成',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '更新订单状态失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新订单状态失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    }
  },
  onLoad() {
    // 从API获取订单数据
    this.fetchOrdersFromAPI()
  },
  
  // 下拉刷新事件
  onPullDownRefresh() {
    // 重新获取订单数据
    this.fetchOrdersFromAPI().finally(() => {
      // 结束下拉刷新动画
      uni.stopPullDownRefresh()
    })
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

/* 订单区块样式 */
.pending-section,
.history-section {
  padding: 20rpx 0;
  margin-top: 30rpx;
}

.order-history {
  max-height: 600rpx;
  overflow-y: auto;
}

.history-item {
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.history-item:last-child {
  margin-bottom: 0;
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
  margin-right: 10rpx;
}

.order-username {
  font-size: 24rpx;
  color: #333;
  margin-right: 10rpx;
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
  display: flex;
  flex-direction: column;
  position: relative;
}

.complete-button {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 24rpx;
  background-color: #1890ff;
  color: #fff;
  padding: 5rpx 20rpx;
  border-radius: 20rpx;
  min-height: 0;
  line-height: 1.5;
}

.order-item {
  font-size: 26rpx;
  color: #333;
  padding: 10rpx 0;
}

.empty-orders {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
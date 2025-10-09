<template>
  <view class="profile-container">
    <view class="header">
      <text class="title">我的</text>
    </view>
    
    <view class="profile-content">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="avatar">
          <image src="https://picsum.photos/id/64/120/120" mode="aspectFill"></image>
        </view>
        <view class="user-info">
          <text class="user-name">家庭成员</text>
          <text class="user-desc">欢迎使用家庭点菜小程序</text>
        </view>
      </view>
      
      <!-- 功能列表 -->
      <view class="function-list">
        <view class="function-item" @tap="navigateToUpload">
          <view class="function-icon">
            <image src="/static/upload.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">上传菜谱</text>
          <view class="arrow">
            <image src="/static/arrow.png" mode="aspectFit"></image>
          </view>
        </view>
        
        <view class="function-item" @tap="navigateToCart">
          <view class="function-icon">
            <image src="/static/cart.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">我的购物车</text>
          <view class="arrow">
            <image src="/static/arrow.png" mode="aspectFit"></image>
          </view>
        </view>
        
        <view class="function-item" @tap="navigateToHistory">
          <view class="function-icon">
            <image src="/static/history.png" mode="aspectFit"></image>
          </view>
          <text class="function-name">历史订单</text>
          <view class="arrow">
            <image src="/static/arrow.png" mode="aspectFit"></image>
          </view>
        </view>
      </view>
      
      <!-- 说明文字 -->
      <view class="description">
        <text>这是一个家庭点菜小程序，方便家庭成员之间点餐和处理订单。</text>
        <text>您可以上传菜谱、查看订单状态，以及管理您的购物车。</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 个人信息数据可以在这里定义
    }
  },
  onLoad() {
    // 页面加载时的逻辑
  },
  methods: {
    // 跳转到上传菜谱页面
    navigateToUpload() {
      uni.navigateTo({
        url: '/pages/upload-recipe/index'
      })
    },
    // 跳转到购物车页面
    navigateToCart() {
      // 这里暂时先简单提示，后续会实现购物车页面
      uni.showToast({
        title: '购物车功能即将实现',
        icon: 'none'
      })
    },
    // 跳转到历史订单页面
    navigateToHistory() {
      uni.navigateTo({
        url: '/pages/orders/index'
      })
    }
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.profile-container .header {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.profile-container .header .title {
  font-size: 36rpx;
  font-weight: bold;
}

.profile-container .profile-content {
  flex: 1;
  padding: 30rpx;
}

.profile-container .profile-content .user-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.profile-container .profile-content .user-card .avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
}

.profile-container .profile-content .user-card .avatar image {
  width: 100%;
  height: 100%;
}

.profile-container .profile-content .user-card .user-info {
  margin-left: 30rpx;
}

.profile-container .profile-content .user-card .user-info .user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.profile-container .profile-content .user-card .user-info .user-desc {
  font-size: 28rpx;
  color: #666;
}

.profile-container .profile-content .function-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.profile-container .profile-content .function-list .function-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.profile-container .profile-content .function-list .function-item:last-child {
  border-bottom: none;
}

.profile-container .profile-content .function-list .function-item .function-icon {
  width: 60rpx;
  height: 60rpx;
}

.profile-container .profile-content .function-list .function-item .function-icon image {
  width: 100%;
  height: 100%;
}

.profile-container .profile-content .function-list .function-item .function-name {
  flex: 1;
  margin-left: 30rpx;
  font-size: 32rpx;
  color: #333;
}

.profile-container .profile-content .function-list .function-item .arrow {
  width: 40rpx;
  height: 40rpx;
}

.profile-container .profile-content .function-list .function-item .arrow image {
  width: 100%;
  height: 100%;
}

.profile-container .profile-content .description {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.profile-container .profile-content .description text {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15rpx;
}

.profile-container .profile-content .description text:last-child {
  margin-bottom: 0;
}
</style>
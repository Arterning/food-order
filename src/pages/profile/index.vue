<template>
  <view class="profile-container">
    <view class="header">
      <text class="title">我的</text>
    </view>
    
    <view class="profile-content">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="avatar" @tap="chooseAvatar">
          <image :src="userInfo.avatar_url || 'https://picsum.photos/id/64/120/120'" mode="aspectFill"></image>
          <view class="avatar-edit">
            <text>点击更换头像</text>
          </view>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.username || '家庭成员' }}</text>
          <text class="user-desc">欢迎使用家庭点菜小程序</text>
        </view>
        <view class="edit-button" @tap="showEditModal">
          <text>编辑资料</text>
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
    
    <!-- 修改用户信息模态框 -->
    <view class="modal" v-if="isEditModalVisible">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">修改个人信息</text>
          <text class="modal-close" @tap="closeEditModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">用户名</text>
            <input class="form-input" v-model="editForm.username" placeholder="请输入用户名" />
          </view>
          <view class="form-item">
            <text class="form-label">新密码</text>
            <input class="form-input" v-model="editForm.password" password type="password" placeholder="请输入新密码（留空则不修改）" />
            <text class="password-hint">密码至少6个字符</text>
          </view>
          <view class="form-item">
            <text class="form-label">确认密码</text>
            <input class="form-input" v-model="editForm.confirmPassword" password type="password" placeholder="请再次输入新密码" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-button" @tap="closeEditModal">取消</button>
          <button class="confirm-button" @tap="updateUserInfo">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { API_PATHS, request } from '../../api/config'

export default {
  data() {
    return {
      // 用户信息
      userInfo: {
        username: '',
        avatar_url: ''
      },
      // 编辑表单
      editForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      // 模态框显示状态
      isEditModalVisible: false
    }
  },
  onLoad() {
    // 页面加载时获取用户信息
    this.fetchUserInfo()
  },
  methods: {
    // 获取用户信息
    async fetchUserInfo() {
      try {
        // 显示加载提示
        uni.showLoading({ title: '加载中' })
        
        // 发送请求获取用户信息
        const res = await request({
          url: API_PATHS.user,
          method: 'GET'
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200 && res.data) {
          this.userInfo = res.data
        }
      } catch (error) {
        console.error('获取用户信息失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    },
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadAvatar(tempFilePath)
        }
      })
    },
    
    // 上传头像
    async uploadAvatar(filePath) {
      try {
        // 显示加载提示
        uni.showLoading({ title: '上传中' })
        
        // 上传文件
        const uploadRes = await uni.uploadFile({
          url: `${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}${API_PATHS.upload}`,
          filePath: filePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理上传结果
        const data = JSON.parse(uploadRes.data)
        if (uploadRes.statusCode === 200 && data.url) {
          // 更新用户头像
          this.updateUserAvatar(data.url)
        } else {
          uni.showToast({
            title: '上传头像失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('上传头像失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '上传头像失败',
          icon: 'none'
        })
      }
    },
    
    // 更新用户头像
    async updateUserAvatar(avatarUrl) {
      try {
        // 显示加载提示
        uni.showLoading({ title: '更新中' })
        
        // 发送请求更新用户头像
        const res = await request({
          url: API_PATHS.user,
          method: 'PUT',
          data: {
            avatar_url: avatarUrl
          }
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200 && res.data) {
          this.userInfo = res.data
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '更新头像失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新头像失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '更新头像失败',
          icon: 'none'
        })
      }
    },
    
    // 显示编辑模态框
    showEditModal() {
      // 初始化编辑表单
      this.editForm = {
        username: this.userInfo.username,
        password: '',
        confirmPassword: ''
      }
      this.isEditModalVisible = true
    },
    
    // 关闭编辑模态框
    closeEditModal() {
      this.isEditModalVisible = false
    },
    
    // 更新用户信息
    async updateUserInfo() {
      // 表单验证
      if (!this.editForm.username.trim()) {
        uni.showToast({
          title: '用户名不能为空',
          icon: 'none'
        })
        return
      }
      
      if (this.editForm.password) {
        if (this.editForm.password.length < 6) {
          uni.showToast({
            title: '密码至少6个字符',
            icon: 'none'
          })
          return
        }
        
        if (this.editForm.password !== this.editForm.confirmPassword) {
          uni.showToast({
            title: '两次输入的密码不一致',
            icon: 'none'
          })
          return
        }
      }
      
      try {
        // 显示加载提示
        uni.showLoading({ title: '更新中' })
        
        // 准备更新数据
        const updateData = {
          username: this.editForm.username
        }
        
        if (this.editForm.password) {
          updateData.password = this.editForm.password
        }
        
        // 发送请求更新用户信息
        const res = await request({
          url: API_PATHS.user,
          method: 'PUT',
          data: updateData
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200 && res.data) {
          this.userInfo = res.data
          this.isEditModalVisible = false
          uni.showToast({
            title: '信息更新成功',
            icon: 'success'
          })
        } else if (res.statusCode === 409) {
          uni.showToast({
            title: '用户名已存在',
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: '更新信息失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新用户信息失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '更新信息失败',
          icon: 'none'
        })
      }
    },
    
    // 跳转到上传菜谱页面
    navigateToUpload() {
      uni.navigateTo({
        url: '/pages/upload-recipe/index'
      })
    },
    // 跳转到购物车页面
    navigateToCart() {
      uni.navigateTo({
        url: '/pages/cart/index'
      })
    },
    // 跳转到历史订单页面
    navigateToHistory() {
      uni.switchTab({
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

.profile-container .profile-content .user-card .avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.profile-container .profile-content .user-card .avatar image {
  width: 100%;
  height: 100%;
}

.profile-container .profile-content .user-card .avatar-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 20rpx;
  padding: 10rpx 0;
  text-align: center;
}

.profile-container .profile-content .user-card .edit-button {
  margin-left: auto;
  padding: 10rpx 20rpx;
  background-color: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
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

  /* 模态框样式 */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .modal-content {
    background-color: #fff;
    width: 80%;
    border-radius: 16rpx;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
  }
  
  .modal-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .modal-close {
    font-size: 48rpx;
    color: #999;
    padding: 0 20rpx;
  }
  
  .modal-body {
    padding: 30rpx;
  }
  
  .form-item {
    margin-bottom: 30rpx;
  }
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 10rpx;
  }
  
  .form-input {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
  }
  
  .password-hint {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
  }
  
  .modal-footer {
    display: flex;
    padding: 30rpx;
    border-top: 1rpx solid #eee;
  }
  
  .cancel-button {
    flex: 1;
    height: 80rpx;
    background-color: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 8rpx;
    font-size: 32rpx;
    margin-right: 20rpx;
  }
  
  .confirm-button {
    flex: 1;
    height: 80rpx;
    background-color: #1890ff;
    color: #fff;
    border: none;
    border-radius: 8rpx;
    font-size: 32rpx;
  }

</style>
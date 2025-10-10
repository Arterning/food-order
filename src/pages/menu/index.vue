<template>
  <view class="menu-container">
    <!-- 左侧分类列表 -->
    <view class="category-list">
      <view 
        v-for="category in categories" 
        :key="category.id"
        class="category-item" 
        :class="{ active: selectedCategory === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </view>
    </view>
    
    <!-- 右侧菜品列表 -->
    <view class="food-list">
      <view class="food-item" v-for="food in filteredFoods" :key="food.id">
        <image :src="food.image" mode="aspectFill" class="food-image"></image>
        <view class="food-info">
          <text class="food-name">{{ food.name }}</text>
          <view class="food-details">
            <text class="food-ingredients">{{ food.ingredients }}</text>
            <view class="add-button" @click="addToCart(food)">
              <text>+</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 购物车悬浮按钮 -->
    <view class="cart-button" @click="goToCart">
      <text class="cart-text">购物车({{ cartCount }})</text>
    </view>
  </view>
</template>

<script>
import { API_PATHS, request } from '../../api/config'

export default {
  data() {
    return {
      // 分类列表
      categories: [
        { id: 'all', name: '全部' },
        { id: 'main', name: '主食' },
        { id: 'dish', name: '菜品' },
        { id: 'soup', name: '汤品' },
        { id: 'dessert', name: '甜点' },
        { id: 'drink', name: '饮品' }
      ],
      // 选中的分类
      selectedCategory: 'all',
      // 菜品列表 - 初始化为空数组，将从API获取数据
      foods: [],
      // 购物车数据
      cart: []
    }
  },
  computed: {
    // 根据选中的分类过滤菜品
    filteredFoods() {
      if (this.selectedCategory === 'all') {
        return this.foods
      }
      return this.foods.filter(food => food.category === this.selectedCategory)
    },
    // 购物车数量
    cartCount() {
      return this.cart.length
    }
  },
  methods: {
    // 从API获取菜品数据
    async fetchFoodsFromAPI() {
      try {
        // 显示加载提示
        uni.showLoading({ title: '加载中' })
        
        // 发送请求获取数据，使用封装的request函数自动携带token
        const res = await request({
          url: API_PATHS.recipes,
          method: 'GET'
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200 && res.data) {
          this.foods = res.data.recipes || res.data
        } else {
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('API请求失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },
    
    // 选择分类
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    
    // 添加到购物车
    addToCart(food) {
      const existingItem = this.cart.find(item => item.id === food.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.cart.push({ ...food, quantity: 1 })
      }
      
      // 保存到本地存储
      try {
        uni.setStorageSync('cart', JSON.stringify(this.cart))
      } catch (e) {
        console.error('保存购物车数据失败', e)
      }
    },
    
    // 跳转到购物车页面
    goToCart() {
      uni.navigateTo({
        url: '/pages/cart/index'
      })
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
    
    // 从API获取菜品数据
    this.fetchFoodsFromAPI()
  },
  
  // 下拉刷新事件
  onPullDownRefresh() {
    // 重新获取菜品数据
    this.fetchFoodsFromAPI().finally(() => {
      // 结束下拉刷新动画
      uni.stopPullDownRefresh()
    })
  }
}
</script>

<style scoped>
.menu-container {
  display: flex;
  height: 100vh;
  background-color: #f8f8f8;
}

/* 左侧分类列表样式 */
.category-list {
  width: 25%;
  background-color: #fff;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.category-item {
  padding: 30rpx 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1px solid #eee;
}

.category-item.active {
  color: #ff6b35;
  background-color: #fffaf5;
  border-left: 6rpx solid #ff6b35;
}

/* 右侧菜品列表样式 */
.food-list {
  width: 75%;
  padding: 20rpx;
  overflow-y: auto;
}

.food-item {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.food-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 10rpx;
}

.food-info {
  flex: 1;
  padding-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.food-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.food-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.food-ingredients {
  font-size: 24rpx;
  color: #999;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-button {
  width: 60rpx;
  height: 60rpx;
  background-color: #ff6b35;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
}

/* 购物车悬浮按钮样式 */
.cart-button {
  position: fixed;
  bottom: 100rpx;
  right: 40rpx;
  width: 200rpx;
  height: 80rpx;
  background-color: #ff6b35;
  color: #fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
}
</style>
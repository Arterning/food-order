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
      // 菜品列表
      foods: [
        {
          id: 1,
          name: '红烧肉',
          category: 'dish',
          image: 'https://picsum.photos/seed/hongshaorou/300/200',
          ingredients: '五花肉、酱油、冰糖'
        },
        {
          id: 2,
          name: '宫保鸡丁',
          category: 'dish',
          image: 'https://picsum.photos/seed/gongbaojiding/300/200',
          ingredients: '鸡肉、花生米、干辣椒'
        },
        {
          id: 3,
          name: '清蒸鱼',
          category: 'dish',
          image: 'https://picsum.photos/seed/qingzhengyu/300/200',
          ingredients: '鱼、姜片、葱段'
        },
        {
          id: 4,
          name: '番茄炒蛋',
          category: 'dish',
          image: 'https://picsum.photos/seed/fanqiechaodan/300/200',
          ingredients: '番茄、鸡蛋、葱花'
        },
        {
          id: 5,
          name: '麻婆豆腐',
          category: 'dish',
          image: 'https://picsum.photos/seed/mapotofu/300/200',
          ingredients: '豆腐、肉末、豆瓣酱'
        },
        {
          id: 6,
          name: '白米饭',
          category: 'main',
          image: 'https://picsum.photos/seed/mifan/300/200',
          ingredients: '大米'
        },
        {
          id: 7,
          name: '馒头',
          category: 'main',
          image: 'https://picsum.photos/seed/mantou/300/200',
          ingredients: '面粉、酵母'
        },
        {
          id: 8,
          name: '西红柿鸡蛋汤',
          category: 'soup',
          image: 'https://picsum.photos/seed/xihongshitang/300/200',
          ingredients: '番茄、鸡蛋、葱花'
        },
        {
          id: 9,
          name: '西瓜',
          category: 'dessert',
          image: 'https://picsum.photos/seed/xigua/300/200',
          ingredients: '西瓜'
        },
        {
          id: 10,
          name: '可乐',
          category: 'drink',
          image: 'https://picsum.photos/seed/kele/300/200',
          ingredients: '可乐'
        }
      ],
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
    // 选择分类
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    
    // 添加到购物车
    addToCart(food) {
      this.cart.push({ ...food })
      // 提示添加成功
      uni.showToast({
        title: '已添加到购物车',
        icon: 'none'
      })
      
      // 保存购物车数据到本地存储
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
    
    // 跳转到购物车/订单页面
    goToCart() {
      uni.navigateTo({
        url: '/pages/order/index'
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
    
    // 从本地存储加载全局菜品数据
    try {
      const globalFoodsData = uni.getStorageSync('globalFoods')
      if (globalFoodsData) {
        const globalFoods = JSON.parse(globalFoodsData)
        // 合并全局菜品数据和静态菜品数据（去重）
        const allFoods = [...this.foods, ...globalFoods]
        const uniqueFoods = []
        const seenIds = new Set()
        
        for (const food of allFoods) {
          if (!seenIds.has(food.id)) {
            seenIds.add(food.id)
            uniqueFoods.push(food)
          }
        }
        
        this.foods = uniqueFoods
      }
    } catch (e) {
      console.error('加载全局菜品数据失败', e)
    }
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
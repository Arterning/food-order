import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 菜谱数据
    recipes: [
      {
        id: 1,
        name: '宫保鸡丁',
        category: '川菜',
        image: 'https://picsum.photos/id/1/300/200',
        ingredients: ['鸡肉', '花生米', '干辣椒', '葱姜蒜']
      },
      {
        id: 2,
        name: '麻婆豆腐',
        category: '川菜',
        image: 'https://picsum.photos/id/2/300/200',
        ingredients: ['豆腐', '猪肉末', '豆瓣酱', '干辣椒']
      },
      {
        id: 3,
        name: '红烧肉',
        category: '粤菜',
        image: 'https://picsum.photos/id/3/300/200',
        ingredients: ['五花肉', '酱油', '冰糖', '八角']
      },
      {
        id: 4,
        name: '清蒸鱼',
        category: '粤菜',
        image: 'https://picsum.photos/id/4/300/200',
        ingredients: ['鱼', '葱姜', '料酒', '蒸鱼豉油']
      },
      {
        id: 5,
        name: '糖醋排骨',
        category: '江浙菜',
        image: 'https://picsum.photos/id/5/300/200',
        ingredients: ['排骨', '冰糖', '醋', '料酒']
      },
      {
        id: 6,
        name: '西湖醋鱼',
        category: '江浙菜',
        image: 'https://picsum.photos/id/6/300/200',
        ingredients: ['鱼', '醋', '白糖', '姜']
      }
    ],
    // 菜谱分类
    categories: ['全部', '川菜', '粤菜', '江浙菜', '家常菜', '其他'],
    // 购物车数据
    cartItems: [],
    // 订单数据
    orders: []
  },
  mutations: {
    // 添加菜品到购物车
    ADD_TO_CART(state, recipe) {
      const existingItem = state.cartItems.find(item => item.id === recipe.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cartItems.push({
          ...recipe,
          quantity: 1
        })
      }
    },
    // 从购物车移除菜品
    REMOVE_FROM_CART(state, recipeId) {
      state.cartItems = state.cartItems.filter(item => item.id !== recipeId)
    },
    // 清空购物车
    CLEAR_CART(state) {
      state.cartItems = []
    },
    // 提交订单
    SUBMIT_ORDER(state) {
      if (state.cartItems.length > 0) {
        const newOrder = {
          id: Date.now(),
          items: [...state.cartItems],
          status: '待处理',
          createTime: new Date().toLocaleString()
        }
        state.orders.push(newOrder)
        state.cartItems = []
      }
    },
    // 更新订单状态
    UPDATE_ORDER_STATUS(state, { orderId, status }) {
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    // 添加新菜谱
    ADD_RECIPE(state, recipe) {
      state.recipes.push({
        ...recipe,
        id: Date.now()
      })
      // 如果是新分类，添加到分类列表
      if (!state.categories.includes(recipe.category)) {
        state.categories.push(recipe.category)
      }
    }
  },
  actions: {
    // 添加到购物车
    addToCart({ commit }, recipe) {
      commit('ADD_TO_CART', recipe)
    },
    // 从购物车移除
    removeFromCart({ commit }, recipeId) {
      commit('REMOVE_FROM_CART', recipeId)
    },
    // 清空购物车
    clearCart({ commit }) {
      commit('CLEAR_CART')
    },
    // 提交订单
    submitOrder({ commit }) {
      commit('SUBMIT_ORDER')
    },
    // 更新订单状态
    updateOrderStatus({ commit }, payload) {
      commit('UPDATE_ORDER_STATUS', payload)
    },
    // 添加新菜谱
    addRecipe({ commit }, recipe) {
      commit('ADD_RECIPE', recipe)
    }
  },
  getters: {
    // 获取购物车商品数量
    cartCount: state => {
      return state.cartItems.reduce((total, item) => total + item.quantity, 0)
    },
    // 获取购物车总价（虽然家庭点菜不需要付款，但保留这个逻辑）
    cartTotal: state => {
      return 0 // 家庭点菜不需要付款
    },
    // 根据分类获取菜谱
    getRecipesByCategory: state => category => {
      if (category === '全部') {
        return state.recipes
      }
      return state.recipes.filter(recipe => recipe.category === category)
    },
    // 获取待处理订单
    pendingOrders: state => {
      return state.orders.filter(order => order.status === '待处理')
    },
    // 获取已完成订单
    completedOrders: state => {
      return state.orders.filter(order => order.status === '已完成')
    }
  }
})
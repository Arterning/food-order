import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    
    // 购物车数据
    cartItems: [],
    
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
    
  }
})
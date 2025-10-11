<template>
  <view class="upload-recipe-container">
    <view class="header">
      <text class="title">上传菜谱</text>
      <text class="cancel-btn" @tap="cancelUpload">取消</text>
    </view>
    
    <view class="form-container">
      <!-- 菜品名称 -->
      <view class="form-item">
        <text class="label">菜品名称</text>
        <input class="input" v-model="recipeForm.name" placeholder="请输入菜品名称" />
      </view>
      
      <!-- 菜品分类 -->
      <view class="form-item">
        <text class="label">菜品分类</text>
        <picker class="picker" @change="onCategoryChange" :range="categories" range-key="name">
          <view class="picker-text">
            {{ getCategoryName(recipeForm.category) || '请选择菜品分类' }}
          </view>
        </picker>
      </view>
      
      <!-- 菜品图片 -->
      <view class="form-item">
        <text class="label">菜品图片</text>
        <view class="image-upload-area">
          <view class="image-preview" v-if="recipeForm.image">
            <image :src="recipeForm.image" mode="aspectFill"></image>
            <view class="remove-image" @tap="removeImage">
              <text>×</text>
            </view>
          </view>
          <view class="upload-btn" @tap="chooseImage">
            <text>+</text>
            <text class="upload-text">选择图片</text>
          </view>
        </view>
      </view>
      
      <!-- 菜品食材 -->
      <view class="form-item">
        <text class="label">菜品食材</text>
        <textarea class="textarea" v-model="recipeForm.ingredients" placeholder="请输入菜品食材，用空格分隔" />
      </view>
      
      <!-- 提交按钮 -->
      <button class="submit-btn" :disabled="!isFormValid" @tap="submitRecipe">
        提交
      </button>
    </view>
  </view>
</template>

<script>
import { API_PATHS, request } from '../../api/config'

export default {
  data() {
    return {
      recipeForm: {
        name: '',
        category: '',
        image: '',
        ingredients: ''
      },
      categories: [
        { id: 'all', name: '全部' },
        { id: 'main', name: '主食' },
        { id: 'dish', name: '菜品' },
        { id: 'soup', name: '汤品' },
        { id: 'dessert', name: '甜点' },
        { id: 'drink', name: '饮品' },
        { id: 'snack', name: '小吃' },
        { id: 'other', name: '其他' },
      ],
      isUploading: false
    }
  },
  computed: {
    // 表单验证
    isFormValid() {
      return this.recipeForm.name && 
             this.recipeForm.category && 
             this.recipeForm.ingredients
    }
  },
  methods: {
    // 取消上传
    cancelUpload() {
      uni.navigateBack()
    },
    
    // 选择菜品分类
    onCategoryChange(e) {
      this.recipeForm.category = this.categories[e.detail.value].id
    },
    
    // 根据id获取分类名称
    getCategoryName(id) {
      if (!id) return ''
      const category = this.categories.find(cat => cat.id === id)
      return category ? category.name : ''
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadImage(tempFilePath)
        },
        fail: (err) => {
          console.error('选择图片失败', err)
        }
      })
    },
    
    // 上传图片
    uploadImage(filePath) {
      console.log(this.isUploading)
      if (this.isUploading) return
      
      this.isUploading = true
      uni.showLoading({ title: '上传中' })
      
      uni.uploadFile({
        url: `${process.env.VUE_APP_API_BASE_URL}${API_PATHS.upload}`,
        filePath: filePath,
        name: 'file',
        header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.url) {
              this.recipeForm.image = data.url
            } else {
              uni.showToast({
                title: data.error || '图片上传失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('解析上传响应失败', error)
            uni.showToast({
              title: '图片上传失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('图片上传失败', err)
          uni.showToast({
            title: '图片上传失败',
            icon: 'none'
          })
        },
        complete: () => {
          this.isUploading = false
          uni.hideLoading()
        }
      })
    },
    
    // 移除图片
    removeImage() {
      this.recipeForm.image = ''
    },
    
    // 提交菜谱
    async submitRecipe() {
      if (!this.isFormValid || this.isUploading) return
      
      try {
        uni.showLoading({ title: '提交中' })
        
        // 发送请求创建菜谱，使用封装的request函数自动携带token
        const res = await request({
          url: API_PATHS.recipes,
          method: 'POST',
          data: this.recipeForm
        })
        
        uni.hideLoading()
        
        if (res.statusCode === 201 && res.data) {
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.data?.error || '上传失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交菜谱失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.upload-recipe-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.header .title {
  font-size: 36rpx;
  font-weight: bold;
}

.header .cancel-btn {
  font-size: 32rpx;
  color: #666;
}

.form-container {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.input,
.picker-text {
  width: 100%;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
  height: 90rpx;
}

.textarea {
  width: 100%;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
}

.picker {
  width: 100%;
}

.textarea {
  height: 200rpx;
  resize: none;
}

.image-upload-area {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.image-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  overflow: hidden;
  position: relative;
}

.image-preview image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 50rpx;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.upload-btn text:first-child {
  font-size: 60rpx;
  color: #999;
  line-height: 1;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background-color: #ff6b35;
  color: #fff;
  font-size: 32rpx;
  border-radius: 45rpx;
  margin-top: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:disabled {
  background-color: #ccc;
}
</style>
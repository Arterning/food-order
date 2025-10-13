<template>
  <view class="upload-recipe-container">
    <!-- 用于图片压缩的canvas，设置为不可见且尺寸足够大 -->
    <canvas canvas-id="compressCanvas" style="width: 1500px; height: 1500px; position: fixed; left: -9999px;"></canvas>
    <view class="header">
      <text class="title">{{ isEditMode ? '编辑菜谱' : '上传菜谱' }}</text>
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
            <image :src="recipeForm.image" mode="aspectFill" @tap="previewImage"></image>
            <view class="remove-image" @tap.stop="removeImage">
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
        { id: 'main', name: '主食' },
        { id: 'dish', name: '荤菜' },
        { id: 'su', name: '素菜' },
        { id: 'soup', name: '汤品' },
        { id: 'dessert', name: '甜点' },
        { id: 'drink', name: '饮品' },
        { id: 'snack', name: '小吃' },
        { id: 'md', name: '面点' },
        { id: 'rice', name: '粥' },
        { id: 'all', name: '全部' },
      ],
      isUploading: false,
      isEditMode: false,
      recipeId: ''
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
  onLoad(options) {
    // 检查是否是编辑模式
    if (options && options.mode === 'edit' && options.recipeId) {
      this.isEditMode = true
      this.recipeId = options.recipeId
      // 加载菜品数据
      this.loadRecipeData()
    }
  },
  
  methods: {
    // 加载菜品数据
    async loadRecipeData() {
      try {
        uni.showLoading({ title: '加载中' })
        
        const res = await request({
          url: `${API_PATHS.recipes}/${this.recipeId}`,
          method: 'GET'
        })
        
        uni.hideLoading()
        
        if (res.statusCode === 200 && res.data) {
          this.recipeForm = {
            name: res.data.name,
            category: res.data.category,
            image: res.data.image,
            ingredients: res.data.ingredients
          }
        } else {
          uni.showToast({
            title: '加载菜品数据失败',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('加载菜品数据失败', error)
        uni.hideLoading()
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },
    
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
        sizeType: ['original'], // 先获取原图，然后我们自己压缩
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          // 先压缩图片，再上传
          this.compressImage(tempFilePath)
        },
        fail: (err) => {
          console.error('选择图片失败', err)
        }
      })
    },
    
    // 压缩图片
    compressImage(filePath) {
      // 获取文件信息，判断文件大小
      uni.getFileInfo({
        filePath: filePath,
        success: (fileInfo) => {
          // 1MB = 1048576字节
          const ONE_MB = 1048576
          
          // 如果文件小于1MB，直接上传原图
          if (fileInfo.size < ONE_MB) {
            this.uploadImage(filePath)
            return
          }
          
          // 大于等于1MB，进行压缩处理
          // 获取图片信息
          uni.getImageInfo({
            src: filePath,
            success: (imageInfo) => {
              // 创建canvas上下文进行压缩
              const ctx = uni.createCanvasContext('compressCanvas')
              
              // 定义压缩参数
              const maxWidth = 1000 // 最大宽度
              const maxHeight = 1000 // 最大高度
              const quality = 0.5 // 压缩质量降低一点以获得更小的文件大小
              
              // 计算压缩后的宽高 - 保持原图比例，不裁剪
              let targetWidth = imageInfo.width
              let targetHeight = imageInfo.height
              
              if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
                const aspectRatio = imageInfo.width / imageInfo.height
                if (aspectRatio > 1) {
                  // 横屏图片
                  targetWidth = maxWidth
                  targetHeight = Math.floor(maxWidth / aspectRatio)
                } else {
                  // 竖屏图片
                  targetHeight = maxHeight
                  targetWidth = Math.floor(maxHeight * aspectRatio)
                }
              }
              
              // 在canvas上绘制图片 - uni-app会自动根据drawImage的参数调整绘制区域
              ctx.drawImage(filePath, 0, 0, targetWidth, targetHeight)
              ctx.draw(false, () => {
                // 将canvas内容转换为临时文件
                uni.canvasToTempFilePath({
                  canvasId: 'compressCanvas',
                  x: 0,
                  y: 0,
                  width: targetWidth,
                  height: targetHeight,
                  quality: quality,
                  success: (res) => {
                    // 上传压缩后的图片
                    this.uploadImage(res.tempFilePath)
                  },
                  fail: (err) => {
                    console.error('图片压缩失败', err)
                    // 如果压缩失败，使用原图上传
                    this.uploadImage(filePath)
                  }
                })
              })
            },
            fail: (err) => {
              console.error('获取图片信息失败', err)
              // 如果获取信息失败，使用原图上传
              this.uploadImage(filePath)
            }
          })
        },
        fail: (err) => {
          console.error('获取文件信息失败', err)
          // 如果获取文件信息失败，使用原图上传
          this.uploadImage(filePath)
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
    
    // 预览图片
    previewImage() {
      if (this.recipeForm.image) {
        uni.previewImage({
          current: this.recipeForm.image,
          urls: [this.recipeForm.image],
          showmenu: true
        })
      }
    },
    
    // 提交菜谱
    async submitRecipe() {
      if (!this.isFormValid || this.isUploading) return
      
      try {
        uni.showLoading({ title: '提交中' })
        
        let res
        if (this.isEditMode) {
          // 编辑模式 - 发送PUT请求
          res = await request({
            url: `${API_PATHS.recipes}/${this.recipeId}`,
            method: 'PUT',
            data: this.recipeForm
          })
        } else {
          // 新增模式 - 发送POST请求
          res = await request({
            url: API_PATHS.recipes,
            method: 'POST',
            data: this.recipeForm
          })
        }
        
        uni.hideLoading()
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          uni.showToast({
            title: this.isEditMode ? '编辑成功' : '上传成功',
            icon: 'success'
          })
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.data?.error || (this.isEditMode ? '编辑失败' : '上传失败'),
            icon: 'none'
          })
        }
      } catch (error) {
        console.error(this.isEditMode ? '编辑菜谱失败' : '提交菜谱失败', error)
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
// API配置文件

// 获取环境变量中的API基础URL
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';

// 定义API接口路径
export const API_PATHS = {
  // 菜谱相关接口
  recipes: '/recipes',
  // 文件上传接口
  upload: '/upload',
  // 用户认证接口
  login: '/login'
};

// 生成完整的API URL
export const getApiUrl = (path) => {
  return `${API_BASE_URL}${path}`;
};

// 通用的API请求函数，自动添加token
// 注意：login请求不需要token，所以单独处理
// 其他需要登录的请求会自动添加Authorization头
export async function request(options) {
  // 获取存储的token
  const token = uni.getStorageSync('token')
  
  // 构建请求头
  const header = {
    ...options.header,
    'Content-Type': 'application/json'
  }
  
  // 如果有token，添加Authorization头
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  
  // 发送请求
  return uni.request({
    ...options,
    url: getApiUrl(options.url),
    header
  })
}
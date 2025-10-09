// API配置文件

// 获取环境变量中的API基础URL
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';

// 定义API接口路径
export const API_PATHS = {
  // 菜谱相关接口
  recipes: '/recipes',
  // 文件上传接口
  upload: '/upload'
};

// 生成完整的API URL
export const getApiUrl = (path) => {
  return `${API_BASE_URL}${path}`;
};
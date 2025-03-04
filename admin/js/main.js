/**
 * 主文件 - 初始化应用
 */

// 观察预览窗格变化
const startObserver = () => {
  // 创建一个MutationObserver来监视DOM变化
  const observer = new MutationObserver((mutations) => {
    // 查找所有iframe
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(injectPrismToIframe);
    
    // 查找并增强所有代码编辑框
    findAndEnhanceEditors();
  });
  
  // 监视整个文档的变化
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // 立即检查现有iframe
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(injectPrismToIframe);
  
  // 立即增强所有编辑器
  findAndEnhanceEditors();
};

// 初始化所有CMS相关功能
const initCMS = () => {
  // 注册预览样式
  window.CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');
  window.CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');
  
  // 注册预览组件
  window.CMS.registerPreviewTemplate('posts', PostPreview);
  window.CMS.registerPreviewTemplate('pages', PostPreview);
  
  // 注册代码块编辑器组件
  registerCodeBlockComponent();
  
  // 启动DOM观察器
  startObserver();
};

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 如果CMS已加载，立即初始化
  if (window.CMS) {
    initCMS();
  } else {
    // 否则等待CMS加载
    const checkCMS = setInterval(() => {
      if (window.CMS) {
        clearInterval(checkCMS);
        initCMS();
      }
    }, 100);
  }
  
  // 控制台提示
  console.log('代码编辑器增强功能已加载');
  console.log('使用 Ctrl+Shift+F 格式化代码');
});
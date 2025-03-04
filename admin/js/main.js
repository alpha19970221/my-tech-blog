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
    
    // 特别查找Markdown编辑器
    const mdEditors = document.querySelectorAll('textarea[class*="markdown"], textarea[class*="Markdown"], textarea[class*="md-editor"]');
    mdEditors.forEach(enhanceTextarea);
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

// 添加CSS动态样式
const addDynamicStyles = () => {
  // 检查是否已添加样式
  if (document.getElementById('code-formatter-styles')) return;
  
  // 创建样式元素
  const styleEl = document.createElement('style');
  styleEl.id = 'code-formatter-styles';
  styleEl.textContent = `
    /* 编辑器样式补充 */
    textarea.code-editor {
      tab-size: 2;
      font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
    }
    
    /* 语言选择器动画 */
    .language-selector {
      animation: fadeIn 0.2s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* 按钮悬停效果 */
    .markdown-format-button:hover, .format-button:hover {
      background: #3a7edf !important;
      transform: translateY(-1px);
      transition: all 0.2s;
    }
  `;
  
  document.head.appendChild(styleEl);
};

// 初始化所有CMS相关功能
const initCMS = () => {
  // 注册预览样式
  window.CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');
  window.CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');
  
  // 注册预览组件
  window.CMS.registerPreviewTemplate('posts', PostPreview);
  window.CMS.registerPreviewTemplate('pages', PostPreview);
  window.CMS.registerPreviewTemplate('blog', PostPreview);
  window.CMS.registerPreviewTemplate('article', PostPreview);
  
  // 注册代码块编辑器组件
  registerCodeBlockComponent();
  
  // 添加动态样式
  addDynamicStyles();
  
  // 启动DOM观察器
  startObserver();
  
  // 添加帮助信息
  console.info('代码编辑器增强功能 v1.0 已加载');
  console.info('支持 Markdown 代码块格式化和语法高亮');
  console.info('使用 Ctrl+Shift+F 格式化代码');
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
});

// 导出公共API
window.CodeFormatter = {
  formatCode,
  formatMarkdownCodeBlocks,
  highlightCode,
  isMarkdownEditor
};
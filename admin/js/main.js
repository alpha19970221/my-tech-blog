/**
 * 主文件 - 初始化应用
 */

// 观察预览窗格变化
const startObserver = () => {
  // 创建一个MutationObserver来监视DOM变化
  const observer = new MutationObserver((mutations) => {
    // 查找所有iframe
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(window.injectPrismToIframe);
    
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
  iframes.forEach(window.injectPrismToIframe);
  
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
  // 确保PostPreview已定义
  if (!window.PostPreview) {
    console.error('PostPreview组件未定义，请确保preview.js已正确加载');
    return;
  }
  
  // 注册预览样式
  window.CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');
  window.CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');
  
  // 注册预览组件
  window.CMS.registerPreviewTemplate('posts', window.PostPreview);
  window.CMS.registerPreviewTemplate('pages', window.PostPreview);
  window.CMS.registerPreviewTemplate('blog', window.PostPreview);
  window.CMS.registerPreviewTemplate('article', window.PostPreview);
  
  // 注册代码块编辑器组件
  if (typeof window.registerCodeBlockComponent === 'function') {
    window.registerCodeBlockComponent();
  } else {
    console.error('registerCodeBlockComponent函数未定义，请确保preview.js已正确加载');
  }
  
  // 添加动态样式
  addDynamicStyles();
  
  // 启动DOM观察器
  startObserver();
  
  // 添加帮助信息
  console.info('代码编辑器增强功能 v1.0 已加载');
  console.info('支持 Markdown 代码块格式化和语法高亮');
  console.info('使用 Ctrl+Shift+F 格式化代码');
};

// 确保injectPrismToIframe函数存在
if (typeof window.injectPrismToIframe !== 'function') {
  window.injectPrismToIframe = function(iframe) {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      
      // 如果iframe中没有Prism，注入它
      if (typeof iframeDocument.defaultView.Prism === 'undefined') {
        // 注入Prism CSS
        const prismCss = document.createElement('link');
        prismCss.rel = 'stylesheet';
        prismCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
        iframeDocument.head.appendChild(prismCss);
        
        // 注入Prism JS
        const prismJs = document.createElement('script');
        prismJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        prismJs.onload = () => {
          console.log('Prism已注入到iframe中');
          // 高亮iframe中的代码
          const codeBlocks = iframeDocument.querySelectorAll('pre code');
          if (codeBlocks.length > 0) {
            codeBlocks.forEach(block => {
              try {
                iframeDocument.defaultView.Prism.highlightElement(block);
              } catch (e) {
                console.error('高亮iframe中的代码块失败:', e);
              }
            });
          }
        };
        iframeDocument.body.appendChild(prismJs);
      } else {
        // 直接高亮
        const codeBlocks = iframeDocument.querySelectorAll('pre code');
        if (codeBlocks.length > 0) {
          codeBlocks.forEach(block => {
            try {
              iframeDocument.defaultView.Prism.highlightElement(block);
            } catch (e) {
              console.error('高亮iframe中的代码块失败:', e);
            }
          });
        }
      }
    } catch (e) {
      console.error('注入Prism到iframe失败:', e);
    }
  };
}

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

// 导出公共API - 确保这些函数已定义
window.CodeFormatter = {
  formatCode: typeof formatCode === 'function' ? formatCode : function() { console.warn('formatCode未定义'); },
  formatMarkdownCodeBlocks: typeof formatMarkdownCodeBlocks === 'function' ? formatMarkdownCodeBlocks : function() { console.warn('formatMarkdownCodeBlocks未定义'); },
  highlightCode: typeof highlightCode === 'function' ? highlightCode : function() { console.warn('highlightCode未定义'); },
  isMarkdownEditor: typeof isMarkdownEditor === 'function' ? isMarkdownEditor : function() { console.warn('isMarkdownEditor未定义'); }
};
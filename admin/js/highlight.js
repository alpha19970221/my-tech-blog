/**
 * 代码高亮功能
 */

// 简单的即时高亮处理器
const highlightCode = (doc) => {
  if (!doc) return;
  
  const codeBlocks = doc.querySelectorAll('pre code');
  if (codeBlocks.length) {
    codeBlocks.forEach(block => {
      // 确保有语言类
      if (!block.className.includes('language-')) {
        block.className = 'language-javascript ' + block.className;
      }
      
      // 尝试高亮
      if (window.Prism) {
        Prism.highlightElement(block);
      }
    });
  }
};

// 向iframe注入样式和脚本
const injectPrismToIframe = (iframe) => {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;
    
    // 已经注入过，直接高亮
    if (doc.getElementById('prism-injected')) {
      highlightCode(doc);
      return;
    }
    
    // 注入样式
    const style = doc.createElement('link');
    style.id = 'prism-injected';
    style.rel = 'stylesheet';
    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    doc.head.appendChild(style);
    
    // 注入字体 (可选)
    const fontLink = doc.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap';
    doc.head.appendChild(fontLink);
    
    // 注入自定义样式
    const customStyle = doc.createElement('style');
    customStyle.textContent = `
      pre[class*="language-"] {
        border-radius: 6px;
        padding: 1em;
        margin: 1em 0;
        overflow: auto;
        background: #2d2d2d;
      }
      
      code[class*="language-"] {
        font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
        tab-size: 2;
      }
    `;
    doc.head.appendChild(customStyle);
    
    // 注入脚本
    const script = doc.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
    script.onload = () => {
      // 加载完成后，立即加载语言支持
      const languages = ['javascript', 'css', 'python', 'bash', 'yaml', 'json', 'typescript', 'jsx'];
      languages.forEach(lang => {
        const langScript = doc.createElement('script');
        langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
        langScript.onload = () => {
          // 每个语言加载完成后，尝试高亮
          highlightCode(doc);
        };
        doc.body.appendChild(langScript);
      });
      
      // 立即尝试高亮
      highlightCode(doc);
    };
    doc.body.appendChild(script);
  } catch (e) {
    // 忽略跨域错误
  }
};

// 高亮Markdown预览中的代码块
const highlightMarkdownPreview = (previewContainer) => {
  if (!previewContainer) return;
  
  // 找到预览容器中的代码块
  const codeBlocks = previewContainer.querySelectorAll('pre code');
  if (!codeBlocks.length) return;
  
  codeBlocks.forEach(block => {
    // 如果没有语言类，添加默认语言
    if (!block.className.includes('language-')) {
      block.className = 'language-javascript ' + block.className;
    }
    
    // 尝试高亮
    if (window.Prism) {
      Prism.highlightElement(block);
    }
  });
};
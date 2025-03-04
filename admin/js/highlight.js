/**
 * 代码高亮功能
 */

// 简单的即时高亮处理器
const highlightCode = (doc) => {
  if (!doc) doc = document;
  
  const codeBlocks = doc.querySelectorAll('pre code');
  if (codeBlocks.length) {
    console.log(`高亮处理 ${codeBlocks.length} 个代码块`);
    codeBlocks.forEach(block => {
      // 确保有语言类
      if (!block.className.includes('language-')) {
        block.className = 'language-javascript ' + block.className;
      }
      
      // 尝试高亮，添加更多错误处理
      if (window.Prism) {
        try {
          // 确保block有效
          if (!block || typeof block !== 'object') {
            console.warn('无效的代码块元素:', block);
            return;
          }
          
          // 确保Prism可用
          if (typeof Prism.highlightElement !== 'function') {
            console.warn('Prism.highlightElement不是一个函数');
            return;
          }
          
          // 应用高亮
          Prism.highlightElement(block);
        } catch (e) {
          console.error('Prism高亮失败:', e);
          // 尝试基本的HTML转义作为备选
          if (block && block.textContent) {
            const escaped = block.textContent
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            block.innerHTML = escaped;
          }
        }
      } else {
        console.warn('Prism未加载，无法高亮代码块');
      }
    });
  } else {
    console.log('未找到需要高亮的代码块');
  }
};

// 向iframe注入样式和脚本
const injectPrismToIframe = (iframe) => {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) {
      console.warn('无法访问iframe文档');
      return;
    }
    
    // 已经注入过，直接高亮
    if (doc.getElementById('prism-injected')) {
      console.log('Prism已注入此iframe，直接高亮');
      highlightCode(doc);
      return;
    }
    
    console.log('向iframe注入Prism');
    
    // 注入样式
    const style = doc.createElement('link');
    style.id = 'prism-injected';
    style.rel = 'stylesheet';
    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    doc.head.appendChild(style);
    
    // 注入字体
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
    
    // 注入完整的Prism脚本
    const script = doc.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.js';
    script.onload = () => {
      console.log('完整的Prism已加载到iframe');
      
      // 顺序加载语言支持
      loadLanguagesForIframe(doc).then(() => {
        console.log('iframe语言支持加载完成');
        
        // 触发高亮
        setTimeout(() => {
          try {
            highlightCode(doc);
          } catch (e) {
            console.error('iframe中的高亮失败:', e);
          }
        }, 100);
      });
    };
    script.onerror = (e) => {
      console.error('加载Prism到iframe失败:', e);
    };
    doc.body.appendChild(script);
  } catch (e) {
    console.error('注入Prism到iframe失败:', e);
  }
};

// 为iframe顺序加载所有语言
const loadLanguagesForIframe = (doc) => {
  return new Promise((resolve) => {
    // C语言必须先加载
    const cScript = doc.createElement('script');
    cScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js';
    cScript.onload = () => {
      console.log('iframe: C语言支持已加载');
      
      // 加载C++ (依赖C)
      const cppScript = doc.createElement('script');
      cppScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js';
      cppScript.onload = () => {
        console.log('iframe: C++语言支持已加载');
        
        // 加载C#
        const csharpScript = doc.createElement('script');
        csharpScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js';
        csharpScript.onload = () => {
          console.log('iframe: C#语言支持已加载');
          
          // 为完整性加载其他语言
          loadRemainingLanguagesForIframe(doc).then(resolve);
        };
        csharpScript.onerror = () => {
          console.warn('iframe: 加载C#语言支持失败');
          loadRemainingLanguagesForIframe(doc).then(resolve);
        };
        doc.body.appendChild(csharpScript);
      };
      cppScript.onerror = () => {
        console.warn('iframe: 加载C++语言支持失败');
        loadRemainingLanguagesForIframe(doc).then(resolve);
      };
      doc.body.appendChild(cppScript);
    };
    cScript.onerror = () => {
      console.warn('iframe: 加载C语言支持失败');
      loadRemainingLanguagesForIframe(doc).then(resolve);
    };
    doc.body.appendChild(cScript);
  });
};

// 加载其他剩余语言到iframe
const loadRemainingLanguagesForIframe = (doc) => {
  return new Promise((resolve) => {
    // 其他常用语言，不影响C系语言的加载
    const otherLanguages = [
      'javascript',
      'css',
      'markup', // HTML
      'python',
      'bash',
      'yaml',
      'json',
      'typescript',
      'jsx'
    ];
    
    let loaded = 0;
    const total = otherLanguages.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    // 处理加载完成
    const handleLoaded = () => {
      loaded++;
      if (loaded >= total) {
        resolve();
      }
    };
    
    // 并行加载其他语言
    otherLanguages.forEach(lang => {
      // 对于HTML，使用markup
      const fileName = lang === 'html' ? 'markup' : lang;
      
      const langScript = doc.createElement('script');
      langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${fileName}.min.js`;
      langScript.onload = () => {
        console.log(`iframe: ${lang}语言支持已加载`);
        handleLoaded();
      };
      langScript.onerror = () => {
        console.warn(`iframe: 加载${lang}语言支持失败`);
        handleLoaded();
      };
      doc.body.appendChild(langScript);
    });
  });
};

// 高亮Markdown预览中的代码块
const highlightMarkdownPreview = (previewContainer) => {
  if (!previewContainer) return;
  
  // 找到预览容器中的代码块
  const codeBlocks = previewContainer.querySelectorAll('pre code');
  if (!codeBlocks.length) {
    console.log('预览中未找到代码块');
    return;
  }
  
  console.log(`高亮预览中的 ${codeBlocks.length} 个代码块`);
  codeBlocks.forEach(block => {
    // 如果没有语言类，添加默认语言
    if (!block.className.includes('language-')) {
      block.className = 'language-javascript ' + block.className;
    }
    
    // 尝试高亮
    if (window.Prism) {
      try {
        Prism.highlightElement(block);
      } catch (e) {
        console.error('预览高亮失败:', e);
      }
    } else {
      console.warn('Prism未加载，无法高亮预览代码块');
    }
  });
};

// 加载Prism到主文档
const loadPrismToDocument = () => {
  if (window.Prism) {
    console.log('Prism已加载到主文档');
    return Promise.resolve();
  }
  
  console.log('加载Prism到主文档');
  
  return new Promise((resolve, reject) => {
    // 加载CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(cssLink);
    
    // 加载字体
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap';
    document.head.appendChild(fontLink);
    
    // 加载完整的Prism而不是分开加载核心和语言
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.js';
    script.onload = () => {
      console.log('完整的Prism已加载到主文档');
      
      // 顺序加载语言支持
      loadLanguagesSequentially().then(() => {
        console.log('所有语言支持已加载');
        resolve();
      }).catch(e => {
        console.warn('加载语言支持出错，但继续', e);
        resolve(); // 即使失败也resolve，避免阻塞
      });
    };
    script.onerror = (e) => {
      console.error('加载Prism失败:', e);
      reject(e);
    };
    document.body.appendChild(script);
  });
};

// 顺序加载语言支持
const loadLanguagesSequentially = () => {
  return new Promise((resolve) => {
    // 首先加载C语言
    const cScript = document.createElement('script');
    cScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js';
    cScript.onload = () => {
      console.log('C语言支持已加载');
      
      // 加载C++ (依赖C)
      const cppScript = document.createElement('script');
      cppScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js';
      cppScript.onload = () => {
        console.log('C++语言支持已加载');
        
        // 加载C#
        const csharpScript = document.createElement('script');
        csharpScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js';
        csharpScript.onload = () => {
          console.log('C#语言支持已加载');
          
          // 加载剩余语言
          loadRemainingLanguages().then(resolve);
        };
        csharpScript.onerror = () => {
          console.warn('加载C#语言支持失败');
          loadRemainingLanguages().then(resolve);
        };
        document.body.appendChild(csharpScript);
      };
      cppScript.onerror = () => {
        console.warn('加载C++语言支持失败');
        loadRemainingLanguages().then(resolve);
      };
      document.body.appendChild(cppScript);
    };
    cScript.onerror = () => {
      console.warn('加载C语言支持失败');
      loadRemainingLanguages().then(resolve);
    };
    document.body.appendChild(cScript);
  });
};

// 加载其他剩余语言
const loadRemainingLanguages = () => {
  return new Promise((resolve) => {
    // 其他常用语言，不影响C系语言的加载
    const otherLanguages = [
      'javascript',
      'css',
      'markup', // HTML
      'python',
      'bash',
      'yaml',
      'json',
      'typescript',
      'jsx'
    ];
    
    let loaded = 0;
    const total = otherLanguages.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    // 处理加载完成
    const handleLoaded = () => {
      loaded++;
      if (loaded >= total) {
        resolve();
      }
    };
    
    // 并行加载其他语言
    otherLanguages.forEach(lang => {
      // 对于HTML，使用markup
      const fileName = lang === 'html' ? 'markup' : lang;
      
      const langScript = document.createElement('script');
      langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${fileName}.min.js`;
      langScript.onload = () => {
        console.log(`${lang}语言支持已加载`);
        handleLoaded();
      };
      langScript.onerror = () => {
        console.warn(`加载${lang}语言支持失败`);
        handleLoaded();
      };
      document.body.appendChild(langScript);
    });
  });
};

// 暴露为全局函数
window.highlightCode = highlightCode;
window.injectPrismToIframe = injectPrismToIframe;
window.highlightMarkdownPreview = highlightMarkdownPreview;
window.loadPrismToDocument = loadPrismToDocument;
window.loadLanguagesSequentially = loadLanguagesSequentially;
window.loadRemainingLanguages = loadRemainingLanguages;
window.loadLanguagesForIframe = loadLanguagesForIframe;
window.loadRemainingLanguagesForIframe = loadRemainingLanguagesForIframe;
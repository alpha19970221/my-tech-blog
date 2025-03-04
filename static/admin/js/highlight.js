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
      
      // 获取语言
      let language = 'javascript';
      const languageMatch = block.className.match(/language-(\w+)/);
      if (languageMatch && languageMatch[1]) {
        language = languageMatch[1];
      }
      
      // 确保加载此语言支持
      if (language === 'c' || language === 'cpp' || language === 'csharp') {
        ensureLanguageLoaded(language, doc).then(() => {
          // 重新应用高亮
          try {
            if (doc.defaultView && doc.defaultView.Prism) {
              doc.defaultView.Prism.highlightElement(block);
            } else if (window.Prism) {
              Prism.highlightElement(block);
            }
          } catch (e) {
            console.error(`高亮${language}失败:`, e);
          }
        });
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

// 确保特定语言已加载
const ensureLanguageLoaded = (language, doc) => {
  return new Promise((resolve) => {
    const prismContext = doc.defaultView && doc.defaultView.Prism ? doc.defaultView.Prism : window.Prism;
    
    if (!prismContext) {
      console.warn('无法获取Prism对象');
      resolve();
      return;
    }
    
    // 检查语言是否已加载
    if (prismContext.languages[language]) {
      resolve();
      return;
    }
    
    console.log(`语言${language}未加载，正在加载...`);
    
    // 如果是C++和C#，确保先加载C语言
    if ((language === 'cpp' || language === 'csharp') && !prismContext.languages.c) {
      // 先加载C语言
      const cScript = doc.createElement('script');
      cScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js';
      cScript.onload = () => {
        console.log('C语言支持已加载');
        
        // 然后加载请求的语言
        const langScript = doc.createElement('script');
        langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js`;
        langScript.onload = () => {
          console.log(`${language}语言支持已加载`);
          setTimeout(resolve, 50); // 给浏览器一点时间处理
        };
        langScript.onerror = () => {
          console.warn(`无法加载${language}语言支持`);
          resolve();
        };
        doc.body.appendChild(langScript);
      };
      cScript.onerror = () => {
        console.warn('无法加载C语言支持');
        resolve();
      };
      doc.body.appendChild(cScript);
    } else {
      // 直接加载请求的语言
      const langScript = doc.createElement('script');
      langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js`;
      langScript.onload = () => {
        console.log(`${language}语言支持已加载`);
        setTimeout(resolve, 50); // 给浏览器一点时间处理
      };
      langScript.onerror = () => {
        console.warn(`无法加载${language}语言支持`);
        resolve();
      };
      doc.body.appendChild(langScript);
    }
  });
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
      console.log('基础Prism已加载到iframe');
      
      // 预加载C语言支持（这是C++和C#的基础）
      const cScript = doc.createElement('script');
      cScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js';
      cScript.onload = () => {
        console.log('iframe: C语言支持已加载');
        
        // 预加载C++和C#语言支持
        const cppScript = doc.createElement('script');
        cppScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js';
        
        const csharpScript = doc.createElement('script');
        csharpScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js';
        
        // 添加到文档
        doc.body.appendChild(cppScript);
        doc.body.appendChild(csharpScript);
        
        // 触发高亮
        setTimeout(() => {
          try {
            highlightCode(doc);
          } catch (e) {
            console.error('iframe中的高亮失败:', e);
          }
        }, 200);
      };
      doc.body.appendChild(cScript);
    };
    doc.body.appendChild(script);
    
  } catch (e) {
    console.error('注入Prism到iframe失败:', e);
  }
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
    
    // 获取语言
    let language = 'javascript';
    const languageMatch = block.className.match(/language-(\w+)/);
    if (languageMatch && languageMatch[1]) {
      language = languageMatch[1];
    }
    
    // 确保加载此语言支持
    if (language === 'c' || language === 'cpp' || language === 'csharp') {
      ensureLanguageLoaded(language, document).then(() => {
        // 重新应用高亮
        try {
          if (window.Prism) {
            Prism.highlightElement(block);
          }
        } catch (e) {
          console.error(`高亮${language}失败:`, e);
        }
      });
    } else {
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
    
    // 加载完整的Prism
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.js';
    script.onload = () => {
      console.log('完整的Prism已加载到主文档');
      
      // 预加载C, C++, C#语言支持
      const cScript = document.createElement('script');
      cScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js';
      cScript.onload = () => {
        console.log('C语言支持已加载');
        
        const cppPromise = new Promise((res) => {
          const cppScript = document.createElement('script');
          cppScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js';
          cppScript.onload = () => {
            console.log('C++语言支持已加载');
            res();
          };
          cppScript.onerror = () => {
            console.warn('加载C++语言支持失败');
            res();
          };
          document.body.appendChild(cppScript);
        });
        
        const csharpPromise = new Promise((res) => {
          const csharpScript = document.createElement('script');
          csharpScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js';
          csharpScript.onload = () => {
            console.log('C#语言支持已加载');
            res();
          };
          csharpScript.onerror = () => {
            console.warn('加载C#语言支持失败');
            res();
          };
          document.body.appendChild(csharpScript);
        });
        
        // 等待所有语言加载完成
        Promise.all([cppPromise, csharpPromise]).then(() => {
          console.log('所有C系列语言支持已加载');
          resolve();
        });
      };
      cScript.onerror = () => {
        console.warn('加载C语言支持失败');
        resolve(); // 即使失败也resolve
      };
      document.body.appendChild(cScript);
    };
    script.onerror = (e) => {
      console.error('加载Prism失败:', e);
      reject(e);
    };
    document.body.appendChild(script);
  });
};

// 暴露为全局函数
window.highlightCode = highlightCode;
window.injectPrismToIframe = injectPrismToIframe;
window.highlightMarkdownPreview = highlightMarkdownPreview;
window.loadPrismToDocument = loadPrismToDocument;
window.ensureLanguageLoaded = ensureLanguageLoaded;
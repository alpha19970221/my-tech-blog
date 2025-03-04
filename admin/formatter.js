/**
 * Markdown 代码格式化工具
 * 专门用于格式化Markdown文档中的代码块
 */
(function() {
  console.log('代码格式化工具加载中...');
  
  // 等待Prettier加载
  function loadPrettier() {
    if (window.prettier) {
      console.log('检测到Prettier已加载，初始化格式化工具');
      initFormatter();
      return;
    }
    
    console.log('加载Prettier...');
    // 加载Prettier和必要的解析器
    loadScript('https://unpkg.com/prettier@2.8.8/standalone.js', function() {
      loadScript('https://unpkg.com/prettier@2.8.8/parser-babel.js', function() {
        loadScript('https://unpkg.com/prettier@2.8.8/parser-html.js', function() {
          loadScript('https://unpkg.com/prettier@2.8.8/parser-postcss.js', function() {
            loadScript('https://unpkg.com/prettier@2.8.8/parser-markdown.js', function() {
              loadScript('https://unpkg.com/prettier@2.8.8/parser-yaml.js', function() {
                console.log('Prettier加载完成，初始化格式化工具');
                initFormatter();
              });
            });
          });
        });
      });
    });
  }
  
  // 加载脚本函数
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }
  
  // 添加样式
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .md-format-button {
        padding: 6px 12px;
        background: #4a8fee;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 5px 5px 5px 0;
        font-size: 14px;
        transition: background 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .md-format-button:hover {
        background: #3a7edf;
      }
      
      .md-format-tools {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .shortcut-hint {
        margin-left: 8px;
        color: #666;
        font-size: 12px;
      }
      
      /* 成功/失败提示 */
      .format-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        animation: fade-in-out 3s forwards;
        z-index: 9999;
      }
      
      .format-toast.success {
        background: #4CAF50;
      }
      
      .format-toast.error {
        background: #F44336;
      }
      
      @keyframes fade-in-out {
        0% { opacity: 0; transform: translateY(-20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 显示提示消息
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `format-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 3秒后自动删除
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
  
  // 核心格式化功能
  function initFormatter() {
    // 检查prettier是否正确加载
    if (!window.prettier || !window.prettierPlugins) {
      console.error('Prettier或解析器未正确加载');
      showToast('无法加载格式化工具', 'error');
      return;
    }
    
    // 代码格式化函数
    function formatCode(code, language) {
      try {
        // 根据语言确定解析器
        let parser;
        switch (language.toLowerCase()) {
          case 'js':
          case 'javascript':
            parser = 'babel';
            break;
          case 'ts':
          case 'typescript':
            parser = 'typescript';  // 注意：可能需要额外加载解析器
            break;
          case 'css':
            parser = 'css';
            break;
          case 'html':
            parser = 'html';
            break;
          case 'yaml':
          case 'yml':
            parser = 'yaml';
            break;
          case 'json':
            parser = 'json';
            break;
          case 'md':
          case 'markdown':
            parser = 'markdown';
            break;
          default:
            // 默认尝试用babel解析
            parser = 'babel';
        }
        
        // 检查解析器是否可用
        if (!window.prettierPlugins[parser]) {
          console.warn(`${parser}解析器不可用，尝试使用babel`);
          parser = 'babel';
          
          // 如果babel也不可用，返回原始代码
          if (!window.prettierPlugins[parser]) {
            console.error('无可用解析器');
            return code;
          }
        }
        
        // 执行格式化
        const formatted = prettier.format(code, {
          parser: parser,
          plugins: window.prettierPlugins,
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
          bracketSpacing: true,
        });
        
        return formatted.trim();
      } catch (e) {
        console.error('格式化失败:', e);
        return code; // 如果格式化失败，返回原始代码
      }
    }
    
    // 格式化Markdown文档中的代码块
    function formatMarkdownCodeBlocks(markdown) {
      if (!markdown) return markdown;
      
      console.log('开始格式化Markdown代码块');
      
      // 匹配Markdown代码块: ```language\n code \n```
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
      
      let formattedMarkdown = markdown;
      let match;
      let replacements = [];
      let blockCount = 0;
      
      // 找出所有代码块并进行格式化
      while ((match = codeBlockRegex.exec(markdown)) !== null) {
        blockCount++;
        
        const fullMatch = match[0];
        const language = match[1] || 'javascript'; // 默认为js
        const code = match[2];
        
        try {
          // 格式化代码
          console.log(`格式化第${blockCount}个代码块，语言: ${language}`);
          const formattedCode = formatCode(code, language);
          
          // 重新组装代码块
          const replacement = '```' + language + '\n' + formattedCode + '\n```';
          
          // 存储替换信息
          replacements.push({
            start: match.index,
            end: match.index + fullMatch.length,
            original: fullMatch,
            replacement: replacement
          });
        } catch (e) {
          console.error(`格式化第${blockCount}个代码块失败:`, e);
        }
      }
      
      // 从后向前替换(避免位置偏移问题)
      for (let i = replacements.length - 1; i >= 0; i--) {
        const r = replacements[i];
        formattedMarkdown = 
          formattedMarkdown.substring(0, r.start) + 
          r.replacement + 
          formattedMarkdown.substring(r.end);
      }
      
      console.log(`已格式化${blockCount}个代码块`);
      return formattedMarkdown;
    }
    
    // 为编辑器添加格式化按钮
    function addFormatButtonToEditor(editor) {
      if (!editor || editor.dataset.hasFormatButton) return;
      
      // 标记此编辑器已添加按钮
      editor.dataset.hasFormatButton = 'true';
      
      // 创建格式化按钮容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'md-format-tools';
      
      // 创建格式化按钮
      const formatButton = document.createElement('button');
      formatButton.className = 'md-format-button';
      formatButton.textContent = '格式化代码块';
      formatButton.onclick = function(e) {
        e.preventDefault();
        
        try {
          const originalContent = editor.value;
          const formattedContent = formatMarkdownCodeBlocks(originalContent);
          
          if (originalContent !== formattedContent) {
            editor.value = formattedContent;
            
            // 触发change事件，确保值被保存
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            showToast('代码格式化成功', 'success');
          } else {
            console.log('内容无变化或没有找到代码块');
            showToast('没有发现可格式化的代码块', 'error');
          }
        } catch (error) {
          console.error('格式化过程发生错误:', error);
          showToast('格式化过程发生错误', 'error');
        }
      };
      
      // 创建快捷键提示
      const shortcutHint = document.createElement('span');
      shortcutHint.className = 'shortcut-hint';
      shortcutHint.textContent = '快捷键: Ctrl+Shift+F';
      
      // 组装按钮容器
      buttonContainer.appendChild(formatButton);
      buttonContainer.appendChild(shortcutHint);
      
      // 添加到编辑器上方
      const parent = editor.parentElement;
      if (parent) {
        parent.insertBefore(buttonContainer, editor);
      }
      
      // 添加快捷键支持
      editor.addEventListener('keydown', function(e) {
        // Ctrl+Shift+F 或 Cmd+Shift+F
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
          e.preventDefault();
          
          try {
            const originalContent = editor.value;
            const formattedContent = formatMarkdownCodeBlocks(originalContent);
            
            if (originalContent !== formattedContent) {
              editor.value = formattedContent;
              
              // 触发change事件
              editor.dispatchEvent(new Event('input', { bubbles: true }));
              showToast('代码格式化成功', 'success');
            } else {
              console.log('内容无变化或没有找到代码块');
              showToast('没有发现可格式化的代码块', 'error');
            }
          } catch (error) {
            console.error('格式化过程发生错误:', error);
            showToast('格式化过程发生错误', 'error');
          }
        }
      });
    }
    
    // 查找所有textarea并添加格式化按钮
    function enhanceAllEditors() {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(addFormatButtonToEditor);
    }
    
    // 观察DOM变化，为新添加的编辑器添加格式化功能
    function observeDOM() {
      const observer = new MutationObserver(function(mutations) {
        let hasNewTextarea = false;
        
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeName === 'TEXTAREA') {
                hasNewTextarea = true;
              } else if (node.querySelectorAll) {
                const textareas = node.querySelectorAll('textarea');
                if (textareas.length) hasNewTextarea = true;
              }
            });
          }
        });
        
        if (hasNewTextarea) {
          console.log('检测到新的textarea元素，添加格式化按钮');
          enhanceAllEditors();
        }
      });
      
      // 配置观察选项
      const config = { childList: true, subtree: true };
      
      // 开始观察
      observer.observe(document.body, config);
      console.log('DOM观察器已启动');
    }
    
    // 添加全局快捷键辅助功能
    function addGlobalFormatHelper() {
      // 添加全局快捷键
      document.addEventListener('keydown', function(e) {
        // Alt+Shift+F - 尝试找到当前焦点的编辑器并格式化
        if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'f') {
          e.preventDefault();
          
          // 查找当前焦点的编辑器
          const activeEditor = document.activeElement;
          if (activeEditor && activeEditor.tagName === 'TEXTAREA') {
            try {
              const originalContent = activeEditor.value;
              const formattedContent = formatMarkdownCodeBlocks(originalContent);
              
              if (originalContent !== formattedContent) {
                activeEditor.value = formattedContent;
                
                // 触发change事件
                activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
                showToast('代码格式化成功', 'success');
              } else {
                showToast('没有发现可格式化的代码块', 'error');
              }
            } catch (error) {
              console.error('格式化过程发生错误:', error);
              showToast('格式化过程发生错误', 'error');
            }
          } else {
            showToast('请先点击要格式化的编辑器', 'error');
          }
        }
      });
    }
    
    // 初始化
    addStyles();
    enhanceAllEditors();
    observeDOM();
    addGlobalFormatHelper();
    
    // 定期检查新的编辑器
    setInterval(enhanceAllEditors, 3000);
    
    console.log('代码格式化工具初始化完成');
    setTimeout(() => {
      showToast('代码格式化工具已加载', 'success');
    }, 1000);
  }
  
  // 开始检查并加载Prettier
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPrettier);
  } else {
    loadPrettier();
  }
})();
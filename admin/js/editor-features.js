/**
 * DecapCMS 编辑器增强功能
 * 使用IIFE避免全局命名空间污染
 */
(function() {
  // 控制台日志前缀，方便调试
  const logPrefix = '[EditorEnhance]';
  
  // 记录日志的辅助函数
  const log = (message) => {
    console.log(`${logPrefix} ${message}`);
  };
  
  // 记录错误的辅助函数
  const logError = (message, error) => {
    console.error(`${logPrefix} ${message}`, error);
  };
  
  // 添加编辑器增强功能
  const enhanceTextarea = (textarea) => {
    if (!textarea || textarea.dataset.editorEnhanceAttached) return;
    
    log(`增强编辑器: ${textarea.id || 'unnamed'}`);
    textarea.dataset.editorEnhanceAttached = 'true';
    textarea.classList.add('enhanced-editor');
    
    // 添加键盘快捷键 (Ctrl+Shift+F 格式化代码)
    textarea.addEventListener('keydown', (e) => {
      // Ctrl+Shift+F 或 Cmd+Shift+F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        const language = _determineLanguage(textarea);
        _formatCurrentCode(textarea, language);
      }
    });
    
    // 为非Markdown编辑器添加常规格式化按钮
    const addFormatButton = () => {
      // 避免重复添加按钮
      if (textarea.parentElement && !textarea.parentElement.querySelector('.enhance-format-button')) {
        const button = document.createElement('button');
        button.className = 'enhance-format-button';
        button.textContent = '格式化代码 (Ctrl+Shift+F)';
        button.style.cssText = 'margin: 5px; padding: 3px 8px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;';
        button.onclick = (e) => {
          e.preventDefault();
          const language = _determineLanguage(textarea);
          _formatCurrentCode(textarea, language);
        };
        
        // 尝试插入按钮
        try {
          if (textarea.parentElement) {
            textarea.parentElement.insertBefore(button, textarea);
          }
        } catch (err) {
          logError('添加格式化按钮失败', err);
        }
      }
    };
    
    // 检查是否是Markdown编辑器
    if (_isMarkdownEditor(textarea)) {
      // 为Markdown编辑器添加专门的格式化处理
      log('检测到Markdown编辑器');
      _attachMarkdownSpecificFeatures(textarea);
    } else {
      // 尝试添加按钮
      setTimeout(addFormatButton, 500);
    }
    
    // 添加自动缩进功能
    textarea.addEventListener('keydown', (e) => {
      // 当按下Enter键时
      if (e.key === 'Enter') {
        // 延迟执行，让默认的Enter换行先生效
        setTimeout(() => {
          try {
            const value = textarea.value;
            const cursorPos = textarea.selectionStart;
            
            // 找到当前行的开始位置
            let lineStart = value.lastIndexOf('\n', cursorPos - 2);
            lineStart = lineStart === -1 ? 0 : lineStart + 1;
            
            // 提取前一行
            const prevLine = value.substring(lineStart, cursorPos - 1);
            
            // 计算前一行开头的空白字符数量
            const indentMatch = prevLine.match(/^(\s+)/);
            let indent = indentMatch ? indentMatch[1] : '';
            
            // 检测是否应该增加缩进 (例如，如果前一行以花括号、冒号等结尾)
            if (prevLine.trim().endsWith('{') || 
                prevLine.trim().endsWith(':') ||
                prevLine.trim().endsWith('(') ||
                prevLine.trim().endsWith('[')) {
              indent += '  '; // 增加两个空格的缩进
            }
            
            // Markdown列表自动继续
            if (/^[\s]*[-*+]\s/.test(prevLine)) {
              // 如果前一行是空的列表项，移除列表符号（结束列表）
              if (prevLine.trim() === '-' || prevLine.trim() === '*' || prevLine.trim() === '+') {
                // 删除刚才输入的换行和列表符号
                const textBeforeCursor = value.substring(0, lineStart);
                const textAfterCursor = value.substring(cursorPos);
                textarea.value = textBeforeCursor + textAfterCursor;
                textarea.selectionStart = textarea.selectionEnd = lineStart;
                return;
              } else {
                // 继续列表
                const listMarker = prevLine.match(/^[\s]*([-*+])\s/)[1];
                indent += listMarker + ' ';
              }
            }
            
            // 有序列表自动继续
            const orderedListMatch = prevLine.match(/^(\s*)(\d+)\.(\s+)/);
            if (orderedListMatch) {
              const [, listIndent, num, space] = orderedListMatch;
              // 如果前一行是空的列表项，移除列表符号（结束列表）
              if (prevLine.trim() === `${num}.`) {
                // 删除刚才输入的换行和列表符号
                const textBeforeCursor = value.substring(0, lineStart);
                const textAfterCursor = value.substring(cursorPos);
                textarea.value = textBeforeCursor + textAfterCursor;
                textarea.selectionStart = textarea.selectionEnd = lineStart;
                return;
              } else {
                // 继续列表，数字加1
                indent = listIndent + (parseInt(num) + 1) + '.' + space;
              }
            }
            
            // 在代码块内部保持缩进
            const codeBlockMatch = _isInsideCodeBlock(value, cursorPos);
            if (codeBlockMatch) {
              // 在代码块内部额外处理
            }
            
            // 插入缩进
            if (indent) {
              const before = value.substring(0, cursorPos);
              const after = value.substring(cursorPos);
              textarea.value = before + indent + after;
              
              // 设置光标位置
              textarea.selectionStart = textarea.selectionEnd = cursorPos + indent.length;
              
              // 触发change事件
              const event = new Event('input', { bubbles: true });
              textarea.dispatchEvent(event);
            }
          } catch (err) {
            logError('处理Enter键自动缩进时出错', err);
          }
        }, 0);
      }
      
      // 当按下Tab键时
      if (e.key === 'Tab') {
        e.preventDefault();
        
        try {
          const value = textarea.value;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          
          // 检查是否在代码块内
          const codeBlockMatch = _isInsideCodeBlock(value, start);
          
          // 检查是否有选择范围
          if (start !== end) {
            // 多行缩进
            const startLinePos = value.lastIndexOf('\n', start - 1) + 1;
            const endLinePos = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end);
            
            const selectedLines = value.substring(startLinePos, endLinePos);
            const lines = selectedLines.split('\n');
            
            // 处理每一行
            let newLines;
            if (!e.shiftKey) {
              // 增加缩进
              newLines = lines.map(line => '  ' + line);
            } else {
              // 减少缩进
              newLines = lines.map(line => {
                if (line.startsWith('  ')) {
                  return line.substring(2);
                } else if (line.startsWith(' ')) {
                  return line.substring(1);
                }
                return line;
              });
            }
            
            const newSelectedText = newLines.join('\n');
            textarea.value = value.substring(0, startLinePos) + newSelectedText + value.substring(endLinePos);
            
            // 设置新的选择范围
            textarea.selectionStart = startLinePos;
            textarea.selectionEnd = startLinePos + newSelectedText.length;
          } else {
            // 单光标缩进
            if (!e.shiftKey) {
              // 增加缩进 (两个空格)
              textarea.value = value.substring(0, start) + '  ' + value.substring(end);
              textarea.selectionStart = textarea.selectionEnd = start + 2;
            } else {
              // 减少缩进
              const lineStart = value.lastIndexOf('\n', start - 1) + 1;
              const linePrefix = value.substring(lineStart, start);
              
              if (linePrefix.startsWith('  ')) {
                // 移除两个空格
                textarea.value = value.substring(0, lineStart) + linePrefix.substring(2) + value.substring(start);
                textarea.selectionStart = textarea.selectionEnd = start - 2 > lineStart ? start - 2 : lineStart;
              } else if (linePrefix.startsWith(' ')) {
                // 移除一个空格
                textarea.value = value.substring(0, lineStart) + linePrefix.substring(1) + value.substring(start);
                textarea.selectionStart = textarea.selectionEnd = start - 1 > lineStart ? start - 1 : lineStart;
              }
            }
          }
          
          // 触发change事件
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
        } catch (err) {
          logError('处理Tab键自动缩进时出错', err);
        }
      }
    });
    
    // 花括号自动配对
    textarea.addEventListener('input', (e) => {
      try {
        // 如果最后一个字符是左花括号
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        // 检查是否在代码块内
        const codeBlockMatch = _isInsideCodeBlock(value, cursorPos);
        
        // 只处理输入的字符，并且在代码块内或者不是Markdown编辑器
        if (cursorPos > 0 && e.inputType === 'insertText' && (codeBlockMatch || !_isMarkdownEditor(textarea))) {
          const lastChar = value.charAt(cursorPos - 1);
          
          // 自动插入对应的闭合字符
          const pairs = {
            '{': '}',
            '[': ']',
            '(': ')',
            '"': '"',
            "'": "'",
            '`': '`'
          };
          
          if (lastChar in pairs) {
            const closingChar = pairs[lastChar];
            textarea.value = value.substring(0, cursorPos) + closingChar + value.substring(cursorPos);
            textarea.selectionStart = textarea.selectionEnd = cursorPos;
            
            // 触发change事件
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
          }
        }
      } catch (err) {
        logError('处理花括号自动配对时出错', err);
      }
    });
  };
  
  // 为Markdown编辑器添加特定功能
  const _attachMarkdownSpecificFeatures = (textarea) => {
    textarea.addEventListener('input', (e) => {
      // 检测输入三个反引号
      try {
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        if (e.inputType === 'insertText' && cursorPos >= 3) {
          const lastThreeChars = value.substring(cursorPos - 3, cursorPos);
          
          if (lastThreeChars === '```') {
            // 自动添加语言标识和闭合标记
            setTimeout(() => {
              // 显示语言选择框
              const languages = ['javascript', 'css', 'html', 'python', 'bash', 'yaml', 'json', 'typescript', 'jsx'];
              
              // 创建语言选择框
              const langSelect = document.createElement('div');
              langSelect.className = 'enhance-language-selector';
              langSelect.style.cssText = 'position: absolute; z-index: 1000; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 5px; max-height: 200px; overflow-y: auto;';
              
              // 定位到光标位置
              const rect = textarea.getBoundingClientRect();
              const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
              
              // 找到光标的位置
              let pos = 0;
              let lineNumber = 0;
              for (let i = 0; i < cursorPos; i++) {
                if (value[i] === '\n') {
                  lineNumber++;
                  pos = 0;
                } else {
                  pos++;
                }
              }
              
              langSelect.style.left = (rect.left + pos * 8) + 'px'; // 8px是估计的字符宽度
              langSelect.style.top = (rect.top + lineNumber * lineHeight) + 'px';
              
              // 添加语言选项
              languages.forEach(lang => {
                const option = document.createElement('div');
                option.textContent = lang;
                option.style.cssText = 'padding: 3px 8px; cursor: pointer;';
                option.onmouseover = () => { option.style.background = '#f0f0f0'; };
                option.onmouseout = () => { option.style.background = 'transparent'; };
                option.onclick = () => {
                  // 插入语言标识和闭合标记
                  const newValue = value.substring(0, cursorPos) + lang + '\n\n```' + value.substring(cursorPos);
                  textarea.value = newValue;
                  textarea.selectionStart = textarea.selectionEnd = cursorPos + lang.length + 1;
                  
                  // 触发change事件
                  const event = new Event('input', { bubbles: true });
                  textarea.dispatchEvent(event);
                  
                  // 移除语言选择框
                  document.body.removeChild(langSelect);
                };
                langSelect.appendChild(option);
              });
              
              document.body.appendChild(langSelect);
              
              // 点击其他地方关闭选择框
              const closeHandler = (e) => {
                if (!langSelect.contains(e.target)) {
                  document.body.removeChild(langSelect);
                  document.removeEventListener('click', closeHandler);
                }
              };
              
              // 延迟添加点击监听，避免立即触发
              setTimeout(() => {
                document.addEventListener('click', closeHandler);
              }, 100);
            }, 10);
          }
        }
      } catch (err) {
        logError('处理Markdown代码块时出错', err);
      }
    });
  };
  
  // 检查光标是否在代码块内
  const _isInsideCodeBlock = (text, cursorPos) => {
    if (!text) return false;
    
    try {
      // 查找光标之前的最后一个代码块开始标记
      const lastStart = text.lastIndexOf('```', cursorPos);
      if (lastStart === -1) return false;
      
      // 查找光标之后的第一个代码块结束标记
      const nextEnd = text.indexOf('```', cursorPos);
      
      // 在开始标记之后和结束标记之前查找换行符
      const newlineAfterStart = text.indexOf('\n', lastStart);
      
      // 检查最后一个开始标记和光标之间是否有换行符
      if (newlineAfterStart === -1 || newlineAfterStart > cursorPos) return false;
      
      // 查找代码块开始和光标之间的代码块结束标记
      const endBetween = text.indexOf('```', lastStart + 3);
      if (endBetween !== -1 && endBetween < cursorPos) return false;
      
      // 提取语言标识
      const langLine = text.substring(lastStart + 3, newlineAfterStart).trim();
      
      return {
        isInside: true,
        language: langLine || 'text',
        blockStart: lastStart,
        blockEnd: nextEnd === -1 ? text.length : nextEnd
      };
    } catch (err) {
      logError('检查代码块时出错', err);
      return false;
    }
  };
  
  // 判断是否是Markdown编辑器
  const _isMarkdownEditor = (textarea) => {
    if (!textarea) return false;
    
    try {
      // 检查textarea或其父元素是否包含markdown相关标识
      const isInMarkdownContext = (element) => {
        if (!element) return false;
        
        // 向上查找最多10层父元素
        let current = element;
        let depth = 0;
        while (current && depth < 10) {
          // 检查元素id或class是否包含markdown相关字符
          if (current.id && (
              current.id.toLowerCase().includes('markdown') ||
              current.id.toLowerCase().includes('md-editor')
          )) {
            return true;
          }
          
          // 检查className (可能是字符串或对象)
          if (current.className) {
            if (typeof current.className === 'string' && (
                current.className.toLowerCase().includes('markdown') ||
                current.className.toLowerCase().includes('md-editor') ||
                current.className.toLowerCase().includes('cms-editor')
            )) {
              return true;
            }
            
            // 检查classList
            if (current.classList && (
                current.classList.contains('markdown-editor') ||
                current.classList.contains('md-editor') ||
                current.classList.contains('cms-editor-component')
            )) {
              return true;
            }
          }
          
          // 检查数据属性
          if (current.dataset && (
              current.dataset.type === 'markdown' ||
              current.dataset.widget === 'markdown'
          )) {
            return true;
          }
          
          current = current.parentElement;
          depth++;
        }
        
        return false;
      };
      
      // 检查textarea自身的属性
      const hasMdAttrs = 
        (textarea.id && (
          textarea.id.toLowerCase().includes('markdown') || 
          textarea.id.toLowerCase().includes('md')
        )) ||
        (typeof textarea.className === 'string' && (
          textarea.className.toLowerCase().includes('markdown') || 
          textarea.className.toLowerCase().includes('md-editor')
        )) ||
        (textarea.dataset && textarea.dataset.type === 'markdown') ||
        (textarea.name && textarea.name.toLowerCase().includes('markdown'));
      
      return hasMdAttrs || isInMarkdownContext(textarea);
    } catch (err) {
      logError('检查是否为Markdown编辑器时出错', err);
      return false;
    }
  };
  
  // 确定编辑器语言
  const _determineLanguage = (textarea) => {
    try {
      // 检查是否在代码块内
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;
      const codeBlockMatch = _isInsideCodeBlock(value, cursorPos);
      
      if (codeBlockMatch && codeBlockMatch.language) {
        return codeBlockMatch.language;
      }
      
      // 如果是Markdown编辑器，默认返回markdown
      if (_isMarkdownEditor(textarea)) {
        return 'markdown';
      }
      
      // 默认返回javascript (常见的代码编辑情况)
      return 'javascript';
    } catch (err) {
      logError('确定编辑器语言时出错', err);
      return 'text';
    }
  };
  
  // 格式化当前代码
  const _formatCurrentCode = (textarea, language) => {
    log(`格式化代码，语言: ${language}`);
    
    try {
      // 简单格式化示例
      let code = textarea.value;
      
      // 基本格式化逻辑
      if (language === 'javascript' || language === 'typescript' || language === 'json') {
        code = _basicJSFormat(code);
      } else if (language === 'html' || language === 'xml') {
        code = _basicHTMLFormat(code);
      } else if (language === 'css') {
        code = _basicCSSFormat(code);
      }
      
      textarea.value = code;
      
      // 触发change事件
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
      
      log('代码格式化完成');
    } catch (err) {
      logError('格式化代码时出错', err);
    }
  };
  
  // 简易JS代码格式化
  const _basicJSFormat = (code) => {
    if (!code) return code;
    
    try {
      // 移除多余空行
      code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // 简单缩进处理
      let formatted = '';
      let indent = 0;
      let lines = code.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // 闭合括号减少缩进
        if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
          indent = Math.max(0, indent - 1);
        }
        
        // 添加当前行和适当的缩进
        if (line.length > 0) {
          formatted += ' '.repeat(indent * 2) + line + '\n';
        } else {
          formatted += '\n'; // 保留空行
        }
        
        // 开括号增加缩进
        if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(')) {
          indent++;
        }
        
        // 特殊处理 } else { 这种情况
        if (line.endsWith('}') && i < lines.length - 1 && 
            lines[i+1].trim().startsWith('else')) {
          indent++;
        }
      }
      
      return formatted;
    } catch (err) {
      logError('格式化JS代码时出错', err);
      return code; // 返回原始代码
    }
  };
  
  // 基本HTML格式化
  const _basicHTMLFormat = (code) => {
    // 简单实现，实际应使用专业库
    return code;
  };
  
  // 基本CSS格式化
  const _basicCSSFormat = (code) => {
    // 简单实现，实际应使用专业库
    return code;
  };
  
  // 查找并增强编辑器
  const findAndEnhanceEditors = () => {
    log('查找并增强编辑器');
    
    try {
      // DecapCMS专用选择器
      const decapSelectors = [
        // 通用编辑器
        'textarea',
        '[contenteditable="true"]',
        
        // Markdown编辑器
        '.CodeMirror textarea',
        '[data-slate-editor="true"]',
        '.cm-content', // CodeMirror 6
        '.ProseMirror',
        
        // 常规编辑器
        '.widget-ui textarea',
        '.netlify-cms-widget-markdown textarea',
        '.netlify-cms-widget-text textarea',
        '.netlify-cms-widget-code textarea'
      ];
      
      // 尝试查找所有可能的编辑器
      decapSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(editor => {
          enhanceTextarea(editor);
        });
      });
    } catch (err) {
      logError('查找编辑器时出错', err);
    }
  };
  
  // 设置DOM变化监听
  const setupMutationObserver = () => {
    try {
      log('设置DOM变化监听器');
      
      // 创建MutationObserver实例
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        
        // 检查是否有相关变化
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (node.nodeType === 1) { // 元素节点
                shouldCheck = true;
                break;
              }
            }
          }
        });
        
        // 如果有相关变化，重新查找编辑器
        if (shouldCheck) {
          setTimeout(findAndEnhanceEditors, 200);
        }
      });
      
      // 开始观察文档主体
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    } catch (err) {
      logError('设置DOM监听器时出错', err);
    }
  };
  
  // 初始化函数
  const initialize = () => {
    log('初始化编辑器增强功能');
    
    // 初始化时查找编辑器
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(findAndEnhanceEditors, 500);
      setupMutationObserver();
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(findAndEnhanceEditors, 500);
        setupMutationObserver();
      });
    }
    
    // 也在load事件后尝试查找编辑器
    window.addEventListener('load', () => {
      setTimeout(findAndEnhanceEditors, 1000);
    });
    
    // 定期检查，确保动态加载的编辑器也能被增强
    setInterval(findAndEnhanceEditors, 5000);
  };
  
  // 导出一个全局方法，用于手动触发编辑器增强
  // 这样在页面中可以用 window.enhanceDecapEditors() 来手动触发
  window.enhanceDecapEditors = findAndEnhanceEditors;
  
  // 启动初始化
  initialize();
})();
/**
 * 编辑器增强功能
 */

// 使用立即执行函数包装所有代码，避免全局污染
(function() {
  // 检查编辑器增强功能是否已初始化
  if (window.editorFeaturesInitialized) {
    console.log('编辑器增强功能已初始化，跳过重复加载');
    return;
  }
  
  // 检查函数是否已存在，并提供引用
  const _isMarkdownEditor = typeof window.isMarkdownEditor === 'function' ? 
    window.isMarkdownEditor : 
    function(textarea) {
      // 默认实现...
      if (!textarea) return false;
      
      // 检查textarea的class、id、name等属性是否包含markdown相关关键词
      const attrs = ['className', 'id', 'name'];
      const markdownKeywords = ['markdown', 'md-editor', 'md_editor'];
      
      for (const attr of attrs) {
        if (textarea[attr] && typeof textarea[attr] === 'string') {
          const lowerValue = textarea[attr].toLowerCase();
          if (markdownKeywords.some(keyword => lowerValue.includes(keyword.toLowerCase()))) {
            return true;
          }
        }
      }
      
      // 检查其父元素是否有markdown相关的类名
      let parent = textarea.parentElement;
      while (parent) {
        if (parent.className && typeof parent.className === 'string') {
          const lowerClass = parent.className.toLowerCase();
          if (markdownKeywords.some(keyword => lowerClass.includes(keyword.toLowerCase()))) {
            return true;
          }
        }
        parent = parent.parentElement;
      }
      
      return false;
    };

  const _determineLanguage = typeof window.determineLanguage === 'function' ?
    window.determineLanguage :
    function(textarea) {
      // 默认实现...
      if (!textarea) return 'javascript'; // 默认语言
      
      if (_isMarkdownEditor(textarea)) {
        // 尝试查找当前光标所在的代码块
        const codeBlockInfo = _isInsideCodeBlock(textarea.value, textarea.selectionStart);
        if (codeBlockInfo && codeBlockInfo.isInside) {
          return codeBlockInfo.language;
        }
      }
      
      // 尝试从HTML属性或周围元素判断语言
      const languageIndicators = {
        'js': 'javascript',
        'javascript': 'javascript',
        'css': 'css',
        'html': 'html',
        'xml': 'xml',
        'json': 'json',
        'ts': 'typescript',
        'typescript': 'typescript',
        'jsx': 'jsx',
        'python': 'python',
        'py': 'python',
        'bash': 'bash',
        'sh': 'bash',
        'c': 'c',
        'cpp': 'cpp',
        'c++': 'cpp',
        'csharp': 'csharp',
        'c#': 'csharp'
      };
      
      // 检查textarea的data属性
      if (textarea.dataset && textarea.dataset.language) {
        const lang = textarea.dataset.language.toLowerCase();
        if (languageIndicators[lang]) {
          return languageIndicators[lang];
        }
      }
      
      // 检查周围元素是否有语言提示
      let parent = textarea.parentElement;
      while (parent) {
        if (parent.className && typeof parent.className === 'string') {
          const lowerClass = parent.className.toLowerCase();
          for (const [key, value] of Object.entries(languageIndicators)) {
            if (lowerClass.includes(key)) {
              return value;
            }
          }
        }
        parent = parent.parentElement;
      }
      
      return 'javascript'; // 默认返回JavaScript
    };

  const _formatCurrentCode = typeof window.formatCurrentCode === 'function' ?
    window.formatCurrentCode :
    function(textarea, language) {
      // 如果外部已定义formatCurrentCode，使用外部函数
      console.log('使用默认的formatCurrentCode实现');
      // 简化实现或调用提示
      alert('格式化功能未完全加载，请刷新页面重试');
    };

  const _addMarkdownFormatButton = typeof window.addMarkdownFormatButton === 'function' ?
    window.addMarkdownFormatButton :
    function(textarea) {
      // 默认实现...
      if (!_isMarkdownEditor(textarea)) return;
  
      const container = textarea.closest('[class*="EditorContainer"], [class*="WidgetPreviewContainer"]');
      if (!container) return;
      
      // 检查是否已添加按钮
      if (container.querySelector('.markdown-format-tools')) return;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'markdown-format-tools';
      buttonContainer.style.cssText = 'display: flex; gap: 10px; margin: 8px 0;';
      
      // 添加格式化按钮
      const formatButton = document.createElement('button');
      formatButton.className = 'markdown-format-button';
      formatButton.textContent = '格式化代码块 (Ctrl+Shift+F)';
      formatButton.onclick = (e) => {
        e.preventDefault();
        _formatCurrentCode(textarea);
      };
      formatButton.style.cssText = 'padding: 5px 10px; background: #4a8fee; color: white; border: none; border-radius: 4px; cursor: pointer;';
      
      buttonContainer.appendChild(formatButton);
      
      // 插入到编辑器上方
      if (textarea.parentElement) {
        textarea.parentElement.insertBefore(buttonContainer, textarea);
      }
    };

  // 检查光标是否在代码块内
  const _isInsideCodeBlock = typeof window.isInsideCodeBlock === 'function' ?
    window.isInsideCodeBlock :
    function(text, cursorPos) {
      // 默认实现...
      if (!text) return false;
      
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
    };
    
  // 添加编辑器增强功能 - 这是我们真正需要的函数
  const enhanceTextarea = function(textarea) {
    if (!textarea || textarea.dataset.formatterAttached) return;
    
    textarea.dataset.formatterAttached = 'true';
    textarea.classList.add('code-editor');
    
    // 添加键盘快捷键 (Ctrl+Shift+F 格式化代码)
    textarea.addEventListener('keydown', (e) => {
      // Ctrl+Shift+F 或 Cmd+Shift+F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        const language = _determineLanguage(textarea);
        _formatCurrentCode(textarea, language);
      }
    });
    
    // 检查是否是Markdown编辑器，添加专门的格式化按钮
    if (_isMarkdownEditor(textarea)) {
      _addMarkdownFormatButton(textarea);
    } else {
      // 为非Markdown编辑器添加常规格式化按钮
      const addFormatButton = () => {
        const container = textarea.parentElement;
        if (!container) return;
        
        // 检查是否已添加按钮
        if (container.querySelector('.format-button')) return;
        
        const button = document.createElement('button');
        button.className = 'format-button';
        button.textContent = '格式化代码 (Ctrl+Shift+F)';
        button.onclick = (e) => {
          e.preventDefault();
          const language = _determineLanguage(textarea);
          _formatCurrentCode(textarea, language);
        };
        
        container.insertBefore(button, textarea);
      };
      
      // 尝试添加按钮
      setTimeout(addFormatButton, 500);
    }
    
    // 添加自动缩进功能
    textarea.addEventListener('keydown', (e) => {
      // 当按下Enter键时
      if (e.key === 'Enter') {
        // 延迟执行，让默认的Enter换行先生效
        setTimeout(() => {
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
        }, 0);
      }
      
      // 当按下Tab键时
      if (e.key === 'Tab') {
        e.preventDefault();
        
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
      }
    });
    
    // 花括号自动配对
    textarea.addEventListener('input', (e) => {
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
    });
    
    // 为Markdown编辑器添加代码块快捷方式
    if (_isMarkdownEditor(textarea)) {
      textarea.addEventListener('input', (e) => {
        // 检测输入三个反引号
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        if (e.inputType === 'insertText' && cursorPos >= 3) {
          const lastThreeChars = value.substring(cursorPos - 3, cursorPos);
          
          if (lastThreeChars === '```') {
            // 自动添加语言标识和闭合标记
            setTimeout(() => {
              // 显示语言选择框 - 添加C, C++, C#到选项中
              const languages = [
                'javascript', 'css', 'html', 'python', 'bash', 'yaml', 'json', 'typescript', 'jsx',
                'c', 'cpp', 'csharp' // 添加C, C++, C#
              ];
              
              // 创建语言选择框
              const langSelect = document.createElement('div');
              langSelect.className = 'language-selector';
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
                // 显示友好名称
                let displayName = lang;
                if (lang === 'cpp') displayName = 'C++';
                if (lang === 'csharp') displayName = 'C#';
                
                option.textContent = displayName;
                option.style.cssText = 'padding: 3px 8px; cursor: pointer; hover: background #f0f0f0;';
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
      });
    }
  };

  // 查找并增强所有代码编辑框
  const findAndEnhanceEditors = function() {
    const widgets = document.querySelectorAll('[class*="WidgetPreviewContainer"]');
    widgets.forEach(widget => {
      const textareas = widget.querySelectorAll('textarea');
      textareas.forEach(enhanceTextarea);
    });
    
    // 特别查找可能的Markdown编辑器
    const mdEditors = document.querySelectorAll('textarea[class*="markdown"], textarea[class*="Markdown"], textarea[class*="md-editor"]');
    mdEditors.forEach(enhanceTextarea);
    
    // 查找通用编辑器
    const editors = document.querySelectorAll('textarea[class*="Editor"], [class*="editor"] textarea');
    editors.forEach(enhanceTextarea);
  };

  // 保持本地引用而不是导出到全局
  window.enhanceTextarea = enhanceTextarea;
  window.findAndEnhanceEditors = findAndEnhanceEditors;
  
  // 标记为已初始化
  window.editorFeaturesInitialized = true;
  
  console.log('编辑器增强功能已加载（修改版）');
})();
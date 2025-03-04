/**
 * 编辑器增强功能
 */

// 添加编辑器增强功能
const enhanceTextarea = (textarea) => {
  if (!textarea || textarea.dataset.formatterAttached) return;
  
  textarea.dataset.formatterAttached = 'true';
  textarea.classList.add('code-editor');
  
  // 添加键盘快捷键 (Ctrl+Shift+F 格式化代码)
  textarea.addEventListener('keydown', (e) => {
    // Ctrl+Shift+F 或 Cmd+Shift+F (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      const language = determineLanguage(textarea);
      formatCurrentCode(textarea, language);
    }
  });
  
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
    
    // 只处理输入的字符
    if (cursorPos > 0 && e.inputType === 'insertText') {
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
  
  // 添加一个格式化按钮
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
      const language = determineLanguage(textarea);
      formatCurrentCode(textarea, language);
    };
    
    container.insertBefore(button, textarea);
  };
  
  // 尝试添加按钮
  setTimeout(addFormatButton, 500);
};

// 查找并增强所有代码编辑框
const findAndEnhanceEditors = () => {
  const widgets = document.querySelectorAll('[class*="WidgetPreviewContainer"]');
  widgets.forEach(widget => {
    const textareas = widget.querySelectorAll('textarea');
    textareas.forEach(enhanceTextarea);
  });
};
/**
 * 代码格式化功能
 */

// 代码格式化函数
const formatCode = (code, language) => {
  try {
    // 确定 Prettier 解析器
    let parser;
    switch (language) {
      case 'javascript':
      case 'js':
        parser = 'babel';
        break;
      case 'typescript':
      case 'ts':
        parser = 'typescript';
        break;
      case 'jsx':
      case 'tsx':
        parser = 'babel';
        break;
      case 'css':
        parser = 'css';
        break;
      case 'html':
        parser = 'html';
        break;
      case 'markdown':
      case 'md':
        parser = 'markdown';
        break;
      case 'yaml':
      case 'yml':
        parser = 'yaml';
        break;
      case 'json':
        parser = 'json';
        break;
      default:
        // 对于不支持的语言，返回原始代码
        return code;
    }

    // 格式化代码
    const formatted = prettier.format(code, {
      parser,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      bracketSpacing: true,
      jsxBracketSameLine: false,
      arrowParens: 'avoid',
    });
    
    return formatted;
  } catch (e) {
    console.error('格式化代码失败:', e);
    // 返回原始代码
    return code;
  }
};

// 格式化当前编辑器内容
const formatCurrentCode = (textarea, language = 'javascript') => {
  if (!textarea) return;
  
  const selection = {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    value: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  };
  
  // 如果有选中的代码，只格式化选中的部分
  if (selection.start !== selection.end) {
    const formatted = formatCode(selection.value, language);
    const newValue = textarea.value.substring(0, selection.start) + 
                      formatted + 
                      textarea.value.substring(selection.end);
    textarea.value = newValue;
  } else {
    // 否则格式化整个内容
    textarea.value = formatCode(textarea.value, language);
  }
  
  // 触发change事件，确保值被保存
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

// 从上下文确定语言
const determineLanguage = (textarea) => {
  let language = 'javascript'; // 默认
  
  const editorContainer = textarea.closest('[class*="EditorContainer"]');
  
  if (editorContainer) {
    // 尝试从字段名或标签中猜测语言
    const fieldLabels = editorContainer.querySelectorAll('label, [class*="FieldLabel"]');
    fieldLabels.forEach(label => {
      const text = label.textContent.toLowerCase();
      if (text.includes('javascript') || text.includes('js')) {
        language = 'javascript';
      } else if (text.includes('css')) {
        language = 'css';
      } else if (text.includes('html')) {
        language = 'html';
      } else if (text.includes('python') || text.includes('py')) {
        language = 'python';
      } else if (text.includes('yaml') || text.includes('yml')) {
        language = 'yaml';
      } else if (text.includes('json')) {
        language = 'json';
      }
    });
    
    // 如果编辑的是代码块，尝试从 Markdown 代码块中提取语言
    const value = textarea.value;
    if (value.startsWith('```')) {
      const match = value.match(/^```(\w+)/);
      if (match && match[1]) {
        language = match[1];
      }
    }
  }
  
  return language;
};
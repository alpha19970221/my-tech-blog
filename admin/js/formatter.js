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
      case 'c':
      case 'cpp':
      case 'c++':
        return await formatWithClangFormat(code);
      case 'csharp':
      case 'cs':
        return await formatWithCsharpier(code);
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

// 使用 Web API 进行 C/C++ 代码格式化
const formatWithClangFormat = async (code) => {
  try {
    const response = await fetch('https://clang-format-web-api.com/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, style: 'Google' })
    });
    const result = await response.text();
    return result;
  } catch (error) {
    console.warn('Clang-Format API 请求失败:', error);
    return code;
  }
};

// 使用 Web API 进行 C# 代码格式化
const formatWithCsharpier = async (code) => {
  try {
    const response = await fetch('https://csharpier-web-api.com/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const result = await response.text();
    return result;
  } catch (error) {
    console.warn('CSharpier API 请求失败:', error);
    return code;
  }
};

// 格式化 Markdown 中的代码块
const formatMarkdownCodeBlocks = (markdown) => {
  if (!markdown) return markdown;
  
  // 正则表达式匹配 Markdown 代码块: ```language\n code \n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  
  return markdown.replace(codeBlockRegex, (match, language, code) => {
    // 如果没有指定语言，默认为JavaScript
    const lang = language || 'javascript';
    
    try {
      // 尝试格式化代码
      const formattedCode = formatCode(code, lang);
      return '```' + lang + '\n' + formattedCode + '\n```';
    } catch (e) {
      console.error('格式化Markdown代码块失败:', e);
      // 保持原样
      return match;
    }
  });
};

// 格式化当前编辑器内容
const formatCurrentCode = (textarea, language = 'javascript') => {
  if (!textarea) return;
  
  const value = textarea.value;
  const selection = {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    value: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  };
  
  // 检测是否是Markdown文档
  const isMarkdown = isMarkdownEditor(textarea);
  
  // 如果有选中的代码，只格式化选中的部分
  if (selection.start !== selection.end) {
    let formattedText;
    
    if (isMarkdown) {
      // 尝试作为Markdown代码块格式化选中内容
      formattedText = formatMarkdownCodeBlocks(selection.value);
      
      // 如果没有匹配到代码块，则尝试作为单一语言的代码进行格式化
      if (formattedText === selection.value) {
        // 检查是否是单个代码块的内容（没有围绕的```）
        const isCodeBlockContent = isCodeWithoutDelimiters(selection.value);
        if (isCodeBlockContent) {
          formattedText = formatCode(selection.value, language);
        }
      }
    } else {
      // 非Markdown模式直接格式化
      formattedText = formatCode(selection.value, language);
    }
    
    const newValue = textarea.value.substring(0, selection.start) + 
                     formattedText + 
                     textarea.value.substring(selection.end);
    textarea.value = newValue;
  } else {
    // 格式化整个内容
    if (isMarkdown) {
      textarea.value = formatMarkdownCodeBlocks(value);
    } else {
      textarea.value = formatCode(value, language);
    }
  }
  
  // 触发change事件，确保值被保存
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

// 判断是否是代码块内容（没有围绕的```）
const isCodeWithoutDelimiters = (text) => {
  // 简单判断：是否包含编程语言常见字符和结构
  const codePatterns = [
    /function\s*\(/,      // 函数声明
    /const|let|var/,      // 变量声明
    /if\s*\(|else\s*{/,   // 条件语句
    /for\s*\(|while\s*\(/, // 循环
    /class\s+\w+/,        // 类定义
    /import\s+|export\s+/, // ES模块
    /\=\>|\.then\(/,      // 箭头函数或Promise
    /\{\s*[\w'"]+\s*\:/    // 对象字面量
  ];
  
  return codePatterns.some(pattern => pattern.test(text));
};

// 判断当前编辑器是否为Markdown编辑器
const isMarkdownEditor = (textarea) => {
  if (!textarea) return false;
  
  // 检查编辑器容器或字段标签是否包含'markdown'
  const container = textarea.closest('[class*="EditorContainer"], [class*="WidgetPreviewContainer"]');
  if (container) {
    const labels = container.querySelectorAll('label, [class*="FieldLabel"]');
    for (const label of labels) {
      if (label.textContent.toLowerCase().includes('markdown') || 
          label.textContent.toLowerCase().includes('md') ||
          label.textContent.toLowerCase().includes('内容') ||  // "内容"通常是markdown编辑器
          label.textContent.toLowerCase().includes('正文')) {  // "正文"也常用于markdown
        return true;
      }
    }
  }
  
  // 检查编辑器内容是否包含Markdown格式
  const value = textarea.value;
  const markdownPatterns = [
    /^#+ .*$/m,             // 标题
    /\[.*\]\(.*\)/,         // 链接
    /!\[.*\]\(.*\)/,        // 图片
    /^>\s.*$/m,             // 引用
    /^[-*+]\s.*$/m,         // 无序列表
    /^[0-9]+\.\s.*$/m,      // 有序列表
    /^```[\s\S]*?```$/m,    // 代码块
    /\*\*.*\*\*/,           // 粗体
    /\*.*\*/,               // 斜体
    /^---$/m                // 分隔线
  ];
  
  return markdownPatterns.some(pattern => pattern.test(value));
};

// 为Markdown专门添加格式化按钮
const addMarkdownFormatButton = (textarea) => {
  if (!isMarkdownEditor(textarea)) return;
  
  const container = textarea.closest('[class*="EditorContainer"], [class*="WidgetPreviewContainer"]');
  if (!container) return;
  
  // 检查是否已添加专门的Markdown按钮
  if (container.querySelector('.markdown-format-tools')) return;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'markdown-format-tools';
  buttonContainer.style.cssText = 'display: flex; gap: 10px; margin: 8px 0;';
  
  // 添加格式化所有代码块按钮
  const formatAllButton = document.createElement('button');
  formatAllButton.className = 'markdown-format-button';
  formatAllButton.textContent = '格式化所有代码块';
  formatAllButton.onclick = (e) => {
    e.preventDefault();
    formatCurrentCode(textarea, 'markdown');
  };
  formatAllButton.style.cssText = 'padding: 5px 10px; background: #4a8fee; color: white; border: none; border-radius: 4px; cursor: pointer;';
  
  // 添加格式化选中代码按钮
  const formatSelectedButton = document.createElement('button');
  formatSelectedButton.className = 'markdown-format-button';
  formatSelectedButton.textContent = '格式化选中代码';
  formatSelectedButton.onclick = (e) => {
    e.preventDefault();
    const selection = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      value: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
    };
    
    if (selection.start !== selection.end) {
      // 尝试检测语言
      let language = 'javascript';
      const match = selection.value.match(/^```(\w+)/);
      if (match && match[1]) {
        language = match[1];
      }
      
      formatCurrentCode(textarea, language);
    } else {
      alert('请先选择要格式化的代码');
    }
  };
  formatSelectedButton.style.cssText = 'padding: 5px 10px; background: #4a8fee; color: white; border: none; border-radius: 4px; cursor: pointer;';
  
  // 添加提示信息
  const helpText = document.createElement('span');
  helpText.textContent = '或使用 Ctrl+Shift+F 快捷键';
  helpText.style.cssText = 'margin-left: 10px; color: #666; font-size: 12px; align-self: center;';
  
  buttonContainer.appendChild(formatAllButton);
  buttonContainer.appendChild(formatSelectedButton);
  buttonContainer.appendChild(helpText);
  
  // 插入到编辑器上方
  if (textarea.parentElement) {
    textarea.parentElement.insertBefore(buttonContainer, textarea);
  }
};

// 从上下文确定语言
const determineLanguage = (textarea) => {
  let language = 'javascript'; // 默认
  
  // 如果是Markdown编辑器，默认解析器为markdown
  if (isMarkdownEditor(textarea)) {
    return 'markdown';
  }
  
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
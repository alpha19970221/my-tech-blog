/**
 * 代码格式化功能
 */

// 检查并加载Prettier库及其插件
const loadPrettier = () => {
  return new Promise((resolve, reject) => {
    // 检查Prettier是否已加载
    if (typeof prettier !== 'undefined') {
      console.log('Prettier已加载');
      resolve();
      return;
    }
    
    console.log('正在加载Prettier库...');
    
    // 加载Prettier核心库
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/prettier@2.8.8/standalone.js';
    script.onload = () => {
      console.log('Prettier核心库加载成功');
      // 加载所需的解析器
      loadPrettierPlugins().then(resolve).catch(reject);
    };
    script.onerror = (e) => {
      console.error('加载Prettier库失败:', e);
      reject(e);
    };
    document.head.appendChild(script);
  });
};

// 加载Prettier解析器插件
const loadPrettierPlugins = () => {
  return new Promise((resolve, reject) => {
    const plugins = [
      { name: 'babel', url: 'https://unpkg.com/prettier@2.8.8/parser-babel.js' },
      { name: 'html', url: 'https://unpkg.com/prettier@2.8.8/parser-html.js' },
      { name: 'typescript', url: 'https://unpkg.com/prettier@2.8.8/parser-typescript.js' },
      { name: 'markdown', url: 'https://unpkg.com/prettier@2.8.8/parser-markdown.js' },
      { name: 'postcss', url: 'https://unpkg.com/prettier@2.8.8/parser-postcss.js' }, // 用于CSS
      { name: 'yaml', url: 'https://unpkg.com/prettier@2.8.8/parser-yaml.js' },
      { name: 'json', url: 'https://unpkg.com/prettier@2.8.8/parser-json.js' }
    ];
    
    let loadedCount = 0;
    let errors = [];
    
    plugins.forEach(plugin => {
      const script = document.createElement('script');
      script.src = plugin.url;
      script.onload = () => {
        console.log(`解析器 ${plugin.name} 加载成功`);
        loadedCount++;
        if (loadedCount === plugins.length) {
          console.log('所有Prettier解析器已加载完成');
          resolve();
        }
      };
      script.onerror = (e) => {
        console.error(`加载解析器 ${plugin.name} 失败:`, e);
        errors.push(plugin.name);
        loadedCount++;
        if (loadedCount === plugins.length) {
          if (errors.length > 0) {
            console.warn(`部分解析器加载失败: ${errors.join(', ')}`);
          }
          resolve(); // 即使有错误也继续
        }
      };
      document.head.appendChild(script);
    });
  });
};

// 初始化函数
const initFormatter = () => {
  console.log('正在初始化代码格式化器...');
  loadPrettier()
    .then(() => {
      console.log('代码格式化器初始化完成');
      // 可以在这里添加额外的初始化逻辑
    })
    .catch(error => {
      console.error('初始化代码格式化器失败:', error);
    });
};

// 在页面加载完成后初始化
if (document.readyState === 'complete') {
  initFormatter();
} else {
  window.addEventListener('load', initFormatter);
}

// 代码格式化函数
const formatCode = (code, language) => {
  try {
    // 确保Prettier已加载
    if (typeof prettier === 'undefined') {
      console.error('Prettier库未加载');
      // 尝试加载Prettier
      loadPrettier().catch(e => console.error('尝试加载Prettier失败:', e));
      return code;
    }
    
    // 确定Prettier解析器
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
    
    // 检查解析器是否可用
    if (!prettier.parsers || !prettier.parsers[parser]) {
      console.warn(`Prettier解析器 "${parser}" 不可用`);
      return code; // 临时返回原始代码
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

// 格式化Markdown中的代码块
const formatMarkdownCodeBlocks = (markdown) => {
  if (!markdown) return markdown;
  
  // 正则表达式匹配Markdown代码块: ```language\n code \n```
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
  
  // 确保Prettier已加载
  if (typeof prettier === 'undefined') {
    console.warn('Prettier尚未加载，正在尝试加载...');
    loadPrettier().then(() => {
      // 加载成功后重试格式化
      formatCurrentCode(textarea, language);
    }).catch(e => {
      console.error('加载Prettier失败，无法格式化代码:', e);
      alert('加载代码格式化工具失败，请刷新页面重试');
    });
    return;
  }
  
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
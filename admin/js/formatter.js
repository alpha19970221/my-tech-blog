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
    script.src = 'https://unpkg.com/prettier@3.0.3/standalone.js';
    script.onload = () => {
      console.log('Prettier核心库加载成功');
      // 加载所需的解析器
      loadPrettierPlugins().then(resolve).catch(reject);
    };
    script.onerror = (e) => {
      console.error('加载Prettier 3.0.3失败，尝试加载2.8.8版本:', e);
      // 尝试备用版本
      const backupScript = document.createElement('script');
      backupScript.src = 'https://unpkg.com/prettier@2.8.8/standalone.js';
      backupScript.onload = () => {
        console.log('从备用版本加载Prettier核心库成功');
        loadPrettierPlugins(true).then(resolve).catch(reject);
      };
      backupScript.onerror = (err) => {
        console.error('加载Prettier备用版本也失败:', err);
        // 尝试备用CDN
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/standalone.min.js';
        cdnScript.onload = () => {
          console.log('从备用CDN加载Prettier核心库成功');
          loadPrettierPlugins(true).then(resolve).catch(reject);
        };
        cdnScript.onerror = (e) => {
          console.error('从所有来源加载Prettier失败:', e);
          reject(e);
        };
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(backupScript);
    };
    document.head.appendChild(script);
  });
};

// 加载Prettier解析器插件，包含重试机制
const loadPrettierPlugins = (useFallback = false) => {
  return new Promise((resolve, reject) => {
    let plugins;
    
    if (useFallback) {
      // Prettier 2.8.8的解析器
      plugins = [
        { name: 'babel', url: 'https://unpkg.com/prettier@2.8.8/parser-babel.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-babel.min.js' },
        { name: 'typescript', url: 'https://unpkg.com/prettier@2.8.8/parser-typescript.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-typescript.min.js' },
        { name: 'postcss', url: 'https://unpkg.com/prettier@2.8.8/parser-postcss.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-postcss.min.js' },
        { name: 'html', url: 'https://unpkg.com/prettier@2.8.8/parser-html.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-html.min.js' },
        { name: 'markdown', url: 'https://unpkg.com/prettier@2.8.8/parser-markdown.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-markdown.min.js' },
        { name: 'yaml', url: 'https://unpkg.com/prettier@2.8.8/parser-yaml.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-yaml.min.js' },
        { name: 'graphql', url: 'https://unpkg.com/prettier@2.8.8/parser-graphql.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-graphql.min.js' },
        { name: 'flow', url: 'https://unpkg.com/prettier@2.8.8/parser-flow.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-flow.min.js' },
        { name: 'angular', url: 'https://unpkg.com/prettier@2.8.8/parser-angular.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-angular.min.js' },
        { name: 'glimmer', url: 'https://unpkg.com/prettier@2.8.8/parser-glimmer.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-glimmer.min.js' }
      ];
    } else {
      // Prettier 3.0.3的解析器 (最新版)
      plugins = [
        { name: 'babel', url: 'https://unpkg.com/prettier@3.0.3/plugins/babel.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/babel.min.js' },
        { name: 'typescript', url: 'https://unpkg.com/prettier@3.0.3/plugins/typescript.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/typescript.min.js' },
        { name: 'postcss', url: 'https://unpkg.com/prettier@3.0.3/plugins/postcss.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/postcss.min.js' },
        { name: 'html', url: 'https://unpkg.com/prettier@3.0.3/plugins/html.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/html.min.js' },
        { name: 'markdown', url: 'https://unpkg.com/prettier@3.0.3/plugins/markdown.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/markdown.min.js' },
        { name: 'yaml', url: 'https://unpkg.com/prettier@3.0.3/plugins/yaml.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/yaml.min.js' },
        { name: 'graphql', url: 'https://unpkg.com/prettier@3.0.3/plugins/graphql.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/graphql.min.js' },
        { name: 'estree', url: 'https://unpkg.com/prettier@3.0.3/plugins/estree.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/estree.min.js' },
        { name: 'angular', url: 'https://unpkg.com/prettier@3.0.3/plugins/angular.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/angular.min.js' },
        { name: 'glimmer', url: 'https://unpkg.com/prettier@3.0.3/plugins/glimmer.js', backup: 'https://cdn.jsdelivr.net/npm/prettier@3.0.3/plugins/glimmer.min.js' }
      ];
    }
    
    let loadedCount = 0;
    let errors = [];
    
    const loadPlugin = (plugin, useBackup = false) => {
      const script = document.createElement('script');
      script.src = useBackup ? plugin.backup : plugin.url;
      
      script.onload = () => {
        console.log(`解析器 ${plugin.name} 加载成功${useBackup ? '(使用备用CDN)' : ''}`);
        loadedCount++;
        if (loadedCount === plugins.length) {
          console.log('所有Prettier解析器已加载完成');
          
          // 打印可用的解析器列表
          if (typeof prettier !== 'undefined' && prettier.parsers) {
            console.log('可用的Prettier解析器:', Object.keys(prettier.parsers));
          }
          
          resolve();
        }
      };
      
      script.onerror = (e) => {
        if (!useBackup) {
          console.warn(`从主CDN加载解析器 ${plugin.name} 失败，尝试备用CDN...`);
          loadPlugin(plugin, true);
        } else {
          console.error(`从备用CDN加载解析器 ${plugin.name} 也失败:`, e);
          errors.push(plugin.name);
          loadedCount++;
          if (loadedCount === plugins.length) {
            if (errors.length > 0) {
              console.warn(`部分解析器加载失败: ${errors.join(', ')}`);
            }
            
            // 打印可用的解析器列表
            if (typeof prettier !== 'undefined' && prettier.parsers) {
              console.log('可用的Prettier解析器:', Object.keys(prettier.parsers));
            }
            
            resolve(); // 即使有错误也继续
          }
        }
      };
      
      document.head.appendChild(script);
    };
    
    // 开始加载所有插件
    plugins.forEach(plugin => loadPlugin(plugin));
  });
};

// 初始化函数
const initFormatter = () => {
  console.log('正在初始化代码格式化器...');
  loadPrettier()
    .then(() => {
      console.log('代码格式化器初始化完成');
      // 可以在这里添加额外的初始化逻辑
      
      // 找到所有文本区域并添加格式化按钮
      document.querySelectorAll('textarea').forEach(textarea => {
        if (isMarkdownEditor(textarea)) {
          addMarkdownFormatButton(textarea);
        }
      });
    })
    .catch(error => {
      console.error('初始化代码格式化器失败:', error);
    });
};

// 检查特定解析器是否可用，否则尝试加载
const ensureParser = (parser) => {
  return new Promise((resolve, reject) => {
    // 特殊处理JSON解析器 - 在Prettier中，JSON实际上使用babel的解析器
    if (parser === 'json') {
      // 检查是否已经可以解析JSON
      if (typeof prettier !== 'undefined' && prettier.format) {
        try {
          // 尝试格式化一个简单的JSON字符串
          prettier.format('{"test":true}', {parser: 'json'});
          console.log('Prettier已支持JSON格式化');
          resolve(true);
          return;
        } catch (e) {
          // 如果不支持json解析器，会抛出异常
          console.log('Prettier不支持原生JSON格式化，尝试使用babel解析器');
        }
      }
      
      // 尝试确保babel解析器加载
      return ensureParser('babel').then(resolve).catch(reject);
    }
    
    if (typeof prettier !== 'undefined' && prettier.parsers && prettier.parsers[parser]) {
      resolve(true);
      return;
    }
    
    // 需要加载指定解析器
    console.log(`解析器 ${parser} 不可用，尝试加载...`);
    
    // 确保Prettier核心库已加载
    if (typeof prettier === 'undefined') {
      loadPrettier().then(() => {
        // 再次检查解析器
        if (prettier.parsers && prettier.parsers[parser]) {
          resolve(true);
        } else {
          reject(new Error(`无法加载解析器 ${parser}`));
        }
      }).catch(reject);
      return;
    }
    
    // 获取Prettier版本号，决定使用哪个路径格式
    const isPrettier3 = prettier.version && prettier.version.startsWith('3');
    
    // Prettier已加载但缺少特定解析器
    const parserMap = isPrettier3 ? {
      // Prettier 3.x 路径格式
      'babel': 'https://unpkg.com/prettier@3.0.3/plugins/babel.js',
      'typescript': 'https://unpkg.com/prettier@3.0.3/plugins/typescript.js',
      'css': 'https://unpkg.com/prettier@3.0.3/plugins/postcss.js',
      'html': 'https://unpkg.com/prettier@3.0.3/plugins/html.js',
      'markdown': 'https://unpkg.com/prettier@3.0.3/plugins/markdown.js',
      'yaml': 'https://unpkg.com/prettier@3.0.3/plugins/yaml.js',
      'graphql': 'https://unpkg.com/prettier@3.0.3/plugins/graphql.js',
      'angular': 'https://unpkg.com/prettier@3.0.3/plugins/angular.js',
      'glimmer': 'https://unpkg.com/prettier@3.0.3/plugins/glimmer.js',
      'estree': 'https://unpkg.com/prettier@3.0.3/plugins/estree.js'
    } : {
      // Prettier 2.x 路径格式
      'babel': 'https://unpkg.com/prettier@2.8.8/parser-babel.js',
      'typescript': 'https://unpkg.com/prettier@2.8.8/parser-typescript.js',
      'css': 'https://unpkg.com/prettier@2.8.8/parser-postcss.js',
      'html': 'https://unpkg.com/prettier@2.8.8/parser-html.js',
      'markdown': 'https://unpkg.com/prettier@2.8.8/parser-markdown.js',
      'yaml': 'https://unpkg.com/prettier@2.8.8/parser-yaml.js',
      'graphql': 'https://unpkg.com/prettier@2.8.8/parser-graphql.js',
      'flow': 'https://unpkg.com/prettier@2.8.8/parser-flow.js',
      'angular': 'https://unpkg.com/prettier@2.8.8/parser-angular.js',
      'glimmer': 'https://unpkg.com/prettier@2.8.8/parser-glimmer.js'
    };
    
    if (!parserMap[parser]) {
      reject(new Error(`未知的解析器类型: ${parser}`));
      return;
    }
    
    const script = document.createElement('script');
    script.src = parserMap[parser];
    script.onload = () => {
      console.log(`解析器 ${parser} 加载成功`);
      resolve(true);
    };
    script.onerror = (e) => {
      console.error(`加载解析器 ${parser} 失败:`, e);
      // 尝试备用CDN
      const backupScript = document.createElement('script');
      backupScript.src = parserMap[parser].replace('unpkg.com', 'cdn.jsdelivr.net/npm');
      if (!backupScript.src.endsWith('.min.js')) {
        backupScript.src = backupScript.src.replace('.js', '.min.js');
      }
      backupScript.onload = () => {
        console.log(`从备用CDN加载解析器 ${parser} 成功`);
        resolve(true);
      };
      backupScript.onerror = (err) => {
        console.error(`从备用CDN加载解析器 ${parser} 也失败:`, err);
        reject(err);
      };
      document.head.appendChild(backupScript);
    };
    document.head.appendChild(script);
  });
};

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
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        parser = 'babel';
        break;
      case 'typescript':
      case 'ts':
        parser = 'typescript';
        break;
      case 'jsx':
        parser = 'babel';
        break;
      case 'tsx':
        parser = 'typescript';
        break;
      case 'css':
      case 'scss':
      case 'less':
        parser = 'css';
        break;
      case 'html':
      case 'vue':
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
        // 首先尝试使用json解析器，如果不支持会在后面进行处理
        parser = 'json';
        break;
      case 'graphql':
      case 'gql':
        parser = 'graphql';
        break;
      case 'angular':
        parser = 'angular';
        break;
      case 'handlebars':
      case 'hbs':
        parser = 'glimmer';
        break;
      case 'flow':
        parser = 'flow';
        break;
      default:
        // 尝试根据代码内容猜测语言
        if (/^\s*</.test(code)) {
          parser = 'html';
        } else if (/^\s*{/.test(code) || /^\s*\[/.test(code)) {
          parser = 'json';
        } else {
          // 对于不支持的语言，返回原始代码
          console.warn(`不支持的语言: ${language}，返回原始代码`);
          return code;
        }
    }
    
    // 特殊处理JSON格式化
    let jsonProcessed = false;
    if (parser === 'json' && (!prettier.parsers || !prettier.parsers.json)) {
      try {
        // 尝试使用babel解析器格式化JSON
        console.log('使用babel解析器格式化JSON');
        const jsonOptions = {
          parser: 'babel',
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: false,        // JSON不需要分号
          singleQuote: false, // JSON必须使用双引号
          trailingComma: 'none', // JSON不允许尾随逗号
          bracketSpacing: true,
          arrowParens: 'avoid',
        };
        
        // 验证输入是否是有效的JSON
        try {
          JSON.parse(code);
        } catch (jsonErr) {
          console.warn('输入不是有效的JSON，可能无法正确格式化:', jsonErr);
        }
        
        const formatted = prettier.format(code, jsonOptions);
        jsonProcessed = true;
        return formatted;
      } catch (babelError) {
        console.error('使用babel解析器格式化JSON失败:', babelError);
        // 如果babel解析也失败，继续尝试其他方法
      }
    }
    
    // 如果JSON已处理，不继续执行
    if (jsonProcessed) return;
    
    // 检查解析器是否可用
    if (!prettier.parsers || !prettier.parsers[parser]) {
      console.warn(`Prettier解析器 "${parser}" 不可用，尝试加载...`);
      
      // 返回原始代码，同时尝试加载解析器（下次调用时可能已加载）
      ensureParser(parser).catch(e => console.error(`无法加载解析器 ${parser}:`, e));
      return code;
    }

    // 根据语言选择不同的格式化选项
    let options = {
      parser,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      bracketSpacing: true,
      arrowParens: 'avoid',
    };
    
    // 特定语言的自定义选项
    switch (language.toLowerCase()) {
      case 'json':
        options = {
          ...options,
          parser: 'json',
          singleQuote: false, // JSON必须使用双引号
          trailingComma: 'none', // JSON不允许尾随逗号
          semi: false // JSON不需要分号
        };
        break;
      case 'html':
      case 'vue':
        options = {
          ...options,
          htmlWhitespaceSensitivity: 'css',
          vueIndentScriptAndStyle: true
        };
        break;
      case 'markdown':
      case 'md':
        options = {
          ...options,
          proseWrap: 'preserve'
        };
        break;
    }

    // 格式化代码
    const formatted = prettier.format(code, options);
    
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
      } else if (text.includes('typescript') || text.includes('ts')) {
        language = 'typescript';
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

// 添加快捷键支持
const setupShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+F (或 Command+Shift+F在macOS上)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault(); // 阻止浏览器默认的查找行为
      
      // 获取当前活动元素
      const activeElement = document.activeElement;
      
      // 如果是文本区域或输入框，执行格式化
      if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' && activeElement.type === 'text')) {
        const language = determineLanguage(activeElement);
        formatCurrentCode(activeElement, language);
      }
    }
  });
};

// 在页面加载完成后初始化
if (document.readyState === 'complete') {
  initFormatter();
  setupShortcuts();
} else {
  window.addEventListener('load', () => {
    initFormatter();
    setupShortcuts();
  });
}

// 公开API以便外部调用
window.codeFormatter = {
  format: formatCode,
  formatMarkdown: formatMarkdownCodeBlocks,
  formatEditor: formatCurrentCode,
  determineLang: determineLanguage,
  loadPrettier: loadPrettier
};
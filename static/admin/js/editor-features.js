/**
 * 编辑器增强功能
 */

// 判断是否为Markdown编辑器
const isMarkdownEditor = (textarea) => {
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

// 确定当前编辑器的代码语言
const determineLanguage = (textarea) => {
  if (!textarea) return 'javascript'; // 默认语言
  
  if (isMarkdownEditor(textarea)) {
    // 尝试查找当前光标所在的代码块
    const codeBlockInfo = isInsideCodeBlock(textarea.value, textarea.selectionStart);
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

// VSCode风格的代码格式化函数
const formatCode = (code, language) => {
  if (!code) return '';
  
  // 规范化缩进 - 统一使用2个空格
  const indentSize = 2;
  const indentChar = ' ';
  
  try {
    // 按语言应用不同的格式化规则
    switch (language) {
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'json':
        return formatJavaScript(code, indentSize, indentChar);
      
      case 'css':
        return formatCSS(code, indentSize, indentChar);
      
      case 'html':
      case 'xml':
        return formatHTML(code, indentSize, indentChar);
      
      case 'c':
      case 'cpp':
        return formatC(code, indentSize, indentChar);
      
      case 'csharp':
        return formatCSharp(code, indentSize, indentChar);
      
      case 'python':
        return formatPython(code, indentSize, indentChar);
      
      default:
        // 通用格式化 - 主要处理缩进
        return formatGeneric(code, indentSize, indentChar);
    }
  } catch (e) {
    console.error(`格式化${language}代码时出错:`, e);
    // 返回原始代码，避免数据丢失
    return code;
  }
};

// JavaScript/TypeScript/JSX 格式化
const formatJavaScript = (code, indentSize = 2, indentChar = ' ') => {
  if (!code.trim()) return '';
  
  let formatted = '';
  let indent = 0;
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;
  let lastChar = '';
  let nextChar = '';
  let lines = code.split('\n');
  
  // 处理每一行
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // 检查上下文
    inLineComment = false;
    inString = false;
    
    // 处理缩进减少情况 (行首是结束括号)
    if (line.startsWith('}') || line.startsWith(')') || line.startsWith(']')) {
      indent = Math.max(0, indent - 1);
    }
    
    // 添加当前缩进
    formatted += indentChar.repeat(indent * indentSize);
    
    // 处理行内内容
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      nextChar = j < line.length - 1 ? line[j + 1] : '';
      
      // 处理注释
      if (!inString && char === '/' && nextChar === '/') {
        inLineComment = true;
        formatted += char;
        continue;
      }
      
      if (!inString && char === '/' && nextChar === '*') {
        inBlockComment = true;
        formatted += char;
        continue;
      }
      
      if (inBlockComment && char === '*' && nextChar === '/') {
        inBlockComment = false;
        formatted += char;
        continue;
      }
      
      // 处理字符串
      if (!inLineComment && !inBlockComment && (char === '"' || char === "'" || char === '`')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && lastChar !== '\\') {
          inString = false;
        }
        formatted += char;
        continue;
      }
      
      // 处理括号缩进
      if (!inString && !inLineComment && !inBlockComment) {
        if (char === '{' || char === '(' || char === '[') {
          formatted += char;
          
          // 检查是否是对象/数组字面量或函数定义
          if (char === '{') {
            // 如果后面有内容，不增加换行
            let hasContentAfterBrace = false;
            for (let k = j + 1; k < line.length; k++) {
              if (line[k] !== ' ' && line[k] !== '\t' && line[k] !== '}') {
                hasContentAfterBrace = true;
                break;
              }
            }
            
            if (!hasContentAfterBrace && i < lines.length - 1) {
              indent++;
            }
          }
          continue;
        }
        
        if (char === '}' || char === ')' || char === ']') {
          // 检查是否在同一行有开括号
          let hasOpenBraceInSameLine = false;
          const matchingOpen = char === '}' ? '{' : (char === ')' ? '(' : '[');
          
          for (let k = 0; k < j; k++) {
            if (line[k] === matchingOpen) {
              hasOpenBraceInSameLine = true;
              break;
            }
          }
          
          if (!hasOpenBraceInSameLine) {
            indent = Math.max(0, indent - 1);
            formatted = formatted.trimEnd() + '\n' + indentChar.repeat(indent * indentSize);
          }
          
          formatted += char;
          continue;
        }
      }
      
      // 处理分号后换行
      if (!inString && !inLineComment && !inBlockComment && char === ';') {
        formatted += char;
        
        // 检查分号后是否有非空白内容
        let hasContentAfterSemicolon = false;
        for (let k = j + 1; k < line.length; k++) {
          if (line[k] !== ' ' && line[k] !== '\t') {
            hasContentAfterSemicolon = true;
            break;
          }
        }
        
        // 如果分号后面有内容且不是注释，添加一个空格
        if (hasContentAfterSemicolon && nextChar !== '/' && line[j + 2] !== '/') {
          formatted += ' ';
        }
        
        continue;
      }
      
      // 添加操作符周围的空格
      if (!inString && !inLineComment && !inBlockComment) {
        const operators = ['=', '+', '-', '*', '/', '%', '&&', '||', '==', '===', '!=', '!==', '>=', '<=', '>', '<'];
        const isOperator = operators.some(op => op.startsWith(char));
        
        // 添加操作符前的空格
        if (isOperator && formatted.length > 0 && !formatted.endsWith(' ') && !formatted.endsWith('\n')) {
          formatted += ' ';
        }
        
        formatted += char;
        
        // 添加操作符后的空格
        if (isOperator && nextChar && nextChar !== ' ' && !operators.some(op => op.startsWith(nextChar))) {
          formatted += ' ';
        }
        
        continue;
      }
      
      // 处理逗号后添加空格
      if (!inString && !inLineComment && !inBlockComment && char === ',') {
        formatted += char;
        
        // 如果逗号后面不是空格和换行，添加一个空格
        if (nextChar && nextChar !== ' ' && nextChar !== '\n') {
          formatted += ' ';
        }
        
        continue;
      }
      
      // 添加当前字符
      formatted += char;
      lastChar = char;
    }
    
    // 处理行尾的情况，如果有花括号增加缩进
    if (!inLineComment && !inBlockComment && !inString && line.endsWith('{')) {
      indent++;
    }
    
    formatted += '\n';
  }
  
  // 清理多余的换行符
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
};

// CSS格式化
const formatCSS = (code, indentSize = 2, indentChar = ' ') => {
  if (!code.trim()) return '';
  
  let formatted = '';
  let indent = 0;
  let inComment = false;
  let inSelector = true;
  
  // 分行处理
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // 处理多行注释
    if (line.includes('/*') && !line.includes('*/')) {
      inComment = true;
      formatted += line + '\n';
      continue;
    }
    
    if (inComment) {
      if (line.includes('*/')) {
        inComment = false;
      }
      formatted += line + '\n';
      continue;
    }
    
    // 处理选择器
    if (inSelector && line.includes('{')) {
      inSelector = false;
      
      // 清理选择器
      const selectorPart = line.substring(0, line.indexOf('{')).trim();
      const restPart = line.substring(line.indexOf('{'));
      
      // 格式化选择器 (多个选择器以逗号分隔)
      const selectors = selectorPart.split(',');
      const formattedSelectors = selectors.map(s => s.trim()).join(', ');
      
      formatted += formattedSelectors + ' ' + restPart.trim() + '\n';
      indent++;
      continue;
    }
    
    // 处理闭合括号
    if (line.includes('}')) {
      inSelector = true;
      indent = Math.max(0, indent - 1);
      formatted += indentChar.repeat(indent * indentSize) + line + '\n';
      continue;
    }
    
    // 处理普通属性行
    if (!inSelector) {
      // 在冒号后添加空格
      if (line.includes(':')) {
        const parts = line.split(':');
        const property = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        
        formatted += indentChar.repeat(indent * indentSize) + property + ': ' + value + '\n';
      } else {
        formatted += indentChar.repeat(indent * indentSize) + line + '\n';
      }
      continue;
    }
    
    // 其他情况
    formatted += indentChar.repeat(indent * indentSize) + line + '\n';
  }
  
  // 清理多余的换行符
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
};

// HTML格式化
const formatHTML = (code, indentSize = 2, indentChar = ' ') => {
  if (!code.trim()) return '';
  
  let formatted = '';
  let indent = 0;
  let inTag = false;
  let inContent = false;
  let tagName = '';
  
  // 自关闭标签列表
  const selfClosingTags = ['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr'];
  
  // 内联标签列表
  const inlineTags = ['a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'q', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var'];
  
  // 分行处理
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // 分析本行的标签
    let currentIndent = indent;
    
    // 处理当前行每个字符
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = j < line.length - 1 ? line[j + 1] : '';
      
      // 开始标签
      if (char === '<' && nextChar !== '/') {
        inTag = true;
        tagName = '';
        const tagMatch = line.substring(j).match(/^<([a-zA-Z0-9-]+)/);
        if (tagMatch) {
          tagName = tagMatch[1].toLowerCase();
        }
        
        if (j === 0 && !selfClosingTags.includes(tagName) && !inlineTags.includes(tagName)) {
          formatted += indentChar.repeat(currentIndent * indentSize);
        }
        
        formatted += char;
        continue;
      }
      
      // 结束标签
      if (char === '<' && nextChar === '/') {
        inTag = true;
        const tagMatch = line.substring(j).match(/^<\/([a-zA-Z0-9-]+)>/);
        if (tagMatch) {
          const closingTagName = tagMatch[1].toLowerCase();
          if (!inlineTags.includes(closingTagName)) {
            currentIndent--;
            
            if (j === 0) {
              formatted = formatted.trimEnd() + '\n' + indentChar.repeat(currentIndent * indentSize);
            }
          }
        }
        
        formatted += char;
        continue;
      }
      
      // 标签结束
      if (inTag && char === '>') {
        inTag = false;
        formatted += char;
        
        // 自关闭标签或内联标签不增加缩进和换行
        if (line[j - 1] === '/' || selfClosingTags.includes(tagName) || inlineTags.includes(tagName)) {
          continue;
        }
        
        // 检查标签后是否有内容
        let hasContent = false;
        for (let k = j + 1; k < line.length; k++) {
          if (line[k] !== ' ' && line[k] !== '\t' && line[k] !== '<') {
            hasContent = true;
            break;
          }
        }
        
        if (!hasContent) {
          indent++;
          formatted += '\n';
        }
        
        continue;
      }
      
      // 其他字符
      formatted += char;
    }
    
    // 行结束
    if (!formatted.endsWith('\n')) {
      formatted += '\n';
    }
  }
  
  // 清理多余的换行符
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
};

// C/C++格式化
const formatC = (code, indentSize = 2, indentChar = ' ') => {
  if (!code.trim()) return '';
  
  let formatted = '';
  let indent = 0;
  let inString = false;
  let inChar = false;
  let inComment = false;
  let inPreprocessor = false;
  
  // 分行处理
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // 处理预处理指令
    if (line.startsWith('#')) {
      inPreprocessor = line.endsWith('\\');
      formatted += line + '\n';
      continue;
    }
    
    if (inPreprocessor) {
      inPreprocessor = line.endsWith('\\');
      formatted += line + '\n';
      continue;
    }
    
    // 处理缩进
    if (line.startsWith('}') || line.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }
    
    // 添加缩进
    formatted += indentChar.repeat(indent * indentSize);
    
    // 处理每一个字符
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = j < line.length - 1 ? line[j + 1] : '';
      
      // 处理字符串
      if (char === '"' && !inChar && !inComment) {
        inString = !inString;
        formatted += char;
        continue;
      }
      
      // 处理字符字面量
      if (char === "'" && !inString && !inComment) {
        inChar = !inChar;
        formatted += char;
        continue;
      }
      
      // 处理注释
      if (!inString && !inChar && char === '/' && nextChar === '/') {
        inComment = true;
        formatted += char;
        continue;
      }
      
      // 处理括号
      if (!inString && !inChar && !inComment) {
        if (char === '{') {
          // 检查是否需要在花括号前添加空格
          if (formatted.length > 0 && !formatted.endsWith(' ') && !formatted.endsWith('\n')) {
            formatted += ' ';
          }
          
          formatted += char;
          indent++;
          
          // 检查后面是否有更多内容
          let hasContentAfterBrace = false;
          for (let k = j + 1; k < line.length; k++) {
            if (line[k] !== ' ' && line[k] !== '\t' && line[k] !== '/') {
              hasContentAfterBrace = true;
              break;
            }
          }
          
          if (!hasContentAfterBrace) {
            formatted += '\n';
          }
          
          continue;
        }
        
        if (char === '}') {
          formatted += char;
          
          // 检查后面是否跟有else、while等关键字
          let hasKeywordAfter = false;
          const restLine = line.substring(j + 1).trim();
          const keywords = ['else', 'while', 'catch'];
          
          for (const keyword of keywords) {
            if (restLine.startsWith(keyword)) {
              hasKeywordAfter = true;
              break;
            }
          }
          
          if (hasKeywordAfter) {
            formatted += ' ';
          }
          
          continue;
        }
      }
      
      // 处理控制结构
      if (!inString && !inChar && !inComment) {
        const controlKeywords = ['if', 'for', 'while', 'switch', 'catch'];
        
        for (const keyword of controlKeywords) {
          if (j + keyword.length <= line.length && 
              line.substring(j, j + keyword.length) === keyword && 
              (j === 0 || !/[a-zA-Z0-9_]/.test(line[j - 1])) && 
              (j + keyword.length === line.length || !/[a-zA-Z0-9_]/.test(line[j + keyword.length]))) {
            
            // 确保关键字后有空格
            formatted += keyword;
            if (j + keyword.length < line.length && line[j + keyword.length] !== ' ') {
              formatted += ' ';
            }
            j += keyword.length - 1;
            continue;
          }
        }
      }
      
      // 处理操作符周围空格
      if (!inString && !inChar && !inComment) {
        const operators = ['=', '+', '-', '*', '/', '%', '==', '!=', '>=', '<=', '>', '<', '&&', '||'];
        
        for (const op of operators) {
          if (j + op.length <= line.length && line.substring(j, j + op.length) === op) {
            // 确保操作符前后有空格
            if (formatted.length > 0 && !formatted.endsWith(' ') && !formatted.endsWith('\n')) {
              formatted += ' ';
            }
            
            formatted += op;
            
            if (j + op.length < line.length && line[j + op.length] !== ' ') {
              formatted += ' ';
            }
            
            j += op.length - 1;
            continue;
          }
        }
      }
      
      // 添加当前字符
      formatted += char;
    }
    
    // 处理行尾分号或花括号
    if (!inString && !inChar && !inComment) {
      if (line.endsWith('{')) {
        indent++;
      }
    }
    
    // 添加换行
    formatted += '\n';
  }
  
  // 清理多余的换行符
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
};

// C#格式化 - 类似C++但有一些特殊处理
const formatCSharp = (code, indentSize = 2, indentChar = ' ') => {
  // 先使用基础的C格式化
  let formatted = formatC(code, indentSize, indentChar);
  
  // 进行C#特定的格式化
  // 处理属性、事件和Lambda表达式
  const lines = formatted.split('\n');
  let result = '';
  let inPropOrEvent = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 处理属性和Lambda表达式格式
    if (line.includes('=>')) {
      const parts = line.split('=>');
      result += parts[0].trimEnd() + ' => ' + parts[1].trimStart() + '\n';
      continue;
    }
    
    // 处理get/set访问器
    if (/^\s*get\s*{/.test(line) || /^\s*set\s*{/.test(line)) {
      inPropOrEvent = true;
      result += line + '\n';
      continue;
    }
    
    // 保留原样
    result += line + '\n';
  }
  
  return result.trim();
};

// Python格式化
const formatPython = (code, indentSize = 4, indentChar = ' ') => {
  if (!code.trim()) return '';
  
  let formatted = '';
  let currentIndent = 0;
  let inString = false;
  let stringChar = '';
  
  // Python默认使用4个空格缩进
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // 处理缩进减少 - 检测dedent关键字
    const dedentKeywords = ['else:', 'elif', 'except:', 'finally:', 'except '];
    let shouldDedent = false;
    
    for (const keyword of dedentKeywords) {
      if (line.startsWith(keyword)) {
        shouldDedent = true;
        break;
      }
    }
    
    if (shouldDedent) {
      currentIndent = Math.max(0, currentIndent - 1);
    }
    
    // 添加缩进
    formatted += indentChar.repeat(currentIndent * indentSize);
    
    // 添加当前行
    formatted += line;
    
    // 检查是否需要增加缩进 - 如果行以冒号结束
    if (line.endsWith(':')) {
      currentIndent++;
    }
    
    // 添加换行
    formatted += '\n';
  }
  
  // 清理多余的换行符
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
};

// 通用代码格式化
const formatGeneric = (code, indentSize = 2, indentChar = ' ') => {
  if (!code.trim()) return '';
  
  let formatted = '';
  let indent = 0;
  
  // 分行处理
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    let line = originalLine.trim();
    
    // 保留空行
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    // 检测缩进减少
    if (line.startsWith('}') || line.startsWith(')') || line.startsWith(']')) {
      indent = Math.max(0, indent - 1);
    }
    
    // 添加当前缩进
    formatted += indentChar.repeat(indent * indentSize);
    
    // 添加当前行
    formatted += line;
    
    // 添加换行
    formatted += '\n';
    
    // 检测缩进增加
    if (line.endsWith('{') || line.endsWith('(') || line.endsWith('[') || line.endsWith(':')) {
      indent++;
    }
  }
  
  // 清理多余的换行符
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return formatted.trim();
};

// 格式化Markdown文件中的代码块
const formatMarkdownCodeBlocks = (markdown) => {
  if (!markdown) return '';
  
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  return markdown.replace(codeBlockRegex, (match, language, code) => {
    if (!code.trim()) {
      return match;
    }
    
    try {
      const lang = language ? language.toLowerCase() : 'text';
      const formatted = formatCode(code, lang);
      return '```' + (language || '') + '\n' + formatted + '\n```';
    } catch (e) {
      console.error('格式化Markdown代码块出错:', e);
      return match;
    }
  });
};

// 格式化当前光标位置的代码
const formatCurrentCode = (textarea, language) => {
  if (!textarea) return;
  
  // Markdown编辑器特殊处理 - 尝试找到当前光标所在的代码块
  if (isMarkdownEditor(textarea)) {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // 检查光标是否在代码块内
    const codeBlockInfo = isInsideCodeBlock(text, cursorPos);
    
    if (codeBlockInfo && codeBlockInfo.isInside) {
      // 提取代码块
      const codeBlock = text.substring(codeBlockInfo.blockStart, codeBlockInfo.blockEnd + 3);
      const codeContent = text.substring(codeBlockInfo.blockStart + 3 + codeBlockInfo.language.length + 1, codeBlockInfo.blockEnd);
      
      // 格式化代码
      try {
        const formattedCode = formatCode(codeContent, codeBlockInfo.language);
        
        // 更新文本区域
        textarea.value = 
          text.substring(0, codeBlockInfo.blockStart + 3 + codeBlockInfo.language.length + 1) + 
          '\n' + formattedCode + '\n' + 
          text.substring(codeBlockInfo.blockEnd);
        
        // 重新定位光标
        textarea.selectionStart = textarea.selectionEnd = 
          codeBlockInfo.blockStart + 3 + codeBlockInfo.language.length + 1 + 1; // +1 for newline
        
        // 触发变更事件
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        
        console.log(`已格式化 ${codeBlockInfo.language} 代码块`);
      } catch (e) {
        console.error('格式化代码块失败:', e);
      }
      
      return;
    }
    
    // 如果不在代码块内，尝试格式化整个Markdown文档的所有代码块
    try {
      const formatted = formatMarkdownCodeBlocks(text);
      
      if (formatted !== text) {
        textarea.value = formatted;
        
        // 尝试保持光标位置
        textarea.selectionStart = textarea.selectionEnd = Math.min(cursorPos, formatted.length);
        
        // 触发变更事件
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        
        console.log('已格式化所有Markdown代码块');
      } else {
        console.log('没有找到可格式化的代码块');
      }
    } catch (e) {
      console.error('格式化Markdown代码块失败:', e);
    }
    
    return;
  }
  
  // 常规代码编辑器 - 格式化整个内容
  try {
    const text = textarea.value;
    const formattedCode = formatCode(text, language || 'javascript');
    
    if (formattedCode !== text) {
      // 保存当前滚动位置和选择状态
      const scrollTop = textarea.scrollTop;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      
      // 更新文本
      textarea.value = formattedCode;
      
      // 恢复滚动位置
      textarea.scrollTop = scrollTop;
      
      // 尝试保持光标位置
      textarea.selectionStart = Math.min(selectionStart, formattedCode.length);
      textarea.selectionEnd = Math.min(selectionEnd, formattedCode.length);
      
      // 触发变更事件
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
      
      console.log(`已格式化 ${language || 'javascript'} 代码`);
    }
  } catch (e) {
    console.error('格式化代码失败:', e);
  }
};

// 添加Markdown格式化按钮
const addMarkdownFormatButton = (textarea) => {
  const container = textarea.parentElement;
  if (!container) return;
  
  // 检查是否已添加按钮工具栏
  let toolbar = container.querySelector('.markdown-format-tools');
  
  if (!toolbar) {
    // 创建工具栏
    toolbar = document.createElement('div');
    toolbar.className = 'markdown-format-tools';
    
    // 添加格式化按钮
    const formatButton = document.createElement('button');
    formatButton.className = 'markdown-format-button';
    formatButton.textContent = '格式化代码块 (Ctrl+Shift+F)';
    formatButton.onclick = (e) => {
      e.preventDefault();
      formatCurrentCode(textarea);
    };
    toolbar.appendChild(formatButton);
    
    // 添加快捷插入代码块按钮
    const addCodeBlockButton = document.createElement('button');
    addCodeBlockButton.className = 'markdown-format-button';
    addCodeBlockButton.textContent = '插入代码块';
    addCodeBlockButton.onclick = (e) => {
      e.preventDefault();
      
      // 插入代码块并触发语言选择
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      
      let snippet = '```';
      if (selectedText) {
        // 如果有选中文本，使用选中文本作为代码块内容
        snippet = '```\n' + selectedText + '\n```';
      }
      
      textarea.value = text.substring(0, cursorPos) + snippet + text.substring(textarea.selectionEnd);
      textarea.selectionStart = textarea.selectionEnd = cursorPos + 3;
      
      // 触发变更事件
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    };
    toolbar.appendChild(addCodeBlockButton);
    
    // 添加格式化整个文档按钮
    const formatAllButton = document.createElement('button');
    formatAllButton.className = 'markdown-format-button';
    formatAllButton.textContent = '格式化所有代码块';
    formatAllButton.onclick = (e) => {
      e.preventDefault();
      
      try {
        const text = textarea.value;
        const formatted = formatMarkdownCodeBlocks(text);
        
        if (formatted !== text) {
          // 保存当前滚动位置和光标位置
          const scrollTop = textarea.scrollTop;
          const cursorPos = textarea.selectionStart;
          
          textarea.value = formatted;
          
          // 恢复滚动和光标位置
          textarea.scrollTop = scrollTop;
          textarea.selectionStart = textarea.selectionEnd = Math.min(cursorPos, formatted.length);
          
          // 触发变更事件
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
          
          console.log('已格式化所有Markdown代码块');
        } else {
          console.log('没有找到可格式化的代码块');
        }
      } catch (e) {
        console.error('格式化所有代码块失败:', e);
      }
    };
    toolbar.appendChild(formatAllButton);
    
    // 添加工具提示
    const helpSpan = document.createElement('span');
    helpSpan.className = 'help-tooltip';
    helpSpan.innerHTML = '?';
    helpSpan.title = '格式化帮助';
    
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip-text';
    tooltip.innerHTML = `
      <b>格式化提示:</b><br>
      • 按Ctrl+Shift+F可格式化当前代码块<br>
      • 在代码块内输入回车自动保持缩进<br>
      • 输入\`\`\`触发语言选择菜单<br>
      • 支持C, C++, C#等多种语言
    `;
    helpSpan.appendChild(tooltip);
    
    toolbar.appendChild(helpSpan);
    
    // 添加工具栏到容器
    container.insertBefore(toolbar, textarea);
  }
};

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
  
  // 检查是否是Markdown编辑器，添加专门的格式化按钮
  if (isMarkdownEditor(textarea)) {
    addMarkdownFormatButton(textarea);
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
        const language = determineLanguage(textarea);
        formatCurrentCode(textarea, language);
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
        const codeBlockMatch = isInsideCodeBlock(value, cursorPos);
        if (codeBlockMatch) {
          // 在代码块内部可以应用特定语言的缩进规则
          // 这里保持与之前相同的缩进
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
      const codeBlockMatch = isInsideCodeBlock(value, start);
      
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
    const codeBlockMatch = isInsideCodeBlock(value, cursorPos);
    
    // 只处理输入的字符，并且在代码块内或者不是Markdown编辑器
    if (cursorPos > 0 && e.inputType === 'insertText' && (codeBlockMatch || !isMarkdownEditor(textarea))) {
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
  if (isMarkdownEditor(textarea)) {
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

// 检查光标是否在代码块内
const isInsideCodeBlock = (text, cursorPos) => {
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

// 查找并增强所有代码编辑框
const findAndEnhanceEditors = () => {
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

// 确保这些函数被导出为全局可用
window.isInsideCodeBlock = isInsideCodeBlock;
window.findAndEnhanceEditors = findAndEnhanceEditors;
window.enhanceTextarea = enhanceTextarea;
window.formatCode = formatCode;
window.formatCurrentCode = formatCurrentCode;
window.determineLanguage = determineLanguage;
window.isMarkdownEditor = isMarkdownEditor;
window.addMarkdownFormatButton = addMarkdownFormatButton;
window.formatMarkdownCodeBlocks = formatMarkdownCodeBlocks;
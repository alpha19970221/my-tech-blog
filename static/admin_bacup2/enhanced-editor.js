/**
 * 增强版 Decap CMS 代码编辑器
 * 为 Code 小部件添加格式化和主题功能
 */
(function() {
  'use strict';

  // 等待 CMS 和 Code 小部件加载完成
  const waitForCMS = setInterval(() => {
    if (window.CMS && window.NetlifyCmsWidgetCode) {
      clearInterval(waitForCMS);
      initEnhancedEditor();
    }
  }, 100);

  // 初始化增强版编辑器
  function initEnhancedEditor() {
    const CMS = window.CMS;
    const CodeWidget = window.NetlifyCmsWidgetCode;
    
    // 获取原始控件
    const OriginalCodeControl = CodeWidget.controlComponent;
    
    // 创建增强版控件
    class EnhancedCodeControl extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          aceEditor: null,
          language: props.field?.get('default_language') || 'markdown',
        };
        this.widgetRef = React.createRef();
      }
      
      componentDidMount() {
        // 延迟初始化编辑器，确保 DOM 已经渲染
        setTimeout(this.initAceEditor, 500);
        
        // 添加键盘快捷键
        document.addEventListener('keydown', this.handleKeyDown);
      }
      
      componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
      }
      
      // 键盘快捷键处理
      handleKeyDown = (e) => {
        // 格式化快捷键 Ctrl+Shift+F
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
          e.preventDefault();
          this.formatCode();
        }
        // 字体增大 Ctrl++
        else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
          e.preventDefault();
          this.changeFontSize('increase');
        }
        // 字体减小 Ctrl+-
        else if (e.ctrlKey && e.key === '-') {
          e.preventDefault();
          this.changeFontSize('decrease');
        }
      }
      
      // 初始化 Ace 编辑器
      initAceEditor = () => {
        const container = this.widgetRef.current;
        if (!container) return;
        
        // 查找 Ace 编辑器实例
        const aceDiv = container.querySelector('.ace_editor');
        if (aceDiv && window.ace) {
          const editor = window.ace.edit(aceDiv);
          this.setState({ aceEditor: editor });
          
          // 启用额外功能
          editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2
          });
          
          // 载入之前保存的设置
          const savedTheme = localStorage.getItem('preferred-ace-theme');
          if (savedTheme) {
            editor.setTheme(`ace/theme/${savedTheme}`);
          } else {
            editor.setTheme('ace/theme/monokai'); // 默认主题
          }
          
          const savedFontSize = localStorage.getItem('preferred-ace-font-size');
          if (savedFontSize) {
            editor.setFontSize(`${savedFontSize}px`);
          }
          
          // 载入附加扩展
          if (window.ace.require) {
            try {
              const langTools = window.ace.require('ace/ext/language_tools');
            } catch (e) {
              console.warn('无法加载语言工具扩展', e);
            }
          }
        } else {
          // 如果没找到，继续尝试
          setTimeout(this.initAceEditor, 300);
        }
      }
      
      // 格式化代码
      formatCode = () => {
        const { aceEditor } = this.state;
        const { onChange, value } = this.props;
        
        if (!aceEditor) {
          this.displayNotification('⚠️ 编辑器未准备好，请稍后再试', 'warning');
          return;
        }
        
        try {
          const currentValue = aceEditor.getValue();
          const language = this.state.language;
          
          // 根据不同的语言使用不同的格式化工具
          let formattedCode = currentValue;
          
          // 为 Markdown 处理内嵌代码块
          if (language === 'markdown') {
            formattedCode = currentValue.replace(
              /```(\w*)\s*([\s\S]*?)\s*```/g,
              (match, codeLanguage, code) => {
                try {
                  let formattedInnerCode = code;
                  
                  // 根据代码块语言格式化内部代码
                  if (codeLanguage && codeLanguage.trim()) {
                    const innerLang = codeLanguage.trim().toLowerCase();
                    
                    if (['js', 'javascript', 'jsx', 'ts', 'typescript'].includes(innerLang)) {
                      // 使用 js-beautify 格式化 JavaScript
                      formattedInnerCode = window.js_beautify(code, {
                        indent_size: 2,
                        space_in_empty_paren: true,
                        end_with_newline: true
                      });
                    } else if (['html', 'xml'].includes(innerLang)) {
                      // 使用 js-beautify 格式化 HTML
                      formattedInnerCode = window.html_beautify(code, {
                        indent_size: 2,
                        wrap_line_length: 0,
                        end_with_newline: true
                      });
                    } else if (['css', 'scss', 'less'].includes(innerLang)) {
                      // 使用 js-beautify 格式化 CSS
                      formattedInnerCode = window.css_beautify(code, {
                        indent_size: 2,
                        end_with_newline: true
                      });
                    } else {
                      // 通用缩进逻辑
                      formattedInnerCode = this.formatIndentation(code);
                    }
                  } else {
                    // 如果没有指定语言，使用通用缩进逻辑
                    formattedInnerCode = this.formatIndentation(code);
                  }
                  
                  return '```' + codeLanguage + '\n' + formattedInnerCode + '\n```';
                } catch (e) {
                  console.error('格式化代码块失败', e);
                  return match; // 保持原样
                }
              }
            );
          }
          // 为其他语言使用相应的格式化工具
          else {
            // JavaScript
            if (['javascript', 'js', 'jsx', 'ts', 'tsx'].includes(language)) {
              formattedCode = window.js_beautify(currentValue, {
                indent_size: 2,
                space_in_empty_paren: true,
                end_with_newline: true
              });
            }
            // HTML
            else if (['html', 'xml'].includes(language)) {
              formattedCode = window.html_beautify(currentValue, {
                indent_size: 2,
                wrap_line_length: 0,
                end_with_newline: true
              });
            }
            // CSS
            else if (['css', 'scss', 'less'].includes(language)) {
              formattedCode = window.css_beautify(currentValue, {
                indent_size: 2,
                end_with_newline: true
              });
            }
            // JSON
            else if (language === 'json') {
              try {
                // 先解析确保有效的 JSON
                const jsonObj = JSON.parse(currentValue);
                formattedCode = JSON.stringify(jsonObj, null, 2);
              } catch (e) {
                this.displayNotification('⚠️ JSON 格式错误，请先修复语法', 'warning');
                return;
              }
            }
            // 其他语言使用基本缩进格式化
            else {
              formattedCode = this.formatIndentation(currentValue);
            }
          }
          
          // 更新编辑器内容
          aceEditor.setValue(formattedCode, -1); // -1 表示不选择所有文本
          
          // 更新 CMS 的值
          onChange(formattedCode);
          
          // 通知成功
          this.displayNotification('✅ 代码已格式化', 'success');
        } catch (error) {
          console.error('格式化代码失败', error);
          this.displayNotification('❌ 格式化失败: ' + error.message, 'error');
        }
      }
      
      // 通用的代码缩进格式化
      formatIndentation = (code) => {
        const lines = code.split('\n').map(line => line.trimRight());
        let formatted = [];
        let indent = 0;
        const TAB = '  '; // 两个空格的缩进
        
        for (let line of lines) {
          // 跳过空行
          if (!line.trim()) {
            formatted.push('');
            continue;
          }
          
          // 去除行首空白
          const trimmedLine = line.trimLeft();
          
          // 检查是否应该减少缩进
          if (/^[}\])]/.test(trimmedLine)) {
            indent = Math.max(0, indent - 1);
          }
          
          // 添加当前行带缩进
          formatted.push(TAB.repeat(indent) + trimmedLine);
          
          // 检查是否应该增加缩进
          if (/[{[(]\s*$/.test(trimmedLine)) {
            indent++;
          }
        }
        
        return formatted.join('\n');
      }
      
      // 显示临时通知
      displayNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = 'code-notification';
        notification.textContent = message;
        
        // 根据类型设置颜色
        if (type === 'warning') {
          notification.style.background = '#FF9800';
        } else if (type === 'error') {
          notification.style.background = '#F44336';
        } else {
          notification.style.background = '#4CAF50';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
      }
      
      // 更改主题
      changeTheme = (theme) => {
        const { aceEditor } = this.state;
        if (aceEditor) {
          aceEditor.setTheme(`ace/theme/${theme}`);
          localStorage.setItem('preferred-ace-theme', theme);
        }
      }
      
      // 字体大小调整
      changeFontSize = (direction) => {
        const { aceEditor } = this.state;
        if (aceEditor) {
          const currentSize = parseInt(aceEditor.getFontSize(), 10);
          const newSize = direction === 'increase' ? currentSize + 1 : currentSize - 1;
          if (newSize >= 10 && newSize <= 30) { // 设置大小限制
            aceEditor.setFontSize(`${newSize}px`);
            localStorage.setItem('preferred-ace-font-size', newSize);
          }
        }
      }
      
      render() {
        // 编辑器主题列表
        const themes = [
          'monokai', 'github', 'tomorrow', 'kuroir', 'twilight', 
          'xcode', 'textmate', 'solarized_dark', 'solarized_light', 
          'terminal'
        ];
        
        // 获取当前主题
        const currentTheme = localStorage.getItem('preferred-ace-theme') || 'monokai';
        
        return React.createElement('div', { ref: this.widgetRef },
          // 工具栏
          React.createElement('div', { className: 'editor-toolbar' },
            // 格式化按钮
            React.createElement('button', {
              className: 'format-button',
              onClick: this.formatCode,
              title: '格式化代码 (Ctrl+Shift+F)'
            }, '格式化代码'),
            
            // 主题选择器
            React.createElement('select', {
              className: 'format-button',
              onChange: (e) => this.changeTheme(e.target.value),
              title: '选择编辑器主题',
              defaultValue: currentTheme
            },
              React.createElement('option', { value: '', disabled: true }, '选择主题'),
              themes.map(theme => 
                React.createElement('option', { key: theme, value: theme },
                  theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                )
              )
            ),
            
            // 字体大小控制
            React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
              React.createElement('button', {
                className: 'format-button',
                onClick: () => this.changeFontSize('decrease'),
                title: '减小字体 (Ctrl+-)',
                style: { marginRight: '2px', padding: '8px 10px' }
              }, 'A-'),
              React.createElement('button', {
                className: 'format-button',
                onClick: () => this.changeFontSize('increase'),
                title: '增大字体 (Ctrl++)',
                style: { padding: '8px 10px' }
              }, 'A+')
            ),
            
            // 语言指示器
            React.createElement('div', {
              style: {
                marginLeft: 'auto',
                padding: '0 10px',
                color: '#666',
                fontSize: '14px'
              }
            }, this.state.language.toUpperCase())
          ),
          
          // 原始代码编辑器
          React.createElement(OriginalCodeControl, this.props)
        );
      }
    }
    
    // 注册增强版编辑器
    CMS.registerWidget('code', EnhancedCodeControl);
  }
})();
/**
 * 预览组件
 */

// 简化版预览组件
const PostPreview = createClass({
  componentDidMount() {
    // 尝试立即高亮
    this.highlightCode();
  },
  
  componentDidUpdate() {
    // 更新后立即高亮
    this.highlightCode();
  },
  
  highlightCode() {
    // 检查所有iframe
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(injectPrismToIframe);
  },
  
  render: function() {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title']) || '';
    
    return h('div', {},
      h('h1', {}, title),
      h('div', {}, this.props.widgetFor('body'))
    );
  }
});

// 注册代码块编辑器组件
const registerCodeBlockComponent = () => {
  if (!window.CMS) return;
  
  window.CMS.registerEditorComponent({
    id: "code",
    label: "代码块",
    fields: [
      {
        name: "language",
        label: "语言",
        widget: "select",
        options: ["javascript", "css", "html", "python", "bash", "yaml", "json", "typescript", "jsx"],
        default: "javascript"
      },
      {
        name: "code",
        label: "代码",
        widget: "text"
      }
    ],
    pattern: /^```(\w+)\n([\s\S]*?)```$/,
    fromBlock: function(match) {
      return {
        language: match[1],
        code: match[2]
      };
    },
    toBlock: function(data) {
      // 检查代码是否存在
      if (data.code === undefined || data.code === null) {
        console.warn('代码块内容为空或undefined');
        return "```" + (data.language || 'text') + "\n\n```";
      }
      
      // 尝试格式化代码
      let formattedCode = data.code;
      try {
        // 确保代码是字符串类型
        if (typeof data.code !== 'string') {
          data.code = String(data.code);
        }
        formattedCode = formatCode(data.code, data.language);
      } catch (e) {
        // 如果格式化失败，使用原代码
        console.error('格式化失败:', e);
      }
      
      return "```" + (data.language || 'text') + "\n" + formattedCode + "\n```";
    },
    toPreview: function(data) {
      // 检查代码是否存在
      if (data.code === undefined || data.code === null) {
        return '<pre class="language-' + (data.language || 'text') + '"><code></code></pre>';
      }
      
      // 确保代码是字符串类型
      let codeString = data.code;
      if (typeof codeString !== 'string') {
        try {
          codeString = String(codeString);
        } catch (e) {
          console.error('代码转换为字符串失败:', e);
          codeString = '';
        }
      }
      
      // 确保HTML特殊字符被正确编码
      const encodedCode = codeString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
        
      return (
        '<pre class="language-' + (data.language || 'text') + '">' +
          '<code class="language-' + (data.language || 'text') + '">' +
            encodedCode +
          '</code>' +
        '</pre>'
      );
    }
  });
};
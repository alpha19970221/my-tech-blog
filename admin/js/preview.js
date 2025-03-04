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
        options: ["javascript", "css", "html", "python", "bash", "yaml", "json", "typescript", "jsx", "c", "cpp", "csharp"],
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
      // 尝试格式化代码
      let formattedCode = data.code;
      try {
        formattedCode = formatCode(data.code, data.language);
      } catch (e) {
        // 如果格式化失败，使用原代码
        console.error('格式化失败:', e);
      }
      
      return "```" + data.language + "\n" + formattedCode + "\n```";
    },
    toPreview: function(data) {
      // 确保HTML特殊字符被正确编码
      const encodedCode = data.code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
        
      return (
        '<pre class="language-' + data.language + '">' +
          '<code class="language-' + data.language + '">' +
            encodedCode +
          '</code>' +
        '</pre>'
      );
    }
  });
};
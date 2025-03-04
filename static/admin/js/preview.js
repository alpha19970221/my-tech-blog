/**
 * 预览组件
 */

// 简化版预览组件
const PostPreview = createClass({
  componentDidMount() {
    // 尝试立即高亮
    this.applyHighlighting();
  },
  
  componentDidUpdate() {
    // 更新后立即高亮
    this.applyHighlighting();
  },
  
  applyHighlighting() {
    // 确保Prism已加载
    if (!window.Prism && window.loadPrismToDocument) {
      console.log('加载Prism到主文档');
      window.loadPrismToDocument().then(() => {
        this.highlightPreviewCode();
      });
    } else {
      this.highlightPreviewCode();
    }
  },
  
  highlightPreviewCode() {
    console.log('尝试高亮预览中的代码块');
    
    // 首先尝试高亮当前文档中的代码块
    if (typeof window.highlightCode === 'function') {
      window.highlightCode(document);
    }
    
    // 查找iframe并处理
    setTimeout(() => {
      const iframes = document.querySelectorAll('iframe');
      if (iframes.length > 0) {
        console.log(`找到 ${iframes.length} 个iframe`);
        
        // 使用全局函数注入Prism
        if (typeof window.injectPrismToIframe === 'function') {
          iframes.forEach(window.injectPrismToIframe);
        } else {
          console.error('injectPrismToIframe 函数未定义');
        }
      } else {
        console.log('未找到iframe');
      }
    }, 500);
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

// 将PostPreview组件暴露为全局变量
window.PostPreview = PostPreview;

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
      if (!data || data.code === undefined || data.code === null) {
        console.warn('代码块内容为空或undefined');
        return "```" + (data?.language || 'text') + "\n\n```";
      }
      
      // 使用原始代码，不尝试格式化
      return "```" + (data.language || 'text') + "\n" + data.code + "\n```";
    },
    toPreview: function(data) {
      // 检查代码是否存在
      if (!data || data.code === undefined || data.code === null) {
        return '<pre class="language-' + (data?.language || 'text') + '"><code></code></pre>';
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
      
      // 确保语言标识符是有效的
      const language = data.language || 'text';
      
      // 添加日志
      console.log(`预览代码块: 语言=${language}, 长度=${codeString.length}`);
      
      // 使用完整的CSS类名确保Prism能正确识别
      return (
        '<pre class="language-' + language + '"><code class="language-' + language + '">' +
          encodedCode +
        '</code></pre>'
      );
    }
  });
};

// 将函数暴露为全局API
window.registerCodeBlockComponent = registerCodeBlockComponent;
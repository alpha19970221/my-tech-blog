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
    // 确保Prism已加载
    if (typeof Prism !== 'undefined') {
      console.log('应用Prism语法高亮...');
      
      // 检查所有代码块并尝试高亮
      const codeBlocks = document.querySelectorAll('pre code');
      if (codeBlocks.length > 0) {
        console.log(`找到 ${codeBlocks.length} 个代码块`);
        codeBlocks.forEach(block => {
          try {
            Prism.highlightElement(block);
          } catch (e) {
            console.error('高亮代码块失败:', e);
          }
        });
      } else {
        console.log('未找到代码块');
      }
      
      // 检查所有iframe
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(injectPrismToIframe);
    } else {
      console.warn('Prism未加载，无法应用语法高亮');
      // 尝试加载Prism
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      script.onload = () => {
        console.log('Prism已加载，尝试重新高亮');
        this.highlightCode();
      };
      document.head.appendChild(script);
    }
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

// 将Prism注入到iframe中
function injectPrismToIframe(iframe) {
  try {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    
    // 如果iframe中没有Prism，注入它
    if (typeof iframeDocument.defaultView.Prism === 'undefined') {
      // 注入Prism CSS
      const prismCss = document.createElement('link');
      prismCss.rel = 'stylesheet';
      prismCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
      iframeDocument.head.appendChild(prismCss);
      
      // 注入Prism JS
      const prismJs = document.createElement('script');
      prismJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      prismJs.onload = () => {
        console.log('Prism已注入到iframe中');
        // 高亮iframe中的代码
        const codeBlocks = iframeDocument.querySelectorAll('pre code');
        if (codeBlocks.length > 0) {
          codeBlocks.forEach(block => {
            try {
              iframeDocument.defaultView.Prism.highlightElement(block);
            } catch (e) {
              console.error('高亮iframe中的代码块失败:', e);
            }
          });
        }
      };
      iframeDocument.body.appendChild(prismJs);
    } else {
      // 直接高亮
      const codeBlocks = iframeDocument.querySelectorAll('pre code');
      if (codeBlocks.length > 0) {
        codeBlocks.forEach(block => {
          try {
            iframeDocument.defaultView.Prism.highlightElement(block);
          } catch (e) {
            console.error('高亮iframe中的代码块失败:', e);
          }
        });
      }
    }
  } catch (e) {
    console.error('注入Prism到iframe失败:', e);
  }
}

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
      
      // 尝试格式化代码
      let formattedCode = data.code;
      
      // 暂时禁用格式化，直接使用原代码
      // try {
      //   formattedCode = formatCode(data.code, data.language);
      // } catch (e) {
      //   console.error('格式化失败:', e);
      // }
      
      return "```" + (data.language || 'text') + "\n" + formattedCode + "\n```";
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
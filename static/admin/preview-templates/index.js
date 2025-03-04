import React from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';

// 引入Prism的基础样式
import 'prismjs/themes/prism-tomorrow.css'; // 你可以选择不同的主题

// 引入常用语言支持
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';

// 配置marked使用Prism进行语法高亮
marked.setOptions({
  highlight: function(code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      return code;
    }
  },
  breaks: true,
  gfm: true
});

const PostPreview = ({ entry, widgetFor }) => {
  // 获取markdown内容
  const body = entry.getIn(['data', 'body']);
  
  // 获取标题
  const title = entry.getIn(['data', 'title']) || '';
  
  // 样式
  const previewStyle = {
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    maxWidth: '768px',
    margin: '0 auto'
  };
  
  const titleStyle = {
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px'
  };
  
  // 预览内容
  return (
    <div style={previewStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <div className="content"
        dangerouslySetInnerHTML={{
          __html: marked(body || '')
        }}
      />
    </div>
  );
};

export default PostPreview;
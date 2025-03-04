import React from 'react';
import { PreviewTemplateComponentProps } from 'decap-cms-core';
import 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css'; // 或者选择其他主题

// 当 Markdown 内容渲染后高亮代码块
const highlightCode = () => {
  if (typeof window !== 'undefined' && window.Prism) {
    window.Prism.highlightAll();
  }
};

// 文章预览组件
const PostPreview = ({ entry, widgetFor }) => {
  React.useEffect(() => {
    highlightCode();
  }, [entry]);

  return (
    <div className="content">
      <h1>{entry.getIn(['data', 'title'])}</h1>
      <div>{widgetFor('body')}</div>
    </div>
  );
};

export default PostPreview;
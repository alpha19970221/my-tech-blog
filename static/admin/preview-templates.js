
// 如果你更倾向于直接注入自定义样式，可以使用以下代码（取消注释并删除上面的注册方式）：

DecapCMS.registerPreviewStyle(`
  pre, code {
    font-family: "Fira Code", monospace;
    background-color: #2d2d2d;
    color: #ccc;
    padding: 1em;
    border-radius: 4px;
    overflow: auto;
  }
`, { raw: true });

// 使用 React 语法注册预览模板
const PostPreview = ({ entry, widgetFor }) => {
  const data = entry.toJS();
  return (
    <div style={{ padding: '1em', fontFamily: 'Arial, sans-serif' }}>
      <h1>{data.title}</h1>
      <p>{data.date}</p>
      <div>{widgetFor('body')}</div>
    </div>
  );
};

// 注册预览模板，'posts' 对应 config.yml 中定义的集合名称
DecapCMS.registerPreviewTemplate('posts', PostPreview);
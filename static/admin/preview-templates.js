// 注入外部 CSS 高亮样式（例如 Prism Tomorrow 主题）
DecapCMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');

// 使用原生 JavaScript 创建预览组件
function PostPreview(props) {
  // 获取文章数据
  var data = props.entry.toJS();
  return React.createElement(
    "div",
    { style: { padding: "1em", fontFamily: "Arial, sans-serif" } },
    React.createElement("h1", null, data.title),
    React.createElement("p", null, data.date),
    React.createElement("div", null, props.widgetFor("body"))
  );
}

// 注册预览模板，'posts' 应与 config.yml 中定义的集合名称一致
DecapCMS.registerPreviewTemplate("posts", PostPreview);

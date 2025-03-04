// 引入外部 PrismJS 样式（可选，根据需要加载）
CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.css');

// 使用 React.createElement 创建预览组件（不使用 JSX）
function PostPreview(props) {
  var data = props.entry.toJS();
  return React.createElement(
    "div",
    { style: { padding: "1em", fontFamily: "Arial, sans-serif" } },
    React.createElement("h1", null, data.title),
    React.createElement("p", null, data.date),
    // 直接插入 widgetFor 返回的 React 元素
    props.widgetFor("body")
  );
}

// 注册预览模板，确保 'posts' 与 config.yml 中定义的集合名称一致
CMS.registerPreviewTemplate("posts", PostPreview);

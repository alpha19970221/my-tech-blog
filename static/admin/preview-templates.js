// 确保先加载 Decap CMS 和 React（Decap CMS 内置 React 时通常会自动加载）
CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');

// 使用 React.createElement 创建预览组件
function PostPreview(props) {
  var data = props.entry.toJS();
  return React.createElement(
    "div",
    { style: { padding: "1em", fontFamily: "Arial, sans-serif" } },
    React.createElement("h1", null, data.title),
    React.createElement("p", null, data.date),
    React.createElement("div", {
      // 使用 dangerouslySetInnerHTML 将预览内容渲染成 HTML
      dangerouslySetInnerHTML: { __html: props.widgetFor("body") }
    })
  );
}

// 注册预览模板，确保 'posts' 与 config.yml 中集合名称一致
CMS.registerPreviewTemplate("posts", PostPreview);

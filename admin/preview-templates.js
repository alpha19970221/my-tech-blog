// 注入自定义预览样式（如果你希望通过 CSS 优化代码块样式，可在 example.css 中定义更多样式）
// DecapCMS.registerPreviewStyle("/style/example.css");

// 定义一个用于文章预览的组件（不使用 JSX）
function PostPreview(props) {
  // 获取文章数据（前端 CMS 将 front matter 与正文合并为 entry 对象）
  var data = props.entry.toJS();
  
  // 创建预览组件的 DOM 结构
  var container = document.createElement('div');
  container.style.padding = '1em';
  container.style.fontFamily = 'Arial, sans-serif';

  var titleEl = document.createElement('h1');
  titleEl.textContent = data.title;
  container.appendChild(titleEl);

  var dateEl = document.createElement('p');
  dateEl.textContent = data.date;
  container.appendChild(dateEl);

  // 生成正文内容（CMS 的 widgetFor 方法会返回 HTML 字符串）
  var bodyContainer = document.createElement('div');
  // 注意：这里假设 widgetFor('body') 返回的是 HTML 字符串，需使用 innerHTML 渲染
  bodyContainer.innerHTML = props.widgetFor('body');
  container.appendChild(bodyContainer);

  // 调用 PrismJS 对代码块进行高亮（延迟执行确保 DOM 已渲染完成）
  setTimeout(function() {
    if (window.Prism) {
      window.Prism.highlightAll();
    }
  }, 0);

  return container;
}

// 注册预览模板，集合名称需与 config.yml 中一致（例如 'posts'）
DecapCMS.registerPreviewTemplate("posts", PostPreview);

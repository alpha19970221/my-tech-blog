// 注入外部 PrismJS 样式
CMS.registerPreviewStyle('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');

// 使用原生 JavaScript 创建预览组件
function PostPreview(props) {
  var data = props.entry.toJS();
  var container = document.createElement('div');
  container.style.padding = '1em';
  container.style.fontFamily = 'Arial, sans-serif';

  var titleEl = document.createElement('h1');
  titleEl.textContent = data.title;
  container.appendChild(titleEl);

  var dateEl = document.createElement('p');
  dateEl.textContent = data.date;
  container.appendChild(dateEl);

  var bodyContainer = document.createElement('div');
  bodyContainer.innerHTML = props.widgetFor('body');
  container.appendChild(bodyContainer);

  // 调用 PrismJS 高亮代码
  setTimeout(function() {
    if (window.Prism) {
      window.Prism.highlightAll();
    }
  }, 0);

  return container;
}

// 注册预览模板，集合名称需与 config.yml 中一致
CMS.registerPreviewTemplate("posts", PostPreview);

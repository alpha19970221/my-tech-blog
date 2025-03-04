import CMS from 'decap-cms-app';
import PostPreview from './preview-templates';

// 注册预览模板
CMS.registerPreviewTemplate('posts', PostPreview); // 'posts'对应你的collection名称
CMS.registerPreviewTemplate('blog', PostPreview); // 如果你有blog collection
CMS.registerPreviewTemplate('pages', PostPreview); // 如果你有pages collection

// 如果你有其他collection也需要代码高亮，请继续添加
// CMS.registerPreviewTemplate('your-collection-name', PostPreview);

// 初始化CMS
CMS.init();
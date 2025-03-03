import React from 'react'
import ReactDOM from 'react-dom'
import CMS from 'decap-cms-app'

// 定义你的预览组件，比如用于文章集合的预览
const PostPreview = ({ entry, widgetFor }) => {
  const data = entry.toJS()
  return (
    <div>
      <h1>{data.title}</h1>
      <div>{widgetFor('body')}</div>
    </div>
  )
}

// 注册预览模板
CMS.registerPreviewTemplate('posts', PostPreview)

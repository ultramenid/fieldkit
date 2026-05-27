import {
  DEFAULT_FIELD_RICH_TEXT_FEATURES,
  resolveRichTextFeatures,
  type RichTextFeatures,
} from '@fieldkit/form-schema'

function toolbarButton(cmd: string, label: string, arg?: string): string {
  const argAttr = arg ? ` data-arg="${arg}"` : ''
  return `<button type="button" data-cmd="${cmd}"${argAttr}>${label}</button>`
}

function toolbarSelect(type: 'list' | 'align'): string {
  if (type === 'list') {
    return `<select data-select="list">
      <option value="">List</option>
      <option value="bullet">• List</option>
      <option value="ordered">1. List</option>
    </select>`
  }
  return `<select data-select="align">
    <option value="">Align</option>
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>
  </select>`
}

function buildToolbar(features: RichTextFeatures): string {
  const parts: string[] = []
  if (features.bold) parts.push(toolbarButton('bold', 'B'))
  if (features.italic) parts.push(toolbarButton('italic', 'I'))
  if (features.underline) parts.push(toolbarButton('underline', 'U'))
  if (features.highlight) parts.push(toolbarButton('hiliteColor', 'H', '#fef08a'))
  if (features.lists) parts.push(toolbarSelect('list'))
  if (features.blockquote) parts.push(toolbarButton('formatBlock', '❝', 'blockquote'))
  if (features.codeBlock) parts.push(toolbarButton('formatBlock', '&lt;/&gt;', 'pre'))
  if (features.link) parts.push(toolbarButton('link', 'Link'))
  if (features.align) parts.push(toolbarSelect('align'))
  if (features.image) parts.push(toolbarButton('image', 'Img'))
  return parts.join('')
}

export function buildRichTextEditorHtml(
  initialHtml: string,
  placeholder: string,
  featuresPartial?: Partial<RichTextFeatures>,
): string {
  const features = resolveRichTextFeatures(featuresPartial, DEFAULT_FIELD_RICH_TEXT_FEATURES)
  const toolbar = buildToolbar(features)
  const safeInitial = JSON.stringify(initialHtml || '')
  const safePlaceholder = JSON.stringify(placeholder || 'Write your answer…')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, system-ui, sans-serif; font-size: 15px; color: #000; background: #fff; }
  .wrap { border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border-bottom: 1px solid #e5e5e5; background: #fafafa; }
  .toolbar button { border: 1px solid #e5e5e5; background: #fff; border-radius: 9999px; min-width: 28px; height: 28px; font-size: 11px; font-weight: 600; color: #000; padding: 0 8px; }
  .toolbar button:hover { border-color: #000; }
  .toolbar select { border: 1px solid #e5e5e5; background: #fff; border-radius: 9999px; height: 28px; font-size: 11px; color: #000; padding: 0 24px 0 10px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
  .editor { min-height: 100px; padding: 12px 16px; line-height: 1.5; outline: none; }
  .editor p, .editor div { margin: 0 0 0.5em; min-height: 1.5em; }
  .editor:empty:before { content: attr(data-placeholder); color: #a3a3a3; pointer-events: none; }
  .editor ul, .editor ol { margin: 8px 0; padding-left: 24px; }
  .editor blockquote { border-left: 2px solid #e5e5e5; padding-left: 12px; margin: 8px 0; font-style: italic; color: #737373; }
  .editor pre { background: #fafafa; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 8px 0; overflow-x: auto; }
  .editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
  .editor mark { background: rgba(139, 69, 19, 0.18); }
</style>
</head>
<body>
<div class="wrap">
  <div class="toolbar">${toolbar}</div>
  <div class="editor" id="ed" contenteditable="true" data-placeholder=""></div>
</div>
<script>
  const ed = document.getElementById('ed')
  const initial = ${safeInitial}
  const placeholder = ${safePlaceholder}
  ed.setAttribute('data-placeholder', placeholder)
  if (initial && initial.trim()) ed.innerHTML = initial

  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg))
  }

  function normalizeHtml(html) {
    return (html || '')
      .replace(/<div(\\s[^>]*)>/gi, '<p$1>')
      .replace(/<\\/div>/gi, '</p>')
      .replace(/<p([^>]*)>\\s*<\\/p>/gi, '<p$1><br></p>')
  }

  function sync() { post({ type: 'change', html: normalizeHtml(ed.innerHTML) }) }
  function postHeight() {
    const doc = document.documentElement
    const body = document.body
    const height = Math.max(
      doc ? doc.scrollHeight : 0,
      body ? body.scrollHeight : 0
    )
    post({ type: 'height', height })
  }

  ed.addEventListener('input', sync)
  ed.addEventListener('input', postHeight)
  ed.addEventListener('blur', () => post({ type: 'blur' }))
  window.addEventListener('resize', postHeight)

  document.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      ed.focus()
      const cmd = btn.dataset.cmd
      if (cmd === 'link') {
        const url = prompt('Enter link URL')
        if (url) document.execCommand('createLink', false, url)
      } else if (cmd === 'image') {
        const url = prompt('Enter image URL')
        if (url) document.execCommand('insertImage', false, url)
      } else if (cmd === 'formatBlock') {
        document.execCommand('formatBlock', false, btn.dataset.arg || 'blockquote')
      } else if (cmd === 'hiliteColor') {
        document.execCommand('hiliteColor', false, btn.dataset.arg || '#fef08a')
      } else {
        document.execCommand(cmd, false)
      }
      sync()
      postHeight()
    })
  })

  document.querySelectorAll('[data-select]').forEach(select => {
    select.addEventListener('change', () => {
      ed.focus()
      if (select.dataset.select === 'list') {
        if (select.value === 'bullet') document.execCommand('insertUnorderedList', false)
        else if (select.value === 'ordered') document.execCommand('insertOrderedList', false)
      } else if (select.dataset.select === 'align') {
        if (select.value === 'left') document.execCommand('justifyLeft', false)
        else if (select.value === 'center') document.execCommand('justifyCenter', false)
        else if (select.value === 'right') document.execCommand('justifyRight', false)
      }
      select.value = ''
      sync()
      postHeight()
    })
  })

  window.setEditorHtml = (html) => {
    if (document.activeElement === ed) return
    ed.innerHTML = html || ''
    postHeight()
  }

  window.blurEditor = () => {
    ed.blur()
  }

  post({ type: 'ready' })
  postHeight()
</script>
</body>
</html>`
}

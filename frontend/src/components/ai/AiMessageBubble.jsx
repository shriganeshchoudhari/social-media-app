/**
 * AiMessageBubble — renders a single chat message (user or assistant).
 *
 * Assistant messages are rendered with lightweight markdown:
 *   **bold**, *italic*, `code`, ```code blocks```, and - bullet lists.
 *
 * No external library needed — pure regex transforms.
 */

import { useEffect, useRef } from 'react'

// ── Simple markdown-to-HTML renderer ────────────────────────────────────────

function renderMarkdown(text) {
  if (!text) return ''

  const lines = text.split('\n')
  const htmlLines = []
  let inCodeBlock = false
  let codeBuffer = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBuffer = []
      } else {
        inCodeBlock = false
        const escaped = codeBuffer.join('\n')
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        htmlLines.push(
          `<pre class="bg-gray-100 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap"><code>${escaped}</code></pre>`
        )
        codeBuffer = []
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const content = inlineMarkdown(line.replace(/^[-*]\s+/, ''))
      htmlLines.push(`<li class="ml-4 list-disc">${content}</li>`)
      continue
    }

    // Heading
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#{1,3})/)[1].length
      const content = inlineMarkdown(line.replace(/^#{1,3}\s+/, ''))
      const cls = level === 1 ? 'text-base font-bold mt-2' : 'text-sm font-semibold mt-1'
      htmlLines.push(`<p class="${cls}">${content}</p>`)
      continue
    }

    // Blank line → paragraph break
    if (line.trim() === '') {
      htmlLines.push('<br />')
      continue
    }

    htmlLines.push(`<span class="block">${inlineMarkdown(line)}</span>`)
  }

  return htmlLines.join('\n')
}

function inlineMarkdown(text) {
  return text
    // Inline code — must come before bold/italic
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Escape remaining HTML
    .replace(/<(?!strong|\/strong|em|\/em|code|\/code)/g, '&lt;')
}

// ── Typing indicator (three animated dots) ────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" data-testid="typing-indicator">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}

// ── AiMessageBubble ───────────────────────────────────────────────────────────

/**
 * @param {{ role: 'user'|'assistant', content: string, isStreaming?: boolean }} props
 */
export default function AiMessageBubble({ role, content, isStreaming }) {
  const bubbleRef = useRef(null)

  // Auto-scroll as new tokens arrive
  useEffect(() => {
    if (isStreaming && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [content, isStreaming])

  if (role === 'user') {
    return (
      <div className="flex justify-end" ref={bubbleRef}>
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-purple-600 text-white text-sm leading-relaxed"
          data-testid="user-message"
        >
          {content}
        </div>
      </div>
    )
  }

  // Assistant message
  const showTyping = isStreaming && (!content || content.length === 0)

  return (
    <div className="flex items-start gap-2.5" ref={bubbleRef}>
      {/* Spark avatar */}
      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5 text-base">
        ⚡
      </div>

      <div
        className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-sm text-gray-800 leading-relaxed shadow-sm"
        data-testid="assistant-message"
      >
        {showTyping ? (
          <TypingIndicator />
        ) : (
          <div
            className="prose-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
        {/* Blinking cursor at end while streaming */}
        {isStreaming && content && (
          <span className="inline-block w-0.5 h-4 bg-purple-600 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  )
}

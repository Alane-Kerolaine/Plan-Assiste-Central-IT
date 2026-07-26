import { Fragment } from 'react'

const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g

export function InlineLinkedText({ text }: { text: string }) {
  const parts = []
  let cursor = 0

  for (const match of text.matchAll(markdownLinkPattern)) {
    const index = match.index ?? 0
    if (index > cursor) parts.push(<Fragment key={`text-${cursor}`}>{text.slice(cursor, index)}</Fragment>)
    const href = match[2]
    const external = /^https?:\/\//i.test(href)
    parts.push(<a key={`link-${index}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{match[1]}</a>)
    cursor = index + match[0].length
  }

  if (cursor < text.length) parts.push(<Fragment key={`text-${cursor}`}>{text.slice(cursor)}</Fragment>)
  return <>{parts.length ? parts : text}</>
}

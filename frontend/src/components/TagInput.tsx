import { useRef, useState } from 'react'

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export function TagInput({ value, onChange, suggestions = [], placeholder = 'Add a tag…' }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const normalize = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, '-')

  const filtered = input.trim()
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(normalize(s)),
      )
    : []

  function addTag(tag: string) {
    const cleaned = normalize(tag)
    if (cleaned && !value.includes(cleaned)) {
      onChange([...value, cleaned])
    }
    setInput('')
    inputRef.current?.focus()
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if ((event.key === 'Enter' || event.key === ',') && input.trim()) {
      event.preventDefault()
      addTag(input)
    } else if (event.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="tag-input-wrapper" onClick={() => inputRef.current?.focus()}>
      <div className="tag-input-chips">
        {value.map((tag) => (
          <span className="tag-chip" key={tag}>
            #{tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>
      {filtered.length > 0 && (
        <ul className="tag-suggestions">
          {filtered.map((s) => (
            <li key={s}>
              <button type="button" className="tag-suggestion-item" onMouseDown={(e) => { e.preventDefault(); addTag(s) }}>
                #{s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

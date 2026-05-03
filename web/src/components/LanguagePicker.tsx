import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { LANGUAGES } from '../services/i18n.ts'
import type { LanguageCode } from '../types.ts'

export function LanguagePicker({
  value,
  onChange,
  label,
  compact,
}: {
  value: LanguageCode
  onChange: (code: LanguageCode) => void
  label: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((language) => language.code === value) ?? LANGUAGES[0]

  return (
    <div className="relative">
      {compact ? (
        <button
          className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--glass)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--glass-hover)]"
          onClick={() => setOpen(!open)}
          type="button"
        >
          <span>{current.name}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.2} />
        </button>
      ) : (
        <button
          className="flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--glass)] px-4 py-3 text-left shadow-[var(--shadow-card)] hover:border-[var(--line-strong)] hover:bg-[var(--glass-hover)]"
          onClick={() => setOpen(!open)}
          type="button"
        >
          <div className="min-w-0">
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
            <div className="mt-1 truncate text-sm font-semibold text-[var(--ink)]">{current.name}</div>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.2} />
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-[1.25rem] border border-[var(--line-strong)] bg-[var(--panel-strong)] p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl">
            {LANGUAGES.map((language) => {
              const active = language.code === value
              return (
                <button
                  key={language.code}
                  className={`flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-sm ${
                    active
                      ? 'text-[var(--ink)]'
                      : 'text-[var(--muted)] hover:bg-[var(--glass-hover)] hover:text-[var(--ink)]'
                  }`}
                  style={active ? { background: 'var(--accent-gradient)' } : undefined}
                  onClick={() => {
                    onChange(language.code)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <span className="flex-1 text-left font-medium">{language.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

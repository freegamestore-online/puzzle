import { LanguagePicker } from './LanguagePicker.tsx'
import { getStrings } from '../services/i18n.ts'
import type {
  FontSizePreference,
  MotionPreference,
  Settings,
  SurfacePreference,
  ThemePreference,
} from '../services/settings.ts'

interface Props {
  settings: Settings
  update: (patch: Partial<Settings>) => void
}

export function PreferencesTab({ settings, update }: Props) {
  const strings = getStrings(settings.contentLang)

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-1">
      <Section title={strings.language}>
        <LanguagePicker
          label={strings.language}
          value={settings.contentLang}
          onChange={(code) => update({ contentLang: code })}
        />
      </Section>

      <Section title={strings.appearance}>
        <SegmentRow<ThemePreference>
          label={strings.theme}
          value={settings.theme}
          options={[
            { value: 'system', label: strings.system },
            { value: 'light', label: strings.light },
            { value: 'dark', label: strings.dark },
          ]}
          onChange={(value) => update({ theme: value })}
        />
        <SegmentRow<SurfacePreference>
          label={strings.surface}
          value={settings.surface}
          options={[
            { value: 'soft', label: strings.soft },
            { value: 'bold', label: strings.bold },
          ]}
          onChange={(value) => update({ surface: value })}
        />
        <SegmentRow<MotionPreference>
          label={strings.motion}
          value={settings.motion}
          options={[
            { value: 'full', label: strings.full },
            { value: 'reduced', label: strings.reduced },
          ]}
          onChange={(value) => update({ motion: value })}
        />
      </Section>

      <Section title={strings.sizing}>
        <SegmentRow<FontSizePreference>
          label={strings.labelSize}
          value={settings.labelSize}
          options={[
            { value: 'small', label: 'S' },
            { value: 'medium', label: 'M' },
            { value: 'large', label: 'L' },
            { value: 'xlarge', label: 'XL' },
          ]}
          onChange={(value) => update({ labelSize: value })}
        />
        <SegmentRow<FontSizePreference>
          label={strings.contentSize}
          value={settings.contentSize}
          options={[
            { value: 'small', label: 'S' },
            { value: 'medium', label: 'M' },
            { value: 'large', label: 'L' },
            { value: 'xlarge', label: 'XL' },
          ]}
          onChange={(value) => update({ contentSize: value })}
        />
      </Section>

      <div className="pt-4 text-center">
        <a href="https://freegamestore.online" target="_blank" rel="noopener" className="inline-flex items-center min-h-[2.75rem] text-[0.7rem] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          Part of FreeGameStore — free forever
        </a>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function SegmentRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
      <div className="flex gap-1 rounded-full border border-[var(--line)] bg-[var(--glass-soft)] p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            className={`rounded-full px-3 py-1.5 min-h-[2.75rem] min-w-[2.75rem] text-xs font-semibold transition-all duration-150 ${
              value === option.value
                ? 'bg-[var(--ink)] text-[var(--paper)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

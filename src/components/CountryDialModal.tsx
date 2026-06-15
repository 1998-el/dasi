import { useEffect, useMemo, useState } from 'react'

export type CountryDial = { code: string; dial: string; name: string }

type Props = {
  open: boolean
  title?: string
  countries: CountryDial[]
  initialQuery?: string
  initialSelectedDial?: string
  onClose: () => void
  onSelect: (payload: { dial: string; code: string; name: string }) => void
}

export function CountryDialModal({
  open,
  title = 'Choisir un pays',
  countries,
  initialQuery = '',
  initialSelectedDial,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [selectedDial, setSelectedDial] = useState<string | undefined>(initialSelectedDial)

  useEffect(() => {
    if (!open) return
    setQuery(initialQuery)
    setSelectedDial(initialSelectedDial)
  }, [open, initialQuery, initialSelectedDial])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dial.includes(q),
    )
  }, [countries, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xl mx-auto mt-20 px-4">
        <div className="bg-white rounded-sm shadow-lg border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 text-sm">{title}</div>
              <div className="text-xs text-slate-500">Recherche instantanée</div>
            </div>
            <button
              type="button"
              className="text-slate-500 hover:text-slate-900 text-sm font-bold"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>

          <div className="p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un pays..."
              className="w-full h-10 rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
              autoFocus
            />

            <div className="mt-3 max-h-80 overflow-auto pr-1">
              {filtered.length === 0 && (
                <div className="text-sm text-slate-500 py-6 text-center">Aucun résultat</div>
              )}

              {filtered.map((c) => {
                const isSelected = selectedDial ? c.dial === selectedDial : false
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedDial(c.dial)
                      onSelect({ dial: c.dial, code: c.code, name: c.name })
                      onClose()
                    }}
                    className={
                      'w-full flex items-center justify-between gap-3 text-left px-3 py-2 rounded-sm hover:bg-slate-50 border border-transparent ' +
                      (isSelected ? 'bg-orange-50 border-orange-200' : '')
                    }
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.code}</div>
                    </div>
                    <div className="font-bold text-sm text-orange-700">{c.dial}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


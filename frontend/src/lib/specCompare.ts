// Helpers that turn a product's free-text spec strings into comparable numbers,
// so the comparison table can highlight which product actually wins each row
// (more storage, bigger battery, lighter weight, larger screen, …) instead of
// just dumping the values side by side.

export type SpecDirection = 'higher' | 'lower'

// Grouping/matching key for a spec name: trim, collapse inner whitespace and
// lowercase, so "Дисплей", "дисплей " and "Дисплей" line up in one row even
// when products are entered by hand in the admin panel.
export function normalizeSpecName(name: string): string {
  return (name || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Pull the number that sits immediately before one of `units` in the value.
// Anchoring to the unit avoids grabbing an unrelated number elsewhere in the
// string ("5000 мАг, зарядка 45 Вт" → 5000 for мАг, 45 for Вт). Internal spaces
// / NBSP are treated as thousands separators ("5 000" → 5000).
function numberBeforeUnit(value: string, units: string[]): number | null {
  const v = (value || '').toLowerCase()
  for (const unit of units) {
    const re = new RegExp('(\\d[\\d\\s\\u00a0\\u202f]*(?:[.,]\\d+)?)\\s*' + escapeRe(unit.toLowerCase()))
    const m = v.match(re)
    if (m) {
      const cleaned = m[1].replace(/[\s  ]/g, '').replace(',', '.')
      const n = parseFloat(cleaned)
      if (!Number.isNaN(n)) return n
    }
  }
  return null
}

// Storage capacity in GB from the *first* capacity token in the string. Taking
// the first (not the largest) avoids mistaking an expansion limit for the real
// storage — e.g. "64 ГБ (microSD до 2 ТБ)" is a 64 GB device, not 2 TB.
function firstCapacityGb(value: string): number | null {
  const m = (value || '')
    .toLowerCase()
    .match(/(\d[\d\s  ]*(?:[.,]\d+)?)\s*(тб|tb|гб|gb)/)
  if (!m) return null
  const n = parseFloat(m[1].replace(/[\s  ]/g, '').replace(',', '.'))
  if (Number.isNaN(n)) return null
  const isTb = m[2] === 'тб' || m[2] === 'tb'
  return isTb ? n * 1024 : n
}

// Map a (spec name, value) pair to a single comparable metric, or null when the
// spec isn't meaningfully numeric. Extraction is unit-anchored and conservative:
// returning null (no highlight) is always preferable to highlighting the wrong
// winner. Values are normalised to one unit so 1 ТБ beats 512 ГБ, 1.4 кг is
// heavier than 900 г, etc.
export function getSpecMetric(
  name: string,
  value: string
): { num: number; direction: SpecDirection } | null {
  const n = normalizeSpecName(name)
  const v = value || ''

  // Storage — higher is better; uses the first capacity token (ТБ → ГБ).
  if (/накопичув|пам.?ять|сховищ|storage|\bssd\b|\bhdd\b|\brom\b/.test(n)) {
    const gb = firstCapacityGb(v)
    return gb != null ? { num: gb, direction: 'higher' } : null
  }
  // RAM — higher.
  if (/оперативн|\bозп\b|\bram\b/.test(n)) {
    const gb = numberBeforeUnit(v, ['гб', 'gb'])
    return gb != null ? { num: gb, direction: 'higher' } : null
  }
  // Battery capacity — higher.
  if (/акумулятор|батаре|ємніст/.test(n)) {
    const mah = numberBeforeUnit(v, ['мА·год', 'мАг', 'mah'])
    return mah != null ? { num: mah, direction: 'higher' } : null
  }
  // Weight — lower. кг → г.
  if (/вага|маса|weight/.test(n)) {
    const kg = numberBeforeUnit(v, ['кг', 'kg'])
    if (kg != null) return { num: kg * 1000, direction: 'lower' }
    const g = numberBeforeUnit(v, ['г', 'g'])
    return g != null ? { num: g, direction: 'lower' } : null
  }
  // Screen size (diagonal) — higher (inches).
  if (/дисплей|екран|діагональ|screen|display/.test(n)) {
    const inch = numberBeforeUnit(v, ['"', '”', '″', 'дюйм'])
    return inch != null ? { num: inch, direction: 'higher' } : null
  }
  // Refresh rate — higher (Гц).
  if (/частота|оновленн|refresh/.test(n)) {
    const hz = numberBeforeUnit(v, ['гц', 'hz'])
    return hz != null ? { num: hz, direction: 'higher' } : null
  }
  // Camera resolution — higher (Мп, first/main sensor).
  if (/камера|camera/.test(n)) {
    const mp = numberBeforeUnit(v, ['мп', 'mp'])
    return mp != null ? { num: mp, direction: 'higher' } : null
  }
  // Battery life / autonomy — higher (hours).
  if (/автономн/.test(n)) {
    const h = numberBeforeUnit(v, ['год'])
    return h != null ? { num: h, direction: 'higher' } : null
  }

  return null
}

// Pick the winning id(s) from numeric entries. Returns [] when there is no clear
// winner: fewer than two comparable values, or every value is equal (so there's
// nothing to highlight). Ties at the best value return all the tied ids.
export function bestIds(
  entries: { id: string; num: number | null }[],
  direction: SpecDirection
): string[] {
  const valid = entries.filter(
    (e): e is { id: string; num: number } => e.num != null && !Number.isNaN(e.num)
  )
  if (valid.length < 2) return []
  const nums = valid.map((e) => e.num)
  if (new Set(nums).size < 2) return []
  const best = direction === 'higher' ? Math.max(...nums) : Math.min(...nums)
  return valid.filter((e) => e.num === best).map((e) => e.id)
}

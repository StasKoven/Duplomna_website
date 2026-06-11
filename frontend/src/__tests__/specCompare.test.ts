import { normalizeSpecName, getSpecMetric, bestIds } from '@/lib/specCompare'

describe('normalizeSpecName', () => {
  it('trims, collapses whitespace and lowercases', () => {
    expect(normalizeSpecName('  Дисплей ')).toBe('дисплей')
    expect(normalizeSpecName('Основна  камера')).toBe('основна камера')
  })
})

describe('getSpecMetric — unit-anchored extraction', () => {
  const num = (name: string, value: string) => getSpecMetric(name, value)?.num
  const dir = (name: string, value: string) => getSpecMetric(name, value)?.direction

  it('storage: ГБ and ТБ normalised, higher is better', () => {
    expect(num('Накопичувач', '256 ГБ')).toBe(256)
    expect(num('Накопичувач', '256 ГБ UFS 4.0')).toBe(256)
    expect(num('Накопичувач', '1 ТБ')).toBe(1024)
    expect(dir('Накопичувач', '256 ГБ')).toBe('higher')
  })

  it('storage: uses the primary capacity, not an expansion limit', () => {
    // "64 ГБ (microSD до 2 ТБ)" is a 64 GB device — the 2 ТБ is the card limit.
    expect(num('Накопичувач', '64 ГБ (microSD до 2 ТБ)')).toBe(64)
    expect(num('Накопичувач', '512 ГБ SSD (розширення до 8 ТБ)')).toBe(512)
  })

  it('battery: reads мАг even with trailing text', () => {
    expect(num('Акумулятор', '4422 мАг, до 29 годин відтворення відео')).toBe(4422)
    expect(num('Акумулятор', '5000 мАг, швидка зарядка 45 Вт')).toBe(5000)
  })

  it('weight: lower is better, кг normalised to grams', () => {
    expect(num('Вага', '221 г')).toBe(221)
    expect(dir('Вага', '221 г')).toBe('lower')
    expect(num('Вага', '1.4 кг')).toBe(1400)
  })

  it('screen: extracts diagonal in inches, not the resolution/refresh', () => {
    expect(num('Дисплей', '6.7" Super Retina XDR OLED, 2796×1290, 120 Гц')).toBe(6.7)
    expect(num('Дисплей', '6.1" OLED')).toBe(6.1)
  })

  it('camera: first/main sensor megapixels', () => {
    expect(num('Основна камера', '48 Мп (f/1.78) + 12 Мп ультраширокий')).toBe(48)
    expect(num('Основна камера', '200 Мп (f/1.7 OIS) + 12 Мп + 50 Мп')).toBe(200)
  })

  it('handles spaces as thousands separators', () => {
    expect(num('Акумулятор', '5 000 мАг')).toBe(5000)
  })

  it('returns null for non-numeric / non-comparable specs', () => {
    expect(getSpecMetric('Процесор', 'Apple A17 Pro (3 нм)')).toBeNull()
    expect(getSpecMetric('ОС', 'iOS 17')).toBeNull()
    expect(getSpecMetric('Захист', 'IP68')).toBeNull()
  })
})

describe('bestIds — winner selection with ties', () => {
  it('higher: picks the max, supports ties', () => {
    expect(bestIds([{ id: 'a', num: 256 }, { id: 'b', num: 128 }], 'higher')).toEqual(['a'])
    expect(bestIds([{ id: 'a', num: 256 }, { id: 'b', num: 256 }, { id: 'c', num: 128 }], 'higher')).toEqual(['a', 'b'])
  })

  it('lower: picks the min', () => {
    expect(bestIds([{ id: 'a', num: 187 }, { id: 'b', num: 221 }], 'lower')).toEqual(['a'])
  })

  it('returns [] when there is no clear winner', () => {
    expect(bestIds([{ id: 'a', num: 256 }], 'higher')).toEqual([]) // need ≥2
    expect(bestIds([{ id: 'a', num: 256 }, { id: 'b', num: 256 }], 'higher')).toEqual([]) // all equal
    expect(bestIds([{ id: 'a', num: null }, { id: 'b', num: 128 }], 'higher')).toEqual([]) // only one comparable
  })
})

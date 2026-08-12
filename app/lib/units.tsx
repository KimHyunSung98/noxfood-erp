// 단위 변환: 1통 = 27세트 = 1728개
const UNIT_RATIO: { [key: string]: number } = {
  통: 1728,
  세트: 64,
  개: 1,
}

export function formatQty(qty: number, unit: string): string {
  const tong = qty / 1728
  const set = qty / 64
  
  if (tong >= 1) {
    return `${tong.toFixed(2)} 통`
  } else if (set >= 1) {
    return `${set.toFixed(2)} 세트`
  } else {
    return `${qty} 개`
  }
}

export function convertToBase(qty: number, unit: string): number {
  return qty * (UNIT_RATIO[unit] || 1)
}

export function convertUnit(qty: number, fromUnit: string, toUnit: string): number {
  const base = qty * (UNIT_RATIO[fromUnit] || 1)
  return base / (UNIT_RATIO[toUnit] || 1)
}

export const UNITS = ['통', '세트', '개']

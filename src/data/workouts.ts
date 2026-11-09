export const fields = {
  reps: 'Повторы',
  kg: 'Вес одной гантели, кг',
  left: 'Повторы левой',
  right: 'Повторы правой',
  leftSec: 'Слева, сек',
  rightSec: 'Справа, сек',
}
export type Field = keyof typeof fields
type Exercise = { id: string; name: string; sets: number; plan: string; fields: Field[] }

export const push: Exercise[] = [
  { id: 'press', name: 'Жим гантелей лёжа на скамье', sets: 3, plan: '8–12', fields: ['kg', 'reps'] },
  { id: 'bench', name: 'Отжимания от скамьи', sets: 2, plan: '8–15', fields: ['reps'] },
  { id: 'raises', name: 'Разведения гантелей в стороны', sets: 3, plan: '12–20', fields: ['kg', 'reps'] },
  { id: 'extension', name: 'Разгибание руки с гантелью на трицепс с опорой', sets: 2, plan: '10–15 на руку', fields: ['kg', 'left', 'right'] },
]
export const coreA: Exercise[] = [
  { id: 'crunch', name: 'Скручивания лёжа', sets: 3, plan: '10–15', fields: ['reps'] },
  { id: 'reverse', name: 'Обратные скручивания', sets: 2, plan: '10–15', fields: ['reps'] },
  { id: 'plank', name: 'Боковая планка', sets: 2, plan: '20–30 сек на сторону', fields: ['leftSec', 'rightSec'] },
]

export function sundayKey(now: Date) {
  const date = new Date(now)
  date.setDate(date.getDate() - date.getDay())
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}


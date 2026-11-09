import { useEffect, useRef, useState } from 'react'
import { coreA, fields, push } from './data/push'
import { readSession, saveField, type Entries } from './pushStorage'
import './journal.css'

const groups = [
  { name: 'Силовые упражнения', exercises: push },
  { name: 'Пресс A', duration: '8–12 мин', exercises: coreA },
]

export default function PushJournal({ date }: { date: string }) {
  const [entries, setEntries] = useState<Entries>({})
  const [previous, setPrevious] = useState<{ date: string; entries: Entries }>()
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('Загрузка журнала…')
  const [attempt, setAttempt] = useState(0)
  const pending = useRef(0)
  const failed = useRef(new Map<string, string>())

  useEffect(() => {
    let active = true
    readSession(date).then(result => {
      if (!active) return
      setEntries(result.entries)
      setPrevious(result.previous)
      setReady(true)
      setStatus(Object.keys(result.entries).length ? 'Сохранено на устройстве' : '')
    }).catch(() => { if (active) setStatus('Не удалось открыть журнал на устройстве.') })
    return () => { active = false }
  }, [date, attempt])

  function persist(key: string, value: string) {
    pending.current++
    setStatus('Сохранение…')
    saveField(date, key, value).then(() => failed.current.delete(key))
      .catch(() => failed.current.set(key, value)).finally(() => {
        pending.current--
        if (!pending.current) setStatus(failed.current.size
          ? 'Не удалось сохранить изменения. Повтори попытку.'
          : 'Сохранено на устройстве')
      })
  }

  function change(key: string, value: string) {
    setEntries(current => ({ ...current, [key]: value }))
    persist(key, value)
  }

  return <section className="journal">
    <h2>Журнал PUSH</h2>
    <p>{new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p role="status">{status}</p>
    {!ready && status.includes('Не удалось') && <button onClick={() => setAttempt(attempt + 1)}>Повторить загрузку</button>}
    {ready && status.startsWith('Не удалось сохранить') && <button onClick={() => failed.current.forEach((value, key) => persist(key, value))}>Повторить сохранение</button>}
    {ready && groups.map(group => <section key={group.name}>
      <h3>{group.name} {group.duration && <small>· {group.duration}</small>}</h3>
      {group.exercises.map(exercise => <article key={exercise.id}>
        <h4>{exercise.name}</h4>
        <p>{exercise.sets} × {exercise.plan}</p>
        {Array.from({ length: exercise.sets }, (_, index) => {
          const prefix = exercise.id + '.' + index + '.'
          const previousValues = exercise.fields.filter(field => previous?.entries[prefix + field])
          return <fieldset key={index}>
            <legend>Подход {index + 1}</legend>
            <div className="journal-fields">{exercise.fields.map(field =>
              <label key={field}>{fields[field]}
                <input type="text" inputMode={field === 'kg' ? 'decimal' : 'numeric'} value={entries[prefix + field] ?? ''}
                  onChange={event => {
                    const value = event.target.value
                    if ((field === 'kg' ? /^\d*(?:[.,]\d*)?$/ : /^\d*$/).test(value)) change(prefix + field, value)
                  }} />
              </label>
            )}</div>
            <label className="journal-done"><input type="checkbox" checked={entries[prefix + 'done'] === '1'}
              onChange={event => change(prefix + 'done', event.target.checked ? '1' : '')} />Выполнено</label>
            {previousValues.length > 0 && <small>В прошлый раз ({previous?.date}): {previousValues.map(field => fields[field] + ' — ' + previous?.entries[prefix + field]).join(' · ')}</small>}
          </fieldset>
        })}
      </article>)}
    </section>)}
  </section>
}



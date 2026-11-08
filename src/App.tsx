import PushJournal from './PushJournal'
import { sundayKey } from './data/push'
import { useEffect, useState } from 'react'
import { schedule } from './data/schedule'

export default function App() {
  const [now, setNow] = useState(() => new Date())
  const [chosenDay, setChosenDay] = useState<number | null>(null)
  useEffect(() => {
    const update = () => setNow(new Date())
    const timer = window.setInterval(update, 30_000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  const today = now.getDay()
  const selected = chosenDay ?? today
  const workout = schedule[selected]
  const isToday = selected === today
  const rest = selected === 5 || selected === 6
  return (
    <main className="app">
      <header className="brand"><span className="brand-icon" aria-hidden="true">M<span>W</span></span><span>MY WORKOUT<small>Личный дневник тренировок</small></span></header>
      <section className="intro">
        <p className="eyebrow">ТВОЯ НЕДЕЛЯ. ТВОЙ РИТМ.</p>
        <h1>Сегодня</h1>
        <p className="date">{new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)}</p>
      </section>
      <section className="week" aria-labelledby="week-title">
        <div className="section-heading"><h2 id="week-title">Расписание недели</h2><span>5 занятий</span></div>
        <div className="days" role="group" aria-label="Выбор дня недели">
          {schedule.map((day, index) => <button key={day.short} type="button" aria-pressed={selected === index} aria-label={day.day + ': ' + day.title + (index === today ? ', сегодня' : '')} className={'day ' + (selected === index ? 'selected' : '')} onClick={() => setChosenDay(index)}><span>{day.short}</span><span className={'dot ' + (index === today ? 'today-dot' : '')} aria-hidden="true" /></button>)}
        </div>
        <p className="week-note"><span className="legend-dot" /> Сегодня · {schedule[today].short}</p>
      </section>
      <section className="workout" aria-labelledby="workout-title" aria-live="polite">
        <div className="workout-top"><span className="badge">{isToday ? 'Сегодня' : workout.day}</span><span>{rest ? 'Восстановление' : 'По плану'}</span></div>
        <h2 id="workout-title">{workout.title}</h2>
        <p className="muscles">{workout.muscles}</p>
        <div className="card-line" />
        <p className="card-caption">{rest ? 'В расписании — время для отдыха.' : 'Один подход за другим.'}</p>
      </section>
      {!isToday && <button className="return-button" type="button" onClick={() => { setNow(new Date()); setChosenDay(null) }}>Вернуться к сегодняшнему дню</button>}
      {selected === 0 ? <PushJournal key={sundayKey(now)} date={sundayKey(now)} /> : <section className="empty">
        <div className="empty-icon" aria-hidden="true">{rest ? '☀' : '+'}</div>
        <h2>{rest ? 'Сегодня без упражнений' : 'Упражнения пока не добавлены'}</h2>
        <p>{rest ? 'Можно посмотреть программу других дней в расписании выше.' : 'Здесь появится твой комплекс: упражнения, подходы и повторения.'}</p>
      </section>}
      <footer>MY WORKOUT <span>Маленькие шаги. Регулярный ритм.</span></footer>
    </main>
  )
}



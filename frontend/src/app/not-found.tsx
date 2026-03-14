import Link from 'next/link'
import s from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <span className={s.code}>404</span>
        <h1 className={s.title}>Сторінку не знайдено</h1>
        <p className={s.message}>
          На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <Link href="/" className={s.homeLink}>
          Повернутися на головну
        </Link>
      </div>
    </div>
  )
}

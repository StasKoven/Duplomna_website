import s from './loading.module.css'

export default function Loading() {
  return (
    <div className={s.wrapper}>
      <div className={s.spinner} />
      <p className={s.text}>Завантаження...</p>
    </div>
  )
}

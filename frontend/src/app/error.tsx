'use client'

import s from './error.module.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <span className={s.icon}>!</span>
        <h1 className={s.title}>Щось пішло не так</h1>
        <p className={s.message}>
          Сталася помилка при завантаженні сторінки. Спробуйте ще раз.
        </p>
        {error.digest && (
          <p className={s.digest}>Код помилки: {error.digest}</p>
        )}
        <button onClick={reset} className={s.retryButton}>
          Спробувати знову
        </button>
      </div>
    </div>
  )
}

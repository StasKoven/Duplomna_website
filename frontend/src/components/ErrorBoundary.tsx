'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logError } from '@/lib/errorLogger'
import s from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('React Error Boundary', error, {
      componentStack: errorInfo.componentStack,
      errorInfo
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={s.wrapper}>
          <div className={s.card}>
            <h1 className={s.title}>
              Упс! Щось пішло не так
            </h1>
            <p className={s.message}>
              Сталася помилка при завантаженні сторінки. Будь ласка, спробуйте перезавантажити сторінку.
            </p>
            {this.state.error && (
              <details className={s.details}>
                <summary className={s.summary}>
                  Деталі помилки
                </summary>
                <pre className={s.errorPre}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className={s.reloadButton}
            >
              Перезавантажити сторінку
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

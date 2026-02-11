'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logError } from '@/lib/errorLogger'

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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full p-6 bg-card border rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Упс! Щось пішло не так
            </h1>
            <p className="text-muted-foreground mb-4">
              Сталася помилка при завантаженні сторінки. Будь ласка, спробуйте перезавантажити сторінку.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Деталі помилки
                </summary>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
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

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Відновлення паролю',
  description: 'Відновіть пароль до свого акаунту TechStore.',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}

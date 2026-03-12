import type { Metadata } from 'next'
import './globals.css'
import { LevaContainer } from '@/components/ui/LevaContainer'

export const metadata: Metadata = {
  title: 'Hogwarts Interactive',
  description: 'An interactive magical journey through Hogwarts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LevaContainer />
        {children}
      </body>
    </html>
  )
}

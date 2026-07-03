import type { Metadata } from 'next'
import { Pixelify_Sans, VT323 } from 'next/font/google'
import NoiseOverlay from '@/components/NoiseOverlay'
import TransitionProvider from '@/components/TransitionProvider'
import './globals.css'

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
})

const vt323 = VT323({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: "Ali's Portfolio",
  description: 'Personal portfolio — projects, experience, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pixelifySans.variable} ${vt323.variable}`}>
      <body suppressHydrationWarning>
        <NoiseOverlay />
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  )
}

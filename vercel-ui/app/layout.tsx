import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hedera Hydropower MRV - Test Verification',
  description: 'Production-ready MRV system with 237 tests passed on real Hedera network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

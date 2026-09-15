import type { Metadata } from 'next';
import { Source_Serif_4, Noto_Serif_KR } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const serifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '웹 복권 게임',
  description: '포인트로 즐기는 번호 추첨형 복권 게임',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serif.variable} ${serifKr.variable}`}>
      <body className="min-h-screen bg-paper font-serif text-ink antialiased">
        <Providers>
          <Header />
          <div className="pb-20">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

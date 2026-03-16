import type { Metadata } from 'next';
import { Providers } from './Providers';
import 'intro.js/introjs.css';
import 'intro.js/themes/introjs-modern.css';

export const metadata: Metadata = {
  title: 'Contexta',
  description: 'Configure os dados da sua empresa para treinar o assistente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

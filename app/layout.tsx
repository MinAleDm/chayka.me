import './global.css';

export const metadata = {
  title: "Александр Минькин — Fullstack разработчик",
  description: "Портфолио, блог, контакты",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}

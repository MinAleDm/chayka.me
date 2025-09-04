import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-black text-white">
        {/* Header сверху */}
        <Header />

        {/* Центр с информацией обо мне */}
        <main className="flex-grow flex items-center justify-center px-4 text-center">
          {children}
        </main>

        {/* Footer снизу */}
        <Footer />
      </body>
    </html>
  );
}

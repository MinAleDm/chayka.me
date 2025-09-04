import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-neutral-800 p-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-lg text-blue-400">
        AM.dev
      </Link>
      <nav className="flex gap-6 text-neutral-300">
        <Link href="/projects" className="hover:text-white">Проекты</Link>
        <Link href="/blog" className="hover:text-white">Блог</Link>
      </nav>
    </header>
  );
}

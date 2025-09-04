import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between border-b border-gray-700">
      <Link href="/" className="text-2xl font-bold text-white">MyLogo</Link>
      <nav>
        <ul className="flex space-x-8">
          <li><Link href="#about" className="text-gray-300 hover:text-white">Обо мне</Link></li>
          <li><Link href="#projects" className="text-gray-300 hover:text-white">Проекты</Link></li>
          <li><Link href="#blog" className="text-gray-300 hover:text-white">Блог</Link></li>
          <li><Link href="#contact" className="text-gray-300 hover:text-white">Контакты</Link></li>
        </ul>
      </nav>
    </header>
  );
}

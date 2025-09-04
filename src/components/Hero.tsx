import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-5xl font-bold mb-4">Александр Минькин</h1>
      <p className="text-xl text-blue-300 mb-6">
        Fullstack разработчик / Студент МИРЭА / JS, React, Vue, Angular
      </p>
      <p className="mb-6 text-neutral-300">
        Занимаюсь веб-разработкой, изучаю современные фреймворки и технологии. 
        Имею опыт во фронтенде и бэкенде: REST API, базы данных, SQL, Git.
      </p>
      <div className="flex flex-wrap gap-4 mb-10">
        <Link href="/projects">
          <Button variant="outline">Проекты</Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline">Блог</Button>
        </Link>
        <a href="https://github.com/yachayka" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost">GitHub</Button>
        </a>
        <a href="https://t.me/MinAleDm" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost">Telegram</Button>
        </a>
      </div>
    </section>
  );
}

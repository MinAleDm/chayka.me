import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-start gap-8">
      {/* Имя */}
      <h1 className="text-6xl font-extrabold text-white leading-tight">
        Александр Минькин
      </h1>

      {/* Краткое описание */}
      <p className="text-2xl text-blue-400 max-w-xl">
        Hey! I’m Alexander Min, a fullstack developer and enthusiast in modern web technologies.
      </p>

      {/* Работа и проекты */}
      <div className="space-y-1 text-neutral-400 max-w-xl">
        <p><span className="font-semibold text-white">Working at:</span> NuxtLabs / Vercel</p>
        <p><span className="font-semibold text-white">Creator of:</span> Vitest, Slidev, VueUse, UnoCSS, Elk, Type Challenges</p>
        <p><span className="font-semibold text-white">Core team of:</span> Vue, Nuxt, Vite</p>
        <p><span className="font-semibold text-white">Maintaining:</span> Shiki, Twoslash, ESLint Stylistic</p>
      </div>

      {/* Описание страсти */}
      <p className="text-neutral-400 max-w-xl leading-relaxed">
        Dreaming up cool ideas and making them come true is where my passion lies.
        I build tools that help myself and others be more productive and enjoy crafting.
        You can find my full projects list here.
      </p>

      {/* Блок ссылок */}
      <div className="flex flex-wrap gap-4 mt-6">
        <Link href="/projects"><Button variant="outline">Проекты</Button></Link>
        <Link href="/blog"><Button variant="outline">Блог</Button></Link>
        <a href="https://github.com/yachayka" target="_blank" rel="noopener noreferrer"><Button variant="ghost">GitHub</Button></a>
        <a href="https://t.me/MinAleDm" target="_blank" rel="noopener noreferrer"><Button variant="ghost">Telegram</Button></a>
      </div>

      {/* Контакт */}
      <p className="text-neutral-500 mt-12 text-sm">
        Or mail me at <a href="mailto:hi@alexmin.me" className="text-blue-400 underline">hi@alexmin.me</a>
      </p>
    </section>
  );
}

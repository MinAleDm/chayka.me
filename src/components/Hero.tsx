import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-4xl mx-auto py-28 px-6 flex flex-col items-start gap-10">
      <h1 className="text-7xl font-extrabold text-white leading-tight tracking-tight">
        Александр Минькин
      </h1>

      <p className="text-3xl text-blue-400 max-w-xl leading-relaxed font-light">
        Hey! I’m Alexander Min, a fullstack developer and enthusiast in modern web technologies.
      </p>

      <div className="max-w-xl space-y-1 text-neutral-400 text-lg leading-snug">
        <p><span className="font-semibold text-white">Working at:</span> NuxtLabs / Vercel</p>
        <p><span className="font-semibold text-white">Creator of:</span> Vitest, Slidev, VueUse, UnoCSS, Elk, Type Challenges</p>
        <p><span className="font-semibold text-white">Core team of:</span> Vue, Nuxt, Vite</p>
        <p><span className="font-semibold text-white">Maintaining:</span> Shiki, Twoslash, ESLint Stylistic</p>
      </div>

      <p className="max-w-xl text-neutral-300 text-lg leading-relaxed">
        Dreaming up cool ideas and making them come true is where my passion lies.
        I build tools that help myself and others be more productive and enjoy crafting.
        You can find my full projects list here.
      </p>

      <div className="flex flex-wrap gap-5 mt-6">
        <Link href="/projects"><Button variant="outline" className="px-8 py-3 font-semibold">Проекты</Button></Link>
        <Link href="/blog"><Button variant="outline" className="px-8 py-3 font-semibold">Блог</Button></Link>
        <a href="https://github.com/yachayka" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="px-8 py-3 font-semibold">GitHub</Button>
        </a>
        <a href="https://t.me/MinAleDm" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="px-8 py-3 font-semibold">Telegram</Button>
        </a>
      </div>

      <p className="text-neutral-500 mt-12 text-sm">
        Or mail me at <a href="mailto:hi@alexmin.me" className="text-blue-400 underline">hi@alexmin.me</a>
      </p>
    </section>
  );
}

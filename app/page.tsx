import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import './global.css';

export const metadata: Metadata = {
  title: "Александр Минькин — Fullstack разработчик - ",
  description: "Персональный сайт: проекты, блог, резюме и контакты."
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4"> Александр Минькин
        </h1>
        <p className="text-lg text-blue-300 mb-6">
          Fullstack разработчик / Студент МИРЭА / JS, React, Vue, Angular
        </p>

        <p className="mb-6 text-neutral-300">
          Я студент МИРЭА по направлению «Программная инженерия», сосредоточен на веб-разработке. Развиваю навыки в JavaScript, React, Angular, Vue.js, а также изучаю современные фреймворки. Имею опыт как во фронтенде, так и в бэкенде: RESTful API, базы данных, Git, SQL.
        </p>

        <p className="mb-6 text-neutral-300">
          Хочу работать в сильной команде, продолжать развиваться как Fullstack-разработчик и участвовать в интересных проектах.
        </p>

        <div className="flex flex-wrap gap-4 mb-10">
          <Link href="/projects">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900">
              Проекты
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900">
              Блог
            </Button>
          </Link>
          <a href="https://github.com/yachayka" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="text-neutral-400 hover:text-white">
              GitHub
            </Button>
          </a>
          <a href="https://t.me/MinAleDm" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="text-neutral-400 hover:text-white">
              Telegram
            </Button>
          </a>
        </div>

        <Card className="bg-blue-950 text-white border border-blue-900">
          <CardContent className="p-4">
            <p className="text-sm">
              Целеустремлённый, быстро обучаюсь, люблю командную работу и готов осваивать новые подходы. Стремлюсь применять теоретические знания в реальных задачах.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

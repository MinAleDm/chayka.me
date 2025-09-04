export default function HomePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-3xl font-semibold">Обо мне</h2>
      <p className="text-gray-300">
        Я веб-разработчик с опытом в Next.js и Tailwind CSS. Люблю создавать
        минималистичные и красивые интерфейсы.
      </p>
      <button className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
        Связаться со мной
      </button>
    </div>
  );
}

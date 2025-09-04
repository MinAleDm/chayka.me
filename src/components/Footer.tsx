export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-800 p-4 text-center text-neutral-400 text-sm">
      © {new Date().getFullYear()} Александр Минькин. Все права защищены.
    </footer>
  );
}

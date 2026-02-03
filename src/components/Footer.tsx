export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#373737] bg-[#191919]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[#9b9a97]">
          © {currentYear} Curriculum
        </p>
      </div>
    </footer>
  );
}

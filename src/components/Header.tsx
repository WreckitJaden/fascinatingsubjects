import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-[#373737] bg-[#191919]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0">
            <Image
              src="/curriculumlogo.svg"
              alt="Curriculum logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}

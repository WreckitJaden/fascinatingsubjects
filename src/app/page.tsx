export default function Home() {
  const subjects = [
    { id: 1, name: "Physics" },
    { id: 2, name: "The Brain" },
    { id: 3, name: "Cells" },
    { id: 4, name: "Mathematics" },
    { id: 5, name: "AI Mechanics" },
    { id: 6, name: "Commercial Markets" },
    { id: 7, name: "Infrastructure Megaprojects" },
    { id: 8, name: "Psychology" },
    { id: 9, name: "Language & Semantics" },
    { id: 10, name: "History of Society" },
    { id: 11, name: "Impactful Companies" },
    { id: 12, name: "Chemistry" },
  ];

  return (
    <div className="bg-[#191919]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <p className="text-base text-[#9b9a97] sm:text-lg">
            A personal curriculum of subjects to study
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group relative flex min-h-[120px] items-center justify-center rounded-lg border border-[#373737] bg-[#1f1f1f] p-6 transition-all duration-200 hover:border-[#4a4a4a] hover:bg-[#252525]"
            >
              <h3 className="text-center text-base font-medium text-[#ededed] sm:text-lg">
                {subject.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

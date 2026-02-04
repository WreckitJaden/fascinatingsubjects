import Link from "next/link";
import { subjects } from "@/lib/subjects";

export default function Home() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <nav>
          <ul className="space-y-1">
            {subjects.map((subject) => (
              <li key={subject.id}>
                <Link
                  href={`/subjects/${subject.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {subject.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

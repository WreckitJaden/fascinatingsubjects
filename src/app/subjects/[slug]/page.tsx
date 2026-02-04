import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectBySlug } from "@/lib/subjects";
import { getResourcesForSubject } from "@/lib/resources";
import AddResourceForm from "@/components/AddResourceForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const resources = await getResourcesForSubject(subject.id);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block cursor-pointer"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-normal text-black mt-4">{subject.name}</h1>
        </div>

        <div className="mb-8">
          <AddResourceForm subjectId={subject.id} />
        </div>

        <div>
          {resources.length === 0 ? (
            <p className="text-gray-600">No resources yet.</p>
          ) : (
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {resource.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

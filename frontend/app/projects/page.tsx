import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { ProjectProps } from '@/types/project';

const projects: ProjectProps[] = [
  {
    ProjectId: 0,
    ProjectName: "JEBINCUBATORRR1",
    ProjectDescription: "This is jebincubartor1",
    ProjectFounders: ["Noa", "Alban"],
    ProjectContacts: ["Noa"],
    ProjectLink: "https://api.jeb-incubator.com/docs#/",
    ProjectNeeds: ["Informatique", "testing"],
    ProjectProgess: ["Socket.io", "NextJS"]
  },
  {
    ProjectId: 1,
    ProjectName: "JEBINCUBATORRR2",
    ProjectDescription: "This is jebincubartor2",
    ProjectFounders: ["Eliott"],
    ProjectContacts: ["Eliott"],
    ProjectLink: "https://api.jeb-incubator.com/docs#/",
    ProjectNeeds: ["Informatique", "testing"],
    ProjectProgess: ["Socket.io", "NextJS"]
  },
  {
    ProjectId: 3,
    ProjectName: "JEBINCUBATORRR3",
    ProjectDescription: "This is jebincubartor3",
    ProjectFounders: ["PA"],
    ProjectContacts: ["PA"],
    ProjectLink: "https://api.jeb-incubator.com/docs#/",
    ProjectNeeds: ["Informatique", "testing"],
    ProjectProgess: ["Socket.io", "NextJS"]
  },
  {
    ProjectId: 4,
    ProjectName: "JEBINCUBATORRR4",
    ProjectDescription: "This is jebincubartor4",
    ProjectFounders: ["Alban"],
    ProjectContacts: ["Alban", "Eliott"],
    ProjectLink: "https://api.jeb-incubator.com/docs#/",
    ProjectNeeds: ["Informatique", "testing"],
    ProjectProgess: ["Socket.io", "NextJS"]
  },
  {
    ProjectId: 4,
    ProjectName: "JEBINCUBATORRR4",
    ProjectDescription: "This is jebincubartor4",
    ProjectFounders: ["Alban"],
    ProjectContacts: ["Alban"],
    ProjectLink: "https://api.jeb-incubator.com/docs#/",
    ProjectNeeds: ["Informatique", "testing"],
    ProjectProgess: ["Socket.io", "NextJS"]
  },
  {
    ProjectId: 4,
    ProjectName: "JEBINCUBATORRR4",
    ProjectDescription: "This is jebincubartor4",
    ProjectFounders: ["Alban"],
    ProjectContacts: ["Alban"],
    ProjectLink: "https://api.jeb-incubator.com/docs#/",
    ProjectNeeds: ["Informatique", "testing"],
    ProjectProgess: ["Socket.io", "NextJS"]
  },

];

export default function Projects() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-[90rem] mx-auto py-6 sm:px-6">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center md:text-start">Projects</h1>
          <div className='grid lg:grid-cols-4 md:grid-cols-2 gap-6 p-2'>
            {projects.map(project => (
              <ProjectCard
                key={project.ProjectId}
                ProjectName={project.ProjectName}
                ProjectDescription={project.ProjectDescription}
                ProjectContacts={project.ProjectContacts}
                ProjectFounders={project.ProjectFounders}
                ProjectNeeds={project.ProjectNeeds}
                ProjectProgess={project.ProjectProgess}
                ProjectLink={project.ProjectLink}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

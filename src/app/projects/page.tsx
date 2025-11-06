import fs from 'fs'
import path from 'path'
import './style.css'

interface Project {
  title: string;
  description: string;
}

const ProjectsPage = () => {
  const projectsFilePath = path.join(process.cwd(), 'data/projects.json')
  const projectsFileContent = fs.readFileSync(projectsFilePath, 'utf8')
  const projects: Project[] = JSON.parse(projectsFileContent);

  return (
    <main>
      <section id="projects">
        {projects.map((project, index) => (
          <div className="project-card" key={index}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

export default ProjectsPage;

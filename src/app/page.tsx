import fs from 'fs'
import path from 'path'

const Home = () => {
  const projectsFilePath = path.join(process.cwd(), 'projects.txt')
  const projectsFileContent = fs.readFileSync(projectsFilePath, 'utf8')
  const projects = projectsFileContent.split('\n\n').map(project => {
    const [title, ...description] = project.split('\n');
    return { title, description: description.join('\n') };
  });

  return (
    <main>
      <h1>Project Showcase</h1>
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

export default Home

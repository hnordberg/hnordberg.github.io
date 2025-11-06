import fs from 'fs'
import path from 'path'
import './style.css'

interface Technology {
  title: string;
  description: string;
}

const TechnologyPage = () => {
  const techFilePath = path.join(process.cwd(), 'data/technology.json')
  const techFileContent = fs.readFileSync(techFilePath, 'utf8')
  const tech: Technology[] = JSON.parse(techFileContent);

  return (
    <main>
      <section id="technology">
        {tech.map((tech, index) => (
          <div className="tech-card" key={index}>
            <h2>{tech.title}</h2>
            <p>{tech.description}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

export default TechnologyPage;

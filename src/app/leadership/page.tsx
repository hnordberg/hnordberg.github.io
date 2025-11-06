import fs from 'fs'
import path from 'path'
import './style.css'

interface Leadership {
  title: string;
  description: string;
}

const LeadershipPage = () => {
  const leadershipFilePath = path.join(process.cwd(), 'data/leadership.json')
  const leadershipFileContent = fs.readFileSync(leadershipFilePath, 'utf8')
  const leadership: Leadership[] = JSON.parse(leadershipFileContent);

  return (
    <main>
      <section id="leadership">
        {leadership.map((leadership, index) => (
          <div className="leadership-card" key={index}>
            <h2>{leadership.title}</h2>
            <p>{leadership.description}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

export default LeadershipPage;

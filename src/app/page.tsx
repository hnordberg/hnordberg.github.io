import fs from 'fs'
import path from 'path'
import Timeline from './components/Timeline';

const Home = () => {
  const timelinePath = path.join(process.cwd(), 'data/timeline.json')
  const timelineContent = fs.readFileSync(timelinePath, 'utf8')
  const timeline = JSON.parse(timelineContent)

  return (
    <main>
      <p className='text-box mx-auto'>Henrik Nordberg is a Principal Engineer and technology leader with 20+ years 
        of experience architecting high-performance
        data platforms and leading engineering teams in healthcare, genomics, and cloud integration. Proven 
        success in building scalable, secure systems, modernizing DevOps pipelines, and mentoring engineers.
        Hands-on expertise in JavaScript, C++, Java, and large-scale data infrastructure.</p>

      <Timeline items={timeline} />
    </main>
  )
}

export default Home
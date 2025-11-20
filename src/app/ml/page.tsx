import fs from 'fs'
import path from 'path'
import Timeline from '../components/Timeline';

const MLTimelinePage = () => {
    const timelinePath = path.join(process.cwd(), 'data/mltimeline.json')
    const timelineContent = fs.readFileSync(timelinePath, 'utf8')
    const timeline = JSON.parse(timelineContent)

    return (
        <main>
            <div className="text-center pt-8 pb-4">
                <h1 className="text-4xl font-bold">History of Machine Learning & LLMs</h1>
            </div>
            <Timeline items={timeline} />
        </main>
    )
}

export default MLTimelinePage

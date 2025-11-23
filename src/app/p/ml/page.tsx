import fs from 'fs'
import path from 'path'
import Timeline from '../../components/Timeline';

const MLTimelinePage = () => {
    const timelinePath = path.join(process.cwd(), 'data/llm_breakthroughs.json')
    const timelineContent = fs.readFileSync(timelinePath, 'utf8')
    const timeline = JSON.parse(timelineContent)

    return (
        <main>
            <div className="text-center pt-8 pb-4">
                <h1 className="text-4xl font-bold">History of Machine Learning & LLMs</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Disclaimer: I used various LLMs to generate the data for this timeline.
                </p>
            </div>
            <Timeline items={timeline} />
        </main>
    )
}

export default MLTimelinePage

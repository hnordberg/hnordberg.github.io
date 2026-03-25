import fs from 'fs'
import path from 'path'
import Timeline from '../../../components/Timeline'

type InterestingEntry = {
  id: string
  period: string
  title: string
  description: string
  authors?: string[]
  org?: string
  location?: string
  paperTitle?: string
  repo?: string
  details?: string
  icon?: string
  citations?: number
  controversialness?: number
  controversialReason?: string
  [key: string]: unknown
}

const InterestingPapersPage = () => {
  const dataPath = path.join(process.cwd(), 'data/interesting_papers.json')
  const raw = fs.readFileSync(dataPath, 'utf8')
  const papers = JSON.parse(raw) as InterestingEntry[]

  return (
    <main>
      <div className="text-center pt-8 pb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <a href="/ml/papers" className="text-sky-600 dark:text-sky-400 hover:underline">
            Papers
          </a>
        </p>
        <h1 className="text-4xl font-bold">Interesting Papers</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Papers I find notable, opinionated curation — not a comprehensive survey.
        </p>
      </div>
      <Timeline items={papers} />
    </main>
  )
}

export default InterestingPapersPage

import fs from 'fs'
import path from 'path'
import Timeline from '../../components/Timeline'

type TimelineEntry = {
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
  impactScore?: number
  [key: string]: unknown
}

const DEFAULT_IMPACT_CUTOFF = 45

const IMPACT_PENALTIES: Record<string, number> = {
  Luong_Attention: 31,
  MoE_Test_Time: 15,
  Layer_Dropping: 4,
  CTM: 4,
}

const computeImpactScore = (
  entry: TimelineEntry,
  rankById: Map<string, number>,
  totalEntries: number,
) => {
  const rank = rankById.get(entry.id) ?? 0
  const normalizedRank = totalEntries <= 1 ? 1 : rank / (totalEntries - 1)
  const baseScore = 35 + normalizedRank * 65

  const pubYear = Number.parseInt(entry.period, 10)
  const age = Number.isNaN(pubYear) ? 10 : new Date().getFullYear() - pubYear
  const recencyBonus = Math.max(0, 6 - age)
  const penalty = IMPACT_PENALTIES[entry.id] ?? 0

  return Math.max(1, Math.min(100, Math.round(baseScore + recencyBonus - penalty)))
}

const LLMPapersPage = () => {
  const timelinePath = path.join(process.cwd(), 'data/llm_breakthroughs.json')
  const timelineContent = fs.readFileSync(timelinePath, 'utf8')
  const timeline = JSON.parse(timelineContent) as TimelineEntry[]

  const rankedByCitations = [...timeline]
    .sort((a, b) => (a.citations ?? 0) - (b.citations ?? 0))
    .map((entry, index) => [entry.id, index] as const)
  const rankById = new Map(rankedByCitations)

  const timelineWithImpact = timeline.map((entry) => ({
    ...entry,
    impactScore: computeImpactScore(entry, rankById, timeline.length),
  }))

  return (
    <main>
      <div className="text-center pt-8 pb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          <a href="/ml/papers" className="text-sky-600 dark:text-sky-400 hover:underline">
            Papers
          </a>
        </p>
        <h1 className="text-4xl font-bold">History of Machine Learning & LLMs</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Disclaimer: I used various LLMs to generate some of the data for this timeline.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Impact score is a citation-driven editorial score. It uses relative citation rank, adds a
          small recency bonus, and the default cutoff hides a few more provisional entries.
        </p>
      </div>
      <Timeline
        items={timelineWithImpact}
        filterBy="impactScore"
        filterLabel="Impact score"
        defaultFilterCutoff={DEFAULT_IMPACT_CUTOFF}
      />
    </main>
  )
}

export default LLMPapersPage

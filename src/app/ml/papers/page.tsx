import Link from 'next/link'

const PapersLandingPage = () => {
  return (
    <main className="page-with-contents">
      <section className="card-grid max-w-3xl mx-auto px-4 py-8">
        <div className="card">
          <div className="card-title">Papers</div>
          <div className="card-text space-y-4">
            <p>Collections of paper notes and timelines.</p>
            <p>
              <Link href="/ml/papers/llm" className="text-sky-600 dark:text-sky-400 hover:underline">
                History of Machine Learning & LLMs
              </Link>
              <span className="text-gray-600 dark:text-gray-400"> — citation-ranked timeline with impact filter.</span>
            </p>
            <p>
              <Link
                href="/ml/papers/interesting"
                className="text-sky-600 dark:text-sky-400 hover:underline"
              >
                Interesting papers
              </Link>
              <span className="text-gray-600 dark:text-gray-400"> — curated highlights.</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default PapersLandingPage

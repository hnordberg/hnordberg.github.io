import Link from 'next/link';
import Contents from '../components/Contents'

const MLPage = () => {
  const articles = [
    { id: 'wiki', title: 'ML Wiki' },
    { id: 'llm', title: 'LLM Papers' },
    { id: 'interesting', title: 'Interesting Papers' },
    { id: 'transformer', title: 'Transformer' },
    //{ id: 'theory', title: 'Theory' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <section className="card-grid">
        <div className="card" id="wiki">
          <div className="card-title">ML Wiki</div>
          <div className="card-text space-y-4">
            <p>
              Theory-first mini-wiki with topics, tags, equations, figures, and
              learning paths (see the wiki home for how it ties to your study deck).
            </p>
            <p>
              <a href="/ml/wiki">Open the wiki →</a>
            </p>
          </div>
        </div>
      <div className="card">
          <div className="card-title">LLM Papers</div>
          <div className="card-text space-y-4">
            <p>
              <Link href="/ml/llm" className="text-sky-600 dark:text-sky-400 hover:underline">
                History of Machine Learning & LLMs
              </Link>
              <span className="text-gray-600 dark:text-gray-400"> — citation-ranked timeline with impact filter.</span>
            </p>
          </div>
        </div>
      <div className="card">
          <div className="card-title">Interesting Papers</div>
          <div className="card-text space-y-4">
            <p>
              <Link
                href="/ml/interesting"
                className="text-sky-600 dark:text-sky-400 hover:underline"
              >
                Interesting papers
              </Link>
              <span className="text-gray-600 dark:text-gray-400"> — curated highlights.</span>
            </p>
          </div>
        </div>
        <div className="card" id="transformer">
          <div className="card-title">Transformer</div>
          <div className="card-text">
            <p>Overview of the Transformer architecture: parallel compute, attention, masking, and more.</p>
            <p><a href="/ml/transformer">Read more →</a></p>
          </div>
        </div>
        <div className="card hidden" id="theory">
          <div className="card-title">Theory</div>
          <div className="card-text">
            <p>Mathematical foundations and theory behind machine learning.</p>
            <p><a href="/ml/theory">Read more →</a></p>
          </div>
        </div>
        <div className="card hidden">
          <div className="card-title">.</div>
          <div className="card-text">.</div>
          <div className="card-text">.</div>
          <div className="card-subtitle pt-4">.</div>
        </div>
      </section>
    </main>
  )
}

export default MLPage;

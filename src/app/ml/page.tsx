import Contents from '../components/Contents'

const MLPage = () => {
  const articles = [
    { id: 'papers', title: 'Papers' },
    { id: 'transformer', title: 'Transformer' }
    //{ id: 'theory', title: 'Theory' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <section className="card-grid">
        <div className="card" id="papers">
          <div className="card-title">Papers</div>
          <div className="card-text">
            <p>
              <a href="/ml/papers">Papers</a> — LLM timeline, interesting papers, and more.
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

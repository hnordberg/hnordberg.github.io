import Contents from '../components/Contents'

const TechnologyPage = () => {
  const articles = [
    { id: 'hard-problem-llms', title: 'The hard problem of LLMs' },
    { id: 'debugging', title: 'The art of debugging' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <section className="card-grid">
        <div className="card" id="hard-problem-llms">
        <div className="card-text"><i>Note: these are some musings on similarities LLMs and human thought</i></div>
          <div className="card-title">The hard problem of LLMs</div>
          <div className="card-text">The title is a play on the hard problem of consciousness and how LLMs may approach being conscious.
            The problem is stated something like how do the material processes of the brain give rise to human consciousness. This is
            one of my favorite problems in philosophy and now is the first time I have seen something of a possible answer to it.
            Let me explain.
          </div>
          <div className="card-subtitle pt-4">Embeddings and understanding</div>
          <div className="card-text">The weights of an LLM can be seen as representing concepts. They are embeddings into a multi-dimensional
            space. People found that subtracting the embedding vector for woman from the one for queen gives us a vector close to the one we
            would get if we subtract v(man) from v(king) [<a href="https://arxiv.org/pdf/1301.3781">1</a>]. This seems to indicate that
            there is space of concepts that we can index into. Calling this <i>understand</i> may be a bit premature, but let's continue.
          </div>
          <div className="card-subtitle pt-4">Platonic representation</div>
          <div className="card-text">You might wonder if the embeddings of one model are the same as another. No, they're probably not.
            But there does seem to be a relationship still. Perhaps the relationships of the vectors in one model's embedding space, are
            similar to the ones in a different model's embedding space? Yes, this seems more likely. The idea is called the Platonic 
            Representation Hypothesis [<a href="https://arxiv.org/pdf/2405.07987">2</a>].
          </div>
          <div className="card-subtitle pt-4">Are you thinking what I'm thinking?</div>
          <div className="card-text">Could we transform the embeddings from one model to another? Yes, it looks like we 
            can. <a href="https://arxiv.org/pdf/2505.12540">Jha et al. (2025)</a> introduced the first method for translating 
            text embeddings from one vector space to another without any paired data, encoders, or predefined matches. While 
            this has security implications, it could also lead to innovations. What if we used the vector spaces from multiple
            models and try to derive a more complete space, or one with more accurate vectors (such that they better represent
            platonic semantic meanings)?
          </div>
          <div className="card-subtitle pt-4">Is word generation thinking?</div>
          <div className="card-text">To answer that question we should define what thinking is. Google Gemini said it's 
            "Thinking is the mental process of manipulating information to form concepts, solve problems, make decisions, and understand the world.";
            Grok said "cognitive process of using one's mind to consider, reason about, or manipulate ideas..."; Others give
            similar definitions, but they seem a tad circular to me. "mental process of manipulating ideas" and "using one's mind to consider" are
            about the same to me, but don't get to the underlying mechanism. I like the idea of a <i>train of thought</i> better. 
            Thinking is generating words in your mind, based on the words you thought last. The thing is there are multiple ways
            of thinking. The definition I just gave applies to when we are chatting with someone, or writing something like this paragraph.
            If someone asks us to do arithmetic, then we may be using a different part of the brain and the definition of
            thinking changes somewhat. But generating words (or concepts) based on previous words, is what LLMs do, so are they thinking?
            Yes, according to our definition, they are. But that doesn't mean they are conscious.
          </div>
          <div className="card-subtitle pt-4">Are we there yet?</div>
          <div className="card-text">If defining thinking is hard, defining consciousness is even harder. That said, LLMs are
            not conscious in the way we are, yet. They would need to have a continuous, though not infinite, context. They
            would need to selectively forget things, and be able to update their weights as they generate new information. But
            maybe we are more machine like than we thought.
          </div>
        </div>

          <div className="card" id="debugging">
            <div className="card-title">The art of debugging</div>
            <div className="card-text">Debugging is a skill you hone over the years.
              With time you will start to recognize problems and their solutions. 
              But there are some principles that you can keep in mind, especially when you get
              stuck on a difficult bug.
              <ul className="list">
                <li>Verify your assumptions</li>
                <li>Verify your inputs</li>
                <li>Break down the problem</li>
                <li>Keep track of your progress</li>
                <li>Explain the problem to someone</li>
                <li>Don't give up</li>
              </ul>
              You may assume a function returns a certain kind of value -- verify that it does.<br />
              You may assume the input is always in a certain range or of a certain type -- verify that it is.<br />
              You may assume a library or class does what it says on the tin -- verify that it does.<br />
              For really tricky bugs it's helpful to write down the assumptions, the inputs, other system state,
              and to write down a plan of attack. 
            </div>
          </div>
        
          <div className="card hidden">
            <div className="card-title">.</div>
            <div className="card-text">.
            </div>
            <div className="card-text">.
            </div>
            <div className="card-subtitle pt-4">.</div>
          </div>

      </section>
    </main>
  )
}

export default TechnologyPage;

import Contents from '../components/Contents'

const TechnologyPage = () => {
  const articles = [
    { id: 'hard-problem-llms', title: 'The Hard Problem of LLMs' },
    { id: 'debugging', title: 'The Art of Debugging' },
    { id: 'security', title: 'Software Security' },
    { id: 'test-automation', title: 'Test Automation' },
    { id: 'software-development-lifecycle', title: 'Software Development Lifecycle' },
    { id: 'this-website', title: 'This Website' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <section className="card-grid">
        <div className="card" id="hard-problem-llms">
        <div className="card-text"><i>Note: these are some musings on similarities between LLMs and human thought</i></div>
          <div className="card-title">The Hard Problem of LLMs</div>
          <div className="card-text">The title is a play on the hard problem of consciousness and how LLMs may approach being conscious.
            The problem is stated something like how do the material processes of the brain give rise to human consciousness. This is
            one of my favorite problems in philosophy and now is the first time I have seen something of a possible answer to it.
            Let me explain.
          </div>
          <div className="card-subtitle pt-4">Embeddings and understanding</div>
          <div className="card-text">The weights of an LLM can be seen as representing concepts. They are embeddings into a multi-dimensional
            space. People found that subtracting the embedding vector for woman from the one for queen gives us a vector close to the one we
            would get if we subtract v(man) from v(king) [<a href="https://arxiv.org/pdf/1301.3781">1</a>]. This seems to indicate that
            there is a space of concepts that we can index into. Calling this <i>understand</i> may be a bit premature, but let's continue.
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
            Platonic semantic meanings)?
          </div>
          <div className="card-subtitle pt-4">Is word generation thinking?</div>
          <div className="card-text">To answer that question we should define what thinking is. Google Gemini said it's 
            "Thinking is the mental process of manipulating information to form concepts, solve problems, make decisions, and understand the world.";
            Grok said: "cognitive process of using one's mind to consider, reason about, or manipulate ideas..."; Others give
            similar definitions, but they seem a tad circular to me. "mental process of manipulating ideas" and "using one's mind to consider" are
            about the same to me, but don't get to the underlying mechanism. I like the idea of a <i>train of thought</i> better. 
            Thinking is generating words in your mind, based on the words you thought last. The thing is, there are multiple ways
            of thinking. The definition I just gave applies to when we are chatting with someone, or writing something like this paragraph.
            If someone asks us to do arithmetic, then we may be using a different part of the brain and the definition of
            thinking changes somewhat. But generating words (or concepts) based on previous words, is what LLMs do, so are they thinking?
            Yes, according to our definition, they are. But that doesn't mean they are conscious.
          </div>
          <div className="card-subtitle pt-4">Are we there yet?</div>
          <div className="card-text">If defining thinking is hard, defining consciousness is even harder. That said, LLMs are
            not conscious in the way we are, yet. They would need to have a continuous, though not infinite, context. They
            would need to selectively forget things, and be able to update their weights as they generate new information. But
            maybe we are more machine-like than we thought.
          </div>
        </div>

          <div className="card" id="debugging">
            <div className="card-title">The Art of Debugging</div>
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

          <div className="card" id="test-automation">
            <div className="card-title">Test Automation</div>
            <div className="card-text">
              When done right, test automation can save you a lot of time. Test automation is a big topic,
              and here I'll just cover some observations and tips that I found useful. 
              <ul className="list">
                <li>Write the tests early in the development process. That way you make use of the investment longer.</li>
                <li>Run the tests on a schedule.</li>
                <li>Review the test results frequently. Ideally you set alerts for when tests fail.</li>
                <li>Make the test results part of your metrics.</li>
              </ul>
            </div>
            <div className="card-subtitle pt-4">What tools to use?</div>
            <div className="card-text">
              It depends on what the system under test is. For a web application, I would highly recommend
              Microsoft Playwright. It supports difficult use cases such as iframes and shadow DOM.
              At Optum we built a system where the user would launch tests from ALM (formerly HP ALM, now
              managed by Opentext) by clicking a toolbar button. We hooked up a script to the button that
              would invoke GitHub Actions workflow to run the Playwright tests. Playwright lets you take screenshots
              and record videos of the test runs. If a test failed, we would create a defect in ALM and
              attach screenshots and videos to it. We also emailed them to the user. These tests were for
              the Epic EMR (which now has a web version).
            </div>
          </div>

          <div className="card" id="security">
            <div className="card-title">Software Security</div>
            <div className="card-text">This section is about the steps you need to take as a software engineer
              to ensure that the products you make are secure. If your team is just starting to implement secure coding
              practices, then this is what you should do.
              <ul className="list">
                <li>Scan your code for secrets</li>
                <li>Scan your dependencies for vulnerabilities</li>
                <li>Scan your code for vulnerabilities</li>
              </ul>
              If you use a platform like GitHub, then you will have all three available right away. Scanning your code for
              vulnerabilities might have an extra cost. When you are starting out, you may have a lot of vulnerabilities to triage. 
              Use the CVSS score to prioritize them. Then establish a policy for handling them. It may look like this in terms of CVSS scores:
              <ul className="list">
                <li>&ge; 9 is a critical; fix immediately / best effort</li>
                <li>7 - 8.9 is a high; fix within 7 days</li>
                <li>4 - 6.9 is a medium</li>
                <li>&le; 3.9 is a low</li>
              </ul>
              You can address medium and low vulnerabilities when you are fixing high and critical vulnerabilities. This
              is an example of a policy, and depending on your exposure, you may need to adjust it.
            </div>
            <div className="card-subtitle pt-4">Scan your code for secrets</div>
            <div className="card-text">The reason I put this first is that the impact of failing this is high. You or
              your developers may have committed proof of concept code with secrets in it. Or you may even have config
              files with secrets in them, directly in the repository. If you find secrets, you should invalidate them.
              If you have config files in your repo, you should switch to, ideally, using a vault. You can also use environment
              variables to store secrets, but this is not as secure.
            </div>
            <div className="card-subtitle pt-4">Scan your dependencies for vulnerabilities</div>
            <div className="card-text">SCA -- Software Composition Analysis -- is the process of analyzing the dependencies of your code.
              It will use your package manager to list the dependencies and then scan them for vulnerabilities. It then continues to 
              for vulnerabilities recursively. For example, if you use <div className="code">npm</div> SCA will 
              use <div className="code">package.json</div> and <div className="code">package-lock.json</div> 
              to list the dependencies. 
              <div className="block-quote">
                By the way, you should commit the <div className="code">package-lock.json</div> file
                to your repository. You should also use specific versions of the dependencies, not just ranges.
              </div>
              To fix the vulnerability,
              run <div className="code">npm ls &lt;package-name&gt;</div> to see where in the tree the package is used. If it is a
              direct dependency, you can just update the version but if it is a transitive dependency, you may need to add an entry
              in the <div className="code">overrides</div> section of the <div className="code">package.json</div> file.
            </div>
            <div className="card-subtitle pt-4">Scan your code for vulnerabilities</div>
            <div className="card-text">SAST -- Static Application Security Testing -- is the process of analyzing your code
              for vulnerabilities the authors of the code added. If you use a platform like GitHub, then you will have this
              available right away. Scanning your code for vulnerabilities might have an extra cost. This is straightforward to 
              handle. Your scanner will explain the vulnerability and how to fix it.
            </div>
          </div>

          <div className="card" id="software-development-lifecycle">
            <div className="card-title">Software Development Lifecycle</div>
            <div className="card-text">Here is a typical software development lifecycle:
              <ol>
                <li>What task to work on
                  <ol>
                    <li>Projects</li>
                    <li>Maintenance
                      <ol>
                        <li>Security fix</li>
                        <li>Bug fix</li>
                      </ol>
                    </li>
                  </ol>
                </li>
                <li>Source Control
                  <ol>
                    <li>Create a new branch in the repo</li>
                    <li>Add Branch: &lt;branch&gt; to the card on the board you are working on</li>
                    <li>Branch names should be snakecase (e.g., my-branch).</li>
                  </ol>
                </li>
                <li>Write code
                  <ol>
                    <li>Write the feature / fix the bug</li>
                    <li>Add unit tests if new feature</li>
                    <li>Add test automation that covers the new feature or that would have caught the bug</li>
                    <li>If you need to add libraries:
                      <ol>
                        <li>Discuss with the senior developers</li>
                        <li>Commit your code to a branch and check SCA and SAST for vulnerabilities</li>
                      </ol>
                    </li>
                  </ol>
                </li>
                <li>Use of AI agents for coding is encouraged. The same controls apply to generated code as to normal code. All code must be secure, maintainable, etc. You MUST understand the code you commit. This includes security fixes, complicated regex, and other code that an agent may be used for. Generated code must match our conventions. Pay specific attention to comments. In general we discourage comments in the code. Instead, write code that documents itself by use of clear variable, function, and type names.</li>
                <li>SAST – Static Application Security Scanning
                  <ol>
                    <li>Check GitHub Advanced Security for any code vulnerabilities.</li>
                  </ol>
                </li>
                <li>Build it using GitHub Actions
                  <ol>
                    <li>Pick a test server that isn't currently used for the same part of the code</li>
                    <li>Add Deployed to: &lt;environment&gt; to the card on the board you are working on</li>
                  </ol>
                </li>
                <li>Do developer testing
                  <ol>
                    <li>Make sure your feature works / bug is fixed, in a lower env (TST, TST2, POC)</li>
                    <li>Most developers will develop and test locally before deploying</li>
                  </ol>
                </li>
                <li>Create a PR (pull request)
                  <ol>
                    <li>Add PR: &lt;PR URL&gt; to the card you are working on</li>
                    <li>Respond to PR comments. Reviewers should follow the Code Review Checklist</li>
                    <li>The PR must be approved by one senior engineer and one other engineer</li>
                    <li>The PR must be approved by QA, who will leave a comment as to what was tested (if applicable) and when it is ok to merge</li>
                    <li>Do not merge until the full team is in agreement that we will have a release</li>
                  </ol>
                </li>
                <li>Change management would go here, but it is left out because it is usually organization specific.
                </li>
                <li>Merge PR
                  <ol>
                    <li>Once all conditions (see above) are right, merge the PR</li>
                    <li>For most apps this will trigger a release</li>
                    <li>You can also trigger the release manually in GitHub Actions (check with senior engineers)</li>
                  </ol>
                </li>
                <li>Production validation
                  <ol>
                    <li>Watch the release in GitHub Actions and ensure all steps are successful</li>
                    <li>Validate that the new feature works / that the bug is fixed, in production</li>
                  </ol>
                </li>
              </ol>
            </div>
          </div>

          <div className="card" id="this-website">
            <div className="card-title">This Website</div>
            <div className="card-text">This website is built with Next.js and Tailwind CSS. It is hosted on GitHub Pages.
              It is server-side rendered and statically generated by a GitHub Actions workflow.
              The code is available on GitHub 
              at <a href="https://github.com/hnordberg/hnordberg.github.io">hnordberg/hnordberg.github.io</a>. To publish, I
              push to the master branch. If it had been built as a collaboration, I would be using pull requests instead.
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

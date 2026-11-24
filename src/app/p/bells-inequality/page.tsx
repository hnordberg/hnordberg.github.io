import Link from 'next/link'
import { notFound } from 'next/navigation'
import Contents from '../../components/Contents'
import { BELLS_INEQUALITY_ENABLED } from '../../lib/features'
import MerminApp from './MerminApp'

const BellsInequalityPage = () => {
  if (!BELLS_INEQUALITY_ENABLED) notFound()

  const articles = [
    { id: 'overview', title: 'EPR vs. Copenhagen' },
    { id: 'simulator', title: 'Interactive Mermin Simulator' },
    { id: 'two-detector-bell', title: "2-Detector Bell's Inequality (5/9 vs 1/2)" },
    { id: 'three-detector-ghz', title: '3-Detector GHZ ("Quantum Mysteries Revisited")' },
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <div className="content-container">
        <p style={{ marginBottom: '0.75rem' }}>
          <Link href="/technology#bells-inequality">&larr; Back to Technology</Link>
        </p>
        <h1>Bell&apos;s Inequality &amp; Quantum Mysteries</h1>

        <section id="overview">
          <h2>EPR Local Realism vs. the Copenhagen Interpretation</h2>
          <p>
            In 1935, Albert Einstein, Boris Podolsky, and Nathan Rosen (EPR) argued that
            quantum mechanics must be incomplete. When two entangled particles fly apart,
            measuring a property of particle A immediately tells us the result of measuring
            the same property on distant particle B. Under the{' '}
            <strong>Copenhagen interpretation</strong>, neither particle has a definite
            value prior to measurement; measuring A collapses the joint quantum state.
          </p>
          <p>
            To avoid what Einstein called &ldquo;spooky action at a distance,&rdquo; EPR
            proposed <strong>local realism</strong>: each particle must carry pre-existing
            local properties (&ldquo;instruction sets&rdquo; or hidden variables) determined
            at the source that dictate how it will respond to any measurement setting.
          </p>
          <p>
            In 1964, John Stewart Bell proved that this philosophical disagreement makes{' '}
            <strong>testably different statistical predictions</strong> when detectors
            measure at intermediate angles. N. David Mermin distilled both Bell&apos;s
            theorem and its 3-particle Greenberger–Horne–Zeilinger (GHZ) generalization into
            black-box gedankenexperiments with switches and Red/Green lights—requiring no
            quantum formalism to see the contradiction.
          </p>
        </section>

        <section id="simulator">
          <h2>Interactive Mermin Device Simulator</h2>
          <p>
            Use the simulator below to compare <strong>Copenhagen (Quantum Mechanics)</strong>{' '}
            against <strong>EPR (Local Instruction Sets)</strong> in both Mermin&apos;s
            2-detector Bell setup and his 1990 3-detector GHZ setup (
            <em>&ldquo;Quantum mysteries revisited&rdquo;</em>).
          </p>
          <MerminApp />
        </section>

        <section id="two-detector-bell">
          <h2>Why EPR Predicts &ge; 55.6% While Copenhagen Predicts 50% (2-Detector Device)</h2>
          <p>
            In Mermin&apos;s 2-detector setup, a source emits pairs of spin-1/2 particles to
            two unconnected detectors (Alice and Bob). Each detector has a 3-position switch
            (<code>1</code>, <code>2</code>, <code>3</code> corresponding to measurement
            axes separated by <code>120°</code>) and flashes either a{' '}
            <strong>Red (R)</strong> or <strong>Green (G)</strong> light:
          </p>
          <ol>
            <li>
              <strong>Feature 1 (Same switches):</strong> Whenever Alice and Bob happen to
              choose the same switch setting (<code>11</code>, <code>22</code>, or{' '}
              <code>33</code>), their lights <em>always</em> flash the same color (100% of
              the time).
            </li>
            <li>
              <strong>Feature 2 (All 9 random combinations):</strong> When Alice and Bob set
              their switches completely at random across all 9 pairs, the lights flash the
              same color <strong>exactly 50% of the time</strong>.
            </li>
          </ol>
          <p>
            <strong>The EPR dilemma:</strong> Because the detectors are disconnected, the
            only local way to guarantee Feature 1 is for both particles to leave the source
            with identical instructions for all three settings—such as <code>R R G</code>{' '}
            (meaning: flash Red for 1, Red for 2, Green for 3). There are 8 possible
            instruction sets:
          </p>
          <ul className="list">
            <li>
              <strong>Homogeneous sets (<code>RRR</code>, <code>GGG</code>):</strong> Match
              on all <strong>9 / 9 (100%)</strong> switch combinations.
            </li>
            <li>
              <strong>
                Mixed sets (<code>RRG</code>, <code>RGR</code>, <code>GRR</code>,{' '}
                <code>GGR</code>, <code>GRG</code>, <code>RGG</code>):
              </strong>{' '}
              Two switches share one color and the third has the opposite color. The
              switches match on the 3 diagonal settings (<code>11</code>, <code>22</code>,{' '}
              <code>33</code>) plus the 2 off-diagonal settings that share the majority
              color—giving <strong>5 / 9 (55.56%)</strong> same-color flashes.
            </li>
          </ul>
          <p>
            No matter how the source mixes instruction sets, local realism obeys{' '}
            <strong>Bell&apos;s Inequality</strong>:
          </p>
          <p>
            <code>P(same color | EPR) &ge; 5/9 &approx; 55.56%</code>
          </p>
          <p>
            <strong>The Copenhagen resolution:</strong> Quantum mechanics rejects the premise
            that unmeasured switch settings possess pre-existing outcomes. Measuring particle
            A along axis <code>θ_A</code> collapses the state, and particle B agrees with
            probability <code>cos²((θ_A - θ_B) / 2)</code>. For the 3 matching switch pairs (
            <code>Δθ = 0°</code>), <code>cos²(0°) = 1</code>. For the 6 differing switch
            pairs (<code>Δθ = 120°</code>), <code>cos²(60°) = 1/4 = 25%</code>. Averaging
            over all 9 equally likely switch pairs gives:
          </p>
          <p>
            <code>P(same color | Quantum) = (3 &times; 1 + 6 &times; 1/4) / 9 = 4.5 / 9 = 50.0%</code>
          </p>
        </section>

        <section id="three-detector-ghz">
          <h2>
            &ldquo;Quantum Mysteries Revisited&rdquo; (1990): Mermin&apos;s 3-Detector GHZ
            Refutation
          </h2>
          <p>
            In his 1990 paper <em>&ldquo;Quantum mysteries revisited&rdquo;</em> (Am. J.
            Phys. 58, 731), Mermin showed how Greenberger, Horne, and Zeilinger (GHZ)
            eliminated the need for statistical inequalities altogether using{' '}
            <strong>three entangled spin-1/2 particles</strong> and three detectors (A, B,
            C), each with a 2-position switch (<code>1</code> measures{' '}
            <code>&sigma;_x</code>, <code>2</code> measures <code>&sigma;_y</code>):
          </p>
          <ul className="list">
            <li>
              Assign <code>+1</code> to a Green flash and <code>-1</code> to a Red flash.
            </li>
            <li>
              Whenever one detector is set to <code>1</code> and the other two are set to{' '}
              <code>2</code> (switch settings <code>122</code>, <code>212</code>, or{' '}
              <code>221</code>), the product of the three outcomes is always{' '}
              <code>+1</code>—meaning an <strong>even number of Red lights (0 or 2)</strong>{' '}
              always flashes.
            </li>
            <li>
              Under EPR instruction sets <code>(A₁, A₂), (B₁, B₂), (C₁, C₂) &isin; &#123;+1, -1&#125;</code>,
              satisfying those three cases requires:
              <br />
              <code>A₁ B₂ C₂ = +1</code>, &nbsp;<code>A₂ B₁ C₂ = +1</code>, &nbsp;
              <code>A₂ B₂ C₁ = +1</code>.
            </li>
            <li>
              Multiplying all three equations together gives{' '}
              <code>(A₁ B₁ C₁)(A₂² B₂² C₂²) = +1</code>. Since <code>(&plusmn;1)² = +1</code>,{' '}
              <strong>
                every EPR instruction set must give <code>A₁ B₁ C₁ = +1</code> (0 or 2 Reds)
                when the switches are set to <code>111</code>
              </strong>
              .
            </li>
            <li>
              In Quantum Mechanics, however, the Pauli spin operators anti-commute (
              <code>&sigma;_x &sigma;_y = -&sigma;_y &sigma;_x</code>), introducing a minus
              sign for the joint operator <code>&sigma;_x &otimes; &sigma;_x &otimes; &sigma;_x</code>:
              on switch setting <code>111</code>, Quantum Mechanics predicts{' '}
              <code>A₁ B₁ C₁ = -1</code>—an{' '}
              <strong>odd number of Red lights (1 or 3) 100% of the time</strong>.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}

export default BellsInequalityPage

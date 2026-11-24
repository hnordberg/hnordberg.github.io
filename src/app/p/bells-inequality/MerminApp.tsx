'use client'

import { useState } from 'react'
import styles from './MerminApp.module.css'

type SetupMode = 'bell2' | 'ghz3'
type Worldview = 'quantum' | 'epr'
type Color = 'R' | 'G'
type BellSwitch = 1 | 2 | 3
type BellSwitchSelection = BellSwitch | 'random'
type GhzSwitch = 1 | 2
type GhzSwitchSelection = GhzSwitch | 'random'

type EprBellInstruction = 'RRG' | 'RGR' | 'GRR' | 'GGR' | 'GRG' | 'RGG' | 'RRR' | 'GGG'
type EprBellPolicy = 'mixed' | 'uniform' | EprBellInstruction

interface BellTrial {
  switchA: BellSwitch
  switchB: BellSwitch
  colorA: Color
  colorB: Color
  same: boolean
  instruction?: EprBellInstruction
  deltaAngle: number
  qmProbSame: number
}

interface BellStats {
  total: number
  sameCount: number
  sameSettingTotal: number
  sameSettingMatch: number
  diffSettingTotal: number
  diffSettingMatch: number
  cellTotal: number[][]
  cellMatch: number[][]
}

interface GhzInstructionSet {
  label: string
  A: [Color, Color]
  B: [Color, Color]
  C: [Color, Color]
}

interface GhzTrial {
  switches: [GhzSwitch, GhzSwitch, GhzSwitch]
  colors: [Color, Color, Color]
  redCount: number
  instructionLabel?: string
}

interface GhzStats {
  total: number
  runs122Family: number
  evenRedOn122Family: number
  runs111: number
  oddRedOn111: number
}

const MIXED_BELL_INSTRUCTIONS: EprBellInstruction[] = [
  'RRG',
  'RGR',
  'GRR',
  'GGR',
  'GRG',
  'RGG',
]

const ALL_BELL_INSTRUCTIONS: EprBellInstruction[] = [
  ...MIXED_BELL_INSTRUCTIONS,
  'RRR',
  'GGG',
]

// Valid EPR instruction sets for Mermin's 3-particle GHZ device that satisfy
// A1*B2*C2 = +1, A2*B1*C2 = +1, A2*B2*C1 = +1 (where G = +1, R = -1).
const VALID_GHZ_INSTRUCTIONS: GhzInstructionSet[] = [
  { label: 'A:(G,G) B:(G,G) C:(G,G)', A: ['G', 'G'], B: ['G', 'G'], C: ['G', 'G'] },
  { label: 'A:(G,R) B:(R,G) C:(R,G)', A: ['G', 'R'], B: ['R', 'G'], C: ['R', 'G'] },
  { label: 'A:(R,G) B:(G,R) C:(R,G)', A: ['R', 'G'], B: ['G', 'R'], C: ['R', 'G'] },
  { label: 'A:(R,G) B:(R,G) C:(G,R)', A: ['R', 'G'], B: ['R', 'G'], C: ['G', 'R'] },
  { label: 'A:(G,R) B:(G,R) C:(G,R)', A: ['G', 'R'], B: ['G', 'R'], C: ['G', 'R'] },
  { label: 'A:(R,R) B:(G,G) C:(R,G)', A: ['R', 'R'], B: ['G', 'G'], C: ['R', 'G'] },
  { label: 'A:(R,R) B:(R,G) C:(G,G)', A: ['R', 'R'], B: ['R', 'G'], C: ['G', 'G'] },
  { label: 'A:(G,G) B:(R,R) C:(R,G)', A: ['G', 'G'], B: ['R', 'R'], C: ['R', 'G'] },
]

function createEmptyBellStats(): BellStats {
  return {
    total: 0,
    sameCount: 0,
    sameSettingTotal: 0,
    sameSettingMatch: 0,
    diffSettingTotal: 0,
    diffSettingMatch: 0,
    cellTotal: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    cellMatch: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  }
}

function createEmptyGhzStats(): GhzStats {
  return {
    total: 0,
    runs122Family: 0,
    evenRedOn122Family: 0,
    runs111: 0,
    oddRedOn111: 0,
  }
}

function pickRandomBellSwitch(): BellSwitch {
  const r = Math.floor(Math.random() * 3)
  return (r + 1) as BellSwitch
}

function pickRandomGhzSwitch(): GhzSwitch {
  return Math.random() < 0.5 ? 1 : 2
}

function pickBellInstruction(policy: EprBellPolicy): EprBellInstruction {
  if (policy === 'mixed') {
    return MIXED_BELL_INSTRUCTIONS[
      Math.floor(Math.random() * MIXED_BELL_INSTRUCTIONS.length)
    ]
  }
  if (policy === 'uniform') {
    return ALL_BELL_INSTRUCTIONS[
      Math.floor(Math.random() * ALL_BELL_INSTRUCTIONS.length)
    ]
  }
  return policy
}

function angleForBellSwitch(s: BellSwitch): number {
  return (s - 1) * 120
}

function runSingleBellTrial(
  selA: BellSwitchSelection,
  selB: BellSwitchSelection,
  worldview: Worldview,
  eprPolicy: EprBellPolicy
): BellTrial {
  const switchA = selA === 'random' ? pickRandomBellSwitch() : selA
  const switchB = selB === 'random' ? pickRandomBellSwitch() : selB
  const deltaAngle = Math.abs(angleForBellSwitch(switchA) - angleForBellSwitch(switchB))
  const normalizedDelta = deltaAngle > 180 ? 360 - deltaAngle : deltaAngle
  const halfAngleRad = ((normalizedDelta / 2) * Math.PI) / 180
  const qmProbSame = Math.cos(halfAngleRad) ** 2

  if (worldview === 'quantum') {
    const colorA: Color = Math.random() < 0.5 ? 'R' : 'G'
    const isSame = Math.random() < qmProbSame
    const colorB: Color = isSame ? colorA : colorA === 'R' ? 'G' : 'R'
    return {
      switchA,
      switchB,
      colorA,
      colorB,
      same: colorA === colorB,
      deltaAngle: normalizedDelta,
      qmProbSame,
    }
  } else {
    const instruction = pickBellInstruction(eprPolicy)
    const colorA = instruction[switchA - 1] as Color
    const colorB = instruction[switchB - 1] as Color
    return {
      switchA,
      switchB,
      colorA,
      colorB,
      same: colorA === colorB,
      instruction,
      deltaAngle: normalizedDelta,
      qmProbSame,
    }
  }
}

function runSingleGhzTrial(
  selA: GhzSwitchSelection,
  selB: GhzSwitchSelection,
  selC: GhzSwitchSelection,
  worldview: Worldview
): GhzTrial {
  const sA = selA === 'random' ? pickRandomGhzSwitch() : selA
  const sB = selB === 'random' ? pickRandomGhzSwitch() : selB
  const sC = selC === 'random' ? pickRandomGhzSwitch() : selC
  const switches: [GhzSwitch, GhzSwitch, GhzSwitch] = [sA, sB, sC]

  if (worldview === 'epr') {
    const inst =
      VALID_GHZ_INSTRUCTIONS[
        Math.floor(Math.random() * VALID_GHZ_INSTRUCTIONS.length)
      ]
    const cA = inst.A[sA - 1]
    const cB = inst.B[sB - 1]
    const cC = inst.C[sC - 1]
    const colors: [Color, Color, Color] = [cA, cB, cC]
    const redCount = colors.filter((c) => c === 'R').length
    return { switches, colors, redCount, instructionLabel: inst.label }
  } else {
    const countOnes = switches.filter((s) => s === 1).length
    if (countOnes === 1) {
      // 122, 212, 221: product = +1 -> even number of Reds (0 or 2)
      const evenPatterns: [Color, Color, Color][] = [
        ['G', 'G', 'G'],
        ['G', 'R', 'R'],
        ['R', 'G', 'R'],
        ['R', 'R', 'G'],
      ]
      const colors = evenPatterns[Math.floor(Math.random() * evenPatterns.length)]
      const redCount = colors.filter((c) => c === 'R').length
      return { switches, colors, redCount }
    } else if (countOnes === 3) {
      // 111: Quantum GHZ eigenvalue is -1 -> odd number of Reds (1 or 3)
      const oddPatterns: [Color, Color, Color][] = [
        ['R', 'G', 'G'],
        ['G', 'R', 'G'],
        ['G', 'G', 'R'],
        ['R', 'R', 'R'],
      ]
      const colors = oddPatterns[Math.floor(Math.random() * oddPatterns.length)]
      const redCount = colors.filter((c) => c === 'R').length
      return { switches, colors, redCount }
    } else {
      // 222, 112, 121, 211: uncorrelated 50/50 parity
      const colors: [Color, Color, Color] = [
        Math.random() < 0.5 ? 'R' : 'G',
        Math.random() < 0.5 ? 'R' : 'G',
        Math.random() < 0.5 ? 'R' : 'G',
      ]
      const redCount = colors.filter((c) => c === 'R').length
      return { switches, colors, redCount }
    }
  }
}

export default function MerminApp() {
  const [setupMode, setSetupMode] = useState<SetupMode>('bell2')
  const [worldview, setWorldview] = useState<Worldview>('quantum')

  // 2-detector Bell state
  const [bellSwitchA, setBellSwitchA] = useState<BellSwitchSelection>('random')
  const [bellSwitchB, setBellSwitchB] = useState<BellSwitchSelection>('random')
  const [eprPolicy, setEprPolicy] = useState<EprBellPolicy>('mixed')
  const [lastBellTrial, setLastBellTrial] = useState<BellTrial | null>(null)
  const [bellStats, setBellStats] = useState<BellStats>(createEmptyBellStats)
  const [inspectedInstruction, setInspectedInstruction] =
    useState<EprBellInstruction>('RRG')

  // 3-detector GHZ state
  const [ghzSwitchA, setGhzSwitchA] = useState<GhzSwitchSelection>('random')
  const [ghzSwitchB, setGhzSwitchB] = useState<GhzSwitchSelection>('random')
  const [ghzSwitchC, setGhzSwitchC] = useState<GhzSwitchSelection>('random')
  const [lastGhzTrial, setLastGhzTrial] = useState<GhzTrial | null>(null)
  const [ghzStats, setGhzStats] = useState<GhzStats>(createEmptyGhzStats)

  const executeBellTrials = (count: number) => {
    let latest: BellTrial | null = null
    setBellStats((prev) => {
      const next: BellStats = {
        ...prev,
        cellTotal: prev.cellTotal.map((row) => [...row]),
        cellMatch: prev.cellMatch.map((row) => [...row]),
      }
      for (let i = 0; i < count; i++) {
        const t = runSingleBellTrial(bellSwitchA, bellSwitchB, worldview, eprPolicy)
        latest = t
        next.total += 1
        if (t.same) next.sameCount += 1
        if (t.switchA === t.switchB) {
          next.sameSettingTotal += 1
          if (t.same) next.sameSettingMatch += 1
        } else {
          next.diffSettingTotal += 1
          if (t.same) next.diffSettingMatch += 1
        }
        next.cellTotal[t.switchA - 1][t.switchB - 1] += 1
        if (t.same) {
          next.cellMatch[t.switchA - 1][t.switchB - 1] += 1
        }
      }
      return next
    })
    if (latest) {
      setLastBellTrial(latest)
      if ((latest as BellTrial).instruction) {
        setInspectedInstruction((latest as BellTrial).instruction!)
      }
    }
  }

  const resetBell = () => {
    setLastBellTrial(null)
    setBellStats(createEmptyBellStats())
  }

  const executeGhzTrials = (
    count: number,
    overrideSwitches?: [GhzSwitchSelection, GhzSwitchSelection, GhzSwitchSelection]
  ) => {
    const sA = overrideSwitches ? overrideSwitches[0] : ghzSwitchA
    const sB = overrideSwitches ? overrideSwitches[1] : ghzSwitchB
    const sC = overrideSwitches ? overrideSwitches[2] : ghzSwitchC
    let latest: GhzTrial | null = null
    setGhzStats((prev) => {
      const next = { ...prev }
      for (let i = 0; i < count; i++) {
        const t = runSingleGhzTrial(sA, sB, sC, worldview)
        latest = t
        next.total += 1
        const ones = t.switches.filter((s) => s === 1).length
        if (ones === 1) {
          next.runs122Family += 1
          if (t.redCount % 2 === 0) next.evenRedOn122Family += 1
        } else if (ones === 3) {
          next.runs111 += 1
          if (t.redCount % 2 === 1) next.oddRedOn111 += 1
        }
      }
      return next
    })
    if (latest) {
      setLastGhzTrial(latest)
    }
  }

  const resetGhz = () => {
    setLastGhzTrial(null)
    setGhzStats(createEmptyGhzStats())
  }

  const overallSamePct =
    bellStats.total > 0 ? (bellStats.sameCount / bellStats.total) * 100 : 0
  const sameSettingPct =
    bellStats.sameSettingTotal > 0
      ? (bellStats.sameSettingMatch / bellStats.sameSettingTotal) * 100
      : 0
  const diffSettingPct =
    bellStats.diffSettingTotal > 0
      ? (bellStats.diffSettingMatch / bellStats.diffSettingTotal) * 100
      : 0

  return (
    <div className={styles.appContainer}>
      <div className={styles.topControls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Mermin Experiment Setup</span>
          <div className={styles.segmentedButtons}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                setupMode === 'bell2' ? styles.segmentBtnActive : ''
              }`}
              onClick={() => setSetupMode('bell2')}
            >
              2-Detector Bell Device (55.6% vs 50%)
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                setupMode === 'ghz3' ? styles.segmentBtnActive : ''
              }`}
              onClick={() => setSetupMode('ghz3')}
            >
              3-Detector GHZ Device (&ldquo;Quantum Mysteries Revisited&rdquo;)
            </button>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Physics Model (Worldview)</span>
          <div className={styles.segmentedButtons}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                worldview === 'quantum' ? styles.segmentBtnActive : ''
              }`}
              onClick={() => {
                setWorldview('quantum')
                resetBell()
                resetGhz()
              }}
            >
              Copenhagen (Quantum Mechanics)
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                worldview === 'epr' ? styles.segmentBtnActive : ''
              }`}
              onClick={() => {
                setWorldview('epr')
                resetBell()
                resetGhz()
              }}
            >
              EPR (Local Instruction Sets)
            </button>
          </div>
        </div>
      </div>

      {setupMode === 'bell2' ? (
        <>
          <div
            className={`${styles.modelBanner} ${
              worldview === 'epr' ? styles.modelBannerEpr : ''
            }`}
          >
            {worldview === 'quantum' ? (
              <div>
                <strong>Copenhagen Mode (Quantum Mechanics):</strong> Particles have{' '}
                <em>no pre-assigned colors</em> in flight. Measuring Detector A collapses
                the entangled pair; Detector B then flashes the same color with probability{' '}
                <code>cos²(Δθ / 2)</code>. When switches match (<code>Δθ = 0°</code>),{' '}
                <code>cos²(0°) = 100%</code>. When switches differ (<code>Δθ = 120°</code>),{' '}
                <code>cos²(60°) = 25%</code>. Across all 9 random switch pairs, the lights
                match <strong>50.0%</strong> of the time—violating Bell&apos;s Inequality!
              </div>
            ) : (
              <div>
                <div>
                  <strong>EPR Mode (Local Hidden Variables):</strong> To guarantee 100%
                  agreement whenever both switches happen to be set the same—without any
                  faster-than-light influence—each pair leaves the source with a fixed
                  3-switch instruction set (such as <code>R R G</code> for settings{' '}
                  <code>1, 2, 3</code>). Because every 3-letter instruction set has at
                  least two identical letters, it matches on at least{' '}
                  <strong>5 out of 9 (55.56%)</strong> random switch combinations
                  (Bell&apos;s Inequality).
                </div>
                <div className={styles.eprConfigRow}>
                  <label htmlFor="epr-policy-select">
                    <strong>Source Instruction Policy:</strong>
                  </label>
                  <select
                    id="epr-policy-select"
                    className={styles.selectInput}
                    value={eprPolicy}
                    onChange={(e) => {
                      setEprPolicy(e.target.value as EprBellPolicy)
                      resetBell()
                    }}
                  >
                    <option value="mixed">
                      Mixed sets only (RRG, RGR, GRR, GGR, GRG, RGG) → 5/9 (55.6% same)
                    </option>
                    <option value="uniform">
                      All 8 sets uniformly (includes RRR, GGG) → 6/9 (66.7% same)
                    </option>
                    <option value="RRG">Fixed instruction: R R G (5/9 = 55.6%)</option>
                    <option value="RGR">Fixed instruction: R G R (5/9 = 55.6%)</option>
                    <option value="GRR">Fixed instruction: G R R (5/9 = 55.6%)</option>
                    <option value="RRR">Fixed instruction: R R R (9/9 = 100%)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className={styles.bench}>
            {/* Detector A */}
            <div className={styles.detectorBox}>
              <div className={styles.detectorHeader}>
                <span>Detector A (Alice)</span>
                <span className={styles.angleTag}>
                  {bellSwitchA === 'random'
                    ? lastBellTrial
                      ? `Switch ${lastBellTrial.switchA} (${angleForBellSwitch(
                          lastBellTrial.switchA
                        )}°)`
                      : 'Random (0° / 120° / 240°)'
                    : `Switch ${bellSwitchA} (${angleForBellSwitch(bellSwitchA)}°)`}
                </span>
              </div>
              <div className={styles.switchRow}>
                <span>Switch Setting:</span>
                <div className={styles.switchButtons}>
                  {(['random', 1, 2, 3] as BellSwitchSelection[]).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      className={`${styles.switchBtn} ${
                        bellSwitchA === opt ? styles.switchBtnSelected : ''
                      }`}
                      onClick={() => setBellSwitchA(opt)}
                    >
                      {opt === 'random' ? 'Rnd' : opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.lightsRow}>
                <div className={styles.bulbWrapper}>
                  <div
                    className={`${styles.bulb} ${
                      lastBellTrial?.colorA === 'R' ? styles.bulbRedOn : ''
                    }`}
                  >
                    R
                  </div>
                  <span>Red</span>
                </div>
                <div className={styles.bulbWrapper}>
                  <div
                    className={`${styles.bulb} ${
                      lastBellTrial?.colorA === 'G' ? styles.bulbGreenOn : ''
                    }`}
                  >
                    G
                  </div>
                  <span>Green</span>
                </div>
              </div>
            </div>

            {/* Source */}
            <div className={styles.sourceBox}>
              <div className={styles.sourceTitle}>Entangled Pair Source</div>
              <div className={styles.particleBadge}>
                {worldview === 'quantum'
                  ? lastBellTrial
                    ? 'State: |Ψ⁻⟩ → Collapsed'
                    : 'State: |Ψ⁻⟩ (No instructions)'
                  : lastBellTrial?.instruction
                  ? `Instruction: [${lastBellTrial.instruction.split('').join(' | ')}]`
                  : 'Instruction: [ ? | ? | ? ]'}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>
                ← Particle A &nbsp;|&nbsp; Particle B →
              </div>
            </div>

            {/* Detector B */}
            <div className={styles.detectorBox}>
              <div className={styles.detectorHeader}>
                <span>Detector B (Bob)</span>
                <span className={styles.angleTag}>
                  {bellSwitchB === 'random'
                    ? lastBellTrial
                      ? `Switch ${lastBellTrial.switchB} (${angleForBellSwitch(
                          lastBellTrial.switchB
                        )}°)`
                      : 'Random (0° / 120° / 240°)'
                    : `Switch ${bellSwitchB} (${angleForBellSwitch(bellSwitchB)}°)`}
                </span>
              </div>
              <div className={styles.switchRow}>
                <span>Switch Setting:</span>
                <div className={styles.switchButtons}>
                  {(['random', 1, 2, 3] as BellSwitchSelection[]).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      className={`${styles.switchBtn} ${
                        bellSwitchB === opt ? styles.switchBtnSelected : ''
                      }`}
                      onClick={() => setBellSwitchB(opt)}
                    >
                      {opt === 'random' ? 'Rnd' : opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.lightsRow}>
                <div className={styles.bulbWrapper}>
                  <div
                    className={`${styles.bulb} ${
                      lastBellTrial?.colorB === 'R' ? styles.bulbRedOn : ''
                    }`}
                  >
                    R
                  </div>
                  <span>Red</span>
                </div>
                <div className={styles.bulbWrapper}>
                  <div
                    className={`${styles.bulb} ${
                      lastBellTrial?.colorB === 'G' ? styles.bulbGreenOn : ''
                    }`}
                  >
                    G
                  </div>
                  <span>Green</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => executeBellTrials(1)}
            >
              Fire 1 Pair
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => executeBellTrials(100)}
            >
              +100 Runs
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => executeBellTrials(1000)}
            >
              +1,000 Runs
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setBellSwitchA('random')
                setBellSwitchB('random')
              }}
            >
              Set Switches to Random
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={resetBell}>
              Reset Stats
            </button>
          </div>

          {lastBellTrial && (
            <div className={styles.lastRunCard}>
              <strong>Last Trial:</strong> Switch A ={' '}
              <code>{lastBellTrial.switchA}</code>, Switch B ={' '}
              <code>{lastBellTrial.switchB}</code> (angle difference{' '}
              <code>{lastBellTrial.deltaAngle}°</code>) → Detector A flashed{' '}
              <span
                className={
                  lastBellTrial.colorA === 'R' ? styles.pillR : styles.pillG
                }
              >
                {lastBellTrial.colorA}
              </span>
              , Detector B flashed{' '}
              <span
                className={
                  lastBellTrial.colorB === 'R' ? styles.pillR : styles.pillG
                }
              >
                {lastBellTrial.colorB}
              </span>{' '}
              (<strong>{lastBellTrial.same ? 'SAME COLOR' : 'DIFFERENT COLORS'}</strong>).
              {worldview === 'epr' && lastBellTrial.instruction ? (
                <span>
                  {' '}
                  Each particle carried instruction set{' '}
                  <code>{lastBellTrial.instruction}</code> (1→
                  {lastBellTrial.instruction[0]}, 2→{lastBellTrial.instruction[1]}, 3→
                  {lastBellTrial.instruction[2]}).
                </span>
              ) : (
                <span>
                  {' '}
                  In Copenhagen QM,{' '}
                  <code>
                    P(same) = cos²({lastBellTrial.deltaAngle}° / 2) ={' '}
                    {(lastBellTrial.qmProbSame * 100).toFixed(0)}%
                  </code>
                  .
                </span>
              )}
            </div>
          )}

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Runs</div>
              <div className={styles.statValue}>{bellStats.total}</div>
              <div className={styles.statSub}>
                Same-color flashes: {bellStats.sameCount}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Overall Same-Color Rate</div>
              <div className={styles.statValue}>
                {bellStats.total > 0 ? `${overallSamePct.toFixed(1)}%` : '—'}
              </div>
              <div className={styles.statSub}>
                QM: 50.0% | EPR Bell bound: ≥55.6%
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>When Switches Match (11, 22, 33)</div>
              <div className={styles.statValue}>
                {bellStats.sameSettingTotal > 0
                  ? `${sameSettingPct.toFixed(1)}%`
                  : '—'}
              </div>
              <div className={styles.statSub}>
                Both QM &amp; EPR predict 100% ({bellStats.sameSettingMatch}/
                {bellStats.sameSettingTotal})
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                When Switches Differ (12, 13, 23, …)
              </div>
              <div className={styles.statValue}>
                {bellStats.diffSettingTotal > 0
                  ? `${diffSettingPct.toFixed(1)}%`
                  : '—'}
              </div>
              <div className={styles.statSub}>
                QM: 25.0% | EPR bound: ≥33.3% ({bellStats.diffSettingMatch}/
                {bellStats.diffSettingTotal})
              </div>
            </div>
          </div>

          <div className={styles.comparisonSection}>
            <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
              Overall Same-Color Rate vs. Bell&apos;s Inequality Threshold
            </div>
            <div className={styles.legendRow}>
              <span className={styles.legendItem}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: '#10b981' }}
                />
                Quantum Prediction: <strong>50.0%</strong> (4.5 / 9)
              </span>
              <span className={styles.legendItem}>
                <span
                  className={styles.swatch}
                  style={{ backgroundColor: '#ef4444' }}
                />
                Bell&apos;s Inequality Minimum (EPR): <strong>55.6%</strong> (5 / 9)
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${
                  worldview === 'epr' ? styles.barFillEpr : ''
                }`}
                style={{ width: `${Math.min(100, overallSamePct)}%` }}
              />
              <div
                className={`${styles.marker} ${styles.markerQm}`}
                style={{ left: '50%' }}
                title="Quantum Mechanics: 50.0%"
              />
              <div
                className={styles.marker}
                style={{ left: '55.56%' }}
                title="Bell Inequality EPR Minimum: 55.56% (5/9)"
              />
            </div>

            <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
              Why EPR Must Give ≥ 5/9 (55.6%) While Copenhagen Gives 50%: The 3×3 Switch
              Matrix
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: '0.6rem' }}>
              Inspect any local instruction set below. Because there are 3 switches but
              only 2 colors (Pigeonhole Principle), at least 2 switches must share a
              color—forcing <strong>at least 5 of the 9 cells</strong> to match. In
              Copenhagen QM, unmeasured switch settings do not have pre-existing values,
              and the 6 off-diagonal cells each match only{' '}
              <code>cos²(60°) = 25%</code> of the time:
              <code> (3 × 100% + 6 × 25%) / 9 = 4.5 / 9 = 50%</code>.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <span>Inspect EPR Instruction Set:</span>
              {ALL_BELL_INSTRUCTIONS.map((inst) => (
                <button
                  key={inst}
                  type="button"
                  className={`${styles.switchBtn} ${
                    inspectedInstruction === inst ? styles.switchBtnSelected : ''
                  }`}
                  onClick={() => setInspectedInstruction(inst)}
                >
                  {inst}
                </button>
              ))}
            </div>

            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Alice \ Bob</th>
                  {[1, 2, 3].map((b) => (
                    <th key={b}>
                      Bob Switch {b} ({angleForBellSwitch(b as BellSwitch)}°)
                      <br />
                      <span style={{ fontWeight: 400, fontSize: '0.8rem' }}>
                        EPR[{b}] ={' '}
                        <span
                          className={
                            inspectedInstruction[b - 1] === 'R'
                              ? styles.pillR
                              : styles.pillG
                          }
                        >
                          {inspectedInstruction[b - 1]}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((a) => (
                  <tr key={a}>
                    <th>
                      Alice Switch {a} ({angleForBellSwitch(a as BellSwitch)}°){' '}
                      <span
                        className={
                          inspectedInstruction[a - 1] === 'R'
                            ? styles.pillR
                            : styles.pillG
                        }
                      >
                        {inspectedInstruction[a - 1]}
                      </span>
                    </th>
                    {[1, 2, 3].map((b) => {
                      const cA = inspectedInstruction[a - 1]
                      const cB = inspectedInstruction[b - 1]
                      const eprSame = cA === cB
                      const qmPct = a === b ? 100 : 25
                      const totalCell = bellStats.cellTotal[a - 1][b - 1]
                      const matchCell = bellStats.cellMatch[a - 1][b - 1]
                      return (
                        <td
                          key={b}
                          className={eprSame ? styles.cellSame : styles.cellDiff}
                        >
                          <div>
                            EPR ({inspectedInstruction}):{' '}
                            <strong>{eprSame ? 'SAME' : 'DIFF'}</strong> ({cA}
                            {cB})
                          </div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
                            QM P(same): <strong>{qmPct}%</strong>
                          </div>
                          {totalCell > 0 && (
                            <div style={{ fontSize: '0.76rem', marginTop: '0.15rem' }}>
                              Observed: {((matchCell / totalCell) * 100).toFixed(0)}% (
                              {matchCell}/{totalCell})
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div
            className={`${styles.modelBanner} ${
              worldview === 'epr' ? styles.modelBannerEpr : ''
            }`}
          >
            {worldview === 'quantum' ? (
              <div>
                <strong>
                  Copenhagen Mode (3-Particle GHZ State — Mermin 1990):
                </strong>{' '}
                Three spin-1/2 particles leave the source in the GHZ state. Switch{' '}
                <code>1</code> measures spin along <code>X</code> and Switch{' '}
                <code>2</code> measures spin along <code>Y</code> (Green ={' '}
                <code>+1</code>, Red = <code>-1</code>). Whenever one switch is{' '}
                <code>1</code> and two are <code>2</code> (<code>122</code>,{' '}
                <code>212</code>, <code>221</code>), the number of Red flashes is{' '}
                <strong>always even (0 or 2)</strong>. Yet when all three switches are{' '}
                <code>111</code>, anti-commutation of <code>σx</code> and <code>σy</code>{' '}
                flips the sign—producing an <strong>odd number of Red flashes (1 or 3) 100% of the time</strong>!
              </div>
            ) : (
              <div>
                <strong>EPR Mode (3-Particle Instruction Sets):</strong> Every particle
                carries pre-assigned colors for switches <code>1</code> and{' '}
                <code>2</code> chosen to satisfy the <code>122 / 212 / 221</code> rule
                (even number of Reds). Because each switch-2 value appears twice across
                those three combinations (<code>A₁B₂C₂ · A₂B₁C₂ · A₂B₂C₁ = A₁B₁C₁(A₂²B₂²C₂²) = +1</code>
                ), <strong>every valid EPR instruction set is forced to flash an EVEN number of Reds (0 or 2) on 111</strong>—directly contradicting Quantum Mechanics on every single <code>111</code> run!
              </div>
            )}
          </div>

          <div className={`${styles.bench} ${styles.benchThree}`}>
            {(
              [
                {
                  name: 'Detector A',
                  sel: ghzSwitchA,
                  setSel: setGhzSwitchA,
                  idx: 0,
                },
                {
                  name: 'Detector B',
                  sel: ghzSwitchB,
                  setSel: setGhzSwitchB,
                  idx: 1,
                },
                {
                  name: 'Detector C',
                  sel: ghzSwitchC,
                  setSel: setGhzSwitchC,
                  idx: 2,
                },
              ] as const
            ).map((det) => {
              const currentSwitch = lastGhzTrial?.switches[det.idx]
              const currentColor = lastGhzTrial?.colors[det.idx]
              return (
                <div key={det.name} className={styles.detectorBox}>
                  <div className={styles.detectorHeader}>
                    <span>{det.name}</span>
                    <span className={styles.angleTag}>
                      {det.sel === 'random'
                        ? currentSwitch
                          ? `Switch ${currentSwitch}`
                          : 'Random (1 or 2)'
                        : `Switch ${det.sel}`}
                    </span>
                  </div>
                  <div className={styles.switchRow}>
                    <span>Switch:</span>
                    <div className={styles.switchButtons}>
                      {(['random', 1, 2] as GhzSwitchSelection[]).map((opt) => (
                        <button
                          key={String(opt)}
                          type="button"
                          className={`${styles.switchBtn} ${
                            det.sel === opt ? styles.switchBtnSelected : ''
                          }`}
                          onClick={() => det.setSel(opt)}
                        >
                          {opt === 'random' ? 'Rnd' : opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.lightsRow}>
                    <div className={styles.bulbWrapper}>
                      <div
                        className={`${styles.bulb} ${
                          currentColor === 'R' ? styles.bulbRedOn : ''
                        }`}
                      >
                        R
                      </div>
                      <span>Red (-1)</span>
                    </div>
                    <div className={styles.bulbWrapper}>
                      <div
                        className={`${styles.bulb} ${
                          currentColor === 'G' ? styles.bulbGreenOn : ''
                        }`}
                      >
                        G
                      </div>
                      <span>Green (+1)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                setGhzSwitchA(1)
                setGhzSwitchB(1)
                setGhzSwitchC(1)
                executeGhzTrials(1, [1, 1, 1])
              }}
            >
              Test Switch 1-1-1 Showdown
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setGhzSwitchA(1)
                setGhzSwitchB(2)
                setGhzSwitchC(2)
                executeGhzTrials(1, [1, 2, 2])
              }}
            >
              Test Switch 1-2-2
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => executeGhzTrials(1)}
            >
              Fire 1 Run (Current Switches)
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setGhzSwitchA('random')
                setGhzSwitchB('random')
                setGhzSwitchC('random')
                executeGhzTrials(200, ['random', 'random', 'random'])
              }}
            >
              +200 Random Runs
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={resetGhz}>
              Reset Stats
            </button>
          </div>

          {lastGhzTrial && (
            <div className={styles.lastRunCard}>
              <strong>Last GHZ Run:</strong> Switches ={' '}
              <code>{lastGhzTrial.switches.join('-')}</code> → Lights ={' '}
              {lastGhzTrial.colors.map((c, idx) => (
                <span
                  key={idx}
                  className={c === 'R' ? styles.pillR : styles.pillG}
                  style={{ marginRight: '0.25rem' }}
                >
                  {c}
                </span>
              ))}{' '}
              (<strong>{lastGhzTrial.redCount} Red</strong> —{' '}
              <strong>{lastGhzTrial.redCount % 2 === 0 ? 'EVEN' : 'ODD'}</strong> number
              of Reds).
              {lastGhzTrial.instructionLabel && (
                <span>
                  {' '}
                  EPR Instruction set used: <code>{lastGhzTrial.instructionLabel}</code>.
                </span>
              )}
            </div>
          )}

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total 3-Particle Runs</div>
              <div className={styles.statValue}>{ghzStats.total}</div>
              <div className={styles.statSub}>
                Switch 1-1-1 runs: {ghzStats.runs111}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                Switches 122 / 212 / 221 (Even Reds)
              </div>
              <div className={styles.statValue}>
                {ghzStats.runs122Family > 0
                  ? `${(
                      (ghzStats.evenRedOn122Family / ghzStats.runs122Family) *
                      100
                    ).toFixed(0)}%`
                  : '—'}
              </div>
              <div className={styles.statSub}>
                Both QM &amp; EPR predict 100% Even ({ghzStats.evenRedOn122Family}/
                {ghzStats.runs122Family})
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                Switches 1-1-1: ODD Number of Reds (1 or 3)
              </div>
              <div className={styles.statValue}>
                {ghzStats.runs111 > 0
                  ? `${((ghzStats.oddRedOn111 / ghzStats.runs111) * 100).toFixed(
                      0
                    )}%`
                  : '—'}
              </div>
              <div className={styles.statSub}>
                QM predicts <strong>100% Odd</strong> | EPR predicts{' '}
                <strong>0% Odd (100% Even)</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

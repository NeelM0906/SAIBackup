// Colosseum Tab — Marketing Colosseum Command Center

const ARCHETYPE_DATA = [
  { id: 1, name: 'The Expansive Creative', icon: '🌊', color: '#00d4ff', energy: 'Endless Expanse', desc: 'Bigger, wider, deeper, more. Never-ending creative expansion.', weights: ['Variety', 'Innovation', 'Fun Energy', 'Pattern-breaking'] },
  { id: 2, name: 'The Empathetic Heart', icon: '💜', color: '#ff69b4', energy: 'Goddess Energy', desc: 'I see you. I hear you. What you say matters to me.', weights: ['Goddess Energy', 'Acknowledgment', 'Level 5 Listening', 'Emotional Rapport'] },
  { id: 3, name: 'The Witty Disruptor', icon: '☀️', color: '#ffcc00', energy: 'Sun Energy', desc: 'Funny, edgy, disruptive. Breaks patterns.', weights: ['Fun Energy', 'Contrast', 'Scarcity', 'Pattern-interrupt'] },
  { id: 4, name: 'The Aspirational Visionary', icon: '🚀', color: '#a855f7', energy: 'Aspirational', desc: 'Present to the vastness, the growth, the rise.', weights: ['Aspirational Energy', 'WHY', 'Focus', 'Meaning'] },
  { id: 5, name: 'The Zeus', icon: '⚡', color: '#ff2d55', energy: 'Zeus Energy', desc: 'Precise and direct. Drills everything into incredible focus.', weights: ['Zeus Energy', 'Agreement Formation', 'Congruence', 'Certainty'] },
  { id: 6, name: 'The Pure Mastery', icon: '🧠', color: '#00ff88', energy: 'Mastery', desc: 'Never stop learning. Integrative complexity. Next level continuously.', weights: ['Net Formula Score', 'All prisms equal', 'No bias'] },
];

const CREATURE_SCALE = [
  { name: 'Ant', level: 0, color: '#3a4a5a', range: '0-1,000' },
  { name: 'Gecko', level: 1, color: '#5a6a7a', range: '1,000-2,000' },
  { name: 'Komodo', level: 2, color: '#ff6b35', range: '2,000-4,000' },
  { name: 'Silverback', level: 3, color: '#a855f7', range: '4,000-7,000' },
  { name: 'Godzilla', level: 4, color: '#ff2d55', range: '7,000-9,000' },
  { name: 'Bolt', level: 5, color: '#00ff88', range: '9,000-10,000' },
];

const PRISMS = [
  { name: 'Self Mastery', color: '#ff2d55', components: 17, desc: '10 Core Elements + 7 Destroyers (inverse)', subs: ['Beliefs', 'Focus', 'Physiology', 'Identity (GHIC)', 'Integrity', 'Fear → Action', '6 Human Needs', '7 Destroyers ⁻¹'] },
  { name: 'Influence Mastery', color: '#00d4ff', components: 20, desc: '4 Steps + 12 Indispensables + 4 Energies', subs: ['4-Step Model', 'Level 5 Listening', 'Matching/Mirroring', 'ERI', 'Congruence', 'Agreement Formation', '4 Energies', '12 Indispensables'] },
  { name: 'Process Mastery', color: '#00ff88', components: 11, desc: '4 Operator Levers + 7 Marketing Levers', subs: ['Zone Actions', 'Modeling', 'Time Blocking', 'M³ (3Ms)', 'Innovation/Optimization', '7 Levers', '0.8% Identification'] },
];

const WAVE1_BEINGS = [
  { name: 'The Writer', icon: '✍️', id: 1, positions: 224, status: 'ready', creature: 'Ant', formulaScore: 0, techScore: 0, scenarios: ['3-Second Disruption', 'Contrast Email Body', 'VANS Nurture Touch', 'Deposit Page Copy', 'Colosseum Proof Content'] },
  { name: 'The Strategist', icon: '🧠', id: 17, positions: 121, status: 'ready', creature: 'Ant', formulaScore: 0, techScore: 0, scenarios: ['NJ PI Market Analysis', 'Outreach Architecture', 'Campaign Plan ($25M-$50M)', 'Competitor Analysis'] },
  { name: 'The Media Buyer', icon: '📡', id: 6, positions: 101, status: 'waiting', creature: 'Ant', formulaScore: 0, techScore: 0, scenarios: ['Platform Selection', 'Audience Targeting', 'Budget Allocation', 'A/B Creative Testing'] },
  { name: 'The Agreement Maker', icon: '🎯', id: 12, positions: 152, status: 'waiting', creature: 'Ant', formulaScore: 0, techScore: 0, scenarios: ['Inbound Conversation', 'Objection Understanding', 'Value Demonstration', 'Deposit Facilitation'] },
];

function ColosseumApp() {
  const [section, setSection] = useState('overview'); // overview | archetypes | scoring | beings | timeline

  return React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
    // Header
    React.createElement('div', { style: { padding: '16px 24px', background: 'rgba(8,12,24,0.95)', borderBottom: '1px solid #1a2540', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, flexWrap: 'wrap' } },
      React.createElement('div', { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, '⚔️ MARKETING COLOSSEUM'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace' } }, 'Dual Scoring · 6 Archetypes · Creature Scale'),
      React.createElement('div', { style: { display: 'flex', gap: 6, marginLeft: 'auto' } },
        [['overview', 'OVERVIEW'], ['archetypes', 'ARCHETYPES'], ['scoring', 'SCORING'], ['beings', 'WAVE 1'], ['timeline', 'TIMELINE']].map(([v, label]) =>
          React.createElement('button', {
            key: v, onClick: () => setSection(v),
            style: { padding: '4px 12px', background: section === v ? '#1a2540' : 'transparent', border: '1px solid #1a2540', borderRadius: 4, color: section === v ? '#ff2d55' : '#5a6a7a', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }
          }, label)
        )
      )
    ),

    // Content
    React.createElement('div', { style: { flex: 1, overflow: 'auto', padding: 20 } },
      section === 'overview' && React.createElement(ColosseumOverview),
      section === 'archetypes' && React.createElement(ArchetypesView),
      section === 'scoring' && React.createElement(ScoringView),
      section === 'beings' && React.createElement(BeingsView),
      section === 'timeline' && React.createElement(TimelineView),
    )
  );
}

// ========== OVERVIEW ==========
function ColosseumOverview() {
  return React.createElement('div', { style: { maxWidth: 900, margin: '0 auto' } },
    // Hero
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 30 } },
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 2 } }, 'WHAT WOULD SEAN CALLAGY DO?'),
      React.createElement('div', { style: { fontSize: 20, fontWeight: 300, color: '#ff2d55', margin: '8px 0' } }, 'Say? Score? Innovate? Optimize?'),
      React.createElement('div', { style: { fontSize: 12, color: '#5a6a7a', fontFamily: 'monospace' } }, 'Marketing Colosseum · 17 Beings · 2,524 Positions · 500 Visionnaires'),
    ),

    // Three cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 } },
      [
        { label: 'DUAL SCORING', value: '2 Judges', sub: 'Formula + Technical', color: '#ff2d55', detail: 'Every being scored on HOW (39 Formula components) and WHAT (domain craft)' },
        { label: '6 ARCHETYPES', value: '6 Lenses', sub: 'Versions of Sean', color: '#00d4ff', detail: 'Expansive, Heart, Disruptor, Visionary, Zeus, Mastery' },
        { label: 'CREATURE SCALE', value: 'Ant → Bolt', sub: 'Net = weakest organ', color: '#00ff88', detail: 'Ant · Gecko · Komodo · Silverback · Godzilla · Bolt' },
      ].map((c, i) =>
        React.createElement('div', { key: i, style: { background: 'rgba(10,16,30,0.9)', border: `1px solid ${c.color}25`, borderRadius: 10, padding: '20px', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 } }, c.label),
          React.createElement('div', { style: { fontSize: 24, fontWeight: 800, color: c.color } }, c.value),
          React.createElement('div', { style: { fontSize: 11, color: `${c.color}90`, fontFamily: 'monospace', marginTop: 2 } }, c.sub),
          React.createElement('div', { style: { fontSize: 10, color: '#3a4a5a', marginTop: 8 } }, c.detail),
        )
      )
    ),

    // Architecture diagram
    React.createElement('div', { style: { background: 'rgba(10,16,30,0.9)', border: '1px solid #1a254030', borderRadius: 10, padding: 20, marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ff2d55', letterSpacing: 1, marginBottom: 16 } }, 'COLOSSEUM ARCHITECTURE'),
      
      // Recursion levels
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 } },
        [
          { level: 'LEVEL 0', name: 'Beings Compete', desc: 'The 17 beings battle on scenarios. Produce real output. Scored by judges.', color: '#00ff88', status: 'CONTINUOUS' },
          { level: 'LEVEL 1', name: 'Judges Score + Get Scored', desc: '6 archetypes score beings. Inter-judge consistency tracked. Outliers flagged.', color: '#00d4ff', status: 'EVERY ROUND' },
          { level: 'LEVEL 2', name: 'Human Audit', desc: 'Sean + Adam spot-check. Recalibrate judges. The recursion cap.', color: '#ff2d55', status: 'PERIODIC' },
        ].map((l, i) =>
          React.createElement('div', { key: i, style: { padding: 16, border: `1px solid ${l.color}25`, borderRadius: 8, background: `${l.color}05` } },
            React.createElement('div', { style: { fontSize: 9, fontFamily: 'monospace', color: l.color, letterSpacing: 1, marginBottom: 4 } }, l.level),
            React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: '#e0e8f0', marginBottom: 6 } }, l.name),
            React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', lineHeight: 1.4 } }, l.desc),
            React.createElement('div', { style: { fontSize: 9, fontFamily: 'monospace', color: `${l.color}80`, marginTop: 8, padding: '2px 8px', background: `${l.color}10`, borderRadius: 10, display: 'inline-block' } }, l.status),
          )
        )
      ),
    ),

    // Cold Start Bootstrap
    React.createElement('div', { style: { background: 'rgba(10,16,30,0.9)', border: '1px solid #1a254030', borderRadius: 10, padding: 20 } },
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#00ff88', letterSpacing: 1, marginBottom: 12 } }, 'BOOTSTRAP SEQUENCE'),
      React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        [
          { step: '1', label: 'Sean scores 20 outputs', status: '⬜', color: '#5a6a7a' },
          { step: '2', label: 'Judges score same 20', status: '⬜', color: '#5a6a7a' },
          { step: '3', label: 'Calibration delta analysis', status: '⬜', color: '#5a6a7a' },
          { step: '4', label: 'Recalibrate until δ < 0.8', status: '⬜', color: '#5a6a7a' },
          { step: '5', label: 'Deploy Scenario 1', status: '⬜', color: '#5a6a7a' },
          { step: '6', label: 'Run 50 rounds', status: '⬜', color: '#5a6a7a' },
          { step: '7', label: 'Sean spot-checks 5', status: '⬜', color: '#5a6a7a' },
          { step: '8', label: 'Scale to 500 rounds', status: '⬜', color: '#5a6a7a' },
        ].map((s, i) =>
          React.createElement('div', { key: i, style: { padding: '8px 14px', background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement('span', { style: { fontSize: 11 } }, s.status),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 9, color: s.color, fontFamily: 'monospace' } }, `STEP ${s.step}`),
              React.createElement('div', { style: { fontSize: 11, color: '#8899aa' } }, s.label),
            ),
          )
        )
      ),
    ),
  );
}

// ========== ARCHETYPES ==========
function ArchetypesView() {
  const [selected, setSelected] = useState(null);
  return React.createElement('div', { style: { maxWidth: 900, margin: '0 auto' } },
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: '#ff2d55', letterSpacing: 1 } }, '6 VERSIONS OF SEAN CALLAGY'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, 'Scenario Builders · Judges · Innovators · Optimizers'),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 } },
      ARCHETYPE_DATA.map((a, i) =>
        React.createElement('div', {
          key: a.id, onClick: () => setSelected(selected === a.id ? null : a.id),
          style: { padding: 20, background: selected === a.id ? `${a.color}12` : 'rgba(10,16,30,0.9)', border: `1px solid ${selected === a.id ? a.color : a.color + '25'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
            React.createElement('span', { style: { fontSize: 28 } }, a.icon),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 14, fontWeight: 800, color: a.color } }, a.name),
              React.createElement('div', { style: { fontSize: 10, color: `${a.color}80`, fontFamily: 'monospace' } }, a.energy),
            ),
          ),
          React.createElement('div', { style: { fontSize: 11, color: '#8899aa', lineHeight: 1.4, marginBottom: 10 } }, a.desc),
          
          selected === a.id && React.createElement('div', { style: { marginTop: 10, paddingTop: 10, borderTop: `1px solid ${a.color}20` } },
            React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 } }, 'WEIGHTS HEAVIER'),
            a.weights.map((w, j) =>
              React.createElement('div', { key: j, style: { fontSize: 11, color: a.color, padding: '2px 0' } }, `• ${w}`)
            ),
          ),
        )
      )
    ),

    // How they work together
    React.createElement('div', { style: { marginTop: 20, padding: 16, background: 'rgba(10,16,30,0.9)', border: '1px solid #1a254030', borderRadius: 10 } },
      React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: 1, marginBottom: 8 } }, 'HOW THEY WORK TOGETHER'),
      React.createElement('div', { style: { fontSize: 12, color: '#8899aa', lineHeight: 1.6 } },
        'All 6 compete on every function. The archetype that builds the scenario NEVER judges it. Two archetype lenses weight each round\'s final score. Divergence between archetypes REVEALS pillar gaps — that\'s the value. Pure Mastery is the sole arbitrator for calibration disputes.'
      ),
    ),
  );
}

// ========== SCORING ==========
function ScoringView() {
  return React.createElement('div', { style: { maxWidth: 900, margin: '0 auto' } },
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: '#ff2d55', letterSpacing: 1 } }, 'DUAL SCORING SYSTEM'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, 'Net Formula Score = Weakest Organ Drags the Net'),
    ),

    // Three Prisms
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 } },
      PRISMS.map((p, i) =>
        React.createElement('div', { key: i, style: { padding: 20, background: 'rgba(10,16,30,0.9)', border: `1px solid ${p.color}25`, borderRadius: 10 } },
          React.createElement('div', { style: { fontSize: 10, fontFamily: 'monospace', color: p.color, letterSpacing: 1, marginBottom: 4 } }, `PRISM ${i + 1}`),
          React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: p.color, marginBottom: 4 } }, p.name),
          React.createElement('div', { style: { fontSize: 20, fontWeight: 800, color: `${p.color}60` } }, `${p.components}`),
          React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', marginBottom: 10 } }, `${p.components} components · ${p.desc}`),
          p.subs.map((s, j) =>
            React.createElement('div', { key: j, style: { fontSize: 11, color: '#8899aa', padding: '2px 0', borderLeft: `2px solid ${p.color}30`, paddingLeft: 8, marginBottom: 2 } }, s)
          ),
        )
      )
    ),

    // Net Score Formula
    React.createElement('div', { style: { padding: 20, background: 'rgba(10,16,30,0.9)', border: '1px solid #ff2d5525', borderRadius: 10, marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ff2d55', letterSpacing: 1, marginBottom: 12 } }, 'NET SCORE CALCULATION'),
      React.createElement('div', { style: { fontFamily: 'monospace', fontSize: 13, color: '#00ff88', background: '#0a1020', padding: 16, borderRadius: 8, lineHeight: 1.8 } },
        'Net = min(Self, Influence, Process) + 0.2 × (avg_others - min)',
        React.createElement('br'),
        React.createElement('br'),
        React.createElement('span', { style: { color: '#5a6a7a' } }, '// Process Score = Universal (Sean) × weight + Technical (Domain) × weight'),
        React.createElement('br'),
        React.createElement('span', { style: { color: '#5a6a7a' } }, '// Weight shifts by creature level:'),
        React.createElement('br'),
        React.createElement('span', { style: { color: '#5a6a7a' } }, '//   Ant-Gecko: 70% Universal / 30% Technical'),
        React.createElement('br'),
        React.createElement('span', { style: { color: '#5a6a7a' } }, '//   Silverback: 50% / 50%'),
        React.createElement('br'),
        React.createElement('span', { style: { color: '#5a6a7a' } }, '//   Godzilla+: 30% Universal / 70% Technical'),
      ),
    ),

    // Creature Scale
    React.createElement('div', { style: { padding: 20, background: 'rgba(10,16,30,0.9)', border: '1px solid #1a254030', borderRadius: 10 } },
      React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#00ff88', letterSpacing: 1, marginBottom: 12 } }, 'CREATURE SCALE'),
      React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'flex-end' } },
        CREATURE_SCALE.map((c, i) => {
          const heights = [20, 35, 55, 75, 90, 100];
          return React.createElement('div', { key: i, style: { flex: 1, textAlign: 'center' } },
            React.createElement('div', { style: { height: heights[i], background: `${c.color}40`, borderRadius: '4px 4px 0 0', border: `1px solid ${c.color}60`, borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement('span', { style: { fontSize: 9, color: c.color, fontFamily: 'monospace' } }, c.range),
            ),
            React.createElement('div', { style: { padding: '6px 4px', background: `${c.color}20`, borderRadius: '0 0 4px 4px', border: `1px solid ${c.color}40` } },
              React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: c.color } }, c.name),
            ),
          );
        })
      ),
    ),
  );
}

// ========== WAVE 1 BEINGS ==========
function BeingsView() {
  return React.createElement('div', { style: { maxWidth: 900, margin: '0 auto' } },
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: '#ff2d55', letterSpacing: 1 } }, 'WAVE 1 — DEPLOY NOW'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, '500 Visionnaires · Legal Vertical · PI First'),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 } },
      WAVE1_BEINGS.map((b, i) => {
        const statusColors = { ready: '#00ff88', waiting: '#ffcc00', active: '#ff2d55' };
        const sc = statusColors[b.status] || '#5a6a7a';
        return React.createElement('div', { key: i, style: { padding: 20, background: 'rgba(10,16,30,0.9)', border: `1px solid ${sc}25`, borderRadius: 10 } },
          // Header
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 } },
            React.createElement('span', { style: { fontSize: 32 } }, b.icon),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: '#e0e8f0' } }, b.name),
              React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace' } }, `Being #${b.id} · ${b.positions} positions`),
            ),
            React.createElement('div', { style: { padding: '4px 10px', background: `${sc}15`, border: `1px solid ${sc}30`, borderRadius: 12, fontSize: 10, color: sc, fontFamily: 'monospace', textTransform: 'uppercase' } }, b.status),
          ),

          // Creature Level
          React.createElement('div', { style: { marginBottom: 12 } },
            React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', marginBottom: 4 } }, 'CREATURE LEVEL'),
            React.createElement('div', { style: { display: 'flex', gap: 3 } },
              CREATURE_SCALE.map((c, j) =>
                React.createElement('div', { key: j, style: { flex: 1, height: 6, background: c.name === b.creature ? c.color : '#0a1020', borderRadius: 3 } })
              )
            ),
            React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', marginTop: 4 } }, `Current: ${b.creature}`),
          ),

          // Dual Score
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 } },
            [
              { label: 'FORMULA', value: b.formulaScore || '—', color: '#ff2d55' },
              { label: 'TECHNICAL', value: b.techScore || '—', color: '#00d4ff' },
              { label: 'NET', value: (b.formulaScore && b.techScore) ? Math.min(b.formulaScore, b.techScore).toFixed(1) : '—', color: '#00ff88' },
            ].map((s, j) =>
              React.createElement('div', { key: j, style: { textAlign: 'center', padding: '6px', background: '#0a1020', borderRadius: 6 } },
                React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace' } }, s.label),
                React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: s.value === '—' ? '#2a3a4a' : s.color } }, s.value),
              )
            )
          ),

          // Scenarios
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 } }, 'SCENARIOS'),
            b.scenarios.map((s, j) =>
              React.createElement('div', { key: j, style: { fontSize: 11, color: '#8899aa', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 } },
                React.createElement('span', { style: { fontSize: 8, color: '#2a3a4a' } }, '⬜'),
                s,
              )
            )
          ),
        );
      })
    ),
  );
}

// ========== TIMELINE ==========
function TimelineView() {
  const phases = [
    { days: '1-2', label: 'Map 39 components into active dimensions', status: '⬜', color: '#5a6a7a' },
    { days: '2-3', label: 'Build Formula Judge prompt + creature scale scoring', status: '⬜', color: '#5a6a7a' },
    { days: '2-3', label: 'Build Technical Judge prompt (PI legal first)', status: '⬜', color: '#5a6a7a' },
    { days: '3', label: 'Build 6 archetype weighting profiles', status: '⬜', color: '#5a6a7a' },
    { days: '3-5', label: 'Sean scores 20 calibration outputs', status: '⬜', color: '#5a6a7a' },
    { days: '5-7', label: 'Judges score same 20 + calibration delta', status: '⬜', color: '#5a6a7a' },
    { days: '7-9', label: 'Recalibrate until delta < 0.8', status: '⬜', color: '#5a6a7a' },
    { days: '10', label: 'Deploy Scenario 1: 3-Second Disruption', status: '⬜', color: '#ff2d55' },
    { days: '11-14', label: 'Run Scenarios 2-5 ascending', status: '⬜', color: '#ff2d55' },
    { days: '15+', label: 'Extract compound intelligence → Writer v2', status: '⬜', color: '#00ff88' },
  ];

  return React.createElement('div', { style: { maxWidth: 700, margin: '0 auto' } },
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 24 } },
      React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: '#ff2d55', letterSpacing: 1 } }, '14-DAY IMPLEMENTATION'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, 'From zero to operational Marketing Colosseum'),
    ),

    phases.map((p, i) =>
      React.createElement('div', { key: i, style: { display: 'flex', gap: 16, marginBottom: 4 } },
        // Timeline line
        React.createElement('div', { style: { width: 50, textAlign: 'right', paddingTop: 10 } },
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: p.color, fontFamily: 'monospace' } }, `D${p.days}`),
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 } },
          React.createElement('div', { style: { width: 12, height: 12, borderRadius: '50%', background: `${p.color}30`, border: `2px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 } }, p.status === '✅' ? '✅' : ''),
          i < phases.length - 1 && React.createElement('div', { style: { width: 2, height: 30, background: '#1a2540' } }),
        ),
        React.createElement('div', { style: { flex: 1, padding: '6px 12px', background: 'rgba(10,16,30,0.9)', border: `1px solid ${p.color}15`, borderRadius: 6 } },
          React.createElement('div', { style: { fontSize: 12, color: '#c8d4e0' } }, p.label),
        ),
      )
    ),

    // North Star
    React.createElement('div', { style: { marginTop: 30, padding: 20, background: 'rgba(255,45,85,0.05)', border: '1px solid #ff2d5520', borderRadius: 10, textAlign: 'center' } },
      React.createElement('div', { style: { fontSize: 11, color: '#ff2d55', fontFamily: 'monospace', letterSpacing: 2 } }, 'THE NORTH STAR'),
      React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#e0e8f0', margin: '8px 0' } }, '500 Visionnaire Programs'),
      React.createElement('div', { style: { fontSize: 12, color: '#5a6a7a' } }, '$50K-$100K each · $25M-$50M · End of May 2026'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, 'Legal Vertical: PI → Commercial Lit → Family Law'),
    ),
  );
}

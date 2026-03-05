// Using React hooks from global scope (shared with App.jsx)

const TYPE_COLORS = { 'Being': '#ff2d55', 'Contractor': '#00d4ff', 'Baby': '#5a6a7a' };
const TYPE_ICONS = { 'Being': '🔥', 'Contractor': '🔵', 'Baby': '⚪' };
const FAMILY_COLORS = {
  'DATA & ANALYTICS': '#00ff88',
  'DIGITAL MARKETING & TECH': '#a855f7',
  'EVENTS & STAGES': '#ff6b35',
  'EXPERIENCE & IMPACT': '#00d4ff',
  'MEDIA PRODUCTION': '#ffcc00',
  'OTHER': '#8899aa',
  'REVENUE & RELATIONSHIPS': '#ff2d55',
  'VISUAL DESIGN': '#ff69b4',
  'WRITING & COPY': '#4ecdc4',
};

function ArchApp() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [view, setView] = useState('kai17'); // kai17 | hierarchy | grid | stats
  const [selectedKai, setSelectedKai] = useState(null);

  useEffect(() => {
    fetch('./hierarchy.json').then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 18, color: '#5a6a7a' } }, 'Loading architecture...');

  const totalBeings = data.families.reduce((s, f) => s + f.beings.filter(b => b.type === 'Being').length, 0);
  const totalContractors = data.families.reduce((s, f) => s + f.beings.filter(b => b.type === 'Contractor').length, 0);
  const totalBabies = data.families.reduce((s, f) => s + f.beings.filter(b => b.type === 'Baby').length, 0);
  const totalPositions = data.families.reduce((s, f) => s + f.totalPositions, 0);

  return React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
    // Header
    React.createElement('div', { style: { padding: '16px 24px', background: 'rgba(8,12,24,0.95)', borderBottom: '1px solid #1a2540', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, flexWrap: 'wrap' } },
      React.createElement('div', { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, '⚔️ ACT-I BEING ARCHITECTURE'),
      React.createElement('div', { style: { fontSize: 12, color: '#5a6a7a', fontFamily: 'monospace' } },
        view === 'kai17' 
          ? `17 beings · 2,524 positions · 7 Levers`
          : `${data.families.length} families · ${totalBeings + totalContractors + totalBabies} clusters · ${totalPositions} positions`
      ),
      React.createElement('div', { style: { display: 'flex', gap: 12, marginLeft: 'auto' } },
        view !== 'kai17' && React.createElement('span', { style: { fontSize: 11, color: TYPE_COLORS.Being, fontFamily: 'monospace' } }, `🔥 ${totalBeings} Beings`),
        view !== 'kai17' && React.createElement('span', { style: { fontSize: 11, color: TYPE_COLORS.Contractor, fontFamily: 'monospace' } }, `🔵 ${totalContractors} Contractors`),
        view !== 'kai17' && React.createElement('span', { style: { fontSize: 11, color: TYPE_COLORS.Baby, fontFamily: 'monospace' } }, `⚪ ${totalBabies} Babies`),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 6 } },
        [['kai17', '17 BEINGS'], ['hierarchy', 'CLUSTERS'], ['grid', 'GRID'], ['stats', 'STATS']].map(([v, label]) =>
          React.createElement('button', {
            key: v, onClick: () => { setView(v); setSelected(null); setSelectedKai(null); },
            style: { padding: '4px 12px', background: view === v ? '#1a2540' : 'transparent', border: '1px solid #1a2540', borderRadius: 4, color: view === v ? '#00ff88' : '#5a6a7a', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace' }
          }, label)
        )
      )
    ),

    // Main content
    React.createElement('div', { style: { flex: 1, display: 'flex', overflow: 'hidden' } },
      // Left panel
      React.createElement('div', { style: { width: (selected || selectedKai) ? '55%' : '100%', overflow: 'auto', padding: 20, transition: 'width 0.3s' } },
        view === 'kai17' && React.createElement(Kai17View, { data, selectedKai, setSelectedKai }),
        view === 'hierarchy' && React.createElement(HierarchyView, { data, expandedFamily, setExpandedFamily, selected, setSelected }),
        view === 'grid' && React.createElement(GridView, { data, selected, setSelected }),
        view === 'stats' && React.createElement(StatsView, { data }),
      ),

      // Right panel - detail
      selected && view !== 'kai17' && React.createElement('div', { style: { width: '45%', borderLeft: '1px solid #1a2540', overflow: 'auto', padding: 20, background: 'rgba(8,12,24,0.98)' } },
        React.createElement(DetailPanel, { being: selected, onClose: () => setSelected(null) })
      ),
      selectedKai && view === 'kai17' && React.createElement('div', { style: { width: '45%', borderLeft: '1px solid #1a2540', overflow: 'auto', padding: 20, background: 'rgba(8,12,24,0.98)' } },
        React.createElement(KaiDetailPanel, { being: selectedKai, data, onClose: () => setSelectedKai(null) })
      ),
    )
  );
}

// ========== KAI 17 BEINGS VIEW ==========

function Kai17View({ data, selectedKai, setSelectedKai }) {
  const kaiBeings = data.kaiBeings || [];
  const sorted = [...kaiBeings].sort((a, b) => b.positions - a.positions);
  const maxPos = sorted.length > 0 ? sorted[0].positions : 1;

  return React.createElement('div', null,
    // Title section
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 24 } },
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 6 } }, 'EINSTEIN\'S RAZOR'),
      React.createElement('div', { style: { fontSize: 16, fontWeight: 300, color: '#c8d4e0', fontStyle: 'italic', marginBottom: 4 } }, '"As simple as possible, but not simpler."'),
      React.createElement('div', { style: { fontSize: 13, color: '#00ff88', fontFamily: 'monospace', fontWeight: 700 } }, '2,524 positions → 17 beings → 7 Levers'),
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 8 } }, 'Consolidated by Kai · Influence, Marketing & Sales Engine'),
    ),

    // Shared Heart Skills banner
    React.createElement('div', { style: { background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('span', { style: { fontSize: 16 } }, '💚'),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#00ff88', letterSpacing: 1 } }, 'SHARED HEART SKILLS — ALL 17 BEINGS'),
        React.createElement('div', { style: { fontSize: 10, color: '#00ff8890', fontFamily: 'monospace', marginTop: 2 } }, 'Level 5 Listening · Speaking Into Truth · GHIC · 4-Step Communication Model (4-1-2-4)'),
      ),
    ),

    // The 17 beings as cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 } },
      sorted.map((b, i) => {
        const isSelected = selectedKai && selectedKai.id === b.id;
        const barWidth = (b.positions / maxPos) * 100;
        
        return React.createElement('div', {
          key: b.id,
          onClick: () => setSelectedKai(b),
          style: {
            padding: '14px 16px', cursor: 'pointer', borderRadius: 10,
            background: isSelected ? `${b.color}12` : 'rgba(10,16,30,0.9)',
            border: `1px solid ${isSelected ? b.color : b.color + '25'}`,
            transition: 'all 0.2s',
          }
        },
          // Top row: icon, name, position count
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
            React.createElement('span', { style: { fontSize: 22 } }, b.icon),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: 15, fontWeight: 800, color: b.color } }, b.name),
              React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace' } }, `#${b.id} · Lever ${b.levers}`),
            ),
            React.createElement('div', { style: { textAlign: 'right' } },
              React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: b.color } }, b.positions),
              React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace' } }, b.pct),
            ),
          ),
          // Craft skill
          React.createElement('div', { style: { fontSize: 11, color: '#8899aa', lineHeight: 1.4, marginBottom: 8 } }, b.craft),
          // Position bar
          React.createElement('div', { style: { height: 4, background: '#0a1020', borderRadius: 2, overflow: 'hidden' } },
            React.createElement('div', { style: { width: `${barWidth}%`, height: '100%', background: `${b.color}80`, borderRadius: 2, transition: 'width 0.5s' } }),
          ),
        );
      })
    ),

    // Bottom summary
    React.createElement('div', { style: { marginTop: 24, padding: '16px 20px', background: 'rgba(10,16,30,0.9)', border: '1px solid #1a254030', borderRadius: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' } },
      [
        { label: 'BEINGS', value: '17', sub: 'core team', color: '#ff2d55' },
        { label: 'POSITIONS', value: '2,524', sub: 'every role mapped', color: '#00ff88' },
        { label: 'LARGEST', value: 'Analyst', sub: '429 positions (17%)', color: '#00ff88' },
        { label: 'SMALLEST', value: 'Messenger', sub: '26 positions (1%)', color: '#4ecdc4' },
      ].map((s, i) =>
        React.createElement('div', { key: i },
          React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: s.color } }, s.value),
          React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginTop: 2 } }, s.label),
          React.createElement('div', { style: { fontSize: 9, color: '#3a4a5a', fontFamily: 'monospace', marginTop: 1 } }, s.sub),
        )
      )
    ),

    // Lever Coverage Matrix
    React.createElement('div', { style: { marginTop: 20, padding: '16px 20px', background: 'rgba(10,16,30,0.9)', border: '1px solid #1a254030', borderRadius: 10 } },
      React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: 1, marginBottom: 12 } }, '7 LEVER COVERAGE'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'auto repeat(8, 1fr)', gap: '2px 4px', fontSize: 10, fontFamily: 'monospace' } },
        // Header row
        React.createElement('div', { style: { color: '#5a6a7a', padding: '4px 8px' } }, ''),
        ...['0.5', '1', '2', '3', '4', '5', '6', '7'].map(l =>
          React.createElement('div', { key: l, style: { color: '#5a6a7a', textAlign: 'center', padding: '4px 0', borderBottom: '1px solid #1a2540' } }, `L${l}`)
        ),
        // Being rows
        ...sorted.map(b => {
          const levers = (b.levers || '').split(',').map(l => l.trim());
          return React.createElement(React.Fragment, { key: b.id },
            React.createElement('div', { style: { color: b.color, padding: '3px 8px', fontSize: 9, whiteSpace: 'nowrap' } }, `${b.icon} ${b.name}`),
            ...['0.5', '1', '2', '3', '4', '5', '6', '7'].map(l =>
              React.createElement('div', { key: l, style: { textAlign: 'center', padding: '3px 0' } },
                levers.includes(l) ? React.createElement('span', { style: { color: b.color } }, '●') : React.createElement('span', { style: { color: '#1a2540' } }, '·')
              )
            )
          );
        })
      ),
    ),
  );
}

function KaiDetailPanel({ being, data, onClose }) {
  // Find clusters that map to this Kai being
  const clusters = [];
  (data.families || []).forEach(fam => {
    fam.beings.forEach(b => {
      if (b.kaiBeing === being.name) clusters.push({ ...b, family: fam.name });
    });
  });

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('span', { style: { fontSize: 28 } }, being.icon),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 20, fontWeight: 800, color: being.color } }, being.name),
          React.createElement('div', { style: { fontSize: 11, color: `${being.color}90`, fontFamily: 'monospace' } }, `Being #${being.id} · ${being.positions} positions · ${being.pct} of total`),
        ),
      ),
      React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', color: '#5a6a7a', cursor: 'pointer', fontSize: 18 } }, '✕'),
    ),

    // Craft
    React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'CRAFT SKILL'),
      React.createElement('div', { style: { fontSize: 13, color: '#e0e8f0', lineHeight: 1.5 } }, being.craft),
    ),

    // Colosseum Training
    React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'COLOSSEUM TRAINING'),
      React.createElement('div', { style: { fontSize: 12, color: '#e0e8f0', lineHeight: 1.5 } }, being.colosseum),
    ),

    // Levers
    React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 } }, 'LEVER COVERAGE'),
      React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        (being.levers || '').split(',').map(l => l.trim()).filter(Boolean).map(l =>
          React.createElement('span', { key: l, style: { padding: '3px 10px', background: `${being.color}15`, border: `1px solid ${being.color}30`, borderRadius: 12, fontSize: 11, color: being.color, fontFamily: 'monospace' } }, `Lever ${l}`)
        )
      ),
    ),

    // Heart Skills
    React.createElement('div', { style: { marginBottom: 16, padding: 12, background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 6 } },
      React.createElement('div', { style: { fontSize: 10, color: '#00ff88', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, '💚 SHARED HEART SKILLS'),
      React.createElement('div', { style: { fontSize: 11, color: '#00ff8880', lineHeight: 1.5 } }, 'Level 5 Listening · Speaking Into Truth · GHIC (Growth-driven, Heart-centered, Integrous, Committed to Mastery) · 4-Step Communication Model (4-1-2-4)'),
    ),

    // Mapped clusters
    clusters.length > 0 && React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 8 } }, `CLUSTERS MAPPED TO THIS BEING (${clusters.length})`),
      React.createElement('div', { style: { maxHeight: 300, overflowY: 'auto', borderRadius: 6, border: '1px solid #1a2540' } },
        clusters.map((c, i) => {
          const tc = TYPE_COLORS[c.type] || '#5a6a7a';
          return React.createElement('div', { key: i, style: { padding: '8px 10px', borderLeft: `3px solid ${tc}`, marginBottom: 1, background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement('span', { style: { fontSize: 11 } }, TYPE_ICONS[c.type]),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: tc } }, c.name),
              React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace' } }, `${c.family} · ${c.craft}`),
            ),
            React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace' } }, `${c.positions}p`),
          );
        })
      ),
    ),

    // Architecture note
    React.createElement('div', { style: { marginTop: 16, padding: 12, background: `${being.color}08`, border: `1px solid ${being.color}15`, borderRadius: 6 } },
      React.createElement('div', { style: { fontSize: 10, color: being.color, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, '🔥 PERSISTENT BEING'),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', lineHeight: 1.4 } },
        'Persistent memory via Pinecone. Full identity. Learns and compounds over time. 24/7 crew. Heart skills are the floor — craft skills are the differentiation.'
      ),
    ),
  );
}

// ========== ORIGINAL VIEWS (unchanged) ==========

function HierarchyView({ data, expandedFamily, setExpandedFamily, selected, setSelected }) {
  return React.createElement('div', null,
    // CEO
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 20 } },
      React.createElement('div', { style: { display: 'inline-block', background: 'rgba(255,45,85,0.1)', border: '2px solid #ff2d55', borderRadius: 10, padding: '12px 30px' } },
        React.createElement('div', { style: { fontSize: 14, fontWeight: 800, color: '#ff2d55' } }, '👑 SAI PRIME'),
        React.createElement('div', { style: { fontSize: 10, color: '#ff2d5590', fontFamily: 'monospace' } }, 'CEO / Orchestrator · Being'),
      ),
      React.createElement('div', { style: { width: 2, height: 20, background: '#1a2540', margin: '0 auto' } }),
    ),

    // EA
    React.createElement('div', { style: { textAlign: 'center', marginBottom: 20 } },
      React.createElement('div', { style: { display: 'inline-block', background: 'rgba(255,45,85,0.05)', border: '1px solid #ff2d5560', borderRadius: 8, padding: '8px 24px' } },
        React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: '#ff2d55' } }, '🎯 Executive Assistant'),
        React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace' } }, 'Stitches chief outputs · Being'),
      ),
      React.createElement('div', { style: { width: 2, height: 20, background: '#1a2540', margin: '0 auto' } }),
    ),

    // Families
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 } },
      data.families.map((fam, i) => {
        const color = FAMILY_COLORS[fam.name] || '#8899aa';
        const isExpanded = expandedFamily === fam.name;
        const beings = fam.beings.filter(b => b.type === 'Being').length;
        const contractors = fam.beings.filter(b => b.type === 'Contractor').length;
        const babies = fam.beings.filter(b => b.type === 'Baby').length;

        return React.createElement('div', { key: i, style: { background: 'rgba(10,16,30,0.9)', border: `1px solid ${color}30`, borderRadius: 8, overflow: 'hidden' } },
          React.createElement('div', {
            onClick: () => setExpandedFamily(isExpanded ? null : fam.name),
            style: { padding: '10px 14px', cursor: 'pointer', borderBottom: isExpanded ? `1px solid ${color}20` : 'none', display: 'flex', alignItems: 'center', gap: 10 }
          },
            React.createElement('div', { style: { width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 } }),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color, letterSpacing: 0.5 } }, fam.name),
              React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace' } },
                `${fam.clusters} clusters · ${fam.totalPositions} positions · 🔥${beings} 🔵${contractors} ⚪${babies}`
              ),
            ),
            React.createElement('div', { style: { fontSize: 14, color: '#5a6a7a', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } }, '▸'),
          ),
          isExpanded && React.createElement('div', { style: { padding: '6px 8px', maxHeight: 400, overflowY: 'auto' } },
            fam.beings.map((b, j) => {
              const tc = TYPE_COLORS[b.type] || '#5a6a7a';
              const isSelected = selected && selected.id === b.id;
              return React.createElement('div', {
                key: j, onClick: () => setSelected(b),
                style: { padding: '8px 10px', cursor: 'pointer', borderRadius: 6, marginBottom: 3, background: isSelected ? `${tc}15` : 'transparent', border: isSelected ? `1px solid ${tc}40` : '1px solid transparent', display: 'flex', alignItems: 'center', gap: 8 }
              },
                React.createElement('span', { style: { fontSize: 12 } }, TYPE_ICONS[b.type] || '⚪'),
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: tc } }, b.name),
                  React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace' } }, b.craft),
                ),
                b.kaiBeing && React.createElement('div', { style: { fontSize: 8, color: '#5a6a7a', fontFamily: 'monospace', background: '#0a1020', padding: '2px 6px', borderRadius: 3 } }, b.kaiBeing),
                React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace' } }, `${b.positions}p`),
              );
            })
          ),
        );
      })
    )
  );
}

function GridView({ data, selected, setSelected }) {
  const allBeings = data.families.flatMap(f => f.beings);
  const sorted = [...allBeings].sort((a, b) => b.positions - a.positions);

  return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 } },
    sorted.map((b, i) => {
      const tc = TYPE_COLORS[b.type] || '#5a6a7a';
      const isSelected = selected && selected.id === b.id;
      return React.createElement('div', {
        key: i, onClick: () => setSelected(b),
        style: { padding: '10px 12px', cursor: 'pointer', borderRadius: 8, background: isSelected ? `${tc}15` : 'rgba(10,16,30,0.9)', border: `1px solid ${isSelected ? tc : tc + '25'}` }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 } },
          React.createElement('span', { style: { fontSize: 14 } }, TYPE_ICONS[b.type] || '⚪'),
          React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: tc } }, b.name),
        ),
        React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace', marginBottom: 4 } }, b.craft),
        React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace' } }, `${b.positions} positions · Lever ${b.levers}`),
        b.kaiBeing && React.createElement('div', { style: { fontSize: 8, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4, background: '#0a1020', padding: '2px 6px', borderRadius: 3, display: 'inline-block' } }, `→ ${b.kaiBeing}`),
      );
    })
  );
}

function StatsView({ data }) {
  const allBeings = data.families.flatMap(f => f.beings);
  const kaiBeings = data.kaiBeings || [];

  return React.createElement('div', { style: { maxWidth: 800, margin: '0 auto' } },
    React.createElement('h2', { style: { fontSize: 16, marginBottom: 20, color: '#00ff88', letterSpacing: 1 } }, '📊 ARCHITECTURE STATS'),

    // Summary cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 30 } },
      [
        { label: 'Kai Beings', value: kaiBeings.length, color: '#ff2d55' },
        { label: 'Total Clusters', value: allBeings.length, color: '#00ff88' },
        { label: 'Total Positions', value: '2,524', color: '#00d4ff' },
        { label: 'Skill Families', value: data.families.length, color: '#ffcc00' },
      ].map((s, i) =>
        React.createElement('div', { key: i, style: { background: 'rgba(10,16,30,0.9)', border: `1px solid ${s.color}30`, borderRadius: 8, padding: '16px', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: s.color } }, s.value),
          React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, s.label),
        )
      )
    ),

    // Kai 17 beings ranked
    React.createElement('h3', { style: { fontSize: 13, color: '#ff2d55', marginBottom: 10, letterSpacing: 1 } }, '17 BEINGS BY SIZE'),
    ...[...kaiBeings].sort((a, b) => b.positions - a.positions).map((b, i) => {
      const maxPos = kaiBeings.reduce((m, x) => Math.max(m, x.positions), 0);
      return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
        React.createElement('div', { style: { width: 24, fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', textAlign: 'right' } }, `${i + 1}.`),
        React.createElement('span', { style: { fontSize: 14 } }, b.icon),
        React.createElement('div', { style: { width: 140, fontSize: 12, fontWeight: 600, color: b.color } }, b.name),
        React.createElement('div', { style: { flex: 1, height: 14, background: '#0a1020', borderRadius: 3, overflow: 'hidden' } },
          React.createElement('div', { style: { width: `${(b.positions / maxPos) * 100}%`, height: '100%', background: `${b.color}60`, borderRadius: 3 } }),
        ),
        React.createElement('div', { style: { width: 60, fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', textAlign: 'right' } }, `${b.positions}p`),
        React.createElement('div', { style: { width: 40, fontSize: 10, color: '#3a4a5a', fontFamily: 'monospace', textAlign: 'right' } }, b.pct),
      );
    }),

    // Family breakdown
    React.createElement('h3', { style: { fontSize: 13, color: '#00d4ff', marginBottom: 10, marginTop: 24, letterSpacing: 1 } }, 'BY SKILL FAMILY'),
    data.families.map((f, i) => {
      const color = FAMILY_COLORS[f.name] || '#8899aa';
      return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
        React.createElement('div', { style: { width: 8, height: 8, borderRadius: '50%', background: color } }),
        React.createElement('div', { style: { width: 200, fontSize: 11, color } }, f.name),
        React.createElement('div', { style: { flex: 1, height: 14, background: '#0a1020', borderRadius: 3, overflow: 'hidden' } },
          React.createElement('div', { style: { width: `${(f.totalPositions / 500) * 100}%`, height: '100%', background: `${color}60`, borderRadius: 3 } }),
        ),
        React.createElement('div', { style: { width: 80, fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', textAlign: 'right' } }, `${f.clusters}c · ${f.totalPositions}p`),
      );
    }),
  );
}

function DetailPanel({ being, onClose }) {
  const tc = TYPE_COLORS[being.type] || '#5a6a7a';
  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('span', { style: { fontSize: 24 } }, TYPE_ICONS[being.type]),
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: tc } }, being.name),
          React.createElement('div', { style: { fontSize: 11, color: `${tc}90`, fontFamily: 'monospace' } }, `${being.type} · ${being.positions} positions · Lever ${being.levers}`),
        ),
      ),
      React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', color: '#5a6a7a', cursor: 'pointer', fontSize: 18 } }, '✕'),
    ),

    being.kaiBeing && React.createElement('div', { style: { marginBottom: 12, padding: '6px 12px', background: '#0a1020', borderRadius: 6, fontSize: 11, color: '#00ff88', fontFamily: 'monospace', display: 'inline-block' } }, `→ Kai Being: ${being.kaiBeing}`),

    React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'CRAFT SKILL'),
      React.createElement('div', { style: { fontSize: 13, color: '#e0e8f0', lineHeight: 1.4 } }, being.craft),
    ),

    being.craftSkills && React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'UNIQUE SKILLS (COLOSSEUM TRAINING)'),
      React.createElement('div', { style: { fontSize: 12, color: '#e0e8f0', lineHeight: 1.5 } }, being.craftSkills),
    ),

    being.heartSkills && React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'SHARED HEART SKILLS'),
      React.createElement('div', { style: { fontSize: 12, color: '#00ff8890', lineHeight: 1.5 } }, being.heartSkills),
    ),

    React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 8 } },
        `ALL POSITIONS (${being.fullPositions ? being.fullPositions.length : being.positions} mapped of ${being.declaredTotal || being.positions} total)`
      ),
      React.createElement('div', { style: { maxHeight: 400, overflowY: 'auto', borderRadius: 6, border: '1px solid #1a2540', padding: 4 } },
        (being.fullPositions || []).map((p, i) =>
          React.createElement('div', { key: i, style: { padding: '6px 8px', borderLeft: `2px solid ${tc}25`, marginBottom: 2, borderRadius: 2, background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' } },
            React.createElement('div', { style: { fontSize: 11, color: '#c8d4e0', fontWeight: 600 } }, typeof p === 'string' ? p : p.title),
            typeof p === 'object' && p.description && React.createElement('div', { style: { fontSize: 10, color: '#5a8a6a', fontStyle: 'italic', marginTop: 2, lineHeight: 1.3 } }, p.description),
          )
        ),
        being.fullPositions && being.fullPositions.length < (being.declaredTotal || being.positions) &&
          React.createElement('div', { style: { padding: '8px', fontSize: 10, color: '#5a6a7a', fontStyle: 'italic', textAlign: 'center' } },
            `+ ${(being.declaredTotal || being.positions) - being.fullPositions.length} more positions`
          ),
      ),
    ),

    React.createElement('div', { style: { marginTop: 20, padding: 12, background: `${tc}08`, border: `1px solid ${tc}20`, borderRadius: 6 } },
      React.createElement('div', { style: { fontSize: 10, color: tc, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } },
        being.type === 'Being' ? '🔥 PERSISTENT BEING' : being.type === 'Contractor' ? '🔵 CONTEXT-INJECTED CONTRACTOR' : '⚪ DISPOSABLE BABY'
      ),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', lineHeight: 1.4 } },
        being.type === 'Being' ? 'Persistent memory via Pinecone. Runs ongoing. Knows the mission. Has continuity across sessions.' :
        being.type === 'Contractor' ? 'Gets Pinecone context injection before each task. Reports to a Being.' :
        'One-shot execution. No memory. No context. Supervised by Workers or Contractors.'
      ),
    ),
  );
}

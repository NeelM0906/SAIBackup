const { useState, useEffect, useCallback, useRef } = React;

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

function App() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [view, setView] = useState('hierarchy'); // hierarchy | grid | stats

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
    React.createElement('div', { style: { padding: '16px 24px', background: 'rgba(8,12,24,0.95)', borderBottom: '1px solid #1a2540', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 } },
      React.createElement('div', { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, '⚔️ ACT-I BEING ARCHITECTURE'),
      React.createElement('div', { style: { fontSize: 12, color: '#5a6a7a', fontFamily: 'monospace' } },
        `${data.families.length} families · ${totalBeings + totalContractors + totalBabies} clusters · ${totalPositions} positions`
      ),
      React.createElement('div', { style: { display: 'flex', gap: 12, marginLeft: 'auto' } },
        React.createElement('span', { style: { fontSize: 11, color: TYPE_COLORS.Being, fontFamily: 'monospace' } }, `🔥 ${totalBeings} Beings`),
        React.createElement('span', { style: { fontSize: 11, color: TYPE_COLORS.Contractor, fontFamily: 'monospace' } }, `🔵 ${totalContractors} Contractors`),
        React.createElement('span', { style: { fontSize: 11, color: TYPE_COLORS.Baby, fontFamily: 'monospace' } }, `⚪ ${totalBabies} Babies`),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 6 } },
        ['hierarchy', 'grid', 'stats'].map(v =>
          React.createElement('button', {
            key: v, onClick: () => setView(v),
            style: { padding: '4px 12px', background: view === v ? '#1a2540' : 'transparent', border: '1px solid #1a2540', borderRadius: 4, color: view === v ? '#00ff88' : '#5a6a7a', cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase' }
          }, v)
        )
      )
    ),

    // Main content
    React.createElement('div', { style: { flex: 1, display: 'flex', overflow: 'hidden' } },
      // Left panel - hierarchy
      React.createElement('div', { style: { width: selected ? '55%' : '100%', overflow: 'auto', padding: 20, transition: 'width 0.3s' } },
        view === 'hierarchy' && React.createElement(HierarchyView, { data, expandedFamily, setExpandedFamily, selected, setSelected }),
        view === 'grid' && React.createElement(GridView, { data, selected, setSelected }),
        view === 'stats' && React.createElement(StatsView, { data }),
      ),

      // Right panel - detail
      selected && React.createElement('div', { style: { width: '45%', borderLeft: '1px solid #1a2540', overflow: 'auto', padding: 20, background: 'rgba(8,12,24,0.98)' } },
        React.createElement(DetailPanel, { being: selected, onClose: () => setSelected(null) })
      )
    )
  );
}

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
          // Family header
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

          // Expanded beings
          isExpanded && React.createElement('div', { style: { padding: '6px 8px', maxHeight: 400, overflowY: 'auto' } },
            fam.beings.map((b, j) => {
              const tc = TYPE_COLORS[b.type] || '#5a6a7a';
              const isSelected = selected && selected.id === b.id;
              return React.createElement('div', {
                key: j,
                onClick: () => setSelected(b),
                style: {
                  padding: '8px 10px', cursor: 'pointer', borderRadius: 6, marginBottom: 3,
                  background: isSelected ? `${tc}15` : 'transparent',
                  border: isSelected ? `1px solid ${tc}40` : '1px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 8,
                }
              },
                React.createElement('span', { style: { fontSize: 12 } }, TYPE_ICONS[b.type] || '⚪'),
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { style: { fontSize: 12, fontWeight: 600, color: tc } }, b.name),
                  React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace' } }, b.craft),
                ),
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
        key: i,
        onClick: () => setSelected(b),
        style: {
          padding: '10px 12px', cursor: 'pointer', borderRadius: 8,
          background: isSelected ? `${tc}15` : 'rgba(10,16,30,0.9)',
          border: `1px solid ${isSelected ? tc : tc + '25'}`,
        }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 } },
          React.createElement('span', { style: { fontSize: 14 } }, TYPE_ICONS[b.type] || '⚪'),
          React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: tc } }, b.name),
        ),
        React.createElement('div', { style: { fontSize: 9, color: '#5a6a7a', fontFamily: 'monospace', marginBottom: 4 } }, b.craft),
        React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace' } }, `${b.positions} positions · Lever ${b.levers}`),
      );
    })
  );
}

function StatsView({ data }) {
  const allBeings = data.families.flatMap(f => f.beings);
  const byType = { 'Being': [], 'Contractor': [], 'Baby': [] };
  allBeings.forEach(b => { if (byType[b.type]) byType[b.type].push(b); });

  return React.createElement('div', { style: { maxWidth: 800, margin: '0 auto' } },
    React.createElement('h2', { style: { fontSize: 16, marginBottom: 20, color: '#00ff88', letterSpacing: 1 } }, '📊 ARCHITECTURE STATS'),

    // Summary cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 30 } },
      [
        { label: 'Total Clusters', value: allBeings.length, color: '#00ff88' },
        { label: 'Beings (Persistent)', value: byType.Being.length, color: '#ff2d55' },
        { label: 'Contractors (Context)', value: byType.Contractor.length, color: '#00d4ff' },
        { label: 'Babies (Disposable)', value: byType.Baby.length, color: '#5a6a7a' },
      ].map((s, i) =>
        React.createElement('div', { key: i, style: { background: 'rgba(10,16,30,0.9)', border: `1px solid ${s.color}30`, borderRadius: 8, padding: '16px', textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: s.color } }, s.value),
          React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', marginTop: 4 } }, s.label),
        )
      )
    ),

    // Top 10 largest
    React.createElement('h3', { style: { fontSize: 13, color: '#00d4ff', marginBottom: 10, letterSpacing: 1 } }, 'TOP 10 LARGEST CLUSTERS'),
    [...allBeings].sort((a, b) => b.positions - a.positions).slice(0, 10).map((b, i) => {
      const tc = TYPE_COLORS[b.type];
      const maxPos = allBeings.reduce((m, x) => Math.max(m, x.positions), 0);
      return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
        React.createElement('div', { style: { width: 24, fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', textAlign: 'right' } }, `${i + 1}.`),
        React.createElement('span', { style: { fontSize: 12 } }, TYPE_ICONS[b.type]),
        React.createElement('div', { style: { width: 120, fontSize: 12, fontWeight: 600, color: tc } }, b.name),
        React.createElement('div', { style: { flex: 1, height: 14, background: '#0a1020', borderRadius: 3, overflow: 'hidden' } },
          React.createElement('div', { style: { width: `${(b.positions / maxPos) * 100}%`, height: '100%', background: `${tc}60`, borderRadius: 3 } }),
        ),
        React.createElement('div', { style: { width: 60, fontSize: 11, color: '#5a6a7a', fontFamily: 'monospace', textAlign: 'right' } }, `${b.positions}p`),
      );
    }),

    // Family breakdown
    React.createElement('h3', { style: { fontSize: 13, color: '#00d4ff', marginBottom: 10, marginTop: 24, letterSpacing: 1 } }, 'BY FAMILY'),
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

    // Craft skill
    React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'CRAFT SKILL'),
      React.createElement('div', { style: { fontSize: 13, color: '#e0e8f0', lineHeight: 1.4 } }, being.craft),
    ),

    // Unique craft skills
    being.craftSkills && React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'UNIQUE SKILLS (COLOSSEUM TRAINING)'),
      React.createElement('div', { style: { fontSize: 12, color: '#e0e8f0', lineHeight: 1.5 } }, being.craftSkills),
    ),

    // Heart skills
    being.heartSkills && React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, 'SHARED HEART SKILLS'),
      React.createElement('div', { style: { fontSize: 12, color: '#00ff8890', lineHeight: 1.5 } }, being.heartSkills),
    ),

    // Sample positions
    being.samplePositions && being.samplePositions.length > 0 && React.createElement('div', { style: { marginBottom: 16 } },
      React.createElement('div', { style: { fontSize: 10, color: '#5a6a7a', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } }, `SAMPLE POSITIONS (${being.positions} total)`),
      being.samplePositions.map((p, i) =>
        React.createElement('div', { key: i, style: { fontSize: 11, color: '#7a8a9a', padding: '3px 0', borderLeft: `2px solid ${tc}30`, paddingLeft: 8, marginBottom: 2 } }, p)
      ),
    ),

    // Agent type explanation
    React.createElement('div', { style: { marginTop: 20, padding: 12, background: `${tc}08`, border: `1px solid ${tc}20`, borderRadius: 6 } },
      React.createElement('div', { style: { fontSize: 10, color: tc, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 } },
        being.type === 'Being' ? '🔥 PERSISTENT BEING' : being.type === 'Contractor' ? '🔵 CONTEXT-INJECTED CONTRACTOR' : '⚪ DISPOSABLE BABY'
      ),
      React.createElement('div', { style: { fontSize: 11, color: '#5a6a7a', lineHeight: 1.4 } },
        being.type === 'Being' ? 'Persistent memory via Pinecone. Runs ongoing. Knows the mission. Has continuity across sessions. This is a core team member.' :
        being.type === 'Contractor' ? 'Gets Pinecone context injection before each task. Understands the project scope. More expensive than babies but safer. Reports to a Being.' :
        'One-shot execution. No memory. No context. Must be given extremely clear scope. Supervised by Workers or Contractors. Never touches existing work without review.'
      ),
    ),
  );
}

import { useState, useEffect } from "react";

const PALETTE = ['#FF8FAB', '#FF9B6B', '#FFD060', '#7EC87E', '#70C4FF', '#9B9BFF', '#D0A0FF', '#FF85E5', '#60D4C4', '#FF6B6B'];

const EMOJIS = ['🏃', '🎨', '📚', '💪', '🌿', '🎵', '✍️', '🧘', '🍳', '🚴', '🏊', '🌟', '💻', '🎯', '🌈', '🦋', '🌸', '⚡', '🔥', '💎', '🎭', '🌍', '🏔️', '🎮', '🐾', '🌻', '🦄', '🎪', '🍀', '🎸', '🏋️', '🧩', '🎀', '🌺', '🐠', '🦊', '🍰', '✨', '🎻', '🧪'];

const MILESTONES = [
  { pct: 25, emoji: '🌱', label: 'Sprouting!', color: '#7EC87E', desc: "You're just getting started — keep it up!" },
  { pct: 50, emoji: '🌸', label: 'Blossoming!', color: '#FF8FAB', desc: "Halfway there! You're doing amazing." },
  { pct: 75, emoji: '⭐', label: 'Shining!', color: '#FFD060', desc: "Almost there — you're absolutely crushing it!" },
  { pct: 100, emoji: '🏆', label: 'Legend!', color: '#FF9B6B', desc: "Goal complete! You're an absolute legend! 🎉" },
];

let _popId = 0;

function makeDefaultForm() {
  return { name: '', icon: '🌟', color: '#FF8FAB', totalPoints: 100, actions: [{ id: 'act0', label: '', points: 1 }] };
}

export default function App() {
  const [goals, setGoals] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [pops, setPops] = useState([]);
  const [celebration, setCelebration] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(makeDefaultForm());

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      @keyframes floatUp    { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-72px) scale(1.6)} }
      @keyframes fadeSlideIn{ from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes celebIn    { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.3)} 60%{transform:translate(-50%,-50%) scale(1.06)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      @keyframes shimmer    { 0%,100%{opacity:.7} 50%{opacity:1} }
      @keyframes btnBounce  { 0%,100%{transform:scale(1)} 40%{transform:scale(0.91)} 70%{transform:scale(1.06)} }
      @keyframes ringFill   { from{stroke-dashoffset:327} }
      .card-in  { animation: fadeSlideIn 0.35s ease both; }
      .pop-el   { position:fixed; pointer-events:none; animation:floatUp 1.1s ease forwards; font-family:'Fredoka One',cursive; font-size:26px; z-index:9999; }
      .act-btn:active { animation: btnBounce 0.35s ease; }
      ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background:#EEE; border-radius:3px; }
    `;
    document.head.appendChild(style);

    const data = localStorage.getItem('achievly-v2');
    if (data) {
      setGoals(JSON.parse(data));
    }
    setLoaded(true);
  }, []);

  function save(next) {
    setGoals(next);
    localStorage.setItem('achievly-v2', JSON.stringify(next));
  } ``

  const selectedGoal = goals.find(g => g.id === selectedId);

  function addPoints(goal, action, rect) {
    const prevPct = Math.min(100, Math.floor((goal.currentPoints / goal.totalPoints) * 100));
    const newPts = Math.min(goal.currentPoints + action.points, goal.totalPoints);
    const newPct = Math.min(100, Math.floor((newPts / goal.totalPoints) * 100));
    const crossed = MILESTONES.find(m => prevPct < m.pct && newPct >= m.pct);

    const next = goals.map(g => g.id !== goal.id ? g : {
      ...g, currentPoints: newPts,
      log: [{ id: ++_popId, label: action.label, points: action.points, time: Date.now() }, ...(g.log || [])].slice(0, 40)
    });
    save(next);

    if (crossed) setTimeout(() => { setCelebration(crossed); setTimeout(() => setCelebration(null), 3800); }, 200);

    const pid = ++_popId;
    const cx = rect ? rect.left + rect.width / 2 : 200;
    const cy = rect ? rect.top + 4 : 200;
    setPops(p => [...p, { id: pid, points: action.points, x: cx, y: cy, color: goal.color }]);
    setTimeout(() => setPops(p => p.filter(x => x.id !== pid)), 1200);
  }

  function handleCreate() {
    const valid = form.actions.filter(a => a.label.trim());
    if (!form.name.trim() || valid.length === 0) return;
    const g = {
      id: String(Date.now()), name: form.name.trim(), icon: form.icon, color: form.color,
      totalPoints: Math.max(1, Number(form.totalPoints) || 100), currentPoints: 0,
      actions: valid.map(a => ({ ...a, points: Math.max(1, Number(a.points) || 1) })),
      log: [], createdAt: Date.now()
    };
    save([...goals, g]);
    setShowCreate(false);
    setForm(makeDefaultForm());
  }

  function deleteGoal(id) {
    save(goals.filter(g => g.id !== id));
    setView('home'); setSelectedId(null);
  }

  const ff = { fontFamily: "'Nunito', sans-serif" };
  const TF = { fontFamily: "'Fredoka One', cursive" };

  if (!loaded) return (
    <div style={{
      ...ff, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg,#FFF0F8,#F5F0FF,#F0FFF8)', color: '#CCC', fontSize: 18
    }}>
      ✨ Loading your quests...
    </div>
  );

  /* ── DETAIL ─────────────────────────────────────────────── */
  if (view === 'detail' && selectedGoal) {
    const pct = Math.min(100, Math.floor((selectedGoal.currentPoints / selectedGoal.totalPoints) * 100));
    const R = 52, C = 2 * Math.PI * R;
    const complete = pct >= 100;

    return (
      <div style={{ ...ff, minHeight: '100vh', background: `linear-gradient(145deg,${selectedGoal.color}1A 0%,#FFFAFF 60%,#F0FFF5 100%)`, padding: '20px', position: 'relative', overflow: 'hidden' }}>

        {/* Pop animations */}
        {pops.map(p => <div key={p.id} className="pop-el" style={{ left: p.x, top: p.y, color: p.color, transform: 'translateX(-50%)' }}>+{p.points}</div>)}

        {/* Celebration */}
        {celebration && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', background: '#fff', borderRadius: 28, padding: '36px 44px', textAlign: 'center', zIndex: 1000, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', animation: 'celebIn 0.5s ease forwards', minWidth: 260 }}>
            <div style={{ fontSize: 72, marginBottom: 8, animation: 'shimmer 1s ease 3' }}>{celebration.emoji}</div>
            <div style={{ ...TF, fontSize: 30, color: celebration.color, marginBottom: 6 }}>{celebration.label}</div>
            <div style={{ color: '#AAA', fontSize: 14, fontWeight: 600, maxWidth: 220, margin: '0 auto' }}>{celebration.desc}</div>
          </div>
        )}

        {/* Back */}
        <button onClick={() => setView('home')} style={{ background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 12, padding: '9px 18px', ...ff, fontWeight: 800, fontSize: 14, cursor: 'pointer', color: '#777', marginBottom: 20, backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          ← Back
        </button>

        {/* Hero card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, marginBottom: 18, boxShadow: '0 4px 28px rgba(0,0,0,0.08)', borderTop: `5px solid ${selectedGoal.color}` }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={R} fill="none" stroke="#F0F0F0" strokeWidth="9" />
                <circle cx="60" cy="60" r={R} fill="none" stroke={selectedGoal.color} strokeWidth="9"
                  strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28 }}>{selectedGoal.icon}</span>
                <span style={{ ...TF, fontSize: 15, color: selectedGoal.color }}>{pct}%</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              <h2 style={{ ...TF, fontSize: 24, margin: '0 0 4px', color: '#333' }}>{selectedGoal.name}</h2>
              <div style={{ fontSize: 13, color: '#BBB', fontWeight: 700, marginBottom: 12 }}>
                {selectedGoal.currentPoints} / {selectedGoal.totalPoints} pts
              </div>
              {/* Milestone badges */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {MILESTONES.map(m => (
                  <div key={m.pct} title={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: pct >= m.pct ? 1 : 0.2, transition: 'opacity 0.4s', cursor: 'default' }}>
                    <span style={{ fontSize: 22 }}>{m.emoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: pct >= m.pct ? m.color : '#CCC', textTransform: 'uppercase', letterSpacing: .5 }}>{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: '#F5F5F5', borderRadius: 10, height: 10, marginTop: 20, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${selectedGoal.color},${selectedGoal.color}AA)`, borderRadius: 10, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)' }} />
          </div>

          <button onClick={() => { if (window.confirm('Delete this goal?')) deleteGoal(selectedGoal.id); }}
            style={{ marginTop: 16, background: 'none', border: '1.5px solid #FFD0D0', borderRadius: 8, padding: '5px 14px', color: '#FF9999', ...ff, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            🗑 Delete goal
          </button>
        </div>

        {/* Actions */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 22, marginBottom: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h3 style={{ ...TF, fontSize: 19, margin: '0 0 16px', color: '#444' }}>Log Activity</h3>
          {complete ? (
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 16, fontWeight: 800, color: '#FFD060' }}>
              🏆 Quest Complete! You're a legend!
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {selectedGoal.actions.map(action => (
                <button key={action.id} className="act-btn"
                  onClick={e => { const r = e.currentTarget.getBoundingClientRect(); addPoints(selectedGoal, action, r); }}
                  style={{ background: `${selectedGoal.color}18`, border: `2px solid ${selectedGoal.color}50`, borderRadius: 16, padding: '12px 20px', ...ff, fontWeight: 800, fontSize: 14, cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center', gap: 9, transition: 'background 0.15s, transform 0.1s', boxShadow: `0 2px 10px ${selectedGoal.color}22` }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${selectedGoal.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${selectedGoal.color}18`; }}
                >
                  <span style={{ ...TF, color: selectedGoal.color, fontSize: 16 }}>+{action.points}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Log */}
        {selectedGoal.log && selectedGoal.log.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 24, padding: 22, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <h3 style={{ ...TF, fontSize: 19, margin: '0 0 14px', color: '#444' }}>Activity Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedGoal.log.slice(0, 12).map((e, i) => (
                <div key={e.id} className="card-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: '#FAFAFA', borderRadius: 12, animationDelay: `${i * 0.03}s` }}>
                  <span style={{ fontSize: 13, color: '#666', fontWeight: 700 }}>{e.label}</span>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ ...TF, fontSize: 15, color: selectedGoal.color }}>+{e.points}</span>
                    <span style={{ fontSize: 11, color: '#CCC', fontWeight: 600 }}>{new Date(e.time).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── HOME ───────────────────────────────────────────────── */
  const totalBadges = goals.reduce((sum, g) => {
    const p = Math.min(100, Math.floor((g.currentPoints / g.totalPoints) * 100));
    return sum + MILESTONES.filter(m => p >= m.pct).length;
  }, 0);

  return (
    <div style={{ ...ff, minHeight: '100vh', background: 'linear-gradient(145deg,#FFF0F8 0%,#F5F0FF 50%,#F0FFF8 100%)', padding: '24px 20px', position: 'relative' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ ...TF, fontSize: 36, margin: 0, background: 'linear-gradient(135deg,#FF8FAB 20%,#9B9BFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: .5 }}>
            ✨ Achievly
          </h1>
          <p style={{ margin: '2px 0 0', color: '#CCAADD', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            your personal quest board
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ background: 'linear-gradient(135deg,#FF8FAB,#FF9B6B)', border: 'none', borderRadius: 16, padding: '12px 22px', color: '#fff', ...ff, fontWeight: 900, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 22px rgba(255,143,171,0.45)', transition: 'transform 0.15s, box-shadow 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,143,171,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 22px rgba(255,143,171,0.45)'; }}
        >+ New Goal</button>
      </div>

      {/* Stats row */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { val: goals.length, label: 'Quests', color: '#FF8FAB' },
            { val: goals.filter(g => g.currentPoints >= g.totalPoints).length, label: 'Complete', color: '#9B9BFF' },
            { val: totalBadges, label: 'Badges', color: '#FFD060' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 2px 14px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ ...TF, fontSize: 26, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#BBB', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Goal grid */}
      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 76, marginBottom: 16, opacity: .5 }}>🌟</div>
          <div style={{ ...TF, fontSize: 26, color: '#DDCCEE', marginBottom: 8 }}>No quests yet!</div>
          <div style={{ fontSize: 14, color: '#CCC', fontWeight: 600 }}>Hit "+ New Goal" to start your first quest</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
          {goals.map((goal, i) => {
            const gPct = Math.min(100, Math.floor((goal.currentPoints / goal.totalPoints) * 100));
            const complete = gPct >= 100;
            return (
              <div key={goal.id} className="card-in"
                onClick={() => { setSelectedId(goal.id); setView('detail'); }}
                style={{ background: '#fff', borderRadius: 20, padding: 20, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderTop: `4px solid ${goal.color}`, animationDelay: `${i * 0.06}s`, position: 'relative', overflow: 'hidden', transition: 'transform 0.16s, box-shadow 0.16s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
              >
                {/* BG bubble */}
                <div style={{ position: 'absolute', right: -28, top: -28, width: 110, height: 110, borderRadius: '50%', background: goal.color, opacity: .07 }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>{goal.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: '#333', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</div>
                    <div style={{ fontSize: 12, color: '#BBB', fontWeight: 700 }}>{goal.actions.length} action{goal.actions.length !== 1 ? 's' : ''}</div>
                  </div>
                  {complete && <span style={{ fontSize: 22, flexShrink: 0 }}>🏆</span>}
                </div>

                {/* Progress bar */}
                <div style={{ background: '#F5F5F5', borderRadius: 8, height: 9, marginBottom: 9, overflow: 'hidden' }}>
                  <div style={{ width: `${gPct}%`, height: '100%', background: `linear-gradient(90deg,${goal.color},${goal.color}BB)`, borderRadius: 8, transition: 'width 0.5s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#BBB', fontWeight: 700 }}>{goal.currentPoints} / {goal.totalPoints} pts</span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {MILESTONES.map(m => (
                      <span key={m.pct} style={{ fontSize: 14, opacity: gPct >= m.pct ? 1 : 0.18, transition: 'opacity 0.4s' }}>{m.emoji}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateGoalModal form={form} setForm={setForm} onSave={handleCreate}
          onClose={() => { setShowCreate(false); setForm(makeDefaultForm()); }} TF={TF} ff={ff} />
      )}
    </div>
  );
}

/* ── Create Modal ─────────────────────────────────────────── */
function CreateGoalModal({ form, setForm, onSave, onClose, TF, ff }) {
  const [step, setStep] = useState(0);

  function addAction() {
    setForm(f => ({ ...f, actions: [...f.actions, { id: String(Date.now() + Math.random()), label: '', points: 1 }] }));
  }
  function removeAction(id) {
    setForm(f => ({ ...f, actions: f.actions.filter(a => a.id !== id) }));
  }
  function updateAction(id, key, val) {
    setForm(f => ({ ...f, actions: f.actions.map(a => a.id === id ? { ...a, [key]: val } : a) }));
  }

  const canNext = form.name.trim().length > 0;
  const canSave = form.actions.some(a => a.label.trim());

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20,10,30,0.35)',
    display: 'flex',
    alignItems: 'center', // ✅ center vertically
    justifyContent: 'center',
    zIndex: 500,
    backdropFilter: 'blur(6px)',
    padding: '20px' // ✅ prevents edge clipping
  };
  const sheetStyle = {
    background: '#fff',
    borderRadius: '24px', // ✅ full rounded (not bottom sheet)
    padding: '28px 24px 32px',
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh', // ✅ slightly larger
    overflowY: 'auto',
    ...ff
  };
  const sectionLabel = { fontSize: 11, fontWeight: 800, color: '#BBAACC', textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 7 };
  const inputBase = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #EEE', fontSize: 15, ...ff, fontWeight: 700, outline: 'none', transition: 'border 0.2s', marginBottom: 20 };
  const focusBorder = (e) => { e.target.style.border = `2px solid ${form.color}`; };
  const blurBorder = (e) => { e.target.style.border = '2px solid #EEE'; };

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={sheetStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ ...TF, fontSize: 23, margin: 0, color: '#333' }}>
            {step === 0 ? '✨ New Quest' : `${form.icon} Add Actions`}
          </h2>
          <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>✕</button>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
          {[0, 1].map(s => (
            <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, background: s === step ? form.color : '#EEE', transition: 'all 0.3s' }} />
          ))}
        </div>

        {step === 0 ? (
          <>
            <label style={sectionLabel}>Goal Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Run 100km, Do more art, Learn Spanish…"
              style={inputBase} onFocus={focusBorder} onBlur={blurBorder} autoFocus />

            <label style={sectionLabel}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setForm(f => ({ ...f, icon: em }))}
                  style={{ width: 40, height: 40, borderRadius: 10, border: form.icon === em ? `2px solid ${form.color}` : '2px solid #EEE', background: form.icon === em ? `${form.color}20` : '#FAFAFA', fontSize: 20, cursor: 'pointer', transition: 'all 0.12s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {em}
                </button>
              ))}
            </div>

            <label style={sectionLabel}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {PALETTE.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #444' : '3px solid transparent', cursor: 'pointer', transform: form.color === c ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s', boxShadow: form.color === c ? `0 2px 10px ${c}80` : '' }} />
              ))}
            </div>

            <label style={sectionLabel}>Point Target (total)</label>
            <input type="number" min={1} value={form.totalPoints}
              onChange={e => setForm(f => ({ ...f, totalPoints: e.target.value }))}
              style={inputBase} onFocus={focusBorder} onBlur={blurBorder} />

            <button onClick={() => setStep(1)} disabled={!canNext}
              style={{ width: '100%', padding: '15px', background: canNext ? `linear-gradient(135deg,${form.color},${form.color}BB)` : '#EEE', border: 'none', borderRadius: 16, color: canNext ? '#fff' : '#CCC', fontSize: 16, fontWeight: 900, cursor: canNext ? 'pointer' : 'not-allowed', ...ff, boxShadow: canNext ? `0 4px 20px ${form.color}50` : '' }}>
              Next: Add Actions →
            </button>
          </>
        ) : (
          <>
            <div style={{ background: `${form.color}15`, borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{form.icon}</span>
              <div>
                <div style={{ fontWeight: 900, color: '#333', fontSize: 15 }}>{form.name}</div>
                <div style={{ fontSize: 12, color: '#AAA', fontWeight: 700 }}>Target: {form.totalPoints} pts</div>
              </div>
            </div>

            <label style={sectionLabel}>What actions earn points?</label>

            {form.actions.map((action, idx) => (
              <div key={action.id} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <input value={action.label}
                  onChange={e => updateAction(action.id, 'label', e.target.value)}
                  placeholder={`Action ${idx + 1} (e.g. "Drawing")`}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '2px solid #EEE', fontSize: 14, ...ff, fontWeight: 700, outline: 'none', transition: 'border 0.2s' }}
                  onFocus={focusBorder} onBlur={blurBorder} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FAFAFA', borderRadius: 10, border: `2px solid ${form.color}40`, padding: '0 10px', height: 42 }}>
                  <span style={{ ...TF, color: form.color, fontSize: 15 }}>+</span>
                  <input type="number" min={1} value={action.points}
                    onChange={e => updateAction(action.id, 'points', e.target.value)}
                    style={{ width: 44, border: 'none', background: 'transparent', fontSize: 15, ...ff, fontWeight: 900, textAlign: 'center', color: form.color, outline: 'none' }} />
                  <span style={{ fontSize: 11, color: '#CCC', fontWeight: 700 }}>pts</span>
                </div>
                {form.actions.length > 1 && (
                  <button onClick={() => removeAction(action.id)}
                    style={{ background: '#FFE8E8', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', color: '#FF9999', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                )}
              </div>
            ))}

            <button onClick={addAction}
              style={{ width: '100%', padding: '11px', background: '#FAFAFA', border: `2px dashed ${form.color}60`, borderRadius: 12, color: form.color, fontSize: 14, fontWeight: 800, cursor: 'pointer', ...ff, marginBottom: 22, marginTop: 4 }}>
              + Add Another Action
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)}
                style={{ flex: 1, padding: '13px', background: '#F5F5F5', border: 'none', borderRadius: 14, color: '#999', fontSize: 14, fontWeight: 800, cursor: 'pointer', ...ff }}>
                ← Back
              </button>
              <button onClick={onSave} disabled={!canSave}
                style={{ flex: 2, padding: '14px', background: canSave ? `linear-gradient(135deg,${form.color},${form.color}BB)` : '#EEE', border: 'none', borderRadius: 14, color: canSave ? '#fff' : '#CCC', fontSize: 16, fontWeight: 900, cursor: canSave ? 'pointer' : 'not-allowed', ...ff, boxShadow: canSave ? `0 4px 20px ${form.color}50` : '' }}>
                🌟 Create Quest!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
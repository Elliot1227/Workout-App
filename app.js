// ═══════════════════════════════════════════════════════════════════
// IRON LOG — COMPLETE ULTRA CORE APPLICATION ENGINE
// ═══════════════════════════════════════════════════════════════════

// ── LOCAL BROWSER STORAGE CONTROLLER ──────────────────────────────
const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem('il_' + k)); } catch { return null; } },
  set(k, v) { localStorage.setItem('il_' + k, JSON.stringify(v)); return v; },
  del(k) { localStorage.removeItem('il_' + k); }
};

// ── CONFIGURABLE APPLICATION ACCENT SCHEMES ───────────────────────
const ACCENT_PALETTE = {
  green: { primary: '#3ddc84', dim: '#2cb869', trans: 'rgba(61, 220, 132, 0.12)' },
  blue: { primary: '#4d9fff', dim: '#357ec7', trans: 'rgba(77, 159, 255, 0.12)' },
  purple: { primary: '#bb86fc', dim: '#9a66da', trans: 'rgba(187, 134, 252, 0.12)' },
  red: { primary: '#ff4d4d', dim: '#cc3636', trans: 'rgba(255, 77, 77, 0.12)' },
  yellow: { primary: '#e8ff47', dim: '#b8cc30', trans: 'rgba(232, 255, 71, 0.12)' },
  orange: { primary: '#ff9500', dim: '#cc7600', trans: 'rgba(255, 149, 0, 0.12)' },
  cyan: { primary: '#00f2fe', dim: '#00b8c4', trans: 'rgba(0, 242, 254, 0.12)' }
};

// ── GLOBAL APPLICATION CONFIGURATION DEFAULTS ─────────────────────
const DEFAULT_SETTINGS = {
  pattern: ['push', 'pull', 'legs', 'rest'], 
  blockedWeekdays: [], 
  equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
  level: 'intermediate',
  setRestSeconds: 90,
  exerciseRestSeconds: 180,
  weightUnit: 'lbs',
  accentTheme: 'green',
  startDate: new Date().toISOString().split('T')[0]
};

// ── COMPREHENSIVE VECTOR ANATOMICAL LABELS & DEFINITIONS ──────────
const MUSCLE_LABELS = {
  chest_l:'Chest', chest_r:'Chest', lat_l:'Lats', lat_r:'Lats',
  front_delt_l:'Shoulders', front_delt_r:'Shoulders', side_delt_l:'Shoulders', side_delt_r:'Shoulders',
  rear_delt_l:'Rear Delts', rear_delt_r:'Rear Delts',
  bicep_l:'Biceps', bicep_r:'Biceps', tricep_l:'Triceps', tricep_r:'Triceps',
  trap_l:'Traps', trap_r:'Traps', lower_back:'Lower Back',
  quad_l:'Quads', quad_r:'Quads', ham_l:'Hamstrings', ham_r:'Hamstrings',
  glute_l:'Glutes', glute_r:'Glutes', calf_l:'Calves', calf_r:'Calves',
  core:'Core', abdominal:'Core', obliques:'Core', forearms:'Forearms'
};

const MUSCLE_COLOR = {
  'Chest':'#ff6b6b','Lats':'#4d9fff','Shoulders':'#ffa94d','Rear Delts':'#da77f2',
  'Biceps':'#3ddc84','Triceps':'#cc44ff','Traps':'#74c0fc','Lower Back':'#f06595',
  'Quads':'#ffe066','Hamstrings':'#63e6be','Glutes':'#ff8c42','Calves':'#a9e34b',
  'Core':'#748ffc','Forearms':'#e599f7'
};

// ── EXERCISE DICTIONARY SEED MATRIX ──────────────────────────────
const LIBRARY = {
  push: [
    { id:'bench_press',      name:'Bench Press',         muscles:['chest_l','chest_r'],                        equipment:['barbell'],            sets:4, reps:[6,8],  icon:'barbell' },
    { id:'incline_bench',    name:'Incline Bench Press', muscles:['chest_l','chest_r','front_delt_l','front_delt_r'], equipment:['barbell'],       sets:4, reps:[8,10], icon:'barbell' },
    { id:'ohp',              name:'Overhead Press',      muscles:['front_delt_l','front_delt_r','side_delt_l','side_delt_r'], equipment:['barbell'], sets:4, reps:[6,8], icon:'barbell' },
    { id:'db_shoulder_press',name:'DB Shoulder Press',   muscles:['front_delt_l','front_delt_r','side_delt_l','side_delt_r'], equipment:['dumbbells'], sets:3, reps:[10,12], icon:'dumbbell' },
    { id:'db_incline',       name:'Incline DB Press',    muscles:['chest_l','chest_r'],                        equipment:['dumbbells'],           sets:3, reps:[10,12], icon:'dumbbell' },
    { id:'lateral_raise',    name:'Lateral Raise',       muscles:['side_delt_l','side_delt_r'],                equipment:['dumbbells','cables'],  sets:4, reps:[12,15], icon:'dumbbell' },
    { id:'cable_fly',        name:'Cable Fly',           muscles:['chest_l','chest_r'],                        equipment:['cables'],              sets:3, reps:[12,15], icon:'cable' },
    { id:'tricep_pushdown',  name:'Tricep Pushdown',     muscles:['tricep_l','tricep_r'],                      equipment:['cables'],              sets:3, reps:[10,12], icon:'cable' },
    { id:'skull_crusher',    name:'Skull Crusher',       muscles:['tricep_l','tricep_r'],                      equipment:['barbell','dumbbells'], sets:3, reps:[10,12], icon:'barbell' },
    { id:'dips',             name:'Dips',                muscles:['chest_l','chest_r','tricep_l','tricep_r'],  equipment:['machines'],            sets:3, reps:[8,12],  icon:'body' }
  ],
  pull: [
    { id:'deadlift',         name:'Deadlift',            muscles:['trap_l','trap_r','lower_back','glute_l','glute_r','ham_l','ham_r'], equipment:['barbell'], sets:4, reps:[4,6],   icon:'barbell' },
    { id:'pullup',           name:'Pull-Up',             muscles:['lat_l','lat_r','bicep_l','bicep_r'],       equipment:['barbell','dumbbells','cables','machines'], sets:4, reps:[6,10], icon:'body' },
    { id:'bent_row',         name:'Bent Over Row',       muscles:['lat_l','lat_r','trap_l','trap_r','bicep_l','bicep_r'], equipment:['barbell'], sets:4, reps:[6,8], icon:'barbell' },
    { id:'db_row',           name:'Dumbbell Row',        muscles:['lat_l','lat_r','bicep_l','bicep_r'],       equipment:['dumbbells'],           sets:4, reps:[8,12], icon:'dumbbell' },
    { id:'lat_pulldown',     name:'Lat Pulldown',        muscles:['lat_l','lat_r','bicep_l','bicep_r'],       equipment:['cables','machines'],   sets:4, reps:[10,12], icon:'cable' },
    { id:'cable_row',        name:'Seated Cable Row',    muscles:['lat_l','lat_r','trap_l','trap_r'],         equipment:['cables'],              sets:3, reps:[10,12], icon:'cable' },
    { id:'face_pull',        name:'Face Pull',           muscles:['rear_delt_l','rear_delt_r','trap_l','trap_r'], equipment:['cables'],           sets:3, reps:[15,20], icon:'cable' },
    { id:'barbell_curl',     name:'Barbell Curl',        muscles:['bicep_l','bicep_r'],                       equipment:['barbell'],             sets:3, reps:[10,12], icon:'barbell' },
    { id:'hammer_curl',      name:'Hammer Curl',         muscles:['bicep_l','bicep_r'],                       equipment:['dumbbells'],           sets:3, reps:[10,12], icon:'dumbbell' }
  ],
  legs: [
    { id:'squat',            name:'Barbell Squat',       muscles:['quad_l','quad_r','glute_l','glute_r'],     equipment:['barbell'],             sets:4, reps:[5,8],   icon:'barbell' },
    { id:'rdl',              name:'Romanian Deadlift',   muscles:['ham_l','ham_r','glute_l','glute_r','lower_back'], equipment:['barbell','dumbbells'], sets:3, reps:[8,10], icon:'barbell' },
    { id:'leg_press',        name:'Leg Press',           muscles:['quad_l','quad_r','glute_l','glute_r'],     equipment:['machines'],            sets:4, reps:[10,12], icon:'machine' },
    { id:'lunges',           name:'Walking Lunges',      muscles:['quad_l','quad_r','glute_l','glute_r','ham_l','ham_r'], equipment:['barbell','dumbbells'], sets:3, reps:[10,12], icon:'body' },
    { id:'leg_curl',         name:'Leg Curl',            muscles:['ham_l','ham_r'],                           equipment:['machines','cables'],   sets:3, reps:[10,12], icon:'machine' },
    { id:'leg_extension',    name:'Leg Extension',       muscles:['quad_l','quad_r'],                         equipment:['machines'],            sets:3, reps:[12,15], icon:'machine' },
    { id:'calf_raise',       name:'Calf Raise',          muscles:['calf_l','calf_r'],                         equipment:['barbell','dumbbells','machines','cables'], sets:4, reps:[12,15], icon:'body' },
    { id:'hip_thrust',       name:'Hip Thrust',          muscles:['glute_l','glute_r','ham_l','ham_r'],       equipment:['barbell','machines'],  sets:3, reps:[10,12], icon:'barbell' }
  ]
};

const ALL_EXERCISES = [...LIBRARY.push, ...LIBRARY.pull, ...LIBRARY.legs];

// ── GET ENGINE SETTINGS & CONFIGS ─────────────────────────────────
function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(DB.get('settings') || {}) };
}
function saveSettings(s) {
  DB.set('settings', s);
  applyAccentTheme();
}

// ── INJECT DYNAMIC ACCENT SCHEMES INTO DOM ROOT ────────────────────
function applyAccentTheme() {
  const s = getSettings();
  const theme = ACCENT_PALETTE[s.accentTheme || 'green'] || ACCENT_PALETTE.green;
  const r = document.documentElement;
  r.style.setProperty('--accent', theme.primary);
  r.style.setProperty('--accent-dim', theme.dim);
  r.style.setProperty('--accent-transparent', theme.trans);
}

// ── PATTERN PATTERN-BASED ROLLING WORKOUT GENERATION CALENDAR SYSTEM ──
function getPPLType(dateStr) {
  const s = getSettings();
  const loopPattern = s.pattern || ['push', 'pull', 'legs', 'rest'];
  const blocks = s.blockedWeekdays || []; 

  const targetDate = new Date(dateStr + 'T12:00:00');
  const targetDayOfWeek = targetDate.getDay();

  if (blocks.includes(targetDayOfWeek)) return 'rest';

  // Base Reference Anchor Calculation Point
  let baseDate = new Date(s.startDate + 'T12:00:00');
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
    baseDate.setHours(12,0,0,0);
  }

  let iter = new Date(baseDate);
  let patternIdx = 0;

  if (iter.getTime() <= targetDate.getTime()) {
    while (iter.getTime() < targetDate.getTime()) {
      const curDow = iter.getDay();
      if (!blocks.includes(curDow)) {
        patternIdx = (patternIdx + 1) % loopPattern.length;
      }
      iter.setDate(iter.getDate() + 1);
    }
    const finalDow = iter.getDay();
    if (blocks.includes(finalDow)) return 'rest';
    return loopPattern[patternIdx];
  } else {
    // Reverse historical sequencing algorithm back-prop
    while (iter.getTime() > targetDate.getTime()) {
      iter.setDate(iter.getDate() - 1);
      const curDow = iter.getDay();
      if (!blocks.includes(curDow)) {
        patternIdx = (patternIdx - 1 + loopPattern.length) % loopPattern.length;
      }
    }
    const finalDow = iter.getDay();
    if (blocks.includes(finalDow)) return 'rest';
    return loopPattern[patternIdx];
  }
}

function getTodayType() {
  return getPPLType(new Date().toISOString().split('T')[0]);
}

function getEquippedExercises(type) {
  const s = getSettings();
  const eq = s.equipment || ['barbell','dumbbells','cables','machines'];
  if (!LIBRARY[type]) return [];
  return LIBRARY[type].filter(ex => ex.equipment.some(e => eq.includes(e)));
}

function buildWorkout(type) {
  const customs = DB.get('customWorkouts') || {};
  if (customs[type]) {
    return customs[type].map(ex => withSuggestion(ex));
  }
  const pool = getEquippedExercises(type);
  const plan = selectExercisePlan(type, pool, getSettings().level);
  return plan.map(ex => withSuggestion(ex));
}

function selectExercisePlan(type, pool, level) {
  const find = ids => ids.map(id => pool.find(e => e.id === id)).filter(Boolean);
  if (type === 'push') {
    const chest = find(['bench_press','incline_bench','db_incline','cable_fly','dips']);
    const shoulder = find(['ohp','db_shoulder_press','lateral_raise']);
    const tricep = find(['tricep_pushdown','skull_crusher']);
    return [
      ...(chest[0] ? [chest[0]] : []),
      ...(chest[1] ? [chest[1]] : []),
      ...(shoulder[0] ? [shoulder[0]] : []),
      ...(shoulder.find(e=>e.id==='lateral_raise') ? [shoulder.find(e=>e.id==='lateral_raise')] : shoulder[1] ? [shoulder[1]] : []),
      ...(tricep[0] ? [tricep[0]] : []),
    ].slice(0, level === 'beginner' ? 4 : 5);
  }
  if (type === 'pull') {
    const heavy = find(['deadlift','bent_row','pullup']);
    const back = find(['lat_pulldown','cable_row','db_row','pullup']);
    const rear = find(['face_pull']);
    const bicep = find(['barbell_curl','hammer_curl']);
    return [
      ...(heavy[0] ? [heavy[0]] : []),
      ...(back.filter(e=>e.id!==heavy[0]?.id)[0] ? [back.filter(e=>e.id!==heavy[0]?.id)[0]] : []),
      ...(back.filter(e=>e.id!==heavy[0]?.id)[1] ? [back.filter(e=>e.id!==heavy[0]?.id)[1]] : []),
      ...(rear[0] ? [rear[0]] : []),
      ...(bicep[0] ? [bicep[0]] : []),
    ].slice(0, level === 'beginner' ? 4 : 5);
  }
  if (type === 'legs') {
    const squat = find(['squat','leg_press']);
    const hinge = find(['rdl','leg_curl','lunges']);
    const acc = find(['leg_press','leg_extension','hip_thrust']);
    const calf = find(['calf_raise']);
    return [
      ...(squat[0] ? [squat[0]] : []),
      ...(hinge[0] ? [hinge[0]] : []),
      ...(acc.filter(e=>e.id!==squat[0]?.id&&e.id!==hinge[0]?.id)[0] ? [acc.filter(e=>e.id!==squat[0]?.id&&e.id!==hinge[0]?.id)[0]] : []),
      ...(calf[0] ? [calf[0]] : []),
    ].slice(0, level === 'beginner' ? 3 : 4);
  }
  return pool.slice(0, 4);
}

// ── PROGRESSIVE OVERLOAD ALGORITHM CALCULATOR ENGINE ────────────────
function withSuggestion(ex) {
  const s = getSettings();
  const history = getExerciseHistory(ex.id || ex.name);
  const unit = s.weightUnit || 'lbs';
  const step = unit === 'lbs' ? 5 : 2.5;

  let suggestedWeight = getDefaultWeight(ex, s.level, unit);
  let suggestedSets = ex.sets || 3;
  let suggestedReps = ex.reps ? ex.reps[0] : 10;
  let isPR = false;

  if (history.length > 0) {
    const last = history[history.length - 1];
    const lastWeight = Math.max(...last.sets.map(st => st.weight || 0));
    const lastReps = last.sets.map(st => st.reps || 0);
    const targetReps = ex.reps ? ex.reps[1] : 12;
    const allHitTarget = lastReps.every(r => r >= targetReps);
    suggestedSets = last.sets.length;
    suggestedReps = Math.round(lastReps.reduce((a,b)=>a+b,0)/lastReps.length);
    if (allHitTarget) {
      suggestedWeight = lastWeight + step;
      isPR = true;
    } else {
      suggestedWeight = lastWeight;
    }
  }
  return { ...ex, suggestedWeight, suggestedSets, suggestedReps, isPR };
}

function getDefaultWeight(ex, level, unit) {
  const mult = unit === 'kg' ? 0.45 : 1;
  const defaults = {
    bench_press: {beginner:95,intermediate:135,advanced:185},
    incline_bench:{beginner:65,intermediate:95,advanced:135},
    ohp:         {beginner:65,intermediate:95,advanced:135},
    deadlift:    {beginner:135,intermediate:185,advanced:275},
    squat:       {beginner:95,intermediate:155,advanced:225},
    bent_row:    {beginner:95,intermediate:135,advanced:185},
    rdl:         {beginner:95,intermediate:135,advanced:185}
  };
  const base = defaults[ex.id] ? defaults[ex.id][level || 'intermediate'] : 45;
  return Math.round((base * mult) / 5) * 5;
}

function getWorkouts() { return DB.get('workouts') || []; }
function saveWorkout(w) {
  const workouts = getWorkouts();
  workouts.push(w);
  DB.set('workouts', workouts);
}

function getExerciseHistory(idOrName) {
  return getWorkouts().flatMap(w =>
    (w.exercises || []).filter(e => e.id === idOrName || e.name === idOrName).map(e => ({ ...e, date: w.date }))
  );
}

function getMusclesWorked(period) {
  const now = new Date();
  const cutoff = period === 'week' ? 7 : period === 'month' ? 30 : 36500;
  const freq = {};
  getWorkouts().forEach(w => {
    const days = (now - new Date(w.date)) / 86400000;
    if (days > cutoff) return;
    (w.exercises || []).forEach(ex => {
      (ex.muscles || []).forEach(m => { freq[m] = (freq[m] || 0) + 1; });
    });
  });
  return freq;
}

// ── ACTIVE SINGLE-SET ENGINE CORE STATES ──────────────────────────
let UI = {
  screen: 'workout',
  calMonth: new Date(),
  muscleView: 'front',
  musclePeriod: 'week',
  workout: null, 
  restTimer: null,
  isSetViewCollapsed: true 
};

// ── NAVIGATION CONTROLLER SELECTION MATRIX ────────────────────────
function showScreen(name) {
  UI.screen = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const targetScreen = document.getElementById('screen-' + name);
  if (targetScreen) targetScreen.classList.add('active');
  
  const targetBtn = document.querySelector(`.nav-btn[data-screen="${name}"]`);
  if (targetBtn) targetBtn.classList.add('active');
  
  if (name === 'calendar') renderCalendar();
  if (name === 'muscles') renderMuscleMap();
  if (name === 'settings') renderSettings();
}

// ── APP INTRODUCTORY ONBOARDING FLOW SCHEDULER ─────────────────────
let onboardData = { pattern: ['push','pull','legs','rest'], blockedWeekdays: [], equipment: ['barbell','dumbbells','cables','machines'], level: 'intermediate', accentTheme: 'green' };

function startOnboarding() {
  document.getElementById('onboarding').style.display = 'flex';
  generatePatternSetup(4); 
  generateOnboardColorPicker();
  showOnboardStep(1);
}

function showOnboardStep(n) {
  document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
  const step = document.getElementById('onboard-' + n);
  if (step) step.classList.add('active');
}

function generatePatternSetup(len) {
  const container = document.getElementById('ob-pattern-slots-container');
  container.innerHTML = '';
  const parsedLen = parseInt(len);
  
  const options = `
    <option value="push">Push Day</option>
    <option value="pull">Pull Day</option>
    <option value="legs">Leg Day</option>
    <option value="rest">Programmed Rest</option>
  `;
  
  for (let i = 0; i < parsedLen; i++) {
    const row = document.createElement('div');
    row.className = 'field';
    let defaultVal = 'rest';
    if (i === 0) defaultVal = 'push';
    if (i === 1) defaultVal = 'pull';
    if (i === 2) defaultVal = 'legs';
    
    row.innerHTML = `
      <label>Rotation Day Slot #${i + 1}</label>
      <select class="ob-pattern-slot-select" data-index="${i}">
        <option value="push" ${defaultVal==='push'?'selected':''}>Push Day</option>
        <option value="pull" ${defaultVal==='pull'?'selected':''}>Pull Day</option>
        <option value="legs" ${defaultVal==='legs'?'selected':''}>Leg Day</option>
        <option value="rest" ${defaultVal==='rest'?'selected':''}>Programmed Rest</option>
      </select>
    `;
    container.innerHTML += row.outerHTML;
  }
}

function generateOnboardColorPicker() {
  const grid = document.getElementById('ob-color-grid');
  grid.innerHTML = '';
  Object.keys(ACCENT_PALETTE).forEach(k => {
    const dot = document.createElement('div');
    dot.className = `color-dot ${k === 'green' ? 'selected' : ''}`;
    dot.style.background = ACCENT_PALETTE[k].primary;
    dot.dataset.color = k;
    dot.onclick = function() {
      document.querySelectorAll('#ob-color-grid .color-dot').forEach(d => d.classList.remove('selected'));
      this.classList.add('selected');
      onboardData.accentTheme = this.dataset.color;
    };
    grid.appendChild(dot);
  });
}

function onboardNext(n) {
  if (n === 1) {
    // Length configured, step forward to assign
  }
  if (n === 2) {
    const selects = document.querySelectorAll('.ob-pattern-slot-select');
    const pat = [];
    selects.forEach(s => pat.push(s.value));
    onboardData.pattern = pat;
  }
  if (n === 3) {
    onboardData.blockedWeekdays = [...document.querySelectorAll('.ob-block-chip.selected')].map(c => parseInt(c.dataset.day));
  }
  if (n === 4) {
    onboardData.equipment = [...document.querySelectorAll('.ob-eq-chip.selected')].map(c => c.dataset.eq);
    if (!onboardData.equipment.length) { alert('Select at least one equipment option.'); return; }
  }
  if (n === 5) {
    // Accent color tracked locally via click events on node list
  }
  if (n === 6) {
    onboardData.setRestSeconds = parseInt(document.getElementById('ob-set-rest').value) || 90;
    onboardData.exerciseRestSeconds = parseInt(document.getElementById('ob-ex-rest').value) || 180;
    onboardData.weightUnit = document.querySelector('.ob-unit-chip.selected')?.dataset.unit || 'lbs';
    
    const finalSettings = { ...DEFAULT_SETTINGS, ...onboardData, startDate: new Date().toISOString().split('T')[0] };
    saveSettings(finalSettings);
    document.getElementById('onboarding').style.display = 'none';
    refreshAppStateLabels();
    renderWorkoutScreen();
    return;
  }
  showOnboardStep(n + 1);
}

// ── EXERCISE GRAPHICS & WORKOUT INITIATION MANAGEMENT ──────────────
function renderWorkoutScreen() {
  const type = getTodayType();
  const workouts = getWorkouts();
  const todayStr = new Date().toISOString().split('T')[0];
  const doneToday = workouts.some(w => w.date && w.date.startsWith(todayStr));
  const container = document.getElementById('workout-ready-content');

  const typeLabels = { push:'Push Day 💪', pull:'Pull Day 🏋️', legs:'Leg Day 🦵', rest:'Rest Day 😴' };
  const typeSubs = {
    push:'Chest, shoulders & triceps focus rotation.',
    pull:'Back, lats & biceps training window.',
    legs:'Quads, hamstrings, glutes & lower calves loop.',
    rest:'Programmed target recovery window. Deep sleep & nutrition emphasis.'
  };

  if (doneToday) {
    container.innerHTML = `
      <div class="workout-day-badge">${typeLabels[type] || 'Complete'}</div>
      <h2 style="font-size:24px; font-weight:800; letter-spacing:-.4px;">Workout Tracked ✅</h2>
      <p style="color:var(--text2); font-size:14px;">Session logged successfully. Look into the history logs matrix to review volume sets details.</p>
      <button class="btn btn-secondary" onclick="forceStartWorkout('${type}')">Log Another Session Anyway</button>
    `;
    return;
  }

  if (type === 'rest') {
    container.innerHTML = `
      <div class="workout-day-badge">Rest Window</div>
      <h2 style="font-size:24px; font-weight:800; letter-spacing:-.4px;">Growth Recovery Phase 😴</h2>
      <p style="color:var(--text2); font-size:14px;">Muscle tissue repairs via recovery windows. Rest or proceed over rules manually:</p>
      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
        <button class="btn btn-ghost" onclick="forceStartWorkout('push')">Train Push Protocol</button>
        <button class="btn btn-ghost" onclick="forceStartWorkout('pull')">Train Pull Protocol</button>
        <button class="btn btn-ghost" onclick="forceStartWorkout('legs')">Train Leg Protocol</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="workout-day-badge">${typeLabels[type]}</div>
    <h2 style="font-size:26px; font-weight:800; letter-spacing:-.5px;">Protocol Scheduled</h2>
    <p style="color:var(--text2); font-size:14px; line-height:1.4;">${typeSubs[type]}</p>
    <button class="btn btn-accent" onclick="startWorkout('${type}')">
      Start ${type.charAt(0).toUpperCase() + type.slice(1)} Session
    </button>
  `;
}

function forceStartWorkout(type) { startWorkout(type); }

function startWorkout(type) {
  const plan = buildWorkout(type);
  if (!plan.length) { alert('No equipped routines loaded. Modify hardware targets inside settings.'); return; }

  UI.workout = {
    type,
    date: new Date().toISOString(),
    startTime: Date.now(),
    exercises: plan,
    exIndex: 0,
    setIndex: 0,
    setData: plan.map(ex => Array.from({length: ex.suggestedSets}, () => ({
      weight: ex.suggestedWeight,
      reps: ex.suggestedReps,
      done: false
    }))),
    completedExercises: [],
    totalVolume: 0
  };

  document.getElementById('workout-ready').style.display = 'none';
  document.getElementById('active-workout').style.display = 'flex';
  UI.workout.timerInterval = setInterval(updateWorkoutTimer, 1000);
  
  // Connect execution parameters inside center workspace click triggers
  document.getElementById('aw-submit-set-btn').onclick = function() {
    submitFocusedActiveSet();
  };

  renderActiveExercise();
}

function updateWorkoutTimer() {
  if (!UI.workout) return;
  const elapsed = Math.floor((Date.now() - UI.workout.startTime) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  document.getElementById('workout-timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('workout-volume').textContent = UI.workout.totalVolume.toLocaleString();
}

// ── SINGLE SET INTERACTIVE INTERFACE WORKSPACE RENDER MATRIX ───────
function renderActiveExercise() {
  const w = UI.workout;
  const ex = w.exercises[w.exIndex];
  const sets = w.setData[w.exIndex];
  const totalSets = sets.length;
  
  // Evaluate boundaries to safely find current non-completed index focus target
  let activeSetIdx = sets.findIndex(s => !s.done);
  if (activeSetIdx === -1) activeSetIdx = totalSets - 1; // Fallback bound tracking safe check
  w.setIndex = activeSetIdx;

  // Header Title Information Parsing
  document.getElementById('aw-type').textContent = w.type.charAt(0).toUpperCase() + w.type.slice(1) + " Routine";
  document.getElementById('aw-progress').textContent = `Exercise ${w.exIndex + 1} of ${w.exercises.length}`;
  document.getElementById('aw-ex-name').textContent = ex.name;
  document.getElementById('aw-ex-muscles').textContent = (ex.muscles || []).map(m => MUSCLE_LABELS[m]).filter((v,i,a)=>a.indexOf(v)===i).join(' · ');
  document.getElementById('aw-pr-badge').style.display = ex.isPR ? 'inline-flex' : 'none';

  // 1. Process Long Segmented Dash Progress Bars
  const dashContainer = document.getElementById('aw-dash-container');
  dashContainer.innerHTML = '';
  for (let i = 0; i < totalSets; i++) {
    const dash = document.createElement('div');
    dash.className = 'set-dash';
    if (sets[i].done) {
      dash.className += ' completed';
    } else if (i === activeSetIdx) {
      dash.className += ' current';
    }
    dashContainer.appendChild(dash);
  }

  // 2. High Focus Center Panel Numerical Parsing Matrix loading targets
  document.getElementById('aw-focus-title').textContent = `Set ${activeSetIdx + 1} of ${totalSets}`;
  
  const inputWeight = document.getElementById('focus-weight');
  const inputReps = document.getElementById('focus-reps');
  
  inputWeight.value = sets[activeSetIdx].weight;
  inputReps.value = sets[activeSetIdx].reps;

  // Overhaul execution blocks to match input states accurately during modification actions
  if (sets[activeSetIdx].done) {
    inputWeight.setAttribute('disabled', 'true');
    inputReps.setAttribute('disabled', 'true');
  } else {
    inputWeight.removeAttribute('disabled');
    inputReps.removeAttribute('disabled');
  }

  // 3. Render Collapsed Bottom Summary List Blocks
  const collapseTarget = document.getElementById('collapse-target');
  collapseTarget.innerHTML = '';
  sets.forEach((s, idx) => {
    const row = document.createElement('div');
    row.className = `mini-set-row ${s.done ? 'done' : ''}`;
    row.innerHTML = `
      <span style="font-weight:700;">Set ${idx + 1}</span>
      <span>${s.done ? '✓ Completed' : 'Pending Progress'}</span>
      <span style="font-variant-numeric:tabular-nums; font-weight:600;">${s.weight} ${getSettings().weightUnit} × ${s.reps} Reps</span>
    `;
    collapseTarget.appendChild(row);
  });

  const trigger = document.getElementById('collapse-trigger');
  if (UI.isSetViewCollapsed) {
    trigger.classList.remove('open');
    collapseTarget.classList.remove('open');
  } else {
    trigger.classList.add('open');
    collapseTarget.classList.add('open');
  }

  // 4. Trace Log Tree Output
  const compList = document.getElementById('aw-completed-list');
  compList.innerHTML = w.completedExercises.map(ce => {
    const vol = ce.sets.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
    return `
      <div class="completed-ex">
        <div class="completed-icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div class="completed-info">
          <div class="completed-name">${ce.name}</div>
          <div class="completed-meta">${ce.sets.length} sets logged · Vol: ${vol.toLocaleString()} ${getSettings().weightUnit}</div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('exercise-area').scrollTop = 0;
}

function saveActiveFocusInputs() {
  if (!UI.workout) return;
  const w = UI.workout;
  const sets = w.setData[w.exIndex];
  const si = w.setIndex;
  if (sets[si] && !sets[si].done) {
    sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0;
    sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  }
}

function toggleSetCollapse() {
  UI.isSetViewCollapsed = !UI.isSetViewCollapsed;
  const trigger = document.getElementById('collapse-trigger');
  const target = document.getElementById('collapse-target');
  if (UI.isSetViewCollapsed) {
    trigger.classList.remove('open');
    target.classList.remove('open');
  } else {
    trigger.classList.add('open');
    target.classList.add('open');
  }
}

function addSetToCurrentExercise() {
  if (!UI.workout) return;
  const w = UI.workout;
  const sets = w.setData[w.exIndex];
  const lastSet = sets[sets.length - 1];
  sets.push({
    weight: lastSet ? lastSet.weight : 135,
    reps: lastSet ? lastSet.reps : 10,
    done: false
  });
  renderActiveExercise();
}

// ── TRANSACTION EXECUTION ENGINE FOR INPUT SELECTION COMPLETE REPS ──
function submitFocusedActiveSet() {
  if (!UI.workout) return;
  const w = UI.workout;
  const sets = w.setData[w.exIndex];
  const si = w.setIndex;

  // Lock and sync local inputs
  sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0;
  sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  sets[si].done = true;

  w.totalVolume += (sets[si].weight * sets[si].reps);

  const allDone = sets.every(s => s.done);
  if (allDone) {
    const isLastEx = w.exIndex >= w.exercises.length - 1;
    showRestScreen('exercise', isLastEx ? null : w.exercises[w.exIndex + 1].name, () => {
      commitCurrentExercise();
      if (isLastEx) {
        finishWorkout();
      } else {
        w.exIndex++;
        w.setIndex = 0;
        renderActiveExercise();
      }
    });
  } else {
    showRestScreen('set', null, () => {
      renderActiveExercise();
    });
  }
}

function commitCurrentExercise() {
  const w = UI.workout;
  const ex = w.exercises[w.exIndex];
  const sets = w.setData[w.exIndex].filter(s => s.done);
  if (!sets.length) return;
  
  // Boundary validation tracking safety prevent duplicate loops inside entries
  if (w.completedExercises.some(c => c.id === ex.id)) return;

  w.completedExercises.push({
    id: ex.id,
    name: ex.name,
    muscles: ex.muscles,
    sets
  });
}

function skipToNextExercise() {
  if (!UI.workout) return;
  const w = UI.workout;
  commitCurrentExercise();
  if (w.exIndex >= w.exercises.length - 1) {
    finishWorkout();
  } else {
    w.exIndex++;
    w.setIndex = 0;
    renderActiveExercise();
  }
}

function finishWorkout() {
  clearInterval(UI.workout.timerInterval);
  clearRestTimer();

  const w = UI.workout;
  commitCurrentExercise();

  if (w.completedExercises.length === 0) {
    // Escape check to guarantee data structure validation rules if nothing was touched
    UI.workout = null;
    document.getElementById('active-workout').style.display = 'none';
    document.getElementById('workout-ready').style.display = 'flex';
    renderWorkoutScreen();
    return;
  }

  const saved = {
    id: w.date,
    date: w.date,
    type: w.type,
    duration: Math.floor((Date.now() - w.startTime) / 1000),
    exercises: w.completedExercises,
    totalVolume: w.completedExercises.reduce((a,e) => a + e.sets.reduce((b,s)=>(b+(s.weight||0)*(s.reps||0)),0), 0)
  };

  saveWorkout(saved);
  UI.workout = null;

  document.getElementById('active-workout').style.display = 'none';
  document.getElementById('workout-ready').style.display = 'flex';

  showSummaryModal(saved);
  renderWorkoutScreen();
}

function endWorkoutEarly() {
  if (!confirm('Terminate session tracker? Checked sets will be saved into tracking history.')) return;
  clearRestTimer();
  finishWorkout();
}

function showSummaryModal(w) {
  const mins = Math.floor(w.duration / 60);
  const unit = getSettings().weightUnit;
  const exRows = w.exercises.map(ex => {
    const vol = ex.sets.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
    return `
      <div class="workout-detail-ex">
        <div style="font-weight:700; font-size:14px; color:var(--text);">${ex.name}</div>
        <div style="font-size:12px; color:var(--text2); display:flex; justify-content:space-between;">
          <span>${ex.sets.length} sets completed</span>
          <span style="color:var(--accent); font-weight:700;">+${vol.toLocaleString()} ${unit}</span>
        </div>
      </div>
    `;
  }).join('');

  showModal(`
    <div style="text-align:center; padding:8px 0 12px">
      <div style="font-size:36px; margin-bottom:4px">⚡</div>
      <div style="font-size:20px; font-weight:800; letter-spacing:-.4px;">Session Compiled!</div>
      <div style="color:var(--text2); font-size:13px; margin-top:4px">${mins} min elapsed · ${w.totalVolume.toLocaleString()} ${unit} total volume</div>
    </div>
    <div class="workout-detail-card">
      <div class="workout-detail-header" style="font-weight:700; font-size:14px; text-transform:uppercase; color:var(--accent);">${w.type} Metrics</div>
      ${exRows}
    </div>
    <button class="btn btn-accent" style="margin-top:4px;" onclick="closeModal()">Confirm Summary Matrix 💪</button>
  `);
}

// ── CORE APPLICATION INTERACTIVE COUNTER OVERLAY ENGINE ───────────
function showRestScreen(type, nextExName, onDone) {
  const s = getSettings();
  const duration = type === 'exercise' ? s.exerciseRestSeconds : s.setRestSeconds;
  const overlay = document.getElementById('rest-overlay');
  const ringFill = document.getElementById('rest-ring-circle');
  const circumference = 2 * Math.PI * 90;

  document.getElementById('rest-overlay-type').textContent = type === 'exercise' ? '— EXERCISE REST WINDOW —' : '— SET REST WINDOW —';
  document.getElementById('rest-overlay-label').textContent = type === 'exercise' ? 'Routines transition phase. Lower heart rate.' : 'Target intra-set nervous recovery...';
  
  const nextContainer = document.getElementById('rest-overlay-next');
  if (nextExName) {
    nextContainer.innerHTML = `Up Next: <strong>${nextExName}</strong>`;
  } else {
    nextContainer.innerHTML = type === 'exercise' ? '<strong>Final Routine Sequence Exhausted!</strong>' : '';
  }

  ringFill.style.strokeDasharray = circumference;
  let rem = duration;

  function setProgress() {
    const frac = rem / duration;
    ringFill.style.strokeDashoffset = circumference * (1 - frac);
    document.getElementById('rest-time-sec').textContent = rem;
  }

  setProgress();
  overlay.classList.add('show');
  clearRestTimer();

  UI.restTimer = setInterval(() => {
    rem--;
    setProgress();
    if (rem <= 0) {
      clearRestTimer();
      overlay.classList.remove('show');
      if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
      onDone();
    }
  }, 1000);

  document.getElementById('rest-skip-trigger').onclick = function() {
    clearRestTimer();
    overlay.classList.remove('show');
    onDone();
  };
}

function clearRestTimer() {
  if (UI.restTimer) { clearInterval(UI.restTimer); UI.restTimer = null; }
}

// ── CALENDAR MATRIX GENERATION ENGINE & EXTENDED DATA LABELS ──────
function renderCalendar() {
  const m = UI.calMonth;
  const yr = m.getFullYear(), mo = m.getMonth();
  document.getElementById('cal-month-label').textContent = m.toLocaleDateString('en-US', {month:'long', year:'numeric'});

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  ['S','M','T','W','T','F','S'].forEach(d => {
    const box = document.createElement('div');
    box.className = 'cal-day-name'; box.textContent = d;
    grid.appendChild(box);
  });

  const firstDow = new Date(yr, mo, 1).getDay();
  const totalDays = new Date(yr, mo + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];
  const workouts = getWorkouts();

  const workoutMap = {};
  workouts.forEach(w => { if (w.date) workoutMap[w.date.split('T')[0]] = w; });

  for (let i = 0; i < firstDow; i++) grid.appendChild(document.createElement('div'));

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = d;

    const isToday = (dayStr === todayStr);
    const scheduledType = getPPLType(dayStr);
    const completedWorkout = workoutMap[dayStr];

    if (isToday) cell.classList.add('today');
    
    if (completedWorkout) {
      cell.classList.add('has-workout');
      cell.onclick = () => showWorkoutDetail(completedWorkout);
    } else if (dayStr > todayStr && scheduledType !== 'rest') {
      cell.classList.add('scheduled');
      const dot = document.createElement('div');
      dot.className = 'cal-day-dot';
      const cMapping = {push:'var(--red)', pull:'var(--blue)', legs:'var(--green)'};
      dot.style.background = cMapping[scheduledType] || 'transparent';
      cell.appendChild(dot);
    } else if (scheduledType === 'rest') {
      cell.classList.add('rest-day');
    }

    grid.appendChild(cell);
  }

  renderCalStats();
}

function renderCalStats() {
  const workouts = getWorkouts();
  document.getElementById('stat-total').textContent = workouts.length;
  
  const totalVol = workouts.reduce((a,w)=>a+(w.totalVolume||0),0);
  const unit = getSettings().weightUnit;
  document.getElementById('stat-vol').textContent = totalVol >= 100000 ? (totalVol/1000).toFixed(0)+'k ' + unit : totalVol.toLocaleString() + ' ' + unit;

  // ── REWRITE STREAK SYSTEM LOGIC INTEGRATING PROGRAMMED REST DAYS ──
  let streak = 0;
  let check = new Date(); 
  check.setHours(0,0,0,0);
  
  const workoutsDates = workouts.map(w => w.date.split('T')[0]);
  let matchesStreak = true;
  let iterationProtection = 0;

  // Evaluate backward to verify loop validity states without breaks
  while (matchesStreak && iterationProtection < 365) {
    const checkStr = check.toISOString().split('T')[0];
    const schedType = getPPLType(checkStr);
    const didWorkout = workoutsDates.includes(checkStr);

    if (didWorkout) {
      streak++;
    } else {
      if (schedType === 'rest') {
        // Condition: Programmed rest day does NOT invalidate streaks if no workout is tracked
        if (checkStr === new Date().toISOString().split('T')[0]) {
          // If today is a rest day, ignore and advance calculation backward safely
        } else {
          // Passed historical rest windows count cleanly as continuous links inside chains
          streak++;
        }
      } else {
        // Break tracking chain loop on missing actual protocol execution matches
        if (checkStr !== new Date().toISOString().split('T')[0]) {
          matchesStreak = false;
        }
      }
    }
    check.setDate(check.getDate() - 1);
    iterationProtection++;
  }

  document.getElementById('stat-streak').textContent = streak;
  renderVolChart();
}

function renderVolChart() {
  const chart = document.getElementById('vol-chart');
  chart.innerHTML = '';
  const dataWeeks = [];
  
  for (let i = 4; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i * 7);
    const start = new Date(d); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    
    const vol = getWorkouts().filter(w => { const wd=new Date(w.date); return wd>=start && wd<=end; }).reduce((a,w)=>a+(w.totalVolume||0),0);
    dataWeeks.push({vol, label: start.toLocaleDateString('en-US',{month:'numeric',day:'numeric'})});
  }

  const maxVal = Math.max(...dataWeeks.map(w=>w.vol), 1);
  dataWeeks.forEach((w, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'vol-bar-wrap';
    const pct = Math.round((w.vol / maxVal) * 100);
    wrap.innerHTML = `
      <div class="vol-bar-inner ${idx===4?'filled':''}" style="height:${pct}%"></div>
      <div class="vol-bar-lbl">${w.label}</div>
    `;
    chart.appendChild(wrap);
  });
}

function changeCalMonth(dir) {
  UI.calMonth = new Date(UI.calMonth.getFullYear(), UI.calMonth.getMonth() + dir, 1);
  renderCalendar();
}

// ── EXPANDED HISTORY VIEW SHOWING INDIVIDUAL SETS AND REPS ────────
function showWorkoutDetail(w) {
  const d = new Date(w.date);
  const unit = getSettings().weightUnit;
  
  const compiledRoutineRows = (w.exercises || []).map(ex => {
    const setPills = (ex.sets || []).map((s, idx) => `
      <div class="history-set-pill">
        <span style="color:var(--accent); font-weight:700;">S${idx+1}</span> ${s.weight}${unit} × ${s.reps}
      </div>
    `).join('');

    return `
      <div class="history-ex-item">
        <div class="history-ex-name">${ex.name}</div>
        <div class="history-sets-grid">${setPills}</div>
      </div>
    `;
  }).join('');

  showModal(`
    <div style="font-size:18px; font-weight:800; letter-spacing:-.4px; color:var(--text);">${d.toLocaleDateString('en-US',{weekday:'long', month:'short', day:'numeric'})}</div>
    <div style="color:var(--text2); font-size:13px; margin-top:2px; text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Protocol: ${w.type.toUpperCase()} · ${(w.totalVolume||0).toLocaleString()} ${unit} Vol</div>
    <div style="margin-top:4px; max-height:45vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
      ${compiledRoutineRows || '<div style="padding:16px; color:var(--text3); text-align:center;">Empty execution details.</div>'}
    </div>
    <button class="btn btn-secondary" style="margin-top:8px;" onclick="closeModal()">Close Detail Layer</button>
  `);
}

// ── MEDICAL GRAPH PATH-VECTOR DATA MATRIX GENERATION MAP ────────────
function renderMuscleMap() {
  const freq = getMusclesWorked(UI.musclePeriod);
  const maxFreq = Math.max(...Object.values(freq), 1);

  const svg = UI.muscleView === 'front' ? frontBodySVG(freq, maxFreq) : backBodySVG(freq, maxFreq);
  document.getElementById('muscle-diagram').innerHTML = svg;

  const leg = document.getElementById('muscle-legend');
  const labelsShown = new Set();
  const legendItems = [];
  
  Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([id, count]) => {
    const label = MUSCLE_LABELS[id];
    if (label && !labelsShown.has(label)) {
      labelsShown.add(label);
      legendItems.push({label, count, color: MUSCLE_COLOR[label]||'#888'});
    }
  });

  leg.innerHTML = legendItems.map(({label,count,color}) => `
    <div class="muscle-pill" style="background:${color}15; border:1px solid ${color}40">
      <div class="muscle-pill-dot" style="background:${color}"></div>
      <span style="color:${color}; font-weight:700;">${label} (×${count})</span>
    </div>
  `).join('');

  const bd = document.getElementById('muscle-breakdown');
  if (!legendItems.length) {
    bd.innerHTML = `<div class="empty-state"><p>No session logs compiled into analytical datasets yet.</p></div>`;
    return;
  }

  bd.innerHTML = `
    <div class="card">
      <div class="section-label" style="margin-bottom:12px;">Volumetric Distribution</div>
      ${legendItems.slice(0,8).map(({label,count,color}) => {
        const pct = Math.round((count / maxFreq) * 100);
        return `
          <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; font-weight:600;">
              <span>${label}</span><span style="color:var(--text2)">${count} loops</span>
            </div>
            <div style="height:6px; background:var(--bg4); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${pct}%; background:${color}; border-radius:3px;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function muscleOpacity(freq, maxFreq, ids) {
  const total = ids.reduce((a,id)=>a+(freq[id]||0), 0);
  if (total === 0) return 0.08;
  return 0.25 + 0.75 * (total / (ids.length * maxFreq));
}

function mColor(ids) {
  return MUSCLE_COLOR[MUSCLE_LABELS[ids[0]]] || '#aaa';
}

// High Precision Real-Anatomical Path Maps Vector Generator
function frontBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids);
  const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 200 440" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
      <path d="M90,35 C90,20 110,20 110,35 C110,48 90,48 90,35 Z" fill="#222" stroke="#444" stroke-width="1"/>
      <path d="M96,46 L96,58 L104,58 L104,46 Z" fill="#222" stroke="#444" stroke-width="1"/>
      
      <path d="M82,58 C90,58 95,64 96,70 L80,72 Z" fill="${c(['trap_l'])}" opacity="${op(['trap_l'])}"/>
      <path d="M118,58 C110,58 105,64 104,70 L120,72 Z" fill="${c(['trap_r'])}" opacity="${op(['trap_r'])}"/>

      <path d="M64,72 C58,80 60,98 68,106 C72,96 74,84 80,72 Z" fill="${c(['front_delt_l'])}" opacity="${op(['front_delt_l','side_delt_l'])}"/>
      <path d="M136,72 C142,80 140,98 132,106 C128,96 126,84 120,72 Z" fill="${c(['front_delt_r'])}" opacity="${op(['front_delt_r','side_delt_r'])}"/>

      <path d="M100,82 L80,80 C74,94 76,112 100,114 Z" fill="${c(['chest_l'])}" opacity="${op(['chest_l'])}" stroke="#111" stroke-width="0.5"/>
      <path d="M100,82 L120,80 C126,94 124,112 100,114 Z" fill="${c(['chest_r'])}" opacity="${op(['chest_r'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M66,108 C60,118 62,134 68,142 C72,134 72,118 68,108 Z" fill="${c(['bicep_l'])}" opacity="${op(['bicep_l'])}"/>
      <path d="M134,108 C140,118 138,134 132,142 C128,134 128,118 132,108 Z" fill="${c(['bicep_r'])}" opacity="${op(['bicep_r'])}"/>

      <path d="M66,145 C60,158 56,176 62,192 L68,192 C70,178 70,158 66,145 Z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>
      <path d="M134,145 C140,158 144,176 138,192 L132,192 C130,178 130,158 134,145 Z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>

      <path d="M84,116 L116,116 L112,175 L88,175 Z" fill="${c(['core'])}" opacity="${op(['core'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M72,196 L98,196 L96,280 L76,280 Z" fill="${c(['quad_l'])}" opacity="${op(['quad_l'])}" stroke="#111" stroke-width="0.5"/>
      <path d="M128,196 L102,196 L104,280 L124,280 Z" fill="${c(['quad_r'])}" opacity="${op(['quad_r'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M76,295 L94,295 L90,370 L80,370 Z" fill="${c(['calf_l'])}" opacity="${op(['calf_l'])}"/>
      <path d="M124,295 L106,295 L110,370 L120,370 Z" fill="${c(['calf_r'])}" opacity="${op(['calf_r'])}"/>
    </svg>
  `;
}

function backBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids);
  const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 200 440" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
      <path d="M90,35 C90,20 110,20 110,35 C110,48 90,48 90,35 Z" fill="#222" stroke="#444" stroke-width="1"/>
      <path d="M96,46 L96,58 L104,58 L104,46 Z" fill="#222" stroke="#444" stroke-width="1"/>

      <path d="M100,58 L80,72 L90,96 L100,104 L110,96 L120,72 Z" fill="${c(['trap_l','trap_r'])}" opacity="${op(['trap_l','trap_r'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M64,72 C58,80 60,94 66,102 L80,72 Z" fill="${c(['rear_delt_l'])}" opacity="${op(['rear_delt_l'])}"/>
      <path d="M136,72 C142,80 140,94 134,102 L120,72 Z" fill="${c(['rear_delt_r'])}" opacity="${op(['rear_delt_r'])}"/>

      <path d="M78,92 C68,116 70,146 86,156 L100,104 Z" fill="${c(['lat_l'])}" opacity="${op(['lat_l'])}" stroke="#111" stroke-width="0.5"/>
      <path d="M122,92 C132,116 130,146 114,156 L100,104 Z" fill="${c(['lat_r'])}" opacity="${op(['lat_r'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M64,106 C60,116 60,132 66,142 C70,132 70,116 64,106 Z" fill="${c(['tricep_l'])}" opacity="${op(['tricep_l'])}"/>
      <path d="M136,106 C140,116 140,132 134,142 C130,132 130,116 136,106 Z" fill="${c(['tricep_r'])}" opacity="${op(['tricep_r'])}"/>

      <path d="M88,156 L112,156 L108,188 L92,188 Z" fill="${c(['lower_back'])}" opacity="${op(['lower_back'])}"/>

      <path d="M72,192 C72,176 100,176 100,192 C100,176 128,176 128,192 C128,216 102,224 100,224 C98,224 72,216 72,192 Z" fill="${c(['glute_l','glute_r'])}" opacity="${op(['glute_l','glute_r'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M74,226 L98,226 L96,280 L74,280 Z" fill="${c(['ham_l'])}" opacity="${op(['ham_l'])}" stroke="#111" stroke-width="0.5"/>
      <path d="M126,226 L102,226 L104,280 L126,280 Z" fill="${c(['ham_r'])}" opacity="${op(['ham_r'])}" stroke="#111" stroke-width="0.5"/>

      <path d="M76,295 C70,315 72,350 82,368 L92,295 Z" fill="${c(['calf_l'])}" opacity="${op(['calf_l'])}"/>
      <path d="M124,295 C130,315 128,350 118,368 L108,295 Z" fill="${c(['calf_r'])}" opacity="${op(['calf_r'])}"/>
    </svg>
  `;
}

function setMuscleView(v) { UI.muscleView = v; document.querySelectorAll('.muscle-tab').forEach(t=>t.classList.remove('active')); document.getElementById('mtab-'+v).classList.add('active'); renderMuscleMap(); }
function setMusclePeriod(p) { UI.musclePeriod = p; document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active')); document.getElementById('ptab-'+p).classList.add('active'); renderMuscleMap(); }

// ── SETTINGS MANAGEMENT & LAYOUT CRAMP COMPACTION REMOVAL MATRIX ──
function renderSettings() {
  const s = getSettings();
  const patternLabel = s.pattern.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' → ');
  const blocksLabel = s.blockedWeekdays.length ? s.blockedWeekdays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') : 'None Restricting';
  const eqLabel = s.equipment.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ');
  const unitLabel = s.weightUnit === 'lbs' ? 'Pounds (lbs)' : 'Kilograms (kg)';

  document.getElementById('settings-content').innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Rotation Blueprint</div>
      <div class="settings-row" onclick="editSetting('pattern')">
        <div class="settings-row-left"><div class="settings-row-label">Sequence Loop</div><div class="settings-row-value">${patternLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('blocked')">
        <div class="settings-row-left"><div class="settings-row-label">Hard Blocked Days</div><div class="settings-row-value">${blocksLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Hardware & Standards</div>
      <div class="settings-row" onclick="editSetting('equipment')">
        <div class="settings-row-left"><div class="settings-row-label">Equipped Targets</div><div class="settings-row-value">${eqLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('unit')">
        <div class="settings-row-left"><div class="settings-row-label">Metrics Weight Unit</div><div class="settings-row-value">${unitLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('color')">
        <div class="settings-row-left"><div class="settings-row-label">Theme Accent Customizer</div><div class="settings-row-value" style="text-transform:uppercase; font-weight:700; color:var(--accent);">${s.accentTheme}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Intra-Set Recovery</div>
      <div class="settings-row" onclick="editSetting('timers')">
        <div class="settings-row-left"><div class="settings-row-label">Timing Parameters</div><div class="settings-row-value">Sets: ${s.setRestSeconds}s · Routines: ${s.exerciseRestSeconds}s</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">System Purge</div>
      <div class="settings-row" onclick="resetData()">
        <div class="settings-row-left"><div class="settings-row-label" style="color:var(--red);">Wipe Data Storage</div><div class="settings-row-value">Hard erase history files & tracking variables.</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>
  `;
}

function editSetting(key) {
  const s = getSettings();
  if (key === 'color') {
    showModal(`
      <div class="modal-title">Select App Accent Color</div>
      <div class="color-picker-grid" id="settings-color-grid"></div>
      <button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsThemeColor()">Save Theme Override</button>
    `);
    
    const grid = document.getElementById('settings-color-grid');
    Object.keys(ACCENT_PALETTE).forEach(k => {
      const dot = document.createElement('div');
      dot.className = `color-dot ${s.accentTheme === k ? 'selected' : ''}`;
      dot.style.background = ACCENT_PALETTE[k].primary;
      dot.dataset.color = k;
      dot.onclick = function() {
        document.querySelectorAll('#settings-color-grid .color-dot').forEach(d => d.classList.remove('selected'));
        this.classList.add('selected');
      };
      grid.appendChild(dot);
    });
  } else if (key === 'timers') {
    showModal(`
      <div class="modal-title">Configure Recovery Durations</div>
      <div class="field">
        <label>Set Rest Interval (Seconds)</label>
        <input type="number" id="edit-set-rest" value="${s.setRestSeconds}">
      </div>
      <div class="field" style="margin-top:8px;">
        <label>Exercise Rest Interval (Seconds)</label>
        <input type="number" id="edit-ex-rest" value="${s.exerciseRestSeconds}">
      </div>
      <button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsTimers()">Save Timing Parameters</button>
    `);
  } else if (key === 'unit') {
    showModal(`
      <div class="modal-title">Toggle Hardware Standards</div>
      <select id="edit-global-unit">
        <option value="lbs" ${s.weightUnit==='lbs'?'selected':''}>Pounds (lbs)</option>
        <option value="kg" ${s.weightUnit==='kg'?'selected':''}>Kilograms (kg)</option>
      </select>
      <button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsUnit()">Update Standard</button>
    `);
  } else if (key === 'blocked') {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    showModal(`
      <div class="modal-title">Hard Blocked Weekdays</div>
      <div class="chip-group" style="margin-top:8px;">
        ${days.map((d,i) => `<div class="chip settings-block-chip ${s.blockedWeekdays.includes(i)?'selected':''}" data-day="${i}" onclick="this.classList.toggle('selected')">${d}</div>`).join('')}
      </div>
      <button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsBlockedDays()">Save Block Constraints</button>
    `);
  } else if (key === 'equipment') {
    const gear = ['barbell','dumbbells','cables','machines'];
    showModal(`
      <div class="modal-title">Edit Hardware Restrictions</div>
      <div class="chip-group" style="margin-top:8px;">
        ${gear.map(g => `<div class="chip settings-gear-chip ${s.equipment.includes(g)?'selected':''}" data-eq="${g}" onclick="this.classList.toggle('selected')">${g.charAt(0).toUpperCase()+g.slice(1)}</div>`).join('')}
      </div>
      <button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsEquipment()">Save Hardware Arrays</button>
    `);
  } else if (key === 'pattern') {
    showModal(`
      <div class="modal-title">Update Rolling Block Blueprint</div>
      <div class="field">
        <label>Rotation Length Slot Items</label>
        <select id="edit-pattern-len" onchange="adjustSettingsPatternSlots(this.value)">
          ${[3,4,5,6,7,8].map(n => `<option value="${n}" ${s.pattern.length===n?'selected':''}>${n} Array Elements</option>`).join('')}
        </select>
      </div>
      <div id="settings-slots-editor-wrap" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;"></div>
      <button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsPatternMatrix()">Save Rolling Vector</button>
    `);
    adjustSettingsPatternSlots(s.pattern.length);
  }
}

function adjustSettingsPatternSlots(len) {
  const wrap = document.getElementById('settings-slots-editor-wrap');
  wrap.innerHTML = '';
  const s = getSettings();
  for (let i = 0; i < parseInt(len); i++) {
    const val = s.pattern[i] || 'rest';
    wrap.innerHTML += `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:14px; background:var(--bg3); padding:8px; border-radius:6px;">
        <span>Element Slot #${i+1}</span>
        <select class="settings-slot-select" style="width:140px; padding:6px;" data-index="${i}">
          <option value="push" ${val==='push'?'selected':''}>Push</option>
          <option value="pull" ${val==='pull'?'selected':''}>Pull</option>
          <option value="legs" ${val==='legs'?'selected':''}>Legs</option>
          <option value="rest" ${val==='rest'?'selected':''}>Rest</option>
        </select>
      </div>
    `;
  }
}

function saveSettingsThemeColor() {
  const selectedNode = document.querySelector('#settings-color-grid .color-dot.selected');
  if (selectedNode) {
    const s = getSettings();
    s.accentTheme = selectedNode.dataset.color;
    saveSettings(s);
    closeModal();
    renderSettings();
  }
}

function saveSettingsTimers() {
  const s = getSettings();
  s.setRestSeconds = parseInt(document.getElementById('edit-set-rest').value) || 90;
  s.exerciseRestSeconds = parseInt(document.getElementById('edit-ex-rest').value) || 180;
  saveSettings(s); closeModal(); renderSettings();
}

function saveSettingsUnit() {
  const s = getSettings();
  s.weightUnit = document.getElementById('edit-global-unit').value;
  saveSettings(s); closeModal(); renderSettings(); refreshAppStateLabels();
}

function saveSettingsBlockedDays() {
  const s = getSettings();
  s.blockedWeekdays = [...document.querySelectorAll('.settings-block-chip.selected')].map(c => parseInt(c.dataset.day));
  saveSettings(s); closeModal(); renderSettings(); renderCalendar();
}

function saveSettingsEquipment() {
  const s = getSettings();
  s.equipment = [...document.querySelectorAll('.settings-gear-chip.selected')].map(c => c.dataset.eq);
  if (!s.equipment.length) { alert('Retain at least one device category template context.'); return; }
  saveSettings(s); closeModal(); renderSettings();
}

function saveSettingsPatternMatrix() {
  const s = getSettings();
  const arr = [];
  document.querySelectorAll('.settings-slot-select').forEach(sel => arr.push(sel.value));
  s.pattern = arr;
  saveSettings(s); closeModal(); renderSettings(); renderCalendar(); renderWorkoutScreen();
}

// ── UTILITY INTERACTION CONTAINER HOOKS ────────────────────────────
function showModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function resetData() {
  if (!confirm('Purge completely? This permanently erases browser history keys.')) return;
  ['workouts','settings','customWorkouts'].forEach(k => DB.del(k));
  location.reload();
}
function refreshAppStateLabels() {
  const s = getSettings();
  document.querySelectorAll('.global-unit-label').forEach(n => n.textContent = s.weightUnit);
  const label = document.getElementById('today-label');
  if (label) {
    const type = getTodayType();
    const mappings = {push:'Scheduled: Push Protocol', pull:'Scheduled: Pull Protocol', legs:'Scheduled: Leg Protocol', rest:'Scheduled: Rest Recovery Window'};
    label.textContent = new Date().toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'}) + " · " + (mappings[type]||'');
  }
}

// ── ENGINE INITIALIZATION TRIGGER ENTRY POINT ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
  applyAccentTheme();
  
  if (!DB.get('settings')) {
    startOnboarding();
  } else {
    refreshAppStateLabels();
    renderWorkoutScreen();
    showScreen('workout');
  }
});

// ═══════════════════════════════════════════════════════════════════
// IRON LOG — app.js
// ═══════════════════════════════════════════════════════════════════

// ── STORAGE ─────────────────────────────────────────────────────────
const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem('il_' + k)); } catch { return null; } },
  set(k, v) { localStorage.setItem('il_' + k, JSON.stringify(v)); return v; },
  del(k) { localStorage.removeItem('il_' + k); }
};

// ── DEFAULT SETTINGS ─────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  daysPerWeek: 4,
  restDays: [0], // 0=Sun
  equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
  level: 'intermediate',
  setRestSeconds: 90,
  exerciseRestSeconds: 180,
  weightUnit: 'lbs',
  startDay: null, // ISO date of first Push day
};

// ── EXERCISE LIBRARY ─────────────────────────────────────────────────
// muscles array maps to SVG muscle group IDs
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
    { id:'dips',             name:'Dips',                muscles:['chest_l','chest_r','tricep_l','tricep_r'],  equipment:['machines'],            sets:3, reps:[8,12],  icon:'body' },
    { id:'pushup',           name:'Push-Up',             muscles:['chest_l','chest_r','tricep_l','tricep_r'],  equipment:['barbell','dumbbells','cables','machines'], sets:3, reps:[12,15], icon:'body' },
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
    { id:'hammer_curl',      name:'Hammer Curl',         muscles:['bicep_l','bicep_r'],                       equipment:['dumbbells'],           sets:3, reps:[10,12], icon:'dumbbell' },
    { id:'machine_row',      name:'Machine Row',         muscles:['lat_l','lat_r','trap_l','trap_r'],         equipment:['machines'],            sets:3, reps:[10,12], icon:'machine' },
  ],
  legs: [
    { id:'squat',            name:'Barbell Squat',       muscles:['quad_l','quad_r','glute_l','glute_r'],     equipment:['barbell'],             sets:4, reps:[5,8],   icon:'barbell' },
    { id:'rdl',              name:'Romanian Deadlift',   muscles:['ham_l','ham_r','glute_l','glute_r','lower_back'], equipment:['barbell','dumbbells'], sets:3, reps:[8,10], icon:'barbell' },
    { id:'leg_press',        name:'Leg Press',           muscles:['quad_l','quad_r','glute_l','glute_r'],     equipment:['machines'],            sets:4, reps:[10,12], icon:'machine' },
    { id:'lunges',           name:'Walking Lunges',      muscles:['quad_l','quad_r','glute_l','glute_r','ham_l','ham_r'], equipment:['barbell','dumbbells'], sets:3, reps:[10,12], icon:'body' },
    { id:'leg_curl',         name:'Leg Curl',            muscles:['ham_l','ham_r'],                           equipment:['machines','cables'],   sets:3, reps:[10,12], icon:'machine' },
    { id:'leg_extension',    name:'Leg Extension',       muscles:['quad_l','quad_r'],                         equipment:['machines'],            sets:3, reps:[12,15], icon:'machine' },
    { id:'goblet_squat',     name:'Goblet Squat',        muscles:['quad_l','quad_r','glute_l','glute_r'],     equipment:['dumbbells'],           sets:3, reps:[12,15], icon:'dumbbell' },
    { id:'calf_raise',       name:'Calf Raise',          muscles:['calf_l','calf_r'],                         equipment:['barbell','dumbbells','machines','cables'], sets:4, reps:[12,15], icon:'body' },
    { id:'hip_thrust',       name:'Hip Thrust',          muscles:['glute_l','glute_r','ham_l','ham_r'],       equipment:['barbell','machines'],  sets:3, reps:[10,12], icon:'barbell' },
  ]
};

const ALL_EXERCISES = [...LIBRARY.push, ...LIBRARY.pull, ...LIBRARY.legs];

// ── PPL SCHEDULE ─────────────────────────────────────────────────────
// Returns the workout type for a given date string (yyyy-mm-dd)
function getPPLType(dateStr) {
  const settings = getSettings();
  const restDays = settings.restDays || [0];
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  if (restDays.includes(dow)) return 'rest';

  // Find start date
  let startDate = settings.startDate ? new Date(settings.startDate + 'T12:00:00') : null;
  if (!startDate) {
    // Default: today is push
    startDate = new Date();
    startDate.setHours(12,0,0,0);
  }

  // Count non-rest days from startDate to d
  const target = new Date(d);
  const start = new Date(startDate);
  start.setHours(12,0,0,0);
  target.setHours(12,0,0,0);

  let count = 0;
  const cur = new Date(start);
  while (cur <= target) {
    const curDow = cur.getDay();
    if (!restDays.includes(curDow)) {
      if (cur.getTime() === target.getTime()) break;
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  const types = ['push', 'pull', 'legs'];
  return types[count % 3];
}

function getTodayType() {
  const today = new Date();
  const str = today.toISOString().split('T')[0];
  return getPPLType(str);
}

// ── SETTINGS ─────────────────────────────────────────────────────────
function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(DB.get('settings') || {}) };
}
function saveSettings(s) {
  DB.set('settings', s);
}

// ── EXERCISE SELECTION ───────────────────────────────────────────────
function getEquippedExercises(type) {
  const settings = getSettings();
  const eq = settings.equipment || ['barbell','dumbbells'];
  return LIBRARY[type].filter(ex => ex.equipment.some(e => eq.includes(e)));
}

// Returns a full workout plan (array of exercise objects with suggested weight/reps)
function buildWorkout(type) {
  const settings = getSettings();
  // Check for custom workout for this type
  const customs = DB.get('customWorkouts') || {};
  if (customs[type]) {
    return customs[type].map(ex => withSuggestion(ex));
  }

  const pool = getEquippedExercises(type);
  const level = settings.level || 'intermediate';

  // Pick exercises: compound first, then accessories
  // Push: 2 chest compounds, 1 shoulder compound, 1 shoulder accessory, 2 tricep
  // Pull: 1 deadlift/heavy, 2 back compounds, 1 back accessory, 2 bicep
  // Legs: 1 squat, 1 hinge, 2 accessories, 1 calf
  const plan = selectExercisePlan(type, pool, level);
  return plan.map(ex => withSuggestion(ex));
}

function selectExercisePlan(type, pool, level) {
  const find = ids => ids.map(id => pool.find(e => e.id === id)).filter(Boolean);
  const fallback = (arr, n) => arr.slice(0, n);

  if (type === 'push') {
    const chest = find(['bench_press','incline_bench','db_incline','cable_fly','dips','pushup']);
    const shoulder = find(['ohp','db_shoulder_press','lateral_raise']);
    const tricep = find(['tricep_pushdown','skull_crusher','dips']);
    return [
      ...(chest[0] ? [chest[0]] : []),
      ...(chest[1] ? [chest[1]] : []),
      ...(shoulder[0] ? [shoulder[0]] : []),
      ...(shoulder.find(e=>e.id==='lateral_raise') ? [shoulder.find(e=>e.id==='lateral_raise')] : shoulder[1] ? [shoulder[1]] : []),
      ...(tricep[0] ? [tricep[0]] : []),
      ...(tricep[1] && tricep[1].id !== (tricep[0]||{}).id ? [tricep[1]] : []),
    ].slice(0, level === 'beginner' ? 4 : 6);
  }
  if (type === 'pull') {
    const heavy = find(['deadlift','bent_row','pullup']);
    const back = find(['lat_pulldown','cable_row','db_row','machine_row','pullup']);
    const rear = find(['face_pull']);
    const bicep = find(['barbell_curl','hammer_curl']);
    return [
      ...(heavy[0] ? [heavy[0]] : []),
      ...(back.filter(e=>e.id!==heavy[0]?.id)[0] ? [back.filter(e=>e.id!==heavy[0]?.id)[0]] : []),
      ...(back.filter(e=>e.id!==heavy[0]?.id)[1] ? [back.filter(e=>e.id!==heavy[0]?.id)[1]] : []),
      ...(rear[0] ? [rear[0]] : []),
      ...(bicep[0] ? [bicep[0]] : []),
      ...(bicep[1] ? [bicep[1]] : []),
    ].slice(0, level === 'beginner' ? 4 : 6);
  }
  if (type === 'legs') {
    const squat = find(['squat','goblet_squat','leg_press']);
    const hinge = find(['rdl','leg_curl','lunges']);
    const acc = find(['leg_press','leg_extension','leg_curl','lunges','hip_thrust']);
    const calf = find(['calf_raise']);
    return [
      ...(squat[0] ? [squat[0]] : []),
      ...(hinge[0] ? [hinge[0]] : []),
      ...(acc.filter(e=>e.id!==squat[0]?.id&&e.id!==hinge[0]?.id)[0] ? [acc.filter(e=>e.id!==squat[0]?.id&&e.id!==hinge[0]?.id)[0]] : []),
      ...(acc.filter(e=>e.id!==squat[0]?.id&&e.id!==hinge[0]?.id)[1] ? [acc.filter(e=>e.id!==squat[0]?.id&&e.id!==hinge[0]?.id)[1]] : []),
      ...(calf[0] ? [calf[0]] : []),
    ].slice(0, level === 'beginner' ? 4 : 5);
  }
  return pool.slice(0,5);
}

// ── PROGRESSIVE OVERLOAD SUGGESTION ─────────────────────────────────
function withSuggestion(ex) {
  const settings = getSettings();
  const history = getExerciseHistory(ex.id || ex.name);
  const unit = settings.weightUnit || 'lbs';
  const step = unit === 'lbs' ? 5 : 2.5;

  let suggestedWeight = getDefaultWeight(ex, settings.level, unit);
  let suggestedSets = ex.sets || 3;
  let suggestedReps = ex.reps ? ex.reps[0] : 10;
  let isPR = false;

  if (history.length > 0) {
    const last = history[history.length - 1];
    const lastWeight = Math.max(...last.sets.map(s => s.weight || 0));
    const lastReps = last.sets.map(s => s.reps || 0);
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
    rdl:         {beginner:95,intermediate:135,advanced:185},
  };
  const lvl = level || 'intermediate';
  const base = defaults[ex.id] ? defaults[ex.id][lvl] : 45;
  return Math.round(base * mult / 5) * 5;
}

// ── WORKOUT HISTORY ──────────────────────────────────────────────────
function getWorkouts() { return DB.get('workouts') || []; }
function saveWorkout(w) {
  const workouts = getWorkouts();
  workouts.push(w);
  DB.set('workouts', workouts);
}

function getExerciseHistory(idOrName) {
  return getWorkouts().flatMap(w =>
    (w.exercises || []).filter(e => e.id === idOrName || e.name === idOrName)
      .map(e => ({ ...e, date: w.date }))
  );
}

// ── MUSCLE MAP DATA ──────────────────────────────────────────────────
const MUSCLE_LABELS = {
  chest_l:'Chest', chest_r:'Chest', lat_l:'Lats', lat_r:'Lats',
  front_delt_l:'Shoulders', front_delt_r:'Shoulders', side_delt_l:'Shoulders', side_delt_r:'Shoulders',
  rear_delt_l:'Rear Delts', rear_delt_r:'Rear Delts',
  bicep_l:'Biceps', bicep_r:'Biceps', tricep_l:'Triceps', tricep_r:'Triceps',
  trap_l:'Traps', trap_r:'Traps', lower_back:'Lower Back',
  quad_l:'Quads', quad_r:'Quads', ham_l:'Hamstrings', ham_r:'Hamstrings',
  glute_l:'Glutes', glute_r:'Glutes', calf_l:'Calves', calf_r:'Calves',
  core:'Core', forearm_l:'Forearms', forearm_r:'Forearms'
};
const MUSCLE_COLOR = {
  'Chest':'#ff6b6b','Lats':'#4d9fff','Shoulders':'#ffa94d','Rear Delts':'#da77f2',
  'Biceps':'#3ddc84','Triceps':'#cc44ff','Traps':'#74c0fc','Lower Back':'#f06595',
  'Quads':'#ffe066','Hamstrings':'#63e6be','Glutes':'#ff8c42','Calves':'#a9e34b',
  'Core':'#748ffc','Forearms':'#3ddc84'
};

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

// ═══════════════════════════════════════════════════════════════════
// UI STATE
// ═══════════════════════════════════════════════════════════════════
let UI = {
  screen: 'workout',
  calMonth: new Date(),
  muscleView: 'front',
  musclePeriod: 'week',
  // Active workout state
  workout: null,
  // Rest timer
  restTimer: null,
};

// ── Active workout object ─────────────────────────────────────────
// {
//   type: 'push'|'pull'|'legs',
//   date: ISO string,
//   startTime: timestamp,
//   exercises: [...],       // plan
//   exIndex: 0,             // current exercise index
//   setIndex: 0,            // current set index
//   completedExercises: [], // logged data
//   totalVolume: 0,
//   timerInterval: null
// }

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
function showScreen(name) {
  UI.screen = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const s = document.getElementById('screen-' + name);
  if (s) s.classList.add('active');
  const b = document.querySelector(`.nav-btn[data-screen="${name}"]`);
  if (b) b.classList.add('active');
  if (name === 'calendar') renderCalendar();
  if (name === 'muscles') renderMuscleMap();
  if (name === 'settings') renderSettings();
}

// ═══════════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════════
let onboardData = {};

function startOnboarding() {
  document.getElementById('onboarding').style.display = 'flex';
  showOnboardStep(1);
}

function showOnboardStep(n) {
  document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
  const step = document.getElementById('onboard-' + n);
  if (step) step.classList.add('active');
}

function onboardNext(n) {
  // Collect data from current step
  if (n === 1) {
    const v = document.getElementById('ob-days').value;
    onboardData.daysPerWeek = parseInt(v);
  }
  if (n === 2) {
    const checked = [...document.querySelectorAll('.ob-rest-chip.selected')].map(c => parseInt(c.dataset.day));
    onboardData.restDays = checked;
  }
  if (n === 3) {
    const checked = [...document.querySelectorAll('.ob-eq-chip.selected')].map(c => c.dataset.eq);
    if (checked.length === 0) { alert('Select at least one equipment type.'); return; }
    onboardData.equipment = checked;
  }
  if (n === 4) {
    onboardData.level = document.querySelector('.ob-level-chip.selected')?.dataset.level || 'intermediate';
  }
  if (n === 5) {
    onboardData.setRestSeconds = parseInt(document.getElementById('ob-set-rest').value) || 90;
    onboardData.exerciseRestSeconds = parseInt(document.getElementById('ob-ex-rest').value) || 180;
    onboardData.weightUnit = document.querySelector('.ob-unit-chip.selected')?.dataset.unit || 'lbs';
    // Save and finish
    const settings = { ...DEFAULT_SETTINGS, ...onboardData, startDate: new Date().toISOString().split('T')[0] };
    saveSettings(settings);
    document.getElementById('onboarding').style.display = 'none';
    renderWorkoutScreen();
    return;
  }
  showOnboardStep(n + 1);
}

function toggleObChip(el, group) {
  if (group === 'single') {
    document.querySelectorAll(`.${el.className.split(' ')[0]}`).forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  } else {
    el.classList.toggle('selected');
  }
}

// ═══════════════════════════════════════════════════════════════════
// WORKOUT SCREEN
// ═══════════════════════════════════════════════════════════════════
function renderWorkoutScreen() {
  const type = getTodayType();
  const settings = getSettings();
  const workouts = getWorkouts();

  // Check if already worked out today
  const todayStr = new Date().toISOString().split('T')[0];
  const doneToday = workouts.some(w => w.date && w.date.startsWith(todayStr));

  const container = document.getElementById('workout-ready-content');
  const typeLabels = { push:'Push Day 💪', pull:'Pull Day 🏋️', legs:'Leg Day 🦵', rest:'Rest Day 😴' };
  const typeSubs = {
    push:'Chest, shoulders & triceps',
    pull:'Back & biceps',
    legs:'Quads, hamstrings, glutes & calves',
    rest:'Recovery — active rest or mobility work'
  };

  if (doneToday) {
    container.innerHTML = `
      <div class="workout-day-badge badge-${type}">${typeLabels[type] || 'Rest'}</div>
      <h2>Workout Complete ✅</h2>
      <p style="color:var(--text2)">You already logged a workout today. Check your history on the Calendar tab.</p>
      <button class="btn btn-secondary" onclick="forceStartWorkout('${type}')">Train Again Anyway</button>
    `;
    return;
  }

  if (type === 'rest') {
    container.innerHTML = `
      <div class="workout-day-badge badge-rest">Rest Day</div>
      <h2>Rest Up 😴</h2>
      <p style="color:var(--text2)">Recovery is where the gains happen. Stretch, walk, or do nothing.</p>
      <div style="margin-top:8px">
        ${['push','pull','legs'].map(t =>
          `<button class="btn btn-ghost" style="margin-bottom:8px" onclick="forceStartWorkout('${t}')">
            Train anyway — ${t.charAt(0).toUpperCase()+t.slice(1)}
          </button>`
        ).join('')}
      </div>
    `;
    return;
  }

  const lastWorkout = workouts.filter(w=>w.type===type).slice(-1)[0];
  const lastStr = lastWorkout ? ` · Last ${type}: ${formatDate(lastWorkout.date)}` : '';

  container.innerHTML = `
    <div class="workout-day-badge badge-${type}">${typeLabels[type]}</div>
    <h2>${typeLabels[type]}</h2>
    <p style="color:var(--text2)">${typeSubs[type]}${lastStr}</p>
    <button class="btn btn-accent" onclick="startWorkout('${type}')">
      <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Start ${type.charAt(0).toUpperCase()+type.slice(1)} Workout
    </button>
  `;
}

function forceStartWorkout(type) { startWorkout(type); }

function startWorkout(type) {
  if (type === 'rest') return;
  const plan = buildWorkout(type);
  if (!plan.length) { alert('No exercises available for your equipment. Check Settings.'); return; }

  UI.workout = {
    type,
    date: new Date().toISOString(),
    startTime: Date.now(),
    exercises: plan,
    exIndex: 0,
    setIndex: 0,
    // Per-exercise set tracking: array of arrays
    setData: plan.map(ex => Array.from({length: ex.suggestedSets}, () => ({
      weight: ex.suggestedWeight,
      reps: ex.suggestedReps,
      done: false
    }))),
    completedExercises: [],
    totalVolume: 0,
  };

  document.getElementById('workout-ready').style.display = 'none';
  document.getElementById('active-workout').style.display = 'flex';

  // Start timer
  UI.workout.timerInterval = setInterval(updateWorkoutTimer, 1000);

  renderActiveExercise();
}

function updateWorkoutTimer() {
  if (!UI.workout) return;
  const elapsed = Math.floor((Date.now() - UI.workout.startTime) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  const el = document.getElementById('workout-timer');
  if (el) el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const velEl = document.getElementById('workout-volume');
  if (velEl) velEl.textContent = UI.workout.totalVolume.toLocaleString();
}

function renderActiveExercise() {
  const w = UI.workout;
  const ex = w.exercises[w.exIndex];
  const total = w.exercises.length;
  const sets = w.setData[w.exIndex];
  const si = w.setIndex;

  // Header
  document.getElementById('aw-type').textContent = w.type.charAt(0).toUpperCase() + w.type.slice(1) + ' Day';
  document.getElementById('aw-ex-name').textContent = ex.name;
  document.getElementById('aw-ex-muscles').textContent = (ex.muscles || []).map(m => MUSCLE_LABELS[m]).filter((v,i,a)=>a.indexOf(v)===i).join(' · ');
  document.getElementById('aw-progress').textContent = `Exercise ${w.exIndex+1} of ${total}`;
  document.getElementById('aw-progress-bar').style.width = `${((w.exIndex)/(total))*100}%`;

  // Completed exercises
  const compList = document.getElementById('aw-completed-list');
  compList.innerHTML = w.completedExercises.map(ce => {
    const vol = ce.sets.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
    return `<div class="completed-ex">
      <div class="completed-icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="completed-info"><div class="completed-name">${ce.name}</div>
      <div class="completed-meta">${ce.sets.length} sets · ${vol.toLocaleString()} lbs</div></div>
      <div class="completed-vol">${vol.toLocaleString()}</div>
    </div>`;
  }).join('');

  // Set list
  const setList = document.getElementById('aw-set-list');
  setList.innerHTML = '';

  // Header row
  const hdr = document.createElement('div');
  hdr.className = 'set-header';
  hdr.innerHTML = `<span>SET</span><span>WEIGHT (${getSettings().weightUnit})</span><span>REPS</span><span></span>`;
  setList.appendChild(hdr);

  sets.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'set-row' + (i === si ? ' active-set' : '') + (s.done ? ' done-set' : '');
    row.id = `set-row-${i}`;
    const isActive = i === si && !s.done;
    row.innerHTML = `
      <div class="set-num">${i+1}</div>
      <input class="set-input" type="number" inputmode="decimal" value="${s.weight}" ${s.done ? 'disabled' : ''} onchange="updateSetVal(${i},'weight',+this.value)" style="${s.done?'opacity:.5':''}">
      <input class="set-input" type="number" inputmode="numeric" value="${s.reps}" ${s.done ? 'disabled' : ''} onchange="updateSetVal(${i},'reps',+this.value)" style="${s.done?'opacity:.5':''}">
      <div class="set-check ${s.done?'done':''}" ${isActive ? `onclick="completeSet(${i})"` : ''}>
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>`;
    setList.appendChild(row);
  });

  // Add set button + end workout
  document.getElementById('aw-add-set').onclick = () => addSetToCurrentExercise();

  // If ex has PR suggestion
  const prEl = document.getElementById('aw-pr-badge');
  if (prEl) prEl.style.display = ex.isPR ? 'inline-flex' : 'none';

  // Scroll to top of exercise area
  const area = document.getElementById('exercise-area');
  if (area) area.scrollTop = 0;
}

function updateSetVal(i, field, val) {
  UI.workout.setData[UI.workout.exIndex][i][field] = val;
}

function addSetToCurrentExercise() {
  const w = UI.workout;
  const last = w.setData[w.exIndex][w.setData[w.exIndex].length - 1];
  w.setData[w.exIndex].push({ weight: last.weight, reps: last.reps, done: false });
  renderActiveExercise();
}

function completeSet(i) {
  const w = UI.workout;
  const sets = w.setData[w.exIndex];
  // Read current inputs
  const weightEl = document.querySelector(`#set-row-${i} .set-input:first-of-type`);
  const repsEl = document.querySelector(`#set-row-${i} .set-input:last-of-type`);
  if (weightEl) sets[i].weight = parseFloat(weightEl.value) || 0;
  if (repsEl) sets[i].reps = parseInt(repsEl.value) || 0;
  sets[i].done = true;

  // Update volume
  w.totalVolume += (sets[i].weight * sets[i].reps);

  // Find next undone set
  const nextSet = sets.findIndex((s, idx) => idx > i && !s.done);
  const allDone = sets.every(s => s.done);

  if (allDone) {
    // All sets done — rest then move to next exercise
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
    // Set rest
    w.setIndex = nextSet >= 0 ? nextSet : i + 1;
    const nextEx = sets[w.setIndex];
    showRestScreen('set', null, () => {
      renderActiveExercise();
    });
  }
}

function commitCurrentExercise() {
  const w = UI.workout;
  const ex = w.exercises[w.exIndex];
  const sets = w.setData[w.exIndex].filter(s => s.done || s.weight > 0);
  if (!sets.length) return;
  w.completedExercises.push({
    id: ex.id,
    name: ex.name,
    muscles: ex.muscles,
    sets
  });
}

function skipToNextExercise() {
  // Commit whatever sets are done and move on
  const w = UI.workout;
  commitCurrentExercise();
  if (w.exIndex >= w.exercises.length - 1) {
    finishWorkout();
  } else {
    w.exIndex++;
    w.setIndex = 0;
    renderActiveExercise();
    const area = document.getElementById('exercise-area');
    if (area) area.scrollTop = 0;
  }
}

function finishWorkout() {
  clearInterval(UI.workout.timerInterval);
  clearRestTimer();

  const w = UI.workout;
  // Commit current if not already done
  const alreadyCommitted = w.completedExercises.some(e => e.name === w.exercises[w.exIndex]?.name);
  if (!alreadyCommitted) commitCurrentExercise();

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
  if (!confirm('End workout? Progress so far will be saved.')) return;
  clearRestTimer();
  if (UI.restTimerTimeout) { clearTimeout(UI.restTimerTimeout); }
  document.getElementById('rest-overlay').classList.remove('show');
  finishWorkout();
}

function showSummaryModal(w) {
  const mins = Math.floor(w.duration / 60);
  const exRows = w.exercises.map(ex => {
    const vol = ex.sets.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
    const best = Math.max(...ex.sets.map(s=>s.weight||0));
    return `<div class="workout-detail-ex">
      <div><div style="font-weight:600;font-size:14px">${ex.name}</div>
      <div style="font-size:12px;color:var(--text2)">${ex.sets.length} sets · best ${best} lbs</div></div>
      <div style="font-weight:700;color:var(--accent);font-variant-numeric:tabular-nums">${vol.toLocaleString()}</div>
    </div>`;
  }).join('');

  showModal(`
    <div style="text-align:center;padding:8px 0 20px">
      <div style="font-size:40px;margin-bottom:8px">🎉</div>
      <div style="font-size:22px;font-weight:700;letter-spacing:-.5px">Workout Done!</div>
      <div style="color:var(--text2);margin-top:6px">${mins} min · ${w.totalVolume.toLocaleString()} lbs total</div>
    </div>
    <div class="workout-detail-card">
      <div class="workout-detail-header">
        <div style="font-weight:600">${w.type.charAt(0).toUpperCase()+w.type.slice(1)} Day</div>
        <div style="font-size:13px;color:var(--text2)">${w.exercises.length} exercises</div>
      </div>
      ${exRows}
    </div>
    <button class="btn btn-accent" onclick="closeModal()">Nice 💪</button>
  `);
}

// ═══════════════════════════════════════════════════════════════════
// REST TIMER
// ═══════════════════════════════════════════════════════════════════
function showRestScreen(type, nextExName, onDone) {
  const settings = getSettings();
  const duration = type === 'exercise' ? settings.exerciseRestSeconds : settings.setRestSeconds;
  const overlay = document.getElementById('rest-overlay');
  const circumference = 2 * Math.PI * 90;

  overlay.querySelector('.rest-type').textContent = type === 'exercise' ? '— Exercise Rest —' : '— Set Rest —';
  overlay.querySelector('.rest-label').textContent = type === 'exercise' ? 'Great set! Recovery time.' : 'Set complete. Rest up.';
  overlay.querySelector('.rest-next').innerHTML = nextExName
    ? `Next up: <strong>${nextExName}</strong>`
    : type === 'exercise' ? '<strong>Last exercise done!</strong>' : '';

  const ringFill = overlay.querySelector('.rest-ring-fill');
  ringFill.style.strokeDasharray = circumference;

  let remaining = duration;

  function updateRing() {
    const frac = remaining / duration;
    ringFill.style.strokeDashoffset = circumference * (1 - frac);
    overlay.querySelector('.rest-seconds').textContent = remaining;
  }

  updateRing();
  overlay.classList.add('show');

  clearRestTimer();
  UI.restTimer = setInterval(() => {
    remaining--;
    updateRing();
    if (remaining <= 0) {
      clearRestTimer();
      overlay.classList.remove('show');
      // Haptic if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      onDone();
    }
  }, 1000);

  overlay.querySelector('.rest-skip-btn').onclick = () => {
    clearRestTimer();
    overlay.classList.remove('show');
    onDone();
  };
}

function clearRestTimer() {
  if (UI.restTimer) { clearInterval(UI.restTimer); UI.restTimer = null; }
}

// ═══════════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════════
function renderCalendar() {
  const m = UI.calMonth;
  const year = m.getFullYear(), month = m.getMonth();
  document.getElementById('cal-month-label').textContent =
    m.toLocaleDateString('en-US', {month:'long', year:'numeric'});

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  ['S','M','T','W','T','F','S'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name'; el.textContent = d;
    grid.appendChild(el);
  });

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const workouts = getWorkouts();
  const settings = getSettings();

  // Map workouts by date
  const workoutMap = {};
  workouts.forEach(w => {
    const ds = w.date?.split('T')[0];
    if (ds) workoutMap[ds] = w;
  });

  // Blanks
  for (let i = 0; i < firstDow; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const el = document.createElement('div');
    el.className = 'cal-day';

    const isToday = ds === todayStr;
    const pplType = getPPLType(ds);
    const workout = workoutMap[ds];
    const isPast = ds < todayStr;
    const isFuture = ds > todayStr;

    el.textContent = d;

    if (isToday) el.classList.add('today');
    if (workout) {
      el.classList.add('has-workout');
      el.title = workout.type;
      el.onclick = () => showWorkoutDetail(workout);
    } else if (isFuture && pplType !== 'rest') {
      el.classList.add('scheduled');
      // Small colored dot for upcoming PPL day
      const dot = document.createElement('div');
      dot.className = 'cal-day-dot';
      const colors = {push:'var(--red)',pull:'var(--blue)',legs:'var(--green)'};
      dot.style.background = colors[pplType] || 'transparent';
      dot.style.border = `1.5px solid ${colors[pplType] || 'transparent'}`;
      dot.style.width = '6px'; dot.style.height = '6px'; dot.style.borderRadius = '50%';
      el.appendChild(dot);
      el.title = pplType.charAt(0).toUpperCase()+pplType.slice(1)+' Day (scheduled)';
    } else if (pplType === 'rest') {
      el.classList.add('rest-day');
    }

    grid.appendChild(el);
  }

  renderCalStats();
}

function renderCalStats() {
  const workouts = getWorkouts();
  document.getElementById('stat-total').textContent = workouts.length;
  const totalVol = workouts.reduce((a,w)=>a+(w.totalVolume||0),0);
  document.getElementById('stat-vol').textContent = totalVol >= 1000
    ? (totalVol/1000).toFixed(1)+'k' : totalVol.toLocaleString();
  // Streak
  let streak = 0;
  const d = new Date(); d.setHours(0,0,0,0);
  const settings = getSettings();
  const restDays = settings.restDays || [0];
  while (streak < 365) {
    const ds = d.toISOString().split('T')[0];
    const dow = d.getDay();
    if (restDays.includes(dow)) { d.setDate(d.getDate()-1); continue; }
    const found = getWorkouts().some(w => w.date?.startsWith(ds));
    if (found) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  document.getElementById('stat-streak').textContent = streak;
  renderVolChart();
}

function renderVolChart() {
  const chart = document.getElementById('vol-chart');
  chart.innerHTML = '';
  const weeks = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i*7);
    const start = new Date(d); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate()+6); end.setHours(23,59,59,999);
    const vol = getWorkouts().filter(w => {const wd=new Date(w.date);return wd>=start&&wd<=end;})
      .reduce((a,w)=>a+(w.totalVolume||0),0);
    weeks.push({vol, label: start.toLocaleDateString('en-US',{month:'numeric',day:'numeric'})});
  }
  const max = Math.max(...weeks.map(w=>w.vol), 1);
  weeks.forEach((w, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'vol-bar-wrap';
    const pct = Math.round(w.vol/max*100);
    wrap.innerHTML = `<div class="vol-bar-inner ${i===6?'filled':''}" style="height:${pct}%"></div>
      <div class="vol-bar-lbl">${w.label}</div>`;
    chart.appendChild(wrap);
  });
}

function changeCalMonth(dir) {
  UI.calMonth = new Date(UI.calMonth.getFullYear(), UI.calMonth.getMonth()+dir, 1);
  renderCalendar();
}

function showWorkoutDetail(w) {
  const d = new Date(w.date);
  const mins = Math.floor((w.duration||0)/60);
  const typeLabel = {push:'Push',pull:'Pull',legs:'Legs'}[w.type]||w.type||'Workout';
  const exRows = (w.exercises||[]).map(ex => {
    const vol = (ex.sets||[]).reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
    return `<div class="workout-detail-ex">
      <div><div style="font-weight:600;font-size:14px">${ex.name}</div>
      <div style="font-size:12px;color:var(--text2)">${(ex.sets||[]).length} sets</div></div>
      <div style="font-weight:600;color:var(--accent)">${vol.toLocaleString()} lbs</div>
    </div>`;
  }).join('');
  showModal(`
    <div style="font-size:18px;font-weight:700;margin-bottom:4px">${d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div>
    <div style="color:var(--text2);font-size:14px;margin-bottom:16px">${typeLabel} · ${mins} min · ${(w.totalVolume||0).toLocaleString()} lbs</div>
    <div class="workout-detail-card">${exRows || '<div style="padding:16px;color:var(--text3)">No exercises logged</div>'}</div>
  `);
}

// ═══════════════════════════════════════════════════════════════════
// MUSCLE MAP — Real anatomical SVG
// ═══════════════════════════════════════════════════════════════════
function renderMuscleMap() {
  const freq = getMusclesWorked(UI.musclePeriod);
  const maxFreq = Math.max(...Object.values(freq), 1);

  function opacity(ids) {
    const f = ids.reduce((a,id)=>a+(freq[id]||0),0);
    return f > 0 ? 0.25 + 0.75*(f/ids.reduce((a,id)=>a+maxFreq,0)*ids.length) : 0.07;
  }

  function fill(ids) {
    const label = MUSCLE_LABELS[ids[0]];
    return MUSCLE_COLOR[label] || '#888';
  }

  const svg = UI.muscleView === 'front' ? frontBodySVG(freq, maxFreq) : backBodySVG(freq, maxFreq);
  document.getElementById('muscle-diagram').innerHTML = svg;

  // Legend
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
  leg.innerHTML = legendItems.map(({label,count,color}) =>
    `<div class="muscle-pill" style="background:${color}18;border:1px solid ${color}40">
      <div class="muscle-pill-dot" style="background:${color}"></div>
      <span style="color:${color}">${label} ×${count}</span>
    </div>`
  ).join('');

  // Breakdown bars
  const bd = document.getElementById('muscle-breakdown');
  if (!legendItems.length) {
    bd.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M17 8l4 4-4 4M3 12h18"/></svg><p>No workouts logged yet.<br>Start training to see muscle frequency.</p></div>`;
    return;
  }
  bd.innerHTML = `<div class="card"><div class="section-label" style="margin-bottom:12px">Muscle Frequency</div>` +
    legendItems.slice(0,10).map(({label,count,color}) => {
      const pct = Math.round(count/maxFreq*100);
      return `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span>${label}</span><span style="color:var(--text2)">${count} session${count!==1?'s':''}</span>
        </div>
        <div style="height:4px;background:var(--bg4);border-radius:2px">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:2px;transition:width .3s"></div>
        </div>
      </div>`;
    }).join('') + '</div>';
}

function muscleOpacity(freq, maxFreq, ids) {
  const total = ids.reduce((a,id)=>a+(freq[id]||0), 0);
  if (total === 0) return 0.06;
  return 0.2 + 0.8 * (total / (ids.length * maxFreq));
}

function mColor(ids) {
  return MUSCLE_COLOR[MUSCLE_LABELS[ids[0]]] || '#aaa';
}

function frontBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids);
  const c = (ids) => mColor(ids);

  return `<svg viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:480px">
  <!-- HEAD -->
  <ellipse cx="100" cy="34" rx="24" ry="28" fill="#1e1e1e" stroke="#333" stroke-width="1.2"/>
  <ellipse cx="100" cy="22" rx="16" ry="14" fill="#252525" stroke="none"/>
  <!-- NECK -->
  <rect x="91" y="60" width="18" height="18" rx="5" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
  <!-- TRAPS front hints -->
  <path d="M82 66 Q100 78 118 66 Q112 88 100 88 Q88 88 82 66Z" fill="${c(['trap_l'])}" opacity="${op(['trap_l','trap_r'])}" stroke="none"/>
  <!-- TORSO outline -->
  <path d="M62 78 Q50 90 52 160 Q54 188 66 200 L134 200 Q146 188 148 160 Q150 90 138 78Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1.2"/>
  <!-- CHEST left -->
  <ellipse cx="81" cy="108" rx="21" ry="20" fill="${c(['chest_l'])}" opacity="${op(['chest_l'])}" stroke="none"/>
  <!-- CHEST right -->
  <ellipse cx="119" cy="108" rx="21" ry="20" fill="${c(['chest_r'])}" opacity="${op(['chest_r'])}" stroke="none"/>
  <!-- FRONT DELT left -->
  <ellipse cx="53" cy="92" rx="14" ry="13" fill="${c(['front_delt_l'])}" opacity="${op(['front_delt_l'])}" stroke="none"/>
  <!-- FRONT DELT right -->
  <ellipse cx="147" cy="92" rx="14" ry="13" fill="${c(['front_delt_r'])}" opacity="${op(['front_delt_r'])}" stroke="none"/>
  <!-- SIDE DELT left -->
  <ellipse cx="48" cy="105" rx="10" ry="12" fill="${c(['side_delt_l'])}" opacity="${op(['side_delt_l'])}" stroke="none"/>
  <!-- SIDE DELT right -->
  <ellipse cx="152" cy="105" rx="10" ry="12" fill="${c(['side_delt_r'])}" opacity="${op(['side_delt_r'])}" stroke="none"/>
  <!-- CORE / ABS -->
  <rect x="85" y="130" width="30" height="64" rx="10" fill="${c(['core'])}" opacity="${op(['core'])}" stroke="none"/>
  <!-- ABS lines decoration -->
  <line x1="100" y1="130" x2="100" y2="194" stroke="#0005" stroke-width="1.5"/>
  <line x1="86" y1="150" x2="114" y2="150" stroke="#0005" stroke-width="1"/>
  <line x1="86" y1="168" x2="114" y2="168" stroke="#0005" stroke-width="1"/>

  <!-- UPPER ARM left outline -->
  <path d="M42 100 Q36 108 36 130 Q36 148 42 155 L56 155 Q62 148 62 130 Q62 108 56 100Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- BICEP left -->
  <ellipse cx="49" cy="127" rx="10" ry="18" fill="${c(['bicep_l'])}" opacity="${op(['bicep_l'])}" stroke="none"/>
  <!-- TRICEP left (small front hint) -->
  <ellipse cx="49" cy="135" rx="7" ry="12" fill="${c(['tricep_l'])}" opacity="${op(['tricep_l'])*0.5}" stroke="none"/>

  <!-- UPPER ARM right outline -->
  <path d="M144 100 Q150 108 150 130 Q150 148 144 155 L158 155 Q164 148 164 130 Q164 108 158 100Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- BICEP right -->
  <ellipse cx="151" cy="127" rx="10" ry="18" fill="${c(['bicep_r'])}" opacity="${op(['bicep_r'])}" stroke="none"/>
  <!-- TRICEP right hint -->
  <ellipse cx="151" cy="135" rx="7" ry="12" fill="${c(['tricep_r'])}" opacity="${op(['tricep_r'])*0.5}" stroke="none"/>

  <!-- FOREARMS -->
  <rect x="37" y="157" width="14" height="42" rx="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <rect x="149" y="157" width="14" height="42" rx="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- HANDS -->
  <ellipse cx="44" cy="204" rx="10" ry="8" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <ellipse cx="156" cy="204" rx="10" ry="8" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>

  <!-- HIPS -->
  <path d="M64 198 Q60 215 64 244 L136 244 Q140 215 136 198Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- HIP FLEXORS / GLUTE front -->
  <ellipse cx="84" cy="220" rx="18" ry="16" fill="${c(['glute_l'])}" opacity="${op(['glute_l'])*0.4}" stroke="none"/>
  <ellipse cx="116" cy="220" rx="18" ry="16" fill="${c(['glute_r'])}" opacity="${op(['glute_r'])*0.4}" stroke="none"/>

  <!-- QUAD left -->
  <path d="M68 244 Q62 268 64 308 Q66 324 76 330 L96 330 Q104 324 102 308 Q100 268 94 244Z" fill="${c(['quad_l'])}" opacity="${op(['quad_l'])}" stroke="#1a1a1a" stroke-width="1"/>
  <!-- QUAD right -->
  <path d="M106 244 Q100 268 98 308 Q96 324 104 330 L124 330 Q134 324 136 308 Q138 268 132 244Z" fill="${c(['quad_r'])}" opacity="${op(['quad_r'])}" stroke="#1a1a1a" stroke-width="1"/>

  <!-- KNEE left -->
  <ellipse cx="82" cy="334" rx="14" ry="11" fill="#1e1e1e" stroke="#2e2e2e" stroke-width="1"/>
  <!-- KNEE right -->
  <ellipse cx="118" cy="334" rx="14" ry="11" fill="#1e1e1e" stroke="#2e2e2e" stroke-width="1"/>

  <!-- SHIN / CALF left front -->
  <path d="M70 346 Q68 375 72 408 Q74 418 82 420 L92 420 Q100 418 98 408 Q96 375 94 346Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- SHIN / CALF right front -->
  <path d="M106 346 Q104 375 102 408 Q100 418 108 420 L118 420 Q126 418 128 408 Q132 375 130 346Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- CALF highlight left -->
  <ellipse cx="82" cy="375" rx="9" ry="20" fill="${c(['calf_l'])}" opacity="${op(['calf_l'])}" stroke="none"/>
  <!-- CALF highlight right -->
  <ellipse cx="118" cy="375" rx="9" ry="20" fill="${c(['calf_r'])}" opacity="${op(['calf_r'])}" stroke="none"/>

  <!-- FEET -->
  <ellipse cx="82" cy="422" rx="15" ry="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <ellipse cx="118" cy="422" rx="15" ry="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  </svg>`;
}

function backBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids);
  const c = (ids) => mColor(ids);

  return `<svg viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:480px">
  <!-- HEAD back -->
  <ellipse cx="100" cy="34" rx="24" ry="28" fill="#1e1e1e" stroke="#333" stroke-width="1.2"/>
  <!-- NECK -->
  <rect x="91" y="60" width="18" height="18" rx="5" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
  <!-- TRAP left -->
  <path d="M82 66 Q64 72 56 92 L76 96 Q84 84 100 80Z" fill="${c(['trap_l'])}" opacity="${op(['trap_l'])}" stroke="none"/>
  <!-- TRAP right -->
  <path d="M118 66 Q136 72 144 92 L124 96 Q116 84 100 80Z" fill="${c(['trap_r'])}" opacity="${op(['trap_r'])}" stroke="none"/>
  <!-- TORSO outline -->
  <path d="M62 78 Q50 90 52 160 Q54 188 66 200 L134 200 Q146 188 148 160 Q150 90 138 78Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1.2"/>
  <!-- REAR DELT left -->
  <ellipse cx="53" cy="92" rx="14" ry="13" fill="${c(['rear_delt_l'])}" opacity="${op(['rear_delt_l'])}" stroke="none"/>
  <!-- REAR DELT right -->
  <ellipse cx="147" cy="92" rx="14" ry="13" fill="${c(['rear_delt_r'])}" opacity="${op(['rear_delt_r'])}" stroke="none"/>
  <!-- LAT left -->
  <path d="M64 94 Q54 120 58 165 L82 168 Q86 140 80 96Z" fill="${c(['lat_l'])}" opacity="${op(['lat_l'])}" stroke="none"/>
  <!-- LAT right -->
  <path d="M136 94 Q146 120 142 165 L118 168 Q114 140 120 96Z" fill="${c(['lat_r'])}" opacity="${op(['lat_r'])}" stroke="none"/>
  <!-- LOWER BACK -->
  <rect x="82" y="150" width="36" height="48" rx="8" fill="${c(['lower_back'])}" opacity="${op(['lower_back'])}" stroke="none"/>
  <!-- Spine line -->
  <line x1="100" y1="80" x2="100" y2="198" stroke="#0006" stroke-width="2"/>

  <!-- UPPER ARM left (tricep dominant) -->
  <path d="M42 100 Q36 108 36 130 Q36 148 42 155 L56 155 Q62 148 62 130 Q62 108 56 100Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- TRICEP left -->
  <ellipse cx="49" cy="130" rx="10" ry="18" fill="${c(['tricep_l'])}" opacity="${op(['tricep_l'])}" stroke="none"/>
  <!-- UPPER ARM right -->
  <path d="M144 100 Q150 108 150 130 Q150 148 144 155 L158 155 Q164 148 164 130 Q164 108 158 100Z" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- TRICEP right -->
  <ellipse cx="151" cy="130" rx="10" ry="18" fill="${c(['tricep_r'])}" opacity="${op(['tricep_r'])}" stroke="none"/>

  <!-- FOREARMS -->
  <rect x="37" y="157" width="14" height="42" rx="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <rect x="149" y="157" width="14" height="42" rx="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <!-- HANDS -->
  <ellipse cx="44" cy="204" rx="10" ry="8" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <ellipse cx="156" cy="204" rx="10" ry="8" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>

  <!-- GLUTES -->
  <ellipse cx="83" cy="212" rx="21" ry="24" fill="${c(['glute_l'])}" opacity="${op(['glute_l'])}" stroke="none"/>
  <ellipse cx="117" cy="212" rx="21" ry="24" fill="${c(['glute_r'])}" opacity="${op(['glute_r'])}" stroke="none"/>
  <line x1="100" y1="198" x2="100" y2="236" stroke="#0005" stroke-width="1.5"/>

  <!-- HAMSTRING left -->
  <path d="M68 238 Q63 265 66 308 Q68 322 78 328 L96 328 Q104 322 102 308 Q100 265 94 238Z" fill="${c(['ham_l'])}" opacity="${op(['ham_l'])}" stroke="#1a1a1a" stroke-width="1"/>
  <!-- HAMSTRING right -->
  <path d="M106 238 Q100 265 98 308 Q96 322 104 328 L122 328 Q132 322 134 308 Q137 265 132 238Z" fill="${c(['ham_r'])}" opacity="${op(['ham_r'])}" stroke="#1a1a1a" stroke-width="1"/>

  <!-- KNEE left -->
  <ellipse cx="82" cy="332" rx="14" ry="11" fill="#1e1e1e" stroke="#2e2e2e" stroke-width="1"/>
  <!-- KNEE right -->
  <ellipse cx="118" cy="332" rx="14" ry="11" fill="#1e1e1e" stroke="#2e2e2e" stroke-width="1"/>

  <!-- CALF left -->
  <path d="M70 344 Q68 375 72 406 Q74 418 82 420 L92 420 Q100 418 98 406 Q96 375 94 344Z" fill="${c(['calf_l'])}" opacity="${op(['calf_l'])}" stroke="#1a1a1a" stroke-width="1"/>
  <!-- CALF right -->
  <path d="M106 344 Q104 375 102 406 Q100 418 108 420 L118 420 Q126 418 128 406 Q132 375 130 344Z" fill="${c(['calf_r'])}" opacity="${op(['calf_r'])}" stroke="#1a1a1a" stroke-width="1"/>

  <!-- FEET -->
  <ellipse cx="82" cy="422" rx="15" ry="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  <ellipse cx="118" cy="422" rx="15" ry="7" fill="#1a1a1a" stroke="#2e2e2e" stroke-width="1"/>
  </svg>`;
}

function setMuscleView(v) {
  UI.muscleView = v;
  document.querySelectorAll('.muscle-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('mtab-' + v).classList.add('active');
  renderMuscleMap();
}

function setMusclePeriod(p) {
  UI.musclePeriod = p;
  document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('ptab-' + p).classList.add('active');
  renderMuscleMap();
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════
function renderSettings() {
  const s = getSettings();
  const daysLabel = `${s.daysPerWeek} days/week`;
  const restLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].filter((_,i)=>s.restDays.includes(i)).join(', ') || 'None';
  const eqLabel = (s.equipment||[]).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(', ');
  const levelLabel = s.level.charAt(0).toUpperCase()+s.level.slice(1);
  const unitLabel = s.weightUnit === 'lbs' ? 'Pounds (lbs)' : 'Kilograms (kg)';

  document.getElementById('settings-content').innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Training</div>
      <div class="settings-row" onclick="editSetting('days')">
        <div class="settings-row-left"><div class="settings-row-label">Days per week</div><div class="settings-row-value">${daysLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('restdays')">
        <div class="settings-row-left"><div class="settings-row-label">Rest days</div><div class="settings-row-value">${restLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('equipment')">
        <div class="settings-row-left"><div class="settings-row-label">Equipment</div><div class="settings-row-value">${eqLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('level')">
        <div class="settings-row-left"><div class="settings-row-label">Experience level</div><div class="settings-row-value">${levelLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Rest Timers</div>
      <div class="settings-row" onclick="editSetting('setrest')">
        <div class="settings-row-left"><div class="settings-row-label">Between sets</div><div class="settings-row-value">${s.setRestSeconds}s</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editSetting('exrest')">
        <div class="settings-row-left"><div class="settings-row-label">Between exercises</div><div class="settings-row-value">${s.exerciseRestSeconds}s</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Preferences</div>
      <div class="settings-row" onclick="editSetting('unit')">
        <div class="settings-row-left"><div class="settings-row-label">Weight unit</div><div class="settings-row-value">${unitLabel}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Custom Workouts</div>
      <div class="settings-row" onclick="editCustomWorkout('push')">
        <div class="settings-row-left"><div class="settings-row-label">Push Day</div><div class="settings-row-value">${getCustomWorkoutLabel('push')}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editCustomWorkout('pull')">
        <div class="settings-row-left"><div class="settings-row-label">Pull Day</div><div class="settings-row-value">${getCustomWorkoutLabel('pull')}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="settings-row" onclick="editCustomWorkout('legs')">
        <div class="settings-row-left"><div class="settings-row-label">Leg Day</div><div class="settings-row-value">${getCustomWorkoutLabel('legs')}</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Data</div>
      <div class="settings-row" onclick="resetData()">
        <div class="settings-row-left"><div class="settings-row-label" style="color:var(--red)">Reset All Data</div><div class="settings-row-value">Delete workouts & settings</div></div>
        <div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
    </div>
  `;
}

function getCustomWorkoutLabel(type) {
  const customs = DB.get('customWorkouts') || {};
  if (customs[type]) return `${customs[type].length} custom exercises`;
  return 'Using default';
}

function editSetting(key) {
  const s = getSettings();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  if (key === 'days') {
    showModal(`
      <div class="modal-title">Days per week</div>
      <div class="field">
        <select id="edit-days">${[3,4,5,6].map(n=>`<option value="${n}" ${s.daysPerWeek===n?'selected':''}>${n} days</option>`).join('')}</select>
      </div>
      <button class="btn btn-accent" onclick="saveSetting('days')">Save</button>
    `);
  } else if (key === 'restdays') {
    showModal(`
      <div class="modal-title">Rest days</div>
      <div class="chip-group">${days.map((d,i)=>`<div class="chip ${s.restDays.includes(i)?'selected':''}" onclick="this.classList.toggle('selected')" data-day="${i}">${d}</div>`).join('')}</div>
      <button class="btn btn-accent" onclick="saveSetting('restdays')">Save</button>
    `);
  } else if (key === 'equipment') {
    const eqs = ['barbell','dumbbells','cables','machines'];
    showModal(`
      <div class="modal-title">Equipment</div>
      <div class="chip-group">${eqs.map(e=>`<div class="chip ${(s.equipment||[]).includes(e)?'selected':''}" onclick="this.classList.toggle('selected')" data-eq="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</div>`).join('')}</div>
      <button class="btn btn-accent" onclick="saveSetting('equipment')">Save</button>
    `);
  } else if (key === 'level') {
    const levels = ['beginner','intermediate','advanced'];
    showModal(`
      <div class="modal-title">Experience level</div>
      <div class="chip-group" style="flex-direction:column">${levels.map(l=>`<div class="chip ${s.level===l?'selected':''}" onclick="document.querySelectorAll('#modal-body .chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" data-level="${l}" style="border-radius:10px">${l.charAt(0).toUpperCase()+l.slice(1)}</div>`).join('')}</div>
      <button class="btn btn-accent" onclick="saveSetting('level')">Save</button>
    `);
  } else if (key === 'setrest') {
    showModal(`
      <div class="modal-title">Set rest duration</div>
      <div class="field"><label>Seconds</label><input type="number" id="edit-setrest" value="${s.setRestSeconds}" min="15" max="600" step="15"></div>
      <button class="btn btn-accent" onclick="saveSetting('setrest')">Save</button>
    `);
  } else if (key === 'exrest') {
    showModal(`
      <div class="modal-title">Exercise rest duration</div>
      <div class="field"><label>Seconds</label><input type="number" id="edit-exrest" value="${s.exerciseRestSeconds}" min="30" max="600" step="15"></div>
      <button class="btn btn-accent" onclick="saveSetting('exrest')">Save</button>
    `);
  } else if (key === 'unit') {
    showModal(`
      <div class="modal-title">Weight unit</div>
      <div class="chip-group" style="flex-direction:column">
        <div class="chip ${s.weightUnit==='lbs'?'selected':''}" onclick="document.querySelectorAll('#modal-body .chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" data-unit="lbs" style="border-radius:10px">Pounds (lbs)</div>
        <div class="chip ${s.weightUnit==='kg'?'selected':''}" onclick="document.querySelectorAll('#modal-body .chip').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" data-unit="kg" style="border-radius:10px">Kilograms (kg)</div>
      </div>
      <button class="btn btn-accent" onclick="saveSetting('unit')">Save</button>
    `);
  }
}

function saveSetting(key) {
  const s = getSettings();
  if (key === 'days') { s.daysPerWeek = parseInt(document.getElementById('edit-days').value); }
  else if (key === 'restdays') { s.restDays = [...document.querySelectorAll('#modal-body .chip.selected')].map(c=>parseInt(c.dataset.day)); }
  else if (key === 'equipment') { s.equipment = [...document.querySelectorAll('#modal-body .chip.selected')].map(c=>c.dataset.eq); if(!s.equipment.length){alert('Select at least one.');return;} }
  else if (key === 'level') { s.level = document.querySelector('#modal-body .chip.selected')?.dataset.level || s.level; }
  else if (key === 'setrest') { s.setRestSeconds = parseInt(document.getElementById('edit-setrest').value)||90; }
  else if (key === 'exrest') { s.exerciseRestSeconds = parseInt(document.getElementById('edit-exrest').value)||180; }
  else if (key === 'unit') { s.weightUnit = document.querySelector('#modal-body .chip.selected')?.dataset.unit || s.weightUnit; }
  saveSettings(s);
  closeModal();
  renderSettings();
}

function editCustomWorkout(type) {
  const customs = DB.get('customWorkouts') || {};
  const current = customs[type] || getEquippedExercises(type);
  const allForType = [...LIBRARY[type]];

  const rows = current.map((ex,i) => `
    <div class="card-sm" style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="flex:1;font-size:14px;font-weight:500">${ex.name}</div>
      <div style="font-size:12px;color:var(--text2)">${ex.suggestedSets||ex.sets||3}×${ex.suggestedReps||ex.reps?.[0]||10}</div>
      <button class="btn btn-sm btn-danger" onclick="removeCustomEx(${i},'${type}')" style="width:auto;padding:6px 10px;font-size:12px">✕</button>
    </div>`).join('');

  const addOpts = allForType.filter(e=>!current.some(c=>c.id===e.id))
    .map(e=>`<option value="${e.id}">${e.name}</option>`).join('');

  showModal(`
    <div class="modal-title">${type.charAt(0).toUpperCase()+type.slice(1)} Day Exercises</div>
    <div id="custom-ex-list">${rows}</div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <select id="add-ex-select" style="flex:1"><option value="">Add exercise...</option>${addOpts}</select>
      <button class="btn btn-accent btn-sm" onclick="addCustomEx('${type}')">Add</button>
    </div>
    <div style="margin-top:8px">
      <button class="btn btn-ghost" onclick="addCustomExCustom('${type}')">+ Create custom exercise</button>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-secondary" onclick="resetCustomWorkout('${type}')">Reset to default</button>
      <button class="btn btn-accent" onclick="saveCustomWorkout('${type}')">Save</button>
    </div>
  `, {type, exercises: [...current]});
}

let modalData = {};
function showModal(html, data) {
  modalData = data || {};
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  modalData = {};
}

function removeCustomEx(i, type) {
  const customs = DB.get('customWorkouts') || {};
  const current = customs[type] || getEquippedExercises(type);
  current.splice(i, 1);
  customs[type] = current;
  DB.set('customWorkouts', customs);
  editCustomWorkout(type);
}

function addCustomEx(type) {
  const sel = document.getElementById('add-ex-select');
  if (!sel.value) return;
  const ex = LIBRARY[type].find(e=>e.id===sel.value);
  if (!ex) return;
  const customs = DB.get('customWorkouts') || {};
  if (!customs[type]) customs[type] = getEquippedExercises(type);
  if (!customs[type].some(e=>e.id===ex.id)) customs[type].push(ex);
  DB.set('customWorkouts', customs);
  editCustomWorkout(type);
}

function addCustomExCustom(type) {
  showModal(`
    <div class="modal-title">Custom Exercise</div>
    <div class="field" style="margin-bottom:10px"><label>Name</label><input id="cex-name" type="text" placeholder="e.g. Cable Fly"></div>
    <div class="field" style="margin-bottom:10px"><label>Muscles (comma separated)</label><input id="cex-muscles" type="text" placeholder="e.g. chest_l, chest_r"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div class="field"><label>Sets</label><input id="cex-sets" type="number" value="3" min="1" max="10"></div>
      <div class="field"><label>Reps</label><input id="cex-reps" type="number" value="10" min="1" max="50"></div>
    </div>
    <button class="btn btn-accent" onclick="saveCustomExCustom('${type}')">Add</button>
  `);
}

function saveCustomExCustom(type) {
  const name = document.getElementById('cex-name').value.trim();
  if (!name) { alert('Enter a name.'); return; }
  const muscles = document.getElementById('cex-muscles').value.split(',').map(s=>s.trim()).filter(Boolean);
  const sets = parseInt(document.getElementById('cex-sets').value)||3;
  const reps = parseInt(document.getElementById('cex-reps').value)||10;
  const ex = { id: 'custom_'+Date.now(), name, muscles: muscles.length?muscles:['core'], sets, reps:[reps,reps+2], equipment:['barbell','dumbbells','cables','machines'] };
  const customs = DB.get('customWorkouts') || {};
  if (!customs[type]) customs[type] = getEquippedExercises(type);
  customs[type].push(ex);
  DB.set('customWorkouts', customs);
  editCustomWorkout(type);
}

function saveCustomWorkout(type) {
  closeModal();
  renderSettings();
}

function resetCustomWorkout(type) {
  const customs = DB.get('customWorkouts') || {};
  delete customs[type];
  DB.set('customWorkouts', customs);
  closeModal();
  renderSettings();
}

function resetData() {
  if (!confirm('Delete ALL workout data and settings? This cannot be undone.')) return;
  ['workouts','settings','customWorkouts'].forEach(k => DB.del(k));
  location.reload();
}

// ─── HELPERS ─────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Math.floor((today - d) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }

  const settings = DB.get('settings');
  if (!settings) {
    startOnboarding();
  } else {
    renderWorkoutScreen();
    showScreen('workout');
  }
});

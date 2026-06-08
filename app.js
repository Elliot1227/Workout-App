// ═══════════════════════════════════════════════════════════════════
// APPMATRIX CONTROLLER ENGINE — RE-ARCHITECTED FOR FULL-SCREEN PANELS
// ═══════════════════════════════════════════════════════════════════

const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem('il_' + k)); } catch { return null; } },
  set(k, v) { localStorage.setItem('il_' + k, JSON.stringify(v)); return v; },
  del(k) { localStorage.removeItem('il_' + k); }
};

const ACCENT_PALETTE = {
  green: { primary: '#3ddc84', dim: '#2cb869', trans: 'rgba(61, 220, 132, 0.12)' },
  blue: { primary: '#4d9fff', dim: '#357ec7', trans: 'rgba(77, 159, 255, 0.12)' },
  purple: { primary: '#bb86fc', dim: '#9a66da', trans: 'rgba(187, 134, 252, 0.12)' },
  red: { primary: '#ff4d4d', dim: '#cc3636', trans: 'rgba(255, 77, 77, 0.12)' },
  yellow: { primary: '#e8ff47', dim: '#b8cc30', trans: 'rgba(232, 255, 71, 0.12)' }
};

const DEFAULT_SETTINGS = {
  pattern: ['Push A', 'Pull A', 'Legs A', 'rest'], 
  blockedWeekdays: [], 
  equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
  level: 'intermediate',
  setRestSeconds: 90,
  exerciseRestSeconds: 180,
  weightUnit: 'lbs',
  accentTheme: 'green',
  startDate: new Date().toISOString().split('T')[0]
};

const MUSCLE_LABELS = {
  chest: 'Chest', lats: 'Lats', deltoids: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', trapezius: 'Traps', abs: 'Core', quadriceps: 'Quads', hamstrings: 'Hamstrings', gluteal: 'Glutes', calves: 'Calves', forearms: 'Forearms'
};

const MUSCLE_COLOR = {
  'Chest':'#ff6b6b','Lats':'#4d9fff','Shoulders':'#ffa94d','Biceps':'#3ddc84','Triceps':'#cc44ff','Traps':'#74c0fc','Quads':'#ffe066','Hamstrings':'#63e6be','Glutes':'#ff8c42','Calves':'#a9e34b','Core':'#748ffc','Forearms':'#e599f7'
};

const MASTER_EXERCISES_CATALOGUE = [
  { id: 'bench_press', name: 'Barbell Bench Press', muscle: 'chest', sets: 3, reps: [6, 8], weight: 135, equipment: 'barbell' },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', muscle: 'chest', sets: 3, reps: [8, 10], weight: 50, equipment: 'dumbbells' },
  { id: 'flat_db_press', name: 'Flat Dumbbell Press', muscle: 'chest', sets: 3, reps: [8, 10], weight: 55, equipment: 'dumbbells' },
  { id: 'dips_rack', name: 'Dip Rack Chest Dips', muscle: 'chest', sets: 3, reps: [8, 10], weight: 0, equipment: 'machines' },
  { id: 'band_fly', name: 'Resistance Band Fly', muscle: 'chest', sets: 3, reps: [12, 15], weight: 15, equipment: 'bands' },
  { id: 'deadlift', name: 'Barbell Deadlift', muscle: 'lats', sets: 3, reps: [5, 5], weight: 185, equipment: 'barbell' },
  { id: 'lat_pulldown', name: 'Cable Vertical Lat Pulldown', muscle: 'lats', sets: 3, reps: [8, 12], weight: 100, equipment: 'cables' },
  { id: 'barbell_row', name: 'Bent Over Barbell Row', muscle: 'lats', sets: 3, reps: [6, 8], weight: 135, equipment: 'barbell' },
  { id: 'db_row', name: 'One Arm Dumbbell Row', muscle: 'lats', sets: 3, reps: [8, 12], weight: 45, equipment: 'dumbbells' },
  { id: 'kettlebell_swings', name: 'Kettlebell Swings', muscle: 'lats', sets: 3, reps: [15, 20], weight: 35, equipment: 'kettlebells' },
  { id: 'ohp', name: 'Barbell Overhead Press', muscle: 'deltoids', sets: 3, reps: [6, 8], weight: 95, equipment: 'barbell' },
  { id: 'db_shoulder_press', name: 'Dumbbell Shoulder Press', muscle: 'deltoids', sets: 3, reps: [8, 10], weight: 40, equipment: 'dumbbells' },
  { id: 'lateral_raise', name: 'Dumbbell Lateral Raise', muscle: 'deltoids', sets: 4, reps: [12, 15], weight: 15, equipment: 'dumbbells' },
  { id: 'band_facepull', name: 'Resistance Band Facepull', muscle: 'deltoids', sets: 3, reps: [15, 20], weight: 10, equipment: 'bands' },
  { id: 'barbell_curl', name: 'Barbell Curl', muscle: 'biceps', sets: 3, reps: [8, 12], weight: 65, equipment: 'barbell' },
  { id: 'ez_bar_curl', name: 'EZ Curl Bar Curl', muscle: 'biceps', sets: 3, reps: [8, 12], weight: 55, equipment: 'barbell' },
  { id: 'db_hammer_curl', name: 'Dumbbell Hammer Curl', muscle: 'biceps', sets: 3, reps: [10, 12], weight: 25, equipment: 'dumbbells' },
  { id: 'tricep_pushdown', name: 'Cable Vertical Tricep Pushdown', muscle: 'triceps', sets: 3, reps: [8, 12], weight: 50, equipment: 'cables' },
  { id: 'skull_crusher', name: 'EZ Bar Skull Crusher', muscle: 'triceps', sets: 3, reps: [8, 12], weight: 45, equipment: 'barbell' },
  { id: 'back_squat', name: 'Barbell Back Squat', muscle: 'quadriceps', sets: 3, reps: [6, 8], weight: 155, equipment: 'barbell' },
  { id: 'goblet_squat', name: 'Kettlebell Goblet Squat', muscle: 'quadriceps', sets: 3, reps: [10, 12], weight: 45, equipment: 'kettlebells' },
  { id: 'rdl', name: 'Barbell Romanian Deadlift', muscle: 'hamstrings', sets: 3, reps: [8, 10], weight: 135, equipment: 'barbell' },
  { id: 'hip_thrust', name: 'Barbell Hip Thrust', muscle: 'gluteal', sets: 3, reps: [8, 12], weight: 185, equipment: 'barbell' },
  { id: 'calf_raise', name: 'Dumbbell Calf Raise', muscle: 'calves', sets: 4, reps: [12, 15], weight: 35, equipment: 'dumbbells' }
];

const BASE_SYSTEM_LIBRARY = {
  'Push A': [
    { id: 'bench_press', name: 'Barbell Bench Press', muscles: ['chest'], sets: 3, reps: [6, 8] },
    { id: 'ohp', name: 'Barbell Overhead Press', muscles: ['deltoids'], sets: 3, reps: [6, 8] },
    { id: 'incline_db_press', name: 'Incline Dumbbell Press', muscles: ['chest'], sets: 3, reps: [8, 10] },
    { id: 'lateral_raise', name: 'Dumbbell Lateral Raise', muscles: ['deltoids'], sets: 4, reps: [12, 15] },
    { id: 'tricep_pushdown', name: 'Cable Vertical Tricep Pushdown', muscles: ['triceps'], sets: 3, reps: [8, 12] }
  ],
  'Pull A': [
    { id: 'barbell_row', name: 'Bent Over Barbell Row', muscles: ['lats'], sets: 3, reps: [6, 8] },
    { id: 'lat_pulldown', name: 'Cable Vertical Lat Pulldown', muscles: ['lats'], sets: 3, reps: [8, 12] },
    { id: 'db_row', name: 'One Arm Dumbbell Row', muscles: ['lats'], sets: 3, reps: [8, 12] },
    { id: 'ez_bar_curl', name: 'EZ Curl Bar Curl', muscles: ['biceps'], sets: 3, reps: [8, 12] },
    { id: 'band_facepull', name: 'Resistance Band Facepull', muscles: ['deltoids'], sets: 3, reps: [15, 20] }
  ],
  'Legs A': [
    { id: 'back_squat', name: 'Barbell Back Squat', muscles: ['quadriceps'], sets: 3, reps: [6, 8] },
    { id: 'rdl', name: 'Barbell Romanian Deadlift', muscles: ['hamstrings'], sets: 3, reps: [8, 10] },
    { id: 'hip_thrust', name: 'Barbell Hip Thrust', muscles: ['gluteal'], sets: 3, reps: [8, 12] },
    { id: 'calf_raise', name: 'Dumbbell Calf Raise', muscles: ['calves'], sets: 4, reps: [12, 15] }
  ]
};

function getSettings() { return { ...DEFAULT_SETTINGS, ...(DB.get('settings') || {}) }; }
function saveSettings(s) { DB.set('settings', s); applyAccentTheme(); }

function applyAccentTheme() {
  const s = getSettings(); const theme = ACCENT_PALETTE[s.accentTheme || 'green'] || ACCENT_PALETTE.green;
  const r = document.documentElement; r.style.setProperty('--accent', theme.primary);
  r.style.setProperty('--accent-dim', theme.dim); r.style.setProperty('--accent-transparent', theme.trans);
}

function getPPLType(dateStr) {
  const s = getSettings(); const loopPattern = s.pattern; const blocks = s.blockedWeekdays || []; 
  const targetDate = new Date(dateStr + 'T12:00:00'); if (blocks.includes(targetDate.getDay())) return 'rest';

  let baseDate = new Date(s.startDate + 'T12:00:00'); let iter = new Date(baseDate); let patternIdx = 0;
  if (iter.getTime() <= targetDate.getTime()) {
    while (iter.getTime() < targetDate.getTime()) {
      if (!blocks.includes(iter.getDay())) { patternIdx = (patternIdx + 1) % loopPattern.length; }
      iter.setDate(iter.getDate() + 1);
    }
    if (blocks.includes(iter.getDay())) return 'rest'; return loopPattern[patternIdx];
  } else {
    while (iter.getTime() > targetDate.getTime()) {
      iter.setDate(iter.getDate() - 1);
      if (!blocks.includes(iter.getDay())) { patternIdx = (patternIdx - 1 + loopPattern.length) % loopPattern.length; }
    }
    if (blocks.includes(iter.getDay())) return 'rest'; return loopPattern[patternIdx];
  }
}

function getTodayType() { return getPPLType(new Date().toISOString().split('T')[0]); }

function buildWorkout(type) {
  const customs = DB.get('customWorkouts') || {};
  if (customs[type] && customs[type].length > 0) { return customs[type].map(ex => withSuggestion(ex)); }
  if (BASE_SYSTEM_LIBRARY[type]) { return BASE_SYSTEM_LIBRARY[type].map(ex => withSuggestion(ex)); }
  return [];
}

function withSuggestion(ex) {
  const s = getSettings(); const history = getExerciseHistory(ex.id || ex.name);
  const unit = s.weightUnit || 'lbs'; const step = unit === 'lbs' ? 5 : 2.5;

  let catalogMatch = MASTER_EXERCISES_CATALOGUE.find(c => c.id === ex.id || c.name === ex.name);
  let suggestedWeight = catalogMatch ? catalogMatch.weight : 45;
  let suggestedSets = ex.sets || 3; let suggestedReps = ex.reps ? ex.reps[0] : 10; let isPR = false;

  if (history.length > 0) {
    const last = history[history.length - 1];
    const lastWeight = Math.max(...last.sets.map(st => st.weight || 0));
    const lastReps = last.sets.map(st => st.reps || 0);
    const targetReps = ex.reps ? ex.reps[1] : 12;
    if (lastReps.every(r => r >= targetReps)) { suggestedWeight = lastWeight + step; isPR = true; } 
    else { suggestedWeight = lastWeight; }
    suggestedSets = last.sets.length; suggestedReps = Math.round(lastReps.reduce((a,b)=>a+b,0)/lastReps.length);
  }
  return { ...ex, suggestedWeight, suggestedSets, suggestedReps, isPR };
}

function getWorkouts() { return DB.get('workouts') || []; }
function saveWorkout(w) { const workouts = getWorkouts(); workouts.push(w); DB.set('workouts', workouts); }
function getExerciseHistory(idOrName) {
  return getWorkouts().flatMap(w => (w.exercises || []).filter(e => e.id === idOrName || e.name === idOrName).map(e => ({ ...e, date: w.date })));
}

let UI = { screen: 'workout', calMonth: new Date(), musclePeriod: 'week', workout: null, restTimer: null, restDurationTotal: 0, restTimeRemaining: 0, isSetViewCollapsed: true };

function showScreen(name) {
  UI.screen = name; document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const targetScreen = document.getElementById('screen-' + name); if (targetScreen) targetScreen.classList.add('active');
  const targetBtn = document.querySelector(`.nav-btn[data-screen="${name}"]`); if (targetBtn) targetBtn.classList.add('active');
  if (name === 'calendar') renderCalendar();
  if (name === 'muscles') renderMuscleMap();
  if (name === 'settings') renderSettings();
}

let onboardData = { pattern: ['Push A','Pull A','Legs A','rest'], blockedWeekdays: [], equipment: ['barbell','dumbbells','cables','machines'], level: 'intermediate', accentTheme: 'green' };
function startOnboarding() { document.getElementById('onboarding').style.display = 'flex'; generatePatternSetup(4); generateOnboardColorPicker(); showOnboardStep(1); }
function showOnboardStep(n) { document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active')); document.getElementById('onboard-' + n).classList.add('active'); }

function generatePatternSetup(len) {
  const container = document.getElementById('ob-pattern-slots-container'); container.innerHTML = '';
  for (let i = 0; i < parseInt(len); i++) {
    let dVal = 'rest'; if (i===0) dVal='Push A'; if (i===1) dVal='Pull A'; if (i===2) dVal='Legs A';
    container.innerHTML += `
      <div class="field">
        <label>Slot #${i + 1}</label>
        <select class="ob-pattern-slot-select" data-index="${i}">
          <option value="Push A" ${dVal==='Push A'?'selected':''}>Push A</option>
          <option value="Pull A" ${dVal==='Pull A'?'selected':''}>Pull A</option>
          <option value="Legs A" ${dVal==='Legs A'?'selected':''}>Legs A</option>
          <option value="rest" ${dVal==='rest'?'selected':''}>Rest</option>
        </select>
      </div>`;
  }
}

function generateOnboardColorPicker() {
  const grid = document.getElementById('ob-color-grid'); grid.innerHTML = '';
  Object.keys(ACCENT_PALETTE).forEach(k => {
    const dot = document.createElement('div'); dot.className = `color-dot ${k==='green'?'selected':''}`; dot.style.background = ACCENT_PALETTE[k].primary; dot.dataset.color = k;
    dot.onclick = function() { document.querySelectorAll('#ob-color-grid .color-dot').forEach(d=>d.classList.remove('selected')); this.classList.add('selected'); onboardData.accentTheme=this.dataset.color; };
    grid.appendChild(dot);
  });
}

function onboardNext(n) {
  if (n === 2) { onboardData.pattern = [...document.querySelectorAll('.ob-pattern-slot-select')].map(s => s.value); }
  if (n === 3) { onboardData.blockedWeekdays = [...document.querySelectorAll('.ob-block-chip.selected')].map(c => parseInt(c.dataset.day)); }
  if (n === 4) { onboardData.equipment = [...document.querySelectorAll('.ob-eq-chip.selected')].map(c => c.dataset.eq); }
  if (n === 6) {
    onboardData.setRestSeconds = parseInt(document.getElementById('ob-set-rest').value) || 90;
    onboardData.exerciseRestSeconds = parseInt(document.getElementById('ob-ex-rest').value) || 180;
    onboardData.weightUnit = document.querySelector('.ob-unit-chip.selected')?.dataset.unit || 'lbs';
    saveSettings({ ...DEFAULT_SETTINGS, ...onboardData, startDate: new Date().toISOString().split('T')[0] });
    document.getElementById('onboarding').style.display = 'none';
    refreshAppStateLabels(); renderWorkoutScreen(); return;
  }
  showOnboardStep(n + 1);
}

function renderWorkoutScreen() {
  const type = getTodayType(); if (document.getElementById('active-workout').style.display === 'flex') return;
  const container = document.getElementById('workout-ready-content');
  if (getWorkouts().some(w => w.date?.startsWith(new Date().toISOString().split('T')[0]))) {
    container.innerHTML = `<button class="btn btn-secondary" onclick="forceStartWorkout('${type}')">Train Again</button>`; return;
  }
  if (type === 'rest') {
    container.innerHTML = `
      <select id="force-workout-selector" style="margin-bottom:12px;"></select>
      <button class="btn btn-accent" onclick="forceStartWorkout(document.getElementById('force-workout-selector').value)">Start Selection</button>`;
    populateWorkoutDropdown('force-workout-selector'); return;
  }
  container.innerHTML = `<div class="workout-day-badge">${type.toUpperCase()}</div><button class="btn btn-accent" onclick="startWorkout('${type}')">Start Workout</button>`;
}

function populateWorkoutDropdown(elementId, selectedValue = '') {
  const select = document.getElementById(elementId); if (!select) return; select.innerHTML = '';
  const coreOptions = ['Push A', 'Pull A', 'Legs A'];
  const customs = DB.get('customWorkouts') || {};
  const items = [...coreOptions, ...Object.keys(customs)];
  const distinct = [...new Set(items)];
  distinct.forEach(opt => {
    const o = document.createElement('option'); o.value = opt; o.textContent = opt; if(opt === selectedValue) o.selected = true; select.appendChild(o);
  });
}

function forceStartWorkout(type) { startWorkout(type); }

function startWorkout(type) {
  const plan = buildWorkout(type); if (!plan.length) { alert('No exercises configured.'); return; }
  UI.workout = {
    type, date: new Date().toISOString(), startTime: Date.now(), exercises: plan, exIndex: 0, setIndex: 0,
    setData: plan.map(ex => Array.from({length: ex.suggestedSets}, () => ({ weight: ex.suggestedWeight, reps: ex.suggestedReps, done: false }))),
    completedExercises: [], totalVolume: 0, setTimestamps: plan.map(ex => ({ startTime: Date.now(), durations: [], restDurations: [] }))
  };
  document.getElementById('workout-ready').style.display = 'none';
  document.getElementById('active-workout').style.display = 'flex';
  UI.workout.timerInterval = setInterval(updateWorkoutTimer, 1000);
  document.getElementById('aw-submit-set-btn').onclick = () => submitFocusedActiveSet();
  UI.workout.setTimestamps[0].startTime = Date.now(); renderActiveExercise();
}

function updateWorkoutTimer() {
  if (!UI.workout) return; const elapsed = Math.floor((Date.now() - UI.workout.startTime) / 1000);
  document.getElementById('workout-timer').textContent = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('workout-volume').textContent = UI.workout.totalVolume.toLocaleString();
}

function populateSwapExerciseDropdown(type) {
  const select = document.getElementById('aw-swap-exercise-select'); select.innerHTML = '';
  const currentEx = UI.workout.exercises[UI.workout.exIndex];
  const activeOpt = document.createElement('option'); activeOpt.value = currentEx.id || currentEx.name; activeOpt.textContent = currentEx.name; activeOpt.selected = true; select.appendChild(activeOpt);

  MASTER_EXERCISES_CATALOGUE.forEach(ex => {
    if (ex.name !== currentEx.name) { const opt = document.createElement('option'); opt.value = ex.id || ex.name; opt.textContent = ex.name; select.appendChild(opt); }
  });
}

function swapActiveExerciseRuntime(targetIdOrName) {
  const w = UI.workout; const found = MASTER_EXERCISES_CATALOGUE.find(e => (e.id === targetIdOrName || e.name === targetIdOrName)); if (!found) return;
  const updatedEx = withSuggestion({ id: found.id, name: found.name, muscles: [found.muscle], sets: found.sets, reps: found.reps });
  w.exercises[w.exIndex] = updatedEx; w.setData[w.exIndex] = Array.from({length: updatedEx.suggestedSets}, () => ({ weight: updatedEx.suggestedWeight, reps: updatedEx.suggestedReps, done: false }));
  w.setTimestamps[w.exIndex] = { startTime: Date.now(), durations: [], restDurations: [] }; w.setIndex = 0; renderActiveExercise();
}

function renderActiveExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex];
  let activeSetIdx = sets.findIndex(s => !s.done); if (activeSetIdx === -1) activeSetIdx = sets.length - 1; w.setIndex = activeSetIdx;

  document.getElementById('aw-type').textContent = w.type; document.getElementById('aw-progress').textContent = `${w.exIndex + 1} / ${w.exercises.length}`;
  document.getElementById('aw-ex-muscles').textContent = (ex.muscles || []).map(m => MUSCLE_LABELS[m] || m).filter((v,i,a)=>a.indexOf(v)===i).join(' · ');
  document.getElementById('aw-pr-badge').style.display = ex.isPR ? 'inline-flex' : 'none'; populateSwapExerciseDropdown(w.type);

  const dashContainer = document.getElementById('aw-dash-container'); dashContainer.innerHTML = '';
  sets.forEach((s, i) => { const dash = document.createElement('div'); dash.className = `set-dash ${s.done ? 'completed' : (i===activeSetIdx ? 'current' : '')}`; dashContainer.appendChild(dash); });

  document.getElementById('aw-focus-title').textContent = `Set ${activeSetIdx + 1}`;
  const inputWeight = document.getElementById('focus-weight'); const inputReps = document.getElementById('focus-reps');
  inputWeight.value = sets[activeSetIdx].weight; inputReps.value = sets[activeSetIdx].reps;

  if (sets[activeSetIdx].done) { inputWeight.setAttribute('disabled','true'); inputReps.setAttribute('disabled','true'); }
  else { inputWeight.removeAttribute('disabled'); inputReps.removeAttribute('disabled'); }

  const collapseTarget = document.getElementById('collapse-target'); collapseTarget.innerHTML = '';
  sets.forEach((s, idx) => { collapseTarget.innerHTML += `<div class="mini-set-row ${s.done?'done':''}"><span>Set ${idx + 1}</span><span>${s.weight} ${getSettings().weightUnit} × ${s.reps}</span></div>`; });

  const trigger = document.getElementById('collapse-trigger');
  if (UI.isSetViewCollapsed) { trigger.classList.remove('open'); collapseTarget.classList.remove('open'); }
  else { trigger.classList.add('open'); collapseTarget.classList.add('open'); }

  document.getElementById('aw-completed-list').innerHTML = w.completedExercises.map(ce => `
    <div class="completed-ex"><div class="completed-info"><div class="completed-name">${ce.name}</div><div class="completed-meta">${ce.sets.length} sets logged</div></div></div>`).join('');
}

function saveActiveFocusInputs() {
  const w = UI.workout; const sets = w.setData[w.exIndex]; const si = w.setIndex;
  if (sets[si] && !sets[si].done) {
    sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0;
    sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  }
}

function toggleSetCollapse() { UI.isSetViewCollapsed = !UI.isSetViewCollapsed; renderActiveExercise(); }
function addSetToCurrentExercise() {
  const w = UI.workout; const sets = w.setData[w.exIndex]; const last = sets[sets.length - 1];
  sets.push({ weight: last?last.weight:135, reps: last?last.reps:10, done: false }); renderActiveExercise();
}

function submitFocusedActiveSet() {
  const w = UI.workout; const sets = w.setData[w.exIndex]; const si = w.setIndex; const timeLog = w.setTimestamps[w.exIndex];
  const ex = w.exercises[w.exIndex];

  sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0;
  sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  
  if (sets[si].weight !== ex.suggestedWeight || sets[si].reps !== ex.suggestedReps) {
    sets[si].hasAsteriskDeviation = true;
  }

  sets[si].done = true; const setDurationSeconds = Math.floor((Date.now() - timeLog.startTime) / 1000);
  timeLog.durations.push(setDurationSeconds); w.totalVolume += (sets[si].weight * sets[si].reps);
  const allDone = sets.every(s => s.done); UI.setRestMarkerStart = Date.now();

  if (allDone) {
    const isLastEx = w.exIndex >= w.exercises.length - 1;
    showRestScreen('exercise', isLastEx ? null : w.exercises[w.exIndex + 1].name, () => {
      commitCurrentExercise(); if (isLastEx) { finishWorkout(); } 
      else { w.exIndex++; w.setIndex = 0; timeLog.startTime = Date.now(); renderActiveExercise(); }
    });
  } else {
    showRestScreen('set', null, () => { w.setIndex++; timeLog.startTime = Date.now(); renderActiveExercise(); });
  }
}

function commitCurrentExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex].filter(s => s.done);
  if (!sets.length || w.completedExercises.some(c => c.id === ex.id)) return;
  const timeLog = w.setTimestamps[w.exIndex];

  w.completedExercises.push({
    id: ex.id, name: ex.name, muscles: ex.muscles, sets: sets.map((s, idx) => ({
      weight: s.weight, reps: s.reps, duration: timeLog.durations[idx] || 0, restBefore: timeLog.restDurations[idx] || 0,
      hasAsteriskDeviation: s.hasAsteriskDeviation || false
    }))
  });
}

function skipToNextExercise() { commitCurrentExercise(); const w = UI.workout; if (w.exIndex >= w.exercises.length - 1) { finishWorkout(); } else { w.exIndex++; w.setIndex = 0; renderActiveExercise(); } }
function endWorkoutEarly() { if (confirm('End workout? Progress will be saved.')) { clearRestTimer(); finishWorkout(); } }

function finishWorkout() {
  clearInterval(UI.workout.timerInterval); clearRestTimer(); const w = UI.workout; commitCurrentExercise();
  if (w.completedExercises.length === 0) { UI.workout = null; renderWorkoutScreen(); return; }

  const saved = {
    id: w.date, date: w.date, type: w.type, duration: Math.floor((Date.now() - w.startTime) / 1000), exercises: w.completedExercises,
    totalVolume: w.completedExercises.reduce((a,e) => a + e.sets.reduce((b,s)=>(b+(s.weight||0)*(s.reps||0)),0), 0)
  };
  saveWorkout(saved); UI.workout = null; document.getElementById('active-workout').style.display = 'none';
  document.getElementById('workout-ready').style.display = 'flex'; renderWorkoutScreen();
}

function showRestScreen(type, nextExName, onDone) {
  const s = getSettings(); const duration = type === 'exercise' ? s.exerciseRestSeconds : s.setRestSeconds;
  UI.restDurationTotal = duration; UI.restTimeRemaining = duration; UI.restOnDoneCallback = onDone;

  const overlay = document.getElementById('rest-overlay');
  document.getElementById('rest-overlay-type').textContent = type === 'exercise' ? 'Exercise Rest' : 'Set Rest';
  document.getElementById('rest-overlay-label').textContent = 'Resting';
  document.getElementById('rest-overlay-next').innerHTML = nextExName ? `Next: <strong>${nextExName}</strong>` : '';

  updateRestOverlayDisplay(); overlay.classList.add('show'); clearRestTimer();
  UI.restTimer = setInterval(() => { UI.restTimeRemaining--; updateRestOverlayDisplay(); if (UI.restTimeRemaining <= 0) { triggerRestEndExecution(); } }, 1000);
  document.getElementById('rest-skip-trigger').onclick = () => triggerRestEndExecution();
}

function updateRestOverlayDisplay() {
  const circ = 2 * Math.PI * 90; const fill = document.getElementById('rest-ring-circle');
  const frac = Math.max(0, UI.restTimeRemaining) / UI.restDurationTotal; fill.style.strokeDasharray = circ; fill.style.strokeDashoffset = circ * (1 - frac);
  document.getElementById('rest-time-sec').textContent = Math.max(0, UI.restTimeRemaining);
}

function snoozeRestTimer(seconds) { UI.restTimeRemaining += seconds; UI.restDurationTotal += seconds; updateRestOverlayDisplay(); }

function triggerRestEndExecution() {
  clearRestTimer(); document.getElementById('rest-overlay').classList.remove('show');
  if (UI.workout) {
    const totalRestTaken = Math.floor((Date.now() - UI.setRestMarkerStart) / 1000);
    const timeLog = UI.workout.setTimestamps[UI.workout.exIndex]; if (timeLog) { timeLog.restDurations.push(totalRestTaken); }
  }
  if (UI.restOnDoneCallback) UI.restOnDoneCallback();
}

function clearRestTimer() { if (UI.restTimer) { clearInterval(UI.restTimer); UI.restTimer = null; } }

function renderCalendar() {
  const m = UI.calMonth; const yr = m.getFullYear(), mo = m.getMonth();
  document.getElementById('cal-month-label').textContent = m.toLocaleDateString('en-US', {month:'long', year:'numeric'});
  const grid = document.getElementById('cal-grid'); grid.innerHTML = '';

  ['S','M','T','W','T','F','S'].forEach(d => { const b = document.createElement('div'); b.className = 'cal-day-name'; b.textContent = d; grid.appendChild(b); });
  const firstDow = new Date(yr, mo, 1).getDay(); const totalDays = new Date(yr, mo + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];
  const workoutMap = {}; getWorkouts().forEach(w => { if (w.date) workoutMap[w.date.split('T')[0]] = w; });

  for (let i = 0; i < firstDow; i++) grid.appendChild(document.createElement('div'));

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell = document.createElement('div'); cell.className = 'cal-day'; cell.textContent = d;
    const isToday = (dayStr === todayStr); const schedType = getPPLType(dayStr); const comp = workoutMap[dayStr];

    if (isToday) cell.classList.add('today');
    if (comp) { cell.classList.add('has-workout'); cell.onclick = () => renderHistoricalSummaryAccordion(comp); }
    else if (dayStr > todayStr && schedType !== 'rest') {
      cell.classList.add('scheduled'); const dot = document.createElement('div'); dot.className = 'cal-day-dot';
      
      // Auto-categorize custom routine colors inside the calendar
      const normalizedName = schedType.toLowerCase();
      let colorCode = '#555557';
      if (normalizedName.includes('push')) colorCode = 'var(--red)';
      else if (normalizedName.includes('pull')) colorCode = 'var(--blue)';
      else if (normalizedName.includes('leg')) colorCode = 'var(--green)';
      
      dot.style.background = colorCode; cell.appendChild(dot);
    } else if (schedType === 'rest') { cell.classList.add('rest-day'); }
    grid.appendChild(cell);
  }
  renderCalStats();
}

function renderCalStats() {
  const workouts = getWorkouts(); document.getElementById('stat-total').textContent = workouts.length;
  const totalVol = workouts.reduce((a,w)=>a+(w.totalVolume||0),0); const unit = getSettings().weightUnit;
  document.getElementById('stat-vol').textContent = totalVol >= 100000 ? (totalVol/1000).toFixed(0)+'k ' + unit : totalVol.toLocaleString() + ' ' + unit;

  let streak = 0; let check = new Date(); check.setHours(0,0,0,0);
  const wDates = workouts.map(w => w.date.split('T')[0]); let activeChain = true; let loopLimit = 0;
  while (activeChain && loopLimit < 365) {
    const cStr = check.toISOString().split('T')[0]; const sType = getPPLType(cStr);
    if (wDates.includes(cStr)) { streak++; } 
    else if (sType === 'rest') { if (cStr !== new Date().toISOString().split('T')[0]) streak++; } 
    else { if (cStr !== new Date().toISOString().split('T')[0]) activeChain = false; }
    check.setDate(check.getDate() - 1); loopLimit++;
  }
  document.getElementById('stat-streak').textContent = streak; renderVolChart();
}

function renderVolChart() {
  const chart = document.getElementById('vol-chart'); chart.innerHTML = ''; const weeks = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i * 7);
    const start = new Date(d); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    const vol = getWorkouts().filter(w => { const wd=new Date(w.date); return wd>=start && wd<=end; }).reduce((a,w)=>a+(w.totalVolume||0),0);
    weeks.push({vol, label: start.toLocaleDateString('en-US',{month:'numeric',day:'numeric'})});
  }
  const max = Math.max(...weeks.map(w=>w.vol), 1);
  weeks.forEach((w, idx) => {
    const wrap = document.createElement('div'); wrap.className = 'vol-bar-wrap'; const pct = Math.round((w.vol / max) * 100);
    wrap.innerHTML = `<div class="vol-bar-inner ${idx===4?'filled':''}" style="height:${pct}%"></div><div class="vol-bar-lbl">${w.label}</div>`;
    chart.appendChild(wrap);
  });
}

function changeCalMonth(dir) { UI.calMonth = new Date(UI.calMonth.getFullYear(), UI.calMonth.getMonth() + dir, 1); renderCalendar(); }

function renderHistoricalSummaryAccordion(w) {
  const root = document.getElementById('cal-history-accordion-root'); root.innerHTML = '';
  const unit = getSettings().weightUnit; const d = new Date(w.date);

  const titleNode = document.createElement('div'); titleNode.style.cssText = 'font-size:12px; text-transform:uppercase; font-weight:700; color:var(--accent); margin:12px 0 6px 4px;';
  titleNode.textContent = `${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})} Session Details`; root.appendChild(titleNode);

  (w.exercises || []).forEach((ex) => {
    const item = document.createElement('div'); item.className = 'history-summary-item';
    const totalExVol = ex.sets.reduce((a,s)=> a + (s.weight * s.reps), 0);
    const firstSet = ex.sets[0] || { weight: 0, reps: 0 };

    item.innerHTML = `
      <div class="history-summary-header" onclick="toggleHistoricalSummaryAccordionNode(this)">
        <div style="flex:1; min-width:0; padding-right:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          <strong>${ex.name}</strong> <span style="color:var(--text2); font-size:13px; margin-left:4px;">${ex.sets.length} sets</span>
        </div>
        <div style="color:var(--accent); font-size:13px; font-weight:700; flex-shrink:0;">${totalExVol.toLocaleString()} ${unit} ➔</div>
      </div>
      <div class="history-summary-expanded-content">
        <div class="history-sets-grid">
          ${ex.sets.map((s, idx) => `
            <div class="history-set-pill">
              <span>Set ${idx + 1}</span>
              <span style="font-weight:700; color:var(--accent)">
                ${s.weight}${s.hasAsteriskDeviation?'*':''} × ${s.reps}${s.hasAsteriskDeviation?'*':''}
              </span>
              <span style="color:var(--text3); font-size:11px;">T: ${s.duration}s | R: ${s.restBefore}s</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    root.appendChild(item);
  });
  root.scrollIntoView({ behavior: 'smooth' });
}

function toggleHistoricalSummaryAccordionNode(headerElement) {
  const content = headerElement.nextElementSibling; content.classList.toggle('open');
}

function renderMuscleMap() {
  const freq = getMusclesWorked(UI.musclePeriod); const maxFreq = Math.max(...Object.values(freq), 1);
  const leg = document.getElementById('muscle-legend'); const shown = new Set(); const items = [];
  
  Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([id, count]) => {
    const lbl = MUSCLE_LABELS[id] || id; 
    if (lbl && !shown.has(lbl)) { shown.add(lbl); items.push({lbl, count, color: MUSCLE_COLOR[lbl]||'#888'}); }
  });
  
  leg.innerHTML = items.map(({lbl,count,color}) => `
    <div class="muscle-pill" style="background:${color}15; border:1px solid ${color}40"><div class="muscle-pill-dot" style="background:${color}"></div><span style="color:${color}">${lbl} (×${count})</span></div>`).join('');

  const bd = document.getElementById('muscle-breakdown'); if (!items.length) { bd.innerHTML = ''; return; }
  bd.innerHTML = `<div class="card"><div class="section-label" style="margin-bottom:12px;">Distribution</div>` +
    items.map(({lbl,count,color}) => `<div style="margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;"><span>${lbl}</span><span>${count}</span></div><div style="height:6px; background:var(--bg4); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${window.isNaN(count/maxFreq)?0:Math.round(count/maxFreq*100)}%; background:${color};"></div></div></div>`).join('') + '</div>';
}

function getMusclesWorked(period) {
  const now = new Date(); const cutoff = period === 'week' ? 7 : period === 'month' ? 30 : 36500; const freq = {};
  getWorkouts().forEach(w => {
    if (((now - new Date(w.date)) / 86400000) > cutoff) return;
    (w.exercises || []).forEach(ex => {
      // Correct distribution map lookup mapping
      let match = MASTER_EXERCISES_CATALOGUE.find(m => m.id === ex.id || m.name === ex.name);
      let mGroup = match ? match.muscle : (ex.muscles ? ex.muscles[0] : 'abs');
      freq[mGroup] = (freq[mGroup] || 0) + 1;
    });
  }); return freq;
}

function setMusclePeriod(p) { UI.musclePeriod = p; document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active')); document.getElementById('ptab-'+p).classList.add('active'); renderMuscleMap(); }

// ── FULL-SCREEN WORKSPACE PANELS MATRIX LAYOUT ROUTERS ────────────────
function openFullscreenPanel(panelId) {
  document.getElementById(panelId).style.display = 'flex';
}
function closeFullscreenPanel(panelId) {
  document.getElementById(panelId).style.display = 'none';
}

function renderSettings() {
  const s = getSettings();
  document.getElementById('settings-content').innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Schedule Builder</div>
      <div class="settings-row" onclick="openFullscreenScheduleBuilderPanel()"><div class="settings-row-left"><div class="settings-row-label">Rotation Loop</div><div class="settings-row-value">${s.pattern.join(' → ')}</div></div><div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div class="settings-row" onclick="editSetting('blocked')"><div class="settings-row-left"><div class="settings-row-label">Blocked Weekdays</div><div class="settings-row-value">${s.blockedWeekdays.length?s.blockedWeekdays.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', '):'None'}</div></div><div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Routines Manager</div>
      <div class="settings-row" onclick="openFullscreenWorkoutManagerPanel()"><div class="settings-row-left"><div class="settings-row-label">Manage Workouts</div><div class="settings-row-value">Edit templates or create custom variants</div></div><div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Preferences</div>
      <div class="settings-row" onclick="editSetting('unit')"><div class="settings-row-left"><div class="settings-row-label">Weight Unit</div><div class="settings-row-value">${s.weightUnit}</div></div><div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div class="settings-row" onclick="editSetting('color')"><div class="settings-row-left"><div class="settings-row-label">Theme Color</div><div class="settings-row-value" style="color:var(--accent); font-weight:700;">${s.accentTheme}</div></div><div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
      <div class="settings-row" onclick="editSetting('timers')"><div class="settings-row-left"><div class="settings-row-label">Rest Timers</div><div class="settings-row-value">Sets: ${s.setRestSeconds}s · Exercises: ${s.exerciseRestSeconds}s</div></div><div class="settings-row-right"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Data Storage</div>
      <div class="settings-row" onclick="resetData()"><div class="settings-row-left"><div class="settings-row-label" style="color:var(--red);">Reset All Data</div></div></div>
    </div>`;
}

function editSetting(key) {
  const s = getSettings();
  if (key === 'color') {
    showModal(`<div class="modal-title">Select Color</div><div class="color-picker-grid" id="settings-color-grid"></div><button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsThemeColor()">Save</button>`);
    const grid = document.getElementById('settings-color-grid');
    Object.keys(ACCENT_PALETTE).forEach(k => {
      const dot = document.createElement('div'); dot.className = `color-dot ${s.accentTheme===k?'selected':''}`; dot.style.background = ACCENT_PALETTE[k].primary; dot.dataset.color = k;
      dot.onclick = function() { document.querySelectorAll('#settings-color-grid .color-dot').forEach(d=>d.classList.remove('selected')); this.classList.add('selected'); }; grid.appendChild(dot);
    });
  } else if (key === 'timers') {
    showModal(`<div class="modal-title">Rest Times</div><div class="field"><label>Sets (s)</label><input type="number" id="edit-set-rest" value="${s.setRestSeconds}"></div><div class="field"><label>Exercises (s)</label><input type="number" id="edit-ex-rest" value="${s.exerciseRestSeconds}"></div><button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsTimers()">Save</button>`);
  } else if (key === 'unit') {
    showModal(`<div class="modal-title">Weight Unit</div><select id="edit-global-unit"><option value="lbs" ${s.weightUnit==='lbs'?'selected':''}>lbs</option><option value="kg" ${s.weightUnit==='kg'?'selected':''}>kg</option></select><button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsUnit()">Save</button>`);
  } else if (key === 'blocked') {
    showModal(`<div class="modal-title">Blocked Days</div><div class="chip-group" style="margin-top:8px;">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d,i)=>`<div class="chip settings-block-chip ${s.blockedWeekdays.includes(i)?'selected':''}" data-day="${i}" onclick="this.classList.toggle('selected')">${d}</div>`).join('')}</div><button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsBlockedDays()">Save</button>`);
  }
}

function saveSettingsThemeColor() { const dot = document.querySelector('#settings-color-grid .color-dot.selected'); if(dot){ const s=getSettings(); s.accentTheme=dot.dataset.color; saveSettings(s); closeModal(); renderSettings(); } }
function saveSettingsTimers() { const s = getSettings(); s.setRestSeconds = parseInt(document.getElementById('edit-set-rest').value)||90; s.exerciseRestSeconds = parseInt(document.getElementById('edit-ex-rest').value)||180; saveSettings(s); closeModal(); renderSettings(); }
function saveSettingsUnit() { const s = getSettings(); s.weightUnit = document.getElementById('edit-global-unit').value; saveSettings(s); closeModal(); renderSettings(); refreshAppStateLabels(); }
function saveSettingsBlockedDays() { const s = getSettings(); s.blockedWeekdays = [...document.querySelectorAll('.settings-block-chip.selected')].map(c=>parseInt(c.dataset.day)); saveSettings(s); closeModal(); renderSettings(); renderCalendar(); }

// ── 1. RE-ARCHITECTED FULL-SCREEN SCHEDULE MATRIX BUILDER ────────────
function openFullscreenScheduleBuilderPanel() {
  const s = getSettings();
  document.getElementById('sb-loop-len-selector').value = s.pattern.length;
  adjustFullscreenScheduleSlotsLayout(s.pattern.length);
  openFullscreenPanel('panel-schedule-builder');
}

function adjustFullscreenScheduleSlotsLayout(len) {
  const wrap = document.getElementById('sb-slots-inputs-list-wrapper'); wrap.innerHTML = ''; const s = getSettings();
  for (let i = 0; i < parseInt(len); i++) {
    const val = s.pattern[i] || 'rest';
    wrap.innerHTML += `
      <div class="schedule-builder-row">
        <span>Day Slot #${i+1}</span>
        <select class="fullscreen-sb-select" id="fullscreen-sb-select-${i}"></select>
      </div>`;
    populateWorkoutDropdown(`fullscreen-sb-select-${i}`, val);
    
    const selNode = document.getElementById(`fullscreen-sb-select-${i}`);
    const restOpt = document.createElement('option'); restOpt.value = 'rest'; restOpt.textContent = 'Rest Day';
    if(val === 'rest') restOpt.selected = true; selNode.appendChild(restOpt);
  }
}

function saveFullscreenScheduleSettingsPatternMatrix() {
  const s = getSettings(); const arr = [];
  document.querySelectorAll('.fullscreen-sb-select').forEach(sel => arr.push(sel.value));
  s.pattern = arr; saveSettings(s);
  closeFullscreenPanel('panel-schedule-builder'); renderSettings(); renderCalendar(); renderWorkoutScreen();
}

// ── 2. RE-ARCHITECTED FULL-SCREEN WORKOUT ROUTINES HUB MANAGER ───────
function openFullscreenWorkoutManagerPanel() {
  document.getElementById('panel-wm-dashboard-view').style.display = 'flex';
  document.getElementById('panel-wm-editing-view').style.display = 'none';
  document.getElementById('wm-panel-title-text').textContent = "Manage Workouts";
  
  const customs = DB.get('customWorkouts') || {}; const coreWorkouts = ['Push A', 'Pull A', 'Legs A'];
  const allRoutinesList = [...coreWorkouts, ...Object.keys(customs)];

  const container = document.getElementById('panel-wm-routines-container'); container.innerHTML = '';
  container.innerHTML = allRoutinesList.map(name => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg2); padding:16px; border-radius:var(--radius); margin-bottom:4px;">
      <span style="font-weight:700; font-size:16px; padding-left:2px;">${name}</span>
      <button class="btn btn-accent btn-sm" onclick="startFullscreenWorkoutCustomizerEditorFlow('${name}')">Edit Routine</button>
    </div>`).join('');
    
  openFullscreenPanel('panel-workout-manager');
}

function createNewWorkoutProgramFromFullscreenHub() {
  const name = document.getElementById('panel-wm-new-name-field').value.trim();
  if (!name || name === 'rest') { alert('Provide a valid unique name.'); return; }
  const customs = DB.get('customWorkouts') || {};
  if (customs[name] || name === 'Push A' || name === 'Pull A' || name === 'Legs A') { alert('Routine name already used.'); return; }

  customs[name] = []; DB.set('customWorkouts', customs);
  document.getElementById('panel-wm-new-name-field').value = '';
  startFullscreenWorkoutCustomizerEditorFlow(name);
}

let fullscreenEditorStateArray = [];
function startFullscreenWorkoutCustomizerEditorFlow(workoutName) {
  document.getElementById('panel-wm-dashboard-view').style.display = 'none';
  document.getElementById('panel-wm-editing-view').style.display = 'flex';
  document.getElementById('wm-panel-title-text').textContent = `Editing: ${workoutName}`;

  const customs = DB.get('customWorkouts') || {};
  let currentList = [];
  if (workoutName === 'Push A' || workoutName === 'Pull A' || workoutName === 'Legs A') {
    currentList = customs[workoutName] || BASE_SYSTEM_LIBRARY[workoutName];
  } else {
    currentList = customs[workoutName] || [];
  }

  fullscreenEditorStateArray = JSON.parse(JSON.stringify(currentList));
  renderFullscreenEditorRows();

  document.getElementById('fullscreen-cz-save-trigger').onclick = () => {
    customs[workoutName] = fullscreenEditorStateArray;
    DB.set('customWorkouts', customs);
    openFullscreenWorkoutManagerPanel();
    renderWorkoutScreen();
  };
}

function renderFullscreenEditorRows() {
  const container = document.getElementById('fullscreen-cz-exercises-list-wrapper'); container.innerHTML = '';
  if (fullscreenEditorStateArray.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text3); padding:24px; font-size:14px;">No exercises. Add one below:</div>`; return;
  }

  fullscreenEditorStateArray.forEach((ex, idx) => {
    const row = document.createElement('div'); row.className = 'custom-workout-row';
    row.innerHTML = `
      <div class="custom-workout-row-header">
        <span style="font-weight:700; font-size:15px; color:var(--text);">${ex.name}</span>
        <button class="btn btn-danger btn-sm" onclick="removeExerciseFromFullscreenCustomizer(${idx})" style="padding:4px 10px; font-size:12px; width:auto;">Remove</button>
      </div>
      <div class="custom-workout-grid-inputs">
        <div><span>SETS</span><input type="number" id="fcz-set-${idx}" value="${ex.sets || 3}" onchange="syncFullscreenEditorInputs(${idx})"></div>
        <div><span>REPS</span><input type="number" id="fcz-rep-${idx}" value="${ex.reps ? ex.reps[0] : 10}" onchange="syncFullscreenEditorInputs(${idx})"></div>
        <div><span>WEIGHT</span><input type="number" id="fcz-wt-${idx}" value="${ex.suggestedWeight || ex.weight || 45}" onchange="syncFullscreenEditorInputs(${idx})"></div>
      </div>`;
    container.appendChild(row);
  });
}

function syncFullscreenEditorInputs(idx) {
  const sets = parseInt(document.getElementById(`fcz-set-${idx}`).value) || 3;
  const reps = parseInt(document.getElementById(`fcz-rep-${idx}`).value) || 10;
  const wt = parseFloat(document.getElementById(`fcz-wt-${idx}`).value) || 45;

  fullscreenEditorStateArray[idx].sets = sets;
  fullscreenEditorStateArray[idx].reps = [reps, reps + 2];
  fullscreenEditorStateArray[idx].suggestedWeight = wt;
  fullscreenEditorStateArray[idx].weight = wt;
}

function removeExerciseFromFullscreenCustomizer(idx) {
  fullscreenEditorStateArray.splice(idx, 1); renderFullscreenEditorRows();
}

function cancelFullscreenCustomizerEdit() {
  openFullscreenWorkoutManagerPanel();
}

// ── 3. FULL-SCREEN EXERCISE CATALOG SELECTION ENGINE ─────────────────
function openExerciseCatalogSelectorFullscreenPanel() {
  const groups = {};
  MASTER_EXERCISES_CATALOGUE.forEach(ex => {
    const groupName = MUSCLE_LABELS[ex.muscle] || ex.muscle;
    if (!groups[groupName]) groups[groupName] = []; groups[groupName].push(ex);
  });

  const container = document.getElementById('fullscreen-catalogue-tree-nodes'); container.innerHTML = '';
  let fullTreeHtml = '';
  Object.keys(groups).sort().forEach(gName => {
    fullTreeHtml += `<div class="exercise-group-title">${gName}</div>`;
    groups[gName].forEach(ex => {
      fullTreeHtml += `
        <div class="modal-selection-row" onclick="selectExerciseFromFullscreenCatalogueInjection('${ex.id}')">
          <span style="font-weight:600;">${ex.name}</span>
          <span style="color:var(--text3); font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">${ex.equipment}</span>
        </div>`;
    });
  });
  container.innerHTML = fullTreeHtml;
  openFullscreenPanel('panel-exercise-catalogue-picker');
}

function selectExerciseFromFullscreenCatalogueInjection(catalogId) {
  const match = MASTER_EXERCISES_CATALOGUE.find(c => c.id === catalogId);
  if (match) {
    fullscreenEditorStateArray.push({
      id: match.id, name: match.name, muscles: [match.muscle], sets: match.sets, reps: match.reps, suggestedWeight: match.weight, weight: match.weight
    });
  }
  closeFullscreenPanel('panel-exercise-catalogue-picker');
  renderFullscreenEditorRows();
}

function showModal(html) { document.getElementById('modal-body').innerHTML = html; document.getElementById('modal-overlay').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function resetData() { if (confirm('Purge logs?')) { ['workouts','settings','customWorkouts'].forEach(k => DB.del(k)); location.reload(); } }

function refreshAppStateLabels() {
  const label = document.getElementById('today-label');
  if (label) { label.textContent = new Date().toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'}) + " · Routine: " + getTodayType().toUpperCase(); }
}

document.addEventListener('DOMContentLoaded', () => {
  applyAccentTheme();
  if (!DB.get('settings')) { startOnboarding(); } 
  else { refreshAppStateLabels(); renderWorkoutScreen(); showScreen('workout'); }
});

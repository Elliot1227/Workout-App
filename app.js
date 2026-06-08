// ═══════════════════════════════════════════════════════════════════
// WORKOUT TRACKER — APPMATRIX CONTROLLER ENGINE WITH VULOVIX VECTORS
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

const MUSCLE_LABELS = {
  chest: 'Chest', lats: 'Lats', deltoids: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', trapezius: 'Traps', obliques: 'Core', abs: 'Core', quadriceps: 'Quads', hamstrings: 'Hamstrings', gluteal: 'Glutes', calves: 'Calves', forearms: 'Forearms'
};

const MUSCLE_COLOR = {
  'Chest':'#ff6b6b','Lats':'#4d9fff','Shoulders':'#ffa94d','Biceps':'#3ddc84','Triceps':'#cc44ff','Traps':'#74c0fc','Quads':'#ffe066','Hamstrings':'#63e6be','Glutes':'#ff8c42','Calves':'#a9e34b','Core':'#748ffc','Forearms':'#e599f7'
};

const LIBRARY = {
  push: [
    { id:'bench_press',      name:'Bench Press',         muscles:['chest'],             equipment:['barbell'],            sets:4, reps:[6,8] },
    { id:'incline_bench',    name:'Incline Bench Press', muscles:['chest','deltoids'],  equipment:['barbell'],       sets:4, reps:[8,10] },
    { id:'ohp',              name:'Overhead Press',      muscles:['deltoids','triceps'], equipment:['barbell'], sets:4, reps:[6,8] },
    { id:'db_shoulder_press',name:'DB Shoulder Press',   muscles:['deltoids'],          equipment:['dumbbells'], sets:3, reps:[10,12] },
    { id:'lateral_raise',    name:'Lateral Raise',       muscles:['deltoids'],          equipment:['dumbbells','cables'],  sets:4, reps:[12,15] },
    { id:'tricep_pushdown',  name:'Tricep Pushdown',     muscles:['triceps'],           equipment:['cables'],              sets:3, reps:[10,12] }
  ],
  pull: [
    { id:'deadlift',         name:'Deadlift',            muscles:['trapezius','gluteal','hamstrings'], equipment:['barbell'], sets:4, reps:[4,6] },
    { id:'pullup',           name:'Pull-Up',             muscles:['lats','biceps'],     equipment:['barbell','dumbbells','cables','machines'], sets:4, reps:[6,10] },
    { id:'bent_row',         name:'Bent Over Row',       muscles:['lats','trapezius','biceps'], equipment:['barbell'], sets:4, reps:[6,8] },
    { id:'lat_pulldown',     name:'Lat Pulldown',        muscles:['lats','biceps'],     equipment:['cables','machines'],   sets:4, reps:[10,12] },
    { id:'barbell_curl',     name:'Barbell Curl',        muscles:['biceps'],            equipment:['barbell'],             sets:3, reps:[10,12] }
  ],
  legs: [
    { id:'squat',            name:'Squat',               muscles:['quadriceps','gluteal'], equipment:['barbell'],             sets:4, reps:[5,8] },
    { id:'rdl',              name:'Romanian Deadlift',   muscles:['hamstrings','gluteal'], equipment:['barbell','dumbbells'], sets:3, reps:[8,10] },
    { id:'leg_press',        name:'Leg Press',           muscles:['quadriceps','gluteal'], equipment:['machines'],            sets:4, reps:[10,12] },
    { id:'calf_raise',       name:'Calf Raise',          muscles:['calves'],            equipment:['barbell','dumbbells','machines','cables'], sets:4, reps:[12,15] }
  ]
};

function getSettings() { return { ...DEFAULT_SETTINGS, ...(DB.get('settings') || {}) }; }
function saveSettings(s) { DB.set('settings', s); applyAccentTheme(); }

function applyAccentTheme() {
  const s = getSettings();
  const theme = ACCENT_PALETTE[s.accentTheme || 'green'] || ACCENT_PALETTE.green;
  const r = document.documentElement;
  r.style.setProperty('--accent', theme.primary);
  r.style.setProperty('--accent-dim', theme.dim);
  r.style.setProperty('--accent-transparent', theme.trans);
}

function getPPLType(dateStr) {
  const s = getSettings();
  const loopPattern = s.pattern || ['push', 'pull', 'legs', 'rest'];
  const blocks = s.blockedWeekdays || []; 
  const targetDate = new Date(dateStr + 'T12:00:00');
  if (blocks.includes(targetDate.getDay())) return 'rest';

  let baseDate = new Date(s.startDate + 'T12:00:00');
  let iter = new Date(baseDate);
  let patternIdx = 0;

  if (iter.getTime() <= targetDate.getTime()) {
    while (iter.getTime() < targetDate.getTime()) {
      if (!blocks.includes(iter.getDay())) {
        patternIdx = (patternIdx + 1) % loopPattern.length;
      }
      iter.setDate(iter.getDate() + 1);
    }
    if (blocks.includes(iter.getDay())) return 'rest';
    return loopPattern[patternIdx];
  } else {
    while (iter.getTime() > targetDate.getTime()) {
      iter.setDate(iter.getDate() - 1);
      if (!blocks.includes(iter.getDay())) {
        patternIdx = (patternIdx - 1 + loopPattern.length) % loopPattern.length;
      }
    }
    if (blocks.includes(iter.getDay())) return 'rest';
    return loopPattern[patternIdx];
  }
}

function getTodayType() { return getPPLType(new Date().toISOString().split('T')[0]); }

function buildWorkout(type) {
  const customs = DB.get('customWorkouts') || {};
  if (customs[type] && customs[type].length > 0) {
    return customs[type].map(ex => withSuggestion(ex));
  }
  const s = getSettings();
  const eq = s.equipment || [];
  const pool = LIBRARY[type] ? LIBRARY[type].filter(ex => ex.equipment.some(e => eq.includes(e))) : [];
  return pool.slice(0, 5).map(ex => withSuggestion(ex));
}

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
    if (lastReps.every(r => r >= targetReps)) {
      suggestedWeight = lastWeight + step;
      isPR = true;
    } else {
      suggestedWeight = lastWeight;
    }
    suggestedSets = last.sets.length;
    suggestedReps = Math.round(lastReps.reduce((a,b)=>a+b,0)/lastReps.length);
  }
  return { ...ex, suggestedWeight, suggestedSets, suggestedReps, isPR };
}

function getDefaultWeight(ex, level, unit) {
  const mult = unit === 'kg' ? 0.45 : 1;
  const defaults = { bench_press:{beginner:95,intermediate:135,advanced:185}, squat:{beginner:95,intermediate:155,advanced:225} };
  const base = defaults[ex.id] ? defaults[ex.id][level || 'intermediate'] : 50;
  return Math.round((base * mult) / 5) * 5;
}

function getWorkouts() { return DB.get('workouts') || []; }
function saveWorkout(w) { const workouts = getWorkouts(); workouts.push(w); DB.set('workouts', workouts); }
function getExerciseHistory(idOrName) {
  return getWorkouts().flatMap(w => (w.exercises || []).filter(e => e.id === idOrName || e.name === idOrName).map(e => ({ ...e, date: w.date })));
}

let UI = {
  screen: 'workout',
  calMonth: new Date(),
  muscleView: 'front',
  musclePeriod: 'week',
  workout: null, 
  restTimer: null,
  restDurationTotal: 0, 
  restTimeRemaining: 0,
  isSetViewCollapsed: true 
};

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

let onboardData = { pattern: ['push','pull','legs','rest'], blockedWeekdays: [], equipment: ['barbell','dumbbells','cables','machines'], level: 'intermediate', accentTheme: 'green' };
function startOnboarding() { 
  document.getElementById('onboarding').style.setProperty('display', 'flex', 'important'); 
  generatePatternSetup(4); 
  generateOnboardColorPicker(); 
  showOnboardStep(1); 
}
function showOnboardStep(n) { document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active')); document.getElementById('onboard-' + n).classList.add('active'); }

function generatePatternSetup(len) {
  const container = document.getElementById('ob-pattern-slots-container'); container.innerHTML = '';
  for (let i = 0; i < parseInt(len); i++) {
    let dVal = 'rest'; if (i===0) dVal='push'; if (i===1) dVal='pull'; if (i===2) dVal='legs';
    container.innerHTML += `
      <div class="field">
        <label>Slot #${i + 1}</label>
        <select class="ob-pattern-slot-select" data-index="${i}">
          <option value="push" ${dVal==='push'?'selected':''}>Push</option>
          <option value="pull" ${dVal==='pull'?'selected':''}>Pull</option>
          <option value="legs" ${dVal==='legs'?'selected':''}>Legs</option>
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
    document.getElementById('onboarding').style.setProperty('display', 'none', 'important');
    refreshAppStateLabels(); renderWorkoutScreen(); return;
  }
  showOnboardStep(n + 1);
}

function renderWorkoutScreen() {
  const type = getTodayType();
  if (document.getElementById('active-workout').style.display === 'flex') return;
  const container = document.getElementById('workout-ready-content');
  if (getWorkouts().some(w => w.date?.startsWith(new Date().toISOString().split('T')[0]))) {
    container.innerHTML = `<h2>Done for today</h2><button class="btn btn-secondary" onclick="forceStartWorkout('${type}')">Train Again</button>`;
    return;
  }
  if (type === 'rest') {
    container.innerHTML = `<h2>Rest Day</h2>
      <button class="btn btn-ghost" onclick="forceStartWorkout('push')">Push</button>
      <button class="btn btn-ghost" onclick="forceStartWorkout('pull')">Pull</button>
      <button class="btn btn-ghost" onclick="forceStartWorkout('legs')">Legs</button>`;
    return;
  }
  container.innerHTML = `<div class="workout-day-badge">${type.toUpperCase()}</div><button class="btn btn-accent" onclick="startWorkout('${type}')">Start Workout</button>`;
}

function forceStartWorkout(type) { startWorkout(type); }

function startWorkout(type) {
  const plan = buildWorkout(type);
  if (!plan.length) { alert('No exercises configured.'); return; }

  UI.workout = {
    type,
    date: new Date().toISOString(),
    startTime: Date.now(),
    exercises: plan,
    exIndex: 0,
    setIndex: 0,
    setData: plan.map(ex => Array.from({length: ex.suggestedSets}, () => ({ weight: ex.suggestedWeight, reps: ex.suggestedReps, done: false }))),
    completedExercises: [],
    totalVolume: 0,
    setTimestamps: plan.map(ex => ({ startTime: Date.now(), durations: [], restDurations: [] }))
  };

  document.getElementById('workout-ready').style.display = 'none';
  document.getElementById('active-workout').style.setProperty('display', 'flex', 'important');
  UI.workout.timerInterval = setInterval(updateWorkoutTimer, 1000);
  
  document.getElementById('aw-submit-set-btn').onclick = () => submitFocusedActiveSet();
  UI.workout.setTimestamps[0].startTime = Date.now(); 

  renderActiveExercise();
}

function updateWorkoutTimer() {
  if (!UI.workout) return;
  const elapsed = Math.floor((Date.now() - UI.workout.startTime) / 1000);
  document.getElementById('workout-timer').textContent = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('workout-volume').textContent = UI.workout.totalVolume.toLocaleString();
}

function populateSwapExerciseDropdown(type) {
  const select = document.getElementById('aw-swap-exercise-select'); select.innerHTML = '';
  const currentEx = UI.workout.exercises[UI.workout.exIndex];
  
  const activeOpt = document.createElement('option'); activeOpt.value = currentEx.id || currentEx.name; activeOpt.textContent = currentEx.name; activeOpt.selected = true; select.appendChild(activeOpt);

  const customs = DB.get('customWorkouts') || {};
  const pool = (customs[type] && customs[type].length > 0) ? customs[type] : LIBRARY[type];
  
  pool.forEach(ex => {
    if (ex.name !== currentEx.name) {
      const opt = document.createElement('option'); opt.value = ex.id || ex.name; opt.textContent = ex.name; select.appendChild(opt);
    }
  });
}

function swapActiveExerciseRuntime(targetIdOrName) {
  const w = UI.workout; const customs = DB.get('customWorkouts') || {};
  const pool = (customs[w.type] && customs[w.type].length > 0) ? customs[w.type] : LIBRARY[w.type];
  const found = pool.find(e => (e.id === targetIdOrName || e.name === targetIdOrName));
  if (!found) return;
  
  const updatedEx = withSuggestion(found);
  w.exercises[w.exIndex] = updatedEx;
  w.setData[w.exIndex] = Array.from({length: updatedEx.suggestedSets}, () => ({ weight: updatedEx.suggestedWeight, reps: updatedEx.suggestedReps, done: false }));
  w.setTimestamps[w.exIndex] = { startTime: Date.now(), durations: [], restDurations: [] };
  w.setIndex = 0;
  renderActiveExercise();
}

function renderActiveExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex];
  let activeSetIdx = sets.findIndex(s => !s.done); if (activeSetIdx === -1) activeSetIdx = sets.length - 1; w.setIndex = activeSetIdx;

  document.getElementById('aw-type').textContent = w.type;
  document.getElementById('aw-progress').textContent = `${w.exIndex + 1} / ${w.exercises.length}`;
  document.getElementById('aw-ex-muscles').textContent = (ex.muscles || []).map(m => MUSCLE_LABELS[m] || m).filter((v,i,a)=>a.indexOf(v)===i).join(' · ');
  document.getElementById('aw-pr-badge').style.display = ex.isPR ? 'inline-flex' : 'none';

  populateSwapExerciseDropdown(w.type);

  const dashContainer = document.getElementById('aw-dash-container'); dashContainer.innerHTML = '';
  sets.forEach((s, i) => {
    const dash = document.createElement('div'); dash.className = `set-dash ${s.done ? 'completed' : (i===activeSetIdx ? 'current' : '')}`; dashContainer.appendChild(dash);
  });

  document.getElementById('aw-focus-title').textContent = `Set ${activeSetIdx + 1}`;
  const inputWeight = document.getElementById('focus-weight'); const inputReps = document.getElementById('focus-reps');
  inputWeight.value = sets[activeSetIdx].weight; inputReps.value = sets[activeSetIdx].reps;

  if (sets[activeSetIdx].done) { inputWeight.setAttribute('disabled','true'); inputReps.setAttribute('disabled','true'); }
  else { inputWeight.removeAttribute('disabled'); inputReps.removeAttribute('disabled'); }

  const collapseTarget = document.getElementById('collapse-target'); collapseTarget.innerHTML = '';
  sets.forEach((s, idx) => {
    collapseTarget.innerHTML += `<div class="mini-set-row ${s.done?'done':''}"><span>Set ${idx + 1}</span><span>${s.weight} ${getSettings().weightUnit} × ${s.reps}</span></div>`;
  });

  const trigger = document.getElementById('collapse-trigger');
  if (UI.isSetViewCollapsed) { trigger.classList.remove('open'); collapseTarget.classList.remove('open'); }
  else { trigger.classList.add('open'); collapseTarget.classList.add('open'); }

  document.getElementById('aw-completed-list').innerHTML = w.completedExercises.map(ce => `
    <div class="completed-ex"><div class="completed-info"><div class="completed-name">${ce.name}</div><div class="completed-meta">${ce.sets.length} sets done</div></div></div>`).join('');
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

  sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0;
  sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  sets[si].done = true;

  const setDurationSeconds = Math.floor((Date.now() - timeLog.startTime) / 1000);
  timeLog.durations.push(setDurationSeconds);
  w.totalVolume += (sets[si].weight * sets[si].reps);
  const allDone = sets.every(s => s.done);

  UI.setRestMarkerStart = Date.now();

  if (allDone) {
    const isLastEx = w.exIndex >= w.exercises.length - 1;
    showRestScreen('exercise', isLastEx ? null : w.exercises[w.exIndex + 1].name, () => {
      commitCurrentExercise();
      if (isLastEx) { finishWorkout(); } 
      else { w.exIndex++; w.setIndex = 0; timeLog.startTime = Date.now(); renderActiveExercise(); }
    });
  } else {
    showRestScreen('set', null, () => {
      w.setIndex++; timeLog.startTime = Date.now(); renderActiveExercise();
    });
  }
}

function commitCurrentExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex].filter(s => s.done);
  if (!sets.length || w.completedExercises.some(c => c.id === ex.id)) return;
  const timeLog = w.setTimestamps[w.exIndex];

  w.completedExercises.push({
    id: ex.id, name: ex.name, muscles: ex.muscles, sets: sets.map((s, idx) => ({
      weight: s.weight, reps: s.reps, duration: timeLog.durations[idx] || 0, restBefore: timeLog.restDurations[idx] || 0
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
  saveWorkout(saved); UI.workout = null;
  document.getElementById('active-workout').style.setProperty('display', 'none', 'important');
  document.getElementById('workout-ready').style.display = 'flex';
  renderWorkoutScreen();
}

function showRestScreen(type, nextExName, onDone) {
  const s = getSettings(); const duration = type === 'exercise' ? s.exerciseRestSeconds : s.setRestSeconds;
  UI.restDurationTotal = duration; UI.restTimeRemaining = duration; UI.restOnDoneCallback = onDone;

  const overlay = document.getElementById('rest-overlay');
  document.getElementById('rest-overlay-type').textContent = type === 'exercise' ? 'Exercise Rest' : 'Set Rest';
  document.getElementById('rest-overlay-label').textContent = 'Resting';
  document.getElementById('rest-overlay-next').innerHTML = nextExName ? `Next: <strong>${nextExName}</strong>` : '';

  updateRestOverlayDisplay(); overlay.classList.add('show'); clearRestTimer();

  UI.restTimer = setInterval(() => {
    UI.restTimeRemaining--; updateRestOverlayDisplay();
    if (UI.restTimeRemaining <= 0) { triggerRestEndExecution(); }
  }, 1000);
  document.getElementById('rest-skip-trigger').onclick = () => triggerRestEndExecution();
}

function updateRestOverlayDisplay() {
  const circ = 2 * Math.PI * 90; const fill = document.getElementById('rest-ring-circle');
  const frac = Math.max(0, UI.restTimeRemaining) / UI.restDurationTotal;
  fill.style.strokeDasharray = circ; fill.style.strokeDashoffset = circ * (1 - frac);
  document.getElementById('rest-time-sec').textContent = Math.max(0, UI.restTimeRemaining);
}

// Fixed core countdown adjustments arithmetic variables cleanly
function snoozeRestTimer(seconds) { UI.restTimeRemaining += seconds; UI.restDurationTotal += seconds; updateRestOverlayDisplay(); }

function triggerRestEndExecution() {
  clearRestTimer(); document.getElementById('rest-overlay').classList.remove('show');
  if (UI.workout) {
    const totalRestTaken = Math.floor((Date.now() - UI.setRestMarkerStart) / 1000);
    const timeLog = UI.workout.setTimestamps[UI.workout.exIndex];
    if (timeLog) { timeLog.restDurations.push(totalRestTaken); }
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
    if (comp) { cell.classList.add('has-workout'); cell.onclick = () => showWorkoutDetail(comp); }
    else if (dayStr > todayStr && schedType !== 'rest') {
      cell.classList.add('scheduled'); const dot = document.createElement('div'); dot.className = 'cal-day-dot';
      dot.style.background = {push:'var(--red)', pull:'var(--blue)', legs:'var(--green)'}[schedType] || 'transparent';
      cell.appendChild(dot);
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
  const wDates = workouts.map(w => w.date.split('T')[0]);
  let activeChain = true; let loopLimit = 0;

  while (activeChain && loopLimit < 365) {
    const cStr = check.toISOString().split('T')[0]; const sType = getPPLType(cStr);
    if (wDates.includes(cStr)) { streak++; } 
    else if (sType === 'rest') { if (cStr !== new Date().toISOString().split('T')[0]) streak++; } 
    else { if (cStr !== new Date().toISOString().split('T')[0]) activeChain = false; }
    check.setDate(check.getDate() - 1); loopLimit++;
  }
  document.getElementById('stat-streak').textContent = streak;
  renderVolChart();
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

function showWorkoutDetail(w) {
  const d = new Date(w.date); const unit = getSettings().weightUnit;
  const rows = (w.exercises || []).map(ex => {
    const setPills = (ex.sets || []).map((s, idx) => `
      <div class="history-set-pill">
        <span style="font-weight:700; color:var(--text)">Set ${idx+1}</span>
        <span>${s.weight}${unit} × ${s.reps}</span>
        <span style="font-size:11px; color:var(--text3);">Time: ${s.duration || 0}s | Rest: ${s.restBefore || 0}s</span>
      </div>`).join('');
    return `<div class="history-ex-item"><div class="history-ex-name">${ex.name}</div><div class="history-sets-grid">${setPills}</div></div>`;
  }).join('');

  showModal(`
    <div style="font-size:18px; font-weight:800;">${d.toLocaleDateString('en-US',{weekday:'long', month:'short', day:'numeric'})}</div>
    <div style="color:var(--text2); font-size:13px; text-transform:uppercase; font-weight:700; margin-top:2px;">${w.type} · ${(w.totalVolume||0).toLocaleString()} ${unit}</div>
    <div style="margin-top:8px; max-height:45vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">${rows}</div>
    <button class="btn btn-secondary" style="margin-top:8px;" onclick="closeModal()">Close</button>`);
}

function renderMuscleMap() {
  const freq = getMusclesWorked(UI.musclePeriod); const maxFreq = Math.max(...Object.values(freq), 1);
  document.getElementById('muscle-diagram').innerHTML = UI.muscleView === 'front' ? frontBodySVG(freq, maxFreq) : backBodySVG(freq, maxFreq);

  const leg = document.getElementById('muscle-legend'); const shown = new Set(); const items = [];
  Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([id, count]) => {
    const lbl = MUSCLE_LABELS[id]; if (lbl && !shown.has(lbl)) { shown.add(lbl); items.push({lbl, count, color: MUSCLE_COLOR[lbl]||'#888'}); }
  });
  leg.innerHTML = items.map(({lbl,count,color}) => `
    <div class="muscle-pill" style="background:${color}15; border:1px solid ${color}40"><div class="muscle-pill-dot" style="background:${color}"></div><span style="color:${color}; font-weight:700;">${lbl} (${count})</span></div>`).join('');

  const bd = document.getElementById('muscle-breakdown'); if (!items.length) { bd.innerHTML = ''; return; }
  bd.innerHTML = `<div class="card"><div class="section-label" style="margin-bottom:12px;">Frequency</div>` +
    items.slice(0,6).map(({lbl,count,color}) => `<div style="margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;"><span>${lbl}</span><span>${count}</span></div><div style="height:6px; background:var(--bg4); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${window.isNaN(count/maxFreq)?0:Math.round(count/maxFreq*100)}%; background:${color};"></div></div></div>`).join('') + '</div>';
}

function muscleOpacity(freq, maxFreq, ids) { const t = ids.reduce((a,id)=>a+(freq[id]||0), 0); return t === 0 ? 0.08 : 0.25 + 0.75 * (t / (ids.length * maxFreq)); }
function mColor(ids) { return MUSCLE_COLOR[MUSCLE_LABELS[ids[0]]] || '#333'; }

function frontBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids); const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,14 c0,-6 12,-6 12,0 c0,5 -3,7 -6,9 c-3,-2 -6,-4 -6,-9 z" fill="#1e1e1e"/>
      <path d="M46,23 l8,0 l-2,5 l-4,0 z" fill="#2a2a2a"/>
      <path id="chest_l" d="M49,30 c-3,0 -8,1 -12,4 c-1,4 -1,13 1,18 c4,0 9,-1 11,-4 z" fill="${c(['chest'])}" opacity="${op(['chest'])}"/>
      <path id="chest_r" d="M51,30 c3,0 8,1 12,4 c1,4 1,13 -1,18 c-4,0 -9,-1 -11,-4 z" fill="${c(['chest'])}" opacity="${op(['chest'])}"/>
      <path id="deltoids_l" d="M36,33 c-2,2 -4,6 -5,11 c2,3 5,4 7,1 c1,-4 0,-9 -2,-12 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="deltoids_r" d="M64,33 c2,2 4,6 5,11 c-2,3 -5,4 -7,1 c-1,-4 0,-9 2,-12 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="biceps_l" d="M30,47 c-1,4 -1,11 1,15 c2,0 3,-4 3,-8 c0,-3 -1,-6 -4,-7 z" fill="${c(['biceps'])}" opacity="${op(['biceps'])}"/>
      <path id="biceps_r" d="M70,47 c1,4 1,11 -1,15 c-2,0 -3,-4 -3,-8 c0,-3 1,-6 4,-7 z" fill="${c(['biceps'])}" opacity="${op(['biceps'])}"/>
      <path id="forearms_l" d="M29,65 c-1,5 -3,13 0,19 c2,0 3,-6 3,-12 c0,-3 -1,-5 -3,-7 z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>
      <path id="forearms_r" d="M71,65 c1,5 3,13 0,19 c-2,0 -3,-6 -3,-12 c0,-3 1,-5 3,-7 z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>
      <path id="abs" d="M42,50 l16,0 l-2,28 l-12,0 z" fill="${c(['abs'])}" opacity="${op(['abs'])}"/>
      <path id="obliques_l" d="M39,51 l3,0 l-2,27 l-4,-21 z" fill="${c(['obliques'])}" opacity="${op(['obliques'])}"/>
      <path id="obliques_r" d="M61,51 l-3,0 l2,27 l4,-21 z" fill="${c(['obliques'])}" opacity="${op(['obliques'])}"/>
      <path id="quadriceps_l" d="M36,84 l13,0 l-3,42 l-11,-35 z" fill="${c(['quadriceps'])}" opacity="${op(['quadriceps'])}"/>
      <path id="quadriceps_r" d="M64,84 l-13,0 l3,42 l11,-35 z" fill="${c(['quadriceps'])}" opacity="${op(['quadriceps'])}"/>
      <path id="calves_l" d="M37,134 l10,2 l-3,38 l-6,-32 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
      <path id="calves_r" d="M63,134 l-10,2 l3,38 l6,-32 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
    </svg>`;
}

function backBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids); const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,14 c0,-6 12,-6 12,0 c0,5 -3,7 -6,9 c-3,-2 -6,-4 -6,-9 z" fill="#1e1e1e"/>
      <path id="trapezius" d="M50,23 l10,8 l-4,14 l-12,0 l-4,-14 z" fill="${c(['trapezius'])}" opacity="${op(['trapezius'])}"/>
      <path id="deltoids_l" d="M35,32 c-2,2 -4,6 -4,11 c2,1 5,0 6,-3 c0,-3 -1,-6 -2,-8 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="deltoids_r" d="M65,32 c2,2 4,6 4,11 c-2,1 -5,0 -6,-3 c0,-3 1,-6 2,-8 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="lats_l" d="M41,48 c-4,4 -6,14 -4,22 l12,-16 z" fill="${c(['lats'])}" opacity="${op(['lats'])}"/>
      <path id="lats_r" d="M59,48 c4,4 6,14 4,22 l-12,-16 z" fill="${c(['lats'])}" opacity="${op(['lats'])}"/>
      <path id="triceps_l" d="M29,46 c-1,4 0,11 2,14 c1,-3 1,-8 0,-11 c-1,-1 -1,-2 -2,-3 z" fill="${c(['triceps'])}" opacity="${op(['triceps'])}"/>
      <path id="triceps_r" d="M71,46 c1,4 0,11 -2,14 c-1,-3 -1,-8 0,-11 c1,-1 1,-2 2,-3 z" fill="${c(['triceps'])}" opacity="${op(['triceps'])}"/>
      <path id="gluteal_l" d="M37,82 c0,-4 12,-4 12,0 c0,12 -12,12 -12,0 z" fill="${c(['gluteal'])}" opacity="${op(['gluteal'])}"/>
      <path id="gluteal_r" d="M63,82 c0,-4 -12,-4 -12,0 c0,12 12,12 12,0 z" fill="${c(['gluteal'])}" opacity="${op(['gluteal'])}"/>
      <path id="hamstrings_l" d="M36,89 l13,2 l-4,40 l-9,-36 z" fill="${c(['hamstrings'])}" opacity="${op(['hamstrings'])}"/>
      <path id="hamstrings_r" d="M64,89 l-13,2 l4,40 l9,-36 z" fill="${c(['hamstrings'])}" opacity="${op(['hamstrings'])}"/>
      <path id="calves_l" d="M37,135 l9,1 l-2,36 l-7,-31 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
      <path id="calves_r" d="M63,135 l-9,1 l2,36 l7,-31 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
    </svg>`;
}

function setMuscleView(v) { UI.muscleView = v; document.querySelectorAll('.muscle-tab').forEach(t=>t.classList.remove('active')); document.getElementById('mtab-'+v).classList.add('active'); renderMuscleMap(); }
function setMusclePeriod(p) { UI.musclePeriod = p; document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active')); document.getElementById('ptab-'+p).classList.add('active'); renderMuscleMap(); }

function renderSettings() {
  const s = getSettings();
  document.getElementById('settings-content').innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Schedule</div>
      <div class="settings-row" onclick="editSetting('pattern')"><div class="settings-row-left"><div class="settings-row-label">Rotation Loop</div><div class="settings-row-value">${s.pattern.join(' → ')}</div></div></div>
      <div class="settings-row" onclick="editSetting('blocked')"><div class="settings-row-left"><div class="settings-row-label">Blocked Days</div><div class="settings-row-value">${s.blockedWeekdays.length?s.blockedWeekdays.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', '):'None'}</div></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Preferences</div>
      <div class="settings-row" onclick="editSetting('unit')"><div class="settings-row-left"><div class="settings-row-label">Weight Unit</div><div class="settings-row-value">${s.weightUnit}</div></div></div>
      <div class="settings-row" onclick="editSetting('color')"><div class="settings-row-left"><div class="settings-row-label">Theme Color</div><div class="settings-row-value" style="color:var(--accent); font-weight:700;">${s.accentTheme}</div></div></div>
      <div class="settings-row" onclick="editSetting('timers')"><div class="settings-row-left"><div class="settings-row-label">Rest Timers</div><div class="settings-row-value">Sets: ${s.setRestSeconds}s · Exercises: ${s.exerciseRestSeconds}s</div></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Customize Routine Programs</div>
      <div class="settings-row" onclick="openCustomWorkoutEditorModal('push')"><div class="settings-row-left"><div class="settings-row-label">Edit Push Routine</div><div class="settings-row-value">Modify exercises, sets, and rep suggestions</div></div></div>
      <div class="settings-row" onclick="openCustomWorkoutEditorModal('pull')"><div class="settings-row-left"><div class="settings-row-label">Edit Pull Routine</div><div class="settings-row-value">Modify exercises, sets, and rep suggestions</div></div></div>
      <div class="settings-row" onclick="openCustomWorkoutEditorModal('legs')"><div class="settings-row-left"><div class="settings-row-label">Edit Legs Routine</div><div class="settings-row-value">Modify exercises, sets, and rep suggestions</div></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Data</div>
      <div class="settings-row" onclick="resetData()"><div class="settings-row-left"><div class="settings-row-label" style="color:var(--red);">Reset All Data</div></div></div>
    </div>`;
}

// Adjusted layout selectors to display: flex explicitly on active triggers
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
  } else if (key === 'pattern') {
    showModal(`<div class="modal-title">Loop Sequence</div><div class="field"><select id="edit-pattern-len" onchange="adjustSettingsPatternSlots(this.value)">${[3,4,5,6,7,8].map(n=>`<option value="${n}" ${s.pattern.length===n?'selected':''}>${n} Days</option>`).join('')}</select></div><div id="settings-slots-editor-wrap" style="display:flex; flex-direction:column; gap:8px;"></div><button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsPatternMatrix()">Save</button>`);
    adjustSettingsPatternSlots(s.pattern.length);
  }
}

function adjustSettingsPatternSlots(len) {
  const wrap = document.getElementById('settings-slots-editor-wrap'); wrap.innerHTML = ''; const s = getSettings();
  for (let i = 0; i < parseInt(len); i++) {
    const val = s.pattern[i] || 'rest';
    wrap.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg3); padding:6px; border-radius:6px;">
        <span>Slot #${i+1}</span>
        <select class="settings-slot-select" style="width:120px; padding:4px;" data-index="${i}">
          <option value="push" ${val==='push'?'selected':''}>Push</option>
          <option value="pull" ${val==='pull'?'selected':''}>Pull</option>
          <option value="legs" ${val==='legs'?'selected':''}>Legs</option>
          <option value="rest" ${val==='rest'?'selected':''}>Rest</option>
        </select>
      </div>`;
  }
}

function saveSettingsThemeColor() { const dot = document.querySelector('#settings-color-grid .color-dot.selected'); if(dot){ const s=getSettings(); s.accentTheme=dot.dataset.color; saveSettings(s); closeModal(); renderSettings(); } }
function saveSettingsTimers() { const s = getSettings(); s.setRestSeconds = parseInt(document.getElementById('edit-set-rest').value)||90; s.exerciseRestSeconds = parseInt(document.getElementById('edit-ex-rest').value)||180; saveSettings(s); closeModal(); renderSettings(); }
function saveSettingsUnit() { const s = getSettings(); s.weightUnit = document.getElementById('edit-global-unit').value; saveSettings(s); closeModal(); renderSettings(); refreshAppStateLabels(); }
function saveSettingsBlockedDays() { const s = getSettings(); s.blockedWeekdays = [...document.querySelectorAll('.settings-block-chip.selected')].map(c=>parseInt(c.dataset.day)); saveSettings(s); closeModal(); renderSettings(); renderCalendar(); }
function saveSettingsPatternMatrix() { const s = getSettings(); const arr = []; document.querySelectorAll('.settings-slot-select').forEach(sel=>arr.push(sel.value)); s.pattern = arr; saveSettings(s); closeModal(); renderSettings(); renderCalendar(); renderWorkoutScreen(); }

function openCustomWorkoutEditorModal(type) {
  const customs = DB.get('customWorkouts') || {};
  if (!customs[type] || customs[type].length === 0) { customs[type] = JSON.parse(JSON.stringify(LIBRARY[type])); }

  showModal(`
    <div class="modal-title" style="text-transform:uppercase;">Custom ${type} Plan</div>
    <div id="custom-workout-builder-list" style="display:flex; flex-direction:column; gap:10px; margin:8px 0; max-height:50vh; overflow-y:auto; padding-right:4px;"></div>
    <button class="btn btn-secondary btn-sm" onclick="addNewBlankExerciseRowToCustomEditor('${type}')">+ Create Custom Exercise Entry</button>
    <div style="display:flex; gap:10px; margin-top:8px;">
      <button class="btn btn-ghost" onclick="resetCustomWorkoutToLibraryDefaults('${type}')" style="flex:1;">Reset</button>
      <button class="btn btn-accent" onclick="saveCustomWorkoutBuilderRows('${type}')" style="flex:1;">Save</button>
    </div>`);
  renderCustomWorkoutBuilderRows(customs[type]);
}

function renderCustomWorkoutBuilderRows(exerciseArray) {
  const container = document.getElementById('custom-workout-builder-list'); container.innerHTML = '';
  exerciseArray.forEach((ex, idx) => {
    const row = document.createElement('div'); row.className = 'custom-workout-row';
    const setsVal = ex.sets || 3; const repMin = ex.reps ? ex.reps[0] : 8; const suggestedW = ex.suggestedWeight || 100;
    row.innerHTML = `
      <div class="custom-workout-row-header">
        <input type="text" class="custom-ex-name-input" value="${ex.name}" placeholder="Exercise Name" style="font-weight:700; padding:6px; font-size:14px; width:80%;">
        <button class="btn btn-danger btn-sm" onclick="deleteCustomExerciseRowFromBuilder(${idx})" style="padding:4px 8px; font-size:11px; width:auto; border:none;">X</button>
      </div>
      <div class="custom-workout-grid-inputs">
        <div><span style="font-size:10px; color:var(--text2); text-align:center; display:block;">SETS</span><input type="number" class="custom-ex-sets-input" value="${setsVal}"></div>
        <div><span style="font-size:10px; color:var(--text2); text-align:center; display:block;">REPS</span><input type="number" class="custom-ex-reps-input" value="${repMin}"></div>
        <div><span style="font-size:10px; color:var(--text2); text-align:center; display:block;">WT</span><input type="number" class="custom-ex-weight-input" value="${suggestedW}"></div>
      </div>`;
    container.appendChild(row);
  });
}

function addNewBlankExerciseRowToCustomEditor(type) {
  const rows = gatherCustomWorkoutBuilderRowsData();
  rows.push({ name: '', muscles: ['core'], equipment: ['barbell','dumbbells','cables','machines'], sets: 3, reps: [10, 12], suggestedWeight: 45 });
  renderCustomWorkoutBuilderRows(rows);
}

function deleteCustomExerciseRowFromBuilder(index) { const rows = gatherCustomWorkoutBuilderRowsData(); rows.splice(index, 1); renderCustomWorkoutBuilderRows(rows); }

function gatherCustomWorkoutBuilderRowsData() {
  const cards = document.querySelectorAll('.custom-workout-row'); const arr = [];
  cards.forEach(card => {
    const name = card.querySelector('.custom-ex-name-input').value.trim();
    const sets = parseInt(card.querySelector('.custom-ex-sets-input').value) || 3;
    const repMin = parseInt(card.querySelector('.custom-ex-reps-input').value) || 10;
    const weight = parseFloat(card.querySelector('.custom-ex-weight-input').value) || 0;
    arr.push({ id: 'custom_' + Math.random().toString(36).substr(2, 9), name: name || 'Custom Exercise', muscles: ['core'], equipment: ['barbell','dumbbells','cables','machines'], sets: sets, reps: [repMin, repMin + 2], suggestedWeight: weight });
  });
  return arr;
}

function saveCustomWorkoutBuilderRows(type) { const data = gatherCustomWorkoutBuilderRowsData(); const customs = DB.get('customWorkouts') || {}; customs[type] = data; DB.set('customWorkouts', customs); closeModal(); renderSettings(); renderWorkoutScreen(); }
function resetCustomWorkoutToLibraryDefaults(type) { if (!confirm('Reset plan back to initial template default configurations?')) return; const customs = DB.get('customWorkouts') || {}; customs[type] = []; DB.set('customWorkouts', customs); closeModal(); renderSettings(); renderWorkoutScreen(); }

function showModal(html) { 
  document.getElementById('modal-body').innerHTML = html; 
  document.getElementById('modal-overlay').style.setProperty('display', 'flex', 'important'); 
}
function closeModal() { 
  document.getElementById('modal-overlay').style.setProperty('display', 'none', 'important'); 
}
function resetData() { if (confirm('Purge logs?')) { ['workouts','settings','customWorkouts'].forEach(k => DB.del(k)); location.reload(); } }

function refreshAppStateLabels() {
  const s = getSettings(); document.querySelectorAll('.global-unit-label').forEach(n => n.textContent = s.weightUnit);
  const label = document.getElementById('today-label');
  if (label) {
    const mappings = {push:'Push Day', pull:'Pull Day', legs:'Leg Day', rest:'Rest Day'};
    label.textContent = new Date().toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'}) + " · " + (mappings[getTodayType()]||'');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyAccentTheme();
  // Double-verify layout displays start off strictly un-rendered during initial boot sequences
  document.getElementById('modal-overlay').style.setProperty('display', 'none', 'important');
  document.getElementById('active-workout').style.setProperty('display', 'none', 'important');

  if (!DB.get('settings')) { startOnboarding(); } 
  else { refreshAppStateLabels(); renderWorkoutScreen(); showScreen('workout'); }
});// ═══════════════════════════════════════════════════════════════════
// WORKOUT TRACKER — APPMATRIX CONTROLLER ENGINE WITH VULOVIX VECTORS
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

const MUSCLE_LABELS = {
  chest: 'Chest', lats: 'Lats', deltoids: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', trapezius: 'Traps', obliques: 'Core', abs: 'Core', quadriceps: 'Quads', hamstrings: 'Hamstrings', gluteal: 'Glutes', calves: 'Calves', forearms: 'Forearms'
};

const MUSCLE_COLOR = {
  'Chest':'#ff6b6b','Lats':'#4d9fff','Shoulders':'#ffa94d','Biceps':'#3ddc84','Triceps':'#cc44ff','Traps':'#74c0fc','Quads':'#ffe066','Hamstrings':'#63e6be','Glutes':'#ff8c42','Calves':'#a9e34b','Core':'#748ffc','Forearms':'#e599f7'
};

const LIBRARY = {
  push: [
    { id:'bench_press',      name:'Bench Press',         muscles:['chest'],             equipment:['barbell'],            sets:4, reps:[6,8] },
    { id:'incline_bench',    name:'Incline Bench Press', muscles:['chest','deltoids'],  equipment:['barbell'],       sets:4, reps:[8,10] },
    { id:'ohp',              name:'Overhead Press',      muscles:['deltoids','triceps'], equipment:['barbell'], sets:4, reps:[6,8] },
    { id:'db_shoulder_press',name:'DB Shoulder Press',   muscles:['deltoids'],          equipment:['dumbbells'], sets:3, reps:[10,12] },
    { id:'lateral_raise',    name:'Lateral Raise',       muscles:['deltoids'],          equipment:['dumbbells','cables'],  sets:4, reps:[12,15] },
    { id:'tricep_pushdown',  name:'Tricep Pushdown',     muscles:['triceps'],           equipment:['cables'],              sets:3, reps:[10,12] }
  ],
  pull: [
    { id:'deadlift',         name:'Deadlift',            muscles:['trapezius','gluteal','hamstrings'], equipment:['barbell'], sets:4, reps:[4,6] },
    { id:'pullup',           name:'Pull-Up',             muscles:['lats','biceps'],     equipment:['barbell','dumbbells','cables','machines'], sets:4, reps:[6,10] },
    { id:'bent_row',         name:'Bent Over Row',       muscles:['lats','trapezius','biceps'], equipment:['barbell'], sets:4, reps:[6,8] },
    { id:'lat_pulldown',     name:'Lat Pulldown',        muscles:['lats','biceps'],     equipment:['cables','machines'],   sets:4, reps:[10,12] },
    { id:'barbell_curl',     name:'Barbell Curl',        muscles:['biceps'],            equipment:['barbell'],             sets:3, reps:[10,12] }
  ],
  legs: [
    { id:'squat',            name:'Squat',               muscles:['quadriceps','gluteal'], equipment:['barbell'],             sets:4, reps:[5,8] },
    { id:'rdl',              name:'Romanian Deadlift',   muscles:['hamstrings','gluteal'], equipment:['barbell','dumbbells'], sets:3, reps:[8,10] },
    { id:'leg_press',        name:'Leg Press',           muscles:['quadriceps','gluteal'], equipment:['machines'],            sets:4, reps:[10,12] },
    { id:'calf_raise',       name:'Calf Raise',          muscles:['calves'],            equipment:['barbell','dumbbells','machines','cables'], sets:4, reps:[12,15] }
  ]
};

function getSettings() { return { ...DEFAULT_SETTINGS, ...(DB.get('settings') || {}) }; }
function saveSettings(s) { DB.set('settings', s); applyAccentTheme(); }

function applyAccentTheme() {
  const s = getSettings();
  const theme = ACCENT_PALETTE[s.accentTheme || 'green'] || ACCENT_PALETTE.green;
  const r = document.documentElement;
  r.style.setProperty('--accent', theme.primary);
  r.style.setProperty('--accent-dim', theme.dim);
  r.style.setProperty('--accent-transparent', theme.trans);
}

function getPPLType(dateStr) {
  const s = getSettings();
  const loopPattern = s.pattern || ['push', 'pull', 'legs', 'rest'];
  const blocks = s.blockedWeekdays || []; 
  const targetDate = new Date(dateStr + 'T12:00:00');
  if (blocks.includes(targetDate.getDay())) return 'rest';

  let baseDate = new Date(s.startDate + 'T12:00:00');
  let iter = new Date(baseDate);
  let patternIdx = 0;

  if (iter.getTime() <= targetDate.getTime()) {
    while (iter.getTime() < targetDate.getTime()) {
      if (!blocks.includes(iter.getDay())) {
        patternIdx = (patternIdx + 1) % loopPattern.length;
      }
      iter.setDate(iter.getDate() + 1);
    }
    if (blocks.includes(iter.getDay())) return 'rest';
    return loopPattern[patternIdx];
  } else {
    while (iter.getTime() > targetDate.getTime()) {
      iter.setDate(iter.getDate() - 1);
      if (!blocks.includes(iter.getDay())) {
        patternIdx = (patternIdx - 1 + loopPattern.length) % loopPattern.length;
      }
    }
    if (blocks.includes(iter.getDay())) return 'rest';
    return loopPattern[patternIdx];
  }
}

function getTodayType() { return getPPLType(new Date().toISOString().split('T')[0]); }

function buildWorkout(type) {
  const customs = DB.get('customWorkouts') || {};
  if (customs[type] && customs[type].length > 0) {
    return customs[type].map(ex => withSuggestion(ex));
  }
  const s = getSettings();
  const eq = s.equipment || [];
  const pool = LIBRARY[type] ? LIBRARY[type].filter(ex => ex.equipment.some(e => eq.includes(e))) : [];
  return pool.slice(0, 5).map(ex => withSuggestion(ex));
}

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
    if (lastReps.every(r => r >= targetReps)) {
      suggestedWeight = lastWeight + step;
      isPR = true;
    } else {
      suggestedWeight = lastWeight;
    }
    suggestedSets = last.sets.length;
    suggestedReps = Math.round(lastReps.reduce((a,b)=>a+b,0)/lastReps.length);
  }
  return { ...ex, suggestedWeight, suggestedSets, suggestedReps, isPR };
}

function getDefaultWeight(ex, level, unit) {
  const mult = unit === 'kg' ? 0.45 : 1;
  const defaults = { bench_press:{beginner:95,intermediate:135,advanced:185}, squat:{beginner:95,intermediate:155,advanced:225} };
  const base = defaults[ex.id] ? defaults[ex.id][level || 'intermediate'] : 50;
  return Math.round((base * mult) / 5) * 5;
}

function getWorkouts() { return DB.get('workouts') || []; }
function saveWorkout(w) { const workouts = getWorkouts(); workouts.push(w); DB.set('workouts', workouts); }
function getExerciseHistory(idOrName) {
  return getWorkouts().flatMap(w => (w.exercises || []).filter(e => e.id === idOrName || e.name === idOrName).map(e => ({ ...e, date: w.date })));
}

let UI = {
  screen: 'workout',
  calMonth: new Date(),
  muscleView: 'front',
  musclePeriod: 'week',
  workout: null, 
  restTimer: null,
  restDurationTotal: 0, 
  restTimeRemaining: 0,
  isSetViewCollapsed: true 
};

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

let onboardData = { pattern: ['push','pull','legs','rest'], blockedWeekdays: [], equipment: ['barbell','dumbbells','cables','machines'], level: 'intermediate', accentTheme: 'green' };
function startOnboarding() { 
  document.getElementById('onboarding').style.setProperty('display', 'flex', 'important'); 
  generatePatternSetup(4); 
  generateOnboardColorPicker(); 
  showOnboardStep(1); 
}
function showOnboardStep(n) { document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active')); document.getElementById('onboard-' + n).classList.add('active'); }

function generatePatternSetup(len) {
  const container = document.getElementById('ob-pattern-slots-container'); container.innerHTML = '';
  for (let i = 0; i < parseInt(len); i++) {
    let dVal = 'rest'; if (i===0) dVal='push'; if (i===1) dVal='pull'; if (i===2) dVal='legs';
    container.innerHTML += `
      <div class="field">
        <label>Slot #${i + 1}</label>
        <select class="ob-pattern-slot-select" data-index="${i}">
          <option value="push" ${dVal==='push'?'selected':''}>Push</option>
          <option value="pull" ${dVal==='pull'?'selected':''}>Pull</option>
          <option value="legs" ${dVal==='legs'?'selected':''}>Legs</option>
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
    document.getElementById('onboarding').style.setProperty('display', 'none', 'important');
    refreshAppStateLabels(); renderWorkoutScreen(); return;
  }
  showOnboardStep(n + 1);
}

function renderWorkoutScreen() {
  const type = getTodayType();
  if (document.getElementById('active-workout').style.display === 'flex') return;
  const container = document.getElementById('workout-ready-content');
  if (getWorkouts().some(w => w.date?.startsWith(new Date().toISOString().split('T')[0]))) {
    container.innerHTML = `<h2>Done for today</h2><button class="btn btn-secondary" onclick="forceStartWorkout('${type}')">Train Again</button>`;
    return;
  }
  if (type === 'rest') {
    container.innerHTML = `<h2>Rest Day</h2>
      <button class="btn btn-ghost" onclick="forceStartWorkout('push')">Push</button>
      <button class="btn btn-ghost" onclick="forceStartWorkout('pull')">Pull</button>
      <button class="btn btn-ghost" onclick="forceStartWorkout('legs')">Legs</button>`;
    return;
  }
  container.innerHTML = `<div class="workout-day-badge">${type.toUpperCase()}</div><button class="btn btn-accent" onclick="startWorkout('${type}')">Start Workout</button>`;
}

function forceStartWorkout(type) { startWorkout(type); }

function startWorkout(type) {
  const plan = buildWorkout(type);
  if (!plan.length) { alert('No exercises configured.'); return; }

  UI.workout = {
    type,
    date: new Date().toISOString(),
    startTime: Date.now(),
    exercises: plan,
    exIndex: 0,
    setIndex: 0,
    setData: plan.map(ex => Array.from({length: ex.suggestedSets}, () => ({ weight: ex.suggestedWeight, reps: ex.suggestedReps, done: false }))),
    completedExercises: [],
    totalVolume: 0,
    setTimestamps: plan.map(ex => ({ startTime: Date.now(), durations: [], restDurations: [] }))
  };

  document.getElementById('workout-ready').style.display = 'none';
  document.getElementById('active-workout').style.setProperty('display', 'flex', 'important');
  UI.workout.timerInterval = setInterval(updateWorkoutTimer, 1000);
  
  document.getElementById('aw-submit-set-btn').onclick = () => submitFocusedActiveSet();
  UI.workout.setTimestamps[0].startTime = Date.now(); 

  renderActiveExercise();
}

function updateWorkoutTimer() {
  if (!UI.workout) return;
  const elapsed = Math.floor((Date.now() - UI.workout.startTime) / 1000);
  document.getElementById('workout-timer').textContent = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('workout-volume').textContent = UI.workout.totalVolume.toLocaleString();
}

function populateSwapExerciseDropdown(type) {
  const select = document.getElementById('aw-swap-exercise-select'); select.innerHTML = '';
  const currentEx = UI.workout.exercises[UI.workout.exIndex];
  
  const activeOpt = document.createElement('option'); activeOpt.value = currentEx.id || currentEx.name; activeOpt.textContent = currentEx.name; activeOpt.selected = true; select.appendChild(activeOpt);

  const customs = DB.get('customWorkouts') || {};
  const pool = (customs[type] && customs[type].length > 0) ? customs[type] : LIBRARY[type];
  
  pool.forEach(ex => {
    if (ex.name !== currentEx.name) {
      const opt = document.createElement('option'); opt.value = ex.id || ex.name; opt.textContent = ex.name; select.appendChild(opt);
    }
  });
}

function swapActiveExerciseRuntime(targetIdOrName) {
  const w = UI.workout; const customs = DB.get('customWorkouts') || {};
  const pool = (customs[w.type] && customs[w.type].length > 0) ? customs[w.type] : LIBRARY[w.type];
  const found = pool.find(e => (e.id === targetIdOrName || e.name === targetIdOrName));
  if (!found) return;
  
  const updatedEx = withSuggestion(found);
  w.exercises[w.exIndex] = updatedEx;
  w.setData[w.exIndex] = Array.from({length: updatedEx.suggestedSets}, () => ({ weight: updatedEx.suggestedWeight, reps: updatedEx.suggestedReps, done: false }));
  w.setTimestamps[w.exIndex] = { startTime: Date.now(), durations: [], restDurations: [] };
  w.setIndex = 0;
  renderActiveExercise();
}

function renderActiveExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex];
  let activeSetIdx = sets.findIndex(s => !s.done); if (activeSetIdx === -1) activeSetIdx = sets.length - 1; w.setIndex = activeSetIdx;

  document.getElementById('aw-type').textContent = w.type;
  document.getElementById('aw-progress').textContent = `${w.exIndex + 1} / ${w.exercises.length}`;
  document.getElementById('aw-ex-muscles').textContent = (ex.muscles || []).map(m => MUSCLE_LABELS[m] || m).filter((v,i,a)=>a.indexOf(v)===i).join(' · ');
  document.getElementById('aw-pr-badge').style.display = ex.isPR ? 'inline-flex' : 'none';

  populateSwapExerciseDropdown(w.type);

  const dashContainer = document.getElementById('aw-dash-container'); dashContainer.innerHTML = '';
  sets.forEach((s, i) => {
    const dash = document.createElement('div'); dash.className = `set-dash ${s.done ? 'completed' : (i===activeSetIdx ? 'current' : '')}`; dashContainer.appendChild(dash);
  });

  document.getElementById('aw-focus-title').textContent = `Set ${activeSetIdx + 1}`;
  const inputWeight = document.getElementById('focus-weight'); const inputReps = document.getElementById('focus-reps');
  inputWeight.value = sets[activeSetIdx].weight; inputReps.value = sets[activeSetIdx].reps;

  if (sets[activeSetIdx].done) { inputWeight.setAttribute('disabled','true'); inputReps.setAttribute('disabled','true'); }
  else { inputWeight.removeAttribute('disabled'); inputReps.removeAttribute('disabled'); }

  const collapseTarget = document.getElementById('collapse-target'); collapseTarget.innerHTML = '';
  sets.forEach((s, idx) => {
    collapseTarget.innerHTML += `<div class="mini-set-row ${s.done?'done':''}"><span>Set ${idx + 1}</span><span>${s.weight} ${getSettings().weightUnit} × ${s.reps}</span></div>`;
  });

  const trigger = document.getElementById('collapse-trigger');
  if (UI.isSetViewCollapsed) { trigger.classList.remove('open'); collapseTarget.classList.remove('open'); }
  else { trigger.classList.add('open'); collapseTarget.classList.add('open'); }

  document.getElementById('aw-completed-list').innerHTML = w.completedExercises.map(ce => `
    <div class="completed-ex"><div class="completed-info"><div class="completed-name">${ce.name}</div><div class="completed-meta">${ce.sets.length} sets done</div></div></div>`).join('');
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

  sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0;
  sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  sets[si].done = true;

  const setDurationSeconds = Math.floor((Date.now() - timeLog.startTime) / 1000);
  timeLog.durations.push(setDurationSeconds);
  w.totalVolume += (sets[si].weight * sets[si].reps);
  const allDone = sets.every(s => s.done);

  UI.setRestMarkerStart = Date.now();

  if (allDone) {
    const isLastEx = w.exIndex >= w.exercises.length - 1;
    showRestScreen('exercise', isLastEx ? null : w.exercises[w.exIndex + 1].name, () => {
      commitCurrentExercise();
      if (isLastEx) { finishWorkout(); } 
      else { w.exIndex++; w.setIndex = 0; timeLog.startTime = Date.now(); renderActiveExercise(); }
    });
  } else {
    showRestScreen('set', null, () => {
      w.setIndex++; timeLog.startTime = Date.now(); renderActiveExercise();
    });
  }
}

function commitCurrentExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex].filter(s => s.done);
  if (!sets.length || w.completedExercises.some(c => c.id === ex.id)) return;
  const timeLog = w.setTimestamps[w.exIndex];

  w.completedExercises.push({
    id: ex.id, name: ex.name, muscles: ex.muscles, sets: sets.map((s, idx) => ({
      weight: s.weight, reps: s.reps, duration: timeLog.durations[idx] || 0, restBefore: timeLog.restDurations[idx] || 0
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
  saveWorkout(saved); UI.workout = null;
  document.getElementById('active-workout').style.setProperty('display', 'none', 'important');
  document.getElementById('workout-ready').style.display = 'flex';
  renderWorkoutScreen();
}

function showRestScreen(type, nextExName, onDone) {
  const s = getSettings(); const duration = type === 'exercise' ? s.exerciseRestSeconds : s.setRestSeconds;
  UI.restDurationTotal = duration; UI.restTimeRemaining = duration; UI.restOnDoneCallback = onDone;

  const overlay = document.getElementById('rest-overlay');
  document.getElementById('rest-overlay-type').textContent = type === 'exercise' ? 'Exercise Rest' : 'Set Rest';
  document.getElementById('rest-overlay-label').textContent = 'Resting';
  document.getElementById('rest-overlay-next').innerHTML = nextExName ? `Next: <strong>${nextExName}</strong>` : '';

  updateRestOverlayDisplay(); overlay.classList.add('show'); clearRestTimer();

  UI.restTimer = setInterval(() => {
    UI.restTimeRemaining--; updateRestOverlayDisplay();
    if (UI.restTimeRemaining <= 0) { triggerRestEndExecution(); }
  }, 1000);
  document.getElementById('rest-skip-trigger').onclick = () => triggerRestEndExecution();
}

function updateRestOverlayDisplay() {
  const circ = 2 * Math.PI * 90; const fill = document.getElementById('rest-ring-circle');
  const frac = Math.max(0, UI.restTimeRemaining) / UI.restDurationTotal;
  fill.style.strokeDasharray = circ; fill.style.strokeDashoffset = circ * (1 - frac);
  document.getElementById('rest-time-sec').textContent = Math.max(0, UI.restTimeRemaining);
}

// Fixed core countdown adjustments arithmetic variables cleanly
function snoozeRestTimer(seconds) { UI.restTimeRemaining += seconds; UI.restDurationTotal += seconds; updateRestOverlayDisplay(); }

function triggerRestEndExecution() {
  clearRestTimer(); document.getElementById('rest-overlay').classList.remove('show');
  if (UI.workout) {
    const totalRestTaken = Math.floor((Date.now() - UI.setRestMarkerStart) / 1000);
    const timeLog = UI.workout.setTimestamps[UI.workout.exIndex];
    if (timeLog) { timeLog.restDurations.push(totalRestTaken); }
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
    if (comp) { cell.classList.add('has-workout'); cell.onclick = () => showWorkoutDetail(comp); }
    else if (dayStr > todayStr && schedType !== 'rest') {
      cell.classList.add('scheduled'); const dot = document.createElement('div'); dot.className = 'cal-day-dot';
      dot.style.background = {push:'var(--red)', pull:'var(--blue)', legs:'var(--green)'}[schedType] || 'transparent';
      cell.appendChild(dot);
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
  const wDates = workouts.map(w => w.date.split('T')[0]);
  let activeChain = true; let loopLimit = 0;

  while (activeChain && loopLimit < 365) {
    const cStr = check.toISOString().split('T')[0]; const sType = getPPLType(cStr);
    if (wDates.includes(cStr)) { streak++; } 
    else if (sType === 'rest') { if (cStr !== new Date().toISOString().split('T')[0]) streak++; } 
    else { if (cStr !== new Date().toISOString().split('T')[0]) activeChain = false; }
    check.setDate(check.getDate() - 1); loopLimit++;
  }
  document.getElementById('stat-streak').textContent = streak;
  renderVolChart();
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

function showWorkoutDetail(w) {
  const d = new Date(w.date); const unit = getSettings().weightUnit;
  const rows = (w.exercises || []).map(ex => {
    const setPills = (ex.sets || []).map((s, idx) => `
      <div class="history-set-pill">
        <span style="font-weight:700; color:var(--text)">Set ${idx+1}</span>
        <span>${s.weight}${unit} × ${s.reps}</span>
        <span style="font-size:11px; color:var(--text3);">Time: ${s.duration || 0}s | Rest: ${s.restBefore || 0}s</span>
      </div>`).join('');
    return `<div class="history-ex-item"><div class="history-ex-name">${ex.name}</div><div class="history-sets-grid">${setPills}</div></div>`;
  }).join('');

  showModal(`
    <div style="font-size:18px; font-weight:800;">${d.toLocaleDateString('en-US',{weekday:'long', month:'short', day:'numeric'})}</div>
    <div style="color:var(--text2); font-size:13px; text-transform:uppercase; font-weight:700; margin-top:2px;">${w.type} · ${(w.totalVolume||0).toLocaleString()} ${unit}</div>
    <div style="margin-top:8px; max-height:45vh; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">${rows}</div>
    <button class="btn btn-secondary" style="margin-top:8px;" onclick="closeModal()">Close</button>`);
}

function renderMuscleMap() {
  const freq = getMusclesWorked(UI.musclePeriod); const maxFreq = Math.max(...Object.values(freq), 1);
  document.getElementById('muscle-diagram').innerHTML = UI.muscleView === 'front' ? frontBodySVG(freq, maxFreq) : backBodySVG(freq, maxFreq);

  const leg = document.getElementById('muscle-legend'); const shown = new Set(); const items = [];
  Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([id, count]) => {
    const lbl = MUSCLE_LABELS[id]; if (lbl && !shown.has(lbl)) { shown.add(lbl); items.push({lbl, count, color: MUSCLE_COLOR[lbl]||'#888'}); }
  });
  leg.innerHTML = items.map(({lbl,count,color}) => `
    <div class="muscle-pill" style="background:${color}15; border:1px solid ${color}40"><div class="muscle-pill-dot" style="background:${color}"></div><span style="color:${color}; font-weight:700;">${lbl} (${count})</span></div>`).join('');

  const bd = document.getElementById('muscle-breakdown'); if (!items.length) { bd.innerHTML = ''; return; }
  bd.innerHTML = `<div class="card"><div class="section-label" style="margin-bottom:12px;">Frequency</div>` +
    items.slice(0,6).map(({lbl,count,color}) => `<div style="margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;"><span>${lbl}</span><span>${count}</span></div><div style="height:6px; background:var(--bg4); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${window.isNaN(count/maxFreq)?0:Math.round(count/maxFreq*100)}%; background:${color};"></div></div></div>`).join('') + '</div>';
}

function muscleOpacity(freq, maxFreq, ids) { const t = ids.reduce((a,id)=>a+(freq[id]||0), 0); return t === 0 ? 0.08 : 0.25 + 0.75 * (t / (ids.length * maxFreq)); }
function mColor(ids) { return MUSCLE_COLOR[MUSCLE_LABELS[ids[0]]] || '#333'; }

function frontBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids); const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,14 c0,-6 12,-6 12,0 c0,5 -3,7 -6,9 c-3,-2 -6,-4 -6,-9 z" fill="#1e1e1e"/>
      <path d="M46,23 l8,0 l-2,5 l-4,0 z" fill="#2a2a2a"/>
      <path id="chest_l" d="M49,30 c-3,0 -8,1 -12,4 c-1,4 -1,13 1,18 c4,0 9,-1 11,-4 z" fill="${c(['chest'])}" opacity="${op(['chest'])}"/>
      <path id="chest_r" d="M51,30 c3,0 8,1 12,4 c1,4 1,13 -1,18 c-4,0 -9,-1 -11,-4 z" fill="${c(['chest'])}" opacity="${op(['chest'])}"/>
      <path id="deltoids_l" d="M36,33 c-2,2 -4,6 -5,11 c2,3 5,4 7,1 c1,-4 0,-9 -2,-12 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="deltoids_r" d="M64,33 c2,2 4,6 5,11 c-2,3 -5,4 -7,1 c-1,-4 0,-9 2,-12 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="biceps_l" d="M30,47 c-1,4 -1,11 1,15 c2,0 3,-4 3,-8 c0,-3 -1,-6 -4,-7 z" fill="${c(['biceps'])}" opacity="${op(['biceps'])}"/>
      <path id="biceps_r" d="M70,47 c1,4 1,11 -1,15 c-2,0 -3,-4 -3,-8 c0,-3 1,-6 4,-7 z" fill="${c(['biceps'])}" opacity="${op(['biceps'])}"/>
      <path id="forearms_l" d="M29,65 c-1,5 -3,13 0,19 c2,0 3,-6 3,-12 c0,-3 -1,-5 -3,-7 z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>
      <path id="forearms_r" d="M71,65 c1,5 3,13 0,19 c-2,0 -3,-6 -3,-12 c0,-3 1,-5 3,-7 z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>
      <path id="abs" d="M42,50 l16,0 l-2,28 l-12,0 z" fill="${c(['abs'])}" opacity="${op(['abs'])}"/>
      <path id="obliques_l" d="M39,51 l3,0 l-2,27 l-4,-21 z" fill="${c(['obliques'])}" opacity="${op(['obliques'])}"/>
      <path id="obliques_r" d="M61,51 l-3,0 l2,27 l4,-21 z" fill="${c(['obliques'])}" opacity="${op(['obliques'])}"/>
      <path id="quadriceps_l" d="M36,84 l13,0 l-3,42 l-11,-35 z" fill="${c(['quadriceps'])}" opacity="${op(['quadriceps'])}"/>
      <path id="quadriceps_r" d="M64,84 l-13,0 l3,42 l11,-35 z" fill="${c(['quadriceps'])}" opacity="${op(['quadriceps'])}"/>
      <path id="calves_l" d="M37,134 l10,2 l-3,38 l-6,-32 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
      <path id="calves_r" d="M63,134 l-10,2 l3,38 l6,-32 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
    </svg>`;
}

function backBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids); const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,14 c0,-6 12,-6 12,0 c0,5 -3,7 -6,9 c-3,-2 -6,-4 -6,-9 z" fill="#1e1e1e"/>
      <path id="trapezius" d="M50,23 l10,8 l-4,14 l-12,0 l-4,-14 z" fill="${c(['trapezius'])}" opacity="${op(['trapezius'])}"/>
      <path id="deltoids_l" d="M35,32 c-2,2 -4,6 -4,11 c2,1 5,0 6,-3 c0,-3 -1,-6 -2,-8 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="deltoids_r" d="M65,32 c2,2 4,6 4,11 c-2,1 -5,0 -6,-3 c0,-3 1,-6 2,-8 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="lats_l" d="M41,48 c-4,4 -6,14 -4,22 l12,-16 z" fill="${c(['lats'])}" opacity="${op(['lats'])}"/>
      <path id="lats_r" d="M59,48 c4,4 6,14 4,22 l-12,-16 z" fill="${c(['lats'])}" opacity="${op(['lats'])}"/>
      <path id="triceps_l" d="M29,46 c-1,4 0,11 2,14 c1,-3 1,-8 0,-11 c-1,-1 -1,-2 -2,-3 z" fill="${c(['triceps'])}" opacity="${op(['triceps'])}"/>
      <path id="triceps_r" d="M71,46 c1,4 0,11 -2,14 c-1,-3 -1,-8 0,-11 c1,-1 1,-2 2,-3 z" fill="${c(['triceps'])}" opacity="${op(['triceps'])}"/>
      <path id="gluteal_l" d="M37,82 c0,-4 12,-4 12,0 c0,12 -12,12 -12,0 z" fill="${c(['gluteal'])}" opacity="${op(['gluteal'])}"/>
      <path id="gluteal_r" d="M63,82 c0,-4 -12,-4 -12,0 c0,12 12,12 12,0 z" fill="${c(['gluteal'])}" opacity="${op(['gluteal'])}"/>
      <path id="hamstrings_l" d="M36,89 l13,2 l-4,40 l-9,-36 z" fill="${c(['hamstrings'])}" opacity="${op(['hamstrings'])}"/>
      <path id="hamstrings_r" d="M64,89 l-13,2 l4,40 l9,-36 z" fill="${c(['hamstrings'])}" opacity="${op(['hamstrings'])}"/>
      <path id="calves_l" d="M37,135 l9,1 l-2,36 l-7,-31 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
      <path id="calves_r" d="M63,135 l-9,1 l2,36 l7,-31 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
    </svg>`;
}

function setMuscleView(v) { UI.muscleView = v; document.querySelectorAll('.muscle-tab').forEach(t=>t.classList.remove('active')); document.getElementById('mtab-'+v).classList.add('active'); renderMuscleMap(); }
function setMusclePeriod(p) { UI.musclePeriod = p; document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active')); document.getElementById('ptab-'+p).classList.add('active'); renderMuscleMap(); }

function renderSettings() {
  const s = getSettings();
  document.getElementById('settings-content').innerHTML = `
    <div class="settings-section">
      <div class="settings-section-title">Schedule</div>
      <div class="settings-row" onclick="editSetting('pattern')"><div class="settings-row-left"><div class="settings-row-label">Rotation Loop</div><div class="settings-row-value">${s.pattern.join(' → ')}</div></div></div>
      <div class="settings-row" onclick="editSetting('blocked')"><div class="settings-row-left"><div class="settings-row-label">Blocked Days</div><div class="settings-row-value">${s.blockedWeekdays.length?s.blockedWeekdays.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', '):'None'}</div></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Preferences</div>
      <div class="settings-row" onclick="editSetting('unit')"><div class="settings-row-left"><div class="settings-row-label">Weight Unit</div><div class="settings-row-value">${s.weightUnit}</div></div></div>
      <div class="settings-row" onclick="editSetting('color')"><div class="settings-row-left"><div class="settings-row-label">Theme Color</div><div class="settings-row-value" style="color:var(--accent); font-weight:700;">${s.accentTheme}</div></div></div>
      <div class="settings-row" onclick="editSetting('timers')"><div class="settings-row-left"><div class="settings-row-label">Rest Timers</div><div class="settings-row-value">Sets: ${s.setRestSeconds}s · Exercises: ${s.exerciseRestSeconds}s</div></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Customize Routine Programs</div>
      <div class="settings-row" onclick="openCustomWorkoutEditorModal('push')"><div class="settings-row-left"><div class="settings-row-label">Edit Push Routine</div><div class="settings-row-value">Modify exercises, sets, and rep suggestions</div></div></div>
      <div class="settings-row" onclick="openCustomWorkoutEditorModal('pull')"><div class="settings-row-left"><div class="settings-row-label">Edit Pull Routine</div><div class="settings-row-value">Modify exercises, sets, and rep suggestions</div></div></div>
      <div class="settings-row" onclick="openCustomWorkoutEditorModal('legs')"><div class="settings-row-left"><div class="settings-row-label">Edit Legs Routine</div><div class="settings-row-value">Modify exercises, sets, and rep suggestions</div></div></div>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Data</div>
      <div class="settings-row" onclick="resetData()"><div class="settings-row-left"><div class="settings-row-label" style="color:var(--red);">Reset All Data</div></div></div>
    </div>`;
}

// Adjusted layout selectors to display: flex explicitly on active triggers
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
  } else if (key === 'pattern') {
    showModal(`<div class="modal-title">Loop Sequence</div><div class="field"><select id="edit-pattern-len" onchange="adjustSettingsPatternSlots(this.value)">${[3,4,5,6,7,8].map(n=>`<option value="${n}" ${s.pattern.length===n?'selected':''}>${n} Days</option>`).join('')}</select></div><div id="settings-slots-editor-wrap" style="display:flex; flex-direction:column; gap:8px;"></div><button class="btn btn-accent" style="margin-top:12px;" onclick="saveSettingsPatternMatrix()">Save</button>`);
    adjustSettingsPatternSlots(s.pattern.length);
  }
}

function adjustSettingsPatternSlots(len) {
  const wrap = document.getElementById('settings-slots-editor-wrap'); wrap.innerHTML = ''; const s = getSettings();
  for (let i = 0; i < parseInt(len); i++) {
    const val = s.pattern[i] || 'rest';
    wrap.innerHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg3); padding:6px; border-radius:6px;">
        <span>Slot #${i+1}</span>
        <select class="settings-slot-select" style="width:120px; padding:4px;" data-index="${i}">
          <option value="push" ${val==='push'?'selected':''}>Push</option>
          <option value="pull" ${val==='pull'?'selected':''}>Pull</option>
          <option value="legs" ${val==='legs'?'selected':''}>Legs</option>
          <option value="rest" ${val==='rest'?'selected':''}>Rest</option>
        </select>
      </div>`;
  }
}

function saveSettingsThemeColor() { const dot = document.querySelector('#settings-color-grid .color-dot.selected'); if(dot){ const s=getSettings(); s.accentTheme=dot.dataset.color; saveSettings(s); closeModal(); renderSettings(); } }
function saveSettingsTimers() { const s = getSettings(); s.setRestSeconds = parseInt(document.getElementById('edit-set-rest').value)||90; s.exerciseRestSeconds = parseInt(document.getElementById('edit-ex-rest').value)||180; saveSettings(s); closeModal(); renderSettings(); }
function saveSettingsUnit() { const s = getSettings(); s.weightUnit = document.getElementById('edit-global-unit').value; saveSettings(s); closeModal(); renderSettings(); refreshAppStateLabels(); }
function saveSettingsBlockedDays() { const s = getSettings(); s.blockedWeekdays = [...document.querySelectorAll('.settings-block-chip.selected')].map(c=>parseInt(c.dataset.day)); saveSettings(s); closeModal(); renderSettings(); renderCalendar(); }
function saveSettingsPatternMatrix() { const s = getSettings(); const arr = []; document.querySelectorAll('.settings-slot-select').forEach(sel=>arr.push(sel.value)); s.pattern = arr; saveSettings(s); closeModal(); renderSettings(); renderCalendar(); renderWorkoutScreen(); }

function openCustomWorkoutEditorModal(type) {
  const customs = DB.get('customWorkouts') || {};
  if (!customs[type] || customs[type].length === 0) { customs[type] = JSON.parse(JSON.stringify(LIBRARY[type])); }

  showModal(`
    <div class="modal-title" style="text-transform:uppercase;">Custom ${type} Plan</div>
    <div id="custom-workout-builder-list" style="display:flex; flex-direction:column; gap:10px; margin:8px 0; max-height:50vh; overflow-y:auto; padding-right:4px;"></div>
    <button class="btn btn-secondary btn-sm" onclick="addNewBlankExerciseRowToCustomEditor('${type}')">+ Create Custom Exercise Entry</button>
    <div style="display:flex; gap:10px; margin-top:8px;">
      <button class="btn btn-ghost" onclick="resetCustomWorkoutToLibraryDefaults('${type}')" style="flex:1;">Reset</button>
      <button class="btn btn-accent" onclick="saveCustomWorkoutBuilderRows('${type}')" style="flex:1;">Save</button>
    </div>`);
  renderCustomWorkoutBuilderRows(customs[type]);
}

function renderCustomWorkoutBuilderRows(exerciseArray) {
  const container = document.getElementById('custom-workout-builder-list'); container.innerHTML = '';
  exerciseArray.forEach((ex, idx) => {
    const row = document.createElement('div'); row.className = 'custom-workout-row';
    const setsVal = ex.sets || 3; const repMin = ex.reps ? ex.reps[0] : 8; const suggestedW = ex.suggestedWeight || 100;
    row.innerHTML = `
      <div class="custom-workout-row-header">
        <input type="text" class="custom-ex-name-input" value="${ex.name}" placeholder="Exercise Name" style="font-weight:700; padding:6px; font-size:14px; width:80%;">
        <button class="btn btn-danger btn-sm" onclick="deleteCustomExerciseRowFromBuilder(${idx})" style="padding:4px 8px; font-size:11px; width:auto; border:none;">X</button>
      </div>
      <div class="custom-workout-grid-inputs">
        <div><span style="font-size:10px; color:var(--text2); text-align:center; display:block;">SETS</span><input type="number" class="custom-ex-sets-input" value="${setsVal}"></div>
        <div><span style="font-size:10px; color:var(--text2); text-align:center; display:block;">REPS</span><input type="number" class="custom-ex-reps-input" value="${repMin}"></div>
        <div><span style="font-size:10px; color:var(--text2); text-align:center; display:block;">WT</span><input type="number" class="custom-ex-weight-input" value="${suggestedW}"></div>
      </div>`;
    container.appendChild(row);
  });
}

function addNewBlankExerciseRowToCustomEditor(type) {
  const rows = gatherCustomWorkoutBuilderRowsData();
  rows.push({ name: '', muscles: ['core'], equipment: ['barbell','dumbbells','cables','machines'], sets: 3, reps: [10, 12], suggestedWeight: 45 });
  renderCustomWorkoutBuilderRows(rows);
}

function deleteCustomExerciseRowFromBuilder(index) { const rows = gatherCustomWorkoutBuilderRowsData(); rows.splice(index, 1); renderCustomWorkoutBuilderRows(rows); }

function gatherCustomWorkoutBuilderRowsData() {
  const cards = document.querySelectorAll('.custom-workout-row'); const arr = [];
  cards.forEach(card => {
    const name = card.querySelector('.custom-ex-name-input').value.trim();
    const sets = parseInt(card.querySelector('.custom-ex-sets-input').value) || 3;
    const repMin = parseInt(card.querySelector('.custom-ex-reps-input').value) || 10;
    const weight = parseFloat(card.querySelector('.custom-ex-weight-input').value) || 0;
    arr.push({ id: 'custom_' + Math.random().toString(36).substr(2, 9), name: name || 'Custom Exercise', muscles: ['core'], equipment: ['barbell','dumbbells','cables','machines'], sets: sets, reps: [repMin, repMin + 2], suggestedWeight: weight });
  });
  return arr;
}

function saveCustomWorkoutBuilderRows(type) { const data = gatherCustomWorkoutBuilderRowsData(); const customs = DB.get('customWorkouts') || {}; customs[type] = data; DB.set('customWorkouts', customs); closeModal(); renderSettings(); renderWorkoutScreen(); }
function resetCustomWorkoutToLibraryDefaults(type) { if (!confirm('Reset plan back to initial template default configurations?')) return; const customs = DB.get('customWorkouts') || {}; customs[type] = []; DB.set('customWorkouts', customs); closeModal(); renderSettings(); renderWorkoutScreen(); }

function showModal(html) { 
  document.getElementById('modal-body').innerHTML = html; 
  document.getElementById('modal-overlay').style.setProperty('display', 'flex', 'important'); 
}
function closeModal() { 
  document.getElementById('modal-overlay').style.setProperty('display', 'none', 'important'); 
}
function resetData() { if (confirm('Purge logs?')) { ['workouts','settings','customWorkouts'].forEach(k => DB.del(k)); location.reload(); } }

function refreshAppStateLabels() {
  const s = getSettings(); document.querySelectorAll('.global-unit-label').forEach(n => n.textContent = s.weightUnit);
  const label = document.getElementById('today-label');
  if (label) {
    const mappings = {push:'Push Day', pull:'Pull Day', legs:'Leg Day', rest:'Rest Day'};
    label.textContent = new Date().toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'}) + " · " + (mappings[getTodayType()]||'');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyAccentTheme();
  // Double-verify layout displays start off strictly un-rendered during initial boot sequences
  document.getElementById('modal-overlay').style.setProperty('display', 'none', 'important');
  document.getElementById('active-workout').style.setProperty('display', 'none', 'important');

  if (!DB.get('settings')) { startOnboarding(); } 
  else { refreshAppStateLabels(); renderWorkoutScreen(); showScreen('workout'); }
});

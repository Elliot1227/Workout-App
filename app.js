const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem('il_' + k)); } catch { return null; } },
  set(k, v) { localStorage.setItem('il_' + k, JSON.stringify(v)); return v; },
  del(k) { localStorage.removeItem('il_' + k); }
};

const DEFAULT_SETTINGS = {
  pattern: ['Push', 'Pull', 'Legs', 'Rest'], 
  equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
  setRestSeconds: 90,
  exerciseRestSeconds: 180,
  weightUnit: 'lbs',
  accentTheme: 'green'
};

// ── MUSCLE MAPPINGS FOR SVG HIGHLIGHTING ──
// These map to standard names that might exist within the SVG DOM
const SVG_MAP_BINDINGS = {
  chest_l: 'chest', chest_r: 'chest',
  lat_l: 'lats', lat_r: 'lats',
  front_delt_l: 'deltoids', front_delt_r: 'deltoids', side_delt_l: 'deltoids', side_delt_r: 'deltoids', rear_delt_l: 'deltoids', rear_delt_r: 'deltoids',
  bicep_l: 'biceps', bicep_r: 'biceps',
  tricep_l: 'triceps', tricep_r: 'triceps',
  trap_l: 'traps', trap_r: 'traps',
  lower_back: 'lower_back',
  quad_l: 'quads', quad_r: 'quads',
  ham_l: 'hamstrings', ham_r: 'hamstrings',
  glute_l: 'glutes', glute_r: 'glutes',
  calf_l: 'calves', calf_r: 'calves',
  core: 'abs', abdominal: 'abs', obliques: 'obliques', forearms: 'forearms'
};

const LIBRARY = {
  push: [
    { id:'bench_press', name:'Bench Press', muscles:['chest_l','chest_r'], equipment:['barbell'], sets:4, reps:[6,8] },
    { id:'ohp', name:'Overhead Press', muscles:['front_delt_l','front_delt_r','side_delt_l','side_delt_r'], equipment:['barbell'], sets:4, reps:[6,8] },
    { id:'tricep_pushdown', name:'Tricep Pushdown', muscles:['tricep_l','tricep_r'], equipment:['cables'], sets:3, reps:[10,12] }
  ],
  pull: [
    { id:'deadlift', name:'Deadlift', muscles:['trap_l','trap_r','lower_back','glute_l','glute_r','ham_l','ham_r'], equipment:['barbell'], sets:4, reps:[4,6] },
    { id:'lat_pulldown', name:'Lat Pulldown', muscles:['lat_l','lat_r','bicep_l','bicep_r'], equipment:['cables','machines'], sets:4, reps:[10,12] },
    { id:'barbell_curl', name:'Barbell Curl', muscles:['bicep_l','bicep_r'], equipment:['barbell'], sets:3, reps:[10,12] }
  ],
  legs: [
    { id:'squat', name:'Barbell Squat', muscles:['quad_l','quad_r','glute_l','glute_r'], equipment:['barbell'], sets:4, reps:[5,8] },
    { id:'rdl', name:'Romanian Deadlift', muscles:['ham_l','ham_r','glute_l','glute_r','lower_back'], equipment:['barbell','dumbbells'], sets:3, reps:[8,10] },
    { id:'calf_raise', name:'Calf Raise', muscles:['calf_l','calf_r'], equipment:['barbell','dumbbells','machines','cables'], sets:4, reps:[12,15] }
  ]
};

const ALL_EXERCISES = [...LIBRARY.push, ...LIBRARY.pull, ...LIBRARY.legs];

function getSettings() { return { ...DEFAULT_SETTINGS, ...(DB.get('settings') || {}) }; }
function saveSettings(s) { DB.set('settings', s); }

// ── ONBOARDING ──
function startOnboarding() { document.getElementById('onboarding').style.display = 'flex'; showOnboardStep(1); }
function showOnboardStep(n) { document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active')); document.getElementById('onboard-' + n).classList.add('active'); }
function onboardNext(n) {
  if (n === 1) { showOnboardStep(2); }
  else if (n === 2) { showOnboardStep(3); }
  else if (n === 3) {
    const s = getSettings();
    s.setRestSeconds = parseInt(document.getElementById('ob-set-rest').value) || 90;
    saveSettings(s);
    document.getElementById('onboarding').style.display = 'none';
    renderWorkoutScreen();
  }
}

// ── UI ROUTING ──
let UI = { activeTabIndex: 0, screen: 'workout', calMonth: new Date(), musclePeriod: 'week', workout: null, restTimer: null, isSetViewCollapsed: true };

function handleBottomTabClick(tabIndex) {
  UI.activeTabIndex = tabIndex; const screens = ['workout', 'calendar', 'muscles', 'settings']; UI.screen = screens[tabIndex];
  document.getElementById('main-swipe-wrapper').style.transform = `translateX(-${tabIndex * 25}%)`;
  document.querySelectorAll('.nav-btn').forEach((b, idx) => { if (idx === tabIndex) b.classList.add('active'); else b.classList.remove('active'); });
  if (UI.screen === 'calendar') renderCalendar();
  if (UI.screen === 'muscles') triggerMuscleMapRenderSequence();
  if (UI.screen === 'settings') renderSettings();
}

function showScreen(name) { const screens = ['workout', 'calendar', 'muscles', 'settings']; const idx = screens.indexOf(name); if(idx !== -1) handleBottomTabClick(idx); }

// ── WORKOUT SCREEN ──
function getPPLType(dateStr) { return 'Push'; } // Simplified
function getTodayType() { return getPPLType(new Date().toISOString().split('T')[0]); }
function getWorkouts() { return DB.get('workouts') || []; }
function saveWorkout(w) { const workouts = getWorkouts(); workouts.push(w); DB.set('workouts', workouts); }
function getExerciseHistory(id) { return getWorkouts().flatMap(w => (w.exercises || []).filter(e => e.id === id)); }

function renderWorkoutScreen() {
  const type = getTodayType();
  const container = document.getElementById('workout-ready-content');
  container.innerHTML = `<div class="workout-day-badge">${type.toUpperCase()}</div><button class="btn btn-accent" onclick="startWorkout('${type.toLowerCase()}')">Start Session</button>`;
}

function startWorkout(type) {
  const plan = LIBRARY[type] ? JSON.parse(JSON.stringify(LIBRARY[type])) : JSON.parse(JSON.stringify(LIBRARY.push));
  UI.workout = {
    type, date: new Date().toISOString(), startTime: Date.now(), exercises: plan, exIndex: 0, setIndex: 0,
    setData: plan.map(ex => Array.from({length: ex.sets}, () => ({ weight: ex.weight || 45, reps: ex.reps[0] || 10, done: false }))),
    completedExercises: [], totalVolume: 0
  };
  document.getElementById('workout-ready').style.display = 'none'; document.getElementById('active-workout').style.display = 'flex';
  UI.workout.timerInterval = setInterval(updateWorkoutTimer, 1000); renderActiveExercise();
}

function updateWorkoutTimer() {
  if (!UI.workout) return; const elapsed = Math.floor((Date.now() - UI.workout.startTime) / 1000);
  document.getElementById('workout-timer').textContent = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('workout-volume').textContent = UI.workout.totalVolume.toLocaleString();
}

function renderActiveExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex];
  let activeSetIdx = sets.findIndex(s => !s.done); if (activeSetIdx === -1) activeSetIdx = sets.length - 1; w.setIndex = activeSetIdx;

  document.getElementById('aw-type').textContent = w.type; document.getElementById('aw-progress').textContent = `${w.exIndex + 1} / ${w.exercises.length}`;
  document.getElementById('aw-ex-name').textContent = ex.name;

  const dashContainer = document.getElementById('aw-dash-container'); dashContainer.innerHTML = '';
  sets.forEach((s, i) => { const dash = document.createElement('div'); dash.className = `set-dash ${s.done ? 'completed' : (i===activeSetIdx ? 'current' : '')}`; dashContainer.appendChild(dash); });

  document.getElementById('aw-focus-title').textContent = `Set ${activeSetIdx + 1}`;
  const inputWeight = document.getElementById('focus-weight'); const inputReps = document.getElementById('focus-reps');
  inputWeight.value = sets[activeSetIdx].weight; inputReps.value = sets[activeSetIdx].reps;

  if (sets[activeSetIdx].done) { inputWeight.setAttribute('disabled','true'); inputReps.setAttribute('disabled','true'); }
  else { inputWeight.removeAttribute('disabled'); inputReps.removeAttribute('disabled'); }

  const collapseTarget = document.getElementById('collapse-target'); collapseTarget.innerHTML = '';
  sets.forEach((s, idx) => { collapseTarget.innerHTML += `<div class="mini-set-row ${s.done?'done':''}"><span>Set ${idx + 1}</span><span>${s.weight} lbs × ${s.reps}</span></div>`; });

  const trigger = document.getElementById('collapse-trigger');
  if (UI.isSetViewCollapsed) { trigger.classList.remove('open'); collapseTarget.classList.remove('open'); }
  else { trigger.classList.add('open'); collapseTarget.classList.add('open'); }
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
  const w = UI.workout; const sets = w.setData[w.exIndex]; const si = w.setIndex;
  sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0; sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  sets[si].done = true; w.totalVolume += (sets[si].weight * sets[si].reps);

  if (sets.every(s => s.done)) {
    const isLastEx = w.exIndex >= w.exercises.length - 1;
    showRestScreen(() => { commitCurrentExercise(); if (isLastEx) { finishWorkout(); } else { w.exIndex++; w.setIndex = 0; renderActiveExercise(); } });
  } else {
    showRestScreen(() => { w.setIndex++; renderActiveExercise(); });
  }
}

function commitCurrentExercise() {
  const w = UI.workout; const ex = w.exercises[w.exIndex]; const sets = w.setData[w.exIndex].filter(s => s.done);
  if (!sets.length) return; w.completedExercises.push({ id: ex.id, name: ex.name, muscles: ex.muscles, sets });
}

function skipToNextExercise() { commitCurrentExercise(); const w = UI.workout; if (w.exIndex >= w.exercises.length - 1) { finishWorkout(); } else { w.exIndex++; w.setIndex = 0; renderActiveExercise(); } }

function endWorkoutEarly() { if (confirm('End workout early? Progress will be saved.')) { document.getElementById('rest-overlay').style.display = 'none'; finishWorkout(); } }

function finishWorkout() {
  if (UI.workout) {
    clearInterval(UI.workout.timerInterval); clearRestTimer(); const w = UI.workout; commitCurrentExercise();
    if (w.completedExercises.length > 0) {
      saveWorkout({
        id: w.date, date: w.date, type: w.type, duration: Math.floor((Date.now() - w.startTime) / 1000), exercises: w.completedExercises,
        totalVolume: w.completedExercises.reduce((a,e) => a + e.sets.reduce((b,s)=>(b+(s.weight||0)*(s.reps||0)),0), 0)
      });
    }
    UI.workout = null;
  }
  document.getElementById('active-workout').style.display = 'none'; document.getElementById('workout-ready').style.display = 'flex'; renderWorkoutScreen();
}

// ── REST TIMER ──
function showRestScreen(onDone) {
  const settings = getSettings(); const duration = settings.setRestSeconds;
  UI.restDurationTotal = duration; UI.restTimeRemaining = duration; UI.restOnDoneCallback = onDone;
  document.getElementById('rest-overlay').style.display = 'flex'; updateRestOverlayDisplay(); clearRestTimer();
  UI.restTimer = setInterval(() => { UI.restTimeRemaining--; updateRestOverlayDisplay(); if (UI.restTimeRemaining <= 0) { triggerRestEndExecution(); } }, 1000);
}

function updateRestOverlayDisplay() {
  const circ = 2 * Math.PI * 90; const fill = document.getElementById('rest-ring-circle');
  const frac = Math.max(0, UI.restTimeRemaining) / UI.restDurationTotal; fill.style.strokeDasharray = circ; fill.style.strokeDashoffset = circ * (1 - frac);
  document.getElementById('rest-time-sec').textContent = Math.max(0, UI.restTimeRemaining);
}

function snoozeRestTimer(seconds) { UI.restTimeRemaining += seconds; UI.restDurationTotal += seconds; updateRestOverlayDisplay(); }
function triggerRestEndExecution() { clearRestTimer(); document.getElementById('rest-overlay').style.display = 'none'; if (UI.restOnDoneCallback) UI.restOnDoneCallback(); }
function clearRestTimer() { if (UI.restTimer) { clearInterval(UI.restTimer); UI.restTimer = null; } }

// ── CALENDAR ──
function renderCalendar() { /* Placeholder */ }
function changeCalMonth(dir) { }

// ── MAP RENDERING ENGINE & SVG PATH INJECTION ──
let hasFetchedSVG = false;

async function triggerMuscleMapRenderSequence() {
  const container = document.getElementById('muscle-diagram');
  if (!hasFetchedSVG) {
    try {
      const res = await fetch('https://raw.githubusercontent.com/a0a7/MuscleMapAssetPack/main/Muscles.svg');
      if (!res.ok) throw new Error('Fetch failed');
      const text = await res.text();
      container.innerHTML = text;
      const svgEl = container.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.maxHeight = '450px';
      }
      hasFetchedSVG = true;
    } catch (e) {
      container.innerHTML = `<div style="color:var(--red); padding: 40px 0; text-align:center;">Failed to load SVG from GitHub link. Please check your internet connection.</div>`;
      return;
    }
  }
  executeColorGradientsOnSVG();
}

function executeColorGradientsOnSVG() {
  const svg = document.querySelector('#muscle-diagram svg');
  if (!svg) return;

  // Force all internal elements to base gray
  svg.querySelectorAll('path, g, polygon, rect').forEach(el => {
    el.style.fill = '#555555';
    el.style.transition = 'fill 0.4s ease';
  });

  const freq = getMusclesWorked();
  const maxFreq = Math.max(...Object.values(freq), 1);

  Object.entries(freq).forEach(([rawId, count]) => {
    if (count === 0) return;
    
    // Calculate the red-to-green distribution gradient
    const ratio = count / maxFreq;
    const r = Math.round(255 + ratio * (61 - 255));
    const g = Math.round(77 + ratio * (220 - 77));
    const b = Math.round(77 + ratio * (132 - 77));
    const color = `rgb(${r}, ${g}, ${b})`;

    // Map internal db tag to SVG group/path IDs via loose inclusion matching
    const svgTargetId = SVG_MAP_BINDINGS[rawId] || rawId;

    // Apply color to the matched paths inside the pulled graphic
    const targets = svg.querySelectorAll(`[id*="${svgTargetId}" i], [class*="${svgTargetId}" i]`);
    targets.forEach(el => {
      el.style.fill = color;
      el.querySelectorAll('path, polygon, rect').forEach(child => child.style.fill = color);
    });
  });
}

function getMusclesWorked() {
  const freq = {};
  getWorkouts().forEach(w => {
    (w.exercises || []).forEach(ex => {
      (ex.muscles || []).forEach(m => { freq[m] = (freq[m] || 0) + 1; });
    });
  }); return freq;
}

function setMusclePeriod(p) { UI.musclePeriod = p; document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active')); document.getElementById('ptab-'+p).classList.add('active'); triggerMuscleMapRenderSequence(); }

function renderSettings() { document.getElementById('settings-content').innerHTML = `
  <div class="settings-section">
    <div class="settings-row" onclick="resetData()"><div class="settings-row-left"><div class="settings-row-label" style="color:var(--red);">Reset All Data</div></div></div>
  </div>`; 
}

function resetData() { if (confirm('Purge logs?')) { ['workouts','settings','customWorkouts'].forEach(k => DB.del(k)); location.reload(); } }

function showModal(html) { document.getElementById('modal-body').innerHTML = html; document.getElementById('modal-overlay').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
  if (!DB.get('settings')) { startOnboarding(); } 
  else { renderWorkoutScreen(); handleBottomTabClick(0); }
});

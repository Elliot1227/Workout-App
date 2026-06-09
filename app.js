// ═══════════════════════════════════════════════════════════════════
// WORKOUT TRACKER — INTERACTIVE SPRING SWIPING TOUCH ENGINE REWRITE
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

// ── VULOVIX GITHUB SPECIFICATION DEFINITIONS API COMPLIANT MAPPINGS ──
const MUSCLE_LABELS = {
  chests: 'Chest', lats: 'Lats', deltoids: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', trapezius: 'Traps', abs: 'Core', obliques: 'Core', quadriceps: 'Quads', hamstrings: 'Hamstrings', gluteal: 'Glutes', calves: 'Calves', forearms: 'Forearms'
};

const MUSCLE_COLOR = {
  'Chest':'#ff6b6b','Lats':'#4d9fff','Shoulders':'#ffa94d','Biceps':'#3ddc84','Triceps':'#cc44ff','Traps':'#74c0fc','Quads':'#ffe066','Hamstrings':'#63e6be','Glutes':'#ff8c42','Calves':'#a9e34b','Core':'#748ffc','Forearms':'#e599f7'
};

const MASTER_EXERCISES_CATALOGUE = [
  { id: 'bench_press', name: 'Barbell Bench Press', muscle: 'chests', sets: 3, reps: [6, 8], weight: 135, equipment: 'barbell' },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', muscle: 'chests', sets: 3, reps: [8, 10], weight: 50, equipment: 'dumbbells' },
  { id: 'flat_db_press', name: 'Flat Dumbbell Press', muscle: 'chests', sets: 3, reps: [8, 10], weight: 55, equipment: 'dumbbells' },
  { id: 'dips_rack', name: 'Dip Rack Chest Dips', muscle: 'chests', sets: 3, reps: [8, 10], weight: 0, equipment: 'machines' },
  { id: 'band_fly', name: 'Resistance Band Fly', muscle: 'chests', sets: 3, reps: [12, 15], weight: 15, equipment: 'bands' },
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
    { id: 'bench_press', name: 'Barbell Bench Press', muscles: ['chests'], sets: 3, reps: [6, 8] },
    { id: 'ohp', name: 'Barbell Overhead Press', muscles: ['deltoids'], sets: 3, reps: [6, 8] },
    { id: 'incline_db_press', name: 'Incline Dumbbell Press', muscles: ['chests'], sets: 3, reps: [8, 10] },
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

let UI = { activeTabIndex: 0, screen: 'workout', calMonth: new Date(), muscleView: 'front', musclePeriod: 'week', workout: null, restTimer: null, restDurationTotal: 0, restTimeRemaining: 0, isSetViewCollapsed: true };

// ── SWIPE AND NAVIGATION LINK SLIDER INDEXES ──
function handleBottomTabClick(tabIndex) {
  UI.activeTabIndex = tabIndex; const screens = ['workout', 'calendar', 'muscles', 'settings'];
  UI.screen = screens[tabIndex];

  const wrapper = document.getElementById('main-swipe-wrapper');
  wrapper.style.transform = `translateX(-${tabIndex * 25}%)`;

  document.querySelectorAll('.nav-btn').forEach((b, idx) => {
    if (idx === tabIndex) b.classList.add('active'); else b.classList.remove('active');
  });

  if (UI.screen === 'calendar') renderCalendar();
  if (UI.screen === 'muscles') renderMuscleMap();
  if (UI.screen === 'settings') renderSettings();
}

let touchStartX = 0; let touchStartY = 0;
let touchEndX = 0; let touchEndY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX; touchEndY = e.changedTouches[0].screenY;
  handleSwipeGestureRouter();
}, { passive: true });

function handleSwipeGestureRouter() {
  const deltaX = touchEndX - touchStartX; const deltaY = touchEndY - touchStartY;
  if (document.getElementById('active-workout').style.display === 'flex') return;
  // Guard boundary to prevent tab swiping while drawer sheets are pulled into layout tracking views
  if (isAnyFullscreenPanelOrModalOpen()) return;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 60) {
    if (deltaX < 0 && UI.activeTabIndex < 3) { handleBottomTabClick(UI.activeTabIndex + 1); } 
    else if (deltaX > 0 && UI.activeTabIndex > 0) { handleBottomTabClick(UI.activeTabIndex - 1); }
  }
}

function isAnyFullscreenPanelOrModalOpen() {
  if (document.getElementById('modal-overlay').style.display === 'flex') return true;
  const panels = ['panel-workout-manager', 'panel-exercise-catalogue-picker', 'panel-schedule-builder'];
  return panels.some(p => document.getElementById(p).style.display === 'flex');
}

// ── FLUID 1:1 INTERACTIVE SHEET INTERFACING TOUCH SYSTEM ──
let activeTrackingSheetNode = null;
let sheetTouchStartY = 0;
let sheetCurrentTransformY = 0;

function wireFluidInteractiveSheetGestures(triggerId, containerId, isModal = false) {
  const trigger = document.getElementById(triggerId);
  const container = document.getElementById(containerId);
  if (!trigger || !container) return;

  trigger.addEventListener('touchstart', e => {
    activeTrackingSheetNode = container;
    sheetTouchStartY = e.touches[0].clientY;
    container.style.transition = 'none'; // Unhook transition timing engines for true real-time response
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (activeTrackingSheetNode !== container) return;
    let currentY = e.touches[0].clientY;
    let deltaY = currentY - sheetTouchStartY;

    if (deltaY < 0) deltaY = 0; // Prevent upward over-stretching
    sheetCurrentTransformY = deltaY;
    container.style.transform = `translateY(${deltaY}px)`;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (activeTrackingSheetNode !== container) return;
    activeTrackingSheetNode = null;
    
    container.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    
    // If pulled more than 120 pixels downwards, slide it off the screen
    if (sheetCurrentTransformY > 120) {
      if (isModal) closeModal(); else closeFullscreenPanel(containerId);
    } else {
      container.style.transform = 'translateY(0px)';
    }
    sheetCurrentTransformY = 0;
  }, { passive: true });
}

// ── ONBOARDING MATRIX ──
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
      <select id="force-workout-selector" style="margin-bottom:12px; font-size:16px; color-scheme:dark;"></select>
      <button class="btn btn-accent" onclick="forceStartWorkout(document.getElementById('force-workout-selector').value)">Start Selection</button>`;
    populateWorkoutDropdown('force-workout-selector'); return;
  }
  container.innerHTML = `<div class="workout-day-badge">${type.toUpperCase()}</div><button class="btn btn-accent" onclick="startWorkout('${type}')">Start Workout</button>`;
}

function populateWorkoutDropdown(elementId, selectedValue = '') {
  const select = document.getElementById(elementId); if (!select) return; select.innerHTML = '';
  const coreOptions = ['Push A', 'Pull A', 'Legs A']; const customs = DB.get('customWorkouts') || {};
  const items = [...coreOptions, ...Object.keys(customs)]; const distinct = [...new Set(items)];
  distinct.forEach(opt => { const o = document.createElement('option'); o.value = opt; o.textContent = opt; if(opt === selectedValue) o.selected = true; select.appendChild(o); });
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
  MASTER_EXERCISES_CATALOGUE.forEach(ex => { if (ex.name !== currentEx.name) { const opt = document.createElement('option'); opt.value = ex.id || ex.name; opt.textContent = ex.name; select.appendChild(opt); } });
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
  sets.forEach((s, idx) => { collapseTarget.innerHTML += `<div class="mini-set-row ${s.done?'done':''}"><span>Set ${idx + 1}</span><span>${s.weight} lbs × ${s.reps}</span></div>`; });

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
  const w = UI.workout; const sets = w.setData[w.exIndex]; const si = w.setIndex; const timeLog = w.setTimestamps[w.exIndex]; const ex = w.exercises[w.exIndex];
  sets[si].weight = parseFloat(document.getElementById('focus-weight').value) || 0; sets[si].reps = parseInt(document.getElementById('focus-reps').value) || 0;
  
  if (sets[si].weight !== ex.suggestedWeight || sets[si].reps !== ex.suggestedReps) { sets[si].hasAsteriskDeviation = true; }
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
      weight: s.weight, reps: s.reps, duration: timeLog.durations[idx] || 0, restBefore: timeLog.restDurations[idx] || 0, hasAsteriskDeviation: s.hasAsteriskDeviation || false
    }))
  });
}

function skipToNextExercise() { commitCurrentExercise(); const w = UI.workout; if (w.exIndex >= w.exercises.length - 1) { finishWorkout(); } else { w.exIndex++; w.setIndex = 0; renderActiveExercise(); } }

function endWorkoutEarly() {
  if (confirm('Exit and save progress completely?')) {
    clearRestTimer();
    if (UI.workout) {
      clearInterval(UI.workout.timerInterval); const w = UI.workout; commitCurrentExercise();
      const saved = {
        id: w.date, date: w.date, type: w.type, duration: Math.floor((Date.now() - w.startTime) / 1000), exercises: w.completedExercises,
        totalVolume: w.completedExercises.reduce((a,e) => a + e.sets.reduce((b,s)=>(b+(s.weight||0)*(s.reps||0)),0), 0)
      };
      saveWorkout(saved); UI.workout = null;
    }
    document.getElementById('rest-overlay').classList.remove('show');
    document.getElementById('active-workout').style.display = 'none';
    document.getElementById('workout-ready').style.display = 'flex';
    renderWorkoutScreen();
  }
}

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
  const todayStr = new Date().toISOString().split('T')[0]; const workoutMap = {}; getWorkouts().forEach(w => { if (w.date) workoutMap[w.date.split('T')[0]] = w; });

  for (let i = 0; i < firstDow; i++) grid.appendChild(document.createElement('div'));

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell = document.createElement('div'); cell.className = 'cal-day'; cell.textContent = d;
    const isToday = (dayStr === todayStr); const schedType = getPPLType(dayStr); const comp = workoutMap[dayStr];

    if (isToday) cell.classList.add('today');
    if (comp) { cell.classList.add('has-workout'); cell.onclick = () => renderHistoricalSummaryAccordion(comp); }
    else if (dayStr > todayStr && schedType !== 'rest') {
      cell.classList.add('scheduled'); const dot = document.createElement('div'); dot.className = 'cal-day-dot';
      const normalizedName = schedType.toLowerCase(); let colorCode = '#555557';
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

  let streak = 0; let check = new Date(); check.setHours(0,0,0,0); const wDates = workouts.map(w => w.date.split('T')[0]); let activeChain = true; let loopLimit = 0;
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
    const d = new Date(); d.setDate(d.getDate() - i * 7); const start = new Date(d); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    const vol = getWorkouts().filter(w => { const wd=new Date(w.date); return wd>=start && wd<=end; }).reduce((a,w)=>a+(w.totalVolume||0),0);
    weeks.push({vol, label: start.toLocaleDateString('en-US',{month:'numeric',day:'numeric'})});
  }
  const max = Math.max(...weeks.map(w=>w.vol), 1);
  weeks.forEach((w, idx) => {
    const wrap = document.createElement('div'); wrap.className = 'vol-bar-wrap'; const pct = Math.round((w.vol / max) * 100);
    wrap.innerHTML = `<div class="vol-bar-inner ${idx===4?'filled':''}" style="height:${pct}%"></div><div class="vol-bar-lbl">${w.label}</div>`; chart.appendChild(wrap);
  });
}

function changeCalMonth(dir) { UI.calMonth = new Date(UI.calMonth.getFullYear(), UI.calMonth.getMonth() + dir, 1); renderCalendar(); }

function renderHistoricalSummaryAccordion(w) {
  const root = document.getElementById('cal-history-accordion-root'); root.innerHTML = ''; const unit = getSettings().weightUnit; const d = new Date(w.date);
  const titleNode = document.createElement('div'); titleNode.style.cssText = 'font-size:12px; text-transform:uppercase; font-weight:700; color:var(--accent); margin:12px 0 6px 4px;';
  titleNode.textContent = `${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})} Details`; root.appendChild(titleNode);

  (w.exercises || []).forEach((ex) => {
    const item = document.createElement('div'); item.className = 'history-summary-item'; const totalExVol = ex.sets.reduce((a,s)=> a + (s.weight * s.reps), 0);
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
              <span style="font-weight:700; color:var(--accent)">${s.weight}${s.hasAsteriskDeviation?'*':''} × ${s.reps}${s.hasAsteriskDeviation?'*':''}</span>
              <span style="color:var(--text3); font-size:11px;">T: ${s.duration}s | R: ${s.restBefore}s</span>
            </div>`).join('')}
        </div>
      </div>`;
    root.appendChild(item);
  });
  root.scrollIntoView({ behavior: 'smooth' });
}

function toggleHistoricalSummaryAccordionNode(headerElement) { const content = headerElement.nextElementSibling; content.classList.toggle('open'); }

// ── VULOVIX NATIVE API SPECIFICATION HIGH-FIDELITY VECTOR COMPONENT ──
function renderMuscleMap() {
  const freq = getMusclesWorked(UI.musclePeriod); const maxFreq = Math.max(...Object.values(freq), 1);
  document.getElementById('muscle-diagram').innerHTML = UI.muscleView === 'front' ? frontBodySVG(freq, maxFreq) : backBodySVG(freq, maxFreq);
  const leg = document.getElementById('muscle-legend'); const shown = new Set(); const items = [];
  
  Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([id, count]) => {
    const lbl = MUSCLE_LABELS[id] || id; if (lbl && !shown.has(lbl)) { shown.add(lbl); items.push({lbl, count, color: MUSCLE_COLOR[lbl]||'#888'}); }
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
      let match = MASTER_EXERCISES_CATALOGUE.find(m => m.id === ex.id || m.name === ex.name);
      let mGroup = match ? match.muscle : (ex.muscles ? ex.muscles[0] : 'abs'); freq[mGroup] = (freq[mGroup] || 0) + 1;
    });
  }); return freq;
}

function muscleOpacity(freq, maxFreq, ids) { const t = ids.reduce((a,id)=>a+(freq[id]||0), 0); return t === 0 ? 0.08 : 0.25 + 0.75 * (t / (ids.length * maxFreq)); }
function mColor(ids) { return MUSCLE_COLOR[MUSCLE_LABELS[ids[0]]] || '#333'; }

function frontBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids); const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,14 c0,-6 12,-6 12,0 c0,5 -3,7 -6,9 c-3,-2 -6,-4 -6,-9 z" fill="#1e1e1e"/>
      <path d="M46,23 l8,0 l-2,5 l-4,0 z" fill="#2a2a2a"/>
      <path id="chests" d="M49,30 c-3,0 -8,1 -12,4 c-1,4 -1,13 1,18 c4,0 9,-1 11,-4 z M51,30 c3,0 8,1 12,4 c1,4 1,13 -1,18 c-4,0 -9,-1 -11,-4 z" fill="${c(['chest'])}" opacity="${op(['chest'])}"/>
      <path id="deltoids" d="M36,33 c-2,2 -4,6 -5,11 c2,3 5,4 7,1 c1,-4 0,-9 -2,-12 z M64,33 c2,2 4,6 5,11 c-2,3 -5,4 -7,1 c-1,-4 0,-9 2,-12 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="biceps" d="M30,47 c-1,4 -1,11 1,15 c2,0 3,-4 3,-8 c0,-3 -1,-6 -4,-7 z M70,47 c1,4 1,11 -1,15 c-2,0 -3,-4 -3,-8 c0,-3 1,-6 4,-7 z" fill="${c(['biceps'])}" opacity="${op(['biceps'])}"/>
      <path id="forearms" d="M29,65 c-1,5 -3,13 0,19 c2,0 3,-6 3,-12 c0,-3 -1,-5 -3,-7 z M71,65 c1,5 3,13 0,19 c-2,0 -3,-6 -3,-12 c0,-3 1,-5 3,-7 z" fill="${c(['forearms'])}" opacity="${op(['forearms'])}"/>
      <path id="abs" d="M42,50 l16,0 l-2,28 l-12,0 z" fill="${c(['abs'])}" opacity="${op(['abs'])}"/>
      <path id="obliques" d="M39,51 l3,0 l-2,27 l-4,-21 z M61,51 l-3,0 l2,27 l4,-21 z" fill="${c(['obliques'])}" opacity="${op(['obliques'])}"/>
      <path id="quadriceps" d="M36,84 l13,0 l-3,42 l-11,-35 z M64,84 l-13,0 l3,42 l11,-35 z" fill="${c(['quadriceps'])}" opacity="${op(['quadriceps'])}"/>
      <path id="calves" d="M37,134 l10,2 l-3,38 l-6,-32 z M63,134 l-10,2 l3,38 l6,-32 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
    </svg>`;
}

function backBodySVG(freq, maxFreq) {
  const op = (ids) => muscleOpacity(freq, maxFreq, ids); const c = (ids) => mColor(ids);
  return `
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M44,14 c0,-6 12,-6 12,0 c0,5 -3,7 -6,9 c-3,-2 -6,-4 -6,-9 z" fill="#1e1e1e"/>
      <path id="trapezius" d="M50,23 l10,8 l-4,14 l-12,0 l-4,-14 z" fill="${c(['trapezius'])}" opacity="${op(['trapezius'])}"/>
      <path id="deltoids" d="M35,32 c-2,2 -4,6 -4,11 c2,1 5,0 6,-3 c0,-3 -1,-6 -2,-8 z M65,32 c2,2 4,6 4,11 c-2,1 -5,0 -6,-3 c0,-3 1,-6 2,-8 z" fill="${c(['deltoids'])}" opacity="${op(['deltoids'])}"/>
      <path id="lats" d="M41,48 c-4,4 -6,14 -4,22 l12,-16 z M59,48 c4,4 6,14 4,22 l-12,-16 z" fill="${c(['lats'])}" opacity="${op(['lats'])}"/>
      <path id="triceps" d="M29,46 c-1,4 0,11 2,14 c1,-3 1,-8 0,-11 c-1,-1 -1,-2 -2,-3 z M71,46 c1,4 0,11 -2,14 c-1,-3 -1,-8 0,-11 c1,-1 1,-2 2,-3 z" fill="${c(['triceps'])}" opacity="${op(['triceps'])}"/>
      <path id="gluteal" d="M37,82 c0,-4 12,-4 12,0 c0,12 -12,12 -12,0 z M63,82 c0,-4 -12,-4 -12,0 c0,12 12,12 12,0 z" fill="${c(['gluteal'])}" opacity="${op(['gluteal'])}"/>
      <path id="hamstrings" d="M36,89 l13,2 l-4,40 l-9,-36 z M64,89 l-13,2 l4,40 l9,-36 z" fill="${c(['hamstrings'])}" opacity="${op(['hamstrings'])}"/>
      <path id="calves" d="M37,135 l9,1 l-2,36 l-7,-31 z M63,135 l-9,1 l2,36 l7,-31 z" fill="${c(['calves'])}" opacity="${op(['calves'])}"/>
    </svg>`;
}

function openFullscreenPanel(panelId) {
  const panel = document.getElementById(panelId); panel.style.display = 'flex';
  setTimeout(() => panel.classList.add('active'), 10);
}
function closeFullscreenPanel(panelId) {
  const panel = document.getElementById(panelId); panel.classList.remove('active');
  setTimeout(() => panel.style.display = 'none', 280);
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
  const s = getSettings(); const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if (key === 'color') {
    showModal(`<div class="modal-title" style="padding-left: 2px;">Select Color</div><div class="color-picker-grid" id="settings-color-grid" style="margin-top: 14px;"></div><button class="btn btn-accent" style="margin-top:20px;" onclick="saveSettingsThemeColor()">Save</button>`);
    const grid = document.getElementById('settings-color-grid');
    Object.keys(ACCENT_PALETTE).forEach(k => {
      const dot = document.createElement('div'); dot.className = `color-dot ${s.accentTheme===k?'selected':''}`; dot.style.background = ACCENT_PALETTE[k].primary; dot.dataset.color = k;
      dot.onclick = function() { document.querySelectorAll('#settings-color-grid .color-dot').forEach(d=>d.classList.remove('selected')); this.classList.add('selected'); }; grid.appendChild(dot);
    });
  } else if (key === 'timers') {
    showModal(`
      <div class="modal-title">Rest Times</div>
      <div class="range-slider-wrap" style="margin-top: 12px;">
        <div style="display:flex; justify-content:between; width:100%; align-items:center;">
          <span style="font-size:14px; font-weight:600; flex:1;">Between Sets</span>
          <span class="range-slider-value-display" id="lbl-slider-set">${s.setRestSeconds}s</span>
        </div>
        <input type="range" min="15" max="300" step="5" value="${s.setRestSeconds}" id="slide-set-rest" oninput="document.getElementById('lbl-slider-set').textContent=this.value+'s'">
      </div>
      <div class="range-slider-wrap" style="margin-top: 14px;">
        <div style="display:flex; justify-content:between; width:100%; align-items:center;">
          <span style="font-size:14px; font-weight:600; flex:1;">Between Exercises</span>
          <span class="range-slider-value-display" id="lbl-slider-ex">${s.exerciseRestSeconds}s</span>
        </div>
        <input type="range" min="30" max="600" step="5" value="${s.exerciseRestSeconds}" id="slide-ex-rest" oninput="document.getElementById('lbl-slider-ex').textContent=this.value+'s'">
      </div>
      <button class="btn btn-accent" style="margin-top:20px;" onclick="saveSettingsTimers()">Save</button>`);
  } else if (key === 'unit') {
    showModal(`<div class="modal-title">Weight Unit</div><select id="edit-global-unit" style="margin-top:12px;"><option value="lbs" ${s.weightUnit==='lbs'?'selected':''}>lbs</option><option value="kg" ${s.weightUnit==='kg'?'selected':''}>kg</option></select><button class="btn btn-accent" style="margin-top:20px;" onclick="saveSettingsUnit()">Save</button>`);
  } else if (key === 'blocked') {
    showModal(`<div class="modal-title">Blocked Days</div><div class="chip-group" style="margin-top:14px;">${days.map((d,i)=>`<div class="chip settings-block-chip ${s.blockedWeekdays.includes(i)?'selected':''}" data-day="${i}" onclick="this.classList.toggle('selected')">${d.slice(0,3)}</div>`).join('')}</div><button class="btn btn-accent" style="margin-top:20px;" onclick="saveSettingsBlockedDays()">Save</button>`);
  }
}

function saveSettingsThemeColor() { const dot = document.querySelector('#settings-color-grid .color-dot.selected'); if(dot){ const s=getSettings(); s.accentTheme=dot.dataset.color; saveSettings(s); closeModal(); renderSettings(); } }
function saveSettingsTimers() { const s = getSettings(); s.setRestSeconds = parseInt(document.getElementById('slide-set-rest').value)||90; s.exerciseRestSeconds = parseInt(document.getElementById('slide-ex-rest').value)||180; saveSettings(s); closeModal(); renderSettings(); }
function saveSettingsUnit() { const s = getSettings(); s.weightUnit = document.getElementById('edit-global-unit').value; saveSettings(s); closeModal(); renderSettings(); refreshAppStateLabels(); }
function saveSettingsBlockedDays() { const s = getSettings(); s.blockedWeekdays = [...document.querySelectorAll('.settings-block-chip.selected')].map(c=>parseInt(c.dataset.day)); saveSettings(s); closeModal(); renderSettings(); renderCalendar(); }

function openFullscreenScheduleBuilderPanel() { const s = getSettings(); document.getElementById('sb-loop-len-field').value = s.pattern.length; adjustFullscreenScheduleSlotsLayout(s.pattern.length); openFullscreenPanel('panel-schedule-builder'); }
function handleFullscreenScheduleLengthInputChange(val) { const numericVal = parseInt(val) || 0; if (numericVal >= 1 && numericVal <= 20) { adjustFullscreenScheduleSlotsLayout(numericVal); } }

function adjustFullscreenScheduleSlotsLayout(len) {
  const wrap = document.getElementById('sb-slots-inputs-list-wrapper'); wrap.innerHTML = ''; const s = getSettings();
  for (let i = 0; i < parseInt(len); i++) {
    const val = s.pattern[i] || 'rest';
    wrap.innerHTML += `<div class="schedule-builder-row"><span>Day Slot #` + (i + 1) + `</span><select class="fullscreen-sb-select" id="fullscreen-sb-select-${i}"></select></div>`;
    populateWorkoutDropdown(`fullscreen-sb-select-${i}`, val);
    const selNode = document.getElementById(`fullscreen-sb-select-${i}`); const restOpt = document.createElement('option'); restOpt.value = 'rest'; restOpt.textContent = 'Rest Day'; if(val === 'rest') restOpt.selected = true; selNode.appendChild(restOpt);
  }
}

function saveFullscreenScheduleSettingsPatternMatrix() {
  const s = getSettings(); const arr = []; document.querySelectorAll('.fullscreen-sb-select').forEach(sel => arr.push(sel.value));
  s.pattern = arr; saveSettings(s); closeFullscreenPanel('panel-schedule-builder'); renderSettings(); renderCalendar(); renderWorkoutScreen();
}

function openFullscreenWorkoutManagerPanel() {
  document.getElementById('panel-wm-dashboard-view').style.display = 'flex'; document.getElementById('panel-wm-editing-view').style.display = 'none';
  document.getElementById('wm-panel-title-text').textContent = "Manage Workouts";
  const customs = DB.get('customWorkouts') || {}; const coreWorkouts = ['Push A', 'Pull A', 'Legs A']; const allRoutinesList = [...coreWorkouts, ...Object.keys(customs)];
  const container = document.getElementById('panel-wm-routines-container'); container.innerHTML = '';
  container.innerHTML = allRoutinesList.map(name => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg2); padding:16px; border-radius:var(--radius); margin-bottom:4px;">
      <span style="font-weight:700; font-size:16px; padding-left:2px;">${name}</span>
      <button class="btn btn-accent btn-sm" onclick="startFullscreenWorkoutCustomizerEditorFlow('${name}')">Edit Routine</button>
    </div>`).join('');
  openFullscreenPanel('panel-workout-manager');
}

function createNewWorkoutProgramFromFullscreenHub() {
  const name = document.getElementById('panel-wm-new-name-field').value.trim(); if (!name || name === 'rest') { alert('Provide a valid unique name.'); return; }
  const customs = DB.get('customWorkouts') || {}; if (customs[name] || name === 'Push A' || name === 'Pull A' || name === 'Legs A') { alert('Routine name already used.'); return; }
  customs[name] = []; DB.set('customWorkouts', customs); document.getElementById('panel-wm-new-name-field').value = ''; startFullscreenWorkoutCustomizerEditorFlow(name);
}

let fullscreenEditorStateArray = [];
function startFullscreenWorkoutCustomizerEditorFlow(workoutName) {
  document.getElementById('panel-wm-dashboard-view').style.display = 'none'; document.getElementById('panel-wm-editing-view').style.display = 'flex';
  document.getElementById('wm-panel-title-text').textContent = `Editing: ${workoutName}`;
  const customs = DB.get('customWorkouts') || {}; let currentList = [];
  if (workoutName === 'Push A' || workoutName === 'Pull A' || workoutName === 'Legs A') { currentList = customs[workoutName] || BASE_SYSTEM_LIBRARY[workoutName]; } 
  else { currentList = customs[workoutName] || []; }
  fullscreenEditorStateArray = JSON.parse(JSON.stringify(currentList)); renderFullscreenEditorRows();
  document.getElementById('fullscreen-cz-save-trigger').onclick = () => { customs[workoutName] = fullscreenEditorStateArray; DB.set('customWorkouts', customs); openFullscreenWorkoutManagerPanel(); renderWorkoutScreen(); };
}

function renderFullscreenEditorRows() {
  const container = document.getElementById('fullscreen-cz-exercises-list-wrapper'); container.innerHTML = '';
  if (fullscreenEditorStateArray.length === 0) { container.innerHTML = `<div style="text-align:center; color:var(--text3); padding:24px; font-size:14px;">No exercises. Add one below:</div>`; return; }
  fullscreenEditorStateArray.forEach((ex, idx) => {
    const row = document.createElement('div'); row.className = 'custom-workout-row';
    row.innerHTML = `
      <div class="custom-workout-row-header">
        <span style="font-weight:700; font-size:15px; color:var(--text);">${ex.name}</span>
        <button class="btn btn-danger btn-sm" onclick="removeExerciseFromFullscreenCustomizer(${idx})" style="padding:4px 10px; font-size:12px; width:auto;">Remove</button>
      </div>
      <div class="custom-workout-grid-inputs">
        <div><span>Sets</span><input type="number" pattern="[0-9]*" inputmode="numeric" id="fcz-set-${idx}" value="${ex.sets || 3}" onchange="syncFullscreenEditorInputs(${idx})"></div>
        <div><span>Reps</span><input type="number" pattern="[0-9]*" inputmode="numeric" id="fcz-rep-${idx}" value="${ex.reps ? ex.reps[0] : 10}" onchange="syncFullscreenEditorInputs(${idx})"></div>
        <div><span>Starting Weight</span><input type="number" pattern="[0-9]*" inputmode="numeric" id="fcz-wt-${idx}" value="${ex.suggestedWeight || ex.weight || 45}" onchange="syncFullscreenEditorInputs(${idx})"></div>
      </div>`;
    container.appendChild(row);
  });
}

function syncFullscreenEditorInputs(idx) {
  const sets = parseInt(document.getElementById(`fcz-set-${idx}`).value) || 3; const reps = parseInt(document.getElementById(`fcz-rep-${idx}`).value) || 10;
  const wt = parseFloat(document.getElementById(`fcz-wt-${idx}`).value) || 45; fullscreenEditorStateArray[idx].sets = sets;
  fullscreenEditorStateArray[idx].reps = [reps, reps + 2]; fullscreenEditorStateArray[idx].suggestedWeight = wt; fullscreenEditorStateArray[idx].weight = wt;
}

function removeExerciseFromFullscreenCustomizer(idx) { fullscreenEditorStateArray.splice(idx, 1); renderFullscreenEditorRows(); }
function cancelFullscreenCustomizerEdit() { openFullscreenWorkoutManagerPanel(); }

function openExerciseCatalogSelectorFullscreenPanel() {
  const groups = {}; MASTER_EXERCISES_CATALOGUE.forEach(ex => { const groupName = MUSCLE_LABELS[ex.muscle] || ex.muscle; if (!groups[groupName]) groups[groupName] = []; groups[groupName].push(ex); });
  const container = document.getElementById('fullscreen-catalogue-tree-nodes'); container.innerHTML = ''; let fullTreeHtml = '';
  Object.keys(groups).sort().forEach(gName => {
    fullTreeHtml += `<div class="exercise-group-title">${gName}</div>`;
    groups[gName].forEach(ex => { fullTreeHtml += `<div class="modal-selection-row" onclick="selectExerciseFromFullscreenCatalogueInjection('${ex.id}')"><span style="font-weight:600;">${ex.name}</span><span style="color:var(--text3); font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">${ex.equipment}</span></div>`; });
  });
  container.innerHTML = fullTreeHtml; openFullscreenPanel('panel-exercise-catalogue-picker');
}

function selectExerciseFromFullscreenCatalogueInjection(catalogId) {
  const match = MASTER_EXERCISES_CATALOGUE.find(c => c.id === catalogId);
  if (match) { fullscreenEditorStateArray.push({ id: match.id, name: match.name, muscles: [match.muscle], sets: match.sets, reps: match.reps, suggestedWeight: match.weight, weight: match.weight }); }
  closeFullscreenPanel('panel-exercise-catalogue-picker'); renderFullscreenEditorRows();
}

function showModal(html) { 
  document.getElementById('modal-body').innerHTML = html; 
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('swipeable-modal-node');
  
  overlay.style.display = 'flex';
  modal.style.transform = 'translateY(100%)';
  
  setTimeout(() => {
    overlay.classList.add('active');
    modal.style.transform = 'translateY(0)';
  }, 15);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('swipeable-modal-node');
  
  overlay.classList.remove('active');
  modal.style.transform = 'translateY(100%)';
  
  setTimeout(() => { overlay.style.display = 'none'; }, 260);
}

function handleModalOverlayOutsideTapDismissal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function resetData() { if (confirm('Purge logs?')) { ['workouts','settings','customWorkouts'].forEach(k => DB.del(k)); location.reload(); } }

function refreshAppStateLabels() {
  const label = document.getElementById('today-label');
  if (label) { label.textContent = new Date().toLocaleDateString('en-US',{weekday:'long', month:'long', day:'numeric'}) + " · Routine: " + getTodayType().toUpperCase(); }
}

document.addEventListener('DOMContentLoaded', () => {
  applyAccentTheme();
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('active-workout').style.display = 'none';
  
  // Wire fluid interactive touch tracking variables over handle bar nodes
  wireFluidInteractiveSheetGestures('modal-drag-handle-bar', 'swipeable-modal-node', true);

  if (!DB.get('settings')) { startOnboarding(); } 
  else { refreshAppStateLabels(); renderWorkoutScreen(); handleBottomTabClick(0); }
});

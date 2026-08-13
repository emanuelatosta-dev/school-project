/* ==========================================================================
   TEACHER SUITE & STUDENT PORTAL MODULE
   Interactive Attendance Logger, Gradebook GPA Calculator, Lesson Planner,
   and Student Practice Quiz system.
   ========================================================================== */

// --- Attendance Module ---
const classStudentsData = {
  math101: [
    { id: 101, name: "Alexander Vance", roll: "2026-001", status: "present", notes: "Lab project leader" },
    { id: 102, name: "Beatrix Kiddo", roll: "2026-002", status: "present", notes: "" },
    { id: 103, name: "Carlos Santana", roll: "2026-003", status: "late", notes: "Arrived 5 mins late" },
    { id: 104, name: "Diana Prince", roll: "2026-004", status: "present", notes: "" },
    { id: 105, name: "Ethan Hunt", roll: "2026-005", status: "absent", notes: "Excused medical leave" },
    { id: 106, name: "Fiona Gallagher", roll: "2026-006", status: "present", notes: "" },
    { id: 107, name: "George Clark", roll: "2026-007", status: "present", notes: "" }
  ],
  cs202: [
    { id: 201, name: "Hannah Abbott", roll: "2026-050", status: "present", notes: "" },
    { id: 202, name: "Ian Malcolm", roll: "2026-051", status: "present", notes: "Submitted code bonus" },
    { id: 203, name: "Julia Roberts", roll: "2026-052", status: "present", notes: "" },
    { id: 204, name: "Kevin Bacon", roll: "2026-053", status: "late", notes: "Bus delay" },
    { id: 205, name: "Laura Croft", roll: "2026-054", status: "present", notes: "" }
  ],
  eng301: [
    { id: 301, name: "Mason Dixon", roll: "2026-090", status: "present", notes: "" },
    { id: 302, name: "Nina Simone", roll: "2026-091", status: "present", notes: "Essay presentation" },
    { id: 303, name: "Oscar Wilde", roll: "2026-092", status: "present", notes: "" },
    { id: 304, name: "Penelope Cruz", roll: "2026-093", status: "absent", notes: "" }
  ]
};

function initAttendanceModule() {
  const classSelect = document.getElementById('class-select');
  const tbody = document.getElementById('attendance-tbody');
  const currentDateStr = document.getElementById('current-date-str');
  const saveBtn = document.getElementById('btn-save-attendance');

  if (currentDateStr) {
    const today = new Date();
    currentDateStr.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (!classSelect || !tbody) return;

  function renderAttendance() {
    const selectedClass = classSelect.value;
    const students = classStudentsData[selectedClass] || [];
    tbody.innerHTML = '';

    students.forEach((st, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${st.name}</strong></td>
        <td><code>${st.roll}</code></td>
        <td>
          <div class="att-btn-group" data-id="${st.id}">
            <button class="att-btn ${st.status === 'present' ? 'active-present' : ''}" data-status="present">P</button>
            <button class="att-btn ${st.status === 'absent' ? 'active-absent' : ''}" data-status="absent">A</button>
            <button class="att-btn ${st.status === 'late' ? 'active-late' : ''}" data-status="late">L</button>
          </div>
        </td>
        <td><input type="text" class="form-control" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" value="${st.notes || ''}" placeholder="Add note..."></td>
      `;
      tbody.appendChild(tr);
    });

    // Attach button status listeners
    document.querySelectorAll('.att-btn-group').forEach(group => {
      const stId = parseInt(group.getAttribute('data-id'));
      group.querySelectorAll('.att-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const newStatus = e.target.getAttribute('data-status');
          const student = students.find(s => s.id === stId);
          if (student) {
            student.status = newStatus;
            if (window.soundEngine) window.soundEngine.playClick();
            renderAttendance();
            updateAttendanceStats(students);
          }
        });
      });
    });

    updateAttendanceStats(students);
  }

  function updateAttendanceStats(students) {
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    const total = students.length;
    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

    const presEl = document.getElementById('att-present-count');
    const absEl = document.getElementById('att-absent-count');
    const lateEl = document.getElementById('att-late-count');
    const rateEl = document.getElementById('att-percentage');

    if (presEl) presEl.textContent = present;
    if (absEl) absEl.textContent = absent;
    if (lateEl) lateEl.textContent = late;
    if (rateEl) rateEl.textContent = `${rate}%`;
  }

  classSelect.addEventListener('change', renderAttendance);

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      alert('Attendance recorded and synchronized to school database successfully!');
    });
  }

  renderAttendance();
}

// --- Gradebook Module ---
const gradebookStudents = [
  { name: "Alexander Vance", hw: 95, midterm: 88, final: 92 },
  { name: "Beatrix Kiddo", hw: 100, midterm: 96, final: 98 },
  { name: "Carlos Santana", hw: 80, midterm: 84, final: 82 },
  { name: "Diana Prince", hw: 92, midterm: 90, final: 94 },
  { name: "Ethan Hunt", hw: 75, midterm: 70, final: 78 },
  { name: "Fiona Gallagher", hw: 88, midterm: 85, final: 86 }
];

function initGradebookModule() {
  const tbody = document.getElementById('gradebook-tbody');
  const addBtn = document.getElementById('add-student-btn');

  if (!tbody) return;

  function calculateGrade(st) {
    // 20% HW, 40% Midterm, 40% Final
    const overall = (st.hw * 0.20) + (st.midterm * 0.40) + (st.final * 0.40);
    return Math.round(overall * 10) / 10;
  }

  function getLetterGrade(pct) {
    if (pct >= 93) return "A+";
    if (pct >= 90) return "A";
    if (pct >= 85) return "B+";
    if (pct >= 80) return "B";
    if (pct >= 75) return "C+";
    if (pct >= 70) return "C";
    return "F";
  }

  function renderGradebook() {
    tbody.innerHTML = '';
    let totalScore = 0;
    let maxScore = 0;
    let countA = 0, countB = 0, countC = 0;

    gradebookStudents.forEach(st => {
      const overall = calculateGrade(st);
      totalScore += overall;
      if (overall > maxScore) maxScore = overall;

      const letter = getLetterGrade(overall);
      if (letter.startsWith('A')) countA++;
      else if (letter.startsWith('B')) countB++;
      else countC++;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${st.name}</strong></td>
        <td>${st.hw}%</td>
        <td>${st.midterm}%</td>
        <td>${st.final}%</td>
        <td><strong style="color: var(--primary);">${overall}% (${letter})</strong></td>
      `;
      tbody.appendChild(tr);
    });

    const avg = gradebookStudents.length > 0 ? (totalScore / gradebookStudents.length).toFixed(1) : 0;
    const avgLetter = getLetterGrade(avg);

    const avgEl = document.getElementById('class-avg-display');
    const highEl = document.getElementById('class-highest-display');
    if (avgEl) avgEl.textContent = `${avg}% (${avgLetter})`;
    if (highEl) highEl.textContent = `${maxScore}% (${getLetterGrade(maxScore)})`;
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const name = prompt("Enter Student Name:");
      if (!name) return;
      const hw = parseFloat(prompt("Enter Homework Score (0-100):", "90")) || 90;
      const midterm = parseFloat(prompt("Enter Midterm Score (0-100):", "85")) || 85;
      const finalScore = parseFloat(prompt("Enter Final Score (0-100):", "88")) || 88;

      gradebookStudents.push({ name, hw, midterm, final: finalScore });
      if (window.soundEngine) window.soundEngine.playClick();
      renderGradebook();
    });
  }

  renderGradebook();
}

// --- Lesson Planner Module ---
const defaultLessons = [
  {
    title: "Newton's Third Law & Rocket Physics",
    subject: "Physics - Grade 10",
    date: "Aug 14, 2026",
    objective: "Understand force pairs and action-reaction pairs in rocket propulsion."
  },
  {
    title: "Python Data Structures: Lists & Dictionaries",
    subject: "Computer Science - Grade 11",
    date: "Aug 15, 2026",
    objective: "Master key-value mappings and dynamic array manipulations."
  }
];

function initLessonPlannerModule() {
  const saveBtn = document.getElementById('save-lesson-btn');
  const container = document.getElementById('saved-lessons-list');

  if (!container) return;

  function renderLessons() {
    container.innerHTML = '';
    defaultLessons.forEach(l => {
      const card = document.createElement('div');
      card.className = 'saved-lesson-item';
      card.innerHTML = `
        <h5>${l.title}</h5>
        <p style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">${l.subject} &bull; ${l.date}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${l.objective}</p>
      `;
      container.appendChild(card);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const title = document.getElementById('lesson-title').value.trim();
      const subject = document.getElementById('lesson-subject').value.trim();
      const obj = document.getElementById('lesson-objective').value.trim();

      if (!title || !subject) {
        alert('Please fill out the lesson title and subject!');
        return;
      }

      defaultLessons.unshift({
        title,
        subject,
        date: "Today",
        objective: obj || "Key learning milestones covered."
      });

      document.getElementById('lesson-title').value = '';
      document.getElementById('lesson-subject').value = '';
      document.getElementById('lesson-objective').value = '';
      document.getElementById('lesson-activities').value = '';

      if (window.soundEngine) window.soundEngine.playClick();
      renderLessons();
      alert('Lesson Plan saved successfully!');
    });
  }

  renderLessons();
}

// --- Practice Quiz Module ---
const quizQuestions = [
  {
    question: "Which Newton's Law states that for every action, there is an equal and opposite reaction?",
    options: ["First Law of Motion", "Second Law of Motion", "Third Law of Motion", "Law of Universal Gravitation"],
    answer: 2,
    explanation: "Newton's Third Law states that whenever one body exerts a force on a second body, the second body exerts an equal and opposite force."
  },
  {
    question: "What is the primary function of Mitochondria in a biological cell?",
    options: ["Protein synthesis", "Energy production (ATP)", "Cell division", "Lipid storage"],
    answer: 1,
    explanation: "Mitochondria generate most of the chemical energy (ATP) needed to power the cell's biochemical reactions."
  },
  {
    question: "In JavaScript, which operator is used for strict equality comparison without type coercion?",
    options: ["==", "=", "===", "=>"],
    answer: 2,
    explanation: "The triple equals (===) checks both value and data type without performing type coercion."
  },
  {
    question: "Who authored the famous classical tragedy 'Hamlet'?",
    options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
    answer: 1,
    explanation: "William Shakespeare wrote 'Hamlet' around 1600."
  }
];

function initQuizModule() {
  let currentIndex = 0;
  let score = 0;
  let answered = false;

  const qText = document.getElementById('quiz-question-text');
  const optContainer = document.getElementById('quiz-options-container');
  const feedback = document.getElementById('quiz-feedback');
  const badge = document.getElementById('quiz-progress-badge');
  const prevBtn = document.getElementById('prev-quiz-btn');
  const nextBtn = document.getElementById('next-quiz-btn');

  if (!qText || !optContainer) return;

  function renderQuestion() {
    const q = quizQuestions[currentIndex];
    answered = false;

    if (badge) badge.textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
    qText.textContent = q.question;
    feedback.className = 'quiz-feedback hidden';

    optContainer.innerHTML = '';
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.textContent = `${String.fromCharCode(65 + idx)}) ${optText}`;
      btn.addEventListener('click', () => handleAnswer(idx, btn));
      optContainer.appendChild(btn);
    });

    if (prevBtn) prevBtn.disabled = (currentIndex === 0);
    if (nextBtn) nextBtn.textContent = (currentIndex === quizQuestions.length - 1) ? 'Finish Quiz' : 'Next Question';
  }

  function handleAnswer(selectedIdx, btnEl) {
    if (answered) return;
    answered = true;

    const q = quizQuestions[currentIndex];
    const allBtns = optContainer.querySelectorAll('.quiz-opt-btn');

    if (selectedIdx === q.answer) {
      btnEl.classList.add('correct');
      feedback.className = 'quiz-feedback success';
      feedback.textContent = `Correct! ${q.explanation}`;
      score++;
      if (window.soundEngine) window.soundEngine.playCollect();
    } else {
      btnEl.classList.add('wrong');
      allBtns[q.answer].classList.add('correct');
      feedback.className = 'quiz-feedback error';
      feedback.textContent = `Incorrect. ${q.explanation}`;
      if (window.soundEngine) window.soundEngine.playCrash();
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < quizQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        alert(`Quiz Complete! Your Score: ${score} / ${quizQuestions.length}`);
        currentIndex = 0;
        score = 0;
        renderQuestion();
      }
    });
  }

  renderQuestion();
}

// Tab Switcher for Teacher Suite
function initSuiteTabSwitcher() {
  const tabs = document.querySelectorAll('.suite-tab-btn');
  const panes = document.querySelectorAll('.suite-pane');

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(tab => tab.classList.remove('active'));
      panes.forEach(pane => pane.classList.remove('active'));

      t.classList.add('active');
      const targetSuite = t.getAttribute('data-suite');
      const targetPane = document.getElementById(`suite-${targetSuite}`);
      if (targetPane) targetPane.classList.add('active');

      if (window.soundEngine) window.soundEngine.playClick();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAttendanceModule();
  initGradebookModule();
  initLessonPlannerModule();
  initQuizModule();
  initSuiteTabSwitcher();
});

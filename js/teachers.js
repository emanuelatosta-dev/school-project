/* ==========================================================================
   TEACHERS & FACULTY DIRECTORY MODULE
   Manages teacher profiles, department filtering, search indexing,
   and detail modal interactions.
   ========================================================================== */

const teachersData = [
  {
    id: 1,
    name: "Dr. Robert Vance",
    subject: "AP Physics C & Quantum Mechanics",
    dept: "stem",
    experience: "14 Years",
    degree: "Ph.D. in Theoretical Physics (Stanford)",
    email: "r.vance@apexhorizon.edu",
    officeHours: "Mon & Wed 3:00 PM - 4:30 PM (Room 302)",
    rating: "4.95 / 5",
    bio: "Dr. Vance leads our advanced physics research lab. He champions inquiry-driven experiments and coaches Apex Horizon's National Science Olympiad team to 5 consecutive championships.",
    avatar: "RV",
    awards: ["Teacher of the Year 2025", "NSF Innovation Educator"]
  },
  {
    id: 2,
    name: "Prof. Sarah Jenkins",
    subject: "AP Calculus BC & Linear Algebra",
    dept: "stem",
    experience: "11 Years",
    degree: "M.S. Applied Mathematics (MIT)",
    email: "s.jenkins@apexhorizon.edu",
    officeHours: "Tue & Thu 2:30 PM - 4:00 PM (Room 108)",
    rating: "4.92 / 5",
    bio: "Prof. Jenkins turns complex calculus into accessible, visual problem-solving journeys. Her students average a 4.8 score on AP Calculus exams.",
    avatar: "SJ",
    awards: ["Presidential Math Excellence Award"]
  },
  {
    id: 3,
    name: "Elena Rostova",
    subject: "Computer Science & Web Development",
    dept: "stem",
    experience: "8 Years",
    degree: "B.S. Computer Science (UC Berkeley)",
    email: "e.rostova@apexhorizon.edu",
    officeHours: "Daily 3:15 PM - 4:15 PM (Tech Lab B)",
    rating: "4.98 / 5",
    bio: "Elena worked as a senior software engineer before bringing real-world web architecture, algorithms, and AI ethics into the high school classroom.",
    avatar: "ER",
    awards: ["Tech Educator Pioneer 2026"]
  },
  {
    id: 4,
    name: "Marcus Holloway",
    subject: "AP World History & Civics",
    dept: "humanities",
    experience: "12 Years",
    degree: "M.A. Historical Studies (Columbia)",
    email: "m.holloway@apexhorizon.edu",
    officeHours: "Mon & Fri 2:00 PM - 3:30 PM (Room 214)",
    rating: "4.89 / 5",
    bio: "Marcus brings history alive through mock UN debates, primary document analysis, and multimedia historical storytelling.",
    avatar: "MH",
    awards: ["Humanities Educator Grantee"]
  },
  {
    id: 5,
    name: "Clara Beauchamp",
    subject: "AP Literature & Creative Writing",
    dept: "humanities",
    experience: "15 Years",
    degree: "M.F.A. Creative Writing (Iowa Workshop)",
    email: "c.beauchamp@apexhorizon.edu",
    officeHours: "Wed & Thu 3:00 PM - 4:30 PM (Library East Wing)",
    rating: "4.94 / 5",
    bio: "Clara mentors student authors, edits the Apex Horizon Literary Magazine, and fosters deep critical reading across classical and contemporary literature.",
    avatar: "CB",
    awards: ["National Endowment for Arts Fellow"]
  },
  {
    id: 6,
    name: "David Sterling",
    subject: "Symphonic Band & Music Theory",
    dept: "arts",
    experience: "10 Years",
    degree: "M.M. Music Performance (Juilliard)",
    email: "d.sterling@apexhorizon.edu",
    officeHours: "Tue & Fri 3:30 PM - 5:00 PM (Auditorium)",
    rating: "4.96 / 5",
    bio: "David directs our award-winning Orchestra and Jazz Ensemble. He believes music instills discipline, teamwork, and emotional resonance.",
    avatar: "DS",
    awards: ["State Music Director of Distinction"]
  },
  {
    id: 7,
    name: "Coach Mark Lawson",
    subject: "Athletics & Physical Education",
    dept: "sports",
    experience: "9 Years",
    degree: "B.S. Kinesiology (UCLA)",
    email: "m.lawson@apexhorizon.edu",
    officeHours: "Daily 7:00 AM - 8:00 AM (Gymnasium)",
    rating: "4.91 / 5",
    bio: "Coach Lawson emphasizes fitness, sportsmanship, and mental resilience. He coaches Varsity Basketball and Track & Field.",
    avatar: "ML",
    awards: ["Coach of the Season 2025"]
  },
  {
    id: 8,
    name: "Hannah Nguyen",
    subject: "Special Education & Inclusive Learning",
    dept: "special",
    experience: "13 Years",
    degree: "M.Ed. Special Education (Vanderbilt)",
    email: "h.nguyen@apexhorizon.edu",
    officeHours: "Daily by appointment (Resource Hub 102)",
    rating: "4.99 / 5",
    bio: "Hannah designs individualized education plans (IEPs), ensuring every neurodivergent student receives tailored support and assistive learning tools.",
    avatar: "HN",
    awards: ["Inclusive Educator of the Year"]
  }
];

function initTeachersDirectory() {
  const teachersGrid = document.getElementById('teachers-grid');
  const searchInput = document.getElementById('teacher-search');
  const filterChips = document.querySelectorAll('#department-filters .chip');
  
  if (!teachersGrid) return;

  let currentDept = 'all';
  let searchQuery = '';

  function renderTeachers() {
    teachersGrid.innerHTML = '';

    const filtered = teachersData.filter(t => {
      const matchDept = (currentDept === 'all' || t.dept === currentDept);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.name.toLowerCase().includes(q) || 
        t.subject.toLowerCase().includes(q) || 
        t.degree.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });

    if (filtered.length === 0) {
      teachersGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
          <i class="fa-solid fa-user-slash" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No Teachers Found</h3>
          <p style="color: var(--text-muted);">Try adjusting your search query or department filter.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'teacher-card';
      card.innerHTML = `
        <div class="teacher-card-header">
          <div class="teacher-avatar">${t.avatar}</div>
          <div class="teacher-meta">
            <h3>${t.name}</h3>
            <span class="teacher-subject">${t.subject}</span>
          </div>
        </div>
        <div class="teacher-card-body">
          <div>
            <div class="teacher-info-item">
              <i class="fa-solid fa-graduation-cap"></i> ${t.degree}
            </div>
            <div class="teacher-info-item">
              <i class="fa-solid fa-briefcase"></i> ${t.experience} Experience
            </div>
            <div class="teacher-info-item">
              <i class="fa-solid fa-clock"></i> ${t.officeHours}
            </div>
          </div>
        </div>
        <div class="teacher-card-footer">
          <span class="badge badge-accent"><i class="fa-solid fa-star"></i> ${t.rating}</span>
          <button class="btn btn-outline btn-sm view-teacher-btn" data-id="${t.id}">
            View Profile & Contact
          </button>
        </div>
      `;
      teachersGrid.appendChild(card);
    });

    // Attach Click Event to Modal Buttons
    document.querySelectorAll('.view-teacher-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        openTeacherModal(id);
      });
    });
  }

  // Filter Chips Listeners
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentDept = chip.getAttribute('data-dept');
      if (window.soundEngine) window.soundEngine.playClick();
      renderTeachers();
    });
  });

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTeachers();
    });
  }

  renderTeachers();
}

function openTeacherModal(teacherId) {
  const teacher = teachersData.find(t => t.id === teacherId);
  const modal = document.getElementById('teacher-modal');
  const modalBody = document.getElementById('modal-body');
  if (!teacher || !modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-teacher-header">
      <div class="modal-teacher-avatar">${teacher.avatar}</div>
      <div>
        <h2>${teacher.name}</h2>
        <span class="teacher-subject" style="font-size: 1.05rem;">${teacher.subject}</span>
        <div style="margin-top: 0.4rem;">
          <span class="badge badge-accent"><i class="fa-solid fa-star"></i> Rating: ${teacher.rating}</span>
          <span class="badge badge-info"><i class="fa-solid fa-award"></i> ${teacher.experience} Experience</span>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="margin-bottom: 0.5rem; color: var(--primary);">Academic Background & Credentials</h4>
      <p style="color: var(--text-muted); font-size: 0.95rem;">${teacher.degree}</p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="margin-bottom: 0.5rem; color: var(--primary);"><i class="fa-solid fa-user"></i> About Me & Teaching Philosophy</h4>
      <p style="color: var(--text-main); line-height: 1.6; font-size: 0.95rem;">${teacher.bio}</p>
    </div>

    ${teacher.hobbies ? `
    <div style="margin-bottom: 1.5rem; background: var(--primary-light); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary);">
      <h5 style="color: var(--primary); margin-bottom: 0.25rem;"><i class="fa-solid fa-icons"></i> Personal Hobbies & Fun Facts</h5>
      <p style="font-size: 0.9rem; color: var(--text-main);">${teacher.hobbies}</p>
    </div>
    ` : ''}

    <div style="margin-bottom: 1.5rem;">
      <h4 style="margin-bottom: 0.5rem; color: var(--primary);">Office Hours & Contact</h4>
      <p style="font-size: 0.9rem;"><strong>Office Hours:</strong> ${teacher.officeHours}</p>
      <p style="font-size: 0.9rem;"><strong>Email:</strong> <a href="mailto:${teacher.email}">${teacher.email}</a></p>
    </div>

    <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
      <h4 style="margin-bottom: 0.75rem;"><i class="fa-solid fa-paper-plane"></i> Send Direct Message to ${teacher.name.split(' ')[1] || teacher.name}</h4>
      <form id="direct-msg-form">
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <input type="email" class="form-control" placeholder="Your Email Address" required>
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <textarea class="form-control" rows="3" placeholder="Write your message or question..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-sm btn-block"><i class="fa-solid fa-paper-plane"></i> Send Message</button>
        <div id="modal-form-toast" class="form-toast hidden" style="margin-top: 0.75rem;"></div>
      </form>
    </div>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  if (window.soundEngine) window.soundEngine.playClick();

  // Attach Direct Msg Form submit
  const msgForm = document.getElementById('direct-msg-form');
  const toast = document.getElementById('modal-form-toast');
  if (msgForm) {
    msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (toast) {
        toast.className = 'form-toast success';
        toast.textContent = `Message sent successfully to ${teacher.name}!`;
        toast.classList.remove('hidden');
        msgForm.reset();
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 3000);
      }
    });
  }
}

function initModalClose() {
  const modal = document.getElementById('teacher-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

window.teachersData = teachersData;
window.initTeachersDirectory = initTeachersDirectory;

document.addEventListener('DOMContentLoaded', () => {
  initTeachersDirectory();
  initModalClose();
});

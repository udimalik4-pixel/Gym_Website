// ====== STATE ======
let gymData = null;
let allSchedules = [];
let activeCategory = 'all';
let activeDay = 'all';

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  loadGym();
  loadMemberships();
  loadTrainers();
  loadSchedules();
  initScrollNav();
});

function initScrollNav() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav?.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ====== TOAST ======
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ====== MODAL HELPERS ======
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ====== GYM ======
async function loadGym() {
  try {
    gymData = await api.get('/gym');
    renderGym(gymData);
  } catch (e) {
    showToast('Failed to load gym data', 'error');
  }
}

function renderGym(g) {
  document.getElementById('gymName').textContent = g.name;
  document.getElementById('gymAbout').textContent = g.about;
  document.getElementById('gymAddress').textContent = g.address;
  document.getElementById('gymPhone').textContent = g.phone;
  document.getElementById('gymEmail').textContent = g.email;
  document.getElementById('gymWeekdays').textContent = g.hours?.weekdays || '—';
  document.getElementById('gymWeekends').textContent = g.hours?.weekends || '—';
  document.getElementById('gymHolidays').textContent = g.hours?.holidays || '—';
  document.getElementById('footerAddress').textContent = `© ${new Date().getFullYear()} ${g.name}. All rights reserved.`;
  const grid = document.getElementById('amenitiesGrid');
  grid.innerHTML = (g.amenities || []).map(a => `<span class="amenity-tag">${a}</span>`).join('');
}

function openEditGymModal() {
  if (!gymData) return;
  document.getElementById('editGymId').value = gymData._id;
  document.getElementById('editGymName').value = gymData.name;
  document.getElementById('editGymTagline').value = gymData.tagline || '';
  document.getElementById('editGymAddress').value = gymData.address;
  document.getElementById('editGymPhone').value = gymData.phone;
  document.getElementById('editGymEmail').value = gymData.email;
  document.getElementById('editGymAboutText').value = gymData.about || '';
  document.getElementById('editGymWeekdays').value = gymData.hours?.weekdays || '';
  document.getElementById('editGymWeekends').value = gymData.hours?.weekends || '';
  document.getElementById('editGymHolidays').value = gymData.hours?.holidays || '';
  document.getElementById('editGymAmenities').value = (gymData.amenities || []).join(', ');
  openModal('editGymModal');
}

async function submitEditGym(e) {
  e.preventDefault();
  const id = document.getElementById('editGymId').value;
  const data = {
    name: document.getElementById('editGymName').value,
    tagline: document.getElementById('editGymTagline').value,
    address: document.getElementById('editGymAddress').value,
    phone: document.getElementById('editGymPhone').value,
    email: document.getElementById('editGymEmail').value,
    about: document.getElementById('editGymAboutText').value,
    hours: {
      weekdays: document.getElementById('editGymWeekdays').value,
      weekends: document.getElementById('editGymWeekends').value,
      holidays: document.getElementById('editGymHolidays').value,
    },
    amenities: document.getElementById('editGymAmenities').value.split(',').map(a => a.trim()).filter(Boolean)
  };
  try {
    gymData = await api.put(`/gym/${id}`, data);
    renderGym(gymData);
    closeModal('editGymModal');
    showToast('Gym details updated!');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ====== MEMBERSHIPS ======
async function loadMemberships() {
  try {
    const plans = await api.get('/memberships');
    renderMemberships(plans);
  } catch (e) {
    document.getElementById('plansGrid').innerHTML = '<p style="color:var(--text-dim);text-align:center">Failed to load plans</p>';
  }
}

function renderMemberships(plans) {
  const grid = document.getElementById('plansGrid');
  if (!plans.length) { grid.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:40px">No plans yet. Add one!</p>'; return; }
  grid.innerHTML = plans.map(p => `
    <div class="plan-card ${p.highlighted ? 'highlighted' : ''}">
      <div class="plan-color-bar" style="background:${p.color}"></div>
      <div class="plan-name">${p.name.toUpperCase()}</div>
      <div class="plan-price">₹${p.price.toLocaleString()}<span>/mo</span></div>
      <div class="plan-duration">PER MONTH · CANCEL ANYTIME</div>
      <ul class="plan-features">
        ${(p.features || []).map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="plan-actions">
        <button class="btn-edit" onclick="openEditMembershipModal('${p._id}')">Edit</button>
        <button class="btn-danger" onclick="deleteMembership('${p._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function openAddMembershipModal() {
  document.getElementById('membershipModalTitle').textContent = 'Add Membership Plan';
  document.getElementById('membershipId').value = '';
  document.getElementById('membershipName').value = '';
  document.getElementById('membershipPrice').value = '';
  document.getElementById('membershipColor').value = '#F59E0B';
  document.getElementById('membershipFeatures').value = '';
  document.getElementById('membershipHighlighted').checked = false;
  openModal('addMembershipModal');
}

async function openEditMembershipModal(id) {
  try {
    const plan = await api.get(`/memberships/${id}`);
    document.getElementById('membershipModalTitle').textContent = 'Edit Plan';
    document.getElementById('membershipId').value = plan._id;
    document.getElementById('membershipName').value = plan.name;
    document.getElementById('membershipPrice').value = plan.price;
    document.getElementById('membershipColor').value = plan.color;
    document.getElementById('membershipFeatures').value = (plan.features || []).join('\n');
    document.getElementById('membershipHighlighted').checked = plan.highlighted;
    openModal('addMembershipModal');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function submitMembership(e) {
  e.preventDefault();
  const id = document.getElementById('membershipId').value;
  const data = {
    name: document.getElementById('membershipName').value,
    price: Number(document.getElementById('membershipPrice').value),
    color: document.getElementById('membershipColor').value,
    features: document.getElementById('membershipFeatures').value.split('\n').map(f => f.trim()).filter(Boolean),
    highlighted: document.getElementById('membershipHighlighted').checked
  };
  try {
    if (id) {
      await api.put(`/memberships/${id}`, data);
      showToast('Plan updated!');
    } else {
      await api.post('/memberships', data);
      showToast('Plan added!');
    }
    closeModal('addMembershipModal');
    loadMemberships();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteMembership(id) {
  if (!confirm('Delete this membership plan?')) return;
  try {
    await api.delete(`/memberships/${id}`);
    showToast('Plan deleted');
    loadMemberships();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ====== TRAINERS ======
const avatarColors = ['#e8c547', '#e84747', '#47c5e8', '#c547e8'];

async function loadTrainers() {
  try {
    const trainers = await api.get('/trainers');
    renderTrainers(trainers);
  } catch (e) {
    document.getElementById('trainersGrid').innerHTML = '<p style="color:var(--text-dim);text-align:center">Failed to load trainers</p>';
  }
}

function renderTrainers(trainers) {
  const grid = document.getElementById('trainersGrid');
  if (!trainers.length) { grid.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:40px">No trainers yet.</p>'; return; }
  grid.innerHTML = trainers.map((t, i) => `
    <div class="trainer-card">
      <div class="trainer-avatar" style="border-color:${avatarColors[i % 4]};color:${avatarColors[i % 4]}">
        ${t.name.charAt(0)}
      </div>
      <div>
        <div class="trainer-name">${t.name.toUpperCase()}</div>
        <div class="trainer-title">${t.title}</div>
        <p class="trainer-bio">${t.bio || ''}</p>
        <div class="trainer-tags">
          ${(t.specialties || []).map(s => `<span class="trainer-tag">${s}</span>`).join('')}
        </div>
        <div class="trainer-meta">
          <span>⭐ ${t.experience}y exp</span>
          <span>📅 ${t.availability || 'Flexible'}</span>
          ${t.instagram ? `<span>${t.instagram}</span>` : ''}
        </div>
        <div class="trainer-actions">
          <button class="btn-edit" onclick="openEditTrainerModal('${t._id}')">Edit</button>
          <button class="btn-danger" onclick="deleteTrainer('${t._id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddTrainerModal() {
  document.getElementById('trainerModalTitle').textContent = 'Add Trainer';
  document.getElementById('trainerId').value = '';
  ['trainerName','trainerTitle','trainerExp','trainerAvailability','trainerSpecialties','trainerCerts','trainerBio','trainerInstagram']
    .forEach(id => document.getElementById(id).value = '');
  openModal('addTrainerModal');
}

async function openEditTrainerModal(id) {
  try {
    const t = await api.get(`/trainers/${id}`);
    document.getElementById('trainerModalTitle').textContent = 'Edit Trainer';
    document.getElementById('trainerId').value = t._id;
    document.getElementById('trainerName').value = t.name;
    document.getElementById('trainerTitle').value = t.title;
    document.getElementById('trainerExp').value = t.experience;
    document.getElementById('trainerAvailability').value = t.availability || '';
    document.getElementById('trainerSpecialties').value = (t.specialties || []).join(', ');
    document.getElementById('trainerCerts').value = (t.certifications || []).join(', ');
    document.getElementById('trainerBio').value = t.bio || '';
    document.getElementById('trainerInstagram').value = t.instagram || '';
    openModal('addTrainerModal');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function submitTrainer(e) {
  e.preventDefault();
  const id = document.getElementById('trainerId').value;
  const data = {
    name: document.getElementById('trainerName').value,
    title: document.getElementById('trainerTitle').value,
    experience: Number(document.getElementById('trainerExp').value),
    availability: document.getElementById('trainerAvailability').value,
    specialties: document.getElementById('trainerSpecialties').value.split(',').map(s => s.trim()).filter(Boolean),
    certifications: document.getElementById('trainerCerts').value.split(',').map(c => c.trim()).filter(Boolean),
    bio: document.getElementById('trainerBio').value,
    instagram: document.getElementById('trainerInstagram').value
  };
  try {
    if (id) { await api.put(`/trainers/${id}`, data); showToast('Trainer updated!'); }
    else { await api.post('/trainers', data); showToast('Trainer added!'); }
    closeModal('addTrainerModal');
    loadTrainers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTrainer(id) {
  if (!confirm('Delete this trainer?')) return;
  try {
    await api.delete(`/trainers/${id}`);
    showToast('Trainer deleted');
    loadTrainers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ====== SCHEDULE ======
async function loadSchedules() {
  try {
    allSchedules = await api.get('/schedules');
    renderSchedules();
  } catch (e) {
    document.getElementById('scheduleBody').innerHTML = '<tr><td colspan="8" class="loading-cell">Failed to load schedule</td></tr>';
  }
}

function filterSchedule(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSchedules();
}

function selectDay(day, btn) {
  activeDay = day;
  document.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSchedules();
}

function renderSchedules() {
  const tbody = document.getElementById('scheduleBody');
  let filtered = allSchedules;
  if (activeCategory !== 'all') filtered = filtered.filter(s => s.category === activeCategory);
  if (activeDay !== 'all') filtered = filtered.filter(s => s.day === activeDay);
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No classes found</td></tr>';
    return;
  }
  const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  filtered.sort((a,b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">${s.time}</td>
      <td style="font-weight:500">${s.className}</td>
      <td style="color:var(--text-dim);font-size:13px">${s.trainer}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim)">${s.day}</td>
      <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim)">${s.duration}min</td>
      <td><span class="category-badge cat-${s.category}">${s.category}</span></td>
      <td style="color:var(--text-dim);font-size:13px">${s.room || '—'}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-edit" onclick="openEditScheduleModal('${s._id}')">Edit</button>
          <button class="btn-danger" onclick="deleteSchedule('${s._id}')">Del</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddScheduleModal() {
  document.getElementById('scheduleModalTitle').textContent = 'Add Class';
  document.getElementById('scheduleId').value = '';
  ['scheduleClassName','scheduleTime','scheduleTrainer','scheduleDuration','scheduleCapacity','scheduleRoom']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('scheduleDay').value = '';
  document.getElementById('scheduleCategory').value = 'HIIT';
  openModal('addScheduleModal');
}

async function openEditScheduleModal(id) {
  try {
    const s = await api.get(`/schedules/${id}`);
    document.getElementById('scheduleModalTitle').textContent = 'Edit Class';
    document.getElementById('scheduleId').value = s._id;
    document.getElementById('scheduleClassName').value = s.className;
    document.getElementById('scheduleDay').value = s.day;
    document.getElementById('scheduleTime').value = s.time;
    document.getElementById('scheduleTrainer').value = s.trainer;
    document.getElementById('scheduleDuration').value = s.duration;
    document.getElementById('scheduleCapacity').value = s.capacity;
    document.getElementById('scheduleCategory').value = s.category;
    document.getElementById('scheduleRoom').value = s.room || '';
    openModal('addScheduleModal');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function submitSchedule(e) {
  e.preventDefault();
  const id = document.getElementById('scheduleId').value;
  const data = {
    className: document.getElementById('scheduleClassName').value,
    day: document.getElementById('scheduleDay').value,
    time: document.getElementById('scheduleTime').value,
    trainer: document.getElementById('scheduleTrainer').value,
    duration: Number(document.getElementById('scheduleDuration').value),
    capacity: Number(document.getElementById('scheduleCapacity').value),
    category: document.getElementById('scheduleCategory').value,
    room: document.getElementById('scheduleRoom').value
  };
  try {
    if (id) { await api.put(`/schedules/${id}`, data); showToast('Class updated!'); }
    else { await api.post('/schedules', data); showToast('Class added!'); }
    closeModal('addScheduleModal');
    loadSchedules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteSchedule(id) {
  if (!confirm('Delete this class?')) return;
  try {
    await api.delete(`/schedules/${id}`);
    showToast('Class deleted');
    loadSchedules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

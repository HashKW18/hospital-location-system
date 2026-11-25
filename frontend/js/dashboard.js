/**
 * HealthWay Hospital - Dashboard Controller (User, Staff & Admin)
 * Powers Photos 19, 21, and 23 with full management capabilities
 */

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  if (path.includes('user-dashboard')) {
    if (auth.protectPage(['REGISTERED_USER', 'STAFF', 'ADMIN'])) {
      await initUserDashboard();
    }
  } else if (path.includes('staff-dashboard')) {
    if (auth.protectPage(['STAFF', 'ADMIN'])) {
      await initStaffDashboard();
    }
  } else if (path.includes('admin-dashboard')) {
    if (auth.protectPage(['ADMIN'])) {
      await initAdminDashboard();
    }
  }
});

// Switch active sidebar tabs in dashboards
function switchDashTab(tabId, clickedElement) {
  document.querySelectorAll('.dash-nav-link').forEach(link => link.classList.remove('active'));
  if (clickedElement) clickedElement.classList.add('active');

  document.querySelectorAll('.dash-tab-pane').forEach(pane => pane.classList.remove('active'));
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.add('active');
}

/* =========================================================
   1. USER DASHBOARD (Photo 19)
   ========================================================= */
async function initUserDashboard() {
  const user = api.getCurrentUser();
  if (!user) return;

  renderUserProfileDisplay(user);

  await loadUserCampRegistrations();
  await loadUserFavorites();
  await loadUserFeedbackSummary();
}

function renderUserProfileDisplay(user) {
  if (!user) return;

  // Defaults if not set yet
  const blood = user.bloodGroup || 'O+';
  const age = user.age || 35;
  const height = user.height || 178;
  const weight = user.weight || 74;

  const greetingEl = document.getElementById('user-greeting-name');
  if (greetingEl) greetingEl.innerText = `Welcome back, ${user.fullName}!`;

  // Dynamic user initial
  const initial = user.fullName ? user.fullName.trim().charAt(0).toUpperCase() : 'U';

  // Update Topbar User Name and Avatar Circle (Right Side Corner)
  const topbarName = document.getElementById('topbar-user-name');
  if (topbarName) topbarName.innerText = user.fullName;
  const topbarAvatar = document.getElementById('topbar-avatar');
  if (topbarAvatar) topbarAvatar.innerText = initial;

  // Update Sidebar User Name and Avatar Circle
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.innerText = user.fullName;
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.innerText = initial;

  // Update Vital Strip in Banner
  const vBlood = document.getElementById('vital-blood');
  if (vBlood) vBlood.innerText = blood;
  const vAge = document.getElementById('vital-age');
  if (vAge) vAge.innerText = `${age} Yrs`;
  const vHeight = document.getElementById('vital-height');
  if (vHeight) vHeight.innerText = `${height} cm`;
  const vWeight = document.getElementById('vital-weight');
  if (vWeight) vWeight.innerText = `${weight} kg`;

  // Update Overview Cards
  const cBlood = document.getElementById('card-blood');
  if (cBlood) cBlood.innerText = blood;
  const cAge = document.getElementById('card-age');
  if (cAge) cAge.innerText = `• ${age} Yrs`;
  const cHeight = document.getElementById('card-height');
  if (cHeight) cHeight.innerText = height;
  const cWeight = document.getElementById('card-weight');
  if (cWeight) cWeight.innerText = weight;
}

function openEditProfileModal() {
  const user = api.getCurrentUser() || {};
  document.getElementById('edit-user-fullname').value = user.fullName || '';
  document.getElementById('edit-user-phone').value = user.phoneNumber || '';
  document.getElementById('edit-user-blood').value = user.bloodGroup || 'O+';
  document.getElementById('edit-user-age').value = user.age || 35;
  document.getElementById('edit-user-height').value = user.height || 178;
  document.getElementById('edit-user-weight').value = user.weight || 74;
  openModal('user-edit-profile-modal');
}

async function submitEditProfile() {
  const fullName = document.getElementById('edit-user-fullname').value.trim();
  const phone = document.getElementById('edit-user-phone').value.trim();
  const bloodGroup = document.getElementById('edit-user-blood').value;
  const age = parseInt(document.getElementById('edit-user-age').value) || 35;
  const height = parseInt(document.getElementById('edit-user-height').value) || 178;
  const weight = parseInt(document.getElementById('edit-user-weight').value) || 74;

  if (!fullName) {
    alert('Please enter your full name.');
    return;
  }

  let user = api.getCurrentUser();
  if (!user) {
    user = { userId: 4, email: 'alex.carter@gmail.com', role: 'REGISTERED_USER' };
  }

  user.fullName = fullName;
  user.phoneNumber = phone;
  user.bloodGroup = bloodGroup;
  user.age = age;
  user.height = height;
  user.weight = weight;

  // Persist locally
  localStorage.setItem('hw_current_user', JSON.stringify(user));

  // Also update in users list if present
  try {
    const users = JSON.parse(localStorage.getItem('hw_mock_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId || u.email === user.email);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
      localStorage.setItem('hw_mock_users', JSON.stringify(users));
    }
  } catch (e) {}

  renderUserProfileDisplay(user);
  closeModal('user-edit-profile-modal');
  showToast('Profile & health metrics updated successfully!', 'success');
}

async function loadUserCampRegistrations() {
  const container = document.getElementById('user-camp-registrations');
  const fullContainer = document.getElementById('user-all-camps-list');
  if (!container && !fullContainer) return;

  try {
    const regs = await api.getMyCampRegistrations();
    if (regs.length === 0) {
      const emptyHtml = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); background: #f8fafc; border-radius: 8px;">
          <p>You have not registered for any upcoming medical camps yet.</p>
          <a href="medical-camps.html" class="btn btn-outline btn-sm" style="margin-top: 10px;">Explore Medical Camps</a>
        </div>
      `;
      if (container) container.innerHTML = emptyHtml;
      if (fullContainer) fullContainer.innerHTML = emptyHtml;
      return;
    }

    const html = regs.map(r => `
      <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span class="badge ${r.registrationStatus === 'CONFIRMED' ? 'badge-green' : 'badge-gray'}">${r.registrationStatus}</span>
          <h4 style="color: #0b2545; margin-top: 6px;">${r.campName}</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            <i class="far fa-calendar-alt"></i> ${r.campDate} (${r.campTime}) &bull; <i class="fas fa-map-marker-alt"></i> ${r.locationName}
          </p>
        </div>
        <div>
          ${r.registrationStatus === 'CONFIRMED' ? `
            <button onclick="cancelMyRegistration(${r.registrationId})" class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fca5a5;">
              Cancel
            </button>
          ` : '<span style="color: var(--text-light); font-size: 0.85rem;">Cancelled</span>'}
        </div>
      </div>
    `).join('');

    if (container) container.innerHTML = html;
    if (fullContainer) fullContainer.innerHTML = html;

    const campCardEl = document.getElementById('card-camp-count');
    if (campCardEl) {
      const activeCount = regs.filter(r => r.registrationStatus === 'CONFIRMED').length;
      campCardEl.innerHTML = `${activeCount} <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">Active</span>`;
    }
  } catch (err) {
    if (container) container.innerHTML = `<p style="color: var(--danger);">${err.message}</p>`;
  }
}

async function cancelMyRegistration(regId) {
  if (!confirm('Are you sure you want to cancel your registration for this medical camp?')) return;
  try {
    await api.cancelCampRegistration(regId);
    showToast('Registration cancelled', 'success');
    await loadUserCampRegistrations();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function loadUserFavorites() {
  const container = document.getElementById('user-favorite-locations');
  const fullContainer = document.getElementById('user-favorite-locations-full');
  if (!container && !fullContainer) return;

  try {
    const favs = await api.getMyFavorites();
    if (favs.length === 0) {
      const emptyHtml = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); background: #f8fafc; border-radius: 8px;">
          <p>No saved hospital bookmarks yet. Click the heart icon on any department in Find Locations to save it here!</p>
          <a href="locations.html" class="btn btn-outline btn-sm" style="margin-top: 10px;">Find Hospital Locations</a>
        </div>
      `;
      if (container) container.innerHTML = emptyHtml;
      if (fullContainer) fullContainer.innerHTML = emptyHtml;
      return;
    }

    const previewHtml = favs.slice(0, 4).map(f => `
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h5 style="color: #0f172a; margin-bottom: 2px;">${f.locationName}</h5>
          <span style="font-size: 0.82rem; color: var(--text-muted);">${f.building}, ${f.floor}</span>
        </div>
        <a href="locations.html?search=${encodeURIComponent(f.locationName)}" class="btn btn-outline btn-sm">
          Navigate
        </a>
      </div>
    `).join('');
    if (container) container.innerHTML = previewHtml;

    const favCardEl = document.getElementById('card-fav-count');
    if (favCardEl) {
      favCardEl.innerHTML = `${favs.length} <span style="font-size: 0.85rem; font-weight: 600; color: #f59e0b;">Saved</span>`;
    }

    if (fullContainer) {
      fullContainer.innerHTML = favs.map(f => `
        <div class="card" style="padding: 20px;">
          <span class="badge badge-blue" style="margin-bottom: 8px;">${f.category}</span>
          <h3 class="card-title" style="margin-bottom: 6px;">${f.locationName}</h3>
          <div class="card-meta">
            <i class="fas fa-map-marker-alt" style="color: var(--primary);"></i>
            <span>${f.building}, ${f.floor} ${f.roomNumber ? `(${f.roomNumber})` : ''}</span>
          </div>
          <p class="card-description" style="margin: 8px 0 16px 0;">${f.description || 'Specialized clinical hospital facility.'}</p>
          <div class="card-footer" style="padding-top: 12px;">
            <a href="locations.html?search=${encodeURIComponent(f.locationName)}" class="btn btn-primary btn-sm" style="flex: 1;">
              <i class="fas fa-location-arrow"></i> Directions
            </a>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    if (container) container.innerHTML = `<p>${err.message}</p>`;
  }
}

async function loadUserFeedbackSummary() {
  const container = document.getElementById('user-recent-feedback');
  const fullContainer = document.getElementById('user-full-feedback-history');
  if (!container && !fullContainer) return;

  try {
    const fbs = await api.getMyFeedback();
    if (fbs.length === 0) {
      const emptyHtml = `<p style="color: var(--text-muted); font-size: 0.9rem;">No feedback submitted yet.</p>`;
      if (container) container.innerHTML = emptyHtml;
      if (fullContainer) fullContainer.innerHTML = emptyHtml;
      return;
    }

    if (container) {
      container.innerHTML = fbs.slice(0, 3).map(fb => `
        <div style="border-left: 3px solid ${fb.status === 'RESOLVED' ? '#10b981' : '#f59e0b'}; padding-left: 12px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
            <strong style="color: #0b2545;">${fb.category.replace('_', ' ')}</strong>
            <span class="badge ${fb.status === 'RESOLVED' ? 'badge-green' : 'badge-yellow'}">${fb.status}</span>
          </div>
          <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">"${fb.message}"</p>
        </div>
      `).join('');
    }

    if (fullContainer) {
      fullContainer.innerHTML = fbs.map(fb => `
        <div class="card" style="margin-bottom: 16px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <span class="badge ${fb.status === 'RESOLVED' ? 'badge-green' : (fb.status === 'UNDER_REVIEW' ? 'badge-blue' : 'badge-yellow')}">
                ${fb.status.replace('_', ' ')}
              </span>
              <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 10px;">${fb.category.replace('_', ' ')}</span>
            </div>
            <div style="color: #f59e0b;">${'★'.repeat(fb.rating || 5)}</div>
          </div>
          <p style="color: #334155; font-size: 0.95rem; margin-bottom: 10px;">"${fb.message}"</p>
          ${fb.staffResponse ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px;">
              <strong style="font-size: 0.8rem; color: #047857; text-transform: uppercase;">Hospital Staff Response:</strong>
              <p style="color: #065f46; font-size: 0.9rem; margin-top: 4px;">${fb.staffResponse}</p>
            </div>
          ` : '<span style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Awaiting staff review</span>'}
        </div>
      `).join('');
    }
  } catch (e) {}
}

/* =========================================================
   2. STAFF DASHBOARD (Photo 21 / Image 3)
   ========================================================= */
let staffAppointments = [];

async function initStaffDashboard() {
  loadStaffUserProfile();
  loadStaffMetrics();
  await loadStaffAppointments();
  loadStaffWards();
  loadStaffTasks();
  await loadStaffCampsTable();
  await loadStaffFeedbackTable();
}

/* Staff Profile Management (Edit & Display Account in Right-Side Corner) */
function loadStaffUserProfile() {
  const user = api.getCurrentUser() || { fullName: 'Dr. Sarah Jenkins', role: 'STAFF', email: 'staff.sarah@healthway.hospital', department: 'Cardiology', activeShift: '08:00 AM - 04:00 PM' };
  
  // Calculate initials (e.g. "Dr. Sarah Jenkins" -> "SJ", "Nurse Marcus" -> "MB")
  const cleanName = user.fullName.replace(/^(Dr\.|Nurse|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
  const parts = cleanName.split(/\s+/);
  let initial = 'SJ';
  if (parts.length >= 2) {
    initial = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initial = parts[0].substring(0, 2).toUpperCase();
  }

  // Update Topbar (Right Side Corner)
  const topbarName = document.getElementById('staff-topbar-name');
  if (topbarName) topbarName.innerText = user.fullName;
  const topbarAvatar = document.getElementById('staff-topbar-avatar');
  if (topbarAvatar) topbarAvatar.innerText = initial;

  // Update Sidebar
  const sidebarName = document.getElementById('staff-sidebar-name');
  if (sidebarName) sidebarName.innerText = user.fullName;
  const sidebarAvatar = document.getElementById('staff-sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.innerText = initial;
  const sidebarDept = document.getElementById('staff-sidebar-dept');
  if (sidebarDept) sidebarDept.innerText = user.department || 'Cardiology';

  // Update Welcome Banner Greeting
  const greetingEl = document.getElementById('staff-greeting-name');
  if (greetingEl) greetingEl.innerText = `Welcome back, ${user.fullName}!`;

  // Update Topbar Ward Badge
  const topbarBadge = document.getElementById('staff-topbar-ward-badge');
  if (topbarBadge && user.department) topbarBadge.innerText = `${user.department} - Level 3`;
}

function openStaffEditProfileModal() {
  const user = api.getCurrentUser() || { fullName: 'Dr. Sarah Jenkins', role: 'STAFF', email: 'staff.sarah@healthway.hospital', phoneNumber: '+94 77 234 5678', department: 'Cardiology Ward A', activeShift: '08:00 AM - 04:00 PM' };
  document.getElementById('edit-staff-fullname').value = user.fullName || '';
  document.getElementById('edit-staff-email').value = user.email || '';
  document.getElementById('edit-staff-phone').value = user.phoneNumber || '';
  document.getElementById('edit-staff-department').value = user.department || 'Cardiology Ward A';
  document.getElementById('edit-staff-shift-field').value = user.activeShift || '08:00 AM - 04:00 PM';
  document.getElementById('edit-staff-password').value = '';
  openModal('staff-edit-profile-modal');
}

async function submitStaffEditProfile() {
  const fullName = document.getElementById('edit-staff-fullname').value.trim();
  const phone = document.getElementById('edit-staff-phone').value.trim();
  const department = document.getElementById('edit-staff-department').value.trim();
  const shift = document.getElementById('edit-staff-shift-field').value.trim();
  const password = document.getElementById('edit-staff-password').value;

  if (!fullName) {
    alert('Please enter your full name.');
    return;
  }

  let user = api.getCurrentUser();
  if (!user) {
    user = { userId: 2, role: 'STAFF', email: 'staff.sarah@healthway.hospital', fullName: 'Dr. Sarah Jenkins' };
  }

  user.fullName = fullName;
  user.phoneNumber = phone;
  user.department = department;
  user.activeShift = shift;

  // Persist locally
  localStorage.setItem('hw_current_user', JSON.stringify(user));

  // Also update in users list if present
  try {
    const users = JSON.parse(localStorage.getItem('hw_mock_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId || u.email === user.email);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
      if (password) users[idx].password = password;
      localStorage.setItem('hw_mock_users', JSON.stringify(users));
    }
  } catch (e) {}

  // Update staff shift and ward in UI & metrics
  const wardEl = document.getElementById('staff-ward-display');
  if (wardEl && department) wardEl.innerText = department;
  const shiftEl = document.getElementById('staff-shift-display');
  if (shiftEl && shift) shiftEl.innerText = shift;

  let metrics = JSON.parse(localStorage.getItem('hw_staff_metrics') || '{}');
  if (department) metrics.ward = department;
  if (shift) metrics.shift = shift;
  localStorage.setItem('hw_staff_metrics', JSON.stringify(metrics));

  loadStaffUserProfile();
  closeModal('staff-edit-profile-modal');
  showToast('Your staff account details have been updated successfully!', 'success');
}

/* Staff Metrics: Shift, Ward, Patients, Appts, Admitted, Reports */
function loadStaffMetrics() {
  let metrics = JSON.parse(localStorage.getItem('hw_staff_metrics') || 'null');
  if (!metrics) {
    metrics = {
      shift: '08:00 AM - 04:00 PM',
      ward: 'Cardiology Ward A',
      todayPatients: 18,
      scheduledAppts: 8,
      admittedPatients: 12,
      pendingReports: 4
    };
    localStorage.setItem('hw_staff_metrics', JSON.stringify(metrics));
  }

  const shiftEl = document.getElementById('staff-shift-display');
  if (shiftEl) shiftEl.innerText = metrics.shift;
  const wardEl = document.getElementById('staff-ward-display');
  if (wardEl) wardEl.innerText = metrics.ward;

  const tpEl = document.getElementById('staff-today-patients-val');
  if (tpEl) tpEl.innerText = metrics.todayPatients;
  const saEl = document.getElementById('staff-scheduled-appts-val');
  if (saEl) saEl.innerText = metrics.scheduledAppts;
  const apEl = document.getElementById('staff-admitted-patients-val');
  if (apEl) apEl.innerText = metrics.admittedPatients;
  const prEl = document.getElementById('staff-pending-reports-val');
  if (prEl) prEl.innerText = metrics.pendingReports;
}

function openEditStaffMetricsModal() {
  const metrics = JSON.parse(localStorage.getItem('hw_staff_metrics') || '{}');
  document.getElementById('edit-staff-shift').value = metrics.shift || '08:00 AM - 04:00 PM';
  document.getElementById('edit-staff-ward').value = metrics.ward || 'Cardiology Ward A';
  document.getElementById('edit-staff-today-patients').value = metrics.todayPatients !== undefined ? metrics.todayPatients : 18;
  document.getElementById('edit-staff-scheduled-appts').value = metrics.scheduledAppts !== undefined ? metrics.scheduledAppts : 8;
  document.getElementById('edit-staff-admitted-patients').value = metrics.admittedPatients !== undefined ? metrics.admittedPatients : 12;
  document.getElementById('edit-staff-pending-reports').value = metrics.pendingReports !== undefined ? metrics.pendingReports : 4;
  openModal('staff-edit-metrics-modal');
}

function submitEditStaffMetrics() {
  const shift = document.getElementById('edit-staff-shift').value.trim() || '08:00 AM - 04:00 PM';
  const ward = document.getElementById('edit-staff-ward').value.trim() || 'Cardiology Ward A';
  const todayPatients = parseInt(document.getElementById('edit-staff-today-patients').value) || 0;
  const scheduledAppts = parseInt(document.getElementById('edit-staff-scheduled-appts').value) || 0;
  const admittedPatients = parseInt(document.getElementById('edit-staff-admitted-patients').value) || 0;
  const pendingReports = parseInt(document.getElementById('edit-staff-pending-reports').value) || 0;

  const metrics = { shift, ward, todayPatients, scheduledAppts, admittedPatients, pendingReports };
  localStorage.setItem('hw_staff_metrics', JSON.stringify(metrics));
  loadStaffMetrics();
  closeModal('staff-edit-metrics-modal');
  showToast('Shift and ward metrics updated successfully!', 'success');
}

/* Staff Ward Availability */
function getStaffWards() {
  let wards = JSON.parse(localStorage.getItem('hw_staff_wards') || 'null');
  if (!wards || wards.length === 0) {
    wards = [
      { id: 1, name: 'Cardiology Ward A', occupied: 18, total: 20, color: '#0284c7' },
      { id: 2, name: 'Pediatrics Ward', occupied: 12, total: 20, color: '#10b981' },
      { id: 3, name: 'Intensive Care Unit (ICU)', occupied: 8, total: 10, color: '#ef4444' },
      { id: 4, name: 'General Inpatient Ward', occupied: 24, total: 30, color: '#f59e0b' }
    ];
    localStorage.setItem('hw_staff_wards', JSON.stringify(wards));
  }
  return wards;
}

function loadStaffWards() {
  const container = document.getElementById('staff-wards-container');
  if (!container) return;

  const wards = getStaffWards();
  if (wards.length === 0) {
    container.innerHTML = `<p style="font-size: 0.88rem; color: var(--text-muted);">No wards configured. Click "+ Add / Edit Ward" to configure.</p>`;
    return;
  }

  container.innerHTML = wards.map(w => {
    const pct = Math.min(100, Math.round((w.occupied / w.total) * 100));
    return `
      <div style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; margin-bottom: 4px;">
          <strong style="color: #334155;">${w.name}:</strong>
          <span style="font-weight: 700; color: ${w.color || 'var(--primary)'}; font-size: 0.85rem;">
            ${w.occupied}/${w.total} Beds Occupied (${pct}%)
          </span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width: ${pct}%; background: ${w.color || 'var(--primary)'};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function openManageWardsModal() {
  const modalList = document.getElementById('staff-modal-wards-list');
  if (!modalList) return;

  const wards = getStaffWards();
  modalList.innerHTML = wards.map(w => `
    <div style="display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
      <div>
        <strong style="color: #0b2545;">${w.name}</strong>
        <div style="font-size: 0.82rem; color: var(--text-muted);">Currently: ${w.occupied} / ${w.total} beds occupied</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button onclick="updateWardOccupancyPrompt(${w.id})" class="btn btn-outline btn-sm" title="Edit Occupancy">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button onclick="deleteWard(${w.id})" class="btn btn-outline btn-sm" style="color: var(--danger);" title="Delete Ward">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  openModal('staff-manage-wards-modal');
}

function submitAddNewWard() {
  const name = document.getElementById('new-ward-name').value.trim();
  const occupied = parseInt(document.getElementById('new-ward-occupied').value) || 0;
  const total = parseInt(document.getElementById('new-ward-total').value) || 20;

  if (!name) {
    alert('Please enter a ward name.');
    return;
  }

  const wards = getStaffWards();
  wards.push({
    id: Date.now(),
    name,
    occupied,
    total,
    color: '#0284c7'
  });
  localStorage.setItem('hw_staff_wards', JSON.stringify(wards));

  document.getElementById('new-ward-name').value = '';
  document.getElementById('new-ward-occupied').value = '';
  document.getElementById('new-ward-total').value = '';

  loadStaffWards();
  openManageWardsModal();
  showToast(`Ward "${name}" added successfully!`, 'success');
}

function updateWardOccupancyPrompt(wardId) {
  const wards = getStaffWards();
  const w = wards.find(item => item.id === wardId);
  if (!w) return;

  const newOccStr = prompt(`Update occupied beds for ${w.name}:`, w.occupied);
  if (newOccStr === null) return;
  const newOcc = parseInt(newOccStr);
  if (isNaN(newOcc) || newOcc < 0) {
    alert('Please enter a valid number.');
    return;
  }

  const newTotStr = prompt(`Update total capacity for ${w.name}:`, w.total);
  if (newTotStr === null) return;
  const newTot = parseInt(newTotStr);
  if (isNaN(newTot) || newTot <= 0) {
    alert('Please enter a valid total number.');
    return;
  }

  w.occupied = newOcc;
  w.total = newTot;
  localStorage.setItem('hw_staff_wards', JSON.stringify(wards));
  loadStaffWards();
  openManageWardsModal();
  showToast(`Updated ${w.name} availability!`, 'success');
}

function deleteWard(wardId) {
  if (!confirm('Are you sure you want to remove this ward?')) return;
  let wards = getStaffWards();
  wards = wards.filter(w => w.id !== wardId);
  localStorage.setItem('hw_staff_wards', JSON.stringify(wards));
  loadStaffWards();
  openManageWardsModal();
  showToast('Ward removed', 'warning');
}

/* Staff Upcoming Tasks & Functional View All */
function getStaffTasks() {
  let tasks = JSON.parse(localStorage.getItem('hw_staff_tasks') || 'null');
  if (!tasks || tasks.length === 0) {
    tasks = [
      { id: 1, text: 'Staff Meeting at 1:00 PM (Conf Room B)', time: 'Today 1:00 PM', completed: true },
      { id: 2, text: 'Approved check-ups for Medical Camp on Nov 20', time: 'Nov 20 Checkup', completed: true },
      { id: 3, text: 'Review ICU transfer charts and lab blood panels', time: 'Today 3:30 PM', completed: false },
      { id: 4, text: 'Evening handover briefing with night shift supervisor', time: 'Today 4:00 PM', completed: false }
    ];
    localStorage.setItem('hw_staff_tasks', JSON.stringify(tasks));
  }
  return tasks;
}

function loadStaffTasks() {
  const container = document.getElementById('staff-tasks-container');
  if (!container) return;

  const tasks = getStaffTasks();
  if (tasks.length === 0) {
    container.innerHTML = `<p style="font-size: 0.88rem; color: var(--text-muted);">No pending tasks. Click "+ Task" to add.</p>`;
    return;
  }

  // Display top 3 tasks on the card
  container.innerHTML = tasks.slice(0, 3).map(t => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; align-items: center; gap: 10px; font-size: 0.86rem; color: ${t.completed ? '#94a3b8' : '#334155'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; cursor: pointer;" onclick="toggleTaskCompleted(${t.id})" title="Click to toggle completion">
        <i class="${t.completed ? 'fas fa-check-circle' : 'far fa-circle'}" style="color: ${t.completed ? '#10b981' : '#cbd5e1'}; font-size: 1.05rem;"></i>
        <span>${t.text}</span>
      </div>
      <span style="font-size: 0.75rem; color: var(--text-muted);">${t.time || ''}</span>
    </div>
  `).join('');
}

function openAddTaskModal() {
  document.getElementById('new-task-text').value = '';
  document.getElementById('new-task-time').value = 'Today 2:00 PM';
  openModal('staff-add-task-modal');
}

function submitAddNewTask() {
  const text = document.getElementById('new-task-text').value.trim();
  const time = document.getElementById('new-task-time').value.trim();

  if (!text) {
    alert('Please enter a task description.');
    return;
  }

  const tasks = getStaffTasks();
  tasks.unshift({
    id: Date.now(),
    text,
    time: time || 'Today',
    completed: false
  });
  localStorage.setItem('hw_staff_tasks', JSON.stringify(tasks));

  loadStaffTasks();
  closeModal('staff-add-task-modal');
  showToast('Upcoming task added successfully!', 'success');

  // If all tasks modal is open, refresh it
  const allModal = document.getElementById('staff-all-tasks-modal');
  if (allModal && allModal.classList.contains('active')) {
    openAllTasksModal();
  }
}

function toggleTaskCompleted(taskId) {
  const tasks = getStaffTasks();
  const t = tasks.find(item => item.id === taskId);
  if (t) {
    t.completed = !t.completed;
    localStorage.setItem('hw_staff_tasks', JSON.stringify(tasks));
    loadStaffTasks();
    const allModal = document.getElementById('staff-all-tasks-modal');
    if (allModal && allModal.classList.contains('active')) {
      openAllTasksModal();
    }
  }
}

function deleteTask(taskId) {
  let tasks = getStaffTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  localStorage.setItem('hw_staff_tasks', JSON.stringify(tasks));
  loadStaffTasks();
  openAllTasksModal();
  showToast('Task removed', 'warning');
}

function openAllTasksModal() {
  const modalList = document.getElementById('staff-full-tasks-list');
  if (!modalList) return;

  const tasks = getStaffTasks();
  if (tasks.length === 0) {
    modalList.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">No tasks scheduled. Click "New Task" above to add one.</p>`;
  } else {
    modalList.innerHTML = tasks.map(t => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: ${t.completed ? '#f8fafc' : 'white'}; border: 1px solid var(--border-color); padding: 12px 14px; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;" onclick="toggleTaskCompleted(${t.id})">
          <i class="${t.completed ? 'fas fa-check-circle' : 'far fa-circle'}" style="color: ${t.completed ? '#10b981' : '#cbd5e1'}; font-size: 1.25rem;"></i>
          <div>
            <div style="font-size: 0.92rem; font-weight: 600; color: ${t.completed ? '#94a3b8' : '#0b2545'}; text-decoration: ${t.completed ? 'line-through' : 'none'};">
              ${t.text}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
              <i class="far fa-clock"></i> ${t.time} &bull; Status: <strong>${t.completed ? 'Completed' : 'Pending Action'}</strong>
            </div>
          </div>
        </div>
        <button onclick="deleteTask(${t.id})" class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca; margin-left: 10px;" title="Delete Task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  openModal('staff-all-tasks-modal');
}

async function loadStaffAppointments() {
  const tbody = document.getElementById('staff-appointments-tbody');
  if (!tbody) return;

  try {
    staffAppointments = await api.getTodayAppointments();
    renderStaffAppointmentsTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

function renderStaffAppointmentsTable() {
  const tbody = document.getElementById('staff-appointments-tbody');
  if (!tbody) return;

  if (staffAppointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No appointments scheduled for today. Click "+ Add Appointment" above to schedule one.</td></tr>`;
    return;
  }

  tbody.innerHTML = staffAppointments.map(appt => {
    let badgeClass = 'badge-scheduled';
    if (appt.status === 'In Progress') badgeClass = 'badge-in-progress';
    if (appt.status === 'Waiting') badgeClass = 'badge-waiting';
    if (appt.status === 'Completed') badgeClass = 'badge-green';

    return `
      <tr>
        <td style="font-weight: 700; color: #0b2545;">${appt.time}</td>
        <td style="font-weight: 600;">${appt.patientName}</td>
        <td>${appt.department}</td>
        <td><span style="color: var(--text-muted);">${appt.room}</span></td>
        <td>
          <span class="badge ${badgeClass}" style="font-size: 0.82rem; padding: 4px 10px; cursor: pointer;" onclick="openEditApptModal(${appt.id}, '${appt.patientName}', '${appt.status}')" title="Click to quick toggle status">
            [${appt.status}]
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button onclick="openEditAppointmentDetailsModal(${appt.id})" class="btn btn-outline btn-sm" title="Edit Appointment Details">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteAppointmentConfirm(${appt.id})" class="btn btn-outline btn-sm" style="color: var(--danger);" title="Cancel / Remove Appointment">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddAppointmentModal() {
  document.getElementById('new-appt-patient').value = '';
  document.getElementById('new-appt-time').value = '10:00 AM';
  document.getElementById('new-appt-room').value = 'Room 304';
  openModal('staff-add-appt-modal');
}

async function submitAddAppointment() {
  const patientName = document.getElementById('new-appt-patient').value.trim();
  const time = document.getElementById('new-appt-time').value.trim();
  const department = document.getElementById('new-appt-dept').value;
  const room = document.getElementById('new-appt-room').value.trim();
  const status = document.getElementById('new-appt-status').value;
  const doctor = document.getElementById('new-appt-doctor').value.trim();

  if (!patientName || !time || !room) {
    alert('Please enter patient name, appointment time, and room number.');
    return;
  }

  try {
    await api.createAppointment({
      patientName,
      time,
      department,
      room,
      status,
      doctor
    });
    closeModal('staff-add-appt-modal');
    showToast(`Appointment scheduled for ${patientName}`, 'success');
    await loadStaffAppointments();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openEditAppointmentDetailsModal(apptId) {
  const appt = staffAppointments.find(a => a.id === apptId);
  if (!appt) return;

  document.getElementById('edit-full-appt-id').value = appt.id;
  document.getElementById('edit-full-appt-patient').value = appt.patientName;
  document.getElementById('edit-full-appt-time').value = appt.time;
  document.getElementById('edit-full-appt-dept').value = appt.department;
  document.getElementById('edit-full-appt-room').value = appt.room;
  document.getElementById('edit-full-appt-status').value = appt.status;
  openModal('staff-edit-appt-details-modal');
}

async function submitEditAppointmentDetails() {
  const id = parseInt(document.getElementById('edit-full-appt-id').value);
  const patientName = document.getElementById('edit-full-appt-patient').value.trim();
  const time = document.getElementById('edit-full-appt-time').value.trim();
  const department = document.getElementById('edit-full-appt-dept').value.trim();
  const room = document.getElementById('edit-full-appt-room').value.trim();
  const status = document.getElementById('edit-full-appt-status').value;

  if (!patientName || !time || !department || !room) {
    alert('Please fill out all required fields.');
    return;
  }

  try {
    await api.updateAppointment(id, {
      patientName,
      time,
      department,
      room,
      status
    });
    closeModal('staff-edit-appt-details-modal');
    showToast('Appointment details updated successfully!', 'success');
    await loadStaffAppointments();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteAppointmentConfirm(apptId) {
  if (!confirm('Are you sure you want to cancel and remove this appointment?')) return;
  try {
    await api.deleteAppointment(apptId);
    showToast('Appointment cancelled and removed', 'success');
    await loadStaffAppointments();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openEditApptModal(id, patientName, currentStatus) {
  document.getElementById('edit-appt-id').value = id;
  document.getElementById('edit-appt-info').innerText = `Patient: ${patientName} (Current: ${currentStatus})`;
  document.getElementById('edit-appt-status-select').value = currentStatus;
  openModal('staff-edit-appt-modal');
}

async function submitUpdateAppointmentStatus() {
  const id = document.getElementById('edit-appt-id').value;
  const status = document.getElementById('edit-appt-status-select').value;

  try {
    await api.updateAppointmentStatus(id, status);
    closeModal('staff-edit-appt-modal');
    showToast(`Appointment status updated to [${status}]`, 'success');
    await loadStaffAppointments();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function refreshStaffAppointments() {
  loadStaffAppointments();
  showToast('Appointments schedule refreshed', 'success');
}

/* Staff: Medical Camps Add & Update */
async function loadStaffCampsTable() {
  const tbody = document.getElementById('staff-camps-tbody');
  if (!tbody) return;

  try {
    const camps = await api.getCamps();
    tbody.innerHTML = camps.map(c => `
      <tr>
        <td>
          <strong>${c.campName}</strong>
          ${c.isFree ? '<span class="badge badge-free" style="margin-left: 6px; font-size: 0.7rem;">FREE</span>' : ''}
        </td>
        <td><span class="badge badge-blue">${c.category}</span></td>
        <td>${c.campDate}<br><small style="color: var(--text-muted);">${c.startTime} - ${c.endTime}</small></td>
        <td>${c.locationName}</td>
        <td>
          <strong>${c.registeredCount}</strong> / ${c.capacity}
          <div class="progress-bar-wrap" style="width: 120px;">
            <div class="progress-bar-fill" style="width: ${Math.min(100, (c.registeredCount / c.capacity) * 100)}%;"></div>
          </div>
        </td>
        <td><span class="badge ${c.status === 'UPCOMING' ? 'badge-green' : 'badge-yellow'}">${c.status}</span></td>
        <td>
          <div class="action-btn-group">
            <button onclick="openEditCampModal(${c.campId})" class="btn btn-outline btn-sm" title="Edit Camp Details">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deleteCampConfirm(${c.campId})" class="btn btn-outline btn-sm" style="color: var(--danger);" title="Delete Camp">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

function openAddCampModal() {
  // Set default date to 10 days from now
  const d = new Date();
  d.setDate(d.getDate() + 10);
  const dateInput = document.getElementById('new-camp-date');
  if (dateInput) dateInput.value = d.toISOString().split('T')[0];
  openModal('staff-add-camp-modal');
}

async function submitAddCamp() {
  const name = document.getElementById('new-camp-name').value.trim();
  const category = document.getElementById('new-camp-category').value;
  const campDate = document.getElementById('new-camp-date').value;
  const start = document.getElementById('new-camp-start').value;
  const end = document.getElementById('new-camp-end').value;
  const location = document.getElementById('new-camp-location').value.trim();
  const capacity = document.getElementById('new-camp-capacity').value;
  const desc = document.getElementById('new-camp-desc').value.trim();
  const isFree = document.getElementById('new-camp-free').checked;

  if (!name || !campDate || !location || !capacity) {
    alert('Please fill out all required fields.');
    return;
  }

  try {
    await api.createCamp({
      campName: name,
      category,
      campDate,
      startTime: start,
      endTime: end,
      locationName: location,
      capacity: parseInt(capacity),
      description: desc,
      isFree,
      status: 'UPCOMING'
    });
    closeModal('staff-add-camp-modal');
    showToast('New medical camp created successfully!', 'success');
    await loadStaffCampsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function openEditCampModal(campId) {
  try {
    const camp = await api.getCampById(campId);
    document.getElementById('edit-camp-id').value = camp.campId;
    document.getElementById('edit-camp-name').value = camp.campName;
    document.getElementById('edit-camp-category').value = camp.category;
    document.getElementById('edit-camp-status').value = camp.status;
    document.getElementById('edit-camp-date').value = camp.campDate;
    document.getElementById('edit-camp-capacity').value = camp.capacity;
    document.getElementById('edit-camp-start').value = camp.startTime || '08:00';
    document.getElementById('edit-camp-end').value = camp.endTime || '14:00';
    document.getElementById('edit-camp-desc').value = camp.description || '';
    openModal('staff-edit-camp-modal');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function submitEditCamp() {
  const campId = document.getElementById('edit-camp-id').value;
  const name = document.getElementById('edit-camp-name').value.trim();
  const category = document.getElementById('edit-camp-category').value;
  const status = document.getElementById('edit-camp-status').value;
  const campDate = document.getElementById('edit-camp-date').value;
  const capacity = document.getElementById('edit-camp-capacity').value;
  const start = document.getElementById('edit-camp-start').value;
  const end = document.getElementById('edit-camp-end').value;
  const desc = document.getElementById('edit-camp-desc').value.trim();

  if (!name || !campDate || !capacity) {
    alert('Please fill out all required fields.');
    return;
  }

  try {
    await api.updateCamp(campId, {
      campName: name,
      category,
      status,
      campDate,
      capacity: parseInt(capacity),
      startTime: start,
      endTime: end,
      description: desc
    });
    closeModal('staff-edit-camp-modal');
    showToast('Medical camp details updated successfully!', 'success');
    await loadStaffCampsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteCampConfirm(campId) {
  if (!confirm('Are you sure you want to delete this medical camp?')) return;
  try {
    await api.deleteCamp(campId);
    showToast('Medical camp deleted', 'success');
    await loadStaffCampsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

/* Staff: Feedback Review & Response */
async function loadStaffFeedbackTable() {
  const tbody = document.getElementById('staff-feedback-tbody');
  if (!tbody) return;

  try {
    const fbs = await api.getAllFeedback();
    tbody.innerHTML = fbs.map(fb => `
      <tr>
        <td><strong>${fb.userName}</strong></td>
        <td>${fb.category.replace('_', ' ')}</td>
        <td style="max-width: 250px;">"${fb.message}"</td>
        <td>
          <span class="badge ${fb.status === 'RESOLVED' ? 'badge-green' : (fb.status === 'UNDER_REVIEW' ? 'badge-blue' : 'badge-yellow')}">
            ${fb.status}
          </span>
        </td>
        <td>
          <button onclick="respondToFeedbackPrompt(${fb.feedbackId})" class="btn btn-primary btn-sm">
            Review / Respond
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

async function respondToFeedbackPrompt(fbId) {
  const status = prompt('Select status: PENDING, UNDER_REVIEW, or RESOLVED', 'RESOLVED');
  if (!status) return;
  const response = prompt('Write official staff reply to the patient:');
  if (response === null) return;

  try {
    await api.updateFeedbackStatus(fbId, status.toUpperCase(), response);
    showToast('Feedback updated and patient notified!', 'success');
    await loadStaffFeedbackTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

/* =========================================================
   3. ADMIN DASHBOARD (Photo 23)
   ========================================================= */
async function initAdminDashboard() {
  loadAdminUserProfile();
  await loadAdminStats();
  await loadAdminUsersTable();
  await loadAdminNotificationsTable();
  await loadAdminLocationsTable();
  await loadAdminHospitalInfo();

  // Support direct tab opening via URL e.g. admin-dashboard.html?tab=hospital-info
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam === 'hospital-info') {
    switchDashTab('pane-admin-hospital-info');
  } else if (tabParam === 'users') {
    switchDashTab('pane-admin-users');
  }
}

function loadAdminUserProfile() {
  const user = api.getCurrentUser() || { fullName: 'System Administrator', role: 'ADMIN' };
  const initial = user.fullName ? user.fullName.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() : 'AD';

  const topbarName = document.getElementById('admin-topbar-name');
  if (topbarName) topbarName.innerText = user.fullName;
  const topbarAvatar = document.getElementById('admin-topbar-avatar');
  if (topbarAvatar) topbarAvatar.innerText = initial;

  const sidebarName = document.getElementById('admin-sidebar-name');
  if (sidebarName) sidebarName.innerText = user.fullName;
  const sidebarAvatar = document.getElementById('admin-sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.innerText = initial;
}

function loadAdminStats() {
  let stats = JSON.parse(localStorage.getItem('hw_admin_metrics') || 'null');
  if (!stats) {
    stats = {
      registeredPatients: 12845,
      availableDoctors: 142,
      todayAppointments: 328,
      activeCamps: 3
    };
    localStorage.setItem('hw_admin_metrics', JSON.stringify(stats));
  }

  const pEl = document.getElementById('stat-total-patients');
  if (pEl) pEl.innerText = Number(stats.registeredPatients).toLocaleString();
  const dEl = document.getElementById('stat-total-doctors');
  if (dEl) dEl.innerText = Number(stats.availableDoctors).toLocaleString();
  const aEl = document.getElementById('stat-total-appts');
  if (aEl) aEl.innerText = Number(stats.todayAppointments).toLocaleString();
  const cEl = document.getElementById('stat-total-camps');
  if (cEl) cEl.innerText = Number(stats.activeCamps).toLocaleString();
}

function openEditAdminStatsModal() {
  const stats = JSON.parse(localStorage.getItem('hw_admin_metrics') || '{}');
  document.getElementById('edit-stat-patients').value = stats.registeredPatients !== undefined ? stats.registeredPatients : 12845;
  document.getElementById('edit-stat-doctors').value = stats.availableDoctors !== undefined ? stats.availableDoctors : 142;
  document.getElementById('edit-stat-appts').value = stats.todayAppointments !== undefined ? stats.todayAppointments : 328;
  document.getElementById('edit-stat-camps').value = stats.activeCamps !== undefined ? stats.activeCamps : 3;
  openModal('admin-edit-stats-modal');
}

function submitEditAdminStats() {
  const registeredPatients = parseInt(document.getElementById('edit-stat-patients').value) || 0;
  const availableDoctors = parseInt(document.getElementById('edit-stat-doctors').value) || 0;
  const todayAppointments = parseInt(document.getElementById('edit-stat-appts').value) || 0;
  const activeCamps = parseInt(document.getElementById('edit-stat-camps').value) || 0;

  const stats = { registeredPatients, availableDoctors, todayAppointments, activeCamps };
  localStorage.setItem('hw_admin_metrics', JSON.stringify(stats));
  loadAdminStats();
  closeModal('admin-edit-stats-modal');
  showToast('Hospital key metrics updated successfully!', 'success');
}

async function loadAdminUsersTable() {
  const tbody = document.getElementById('admin-users-tbody');
  const tbodyFull = document.getElementById('admin-users-tbody-full');
  if (!tbody && !tbodyFull) return;

  try {
    const users = await api.getAllUsers();
    const rowsHtml = users.map(u => `
      <tr>
        <td><strong>${u.fullName}</strong></td>
        <td>${u.email}</td>
        <td>${u.phoneNumber || '-'}</td>
        <td>
          <span class="badge ${u.role === 'ADMIN' ? 'badge-red' : (u.role === 'STAFF' ? 'badge-blue' : 'badge-green')}">
            ${u.role}
          </span>
        </td>
        <td>
          <span class="badge ${u.accountStatus === 'ACTIVE' ? 'badge-green' : 'badge-red'}">
            ${u.accountStatus}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button onclick="changeUserRolePrompt(${u.userId}, '${u.role}')" class="btn btn-outline btn-sm">
              Role
            </button>
            <button onclick="toggleUserStatusPrompt(${u.userId}, '${u.accountStatus}')" class="btn btn-outline btn-sm" style="${u.accountStatus === 'ACTIVE' ? 'color: var(--danger);' : 'color: var(--success);'}">
              ${u.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    if (tbody) tbody.innerHTML = rowsHtml;
    if (tbodyFull) tbodyFull.innerHTML = rowsHtml;
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

async function changeUserRolePrompt(userId, currentRole) {
  const role = prompt('Assign new role (REGISTERED_USER, STAFF, or ADMIN):', currentRole);
  if (!role) return;

  try {
    await api.updateUserRole(userId, role.toUpperCase());
    showToast('User role updated successfully', 'success');
    await loadAdminUsersTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function toggleUserStatusPrompt(userId, currentStatus) {
  const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  if (!confirm(`Are you sure you want to change this account to ${nextStatus}?`)) return;

  try {
    await api.updateUserStatus(userId, nextStatus);
    showToast(`User account status updated to ${nextStatus}`, 'success');
    await loadAdminUsersTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

/* Admin: Create Staff Account */
function openCreateStaffModal() {
  document.getElementById('new-staff-fullname').value = '';
  document.getElementById('new-staff-email').value = '';
  document.getElementById('new-staff-phone').value = '';
  document.getElementById('new-staff-department').value = 'Cardiology';
  document.getElementById('new-staff-shift').value = '08:00 AM - 04:00 PM';
  document.getElementById('new-staff-password').value = 'Password@123';
  openModal('admin-create-staff-modal');
}

async function submitCreateStaff() {
  const fullName = document.getElementById('new-staff-fullname').value.trim();
  const email = document.getElementById('new-staff-email').value.trim();
  const phone = document.getElementById('new-staff-phone').value.trim();
  const department = document.getElementById('new-staff-department').value.trim();
  const shift = document.getElementById('new-staff-shift').value.trim();
  const password = document.getElementById('new-staff-password').value || 'Password@123';

  if (!fullName || !email) {
    alert('Please enter staff full name and email address.');
    return;
  }

  try {
    await api.createStaffUser({
      fullName,
      email,
      phoneNumber: phone,
      department,
      activeShift: shift,
      password
    });
    closeModal('admin-create-staff-modal');
    showToast(`Staff account for ${fullName} created successfully!`, 'success');
    await loadAdminUsersTable();
    loadAdminStats();
  } catch (err) {
    alert('Failed to create staff account: ' + err.message);
  }
}

/* Admin: Hospital Information Management (Public View Customization) */
async function loadAdminHospitalInfo() {
  try {
    const info = await api.getHospitalInfo();
    if (!info) return;

    if (document.getElementById('admin-info-name')) document.getElementById('admin-info-name').value = info.hospitalName || '';
    if (document.getElementById('admin-info-tagline')) document.getElementById('admin-info-tagline').value = info.tagline || '';
    if (document.getElementById('admin-info-hero-title')) document.getElementById('admin-info-hero-title').value = info.heroTitle || '';
    if (document.getElementById('admin-info-hero-subtitle')) document.getElementById('admin-info-hero-subtitle').value = info.heroSubtitle || '';
    if (document.getElementById('admin-info-emergency-hotline')) document.getElementById('admin-info-emergency-hotline').value = info.emergencyHotline || '';
    if (document.getElementById('admin-info-emergency-text')) document.getElementById('admin-info-emergency-text').value = info.emergencyText || '';
    if (document.getElementById('admin-info-clinical-overview')) document.getElementById('admin-info-clinical-overview').value = info.clinicalOverview || '';
    if (document.getElementById('admin-info-mission')) document.getElementById('admin-info-mission').value = info.mission || '';
    if (document.getElementById('admin-info-vision')) document.getElementById('admin-info-vision').value = info.vision || '';
    if (document.getElementById('admin-info-hours-general')) document.getElementById('admin-info-hours-general').value = info.hoursGeneral || '';
    if (document.getElementById('admin-info-hours-pediatrics')) document.getElementById('admin-info-hours-pediatrics').value = info.hoursPediatrics || '';
    if (document.getElementById('admin-info-hours-icu')) document.getElementById('admin-info-hours-icu').value = info.hoursICU || '';
    if (document.getElementById('admin-info-address')) document.getElementById('admin-info-address').value = info.address || '';
    if (document.getElementById('admin-info-phone')) document.getElementById('admin-info-phone').value = info.inquiryPhone || '';
    if (document.getElementById('admin-info-email')) document.getElementById('admin-info-email').value = info.email || '';
    if (document.getElementById('admin-info-parking')) document.getElementById('admin-info-parking').value = info.parkingInfo || '';
  } catch (err) {
    console.error('Failed to load hospital info in admin:', err);
  }
}

async function submitAdminHospitalInfo() {
  const data = {
    hospitalName: (document.getElementById('admin-info-name') ? document.getElementById('admin-info-name').value : '').trim(),
    tagline: (document.getElementById('admin-info-tagline') ? document.getElementById('admin-info-tagline').value : '').trim(),
    heroTitle: (document.getElementById('admin-info-hero-title') ? document.getElementById('admin-info-hero-title').value : '').trim(),
    heroSubtitle: (document.getElementById('admin-info-hero-subtitle') ? document.getElementById('admin-info-hero-subtitle').value : '').trim(),
    emergencyHotline: (document.getElementById('admin-info-emergency-hotline') ? document.getElementById('admin-info-emergency-hotline').value : '').trim(),
    emergencyText: (document.getElementById('admin-info-emergency-text') ? document.getElementById('admin-info-emergency-text').value : '').trim(),
    clinicalOverview: (document.getElementById('admin-info-clinical-overview') ? document.getElementById('admin-info-clinical-overview').value : '').trim(),
    mission: (document.getElementById('admin-info-mission') ? document.getElementById('admin-info-mission').value : '').trim(),
    vision: (document.getElementById('admin-info-vision') ? document.getElementById('admin-info-vision').value : '').trim(),
    hoursGeneral: (document.getElementById('admin-info-hours-general') ? document.getElementById('admin-info-hours-general').value : '').trim(),
    hoursPediatrics: (document.getElementById('admin-info-hours-pediatrics') ? document.getElementById('admin-info-hours-pediatrics').value : '').trim(),
    hoursICU: (document.getElementById('admin-info-hours-icu') ? document.getElementById('admin-info-hours-icu').value : '').trim(),
    address: (document.getElementById('admin-info-address') ? document.getElementById('admin-info-address').value : '').trim(),
    inquiryPhone: (document.getElementById('admin-info-phone') ? document.getElementById('admin-info-phone').value : '').trim(),
    email: (document.getElementById('admin-info-email') ? document.getElementById('admin-info-email').value : '').trim(),
    parkingInfo: (document.getElementById('admin-info-parking') ? document.getElementById('admin-info-parking').value : '').trim()
  };

  try {
    await api.updateHospitalInfo(data);
    showToast('Hospital information updated successfully across public portals!', 'success');
  } catch (err) {
    alert('Failed to update hospital info: ' + err.message);
  }
}

/* Admin: Notifications Add & Update */
async function loadAdminNotificationsTable() {
  const tbody = document.getElementById('admin-notifs-tbody');
  if (!tbody) return;

  try {
    const notifs = await api.getNotifications();
    tbody.innerHTML = notifs.map(n => `
      <tr>
        <td><strong>${n.title}</strong></td>
        <td><span class="badge badge-blue">${n.category}</span></td>
        <td style="max-width: 280px; font-size: 0.88rem;">${n.message}</td>
        <td>${new Date(n.publishedAt).toLocaleDateString()}</td>
        <td><span class="badge badge-green">${n.status}</span></td>
        <td>
          <div class="action-btn-group">
            <button onclick="openEditNotificationModal(${n.notificationId})" class="btn btn-outline btn-sm" title="Edit Notification">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deleteNotificationConfirm(${n.notificationId})" class="btn btn-outline btn-sm" style="color: var(--danger);" title="Delete Notification">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

function openAddNotificationModal() {
  openModal('admin-add-notif-modal');
}

async function submitAddNotification() {
  const title = document.getElementById('new-notif-title').value.trim();
  const category = document.getElementById('new-notif-category').value;
  const status = document.getElementById('new-notif-status').value;
  const expiry = document.getElementById('new-notif-expiry').value;
  const message = document.getElementById('new-notif-message').value.trim();

  if (!title || !message) {
    alert('Please enter a title and announcement message.');
    return;
  }

  try {
    await api.createNotification({
      title,
      category,
      status,
      expiryDate: expiry || null,
      message
    });
    closeModal('admin-add-notif-modal');
    showToast('Hospital notification published successfully!', 'success');
    await loadAdminNotificationsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function openEditNotificationModal(notifId) {
  try {
    const notifs = await api.getNotifications();
    const notif = notifs.find(n => n.notificationId === notifId);
    if (!notif) return;

    document.getElementById('edit-notif-id').value = notif.notificationId;
    document.getElementById('edit-notif-title').value = notif.title;
    document.getElementById('edit-notif-category').value = notif.category;
    document.getElementById('edit-notif-status').value = notif.status;
    document.getElementById('edit-notif-message').value = notif.message;
    openModal('admin-edit-notif-modal');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function submitEditNotification() {
  const notifId = document.getElementById('edit-notif-id').value;
  const title = document.getElementById('edit-notif-title').value.trim();
  const category = document.getElementById('edit-notif-category').value;
  const status = document.getElementById('edit-notif-status').value;
  const message = document.getElementById('edit-notif-message').value.trim();

  if (!title || !message) {
    alert('Please fill out all fields.');
    return;
  }

  try {
    await api.updateNotification(notifId, {
      title,
      category,
      status,
      message
    });
    closeModal('admin-edit-notif-modal');
    showToast('Notification updated successfully!', 'success');
    await loadAdminNotificationsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteNotificationConfirm(notifId) {
  if (!confirm('Are you sure you want to delete this notification?')) return;
  try {
    await api.deleteNotification(notifId);
    showToast('Notification deleted', 'success');
    await loadAdminNotificationsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

/* =========================================================
   4. ADMIN: MANAGE LOCATIONS (Add & Update Details)
   ========================================================= */
let adminLocationsList = [];

async function loadAdminLocationsTable() {
  const tbody = document.getElementById('admin-locations-tbody');
  if (!tbody) return;

  try {
    adminLocationsList = await api.getLocations();
    if (adminLocationsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No hospital locations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = adminLocationsList.map(loc => `
      <tr>
        <td><strong>${loc.locationName}</strong></td>
        <td><span class="badge badge-blue" style="font-size: 0.75rem;">${loc.category}</span></td>
        <td>${loc.building}, ${loc.floor}</td>
        <td>${loc.roomNumber ? `<strong>${loc.roomNumber}</strong>` : '-'}</td>
        <td style="font-size: 0.85rem; color: #475569;">${loc.openingHours || '24 Hours'}</td>
        <td>
          <span class="badge ${loc.status === 'OPEN' ? 'badge-green' : (loc.status === 'RESTRICTED' ? 'badge-yellow' : 'badge-red')}">
            ${loc.status || 'OPEN'}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button onclick="openEditLocationModal(${loc.locationId})" class="btn btn-outline btn-sm" title="Edit Location Details">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deleteLocationConfirm(${loc.locationId})" class="btn btn-outline btn-sm" style="color: var(--danger);" title="Delete Location">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger); text-align: center;">${err.message}</td></tr>`;
  }
}

function openAddLocationModal() {
  document.getElementById('new-loc-name').value = '';
  document.getElementById('new-loc-room').value = '';
  document.getElementById('new-loc-desc').value = '';
  document.getElementById('new-loc-directions').value = '';
  openModal('admin-add-location-modal');
}

async function submitAddLocation() {
  const locationName = document.getElementById('new-loc-name').value.trim();
  const category = document.getElementById('new-loc-category').value;
  const building = document.getElementById('new-loc-building').value.trim();
  const floor = document.getElementById('new-loc-floor').value;
  const roomNumber = document.getElementById('new-loc-room').value.trim();
  const openingHours = document.getElementById('new-loc-hours').value.trim();
  const status = document.getElementById('new-loc-status').value;
  const description = document.getElementById('new-loc-desc').value.trim();
  const directions = document.getElementById('new-loc-directions').value.trim();

  if (!locationName || !building || !floor) {
    alert('Please enter location name, building, and floor.');
    return;
  }

  try {
    await api.createLocation({
      locationName,
      category,
      building,
      floor,
      roomNumber,
      openingHours,
      status,
      description,
      directions
    });
    closeModal('admin-add-location-modal');
    showToast(`Hospital facility "${locationName}" created successfully!`, 'success');
    await loadAdminLocationsTable();
    await loadAdminStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function openEditLocationModal(locId) {
  try {
    const loc = adminLocationsList.find(l => l.locationId === locId);
    if (!loc) return;

    document.getElementById('edit-loc-id').value = loc.locationId;
    document.getElementById('edit-loc-name').value = loc.locationName;
    document.getElementById('edit-loc-category').value = loc.category;
    document.getElementById('edit-loc-building').value = loc.building;
    document.getElementById('edit-loc-floor').value = loc.floor;
    document.getElementById('edit-loc-room').value = loc.roomNumber || '';
    document.getElementById('edit-loc-hours').value = loc.openingHours || '24 Hours';
    document.getElementById('edit-loc-status').value = loc.status || 'OPEN';
    document.getElementById('edit-loc-desc').value = loc.description || '';
    document.getElementById('edit-loc-directions').value = loc.directions || '';

    openModal('admin-edit-location-modal');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function submitEditLocation() {
  const locId = parseInt(document.getElementById('edit-loc-id').value);
  const locationName = document.getElementById('edit-loc-name').value.trim();
  const category = document.getElementById('edit-loc-category').value.trim();
  const building = document.getElementById('edit-loc-building').value.trim();
  const floor = document.getElementById('edit-loc-floor').value;
  const roomNumber = document.getElementById('edit-loc-room').value.trim();
  const openingHours = document.getElementById('edit-loc-hours').value.trim();
  const status = document.getElementById('edit-loc-status').value;
  const description = document.getElementById('edit-loc-desc').value.trim();
  const directions = document.getElementById('edit-loc-directions').value.trim();

  if (!locationName || !category || !building) {
    alert('Please fill out all required fields.');
    return;
  }

  try {
    await api.updateLocation(locId, {
      locationName,
      category,
      building,
      floor,
      roomNumber,
      openingHours,
      status,
      description,
      directions
    });
    closeModal('admin-edit-location-modal');
    showToast(`Location "${locationName}" updated successfully!`, 'success');
    await loadAdminLocationsTable();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteLocationConfirm(locId) {
  if (!confirm('Are you sure you want to delete this hospital location record?')) return;
  try {
    await api.deleteLocation(locId);
    showToast('Hospital location deleted successfully', 'success');
    await loadAdminLocationsTable();
    await loadAdminStats();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

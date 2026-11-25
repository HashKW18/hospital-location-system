/**
 * HealthWay Hospital - Medical Camps Controller
 * Matches Photo 27 from UI Mockups
 */

let allCamps = [];
let currentCampCategory = 'All';
let currentCampSearch = '';
let selectedCampIdForRegister = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadCamps();
  setupCampListeners();
});

async function loadCamps() {
  const container = document.getElementById('camps-grid');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i>
        <p style="margin-top: 12px; color: var(--text-muted);">Loading community medical camps...</p>
      </div>
    `;
  }

  try {
    allCamps = await api.getCamps();
    renderCamps();
  } catch (err) {
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
          <i class="fas fa-exclamation-triangle fa-2x"></i>
          <p style="margin-top: 10px;">Failed to load medical camps: ${err.message}</p>
        </div>
      `;
    }
  }
}

function renderCamps() {
  const container = document.getElementById('camps-grid');
  if (!container) return;

  const filtered = allCamps.filter(camp => {
    if (currentCampSearch) {
      const q = currentCampSearch.toLowerCase();
      const match = camp.campName.toLowerCase().includes(q) ||
                    camp.category.toLowerCase().includes(q) ||
                    camp.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (currentCampCategory !== 'All' && camp.category !== currentCampCategory) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <i class="fas fa-calendar-times fa-3x" style="color: var(--text-light); margin-bottom: 16px;"></i>
        <h3 style="color: var(--primary-navy); margin-bottom: 6px;">No medical camps found</h3>
        <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 20px auto;">
          Try adjusting your search criteria or filter options to see other health programmes.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(camp => {
    // Formatted date and time
    const dateFormatted = new Date(camp.campDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isFull = camp.availableSlots <= 0;

    return `
      <div class="card camp-card">
        <div class="camp-card-img">
          <i class="fas ${getCampIcon(camp.category)} fa-3x" style="color: white; opacity: 0.9;"></i>
          ${camp.isFree ? '<span class="badge badge-free" style="position: absolute; top: 14px; right: 14px; font-weight: 800;">FREE</span>' : ''}
        </div>
        <div class="camp-card-body">
          <div style="margin-bottom: 6px;">
            <span class="badge badge-blue">${camp.category}</span>
          </div>
          <h3 class="card-title" style="margin-bottom: 10px; font-size: 1.15rem;">${camp.campName}</h3>
          
          <div class="card-meta">
            <i class="far fa-calendar-alt" style="color: var(--primary);"></i>
            <span>${dateFormatted} | ${camp.startTime} - ${camp.endTime}</span>
          </div>

          <div class="card-meta">
            <i class="fas fa-map-marker-alt" style="color: #ef4444;"></i>
            <span>${camp.locationName || 'Main Hospital Hall'}</span>
          </div>

          <p class="card-description" style="margin-top: 8px;">${camp.description}</p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 600;">
              <span style="color: var(--text-secondary);">Available Slots:</span>
              <span style="color: ${isFull ? 'var(--danger)' : 'var(--success)'};">${camp.availableSlots} / ${camp.capacity} left</span>
            </div>
            <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${Math.min(100, ((camp.capacity - camp.availableSlots) / camp.capacity) * 100)}%; background: ${isFull ? 'var(--danger)' : 'var(--primary)'};"></div>
            </div>
          </div>

          <div class="card-footer">
            <button onclick="viewCampDetails(${camp.campId})" class="btn btn-outline btn-sm">
              Details
            </button>
            ${isFull ? `
              <button class="btn btn-sm" disabled style="background: #e2e8f0; color: #94a3b8; cursor: not-allowed;">
                Full Capacity
              </button>
            ` : `
              <button onclick="openCampRegisterModal(${camp.campId})" class="btn btn-primary btn-sm">
                Register Now
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getCampIcon(cat) {
  if (cat.includes('Dental')) return 'fa-tooth';
  if (cat.includes('Blood')) return 'fa-tint';
  if (cat.includes('Eye')) return 'fa-eye';
  if (cat.includes('Pediatric')) return 'fa-baby';
  return 'fa-heartbeat';
}

function setupCampListeners() {
  const searchInput = document.getElementById('camp-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentCampSearch = e.target.value.trim();
      renderCamps();
    });
  }

  const categorySelect = document.getElementById('camp-category-filter');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentCampCategory = e.target.value;
      renderCamps();
    });
  }
}

function viewCampDetails(campId) {
  const camp = allCamps.find(c => c.campId === campId);
  if (!camp) return;

  const content = document.getElementById('camp-details-modal-content');
  if (content) {
    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="badge badge-free" style="margin-bottom: 8px;">FREE HEALTH PROGRAMME</span>
        <h2 style="color: #0b2545; font-size: 1.5rem; margin-top: 6px;">${camp.campName}</h2>
        <span class="badge badge-blue">${camp.category}</span>
      </div>

      <div style="background: #f8fafc; border-radius: var(--radius-sm); padding: 18px; margin-bottom: 20px;">
        <h4 style="color: var(--primary-navy); margin-bottom: 6px;">Description & Services</h4>
        <p style="color: var(--text-secondary); line-height: 1.6;">${camp.description}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: #eff6ff; padding: 12px; border-radius: 8px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">DATE & TIME</div>
          <div style="font-weight: 600; color: #0f172a; margin-top: 4px;">${camp.campDate} (${camp.startTime} - ${camp.endTime})</div>
        </div>
        <div style="background: #eff6ff; padding: 12px; border-radius: 8px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">HOSPITAL LOCATION</div>
          <div style="font-weight: 600; color: #0f172a; margin-top: 4px;">${camp.locationName} (${camp.buildingAndFloor || 'Main Building'})</div>
        </div>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; color: #92400e; font-size: 0.88rem;">
        <i class="fas fa-info-circle"></i> <strong>Registration Deadline:</strong> ${camp.registrationDeadline}. Early booking recommended due to slot limits.
      </div>
    `;
    openModal('camp-details-modal');
  }
}

function openCampRegisterModal(campId) {
  const user = api.getCurrentUser();
  if (!user) {
    alert('Please log in or register for a patient account to register for this medical camp.');
    window.location.href = 'login.html?redirect=' + encodeURIComponent('medical-camps.html');
    return;
  }

  const camp = allCamps.find(c => c.campId === campId);
  if (!camp) return;

  selectedCampIdForRegister = campId;
  const content = document.getElementById('camp-register-modal-content');
  if (content) {
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="color: #0b2545;">Register for ${camp.campName}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Date: ${camp.campDate} | Slot: ${camp.startTime} - ${camp.endTime}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Patient Name</label>
        <input type="text" class="form-control" value="${user.fullName}" disabled style="background: #f1f5f9;">
      </div>

      <div class="form-group">
        <label class="form-label">Registered Email</label>
        <input type="email" class="form-control" value="${user.email}" disabled style="background: #f1f5f9;">
      </div>

      <div class="form-group">
        <label class="form-label">Special Requests / Notes (Optional)</label>
        <textarea id="camp-register-notes" class="form-control" placeholder="E.g. Wheelchair assistance required, morning time slot preferred..."></textarea>
      </div>
    `;
    openModal('camp-register-modal');
  }
}

async function submitCampRegistration() {
  if (!selectedCampIdForRegister) return;
  const notes = document.getElementById('camp-register-notes')?.value || '';

  try {
    const reg = await api.registerForCamp(selectedCampIdForRegister, notes);
    closeModal('camp-register-modal');
    showToast('Registration confirmed successfully! You can view it in your dashboard.', 'success');
    await loadCamps(); // Refresh slot counts
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

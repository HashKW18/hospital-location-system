/**
 * HealthWay Hospital - Location Finder & Interactive Floor Plan Controller
 * Matches Photo 13 from UI Designs
 */

let allLocations = [];
let currentCategory = 'All';
let currentFloor = 'Ground Floor';
let currentSearch = '';
let currentFavorites = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadLocations();
  await loadFavorites();
  setupEventListeners();
  renderInteractiveFloorMap();
});

async function loadFavorites() {
  const user = api.getCurrentUser();
  if (user) {
    try {
      const favs = await api.getMyFavorites();
      currentFavorites = favs.map(f => f.locationId);
    } catch (e) {
      currentFavorites = [];
    }
  }
}

async function loadLocations() {
  const container = document.getElementById('locations-grid');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i>
        <p style="margin-top: 12px; color: var(--text-muted);">Loading hospital locations...</p>
      </div>
    `;
  }

  try {
    allLocations = await api.getLocations();
    renderCategorySidebar();
    renderLocations();
    renderInteractiveFloorMap();
  } catch (err) {
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
          <i class="fas fa-exclamation-triangle fa-2x"></i>
          <p style="margin-top: 10px;">Failed to load locations: ${err.message}</p>
        </div>
      `;
    }
  }
}

function renderCategorySidebar() {
  const sidebar = document.getElementById('category-filter-list');
  if (!sidebar) return;

  // Categories list
  const categories = [
    { name: 'All Departments', key: 'All', icon: 'th-large', count: allLocations.length },
    { name: 'Emergency', key: 'Emergency', icon: 'ambulance', count: allLocations.filter(l => l.category === 'Emergency').length },
    { name: 'Outpatient (OPD)', key: 'Outpatient', icon: 'user-md', count: allLocations.filter(l => l.category === 'Outpatient').length },
    { name: 'Laboratory', key: 'Laboratory', icon: 'flask', count: allLocations.filter(l => l.category === 'Laboratory').length },
    { name: 'Pharmacy', key: 'Pharmacy', icon: 'pills', count: allLocations.filter(l => l.category === 'Pharmacy').length },
    { name: 'Radiology', key: 'Radiology', icon: 'x-ray', count: allLocations.filter(l => l.category === 'Radiology').length },
    { name: 'Dental Clinic', key: 'Dental Clinic', icon: 'tooth', count: allLocations.filter(l => l.category === 'Dental Clinic').length },
    { name: 'Eye Clinic', key: 'Eye Clinic', icon: 'eye', count: allLocations.filter(l => l.category === 'Eye Clinic').length },
    { name: 'Hospital Amenities', key: 'Amenities', icon: 'concierge-bell', count: allLocations.filter(l => l.category.includes('Amenities') || l.category.includes('ATM') || l.category.includes('Gift') || l.category.includes('Mcdonalds')).length },
    { name: 'Specialty Clinics', key: 'Specialty', icon: 'stethoscope', count: allLocations.filter(l => l.category.includes('Nurology') || l.category.includes('Dialysis') || l.category.includes('Oncology') || l.category.includes('Pediatrics') || l.category.includes('Ward') || l.category.includes('Care')).length }
  ];

  sidebar.innerHTML = categories.map(cat => `
    <li style="margin-bottom: 6px;">
      <a href="javascript:void(0)" onclick="selectCategory('${cat.key}')" 
         class="category-btn ${currentCategory === cat.key ? 'active' : ''}" 
         style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius-sm); color: ${currentCategory === cat.key ? 'white' : 'var(--text-secondary)'}; background: ${currentCategory === cat.key ? 'var(--primary)' : 'transparent'}; font-weight: 600; text-decoration: none;">
        <span style="display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-${cat.icon}"></i> ${cat.name}
        </span>
        <span class="badge ${currentCategory === cat.key ? 'badge-blue' : 'badge-gray'}" style="${currentCategory === cat.key ? 'background: rgba(255,255,255,0.25); color: white;' : ''}">
          ${cat.count}
        </span>
      </a>
    </li>
  `).join('');
}

function selectCategory(category) {
  currentCategory = category;
  renderCategorySidebar();
  renderLocations();
}

function renderLocations() {
  const container = document.getElementById('locations-grid');
  const countEl = document.getElementById('location-count-badge');
  if (!container) return;

  const filtered = allLocations.filter(loc => {
    // Search match
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const match = loc.locationName.toLowerCase().includes(q) ||
                    loc.category.toLowerCase().includes(q) ||
                    loc.building.toLowerCase().includes(q) ||
                    loc.floor.toLowerCase().includes(q) ||
                    (loc.roomNumber && loc.roomNumber.toLowerCase().includes(q)) ||
                    (loc.description && loc.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category match
    if (currentCategory !== 'All') {
      if (currentCategory === 'Amenities') {
        return loc.category.includes('Amenities') || loc.category.includes('ATM') || loc.category.includes('Gift') || loc.category.includes('Mcdonalds') || loc.category.includes('Elevators') || loc.category.includes('Car park');
      }
      if (currentCategory === 'Specialty') {
        return loc.category.includes('Nurology') || loc.category.includes('Dialysis') || loc.category.includes('Oncology') || loc.category.includes('Pediatrics') || loc.category.includes('Ward') || loc.category.includes('Care');
      }
      return loc.category.toLowerCase() === currentCategory.toLowerCase();
    }

    return true;
  });

  if (countEl) {
    countEl.innerText = `Showing 1 - ${filtered.length} of ${allLocations.length} locations`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <i class="fas fa-search-location fa-3x" style="color: var(--text-light); margin-bottom: 16px;"></i>
        <h3 style="color: var(--primary-navy); margin-bottom: 6px;">No hospital locations found</h3>
        <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 20px auto;">
          We couldn't find any department or facility matching your search term. Try searching for "Emergency", "Pharmacy", "Laboratory", or clear filters.
        </p>
        <button onclick="clearFilters()" class="btn btn-outline btn-sm">Clear All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(loc => {
    const isFav = currentFavorites.includes(loc.locationId);
    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="badge ${getCategoryBadgeClass(loc.category)}">${loc.category}</span>
            <button onclick="toggleFavorite(${loc.locationId})" style="background: none; border: none; cursor: pointer; color: ${isFav ? '#ef4444' : '#cbd5e1'}; font-size: 1.25rem; transition: transform 0.2s;" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
            </button>
          </div>
          <h3 class="card-title" style="margin-bottom: 8px;">${loc.locationName}</h3>
          <div class="card-meta">
            <i class="fas fa-map-marker-alt" style="color: var(--primary);"></i>
            <span>${loc.building}, ${loc.floor} ${loc.roomNumber ? `(${loc.roomNumber})` : ''}</span>
          </div>
          <div class="card-meta" style="margin-bottom: 12px;">
            <i class="far fa-clock" style="color: #10b981;"></i>
            <span>${loc.openingHours || '24 Hours'}</span>
          </div>
          <p class="card-description">${loc.description || 'Dedicated hospital facility for patient care and diagnostics.'}</p>
        </div>

        <div class="card-footer" style="margin-top: 16px;">
          <button onclick="viewLocationDetails(${loc.locationId})" class="btn btn-outline btn-sm" style="flex: 1;">
            View Details &rarr;
          </button>
          <button onclick="openDirectionsModal(${loc.locationId})" class="btn btn-primary btn-sm" style="flex: 1;">
            <i class="fas fa-location-arrow"></i> Directions
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryBadgeClass(cat) {
  if (cat.includes('Emergency')) return 'badge-red';
  if (cat.includes('Pharmacy') || cat.includes('Lab')) return 'badge-green';
  if (cat.includes('Outpatient') || cat.includes('Clinic')) return 'badge-blue';
  return 'badge-gray';
}

function clearFilters() {
  currentCategory = 'All';
  currentSearch = '';
  const searchInput = document.getElementById('location-search-input');
  if (searchInput) searchInput.value = '';
  renderCategorySidebar();
  renderLocations();
}

function setupEventListeners() {
  const searchInput = document.getElementById('location-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      renderLocations();
    });
  }

  // Floor selector tabs for map
  const floorBtns = document.querySelectorAll('.floor-tab-btn');
  floorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      floorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFloor = btn.dataset.floor;
      renderInteractiveFloorMap();
    });
  });
}

async function toggleFavorite(locId) {
  const user = api.getCurrentUser();
  if (!user) {
    alert('Please log in as a registered patient to bookmark favorite hospital locations.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await api.toggleFavorite(locId);
    if (res.favorited) {
      currentFavorites.push(locId);
      showToast('Location saved to your dashboard favorites!', 'success');
    } else {
      currentFavorites = currentFavorites.filter(id => id !== locId);
      showToast('Location removed from favorites', 'warning');
    }
    renderLocations();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function viewLocationDetails(locId) {
  const loc = allLocations.find(l => l.locationId === locId);
  if (!loc) return;

  const content = document.getElementById('location-details-content');
  if (content) {
    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="badge ${getCategoryBadgeClass(loc.category)}" style="font-size: 0.85rem; padding: 6px 14px;">${loc.category}</span>
        <h2 style="color: #0b2545; font-size: 1.6rem; margin-top: 10px; margin-bottom: 6px;">${loc.locationName}</h2>
        <div style="display: flex; gap: 16px; color: var(--text-muted); font-size: 0.95rem; margin-bottom: 14px;">
          <span><i class="fas fa-building" style="color: var(--primary);"></i> ${loc.building}</span>
          <span><i class="fas fa-layer-group" style="color: var(--primary);"></i> ${loc.floor}</span>
          ${loc.roomNumber ? `<span><i class="fas fa-door-open" style="color: var(--primary);"></i> Room ${loc.roomNumber}</span>` : ''}
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: var(--radius-sm); padding: 18px; margin-bottom: 20px; border: 1px solid var(--border-color);">
        <h4 style="color: var(--primary-navy); margin-bottom: 6px; font-size: 0.95rem;">About this Department / Facility</h4>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">${loc.description || 'Specialized clinical hospital facility.'}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: #eff6ff; border-radius: var(--radius-sm); padding: 14px; border-left: 4px solid var(--primary);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Operating Hours</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #0b2545; margin-top: 4px;">${loc.openingHours || '24 Hours Open'}</div>
        </div>
        <div style="background: #ecfdf5; border-radius: var(--radius-sm); padding: 14px; border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #059669; text-transform: uppercase;">Current Status</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #065f46; margin-top: 4px;">${loc.status || 'OPEN FOR SERVICE'}</div>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 16px;">
        <h4 style="color: var(--primary-navy); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-route" style="color: var(--primary);"></i> Standard Walking Directions
        </h4>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">${loc.directions || 'Follow internal hospital signs to reach this unit.'}</p>
      </div>
    `;
    openModal('location-details-modal');
  }
}

function openDirectionsModal(locId) {
  const loc = allLocations.find(l => l.locationId === locId);
  if (!loc) return;

  const content = document.getElementById('directions-modal-content');
  if (content) {
    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #0b2545;">Directions to ${loc.locationName}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Destination: ${loc.building}, ${loc.floor} (${loc.roomNumber || 'Main Area'})</p>
      </div>

      <div class="form-group">
        <label class="form-label">Select Your Starting Point:</label>
        <select id="start-point-select" class="form-control" onchange="calculateTurnByTurnDirections(${loc.locationId}, this.value)">
          <option value="main_reception">Main Entrance / Reception Desk (Ground Floor)</option>
          <option value="emergency_gate">Emergency Ambulance Gate</option>
          <option value="car_park">Car Park Entrance & Valet Kiosk</option>
          <option value="elevator_a">Central Elevator Bank A (Ground Floor)</option>
        </select>
      </div>

      <div id="step-by-step-box" style="margin-top: 20px;">
        <!-- Directions injected here -->
      </div>
    `;
    calculateTurnByTurnDirections(locId, 'main_reception');
    openModal('directions-modal');
  }
}

function calculateTurnByTurnDirections(locId, startPoint) {
  const loc = allLocations.find(l => l.locationId === locId);
  const box = document.getElementById('step-by-step-box');
  if (!loc || !box) return;

  const steps = [];
  const floor = loc.floor || 'Ground Floor';
  const name = loc.locationName;
  const isGround = floor.includes('Ground');
  const is1st = floor.includes('1st');
  const is2nd = floor.includes('2nd');
  const is3rd = floor.includes('3rd');

  if (startPoint === 'main_reception') {
    steps.push('<strong>Step 1:</strong> Start at the central circular <strong>Main Reception Desk</strong> in the Ground Floor lobby.');
    if (isGround) {
      if (loc.locationId === 13) {
        steps.push('You have arrived! The Main Reception Information & Check-in Desk is right here.');
      } else if (loc.locationId === 14) {
        steps.push('<strong>Step 2:</strong> Turn immediately to your right (east). The <strong>Cashier & Billing counters (CSH-01)</strong> are directly adjacent to the reception desk.');
      } else if (loc.locationId === 24) {
        steps.push('<strong>Step 2:</strong> Walk past the Cashier counters toward the right wall. The <strong>24/7 ATM kiosk (ATM-01)</strong> is located directly ahead.');
      } else if (loc.locationId === 4) {
        steps.push('<strong>Step 2:</strong> Walk east past Cashier and turn left down Corridor A. The <strong>Central Pharmacy (PH-01)</strong> dispensing counter is directly on your right.');
      } else if (loc.locationId === 1) {
        steps.push('<strong>Step 2:</strong> Walk straight ahead (north) along the central main hallway past Elevator Bank A.');
        steps.push('<strong>Step 3:</strong> Enter through the red-lit trauma double doors into the <strong>Emergency Unit (ER-01)</strong> with direct ambulance bay access.');
      } else if (loc.locationId === 12) {
        steps.push('<strong>Step 2:</strong> Head northwest past Elevator Bank A into Science Wing (Block B).');
        steps.push('<strong>Step 3:</strong> The <strong>Blood Bank donor lounge (BB-02)</strong> is located down the corridor on your left.');
      } else if (loc.locationId === 20) {
        steps.push('<strong>Step 2:</strong> Follow the eastern corridor past the Pharmacy and enter Hope Center (Block J) in the top-right wing.');
        steps.push('<strong>Step 3:</strong> The <strong>Oncology Unit (ONC-01)</strong> outpatient clinic & daycare is at the end of the bright corridor.');
      } else if (loc.locationId === 22) {
        steps.push('<strong>Step 2:</strong> Look to your left near the front glass entrance doors. The <strong>Gift & Flower Shop (GFT-01)</strong> is right by the lobby visitor seating area.');
      } else if (loc.locationId === 26) {
        steps.push('<strong>Step 2:</strong> Follow the eastern corridor past the cashier area out towards Hospital Plaza (Block P). <strong>McDonald\'s (MCD-01)</strong> is in the landscaped exterior plaza.');
      } else if (loc.locationId === 25) {
        steps.push('<strong>Step 2:</strong> Exit through the eastern lobby doors along the sheltered walkway to the <strong>Car Park Entrance & Barrier Gate</strong>.');
      } else if (loc.locationId === 27) {
        steps.push('<strong>Step 2:</strong> Walk past the Cashier and ATM towards the bottom-right hallway corridor. <strong>Hospital Public Restrooms & Bathrooms (WC-GF)</strong> are on your right.');
      } else {
        steps.push(`<strong>Step 2:</strong> Follow ground corridor signs towards ${loc.building} to reach <strong>${name}</strong> (${loc.roomNumber || 'Ground Floor'}).`);
      }
    } else {
      steps.push('<strong>Step 2:</strong> Walk 15 meters to your left (west) to <strong>Central Elevator Bank A</strong> behind the reception desk.');
      steps.push(`<strong>Step 3:</strong> Take Elevator A up to the <strong>${floor}</strong>.`);
      if (is1st) {
        if (loc.locationId === 2) {
          steps.push('<strong>Step 4:</strong> Step out directly into the central circular <strong>Outpatient Department (OPD-101)</strong> lounge and token consultation booths.');
        } else if (loc.locationId === 3) {
          steps.push('<strong>Step 4:</strong> Turn left into Science Wing (Block B). The diagnostic <strong>Laboratory (LAB-105)</strong> and blood draw counter are on your left.');
        } else if (loc.locationId === 6) {
          steps.push('<strong>Step 4:</strong> Turn left towards Dental Wing (Block C). The <strong>Dental Clinic (DNT-102)</strong> is located midway down on your right.');
        } else if (loc.locationId === 16) {
          steps.push('<strong>Step 4:</strong> Turn left and proceed to the bottom-left wing into Renal Care Center (Block H) for the <strong>Dialysis Unit (DIA-101)</strong>.');
        } else if (loc.locationId === 10) {
          steps.push('<strong>Step 4:</strong> Turn right from the central OPD lounge into Main Building (Block A). <strong>Medical Clinic (MC-108)</strong> is directly on your right.');
        } else if (loc.locationId === 11) {
          steps.push('<strong>Step 4:</strong> Turn right towards the upper-right corridor into Surgical Pavilion (Block F). <strong>Surgical Clinic (SC-102)</strong> is on your left.');
        } else if (loc.locationId === 19) {
          steps.push('<strong>Step 4:</strong> Follow the corridor right into Women & Child Wing (Block D) on the far right. The <strong>Pediatrics Clinic (PED-101)</strong> is at the end.');
        } else if (loc.locationId === 28) {
          steps.push('<strong>Step 4:</strong> Head toward the bottom-right corridor. <strong>Hospital Restrooms & Bathrooms (WC-1F)</strong> are clearly marked with blue signage.');
        } else {
          steps.push(`<strong>Step 4:</strong> Follow directional signage on the 1st Floor toward Room ${loc.roomNumber || name}.`);
        }
      } else if (is2nd) {
        if (loc.locationId === 5) {
          steps.push('<strong>Step 4:</strong> Step out directly into the central <strong>Radiology Department rotunda (RAD-204)</strong> featuring 3T MRI, CT scanner, and X-ray suites.');
        } else if (loc.locationId === 21) {
          steps.push('<strong>Step 4:</strong> Turn left into Science Wing (Block B). <strong>Hematology (HEM-201)</strong> is located down the corridor on your left.');
        } else if (loc.locationId === 7) {
          steps.push('<strong>Step 4:</strong> Turn left into Dental & Eye Wing (Block C). The <strong>Eye Clinic (EYE-201)</strong> with vision testing lanes is on your left.');
        } else if (loc.locationId === 17) {
          steps.push('<strong>Step 4:</strong> Turn right into Surgical Pavilion (Block F). The main sterile <strong>Surgical Department Operating Theaters (OT-200)</strong> are through the authorized security checkpoint.');
        } else if (loc.locationId === 8) {
          steps.push('<strong>Step 4:</strong> Follow the right-hand corridor into Women & Child Wing (Block D) on the far right for <strong>Children\'s Ward (W-D201)</strong> and family play area.');
        } else if (loc.locationId === 29) {
          steps.push('<strong>Step 4:</strong> Follow the southeast corridor to the bottom-right corner for <strong>Hospital Restrooms & Bathrooms (WC-2F)</strong>.');
        } else {
          steps.push(`<strong>Step 4:</strong> Follow overhead signs on the 2nd Floor toward ${name} (${loc.roomNumber || 'Main Area'}).`);
        }
      } else if (is3rd) {
        if (loc.locationId === 18) {
          steps.push('<strong>Step 4:</strong> Turn southwest toward Main Building Block A. Check in via the security intercom at the double doors of the <strong>Intensive Care Unit (ICU-300)</strong>.');
        } else if (loc.locationId === 15) {
          steps.push('<strong>Step 4:</strong> Turn left into Specialist Wing (Block G). The <strong>Neurology Department (NEU-301)</strong> and EEG suite are down the corridor on your left.');
        } else if (loc.locationId === 9) {
          steps.push('<strong>Step 4:</strong> Turn right into the bright east wing into Inpatient Tower (Block E) for the <strong>General Ward (W-E301)</strong>.');
        } else if (loc.locationId === 30) {
          steps.push('<strong>Step 4:</strong> Public and visitor restrooms (WC-3F) are situated in the bottom-right corridor opposite the General Ward visitors\' lounge.');
        } else {
          steps.push(`<strong>Step 4:</strong> Follow 3rd Floor signs toward ${name} (${loc.roomNumber || 'Main Area'}).`);
        }
      }
    }
  } else if (startPoint === 'emergency_gate') {
    steps.push('<strong>Step 1:</strong> Start at the dedicated <strong>Emergency Ambulance Bay & Ramp</strong> on the north side of the hospital.');
    if (loc.locationId === 1) {
      steps.push('<strong>Step 2:</strong> You have arrived! Enter through the automatic sliding doors directly into Emergency Trauma Triage (ER-01).');
    } else {
      steps.push('<strong>Step 2:</strong> Pass through the ER triage concourse and take the connector corridor into the Ground Floor main lobby.');
      if (isGround) {
        steps.push(`<strong>Step 3:</strong> Follow corridor signs towards ${loc.building} to locate <strong>${name}</strong> (${loc.roomNumber || 'Ground Floor Area'}).`);
      } else {
        steps.push(`<strong>Step 3:</strong> Take Central Elevator Bank A up to the <strong>${floor}</strong>.`);
        steps.push(`<strong>Step 4:</strong> Follow directional hallway signs to Room ${loc.roomNumber || name}.`);
      }
    }
  } else if (startPoint === 'car_park') {
    steps.push('<strong>Step 1:</strong> Start at the covered <strong>Car Park Entrance & Valet Kiosk</strong> on the southeast hospital perimeter.');
    steps.push('<strong>Step 2:</strong> Walk along the sheltered illuminated pedestrian path and enter through the eastern lobby entrance.');
    if (isGround) {
      steps.push(`<strong>Step 3:</strong> Pass Cashier and ATM; follow the main concourse to <strong>${name}</strong> (${loc.roomNumber || 'Ground Floor'}).`);
    } else {
      steps.push('<strong>Step 3:</strong> Walk through the atrium to <strong>Central Elevator Bank A</strong>.');
      steps.push(`<strong>Step 4:</strong> Take Elevator A to <strong>${floor}</strong> and proceed to ${name}.`);
    }
  } else {
    steps.push(`<strong>Step 1:</strong> Start at <strong>Central Elevator Bank A</strong>.`);
    steps.push(`<strong>Step 2:</strong> Select and ride the elevator to <strong>${floor}</strong>.`);
    steps.push(`<strong>Step 3:</strong> Step out on ${floor} and follow overhead directional signs directly to <strong>${name}</strong> (${loc.roomNumber || 'Department Lounge'}).`);
  }

  steps.push(`<strong>Destination Reached:</strong> Arrive at <strong>${name}</strong> (${loc.building}, Room ${loc.roomNumber || 'Main Desk'}). Check in with the duty nurse or service counter.`);

  box.innerHTML = `
    <div style="background: #f0f7ff; border-radius: var(--radius-md); padding: 18px; border: 1px solid #bfdbfe;">
      <h4 style="color: var(--primary); margin-bottom: 12px; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-shoe-prints"></i> Turn-by-Turn Route Guidance (Based on 3D Architectural Map)
      </h4>
      <ol style="margin-left: 20px; color: #334155; font-size: 0.92rem; line-height: 1.8;">
        ${steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
      <div style="margin-top: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); border-top: 1px dashed #cbd5e1; padding-top: 10px;">
        <span><i class="fas fa-stopwatch"></i> Estimated walk: ~2-3 minutes</span>
        <button class="btn btn-sm btn-outline" onclick="openFullMapModalForFloor('${loc.floor}')" style="font-size: 0.78rem; padding: 4px 10px;">
          <i class="fas fa-map"></i> View on 3D Floor Blueprint
        </button>
      </div>
    </div>
  `;
}

// 3D ARCHITECTURAL FLOOR MAP DATA & RENDERING
const floorMapImages = {
  'Ground Floor': 'images/floor-maps/Hospital_ground_floor.jpg',
  '1st Floor': 'images/floor-maps/Hospital_first_floor.jpg',
  '2nd Floor': 'images/floor-maps/Hospital_second_floor.jpg',
  '3rd Floor': 'images/floor-maps/Hospital_third_floor.jpg'
};

const floorTitles = {
  'Ground Floor': 'Ground Floor - Main Medical Complex & Trauma Unit',
  '1st Floor': '1st Floor - Outpatient Department (OPD), Labs & Clinics',
  '2nd Floor': '2nd Floor - Radiology & Imaging, Surgery & Pediatrics',
  '3rd Floor': '3rd Floor - Intensive Care (ICU), Neurology & General Ward'
};

let currentMapZoom = 1;

function renderInteractiveFloorMap() {
  const container = document.getElementById('floor-map-preview-container');
  if (!container) return;

  const imgSrc = floorMapImages[currentFloor] || floorMapImages['Ground Floor'];
  const title = floorTitles[currentFloor] || currentFloor;

  // Find all locations on this floor
  const floorLocations = allLocations.filter(loc => {
    const f = (loc.floor || '').toLowerCase();
    const cf = currentFloor.toLowerCase();
    if (cf.includes('ground')) return f.includes('ground');
    if (cf.includes('1st') || cf.includes('1')) return f.includes('1st') || f.includes('1');
    if (cf.includes('2nd') || cf.includes('2')) return f.includes('2nd') || f.includes('2');
    if (cf.includes('3rd') || cf.includes('3')) return f.includes('3rd') || f.includes('3');
    return false;
  });

  container.innerHTML = `
    <div class="floor-map-img-box" onclick="openFullMapModal()" title="Click to open enlarged 3D blueprint">
      <div class="floor-map-overlay-badge">
        <i class="fas fa-layer-group"></i> ${currentFloor}
      </div>
      <img src="${imgSrc}" alt="${title}" loading="lazy" />
      <div class="floor-map-zoom-hint">
        <i class="fas fa-search-plus"></i> Click to Enlarge 3D Blueprint
      </div>
    </div>

    <div class="floor-quick-nav-header">
      <span style="font-size: 0.8rem; font-weight: 700; color: #0b2545;">
        <i class="fas fa-map-pin" style="color: var(--primary);"></i> Facilities on this Level (${floorLocations.length})
      </span>
      <span style="font-size: 0.72rem; color: var(--text-muted);">Click to inspect</span>
    </div>

    <div class="floor-departments-pills">
      ${floorLocations.map(loc => {
        const isWC = (loc.roomNumber && loc.roomNumber.startsWith('WC')) || loc.locationName.toLowerCase().includes('bathroom');
        return `
          <button type="button" class="floor-dept-pill ${isWC ? 'wc-pill' : ''}" onclick="viewLocationDetails(${loc.locationId})" title="${loc.locationName} (${loc.roomNumber || ''})">
            <i class="fas ${isWC ? 'fa-restroom' : 'fa-door-open'}" style="font-size: 0.75rem;"></i>
            <span>${loc.locationName}</span>
            ${loc.roomNumber ? `<small style="opacity: 0.75; font-size: 0.7rem;">${loc.roomNumber}</small>` : ''}
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function highlightMapPin(locId) {
  viewLocationDetails(locId);
}

function openFullMapModal() {
  setFullMapFloor(currentFloor);
  openModal('full-map-modal');
}

function openFullMapModalForFloor(floorName) {
  currentFloor = floorName || 'Ground Floor';
  // update sidebar tabs
  const floorBtns = document.querySelectorAll('.floor-tab-btn');
  floorBtns.forEach(b => {
    if (b.dataset.floor === currentFloor) b.classList.add('active');
    else b.classList.remove('active');
  });
  renderInteractiveFloorMap();
  openFullMapModal();
}

function setFullMapFloor(floorName) {
  currentFloor = floorName;
  const title = document.getElementById('full-map-title');
  if (title) title.innerText = floorTitles[floorName] || `${floorName} - 3D Architectural Blueprint`;

  // Update tabs inside full map modal
  const tabs = document.querySelectorAll('#full-map-tabs button');
  tabs.forEach(btn => {
    const text = btn.innerText.toLowerCase();
    const target = floorName.toLowerCase();
    if (target.includes('ground') && text.includes('ground')) btn.classList.add('active');
    else if (target.includes('1st') && text.includes('1st')) btn.classList.add('active');
    else if (target.includes('2nd') && text.includes('2nd')) btn.classList.add('active');
    else if (target.includes('3rd') && text.includes('3rd')) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Update sidebar tabs as well
  const sidebarBtns = document.querySelectorAll('.floor-tab-btn');
  sidebarBtns.forEach(btn => {
    if (btn.dataset.floor === floorName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Update image
  const imgEl = document.getElementById('full-map-image-element');
  if (imgEl) {
    imgEl.src = floorMapImages[floorName] || floorMapImages['Ground Floor'];
  }
  resetFullMapZoom();

  // Also update sidebar preview
  renderInteractiveFloorMap();

  // Render department directory in full map modal
  renderFullMapDepartmentGrid(floorName);
}

function renderFullMapDepartmentGrid(floorName) {
  const container = document.getElementById('full-map-department-grid');
  if (!container) return;

  const floorLocations = allLocations.filter(loc => {
    const f = (loc.floor || '').toLowerCase();
    const cf = floorName.toLowerCase();
    if (cf.includes('ground')) return f.includes('ground');
    if (cf.includes('1st') || cf.includes('1')) return f.includes('1st') || f.includes('1');
    if (cf.includes('2nd') || cf.includes('2')) return f.includes('2nd') || f.includes('2');
    if (cf.includes('3rd') || cf.includes('3')) return f.includes('3rd') || f.includes('3');
    return false;
  });

  container.innerHTML = floorLocations.map(loc => `
    <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="badge ${getCategoryBadgeClass(loc.category)}" style="font-size: 0.7rem; padding: 2px 8px;">${loc.category}</span>
          ${loc.roomNumber ? `<span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">${loc.roomNumber}</span>` : ''}
        </div>
        <div style="font-size: 0.88rem; font-weight: 700; color: #0b2545; margin-bottom: 4px;">${loc.locationName}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${loc.building}</div>
      </div>
      <div style="display: flex; gap: 6px; margin-top: 10px;">
        <button onclick="closeModal('full-map-modal'); viewLocationDetails(${loc.locationId});" class="btn btn-outline btn-sm" style="flex: 1; font-size: 0.75rem; padding: 4px 6px;">
          <i class="fas fa-info-circle"></i> Info
        </button>
        <button onclick="closeModal('full-map-modal'); openDirectionsModal(${loc.locationId});" class="btn btn-primary btn-sm" style="flex: 1; font-size: 0.75rem; padding: 4px 6px;">
          <i class="fas fa-location-arrow"></i> Directions
        </button>
      </div>
    </div>
  `).join('');
}

function zoomFullMap(factor) {
  currentMapZoom = Math.min(Math.max(currentMapZoom * factor, 0.7), 2.8);
  applyMapZoom();
}

function resetFullMapZoom() {
  currentMapZoom = 1;
  applyMapZoom();
}

function applyMapZoom() {
  const img = document.getElementById('full-map-image-element');
  if (img) {
    img.style.transform = `scale(${currentMapZoom})`;
  }
}

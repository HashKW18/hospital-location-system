/**
 * HealthWay Hospital - Notifications Controller
 * Matches Photo 25 from UI Mockups
 */

let allNotifications = [];
let activeNotifCategory = 'All';
let notifSearch = '';

document.addEventListener('DOMContentLoaded', async () => {
  await loadNotifications();
  setupNotifListeners();
});

async function loadNotifications() {
  const container = document.getElementById('notifications-list');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i>
        <p style="margin-top: 12px; color: var(--text-muted);">Loading announcements...</p>
      </div>
    `;
  }

  try {
    allNotifications = await api.getNotifications();
    renderNotifications();
  } catch (err) {
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--danger);">
          <i class="fas fa-exclamation-triangle fa-2x"></i>
          <p style="margin-top: 10px;">Failed to load notifications: ${err.message}</p>
        </div>
      `;
    }
  }
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  const filtered = allNotifications.filter(item => {
    if (notifSearch) {
      const q = notifSearch.toLowerCase();
      const match = item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeNotifCategory !== 'All') {
      if (activeNotifCategory === 'CAMP' && item.category !== 'CAMP') return false;
      if (activeNotifCategory === 'ANNOUNCEMENT' && item.category !== 'ANNOUNCEMENT') return false;
      if (activeNotifCategory === 'GENERAL' && item.category === 'CAMP') return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; background: white; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <i class="far fa-bell-slash fa-3x" style="color: var(--text-light); margin-bottom: 14px;"></i>
        <h4 style="color: var(--primary-navy);">No notifications in this category</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">You are up to date with all hospital broadcasts.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const timeAgo = formatTimeAgo(item.publishedAt);
    return `
      <div class="notif-item">
        <div class="notif-icon">
          <i class="fas ${getNotifIcon(item.category)}"></i>
        </div>
        <div class="notif-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <h4 class="notif-title">${item.title}</h4>
            <span class="notif-meta">${timeAgo}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.93rem; margin-top: 4px; line-height: 1.5;">${item.message}</p>
          <div style="margin-top: 8px;">
            <span class="badge ${getCategoryBadge(item.category)}">${item.category}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getNotifIcon(cat) {
  if (cat === 'CAMP') return 'fa-calendar-plus';
  if (cat === 'SCHEDULE_CHANGE') return 'fa-clock';
  if (cat === 'SERVICE_INTERRUPTION') return 'fa-tools';
  return 'fa-bullhorn';
}

function getCategoryBadge(cat) {
  if (cat === 'CAMP') return 'badge-green';
  if (cat === 'SERVICE_INTERRUPTION') return 'badge-red';
  if (cat === 'SCHEDULE_CHANGE') return 'badge-yellow';
  return 'badge-blue';
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function setupNotifListeners() {
  const searchInput = document.getElementById('notif-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      notifSearch = e.target.value.trim();
      renderNotifications();
    });
  }

  const tabBtns = document.querySelectorAll('.notif-filter-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeNotifCategory = btn.dataset.category;
      renderNotifications();
    });
  });
}

function markAllAsRead() {
  showToast('All notifications marked as read', 'success');
}

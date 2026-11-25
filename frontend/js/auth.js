/**
 * HealthWay Hospital - Authentication & Role Navigation Controller
 */

const auth = {
  // Update Header UI based on login status
  updateNavbar() {
    const user = api.getCurrentUser();
    const navActions = document.getElementById('nav-auth-actions');
    if (!navActions) return;

    if (user) {
      // Determine dashboard link according to role
      let dashboardUrl = 'user-dashboard.html';
      let roleLabel = 'Patient';
      if (user.role === 'STAFF') {
        dashboardUrl = 'staff-dashboard.html';
        roleLabel = 'Staff';
      } else if (user.role === 'ADMIN') {
        dashboardUrl = 'admin-dashboard.html';
        roleLabel = 'Admin';
      }

      const initial = user.fullName ? user.fullName.trim().charAt(0).toUpperCase() : 'U';

      navActions.innerHTML = `
        <div class="user-nav-profile">
          <div class="user-avatar-pill" title="${user.fullName} (${roleLabel})">
            <div class="avatar-circle">${initial}</div>
            <span style="font-weight: 700;">${user.fullName}</span>
          </div>
          <a href="${dashboardUrl}" class="btn btn-primary btn-sm">
            <i class="fas fa-th-large"></i> Dashboard
          </a>
          <button onclick="auth.logout()" class="btn btn-outline btn-sm" title="Log out">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      `;
    } else {
      navActions.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">
          <i class="fas fa-user"></i> Login
        </a>
        <a href="login.html?tab=register" class="btn btn-primary btn-sm">
          <i class="fas fa-user-plus"></i> Register
        </a>
      `;
    }
  },

  // Protect a page based on allowed roles
  protectPage(allowedRoles = []) {
    const user = api.getCurrentUser();
    if (!user) {
      alert('Please log in to access this page.');
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert('Access Denied: You do not have permission to view this page.');
      if (user.role === 'ADMIN') window.location.href = 'admin-dashboard.html';
      else if (user.role === 'STAFF') window.location.href = 'staff-dashboard.html';
      else window.location.href = 'user-dashboard.html';
      return false;
    }

    return true;
  },

  // Perform login
  async login(email, password) {
    try {
      const resp = await api.login(email, password);
      // Redirect to appropriate dashboard
      if (resp.role === 'ADMIN') {
        window.location.href = 'admin-dashboard.html';
      } else if (resp.role === 'STAFF') {
        window.location.href = 'staff-dashboard.html';
      } else {
        window.location.href = 'user-dashboard.html';
      }
    } catch (err) {
      throw err;
    }
  },

  // Quick Demo Login Helper for Evaluators
  async demoLogin(role) {
    let email = 'alex.carter@gmail.com';
    if (role === 'STAFF') email = 'staff.sarah@healthway.hospital';
    if (role === 'ADMIN') email = 'admin@healthway.hospital';

    try {
      await this.login(email, 'Password@123');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  },

  logout() {
    api.clearAuth();
    window.location.href = 'index.html';
  }
};

// Auto update header on page load
document.addEventListener('DOMContentLoaded', () => {
  auth.updateNavbar();
});

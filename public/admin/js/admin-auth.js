// DOS LAXMI - Admin Authentication & Session Controller

document.addEventListener('DOMContentLoaded', async () => {
  const authScreen = document.getElementById('admin-auth-screen');
  const appScreen = document.getElementById('admin-app');
  const loginForm = document.getElementById('admin-login-form');
  const resetRequestForm = document.getElementById('admin-reset-request-form');
  const resetConfirmForm = document.getElementById('admin-reset-confirm-form');
  const showResetLink = document.getElementById('link-show-reset');
  const backToLoginLink = document.getElementById('link-back-to-login');
  const logoutBtn = document.getElementById('btn-logout');

  // Global handler for 401s
  window.onAdminAuthFailed = () => {
    appScreen.classList.remove('active');
    authScreen.style.display = 'flex';
    window.showToast('Session expired. Please sign in.', 'warning');
  };

  // Toast utility
  window.showToast = (message, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️'));
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // 1. Check existing session
  const token = AdminAPI.getToken();
  if (token) {
    try {
      const me = await AdminAPI.getMe();
      if (me.authenticated) {
        showDashboard(me.user);
      } else {
        showLogin();
      }
    } catch (e) {
      showLogin();
    }
  } else {
    showLogin();
  }

  function showDashboard(user) {
    authScreen.style.display = 'none';
    appScreen.classList.add('active');
    const userEmailEl = document.getElementById('admin-user-email');
    if (userEmailEl && user) {
      userEmailEl.textContent = user.email || 'aryan@birthday.laxmi';
    }
    // Boot dashboard UI
    if (window.initDashboardUI) {
      window.initDashboardUI();
    }
  }

  function showLogin() {
    appScreen.classList.remove('active');
    authScreen.style.display = 'flex';
    if (loginForm) loginForm.style.display = 'block';
    if (resetRequestForm) resetRequestForm.style.display = 'none';
    if (resetConfirmForm) resetConfirmForm.style.display = 'none';
  }

  // Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';
        const res = await AdminAPI.login(email, password);
        window.showToast(res.message || 'Logged in successfully!', 'success');
        showDashboard(res.user);
      } catch (err) {
        window.showToast(err.message || 'Login failed', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Portal';
      }
    });
  }

  // Toggle Forgot Password
  if (showResetLink) {
    showResetLink.addEventListener('click', () => {
      loginForm.style.display = 'none';
      resetRequestForm.style.display = 'block';
      resetConfirmForm.style.display = 'none';
    });
  }

  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', () => {
      resetRequestForm.style.display = 'none';
      resetConfirmForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Password Reset Request
  if (resetRequestForm) {
    resetRequestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value.trim();
      const submitBtn = resetRequestForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating Token...';
        const res = await AdminAPI.requestPasswordReset(email);
        window.showToast(res.message || 'Reset token generated.', 'success');

        if (res.resetToken) {
          // Pre-fill token in confirmation form for smooth experience
          document.getElementById('reset-token').value = res.resetToken;
          resetRequestForm.style.display = 'none';
          resetConfirmForm.style.display = 'block';
        }
      } catch (err) {
        window.showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Reset Token';
      }
    });
  }

  // Confirm Reset with Token
  if (resetConfirmForm) {
    resetConfirmForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('reset-token').value.trim();
      const newPassword = document.getElementById('reset-new-password').value;
      const submitBtn = resetConfirmForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating Password...';
        const res = await AdminAPI.resetPassword(token, newPassword);
        window.showToast(res.message || 'Password reset successfully!', 'success');
        resetConfirmForm.style.display = 'none';
        loginForm.style.display = 'block';
      } catch (err) {
        window.showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Set New Password';
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to log out?')) {
        await AdminAPI.logout();
        window.showToast('You have been logged out.', 'info');
        showLogin();
      }
    });
  }
});

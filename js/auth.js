/* ============================================
   STACKLY — Auth Management & Validations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initRoleSelectors();
  initPasswordToggles();
  initSignInPage();
  initSignUpPage();
});

// ============================================
// LocalStorage User Database Management
// ============================================
const USERS_STORAGE_KEY = 'stackly_registered_users';
const CURRENT_USER_KEY = 'stackly_current_user';

function getStoredUsers() {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  if (!usersJson) {
    // Seed default demo accounts
    const initialUsers = [
      {
        name: 'Demo User',
        email: 'user@stackly.com',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Administrator',
        email: 'admin@stackly.com',
        password: 'admin123',
        role: 'admin'
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  try {
    return JSON.parse(usersJson) || [];
  } catch (e) {
    return [];
  }
}

function saveUser(userObj) {
  const users = getStoredUsers();
  users.push(userObj);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findUser(email, role) {
  const users = getStoredUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && (!role || u.role === role));
}

// ============================================
// Role Selector Handler (User / Admin)
// ============================================
function initRoleSelectors() {
  const roleButtons = document.querySelectorAll('.role-pill-btn');
  const roleInput = document.getElementById('selected-role');

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (roleInput) {
        roleInput.value = btn.getAttribute('data-role');
      }
    });
  });
}

// ============================================
// Password Visibility Toggle
// ============================================
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.auth-password-toggle');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      }
    });
  });
}

// ============================================
// Helpers: Validation & Error Display
// ============================================
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  const box = input ? input.closest('.auth-input-box') : null;

  if (box) box.classList.add('input-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
  }
}

function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  const box = input ? input.closest('.auth-input-box') : null;

  if (box) box.classList.remove('input-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('active');
  }
}

function showAlert(alertId, message, isSuccess = false) {
  const alertEl = document.getElementById(alertId);
  if (!alertEl) return;

  alertEl.className = 'auth-alert ' + (isSuccess ? 'auth-alert-success' : 'auth-alert-error');
  alertEl.innerHTML = `<i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> <span>${message}</span>`;
  alertEl.style.display = 'flex';
}

function hideAlert(alertId) {
  const alertEl = document.getElementById(alertId);
  if (alertEl) alertEl.style.display = 'none';
}

// ============================================
// SIGN IN / LOGIN PAGE LOGIC
// ============================================
function initSignInPage() {
  const form = document.getElementById('signin-form');
  if (!form) return;

  // Check URL parameters for successful signup redirect
  const urlParams = new URLSearchParams(window.location.search);
  const registered = urlParams.get('registered');
  const emailParam = urlParams.get('email');

  if (registered === 'true') {
    showAlert('signin-alert', 'Account registered successfully! Please enter your password to sign in.', true);
    if (emailParam) {
      const emailInput = document.getElementById('signin-email');
      if (emailInput) emailInput.value = decodeURIComponent(emailParam);
      const passInput = document.getElementById('signin-password');
      if (passInput) passInput.focus();
    }
  }

  // Clear errors on input
  ['signin-email', 'signin-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearFieldError(id, id + '-error');
        hideAlert('signin-alert');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('signin-alert');

    const emailInput = document.getElementById('signin-email');
    const passwordInput = document.getElementById('signin-password');
    const roleInput = document.getElementById('selected-role');
    const submitBtn = document.getElementById('btn-signin-submit');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const role = roleInput ? roleInput.value : 'user';

    let hasError = false;

    // Validate email
    if (!email) {
      setFieldError('signin-email', 'signin-email-error', 'Email address is required');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError('signin-email', 'signin-email-error', 'Please enter a valid email address');
      hasError = true;
    } else {
      clearFieldError('signin-email', 'signin-email-error');
    }

    // Validate password
    if (!password) {
      setFieldError('signin-password', 'signin-password-error', 'Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError('signin-password', 'signin-password-error', 'Password must be at least 6 characters');
      hasError = true;
    } else {
      clearFieldError('signin-password', 'signin-password-error');
    }

    if (hasError) return;

    // Check credentials against database
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SIGNING IN...';

    setTimeout(() => {
      const user = findUser(email, role);

      if (!user) {
        // Try searching without role to provide exact helpful feedback
        const userAnyRole = findUser(email, null);
        if (userAnyRole) {
          showAlert('signin-alert', `Account found, but role mismatch: please select "${userAnyRole.role.toUpperCase()}" role.`);
        } else {
          showAlert('signin-alert', 'No account found with this email. Please check or Register Now.');
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'LOGIN';
        return;
      }

      if (user.password !== password) {
        showAlert('signin-alert', 'Incorrect password. Please try again or click Forgot Password.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'LOGIN';
        return;
      }

      // Success! Save session
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        loggedInAt: new Date().toISOString()
      }));

      showAlert('signin-alert', `Welcome back, ${user.name}! Redirecting to dashboard...`, true);

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    }, 700);
  });
}

// ============================================
// SIGN UP / REGISTER PAGE LOGIC
// ============================================
function initSignUpPage() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  // Clear errors on input
  ['signup-name', 'signup-email', 'signup-password', 'signup-confirm-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        clearFieldError(id, id + '-error');
        hideAlert('signup-alert');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('signup-alert');

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm-password');
    const roleInput = document.getElementById('selected-role');
    const submitBtn = document.getElementById('btn-signup-submit');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmInput ? confirmInput.value : '';
    const role = roleInput ? roleInput.value : 'user';

    let hasError = false;

    // Validate Name
    if (!name) {
      setFieldError('signup-name', 'signup-name-error', 'Full name is required');
      hasError = true;
    } else if (name.length < 2) {
      setFieldError('signup-name', 'signup-name-error', 'Name must be at least 2 characters');
      hasError = true;
    } else {
      clearFieldError('signup-name', 'signup-name-error');
    }

    // Validate Email
    if (!email) {
      setFieldError('signup-email', 'signup-email-error', 'Email address is required');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError('signup-email', 'signup-email-error', 'Please enter a valid email address');
      hasError = true;
    } else {
      // Check if email already registered
      const existingUser = findUser(email, null);
      if (existingUser) {
        setFieldError('signup-email', 'signup-email-error', 'An account with this email already exists. Please Sign In.');
        hasError = true;
      } else {
        clearFieldError('signup-email', 'signup-email-error');
      }
    }

    // Validate Password
    if (!password) {
      setFieldError('signup-password', 'signup-password-error', 'Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError('signup-password', 'signup-password-error', 'Password must be at least 6 characters');
      hasError = true;
    } else {
      clearFieldError('signup-password', 'signup-password-error');
    }

    // Validate Confirm / New Password
    if (!confirmPassword) {
      setFieldError('signup-confirm-password', 'signup-confirm-password-error', 'Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setFieldError('signup-confirm-password', 'signup-confirm-password-error', 'Passwords do not match');
      hasError = true;
    } else {
      clearFieldError('signup-confirm-password', 'signup-confirm-password-error');
    }

    if (hasError) return;

    // Process Registration
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> CREATING ACCOUNT...';

    setTimeout(() => {
      // Save new user in database
      saveUser({
        name: name,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString()
      });

      showAlert('signup-alert', 'Account created successfully! Redirecting to Sign In...', true);

      // REQUIREMENT: "after signup it should navigate to sign not dashboard"
      setTimeout(() => {
        window.location.href = `login.html?registered=true&email=${encodeURIComponent(email)}`;
      }, 1100);
    }, 700);
  });
}


/* ============================================
   STACKLY Dashboard — Shared Sidebar Helper
   dashUtils.js — include on every dash page
   ============================================ */

const CURRENT_USER_KEY = 'stackly_current_user';

function dashInit(activeNav) {
  let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  if (!currentUser) {
    currentUser = { name: 'Demo User', email: 'user@stackly.com', role: 'user' };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }

  /* ---- user info ---- */
  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'User';
  const initials  = currentUser.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const userEmail = currentUser.email || 'user@stackly.com';

  document.getElementById('sidebar-user-name')    && (document.getElementById('sidebar-user-name').textContent   = currentUser.name || 'User');
  document.getElementById('sidebar-user-role')    && (document.getElementById('sidebar-user-role').textContent   = currentUser.role || 'user');
  document.getElementById('sidebar-avatar-initials') && (document.getElementById('sidebar-avatar-initials').textContent = initials);
  document.getElementById('topbar-user-name')     && (document.getElementById('topbar-user-name').textContent    = firstName);

  // Populate Login Mail ID across topbar, sidebar footer & mobile drawer
  document.querySelectorAll('#topbar-user-email, .topbar-user-email, #sidebar-user-email, .sidebar-user-email, #mobile-drawer-email, .mobile-drawer-email').forEach(el => {
    const textSpan = el.querySelector('.user-email-text');
    if (textSpan) {
      textSpan.textContent = userEmail;
    } else {
      el.textContent = userEmail;
    }
  });

  document.querySelectorAll('#mobile-drawer-name, .mobile-drawer-name').forEach(el => {
    el.textContent = currentUser.name || 'User';
  });
  document.querySelectorAll('#mobile-drawer-avatar, .mobile-drawer-avatar').forEach(el => {
    el.textContent = initials;
  });

  /* ---- greeting ---- */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const topbarUserEl = document.getElementById('topbar-user-name');
  if (topbarUserEl) {
    const greetingEl = topbarUserEl.closest('.topbar-greeting');
    if (greetingEl) {
      greetingEl.innerHTML = `${greeting}, <span id="topbar-user-name">${firstName}</span> 👋`;
    }
  }

  /* ---- logout ---- */
  function handleLogout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
  }
  document.querySelectorAll('#btn-logout, #topbar-logout-btn, #sidebar-nav-logout, .btn-dash-logout, .sidebar-logout-btn').forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });

  /* ---- mark active sidebar link ---- */
  if (activeNav) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === activeNav) link.classList.add('active');
    });
  }

  /* ---- mobile sidebar toggle ---- */
  const sidebar  = document.getElementById('dash-sidebar');
  const overlay  = document.getElementById('dash-overlay');
  const menuBtn  = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('sidebar-close');
  const openSidebar  = () => {
    sidebar?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  };
  menuBtn?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  /* ---- tab pills ---- */
  document.querySelectorAll('.dash-tab-pills').forEach(group => {
    group.querySelectorAll('.dash-tab-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.dash-tab-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  });

  /* ---- animate stat cards ---- */
  document.querySelectorAll('.stat-value').forEach((el, i) => {
    el.style.cssText = 'opacity:0; transform:translateY(12px)';
    setTimeout(() => { el.style.cssText = 'opacity:1; transform:translateY(0); transition:all 0.5s ease'; }, 180 + i * 90);
  });

  /* ---- animate progress bars ---- */
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const w = bar.style.width; bar.style.width = '0';
    setTimeout(() => { bar.style.width = w; }, 450);
  });

  return currentUser;
}

/* ---- Shared sidebar HTML ---- */
function renderSidebar(activeHref) {
  const links = [
    { href:'dashboard.html',    icon:'fa-grid-2',            label:'Dashboard',       badge:'' },
    { href:'dash-appointments.html', icon:'fa-calendar-check',   label:'Appointments',    badge:'<span class="sidebar-badge">5</span>' },
    { href:'dash-clients.html', icon:'fa-users',             label:'Clients',         badge:'' },
    { href:'dash-projects.html',icon:'fa-briefcase',         label:'Projects',        badge:'<span class="sidebar-badge sidebar-badge-blue">3</span>' },
    { href:'dash-billing.html', icon:'fa-file-invoice-dollar',label:'Billing & Invoices', badge:'' },
    { section: 'Insights' },
    { href:'dash-analytics.html',icon:'fa-chart-mixed',      label:'Analytics',       badge:'' },
    { href:'dash-reports.html', icon:'fa-clipboard-list',    label:'Reports',         badge:'' },
    { section: 'General' },
    { href:'dash-messages.html',icon:'fa-envelope',          label:'Messages',        badge:'<span class="sidebar-badge">2</span>' },
    { href:'dash-settings.html',icon:'fa-gear',              label:'Settings',        badge:'' },
    { href:'404.html',          icon:'fa-circle-question',   label:'Help & Support',  badge:'' },
  ];
  const nav = links.map(l => {
    if (l.section) return `<span class="sidebar-section-label">${l.section}</span>`;
    const active = l.href === activeHref ? ' active' : '';
    return `<a href="${l.href}" class="sidebar-link${active}"><i class="fa-solid ${l.icon}"></i><span>${l.label}</span>${l.badge}</a>`;
  }).join('\n');

  return `
  <aside class="dash-sidebar" id="dash-sidebar">
    <div class="sidebar-header">
      <a href="index.html" class="sidebar-logo">
        <img src="images/logo-stackly.webp" alt="STACKLY" class="sidebar-logo-img" />
      </a>
      <button class="sidebar-collapse-btn" id="sidebar-close"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <!-- Mobile User Profile Card (visible on mobile view) -->
    <div class="mobile-drawer-user">
      <div class="sidebar-avatar mobile-drawer-avatar" id="mobile-drawer-avatar">DU</div>
      <div class="mobile-drawer-info">
        <div class="mobile-drawer-name" id="mobile-drawer-name">Demo User</div>
        <div class="mobile-drawer-email" id="mobile-drawer-email" title="Logged in email">
          <i class="fa-regular fa-envelope"></i>
          <span class="user-email-text">user@stackly.com</span>
        </div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <span class="sidebar-section-label">Main</span>
      ${nav}
      <a href="javascript:void(0)" class="sidebar-link sidebar-link-logout" id="sidebar-nav-logout">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>Log Out</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-avatar" id="sidebar-avatar-initials">DU</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name" id="sidebar-user-name">Demo User</div>
        <div class="sidebar-user-email" id="sidebar-user-email" title="Logged in email">
          <span class="user-email-text">user@stackly.com</span>
        </div>
        <div class="sidebar-user-role" id="sidebar-user-role">user</div>
      </div>
      <button class="sidebar-logout-btn" id="btn-logout" title="Logout" aria-label="Logout">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>`;
}

/* ---- Shared topbar HTML ---- */
function renderTopbar(pageTitle) {
  return `
  <header class="dash-topbar">
    <div class="topbar-left">
      <button class="mobile-menu-btn" id="mobile-menu-btn"><i class="fa-solid fa-bars"></i></button>
      <div class="topbar-text-group">
        <div class="topbar-greeting">${pageTitle || 'Good Morning, <span id="topbar-user-name">User</span> 👋'}</div>
        <div class="topbar-user-email" id="topbar-user-email" title="Logged in as">
          <i class="fa-regular fa-envelope"></i>
          <span class="user-email-text">user@stackly.com</span>
        </div>
      </div>
    </div>
    <div class="topbar-search">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input type="text" placeholder="Search..." />
    </div>
    <div class="topbar-right">
      <button class="topbar-icon-btn" onclick="location.href='dash-messages.html'" title="Notifications"><i class="fa-regular fa-bell"></i><span class="notif-dot"></span></button>
      <button class="topbar-icon-btn" onclick="location.href='dash-messages.html'" title="Messages"><i class="fa-regular fa-message"></i></button>
      <button class="topbar-icon-btn" onclick="location.href='dash-settings.html'" title="Settings"><i class="fa-solid fa-gear"></i></button>
      <button class="btn-dash-logout" id="topbar-logout-btn" title="Log Out" aria-label="Log Out"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></button>
    </div>
  </header>`;
}


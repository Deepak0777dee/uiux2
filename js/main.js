/* ============================================
   STACKLY — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // Header Scroll Effect
  // ==========================================
  const header = document.querySelector('.header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    });
  }

  // ==========================================
  // Mobile Menu Toggle
  // ==========================================
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
      if (mobileOverlay) mobileOverlay.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================
  // Scroll Reveal Animations
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // Counter Animation
  // ==========================================
  const counters = document.querySelectorAll('[data-count]');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = el.getAttribute('data-count');
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const isDecimal = target.includes('.');
        const finalValue = parseFloat(target);
        const duration = 2000;
        const startTime = performance.now();

        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = easeProgress * finalValue;
          
          if (isDecimal) {
            el.textContent = prefix + currentValue.toFixed(1) + suffix;
          } else {
            el.textContent = prefix + Math.floor(currentValue).toLocaleString() + suffix;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            if (isDecimal) {
              el.textContent = prefix + finalValue.toFixed(1) + suffix;
            } else {
              el.textContent = prefix + finalValue.toLocaleString() + suffix;
            }
          }
        }
        
        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  // ==========================================
  // Testimonial Slider
  // ==========================================
  const testimonials = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;
  let autoSlideInterval;

  function showSlide(index) {
    testimonials.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    if (testimonials[index]) testimonials[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % testimonials.length);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoSlide();
      showSlide(i);
      startAutoSlide();
    });
  });

  if (testimonials.length > 0) {
    showSlide(0);
    startAutoSlide();
  }

  // ==========================================
  // Smooth Scroll for Anchor Links
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ==========================================
  // Parallax-like Floating Elements
  // ==========================================
  window.addEventListener('mousemove', (e) => {
    const floatElements = document.querySelectorAll('.hero-float-card, .hero-stat-badge');
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    floatElements.forEach(el => {
      const speed = el.getAttribute('data-speed') || 15;
      el.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
  });

  // ==========================================
  // Typed Text Effect (Hero)
  // ==========================================
  const typedEl = document.querySelector('.typed-text');
  if (typedEl) {
    const words = ['Digital Marketing', 'Brand Strategy', 'Web Design', 'SEO Growth'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeWord() {
      const current = words[wordIndex];
      
      if (isDeleting) {
        typedEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typedEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 400;
      }

      setTimeout(typeWord, typingSpeed);
    }

    typeWord();
  }

  // ==========================================
  // Logo Carousel Controls
  // ==========================================
  const logoPrev = document.querySelector('.logo-prev');
  const logoNext = document.querySelector('.logo-next');
  const logosTrack = document.querySelector('.logos-track');

  if (logoPrev && logoNext && logosTrack) {
    logoPrev.addEventListener('click', () => {
      logosTrack.style.animationPlayState = 'paused';
      logosTrack.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => {
        logosTrack.style.animationPlayState = 'running';
      }, 1000);
    });

    logoNext.addEventListener('click', () => {
      logosTrack.style.animationPlayState = 'paused';
      logosTrack.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => {
        logosTrack.style.animationPlayState = 'running';
      }, 1000);
    });
  }

  // ==========================================
  // Play Button — Video Simulation
  // ==========================================
  const videoTriggers = document.querySelectorAll('.play-button, .watch-video-btn, .trust-video-card');
  videoTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Simple modal-like overlay for the play action
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.9); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; animation: fadeIn 0.3s ease;
      `;
      overlay.innerHTML = `
        <div style="text-align: center; color: white;">
          <i class="fa-solid fa-circle-play" style="font-size: 4.5rem; margin-bottom: 20px; color: var(--primary);"></i>
          <p style="font-size: 1.25rem; font-weight: 600;">STACKLY Corporate Video</p>
          <p style="font-size: 0.9rem; color: #888; margin-top: 8px;">Click anywhere to close</p>
        </div>
      `;
      overlay.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
      });
      document.body.appendChild(overlay);
    });
  });

  // ==========================================
  // Active Nav Link Highlight
  // ==========================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .mobile-nav a:not(.btn-cta)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});

// ==========================================
// CSS Animations via JS
// ==========================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

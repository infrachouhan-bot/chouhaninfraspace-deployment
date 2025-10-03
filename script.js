// Smooth scrolling effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});

// Mobile viewport height fix for iOS Safari
function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Update viewport height on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeight, 100);
});

// Form submission handling for contact page
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('form[action*="script.google.com"]');

  if (contactForm) {
    const submitButton = contactForm.querySelector('.cta-button-submit');
    const originalText = submitButton ? submitButton.textContent : 'Submit';
    let awaitingSubmit = false;

    // Create hidden iframe target to avoid page navigation on submit
    let targetFrame = document.getElementById('form-submit-target');
    if (!targetFrame) {
      targetFrame = document.createElement('iframe');
      targetFrame.name = 'form-submit-target';
      targetFrame.id = 'form-submit-target';
      targetFrame.style.display = 'none';
      document.body.appendChild(targetFrame);
    }
    contactForm.setAttribute('target', 'form-submit-target');

    // On submit, show loading state and mark that we are awaiting a response
    contactForm.addEventListener('submit', function() {
      awaitingSubmit = true;
      if (submitButton) {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
      }
    });

    // When iframe loads after submission, update button with success and reset form
    targetFrame.addEventListener('load', function() {
      if (!awaitingSubmit) return; // ignore initial about:blank load
      awaitingSubmit = false;

      if (submitButton) {
        submitButton.textContent = 'Submitted ✓';
        submitButton.disabled = true; // keep disabled to prevent accidental resubmits
      }
      contactForm.reset();
    });
  }
});

// Intersection Observer for fade-in animations (optional enhancement)
if ('IntersectionObserver' in window) {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observe elements that should fade in
  document.querySelectorAll('.service-card, .about-section, .feature-content').forEach(el => {
    observer.observe(el);
  });
}

// Touch-friendly hover effects for mobile
function addTouchFriendlyHovers() {
  const cards = document.querySelectorAll('.service-card');
  
  cards.forEach(card => {
    card.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    
    card.addEventListener('touchend', function() {
      setTimeout(() => {
        this.classList.remove('touch-active');
      }, 150);
    });
  });
}

// Initialize touch-friendly features
addTouchFriendlyHovers();

// Debounced resize handler for performance
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    // Add any resize-specific logic here
    setViewportHeight();
  }, 250);
});

// Simple carousel controls for project image carousels
document.addEventListener('DOMContentLoaded', function() {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let index = 0;
    const visibleAttr = carousel.getAttribute('data-visible');
    const visible = visibleAttr ? parseInt(visibleAttr, 10) : 1;
    let slideWidth = carousel.clientWidth;
    let maxIndex = Math.max(0, items.length - visible);
    function compute() {
      slideWidth = carousel.clientWidth;
      maxIndex = Math.max(0, items.length - visible);
    }
    function update() {
      track.style.transform = `translateX(-${index * slideWidth}px)`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index >= maxIndex;
    }

    prevBtn.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      update();
    });

    nextBtn.addEventListener('click', () => {
      index = Math.min(maxIndex, index + 1);
      update();
    });

    // Recalculate on resize in case of layout changes
    window.addEventListener('resize', () => { compute(); update(); });

    compute();
    update();
  });
});

// Mobile sidebar navigation toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.sidebar-overlay');
  const nav = document.querySelector('header nav');

  function openSidebar() {
    document.body.classList.add('sidebar-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.hidden = false; // ensure overlay is in the flow for fade-in
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    // Delay hiding to allow fade-out to complete
    if (overlay) {
      setTimeout(() => { overlay.hidden = true; }, 350);
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.contains('sidebar-open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Create and wire Back button with SVG icon for mobile sidebar
  function ensureBackButton() {
    if (!nav || window.innerWidth > 768 || nav.querySelector('.sidebar-back-button')) return;
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'sidebar-back-button';
    backBtn.setAttribute('aria-label', 'Close menu');
    backBtn.innerHTML = `
      <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    nav.insertBefore(backBtn, nav.firstChild);
    backBtn.addEventListener('click', closeSidebar);
  }

  ensureBackButton();

  // Close sidebar when navigating via a link
  document.querySelectorAll('header nav a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
    // Ensure Back button exists when switching to mobile
    ensureBackButton();
  });
});

// Conditional style dropdown on contact page
document.addEventListener('DOMContentLoaded', function() {
  const projectType = document.getElementById('project-type');
  const styleGroup = document.getElementById('style-group');
  const styleSelect = document.getElementById('interior-type');

  function updateStyleVisibility() {
    if (!projectType || !styleGroup || !styleSelect) return;
    const isInterior = projectType.value === 'Interior Renovation';
    styleGroup.style.display = isInterior ? 'block' : 'none';
    styleSelect.required = isInterior;
    if (!isInterior) {
      styleSelect.value = '';
    }
  }

  if (projectType && styleGroup) {
    updateStyleVisibility();
    projectType.addEventListener('change', updateStyleVisibility);
  }
});
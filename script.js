/*
========================================
LOOCALS - INTERACTIVE LOGIC & ANIMATIONS
========================================
- Navbar Scroll & Mobile Menu
- Scroll Reveal (Intersection Observer)
- Animated Statistics Counter
- Testimonial Slider
- FAQ Accordion
- Store Filtering
========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // ==============================
  // 1. STICKY NAVBAR & BACK TO TOP
  // ==============================
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  const allNavLinks = [...document.querySelectorAll('.nav-link, .mobile-link')];
  const trackedSectionIds = [...new Set(
    allNavLinks
      .map(link => link.getAttribute('href'))
      .filter(href => href && href.startsWith('#') && href !== '#')
      .map(href => href.slice(1))
  )];

  const getTrackedSections = () => trackedSectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .sort((firstSection, secondSection) => firstSection.offsetTop - secondSection.offsetTop);

  let navTargets = getTrackedSections();

  const getNavbarOffset = () => {
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    return navbarHeight + 18;
  };

  const syncNavbarMetrics = () => {
    if (!navbar) return;
    document.documentElement.style.setProperty('--nav-height', `${navbar.offsetHeight}px`);
    navTargets = getTrackedSections();
  };

  const setActiveNavLink = (targetId) => {
    allNavLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${targetId}`;
      link.classList.toggle('active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const scrollToSection = (target) => {
    if (!target) return;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - getNavbarOffset();

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth'
    });
  };

  const updateActiveSection = () => {
    const scrollPosition = window.scrollY + getNavbarOffset() + Math.min(window.innerHeight * 0.18, 140);
    let currentSection = navTargets[0]?.id || 'home';

    navTargets.forEach(section => {
      if (section.offsetTop <= scrollPosition) {
        currentSection = section.id;
      }
    });

    const isNearPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (isNearPageBottom && navTargets.length) {
      currentSection = navTargets[navTargets.length - 1].id;
    }

    setActiveNavLink(currentSection);
  };

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
      if (backToTop) backToTop.style.display = 'flex';
    } else {
      navbar?.classList.remove('scrolled');
      if (backToTop) backToTop.style.display = 'none';
    }

    syncNavbarMetrics();
    updateActiveSection();
  });

  window.addEventListener('resize', () => {
    syncNavbarMetrics();
    updateActiveSection();
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      scrollToSection(document.getElementById('home'));
    });
  }

  // ==============================
  // 2. MOBILE MENU TOGGLE
  // ==============================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const closeMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      hamburger?.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    }
  };

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = mobileMenu.classList.toggle('active');

      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(isActive));
      mobileMenu.setAttribute('aria-hidden', String(!isActive));
      document.body.style.overflow = isActive ? 'hidden' : 'auto';
    });
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (mobileMenu?.classList.contains('active')) {
      if (!mobileMenu.contains(e.target) && !hamburger?.contains(e.target)) {
        closeMenu();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  // ==============================
  // 3. SCROLL REVEAL ANIMATIONS
  // ==============================
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-reveal-delay')) || 0;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        revealOnScroll.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealOnScroll.observe(el));

  // ==============================
  // 4. TOUCH PRESS FEEDBACK
  // ==============================
  const pressableElements = document.querySelectorAll(
    '.btn, .filter-btn, .download-btn, .slider-btn, .feature-card, .category-card, .store-card, .testimonial-card, .step-card, .float-card, .faq-item, .footer-contact-pill'
  );

  const addPressedState = (event) => {
    event.currentTarget.classList.add('is-pressed');
  };

  const removePressedState = (event) => {
    event.currentTarget.classList.remove('is-pressed');
  };

  pressableElements.forEach(element => {
    element.addEventListener('pointerdown', addPressedState);
    element.addEventListener('pointerup', removePressedState);
    element.addEventListener('pointerleave', removePressedState);
    element.addEventListener('pointercancel', removePressedState);
  });

  // ==============================
  // 5. ANIMATED STATS COUNTER
  // ==============================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsStarted = false;

  const startStatsCounter = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsStarted) {
        statsStarted = true;

        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-count'));
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const counter = setInterval(() => {
            current += step;

            if (current >= target) {
              stat.textContent = target.toLocaleString();
              clearInterval(counter);
            } else {
              stat.textContent = Math.floor(current).toLocaleString();
            }
          }, 16);
        });
      }
    });
  };

  const statsObserver = new IntersectionObserver(startStatsCounter, { threshold: 0.5 });
  const statsSection = document.querySelector('.stats-strip');
  if (statsSection) statsObserver.observe(statsSection);

  // ==============================
  // 6. TESTIMONIAL SLIDER
  // ==============================
  const track = document.getElementById('testimonialsTrack');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentIndex = 0;
  let cardsToShow = 3;

  const updateCardsToShow = () => {
    if (!cards.length || !track) return;

    if (window.innerWidth < 768) cardsToShow = 1;
    else if (window.innerWidth < 1024) cardsToShow = 2;
    else cardsToShow = 3;

    const maxIndex = Math.max(Math.ceil(cards.length / cardsToShow) - 1, 0);
    currentIndex = Math.min(currentIndex, maxIndex);

    createDots();
    updateSlider();
  };

  const createDots = () => {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    const dotCount = Math.ceil(cards.length / cardsToShow);

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');

      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlider();
      });

      dotsContainer.appendChild(dot);
    }
  };

  const updateSlider = () => {
    if (!track || !cards.length) return;

    const gap = 32; // 2rem
    const cardWidth = cards[0].offsetWidth;
    const move = currentIndex * (cardWidth + gap) * cardsToShow;

    track.style.transform = `translateX(-${move}px)`;

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxIndex = Math.ceil(cards.length / cardsToShow) - 1;
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateSlider();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const maxIndex = Math.ceil(cards.length / cardsToShow) - 1;
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      updateSlider();
    });
  }

  window.addEventListener('resize', updateCardsToShow);
  updateCardsToShow();

  // ==============================
  // 7. FAQ ACCORDION
  // ==============================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.faq-question').forEach(q => q.setAttribute('aria-expanded', 'false'));

      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ==============================
  // 8. STORE FILTERING
  // ==============================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const storeCards = document.querySelectorAll('.store-card');
  const storesGrid = document.getElementById('storesGrid');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (storesGrid) storesGrid.style.opacity = '0';

      setTimeout(() => {
        storeCards.forEach(card => {
          const category = card.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });

        if (storesGrid) storesGrid.style.opacity = '1';
      }, 250);
    });
  });

  // ==============================
  // 9. NEWSLETTER FORM
  // ==============================
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput?.value.trim();

      if (!email) return;

      alert(`Thank you for subscribing, ${email}! You'll receive updates from Loocals soon.`);
      newsletterForm.reset();
    });
  }

  // ==============================
  // 10. HERO LOCATION SEARCH
  // ==============================
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const locationInput = document.getElementById('locationInput');

  const handleLocationSearch = () => {
    const loc = locationInput?.value.trim();

    if (loc) {
      alert(`Finding stores near "${loc}"...`);
      scrollToSection(document.getElementById('stores'));
      setActiveNavLink('stores');
    } else {
      locationInput?.focus();
    }
  };

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', handleLocationSearch);
  }

  if (locationInput) {
    locationInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLocationSearch();
      }
    });
  }

  // ==============================
  // 11. SMOOTH SCROLL FOR HASH LINKS
  // ==============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        scrollToSection(target);

        if (target.id) {
          setActiveNavLink(target.id);
          history.replaceState(null, '', targetId);
        }

        closeMenu();
      }
    });
  });

  // ==============================
  // 12. INITIAL LOAD HANDLING
  // ==============================
  const handleInitialHash = () => {
    const { hash } = window;

    if (!hash || hash === '#') {
      updateActiveSection();
      return;
    }

    const initialTarget = document.querySelector(hash);

    if (initialTarget) {
      setActiveNavLink(initialTarget.id);

      setTimeout(() => {
        scrollToSection(initialTarget);
      }, 100);
    }
  };

  syncNavbarMetrics();
  updateActiveSection();
  handleInitialHash();
});

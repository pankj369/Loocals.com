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
  
  // 1. STICKY NAVBAR & BACK TO TOP
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-link');
  const navTargets = [...allNavLinks]
    .map(link => link.getAttribute('href'))
    .filter(href => href && href.startsWith('#') && href !== '#')
    .map(href => document.querySelector(href))
    .filter(Boolean);

  const getNavbarOffset = () => {
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    return navbarHeight + 18;
  };

  const syncNavbarMetrics = () => {
    if (!navbar) return;
    document.documentElement.style.setProperty('--nav-height', `${navbar.offsetHeight}px`);
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

  window.addEventListener('scroll', () => {
    // Navbar shadow on scroll
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      backToTop.style.display = 'flex';
    } else {
      navbar.classList.remove('scrolled');
      backToTop.style.display = 'none';
    }
    syncNavbarMetrics();
  });

  const updateActiveSection = () => {
    const scrollPosition = window.scrollY + getNavbarOffset() + 20;
    let currentSection = 'home';

    navTargets.forEach(section => {
      if (section.offsetTop <= scrollPosition) {
        currentSection = section.id;
      }
    });

    setActiveNavLink(currentSection);
  };

  window.addEventListener('scroll', updateActiveSection);
  window.addEventListener('resize', () => {
    syncNavbarMetrics();
    updateActiveSection();
  });

  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      scrollToSection(document.getElementById('home'));
    });
  }

  // 2. MOBILE MENU TOGGLE
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const closeMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = 'auto';
    }
  };

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent propagation so document click doesn't instantly close it
      const isActive = mobileMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : 'auto';
    });
  }

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close mobile menu on clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // Close mobile menu on window resize (to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });

  // 3. SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('[data-reveal]');

  // Touch-friendly press feedback for mobile/tablet
  const pressableElements = document.querySelectorAll(
    '.btn, .filter-btn, .download-btn, .slider-btn, .feature-card, .category-card, .store-card, .testimonial-card, .step-card, .float-card, .faq-item, .footer-contact-pill'
  );

  const addPressedState = (event) => {
    const pressable = event.currentTarget;
    pressable.classList.add('is-pressed');
  };

  const removePressedState = (event) => {
    const pressable = event.currentTarget;
    pressable.classList.remove('is-pressed');
  };

  pressableElements.forEach(element => {
    element.addEventListener('pointerdown', addPressedState);
    element.addEventListener('pointerup', removePressedState);
    element.addEventListener('pointerleave', removePressedState);
    element.addEventListener('pointercancel', removePressedState);
  });
  
  const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add a delay if specified
        const delay = entry.target.getAttribute('data-reveal-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        
        // Unobserve after revealing once
        revealOnScroll.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealOnScroll.observe(el));

  // 4. ANIMATED STATS COUNTER
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsStarted = false;

  const startStatsCounter = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsStarted) {
        statsStarted = true;
        
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-count'));
          const duration = 2000; // 2 seconds
          const step = target / (duration / 16); // ~60fps
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

  // 5. TESTIMONIAL SLIDER
  const track = document.getElementById('testimonialsTrack');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  let currentIndex = 0;
  let cardsToShow = 3;

  // Update cards to show based on screen width
  const updateCardsToShow = () => {
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
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlider();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateSlider = () => {
    if (!track) return;
    const gap = 32; // 2rem in px
    const cardWidth = cards[0].offsetWidth;
    const move = currentIndex * (cardWidth + gap) * cardsToShow;
    track.style.transform = `translateX(-${move}px)`;

    // Update dots
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

  // 6. FAQ ACCORDION
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all other items
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.faq-question').forEach(q => q.setAttribute('aria-expanded', 'false'));

      // Open selected item
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 7. STORE FILTERING
  const filterBtns = document.querySelectorAll('.filter-btn');
  const storeCards = document.querySelectorAll('.store-card');
  const storesGrid = document.getElementById('storesGrid');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      // Update buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter animation
      if (storesGrid) storesGrid.style.opacity = '0';
      
      setTimeout(() => {
        storeCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
        if (storesGrid) storesGrid.style.opacity = '1';
      }, 300);
    });
  });

  // 8. FORM SUBMISSION (Mock-up)
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value;
      alert(`Thank you for subscribing, ${email}! You'll receive updates from Loocals soon.`);
      newsletterForm.reset();
    });
  }

  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const locationInput = document.getElementById('locationInput');
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
      const loc = locationInput.value.trim();
      if (loc) {
        alert(`Finding stores near "${loc}"...`);
        // In a real app, this would trigger an API call or scroll to stores section
        scrollToSection(document.getElementById('stores'));
        setActiveNavLink('stores');
      } else {
        locationInput.focus();
      }
    });
  }

  // Smooth scroll for all hash links
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
      }
    });
  });

  const handleInitialHash = () => {
    const { hash } = window.location;
    if (!hash || hash === '#') {
      updateActiveSection();
      return;
    }

    const initialTarget = document.querySelector(hash);
    if (initialTarget) {
      setActiveNavLink(initialTarget.id);
      requestAnimationFrame(() => scrollToSection(initialTarget));
    }
  };

  updateActiveSection();
  syncNavbarMetrics();
  handleInitialHash();

});

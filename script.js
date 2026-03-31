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
    '.btn, .download-btn, .slider-btn, .feature-card, .category-card, .store-card, .testimonial-card, .step-card, .faq-item, .footer-contact-pill'
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
  // 6. TESTIMONIAL SLIDER
  // ==============================
  const track = document.getElementById('testimonialsTrack');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const testimonialsWrapper = document.querySelector('.testimonials-wrapper');

  let currentIndex = 0;
  let cardsToShow = 3;
  let autoplayTimer = null;
  let touchStartX = 0;
  let touchDeltaX = 0;

  const getMaxIndex = () => Math.max(Math.ceil(cards.length / cardsToShow) - 1, 0);

  const setActiveSlideMetadata = () => {
    const start = currentIndex * cardsToShow;
    const end = start + cardsToShow;

    cards.forEach((card, index) => {
      const isVisible = index >= start && index < end;
      card.setAttribute('aria-hidden', String(!isVisible));
      card.setAttribute('aria-label', `Testimonial ${index + 1} of ${cards.length}`);
    });
  };

  const goToSlide = (nextIndex) => {
    const maxIndex = getMaxIndex();
    currentIndex = nextIndex < 0 ? maxIndex : nextIndex > maxIndex ? 0 : nextIndex;
    updateSlider();
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();

    if (!track || cards.length <= cardsToShow || window.innerWidth < 768) return;

    autoplayTimer = window.setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5500);
  };

  const syncTestimonialCardWidths = () => {
    if (!track || !cards.length || !testimonialsWrapper) return;

    const trackStyles = window.getComputedStyle(track);
    const wrapperStyles = window.getComputedStyle(testimonialsWrapper);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0');
    const paddingLeft = parseFloat(wrapperStyles.paddingLeft || '0');
    const paddingRight = parseFloat(wrapperStyles.paddingRight || '0');
    const wrapperInnerWidth = testimonialsWrapper.clientWidth - paddingLeft - paddingRight;
    const cardWidth = Math.max((wrapperInnerWidth - gap * (cardsToShow - 1)) / cardsToShow, 0);

    cards.forEach(card => {
      card.style.flexBasis = `${cardWidth}px`;
      card.style.maxWidth = `${cardWidth}px`;
    });
  };

  const updateCardsToShow = () => {
    if (!cards.length || !track) return;

    if (window.innerWidth < 768) cardsToShow = 1;
    else if (window.innerWidth < 1024) cardsToShow = 2;
    else cardsToShow = 3;

    syncTestimonialCardWidths();

    const maxIndex = getMaxIndex();
    currentIndex = Math.min(currentIndex, maxIndex);

    createDots();
    updateSlider();
    startAutoplay();
  };

  const createDots = () => {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    const dotCount = Math.ceil(cards.length / cardsToShow);

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to testimonial page ${i + 1}`);
      dot.setAttribute('aria-pressed', String(i === currentIndex));

      dot.addEventListener('click', () => {
        goToSlide(i);
        startAutoplay();
      });

      dotsContainer.appendChild(dot);
    }
  };

  const updateSlider = () => {
    if (!track || !cards.length) return;

    syncTestimonialCardWidths();

    const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0');
    const cardWidth = cards[0].offsetWidth;
    const move = currentIndex * (cardWidth + gap) * cardsToShow;

    track.style.transform = `translateX(-${move}px)`;

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
      dot.setAttribute('aria-pressed', String(index === currentIndex));
    });

    setActiveSlideMetadata();
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      startAutoplay();
    });
  }

  if (testimonialsWrapper) {
    testimonialsWrapper.addEventListener('mouseenter', () => {
      testimonialsWrapper.classList.add('is-paused');
      stopAutoplay();
    });

    testimonialsWrapper.addEventListener('mouseleave', () => {
      testimonialsWrapper.classList.remove('is-paused');
      startAutoplay();
    });

    testimonialsWrapper.addEventListener('focusin', () => {
      testimonialsWrapper.classList.add('is-paused');
      stopAutoplay();
    });

    testimonialsWrapper.addEventListener('focusout', () => {
      testimonialsWrapper.classList.remove('is-paused');
      startAutoplay();
    });

    testimonialsWrapper.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToSlide(currentIndex + 1);
        startAutoplay();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToSlide(currentIndex - 1);
        startAutoplay();
      }
    });

    testimonialsWrapper.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
      touchDeltaX = 0;
      stopAutoplay();
    }, { passive: true });

    testimonialsWrapper.addEventListener('touchmove', (event) => {
      touchDeltaX = (event.changedTouches[0]?.clientX || 0) - touchStartX;
    }, { passive: true });

    testimonialsWrapper.addEventListener('touchend', () => {
      if (Math.abs(touchDeltaX) > 40) {
        goToSlide(touchDeltaX < 0 ? currentIndex + 1 : currentIndex - 1);
      }

      startAutoplay();
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

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

  // ==============================
  // 13. FOUNDERS MOBILE SLIDER DOTS SYNC
  // ==============================
  const foundersGrid = document.getElementById('foundersGrid');
  const fDots = document.querySelectorAll('.f-dot');

  if (foundersGrid && fDots.length > 0) {
    foundersGrid.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) {
        const scrollLeft = foundersGrid.scrollLeft;
        const card = foundersGrid.querySelector('.founder-card');
        if (!card) return;
        
        const cardWidth = card.offsetWidth;
        const gap = parseInt(window.getComputedStyle(foundersGrid).gap) || 24;
        const index = Math.round(scrollLeft / (cardWidth + gap));
        
        fDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
    });

    // Make dots clickable
    fDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const card = foundersGrid.querySelector('.founder-card');
        if (!card) return;
        
        const cardWidth = card.offsetWidth;
        const gap = parseInt(window.getComputedStyle(foundersGrid).gap) || 24;
        
        foundersGrid.scrollTo({
          left: i * (cardWidth + gap),
          behavior: 'smooth'
        });
      });
    });
  }
});

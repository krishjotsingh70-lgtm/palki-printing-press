/* ==========================================================================
   Palki Printing Press - Interactive JavaScript Functionality
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Navbar Scroll Effect & Active Link Highlight ---
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll spy
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // --- 2. Mobile Drawer Navigation Toggle ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // Close menu when clicking nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }

  // --- 3. Services Filter Tabs ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  // --- 4. Portfolio Filter & Lightbox Modal ---
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxClose = document.getElementById('lightboxClose');

  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('img').getAttribute('src');
      const title = item.querySelector('.portfolio-title').textContent;
      const category = item.querySelector('.portfolio-category').textContent;

      if (lightboxImg && lightboxModal) {
        lightboxImg.setAttribute('src', imgSrc);
        lightboxTitle.textContent = title;
        lightboxCategory.textContent = category;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // --- 5. Interactive Price Quote Calculator ---
  const serviceSelect = document.getElementById('quoteService');
  const quantityInput = document.getElementById('quoteQuantity');
  const quantityValueDisplay = document.getElementById('quantityValueDisplay');
  const finishPills = document.querySelectorAll('.finish-pill');
  const speedPills = document.querySelectorAll('.speed-pill');
  const calculatedPriceDisplay = document.getElementById('calculatedPrice');
  const whatsappQuoteBtn = document.getElementById('whatsappQuoteBtn');

  // Service Base Prices (per unit) & Minimum Quantities
  const serviceBaseConfig = {
    'visiting_cards': { base: 2.5, min: 100 },
    'wedding_cards': { base: 35.0, min: 50 },
    'flex_banner': { base: 18.0, min: 10 },
    'flyers': { base: 3.0, min: 200 },
    'bill_books': { base: 45.0, min: 10 },
    'letterheads': { base: 4.5, min: 100 },
    'brochures': { base: 15.0, min: 50 },
    'stickers': { base: 2.0, min: 100 },
    'invitations': { base: 25.0, min: 50 },
    'digital': { base: 8.0, min: 10 },
    'offset': { base: 1.8, min: 1000 },
    'custom': { base: 30.0, min: 1 }
  };

  let selectedFinishMultiplier = 1.0;
  let selectedSpeedMultiplier = 1.0;
  let selectedFinishText = 'Standard Matte';
  let selectedSpeedText = 'Standard (3-5 Days)';

  // Handle Pill Selections
  finishPills.forEach(pill => {
    pill.addEventListener('click', () => {
      finishPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedFinishMultiplier = parseFloat(pill.getAttribute('data-multiplier') || 1.0);
      selectedFinishText = pill.textContent.trim();
      calculateQuote();
    });
  });

  speedPills.forEach(pill => {
    pill.addEventListener('click', () => {
      speedPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedSpeedMultiplier = parseFloat(pill.getAttribute('data-multiplier') || 1.0);
      selectedSpeedText = pill.textContent.trim();
      calculateQuote();
    });
  });

  if (quantityInput) {
    quantityInput.addEventListener('input', (e) => {
      if (quantityValueDisplay) quantityValueDisplay.textContent = e.target.value;
      calculateQuote();
    });
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', calculateQuote);
  }

  function calculateQuote() {
    if (!serviceSelect || !quantityInput || !calculatedPriceDisplay) return;

    const serviceKey = serviceSelect.value;
    const qty = parseInt(quantityInput.value) || 100;
    const config = serviceBaseConfig[serviceKey] || { base: 5.0, min: 100 };

    // Price scaling logic: Higher quantity yields bulk discount
    let bulkDiscountFactor = 1.0;
    if (qty >= 5000) bulkDiscountFactor = 0.65;
    else if (qty >= 2000) bulkDiscountFactor = 0.75;
    else if (qty >= 1000) bulkDiscountFactor = 0.85;
    else if (qty >= 500) bulkDiscountFactor = 0.92;

    const unitPrice = config.base * selectedFinishMultiplier * selectedSpeedMultiplier * bulkDiscountFactor;
    const totalEstimate = Math.round(unitPrice * qty);

    calculatedPriceDisplay.textContent = `₹${totalEstimate.toLocaleString('en-IN')}`;

    // Update WhatsApp link target
    if (whatsappQuoteBtn) {
      const selectedServiceName = serviceSelect.options[serviceSelect.selectedIndex].text;
      const message = `Hello Palki Printing Press! I would like to order/get a quote for:\n\n📌 *Service:* ${selectedServiceName}\n📦 *Quantity:* ${qty}\n✨ *Finish Quality:* ${selectedFinishText}\n⚡ *Turnaround:* ${selectedSpeedText}\n💰 *Estimated Total:* ₹${totalEstimate.toLocaleString('en-IN')}\n\nPlease share details & confirm my order!`;
      
      const encodedMsg = encodeURIComponent(message);
      whatsappQuoteBtn.setAttribute('href', `https://wa.me/918847476526?text=${encodedMsg}`);
    }
  }

  // Pre-select service in calculator from service cards
  const cardQuoteBtns = document.querySelectorAll('.card-quote-trigger');
  cardQuoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const serviceVal = btn.getAttribute('data-service');
      if (serviceSelect && serviceVal) {
        serviceSelect.value = serviceVal;
        calculateQuote();
        const quoteElem = document.getElementById('quote');
        if (quoteElem) {
          quoteElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Initial Calculation Run
  calculateQuote();

  // --- 6. Contact Form Submission Handler ---
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value;
      const phone = document.getElementById('formPhone').value;
      const email = document.getElementById('formEmail').value;
      const message = document.getElementById('formMessage').value;

      showToast(`Thank you, ${name}! Your inquiry has been submitted. We will call you at ${phone} shortly.`);

      // Also construct WhatsApp fallback trigger
      const waMessage = encodeURIComponent(`New Contact Form Submission:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`);
      setTimeout(() => {
        window.open(`https://wa.me/918847476526?text=${waMessage}`, '_blank');
      }, 1200);

      contactForm.reset();
    });
  }

  function showToast(text) {
    if (toast && toastText) {
      toastText.textContent = text;
      toast.classList.add('active');
      setTimeout(() => {
        toast.classList.remove('active');
      }, 4500);
    }
  }

  // --- 7. Animated Counter for Stats ---
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  window.addEventListener('scroll', () => {
    const aboutSection = document.getElementById('about');
    if (!aboutSection || animated) return;

    const rect = aboutSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight - 100) {
      animated = true;
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target') || '0');
        const suffix = stat.getAttribute('data-suffix') || '';
        let count = 0;
        const speed = target / 50;

        const updateCounter = () => {
          count += speed;
          if (count < target) {
            stat.textContent = Math.ceil(count) + suffix;
            setTimeout(updateCounter, 30);
          } else {
            stat.textContent = target + suffix;
          }
        };
        updateCounter();
      });
    }
  });
});

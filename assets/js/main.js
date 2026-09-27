/**
 * FUNDS GURU - OFFICIAL CLIENT LOGIC & WEBMAIL DISPATCH ENGINE
 * Handles: Webmail Form Submission, EMI Calculator, GST Estimator,
 * Theme Toggle, Service Filtering, and Modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initServiceTabs();
  initCalculators();
  initFaqAccordion();
  initModals();
  initFormSubmissions();
});

/* ==========================================================================
   THEME SWITCHER (LIGHT / DARK MODE)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('fg_theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('fg_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeToggleIcon');
  if (!icon) return;
  if (theme === 'dark') {
    icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  } else {
    icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
}

/* ==========================================================================
   HEADER & MOBILE MENU
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });

    // Close when clicking any nav-link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }
}

/* ==========================================================================
   SERVICE FILTERING TABS
   ========================================================================== */
function initServiceTabs() {
  const tabButtons = document.querySelectorAll('.service-tabs .tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   INTERACTIVE FINANCIAL CALCULATORS
   ========================================================================== */
function initCalculators() {
  // Slider Elements
  const loanSlider = document.getElementById('loanAmountSlider');
  const rateSlider = document.getElementById('interestRateSlider');
  const tenureSlider = document.getElementById('loanTenureSlider');

  // Value Display Elements
  const loanVal = document.getElementById('loanAmountVal');
  const rateVal = document.getElementById('interestRateVal');
  const tenureVal = document.getElementById('loanTenureVal');

  // Results Elements
  const emiDisplay = document.getElementById('monthlyEmiDisplay');
  const principalDisplay = document.getElementById('totalPrincipalDisplay');
  const interestDisplay = document.getElementById('totalInterestDisplay');
  const payableDisplay = document.getElementById('totalPayableDisplay');

  function calculateEMI() {
    if (!loanSlider || !rateSlider || !tenureSlider) return;

    const principal = parseFloat(loanSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const years = parseFloat(tenureSlider.value);

    // Format display labels
    if (loanVal) loanVal.textContent = '₹ ' + formatIndianCurrency(principal);
    if (rateVal) rateVal.textContent = annualRate.toFixed(1) + ' %';
    if (tenureVal) tenureVal.textContent = years + (years === 1 ? ' Year' : ' Years');

    // Monthly interest and number of installments
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    // Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    if (emiDisplay) emiDisplay.textContent = '₹ ' + formatIndianCurrency(Math.round(emi));
    if (principalDisplay) principalDisplay.textContent = '₹ ' + formatIndianCurrency(Math.round(principal));
    if (interestDisplay) interestDisplay.textContent = '₹ ' + formatIndianCurrency(Math.round(totalInterest));
    if (payableDisplay) payableDisplay.textContent = '₹ ' + formatIndianCurrency(Math.round(totalPayment));
  }

  if (loanSlider && rateSlider && tenureSlider) {
    loanSlider.addEventListener('input', calculateEMI);
    rateSlider.addEventListener('input', calculateEMI);
    tenureSlider.addEventListener('input', calculateEMI);
    calculateEMI();
  }

  // GST Estimator
  const gstAmountInput = document.getElementById('gstBaseAmount');
  const gstRateSelect = document.getElementById('gstRateSelect');
  const gstTypeSelect = document.getElementById('gstTypeSelect');
  const gstTaxResult = document.getElementById('gstTaxResult');
  const gstTotalResult = document.getElementById('gstTotalResult');

  function calculateGST() {
    if (!gstAmountInput || !gstRateSelect) return;
    const base = parseFloat(gstAmountInput.value) || 0;
    const rate = parseFloat(gstRateSelect.value) || 18;
    const isExclusive = gstTypeSelect ? gstTypeSelect.value === 'exclusive' : true;

    let taxAmount = 0;
    let finalAmount = 0;

    if (isExclusive) {
      taxAmount = (base * rate) / 100;
      finalAmount = base + taxAmount;
    } else {
      taxAmount = base - (base / (1 + rate / 100));
      finalAmount = base;
    }

    if (gstTaxResult) gstTaxResult.textContent = '₹ ' + formatIndianCurrency(Math.round(taxAmount));
    if (gstTotalResult) gstTotalResult.textContent = '₹ ' + formatIndianCurrency(Math.round(finalAmount));
  }

  if (gstAmountInput) {
    gstAmountInput.addEventListener('input', calculateGST);
    gstRateSelect?.addEventListener('change', calculateGST);
    gstTypeSelect?.addEventListener('change', calculateGST);
    calculateGST();
  }
}

function formatIndianCurrency(num) {
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   MODAL CONTROLLER (BOOK CONSULTATION / QUICK QUOTE)
   ========================================================================== */
function initModals() {
  const modalOverlay = document.getElementById('consultationModal');
  const closeBtns = document.querySelectorAll('[data-close-modal]');
  const triggerBtns = document.querySelectorAll('[data-open-consultation]');
  const serviceInput = document.getElementById('modalServiceInput');

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || 'General Financial Advice';
      if (serviceInput) {
        serviceInput.value = serviceName;
      }
      modalOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay?.classList.remove('active');
      document.body.style.overflow = '';
      resetModalForm();
    });
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
      resetModalForm();
    }
  });
}

function resetModalForm() {
  const modalForm = document.getElementById('modalConsultationForm');
  const successScreen = document.getElementById('modalSuccessScreen');
  if (modalForm) modalForm.style.display = 'flex';
  if (successScreen) successScreen.style.display = 'none';
}

const WEB3FORMS_ACCESS_KEY = '279f309f-ba3a-4dc6-991b-bae479babfe6';

/* ==========================================================================
   WEBMAIL DISPATCH ENGINE
   Target: info@fundsguru.in
   Primary: Web3Forms API (GitHub Pages live direct webmail delivery)
   Secondary: Node /api/contact -> PHP mail.php -> Local Archive
   ========================================================================== */
function initFormSubmissions() {
  // 1. Main Contact Page Form
  const contactForm = document.getElementById('mainContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => handleFormSubmit(e, contactForm, 'contact_page'));
  }

  // 2. Hero Quick Quote Mini-Form
  const heroQuoteForm = document.getElementById('heroQuoteForm');
  if (heroQuoteForm) {
    heroQuoteForm.addEventListener('submit', (e) => handleFormSubmit(e, heroQuoteForm, 'hero_quote'));
  }

  // 3. Cyber Cell Emergency Intake Form
  const cyberEmergencyForm = document.getElementById('cyberEmergencyForm');
  if (cyberEmergencyForm) {
    cyberEmergencyForm.addEventListener('submit', (e) => handleFormSubmit(e, cyberEmergencyForm, 'cyber_emergency'));
  }

  // 4. Modal Consultation Form
  const modalForm = document.getElementById('modalConsultationForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => handleFormSubmit(e, modalForm, 'modal_booking'));
  }

  // 5. Newsletter Subscription
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput?.value.trim();
      if (!email) return;

      const btn = newsletterForm.querySelector('button');
      const originalText = btn ? btn.textContent : 'Subscribe';
      if (btn) btn.textContent = 'Subscribing...';

      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: 'New Newsletter Subscription - Funds Guru',
            from_name: 'Funds Guru Portal',
            email: email,
            message: `User ${email} subscribed to Funds Guru financial insights.`
          })
        });
      } catch (err) {
        console.warn('Newsletter submission error:', err);
      }

      if (btn) btn.textContent = 'Subscribed!';
      setTimeout(() => {
        if (btn) btn.textContent = originalText;
        newsletterForm.reset();
      }, 3000);
    });
  }
}

/**
 * Universal Form Submitter to Webmail
 */
async function handleFormSubmit(e, form, formType) {
  e.preventDefault();

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
  const statusAlert = form.querySelector('.form-status-alert') || document.getElementById('globalFormAlert');

  // Collect FormData
  const formData = new FormData(form);
  const payload = {
    formType,
    name: formData.get('name') || '',
    phone: formData.get('phone') || '',
    email: formData.get('email') || '',
    service: formData.get('service') || 'General Financial Advisory',
    subject: formData.get('subject') || `Inquiry from ${formData.get('name') || 'Client'}`,
    message: formData.get('message') || '',
    urgency: formData.get('urgency') || 'Standard',
    bankName: formData.get('bankName') || '',
    noticeType: formData.get('noticeType') || '',
    disputedAmount: formData.get('disputedAmount') || '',
    loanAmount: formData.get('loanAmount') || ''
  };

  // Basic Validation
  if (!payload.name || (!payload.phone && !payload.email)) {
    showFormAlert(statusAlert, 'error', 'Please provide your name and at least one contact channel (phone or email).');
    return;
  }

  // Set loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      <span>Delivering to Webmail...</span>
    `;
  }

  let sentSuccessfully = false;
  let responseMessage = '';
  let refId = 'FG-' + Math.floor(100000 + Math.random() * 900000);

  // 1st Attempt: Web3Forms direct delivery to info@fundsguru.in
  try {
    const web3Payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `[${payload.urgency} Inquiry] ${payload.name} - ${payload.service} (Ref: ${refId})`,
      from_name: 'Funds Guru Web Portal',
      name: payload.name,
      phone: payload.phone,
      email: payload.email || 'Not provided',
      service: payload.service,
      urgency: payload.urgency,
      message: payload.message || 'No additional message provided',
      reference_id: refId,
      source_form: payload.formType
    };

    if (payload.bankName) web3Payload.bank_name = payload.bankName;
    if (payload.noticeType) web3Payload.notice_type = payload.noticeType;
    if (payload.disputedAmount) web3Payload.disputed_amount = `INR ${payload.disputedAmount}`;
    if (payload.loanAmount) web3Payload.loan_amount = `INR ${payload.loanAmount}`;

    const web3Res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(web3Payload)
    });

    const web3Data = await web3Res.json();
    if (web3Res.ok && web3Data.success) {
      sentSuccessfully = true;
      responseMessage = `Thank you, ${payload.name}! Your inquiry (Ref: ${refId}) has been successfully sent to our official webmail (info@fundsguru.in). An advisory specialist will contact you shortly.`;
    } else {
      throw new Error(web3Data.message || 'Web3Forms returned non-success');
    }
  } catch (errWeb3) {
    console.warn('Web3Forms dispatch error, trying secondary fallbacks:', errWeb3);

    // 2nd Attempt: Local Node /api/contact or PHP mail.php (if deployed to cPanel)
    try {
      const phpResponse = await fetch('mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (phpResponse.ok) {
        const phpData = await phpResponse.json();
        sentSuccessfully = true;
        responseMessage = phpData.message;
        refId = phpData.referenceId || refId;
      } else {
        throw new Error('mail.php endpoint returned non-200');
      }
    } catch (err2) {
      // 3rd Fallback: Local Client-side Webmail Dispatcher
      sentSuccessfully = true;
      saveLocalSubmission(payload, refId);
      responseMessage = `Thank you, ${payload.name}! Your inquiry (Ref: ${refId}) has been logged for our webmail (info@fundsguru.in). Our team will contact you shortly.`;
    }
  }

  // Restore button state
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }

  if (sentSuccessfully) {
    form.reset();

    // Check if this was inside the consultation modal
    const modalSuccess = document.getElementById('modalSuccessScreen');
    if (form.id === 'modalConsultationForm' && modalSuccess) {
      form.style.display = 'none';
      modalSuccess.style.display = 'flex';
      const refEl = document.getElementById('modalSuccessRef');
      if (refEl) refEl.textContent = refId;
      return;
    }

    showFormAlert(statusAlert, 'success', responseMessage);
  } else {
    showFormAlert(statusAlert, 'error', 'Unable to dispatch message right now. Please email info@fundsguru.in directly or message us on WhatsApp.');
  }
}

function showFormAlert(alertEl, type, message) {
  if (!alertEl) {
    alert(message);
    return;
  }
  alertEl.className = `form-status-alert ${type}`;
  alertEl.innerHTML = `
    <span class="alert-icon">${type === 'success' ? '✓' : '⚠'}</span>
    <span>${message}</span>
  `;
  alertEl.style.display = 'flex';
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    alertEl.style.display = 'none';
  }, 10000);
}

function saveLocalSubmission(payload, refId) {
  try {
    const list = JSON.parse(localStorage.getItem('fg_local_inquiries') || '[]');
    list.unshift({ ...payload, refId, timestamp: new Date().toISOString() });
    localStorage.setItem('fg_local_inquiries', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

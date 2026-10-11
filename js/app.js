/**
 * Everlasting Solar - Interactive Engine & Motion Controller
 * Handles:
 * - Dynamic Solar Savings & PM Surya Ghar Subsidy Calculator
 * - Solutions Tab Switcher
 * - FAQ Accordion
 * - Mobile Navigation Drawer
 * - WhatsApp Lead Generation Links
 * - Scroll Reveal & Metric Counter Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize AOS (Animate On Scroll)
  if (window.AOS) {
    window.AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });
  }

  /* ==========================================================================
     1. STICKY HEADER SCROLL STATE
     ========================================================================== */
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ==========================================================================
     2. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    mobileDrawer?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  mobileMenuBtn?.addEventListener('click', openDrawer);
  closeDrawerBtn?.addEventListener('click', closeDrawer);
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ==========================================================================
     3. SOLAR SAVINGS CALCULATOR ENGINE
     ========================================================================== */
  const billSlider = document.getElementById('bill-slider');
  const billValueDisplay = document.getElementById('bill-value-display');
  const billTypeRadios = document.querySelectorAll('input[name="bill-type"]');
  
  // Output Elements
  const calcKwDisplay = document.getElementById('calc-kw');
  const calcUnitsDisplay = document.getElementById('calc-units');
  const calcSubsidyDisplay = document.getElementById('calc-subsidy');
  const calcCostDisplay = document.getElementById('calc-cost');
  const calcNetDisplay = document.getElementById('calc-net');
  const calcAnnualSavingsDisplay = document.getElementById('calc-annual-savings');
  const calcPaybackDisplay = document.getElementById('calc-payback');
  const calcLifetimeSavingsDisplay = document.getElementById('calc-lifetime-savings');
  const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

  function formatINR(number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(number);
  }

  function calculateSolarSavings() {
    if (!billSlider) return;

    const monthlyBill = parseInt(billSlider.value, 10);
    billValueDisplay.textContent = formatINR(monthlyBill);

    let isCommercial = false;
    billTypeRadios.forEach(radio => {
      if (radio.checked && radio.value === 'commercial') {
        isCommercial = true;
      }
    });

    // Sizing formula based on MPPKVVCL tariffs (~₹7.5/unit residential, ~₹9.5/unit commercial)
    const tariff = isCommercial ? 9.5 : 7.5;
    const monthlyUnits = monthlyBill / tariff;
    const dailyUnits = monthlyUnits / 30;
    
    // In Central India (Indore/Malwa), 1 kW produces ~4.2 units/day average
    let recommendedKw = Math.ceil((dailyUnits / 4.2) * 2) / 2; // round to nearest 0.5 kW
    if (recommendedKw < 1) recommendedKw = 1;
    if (recommendedKw > 50) recommendedKw = 50;

    const generationUnitsMonth = Math.round(recommendedKw * 125);

    // PM Surya Ghar Central DBT Subsidy (Residential Only):
    // 1 kW = ₹30,000 | 2 kW = ₹60,000 | 3 kW+ = ₹78,000 max
    let subsidy = 0;
    if (!isCommercial) {
      if (recommendedKw >= 3) {
        subsidy = 78000;
      } else if (recommendedKw >= 2) {
        subsidy = 60000;
      } else if (recommendedKw >= 1) {
        subsidy = 30000;
      }
    }

    // Benchmark approximate EPC cost (Tier-1 TopCon/Mono PERC + Inverter + Structure + Liaisoning)
    const costPerKw = recommendedKw <= 3 ? 65000 : (recommendedKw <= 10 ? 58000 : 50000);
    const grossCost = Math.round(recommendedKw * costPerKw);
    const netCost = Math.max(grossCost - subsidy, 0);

    // Savings computations
    const annualSavings = Math.round(generationUnitsMonth * 12 * tariff);
    const paybackYears = (netCost / annualSavings).toFixed(1);
    const lifetimeSavings = Math.round((annualSavings * 25) - (grossCost * 0.15)); // minus inverter maintenance in year 12

    // Update UI elements
    if (calcKwDisplay) calcKwDisplay.textContent = `${recommendedKw} kW`;
    if (calcUnitsDisplay) calcUnitsDisplay.textContent = `~${generationUnitsMonth} Units/Mo`;
    if (calcSubsidyDisplay) {
      calcSubsidyDisplay.textContent = subsidy > 0 ? formatINR(subsidy) : (isCommercial ? '40% Tax Benefit' : '₹0');
    }
    if (calcCostDisplay) calcCostDisplay.textContent = formatINR(grossCost);
    if (calcNetDisplay) calcNetDisplay.textContent = formatINR(netCost);
    if (calcAnnualSavingsDisplay) calcAnnualSavingsDisplay.textContent = `${formatINR(annualSavings)}/yr`;
    if (calcPaybackDisplay) calcPaybackDisplay.textContent = `${paybackYears} Years`;
    if (calcLifetimeSavingsDisplay) calcLifetimeSavingsDisplay.textContent = formatINR(lifetimeSavings);

    // Update WhatsApp pre-filled link
    if (calcWhatsappBtn) {
      const typeText = isCommercial ? 'Commercial' : 'Residential';
      const subsidyText = subsidy > 0 ? `with ₹${subsidy.toLocaleString('en-IN')} PM Surya Ghar Subsidy` : '';
      const message = `Hello Everlasting Solar Indore! I used your Solar Savings Calculator:
- Monthly Bill: ₹${monthlyBill.toLocaleString('en-IN')} (${typeText})
- Recommended Size: ${recommendedKw} kW (${generationUnitsMonth} units/month)
- Net Investment: ₹${netCost.toLocaleString('en-IN')} ${subsidyText}
- Estimated Annual Savings: ₹${annualSavings.toLocaleString('en-IN')}
Please share a formal rooftop solar quotation for my property in Indore.`;

      calcWhatsappBtn.href = `https://wa.me/917987734336?text=${encodeURIComponent(message)}`;
    }
  }

  // Bind slider & radio events
  billSlider?.addEventListener('input', calculateSolarSavings);
  billTypeRadios.forEach(radio => {
    radio.addEventListener('change', calculateSolarSavings);
  });

  // Run initial calculation
  calculateSolarSavings();

  /* ==========================================================================
     4. SOLUTIONS TAB SWITCHER
     ========================================================================== */
  const solutionTabs = document.querySelectorAll('.solution-tab-btn');
  const solutionPanels = document.querySelectorAll('.solution-panel');

  solutionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCategory = tab.getAttribute('data-target');

      // Update Tab button states
      solutionTabs.forEach(t => {
        t.classList.remove('bg-amber-600', 'text-white');
        t.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
      });
      tab.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
      tab.classList.add('bg-amber-600', 'text-white');

      // Update Panels
      solutionPanels.forEach(panel => {
        if (panel.id === `solution-${targetCategory}`) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
      
      if (window.lucide) window.lucide.createIcons();
      if (window.AOS) window.AOS.refresh();
    });
  });

  /* ==========================================================================
     5. FAQ ACCORDION HANDLER
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const headerBtn = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    headerBtn?.addEventListener('click', () => {
      const isOpen = content?.classList.contains('open');

      // Close all other items
      faqItems.forEach(otherItem => {
        const otherContent = otherItem.querySelector('.faq-content');
        const otherIcon = otherItem.querySelector('.faq-icon');
        otherContent?.classList.remove('open');
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
      });

      // Toggle current item
      if (!isOpen && content) {
        content.classList.add('open');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  /* ==========================================================================
     6. CONTACT & QUOTE FORM HANDLER
     ========================================================================== */
  const quoteForm = document.getElementById('quote-form');
  const formSuccess = document.getElementById('form-success-message');

  quoteForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name')?.value || 'Customer';
    const phone = document.getElementById('form-phone')?.value || '';
    const locality = document.getElementById('form-locality')?.value || 'Indore';
    const billRange = document.getElementById('form-bill')?.value || 'Not specified';
    const systemType = document.getElementById('form-type')?.value || 'Residential Rooftop';

    const message = `Hello Everlasting Solar, I would like a Free Solar Site Survey & Quote:
- Name: ${name}
- Phone: ${phone}
- Location: ${locality}, Indore
- Monthly Bill Range: ${billRange}
- System Type: ${systemType}
Please contact me for site inspection and net metering details.`;

    // WhatsApp Direct Link
    const waUrl = `https://wa.me/917987734336?text=${encodeURIComponent(message)}`;

    if (formSuccess) {
      formSuccess.classList.remove('hidden');
      quoteForm.reset();
    }

    // Direct user to WhatsApp in a new tab
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 400);
  });

  /* ==========================================================================
     7. SCROLL REVEAL & METRIC COUNTER ANIMATIONS
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-item');
  const counterElements = document.querySelectorAll('.metric-counter');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counterElements.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const start = 0;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentVal = start + (target - start) * easeProgress;

        counter.textContent = prefix + (isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString('en-IN')) + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = prefix + (isDecimal ? target.toFixed(1) : target.toLocaleString('en-IN')) + suffix;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  // Intersection Observer for scroll animations
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (entry.target.classList.contains('metrics-container')) {
            animateCounters();
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
    const metricsContainer = document.querySelector('.metrics-container');
    if (metricsContainer) observer.observe(metricsContainer);
  } else {
    // Fallback if IntersectionObserver not supported
    revealElements.forEach(el => el.classList.add('revealed'));
    animateCounters();
  }
});

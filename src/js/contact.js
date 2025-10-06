// Contact Section Animations - Enhanced with GSAP ScrollTrigger
async function initContact() {
  const contactSection = document.querySelector('.contact');
  
  if (!contactSection) return;

  // Initialize GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  // Load contact content FIRST
  await loadContactContent();
  
  // Then set up animations
  setupContactAnimations();
}

function setupContactAnimations() {
  // CRITICAL: Set initial states with visibility hidden to prevent FOUC
  const elements = {
    '.contact-title': { opacity: 0, y: 60, visibility: 'hidden' },
    '.contact-subtitle': { opacity: 0, y: 40, visibility: 'hidden' },
    '.contact-card': { opacity: 0, y: 50, visibility: 'hidden' },
    '.contact-form-container': { opacity: 0, x: 60, visibility: 'hidden' },
    '.form-group': { opacity: 0, y: 30, visibility: 'hidden' },
    '.submit-btn': { opacity: 0, scale: 0.9, visibility: 'hidden' },
    '.contact-bg-circle': { opacity: 0, scale: 0.8, visibility: 'hidden' },
    '.contact-particles .particle': { opacity: 0, scale: 0, visibility: 'hidden' }
  };

  // Apply all initial states
  Object.entries(elements).forEach(([selector, props]) => {
    gsap.set(selector, props);
  });

  // ===== HEADER TIMELINE =====
  const headerTL = gsap.timeline({
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 75%',
      end: 'top 25%',
      toggleActions: 'play none none none'
    }
  });

  headerTL
    .to('.contact-title', {
      opacity: 1,
      y: 0,
      visibility: 'visible',
      duration: 0.8,
      ease: 'power3.out',
      onStart: () => {
        const titleElement = document.querySelector('.contact-title');
        if (titleElement) titleElement.classList.add('animate-in');
      }
    })
    .to('.contact-subtitle', {
      opacity: 1,
      y: 0,
      visibility: 'visible',
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.5');

  // ===== CONTACT CARDS TIMELINE =====
  const cardsTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.contact-info',
      start: 'top 70%',
      end: 'top 25%',
      toggleActions: 'play none none none'
    }
  });

  cardsTL.to('.contact-card', {
    opacity: 1,
    y: 0,
    visibility: 'visible',
    duration: 0.6,
    stagger: 0.15,
    ease: 'back.out(1.4)'
  });

  // ===== FORM CONTAINER TIMELINE =====
  const formTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.contact-form-container',
      start: 'top 70%',
      end: 'top 25%',
      toggleActions: 'play none none none'
    }
  });

  formTL
    .to('.contact-form-container', {
      opacity: 1,
      x: 0,
      visibility: 'visible',
      duration: 0.8,
      ease: 'power3.out'
    })
    .to('.form-group', {
      opacity: 1,
      y: 0,
      visibility: 'visible',
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.5')
    .to('.submit-btn', {
      opacity: 1,
      scale: 1,
      visibility: 'visible',
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.3');

  // ===== BACKGROUND ELEMENTS TIMELINE =====
  const bgTL = gsap.timeline({
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 80%',
      end: 'top 30%',
      toggleActions: 'play none none none'
    }
  });

  bgTL
    .to('.contact-bg-circle', {
      opacity: 1,
      scale: 1,
      visibility: 'visible',
      duration: 1.2,
      stagger: 0.2,
      ease: 'power2.out'
    })
    .to('.contact-particles .particle', {
      opacity: 0.5,
      scale: 1,
      visibility: 'visible',
      duration: 1,
      stagger: 0.08,
      ease: 'power2.out'
    }, '-=0.8');

  // ===== INTERACTIVE ANIMATIONS =====
  setTimeout(() => {
    setupInteractiveEffects();
    setupParallaxEffects();
    setupFormHandling();
  }, 100);

  console.log('Contact animations initialized');
}

function setupInteractiveEffects() {
  // Form input interactions
  const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      const label = input.parentElement.querySelector('label');
      if (label) {
        gsap.to(label, {
          color: '#cdb82d',
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
    
    input.addEventListener('blur', () => {
      gsap.to(input, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      const label = input.parentElement.querySelector('label');
      if (label) {
        gsap.to(label, {
          color: '',
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  });

  // Contact card hover effects
  const contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      gsap.to(this, {
        y: -8,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      const icon = this.querySelector('.icon-wrapper');
      if (icon) {
        gsap.to(icon, {
          scale: 1.1,
          rotation: 5,
          duration: 0.4,
          ease: 'back.out(1.7)'
        });
      }
    });

    card.addEventListener('mouseleave', function() {
      gsap.to(this, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      const icon = this.querySelector('.icon-wrapper');
      if (icon) {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });
  });

  // Submit button interactions
  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('mouseenter', () => {
      if (!submitBtn.disabled) {
        gsap.to(submitBtn, {
          scale: 1.05,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      }
    });
    
    submitBtn.addEventListener('mouseleave', () => {
      gsap.to(submitBtn, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  }
}

function setupParallaxEffects() {
  // Background circles parallax
  ScrollTrigger.create({
    trigger: '.contact',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      const circle1 = document.querySelector('.contact-bg-circle-1');
      const circle2 = document.querySelector('.contact-bg-circle-2');
      const circle3 = document.querySelector('.contact-bg-circle-3');

      if (circle1) gsap.set(circle1, { y: progress * -80, x: progress * 50 });
      if (circle2) gsap.set(circle2, { y: progress * 60, x: progress * -40 });
      if (circle3) gsap.set(circle3, { y: progress * -40, x: progress * 30 });
    }
  });

  // Mouse move parallax for particles
  const contactSection = document.querySelector('.contact');
  if (contactSection) {
    let rafId;
    
    contactSection.addEventListener('mousemove', (e) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        document.querySelectorAll('.contact-particles .particle').forEach((particle, index) => {
          const intensity = ((index % 3) + 1) * 8;
          gsap.to(particle, {
            x: xPercent * intensity,
            y: yPercent * intensity,
            duration: 0.5,
            ease: 'none',
            overwrite: 'auto'
          });
        });
        
        rafId = null;
      });
    });

    contactSection.addEventListener('mouseleave', () => {
      gsap.to('.contact-particles .particle', {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  }
}

function setupFormHandling() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.querySelector('.submit-btn');
  
  if (!contactForm || !submitBtn) {
    console.error('Contact form or submit button not found');
    return;
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    
    const originalBtnText = submitBtn.innerHTML;
    
    // Animate button to loading state
    gsap.to(submitBtn, {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';
        submitBtn.disabled = true;
        
        gsap.to(submitBtn.querySelector('i'), {
          rotation: 360,
          duration: 1,
          repeat: -1,
          ease: 'none'
        });
      }
    });
    
    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        // Success animation
        gsap.to(submitBtn, {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(1.7)',
          onComplete: () => {
            submitBtn.innerHTML = '<i class="ri-check-line"></i> Message Sent!';
            submitBtn.style.backgroundColor = '#4CAF50';
            
            gsap.to(submitBtn, {
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });
        
        // Reset form with animation
        gsap.to('.form-group', {
          opacity: 0,
          y: -20,
          duration: 0.4,
          stagger: 0.05,
          onComplete: () => {
            contactForm.reset();
            gsap.to('.form-group', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05
            });
          }
        });
        
        // Reset button after 3 seconds
        setTimeout(() => {
          gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.2,
            onComplete: () => {
              submitBtn.innerHTML = originalBtnText;
              submitBtn.style.backgroundColor = '';
              submitBtn.disabled = false;
              gsap.to(submitBtn, { scale: 1, duration: 0.2 });
            }
          });
        }, 3000);
      } else {
        throw new Error('Form submission failed: ' + response.status);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Error animation
      gsap.to(submitBtn, {
        scale: 1.1,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          submitBtn.innerHTML = '<i class="ri-close-line"></i> Failed to Send';
          submitBtn.style.backgroundColor = '#f44336';
          
          gsap.to(submitBtn, {
            scale: 1,
            duration: 0.2
          });
        }
      });
      
      alert('There was a problem sending your message. Please try again or email us directly at earlstem@gmail.com');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        gsap.to(submitBtn, {
          scale: 0.95,
          duration: 0.2,
          onComplete: () => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
            gsap.to(submitBtn, { scale: 1, duration: 0.2 });
          }
        });
      }, 2000);
    }
  });
}

// Load contact content from JSON
async function loadContactContent() {
  try {
    if (typeof ContentLoader === 'undefined') {
      console.error('ContentLoader is not available for contact content');
      return;
    }
    
    const contactData = await ContentLoader.fetchJSON('/src/content/contact.json');
    if (!contactData) {
      console.warn('Failed to load contact content, using default values');
      return;
    }

    // Update subtitle
    const subtitleElement = document.querySelector('.contact-subtitle');
    if (subtitleElement && contactData.subtitle) {
      subtitleElement.textContent = contactData.subtitle;
    }

    // Update contact methods
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo && contactData.contactMethods) {
      const contactMethodsHTML = contactData.contactMethods.map(method => `
        <a href="${method.link}" class="contact-card-link" ${method.link.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          <div class="contact-card">
            <div class="icon-wrapper">
              <i class="${method.icon}"></i>
            </div>
            <h3>${method.type}</h3>
            <p>${method.value}</p>
          </div>
        </a>
      `).join('');

      contactInfo.innerHTML = contactMethodsHTML;
    }
  } catch (error) {
    console.error('Error loading contact content:', error);
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContact);
} else {
  initContact();
}
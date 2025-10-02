// Contact Section Animations
async function initContact() {
  const contactSection = document.querySelector('.contact');
  
  if (!contactSection) return;

  // Initialize GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  // Load contact content FIRST
  await loadContactContent();
  
  // Then set up animations for header elements
  gsap.to('.contact-title', {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    onComplete: () => {
      const titleElement = document.querySelector('.contact-title');
      if (titleElement) {
        titleElement.classList.add('animate-in');
      }
    }
  });

  gsap.to('.contact-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.2,
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
  
  // Animate form container
  gsap.to('.contact-form-container', {
    opacity: 1,
    x: 0,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.contact-form-container',
      start: 'top 75%',
      toggleActions: 'play none none none'
    }
  });
  
  // Rest of the code remains the same...
  const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    input.addEventListener('blur', () => {
      gsap.to(input, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
  
  const submitBtn = document.querySelector('.submit-btn');
  
  if (submitBtn) {
    submitBtn.addEventListener('mouseenter', () => {
      gsap.to(submitBtn, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    submitBtn.addEventListener('mouseleave', () => {
      gsap.to(submitBtn, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  }
  
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!submitBtn) return;
      
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          submitBtn.innerHTML = '<i class="ri-check-line"></i> Thank you for submitting!';
          contactForm.reset();
          
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
          }, 3000);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        alert('There was a problem sending your message. Please try again.');
        submitBtn.innerHTML = originalBtnText;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContact);
} else {
  initContact();
}

// Load contact content from JSON
async function loadContactContent() {
  try {
    // Check if ContentLoader is available
    if (typeof ContentLoader === 'undefined') {
      console.error('ContentLoader is not available for contact content');
      return;
    }
    
    const contactData = await ContentLoader.fetchJSON('/src/content/contact.json');
    if (!contactData) {
      console.warn('Failed to load contact content, using default values');
      return;
    }

    console.log('Loaded contact data:', contactData); // Debug log

    // Update subtitle
    const subtitleElement = document.querySelector('.contact-subtitle');
    if (subtitleElement && contactData.subtitle) {
      subtitleElement.textContent = contactData.subtitle;
    }

    // Update contact methods
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo && contactData.contactMethods) {
      const contactMethodsHTML = contactData.contactMethods.map(method => `
        <a href="${method.link}" class="contact-card-link" target="_blank" rel="noopener noreferrer">
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
      
      // Re-trigger GSAP animations for newly inserted elements
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.set('.contact-card', { opacity: 0, y: 50 }); // Reset initial state
        
        gsap.to('.contact-card', {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 75%',
            toggleActions: 'play none none none'
          }
        });
        
        // Refresh ScrollTrigger to recognize new elements
        ScrollTrigger.refresh();
      }
    }
  } catch (error) {
    console.error('Error loading contact content:', error);
  }
}
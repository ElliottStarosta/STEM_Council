// Contact Section Animations
document.addEventListener("DOMContentLoaded", function () {
  const contactSection = document.querySelector('.contact');
  
  if (!contactSection) return;

  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  
  // Animate section header
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
      // Add animate-in class to trigger the underline animation
      document.querySelector('.contact-title').classList.add('animate-in');
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
  
  // Animate contact cards with stagger
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
  
  // Animate form inputs when focused
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
  
  // Add hover effect to submit button
  const submitBtn = document.querySelector('.submit-btn');
  
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
  
  // Form submission handling
  const contactForm = document.getElementById('contactForm');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Add submit animation
    gsap.to(submitBtn, {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(submitBtn, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    });
  });
  
  // Form Submission Handler
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
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
        // Change button to success message
        submitBtn.innerHTML = '<i class="ri-check-line"></i> Thank you for submitting!';
        contactForm.reset();
        
        // Reset button after 3 seconds
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
}); 
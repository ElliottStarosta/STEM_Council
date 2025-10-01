gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  
  // Footer logo animations
  gsap.to('.footer-logo h2', {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
  
  gsap.to('.footer-logo .tagline', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.2,
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });
  
  // Footer content animation
  gsap.to('.footer-content', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.4,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });
  
  // Animate footer bottom text
  gsap.to('.footer-bottom p', {
    opacity: 1,
    y: 0,
    stagger: 0.3,
    duration: 0.8,
    scrollTrigger: {
      trigger: '.footer-bottom',
      start: 'top 95%',
      toggleActions: 'play none none none'
    }
  });
  
  // Heartbeat animation
  gsap.to('.heart', {
    scale: 1.2,
    repeat: -1,
    yoyo: true,
    duration: 0.6,
    ease: 'power1.inOut'
  });
  
  // Social media hover animations
  const socialLinks = document.querySelectorAll('.social-link');
  
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    });
    
    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
});
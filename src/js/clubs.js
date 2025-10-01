
// Clubs Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
  initClubsSection();
});

function initClubsSection() {
  createClubsParticles();
  initClubsAnimations();
  initClubInteractions();
}

// Particles Animation
function createClubsParticles() {
  const particlesContainer = document.getElementById('clubs-particles');
  if (!particlesContainer) return;
  
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(205, 184, 45, ${Math.random() * 0.5 + 0.2});
      border-radius: 50%;
      pointer-events: none;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
    `;
    
    particlesContainer.appendChild(particle);
    
    // Animate particle
    gsap.to(particle, {
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      duration: Math.random() * 20 + 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(particle, {
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
}

// GSAP Scroll Animations
function initClubsAnimations() {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);
  
  // Animate section header
  gsap.fromTo('.clubs-header', 
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: '.clubs-header',
        start: 'top 80%',
        toggleActions: "play none none reverse"
      }
    }
  );
  
  // Animate club cards with stagger
  gsap.fromTo('.club-card',
    {
      opacity: 0,
      y: 80,
      scale: 0.9
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.clubs-grid',
        start: 'top 75%',
        toggleActions: "play none none reverse"
      }
    }
  );
  
  // Animate decorative elements
  gsap.fromTo('.decoration-circle-1',
    {
      scale: 0,
      rotation: -180
    },
    {
      scale: 1,
      rotation: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      scrollTrigger: {
        trigger: '.clubs-section',
        start: 'top 80%',
        toggleActions: "play none none reverse"
      }
    }
  );
  
  gsap.fromTo('.decoration-circle-2',
    {
      scale: 0,
      rotation: 180
    },
    {
      scale: 1,
      rotation: 0,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      delay: 0.3,
      scrollTrigger: {
        trigger: '.clubs-section',
        start: 'top 80%',
        toggleActions: "play none none reverse"
      }
    }
  );
  
  gsap.fromTo('.decoration-line',
    {
      scaleX: 0,
      opacity: 0
    },
    {
      scaleX: 1,
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.clubs-section',
        start: 'top 70%',
        toggleActions: "play none none reverse"
      }
    }
  );
}

// Club Card Interactions
function initClubInteractions() {
  const clubCards = document.querySelectorAll('.club-card');
  
  clubCards.forEach((card, index) => {
    // Mouse enter animation
    card.addEventListener('mouseenter', () => {
      gsap.to(card.querySelector('.club-icon'), {
        rotation: 360,
        duration: 0.6,
        ease: "power2.out"
      });
      
      gsap.to(card.querySelector('.club-card-glow'), {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Animate club links
      gsap.fromTo(card.querySelectorAll('.club-link'),
        {
          y: 10,
          opacity: 0.7
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    });
    
    // Mouse leave animation
    card.addEventListener('mouseleave', () => {
      gsap.to(card.querySelector('.club-icon'), {
        rotation: 0,
        duration: 0.6,
        ease: "power2.out"
      });
      
      gsap.to(card.querySelector('.club-card-glow'), {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    // Click animation
    card.addEventListener('click', () => {
      gsap.to(card, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    });
  });
  
  // Club link interactions
  const clubLinks = document.querySelectorAll('.club-link');
  
  clubLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        scale: 1.1,
        rotation: 5,
        duration: 0.2,
        ease: "power2.out"
      });
    });
    
    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        scale: 1,
        rotation: 0,
        duration: 0.2,
        ease: "power2.out"
      });
    });
    
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Pulse animation on click
      gsap.to(link, {
        scale: 1.2,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    });
  });
}

// Parallax effect for decorative elements
function initParallaxEffect() {
  const decorativeElements = document.querySelectorAll('.decoration-circle, .decoration-line');
  
  decorativeElements.forEach(element => {
    gsap.to(element, {
      y: -50,
      duration: 1,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });
}

// Initialize parallax on load
window.addEventListener('load', () => {
  initParallaxEffect();
});
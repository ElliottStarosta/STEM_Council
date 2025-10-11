// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Initialize hero animations (runs immediately if DOM is already loaded)
async function initHero() {
  if (window.__heroAnimationInitialized) return;
  window.__heroAnimationInitialized = true;
  const heroData = await loadHeroContent();
  // Wait a tick to ensure DOM is ready
  await new Promise(resolve => setTimeout(resolve, 50));
  initHeroAnimations();
  initButtonInteractions();
  initParticlesAnimation();
  initStatsAnimations(heroData);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero);
} else {
  initHero();
}

// Load hero content from JSON
async function loadHeroContent() {
  try {
    console.log('Loading hero content...');
    
    if (typeof ContentLoader === 'undefined') {
      console.error('ContentLoader is not available - waiting for it to load...');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (typeof ContentLoader === 'undefined') {
        console.error('ContentLoader still not available after waiting');
        return null;
      }
    }
    
    const heroData = await ContentLoader.fetchJSON('/src/content/hero.json');
    console.log('Hero data loaded:', heroData);
    
    if (!heroData) {
      console.warn('Failed to load hero content, using default values');
      return null;
    }

    // Update description
    const descriptionElement = document.querySelector('.hero-description p');
    if (descriptionElement) {
      descriptionElement.textContent = heroData.description;
    }

    // Update adjectives
    const adjectiveElements = document.querySelectorAll('.adjective');
    if (heroData.adjectives && heroData.adjectives.length >= 3) {
      heroData.adjectives.forEach((adj, index) => {
        if (adjectiveElements[index]) {
          adjectiveElements[index].textContent = adj.adjective;
        }
      });
    }

    // Update stats
    const statElements = document.querySelectorAll('.hero-stat');
    if (heroData.stats && heroData.stats.length >= 3) {
      heroData.stats.forEach((stat, index) => {
        if (statElements[index]) {
          const numberElement = statElements[index].querySelector('.hero-stat-number');
          const labelElement = statElements[index].querySelector('.hero-stat-label');
          
          if (numberElement) numberElement.textContent = stat.number;
          if (labelElement) labelElement.textContent = stat.label;
        }
      });
    }
    
    return heroData;
  } catch (error) {
    console.error('Error loading hero content:', error);
    return null;
  }
}

// Main hero animation function - COMPLETELY FIXED
function initHeroAnimations() {
  document.body.classList.add('loaded');

  // Set initial states for all elements
  gsap.set(".adjective", {
    y: 50,
    opacity: 0
  });
  
  gsap.set(".hero-description", { 
    y: 30, 
    opacity: 0 
  });
  
  gsap.set(".hero-btn", { 
    x: 40, 
    opacity: 0 
  });
  
  gsap.set(".hero-bg-circle", { 
    scale: 0, 
    opacity: 0 
  });

  // Create master timeline
  const tl = gsap.timeline({
    onComplete: () => {
      document.querySelector(".hero").classList.add("hero-loaded");
    },
  });

  // SEPARATE TIMELINE FOR ADJECTIVES - FAST AND SMOOTH
  const adjectives = document.querySelectorAll(".adjective");
  adjectives.forEach((adj, index) => {
    const adjectiveTL = gsap.timeline();
    
    adjectiveTL.to(adj, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
    })
    .call(() => {
      adj.classList.add("animate-in");
    }, null, "-=0.2"); // Underline starts while adjective is still animating in
    
    // Add to main timeline with stagger
    tl.add(adjectiveTL, index * 0.6 );
  });

  // Continue with description AFTER adjectives
  tl.to(".hero-description", {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: "power3.out",
  }, "+=0.2") // Small gap after last adjective

  // Animate buttons with stagger
  .to(".hero-btn", {
    x: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: "power3.out",
  }, "-=0.4")

  // Animate background elements
  .to(".hero-bg-circle", {
    scale: 1,
    opacity: 1,
    duration: 1,
    stagger: 0.2,
    ease: "back.out(1.7)",
  }, "-=0.8");

  // Scroll-triggered animations for re-entry
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => {
      gsap.to(".hero-bg-circle-1", {
        y: -50,
        duration: 2,
        ease: "power1.out",
      });

      gsap.to(".hero-bg-circle-2", {
        y: 30,
        duration: 2,
        ease: "power1.out",
      });
    },
    onLeave: () => {
      gsap.to(".hero-bg-circle-1, .hero-bg-circle-2", {
        y: 0,
        duration: 1,
        ease: "power1.out",
      });
    },
  });

  // Continuous floating animation for background circles
  gsap.to(".hero-bg-circle-1", {
    y: "+=20",
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".hero-bg-circle-2", {
    y: "-=15",
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

// Enhanced button interaction animations
function initButtonInteractions() {
  const buttons = document.querySelectorAll(".hero-btn");

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      gsap.to(this, {
        scale: 1.05,
        y: -3,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(this.querySelector(".btn-arrow"), {
        x: 8,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(this.querySelector(".btn-icon"), {
        rotation: 15,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", function () {
      gsap.to(this, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(this.querySelector(".btn-arrow"), {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(this.querySelector(".btn-icon"), {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    button.addEventListener("mousedown", function () {
      gsap.to(this, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseup", function () {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out",
      });
    });

    button.addEventListener("click", function (event) {
      createRippleEffect(this, event);
    });
  });
}

// Enhanced ripple effect
function createRippleEffect(button, event) {
  const ripple = document.createElement("div");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.5;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    transform: scale(0);
    z-index: 1;
  `;

  button.appendChild(ripple);

  gsap.to(ripple, {
    scale: 1,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    onComplete: () => {
      ripple.remove();
    },
  });
}

// Intersection Observer for performance optimization
function initIntersectionObserver() {
  const heroSection = document.querySelector(".hero");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ScrollTrigger.refresh();
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  observer.observe(heroSection);
}

initIntersectionObserver();

// Handle window resize for responsive animations
window.addEventListener(
  "resize",
  debounce(() => {
    ScrollTrigger.refresh();
  }, 250)
);

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// FIXED PARTICLE ANIMATION SYSTEM
function initParticlesAnimation() {
  const particles = document.querySelectorAll(".particle");
  
  if (particles.length === 0) {
    console.warn("No particles found");
    return;
  }

  // Set initial GSAP state for particles
  gsap.set(particles, {
    scale: 0,
    opacity: 0,
    rotation: 0,
  });

  // Animate particles in with stagger
  gsap.to(particles, {
    scale: 1,
    opacity: 0.6,
    duration: 2,
    stagger: {
      each: 0.3,
      from: "random",
    },
    ease: "back.out(1.7)",
    delay: 1,
  });

  // Add mouse interaction parallax effect
  const heroSection = document.querySelector(".hero");

  heroSection.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xPercent = (clientX / innerWidth - 0.5) * 2;
    const yPercent = (clientY / innerHeight - 0.5) * 2;

    particles.forEach((particle, index) => {
      const intensity = ((index % 3) + 1) * 10;

      gsap.to(particle, {
        x: xPercent * intensity,
        y: yPercent * intensity,
        duration: 0.8,
        ease: "power2.out",
      });
    });
  });

  heroSection.addEventListener("mouseleave", () => {
    gsap.to(particles, {
      x: 0,
      y: 0,
      duration: 1.2,
      ease: "power2.out",
    });
  });

  // Add scroll-based particle movement
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      particles.forEach((particle, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const speed = ((index % 3) + 1) * 20;

        gsap.set(particle, {
          y: progress * speed * direction,
        });
      });
    },
  });

  addSmoothParticleEffect(particles);
}

// FIXED SMOOTH PARTICLE EFFECT
function addSmoothParticleEffect(particles) {
  const buttons = document.querySelectorAll(".hero-btn");
  let particleTimelines = [];

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      particleTimelines.forEach(tl => tl.kill());
      particleTimelines = [];

      particles.forEach((particle, index) => {
        const hoverColor = getEnhancedHoverColor(index);
        
        const tl = gsap.timeline();
        
        tl.to(particle, {
          scale: 3,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: index * 0.03,
        })
        .to(particle, {
          backgroundColor: hoverColor,
          borderColor: hoverColor,
          duration: 0.4,
          ease: "power2.out",
        }, "-=0.4")
        .to(particle, {
          rotation: (index % 2 === 0 ? 20 : -20),
          duration: 0.6,
          ease: "power2.inOut",
        }, "-=0.5")
        .set(particle, {
          boxShadow: `0 0 25px ${hoverColor}, 0 0 50px ${hoverColor}`,
          filter: 'brightness(1.4) saturate(1.8)',
        });
        
        particleTimelines.push(tl);
      });
    });

    button.addEventListener("mouseleave", () => {
      particleTimelines.forEach(tl => tl.kill());
      particleTimelines = [];

      particles.forEach((particle, index) => {
        const tl = gsap.timeline();
        
        tl.to(particle, {
          scale: 1,
          opacity: 0.6,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          rotation: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: index * 0.02,
        })
        .set(particle, {
          boxShadow: 'none',
          filter: 'none',
        });
        
        particleTimelines.push(tl);
      });
    });
  });
}

function getEnhancedHoverColor(index) {
  const enhancedColors = [
    'rgba(255, 140, 0, 1)',
    'rgba(255, 215, 0, 1)',
    'rgba(255, 165, 0, 1)',
    'rgba(218, 165, 32, 1)',
    'rgba(255, 69, 0, 1)',
    'rgba(255, 140, 0, 1)',
  ];
  
  return enhancedColors[index % enhancedColors.length];
}

function initStatsAnimations(heroData) {
  const stats = document.querySelectorAll(".hero-stat");
  
  gsap.set(stats, {
    scale: 0,
    opacity: 0,
    y: 30,
  });

  gsap.to(stats, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.7)",
    delay: 1.8,
    onComplete: () => {
      startStatsIdleAnimation();
    }
  });

  stats.forEach((stat, index) => {
    const numberElement = stat.querySelector(".hero-stat-number");
    if (!numberElement) return;
    
    let finalNumber, isPlus;
    
    if (heroData && heroData.stats && heroData.stats[index]) {
      const statData = heroData.stats[index].number;
      finalNumber = statData.replace("+", "");
      isPlus = statData.includes("+");
    } else {
      finalNumber = numberElement.textContent.replace("+", "");
      isPlus = numberElement.textContent.includes("+");
    }
    
    const counter = { value: 0 };
    
    gsap.to(counter, {
      value: parseInt(finalNumber),
      duration: 2,
      delay: 2 + (index * 0.2),
      ease: "power2.out",
      onUpdate: () => {
        const currentValue = Math.round(counter.value);
        numberElement.textContent = currentValue + (isPlus ? "+" : "");
      }
    });
  });
}

function startStatsIdleAnimation() {
  const stats = document.querySelectorAll(".hero-stat");
  
  stats.forEach((stat, index) => {
    const delay = index * 0.8;
    const duration = 3 + (index * 0.5);
    const yMovement = 8 + (index * 2);
    
    gsap.to(stat, {
      y: `+=${yMovement}`,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay,
    });
    
    gsap.to(stat, {
      scale: 1.05,
      duration: duration * 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay + 0.5,
    });
    
    gsap.to(stat, {
      rotation: index % 2 === 0 ? 2 : -2,
      duration: duration * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay + 1,
    });
  });
  
  stats.forEach((stat) => {
    stat.addEventListener("mouseenter", () => {
      gsap.to(stat, {
        scale: 1.15,
        y: -5,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    });
    
    stat.addEventListener("mouseleave", () => {
      gsap.to(stat, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          const index = Array.from(stats).indexOf(stat);
          const duration = 3 + (index * 0.5);
          const yMovement = 8 + (index * 2);
          
          gsap.to(stat, {
            y: `+=${yMovement}`,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          
          gsap.to(stat, {
            scale: 1.05,
            duration: duration * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          
          gsap.to(stat, {
            rotation: index % 2 === 0 ? 2 : -2,
            duration: duration * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      });
    });
  });
}

// Keyboard navigation support
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    const focusedButton = document.activeElement;
    if (focusedButton && focusedButton.classList.contains("hero-btn")) {
      event.preventDefault();
      focusedButton.click();
    }
  }
});

// Prefers reduced motion support
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(0.5);
  ScrollTrigger.config({ limitCallbacks: true });
}
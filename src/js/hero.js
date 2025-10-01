// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);



// Initialize hero animations when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initHeroAnimations();
  initButtonInteractions();
  initParticlesAnimation();
  initStatsAnimations();
});

// Main hero animation function
function initHeroAnimations() {
  // Set initial states to prevent FOUC (Flash of Unstyled Content)
  gsap.set(".adjective", {
    y: 50,
    opacity: 0,
    clearProps: "all", // This prevents style conflicts
  });
  gsap.set(".hero-description", { y: 30, opacity: 0 });
  gsap.set(".hero-btn", { x: 40, opacity: 0 });
  gsap.set(".hero-bg-circle", { scale: 0, opacity: 0 });

  


  // Create master timeline
  const tl = gsap.timeline({
    onComplete: () => {
      document.querySelector(".hero").classList.add("hero-loaded");
    },
  });

  // Animate adjectives with stagger - FIX: Don't override CSS styles
  tl.to(".adjective", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    onComplete: function () {
      // Add the animate-in class to trigger underline animation
      document.querySelectorAll(".adjective").forEach((adj) => {
        adj.classList.add("animate-in");
      });
    },
  })



    // Animate description
    .to(
      ".hero-description",
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.4"
    )

    // Animate buttons with stagger
    .to(
      ".hero-btn",
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      },
      "-=0.6"
    )

    // Animate background elements
    .to(
      ".hero-bg-circle",
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        stagger: 0.3,
        ease: "back.out(1.7)",
      },
      "-=1.2"
    )

    

  // Scroll-triggered animations for re-entry
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => {
      // Add subtle parallax effect to background elements
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
      // Reset background positions
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
    // Hover animations
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

    // Click animations
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

    // Click handlers for navigation (now handled by universal scrolling.js)
    button.addEventListener("click", function (event) {
      // Add click ripple effect
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

// Initialize intersection observer
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

// COMPLETELY FIXED PARTICLE ANIMATION SYSTEM
function initParticlesAnimation() {
  const particles = document.querySelectorAll(".particle");
  
  if (particles.length === 0) {
    console.warn("No particles found");
    return;
  }

  // Store original particle properties
  const originalParticleProps = [];
  
  particles.forEach((particle, index) => {
    const computedStyles = window.getComputedStyle(particle);
    
    originalParticleProps.push({
      color: 'rgba(255, 255, 255, 0.6)',
      scale: 1,
      opacity: 0.6,
      transform: particle.style.transform || '',
      backgroundColor: particle.style.backgroundColor || '',
      borderColor: particle.style.borderColor || ''
    });
    
    // Set initial particle styling to ensure they're visible
    particle.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    particle.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    particle.style.borderRadius = '50%';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.position = 'absolute';
    particle.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });

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

  // Reset particle positions when mouse leaves
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

  // FIXED: Enhanced particle pulse effect
  addSmoothParticleEffect(particles, originalParticleProps);
}

// COMPLETELY REWRITTEN SMOOTH PARTICLE EFFECT
function addSmoothParticleEffect(particles, originalParticleProps) {
  const buttons = document.querySelectorAll(".hero-btn");
  let particleTimelines = [];

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      // Kill any existing timelines
      particleTimelines.forEach(tl => tl.kill());
      particleTimelines = [];

      particles.forEach((particle, index) => {
        const hoverColor = getEnhancedHoverColor(index);
        
        // Create smooth timeline for each particle
        const tl = gsap.timeline();
        
        // FIXED: Use GSAP for everything, including color changes
        tl.to(particle, {
          scale: 3, // MUCH BIGGER - This will definitely show
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: index * 0.03, // Smooth stagger
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
      // Kill hover timelines
      particleTimelines.forEach(tl => tl.kill());
      particleTimelines = [];

      particles.forEach((particle, index) => {
        const originalProps = originalParticleProps[index];
        
        // Create smooth exit timeline
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

// FIXED: Enhanced hover color function
function getEnhancedHoverColor(index) {
  const enhancedColors = [
    'rgba(255, 140, 0, 1)',   // Dark orange
    'rgba(255, 215, 0, 1)',   // Gold
    'rgba(255, 165, 0, 1)',   // Orange
    'rgba(218, 165, 32, 1)', // Golden rod
    'rgba(255, 69, 0, 1)',   // Red orange
    'rgba(255, 140, 0, 1)',  // Dark orange
  ];
  
  return enhancedColors[index % enhancedColors.length];
}

// NEW: Stats animations function
function initStatsAnimations() {
  const stats = document.querySelectorAll(".hero-stat");
  
  // Set initial state
  gsap.set(stats, {
    scale: 0,
    opacity: 0,
    y: 30,
  });

  // Load animation with stagger
  gsap.to(stats, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.7)",
    delay: 1.8, // Start after main hero animations
    onComplete: () => {
      startStatsIdleAnimation();
    }
  });

  // Number count-up animation
  stats.forEach((stat, index) => {
    const numberElement = stat.querySelector(".hero-stat-number");
    if (!numberElement) return;
    
    const finalNumber = numberElement.textContent.replace("+", "");
    const isPlus = numberElement.textContent.includes("+");
    
    // Start from 0 and animate to final number
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

// Continuous idle animation for stats
function startStatsIdleAnimation() {
  const stats = document.querySelectorAll(".hero-stat");
  
  stats.forEach((stat, index) => {
    // Different animation parameters for each stat
    const delay = index * 0.8; // Stagger the start times
    const duration = 3 + (index * 0.5); // Different durations
    const yMovement = 8 + (index * 2); // Different movement amounts
    
    // Continuous floating animation
    gsap.to(stat, {
      y: `+=${yMovement}`,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay,
    });
    
    // Subtle scale pulse
    gsap.to(stat, {
      scale: 1.05,
      duration: duration * 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay + 0.5,
    });
    
    // Rotation wobble
    gsap.to(stat, {
      rotation: index % 2 === 0 ? 2 : -2,
      duration: duration * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay + 1,
    });
  });
  
  // Add hover effects that temporarily override idle animation
  stats.forEach((stat) => {
    stat.addEventListener("mouseenter", () => {
      gsap.to(stat, {
        scale: 1.15,
        y: -5,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true, // Override idle animations
      });
    });
    
    stat.addEventListener("mouseleave", () => {
      // Resume idle animation
      gsap.to(stat, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Restart idle animations
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
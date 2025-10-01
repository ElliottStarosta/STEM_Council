// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize resources animations when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initResourcesAnimations();
  initCategoryTabs();
  initResourcesParticles();
  initResourcesInteractions();
});

// Main resources animation function
function initResourcesAnimations() {
  // Set initial states to prevent FOUC
  gsap.set(".resources-title", { y: 50, opacity: 0 });
  gsap.set(".resources-subtitle", { y: 30, opacity: 0 });
  gsap.set(".category-tabs", { y: 30, opacity: 0 });
  gsap.set(".resource-card", { y: 80, opacity: 0, scale: 0.9 });
  gsap.set(".resources-cta", { y: 50, opacity: 0 });
  gsap.set(".resources-bg-circle", { scale: 0, opacity: 0 });
  gsap.set(".resources-particles .particle", { scale: 0, opacity: 0 });

  // Header animations with ScrollTrigger
  ScrollTrigger.create({
    trigger: ".resources-header",
    start: "top 85%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    animation: gsap.timeline()
      .to(".resources-title", {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      })
      .to(".resources-subtitle", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
  });

  // Category tabs animation
  ScrollTrigger.create({
    trigger: ".resources-categories",
    start: "top 90%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    animation: gsap.to(".category-tabs", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
  });

  // Resource cards staggered animation
  ScrollTrigger.create({
    trigger: ".resources-grid",
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    animation: gsap.to(".resource-card", {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: {
        each: 0.15,
        from: "start"
      },
      ease: "power3.out"
    })
  });

  // CTA section animation
  ScrollTrigger.create({
    trigger: ".resources-cta",
    start: "top 85%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    animation: gsap.to(".resources-cta", {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out"
    })
  });

  // Background circles animation
  ScrollTrigger.create({
    trigger: ".resources",
    start: "top 90%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    animation: gsap.to(".resources-bg-circle", {
      scale: 1,
      opacity: 1,
      duration: 1.5,
      stagger: 0.3,
      ease: "back.out(1.7)"
    })
  });

  // Particles animation
  ScrollTrigger.create({
    trigger: ".resources",
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    animation: gsap.to(".resources-particles .particle", {
      scale: 1,
      opacity: 0.8,
      duration: 2,
      stagger: {
        each: 0.2,
        from: "random"
      },
      ease: "back.out(1.7)"
    })
  });

  // Parallax effect for background elements
  gsap.to(".resources-bg-circle-1", {
    y: "+=50",
    duration: 8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(".resources-bg-circle-2", {
    y: "-=30",
    duration: 6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(".resources-bg-circle-3", {
    y: "+=40",
    duration: 10,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Scroll-based parallax for cards
  ScrollTrigger.create({
    trigger: ".resources",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      const cards = document.querySelectorAll(".resource-card");
      
      cards.forEach((card, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const speed = 20 + (index % 3) * 10;
        
        gsap.set(card, {
          y: progress * speed * direction * 0.5
        });
      });
    }
  });
}

// Category tabs functionality
function initCategoryTabs() {
  const tabs = document.querySelectorAll(".category-tab");
  const cards = document.querySelectorAll(".resource-card");

  tabs.forEach(tab => {
    tab.addEventListener("click", function() {
      const category = this.getAttribute("data-category");
      
      // Update active tab
      tabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      // Add click animation
      gsap.to(this, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });

      // Filter cards with animation
      filterResourceCards(category, cards);
    });

    // Hover animations for tabs
    tab.addEventListener("mouseenter", function() {
      if (!this.classList.contains("active")) {
        gsap.to(this, {
          scale: 1.05,
          y: -2,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    tab.addEventListener("mouseleave", function() {
      if (!this.classList.contains("active")) {
        gsap.to(this, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  });
}

// Filter resource cards with smooth animations
function filterResourceCards(category, cards) {
  const tl = gsap.timeline();

  // Fade out all cards first
  tl.to(cards, {
    opacity: 0,
    y: 20,
    scale: 0.95,
    duration: 0.3,
    stagger: 0.05,
    ease: "power2.in"
  });

  // Filter and show relevant cards
  tl.call(() => {
    cards.forEach(card => {
      const cardType = card.getAttribute("data-type");
      if (category === "all" || cardType === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });

  // Fade in visible cards
  tl.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    stagger: 0.1,
    ease: "power3.out"
  }, "+=0.1");
}

// Enhanced particles animation
function initResourcesParticles() {
  const particles = document.querySelectorAll(".resources-particles .particle");
  
  if (particles.length === 0) return;

  // Mouse interaction with particles
  const resourcesSection = document.querySelector(".resources");

  resourcesSection.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xPercent = (clientX / innerWidth - 0.5) * 2;
    const yPercent = (clientY / innerHeight - 0.5) * 2;

    particles.forEach((particle, index) => {
      const intensity = ((index % 4) + 1) * 8;

      gsap.to(particle, {
        x: xPercent * intensity,
        y: yPercent * intensity,
        duration: 0.6,
        ease: "power2.out"
      });
    });
  });

  // Reset particles on mouse leave
  resourcesSection.addEventListener("mouseleave", () => {
    gsap.to(particles, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power2.out"
    });
  });

  // Individual particle animations
  particles.forEach((particle, index) => {
    const delay = index * 0.5;
    const duration = 12 + (index % 4) * 3;
    const xMovement = 30 + (index % 3) * 10;
    const yMovement = 20 + (index % 3) * 15;

    // Continuous floating animation
    gsap.to(particle, {
      x: `+=${xMovement * (index % 2 === 0 ? 1 : -1)}`,
      y: `+=${yMovement}`,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay
    });

    // Rotation animation
    gsap.to(particle, {
      rotation: 360,
      duration: duration * 2,
      repeat: -1,
      ease: "none",
      delay: delay
    });

    // Scale pulsing
    gsap.to(particle, {
      scale: 1.3,
      duration: duration / 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay + 1
    });
  });
}

// Resource card and button interactions
function initResourcesInteractions() {
  const resourceCards = document.querySelectorAll(".resource-card");
  const resourceBtns = document.querySelectorAll(".resource-btn");
  const ctaBtn = document.querySelector(".cta-btn");

  // Resource card hover effects
  resourceCards.forEach(card => {
    card.addEventListener("mouseenter", function() {
      gsap.to(this, {
        y: -10,
        scale: 1.02,
        duration: 0.4,
        ease: "power2.out"
      });

      // Animate card icon
      const icon = this.querySelector(".card-icon");
      gsap.to(icon, {
        scale: 1.1,
        rotation: 10,
        duration: 0.3,
        ease: "power2.out"
      });

      // Animate tags
      const tags = this.querySelectorAll(".tag");
      gsap.to(tags, {
        scale: 1.05,
        duration: 0.2,
        stagger: 0.05,
        ease: "power2.out"
      });
    });

    card.addEventListener("mouseleave", function() {
      gsap.to(this, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });

      const icon = this.querySelector(".card-icon");
      gsap.to(icon, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });

      const tags = this.querySelectorAll(".tag");
      gsap.to(tags, {
        scale: 1,
        duration: 0.2,
        stagger: 0.05,
        ease: "power2.out"
      });
    });
  });

  // Resource button interactions
  resourceBtns.forEach(btn => {
    btn.addEventListener("mouseenter", function() {
      gsap.to(this, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    btn.addEventListener("mouseleave", function() {
      gsap.to(this, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    btn.addEventListener("mousedown", function() {
      gsap.to(this, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out"
      });
    });

    btn.addEventListener("mouseup", function() {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out"
      });
    });

    btn.addEventListener("click", function(e) {
      createResourceRipple(this, e);
      
      // Add your resource button logic here
      console.log("Resource button clicked:", this.textContent);
    });
  });

  // CTA button interactions
  if (ctaBtn) {
    ctaBtn.addEventListener("mouseenter", function() {
      gsap.to(this, {
        scale: 1.05,
        y: -3,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    ctaBtn.addEventListener("mouseleave", function() {
      gsap.to(this, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    ctaBtn.addEventListener("click", function(e) {
      createResourceRipple(this, e);
      console.log("CTA button clicked");
    });
  }
}

// Enhanced ripple effect for resource buttons
function createResourceRipple(button, event) {
  const ripple = document.createElement("div");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    transform: scale(0);
    z-index: 10;
  `;

  button.appendChild(ripple);

  gsap.to(ripple, {
    scale: 1,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => {
      ripple.remove();
    }
  });
}

// Intersection observer for performance optimization
function initResourcesObserver() {
  const resourcesSection = document.querySelector(".resources");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ScrollTrigger.refresh();
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(resourcesSection);
}

// Initialize intersection observer
initResourcesObserver();

// Handle window resize for responsive animations
window.addEventListener(
  "resize",
  debounce(() => {
    ScrollTrigger.refresh();
  }, 250)
);

// Utility debounce function
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

// Keyboard navigation support
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter" || event.key === " ") {
    const focusedElement = document.activeElement;
    if (focusedElement && 
        (focusedElement.classList.contains("category-tab") || 
         focusedElement.classList.contains("resource-btn") ||
         focusedElement.classList.contains("cta-btn"))) {
      event.preventDefault();
      focusedElement.click();
    }
  }
});

// Prefers reduced motion support
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(0.5);
  ScrollTrigger.config({ limitCallbacks: true });
}
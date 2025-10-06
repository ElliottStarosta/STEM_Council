// About Us Section Animations - FIXED CSS CONFLICT VERSION
function initAbout() {
  gsap.registerPlugin(ScrollTrigger);
  
  // Load content first, THEN set up animations
  loadAboutContent().then(() => {
    setupAnimations();
  });
}

function setupAnimations() {
  // CRITICAL: Set initial states IMMEDIATELY with inline styles
  // This overrides any CSS rules
  const elements = {
    '.about-mission-content': { y: 60, opacity: 0, visibility: 'hidden' },
    '.mission-visual': { x: 60, opacity: 0, visibility: 'hidden' },
    '.mission-highlight': { scale: 0.5, opacity: 0, y: 30, rotationX: -90, visibility: 'hidden' },
    '.mission-text': { opacity: 0, visibility: 'hidden' },
    '.central-hub': { scale: 0, opacity: 0, visibility: 'hidden' },
    '.hub-ring': { scale: 0, opacity: 0, visibility: 'hidden' },
    '.stem-orb': { scale: 0, opacity: 0, visibility: 'hidden' },
    '.connection-line': { opacity: 0, visibility: 'hidden' },
    '.about-section': { y: 50, opacity: 0, visibility: 'hidden' },
    '.feature-item': { x: -40, opacity: 0, visibility: 'hidden' },
    '.stat-item': { y: 40, opacity: 0, visibility: 'hidden' },
    '.about-bg-shape': { opacity: 0, visibility: 'hidden' },
    '.about-particle': { opacity: 0, visibility: 'hidden' }
  };

  // Apply all initial states
  Object.entries(elements).forEach(([selector, props]) => {
    gsap.set(selector, props);
  });

  // ===== MISSION SECTION TIMELINE =====
  const missionTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-mission",
      start: "top 75%",
      end: "top 25%",
      toggleActions: "play none none none"
    }
  });

  missionTL
    .to(".about-mission-content", {
      y: 0,
      opacity: 1,
      visibility: 'visible',
      duration: 0.8,
      ease: "power3.out",
      onStart: () => {
        const title = document.querySelector(".mission-title");
        if (title) title.classList.add("animate-in");
      }
    })
    .to(".mission-highlight", {
      scale: 1,
      opacity: 1,
      y: 0,
      rotationX: 0,
      visibility: 'visible',
      duration: 0.6,
      stagger: 0.2,
      ease: "back.out(2)"
    }, "-=0.5")
    .to(".mission-text", {  // ADD THIS BLOCK
      opacity: 1,
      visibility: 'visible',
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.8")
    .to(".mission-visual", {
      x: 0,
      opacity: 1,
      visibility: 'visible',
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.6");
  // ===== MISSION VISUAL ELEMENTS TIMELINE =====
  const visualTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".mission-visual",
      start: "top 70%",
      end: "top 20%",
      toggleActions: "play none none none"
    }
  });

  visualTL
    .to(".central-hub", {
      scale: 1,
      opacity: 1,
      visibility: 'visible',
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .to(".hub-ring", {
      scale: 1,
      opacity: 1,
      visibility: 'visible',
      duration: 0.5,
      stagger: 0.15,
      ease: "power2.out"
    }, "-=0.3")
    .to(".stem-orb", {
      scale: 1,
      opacity: 1,
      visibility: 'visible',
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.4")
    .to(".connection-line", {
      opacity: 0.6,
      visibility: 'visible',
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out"
    }, "-=0.3");

  // ===== ABOUT CONTENT SECTIONS TIMELINE =====
  const contentTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-content",
      start: "top 70%",
      end: "top 20%",
      toggleActions: "play none none none"
    }
  });

  contentTL.to(".about-section", {
    y: 0,
    opacity: 1,
    visibility: 'visible',
    duration: 0.7,
    stagger: 0.2,
    ease: "power3.out",
    onStart: () => {
      document.querySelectorAll(".section-title").forEach(title => {
        title.classList.add("animate-in");
      });
    }
  });

  // ===== FEATURE ITEMS TIMELINE =====
  const featuresTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-features",
      start: "top 75%",
      end: "top 25%",
      toggleActions: "play none none none"
    }
  });

  featuresTL.to(".feature-item", {
    x: 0,
    opacity: 1,
    visibility: 'visible',
    duration: 0.6,
    stagger: 0.15,
    ease: "power3.out"
  });

  // ===== STAT ITEMS TIMELINE =====
  const statsTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".impact-stats",
      start: "top 75%",
      end: "top 25%",
      toggleActions: "play none none none"
    }
  });

  statsTL.to(".stat-item", {
    y: 0,
    opacity: 1,
    visibility: 'visible',
    duration: 0.6,
    stagger: 0.12,
    ease: "power3.out"
  });

  // ===== BACKGROUND PARTICLES TIMELINE =====
  const particlesTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-us",
      start: "top 80%",
      end: "top 30%",
      toggleActions: "play none none none"
    }
  });

  particlesTL.to(".about-particle", {
    opacity: 0.5,
    visibility: 'visible',
    duration: 1.5,
    stagger: 0.2,
    ease: "power2.out"
  });

  // ===== HOVER INTERACTIONS =====
  setTimeout(() => {
    setupHoverEffects();
    setupContinuousAnimations();
    setupParallaxEffects();
  }, 100);

  console.log("About Us animations initialized");
}

// Hover effects for interactive elements
function setupHoverEffects() {
  const stemOrbs = document.querySelectorAll(".stem-orb");
  const tooltip = document.querySelector(".stem-tooltip");
  
  const tooltipContent = {
    science: {
      title: "Science",
      description: "Exploring the natural world through observation and experimentation"
    },
    technology: {
      title: "Technology",
      description: "Applying scientific knowledge to create innovative solutions"
    },
    engineering: {
      title: "Engineering",
      description: "Designing and building systems that solve real-world problems"
    },
    math: {
      title: "Mathematics",
      description: "The universal language that connects all STEM disciplines"
    }
  };

  stemOrbs.forEach(orb => {
    orb.addEventListener("mouseenter", function() {
      const stemType = this.getAttribute("data-stem");
      
      gsap.to(this, {
        scale: 1.15,
        duration: 0.3,
        ease: "back.out(1.7)"
      });

      const inner = this.querySelector(".orb-inner");
      if (inner) {
        gsap.to(inner, {
          rotation: 10,
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out"
        });
      }

      if (tooltip && tooltipContent[stemType]) {
        const titleEl = tooltip.querySelector(".tooltip-title");
        const descEl = tooltip.querySelector(".tooltip-description");
        
        if (titleEl) titleEl.textContent = tooltipContent[stemType].title;
        if (descEl) descEl.textContent = tooltipContent[stemType].description;

        const orbRect = this.getBoundingClientRect();
        const containerRect = this.closest('.mission-visual').getBoundingClientRect();
        
        tooltip.classList.remove('position-right', 'position-left', 'position-top', 'position-bottom');
        
        const orbCenterX = orbRect.left + orbRect.width / 2 - containerRect.left;
        const orbCenterY = orbRect.top + orbRect.height / 2 - containerRect.top;
        
        let position = 'position-right';
        if (this.classList.contains('stem-science')) {
          position = 'position-bottom';
        } else if (this.classList.contains('stem-tech')) {
          position = 'position-left';
        } else if (this.classList.contains('stem-engineering')) {
          position = 'position-top';
        } else if (this.classList.contains('stem-math')) {
          position = 'position-right';
        }
        
        tooltip.classList.add(position);
        tooltip.style.position = 'absolute';
        tooltip.style.left = orbCenterX + 'px';
        tooltip.style.top = orbCenterY + 'px';

        gsap.to(tooltip, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    orb.addEventListener("mouseleave", function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });

      const inner = this.querySelector(".orb-inner");
      if (inner) {
        gsap.to(inner, {
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }

      if (tooltip) {
        gsap.to(tooltip, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  });

  document.querySelectorAll(".feature-item").forEach(item => {
    item.addEventListener("mouseenter", function() {
      gsap.to(this, { y: -8, scale: 1.02, duration: 0.4, ease: "power2.out" });
      const icon = this.querySelector(".feature-icon");
      if (icon) gsap.to(icon, { rotation: 5, scale: 1.1, duration: 0.3, ease: "power2.out" });
    });

    item.addEventListener("mouseleave", function() {
      gsap.to(this, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
      const icon = this.querySelector(".feature-icon");
      if (icon) gsap.to(icon, { rotation: 0, scale: 1, duration: 0.3, ease: "power2.out" });
    });
  });

  document.querySelectorAll(".stat-item").forEach(item => {
    item.addEventListener("mouseenter", function() {
      gsap.to(this, { y: -5, scale: 1.02, duration: 0.3, ease: "power2.out" });
      const number = this.querySelector(".stat-number");
      if (number) gsap.to(number, { scale: 1.1, duration: 0.3, ease: "back.out(1.7)" });
    });

    item.addEventListener("mouseleave", function() {
      gsap.to(this, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
      const number = this.querySelector(".stat-number");
      if (number) gsap.to(number, { scale: 1, duration: 0.3, ease: "power2.out" });
    });
  });
}

function setupContinuousAnimations() {
  const hubPulse = document.querySelector(".hub-pulse");
  if (hubPulse) {
    gsap.to(hubPulse, {
      scale: 1.2,
      opacity: 0.3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  const ring1 = document.querySelector(".ring-1");
  if (ring1) {
    gsap.to(ring1, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none"
    });
  }

  const ring2 = document.querySelector(".ring-2");
  if (ring2) {
    gsap.to(ring2, {
      rotation: -360,
      duration: 30,
      repeat: -1,
      ease: "none"
    });
  }

  const ring3 = document.querySelector(".ring-3");
  if (ring3) {
    gsap.to(ring3, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: "none"
    });
  }

  const stemScience = document.querySelector(".stem-science");
  if (stemScience) {
    gsap.to(stemScience, {
      y: "+=15",
      rotation: "+=5",
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  const stemTech = document.querySelector(".stem-tech");
  if (stemTech) {
    gsap.to(stemTech, {
      y: "-=10",
      rotation: "-=3",
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  const stemEng = document.querySelector(".stem-engineering");
  if (stemEng) {
    gsap.to(stemEng, {
      y: "+=12",
      rotation: "+=4",
      duration: 3.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  const stemMath = document.querySelector(".stem-math");
  if (stemMath) {
    gsap.to(stemMath, {
      y: "-=8",
      rotation: "-=6",
      duration: 4.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
}

function setupParallaxEffects() {
  ScrollTrigger.create({
    trigger: ".about-us",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      const shape1 = document.querySelector(".about-bg-shape-1");
      const shape2 = document.querySelector(".about-bg-shape-2");
      const shape3 = document.querySelector(".about-bg-shape-3");

      if (shape1) gsap.set(shape1, { x: progress * 100, y: progress * -50, rotation: progress * 180 });
      if (shape2) gsap.set(shape2, { x: progress * -80, y: progress * 60, rotation: progress * -120 });
      if (shape3) gsap.set(shape3, { x: progress * 60, y: progress * -30, rotation: progress * 90 });
    }
  });

  ScrollTrigger.create({
    trigger: ".about-mission",
    start: "top bottom",
    end: "bottom top",
    scrub: 0.5,
    onUpdate: (self) => {
      const progress = self.progress;
      const content = document.querySelector(".about-mission-content");
      const visual = document.querySelector(".mission-visual");
      
      if (content) gsap.set(content, { y: progress * -30 });
      if (visual) gsap.set(visual, { y: progress * 20 });
    }
  });

  const aboutSection = document.querySelector(".about-us");
  if (aboutSection) {
    let rafId;
    
    aboutSection.addEventListener("mousemove", (e) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        document.querySelectorAll(".about-particle").forEach((particle, index) => {
          const intensity = ((index % 3) + 1) * 5;
          gsap.to(particle, {
            x: xPercent * intensity,
            y: yPercent * intensity,
            duration: 0.4,
            ease: "none",
            overwrite: "auto"
          });
        });

        document.querySelectorAll(".stem-orb").forEach((orb, index) => {
          const intensity = ((index % 2) + 1) * 3;
          gsap.to(orb, {
            x: xPercent * intensity,
            y: yPercent * intensity,
            duration: 0.5,
            ease: "none",
            overwrite: "auto"
          });
        });
        
        rafId = null;
      });
    });

    aboutSection.addEventListener("mouseleave", () => {
      gsap.to(".about-particle, .stem-orb", {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power1.out",
        overwrite: "auto"
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAbout);
} else {
  initAbout();
}

async function loadAboutContent() {
  try {
    if (typeof ContentLoader === 'undefined') {
      console.error('ContentLoader not available');
      return;
    }
    
    const aboutData = await ContentLoader.fetchJSON('/src/content/about.json');
    if (!aboutData) {
      console.warn('Failed to load about content');
      return;
    }

    const missionStatement = document.querySelector('.mission-statement');
if (missionStatement) {
  missionStatement.innerHTML = `
    <span class="mission-highlight">Empowering</span>
    <span class="mission-text">our fellow</span>
    <span class="mission-highlight lion-highlight">Lions</span>
    <span class="mission-text">with</span>
    <span class="mission-highlight">STEM opportunities</span>
  `;
}

    const whatWeDoDesc = document.querySelector('.about-left .section-description');
    if (whatWeDoDesc) whatWeDoDesc.textContent = aboutData.whatWeDo;

    const ourImpactDesc = document.querySelector('.about-right .section-description');
    if (ourImpactDesc) ourImpactDesc.textContent = aboutData.ourImpact;

    const featureItems = document.querySelectorAll('.feature-item');
    if (aboutData.features && aboutData.features.length >= 3) {
      aboutData.features.forEach((feature, index) => {
        if (featureItems[index]) {
          const titleEl = featureItems[index].querySelector('h4');
          const descEl = featureItems[index].querySelector('p');
          const iconEl = featureItems[index].querySelector('.feature-icon i');
          
          if (titleEl) titleEl.textContent = feature.title;
          if (descEl) descEl.textContent = feature.description;
          if (iconEl) iconEl.className = feature.icon;
        }
      });
    }

    const statItems = document.querySelectorAll('.stat-item');
    if (aboutData.impactStats && aboutData.impactStats.length >= 4) {
      aboutData.impactStats.forEach((stat, index) => {
        if (statItems[index]) {
          const numberEl = statItems[index].querySelector('.stat-number');
          const labelEl = statItems[index].querySelector('.stat-label');
          const descEl = statItems[index].querySelector('.stat-desc');
          
          if (numberEl) numberEl.textContent = stat.number;
          if (labelEl) labelEl.textContent = stat.label;
          if (descEl) descEl.textContent = stat.description;
        }
      });
    }
  } catch (error) {
    console.error('Error loading about content:', error);
  }
}
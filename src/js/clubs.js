
// Clubs Section JavaScript
// Register GSAP plugins (ensure this is done before any animation)
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function initClubs() {
  loadClubsContent(); // Only call after content is loaded
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClubs);
} else {
  initClubs();
}


function initClubsSection() {
  createClubsParticles();
  initClubsAnimations();
  initClubInteractions();
  initClubsCarousel();
}
function initClubsCarousel() {
  const clubsSection = document.querySelector(".clubs-section");
  if (!clubsSection) return;
  
  const clubCards = document.querySelectorAll(".club-card");
  const clubsGrid = document.querySelector(".clubs-grid");
  const prevBtn = document.querySelector(".clubs-carousel-container .prev-btn");
  const nextBtn = document.querySelector(".clubs-carousel-container .next-btn");
  const indicatorDots = document.querySelector(".clubs-indicator .indicator-dots");
  
  // Refreshing DOM
  if (!clubCards.length || !clubsGrid || !prevBtn || !nextBtn || !indicatorDots) {
    console.warn('Carousel elements not found, retrying...');
    setTimeout(() => {
      initClubsCarousel();
    }, 500);
    return;
  }
  
  let currentSlide = 0;
  let slidesPerView = getClubsSlidesPerView();
  let totalSlides = Math.ceil(clubCards.length / slidesPerView);
  let isAnimating = false;
  
  // Create indicator dots
  createClubIndicatorDots();
  
  // Set initial state for carousel controls
  gsap.set([prevBtn, nextBtn], {
    opacity: 0,
    y: 20
  });
  
  // Add event listeners
  window.addEventListener("resize", handleClubsResize);
  prevBtn.addEventListener("click", goToPrevClubSlide);
  nextBtn.addEventListener("click", goToNextClubSlide);
  
  // Initialize carousel
  updateClubsCarouselState();
  updateClubsVisibility();
  
  function handleClubsResize() {
    const newSlidesPerView = getClubsSlidesPerView();
    
    if (newSlidesPerView !== slidesPerView) {
      slidesPerView = newSlidesPerView;
      totalSlides = Math.ceil(clubCards.length / slidesPerView);
      
      currentSlide = 0;
      updateClubsCarouselState();
      createClubIndicatorDots();
      updateClubsVisibility();
      
      // Reset transform
      gsap.set(clubsGrid, { x: 0 });
    }
  }
  
  function updateClubsVisibility() {
    const slidesPerView = getClubsSlidesPerView();
    
    clubCards.forEach((card, index) => {
      const slideIndex = Math.floor(index / slidesPerView);
      const isVisible = slideIndex === currentSlide;
      
      if (!isVisible && !card.classList.contains('active')) {
        card.style.visibility = 'hidden';
        card.style.opacity = '0';
      } else {
        card.style.visibility = 'visible';
        card.style.opacity = '1';
      }
    });
  }
  
  function createClubIndicatorDots() {
    indicatorDots.innerHTML = "";
    
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("div");
      dot.classList.add("indicator-dot");
      
      gsap.set(dot, {
        opacity: 0,
        scale: 0.5
      });
      
      if (i === currentSlide) {
        dot.classList.add("active");
      }
      
      dot.addEventListener("click", () => {
        if (isAnimating || i === currentSlide) return;
        
        gsap.fromTo(dot, 
          { scale: 1 },
          { 
            scale: 1.2, 
            duration: 0.2, 
            ease: "power2.out",
            onComplete: () => {
              gsap.to(dot, { 
                scale: 1, 
                duration: 0.2, 
                ease: "power2.in" 
              });
            }
          }
        );
        
        currentSlide = i;
        updateClubsCarouselState();
        animateClubsCarousel();
      });
      
      indicatorDots.appendChild(dot);
    }
  }
  
  function animateClubIndicatorDotsEntry() {
    const dots = document.querySelectorAll(".clubs-indicator .indicator-dot");
    
    gsap.to(dots, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: "back.out(1.7)"
    });
  }
  
  function updateActiveClubIndicator() {
    const dots = document.querySelectorAll(".clubs-indicator .indicator-dot");
    
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        if (!dot.classList.contains("active")) {
          dot.classList.add("active");
          
          gsap.fromTo(dot, 
            { scale: 1 },
            { 
              scale: 1.2, 
              duration: 0.2, 
              ease: "power2.out",
              onComplete: () => {
                gsap.to(dot, { 
                  scale: 1, 
                  duration: 0.2, 
                  ease: "power2.in" 
                });
              }
            }
          );
        }
      } else {
        if (dot.classList.contains("active")) {
          gsap.to(dot, {
            scale: 0.9,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
              dot.classList.remove("active");
              gsap.to(dot, { scale: 1, duration: 0.2 });
            }
          });
        } else {
          dot.classList.remove("active");
        }
      }
    });
  }
  
  function goToPrevClubSlide() {
    if (isAnimating || currentSlide === 0) return;
    
    currentSlide--;
    updateClubsCarouselState();
    animateClubsCarousel();
  }
  
  function goToNextClubSlide() {
    if (isAnimating || currentSlide >= totalSlides - 1) return;
    
    currentSlide++;
    updateClubsCarouselState();
    animateClubsCarousel();
  }
  
  function animateClubsCarousel() {
    isAnimating = true;
    
    document.querySelectorAll(".club-card.active").forEach(card => {
      card.classList.remove('active');
    });
    
    const firstCard = clubCards[0];
    if (!firstCard) {
      isAnimating = false;
      return;
    }
    
    const slideWidth = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(clubsGrid).gap) || 32;
    const translateX = -currentSlide * (slideWidth + gap) * slidesPerView;
    
    gsap.to(clubsGrid, {
      x: translateX,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        isAnimating = false;
        updateActiveClubIndicator();
        updateClubsVisibility();
      }
    });
  }
  
  function updateClubsCarouselState() {
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= totalSlides - 1;
    
    prevBtn.style.opacity = prevBtn.disabled ? 0.3 : 1;
    nextBtn.style.opacity = nextBtn.disabled ? 0.3 : 1;
    
    updateActiveClubIndicator();
  }
  
  function getClubsSlidesPerView() {
    const width = window.innerWidth;
    
    if (width <= 768) return 1;
    if (width <= 1200) return 2;
    return 3;
  }
  
  // Trigger animations when carousel comes into view
  ScrollTrigger.create({
    trigger: '.clubs-carousel-container',
    start: 'top 75%',
    onEnter: () => {
      gsap.to([prevBtn, nextBtn], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
      
      animateClubIndicatorDotsEntry();
    },
    once: true
  });
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
  
  // Animate club cards with stagger (for carousel)
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
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.clubs-carousel-container',
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

// Load clubs content from markdown files dynamically
async function loadClubsContent() {
  try {
    const index = await ContentLoader.fetchJSON('/src/content/index.json');
    
    if (!index || !index.clubs) {
      console.error('No clubs found in index');
      return;
    }

    const clubsGrid = document.querySelector('.clubs-grid');
    if (!clubsGrid) return;

    let clubsHTML = '';
    
    for (const filename of index.clubs) {
      const clubData = await ContentLoader.fetchMarkdown(`/src/content/clubs/${filename}`);
      
      if (clubData && clubData.frontmatter) {
        const club = clubData.frontmatter;
        
        let socialLinks = [];
        if (club.socialLinks && Array.isArray(club.socialLinks)) {
          socialLinks = club.socialLinks.map(link => {
            if (typeof link === 'object' && link !== null) {
              return {
                type: link.type || 'Link',
                url: link.url || '#',
                icon: link.icon || 'ri-link'
              };
            }
            return null;
          }).filter(link => link !== null);
        }
        
        const socialLinksHTML = socialLinks.length > 0 ? socialLinks.map(link => 
          `<a href="${link.url}" class="club-link" title="${link.type}" target="_blank" rel="noopener noreferrer">
            <i class="${link.icon}"></i>
          </a>`
        ).join('') : '';

        clubsHTML += `
          <div class="club-card" data-club="${club.name.toLowerCase().replace(/\s+/g, '-')}" data-markdown-file="clubs/${filename}">
            <div class="club-card-inner">
              <div class="club-icon">
                <i class="${club.icon || 'ri-star-line'}"></i>
              </div>
              <h3 class="club-name">${club.name}</h3>
              <p class="club-description">${club.description}</p>
              <div class="club-links">
                ${socialLinksHTML}
              </div>
            </div>
            <div class="club-card-glow"></div>
          </div>
        `;
      }
    }
    
    clubsGrid.innerHTML = clubsHTML;

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));

    if (typeof gsap !== 'undefined') {
      gsap.set('.club-card', { opacity: 0, y: 40, scale: 0.95 });
    }

    // Initialize clubs section with carousel
    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initClubsSection();
        
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    });
  } catch (error) {
    console.error('Error loading clubs content:', error);
  }
}

window.initClubsCarousel = initClubsCarousel;
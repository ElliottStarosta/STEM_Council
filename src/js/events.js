
// Events data will be loaded dynamically from markdown files
let eventsData = [];

// ==========================================
// Events Class
// ==========================================

class EventsManager {
  constructor() {
    this.currentSlide = 0;
    this.currentEventImages = [];
    this.init();
  }

  async init() {
    await this.loadEvents();
    this.renderEvents();
    this.initEventsCarousel(); // Add this line
    this.bindEvents();
    this.initAnimations();
    this.animateEventsParticles();
    // Store instance globally for utility functions
    window.eventsManager = this;
  }

initEventsCarousel() {
  const eventsSection = document.querySelector(".events");
  if (!eventsSection) return;
  
  const eventCards = document.querySelectorAll(".event-card");
  const eventsGrid = document.getElementById("eventsGrid");
  const prevBtn = document.querySelector(".events-carousel-container .prev-btn");
  const nextBtn = document.querySelector(".events-carousel-container .next-btn");
  const indicatorDots = document.querySelector(".events-indicator .indicator-dots");
  
  if (!eventCards.length || !eventsGrid || !prevBtn || !nextBtn || !indicatorDots) {
    console.log('Events carousel elements not found or no events');
    return;
  }
  
  let currentSlide = 0;
  let slidesPerView = getEventsSlidesPerView();
  let totalSlides = Math.ceil(eventCards.length / slidesPerView);
  let isAnimating = false;
  
  // Create indicator dots
  createEventIndicatorDots();
  
  // Set initial state for carousel controls
  gsap.set([prevBtn, nextBtn], {
    opacity: 0,
    y: 20
  });
  
  // Add event listeners
  window.addEventListener("resize", handleEventsResize);
  prevBtn.addEventListener("click", goToPrevEventSlide);
  nextBtn.addEventListener("click", goToNextEventSlide);
  
  // Initialize carousel
  updateEventsCarouselState();
  updateEventsVisibility();
  
  function handleEventsResize() {
    const newSlidesPerView = getEventsSlidesPerView();
    
    if (newSlidesPerView !== slidesPerView) {
      slidesPerView = newSlidesPerView;
      totalSlides = Math.ceil(eventCards.length / slidesPerView);
      
      currentSlide = 0;
      updateEventsCarouselState();
      createEventIndicatorDots();
      updateEventsVisibility();
      
      // Reset transform
      gsap.set(eventsGrid, { x: 0 });
    }
  }
  
  function updateEventsVisibility() {
    eventCards.forEach((card, index) => {
      const slideIndex = Math.floor(index / slidesPerView);
      const isVisible = slideIndex === currentSlide;
      
      if (!isVisible) {
        card.style.visibility = 'hidden';
        card.style.opacity = '0';
      } else {
        card.style.visibility = 'visible';
        card.style.opacity = '1';
      }
    });
  }
  
  function createEventIndicatorDots() {
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
        updateEventsCarouselState();
        animateEventsCarousel();
      });
      
      indicatorDots.appendChild(dot);
    }
  }
  
  function animateEventIndicatorDotsEntry() {
    const dots = document.querySelectorAll(".events-indicator .indicator-dot");
    
    gsap.to(dots, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: "back.out(1.7)"
    });
  }
  
  function updateActiveEventIndicator() {
    const dots = document.querySelectorAll(".events-indicator .indicator-dot");
    
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
  
  function goToPrevEventSlide() {
    if (isAnimating || currentSlide === 0) return;
    
    currentSlide--;
    updateEventsCarouselState();
    animateEventsCarousel();
  }
  
  function goToNextEventSlide() {
    if (isAnimating || currentSlide >= totalSlides - 1) return;
    
    currentSlide++;
    updateEventsCarouselState();
    animateEventsCarousel();
  }
  
  function animateEventsCarousel() {
    isAnimating = true;
    
    const firstCard = eventCards[0];
    if (!firstCard) {
      isAnimating = false;
      return;
    }
    
    const slideWidth = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(eventsGrid).gap) || 32;
    const translateX = -currentSlide * (slideWidth + gap) * slidesPerView;
    
    gsap.to(eventsGrid, {
      x: translateX,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        isAnimating = false;
        updateActiveEventIndicator();
        updateEventsVisibility();
      }
    });
  }
  
  function updateEventsCarouselState() {
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= totalSlides - 1;
    
    prevBtn.style.opacity = prevBtn.disabled ? 0.3 : 1;
    nextBtn.style.opacity = nextBtn.disabled ? 0.3 : 1;
    
    updateActiveEventIndicator();
  }
  
  function getEventsSlidesPerView() {
    const width = window.innerWidth;
    
    if (width <= 768) return 1;
    if (width <= 1200) return 2;
    return 3;
  }
  
  // Trigger animations when carousel comes into view
  ScrollTrigger.create({
    trigger: '.events-carousel-container',
    start: 'top 75%',
    onEnter: () => {
      gsap.to([prevBtn, nextBtn], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
      
      animateEventIndicatorDotsEntry();
    },
    once: true
  });
}

  // Load events from markdown files
  async loadEvents() {
  try {
    const index = await ContentLoader.fetchJSON('/src/content/index.json');
    
    if (!index || !index.events) {
      console.error('No events found in index');
      eventsData = [];
      return;
    }

    const loadedEvents = [];
    let eventId = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const filename of index.events) {
      try {
        const eventData = await ContentLoader.fetchMarkdown(`/src/content/events/${filename}`);

        if (eventData && eventData.frontmatter) {
          const eventEndDate = new Date(eventData.frontmatter.endDate);
          eventEndDate.setHours(23, 59, 59, 999);

          if (eventEndDate < today) {
            console.log(`Skipping past event: ${eventData.frontmatter.name}`);
            continue;
          }

          let imagesFromFrontmatter = [];
          if (eventData.frontmatter.images && Array.isArray(eventData.frontmatter.images)) {
            imagesFromFrontmatter = eventData.frontmatter.images.map(img => {
              if (typeof img === 'object' && img !== null && img.image) {
                return img.image;
              }
              return img;
            }).filter(img => img);
          }

          const normalizedImages = (imagesFromFrontmatter.length > 0)
            ? imagesFromFrontmatter
            : ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'];

          const event = {
            id: eventId++,
            name: eventData.frontmatter.name,
            startDate: eventData.frontmatter.startDate,
            endDate: eventData.frontmatter.endDate,
            description: eventData.body,
            images: normalizedImages,
            filename: filename
          };
          loadedEvents.push(event);
        }
      } catch (fileError) {
        console.error(`Error processing event file ${filename}:`, fileError);
      }
    }

    loadedEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    eventsData = loadedEvents;
    
    // Store globally for admin access
    this.eventsData = eventsData;
    
    console.log(`Loaded ${eventsData.length} upcoming events dynamically:`, eventsData);
  } catch (error) {
    console.error('Error loading events:', error);
    eventsData = [];
  }
}
 convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // Check if it's a Google Drive share link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    // Use the thumbnail/view URL instead of download URL for direct display
    const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
    console.log('Converting Google Drive URL to direct display link:', directUrl);
    return directUrl;
  }
  
  return url;
}



  // Resolve image path - handles both URLs and local paths with fallback
  resolveImagePath(imagePath) {
    const fallback = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
    if (!imagePath || typeof imagePath !== 'string') {
      return fallback;
    }

    imagePath = this.convertGoogleDriveUrl(imagePath);
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it's a relative path, return as is (browser will resolve relative to current page)
    return imagePath;
  }

  // Validate image exists (for local paths)
  async validateImage(imagePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = this.resolveImagePath(imagePath);
    });
  }

  // Format date for display
  formatDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    if (startDate === endDate) {
      return start.toLocaleDateString("en-US", options);
    } else {
      const startFormatted = start.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      const endFormatted = end.toLocaleDateString("en-US", options);
      return `${startFormatted} - ${endFormatted}`;
    }
  }

  // Get preview text (first 100 characters)
  getPreviewText(description) {
    return description.length > 100
      ? description.substring(0, 100) + "..."
      : description;
  }

  // Render events grid
  renderEvents() {
  const eventsGrid = document.getElementById("eventsGrid");
  if (!eventsGrid) return;

  if (!eventsData || eventsData.length === 0) {
    eventsGrid.innerHTML = `
      <div class="no-events-container">
        <div class="no-events-icon">
          <i class="ri-calendar-fill"></i>
        </div>
        <h3 class="no-events-title">No Upcoming Events</h3>
        <p class="no-events-description">
          We're currently planning our next exciting events. Check back soon for updates on workshops, conferences, and networking opportunities!
        </p>
      </div>
    `;
    return;
  }

  eventsGrid.innerHTML = eventsData
    .map(
      (event) => `
    <div class="event-card" data-event-id="${event.id}" data-markdown-file="${event.filename}">
      <img src="${this.resolveImagePath((event.images && event.images[0]) || '')}" alt="${event.name
        }" class="event-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'">
      <div class="event-content">
        <div class="event-date">${this.formatDate(
          event.startDate,
          event.endDate
        )}</div>
        <h3 class="event-name">${event.name}</h3>
        <p class="event-preview">${this.getPreviewText(event.description)}</p>
        <button class="event-view-more">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

  // Bind event listeners
  bindEvents() {
    // Event card clicks
    document.addEventListener("click", (e) => {
      const eventCard = e.target.closest(".event-card");
      if (eventCard) {
        const eventId = parseInt(eventCard.dataset.eventId);
        this.openModal(eventId);
      }
    });

    // Modal close
    const modalClose = document.getElementById("modalClose");
    const modalOverlay = document.getElementById("modalOverlay");

    if (modalClose) {
      modalClose.addEventListener("click", () => this.closeModal());
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", () => this.closeModal());
    }

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });

    // Carousel controls
    const carouselPrev = document.getElementById("carouselPrev");
    const carouselNext = document.getElementById("carouselNext");

    if (carouselPrev) {
      carouselPrev.addEventListener("click", () => this.prevSlide());
    }

    if (carouselNext) {
      carouselNext.addEventListener("click", () => this.nextSlide());
    }
  }

  // Open modal with event details
  openModal(eventId) {
    const event = eventsData.find((e) => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById("eventModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDate = document.getElementById("modalDate");
    const modalDescription = document.getElementById("modalDescription");

    if (!modal || !modalTitle || !modalDate || !modalDescription) return;

    // Populate modal content
    modalTitle.textContent = event.name;
    modalDate.textContent = this.formatDate(event.startDate, event.endDate);
    modalDescription.innerHTML = event.description
      .split("\n")
      .map((p) => `<p>${p}</p>`)
      .join("");

    // Setup carousel
    this.currentEventImages = event.images;
    this.currentSlide = 0;
    this.renderCarousel();

    // Hide header when modal opens
    const header = document.querySelector(".header");
    if (header && typeof gsap !== "undefined") {
      gsap.to(header, {
        duration: 0.4,
        y: -120,
        ease: "power3.out",
      });
    }

    // Hide scroll-to-top button when modal opens
    const scrollToTop = document.getElementById("scrollToTop");
    if (scrollToTop) {
      scrollToTop.style.display = "none";
    }

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // GSAP animation
    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        ".modal-content",
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById("eventModal");
    if (!modal) return;

    if (typeof gsap !== "undefined") {
      gsap.to(".modal-content", {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          modal.classList.remove("active");
          document.body.style.overflow = "";

          // Show header when modal closes
          const header = document.querySelector(".header");
          if (header) {
            gsap.to(header, {
              duration: 0.5,
              y: 0,
              ease: "back.out(1.2)",
            });
          }

          // Show scroll-to-top button when modal closes
          const scrollToTop = document.getElementById("scrollToTop");
          if (scrollToTop) {
            scrollToTop.style.display = "flex";
          }
        },
      });
    } else {
      modal.classList.remove("active");
      document.body.style.overflow = "";

      // Show header when modal closes (fallback without GSAP)
      const header = document.querySelector(".header");
      if (header) {
        header.style.transform = "translateY(0)";
      }

      // Show scroll-to-top button when modal closes (fallback)
      const scrollToTop = document.getElementById("scrollToTop");
      if (scrollToTop) {
        scrollToTop.style.display = "flex";
      }
    }
  }

  // Render carousel
  renderCarousel() {
    const carouselSlides = document.getElementById("carouselSlides");
    const carouselDots = document.getElementById("carouselDots");
    const carouselPrev = document.getElementById("carouselPrev");
    const carouselNext = document.getElementById("carouselNext");

    if (!carouselSlides || !carouselDots) return;

    // Render slides with fallback images
    carouselSlides.innerHTML = this.currentEventImages
      .map(
        (image) => `
      <div class="carousel-slide">
        <img src="${this.resolveImagePath(
          image
        )}" alt="Event image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'">
      </div>
    `
      )
      .join("");

    // Render dots
    carouselDots.innerHTML = this.currentEventImages
      .map(
        (_, index) => `
      <div class="carousel-dot ${index === 0 ? "active" : ""
          }" data-slide="${index}"></div>
    `
      )
      .join("");

    // Bind dot clicks
    carouselDots.addEventListener("click", (e) => {
      if (e.target.classList.contains("carousel-dot")) {
        this.goToSlide(parseInt(e.target.dataset.slide));
      }
    });

    // Hide/show nav buttons based on number of images
    const hasMultiple = this.currentEventImages.length > 1;
    if (carouselPrev) carouselPrev.style.display = hasMultiple ? "flex" : "none";
    if (carouselNext) carouselNext.style.display = hasMultiple ? "flex" : "none";

    this.updateCarousel();
  }

  // Update carousel position
  updateCarousel() {
    const carouselSlides = document.getElementById("carouselSlides");
    const dots = document.querySelectorAll(".carousel-dot");

    if (carouselSlides) {
      carouselSlides.style.transform = `translateX(-${this.currentSlide * 100
        }%)`;
    }

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentSlide);
    });
  }

  // Go to specific slide
  goToSlide(slideIndex) {
    this.currentSlide = slideIndex;
    this.updateCarousel();
  }

  // Previous slide
  prevSlide() {
    this.currentSlide =
      this.currentSlide > 0
        ? this.currentSlide - 1
        : this.currentEventImages.length - 1;
    this.updateCarousel();
  }

  // Next slide
  nextSlide() {
    if (this.currentEventImages.length <= 1) return;
    this.currentSlide =
      this.currentSlide < this.currentEventImages.length - 1
        ? this.currentSlide + 1
        : 0;
    this.updateCarousel();
  }

  // Initialize GSAP animations
  initAnimations() {
    if (typeof gsap === "undefined") return;

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Animate header
    // gsap.fromTo(
    //   ".events-eve",
    //   { opacity: 0,
    //     y: 50,
    //     scale:0.95,
    //     rotateX: 40,
    //     transformOrigin: "top center"
    //   },
    //   {
    //     opacity: 1,
    //     y: 0,
    //     duration: 0.8,
    //     ease: "power4.out",
    //     scrollTrigger: {
    //       trigger: ".events-header",
    //       start: "top 85%",
    //       end: "bottom 20%",
    //       toggleActions: 'play none none reverse',
    //     },
    //   }
    // );
    const headerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".events-header",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    headerTimeline
      .from(".events-title", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      })
      .from(
        ".events-subtitle",
        {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.4"
      );

    // Animate event cards
    const eventCards = document.querySelectorAll(".event-card");
    eventCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Hover animations for event cards
    eventCards.forEach((card) => {
      const image = card.querySelector(".event-image");
      const viewMore = card.querySelector(".event-view-more");

      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -8, duration: 0.3, ease: "power2.out" });
        gsap.to(image, { scale: 1.05, duration: 0.4, ease: "power2.out" });
        gsap.to(viewMore, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
        gsap.to(image, { scale: 1, duration: 0.4, ease: "power2.out" });
        gsap.to(viewMore, {
          opacity: 0,
          x: 20,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }

  // Animate events particles
  animateEventsParticles() {
    const particles = document.querySelectorAll(".events .particle");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            particles.forEach((particle, index) => {
              setTimeout(() => {
                particle.style.opacity = "1";
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const eventsSection = document.querySelector(".events");
    if (eventsSection) {
      observer.observe(eventsSection);
    }
  }
}

// ==========================================
// Initialize Events Manager
// ==========================================

function initEvents() {
  new EventsManager();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEvents);
} else {
  initEvents();
}

// Make carousel initialization accessible for admin updates
if (window.eventsManager) {
  window.initEventsCarousel = function() {
    if (window.eventsManager && typeof window.eventsManager.initEventsCarousel === 'function') {
      window.eventsManager.initEventsCarousel();
    }
  };
}
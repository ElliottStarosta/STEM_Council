
const eventsData = [
  {
    id: 1,
    name: "Summer Tech Conference 2025",
    startDate: "2025-07-15",
    endDate: "2025-07-17",
    description:
      "Join us for three days of cutting-edge technology discussions, networking opportunities, and hands-on workshops. This premier event brings together industry leaders, developers, and innovators from around the world to share insights on the latest trends in artificial intelligence, blockchain, and sustainable technology solutions. Experience keynote presentations from top tech executives, participate in interactive coding sessions, and connect with like-minded professionals who are shaping the future of technology.",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551818255-e6e10975cd17?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop",
    ],
  },
  {
    id: 2,
    name: "Green Innovation Workshop",
    startDate: "2025-08-05",
    endDate: "2025-08-05",
    description:
      "Discover sustainable solutions and eco-friendly technologies that are revolutionizing industries worldwide. This intensive one-day workshop focuses on practical applications of green technology, renewable energy systems, and sustainable business practices. Learn from environmental experts and successful entrepreneurs who have built thriving businesses while maintaining a commitment to environmental responsibility. Network with fellow eco-conscious professionals and explore opportunities for collaboration in the growing green economy.",
    images: [
      "src/images/green-workshop-1.jpg",
      "src/images/green-workshop-2.jpg",
    ],
  },
  {
    id: 3,
    name: "Digital Marketing Masterclass",
    startDate: "2025-08-20",
    endDate: "2025-08-22",
    description:
      "Master the art of digital marketing with comprehensive training sessions covering social media strategy, content creation, SEO optimization, and data analytics. This three-day intensive program is designed for marketing professionals, business owners, and entrepreneurs looking to enhance their digital presence and drive meaningful engagement with their target audience. Learn from industry experts who have successfully managed campaigns for Fortune 500 companies and emerging startups alike.",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      "src/images/marketing-class.png",
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=400&fit=crop",
    ],
  },
  {
    id: 4,
    name: "AI & Machine Learning Summit",
    startDate: "2025-09-10",
    endDate: "2025-09-12",
    description:
      "Explore the latest developments in artificial intelligence and machine learning with leading researchers and practitioners in the field. This summit features deep-dive technical sessions, case studies from successful AI implementations, and discussions about the ethical implications of AI technology. Whether you're a data scientist, software engineer, or business leader, you'll gain valuable insights into how AI is transforming industries and creating new opportunities for innovation and growth.",
    images: [
      "src/images/ai-summit/main.jpg",
      "src/images/ai-summit/speakers.png",
    ],
  },
  {
    id: 5,
    name: "Startup Pitch Competition",
    startDate: "2025-10-01",
    endDate: "2025-10-01",
    description:
      "Watch innovative startups present their groundbreaking ideas to a panel of experienced investors and industry experts. This exciting competition showcases the most promising new ventures across various sectors including fintech, healthtech, edtech, and sustainable technology. Entrepreneurs will have the opportunity to secure funding, gain valuable feedback, and connect with potential partners and mentors. Join us for an inspiring day of innovation, entrepreneurship, and the future of business.",
    images: [
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      "src/images/startup-pitch.jpg",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop",
    ],
  },
  {
    id: 6,
    name: "Cybersecurity Best Practices",
    startDate: "2025-10-25",
    endDate: "2025-10-26",
    description:
      "Learn essential cybersecurity strategies and best practices to protect your organization from evolving digital threats. This comprehensive two-day program covers threat assessment, incident response, security architecture, and compliance requirements. Expert instructors will guide you through hands-on exercises, real-world case studies, and the latest security tools and technologies. Perfect for IT professionals, security officers, and business leaders who need to understand and implement effective cybersecurity measures.",
    images: [
      "src/images/cybersecurity/workshop.png",
      "src/images/cybersecurity/lab.jpg",
    ],
  },
];

// const eventsData = [];

// ==========================================
// Events Class
// ==========================================

class EventsManager {
  constructor() {
    this.currentSlide = 0;
    this.currentEventImages = [];
    this.init();
  }

  init() {
    this.renderEvents();
    this.bindEvents();
    this.initAnimations();
    this.animateEventsParticles();
    // Store instance globally for utility functions
    window.eventsManager = this;
  }

  // Resolve image path - handles both URLs and local paths
  resolveImagePath(imagePath) {
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

    // Check if eventsData is empty or undefined
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
      <div class="event-card" data-event-id="${event.id}">
        <img src="${this.resolveImagePath(event.images[0])}" alt="${
          event.name
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
  }
}
  // Render carousel
  renderCarousel() {
    const carouselSlides = document.getElementById("carouselSlides");
    const carouselDots = document.getElementById("carouselDots");

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
      <div class="carousel-dot ${
        index === 0 ? "active" : ""
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

    this.updateCarousel();
  }

  // Update carousel position
  updateCarousel() {
    const carouselSlides = document.getElementById("carouselSlides");
    const dots = document.querySelectorAll(".carousel-dot");

    if (carouselSlides) {
      carouselSlides.style.transform = `translateX(-${
        this.currentSlide * 100
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

document.addEventListener("DOMContentLoaded", () => {
  new EventsManager();
});

document.addEventListener("DOMContentLoaded", function () {
  // Register GSAP and ScrollToPlugin at the top
  if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollToPlugin);
  }

  // Initialize GSAP timeline with enhanced settings
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Set initial states explicitly with more dramatic starting positions
  gsap.set(".header", { y: -120, opacity: 1 });
  gsap.set(".logo-main", { opacity: 1, x: 0, y: 0, scale: 1 }); // Make sure logo is visible
  gsap.set(".logo-subtitle", { opacity: 0.8, x: 0, y: 0, scale: 1 }); // Make subtitle semi-visible

  // Set up desktop nav animation BEFORE main timeline (desktop only)
  if (window.innerWidth > 768) {
    gsap.set(".nav-list .nav-item", { opacity: 1, y: 0, scale: 1 }); // Start visible for desktop
  }

  // Set hamburger menu initial state - ensure it's visible on mobile
  if (window.innerWidth <= 768) {
    gsap.set(".hamburger", { opacity: 1, scale: 1, rotation: 0 });
  } else {
    gsap.set(".hamburger", { opacity: 0, scale: 0, rotation: 0 });
  }

  // Enhanced Header entrance animation - simplified to avoid conflicts
  tl.to(".header", {
    duration: 1.2,
    y: 0,
    ease: "power4.out",
  })
    .from(
      ".logo-main",
      {
        duration: 1.0,
        x: -80,
        opacity: 0,
        scale: 0.8,
        ease: "power3.out",
      },
      "-=0.8"
    )
    .to(
      ".logo-subtitle",
      {
        duration: 0.8,
        opacity: 0.8, // Keep it visible
        ease: "power3.out",
      },
      "-=0.4"
    );

  // Only animate hamburger on desktop (hide it)
  if (window.innerWidth > 768) {
    tl.to(".hamburger", {
      duration: 0.6,
      scale: 0,
      opacity: 0,
      rotation: 180,
      ease: "back.out(2.5)",
    }, "-=0.4");
  } else {
    // On mobile, ensure hamburger is visible
    tl.to(".hamburger", {
      duration: 0.6,
      scale: 1,
      opacity: 1,
      rotation: 0,
      ease: "back.out(2.5)",
    }, "-=0.4");
  }

  // Enhanced Desktop nav items animation - ensure they stay visible
  if (window.innerWidth > 768) {
    tl.from(
      ".nav-list .nav-item",
      {
        duration: 0.7,
        opacity: 0,
        y: 30,
        scale: 0.9,
        stagger: {
          amount: 0.4,
          ease: "power2.out",
        },
        ease: "back.out(1.5)",
      },
      "-=0.5"
    );
  }

  // Hamburger menu functionality
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const navItems = document.querySelectorAll(".nav-item");
  const body = document.body;

  hamburger.addEventListener("click", function () {
    const isOpen = hamburger.classList.contains("active");

    if (!isOpen) {
      // Open menu with enhanced animation
      hamburger.classList.add("active");
      nav.classList.add("mobile-open");
      body.classList.add("menu-open");
      body.style.overflow = "hidden";

      // Enhanced menu items animation
      gsap.set(".nav-item", { opacity: 0, y: 50, scale: 0.8, rotationX: -30 });
      gsap.to(".nav-item", {
        duration: 0.8,
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        stagger: {
          amount: 0.5,
          ease: "power2.out",
        },
        delay: 0.2,
        ease: "back.out(1.3)",
      });

      // Enhanced background animation
      gsap.fromTo(
        ".nav.mobile-open",
        { opacity: 0, scale: 0.95 },
        {
          duration: 0.5,
          opacity: 1,
          scale: 1,
          ease: "power3.out",
        }
      );
    } else {
      // Enhanced close animation
      gsap.to(".nav-item", {
        duration: 0.4,
        opacity: 0,
        y: -30,
        scale: 0.9,
        rotationX: 15,
        stagger: {
          amount: 0.2,
          ease: "power2.in",
        },
        ease: "power2.in",
        onComplete: function () {
          hamburger.classList.remove("active");
          nav.classList.remove("mobile-open");
          body.classList.remove("menu-open");
          body.style.overflow = "";

          // Reset nav items to visible state for desktop
          if (window.innerWidth > 768) {
            gsap.set(".nav-list .nav-item", { opacity: 1, y: 0, scale: 1 });
          }
        },
      });
    }
  });

  // Close menu when clicking nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (nav.classList.contains("mobile-open")) {
        hamburger.click();
      }
    });
  });

  // Close menu when clicking outside
  nav.addEventListener("click", function (e) {
    if (e.target === nav && nav.classList.contains("mobile-open")) {
      hamburger.click();
    }
  });

  // Enhanced Logo hover animations
  const logo = document.querySelector(".logo");
  const logoMain = document.querySelector(".logo-main");
  const logoSubtitle = document.querySelector(".logo-subtitle");

  logo.addEventListener("mouseenter", function () {
    // Enhanced main logo animation
    gsap.to(logoMain, {
      duration: 0.6,
      y: -12,
      scale: 1.08,
      rotationY: 8,
      ease: "back.out(1.5)",
    });

    // Enhanced subtitle animation
    gsap.to(logoSubtitle, {
      duration: 0.5,
      opacity: 0.9,
      y: -6,
      scale: 1.15,
      ease: "back.out(1.3)",
    });

    // Enhanced pulse effect
    gsap.to(logo, {
      duration: 0.15,
      scale: 1.03,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    });
  });

  logo.addEventListener("mouseleave", function () {
    gsap.to([logoMain, logoSubtitle], {
      duration: 0.6,
      scale: 1,
      rotationY: 0,
      x: 0,
      y: 0,
      ease: "power3.out",
    });

    // Keep subtitle visible
    gsap.to(logoSubtitle, {
      duration: 0.6,
      opacity: 0.8,
      ease: "power3.out",
    });
  });

  // Enhanced Navigation items animations (desktop only)
  function addDesktopHoverEffects() {
    if (window.innerWidth > 768) {
      navItems.forEach((item) => {
        item.addEventListener("mouseenter", function () {
          // Don't animate if this item is active
          if (!item.querySelector(".nav-link.active")) {
            gsap.to(item, {
              duration: 0.4,
              y: -3,
              scale: 1.02,
              ease: "back.out(1.5)",
            });
          }
        });

        item.addEventListener("mouseleave", function () {
          if (!item.querySelector(".nav-link.active")) {
            gsap.to(item, {
              duration: 0.4,
              y: 0,
              scale: 1,
              ease: "power2.out",
            });
          }
        });
      });
    }
  }

  addDesktopHoverEffects();

  // Enhanced Navigation link click handlers - now handled by universal scrolling.js
  // Active state management for header nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Remove active class from all links and their parent items
      navLinks.forEach((l) => {
        l.classList.remove("active");
        l.parentElement.classList.remove("active-item");
      });

      // Add active class to clicked link and parent item
      this.classList.add("active");
      this.parentElement.classList.add("active-item");

      // Reset any hover transforms when item becomes active
      gsap.set(this.parentElement, {
        y: 0,
        scale: 1,
      });
    });
  });

  // FIXED: Enhanced Header scroll effect with proper tracking
  let lastScrollY = window.scrollY;
  let headerHidden = false;
  let scrollToTopButton = document.getElementById("scrollToTop");
  let isScrollingDown = false;
  let scrollDownDistance = 0;
  let hideThreshold = 100; // Distance to scroll down before hiding
  let showThreshold = 20; // Distance to scroll up before showing

  window.addEventListener("scroll", function () {
    const currentScrollY = window.scrollY;
    const header = document.querySelector(".header");
    const scrollDelta = currentScrollY - lastScrollY;

    // Skip if mobile menu is open
    if (nav.classList.contains("mobile-open")) {
      lastScrollY = currentScrollY;
      return;
    }

    // Determine scroll direction
    if (scrollDelta > 0) {
      // Scrolling down
      if (!isScrollingDown) {
        isScrollingDown = true;
        scrollDownDistance = 0;
      }
      scrollDownDistance += scrollDelta;

      // Hide header after scrolling down the threshold distance
      if (scrollDownDistance >= hideThreshold && !headerHidden && currentScrollY > 50) {
        gsap.to(header, {
          duration: 0.4,
          y: -120,
          ease: "power3.out",
        });
        headerHidden = true;
      }
    } else if (scrollDelta < 0) {
      // Scrolling up
      if (isScrollingDown) {
        isScrollingDown = false;
        scrollDownDistance = 0;
      }

      // Show header immediately when scrolling up more than threshold OR when near top
      if ((Math.abs(scrollDelta) >= showThreshold || currentScrollY <= 100) && headerHidden) {
        gsap.to(header, {
          duration: 0.5,
          y: 0,
          ease: "back.out(1.2)",
        });
        headerHidden = false;
        
        // Hide scroll to top button when header appears
        if (scrollToTopButton) {
          scrollToTopButton.classList.remove("visible");
        }
      }
    }

    // Always show header at the very top
    if (currentScrollY <= 10 && headerHidden) {
      gsap.to(header, {
        duration: 0.5,
        y: 0,
        ease: "back.out(1.2)",
      });
      headerHidden = false;
      
      // Hide scroll to top button when at the top
      if (scrollToTopButton) {
        scrollToTopButton.classList.remove("visible");
      }
    }

    // Scroll to top button visibility - inverse relationship with header
    if (scrollToTopButton) {
      if (currentScrollY > 300 && headerHidden) {
        scrollToTopButton.classList.add("visible");
      } else if (!headerHidden) {
        scrollToTopButton.classList.remove("visible");
      }
    }

    lastScrollY = currentScrollY;
  });

  // Scroll to top functionality
  if (scrollToTopButton) {
    scrollToTopButton.addEventListener("click", function () {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: 0 },
        ease: "power3.out"
      });
    });
  }

  // Enhanced Hamburger hover effect
  hamburger.addEventListener("mouseenter", function () {
    gsap.to(hamburger, {
      duration: 0.3,
      scale: 1.15,
      rotation: 5,
      ease: "back.out(1.5)",
    });
  });

  hamburger.addEventListener("mouseleave", function () {
    gsap.to(hamburger, {
      duration: 0.3,
      scale: 1,
      rotation: 0,
      ease: "power2.out",
    });
  });

  // Enhanced window resize handler
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && nav.classList.contains("mobile-open")) {
      // Enhanced close animation on resize
      gsap.to(".nav-item", {
        duration: 0.3,
        opacity: 0,
        scale: 0.8,
        onComplete: function () {
          hamburger.classList.remove("active");
          nav.classList.remove("mobile-open");
          body.classList.remove("menu-open");
          body.style.overflow = "";

          // Reset nav items for desktop - ensure they're visible
          gsap.set(".nav-list .nav-item", { opacity: 1, y: 0, scale: 1 });
          // Hide hamburger on desktop
          gsap.set(".hamburger", { opacity: 0, scale: 0 });
        },
      });
    } else if (window.innerWidth > 768) {
      // Ensure nav items are visible on desktop
      gsap.set(".nav-list .nav-item", { opacity: 1, y: 0, scale: 1 });
      // Hide hamburger on desktop
      gsap.set(".hamburger", { opacity: 0, scale: 0 });
    } else {
      // Show hamburger on mobile
      gsap.set(".hamburger", { opacity: 1, scale: 1 });
    }
  });

  // Enhanced page load entrance sequence
  gsap.fromTo(
    "body",
    { opacity: 0 },
    {
      duration: 0.8,
      opacity: 1,
      ease: "power2.out",
      delay: 0.2,
    }
  );

  // Function to check and set hamburger menu visibility based on screen size
  function setHamburgerVisibility() {
    if (window.innerWidth <= 768) {
      gsap.set(".hamburger", { opacity: 1, scale: 1, rotation: 0 });
    } else {
      gsap.set(".hamburger", { opacity: 0, scale: 0, rotation: 0 });
    }
  }

  // Call this function on page load and after a short delay to ensure proper state
  setHamburgerVisibility();
  setTimeout(setHamburgerVisibility, 100);
  setTimeout(setHamburgerVisibility, 500);
});
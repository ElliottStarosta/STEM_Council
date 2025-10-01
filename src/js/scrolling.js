// Universal Smooth Scrolling Function
// This function can be used for any link with href="#section-id" across the entire site

document.addEventListener("DOMContentLoaded", function () {

  
  // Small delay to ensure all scripts are loaded
  setTimeout(() => {
    // Register GSAP and ScrollToPlugin
    if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
      gsap.registerPlugin(ScrollToPlugin);
    }

  // Universal smooth scroll function
  function performSmoothScroll(targetSection, targetId, clickedLink) {
    // Get header height for offset
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Enhanced click animation for the clicked link
    gsap.to(clickedLink, {
      duration: 0.2,
      scale: 0.92,
      ease: "power2.out",
      onComplete: function () {
        gsap.to(this.targets()[0], {
          duration: 0.3,
          scale: 1,
          ease: "back.out(1.3)",
        });
      },
    });

    const scrollElement = document.scrollingElement || document.documentElement;

    // Use GSAP ScrollToPlugin for smooth scrolling
    if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
      gsap.to(scrollElement, {
        duration: 1.2,
        scrollTo: {
          y: targetSection,
          offsetY: headerHeight + 20,
          autoKill: true
        },
        ease: 'power2.inOut',
        overwrite: 'auto',
        onComplete: () => {
          // Update URL hash
          if (history.pushState) {
            history.pushState(null, null, `#${targetId}`);
          }
        }
      });
    } else {
      // Fallback if GSAP ScrollToPlugin isn't available
      console.warn("GSAP ScrollToPlugin not available, using fallback");
      const targetPosition = targetSection.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
      // Update URL
      if (history.pushState) {
        history.pushState(null, null, `#${targetId}`);
      }
    }
  }

  // Find all links with href starting with # (section links)
  const sectionLinks = document.querySelectorAll('a[href^="#"]');
  
  sectionLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Get target section
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (!targetSection) {
        console.warn(`Section with id "${targetId}" not found`);
        return;
      }

      // Handle mobile menu closing if it's open
      const nav = document.querySelector(".nav");
      const hamburger = document.querySelector(".hamburger");
      
      if (nav && nav.classList.contains("mobile-open") && hamburger) {
        hamburger.click();

        // Wait for mobile menu to close before scrolling
        setTimeout(() => {
          performSmoothScroll(targetSection, targetId, this);
        }, 500);
      } else {
        performSmoothScroll(targetSection, targetId, this);
      }
    });
  });



  // Optional: Scroll to hash on page load
  const hash = window.location.hash;
  if (hash && document.querySelector(hash)) {
    setTimeout(() => {
      const header = document.querySelector('.header');
      const headerHeight = header ? header.offsetHeight : 0;
      if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
        gsap.to(window, {
          duration: 1.2,
          scrollTo: {
            y: hash,
            offsetY: headerHeight + 20,
            autoKill: true
          },
          ease: 'power2.inOut',
          overwrite: 'auto'
        });
      }
    }, 500); // Wait for layout/animations to finish
  }
  }, 100); // Small delay to ensure all scripts are loaded
}); 
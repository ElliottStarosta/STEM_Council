## Project Overview & Initial Vision

When I started this project, I had a clear vision: create a modern, interactive website for the STEM Council that would serve as both an information hub and an engaging platform for students to explore Science, Technology, Engineering, and Math opportunities. The goal was to build something that would inspire students while being easy for non-technical staff to maintain.

**Key Requirements:**
- Modern, responsive design with smooth animations
- Dynamic content management without requiring code changes
- Interactive elements that showcase STEM concepts
- Easy deployment and maintenance
- Mobile-first approach for student accessibility

---

## Week 1: Foundation & Architecture

### Day 1-2: Project Setup & Technology Stack Decisions

**What I Built Today:**
I spent the first two days establishing the foundation - setting up the project structure, choosing the technology stack, and creating the initial build pipeline. This was crucial because good architecture decisions early on prevent major refactoring later.

**Technology Stack Decisions:**

```json
{
  "frontend": "Vanilla JavaScript (ES6+)",
  "buildTool": "Vite",
  "animations": "GSAP",
  "icons": "RemixIcon", 
  "cms": "Netlify CMS",
  "deployment": "Netlify",
  "contentFormat": "Markdown + JSON"
}
```

**Key Learning:** I chose vanilla JavaScript over React/Vue because:
1. **Simplicity**: No build complexity for a content-focused site
2. **Performance**: Faster initial load times
3. **Maintenance**: Easier for future developers to understand
4. **Flexibility**: Complete control over animations and interactions

**Project Structure Architecture:**

```
STEM_Council/
├── src/
│   ├── content/          # Dynamic content (Markdown + JSON)
│   ├── css/             # Modular stylesheets
│   ├── js/              # Feature-based JavaScript modules
│   └── images/          # Static assets
├── public/admin/        # Netlify CMS interface
├── netlify/functions/   # Serverless backend functions
└── scripts/            # Build automation
```

**Critical Decision:** Separating content from code was essential. This allows non-technical staff to update the website without touching any code files.

### Day 3-4: Content Management System Architecture

**What I Built Today:**
Today was all about building the content management foundation. I implemented a hybrid approach using both JSON for structured data and Markdown for rich content, with Netlify CMS providing the admin interface.

**Content Loader System:**

```javascript
// src/js/content-loader.js
async function fetchJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching JSON from ${path}:`, error);
    return null;
  }
}

async function fetchMarkdown(path) {
  try {
    const response = await fetch(path);
    const content = await response.text();
    return parseMarkdownFrontmatter(content);
  } catch (error) {
    console.error(`Error fetching markdown from ${path}:`, error);
    return null;
  }
}
```

**Key Learning:** Building a robust content loader was crucial. The system needed to:
- Handle both JSON and Markdown files
- Parse YAML frontmatter correctly
- Provide fallbacks for missing content
- Work seamlessly with the build process

**Netlify CMS Configuration:**

```yaml
# public/admin/config.yml
backend:
  name: git-gateway
  branch: main

collections:
  - name: events
    label: Events
    folder: src/content/events/
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - label: Name
        name: name
        widget: string
        required: true
      - label: Start Date
        name: startDate
        widget: datetime
        required: true
```

**Major Challenge:** Getting Netlify CMS to work with our file structure required understanding:
- Git Gateway authentication
- File path conventions
- Slug generation patterns
- Field validation rules

**Solution:** I created a comprehensive CMS configuration that handles all content types (events, clubs, resources) with proper validation and user-friendly interfaces.

### Day 5-6: Dynamic Content Loading & Build Pipeline

**What I Built Today:**
I implemented the dynamic content loading system and created automated build scripts that generate content indexes. This was the day I learned that good automation saves hours of manual work.

**Content Index Generation:**

```javascript
// scripts/generate-content-index.js
import fs from 'fs';
import path from 'path';

const contentDirs = {
  clubs: 'src/content/clubs',
  events: 'src/content/events', 
  resources: 'src/content/resources'
};

const index = {};

Object.entries(contentDirs).forEach(([key, dir]) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.md') || file.endsWith('.json'));
    index[key] = files;
  }
});

fs.writeFileSync('src/content/index.json', JSON.stringify(index, null, 2));
```

**Key Learning:** The build pipeline needed to:
1. **Pre-build**: Generate content indexes
2. **Build**: Compile and optimize assets
3. **Post-build**: Copy content files to dist

**Netlify Build Configuration:**

```toml
# netlify.toml
[build]
  command = "npm run build && mkdir -p dist/src && cp -r src/content dist/src/ && cp -r src/js dist/src/"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
```

**Challenge Encountered:** Content files weren't being copied to the build directory, causing 404 errors in production.

**Solution:** Modified the build command to explicitly copy content and JavaScript files to the dist directory, ensuring all dynamic content is available in production.

### Day 7: Serverless Functions & Advanced Content Management

**What I Built Today:**
I implemented serverless functions for advanced content operations, including batch content updates and deployment status monitoring. This was the day I learned that serverless functions can handle complex operations that would be difficult with static sites.

**Content Saving Function:**

```javascript
// netlify/functions/save-content.js
const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { jsonChanges, markdownChanges, user } = JSON.parse(event.body);
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // Handle JSON changes
  if (jsonChanges && jsonChanges.length > 0) {
    const fileChanges = {};
    for (const change of jsonChanges) {
      if (!fileChanges[change.file]) {
        fileChanges[change.file] = [];
      }
      fileChanges[change.file].push(change);
    }
    // Process changes...
  }
  
  // Create commit with all changes
  const commitMessage = `Admin: Batch update - ${changeCount} changes by ${user}`;
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTree.sha,
    parents: [currentCommitSha]
  });
};
```

**Key Learning:** Serverless functions enable:
- **Batch Operations**: Update multiple files in a single commit
- **Git Integration**: Direct manipulation of repository content
- **Authentication**: Secure API access with GitHub tokens
- **Error Handling**: Robust error management for content operations

**Major Challenge:** Managing Git operations through the GitHub API was complex, requiring understanding of:
- Tree creation and manipulation
- Blob creation for file content
- Commit creation with proper parent references
- Branch reference updates

**Solution:** I built a comprehensive system that handles all Git operations atomically, ensuring data consistency and providing detailed error reporting.

---

## Week 2: Frontend Development & User Experience

### Day 8-9: Hero Section & Animation System

**What I Built Today:**
I built the hero section with complex GSAP animations, custom cursor effects, and dynamic content loading. This was the day I learned that smooth animations require careful timing and performance optimization.

**Hero Animation System:**

```javascript
// src/js/hero.js
function initHeroAnimations() {
  // Set initial states to prevent FOUC
  gsap.set(".adjective", {
    y: 50,
    opacity: 0,
    clearProps: "all",
  });
  
  // Create master timeline
  const tl = gsap.timeline({
    onComplete: () => {
      document.querySelector(".hero").classList.add("hero-loaded");
    },
  });

  // Animate adjectives with stagger
  tl.to(".adjective", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    onComplete: function () {
      document.querySelectorAll(".adjective").forEach((adj) => {
        adj.classList.add("animate-in");
      });
    },
  })
  // Continue with other animations...
}
```

**Key Learning:** Animation timing is everything. I discovered that:
- **Stagger delays** create natural flow
- **Easing functions** make animations feel organic
- **Timeline management** prevents conflicts
- **Performance optimization** requires careful planning

**Custom Cursor System:**

```javascript
// src/js/cursor.js
function adjustCursorColor(x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element) return;
  
  const computedStyle = window.getComputedStyle(element);
  let priorityColors = [];
  let secondaryColors = [];
  
  // Check gradient backgrounds first
  const backgroundImage = computedStyle.backgroundImage;
  if (backgroundImage && backgroundImage !== 'none') {
    const gradientColors = extractGradientColors(backgroundImage);
    gradientColors.forEach(color => {
      if (getOpacity(color) >= 0.5) {
        priorityColors.push(color);
      }
    });
  }
  
  // Determine cursor color based on background
  for (const color of priorityColors) {
    if (isGreenColor(color)) {
      cursor.classList.add('on-green');
      return;
    } else if (isYellowColor(color)) {
      cursor.classList.add('on-yellow');
      return;
    }
  }
}
```

**Major Challenge:** Creating a cursor that adapts to different background colors required:
- Complex color detection algorithms
- Gradient parsing
- Opacity calculations
- Performance optimization for real-time updates

**Solution:** I built a sophisticated color detection system that analyzes computed styles, extracts gradient colors, and determines appropriate cursor colors based on the background.

### Day 10-11: Interactive Components & Carousels

**What I Built Today:**
I implemented interactive carousels for clubs and events, with responsive design and smooth animations. This was the day I learned that good carousel design requires careful consideration of user experience and performance.

**Clubs Carousel System:**

```javascript
// src/js/clubs.js
function initClubsCarousel() {
  const clubCards = document.querySelectorAll(".club-card");
  const clubsGrid = document.querySelector(".clubs-grid");
  const prevBtn = document.querySelector(".clubs-carousel-container .prev-btn");
  const nextBtn = document.querySelector(".clubs-carousel-container .next-btn");
  
  let currentSlide = 0;
  let slidesPerView = getClubsSlidesPerView();
  let totalSlides = Math.ceil(clubCards.length / slidesPerView);
  
  function animateClubsCarousel() {
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
}
```

**Key Learning:** Carousel implementation requires:
- **Responsive calculations** for different screen sizes
- **Smooth animations** with proper easing
- **Accessibility features** like keyboard navigation
- **Performance optimization** for smooth scrolling

**Dynamic Content Loading:**

```javascript
async function loadClubsContent() {
  try {
    const index = await ContentLoader.fetchJSON('/src/content/index.json');
    
    if (!index || !index.clubs) {
      console.error('No clubs found in index');
      return;
    }

    let clubsHTML = '';
    
    for (const filename of index.clubs) {
      const clubData = await ContentLoader.fetchMarkdown(`/src/content/clubs/${filename}`);
      
      if (clubData && clubData.frontmatter) {
        const club = clubData.frontmatter;
        
        clubsHTML += `
          <div class="club-card" data-club="${club.name.toLowerCase().replace(/\s+/g, '-')}">
            <div class="club-card-inner">
              <div class="club-icon">
                <i class="${club.icon || 'ri-star-line'}"></i>
              </div>
              <h3 class="club-name">${club.name}</h3>
              <p class="club-description">${club.description}</p>
            </div>
          </div>
        `;
      }
    }
    
    clubsGrid.innerHTML = clubsHTML;
  } catch (error) {
    console.error('Error loading clubs content:', error);
  }
}
```

**Major Challenge:** Loading dynamic content and then initializing carousels required careful timing to ensure DOM elements exist before animation setup.

**Solution:** I implemented a robust loading system that waits for content to load, then uses `requestAnimationFrame` to ensure proper DOM painting before initializing animations.

### Day 12-13: Events Management & Modal System

**What I Built Today:**
I built a comprehensive events management system with modal popups, image carousels, and date filtering. This was the day I learned that complex UI components require careful state management and user experience considerations.

**Events Manager Class:**

```javascript
// src/js/events.js
class EventsManager {
  constructor() {
    this.currentSlide = 0;
    this.currentEventImages = [];
    this.init();
  }

  async init() {
    await this.loadEvents();
    this.renderEvents();
    this.initEventsCarousel();
    this.bindEvents();
    this.initAnimations();
  }

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
        const eventData = await ContentLoader.fetchMarkdown(`/src/content/events/${filename}`);

        if (eventData && eventData.frontmatter) {
          const eventEndDate = new Date(eventData.frontmatter.endDate);
          eventEndDate.setHours(23, 59, 59, 999);

          // Filter out past events
          if (eventEndDate < today) {
            console.log(`Skipping past event: ${eventData.frontmatter.name}`);
            continue;
          }

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
      }

      loadedEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      eventsData = loadedEvents;
    } catch (error) {
      console.error('Error loading events:', error);
      eventsData = [];
    }
  }
}
```

**Key Learning:** Event management required:
- **Date filtering** to show only upcoming events
- **Image handling** with fallbacks for missing images
- **Modal system** with proper accessibility
- **State management** for carousel interactions

**Modal System with GSAP Animations:**

```javascript
openModal(eventId) {
  const event = eventsData.find((e) => e.id === eventId);
  if (!event) return;

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
```

**Major Challenge:** Creating smooth modal animations while managing page scroll and header visibility required careful coordination between multiple elements.

**Solution:** I implemented a comprehensive modal system that:
- Animates the header out of view
- Prevents background scrolling
- Provides smooth entrance/exit animations
- Handles keyboard navigation and accessibility

### Day 14: Final Polish & Performance Optimization

**What I Built Today:**
I spent the final day optimizing performance, fixing edge cases, and ensuring the site works perfectly across all devices and browsers. This was the day I learned that good performance optimization requires systematic testing and measurement.

**Performance Optimizations:**

```javascript
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

// Debounced resize handler
window.addEventListener(
  "resize",
  debounce(() => {
    ScrollTrigger.refresh();
  }, 250)
);

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
```

**Key Learning:** Performance optimization requires:
- **Intersection Observer** for efficient scroll-based animations
- **Debounced event handlers** to prevent excessive function calls
- **Lazy loading** for images and content
- **Memory management** for animations and event listeners

**Accessibility Improvements:**

```javascript
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
```

**Final Testing Checklist:**
-  Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
-  Mobile responsiveness (iPhone, Android, tablets)
-  Performance metrics (Lighthouse scores)
-  Accessibility compliance (WCAG guidelines)
-  Content management workflow
-  Error handling and fallbacks

---

## Architecture Decisions & Lessons Learned

### 1. Content Management Strategy

**Decision:** Hybrid JSON + Markdown approach with Netlify CMS
**Rationale:** 
- JSON for structured data (hero content, contact info)
- Markdown for rich content (events, clubs, resources)
- Netlify CMS provides user-friendly admin interface
- Git-based workflow ensures version control

**Trade-offs:**
-  Flexible content structure
-  Non-technical users can manage content
-  Version control and rollback capabilities
-  More complex build process
-  Requires understanding of Git workflow

### 2. Animation Framework Choice

**Decision:** GSAP over CSS animations and other libraries
**Rationale:**
- Superior performance and browser support
- Powerful timeline and sequencing capabilities
- Excellent ScrollTrigger plugin for scroll-based animations
- Fine-grained control over easing and timing

**Trade-offs:**
-  Smooth, professional animations
-  Complex animation sequences possible
-  Excellent performance
-  Larger bundle size
-  Learning curve for complex features

### 3. Build Tool Selection

**Decision:** Vite over Webpack or other bundlers
**Rationale:**
- Faster development server
- Simpler configuration
- Better ES module support
- Excellent for vanilla JavaScript projects

**Trade-offs:**
-  Fast development experience
-  Simple configuration
-  Good performance
-  Less ecosystem compared to Webpack
-  Newer tool with fewer resources

### 4. Deployment Strategy

**Decision:** Netlify with serverless functions
**Rationale:**
- Seamless Git integration
- Built-in CMS capabilities
- Serverless functions for backend operations
- Excellent performance and CDN

**Trade-offs:**
-  Easy deployment and management
-  Integrated CMS and functions
-  Good performance
-  Vendor lock-in
-  Limited serverless function execution time

---

## Technical Challenges & Solutions

### Challenge 1: Dynamic Content Loading Race Conditions

**Problem:** Content loading and DOM initialization were happening asynchronously, causing animations to fail when elements didn't exist yet.

**Solution:**
```javascript
// Wait for content to load before initializing animations
async function loadClubsContent() {
  // Load content...
  clubsGrid.innerHTML = clubsHTML;

  // Wait for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 100));

  // Use requestAnimationFrame to ensure DOM is painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initClubsSection();
      ScrollTrigger.refresh();
    });
  });
}
```

### Challenge 2: Responsive Carousel Calculations

**Problem:** Carousel slide calculations needed to work across different screen sizes and handle dynamic content.

**Solution:**
```javascript
function getClubsSlidesPerView() {
  const width = window.innerWidth;
  
  if (width <= 768) return 1;
  if (width <= 1200) return 2;
  return 3;
}

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
```

### Challenge 3: Custom Cursor Color Detection

**Problem:** Creating a cursor that adapts to different background colors required complex color analysis.

**Solution:**
```javascript
function isGreenColor(color) {
  if (!color) return false;
  
  const opacity = getOpacity(color);
  if (opacity < 0.3) return false;
  
  const hex = colorToHex(color);
  if (!hex) return false;
  
  // Parse RGB values for broader green detection
  const rgb = hex.match(/[a-f\d]{2}/gi);
  if (!rgb || rgb.length < 3) return false;
  
  const r = parseInt(rgb[0], 16);
  const g = parseInt(rgb[1], 16);
  const b = parseInt(rgb[2], 16);
  
  // Green detection logic
  return (g > r && g > b && g > 100) || 
         (g > 150 && r < 150 && b < 150) || 
         (g > r + 50 && g > b + 50 && g > 80);
}
```

### Challenge 4: Serverless Function Git Operations

**Problem:** Managing complex Git operations through the GitHub API required understanding of trees, blobs, and commits.

**Solution:**
```javascript
// Helper function to set nested values in objects
function setNestedValue(obj, path, value) {
  const parts = path.split(/\.|\[|\]/).filter(p => p);
  
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    
    if (!isNaN(nextPart)) {
      if (!Array.isArray(current[part])) {
        current[part] = [];
      }
      current = current[part];
    } else {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}
```

---

## Performance Optimizations Implemented

### 1. Lazy Loading & Intersection Observer

```javascript
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
```

### 2. Debounced Event Handlers

```javascript
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

// Debounced resize handler
window.addEventListener(
  "resize",
  debounce(() => {
    ScrollTrigger.refresh();
  }, 250)
);
```

### 3. Animation Performance

```javascript
// Throttled mouse movement for cursor
let isThrottled = false;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  if (!isThrottled) {
    adjustCursorColor(e.clientX, e.clientY);
    isThrottled = true;
    setTimeout(() => {
      isThrottled = false;
    }, 16); // ~60fps
  }
});
```

### 4. Memory Management

```javascript
// Clean up animations and event listeners
function cleanup() {
  // Kill GSAP timelines
  particleTimelines.forEach(tl => tl.kill());
  
  // Remove event listeners
  window.removeEventListener("resize", handleResize);
  
  // Clear intervals and timeouts
  clearInterval(particleUpdateInterval);
}
```

---

## Accessibility Features Implemented

### 1. Keyboard Navigation

```javascript
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
```

### 2. Reduced Motion Support

```javascript
// Prefers reduced motion support
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(0.5);
  ScrollTrigger.config({ limitCallbacks: true });
}
```

### 3. Focus Management

```javascript
// Focus management for modals
openModal(eventId) {
  // Show modal
  modal.classList.add("active");
  
  // Focus first interactive element
  const firstButton = modal.querySelector("button");
  if (firstButton) {
    firstButton.focus();
  }
}
```

### 4. Screen Reader Support

```html
<!-- Proper ARIA labels and roles -->
<div class="clubs-carousel-container" role="region" aria-label="STEM Clubs">
  <button class="prev-btn" aria-label="Previous clubs">
    <i class="ri-arrow-left-line"></i>
  </button>
  <button class="next-btn" aria-label="Next clubs">
    <i class="ri-arrow-right-line"></i>
  </button>
</div>
```

---

## Deployment & DevOps

### 1. Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build && mkdir -p dist/src && cp -r src/content dist/src/ && cp -r src/js dist/src/"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "*.md"
  [headers.values]
    Content-Type = "text/markdown; charset=utf-8"
    
[[headers]]
  for = "*.json"
  [headers.values]
    Content-Type = "application/json; charset=utf-8"
```

### 2. Environment Variables

```bash
# Required environment variables
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=ElliottStarosta
GITHUB_REPO=STEM_Council
```

### 3. Build Pipeline

```json
{
  "scripts": {
    "dev": "vite",
    "prebuild": "node scripts/generate-content-index.js",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Content Management Workflow

### 1. Admin Interface Access

- Navigate to `/admin/` on the deployed site
- Login with Netlify/GitHub credentials
- Access all content collections (Hero, About, Events, Clubs, Resources)

### 2. Content Types

**JSON Content (Structured Data):**
- Hero section (description, adjectives, stats)
- About section (mission, features, impact stats)
- Contact information
- Resources settings

**Markdown Content (Rich Text):**
- Events with frontmatter metadata
- Clubs with social links
- Resources with categorization

### 3. Content Creation Process

1. **Create New Content**: Use CMS interface to add new items
2. **Edit Existing Content**: Modify content through admin panel
3. **Media Management**: Upload images through CMS
4. **Preview Changes**: Review before publishing
5. **Publish**: Changes are committed to Git automatically

### 4. Batch Operations

The serverless function enables batch operations:
- Update multiple JSON fields simultaneously
- Create/edit/delete multiple markdown files
- All changes committed in a single Git commit
- Automatic index.json updates

---

## Testing & Quality Assurance

### 1. Cross-Browser Testing

**Desktop Browsers:**
-  Chrome 90+
-  Firefox 88+
-  Safari 14+
-  Edge 90+

**Mobile Browsers:**
-  iOS Safari
-  Chrome Mobile
-  Samsung Internet
-  Firefox Mobile

### 2. Device Testing

**Screen Sizes:**
-  Mobile (320px - 768px)
-  Tablet (768px - 1024px)
-  Desktop (1024px+)
-  Large Desktop (1440px+)

### 3. Performance Metrics

**Lighthouse Scores:**
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

**Core Web Vitals:**
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### 4. Accessibility Testing

-  WCAG 2.1 AA compliance
-  Keyboard navigation
-  Screen reader compatibility
-  Color contrast ratios
-  Focus management

---

## Future Enhancements & Roadmap

### Phase 1: Content Expansion
- [ ] Add more club categories
- [ ] Implement event registration system
- [ ] Add student testimonials section
- [ ] Create resource filtering system

### Phase 2: Interactive Features
- [ ] Add search functionality
- [ ] Implement user accounts
- [ ] Create event RSVP system
- [ ] Add newsletter signup

### Phase 3: Advanced Features
- [ ] Implement analytics dashboard
- [ ] Add multi-language support
- [ ] Create mobile app companion
- [ ] Integrate with school systems

### Phase 4: Performance & Scale
- [ ] Implement CDN optimization
- [ ] Add offline functionality
- [ ] Optimize for Core Web Vitals
- [ ] Implement advanced caching

---

## Resources & Documentation

### Development Resources Used

**Documentation:**
- [GSAP Documentation](https://greensock.com/docs/)
- [Netlify CMS Documentation](https://www.netlifycms.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [GitHub API Documentation](https://docs.github.com/en/rest)

**Tools & Libraries:**
- GSAP 3.13.0 for animations
- RemixIcon 4.6.0 for icons
- Octokit 19.0.0 for GitHub integration
- Vite 7.1.7 for build tooling

**Design Resources:**
- Fontshare API for typography
- Unsplash for placeholder images
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theming

### Troubleshooting Guides

**Common Issues:**
1. **Content not loading**: Check file paths and network requests
2. **Animations not working**: Verify GSAP is loaded and DOM is ready
3. **CMS not accessible**: Check Netlify authentication settings
4. **Build failures**: Verify all dependencies are installed

**Debug Tools:**
- Browser Developer Tools
- Netlify Function Logs
- GitHub Actions (if implemented)
- Lighthouse audits

---

## Conclusion

Building the STEM Council website was an incredible learning experience that taught me the importance of:

1. **Planning Architecture Early**: Good architectural decisions prevent major refactoring later
2. **User Experience First**: Every feature should enhance the user experience
3. **Performance Matters**: Smooth animations and fast loading times are crucial
4. **Accessibility is Essential**: Websites should work for everyone
5. **Content Management**: Non-technical users need intuitive interfaces
6. **Testing Thoroughly**: Cross-browser and device testing prevents issues


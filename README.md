<img src="https://github.com/ElliottStarosta/STEM_Council/blob/main/src/images/logo.png?raw=true" alt="STEM Council Logo" width="150"/>

## Table of Contents

* [Introduction](#introduction)
* [Features](#features)
  * [Modern Web Interface](#modern-web-interface)
  * [Dynamic Content Management](#dynamic-content-management)
  * [Interactive STEM Elements](#interactive-stem-elements)
  * [Responsive Design](#responsive-design)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [How to Run the Application](#how-to-run-the-application)
* [Content Management](#content-management)
* [Deployment](#deployment)
* [Configuration](#configuration)
* [Troubleshooting](#troubleshooting)
* [Support](#support)

---

## Introduction

**STEM Council** is a modern, interactive website for the Earl of March Secondary School (EOM) STEM Council. The website provides a platform for students to explore Science, Technology, Engineering, and Math opportunities through clubs, events, and hands-on activities at EOM

The website features dynamic content management, interactive animations, and a responsive design that showcases the innovative spirit of our STEM community.

---

## Features

### Modern Web Interface

* **Smooth animations** powered by GSAP for engaging user interactions
* **Custom cursor effects** with particle trails and interactive elements
* **Responsive navigation** with hamburger menu for mobile devices
* **Dynamic hero section** with rotating adjectives and statistics

### Dynamic Content Management

* **Netlify CMS integration** for easy content updates
* **Markdown support** for rich text content in events, clubs, and resources
* **JSON-based content system** for flexible data management
* **Real-time content updates** without code changes
* **Serverless functions** for advanced content operations

### Interactive STEM Elements

* **Animated STEM orbs** representing Science, Technology, Engineering, and Math
* **Particle systems** throughout the site for visual appeal
* **Interactive tooltips** with detailed STEM information
* **Carousel components** for events and clubs display

### Responsive Design

* **Mobile-first approach** ensuring optimal experience on all devices
* **Modern CSS Grid and Flexbox** layouts
* **Custom font integration** with Fontshare API
* **Progressive enhancement** for better performance

---

## Technology Stack

* **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
* **Build Tool**: Vite for fast development and optimized builds
* **Animations**: GSAP (GreenSock Animation Platform)
* **Icons**: RemixIcon for consistent iconography
* **Fonts**: Fontshare API for modern typography
* **Content Management**: Netlify CMS with Markdown support
* **Serverless Functions**: Netlify Functions for backend operations
* **Deployment**: Netlify with continuous deployment
* **Version Control**: Git with GitHub integration

---

## Project Structure

```
STEM_Council/
├── public/
│   └── admin/                 # Netlify CMS admin interface
│       ├── config.yml         # CMS configuration
│       ├── index.html         # Admin interface
│       ├── admin.css          # Admin styling
│       ├── admin.js           # Admin JavaScript
│       ├── build.css          # Build-specific styles
│       ├── build.html         # Build interface
│       └── build.js           # Build functionality
├── src/
│   ├── content/               # Dynamic content files
│   │   ├── clubs/            # Club information (Markdown)
│   │   │   ├── arduino-club.md
│   │   │   ├── computer-science-club.md
│   │   │   └── [other clubs].md
│   │   ├── events/           # Event details (Markdown)
│   │   │   ├── 2025-07-15-summer-tech-conference-2025.md
│   │   │   ├── 2025-08-05-green-innovation-workshop.md
│   │   │   └── [other events].md
│   │   ├── resources/        # Learning resources (Markdown)
│   │   │   ├── 3blue1brown-mathematics.md
│   │   │   ├── cs50-introduction-computer-science.md
│   │   │   ├── desmos-graphing-calculator.md
│   │   │   ├── organic-chem-tutor.md
│   │   │   └── waterloo-math-contests.md
│   │   ├── about.json        # About section data
│   │   ├── hero.json         # Hero section data
│   │   ├── contact.json      # Contact information
│   │   ├── index.json        # Index page data
│   │   └── resources-settings.json # Resources configuration
│   ├── css/                  # Stylesheets
│   │   ├── style.css         # Main stylesheet
│   │   ├── header.css        # Navigation styles
│   │   ├── hero.css          # Hero section styles
│   │   ├── about-us.css      # About section styles
│   │   ├── clubs.css         # Clubs section styles
│   │   ├── events.css        # Events section styles
│   │   ├── resources.css     # Resources section styles
│   │   ├── contact.css       # Contact section styles
│   │   └── footer.css        # Footer styles
│   ├── js/                   # JavaScript modules
│   │   ├── content-loader.js # Content management system
│   │   ├── scrolling.js     # Scroll behavior
│   │   ├── header.js         # Navigation functionality
│   │   ├── hero.js           # Hero section animations
│   │   ├── about-us.js       # About section interactions
│   │   ├── clubs.js          # Clubs carousel and display
│   │   ├── events.js         # Events management
│   │   ├── resources.js      # Resources filtering
│   │   ├── contact.js        # Contact form handling
│   │   ├── cursor.js         # Custom cursor effects
│   │   └── footer.js         # Footer functionality
│   └── images/               # Static assets
│       ├── logo.png          # STEM Council logo
│       └── uploads/          # User-uploaded content
├── netlify/                   # Netlify Functions
│   └── functions/            # Serverless functions
│       ├── deploy-status.js  # Deployment status function
│       └── save-content.js   # Content saving function
├── scripts/                  # Build and utility scripts
│   ├── generate-content-index.js  # Content indexing
│   └── generate-index.mjs    # Index generation
├── troubleshooting resources/ # Documentation and guides
│   ├── ADMIN_GUIDE.md        # Content management guide
│   └── NETLIFY_CMS_SETUP.md # CMS setup instructions
├── dist/                     # Built files (generated)
├── node_modules/            # Dependencies
├── index.html              # Main HTML file
├── package.json            # Project configuration
├── netlify.toml            # Netlify deployment config
└── README.md               # This file
```

---

## Prerequisites

Before running the application, ensure you have:

* **Node.js 16+** installed
* **npm** or **yarn** package manager
* **Git** for version control
* **Modern web browser** with JavaScript enabled
* **Netlify account** (for deployment and CMS)

---

## How to Run the Application

### 1. Clone and Navigate to Project

```bash
git clone https://github.com/your-username/STEM_Council.git
cd STEM_Council
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

### 6. Access Content Management

Visit `/admin/` to access the Netlify CMS interface for content management.

---

## Content Management

### Adding New Events

1. Navigate to `/admin/` in your browser
2. Click "New Event" in the Events collection
3. Fill in the event details:
   - **Title**: Event name
   - **Date**: Event date
   - **Description**: Detailed event information (Markdown format)
   - **Images**: Upload event photos
   - **Category**: Event type/category

### Managing Clubs

1. Access the admin interface at `/admin/`
2. Select "Clubs" from the collections
3. Create or edit club information:
   - **Name**: Club name
   - **Description**: Club activities and purpose (Markdown format)
   - **Meeting Times**: When the club meets
   - **Contact**: Club contact information

### Updating Resources

1. Go to `/admin/` and select "Resources"
2. Add new learning resources:
   - **Title**: Resource name
   - **Description**: What the resource offers (Markdown format)
   - **URL**: Link to the resource
   - **Category**: Type of resource (videos, courses, tools, competitions)
   - **Icon**: Remix Icon class for visual representation

---

## Deployment

### Netlify Deployment

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Configure any required environment variables
4. **Custom Domain**: Set up your custom domain (optional)

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist folder to your hosting provider
```

---

## Configuration

### Netlify CMS Configuration

The CMS is configured in `public/admin/config.yml`:

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "src/images/uploads"
public_folder: "/src/images/uploads"

collections:
  - name: "events"
    label: "Events"
    folder: "src/content/events"
    create: true
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Date", name: "date", widget: "datetime"}
      - {label: "Description", name: "description", widget: "markdown"}
      - {label: "Images", name: "images", widget: "list", field: {label: "Image", name: "image", widget: "image"}}
```

### Netlify Functions Configuration

Serverless functions are located in `netlify/functions/`:

- **`deploy-status.js`**: Monitors deployment status
- **`save-content.js`**: Handles content saving operations

Functions are automatically deployed with your site and accessible at:
- `https://eomstemcouncil.netlify.app/.netlify/functions/deploy-status`
- `https://eomstemcouncil.netlify.app/.netlify/functions/save-content`

### Build Configuration

Vite configuration in `package.json`:

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

## Troubleshooting

### Common Issues

1. **Content not loading**: Check that content files exist in `src/content/`
2. **Admin interface not accessible**: Verify Netlify CMS is properly configured
3. **Build errors**: Ensure all dependencies are installed with `npm install`
4. **Styling issues**: Check that CSS files are properly linked in `index.html`
5. **JavaScript errors**: Verify browser console for specific error messages
6. **Markdown content not rendering**: Ensure proper Markdown syntax in content files
7. **Images not uploading**: Check file permissions and size limits
8. **Netlify Functions not working**: Verify function deployment in `netlify/functions/`

### Development Tips

- Use browser developer tools to debug JavaScript issues
- Check the Network tab for failed resource loads
- Verify file paths are correct for your deployment environment
- Test responsive design on different screen sizes
- Review the detailed guides in `troubleshooting resources/` directory

### Detailed Documentation

For comprehensive troubleshooting and setup guides, refer to:
- **`troubleshooting resources/ADMIN_GUIDE.md`** - Complete content management guide
- **`troubleshooting resources/NETLIFY_CMS_SETUP.md`** - CMS setup and configuration

---

## Support

For issues and questions:

1. **Check the troubleshooting section** above
2. **Review the admin guide** in `troubleshooting resources/ADMIN_GUIDE.md`
3. **Check Netlify CMS setup** in `troubleshooting resources/NETLIFY_CMS_SETUP.md`
4. **Contact the development team** via the contact form on the website
5. **Check Netlify Functions** in `netlify/functions/` for serverless function issues

---


## License

This project is developed for the Earl of March Secondary School STEM Council. All rights reserved.

---

*Made with ❤️ by the STEM Council Development Team*
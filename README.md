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
* [Contributing](#contributing)

---

## Introduction

**STEM Council** is a modern, interactive website for the Earl of March Secondary School STEM Council. Built with cutting-edge web technologies, it provides an engaging platform for students to explore Science, Technology, Engineering, and Math opportunities through clubs, events, and hands-on activities.

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
* **JSON-based content system** for flexible data management
* **Markdown support** for rich text content in events and clubs
* **Real-time content updates** without code changes

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
* **Content Management**: Netlify CMS
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
│       └── admin.css          # Admin styling
├── src/
│   ├── content/               # Dynamic content files
│   │   ├── clubs/            # Club information (Markdown)
│   │   ├── events/           # Event details (Markdown)
│   │   ├── resources/        # Learning resources (Markdown)
│   │   ├── about.json        # About section data
│   │   ├── hero.json         # Hero section data
│   │   └── contact.json      # Contact information
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
├── scripts/                  # Build and utility scripts
│   ├── generate-content-index.js  # Content indexing
│   └── generate-index.mjs    # Index generation
├── dist/                     # Built files (generated)
├── node_modules/            # Dependencies
├── index.html              # Main HTML file
├── package.json            # Project configuration
├── netlify.toml            # Netlify deployment config
├── ADMIN_GUIDE.md          # Content management guide
└── NETLIFY_CMS_SETUP.md    # CMS setup instructions
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
   - **Description**: Detailed event information
   - **Images**: Upload event photos
   - **Category**: Event type/category

### Managing Clubs

1. Access the admin interface at `/admin/`
2. Select "Clubs" from the collections
3. Create or edit club information:
   - **Name**: Club name
   - **Description**: Club activities and purpose
   - **Meeting Times**: When the club meets
   - **Contact**: Club contact information

### Updating Resources

1. Go to `/admin/` and select "Resources"
2. Add new learning resources:
   - **Title**: Resource name
   - **Description**: What the resource offers
   - **URL**: Link to the resource
   - **Category**: Type of resource (videos, courses, tools, competitions)

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
```

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

### Development Tips

- Use browser developer tools to debug JavaScript issues
- Check the Network tab for failed resource loads
- Verify file paths are correct for your deployment environment
- Test responsive design on different screen sizes

---

## Support

For issues and questions:

1. **Check the troubleshooting section** above
2. **Review the admin guide** in `ADMIN_GUIDE.md`
3. **Check Netlify CMS setup** in `NETLIFY_CMS_SETUP.md`
4. **Contact the development team** via the contact form on the website

---

## Contributing

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m "Add new feature"`
5. **Push to your fork**: `git push origin feature/new-feature`
6. **Create a Pull Request** on GitHub

### Code Standards

- Use semantic HTML elements
- Follow CSS naming conventions (BEM methodology)
- Write clean, commented JavaScript
- Ensure responsive design principles
- Test across different browsers and devices

### Content Guidelines

- Use clear, engaging language for all content
- Include relevant images and media
- Ensure all links are working and accessible
- Follow the established content structure

---

## License

This project is developed for the Earl of March Secondary School STEM Council. All rights reserved.

---

*Made with ❤️ by the STEM Council Development Team*

# STEM Council Website - Admin Guide

## Overview
This guide explains how to use the Netlify CMS admin panel to manage content on the STEM Council website without touching any code.

## Accessing the Admin Panel

1. **Visit the admin panel**: Go to `https://your-site.netlify.app/admin/`
2. **Login**: Use your Netlify account credentials or GitHub account
3. **Start editing**: Once logged in, you'll see all available content sections

## Content Management

### Hero Section
**Location**: Hero Section collection
**What you can edit**:
- Main description text
- Three rotating adjectives (Innovative, Creative, Excellence)
- Statistics (Clubs, Members, Events)

**How to edit**:
1. Click on "Hero Section" in the admin panel
2. Edit the description text
3. Update the adjectives array (exactly 3 required)
4. Modify the stats numbers and labels
5. Click "Save" to publish changes

### About Us Section
**Location**: About Us collection
**What you can edit**:
- Mission statement
- "What We Do" description
- "Our Impact" description
- Features list (3 items with title, description, and icon)
- Impact statistics (4 items with number, label, and description)

**How to edit**:
1. Click on "About Us" in the admin panel
2. Update text content in the markdown fields
3. Modify features and impact stats
4. Use valid Remix Icon classes for icons (e.g., `ri-focus-2-line`)
5. Click "Save" to publish changes

### Contact Section
**Location**: Contact collection
**What you can edit**:
- Contact section subtitle
- Contact methods (Email, Instagram, Discord)
- Links and display text for each contact method

**How to edit**:
1. Click on "Contact" in the admin panel
2. Update the subtitle text
3. Modify contact methods (add/remove/edit)
4. Ensure all URLs are valid (start with http:// or https://)
5. Click "Save" to publish changes

### Clubs
**Location**: Clubs collection
**What you can edit**:
- Add new clubs
- Edit existing clubs
- Delete clubs
- Club name, description, and icon
- Social media links (Discord, Instagram, Email)

**How to add a new club**:
1. Click "New Club" in the Clubs collection
2. Fill in the club name (this becomes the URL slug)
3. Add a description
4. Choose an icon (use Remix Icon classes like `ri-code-s-slash-line`)
5. Add social links with valid URLs
6. Click "Save" to create the club

**How to edit an existing club**:
1. Click on the club name in the Clubs collection
2. Make your changes
3. Click "Save" to update

### Events
**Location**: Events collection
**What you can edit**:
- Add new events
- Edit existing events
- Delete events
- Event name, dates, description, and images

**How to add a new event**:
1. Click "New Event" in the Events collection
2. Fill in the event name
3. Set start and end dates
4. Upload images (drag and drop or click to browse)
5. Write the event description in markdown
6. Click "Save" to create the event

**How to edit an existing event**:
1. Click on the event name in the Events collection
2. Make your changes
3. Click "Save" to update

**Image Guidelines**:
- Supported formats: JPG, PNG, GIF, WebP
- Recommended size: 800x400 pixels
- Images are automatically optimized by Netlify
- Use descriptive filenames

### Resources
**Location**: Resources collection
**What you can edit**:
- Add new resources
- Edit existing resources
- Delete resources
- Resource title, description, URL, type, tags, and icon

**How to add a new resource**:
1. Click "New Resource" in the Resources collection
2. Fill in the resource title
3. Add a description
4. Enter the resource URL (must start with http:// or https://)
5. Select the resource type (videos, courses, tools, competitions)
6. Add tags (1-5 tags recommended)
7. Choose an icon (use Remix Icon classes)
8. Click "Save" to create the resource

**Resource Types**:
- **Videos**: YouTube channels, video tutorials
- **Courses**: Online courses, educational platforms
- **Tools**: Software, calculators, development tools
- **Competitions**: Contests, competitions, challenges

### Resources Settings
**Location**: Resources Settings collection
**What you can edit**:
- Resources section subtitle
- Call-to-action title and description
- CTA button text

**How to edit**:
1. Click on "Resources Settings" in the admin panel
2. Update the subtitle text
3. Modify the CTA section content
4. Click "Save" to publish changes

## Image Management

### Uploading Images
1. In any image field, click "Choose an image" or drag and drop
2. Images are automatically uploaded to `/src/images/uploads/`
3. Images are optimized and resized automatically
4. Use descriptive filenames for better organization

### Image Guidelines
- **Format**: JPG, PNG, GIF, WebP
- **Size**: Recommended 800x400px for event images
- **File size**: Keep under 5MB for faster loading
- **Naming**: Use descriptive names like `summer-conference-2025.jpg`

## Content Guidelines

### Text Content
- Keep descriptions concise but informative
- Use proper grammar and spelling
- Avoid excessive use of technical jargon
- Make content accessible to all reading levels

### Icons
- Use only Remix Icon classes (format: `ri-icon-name`)
- Common icons: `ri-code-s-slash-line`, `ri-cpu-line`, `ri-video-fill`
- Browse available icons at: https://remixicon.com/

### URLs
- All URLs must start with `http://` or `https://`
- Test links before saving
- Use shortened URLs for long links when possible

## Publishing Changes

### Automatic Deployment
- All changes are automatically saved to your Git repository
- Netlify automatically rebuilds and deploys the site
- Changes typically go live within 1-2 minutes
- You can view deployment status in your Netlify dashboard

### Preview Changes
- Use the "Preview" button to see changes before publishing
- Preview shows exactly how the site will look with your changes
- Make sure to test all functionality in preview mode

## Troubleshooting

### Common Issues

**"Failed to load content" error**:
- Check your internet connection
- Refresh the page and try again
- Contact the site administrator if the problem persists

**Images not uploading**:
- Check file size (must be under 5MB)
- Ensure file format is supported (JPG, PNG, GIF, WebP)
- Try a different browser if the issue persists

**Changes not appearing on the website**:
- Wait 1-2 minutes for automatic deployment
- Check the Netlify dashboard for deployment status
- Clear your browser cache and refresh the page

**Invalid icon error**:
- Use only Remix Icon classes (format: `ri-icon-name`)
- Check the icon name at https://remixicon.com/
- Ensure the icon class is spelled correctly

### Getting Help
- Check this guide first for common solutions
- Contact the site administrator for technical issues
- Report bugs or suggest improvements through the contact form

## Best Practices

### Content Management
- Review content before publishing
- Use consistent formatting and style
- Keep content up-to-date and relevant
- Test all links and functionality

### Image Management
- Use high-quality, relevant images
- Optimize images before uploading
- Use descriptive filenames
- Maintain consistent image sizes

### Regular Maintenance
- Review and update content monthly
- Check for broken links
- Update event information regularly
- Keep resource links current

## Security Notes

- Never share your admin login credentials
- Log out when finished editing
- Report any suspicious activity immediately
- Keep your Netlify account secure

---

**Last Updated**: October 2025
**Version**: 1.0
**Contact**: For technical support, use the contact form on the website

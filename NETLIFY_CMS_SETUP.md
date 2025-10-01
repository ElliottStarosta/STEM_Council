# Netlify CMS Setup Instructions

## Overview
This document provides step-by-step instructions for setting up Netlify CMS with your STEM Council website.

## Prerequisites
- GitHub repository with your website code
- Netlify account
- Website deployed on Netlify

## Step 1: Enable Git Gateway

1. **Go to your Netlify dashboard**
2. **Navigate to Site Settings > Identity**
3. **Enable Identity service**:
   - Click "Enable Identity"
   - Choose "Enable Identity" in the popup
4. **Configure Git Gateway**:
   - Go to Site Settings > Identity > Services
   - Click "Enable Git Gateway"
   - This allows the CMS to make commits to your repository

## Step 2: Configure Identity Settings

1. **Go to Site Settings > Identity > Settings**
2. **Configure registration**:
   - Set "Registration preferences" to "Invite only" (recommended)
   - Or "Open" if you want anyone to register
3. **Set up external providers** (optional):
   - Enable GitHub, Google, or other providers
   - This allows users to login with their existing accounts

## Step 3: Invite Users

1. **Go to Site Settings > Identity > Users**
2. **Click "Invite users"**
3. **Enter email addresses** of people who should have access
4. **Send invitations**
5. **Users will receive an email** with a link to set up their password

## Step 4: Test the Admin Panel

1. **Visit your admin panel**: `https://your-site.netlify.app/admin/`
2. **Login** with your Netlify account or invited user account
3. **Verify all collections are visible**:
   - Hero Section
   - About Us
   - Contact
   - Resources Settings
   - Clubs
   - Events
   - Resources

## Step 5: Configure Media Storage (Optional)

By default, images are stored in your repository. For better performance, you can configure external media storage:

1. **Go to Site Settings > Identity > Services**
2. **Configure media storage** (optional):
   - Cloudinary
   - AWS S3
   - Or keep using Git-based storage

## Step 6: Set Up Branch Protection (Recommended)

1. **Go to your GitHub repository**
2. **Navigate to Settings > Branches**
3. **Add a branch protection rule** for the `main` branch:
   - Require pull request reviews
   - Require status checks to pass
   - This prevents direct commits to main branch

## Step 7: Configure Webhooks (Optional)

1. **Go to Site Settings > Build & Deploy > Webhooks**
2. **Add a webhook** for content updates:
   - Trigger: "Deploy started"
   - This ensures the site rebuilds when content changes

## Troubleshooting

### Common Issues

**"Git Gateway not enabled" error**:
- Make sure Git Gateway is enabled in Netlify Identity settings
- Check that your repository is properly connected

**"Authentication failed" error**:
- Verify the user has been invited and accepted the invitation
- Check that the user has the correct permissions

**"Failed to load config" error**:
- Ensure the admin panel is accessible at `/admin/`
- Check that the config is properly formatted

**Images not uploading**:
- Verify the media folder path is correct
- Check file permissions in your repository
- Ensure images are under the size limit

### Getting Help

1. **Check Netlify documentation**: https://docs.netlify.com/
2. **Check Decap CMS documentation**: https://decapcms.org/docs/
3. **Contact support** through your Netlify dashboard

## Security Considerations

1. **Use strong passwords** for all admin accounts
2. **Enable two-factor authentication** where possible
3. **Regularly review user access** and remove inactive users
4. **Monitor admin panel access** through Netlify logs
5. **Keep your Netlify account secure**

## Maintenance

### Regular Tasks
- **Review user access** monthly
- **Update content** regularly
- **Monitor site performance** after content changes
- **Backup important content** periodically

### Updates
- **Keep Decap CMS updated** by updating the CDN link
- **Monitor for security updates** in Netlify
- **Test functionality** after any updates

## File Structure

After setup, your repository should have:
```
├── public/
│   └── admin/
│       └── index.html
├── src/
│   ├── content/
│   │   ├── hero.json
│   │   ├── about.json
│   │   ├── contact.json
│   │   ├── resources-settings.json
│   │   ├── clubs/
│   │   ├── events/
│   │   └── resources/
│   └── images/
│       └── uploads/
├── netlify.toml
└── ADMIN_GUIDE.md
```

## Next Steps

1. **Test all functionality** in the admin panel
2. **Train content editors** using the ADMIN_GUIDE.md
3. **Set up regular content updates**
4. **Monitor site performance**
5. **Gather feedback** from users

---

**Created**: October 2025
**Version**: 1.0
**For**: STEM Council Website

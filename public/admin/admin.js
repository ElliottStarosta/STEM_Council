// Admin state
const adminState = {
  user: null,
  editMode: false,
  pendingChanges: {},
  editableRegions: [],
  currentEdit: null,
  // Track markdown file operations
  markdownChanges: {
    modified: {}, // { 'clubs/arduino-club.md': { frontmatter: {...}, body: '...' } }
    deleted: [],  // ['events/old-event.md']
    created: []   // [{ type: 'clubs', data: {...} }]
  }
};

// DOM elements
const elements = {
  adminContainer: document.getElementById("adminContainer"),
  editModeToggle: document.getElementById("editModeToggle"),
  editOverlay: document.getElementById("editOverlay"),
  siteIframe: document.getElementById("siteIframe"),
  saveBtn: document.getElementById("saveBtn"),
  discardBtn: document.getElementById("discardBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  changesIndicator: document.getElementById("changesIndicator"),
  changesCount: document.getElementById("changesCount"),
  editModal: document.getElementById("editModal"),
  modalForm: document.getElementById("modalForm"),
  modalSaveBtn: document.getElementById("modalSaveBtn"),
  modalCancelBtn: document.getElementById("modalCancelBtn"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
  statusMessage: document.getElementById("statusMessage"),
  statusText: document.getElementById("statusText"),
};

// Initialize Netlify Identity
function initAuth() {
  if (!window.netlifyIdentity) {
    showStatus("Authentication service unavailable", "error");
    return;
  }

  netlifyIdentity.on("init", (user) => {
    console.log(
      "Identity initialized:",
      user ? "Authenticated" : "Not authenticated"
    );

    if (!user) {
      // Show Netlify's native login modal
      netlifyIdentity.open();
    } else {
      // User is authenticated
      adminState.user = user;
      showStatus("Authenticated as " + user.email, "success");
    }
  });

  netlifyIdentity.on("login", (user) => {
    console.log("Login successful:", user.email);
    adminState.user = user;
    showStatus("Welcome, " + user.email, "success");
    netlifyIdentity.close();
  });

  netlifyIdentity.on("logout", () => {
    console.log("User logged out");
    window.location.href = "/";
  });

  netlifyIdentity.on("error", (err) => {
    console.error("Identity error:", err);
    showStatus("Authentication error: " + err.message, "error");
  });
}

// Initialize iframe integration
function initIframeIntegration() {
  elements.siteIframe.addEventListener("load", () => {
    console.log("Site loaded in iframe");
    if (adminState.editMode) {
      scanEditableContent();
    }
  });

  // Handle iframe scroll when in edit mode
  elements.siteIframe.addEventListener("load", () => {
    try {
      const iframeWindow = elements.siteIframe.contentWindow;
      if (iframeWindow) {
        iframeWindow.addEventListener(
          "scroll",
          () => {
            if (adminState.editMode) {
              updateHighlightPositions();
            }
          },
          true
        ); // Use capture phase
      }
    } catch (e) {
      console.error("Cannot attach scroll listener:", e);
    }
  });
}

// Toggle edit mode
// Toggle edit mode
elements.editModeToggle.addEventListener("click", () => {
  adminState.editMode = !adminState.editMode;
  elements.editModeToggle.classList.toggle("active");

  if (adminState.editMode) {
    // Wait a bit for iframe to be fully rendered
    setTimeout(() => {
      scanEditableContent();
      scanMarkdownContent();
    }, 500); // Give time for dynamic content to load
  } else {
    clearEditableHighlights();
    // Hide add-markdown-btn buttons if any exist
    const iframeDoc = elements.siteIframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.querySelectorAll('.add-markdown-btn').forEach(btn => {
        btn.style.display = 'none';
      });
    }
  }
});

// Scan for editable content
function scanEditableContent() {
  try {
    const iframeDoc = elements.siteIframe.contentDocument;
    if (!iframeDoc) {
      showStatus("Cannot access iframe content", "error");
      return;
    }

    clearEditableHighlights();

    // Find all elements with data-editable attribute
    const editableElements = iframeDoc.querySelectorAll("[data-editable]");

    if (editableElements.length === 0) {
      showStatus(
        "No editable content found. Add data-editable attributes to your HTML elements.",
        "info"
      );
    }

    editableElements.forEach((el) => {
      createEditableHighlight(el);
    });
  } catch (error) {
    console.error("Cannot access iframe content:", error);
    showStatus(
      "Cannot access site content. Same-origin policy restriction.",
      "error"
    );
  }
}

function scanMarkdownContent() {
  try {
    const iframeDoc = elements.siteIframe.contentDocument;
    if (!iframeDoc) {
      console.error('Cannot access iframe document');
      return;
    }

    console.log('Scanning markdown content...');

    // Scan for club cards
    const clubCards = iframeDoc.querySelectorAll('.club-card');
    console.log('Found club cards:', clubCards.length);
    clubCards.forEach((card) => {
      createMarkdownEditOverlay(card, 'club');
    });

    // Scan for event cards
    const eventCards = iframeDoc.querySelectorAll('.event-card');
    console.log('Found event cards:', eventCards.length);
    eventCards.forEach((card) => {
      createMarkdownEditOverlay(card, 'event');
    });

    // Scan for resource cards
    const resourceCards = iframeDoc.querySelectorAll('.resource-card');
    console.log('Found resource cards:', resourceCards.length);
    resourceCards.forEach((card) => {
      createMarkdownEditOverlay(card, 'resource');
    });

    console.log('Total markdown overlays created:', adminState.editableRegions.filter(r => r.type === 'markdown').length);

    // Add "Add New" buttons for each section
    createAddButtons(iframeDoc);
  } catch (error) {
    console.error("Cannot scan markdown content:", error);
  }
}

function createAddButtons(iframeDoc) {
  const sections = [
    { selector: '.clubs-grid', type: 'club', label: 'Add New Club' },
    { selector: '.events-grid', type: 'event', label: 'Add New Event' },
    { selector: '.resources-grid', type: 'resource', label: 'Add New Resource' }
  ];

  sections.forEach(({ selector, type, label }) => {
    const container = iframeDoc.querySelector(selector);
    if (!container) return;

    // Remove any previous add button (now checks after the grid)
    if (container.nextSibling && container.nextSibling.classList && container.nextSibling.classList.contains('add-markdown-btn')) {
      container.nextSibling.remove();
    }

    const addBtn = iframeDoc.createElement('button');
    addBtn.className = 'add-markdown-btn';
    addBtn.innerHTML = `<i class=\"ri-add-line\"></i> ${label}`;
    addBtn.style.display = adminState.editMode ? 'block' : 'none';
    // Add extra margin-bottom for resource button
    if (type === 'resource') {
      addBtn.style.margin = '24px auto 30px';
    } else {
      addBtn.style.margin = '24px auto 0 auto';
    }
    addBtn.style.width = 'fit-content';
    addBtn.style.padding = '10px 20px';
    addBtn.style.fontSize = '1rem';
    addBtn.style.background = '#2e7d32';
    addBtn.style.color = '#fff';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '6px';
    addBtn.style.cursor = 'pointer';
    addBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';

    addBtn.onclick = function(e) {
      e.stopPropagation();
      window.parent.openMarkdownCreateModal(type);
    };

    // Insert the button after the grid container
    if (container.parentNode) {
      container.parentNode.insertBefore(addBtn, container.nextSibling);
    }
  });
}



// Create editable highlight
function createEditableHighlight(element) {
  const iframeWindow = elements.siteIframe.contentWindow;
  const rect = element.getBoundingClientRect();

  const highlight = document.createElement("div");
  highlight.className = "editable-highlight";

  // Position relative to viewport, accounting for iframe scroll
  highlight.style.top = rect.top + 15 + "px"; // 53px = toolbar height
  highlight.style.left = rect.left + "px";
  highlight.style.width = rect.width + "px";
  highlight.style.height = rect.height + "px";

  const editBtn = document.createElement("div");
  editBtn.className = "edit-button";
  editBtn.innerHTML = '<i class="ri-edit-line"></i>';
  highlight.appendChild(editBtn);

  highlight.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditModal(element);
  });

  elements.editOverlay.appendChild(highlight);
  adminState.editableRegions.push({ element, highlight });
}

function createMarkdownEditOverlay(element, type) {
  const rect = element.getBoundingClientRect();
  const filename = element.dataset.markdownFile;

  const overlay = document.createElement('div');
  overlay.className = 'markdown-edit-overlay';
  overlay.style.top = rect.top + 'px';
  overlay.style.left = rect.left + 'px';
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'markdown-edit-buttons';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'markdown-btn edit-btn';
  editBtn.innerHTML = '<i class="ri-edit-line"></i>';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    openMarkdownEditModal(element, type, filename);
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'markdown-btn delete-btn';
  deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteMarkdownFile(filename, type);
  };

  buttonGroup.appendChild(editBtn);
  buttonGroup.appendChild(deleteBtn);
  overlay.appendChild(buttonGroup);

  elements.editOverlay.appendChild(overlay);
  adminState.editableRegions.push({ element, overlay, type: 'markdown' });
}

function openMarkdownEditModal(element, type, filename) {
  adminState.currentEdit = {
    element,
    type,
    filename,
    isMarkdown: true
  };

  // Fetch current data from element's data attributes or parse from content
  const currentData = extractMarkdownData(element, type);

  elements.modalForm.innerHTML = buildMarkdownForm(type, currentData);
  elements.editModal.classList.add('active');
}

function extractMarkdownData(element, type) {
  const data = {};
  
  if (type === 'club') {
    data.name = element.querySelector('.club-name')?.textContent || '';
    data.description = element.querySelector('.club-description')?.textContent || '';
    data.icon = element.querySelector('.club-icon i')?.className || 'ri-star-line';
    
    const socialLinks = [];
    element.querySelectorAll('.club-link').forEach(link => {
      socialLinks.push({
        type: link.getAttribute('title') || 'Link',
        url: link.getAttribute('href') || '#',
        icon: link.querySelector('i')?.className || 'ri-link'
      });
    });
    data.socialLinks = socialLinks;
  }
  
  if (type === 'event') {
    data.name = element.querySelector('.event-name')?.textContent || '';
    data.description = element.querySelector('.event-preview')?.textContent || '';
    
    // Try to get date from data attributes if available
    const eventId = element.dataset.eventId;
    if (eventId && window.eventsManager && window.eventsManager.eventsData) {
      const eventData = window.eventsManager.eventsData.find(e => e.id == eventId);
      if (eventData) {
        data.startDate = eventData.startDate;
        data.endDate = eventData.endDate;
        data.images = eventData.images || [];
        data.body = eventData.description || '';
      }
    }
  }
  
  if (type === 'resource') {
    data.title = element.querySelector('.card-title')?.textContent || '';
    data.description = element.querySelector('.card-description')?.textContent || '';
    data.icon = element.querySelector('.card-icon i')?.className || 'ri-star-line';
    data.type = element.dataset.type || 'videos';
    
    const tags = [];
    element.querySelectorAll('.tag').forEach(tag => {
      tags.push({ tag: tag.textContent });
    });
    data.tags = tags;
    
    // Try to extract URL from button
    const btn = element.querySelector('.resource-btn');
    if (btn && btn.onclick) {
      const onclickStr = btn.onclick.toString();
      const urlMatch = onclickStr.match(/window\.open\(['"]([^'"]+)['"]/);
      if (urlMatch) {
        data.url = urlMatch[1];
      }
    }
  }
  
  return data;
}

function buildMarkdownForm(type, data = {}) {
  const forms = {
    club: `
      <div class="form-group">
        <label class="form-label" for="name">Club Name</label>
        <input class="form-input" id="name" type="text" value="${escapeHtml(data.name || '')}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea class="form-textarea" id="description" rows="4" required>${escapeHtml(data.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="icon">Icon (Remix Icon class)</label>
        <input class="form-input" id="icon" type="text" value="${escapeHtml(data.icon || 'ri-star-line')}" required placeholder="e.g. ri-code-s-slash-line">
        <small style="color: #888; font-size: 12px;">Find icons at: <a href="https://remixicon.com" target="_blank">remixicon.com</a></small>
      </div>
      <div class="form-group">
        <label class="form-label">Social Links</label>
        <div id="socialLinks">
          ${(data.socialLinks || []).map((link, i) => `
            <div class="social-link-group" data-index="${i}">
              <input class="form-input" placeholder="Type" value="${escapeHtml(link.type || '')}" data-field="type">
              <input class="form-input" placeholder="URL" value="${escapeHtml(link.url || '')}" data-field="url">
              <input class="form-input" placeholder="Icon" value="${escapeHtml(link.icon || '')}" data-field="icon">
              <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="add-link-btn" onclick="addSocialLink()">+ Add Link</button>
      </div>
    `,
    event: `
      <div class="form-group">
        <label class="form-label" for="name">Event Name</label>
        <input class="form-input" id="name" type="text" value="${escapeHtml(data.name || '')}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="startDate">Start Date</label>
        <input class="form-input" id="startDate" type="datetime-local" value="${data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="endDate">End Date</label>
        <input class="form-input" id="endDate" type="datetime-local" value="${data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Images (URLs)</label>
        <div id="imageList">
          ${(data.images || []).map((img, i) => `
            <div class="image-input-group">
              <input class="form-input" placeholder="Image URL" value="${escapeHtml(img.image || img)}" data-index="${i}">
              <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="add-link-btn" onclick="addImageInput()">+ Add Image</button>
      </div>
      <div class="form-group">
        <label class="form-label" for="body">Description (Markdown)</label>
        <textarea class="form-textarea" id="body" rows="8" required>${escapeHtml(data.body || '')}</textarea>
      </div>
    `,
    resource: `
      <div class="form-group">
        <label class="form-label" for="title">Resource Title</label>
        <input class="form-input" id="title" type="text" value="${escapeHtml(data.title || '')}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea class="form-textarea" id="description" rows="3" required>${escapeHtml(data.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="url">URL</label>
        <input class="form-input" id="url" type="url" value="${escapeHtml(data.url || '')}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="type">Type</label>
        <select class="form-input" id="type" required>
          <option value="videos" ${data.type === 'videos' ? 'selected' : ''}>Videos</option>
          <option value="courses" ${data.type === 'courses' ? 'selected' : ''}>Courses</option>
          <option value="tools" ${data.type === 'tools' ? 'selected' : ''}>Tools</option>
          <option value="competitions" ${data.type === 'competitions' ? 'selected' : ''}>Competitions</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tags</label>
        <div id="tagList">
          ${(data.tags || []).map((tag, i) => `
            <div class="tag-input-group">
              <input class="form-input" placeholder="Tag" value="${escapeHtml(tag.tag || tag)}" data-index="${i}">
              <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="add-link-btn" onclick="addTagInput()">+ Add Tag</button>
      </div>
      <div class="form-group">
        <label class="form-label" for="icon">Icon (Remix Icon class)</label>
        <input class="form-input" id="icon" type="text" value="${escapeHtml(data.icon || 'ri-star-line')}" required placeholder="e.g. ri-video-fill">
        <small style="color: #888; font-size: 12px;">Find icons at: <a href="https://remixicon.com" target="_blank">remixicon.com</a></small>
      </div>
    `
  };

  return forms[type] || '';
}

function openMarkdownCreateModal(type) {
  adminState.currentEdit = {
    type,
    isMarkdown: true,
    isNew: true
  };

  elements.modalForm.innerHTML = buildMarkdownForm(type, {});
  elements.editModal.classList.add('active');
}

// Update highlight positions on scroll
function updateHighlightPositions() {
  try {
    adminState.editableRegions.forEach(({ element, highlight, overlay, type }) => {
      const rect = element.getBoundingClientRect();
      
      if (highlight) {
        highlight.style.top = rect.top + 15 + "px";
        highlight.style.left = rect.left + "px";
        highlight.style.width = rect.width + "px";
        highlight.style.height = rect.height + "px";
      }
      
      if (overlay) {
        overlay.style.top = rect.top + "px";
        overlay.style.left = rect.left + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
      }
    });
  } catch (e) {
    console.error("Error updating positions:", e);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Clear editable highlights
function clearEditableHighlights() {
  elements.editOverlay.innerHTML = "";
  adminState.editableRegions = [];
}

// Open edit modal
function openEditModal(element) {
  const editableId = element.dataset.editable;
  const contentFile = element.dataset.contentFile || "unknown.json";
  const contentField = element.dataset.contentField || "text";
  const currentValue = element.textContent.trim();

  adminState.currentEdit = {
    element,
    editableId,
    contentFile,
    contentField,
    originalValue: currentValue,
  };

  // Build form
  elements.modalForm.innerHTML = `
        <div class="form-group">
          <label class="form-label">File: ${contentFile}</label>
          <label class="form-label">Field: ${contentField}</label>
        </div>
        <div class="form-group">
          <label class="form-label" for="editContent">Content</label>
          <textarea class="form-textarea" id="editContent" rows="6">${currentValue}</textarea>
        </div>
      `;

  elements.editModal.classList.add("active");
  document.getElementById("editContent").focus();
}

// Close edit modal
function closeEditModal() {
  elements.editModal.classList.remove("active");
  adminState.currentEdit = null;
}

function saveMarkdownChanges() {
  const { type, filename, isNew } = adminState.currentEdit;
  const formData = collectFormData(type);
  
  if (isNew) {
    // Generate filename from title/name
    const slug = (formData.name || formData.title).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newFilename = `${type}s/${slug}.md`;
    
    adminState.markdownChanges.created.push({
      type,
      filename: newFilename,
      data: formData
    });
  } else {
    adminState.markdownChanges.modified[filename] = formData;
  }
  
  updateChangesUI();
  showStatus(`${type} ${isNew ? 'created' : 'updated'}. Click "Save Changes" to commit.`, 'success');
}

function collectFormData(type) {
  const data = {};
  
  // Collect all form inputs
  elements.modalForm.querySelectorAll('.form-input, .form-textarea, select').forEach(input => {
    if (input.id) {
      data[input.id] = input.value;
    }
  });
  
  // Collect arrays (social links, images, tags)
  if (type === 'club') {
    data.socialLinks = Array.from(document.querySelectorAll('.social-link-group')).map(group => ({
      type: group.querySelector('[data-field="type"]').value,
      url: group.querySelector('[data-field="url"]').value,
      icon: group.querySelector('[data-field="icon"]').value
    }));
  }
  
  if (type === 'event') {
    data.images = Array.from(document.querySelectorAll('.image-input-group input')).map(input => ({
      image: input.value
    }));
  }
  
  if (type === 'resource') {
    data.tags = Array.from(document.querySelectorAll('.tag-input-group input')).map(input => ({
      tag: input.value
    }));
  }
  
  return data;
}

function deleteMarkdownFile(filename, type) {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

  let fileToDelete = filename;
  if (type === 'event' && !filename.startsWith('events/')) {
    fileToDelete = `events/${filename}`;
  }
  adminState.markdownChanges.deleted.push(fileToDelete);
  console.log("Marked for deletion:", fileToDelete);
  // Remove from UI
  const element = adminState.editableRegions.find(r => r.element.dataset.markdownFile === filename);
  if (element) {
    element.element.style.opacity = '0.3';
    element.element.style.pointerEvents = 'none';
  }

  updateChangesUI();
  showStatus(`${type} marked for deletion. Click "Save Changes" to commit.`, 'success');
}

elements.modalCloseBtn.addEventListener("click", closeEditModal);
elements.modalCancelBtn.addEventListener("click", closeEditModal);

// Save edit from modal
elements.modalSaveBtn.addEventListener('click', () => {
  if (adminState.currentEdit?.isMarkdown) {
    saveMarkdownChanges();
    closeEditModal();
  } else {
    // Existing JSON save logic
    const newValue = document.getElementById('editContent')?.value.trim();

    if (
      adminState.currentEdit &&
      newValue !== adminState.currentEdit.originalValue
    ) {
      // Update the visual element
      adminState.currentEdit.element.textContent = newValue;

      // Track the change
      const changeKey = `${adminState.currentEdit.contentFile}:${adminState.currentEdit.contentField}`;
      adminState.pendingChanges[changeKey] = {
        file: adminState.currentEdit.contentFile,
        field: adminState.currentEdit.contentField,
        value: newValue,
        originalValue: adminState.currentEdit.originalValue,
      };

      updateChangesUI();
      showStatus('Change recorded. Click "Save Changes" to commit.', "success");
    }

    closeEditModal();
  }
});

// Update changes UI
function updateChangesUI() {
  const jsonCount = Object.keys(adminState.pendingChanges).length;
  const markdownCount = 
    Object.keys(adminState.markdownChanges.modified).length +
    adminState.markdownChanges.deleted.length +
    adminState.markdownChanges.created.length;
  
  const totalCount = jsonCount + markdownCount;
  
  elements.changesCount.textContent = totalCount;
  elements.changesIndicator.style.display = totalCount > 0 ? 'flex' : 'none';
  elements.discardBtn.style.display = totalCount > 0 ? 'flex' : 'none';
  elements.saveBtn.disabled = totalCount === 0;
}
// Discard changes
elements.discardBtn.addEventListener("click", () => {
  if (confirm("Discard all unsaved changes?")) {
    adminState.pendingChanges = {};
    updateChangesUI();
    elements.siteIframe.contentWindow.location.reload();
    showStatus("Changes discarded", "success");
  }
});

// Save changes to GitHub via Netlify Function
elements.saveBtn.addEventListener('click', async () => {
  if (!adminState.user) {
    showStatus("You must be logged in to save changes", "error");
    return;
  }

  elements.saveBtn.disabled = true;
  elements.saveBtn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

  try {
    const token = adminState.user.token.access_token;
    
    // Prepare payload
    const payload = {
      jsonChanges: Object.values(adminState.pendingChanges),
      markdownChanges: adminState.markdownChanges,
      user: adminState.user.email
    };

    const response = await fetch("/.netlify/functions/save-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save changes");
    }

    // Reset state
    adminState.pendingChanges = {};
    adminState.markdownChanges = { modified: {}, deleted: [], created: [] };
    updateChangesUI();
    showStatus("All changes saved successfully!", "success");

    setTimeout(() => {
      window.location.href = '/admin/build.html';
    }, 1000);
  } catch (error) {
    console.error("Save error:", error);
    showStatus("Failed to save: " + error.message, "error");
  } finally {
    elements.saveBtn.disabled = false;
    elements.saveBtn.innerHTML = '<i class="ri-save-line"></i> Save Changes';
  }
});

// Logout
elements.logoutBtn.addEventListener("click", () => {
  if (Object.keys(adminState.pendingChanges).length > 0) {
    if (
      !confirm("You have unsaved changes. Are you sure you want to logout?")
    ) {
      return;
    }
  }
  netlifyIdentity.logout();
});

// Show status message
function showStatus(message, type = "success") {
  elements.statusText.textContent = message;
  elements.statusMessage.className = `status-message ${type} visible`;

  setTimeout(() => {
    elements.statusMessage.classList.remove("visible");
  }, 4000);
}

// Initialize
initAuth();
initIframeIntegration();


window.addSocialLink = function() {
  const container = document.getElementById('socialLinks');
  const index = container.children.length;
  const html = `
    <div class="social-link-group" data-index="${index}">
      <input class="form-input" placeholder="Type" data-field="type">
      <input class="form-input" placeholder="URL" data-field="url">
      <input class="form-input" placeholder="Icon" data-field="icon">
      <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
};

window.addImageInput = function() {
  const container = document.getElementById('imageList');
  const index = container.children.length;
  const html = `
    <div class="image-input-group">
      <input class="form-input" placeholder="Image URL" data-index="${index}">
      <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
};

window.addTagInput = function() {
  const container = document.getElementById('tagList');
  const index = container.children.length;
  const html = `
    <div class="tag-input-group">
      <input class="form-input" placeholder="Tag" data-index="${index}">
      <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
};


window.debugAdmin = function() {
  console.log('Edit Mode:', adminState.editMode);
  console.log('Editable Regions:', adminState.editableRegions);
  
  const iframeDoc = elements.siteIframe.contentDocument;
  if (iframeDoc) {
    console.log('Club cards found:', iframeDoc.querySelectorAll('.club-card').length);
    console.log('Event cards found:', iframeDoc.querySelectorAll('.event-card').length);
    console.log('Resource cards found:', iframeDoc.querySelectorAll('.resource-card').length);
  }
  
  console.log('Overlays in edit overlay:', document.querySelectorAll('.markdown-edit-overlay').length);
  console.log('Add buttons:', document.querySelectorAll('.add-markdown-btn').length);
};
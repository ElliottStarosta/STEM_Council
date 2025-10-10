// Admin state
const adminState = {
  user: null,
  editMode: false,
  pendingChanges: {},
  editableRegions: [],
  currentEdit: null,
  animationFrameId: null,
  // Track markdown file operations
  markdownChanges: {
    modified: {}, // { 'clubs/arduino-club.md': { frontmatter: {...}, body: '...' } }
    deleted: [], // ['events/old-event.md']
    created: [], // [{ type: 'clubs', data: {...} }]
  },
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

function startPositionTracking() {
  function updateLoop() {
    if (adminState.editMode) {
      updateHighlightPositions();
      adminState.animationFrameId = requestAnimationFrame(updateLoop);
    }
  }
  updateLoop();
}

function stopPositionTracking() {
  if (adminState.animationFrameId) {
    cancelAnimationFrame(adminState.animationFrameId);
    adminState.animationFrameId = null;
  }
}

// Initialize iframe integration
function initIframeIntegration() {
  elements.siteIframe.addEventListener("load", () => {
    console.log("Site loaded in iframe");
    if (adminState.editMode) {
      scanEditableContent();
      scanMarkdownContent();
    }
  });

  // Handle iframe scroll when in edit mode
  elements.siteIframe.addEventListener("load", () => {
    try {
      const iframeWindow = elements.siteIframe.contentWindow;
      const iframeDoc = elements.siteIframe.contentDocument;

      if (iframeWindow) {
        // Scroll listener
        iframeWindow.addEventListener(
          "scroll",
          () => {
            if (adminState.editMode) {
              updateHighlightPositions();
            }
          },
          true
        );

        // Also listen for resize events in the iframe
        iframeWindow.addEventListener("resize", () => {
          if (adminState.editMode) {
            updateHighlightPositions();
          }
        });
      }

      // Watch for dynamic content loading (like images finishing load)
      if (iframeDoc) {
        iframeDoc.addEventListener("DOMContentLoaded", () => {
          if (adminState.editMode) {
            setTimeout(() => updateHighlightPositions(), 100);
          }
        });

        // Listen for images loading
        iframeWindow.addEventListener("load", () => {
          if (adminState.editMode) {
            setTimeout(() => updateHighlightPositions(), 100);
          }
        });
      }
    } catch (e) {
      console.error("Cannot attach listeners:", e);
    }
  });
}

// Toggle edit mode
elements.editModeToggle.addEventListener("click", () => {
  adminState.editMode = !adminState.editMode;
  elements.editModeToggle.classList.toggle("active");

  if (adminState.editMode) {
    setTimeout(() => {
      scanEditableContent();
      scanMarkdownContent();
      startPositionTracking(); // Start continuous tracking
    }, 500);
  } else {
    stopPositionTracking(); // Stop tracking
    clearEditableHighlights();
    const iframeDoc = elements.siteIframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.querySelectorAll(".add-markdown-btn").forEach((btn) => {
        btn.style.display = "none";
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
      console.error("Cannot access iframe document");
      return;
    }

    console.log("Scanning markdown content...");

    // Scan for club cards
    const clubCards = iframeDoc.querySelectorAll(".club-card");
    console.log("Found club cards:", clubCards.length);
    clubCards.forEach((card) => {
      createMarkdownEditOverlay(card, "club");
    });

    // Scan for event cards
    const eventCards = iframeDoc.querySelectorAll(".event-card");
    console.log("Found event cards:", eventCards.length);
    eventCards.forEach((card) => {
      createMarkdownEditOverlay(card, "event");
    });

    // Scan for resource cards
    const resourceCards = iframeDoc.querySelectorAll(".resource-card");
    console.log("Found resource cards:", resourceCards.length);
    resourceCards.forEach((card) => {
      createMarkdownEditOverlay(card, "resource");
    });

    console.log(
      "Total markdown overlays created:",
      adminState.editableRegions.filter((r) => r.type === "markdown").length
    );

    // Add "Add New" buttons for each section
    createAddButtons(iframeDoc);
  } catch (error) {
    console.error("Cannot scan markdown content:", error);
  }
}

function createAddButtons(iframeDoc) {
  const sections = [
    { selector: ".clubs-grid", type: "club", label: "Add New Club" },
    { selector: ".events-grid", type: "event", label: "Add New Event" },
    {
      selector: ".resources-grid",
      type: "resource",
      label: "Add New Resource",
    },
  ];

  sections.forEach(({ selector, type, label }) => {
    const container = iframeDoc.querySelector(selector);
    if (!container) return;

    // Remove any previous add button
    const existingBtn =
      container.parentNode?.querySelector(".add-markdown-btn");
    if (existingBtn) {
      existingBtn.remove();
    }

    const addBtn = iframeDoc.createElement("button");
    addBtn.className = "add-markdown-btn";
    addBtn.innerHTML = `<i class="ri-add-line"></i> ${label}`;
    addBtn.style.cssText = `
      display: ${adminState.editMode ? "block" : "none"};
      margin: ${type === "resource" ? "24px auto 30px" : "24px auto 0 auto"};
      width: fit-content;
      padding: 10px 20px;
      font-size: 1rem;
      background: #2e7d32;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: relative;
      z-index: 99999;
      pointer-events: auto;
    `;

    // Use addEventListener for proper event handling
    addBtn.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Add button clicked for type:", type);

        // Call the parent window's function directly
        try {
          if (window.parent && window.parent.openMarkdownCreateModal) {
            window.parent.openMarkdownCreateModal(type);
          } else {
            // Fallback to postMessage
            window.parent.postMessage(
              {
                type: "openMarkdownCreate",
                contentType: type,
              },
              "*"
            );
          }
        } catch (err) {
          console.error("Error opening modal:", err);
        }
      },
      true
    );

    // Insert the button after the grid container
    if (container.parentNode) {
      container.parentNode.insertBefore(addBtn, container.nextSibling);
    }
  });
}

// Update the message listener to be more robust
window.addEventListener("message", function (event) {
  console.log("Message received:", event.data);
  if (event.data && event.data.type === "openMarkdownCreate") {
    openMarkdownCreateModal(event.data.contentType);
  }
});

// Make sure openMarkdownCreateModal is globally accessible
window.openMarkdownCreateModal = function (type) {
  console.log("Opening create modal for:", type);
  adminState.currentEdit = {
    type,
    isMarkdown: true,
    isNew: true,
  };

  elements.modalForm.innerHTML = buildMarkdownForm(type, {});
  elements.editModal.classList.add("active");
};

// Create editable highlight
function createEditableHighlight(element) {
  const iframeWindow = elements.siteIframe.contentWindow;
  const rect = element.getBoundingClientRect();

  const highlight = document.createElement("div");
  highlight.className = "editable-highlight";

  // Position relative to viewport, accounting for iframe scroll
  highlight.style.top = rect.top + 15 + "px";
  highlight.style.left = rect.left + "px";
  highlight.style.width = rect.width + "px";
  highlight.style.height = rect.height + "px";
  highlight.style.pointerEvents = "none"; // Don't block scrolling

  const editBtn = document.createElement("div");
  editBtn.className = "edit-button";
  editBtn.innerHTML = '<i class="ri-edit-line"></i>';
  editBtn.style.pointerEvents = "auto"; // Button accepts clicks
  highlight.appendChild(editBtn);

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditModal(element);
  });

  elements.editOverlay.appendChild(highlight);
  adminState.editableRegions.push({ element, highlight });
}

function createMarkdownEditOverlay(element, type) {
  const iframeRect = elements.siteIframe.getBoundingClientRect();
  const iframeDoc = elements.siteIframe.contentDocument;
  const iframeWindow = elements.siteIframe.contentWindow;

  // Get element position relative to iframe viewport
  const rect = element.getBoundingClientRect();

  const filename = element.dataset.markdownFile;

  const overlay = document.createElement("div");
  overlay.className = "markdown-edit-overlay";

  // Add yellow class only for clubs
  if (type === "club") {
    overlay.classList.add("markdown-edit-overlay-yellow");
  }

  // Position relative to parent window: iframe position + element position in iframe
  // Don't add scroll offset here - getBoundingClientRect already accounts for scroll
  overlay.style.top = iframeRect.top + rect.top + "px";
  overlay.style.left = iframeRect.left + rect.left + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.pointerEvents = "none";

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "markdown-edit-buttons";
  buttonGroup.style.pointerEvents = "auto"; // Make buttons clickable

  // Edit button with circular style
  const editBtn = document.createElement("div");
  editBtn.className = "markdown-edit-btn";
  editBtn.innerHTML = '<i class="ri-edit-line"></i>';
  editBtn.style.pointerEvents = "auto";
  editBtn.onclick = (e) => {
    e.stopPropagation();
    openMarkdownEditModal(element, type, filename);
  };

  // Delete button with circular style
  const deleteBtn = document.createElement("div");
  deleteBtn.className = "markdown-delete-btn";
  deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
  deleteBtn.style.pointerEvents = "auto";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteMarkdownFile(filename, type);
  };

  buttonGroup.appendChild(editBtn);
  buttonGroup.appendChild(deleteBtn);
  overlay.appendChild(buttonGroup);

  elements.editOverlay.appendChild(overlay);
  adminState.editableRegions.push({ element, overlay, type: "markdown" });
}

function openMarkdownEditModal(element, type, filename) {
  adminState.currentEdit = {
    element,
    type,
    filename,
    isMarkdown: true,
  };

  // Fetch current data from element's data attributes or parse from content
  const currentData = extractMarkdownData(element, type);

  elements.modalForm.innerHTML = buildMarkdownForm(type, currentData);
  elements.editModal.classList.add("active");
}

function extractMarkdownData(element, type) {
  const data = {};

  if (type === "club") {
    data.name = element.querySelector(".club-name")?.textContent || "";
    data.description =
      element.querySelector(".club-description")?.textContent || "";
    data.icon =
      element.querySelector(".club-icon i")?.className || "ri-star-line";

    const socialLinks = [];
    element.querySelectorAll(".club-link").forEach((link) => {
      socialLinks.push({
        type: link.getAttribute("title") || "Link",
        url: link.getAttribute("href") || "#",
        icon: link.querySelector("i")?.className || "ri-link",
      });
    });
    data.socialLinks = socialLinks;
  }

  if (type === "event") {
    data.name = element.querySelector(".event-name")?.textContent || "";
    data.description =
      element.querySelector(".event-preview")?.textContent || "";

    // Try to get date from data attributes if available
    const eventId = element.dataset.eventId;
    // Access eventsManager from inside the iframe, not the admin window
    const iframeWindow =
      elements.siteIframe && elements.siteIframe.contentWindow;
    const eventsManager = iframeWindow && iframeWindow.eventsManager;
    if (eventId && eventsManager && eventsManager.eventsData) {
      const eventData = eventsManager.eventsData.find((e) => e.id == eventId);
      if (eventData) {
        data.startDate = eventData.startDate;
        data.endDate = eventData.endDate;
        data.images = eventData.images || [];
        data.body = eventData.description || "";
      }
    }
  }

  if (type === "resource") {
    data.title = element.querySelector(".card-title")?.textContent || "";
    data.description =
      element.querySelector(".card-description")?.textContent || "";
    data.icon =
      element.querySelector(".card-icon i")?.className || "ri-star-line";
    data.type = element.dataset.type || "videos";

    const tags = [];
    element.querySelectorAll(".tag").forEach((tag) => {
      tags.push({ tag: tag.textContent });
    });
    data.tags = tags;

    // Try to extract URL from button
    const btn = element.querySelector(".resource-btn");
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
        <input class="form-input" id="name" type="text" value="${escapeHtml(
          data.name || ""
        )}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea class="form-textarea" id="description" rows="4" required>${escapeHtml(
          data.description || ""
        )}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="icon">Icon (Remix Icon class)</label>
        <input class="form-input" id="icon" type="text" value="${escapeHtml(
          data.icon || "ri-star-line"
        )}" required placeholder="e.g. ri-code-s-slash-line">
        <small style="color: #888; font-size: 12px;">Find icons at: <a href="https://remixicon.com" target="_blank">remixicon.com</a></small>
      </div>
      <div class="form-group">
        <label class="form-label">Social Links</label>
        <div id="socialLinks">
          ${(data.socialLinks || [])
            .map(
              (link, i) => `
            <div class="social-link-group" data-index="${i}">
              <input class="form-input" placeholder="Type" value="${escapeHtml(
                link.type || ""
              )}" data-field="type">
              <input class="form-input" placeholder="URL" value="${escapeHtml(
                link.url || ""
              )}" data-field="url">
              <input class="form-input" placeholder="Icon" value="${escapeHtml(
                link.icon || ""
              )}" data-field="icon">
              <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
            </div>
          `
            )
            .join("")}
        </div>
        <button type="button" class="add-link-btn" onclick="addSocialLink()">+ Add Link</button>
      </div>
    `,
    event: `
      <div class="form-group">
        <label class="form-label" for="name">Event Name</label>
        <input class="form-input" id="name" type="text" value="${escapeHtml(
          data.name || ""
        )}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="startDate">Start Date</label>
        <input class="form-input" id="startDate" type="datetime-local" value="${
          data.startDate
            ? new Date(data.startDate).toISOString().slice(0, 16)
            : ""
        }" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="endDate">End Date</label>
        <input class="form-input" id="endDate" type="datetime-local" value="${
          data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : ""
        }" required>
      </div>
      <div class="form-group">
        <label class="form-label">Images (URLs)</label>
        <div id="imageList">
          ${(data.images || [])
            .map(
              (img, i) => `
            <div class="image-input-group">
              <input class="form-input" placeholder="Image URL" value="${escapeHtml(
                img.image || img
              )}" data-index="${i}">
              <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
            </div>
          `
            )
            .join("")}
        </div>
        <button type="button" class="add-link-btn" onclick="addImageInput()">+ Add Image</button>
      </div>
      <div class="form-group">
        <label class="form-label" for="body">Description (Markdown)</label>
        <textarea class="form-textarea" id="body" rows="8" required>${escapeHtml(
          data.body || ""
        )}</textarea>
      </div>
    `,
    resource: `
      <div class="form-group">
        <label class="form-label" for="title">Resource Title</label>
        <input class="form-input" id="title" type="text" value="${escapeHtml(
          data.title || ""
        )}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="description">Description</label>
        <textarea class="form-textarea" id="description" rows="3" required>${escapeHtml(
          data.description || ""
        )}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="url">URL</label>
        <input class="form-input" id="url" type="url" value="${escapeHtml(
          data.url || ""
        )}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="type">Type</label>
        <select class="form-input" id="type" required>
          <option value="videos" ${
            data.type === "videos" ? "selected" : ""
          }>Videos</option>
          <option value="courses" ${
            data.type === "courses" ? "selected" : ""
          }>Courses</option>
          <option value="tools" ${
            data.type === "tools" ? "selected" : ""
          }>Tools</option>
          <option value="competitions" ${
            data.type === "competitions" ? "selected" : ""
          }>Competitions</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tags</label>
        <div id="tagList">
          ${(data.tags || [])
            .map(
              (tag, i) => `
            <div class="tag-input-group">
              <input class="form-input" placeholder="Tag" value="${escapeHtml(
                tag.tag || tag
              )}" data-index="${i}">
              <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
            </div>
          `
            )
            .join("")}
        </div>
        <button type="button" class="add-link-btn" onclick="addTagInput()">+ Add Tag</button>
      </div>
      <div class="form-group">
        <label class="form-label" for="icon">Icon (Remix Icon class)</label>
        <input class="form-input" id="icon" type="text" value="${escapeHtml(
          data.icon || "ri-star-line"
        )}" required placeholder="e.g. ri-video-fill">
        <small style="color: #888; font-size: 12px;">Find icons at: <a href="https://remixicon.com" target="_blank">remixicon.com</a></small>
      </div>
    `,
  };

  return forms[type] || "";
}

function openMarkdownCreateModal(type) {
  adminState.currentEdit = {
    type,
    isMarkdown: true,
    isNew: true,
  };

  elements.modalForm.innerHTML = buildMarkdownForm(type, {});
  elements.editModal.classList.add("active");
}

// Update highlight positions on scroll
function updateHighlightPositions() {
  try {
    const iframeRect = elements.siteIframe.getBoundingClientRect();

    adminState.editableRegions.forEach(
      ({ element, highlight, overlay, type }) => {
        const rect = element.getBoundingClientRect();

        if (highlight) {
          highlight.style.top = rect.top + 15 + "px";
          highlight.style.left = rect.left + "px";
          highlight.style.width = rect.width + "px";
          highlight.style.height = rect.height + "px";
          highlight.style.pointerEvents = "none";
        }

        if (overlay) {
          // Position relative to parent window: iframe position + element position in iframe
          overlay.style.top = iframeRect.top + rect.top + "px";
          overlay.style.left = iframeRect.left + rect.left + "px";
          overlay.style.width = rect.width + "px";
          overlay.style.height = rect.height + "px";
          overlay.style.pointerEvents = "none";

          // Ensure buttons are clickable
          const buttonGroup = overlay.querySelector(".markdown-edit-buttons");
          if (buttonGroup) {
            buttonGroup.style.pointerEvents = "auto";
          }
        }
      }
    );
  } catch (e) {
    console.error("Error updating positions:", e);
  }
}

function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.toString().replace(/[&<>"']/g, (m) => map[m]);
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
    const slug = (formData.name || formData.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const newFilename = `${type}s/${slug}.md`;

    adminState.markdownChanges.created.push({
      type,
      filename: newFilename,
      data: formData,
    });

    // Insert a live preview card for the newly created item
    try {
      insertNewMarkdownCard(type, formData, newFilename);
    } catch (e) {
      console.warn("Failed to insert new card preview:", e);
    }
  } else {
    adminState.markdownChanges.modified[filename] = formData;
    // Update live preview in iframe for existing items
    try {
      updateMarkdownPreview(
        type,
        adminState.currentEdit.element,
        formData,
        filename
      );
    } catch (e) {
      console.warn("Preview update failed:", e);
    }
  }

  updateChangesUI();
  showStatus(
    `${type} ${isNew ? "created" : "updated"}. Click "Save Changes" to commit.`,
    "success"
  );
}

function collectFormData(type) {
  const data = {};

  // Collect all form inputs
  elements.modalForm
    .querySelectorAll(".form-input, .form-textarea, select")
    .forEach((input) => {
      if (input.id) {
        data[input.id] = input.value;
      }
    });

  // Collect arrays (social links, images, tags)
  if (type === "club") {
    data.socialLinks = Array.from(
      document.querySelectorAll(".social-link-group")
    ).map((group) => ({
      type: group.querySelector('[data-field="type"]').value,
      url: group.querySelector('[data-field="url"]').value,
      icon: group.querySelector('[data-field="icon"]').value,
    }));
  }

  if (type === "event") {
    data.images = Array.from(
      document.querySelectorAll(".image-input-group input")
    ).map((input) => ({
      image: input.value,
    }));
  }

  if (type === "resource") {
    data.tags = Array.from(
      document.querySelectorAll(".tag-input-group input")
    ).map((input) => ({
      tag: input.value,
    }));
  }

  return data;
}

// Update the card preview inside the iframe to reflect pending edits
function updateMarkdownPreview(type, element, data, filename) {
  if (!element) return;
  const iframeWindow = elements.siteIframe && elements.siteIframe.contentWindow;
  const iframeDoc = elements.siteIframe && elements.siteIframe.contentDocument;

  if (type === "club") {
    const nameEl = element.querySelector(".club-name");
    const descEl = element.querySelector(".club-description");
    const iconEl = element.querySelector(".club-icon i");
    const linksContainer = element.querySelector(".club-links");
    if (nameEl) nameEl.textContent = data.name || "";
    if (descEl) descEl.textContent = data.description || "";
    if (iconEl && data.icon) iconEl.className = data.icon;
    if (linksContainer && Array.isArray(data.socialLinks)) {
      linksContainer.innerHTML = data.socialLinks
        .map((link) => {
          const type = link.type || "Link";
          const url = link.url || "#";
          const icon = link.icon || "ri-link";
          return `<a href="${url}" class="club-link" title="${escapeHtml(
            type
          )}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i></a>`;
        })
        .join("");
    }
    // Keep data-markdown-file as is; filename already identifies the card
  }

  if (type === "event") {
    const nameEl = element.querySelector(".event-name");
    const previewEl = element.querySelector(".event-preview");
    const dateEl = element.querySelector(".event-date");
    const imageEl = element.querySelector(".event-image");

    if (nameEl) nameEl.textContent = data.name || "";
    if (previewEl)
      previewEl.textContent =
        (data.body || "").length > 100
          ? (data.body || "").substring(0, 100) + "..."
          : data.body || "";

    if (dateEl) {
      const eventsManager = iframeWindow && iframeWindow.eventsManager;
      if (
        eventsManager &&
        typeof eventsManager.formatDate === "function" &&
        data.startDate &&
        data.endDate
      ) {
        dateEl.textContent = eventsManager.formatDate(
          data.startDate,
          data.endDate
        );
      } else if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const opts = { year: "numeric", month: "long", day: "numeric" };
        const same = start.toDateString() === end.toDateString();
        dateEl.textContent = same
          ? start.toLocaleDateString("en-US", opts)
          : `${start.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })} - ${end.toLocaleDateString("en-US", opts)}`;
      }
    }

    if (imageEl && Array.isArray(data.images)) {
      const first = data.images[0];
      let src =
        typeof first === "object" && first !== null
          ? first.image || ""
          : first || "";

      // Convert Google Drive URLs using the eventsManager method
      const eventsManager = iframeWindow && iframeWindow.eventsManager;
      if (
        eventsManager &&
        typeof eventsManager.convertGoogleDriveUrl === "function"
      ) {
        src = eventsManager.convertGoogleDriveUrl(src);
      }

      if (src) imageEl.src = src;
    }

    // Sync eventsManager data with converted URLs
    const eventId = element.dataset.eventId;
    const eventsManager = iframeWindow && iframeWindow.eventsManager;
    if (eventId && eventsManager && Array.isArray(eventsManager.eventsData)) {
      const match = eventsManager.eventsData.find((e) => e.id == eventId);
      if (match) {
        if (data.name !== undefined) match.name = data.name;
        if (data.body !== undefined) match.description = data.body;
        if (Array.isArray(data.images)) {
          // Convert Google Drive URLs before storing
          match.images = data.images
            .map((img) => {
              let url =
                typeof img === "object" && img !== null ? img.image || "" : img;
              return eventsManager.convertGoogleDriveUrl(url);
            })
            .filter(Boolean);
        }
        if (data.startDate) match.startDate = data.startDate;
        if (data.endDate) match.endDate = data.endDate;
      }
    }
  }

  if (type === "resource") {
    const titleEl = element.querySelector(".card-title");
    const descEl = element.querySelector(".card-description");
    const iconEl = element.querySelector(".card-icon i");
    const tagsContainer = element.querySelector(".card-tags");
    const btn = element.querySelector(".resource-btn");
    if (titleEl) titleEl.textContent = data.title || "";
    if (descEl) descEl.textContent = data.description || "";
    if (iconEl && data.icon) iconEl.className = data.icon;
    if (tagsContainer && Array.isArray(data.tags)) {
      tagsContainer.innerHTML = data.tags
        .map((t) => `<span class="tag">${escapeHtml(t.tag || "")}</span>`)
        .join("");
    }
    if (btn && data.url) {
      btn.onclick = function () {
        window.open(data.url, "_blank");
      };
    }
  }

  // Refresh overlay positions after DOM changes
  updateHighlightPositions();
}

// Insert a new card into the iframe grid as a live preview for newly created markdown items
function insertNewMarkdownCard(type, data, filename) {
  const iframeWindow = elements.siteIframe && elements.siteIframe.contentWindow;
  const iframeDoc = elements.siteIframe && elements.siteIframe.contentDocument;
  if (!iframeDoc) return;

  if (type === "club") {
    const grid = iframeDoc.querySelector(".clubs-grid");
    if (!grid) return;
    const card = iframeDoc.createElement("div");
    card.className = "club-card";
    card.setAttribute(
      "data-club",
      (data.name || "").toLowerCase().replace(/\s+/g, "-")
    );
    card.setAttribute("data-markdown-file", filename);
    card.innerHTML = `
      <div class="club-card-inner">
        <div class="club-icon"><i class="${
          data.icon || "ri-star-line"
        }"></i></div>
        <h3 class="club-name">${escapeHtml(data.name || "")}</h3>
        <p class="club-description">${escapeHtml(data.description || "")}</p>
        <div class="club-links">
          ${(data.socialLinks || [])
            .map(
              (link) =>
                `<a href="${
                  link.url || "#"
                }" class="club-link" title="${escapeHtml(
                  link.type || "Link"
                )}" target="_blank" rel="noopener noreferrer"><i class="${
                  link.icon || "ri-link"
                }"></i></a>`
            )
            .join("")}
        </div>
      </div>
      <div class="club-card-glow"></div>
    `;
    grid.appendChild(card);

    // Make sure the new card is visible (bypass initial animation states)
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";

    // Create overlay/edit controls for this new card
    createMarkdownEditOverlay(card, "club");
  }

if (type === 'event') {
  const grid = iframeDoc.getElementById('eventsGrid') || iframeDoc.querySelector('.events-grid');
  if (!grid) return;

  let newId = 1;
  const eventsManager = iframeWindow && iframeWindow.eventsManager;
  if (eventsManager && Array.isArray(eventsManager.eventsData) && eventsManager.eventsData.length > 0) {
    newId = Math.max(...eventsManager.eventsData.map(e => Number(e.id) || 0)) + 1;
  }

  const images = Array.isArray(data.images) ? data.images.map(img => {
    let url = (typeof img === 'object' && img !== null) ? (img.image || '') : img;
    // Convert Google Drive URLs
    if (eventsManager && typeof eventsManager.convertGoogleDriveUrl === 'function') {
      url = eventsManager.convertGoogleDriveUrl(url);
    }
    return url;
  }) : [];
  
  const firstImage = images[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
  const card = iframeDoc.createElement('div');
  card.className = 'event-card';
  card.setAttribute('data-event-id', String(newId));
  card.setAttribute('data-markdown-file', filename);
  const formattedDate = (eventsManager && typeof eventsManager.formatDate === 'function' && data.startDate && data.endDate)
    ? eventsManager.formatDate(data.startDate, data.endDate)
    : '';
  card.innerHTML = `
    <img src="${firstImage}" alt="${escapeHtml(data.name || '')}" class="event-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'">
    <div class="event-content">
      <div class="event-date">${formattedDate}</div>
      <h3 class="event-name">${escapeHtml(data.name || '')}</h3>
      <p class="event-preview">${escapeHtml((data.body || '').length > 100 ? (data.body || '').substring(0, 100) + '...' : (data.body || ''))}</p>
      <button class="event-view-more">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>
  `;
  grid.appendChild(card);

  card.style.opacity = '1';
  card.style.transform = 'translateY(0)';

  if (eventsManager) {
    const newEvent = {
      id: newId,
      name: data.name || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      description: data.body || '',
      images: images.length ? images : ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'],
      filename: filename.replace(/^events\//, '')
    };
    eventsManager.eventsData.push(newEvent);
  }

  createMarkdownEditOverlay(card, 'event');
}

  if (type === "resource") {
    const grid = iframeDoc.querySelector(".resources-grid");
    if (!grid) return;
    const card = iframeDoc.createElement("div");
    card.className = "resource-card";
    card.setAttribute("data-type", data.type || "videos");
    card.setAttribute("data-markdown-file", filename);
    const tagsHTML = (data.tags || [])
      .map((t) => `<span class="tag">${escapeHtml(t.tag || "")}</span>`)
      .join("");
    card.innerHTML = `
      <div class="card-icon"><i class="${
        data.icon || "ri-star-line"
      }"></i></div>
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(data.title || "")}</h3>
        <p class="card-description">${escapeHtml(data.description || "")}</p>
        <div class="card-tags">${tagsHTML}</div>
      </div>
      <div class="card-action">
        <button class="resource-btn">Visit Now</button>
      </div>
    `;
    const btn = card.querySelector(".resource-btn");
    if (btn && data.url) {
      btn.onclick = function () {
        window.open(data.url, "_blank");
      };
    }
    grid.appendChild(card);

    // Make sure the new card is visible and not filtered out
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
    card.classList.remove("hidden", "fade-out");
    card.classList.add("fade-in");

    // If a category tab is active that would hide this card, switch to 'all' to show it
    const activeTab = iframeDoc.querySelector(".category-tab.active");
    const activeCategory = activeTab && activeTab.getAttribute("data-category");
    if (activeCategory && activeCategory !== "all") {
      const matches = (data.type || "videos") === activeCategory;
      if (!matches) {
        const allTab = Array.from(
          iframeDoc.querySelectorAll(".category-tab")
        ).find((t) => t.getAttribute("data-category") === "all");
        if (allTab) {
          allTab.click();
        } else {
          // Fallback: ensure the card is displayed regardless
          card.style.display = "block";
        }
      }
    }

    createMarkdownEditOverlay(card, "resource");
  }

  // Refresh overlay layout after insertion
  updateHighlightPositions();
}

function deleteMarkdownFile(filename, type) {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

  let fileToDelete = filename;
  if (type === "event" && !filename.startsWith("events/")) {
    fileToDelete = `events/${filename}`;
  }
  adminState.markdownChanges.deleted.push(fileToDelete);
  console.log("Marked for deletion:", fileToDelete);
  // Remove from UI
  const element = adminState.editableRegions.find(
    (r) => r.element.dataset.markdownFile === filename
  );
  if (element) {
    element.element.style.opacity = "0.3";
    element.element.style.pointerEvents = "none";
  }

  updateChangesUI();
  showStatus(
    `${type} marked for deletion. Click "Save Changes" to commit.`,
    "success"
  );
}

elements.modalCloseBtn.addEventListener("click", closeEditModal);
elements.modalCancelBtn.addEventListener("click", closeEditModal);

// Save edit from modal
elements.modalSaveBtn.addEventListener("click", () => {
  if (adminState.currentEdit?.isMarkdown) {
    saveMarkdownChanges();
    closeEditModal();
  } else {
    // Existing JSON save logic
    const newValue = document.getElementById("editContent")?.value.trim();

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
  elements.changesIndicator.style.display = totalCount > 0 ? "flex" : "none";
  elements.discardBtn.style.display = totalCount > 0 ? "flex" : "none";
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
elements.saveBtn.addEventListener("click", async () => {
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
      user: adminState.user.email,
    };

    const response = await fetch("/.netlify/functions/save-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
      window.location.href = "/admin/build.html";
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

window.addSocialLink = function () {
  const container = document.getElementById("socialLinks");
  const index = container.children.length;
  const html = `
    <div class="social-link-group" data-index="${index}">
      <input class="form-input" placeholder="Type" data-field="type">
      <input class="form-input" placeholder="URL" data-field="url">
      <input class="form-input" placeholder="Icon" data-field="icon">
      <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
};

window.addImageInput = function () {
  const container = document.getElementById("imageList");
  const index = container.children.length;
  const html = `
    <div class="image-input-group">
      <input class="form-input" placeholder="Image URL" data-index="${index}">
      <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
};

window.addTagInput = function () {
  const container = document.getElementById("tagList");
  const index = container.children.length;
  const html = `
    <div class="tag-input-group">
      <input class="form-input" placeholder="Tag" data-index="${index}">
      <button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">×</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
};

window.debugAdmin = function () {
  console.log("Edit Mode:", adminState.editMode);
  console.log("Editable Regions:", adminState.editableRegions);

  const iframeDoc = elements.siteIframe.contentDocument;
  if (iframeDoc) {
    console.log(
      "Club cards found:",
      iframeDoc.querySelectorAll(".club-card").length
    );
    console.log(
      "Event cards found:",
      iframeDoc.querySelectorAll(".event-card").length
    );
    console.log(
      "Resource cards found:",
      iframeDoc.querySelectorAll(".resource-card").length
    );
  }

  console.log(
    "Overlays in edit overlay:",
    document.querySelectorAll(".markdown-edit-overlay").length
  );
  console.log(
    "Add buttons:",
    document.querySelectorAll(".add-markdown-btn").length
  );
};

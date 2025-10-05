/* ==========================================
   STEM Council Admin Interface
   Location: /admin/scripts/admin.js
   ========================================== */

// Admin state
const adminState = {
  user: null,
  editMode: false,
  pendingChanges: {},
  editableRegions: [],
  currentEdit: null,
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

/* ==========================================
   Authentication
   ========================================== */
function initAuth() {
  if (!window.netlifyIdentity) {
    showStatus("Authentication service unavailable", "error");
    return;
  }

  netlifyIdentity.on("init", (user) => {
    console.log("Identity initialized:", user ? "Authenticated" : "Not authenticated");

    if (!user) {
      netlifyIdentity.open();
    } else {
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

/* ==========================================
   Iframe Integration
   ========================================== */
function initIframeIntegration() {
  elements.siteIframe.addEventListener("load", () => {
    console.log("Site loaded in iframe");
    if (adminState.editMode) {
      scanEditableContent();
    }
  });

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
        );
      }
    } catch (e) {
      console.error("Cannot attach scroll listener:", e);
    }
  });
}

/* ==========================================
   Edit Mode Toggle
   ========================================== */
elements.editModeToggle.addEventListener("click", () => {
  adminState.editMode = !adminState.editMode;
  elements.editModeToggle.classList.toggle("active");

  if (adminState.editMode) {
    scanEditableContent();
  } else {
    clearEditableHighlights();
  }
});

/* ==========================================
   Scan Editable Content
   ========================================== */
function scanEditableContent() {
  try {
    const iframeDoc = elements.siteIframe.contentDocument;
    if (!iframeDoc) {
      showStatus("Cannot access iframe content", "error");
      return;
    }

    clearEditableHighlights();

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

/* ==========================================
   Create Editable Highlight
   ========================================== */
function createEditableHighlight(element) {
  const rect = element.getBoundingClientRect();
  const iframeRect = elements.siteIframe.getBoundingClientRect();

  const highlight = document.createElement("div");
  highlight.className = "editable-highlight";

  highlight.style.top = rect.top + iframeRect.top + "px";
  highlight.style.left = rect.left + iframeRect.left + "px";
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

/* ==========================================
   Update Highlight Positions
   ========================================== */
function updateHighlightPositions() {
  try {
    const iframeRect = elements.siteIframe.getBoundingClientRect();
    
    adminState.editableRegions.forEach(({ element, highlight }) => {
      const rect = element.getBoundingClientRect();
      highlight.style.top = rect.top + iframeRect.top + "px";
      highlight.style.left = rect.left + iframeRect.left + "px";
      highlight.style.width = rect.width + "px";
      highlight.style.height = rect.height + "px";
    });
  } catch (e) {
    console.error("Error updating positions:", e);
  }
}

/* ==========================================
   Clear Highlights
   ========================================== */
function clearEditableHighlights() {
  elements.editOverlay.innerHTML = "";
  adminState.editableRegions = [];
}

/* ==========================================
   Edit Modal
   ========================================== */
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

function closeEditModal() {
  elements.editModal.classList.remove("active");
  adminState.currentEdit = null;
}

elements.modalCloseBtn.addEventListener("click", closeEditModal);
elements.modalCancelBtn.addEventListener("click", closeEditModal);

elements.modalSaveBtn.addEventListener("click", () => {
  const newValue = document.getElementById("editContent").value.trim();

  if (adminState.currentEdit && newValue !== adminState.currentEdit.originalValue) {
    adminState.currentEdit.element.textContent = newValue;

    const changeKey = `${adminState.currentEdit.contentFile}:${adminState.currentEdit.contentField}`;
    adminState.pendingChanges[changeKey] = {
      file: adminState.currentEdit.contentFile,
      field: adminState.currentEdit.contentField,
      value: newValue,
      originalValue: adminState.currentEdit.originalValue,
    };

    updateChangesUI();
    showStatus('Change recorded. Click "Save Changes" to deploy.', "success");
  }

  closeEditModal();
});

/* ==========================================
   Changes Management
   ========================================== */
function updateChangesUI() {
  const count = Object.keys(adminState.pendingChanges).length;
  elements.changesCount.textContent = count;
  elements.changesIndicator.style.display = count > 0 ? "flex" : "none";
  elements.discardBtn.style.display = count > 0 ? "flex" : "none";
  elements.saveBtn.disabled = count === 0;
}

elements.discardBtn.addEventListener("click", () => {
  if (confirm("Discard all unsaved changes?")) {
    adminState.pendingChanges = {};
    updateChangesUI();
    elements.siteIframe.contentWindow.location.reload();
    showStatus("Changes discarded", "success");
  }
});

/* ==========================================
   Save Changes
   ========================================== */
elements.saveBtn.addEventListener("click", async () => {
  if (Object.keys(adminState.pendingChanges).length === 0) return;

  if (!adminState.user) {
    showStatus("You must be logged in to save changes", "error");
    return;
  }

  elements.saveBtn.disabled = true;
  elements.saveBtn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';

  try {
    const token = adminState.user.token.access_token;

    const changesArray = Object.values(adminState.pendingChanges).map((change) => ({
      file: change.file,
      field: change.field,
      value: change.value,
    }));

    const response = await fetch("/.netlify/functions/save-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        changes: changesArray,
        user: adminState.user.email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save changes");
    }

    const result = await response.json();
    console.log("Save result:", result);

    adminState.pendingChanges = {};
    updateChangesUI();
    showStatus("Changes saved! Starting deployment...", "success");

    // Open build page in new window
    window.open("/admin/build.html", "_blank", "width=800,height=600");

    setTimeout(() => {
      elements.siteIframe.contentWindow.location.reload();
      showStatus("Deployment initiated! Check build window for progress.", "success");
    }, 1000);

  } catch (error) {
    console.error("Save error:", error);
    showStatus("Failed to save: " + error.message, "error");
  } finally {
    elements.saveBtn.disabled = false;
    elements.saveBtn.innerHTML = '<i class="ri-save-line"></i> Save Changes';
  }
});

/* ==========================================
   Logout
   ========================================== */
elements.logoutBtn.addEventListener("click", () => {
  if (Object.keys(adminState.pendingChanges).length > 0) {
    if (!confirm("You have unsaved changes. Are you sure you want to logout?")) {
      return;
    }
  }
  netlifyIdentity.logout();
});

/* ==========================================
   Status Messages
   ========================================== */
function showStatus(message, type = "success") {
  elements.statusText.textContent = message;
  elements.statusMessage.className = `status-message ${type} visible`;

  setTimeout(() => {
    elements.statusMessage.classList.remove("visible");
  }, 4000);
}

/* ==========================================
   Initialize
   ========================================== */
initAuth();
initIframeIntegration();
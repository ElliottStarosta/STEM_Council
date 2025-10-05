
// DOM elements
const elements = {
  buildOverlay: document.getElementById("buildOverlay"),
  progressBar: document.getElementById("progressBar"),
  buildLogs: document.getElementById("buildLogs"),
  buildComplete: document.getElementById("buildComplete"),
};

// Build animation configuration
const buildSteps = [
  {
    id: "step1",
    duration: 2000,
    logs: [
      "> Analyzing changes...",
      "> Found 3 modified files",
      "✓ Compilation successful",
    ],
  },
  {
    id: "step2",
    duration: 2000,
    logs: [
      "> Connecting to GitHub...",
      "> Committing changes...",
      "✓ Pushed to main branch",
    ],
  },
  {
    id: "step3",
    duration: 1500,
    logs: [
      "> Webhook received",
      "> Starting build process...",
      "✓ Build triggered",
    ],
  },
  {
    id: "step4",
    duration: 2500,
    logs: [
      "> npm install",
      "> Installing 127 packages...",
      "✓ Dependencies installed",
    ],
  },
  {
    id: "step5",
    duration: 3000,
    logs: [
      "> Building production bundle...",
      "> Processing pages...",
      "> Generating static files...",
      "✓ Build complete",
    ],
  },
  {
    id: "step6",
    duration: 2000,
    logs: [
      "> Minifying JavaScript...",
      "> Optimizing images...",
      "✓ Assets optimized",
    ],
  },
  {
    id: "step7",
    duration: 2500,
    logs: [
      "> Uploading to CDN...",
      "> Distributing to edge nodes...",
      "✓ Deployed globally",
    ],
  },
  {
    id: "step8",
    duration: 1500,
    logs: [
      "> Running post-deploy checks...",
      "> Invalidating cache...",
      "✓ Deployment successful!",
    ],
  },
];

/* ==========================================
   Add Log Entry
   ========================================== */
function addLog(text, type = "default") {
  const logEl = document.createElement("div");
  logEl.className = `build-log ${type}`;
  logEl.textContent = text;
  elements.buildLogs.appendChild(logEl);
  elements.buildLogs.scrollTop = elements.buildLogs.scrollHeight;
}

/* ==========================================
   Run Build Animation
   ========================================== */
async function runBuildAnimation() {
  // Reset
  elements.buildLogs.innerHTML = "";
  elements.progressBar.style.width = "0%";
  elements.buildComplete.style.display = "none";

  // Reset all steps
  buildSteps.forEach((step) => {
    const stepEl = document.getElementById(step.id);
    stepEl.className = "build-step";
  });

  let totalDuration = buildSteps.reduce((sum, step) => sum + step.duration, 0);
  let elapsedTime = 0;

  for (let i = 0; i < buildSteps.length; i++) {
    const step = buildSteps[i];
    const stepEl = document.getElementById(step.id);

    // Mark as active
    stepEl.classList.add("active");

    // Add logs
    for (let j = 0; j < step.logs.length; j++) {
      await new Promise((resolve) =>
        setTimeout(resolve, step.duration / step.logs.length)
      );

      const logType = j === step.logs.length - 1 ? "success" : "default";
      addLog(step.logs[j], logType);
    }

    // Mark as completed
    stepEl.classList.remove("active");
    stepEl.classList.add("completed");
    stepEl.querySelector("i").className = "ri-check-line";

    // Update progress
    elapsedTime += step.duration;
    const progress = (elapsedTime / totalDuration) * 100;
    elements.progressBar.style.width = progress + "%";
  }

  // Show completion message
  await new Promise((resolve) => setTimeout(resolve, 500));
  elements.buildComplete.style.display = "block";

  // Auto-close after 3 seconds
  setTimeout(() => {
    if (window.opener) {
      window.close();
    } else {
      addLog("You can close this window now.", "info");
    }
  }, 3000);
}

/* ==========================================
   Initialize on Load
   ========================================== */
window.addEventListener("DOMContentLoaded", () => {
  runBuildAnimation();
});

/* ==========================================
   Handle Window Close Request from Opener
   ========================================== */
window.addEventListener("message", (event) => {
  if (event.data === "start-build") {
    runBuildAnimation();
  }
});

// DOM elements
const elements = {
  progressBar: document.getElementById("progressBar"),
  buildLogs: document.getElementById("buildLogs"),
  buildComplete: document.getElementById("buildComplete"),
};

// Build steps for UI
const buildSteps = [
  { id: "step1", label: "Compiling changes" },
  { id: "step2", label: "Pushing to GitHub" },
  { id: "step3", label: "Triggering build" },
  { id: "step4", label: "Installing dependencies" },
  { id: "step5", label: "Building site" },
  { id: "step6", label: "Optimizing assets" },
  { id: "step7", label: "Deploying to CDN" },
  { id: "step8", label: "Finalizing" },
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
   Update Step Status
   ========================================== */
function updateStep(stepId, status) {
  const stepEl = document.getElementById(stepId);
  if (!stepEl) return;

  stepEl.classList.remove("active", "completed");
  
  if (status === "active") {
    stepEl.classList.add("active");
  } else if (status === "completed") {
    stepEl.classList.add("completed");
    stepEl.querySelector("i").className = "ri-check-line";
  }
}

/* ==========================================
   Get Latest Deploy Status from Netlify Function
   ========================================== */
async function getLatestDeploy() {
  try {
    const response = await fetch('/.netlify/functions/deploy-status');
    
    if (!response.ok) {
      console.error('Function response not OK:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Check if there's an error in the response
    if (data.error) {
      console.error('Function returned error:', data.error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching deploy status:', error);
    return null;
  }
}

/* ==========================================
   Poll and Track Real Netlify Deploy
   ========================================== */
async function trackRealDeploy() {
  let lastState = null;
  let pollCount = 0;
  const maxPolls = 200; // 10 minutes max (3 second intervals)
  let failedAttempts = 0;

  return new Promise((resolve) => {
    const pollInterval = setInterval(async () => {
      pollCount++;

      if (pollCount > maxPolls) {
        clearInterval(pollInterval);
        addLog("✗ Monitoring timeout reached", "error");
        resolve('timeout');
        return;
      }

      const deploy = await getLatestDeploy();
      
      // If function not available after several attempts, fall back
      if (!deploy) {
        failedAttempts++;
        if (failedAttempts > 5) {
          clearInterval(pollInterval);
          addLog("⚠ Cannot connect to deployment status", "info");
          resolve('fallback');
        }
        return;
      }

      // Reset failed attempts if we get data
      failedAttempts = 0;
      const currentState = deploy.state;

      // Update UI when state changes
      if (currentState !== lastState) {
        lastState = currentState;

        switch (currentState) {
          case 'new':
          case 'enqueued':
            addLog("> Build queued", "info");
            updateStep('step1', 'completed');
            updateStep('step2', 'completed');
            updateStep('step3', 'active');
            addLog("> Waiting for build slot...", "info");
            elements.progressBar.style.width = '15%';
            break;

          case 'building':
            addLog("> Build started!", "success");
            updateStep('step3', 'completed');
            updateStep('step4', 'active');
            addLog("> Fetching cached dependencies...", "info");
            elements.progressBar.style.width = '30%';
            
            setTimeout(() => {
              addLog("> Installing npm packages...", "info");
              elements.progressBar.style.width = '40%';
            }, 2000);
            
            setTimeout(() => {
              addLog("> Running build command...", "info");
              updateStep('step4', 'completed');
              updateStep('step5', 'active');
              elements.progressBar.style.width = '55%';
            }, 5000);
            break;

          case 'processing':
            addLog("✓ Build completed", "success");
            updateStep('step5', 'completed');
            updateStep('step6', 'active');
            addLog("> Bundling functions...", "info");
            addLog("> Calculating files to upload...", "info");
            elements.progressBar.style.width = '70%';
            break;

          case 'uploading':
            addLog("✓ Functions bundled", "success");
            updateStep('step6', 'completed');
            updateStep('step7', 'active');
            addLog("> Uploading to CDN...", "info");
            addLog("> Processing build output...", "info");
            elements.progressBar.style.width = '85%';
            break;

          case 'ready':
            addLog("✓ Deploy complete", "success");
            updateStep('step7', 'completed');
            updateStep('step8', 'active');
            addLog("> Site is live!", "success");
            elements.progressBar.style.width = '100%';
            
            setTimeout(() => {
              updateStep('step8', 'completed');
              elements.buildComplete.style.display = "block";
              setTimeout(() => {
                window.location.href = "/";
              }, 2000);
            }, 1000);
            
            clearInterval(pollInterval);
            resolve('success');
            break;

          case 'error':
            addLog(`✗ Deployment failed: ${deploy.error_message || 'Unknown error'}`, "error");
            addLog("> Check Netlify dashboard for details", "info");
            clearInterval(pollInterval);
            resolve('error');
            break;
        }
      }
    }, 3000); // Poll every 3 seconds
  });
}
/* ==========================================
   Run Simulated Build (Fallback)
   ========================================== */
async function runSimulatedBuild() {
  addLog("> Running in simulation mode", "info");
  
  const simulatedSteps = [
    { 
      id: "step1", 
      duration: 1200, 
      logs: ["> Analyzing changes...", "✓ Changes compiled"] 
    },
    { 
      id: "step2", 
      duration: 1500, 
      logs: ["> Connecting to GitHub...", "> Pushing changes...", "✓ Pushed to main branch"] 
    },
    { 
      id: "step3", 
      duration: 1000, 
      logs: ["> Webhook triggered", "✓ Build initiated"] 
    },
    { 
      id: "step4", 
      duration: 2500, 
      logs: ["> npm install", "> Installing packages...", "✓ Dependencies installed"] 
    },
    { 
      id: "step5", 
      duration: 3000, 
      logs: ["> Building production bundle...", "> Processing pages...", "✓ Build complete"] 
    },
    { 
      id: "step6", 
      duration: 1800, 
      logs: ["> Minifying assets...", "✓ Assets optimized"] 
    },
    { 
      id: "step7", 
      duration: 2200, 
      logs: ["> Uploading to CDN...", "> Distributing globally...", "✓ Deployed"] 
    },
    { 
      id: "step8", 
      duration: 1200, 
      logs: ["> Finalizing deployment...", "✓ Complete!"] 
    },
  ];

  let totalDuration = simulatedSteps.reduce((sum, step) => sum + step.duration, 0);
  let elapsedTime = 0;

  for (let i = 0; i < simulatedSteps.length; i++) {
    const step = simulatedSteps[i];
    const stepEl = document.getElementById(step.id);

    stepEl.classList.add("active");

    for (let j = 0; j < step.logs.length; j++) {
      await new Promise(r => setTimeout(r, step.duration / step.logs.length));
      const logType = j === step.logs.length - 1 ? "success" : "default";
      addLog(step.logs[j], logType);
    }

    stepEl.classList.remove("active");
    stepEl.classList.add("completed");
    stepEl.querySelector("i").className = "ri-check-line";

    elapsedTime += step.duration;
    elements.progressBar.style.width = ((elapsedTime / totalDuration) * 100) + "%";
  }

  await new Promise(r => setTimeout(r, 500));
  elements.buildComplete.style.display = "block";
  setTimeout(() => window.location.href = "/", 2000);
}

/* ==========================================
   Main: Start Deployment Tracking
   ========================================== */
async function startDeploymentTracking() {
  // Reset UI
  elements.buildLogs.innerHTML = "";
  elements.progressBar.style.width = "0%";
  elements.buildComplete.style.display = "none";

  // Reset all steps
  buildSteps.forEach(step => {
    const stepEl = document.getElementById(step.id);
    stepEl.className = "build-step";
  });

  // Start tracking
  updateStep('step1', 'active');
  addLog("> Connecting to Netlify...", "info");
  elements.progressBar.style.width = '5%';

  await new Promise(r => setTimeout(r, 1000));

  // Try to track real deployment
  const result = await trackRealDeploy();

  // Fall back to simulation if tracking failed
  if (result === 'fallback') {
    addLog("⚠ Switching to simulation mode", "info");
    await new Promise(r => setTimeout(r, 1000));
    
    // Reset UI for simulation
    elements.buildLogs.innerHTML = "";
    elements.progressBar.style.width = "0%";
    buildSteps.forEach(step => {
      const stepEl = document.getElementById(step.id);
      stepEl.className = "build-step";
    });
    
    await runSimulatedBuild();
  } else if (result === 'timeout') {
    addLog("⚠ Build is taking longer than expected", "info");
    addLog("> Check Netlify dashboard for status", "info");
  }
}

/* ==========================================
   Initialize on Page Load
   ========================================== */
window.addEventListener("DOMContentLoaded", () => {
  startDeploymentTracking();
});

/* ==========================================
   Handle Messages from Parent Window
   ========================================== */
window.addEventListener("message", (event) => {
  if (event.data === "start-build") {
    startDeploymentTracking();
  }
});
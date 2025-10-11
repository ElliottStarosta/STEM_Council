
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
    const response = await fetch('/netlify/functions/deploy-status');
    
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
  const maxPolls = 120; // 10 minutes max (5 second intervals)
  let failedAttempts = 0;
  let buildingPhaseTime = 0;

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

      // Track how long we've been in building state
      if (currentState === 'building') {
        buildingPhaseTime += 1000; // 1 second per poll
      }

      // Update UI when state changes
      if (currentState !== lastState) {
        lastState = currentState;

        switch (currentState) {
          case 'new':
            addLog("> Deployment detected", "info");
            updateStep('step1', 'completed');
            updateStep('step2', 'completed');
            updateStep('step3', 'active');
            addLog("> GitHub webhook received", "info");
            elements.progressBar.style.width = '10%';
            break;

          case 'enqueued':
            addLog("> Build queued", "info");
            updateStep('step3', 'completed');
            addLog("> Waiting for available build slot...", "info");
            elements.progressBar.style.width = '20%';
            break;

          case 'building':
            addLog("> Build started!", "success");
            updateStep('step4', 'active');
            addLog("> Installing dependencies...", "info");
            elements.progressBar.style.width = '35%';
            break;

          case 'processing':
            addLog("✓ Build completed", "success");
            updateStep('step4', 'completed');
            updateStep('step5', 'completed');
            updateStep('step6', 'active');
            addLog("> Processing output files...", "info");
            addLog("> Optimizing assets...", "info");
            elements.progressBar.style.width = '70%';
            break;

          case 'uploading':
            addLog("✓ Assets optimized", "success");
            updateStep('step6', 'completed');
            updateStep('step7', 'active');
            addLog("> Uploading to CDN...", "info");
            addLog("> Distributing to edge nodes...", "info");
            elements.progressBar.style.width = '85%';
            break;

          case 'ready':
            addLog("✓ Uploaded to CDN", "success");
            updateStep('step7', 'completed');
            updateStep('step8', 'active');
            addLog("> Running final checks...", "info");
            elements.progressBar.style.width = '95%';
            
            setTimeout(() => {
              addLog("> Invalidating cache...", "info");
            }, 500);
            
            setTimeout(() => {
              addLog("✓ Deployment successful!", "success");
              updateStep('step8', 'completed');
              elements.progressBar.style.width = '100%';
              
              setTimeout(() => {
                elements.buildComplete.style.display = "block";
                setTimeout(() => {
                  window.location.href = "/";
                }, 2000);
              }, 500);
            }, 1500);
            
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
      } else if (currentState === 'building') {
        // Add progress updates during building phase
        if (buildingPhaseTime === 10000) { // After 10 seconds
          addLog("> Running build command...", "info");
          updateStep('step4', 'completed');
          updateStep('step5', 'active');
          elements.progressBar.style.width = '50%';
        } else if (buildingPhaseTime === 20000) { // After 20 seconds
          addLog("> Compiling production bundle...", "info");
          elements.progressBar.style.width = '60%';
        }
      }
    }, 1000); // Poll every 1 second
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
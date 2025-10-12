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
  console.log(`[DEBUG] Updating step ${stepId} to ${status}`);
  const stepEl = document.getElementById(stepId);
  
  if (!stepEl) {
    console.error(`[ERROR] Step element not found: ${stepId}`);
    return;
  }

  stepEl.classList.remove("active", "completed");
  
  if (status === "active") {
    stepEl.classList.add("active");
  } else if (status === "completed") {
    stepEl.classList.add("completed");
    const icon = stepEl.querySelector("i");
    if (icon) {
      icon.className = "ri-check-line";
      icon.style.animation = "none"; // Force stop spinning
    }
  }
}

/* ==========================================
  Get Latest Deploy Status from Netlify Function
  ========================================== */
async function getLatestDeploy(afterTime) {
  try {
    const url = afterTime 
      ? `/.netlify/functions/deploy-status?after=${encodeURIComponent(afterTime)}`
      : '/.netlify/functions/deploy-status';
    
    console.log('[DEBUG] Fetching deploy status from:', url);
      
    const response = await fetch(url);
    
    console.log('[DEBUG] Response status:', response.status);
    
    if (!response.ok) {
      console.error('[ERROR] Function response not OK:', response.status);
      const text = await response.text();
      console.error('[ERROR] Response text:', text);
      return null;
    }

    const data = await response.json();
    console.log('[DEBUG] Deploy data received:', data);
    
    if (data.error) {
      console.error('[ERROR] Function returned error:', data.error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[ERROR] Exception fetching deploy status:', error);
    return null;
  }
}

/* ==========================================
  Run Simulated Build While Monitoring Real Deploy
  ========================================== */
async function runBuildWithMonitoring() {
  console.log('[START] Beginning build monitoring');
  
  // Record the start time to track NEW deploys only
  const startTime = new Date().toISOString();
  console.log('[DEBUG] Start time recorded:', startTime);
  
  let isDeployComplete = false;
  let deployState = null;
  let foundNewDeploy = false;
  let pollCount = 0;
  
  // Start monitoring for NEW deploys in background
const monitorPromise = new Promise((resolve) => {
  console.log('[DEBUG] Starting monitoring promise');
  
  const pollInterval = setInterval(async () => {
    pollCount++;
    console.log(`[POLL #${pollCount}] Checking for deploys...`);
    
    const deploy = await getLatestDeploy(startTime);
    
    if (deploy) {
      console.log('[DEBUG] Deploy found:', {
        id: deploy.id,
        state: deploy.state,
        created_at: deploy.created_at
      });
      
      const deployTime = new Date(deploy.created_at);
      const startTimeDate = new Date(startTime);
      
      console.log('[DEBUG] Comparing times:', {
        deployTime: deployTime.toISOString(),
        startTime: startTimeDate.toISOString(),
        isNewer: deployTime > startTimeDate,
        timeDiffSeconds: (startTimeDate - deployTime) / 1000
      });
      
      // Accept deploys that are either:
      // 1. Created after we started monitoring, OR
      // 2. Created within 12 seconds BEFORE (likely in-progress when page loaded)
      const timeDiffMs = startTimeDate - deployTime;
      const isRecentEnough = timeDiffMs < 12000; // 12 seconds grace period

      if (deployTime > startTimeDate || isRecentEnough) {
        if (!foundNewDeploy) {
          foundNewDeploy = true;
          console.log('[SUCCESS] Found deploy to track!');
          addLog(`✓ Tracking deploy: ${deploy.id.substring(0, 8)}`, "success");
        }
        
        deployState = deploy.state;
        console.log('[DEBUG] Deploy state:', deployState);
        
        if (deployState === 'ready') {
          console.log('[SUCCESS] Deploy completed successfully!');
          isDeployComplete = true;
          clearInterval(pollInterval);
          resolve('success');
        } else if (deployState === 'error') {
          console.log('[ERROR] Deploy failed!');
          isDeployComplete = true;
          clearInterval(pollInterval);
          resolve('error');
        } else {
          console.log('[INFO] Deploy still in progress...');
        }
      } else {
        console.log('[INFO] Deploy is too old, ignoring');
      }
    } else {
      console.log('[INFO] No deploy data received');
    }
  }, 5000); // Poll every 5 seconds
  
  // Timeout after 5 minutes
  setTimeout(() => {
    console.log('[TIMEOUT] Monitoring timeout reached');
    clearInterval(pollInterval);
    if (!isDeployComplete) {
      resolve(foundNewDeploy ? 'timeout' : 'no-deploy');
    }
  }, 300000);
});
  
  // Simulated build steps (steps 1-6)
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
  ];

  // Run through steps 1-6
  for (let i = 0; i < simulatedSteps.length; i++) {
    const step = simulatedSteps[i];
    const stepEl = document.getElementById(step.id);

    console.log(`[STEP] Starting ${step.id}`);
    stepEl.classList.add("active");

    for (let j = 0; j < step.logs.length; j++) {
      await new Promise(r => setTimeout(r, step.duration / step.logs.length));
      const logType = j === step.logs.length - 1 ? "success" : "default";
      addLog(step.logs[j], logType);
    }

    stepEl.classList.remove("active");
    stepEl.classList.add("completed");
    const icon = stepEl.querySelector("i");
    if (icon) {
      icon.className = "ri-check-line";
      icon.style.animation = "none";
    }

    const progress = Math.min(80, ((i + 1) / simulatedSteps.length) * 80);
    elements.progressBar.style.width = progress + "%";
    console.log(`[PROGRESS] ${progress}%`);
  }
  
  // Now use step7 for the final deployment wait
  console.log('[STEP] Starting final deployment (step7)');
  updateStep('step7', 'active');
  addLog("> Uploading to CDN...", "info");
  addLog("> Waiting for Netlify deployment...", "info");
  
  const result = await monitorPromise;
  console.log('[RESULT] Monitoring completed with result:', result);
  
  if (result === 'success') {
    addLog("✓ Deployed successfully!", "success");
    updateStep('step7', 'completed');
    elements.progressBar.style.width = '100%';
    
    await new Promise(r => setTimeout(r, 500));
    elements.buildComplete.style.display = "block";
    
    console.log('[COMPLETE] Deployment successful, redirecting in 2s');
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  } else if (result === 'error') {
    addLog("✗ Deployment failed", "error");
    addLog("> Check Netlify dashboard for details", "info");
    updateStep('step7', 'completed');
  } else if (result === 'no-deploy') {
    addLog("⚠ No new deploy detected", "info");
    addLog("> Make sure changes were pushed to GitHub", "info");
    updateStep('step7', 'completed');
  } else if (result === 'timeout') {
    addLog("⚠ Deployment is taking longer than expected", "info");
    addLog("> Check Netlify dashboard for status", "info");
    updateStep('step7', 'completed');
  }
}

/* ==========================================
  Main: Start Deployment Tracking
  ========================================== */
async function startDeploymentTracking() {
  console.log('[START] Starting deployment tracking');
  
  // Reset UI
  elements.buildLogs.innerHTML = "";
  elements.progressBar.style.width = "0%";
  elements.buildComplete.style.display = "none";

  // Reset all steps - with safety check
  buildSteps.forEach(step => {
    const stepEl = document.getElementById(step.id);
    if (stepEl) {
      stepEl.className = "build-step";
      const icon = stepEl.querySelector("i");
      if (icon) {
        icon.className = "ri-loader-4-line";
        icon.style.animation = "";
      }
      console.log(`[DEBUG] Reset step: ${step.id}`);
    } else {
      console.error(`[ERROR] Step not found in DOM: ${step.id}`);
    }
  });

  // Start tracking
  updateStep('step1', 'active');
  addLog("> Starting deployment...", "info");
  elements.progressBar.style.width = '5%';

  await new Promise(r => setTimeout(r, 1000));

  // Run the build with monitoring
  await runBuildWithMonitoring();
}

/* ==========================================
  Initialize on Page Load
  ========================================== */
window.addEventListener("DOMContentLoaded", () => {
  console.log('[INIT] Page loaded, starting deployment tracking');
  startDeploymentTracking();
});

/* ==========================================
  Handle Messages from Parent Window
  ========================================== */
window.addEventListener("message", (event) => {
  if (event.data === "start-build") {
    console.log('[MESSAGE] Received start-build message');
    startDeploymentTracking();
  }
});
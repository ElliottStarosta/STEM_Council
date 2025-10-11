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
   Run Simulated Build While Monitoring Real Deploy
   ========================================== */
async function runBuildWithMonitoring() {
  let isDeployComplete = false;
  let deployState = null;
  
  // Start monitoring the real deploy in background
  const monitorPromise = new Promise((resolve) => {
    const pollInterval = setInterval(async () => {
      const deploy = await getLatestDeploy();
      
      if (deploy) {
        deployState = deploy.state;
        
        if (deployState === 'ready') {
          isDeployComplete = true;
          clearInterval(pollInterval);
          resolve('success');
        } else if (deployState === 'error') {
          isDeployComplete = true;
          clearInterval(pollInterval);
          resolve('error');
        }
      }
    }, 3000); // Poll every 3 seconds
    
    // Timeout after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (!isDeployComplete) {
        resolve('timeout');
      }
    }, 600000);
  });
  
  // Simulated build steps
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
      logs: ["> Uploading to CDN...", "> Distributing globally..."] 
    },
  ];

  // Run through the simulated steps
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

    // Update progress (max 85% until real deploy completes)
    const progress = Math.min(85, ((i + 1) / simulatedSteps.length) * 85);
    elements.progressBar.style.width = progress + "%";
  }
  
  // Now wait for the real deploy to complete
  updateStep('step8', 'active');
  addLog("> Waiting for deployment to complete...", "info");
  
  // Add a loading indicator while waiting
  let dotCount = 0;
  const waitingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    const dots = '.'.repeat(dotCount);
    addLog(`> Deploying${dots}`, "info");
  }, 2000);
  
  // Wait for real deploy to finish
  const result = await monitorPromise;
  clearInterval(waitingInterval);
  
  // Handle completion
  if (result === 'success') {
    addLog("✓ Deployed successfully!", "success");
    updateStep('step8', 'completed');
    elements.progressBar.style.width = '100%';
    
    await new Promise(r => setTimeout(r, 500));
    elements.buildComplete.style.display = "block";
    
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  } else if (result === 'error') {
    addLog("✗ Deployment failed", "error");
    addLog("> Check Netlify dashboard for details", "info");
  } else if (result === 'timeout') {
    addLog("⚠ Deployment is taking longer than expected", "info");
    addLog("> Check Netlify dashboard for status", "info");
  }
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
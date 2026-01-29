/**
 * PermitPath Main Application
 * Coordinates guided question flow
 */

// Application state
const appState = {
  location: null,
  permitOffice: null,
  specialDistricts: null,
  sessionId: null,
  projectType: null
};

// API base URL
const API_BASE = window.location.origin;

// Initialize components when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize global components
  window.questionRenderer = new QuestionRenderer('question-container');
  window.resultDisplay = new ResultDisplay('result-container');
  
  // Check server health
  checkServerHealth();
  
  // Set up event listeners
  setupEventListeners();
});

/**
 * Check server health on load
 */
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    console.log('Server status:', data);
    
    if (!data.services.location || !data.services.permit) {
      showError('⚠️ Some API services are not configured. Functionality may be limited.');
    }
  } catch (error) {
    showError('⚠️ Could not connect to server. Please check your connection.');
    console.error('Health check error:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Address form submission
  const addressForm = document.getElementById('address-form');
  if (addressForm) {
    addressForm.addEventListener('submit', (e) => {
      e.preventDefault();
      lookupLocation();
    });
  }
}

/**
 * Lookup location from address
 */
async function lookupLocation() {
  const address = document.getElementById('address-input')?.value.trim();
  
  if (!address) {
    showError('Please enter an address');
    return;
  }

  showLoading(true);
  hideError();

  try {
    const response = await fetch(`${API_BASE}/api/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to lookup address');
    }

    const data = await response.json();
    appState.location = data.location;
    appState.permitOffice = data.permitOffice;
    appState.specialDistricts = data.specialDistricts;

    showLocationConfirmation(data);
  } catch (error) {
    showError(error.message || 'Could not find that address. Please check and try again.');
    console.error('Location lookup error:', error);
  } finally {
    showLoading(false);
  }
}

/**
 * Display location confirmation
 */
function showLocationConfirmation(data) {
  const { location, permitOffice, specialDistricts } = data;
  
  const jurisdiction = location.likelyCityLimits 
    ? `${location.city} (city limits)` 
    : `${location.county} (county)`;

  let html = `
    <h3>📍 ${location.fullAddress}</h3>
    <div class="location-details">
      <p><strong>Jurisdiction:</strong> ${jurisdiction}</p>
      <p><strong>ZIP Code:</strong> ${location.zipCode}</p>
    </div>
  `;

  if (permitOffice) {
    html += `
      <div class="permit-office-info">
        <h4>🏛️ Permit Office:</h4>
        <p><strong>${permitOffice.name}</strong></p>
        <p>${permitOffice.address}</p>
        <p>📞 ${permitOffice.phone}</p>
        ${permitOffice.website ? `<p><a href="${permitOffice.website}" target="_blank">Visit Website →</a></p>` : ''}
      </div>
    `;
  }

  if (specialDistricts && specialDistricts.length > 0) {
    html += `
      <div class="special-districts">
        <h4>⚠️ Special Districts Detected:</h4>
        ${specialDistricts.map(d => `
          <div class="special-district">
            <strong>${d.name}</strong>
            <p>${d.note}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  document.getElementById('location-info').innerHTML = html;
  
  // Show location step, hide address step
  document.getElementById('address-step').style.display = 'none';
  document.getElementById('location-step').style.display = 'block';
}

/**
 * Show project type selection
 */
function showProjectTypes() {
  document.getElementById('location-step').style.display = 'none';
  document.getElementById('project-step').style.display = 'block';
}

/**
 * Start guided questions for selected project
 */
async function startGuidedQuestions(projectType) {
  if (!appState.location) {
    showError('Location is required. Please start over.');
    return;
  }

  appState.projectType = projectType;
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE}/api/guided-permit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        projectType: projectType,
        location: appState.location
      })
    });

    if (!response.ok) {
      throw new Error('Failed to start guided questions');
    }

    const data = await response.json();
    appState.sessionId = data.sessionId;
    window.guidedSessionId = data.sessionId;

    // Hide project selection, show question container
    document.getElementById('project-step').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';

    // Render first question
    window.questionRenderer.render(data);
  } catch (error) {
    showError('Could not start questions. Please try again.');
    console.error('Start questions error:', error);
  } finally {
    showLoading(false);
  }
}

/**
 * Select "Other" project type - show custom input
 */
function selectOtherProject() {
  document.querySelector('.project-types').style.display = 'none';
  document.getElementById('custom-project-input').style.display = 'block';
  document.getElementById('custom-project-text').focus();
}

/**
 * Cancel custom project input
 */
function cancelCustomProject() {
  document.querySelector('.project-types').style.display = 'grid';
  document.getElementById('custom-project-input').style.display = 'none';
  document.getElementById('custom-project-text').value = '';
}

/**
 * Submit custom project - use bathroom-remodel as fallback template
 */
function submitCustomProject() {
  const customProject = document.getElementById('custom-project-text').value.trim();
  
  if (!customProject) {
    showError('Please enter your project type');
    return;
  }
  
  // Store custom project name
  appState.customProjectName = customProject;
  
  // Use bathroom-remodel as the template (most flexible)
  // The AI will use the custom project name in the final answer
  startGuidedQuestions('bathroom-remodel');
}

/**
 * Edit address - start over
 */
function editAddress() {
  document.getElementById('location-step').style.display = 'none';
  document.getElementById('address-step').style.display = 'block';
  appState.location = null;
}

/**
 * Show loading spinner
 */
function showLoading(show = true) {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById('error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

/**
 * Hide error message
 */
function hideError() {
  const errorEl = document.getElementById('error');
  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

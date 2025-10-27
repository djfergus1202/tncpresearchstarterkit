// ComputeLab Authentication & User Tracking System
// Developed by: D. Ferguson
// Version: 1.0.0

//========================
// USER AUTHENTICATION
//========================

// Global user state
let currentUser = null;
let userSession = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  checkExistingSession();
  initializeTracking();
});

// Check for existing session
function checkExistingSession() {
  const sessionToken = localStorage.getItem('computelab_session');
  if (sessionToken) {
    // Validate and restore session
    validateSession(sessionToken);
  }
}

// Open authentication modal
function openAuthModal(mode = 'login') {
  document.getElementById('auth-modal').style.display = 'flex';
  if (mode === 'login') {
    switchToLogin();
  } else {
    switchToRegister();
  }
}

// Close authentication modal
function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

// Switch between login and register
function switchToLogin() {
  document.getElementById('login-panel').style.display = 'block';
  document.getElementById('register-panel').style.display = 'none';
  document.getElementById('auth-modal-title').textContent = 'Login to ComputeLab';
}

function switchToRegister() {
  document.getElementById('login-panel').style.display = 'none';
  document.getElementById('register-panel').style.display = 'block';
  document.getElementById('auth-modal-title').textContent = 'Register for ComputeLab';
}

// Perform login
function performLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  
  if (!username || !password) {
    showModal('Please enter both username and password', 'error');
    return;
  }
  
  // In production, this would be an API call
  // For demo, simulate authentication
  authenticateUser(username, password).then(user => {
    if (user) {
      currentUser = user;
      establishSession(user);
      updateUIForLoggedInUser(user);
      closeAuthModal();
      trackLogin(user);
      showModal(`Welcome back, ${user.name}!`, 'success');
    } else {
      showModal('Invalid credentials', 'error');
    }
  });
}

// Simulate authentication (replace with real API call)
async function authenticateUser(username, password) {
  // Demo user database
  const users = {
    'demo@computelab.com': {
      id: 'user_001',
      name: 'Demo User',
      email: 'demo@computelab.com',
      institution: 'ComputeLab University',
      role: 'Graduate Student',
      joinDate: '2024-01-15',
      verified: true
    },
    'dferguson': {
      id: 'user_df',
      name: 'D. Ferguson',
      email: 'd.ferguson@computelab.com',
      institution: 'ComputeLab',
      role: 'Platform Developer',
      joinDate: '2023-01-01',
      verified: true,
      isAdmin: true
    }
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check credentials (in production, this happens server-side)
  return users[username] || null;
}

// Perform registration
function performRegister() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const institution = document.getElementById('register-institution').value.trim();
  const role = document.getElementById('register-role').value;
  const password = document.getElementById('register-password').value;
  
  if (!name || !email || !institution || !password) {
    showModal('Please fill in all required fields', 'error');
    return;
  }
  
  if (!validateEmail(email)) {
    showModal('Please enter a valid email address', 'error');
    return;
  }
  
  if (password.length < 8) {
    showModal('Password must be at least 8 characters', 'error');
    return;
  }
  
  // Create new user
  const newUser = {
    id: 'user_' + Date.now(),
    name: name,
    email: email,
    institution: institution,
    role: role,
    joinDate: new Date().toISOString().split('T')[0],
    verified: false
  };
  
  // In production, send to server
  registerUser(newUser, password).then(success => {
    if (success) {
      showModal('Registration successful! Please check your email to verify your account.', 'success');
      setTimeout(() => {
        switchToLogin();
      }, 2000);
    } else {
      showModal('Registration failed. Email may already be in use.', 'error');
    }
  });
}

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Register new user (replace with real API call)
async function registerUser(user, password) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, send to server with encrypted password
  // For demo, store in localStorage (NOT SECURE - demo only)
  const users = JSON.parse(localStorage.getItem('computelab_users') || '{}');
  
  if (users[user.email]) {
    return false; // Email already exists
  }
  
  users[user.email] = user;
  localStorage.setItem('computelab_users', JSON.stringify(users));
  
  return true;
}

// Establish user session
function establishSession(user) {
  const session = {
    userID: user.id,
    loginTime: new Date().toISOString(),
    token: generateSessionToken(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  userSession = session;
  localStorage.setItem('computelab_session', JSON.stringify(session));
  localStorage.setItem('computelab_current_user', JSON.stringify(user));
}

// Generate session token
function generateSessionToken() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Validate existing session
async function validateSession(sessionData) {
  try {
    const session = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;
    const expiresAt = new Date(session.expiresAt);
    
    if (expiresAt > new Date()) {
      // Session still valid
      const userData = localStorage.getItem('computelab_current_user');
      if (userData) {
        currentUser = JSON.parse(userData);
        userSession = session;
        updateUIForLoggedInUser(currentUser);
      }
    } else {
      // Session expired
      performLogout(true);
    }
  } catch (e) {
    console.error('Session validation failed:', e);
    performLogout(true);
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
  // Hide login buttons
  document.getElementById('user-logged-out').style.display = 'none';
  
  // Show user profile
  const userSection = document.getElementById('user-logged-in');
  userSection.style.display = 'flex';
  
  // Update user info
  document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('user-name-display').textContent = user.name;
  document.getElementById('user-role-display').textContent = user.role;
  
  // Add verified badge if applicable
  if (user.verified) {
    document.getElementById('user-name-display').innerHTML += ' <span style="color: var(--green);">✓</span>';
  }
}

// Toggle user menu dropdown
function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const userProfile = document.querySelector('.user-profile');
  const userMenu = document.getElementById('user-menu');
  
  if (userProfile && userMenu && !userProfile.contains(event.target)) {
    userMenu.style.display = 'none';
  }
});

// Perform logout
function performLogout(silent = false) {
  if (currentUser) {
    trackLogout(currentUser);
  }
  
  // Clear session data
  currentUser = null;
  userSession = null;
  localStorage.removeItem('computelab_session');
  localStorage.removeItem('computelab_current_user');
  
  // Update UI
  document.getElementById('user-logged-out').style.display = 'flex';
  document.getElementById('user-logged-in').style.display = 'none';
  document.getElementById('user-menu').style.display = 'none';
  
  if (!silent) {
    showModal('You have been logged out', 'info');
  }
}

//========================
// USER PROFILE & STATS
//========================

function showMyProfile() {
  if (!currentUser) return;
  
  toggleUserMenu();
  
  // Show profile modal
  const profileHTML = `
    <div class="modal" style="display: flex;">
      <div class="modal-content" style="max-width: 600px;">
        <span class="modal-close" onclick="closeProfileModal()">&times;</span>
        <h2>My Profile</h2>
        
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 16px; margin: 24px 0;">
          <div class="user-avatar" style="width: 80px; height: 80px; font-size: 32px;">
            ${currentUser.name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h3 style="margin: 0;">${currentUser.name}</h3>
            <p style="color: var(--muted); margin: 4px 0;">${currentUser.role}</p>
            <p style="color: var(--muted); margin: 4px 0;">${currentUser.institution}</p>
            <p style="color: var(--muted); margin: 4px 0; font-size: 12px;">Member since ${currentUser.joinDate}</p>
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="${currentUser.email}" disabled>
          </div>
          
          <div class="form-group">
            <label>Institution</label>
            <input type="text" value="${currentUser.institution}" id="profile-institution">
          </div>
          
          <div class="form-group">
            <label>Role</label>
            <select id="profile-role">
              <option ${currentUser.role === 'Graduate Student' ? 'selected' : ''}>Graduate Student</option>
              <option ${currentUser.role === 'Postdoc' ? 'selected' : ''}>Postdoc</option>
              <option ${currentUser.role === 'Principal Investigator' ? 'selected' : ''}>Principal Investigator</option>
              <option ${currentUser.role === 'Industry Scientist' ? 'selected' : ''}>Industry Scientist</option>
            </select>
          </div>
        </div>
        
        <div class="btn-group" style="margin-top: 24px;">
          <button class="btn btn-primary" onclick="updateProfile()">Save Changes</button>
          <button class="btn btn-outline" onclick="closeProfileModal()">Cancel</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', profileHTML);
}

function closeProfileModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.remove());
}

function updateProfile() {
  if (!currentUser) return;
  
  currentUser.institution = document.getElementById('profile-institution').value;
  currentUser.role = document.getElementById('profile-role').value;
  
  localStorage.setItem('computelab_current_user', JSON.stringify(currentUser));
  updateUIForLoggedInUser(currentUser);
  
  showModal('Profile updated successfully', 'success');
  closeProfileModal();
}

function showMyResearch() {
  toggleUserMenu();
  navigateTo('research-sharing');
  // Filter to show only user's posts
}

function showUsageStats() {
  if (!currentUser) return;
  
  toggleUserMenu();
  
  const stats = getUserUsageStats(currentUser.id);
  
  const statsHTML = `
    <div class="modal" style="display: flex;">
      <div class="modal-content" style="max-width: 800px;">
        <span class="modal-close" onclick="closeStatsModal()">&times;</span>
        <h2>📈 My Usage Statistics</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">${stats.totalTime}</div>
            <div class="stat-label">Total Time</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔧</div>
            <div class="stat-value">${stats.toolsUsed}</div>
            <div class="stat-label">Tools Used</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">${stats.jobsRun}</div>
            <div class="stat-label">Jobs Run</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💾</div>
            <div class="stat-value">${stats.dataProcessed}</div>
            <div class="stat-label">Data Processed</div>
          </div>
        </div>
        
        <h3 style="margin-top: 24px;">Toolkit Usage Breakdown</h3>
        <div id="usage-chart" style="height: 300px; margin-top: 16px;"></div>
        
        <h3 style="margin-top: 24px;">Recent Activity</h3>
        <div class="activity-list">
          ${stats.recentActivity.map(activity => `
            <div class="activity-item">
              <span class="activity-icon">${activity.icon}</span>
              <span class="activity-text">${activity.text}</span>
              <span class="activity-time">${activity.time}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="btn-group" style="margin-top: 24px;">
          <button class="btn btn-outline" onclick="exportUsageData()">
            <span>📥</span> Export Data
          </button>
          <button class="btn btn-outline" onclick="closeStatsModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', statsHTML);
  
  // Render usage chart
  renderUsageChart(stats.toolkitBreakdown);
}

function closeStatsModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.remove());
}

//========================
// USAGE TRACKING
//========================

let trackingData = {
  sessions: [],
  toolUsage: [],
  results: []
};

function initializeTracking() {
  // Load existing tracking data
  const savedData = localStorage.getItem('computelab_tracking');
  if (savedData) {
    trackingData = JSON.parse(savedData);
  }
  
  // Track page visibility for session duration
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Track before unload
  window.addEventListener('beforeunload', handlePageUnload);
}

function trackLogin(user) {
  const loginEvent = {
    userID: user.id,
    timestamp: new Date().toISOString(),
    type: 'login',
    sessionID: userSession.token
  };
  
  trackingData.sessions.push(loginEvent);
  saveTrackingData();
}

function trackLogout(user) {
  const logoutEvent = {
    userID: user.id,
    timestamp: new Date().toISOString(),
    type: 'logout',
    sessionID: userSession.token,
    duration: calculateSessionDuration()
  };
  
  trackingData.sessions.push(logoutEvent);
  saveTrackingData();
}

function trackToolUsage(toolkit, parameters = {}) {
  if (!currentUser) return;
  
  const usageEvent = {
    userID: currentUser.id,
    timestamp: new Date().toISOString(),
    toolkit: toolkit,
    parameters: parameters,
    sessionID: userSession.token
  };
  
  trackingData.toolUsage.push(usageEvent);
  saveTrackingData();
}

function trackResult(toolkit, result) {
  if (!currentUser) return;
  
  const resultEvent = {
    userID: currentUser.id,
    timestamp: new Date().toISOString(),
    toolkit: toolkit,
    result: result,
    sessionID: userSession.token
  };
  
  trackingData.results.push(resultEvent);
  saveTrackingData();
}

function calculateSessionDuration() {
  if (!userSession) return 0;
  
  const start = new Date(userSession.loginTime);
  const end = new Date();
  return Math.floor((end - start) / 1000 / 60); // minutes
}

function handleVisibilityChange() {
  if (document.hidden && currentUser) {
    // User switched tabs/minimized - could pause tracking
  } else if (currentUser) {
    // User returned
  }
}

function handlePageUnload() {
  if (currentUser && userSession) {
    // Final save before page closes
    saveTrackingData();
  }
}

function saveTrackingData() {
  localStorage.setItem('computelab_tracking', JSON.stringify(trackingData));
}

function getUserUsageStats(userID) {
  const userSessions = trackingData.sessions.filter(s => s.userID === userID);
  const userTools = trackingData.toolUsage.filter(t => t.userID === userID);
  const userResults = trackingData.results.filter(r => r.userID === userID);
  
  // Calculate total time
  const totalMinutes = userSessions
    .filter(s => s.type === 'logout')
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  
  // Count unique tools
  const uniqueTools = new Set(userTools.map(t => t.toolkit)).size;
  
  // Toolkit breakdown
  const toolkitCounts = {};
  userTools.forEach(t => {
    toolkitCounts[t.toolkit] = (toolkitCounts[t.toolkit] || 0) + 1;
  });
  
  // Recent activity
  const recentActivity = userTools.slice(-10).reverse().map(activity => ({
    icon: getToolkitIcon(activity.toolkit),
    text: `Used ${activity.toolkit}`,
    time: formatTimestamp(activity.timestamp)
  }));
  
  return {
    totalTime,
    toolsUsed: uniqueTools,
    jobsRun: userTools.length,
    dataProcessed: (userResults.length * 2.5).toFixed(1) + ' GB',
    toolkitBreakdown: toolkitCounts,
    recentActivity
  };
}

function getToolkitIcon(toolkit) {
  const icons = {
    'retrosynthesis': '🔬',
    'molecular-dynamics': '🧬',
    'antibody-docking': '💉',
    'cdr-generator': '🔬',
    'cellular-dynamics': '🦠',
    'binding-prediction': '🧬'
  };
  return icons[toolkit] || '⚙️';
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function renderUsageChart(breakdown) {
  const data = [{
    values: Object.values(breakdown),
    labels: Object.keys(breakdown),
    type: 'pie',
    marker: {
      colors: ['#7dd3fc', '#34d399', '#fbbf24', '#fb923c', '#a78bfa', '#60a5fa']
    }
  }];
  
  const layout = {
    paper_bgcolor: '#0a0f1a',
    plot_bgcolor: '#0a0f1a',
    font: { color: '#e5e7eb' },
    showlegend: true
  };
  
  Plotly.newPlot('usage-chart', data, layout);
}

function exportUsageData() {
  if (!currentUser) return;
  
  const stats = getUserUsageStats(currentUser.id);
  const exportData = {
    user: currentUser,
    statistics: stats,
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `computelab-usage-${currentUser.id}-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showModal('Usage data exported successfully', 'success');
}

//========================
// NAVIGATION HELPER
//========================

function navigateTo(sectionId) {
  // Close user menu
  document.getElementById('user-menu').style.display = 'none';
  
  // Find and click the appropriate sidebar item
  const item = document.querySelector(`[data-section="${sectionId}"]`);
  if (item) {
    item.click();
  }
}

//========================
// ATTRIBUTION
//========================

console.log('%c ComputeLab v0.2.0 ', 'background: linear-gradient(135deg, #2563eb, #7dd3fc); color: white; font-size: 16px; font-weight: bold; padding: 8px;');
console.log('%c Developed by D. Ferguson ', 'color: #7dd3fc; font-size: 12px;');
console.log('%c All computational methods based on peer-reviewed research ', 'color: #9ca3af; font-size: 10px;');
console.log('%c ⚠️ Remember: All predictions require experimental validation ', 'color: #fbbf24; font-size: 12px; font-weight: bold;');
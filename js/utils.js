// Utility functions for the application

// Format date to display format
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format date to YYYY-MM-DD format
function formatDateInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Get current time in HH:MM format
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Calculate days between two dates
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Check if user has admin role
function isAdmin() {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.role === 'admin';
}

// Redirect if user is not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '../../index.html';
    return false;
  }
  return true;
}

// Redirect if user is not admin
function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '../../index.html';
    return false;
  }
  return true;
}

// Handle logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '../../index.html';
}

// Get user by ID
function getUserById(userId) {
  const users = JSON.parse(localStorage.getItem('users'));
  return users.find(user => user.id === userId);
}

// Generate unique ID
function generateId(items) {
  const ids = items.map(item => item.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// Toggle sidebar on mobile
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar') || document.querySelector('.employee-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

// Toggle dropdown menu
function toggleDropdown(selector) {
  const dropdown = document.querySelector(selector);
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Close all dropdowns when clicking outside
document.addEventListener('click', function(event) {
  const dropdowns = document.querySelectorAll('.profile-dropdown');
  dropdowns.forEach(dropdown => {
    if (!event.target.closest('.user-profile') && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  });
});
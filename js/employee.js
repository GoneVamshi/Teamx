// Employee functionality

// Load user data for the employee interface
function loadUserData() {
  if (!requireAuth()) return;
  
  const currentUser = getCurrentUser();
  
  // Make sure user is employee
  if (currentUser.role !== 'employee') {
    window.location.href = '../../index.html';
    return;
  }
  
  // Get full user data
  const fullUserData = getUserById(currentUser.id);
  
  // Update employee name and image in the topbar
  const employeeName = document.getElementById('employee-name');
  const employeeImage = document.getElementById('employee-image');
  
  if (employeeName) employeeName.textContent = currentUser.name;
  if (employeeImage) employeeImage.src = currentUser.image;
  
  // Set active menu item based on current page
  setActiveMenuItem();
  
  return fullUserData;
}

// Set active menu item based on current page
function setActiveMenuItem() {
  const currentPage = window.location.pathname.split('/').pop();
  const menuItems = document.querySelectorAll('.employee-menu-item');
  
  menuItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === currentPage) {
      item.classList.add('active');
    }
  });
}

// Load dashboard data
function loadDashboard() {
  const currentUser = getCurrentUser();
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const announcements = JSON.parse(localStorage.getItem('announcements'));
  
  // Get tasks assigned to the current user
  const userTasks = tasks.filter(task => task.userId === currentUser.id);
  
  // Count tasks by status
  const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = userTasks.filter(task => task.status === 'completed').length;
  
  // Update task stats
  const pendingTasksEl = document.getElementById('pending-tasks');
  const inProgressTasksEl = document.getElementById('in-progress-tasks');
  const completedTasksEl = document.getElementById('completed-tasks');
  
  if (pendingTasksEl) pendingTasksEl.textContent = pendingTasks;
  if (inProgressTasksEl) inProgressTasksEl.textContent = inProgressTasks;
  if (completedTasksEl) completedTasksEl.textContent = completedTasks;
  
  // Load task list
  loadTaskList(userTasks);
  
  // Load announcements
  loadAnnouncementsList(announcements);
  
  // Check if user has checked in today
  checkAttendanceStatus();
}

// Load task list
function loadTaskList(tasks) {
  const tasksList = document.getElementById('tasks-list');
  
  if (!tasksList) return;
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<p>No tasks assigned to you yet.</p>';
    return;
  }
  
  tasksList.innerHTML = '';
  
  // Sort tasks by priority and due date
  tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    
    taskItem.innerHTML = `
      <div class="task-checkbox">
        <input type="checkbox" id="task-${task.id}" ${task.status === 'completed' ? 'checked' : ''} onchange="updateTaskStatus(${task.id}, this.checked)">
      </div>
      <div class="task-details">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span class="task-due">Due: ${formatDate(task.dueDate)}</span>
          <span class="task-priority priority-${task.priority}">${task.priority}</span>
        </div>
      </div>
    `;
    
    tasksList.appendChild(taskItem);
  });
}

// Update task status
function updateTaskStatus(taskId, isCompleted) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return;
  
  // Update task status
  tasks[taskIndex].status = isCompleted ? 'completed' : 'pending';
  
  // Save updated tasks
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  // Show success message
  showAlert('Task status updated!', 'success');
  
  // Reload dashboard after a short delay
  setTimeout(() => {
    loadDashboard();
  }, 1000);
}

// Load announcements list
function loadAnnouncementsList(announcements) {
  const announcementsList = document.getElementById('announcements-list');
  
  if (!announcementsList) return;
  
  if (announcements.length === 0) {
    announcementsList.innerHTML = '<p>No announcements yet.</p>';
    return;
  }
  
  announcementsList.innerHTML = '';
  
  // Sort announcements by date (newest first)
  announcements.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Show only the 5 most recent announcements
  const recentAnnouncements = announcements.slice(0, 5);
  
  recentAnnouncements.forEach(announcement => {
    const announcementItem = document.createElement('div');
    announcementItem.className = 'announcement';
    
    announcementItem.innerHTML = `
      <div class="announcement-header">
        <span class="announcement-title">${announcement.title}</span>
        <span class="announcement-date">${formatDate(announcement.date)}</span>
      </div>
      <p class="announcement-content">${announcement.content}</p>
    `;
    
    announcementsList.appendChild(announcementItem);
  });
}

// Check attendance status
function checkAttendanceStatus() {
  const currentUser = getCurrentUser();
  const attendance = JSON.parse(localStorage.getItem('attendance'));
  const today = getCurrentDate();
  
  // Check if user has already checked in today
  const todayRecord = attendance.find(record => 
    record.userId === currentUser.id && record.date === today
  );
  
  const checkInBtn = document.getElementById('check-in-btn');
  const checkOutBtn = document.getElementById('check-out-btn');
  const attendanceStatus = document.getElementById('attendance-status');
  
  if (!checkInBtn || !checkOutBtn || !attendanceStatus) return;
  
  if (todayRecord) {
    // User has a record for today
    attendanceStatus.textContent = `Status: ${todayRecord.status}`;
    
    if (todayRecord.checkOut) {
      // User has already checked out
      checkInBtn.disabled = true;
      checkOutBtn.disabled = true;
      attendanceStatus.textContent = `Status: ${todayRecord.status} (Checked in at ${todayRecord.checkIn}, Checked out at ${todayRecord.checkOut})`;
    } else {
      // User has checked in but not checked out
      checkInBtn.disabled = true;
      checkOutBtn.disabled = false;
      attendanceStatus.textContent = `Status: ${todayRecord.status} (Checked in at ${todayRecord.checkIn})`;
    }
  } else {
    // No record for today
    checkInBtn.disabled = false;
    checkOutBtn.disabled = true;
    attendanceStatus.textContent = 'Status: Not checked in yet';
  }
}

// Check in
function checkIn() {
  const currentUser = getCurrentUser();
  const attendance = JSON.parse(localStorage.getItem('attendance'));
  const today = getCurrentDate();
  const currentTime = getCurrentTime();
  
  // Create new attendance record
  const newRecord = {
    id: generateId(attendance),
    userId: currentUser.id,
    date: today,
    checkIn: currentTime,
    status: 'present'
  };
  
  // Add to attendance array
  attendance.push(newRecord);
  
  // Save updated attendance
  localStorage.setItem('attendance', JSON.stringify(attendance));
  
  // Update UI
  checkAttendanceStatus();
  
  // Show success message
  showAlert('Successfully checked in!', 'success');
}

// Check out
function checkOut() {
  const currentUser = getCurrentUser();
  const attendance = JSON.parse(localStorage.getItem('attendance'));
  const today = getCurrentDate();
  const currentTime = getCurrentTime();
  
  // Find today's record
  const recordIndex = attendance.findIndex(record => 
    record.userId === currentUser.id && record.date === today
  );
  
  if (recordIndex === -1) return;
  
  // Update record with check out time
  attendance[recordIndex].checkOut = currentTime;
  
  // Save updated attendance
  localStorage.setItem('attendance', JSON.stringify(attendance));
  
  // Update UI
  checkAttendanceStatus();
  
  // Show success message
  showAlert('Successfully checked out!', 'success');
}

// Load profile data
function loadProfile() {
  const userData = loadUserData();
  
  if (!userData) return;
  
  // Update profile information
  const profileName = document.getElementById('profile-name');
  const profilePosition = document.getElementById('profile-position');
  const profileDepartment = document.getElementById('profile-department');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileAddress = document.getElementById('profile-address');
  const profileJoinDate = document.getElementById('profile-join-date');
  const profileImage = document.getElementById('profile-image');
  
  if (profileName) profileName.textContent = userData.name;
  if (profilePosition) profilePosition.textContent = userData.position;
  if (profileDepartment) profileDepartment.textContent = userData.department;
  if (profileEmail) profileEmail.textContent = userData.email;
  if (profilePhone) profilePhone.textContent = userData.phone;
  if (profileAddress) profileAddress.textContent = userData.address;
  if (profileJoinDate) profileJoinDate.textContent = formatDate(userData.joinDate);
  if (profileImage) profileImage.src = userData.image;
  
  // Load attendance records
  loadAttendanceRecords();
  
  // Load leave history
  loadLeaveHistory();
}

// Load attendance records
function loadAttendanceRecords() {
  const currentUser = getCurrentUser();
  const attendance = JSON.parse(localStorage.getItem('attendance'));
  
  // Get user's attendance records
  const userAttendance = attendance.filter(record => record.userId === currentUser.id);
  
  const attendanceTable = document.getElementById('attendance-table');
  
  if (!attendanceTable) return;
  
  const tbody = attendanceTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  if (userAttendance.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4">No attendance records found.</td>';
    tbody.appendChild(row);
    return;
  }
  
  // Sort attendance records by date (newest first)
  userAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  userAttendance.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(record.date)}</td>
      <td>${record.checkIn}</td>
      <td>${record.checkOut || '-'}</td>
      <td>
        <span class="status-badge status-${record.status}">${record.status}</span>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Load leave history
function loadLeaveHistory() {
  const currentUser = getCurrentUser();
  const leaves = JSON.parse(localStorage.getItem('leaves'));
  
  // Get user's leave records
  const userLeaves = leaves.filter(leave => leave.userId === currentUser.id);
  
  const leavesTable = document.getElementById('leaves-table');
  
  if (!leavesTable) return;
  
  const tbody = leavesTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  if (userLeaves.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">No leave records found.</td>';
    tbody.appendChild(row);
    return;
  }
  
  // Sort leave records by application date (newest first)
  userLeaves.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  
  userLeaves.forEach(leave => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(leave.startDate)} to ${formatDate(leave.endDate)}</td>
      <td>${daysBetween(leave.startDate, leave.endDate) + 1} days</td>
      <td>${leave.reason}</td>
      <td>${formatDate(leave.appliedOn)}</td>
      <td>
        <span class="status-badge status-${leave.status}">${leave.status}</span>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Apply for leave
function applyForLeave() {
  const modalContent = `
    <form id="apply-leave-form">
      <div class="form-group">
        <label for="leave-start">Start Date</label>
        <input type="date" id="leave-start" name="startDate" min="${getCurrentDate()}" required>
      </div>
      
      <div class="form-group">
        <label for="leave-end">End Date</label>
        <input type="date" id="leave-end" name="endDate" min="${getCurrentDate()}" required>
      </div>
      
      <div class="form-group">
        <label for="leave-reason">Reason</label>
        <textarea id="leave-reason" name="reason" rows="3" required></textarea>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Submit Request</button>
      </div>
    </form>
  `;
  
  // Display the modal with leave application form
  showModal('Apply for Leave', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('apply-leave-form');
  form.addEventListener('submit', submitLeaveRequest);
  
  // Add event listener to start date to update end date min value
  const startDateInput = document.getElementById('leave-start');
  const endDateInput = document.getElementById('leave-end');
  
  startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value;
    if (new Date(endDateInput.value) < new Date(startDateInput.value)) {
      endDateInput.value = startDateInput.value;
    }
  });
}

// Submit leave request
function submitLeaveRequest(event) {
  event.preventDefault();
  
  const startDate = document.getElementById('leave-start').value;
  const endDate = document.getElementById('leave-end').value;
  const reason = document.getElementById('leave-reason').value;
  
  const leaves = JSON.parse(localStorage.getItem('leaves'));
  const currentUser = getCurrentUser();
  
  // Create new leave request
  const newLeave = {
    id: generateId(leaves),
    userId: currentUser.id,
    startDate,
    endDate,
    reason,
    status: 'pending',
    appliedOn: getCurrentDate()
  };
  
  // Add to leaves array
  leaves.push(newLeave);
  
  // Save updated leaves
  localStorage.setItem('leaves', JSON.stringify(leaves));
  
  // Close modal
  closeModal();
  
  // Show success message
  showAlert('Leave request submitted successfully!', 'success');
  
  // Reload leave history
  loadLeaveHistory();
}

// Show modal (same as in admin.js)
function showModal(title, content) {
  // Remove existing modal if any
  const existingModal = document.getElementById('modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create new modal
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  // Add modal to the body
  document.body.appendChild(modal);
  
  // Show modal
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Add event listener to close button
  const closeButton = modal.querySelector('.close-modal');
  closeButton.addEventListener('click', closeModal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

// Close modal (same as in admin.js)
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Show alert (same as in admin.js)
function showAlert(message, type) {
  // Remove existing alert if any
  const existingAlert = document.getElementById('alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  // Create new alert
  const alert = document.createElement('div');
  alert.id = 'alert';
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  // Add alert to the body
  document.body.appendChild(alert);
  
  // Show alert
  setTimeout(() => {
    alert.classList.add('show');
  }, 10);
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, 3000);
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  
  // Load page-specific data
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'dashboard.html') {
    loadDashboard();
    
    // Add event listeners for check in/out buttons
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    
    if (checkInBtn) checkInBtn.addEventListener('click', checkIn);
    if (checkOutBtn) checkOutBtn.addEventListener('click', checkOut);
    
  } else if (currentPage === 'profile.html') {
    loadProfile();
    
    // Add event listener for apply leave button
    const applyLeaveBtn = document.getElementById('apply-leave-btn');
    if (applyLeaveBtn) {
      applyLeaveBtn.addEventListener('click', applyForLeave);
    }
  }
  
  // Add event listener to mobile toggle button
  const mobileToggle = document.getElementById('employee-mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleSidebar);
  }
  
  // Add event listener to profile toggle
  const profileToggle = document.getElementById('employee-profile-toggle');
  if (profileToggle) {
    profileToggle.addEventListener('click', () => {
      toggleDropdown('#employee-profile-dropdown');
    });
  }
  
  // Add event listener to logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
// Admin functionality

// Load user data for the admin interface
function loadUserData() {
  if (!requireAdmin()) return;
  
  const currentUser = getCurrentUser();
  
  // Update admin name and image in the topbar
  const adminName = document.getElementById('admin-name');
  const adminImage = document.getElementById('admin-image');
  
  if (adminName) adminName.textContent = currentUser.name;
  if (adminImage) adminImage.src = currentUser.image;
  
  // Set active menu item based on current page
  setActiveMenuItem();
}

// Set active menu item based on current page
function setActiveMenuItem() {
  const currentPage = window.location.pathname.split('/').pop();
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === currentPage) {
      item.classList.add('active');
    }
  });
}

// Load dashboard statistics
function loadDashboardStats() {
  const users = JSON.parse(localStorage.getItem('users'));
  const attendance = JSON.parse(localStorage.getItem('attendance'));
  const leaves = JSON.parse(localStorage.getItem('leaves'));
  
  // Total employees (excluding admin)
  const totalEmployees = users.filter(user => user.role === 'employee').length;
  
  // Present today
  const today = getCurrentDate();
  const presentToday = attendance.filter(record => record.date === today && record.status === 'present').length;
  
  // Pending leave requests
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending').length;
  
  // Update stats in the DOM
  const totalEmployeesEl = document.getElementById('total-employees');
  const presentTodayEl = document.getElementById('present-today');
  const pendingLeavesEl = document.getElementById('pending-leaves');
  
  if (totalEmployeesEl) totalEmployeesEl.textContent = totalEmployees;
  if (presentTodayEl) presentTodayEl.textContent = presentToday;
  if (pendingLeavesEl) pendingLeavesEl.textContent = pendingLeaves;
}

// Load employees table
function loadEmployees() {
  const users = JSON.parse(localStorage.getItem('users'));
  const employees = users.filter(user => user.role === 'employee');
  const employeesTable = document.getElementById('employees-table');
  
  if (!employeesTable) return;
  
  const tbody = employeesTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  employees.forEach(employee => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="flex align-center">
          <img src="${employee.image}" alt="${employee.name}" width="40" height="40" style="border-radius: 50%; margin-right: 10px;">
          ${employee.name}
        </div>
      </td>
      <td>${employee.email}</td>
      <td>${employee.position}</td>
      <td>${employee.department}</td>
      <td>${formatDate(employee.joinDate)}</td>
      <td>
        <div class="employee-actions">
          <button class="btn btn-sm btn-primary" onclick="viewEmployee(${employee.id})">View</button>
          <button class="btn btn-sm btn-secondary" onclick="editEmployee(${employee.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${employee.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// View employee details
function viewEmployee(employeeId) {
  const employee = getUserById(employeeId);
  
  if (!employee) return;
  
  const modalContent = `
    <div class="profile-info mb-4">
      <div class="profile-image">
        <img src="${employee.image}" alt="${employee.name}">
      </div>
      <div class="profile-details">
        <h2 class="profile-name">${employee.name}</h2>
        <div class="profile-meta">
          <div class="meta-item">
            <i class="fas fa-briefcase"></i>
            <span>${employee.position}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-building"></i>
            <span>${employee.department}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-envelope"></i>
            <span>${employee.email}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-phone"></i>
            <span>${employee.phone}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${employee.address}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span>Joined: ${formatDate(employee.joinDate)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Display the modal with employee details
  showModal('Employee Details', modalContent);
}

// Edit employee
function editEmployee(employeeId) {
  const employee = getUserById(employeeId);
  
  if (!employee) return;
  
  const modalContent = `
    <form id="edit-employee-form">
      <input type="hidden" id="employee-id" value="${employee.id}">
      
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" value="${employee.name}" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="${employee.email}" required>
      </div>
      
      <div class="form-group">
        <label for="position">Position</label>
        <input type="text" id="position" name="position" value="${employee.position}" required>
      </div>
      
      <div class="form-group">
        <label for="department">Department</label>
        <input type="text" id="department" name="department" value="${employee.department}" required>
      </div>
      
      <div class="form-group">
        <label for="phone">Phone</label>
        <input type="text" id="phone" name="phone" value="${employee.phone}" required>
      </div>
      
      <div class="form-group">
        <label for="address">Address</label>
        <input type="text" id="address" name="address" value="${employee.address}" required>
      </div>
      
      <div class="form-group">
        <label for="join-date">Join Date</label>
        <input type="date" id="join-date" name="joinDate" value="${formatDateInput(employee.joinDate)}" required>
      </div>
      
      <div class="form-group">
        <label for="image">Profile Image URL</label>
        <input type="text" id="image" name="image" value="${employee.image}" required>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Update Employee</button>
      </div>
    </form>
  `;
  
  // Display the modal with employee edit form
  showModal('Edit Employee', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('edit-employee-form');
  form.addEventListener('submit', updateEmployee);
}

// Update employee data
function updateEmployee(event) {
  event.preventDefault();
  
  const employeeId = parseInt(document.getElementById('employee-id').value);
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const position = document.getElementById('position').value;
  const department = document.getElementById('department').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const joinDate = document.getElementById('join-date').value;
  const image = document.getElementById('image').value;
  
  const users = JSON.parse(localStorage.getItem('users'));
  const userIndex = users.findIndex(user => user.id === employeeId);
  
  if (userIndex === -1) return;
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    position,
    department,
    phone,
    address,
    joinDate,
    image
  };
  
  // Save updated users
  localStorage.setItem('users', JSON.stringify(users));
  
  // Close modal and reload employees
  closeModal();
  loadEmployees();
  
  // Show success message
  showAlert('Employee updated successfully!', 'success');
}

// Delete employee
function deleteEmployee(employeeId) {
  if (confirm('Are you sure you want to delete this employee?')) {
    const users = JSON.parse(localStorage.getItem('users'));
    const updatedUsers = users.filter(user => user.id !== employeeId);
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Reload employees
    loadEmployees();
    
    // Show success message
    showAlert('Employee deleted successfully!', 'success');
  }
}

// Add new employee
function addEmployee() {
  const modalContent = `
    <form id="add-employee-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      
      <div class="form-group">
        <label for="position">Position</label>
        <input type="text" id="position" name="position" required>
      </div>
      
      <div class="form-group">
        <label for="department">Department</label>
        <input type="text" id="department" name="department" required>
      </div>
      
      <div class="form-group">
        <label for="phone">Phone</label>
        <input type="text" id="phone" name="phone" required>
      </div>
      
      <div class="form-group">
        <label for="address">Address</label>
        <input type="text" id="address" name="address" required>
      </div>
      
      <div class="form-group">
        <label for="join-date">Join Date</label>
        <input type="date" id="join-date" name="joinDate" value="${getCurrentDate()}" required>
      </div>
      
      <div class="form-group">
        <label for="image">Profile Image URL</label>
        <input type="text" id="image" name="image" value="https://images.pexels.com/photos/1557843/pexels-photo-1557843.jpeg?auto=compress&cs=tinysrgb&w=150" required>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Add Employee</button>
      </div>
    </form>
  `;
  
  // Display the modal with add employee form
  showModal('Add New Employee', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('add-employee-form');
  form.addEventListener('submit', saveNewEmployee);
}

// Save new employee
function saveNewEmployee(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const position = document.getElementById('position').value;
  const department = document.getElementById('department').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const joinDate = document.getElementById('join-date').value;
  const image = document.getElementById('image').value;
  
  const users = JSON.parse(localStorage.getItem('users'));
  
  // Create new employee
  const newEmployee = {
    id: generateId(users),
    name,
    email,
    password,
    role: 'employee',
    position,
    department,
    joinDate,
    phone,
    address,
    image
  };
  
  // Add to users array
  users.push(newEmployee);
  
  // Save updated users
  localStorage.setItem('users', JSON.stringify(users));
  
  // Close modal and reload employees
  closeModal();
  loadEmployees();
  
  // Show success message
  showAlert('Employee added successfully!', 'success');
}

// Load leaves
function loadLeaves() {
  const leaves = JSON.parse(localStorage.getItem('leaves'));
  const leavesTable = document.getElementById('leaves-table');
  
  if (!leavesTable) return;
  
  const tbody = leavesTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  leaves.forEach(leave => {
    const employee = getUserById(leave.userId);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${employee ? employee.name : 'Unknown'}</td>
      <td>${formatDate(leave.startDate)} to ${formatDate(leave.endDate)}</td>
      <td>${daysBetween(leave.startDate, leave.endDate) + 1} days</td>
      <td>${leave.reason}</td>
      <td>${formatDate(leave.appliedOn)}</td>
      <td>
        <span class="status-badge status-${leave.status}">${leave.status}</span>
      </td>
      <td>
        ${leave.status === 'pending' ? `
          <div class="employee-actions">
            <button class="btn btn-sm btn-primary" onclick="approveLeave(${leave.id})">Approve</button>
            <button class="btn btn-sm btn-danger" onclick="rejectLeave(${leave.id})">Reject</button>
          </div>
        ` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Approve leave
function approveLeave(leaveId) {
  const leaves = JSON.parse(localStorage.getItem('leaves'));
  const leaveIndex = leaves.findIndex(leave => leave.id === leaveId);
  
  if (leaveIndex === -1) return;
  
  // Update leave status
  leaves[leaveIndex].status = 'approved';
  
  // Save updated leaves
  localStorage.setItem('leaves', JSON.stringify(leaves));
  
  // Reload leaves
  loadLeaves();
  
  // Show success message
  showAlert('Leave request approved!', 'success');
}

// Reject leave
function rejectLeave(leaveId) {
  const leaves = JSON.parse(localStorage.getItem('leaves'));
  const leaveIndex = leaves.findIndex(leave => leave.id === leaveId);
  
  if (leaveIndex === -1) return;
  
  // Update leave status
  leaves[leaveIndex].status = 'rejected';
  
  // Save updated leaves
  localStorage.setItem('leaves', JSON.stringify(leaves));
  
  // Reload leaves
  loadLeaves();
  
  // Show success message
  showAlert('Leave request rejected!', 'success');
}

// Load tasks
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const tasksTable = document.getElementById('tasks-table');
  
  if (!tasksTable) return;
  
  const tbody = tasksTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  tasks.forEach(task => {
    const employee = getUserById(task.userId);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${task.title}</td>
      <td>${employee ? employee.name : 'Unknown'}</td>
      <td>${formatDate(task.dueDate)}</td>
      <td>
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
      </td>
      <td>
        <span class="status-badge status-${task.status}">${task.status}</span>
      </td>
      <td>
        <div class="employee-actions">
          <button class="btn btn-sm btn-secondary" onclick="editTask(${task.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Add new task
function addTask() {
  const users = JSON.parse(localStorage.getItem('users'));
  const employees = users.filter(user => user.role === 'employee');
  
  let employeeOptions = '';
  employees.forEach(employee => {
    employeeOptions += `<option value="${employee.id}">${employee.name}</option>`;
  });
  
  const modalContent = `
    <form id="add-task-form">
      <div class="form-group">
        <label for="task-title">Title</label>
        <input type="text" id="task-title" name="title" required>
      </div>
      
      <div class="form-group">
        <label for="task-description">Description</label>
        <textarea id="task-description" name="description" rows="3" required></textarea>
      </div>
      
      <div class="form-group">
        <label for="task-employee">Assign To</label>
        <select id="task-employee" name="userId" required>
          <option value="">Select Employee</option>
          ${employeeOptions}
        </select>
      </div>
      
      <div class="form-group">
        <label for="task-due-date">Due Date</label>
        <input type="date" id="task-due-date" name="dueDate" min="${getCurrentDate()}" required>
      </div>
      
      <div class="form-group">
        <label for="task-priority">Priority</label>
        <select id="task-priority" name="priority" required>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Add Task</button>
      </div>
    </form>
  `;
  
  // Display the modal with add task form
  showModal('Add New Task', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('add-task-form');
  form.addEventListener('submit', saveNewTask);
}

// Save new task
function saveNewTask(event) {
  event.preventDefault();
  
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const userId = parseInt(document.getElementById('task-employee').value);
  const dueDate = document.getElementById('task-due-date').value;
  const priority = document.getElementById('task-priority').value;
  
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const currentUser = getCurrentUser();
  
  // Create new task
  const newTask = {
    id: generateId(tasks),
    title,
    description,
    userId,
    dueDate,
    priority,
    status: 'pending',
    assignedBy: currentUser.id
  };
  
  // Add to tasks array
  tasks.push(newTask);
  
  // Save updated tasks
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  // Close modal and reload tasks
  closeModal();
  loadTasks();
  
  // Show success message
  showAlert('Task added successfully!', 'success');
}

// Edit task
function editTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return;
  
  const users = JSON.parse(localStorage.getItem('users'));
  const employees = users.filter(user => user.role === 'employee');
  
  let employeeOptions = '';
  employees.forEach(employee => {
    const selected = employee.id === task.userId ? 'selected' : '';
    employeeOptions += `<option value="${employee.id}" ${selected}>${employee.name}</option>`;
  });
  
  let priorityOptions = '';
  ['low', 'medium', 'high'].forEach(p => {
    const selected = p === task.priority ? 'selected' : '';
    priorityOptions += `<option value="${p}" ${selected}>${p}</option>`;
  });
  
  let statusOptions = '';
  ['pending', 'in-progress', 'completed'].forEach(s => {
    const selected = s === task.status ? 'selected' : '';
    statusOptions += `<option value="${s}" ${selected}>${s}</option>`;
  });
  
  const modalContent = `
    <form id="edit-task-form">
      <input type="hidden" id="task-id" value="${task.id}">
      
      <div class="form-group">
        <label for="task-title">Title</label>
        <input type="text" id="task-title" name="title" value="${task.title}" required>
      </div>
      
      <div class="form-group">
        <label for="task-description">Description</label>
        <textarea id="task-description" name="description" rows="3" required>${task.description}</textarea>
      </div>
      
      <div class="form-group">
        <label for="task-employee">Assign To</label>
        <select id="task-employee" name="userId" required>
          <option value="">Select Employee</option>
          ${employeeOptions}
        </select>
      </div>
      
      <div class="form-group">
        <label for="task-due-date">Due Date</label>
        <input type="date" id="task-due-date" name="dueDate" value="${formatDateInput(task.dueDate)}" required>
      </div>
      
      <div class="form-group">
        <label for="task-priority">Priority</label>
        <select id="task-priority" name="priority" required>
          ${priorityOptions}
        </select>
      </div>
      
      <div class="form-group">
        <label for="task-status">Status</label>
        <select id="task-status" name="status" required>
          ${statusOptions}
        </select>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Update Task</button>
      </div>
    </form>
  `;
  
  // Display the modal with edit task form
  showModal('Edit Task', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('edit-task-form');
  form.addEventListener('submit', updateTask);
}

// Update task
function updateTask(event) {
  event.preventDefault();
  
  const taskId = parseInt(document.getElementById('task-id').value);
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const userId = parseInt(document.getElementById('task-employee').value);
  const dueDate = document.getElementById('task-due-date').value;
  const priority = document.getElementById('task-priority').value;
  const status = document.getElementById('task-status').value;
  
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) return;
  
  // Update task
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title,
    description,
    userId,
    dueDate,
    priority,
    status
  };
  
  // Save updated tasks
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  // Close modal and reload tasks
  closeModal();
  loadTasks();
  
  // Show success message
  showAlert('Task updated successfully!', 'success');
}

// Delete task
function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    // Save updated tasks
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Reload tasks
    loadTasks();
    
    // Show success message
    showAlert('Task deleted successfully!', 'success');
  }
}

// Load announcements
function loadAnnouncements() {
  const announcements = JSON.parse(localStorage.getItem('announcements'));
  const announcementsTable = document.getElementById('announcements-table');
  
  if (!announcementsTable) return;
  
  const tbody = announcementsTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  announcements.forEach(announcement => {
    const admin = getUserById(announcement.postedBy);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${announcement.title}</td>
      <td>${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}</td>
      <td>${formatDate(announcement.date)}</td>
      <td>${admin ? admin.name : 'Unknown'}</td>
      <td>
        <div class="employee-actions">
          <button class="btn btn-sm btn-secondary" onclick="editAnnouncement(${announcement.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${announcement.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Add new announcement
function addAnnouncement() {
  const modalContent = `
    <form id="add-announcement-form">
      <div class="form-group">
        <label for="announcement-title">Title</label>
        <input type="text" id="announcement-title" name="title" required>
      </div>
      
      <div class="form-group">
        <label for="announcement-content">Content</label>
        <textarea id="announcement-content" name="content" rows="5" required></textarea>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Add Announcement</button>
      </div>
    </form>
  `;
  
  // Display the modal with add announcement form
  showModal('Add New Announcement', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('add-announcement-form');
  form.addEventListener('submit', saveNewAnnouncement);
}

// Save new announcement
function saveNewAnnouncement(event) {
  event.preventDefault();
  
  const title = document.getElementById('announcement-title').value;
  const content = document.getElementById('announcement-content').value;
  
  const announcements = JSON.parse(localStorage.getItem('announcements'));
  const currentUser = getCurrentUser();
  
  // Create new announcement
  const newAnnouncement = {
    id: generateId(announcements),
    title,
    content,
    date: getCurrentDate(),
    postedBy: currentUser.id
  };
  
  // Add to announcements array
  announcements.push(newAnnouncement);
  
  // Save updated announcements
  localStorage.setItem('announcements', JSON.stringify(announcements));
  
  // Close modal and reload announcements
  closeModal();
  loadAnnouncements();
  
  // Show success message
  showAlert('Announcement added successfully!', 'success');
}

// Edit announcement
function editAnnouncement(announcementId) {
  const announcements = JSON.parse(localStorage.getItem('announcements'));
  const announcement = announcements.find(a => a.id === announcementId);
  
  if (!announcement) return;
  
  const modalContent = `
    <form id="edit-announcement-form">
      <input type="hidden" id="announcement-id" value="${announcement.id}">
      
      <div class="form-group">
        <label for="announcement-title">Title</label>
        <input type="text" id="announcement-title" name="title" value="${announcement.title}" required>
      </div>
      
      <div class="form-group">
        <label for="announcement-content">Content</label>
        <textarea id="announcement-content" name="content" rows="5" required>${announcement.content}</textarea>
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Update Announcement</button>
      </div>
    </form>
  `;
  
  // Display the modal with edit announcement form
  showModal('Edit Announcement', modalContent);
  
  // Add event listener to the form
  const form = document.getElementById('edit-announcement-form');
  form.addEventListener('submit', updateAnnouncement);
}

// Update announcement
function updateAnnouncement(event) {
  event.preventDefault();
  
  const announcementId = parseInt(document.getElementById('announcement-id').value);
  const title = document.getElementById('announcement-title').value;
  const content = document.getElementById('announcement-content').value;
  
  const announcements = JSON.parse(localStorage.getItem('announcements'));
  const announcementIndex = announcements.findIndex(announcement => announcement.id === announcementId);
  
  if (announcementIndex === -1) return;
  
  // Update announcement
  announcements[announcementIndex] = {
    ...announcements[announcementIndex],
    title,
    content
  };
  
  // Save updated announcements
  localStorage.setItem('announcements', JSON.stringify(announcements));
  
  // Close modal and reload announcements
  closeModal();
  loadAnnouncements();
  
  // Show success message
  showAlert('Announcement updated successfully!', 'success');
}

// Delete announcement
function deleteAnnouncement(announcementId) {
  if (confirm('Are you sure you want to delete this announcement?')) {
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    const updatedAnnouncements = announcements.filter(announcement => announcement.id !== announcementId);
    
    // Save updated announcements
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    
    // Reload announcements
    loadAnnouncements();
    
    // Show success message
    showAlert('Announcement deleted successfully!', 'success');
  }
}

// Show modal
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

// Close modal
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Show alert
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
    loadDashboardStats();
  } else if (currentPage === 'employees.html') {
    loadEmployees();
    
    // Add event listener to Add Employee button
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (addEmployeeBtn) {
      addEmployeeBtn.addEventListener('click', addEmployee);
    }
  } else if (currentPage === 'leaves.html') {
    loadLeaves();
  } else if (currentPage === 'tasks.html') {
    loadTasks();
    
    // Add event listener to Add Task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', addTask);
    }
  } else if (currentPage === 'announcements.html') {
    loadAnnouncements();
    
    // Add event listener to Add Announcement button
    const addAnnouncementBtn = document.getElementById('add-announcement-btn');
    if (addAnnouncementBtn) {
      addAnnouncementBtn.addEventListener('click', addAnnouncement);
    }
  }
  
  // Add event listener to mobile toggle button
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleSidebar);
  }
  
  // Add event listener to profile toggle
  const profileToggle = document.getElementById('profile-toggle');
  if (profileToggle) {
    profileToggle.addEventListener('click', () => {
      toggleDropdown('#profile-dropdown');
    });
  }
  
  // Add event listener to logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
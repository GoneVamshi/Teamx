// Handle authentication related functionality

// Initialize users if they don't exist
function initializeUsers() {
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@workforce.com',
        password: 'admin123',
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        joinDate: '2023-01-15',
        phone: '+1 (555) 123-4567',
        address: '123 Admin Street, Tech City',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john@workforce.com',
        password: 'employee123',
        role: 'employee',
        position: 'Software Developer',
        department: 'Engineering',
        joinDate: '2023-03-10',
        phone: '+1 (555) 987-6543',
        address: '456 Developer Avenue, Code Town',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
      {
        id: 3,
        name: 'Jane Smith',
        email: 'jane@workforce.com',
        password: 'employee123',
        role: 'employee',
        position: 'Marketing Specialist',
        department: 'Marketing',
        joinDate: '2023-02-20',
        phone: '+1 (555) 456-7890',
        address: '789 Marketing Boulevard, Brand City',
        image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
}

// Initialize attendance records if they don't exist
function initializeAttendance() {
  if (!localStorage.getItem('attendance')) {
    const today = new Date().toISOString().split('T')[0];
    const defaultAttendance = [
      {
        id: 1,
        userId: 2,
        date: today,
        checkIn: '09:00',
        checkOut: '17:30',
        status: 'present'
      },
      {
        id: 2,
        userId: 3,
        date: today,
        checkIn: '08:45',
        checkOut: '17:15',
        status: 'present'
      }
    ];
    localStorage.setItem('attendance', JSON.stringify(defaultAttendance));
  }
}

// Initialize leave requests if they don't exist
function initializeLeaves() {
  if (!localStorage.getItem('leaves')) {
    const defaultLeaves = [
      {
        id: 1,
        userId: 2,
        startDate: '2025-04-15',
        endDate: '2025-04-20',
        reason: 'Family vacation',
        status: 'approved',
        appliedOn: '2025-03-25'
      },
      {
        id: 2,
        userId: 3,
        startDate: '2025-05-10',
        endDate: '2025-05-12',
        reason: 'Personal emergency',
        status: 'pending',
        appliedOn: '2025-05-01'
      }
    ];
    localStorage.setItem('leaves', JSON.stringify(defaultLeaves));
  }
}

// Initialize tasks if they don't exist
function initializeTasks() {
  if (!localStorage.getItem('tasks')) {
    const defaultTasks = [
      {
        id: 1,
        userId: 2,
        title: 'Complete project documentation',
        description: 'Finish the API documentation for the new feature',
        dueDate: '2025-04-20',
        priority: 'high',
        status: 'pending',
        assignedBy: 1
      },
      {
        id: 2,
        userId: 3,
        title: 'Prepare marketing materials',
        description: 'Create brochures and social media posts for product launch',
        dueDate: '2025-04-25',
        priority: 'medium',
        status: 'pending',
        assignedBy: 1
      }
    ];
    localStorage.setItem('tasks', JSON.stringify(defaultTasks));
  }
}

// Initialize announcements if they don't exist
function initializeAnnouncements() {
  if (!localStorage.getItem('announcements')) {
    const defaultAnnouncements = [
      {
        id: 1,
        title: 'Company Meeting',
        content: 'There will be a company-wide meeting on Friday at 3:00 PM in the main conference room.',
        date: '2025-04-10',
        postedBy: 1
      },
      {
        id: 2,
        title: 'New Health Benefits',
        content: 'We are pleased to announce new health benefits for all employees starting next month. Details will be sent via email.',
        date: '2025-04-12',
        postedBy: 1
      }
    ];
    localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
  }
}

// Initialize all data
function initializeData() {
  initializeUsers();
  initializeAttendance();
  initializeLeaves();
  initializeTasks();
  initializeAnnouncements();
}

// Login functionality
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const authMessage = document.getElementById('auth-message');
  
  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.email === email && u.password === password && u.role === role);
  
  if (user) {
    // Store the logged-in user ID and role
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image
    }));
    
    // Redirect based on role
    if (user.role === 'admin') {
      window.location.href = 'pages/admin/dashboard.html';
    } else {
      window.location.href = 'pages/employee/dashboard.html';
    }
  } else {
    authMessage.textContent = 'Invalid email, password, or role. Please try again.';
    authMessage.className = 'auth-message error';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Check if user is already logged in
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    if (currentUser.role === 'admin') {
      window.location.href = 'pages/admin/dashboard.html';
    } else {
      window.location.href = 'pages/employee/dashboard.html';
    }
  }
});
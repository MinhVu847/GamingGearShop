/**
 * HỆ THỐNG XÁC THỰC VÀ PHÂN QUYỀN (USER / ADMIN)
 * File: js/auth.js
 * Quản lý: Đăng ký, Đăng nhập, Phiên làm việc (LocalStorage), Cập nhật Header
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    USERS: 'pcx_users',
    CURRENT_USER: 'pcx_current_user'
  };

  // Tài khoản mẫu mặc định
  const DEFAULT_USERS = [
    {
      id: 'usr-admin',
      name: 'Quản Trị Viên Phong Cách Xanh',
      email: 'admin@phongcachxanh.vn',
      phone: '0904135321',
      password: 'admin123',
      role: 'admin',
      createdAt: '2026-01-01'
    },
    {
      id: 'usr-001',
      name: 'Nguyễn Minh Vũ',
      email: 'user@gmail.com',
      phone: '0901234567',
      password: '123456',
      role: 'user',
      createdAt: '2026-01-15'
    }
  ];

  // Khởi tạo danh sách users nếu chưa có trong LocalStorage
  function getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(data) || DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      // Không lưu mật khẩu thô vào session để an toàn hơn
      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Đăng nhập
  function login(email, password) {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

    if (!user) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
    }

    setCurrentUser(user);
    return { success: true, user };
  }

  // Đăng ký tài khoản mới (Mặc định role: 'user')
  function register(data) {
    const users = getUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    // Kiểm tra trùng email
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác!' };
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone ? data.phone.trim() : '',
      password: data.password,
      role: 'user', // Tài khoản đăng ký luôn là user
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  // Đăng xuất
  function logout() {
    setCurrentUser(null);
    window.location.reload();
  }

  // Cập nhật giao diện Header trên các trang bán hàng
  function initHeaderUserUI() {
    const userIconBtn = document.getElementById('userAccountBtn');
    if (!userIconBtn) return;

    const currentUser = getCurrentUser();

    // 1. Nếu chưa đăng nhập: Click vào icon chuyển hướng sang trang login.html
    if (!currentUser) {
      userIconBtn.style.position = 'relative';
      userIconBtn.style.cursor = 'pointer';
      userIconBtn.title = 'Đăng nhập / Đăng ký';
      userIconBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
      };
      return;
    }

    // 2. Nếu đã đăng nhập: Cập nhật giao diện và menu người dùng
    userIconBtn.style.position = 'relative';
    userIconBtn.style.cursor = 'pointer';
    userIconBtn.classList.add('user-logged-in');

    const firstName = currentUser.name.split(' ').pop();
    const isAdmin = currentUser.role === 'admin';

    // Đổi hiển thị icon
    userIconBtn.innerHTML = `
      <i class="fa-solid ${isAdmin ? 'fa-user-shield' : 'fa-circle-user'} text-accent-user"></i>
      <span class="user-header-name">${escapeHtml(firstName)}</span>
      ${isAdmin ? '<span class="admin-badge-mini">ADMIN</span>' : ''}
    `;
    userIconBtn.title = `Tài khoản: ${currentUser.name} (${isAdmin ? 'Quản trị viên' : 'Khách hàng'})`;

    // Tạo Dropdown menu người dùng
    let dropdown = document.getElementById('pcxUserDropdownMenu');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'pcxUserDropdownMenu';
      dropdown.className = 'pcx-user-dropdown';
      document.body.appendChild(dropdown);
    }

    dropdown.innerHTML = `
      <div class="pcx-user-dd-header">
        <div class="pcx-user-dd-avatar">
          <i class="fa-solid ${isAdmin ? 'fa-user-shield' : 'fa-user'}"></i>
        </div>
        <div class="pcx-user-dd-info">
          <strong>${escapeHtml(currentUser.name)}</strong>
          <span>${escapeHtml(currentUser.email)}</span>
          <span class="pcx-role-tag ${isAdmin ? 'tag-admin' : 'tag-user'}">
            ${isAdmin ? 'Quản Trị Viên' : 'Khách Hàng'}
          </span>
        </div>
      </div>
      <div class="pcx-user-dd-body">
        ${isAdmin ? `
          <a href="admin.html" class="pcx-dd-item pcx-dd-admin-link">
            <i class="fa-solid fa-gauge-high"></i> Trang Quản Trị Hệ Thống
          </a>
        ` : ''}
        <button type="button" class="pcx-dd-item" id="pcxBtnViewMyOrders">
          <i class="fa-solid fa-box-archive"></i> Đơn hàng của tôi
        </button>
        <button type="button" class="pcx-dd-item pcx-dd-logout" id="pcxBtnLogout">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
        </button>
      </div>
    `;

    // Định vị dropdown ngay dưới nút icon user khi click
    userIconBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isShowing = dropdown.classList.contains('active');
      if (isShowing) {
        dropdown.classList.remove('active');
      } else {
        const rect = userIconBtn.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY + 10}px`;
        dropdown.style.right = `${Math.max(15, window.innerWidth - rect.right - window.scrollX)}px`;
        dropdown.classList.add('active');
      }
    };

    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !userIconBtn.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Sự kiện mở modal đơn hàng của tôi
    const viewOrdersBtn = document.getElementById('pcxBtnViewMyOrders');
    if (viewOrdersBtn) {
      viewOrdersBtn.onclick = () => {
        dropdown.classList.remove('active');
        const historyModal = document.getElementById('pcxHistoryModal');
        if (historyModal) {
          historyModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      };
    }

    // Sự kiện Đăng xuất
    const logoutBtn = document.getElementById('pcxBtnLogout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        logout();
      };
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // Tự động chạy khi DOM sẵn sàng
  document.addEventListener('DOMContentLoaded', () => {
    getUsers(); // Đảm bảo khởi tạo users mẫu
    initHeaderUserUI();
  });

  // Xuất API toàn cục để login.html và admin.html sử dụng
  window.PCX_AUTH = {
    getUsers,
    getCurrentUser,
    setCurrentUser,
    login,
    register,
    logout
  };

})();

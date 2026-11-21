document.addEventListener('DOMContentLoaded', () => {
      const tabLogin = document.getElementById('tabBtnLogin');
      const tabRegister = document.getElementById('tabBtnRegister');
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      const alertBox = document.getElementById('authAlert');

      function showAlert(msg, isError = true) {
        alertBox.className = `auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`;
        alertBox.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${msg}`;
        alertBox.style.display = 'flex';
      }

      function hideAlert() {
        alertBox.style.display = 'none';
      }

      // Chuyển tab Đăng nhập / Đăng ký
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        hideAlert();
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        hideAlert();
      });

      // Bật/tắt ẩn hiện mật khẩu
      document.querySelectorAll('.toggle-pwd').forEach(icon => {
        icon.addEventListener('click', () => {
          const targetId = icon.getAttribute('data-target');
          const input = document.getElementById(targetId);
          if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fa-regular fa-eye-slash toggle-pwd';
          } else {
            input.type = 'password';
            icon.className = 'fa-regular fa-eye toggle-pwd';
          }
        });
      });

      // Xử lý nộp form Đăng nhập
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = window.PCX_AUTH.login(email, password);

        if (!result.success) {
          showAlert(result.message, true);
          return;
        }

        showAlert(`Đăng nhập thành công! Đang chuyển hướng...`, false);

        // Phân quyền chuyển hướng
        setTimeout(() => {
          if (result.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
      });

      // Xử lý nộp form Đăng ký
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();

        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
          showAlert('Mật khẩu xác nhận không trùng khớp!', true);
          return;
        }

        const result = window.PCX_AUTH.register({ name, email, phone, password });

        if (!result.success) {
          showAlert(result.message, true);
          return;
        }

        showAlert('Đăng ký tài khoản thành công! Đang chuyển hướng về trang chủ...', false);

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      });
    });
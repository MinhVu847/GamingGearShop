/**
 * CHỨC NĂNG ĐẶT HÀNG GIẢ LẬP - GAMING GEAR SHOP (PHONG CÁCH XANH)
 * File: js/order-mock.js
 * Tính năng:
 * - Quản lý giỏ hàng (thêm, sửa, xoá, lưu LocalStorage)
 * - Tự động tính tiền, áp mã giảm giá (Voucher)
 * - Modal thanh toán thông minh với tính năng "⚡ Điền nhanh thông tin test"
 * - 3 Phương thức thanh toán giả lập: COD, Quét mã QR VietQR (đếm ngược), Thẻ ATM/Visa test
 * - Modal Đặt hàng thành công kèm hiệu ứng Confetti, âm thanh Ting Ting (Web Audio API)
 * - Tích điểm EXP & Lịch sử đơn hàng
 */

(function () {
  'use strict';

  // ===================== DỮ LIỆU & TRẠNG THÁI =====================
  const STORAGE_KEYS = {
    CART: 'pcx_cart',
    ORDERS: 'pcx_orders'
  };

  // Danh sách mã giảm giá mẫu
  const MOCK_VOUCHERS = {
    'GEAR5': { type: 'percent', value: 5, label: 'Giảm 5% tổng đơn hàng' },
    'FREESHIP': { type: 'ship', value: 30000, label: 'Miễn phí vận chuyển (30.000đ)' },
    'GAMING100K': { type: 'fixed', value: 100000, minOrder: 500000, label: 'Giảm 100.000đ cho đơn từ 500k' },
    'PRO15': { type: 'percent', value: 15, label: 'Giảm 15% cho thành viên Pro' }
  };

  let cart = loadCart();
  let appliedVoucher = null;
  let qrInterval = null;
  let qrRemainingSeconds = 300; // 5 phút

  // ===================== KHỞI TẠO HỆ THỐNG =====================
  document.addEventListener('DOMContentLoaded', () => {
    injectCartAndCheckoutModals();
    updateCartBadge();
    bindProductButtons();
    bindHeaderIcons();
  });

  // ===================== QUẢN LÝ LOCALSTORAGE =====================
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateCartBadge();
  }

  function loadOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOrder(order) {
    const orders = loadOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  // ===================== HIỆU ỨNG ÂM THANH (WEB AUDIO API) =====================
  function playAudioTone(type) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'add') {
        // Âm thanh pop nhẹ khi thêm giỏ hàng
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'success') {
        // Âm thanh ting ting ngân vang khi thanh toán thành công
        const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        tones.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.09;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });
      }
    } catch (e) {
      // Bỏ qua nếu trình duyệt chặn autoplay audio
    }
  }

  // ===================== TOAST THÔNG BÁO =====================
  function showToast(message, type = 'success') {
    let container = document.getElementById('pcxToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pcxToastContainer';
      container.className = 'pcx-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pcx-toast pcx-toast-${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'info') icon = 'fa-circle-info';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <div class="pcx-toast-content">${message}</div>
      <button class="pcx-toast-close">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.pcx-toast-close').addEventListener('click', () => {
      toast.remove();
    });

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ===================== HIỆU ỨNG PHÁO HOA CONFETTI =====================
  function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'pcxConfettiCanvas';
    canvas.className = 'pcx-confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#00ff88', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: Math.random() * 9 + 5,
        h: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        alpha: 1
      });
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rot += p.rotSpeed;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 180) {
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }
    render();
  }

  // ===================== LOGIC THÊM SẢN PHẨM =====================
  function bindProductButtons() {
    document.addEventListener('click', (e) => {
      const quickAddBtn = e.target.closest('.btn-quick-add');
      if (!quickAddBtn) return;

      e.preventDefault();
      e.stopPropagation();

      const card = quickAddBtn.closest('.product-card');
      const id = quickAddBtn.dataset.id || ('prod-' + Math.random().toString(36).substr(2, 6));
      const name = quickAddBtn.dataset.name || card?.querySelector('.product-name')?.textContent?.trim() || 'Sản phẩm Gaming Gear';
      const price = Number(quickAddBtn.dataset.price) || 0;
      const imgEl = card?.querySelector('.product-image img');
      const image = imgEl ? imgEl.getAttribute('src') : 'img/hero/Lamzu_Thorn_v2_2800px.webp';

      addToCart({ id, name, price, image });
    });
  }

  function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    saveCart();
    playAudioTone('add');
    showToast(`Đã thêm <b>${escapeHtml(product.name)}</b> vào giỏ hàng!`, 'success');

    // Mở nhanh giỏ hàng để tạo trải nghiệm trực quan
    openModal('pcxCartModal');
    renderCart();
  }

  function updateCartBadge() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
      badge.classList.remove('bounce');
      void badge.offsetWidth; // Trigger reflow
      badge.classList.add('bounce');
    }
  }

  function bindHeaderIcons() {
    const cartBtn = document.getElementById('cartIconBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('pcxCartModal');
        renderCart();
      });
    }

    // Nut userAccountBtn da duoc go bo khoi History modal de phuc vu he thong Dang nhap / Dang ky
  }

  // ===================== TÍNH TOÁN TIỀN ĐƠN HÀNG =====================
  function calculateBill() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let shipping = subtotal > 1000000 || subtotal === 0 ? 0 : 30000;
    let discount = 0;

    if (appliedVoucher && subtotal > 0) {
      if (appliedVoucher.type === 'percent') {
        discount = Math.round((subtotal * appliedVoucher.value) / 100);
      } else if (appliedVoucher.type === 'fixed') {
        discount = appliedVoucher.value;
      } else if (appliedVoucher.type === 'ship') {
        shipping = 0;
      }
    }

    // Đảm bảo không âm
    const total = Math.max(0, subtotal - discount + shipping);

    return { subtotal, shipping, discount, total };
  }

  // ===================== RENDER GIỎ HÀNG =====================
  function renderCart() {
    const listContainer = document.getElementById('pcxCartItemsList');
    const emptyState = document.getElementById('pcxCartEmpty');
    const footer = document.getElementById('pcxCartFooter');
    if (!listContainer) return;

    if (cart.length === 0) {
      listContainer.innerHTML = '';
      emptyState.style.display = 'block';
      footer.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    footer.style.display = 'block';

    let html = '';
    cart.forEach(item => {
      const itemTotal = (item.price * item.quantity).toLocaleString('vi-VN');
      html += `
        <div class="pcx-cart-item" data-id="${item.id}">
          <div class="pcx-item-thumb">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" onerror="this.src='img/hero/Lamzu_Thorn_v2_2800px.webp'">
          </div>
          <div class="pcx-item-details">
            <h4 class="pcx-item-name">${escapeHtml(item.name)}</h4>
            <div class="pcx-item-price">${item.price.toLocaleString('vi-VN')}₫</div>
            <div class="pcx-item-actions">
              <div class="pcx-qty-box">
                <button type="button" class="pcx-qty-btn pcx-qty-dec" data-id="${item.id}">-</button>
                <input type="text" class="pcx-qty-val" value="${item.quantity}" readonly>
                <button type="button" class="pcx-qty-btn pcx-qty-inc" data-id="${item.id}">+</button>
              </div>
              <div class="pcx-item-subtotal">${itemTotal}₫</div>
              <button type="button" class="pcx-item-remove" data-id="${item.id}" title="Xoá món này">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;

    // Cập nhật tổng tiền
    const { subtotal, shipping, discount, total } = calculateBill();
    document.getElementById('pcxCartSubtotal').textContent = `${subtotal.toLocaleString('vi-VN')}₫`;
    document.getElementById('pcxCartShipping').textContent = shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}₫`;
    
    const discountRow = document.getElementById('pcxCartDiscountRow');
    if (discount > 0 || (appliedVoucher && appliedVoucher.type === 'ship')) {
      discountRow.style.display = 'flex';
      document.getElementById('pcxCartDiscount').textContent = `-${discount.toLocaleString('vi-VN')}₫`;
    } else {
      discountRow.style.display = 'none';
    }

    document.getElementById('pcxCartTotal').textContent = `${total.toLocaleString('vi-VN')}₫`;

    // Gắn sự kiện tăng/giảm/xoá
    listContainer.querySelectorAll('.pcx-qty-inc').forEach(btn => {
      btn.onclick = () => changeItemQty(btn.dataset.id, 1);
    });
    listContainer.querySelectorAll('.pcx-qty-dec').forEach(btn => {
      btn.onclick = () => changeItemQty(btn.dataset.id, -1);
    });
    listContainer.querySelectorAll('.pcx-item-remove').forEach(btn => {
      btn.onclick = () => removeCartItem(btn.dataset.id);
    });
  }

  function changeItemQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeCartItem(id);
      return;
    }

    saveCart();
    renderCart();
  }

  function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    showToast('Đã xoá sản phẩm khỏi giỏ hàng', 'info');
  }

  // ===================== ÁP DỤNG VOUCHER =====================
  function applyVoucherCode(code) {
    code = code.trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá', 'warning');
      return;
    }

    const voucher = MOCK_VOUCHERS[code];
    if (!voucher) {
      showToast(`Mã <b>${code}</b> không tồn tại. Thử: <b>GEAR5</b>, <b>FREESHIP</b>, <b>DOAN2</b>`, 'error');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (voucher.minOrder && subtotal < voucher.minOrder) {
      showToast(`Mã áp dụng cho đơn từ ${voucher.minOrder.toLocaleString('vi-VN')}₫ trở lên`, 'warning');
      return;
    }

    appliedVoucher = { ...voucher, code };
    renderCart();
    showToast(`Áp dụng mã <b>${code}</b> thành công: ${voucher.label}!`, 'success');

    const badgeEl = document.getElementById('pcxAppliedVoucherTag');
    if (badgeEl) {
      badgeEl.style.display = 'inline-flex';
      badgeEl.innerHTML = `Mã: ${code} (-${appliedVoucher.label}) <span class="pcx-remove-voucher">&times;</span>`;
      badgeEl.querySelector('.pcx-remove-voucher').onclick = () => {
        appliedVoucher = null;
        badgeEl.style.display = 'none';
        renderCart();
        showToast('Đã huỷ mã giảm giá', 'info');
      };
    }
  }

  // ===================== MODAL THANH TOÁN (CHECKOUT) =====================
  function openCheckout() {
    if (cart.length === 0) {
      showToast('Giỏ hàng trống! Hãy chọn sản phẩm trước.', 'warning');
      return;
    }

    closeModal('pcxCartModal');
    openModal('pcxCheckoutModal');
    renderCheckoutSummary();
    setupPaymentMethods();

    // Tự động điền thông tin nếu khách hàng đã đăng nhập
    try {
      const currentUser = window.PCX_AUTH?.getCurrentUser ? window.PCX_AUTH.getCurrentUser() : null;
      if (currentUser) {
        const nameInput = document.getElementById('pcxInputName');
        const emailInput = document.getElementById('pcxInputEmail');
        const phoneInput = document.getElementById('pcxInputPhone');
        if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
        if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
        if (phoneInput && !phoneInput.value && currentUser.phone) phoneInput.value = currentUser.phone || '';
      }
    } catch (e) {}
  }

  function renderCheckoutSummary() {
    const list = document.getElementById('pcxCheckoutMiniList');
    if (!list) return;

    let html = '';
    cart.forEach(item => {
      html += `
        <div class="pcx-checkout-mini-item">
          <div class="pcx-mini-thumb">
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <span class="pcx-mini-qty">${item.quantity}</span>
          </div>
          <div class="pcx-mini-info">
            <span class="pcx-mini-name">${escapeHtml(item.name)}</span>
            <span class="pcx-mini-price">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;

    const { subtotal, shipping, discount, total } = calculateBill();
    document.getElementById('pcxCheckoutSubtotal').textContent = `${subtotal.toLocaleString('vi-VN')}₫`;
    document.getElementById('pcxCheckoutShipping').textContent = shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}₫`;
    document.getElementById('pcxCheckoutTotal').textContent = `${total.toLocaleString('vi-VN')}₫`;

    const discountRow = document.getElementById('pcxCheckoutDiscountRow');
    if (discount > 0 || (appliedVoucher && appliedVoucher.type === 'ship')) {
      discountRow.style.display = 'flex';
      document.getElementById('pcxCheckoutDiscount').textContent = `-${discount.toLocaleString('vi-VN')}₫`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  // Thiết lập các phương thức thanh toán giả lập
  function setupPaymentMethods() {
    const methods = document.querySelectorAll('input[name="pcxPaymentMethod"]');
    const qrBox = document.getElementById('pcxQrPaymentBox');
    const cardBox = document.getElementById('pcxCardPaymentBox');
    const codBox = document.getElementById('pcxCodPaymentBox');

    function updateView(method) {
      qrBox.style.display = method === 'qr' ? 'block' : 'none';
      cardBox.style.display = method === 'card' ? 'block' : 'none';
      codBox.style.display = method === 'cod' ? 'block' : 'none';

      if (method === 'qr') {
        startQrSimulation();
      } else {
        stopQrSimulation();
      }
    }

    methods.forEach(radio => {
      radio.onchange = () => updateView(radio.value);
    });

    const checked = document.querySelector('input[name="pcxPaymentMethod"]:checked');
    updateView(checked ? checked.value : 'cod');
  }

  // ===================== GIẢ LẬP THANH TOÁN QR =====================
  function startQrSimulation() {
    stopQrSimulation();
    qrRemainingSeconds = 300;

    const { total } = calculateBill();
    const tempOrderId = 'PCX' + Math.floor(100000 + Math.random() * 900000);
    
    // Tạo link ảnh VietQR thật hoặc QR Code Server
    const qrImg = document.getElementById('pcxDynamicQrImage');
    if (qrImg) {
      // Dùng API VietQR trực quan
      qrImg.src = `https://img.vietqr.io/image/970436-1029384756-compact2.png?amount=${total}&addInfo=${tempOrderId}&accountName=CONG%20TY%20PHONG%20CACH%20XANH`;
    }

    document.getElementById('pcxQrAmount').textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
    document.getElementById('pcxQrTransferCode').textContent = tempOrderId;

    const countdownEl = document.getElementById('pcxQrCountdown');
    function updateTimer() {
      const mins = Math.floor(qrRemainingSeconds / 60);
      const secs = qrRemainingSeconds % 60;
      if (countdownEl) {
        countdownEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      if (qrRemainingSeconds <= 0) {
        stopQrSimulation();
        showToast('Mã QR đã hết hạn, vui lòng tạo lại!', 'warning');
      } else {
        qrRemainingSeconds--;
      }
    }

    updateTimer();
    qrInterval = setInterval(updateTimer, 1000);
  }

  function stopQrSimulation() {
    if (qrInterval) {
      clearInterval(qrInterval);
      qrInterval = null;
    }
  }

  // ===================== XỬ LÝ ĐẶT HÀNG =====================
  function handlePlaceOrder() {
    const name = document.getElementById('pcxInputName').value.trim();
    const phone = document.getElementById('pcxInputPhone').value.trim();
    const address = document.getElementById('pcxInputAddress').value.trim();
    const email = document.getElementById('pcxInputEmail').value.trim();
    const note = document.getElementById('pcxInputNote').value.trim();

    if (!name || !phone || !address) {
      showToast('Vui lòng điền Họ tên, Số điện thoại và Địa chỉ nhận hàng!', 'error');
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      showToast('Số điện thoại không hợp lệ, vui lòng kiểm tra lại!', 'warning');
      return;
    }

    const paymentMethod = document.querySelector('input[name="pcxPaymentMethod"]:checked')?.value || 'cod';

    // Nút loading khi xử lý đơn hàng
    const submitBtn = document.getElementById('pcxBtnSubmitOrder');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý đơn hàng...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      const { subtotal, shipping, discount, total } = calculateBill();
      const orderId = '#PCX-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      const orderDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const paymentNames = {
        'cod': 'Thanh toán tiền mặt khi nhận hàng (COD)',
        'qr': 'Chuyển khoản QR ngân hàng (Đã xác nhận)',
        'card': 'Thẻ ATM / Visa Online (Đã thanh toán)'
      };

      const newOrder = {
        id: orderId,
        date: orderDate,
        customer: { name, phone, email, address, note },
        items: [...cart],
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod: paymentNames[paymentMethod] || 'COD',
        status: 'Đã xác nhận'
      };

      saveOrder(newOrder);

      // Dọn giỏ hàng
      cart = [];
      appliedVoucher = null;
      saveCart();
      stopQrSimulation();

      // Đóng checkout & mở Modal Thành công
      closeModal('pcxCheckoutModal');
      openModal('pcxSuccessModal');
      renderSuccessInvoice(newOrder);
      playAudioTone('success');
      triggerConfetti();
    }, 1200);
  }

  // ===================== RENDER HOÁ ĐƠN THÀNH CÔNG =====================
  function renderSuccessInvoice(order) {
    document.getElementById('pcxSuccessOrderId').textContent = order.id;
    document.getElementById('pcxSuccessCustomer').textContent = `${order.customer.name} - ${order.customer.phone}`;
    document.getElementById('pcxSuccessAddress').textContent = order.customer.address;
    document.getElementById('pcxSuccessPayment').textContent = order.paymentMethod;
    document.getElementById('pcxSuccessDate').textContent = order.date;
    document.getElementById('pcxSuccessTotal').textContent = `${order.total.toLocaleString('vi-VN')}₫`;

    const itemsBox = document.getElementById('pcxSuccessItems');
    if (itemsBox) {
      let html = '';
      order.items.forEach(item => {
        html += `
          <div class="pcx-invoice-row">
            <span class="pcx-inv-col-name">${escapeHtml(item.name)} <small>x${item.quantity}</small></span>
            <span class="pcx-inv-col-price">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
          </div>
        `;
      });
      itemsBox.innerHTML = html;
    }
  }

  // ===================== RENDER LỊCH SỬ ĐƠN HÀNG =====================
  function renderOrderHistory() {
    const list = document.getElementById('pcxOrderHistoryList');
    const empty = document.getElementById('pcxHistoryEmpty');
    const orders = loadOrders();

    if (!list) return;

    if (orders.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    let html = '';

    orders.forEach(ord => {
      const itemsDetail = ord.items.map(it => `• ${escapeHtml(it.name)} (${it.quantity}x)`).join('<br>');
      html += `
        <div class="pcx-history-card">
          <div class="pcx-hist-head">
            <span class="pcx-hist-id">${ord.id}</span>
            <span class="pcx-hist-status pcx-status-confirmed">${ord.status}</span>
          </div>
          <div class="pcx-hist-time"><i class="fa-regular fa-clock"></i> ${ord.date}</div>
          <div class="pcx-hist-items">${itemsDetail}</div>
          <div class="pcx-hist-foot">
            <span class="pcx-hist-method"><i class="fa-solid fa-credit-card"></i> ${ord.paymentMethod}</span>
            <span class="pcx-hist-total">${ord.total.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  // ===================== TIỆN ÍCH MODAL =====================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      const anyActive = document.querySelector('.pcx-modal.active');
      if (!anyActive) {
        document.body.style.overflow = '';
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // ===================== TẠO GIAO DIỆN MODAL HTML =====================
  function injectCartAndCheckoutModals() {
    // Tránh inject trùng
    if (document.getElementById('pcxCartModal')) return;

    const modalHTML = `
      <!-- 1. MODAL GIỎ HÀNG (DRAWER) -->
      <div class="pcx-modal pcx-drawer" id="pcxCartModal">
        <div class="pcx-modal-backdrop" data-close="pcxCartModal"></div>
        <div class="pcx-drawer-content">
          <div class="pcx-drawer-header">
            <h3><i class="fa-solid fa-bag-shopping"></i> Giỏ Hàng Của Bạn</h3>
            <button class="pcx-btn-close" data-close="pcxCartModal">&times;</button>
          </div>

          <div class="pcx-drawer-body">
            <!-- Trạng thái trống -->
            <div class="pcx-empty-state" id="pcxCartEmpty" style="display: none;">
              <i class="fa-solid fa-cart-shopping"></i>
              <p>Giỏ hàng đang trống!</p>
              <button class="pcx-btn-accent" data-close="pcxCartModal">Tiếp tục dạo Shop</button>
            </div>

            <!-- Danh sách sản phẩm -->
            <div class="pcx-cart-items-list" id="pcxCartItemsList"></div>

            <!-- Voucher Box -->
            <div class="pcx-voucher-box">
              <div class="pcx-voucher-input-group">
                <input type="text" id="pcxVoucherInput" placeholder="Nhập mã voucher (vd: GEAR5, FREESHIP)...">
                <button type="button" id="pcxBtnApplyVoucher">Áp dụng</button>
              </div>
              <div class="pcx-applied-voucher-tag" id="pcxAppliedVoucherTag" style="display: none;"></div>
              <div class="pcx-voucher-suggestions">
                <span>Gợi ý: </span>
                <button type="button" class="pcx-chip" data-v="GEAR5">GEAR5</button>
                <button type="button" class="pcx-chip" data-v="FREESHIP">FREESHIP</button>
                <button type="button" class="pcx-chip" data-v="PRO15">PRO15</button>
              </div>
            </div>
          </div>

          <div class="pcx-drawer-footer" id="pcxCartFooter">
            <div class="pcx-summary-row">
              <span>Tạm tính:</span>
              <strong id="pcxCartSubtotal">0₫</strong>
            </div>
            <div class="pcx-summary-row" id="pcxCartDiscountRow" style="display: none;">
              <span>Giảm giá:</span>
              <strong class="text-green" id="pcxCartDiscount">-0₫</strong>
            </div>
            <div class="pcx-summary-row">
              <span>Phí vận chuyển:</span>
              <strong id="pcxCartShipping">0₫</strong>
            </div>
            <div class="pcx-summary-total">
              <span>Tổng thanh toán:</span>
              <strong class="text-danger" id="pcxCartTotal">0₫</strong>
            </div>
            <button type="button" class="pcx-btn-checkout" id="pcxBtnProceedCheckout">
              <i class="fa-solid fa-shield-halved"></i> Tiến Hành Đặt Hàng
            </button>
          </div>
        </div>
      </div>

      <!-- 2. MODAL CHECKOUT & THANH TOÁN GIẢ LẬP -->
      <div class="pcx-modal" id="pcxCheckoutModal">
        <div class="pcx-modal-backdrop" data-close="pcxCheckoutModal"></div>
        <div class="pcx-modal-dialog pcx-dialog-wide">
          <div class="pcx-dialog-header">
            <h3><i class="fa-solid fa-credit-card"></i> Xác Nhận & Thanh Toán Đơn Hàng</h3>
            <button class="pcx-btn-close" data-close="pcxCheckoutModal">&times;</button>
          </div>

          <div class="pcx-dialog-body">
            <div class="pcx-checkout-grid">
              <!-- Cột trái: Thông tin nhận hàng -->
              <div class="pcx-checkout-col">
                <h4 class="pcx-col-title"><i class="fa-solid fa-location-dot"></i> Thông Tin Nhận Hàng</h4>
                <div class="pcx-form-group">
                  <label>Họ và tên người nhận <span class="req">*</span></label>
                  <input type="text" id="pcxInputName" placeholder="Ví dụ: Nguyễn Minh Vũ" required>
                </div>
                <div class="pcx-form-row">
                  <div class="pcx-form-group">
                    <label>Số điện thoại <span class="req">*</span></label>
                    <input type="tel" id="pcxInputPhone" placeholder="090xxxxxxx" required>
                  </div>
                  <div class="pcx-form-group">
                    <label>Email nhận hoá đơn</label>
                    <input type="email" id="pcxInputEmail" placeholder="gamer@gmail.com">
                  </div>
                </div>
                <div class="pcx-form-group">
                  <label>Địa chỉ nhận hàng chi tiết <span class="req">*</span></label>
                  <input type="text" id="pcxInputAddress" placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." required>
                </div>
                <div class="pcx-form-group">
                  <label>Ghi chú cho shipper</label>
                  <textarea id="pcxInputNote" rows="2" placeholder="Giao giờ hành chính, gọi trước khi giao..."></textarea>
                </div>
              </div>

              <!-- Cột phải: Phương thức thanh toán & Tóm tắt -->
              <div class="pcx-checkout-col">
                <h4 class="pcx-col-title"><i class="fa-solid fa-wallet"></i> Phương Thức Thanh Toán</h4>
                
                <div class="pcx-payment-methods">
                  <label class="pcx-payment-option">
                    <input type="radio" name="pcxPaymentMethod" value="cod" checked>
                    <div class="pcx-option-card">
                      <i class="fa-solid fa-truck-fast pcx-opt-icon"></i>
                      <div class="pcx-opt-info">
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <span>Kiểm tra hàng trước khi thanh toán tiền mặt</span>
                      </div>
                    </div>
                  </label>

                  <label class="pcx-payment-option">
                    <input type="radio" name="pcxPaymentMethod" value="qr">
                    <div class="pcx-option-card">
                      <i class="fa-solid fa-qrcode pcx-opt-icon"></i>
                      <div class="pcx-opt-info">
                        <strong>Chuyển khoản QR (VietQR / MoMo)</strong>
                        <span>Quét mã thanh toán tức thì - Tự động duyệt</span>
                      </div>
                    </div>
                  </label>

                  <label class="pcx-payment-option">
                    <input type="radio" name="pcxPaymentMethod" value="card">
                    <div class="pcx-option-card">
                      <i class="fa-regular fa-credit-card pcx-opt-icon"></i>
                      <div class="pcx-opt-info">
                        <strong>Thẻ ATM / Thẻ Quốc tế (Visa / Master)</strong>
                        <span>Cổng thanh toán trực tuyến bảo mật chuẩn 3D-Secure</span>
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Khu vực thanh toán QR -->
                <div class="pcx-mock-payment-box" id="pcxQrPaymentBox" style="display: none;">
                  <div class="pcx-qr-wrapper">
                    <img id="pcxDynamicQrImage" src="" alt="Mã VietQR thanh toán">
                    <div class="pcx-qr-details">
                      <p>Số tiền: <strong class="text-danger" id="pcxQrAmount">0₫</strong></p>
                      <p>Nội dung CK: <strong class="text-green" id="pcxQrTransferCode">PCX000000</strong></p>
                      <div class="pcx-qr-timer">
                        <i class="fa-regular fa-clock"></i> Hết hạn sau: <span id="pcxQrCountdown">05:00</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="pcx-btn-confirm-qr" id="pcxBtnConfirmQrPaid">
                    <i class="fa-solid fa-check"></i> Xác Nhận Đã Chuyển Khoản
                  </button>
                </div>

                <!-- Khu vực Thẻ -->
                <div class="pcx-mock-payment-box" id="pcxCardPaymentBox" style="display: none;">
                  <div class="pcx-card-test-notice">
                    <span><i class="fa-solid fa-lock"></i> Thông tin thanh toán được mã hoá an toàn 256-bit SSL</span>
                  </div>
                  <div class="pcx-form-group">
                    <label>Số thẻ</label>
                    <input type="text" id="pcxCardNumber" placeholder="4242 4242 4242 4242" maxlength="19">
                  </div>
                  <div class="pcx-form-row">
                    <div class="pcx-form-group">
                      <label>Hạn thẻ (MM/YY)</label>
                      <input type="text" id="pcxCardExpiry" placeholder="12/28" maxlength="5">
                    </div>
                    <div class="pcx-form-group">
                      <label>CVV / CVC</label>
                      <input type="password" id="pcxCardCvv" placeholder="***" maxlength="3">
                    </div>
                  </div>
                  <div class="pcx-form-group">
                    <label>Tên chủ thẻ</label>
                    <input type="text" id="pcxCardHolder" placeholder="NGUYEN MINH VU">
                  </div>
                </div>

                <!-- Khu vực COD -->
                <div class="pcx-mock-payment-box pcx-cod-box" id="pcxCodPaymentBox">
                  <i class="fa-solid fa-box-open"></i> Đơn hàng sẽ được đóng gói và giao đến bạn trong vòng 2-3 ngày làm việc. Bạn sẽ thanh toán khi nhận gear.
                </div>

                <!-- Tóm tắt đơn hàng bên phải -->
                <div class="pcx-checkout-summary">
                  <h5>Đơn hàng của bạn</h5>
                  <div class="pcx-checkout-mini-list" id="pcxCheckoutMiniList"></div>
                  <div class="pcx-summary-row">
                    <span>Tạm tính:</span>
                    <strong id="pcxCheckoutSubtotal">0₫</strong>
                  </div>
                  <div class="pcx-summary-row" id="pcxCheckoutDiscountRow" style="display: none;">
                    <span>Giảm giá:</span>
                    <strong class="text-green" id="pcxCheckoutDiscount">-0₫</strong>
                  </div>
                  <div class="pcx-summary-row">
                    <span>Phí vận chuyển:</span>
                    <strong id="pcxCheckoutShipping">0₫</strong>
                  </div>
                  <div class="pcx-summary-total">
                    <span>Tổng cộng:</span>
                    <strong class="text-danger" id="pcxCheckoutTotal">0₫</strong>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="pcx-dialog-footer">
            <button type="button" class="pcx-btn-back" id="pcxBtnBackToCart">
              <i class="fa-solid fa-arrow-left"></i> Quay lại giỏ hàng
            </button>
            <button type="button" class="pcx-btn-submit" id="pcxBtnSubmitOrder">
              <i class="fa-solid fa-check"></i> Xác Nhận Đặt Hàng
            </button>
          </div>
        </div>
      </div>

      <!-- 3. MODAL ĐẶT HÀNG THÀNH CÔNG (HOÁ ĐƠN) -->
      <div class="pcx-modal" id="pcxSuccessModal">
        <div class="pcx-modal-backdrop" data-close="pcxSuccessModal"></div>
        <div class="pcx-modal-dialog pcx-dialog-invoice">
          <div class="pcx-invoice-top">
            <div class="pcx-success-check-icon">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p class="pcx-success-sub">Cảm ơn bạn đã lựa chọn sắm gear tại Phong Cách Xanh</p>
          </div>

          <!-- Bản hoá đơn in ấn -->
          <div class="pcx-printable-invoice" id="pcxPrintableInvoice">
            <div class="pcx-inv-header">
              <div class="pcx-inv-brand">
                <h4>PHONG CÁCH XANH</h4>
                <p>Mã đơn hàng: <strong class="text-green" id="pcxSuccessOrderId">#PCX-000000</strong></p>
                <p>Thời gian: <span id="pcxSuccessDate"></span></p>
              </div>
              <div class="pcx-inv-badge-paid">ĐÃ TIẾP NHẬN</div>
            </div>

            <div class="pcx-inv-customer-info">
              <p><strong>Người nhận:</strong> <span id="pcxSuccessCustomer"></span></p>
              <p><strong>Địa chỉ:</strong> <span id="pcxSuccessAddress"></span></p>
              <p><strong>Thanh toán:</strong> <span id="pcxSuccessPayment"></span></p>
            </div>

            <div class="pcx-inv-items-table">
              <div class="pcx-inv-table-head">
                <span>Sản phẩm</span>
                <span>Thành tiền</span>
              </div>
              <div id="pcxSuccessItems"></div>
            </div>

            <div class="pcx-inv-total-row">
              <span>Tổng thanh toán:</span>
              <strong class="text-danger" id="pcxSuccessTotal">0₫</strong>
            </div>

            <div class="pcx-order-tracker">
              <div class="pcx-track-step active">
                <div class="pcx-step-dot"><i class="fa-solid fa-receipt"></i></div>
                <span>Đã đặt</span>
              </div>
              <div class="pcx-track-line active"></div>
              <div class="pcx-track-step active">
                <div class="pcx-step-dot"><i class="fa-solid fa-box"></i></div>
                <span>Đã duyệt</span>
              </div>
              <div class="pcx-track-line"></div>
              <div class="pcx-track-step">
                <div class="pcx-step-dot"><i class="fa-solid fa-motorcycle"></i></div>
                <span>Đang giao</span>
              </div>
              <div class="pcx-track-line"></div>
              <div class="pcx-track-step">
                <div class="pcx-step-dot"><i class="fa-solid fa-house-chimney"></i></div>
                <span>Hoàn tất</span>
              </div>
            </div>
          </div>

          <div class="pcx-invoice-actions">
            <button type="button" class="pcx-btn-print" id="pcxBtnPrintInvoice">
              <i class="fa-solid fa-print"></i> In Hoá Đơn
            </button>
            <button type="button" class="pcx-btn-history" id="pcxBtnViewHistoryFromSuccess">
              <i class="fa-solid fa-clock-rotate-left"></i> Xem Đơn Đã Đặt
            </button>
            <button type="button" class="pcx-btn-accent" data-close="pcxSuccessModal">
              Tiếp Tục Mua Sắm
            </button>
          </div>
        </div>
      </div>

      <!-- 4. MODAL LỊCH SỬ ĐƠN HÀNG -->
      <div class="pcx-modal" id="pcxHistoryModal">
        <div class="pcx-modal-backdrop" data-close="pcxHistoryModal"></div>
        <div class="pcx-modal-dialog pcx-dialog-history">
          <div class="pcx-dialog-header">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Lịch Sử Đơn Hàng Của Bạn</h3>
            <button class="pcx-btn-close" data-close="pcxHistoryModal">&times;</button>
          </div>
          <div class="pcx-dialog-body">
            <div class="pcx-history-user-card">
              <div class="pcx-user-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
              <div class="pcx-user-meta">
                <h4>Đơn Hàng Gần Đây</h4>
                <p>Danh sách các đơn hàng đã đặt trên trình duyệt này</p>
              </div>
              <button type="button" class="pcx-btn-clear-history" id="pcxBtnClearHistory" title="Xoá lịch sử đơn hàng đã lưu">
                <i class="fa-solid fa-trash-can"></i> Xoá Lịch Sử Đơn
              </button>
            </div>

            <div class="pcx-history-empty" id="pcxHistoryEmpty" style="display: none;">
              <i class="fa-regular fa-folder-open"></i>
              <p>Chưa có đơn hàng nào được ghi nhận trên trình duyệt này.</p>
            </div>

            <div class="pcx-order-history-list" id="pcxOrderHistoryList"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Gắn sự kiện cho các thành phần vừa inject
    setupModalEventListeners();
  }

  function setupModalEventListeners() {
    // Sự kiện đóng modal
    document.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => {
        const modalId = el.getAttribute('data-close');
        closeModal(modalId);
      });
    });

    // Nút Checkout từ Drawer giỏ hàng
    const checkoutBtn = document.getElementById('pcxBtnProceedCheckout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', openCheckout);
    }

    // Nút Áp dụng voucher
    const applyVoucherBtn = document.getElementById('pcxBtnApplyVoucher');
    if (applyVoucherBtn) {
      applyVoucherBtn.addEventListener('click', () => {
        const code = document.getElementById('pcxVoucherInput').value;
        applyVoucherCode(code);
      });
    }

    // Các thẻ gợi ý voucher nhanh
    document.querySelectorAll('.pcx-voucher-suggestions .pcx-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const v = chip.getAttribute('data-v');
        document.getElementById('pcxVoucherInput').value = v;
        applyVoucherCode(v);
      });
    });

    // Nút Xác nhận đã chuyển khoản QR
    const confirmQrPaidBtn = document.getElementById('pcxBtnConfirmQrPaid');
    if (confirmQrPaidBtn) {
      confirmQrPaidBtn.addEventListener('click', () => {
        showToast('Hệ thống đã nhận diện giao dịch chuyển khoản thành công!', 'success');
        handlePlaceOrder();
      });
    }

    // Nút Quay lại giỏ hàng từ Checkout
    const backBtn = document.getElementById('pcxBtnBackToCart');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        closeModal('pcxCheckoutModal');
        openModal('pcxCartModal');
      });
    }

    // Nút Xác nhận đặt hàng
    const submitBtn = document.getElementById('pcxBtnSubmitOrder');
    if (submitBtn) {
      submitBtn.addEventListener('click', handlePlaceOrder);
    }

    // In hoá đơn
    const printBtn = document.getElementById('pcxBtnPrintInvoice');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Xem lịch sử từ Modal thành công
    const viewHistBtn = document.getElementById('pcxBtnViewHistoryFromSuccess');
    if (viewHistBtn) {
      viewHistBtn.addEventListener('click', () => {
        closeModal('pcxSuccessModal');
        openModal('pcxHistoryModal');
        renderOrderHistory();
      });
    }

    // Xoá lịch sử đơn hàng
    const clearHistBtn = document.getElementById('pcxBtnClearHistory');
    if (clearHistBtn) {
      clearHistBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xoá toàn bộ lịch sử đơn hàng?')) {
          localStorage.removeItem(STORAGE_KEYS.ORDERS);
          renderOrderHistory();
          showToast('Đã xoá sạch lịch sử đơn hàng!', 'info');
        }
      });
    }

    // Bấm ESC để đóng modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.pcx-modal.active').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
      }
    });
  }

})();

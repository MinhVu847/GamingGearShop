/**
 * DANH MỤC CHUỘT GAMING - PHONG CÁCH XANH (WORLDGEAR)
 * File: js/mouse-category.js
 * Tính năng:
 * - Dữ liệu 18 sản phẩm chuột (3 trang x 6 sản phẩm/trang)
 * - Lọc đa điều kiện (Thương hiệu, Trọng lượng, Form, Kiểu cầm, Kết nối, Giá, Tìm kiếm)
 * - Sắp xếp (Nổi bật, Giá tăng/giảm, Nhẹ nhất, Mới nhất)
 * - Phân trang động + Đổi màu swatch + Drawer bộ lọc trên mobile
 */

(function () {
  'use strict';

  const ITEMS_PER_PAGE = 6;

  // ===================== DỮ LIỆU 18 SẢN PHẨM CHUỘT (3 TRANG) =====================
  const MOUSE_PRODUCTS = [
    // --- TRANG 1 ---
    {
      id: 'mouse-01',
      name: 'Scyrox V6 8K Wireless',
      brand: 'Scyrox',
      subtitle: 'Chuột gaming không dây siêu nhẹ',
      weight: 40,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wireless-8k',
      price: 1550000,
      oldPrice: null,
      rating: '5.0',
      isNew: true,
      badge: 'Mới',
      badgeType: 'new',
      specBadge: '40g · 8K',
      specs: ['PAW3950', 'Đối xứng', 'Kèm Dongle 8K'],
      status: 'Sẵn hàng',
      image: 'product/Mouse/scyrox v6/chu-t-khong-day-sieu-nh-scyrox-v6-di-kem-dongle-8k-42603647893749.webp',
      colors: [
        { label: 'Trắng', img: 'product/Mouse/scyrox v6/chu-t-khong-day-sieu-nh-scyrox-v6-di-kem-dongle-8k-42603647893749.webp' }
      ]
    },
    {
      id: 'mouse-02',
      name: 'Razer Viper V4 Pro',
      brand: 'Razer',
      subtitle: 'Chuột esports không dây đối xứng',
      weight: 54,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw', 'palm'],
      connection: 'wireless-8k',
      price: 3690000,
      oldPrice: 4100000,
      rating: '4.9',
      isNew: true,
      badge: '-10%',
      badgeType: 'sale',
      specBadge: '54g · 8K',
      specs: ['Focus Pro 35K', 'Đối xứng', '8000Hz'],
      status: 'Sẵn hàng',
      image: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087475.webp',
      colors: [
        { label: 'Đen', img: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087475.webp' },
        { label: 'Trắng', img: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087485.webp' }
      ]
    },
    {
      id: 'mouse-03',
      name: 'Pulsar X2H Jinggg Edition',
      brand: 'Pulsar',
      subtitle: 'Phiên bản giới hạn cho Claw Grip',
      weight: 47,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw'],
      connection: 'wireless-8k',
      price: 2790000,
      oldPrice: null,
      rating: '5.0',
      isNew: true,
      badge: 'PRO Series',
      badgeType: 'new',
      specBadge: '47g · 8K',
      specs: ['XS-1 Sensor', 'Lưng cao', '8K Ready'],
      status: 'Sẵn hàng',
      image: 'img/submenu/pulsar-jinggg-x-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-04',
      name: 'WLmouse Beast G Silver',
      brand: 'WLmouse',
      subtitle: 'Khung hợp kim Magie siêu nhẹ',
      weight: 39,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wireless-8k',
      price: 3250000,
      oldPrice: null,
      rating: '4.9',
      isNew: true,
      badge: null,
      badgeType: null,
      specBadge: '39g · Magie',
      specs: ['PAW3950 HS', 'Magnesium', '8K Wireless'],
      status: 'Sẵn hàng',
      image: 'img/submenu/Wlmouse-Beast-G-Silver-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-05',
      name: 'Pulsar Xlite V4 eS',
      brand: 'Pulsar',
      subtitle: 'Chuột công thái học màn hình OLED',
      weight: 52,
      weightGroup: 'light',
      form: 'ergo',
      grips: ['palm', 'claw'],
      connection: 'wireless-8k',
      price: 2590000,
      oldPrice: 2950000,
      rating: '4.8',
      isNew: false,
      badge: '-12%',
      badgeType: 'sale',
      specBadge: '52g · Ergo',
      specs: ['XS-1 Sensor', 'Công thái học', 'Driverless'],
      status: '• Sắp về thêm',
      image: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087485.webp',
      colors: []
    },
    {
      id: 'mouse-06',
      name: 'Lamzu Maya X 8K',
      brand: 'Lamzu',
      subtitle: 'Dáng đối xứng cân bằng đa kiểu cầm',
      weight: 47,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw', 'palm', 'fingertip'],
      connection: 'wireless-8k',
      price: 2490000,
      oldPrice: null,
      rating: '5.0',
      isNew: false,
      badge: null,
      badgeType: null,
      specBadge: '47g · 8K',
      specs: ['PAW3950', 'Omron Optical', '8K Dongle'],
      status: 'Sẵn hàng',
      image: 'product/Mouse/scyrox v6/chu-t-khong-day-sieu-nh-scyrox-v6-di-kem-dongle-8k-42603647893749.webp',
      colors: []
    },

    // --- TRANG 2 ---
    {
      id: 'mouse-07',
      name: 'Lamzu Thorn V2 Wireless',
      brand: 'Lamzu',
      subtitle: 'Chuột công thái học siêu nhẹ 4K/8K',
      weight: 52,
      weightGroup: 'light',
      form: 'ergo',
      grips: ['palm', 'claw'],
      connection: 'wireless-8k',
      price: 2390000,
      oldPrice: null,
      rating: '4.9',
      isNew: true,
      badge: 'Mới',
      badgeType: 'new',
      specBadge: '52g · Ergo',
      specs: ['PAW3950', 'Công thái học', 'Pin 80h'],
      status: 'Sẵn hàng',
      image: 'img/hero/Lamzu_Thorn_v2_2800px.webp',
      colors: []
    },
    {
      id: 'mouse-08',
      name: 'RAWM Leviathan V4 GT',
      brand: 'RAWM',
      subtitle: 'Chuột gaming đối xứng giá tốt 8KHz',
      weight: 44,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wireless-8k',
      price: 1390000,
      oldPrice: 1590000,
      rating: '4.8',
      isNew: true,
      badge: '-13%',
      badgeType: 'sale',
      specBadge: '44g · 8K',
      specs: ['PAW3950', 'Hot-swap Switch', '8K Wireless'],
      status: 'Sẵn hàng',
      image: 'img/hero/RAWM-Lev-v4-gt-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-09',
      name: 'Pulsar x Yuki Aim X2H',
      brand: 'Pulsar',
      subtitle: 'Phiên bản collab Yuki Aim độc quyền',
      weight: 49,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw'],
      connection: 'wireless-4k',
      price: 3150000,
      oldPrice: null,
      rating: '5.0',
      isNew: true,
      badge: 'Limited',
      badgeType: 'new',
      specBadge: '49g · 4K',
      specs: ['PAW3395', 'Superglide', '4K Dongle'],
      status: 'Sẵn hàng',
      image: 'img/hero/yuki-aim-pulsar-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-10',
      name: 'WLmouse Beast X Max 8K',
      brand: 'WLmouse',
      subtitle: 'Form lớn khung Magie cho tay trung - to',
      weight: 42,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['palm', 'claw'],
      connection: 'wireless-8k',
      price: 3490000,
      oldPrice: null,
      rating: '4.9',
      isNew: false,
      badge: null,
      badgeType: null,
      specBadge: '42g · Magie',
      specs: ['PAW3950 HS', 'Size L', '8K Dongle'],
      status: 'Sẵn hàng',
      image: 'img/Banner/Wlmouse-ma-gic-1200px.webp',
      colors: []
    },
    {
      id: 'mouse-11',
      name: 'Scyrox V8 8K Wireless',
      brand: 'Scyrox',
      subtitle: 'Lưng gù cao tối ưu Claw Grip siêu nhẹ',
      weight: 38,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wireless-8k',
      price: 1490000,
      oldPrice: null,
      rating: '5.0',
      isNew: false,
      badge: 'Best Value',
      badgeType: 'new',
      specBadge: '38g · 8K',
      specs: ['PAW3950', 'Omron Optical', '38g Siêu nhẹ'],
      status: 'Sẵn hàng',
      image: 'product/Mouse/scyrox v6/chu-t-khong-day-sieu-nh-scyrox-v6-di-kem-dongle-8k-42603647893749.webp',
      colors: []
    },
    {
      id: 'mouse-12',
      name: 'Razer DeathAdder V3 Pro',
      brand: 'Razer',
      subtitle: 'Chuột công thái học chuẩn thi đấu FPS',
      weight: 63,
      weightGroup: 'standard',
      form: 'ergo',
      grips: ['palm', 'claw'],
      connection: 'wireless-4k',
      price: 2890000,
      oldPrice: 3490000,
      rating: '4.9',
      isNew: false,
      badge: '-17%',
      badgeType: 'sale',
      specBadge: '63g · Ergo',
      specs: ['Focus Pro 30K', 'Công thái học', 'Pin 90h'],
      status: 'Sẵn hàng',
      image: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087475.webp',
      colors: [
        { label: 'Đen', img: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087475.webp' },
        { label: 'Trắng', img: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087485.webp' }
      ]
    },

    // --- TRANG 3 ---
    {
      id: 'mouse-13',
      name: 'Pulsar X2 CrazyLight',
      brand: 'Pulsar',
      subtitle: 'Phiên bản siêu nhẹ chỉ 35g không lỗ',
      weight: 35,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wireless-8k',
      price: 2990000,
      oldPrice: null,
      rating: '5.0',
      isNew: true,
      badge: 'Mới',
      badgeType: 'new',
      specBadge: '35g · 8K',
      specs: ['XS-1 Sensor', 'Vỏ kín 35g', '8K Dongle'],
      status: 'Sẵn hàng',
      image: 'img/submenu/pulsar-jinggg-x-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-14',
      name: 'WLmouse Beast X Mini',
      brand: 'WLmouse',
      subtitle: 'Chuột Magie size nhỏ cho Fingertip',
      weight: 34,
      weightGroup: 'ultra',
      form: 'sym',
      grips: ['fingertip', 'claw'],
      connection: 'wireless-4k',
      price: 3190000,
      oldPrice: null,
      rating: '4.9',
      isNew: false,
      badge: null,
      badgeType: null,
      specBadge: '34g · Mini',
      specs: ['PAW3395', 'Size S', '4K Wireless'],
      status: 'Sẵn hàng',
      image: 'img/submenu/Wlmouse-Beast-G-Silver-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-15',
      name: 'Razer DeathAdder V3 Wired',
      brand: 'Razer',
      subtitle: 'Chuột có dây 8KHz độ trễ gần như 0ms',
      weight: 59,
      weightGroup: 'light',
      form: 'ergo',
      grips: ['palm', 'claw'],
      connection: 'wired',
      price: 1290000,
      oldPrice: 1490000,
      rating: '4.8',
      isNew: false,
      badge: '-13%',
      badgeType: 'sale',
      specBadge: '59g · Có dây 8K',
      specs: ['Focus Pro 30K', 'Dây Speedflex', '8000Hz Native'],
      status: 'Sẵn hàng',
      image: 'product/Mouse/Razer/v4 pro/razer-viper-v4-pro-chu-t-khong-day-d-i-x-ng-8khz-1229087475.webp',
      colors: []
    },
    {
      id: 'mouse-16',
      name: 'Lamzu Atlantis Mini 4K',
      brand: 'Lamzu',
      subtitle: 'Chuột Claw Grip nhỏ gọn kèm dongle 4K',
      weight: 49,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wireless-4k',
      price: 2150000,
      oldPrice: 2390000,
      rating: '4.9',
      isNew: false,
      badge: '-10%',
      badgeType: 'sale',
      specBadge: '49g · 4K',
      specs: ['PAW3395', 'Huano Blue', '4K Wireless'],
      status: 'Sẵn hàng',
      image: 'img/hero/Lamzu_Thorn_v2_2800px.webp',
      colors: []
    },
    {
      id: 'mouse-17',
      name: 'RAWM SA-SH01 Pro',
      brand: 'RAWM',
      subtitle: 'Thiết kế đối xứng kèm switch thay nóng',
      weight: 55,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw', 'palm'],
      connection: 'wireless-4k',
      price: 1190000,
      oldPrice: null,
      rating: '4.7',
      isNew: false,
      badge: null,
      badgeType: null,
      specBadge: '55g · Hot-swap',
      specs: ['PAW3395', 'Hot-swap', '4K Wireless'],
      status: 'Sẵn hàng',
      image: 'img/hero/RAWM-Lev-v4-gt-2800px.webp',
      colors: []
    },
    {
      id: 'mouse-18',
      name: 'Pulsar X2V2 Wired',
      brand: 'Pulsar',
      subtitle: 'Bản có dây ổn định, tối ưu chi phí',
      weight: 53,
      weightGroup: 'light',
      form: 'sym',
      grips: ['claw', 'fingertip'],
      connection: 'wired',
      price: 1350000,
      oldPrice: null,
      rating: '4.8',
      isNew: false,
      badge: null,
      badgeType: null,
      specBadge: '53g · Có dây',
      specs: ['PAW3395', 'Optical Switch', 'Dây Paracord'],
      status: 'Sẵn hàng',
      image: 'img/hero/yuki-aim-pulsar-2800px.webp',
      colors: []
    }
  ];

  // ===================== TRẠNG THÁI BỘ LỌC & PHÂN TRANG =====================
  const state = {
    brands: [],
    weights: [],
    forms: [],
    grips: [],
    connections: [],
    priceRange: '',
    search: '',
    sort: 'featured',
    currentPage: 1
  };

  // ===================== DOM ELEMENTS =====================
  let gridEl, resultCountEl, chipsEl, paginationEl, sortSelectEl, resetBtnEl, sidebarEl;

  document.addEventListener('DOMContentLoaded', () => {
    gridEl = document.querySelector('.catalog-grid');
    resultCountEl = document.querySelector('.result-count');
    chipsEl = document.querySelector('.active-filter-chips');
    paginationEl = document.querySelector('.catalog-pagination');
    sortSelectEl = document.querySelector('.sort-select');
    resetBtnEl = document.querySelector('.filter-reset-btn');
    sidebarEl = document.querySelector('.filter-sidebar');

    if (!gridEl) return;

    bindFilterEvents();
    bindSortAndPagination();
    bindSearchInput();
    bindMobileFilterDrawer();
    bindSwatchClicks();
    render();
  });

  // ===================== LỌC & SẮP XẾP =====================
  function getFilteredProducts() {
    let list = MOUSE_PRODUCTS.filter((p) => {
      if (state.brands.length && !state.brands.includes(p.brand)) return false;
      if (state.weights.length && !state.weights.includes(p.weightGroup)) return false;
      if (state.forms.length && !state.forms.includes(p.form)) return false;
      if (state.grips.length && !state.grips.some((g) => p.grips.includes(g))) return false;
      if (state.connections.length && !state.connections.includes(p.connection)) return false;

      if (state.priceRange === 'under-1.5m' && p.price >= 1500000) return false;
      if (state.priceRange === '1.5m-3m' && (p.price < 1500000 || p.price > 3000000)) return false;
      if (state.priceRange === 'over-3m' && p.price <= 3000000) return false;

      if (state.search) {
        const q = state.search.toLowerCase();
        const hay = `${p.name} ${p.brand} ${p.subtitle} ${p.specs.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    switch (state.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'weight-asc':
        list.sort((a, b) => a.weight - b.weight);
        break;
      case 'newest':
        list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      default:
        break;
    }

    return list;
  }

  // ===================== RENDER GIAO DIỆN =====================
  function render() {
    const filtered = getFilteredProducts();
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

    if (state.currentPage > totalPages) state.currentPage = 1;

    const startIdx = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    renderResultCount(total, startIdx, pageItems.length);
    renderFilterChips();
    renderProductGrid(pageItems);
    renderPagination(totalPages);
  }

  function renderResultCount(total, startIdx, count) {
    if (!resultCountEl) return;
    if (total === 0) {
      resultCountEl.textContent = 'Không tìm thấy sản phẩm nào';
      return;
    }
    const from = startIdx + 1;
    const to = startIdx + count;
    resultCountEl.textContent = `Hiển thị ${from}–${to} / ${total} sản phẩm`;
  }

  function renderProductGrid(items) {
    if (items.length === 0) {
      gridEl.innerHTML = `
        <div class="catalog-empty">
          <i class="fa-solid fa-computer-mouse"></i>
          <h4>Không có chuột nào khớp bộ lọc</h4>
          <p>Thử bỏ bớt điều kiện lọc hoặc nhấn đặt lại để xem tất cả sản phẩm.</p>
          <button type="button" class="btn-reset-empty" id="emptyResetBtn">Xem tất cả chuột</button>
        </div>
      `;
      const emptyBtn = document.getElementById('emptyResetBtn');
      if (emptyBtn) emptyBtn.addEventListener('click', resetAllFilters);
      return;
    }

    gridEl.innerHTML = items.map(createProductCardHTML).join('');
  }

  function createProductCardHTML(p) {
    let badgeHTML = '';
    if (p.badge) {
      const cls = p.badgeType === 'sale' ? 'badge-sale' : 'badge-new';
      badgeHTML = `<span class="${cls}">${p.badge}</span>`;
    }

    const oldPriceHTML = p.oldPrice
      ? `<span class="product-price-old">${formatPrice(p.oldPrice)}</span>`
      : '';

    const swatchesHTML = p.colors.length
      ? p.colors
          .map(
            (c, idx) => `
          <div class="color-thumb ${idx === 0 ? 'active' : ''}" title="${c.label}" data-img="${c.img}">
            <img src="${c.img}" alt="${c.label}">
          </div>`
          )
          .join('')
      : '';

    return `
      <div class="product-card" data-id="${p.id}">
        ${badgeHTML}
        <span class="badge-spec">${p.specBadge}</span>
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}">
          <button class="btn-quick-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">+ Chọn nhanh</button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-subtext">${p.subtitle}</p>
          <div class="mouse-specs-line">
            ${p.specs.map((s) => `<span class="spec-tag">${s}</span>`).join('')}
          </div>
          <div class="product-meta">
            <div class="price-group">
              <span class="product-price">${formatPrice(p.price)}</span>
              ${oldPriceHTML}
            </div>
            <div class="product-rating"><span>${p.rating}</span> <i class="fa-solid fa-star"></i></div>
          </div>
          <div class="product-status">
            ${swatchesHTML}
            <span class="status-tag">${p.status}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    if (totalPages <= 1) {
      paginationEl.innerHTML = `
        <button type="button" class="page-btn active" data-page="1">1</button>
      `;
      return;
    }

    let html = `
      <button type="button" class="page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Trang trước">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button type="button" class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>
      `;
    }

    html += `
      <button type="button" class="page-btn" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? 'disabled' : ''} aria-label="Trang sau">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;

    paginationEl.innerHTML = html;
  }

  function renderFilterChips() {
    if (!chipsEl) return;
    const chips = [];

    const labels = {
      ultra: 'Siêu nhẹ (<45g)',
      light: 'Nhẹ (45g–60g)',
      standard: 'Tiêu chuẩn (>60g)',
      sym: 'Đối xứng',
      ergo: 'Công thái học',
      claw: 'Claw Grip',
      palm: 'Palm Grip',
      fingertip: 'Fingertip Grip',
      'wireless-8k': 'Không dây 8K Hz',
      'wireless-4k': 'Không dây 1K/4K Hz',
      wired: 'Có dây',
      'under-1.5m': 'Dưới 1.5tr',
      '1.5m-3m': '1.5tr – 3tr',
      'over-3m': 'Trên 3tr'
    };

    state.brands.forEach((v) => chips.push({ group: 'brands', value: v, text: v }));
    state.weights.forEach((v) => chips.push({ group: 'weights', value: v, text: labels[v] || v }));
    state.forms.forEach((v) => chips.push({ group: 'forms', value: v, text: labels[v] || v }));
    state.grips.forEach((v) => chips.push({ group: 'grips', value: v, text: labels[v] || v }));
    state.connections.forEach((v) => chips.push({ group: 'connections', value: v, text: labels[v] || v }));
    if (state.priceRange) chips.push({ group: 'priceRange', value: state.priceRange, text: labels[state.priceRange] });
    if (state.search) chips.push({ group: 'search', value: state.search, text: `Tìm: "${state.search}"` });

    chipsEl.innerHTML = chips
      .map(
        (c) => `
      <span class="filter-chip">
        ${c.text}
        <button type="button" data-remove-group="${c.group}" data-remove-value="${c.value}" aria-label="Bỏ lọc">&times;</button>
      </span>
    `
      )
      .join('');
  }

  // ===================== SỰ KIỆN =====================
  function bindFilterEvents() {
    if (!sidebarEl) return;

    sidebarEl.addEventListener('change', () => {
      syncStateFromSidebar();
      state.currentPage = 1;
      render();
    });

    if (resetBtnEl) {
      resetBtnEl.addEventListener('click', resetAllFilters);
    }

    if (chipsEl) {
      chipsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-remove-group]');
        if (!btn) return;
        const group = btn.dataset.removeGroup;
        const val = btn.dataset.removeValue;

        if (group === 'priceRange') {
          state.priceRange = '';
          sidebarEl.querySelectorAll('input[name="price-range"]').forEach((r) => (r.checked = false));
        } else if (group === 'search') {
          state.search = '';
          const searchInput = document.querySelector('.search-box input');
          if (searchInput) searchInput.value = '';
        } else {
          state[group] = state[group].filter((item) => item !== val);
          const cb = sidebarEl.querySelector(`input[data-filter-group="${group}"][value="${val}"]`);
          if (cb) cb.checked = false;
        }

        state.currentPage = 1;
        render();
      });
    }
  }

  function syncStateFromSidebar() {
    const groups = ['brands', 'weights', 'forms', 'grips', 'connections'];
    groups.forEach((g) => {
      state[g] = Array.from(sidebarEl.querySelectorAll(`input[data-filter-group="${g}"]:checked`)).map((el) => el.value);
    });

    const priceRadio = sidebarEl.querySelector('input[name="price-range"]:checked');
    state.priceRange = priceRadio ? priceRadio.value : '';
  }

  function resetAllFilters() {
    if (sidebarEl) {
      sidebarEl.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((el) => (el.checked = false));
    }
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) searchInput.value = '';

    state.brands = [];
    state.weights = [];
    state.forms = [];
    state.grips = [];
    state.connections = [];
    state.priceRange = '';
    state.search = '';
    state.currentPage = 1;
    render();
  }

  function bindSortAndPagination() {
    if (sortSelectEl) {
      sortSelectEl.addEventListener('change', (e) => {
        state.sort = e.target.value;
        state.currentPage = 1;
        render();
      });
    }

    if (paginationEl) {
      paginationEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn[data-page]');
        if (!btn || btn.disabled) return;
        const page = Number(btn.dataset.page);
        if (!page || page === state.currentPage) return;

        state.currentPage = page;
        render();

        const catalogSection = document.querySelector('.catalog-section');
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  function bindSearchInput() {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value.trim();
      state.currentPage = 1;
      render();
    });
  }

  function bindSwatchClicks() {
    gridEl.addEventListener('click', (e) => {
      const thumb = e.target.closest('.color-thumb');
      if (!thumb) return;
      const card = thumb.closest('.product-card');
      const mainImg = card?.querySelector('.product-image img');
      const newSrc = thumb.dataset.img;
      if (mainImg && newSrc) mainImg.src = newSrc;

      card.querySelectorAll('.color-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  }

  function bindMobileFilterDrawer() {
    const mobileBtn = document.querySelector('.mobile-filter-btn');
    if (!mobileBtn || !sidebarEl) return;

    mobileBtn.addEventListener('click', () => {
      sidebarEl.classList.toggle('is-open');
    });
  }

  function formatPrice(num) {
    return num.toLocaleString('vi-VN') + 'đ';
  }
})();

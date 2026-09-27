document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = playPauseBtn.querySelector('i');

  let currentIndex = 0;
  let isPlaying = true;
  let slideInterval;
  const INTERVAL_TIME = 4000; // Tự động chuyển slide sau mỗi 4 giây (4000ms)

  // Hàm hiển thị Slide theo Index
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentIndex = index;
  }

  // Chuyển sang slide tiếp theo
  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  // Khởi chạy đếm giờ tự động
  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, INTERVAL_TIME);
    isPlaying = true;
    playPauseIcon.className = 'fa-solid fa-pause';
  }

  // Dừng đếm giờ
  function pauseAutoSlide() {
    clearInterval(slideInterval);
    isPlaying = false;
    playPauseIcon.className = 'fa-solid fa-play';
  }

  // Sự kiện khi click vào các nút số (1, 2, 3, 4, 5)
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      showSlide(index);
      
      // Nếu đang chạy thì reset lại timer để đủ 4 giây cho slide mới
      if (isPlaying) {
        clearInterval(slideInterval);
        startAutoSlide();
      }
    });
  });

  // Sự kiện khi click vào nút Bắt đầu / Tạm dừng (Play / Pause)
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseAutoSlide();
    } else {
      startAutoSlide();
    }
  });

  // Bắt đầu chạy slide ngay khi tải trang
  startAutoSlide();
});
document.addEventListener("DOMContentLoaded", function () {
  const content = document.querySelector(".content");
  const contentArea = document.getElementById("content-area");  // Chắc chắn đây là phần tử cập nhật nội dung

  // Gắn sự kiện click cho từng icon
  document.querySelectorAll(".icon-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("title");
      contentArea.innerHTML = pages[title] || "<h1>Trang không tồn tại</h1>";  // Đảm bảo cập nhật đúng phần tử
    });
  });
});

function loadContent(page) {
  fetch(page)
    .then(response => response.text())
    .then(data => {
      document.getElementById('content-area').innerHTML = data;  // Cập nhật lại nội dung
    })
    .catch(error => console.error('Lỗi khi tải nội dung:', error));
}



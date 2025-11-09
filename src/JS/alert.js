export function showalert(message, type = "info") {
  const container = document.getElementById("alert-normal");
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.innerText = message;

  container.appendChild(alert);

  // Hiệu ứng xuất hiện
  setTimeout(() => alert.classList.add("show"), 100);

  // Xác định thời gian hiển thị dựa trên loại alert
  const displayTime = type === "info" ? 4000 : 3000;

  // Tự biến mất sau thời gian tương ứng
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 500);
  }, displayTime); 
}
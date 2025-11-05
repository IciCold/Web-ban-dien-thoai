
export function showalert(message, type = "info") {
  const container = document.getElementById("alert-normal");
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.innerText = message;

  container.appendChild(alert);

  // Hiệu ứng xuất hiện
  setTimeout(() => alert.classList.add("show"), 100);

  // Tự biến mất sau 3 giây
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 500);
  }, 3000);
}
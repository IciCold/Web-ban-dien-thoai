import { showalert } from "./alert.js";
import { displayProducts } from "./Home.js";
import { checkLoginStatus } from "./login.js";
import { docdulieuLocalStorage } from "./readandwrite.js";

//Tải lại sản phẩm
export function renderData(){
    const products = docdulieuLocalStorage("dataProducts");
     // Lọc chỉ hiển thị sản phẩm không bị ẩn
    const visibleProducts = products.filter(product => !product.hidden);
    if(visibleProducts.length > 0) displayProducts(visibleProducts);
}
//Tải lại người dùng
export function renderUser() {
  const status = checkLoginStatus();
  if (!status) {
    showalert(
      "Tài khoản của bạn đã bị khoá, vui lòng liên hệ với Admin",
      "error"
    );
    setTimeout(() => {
      location.reload();
    }, 4000);
  }
}
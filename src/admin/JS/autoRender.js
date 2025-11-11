import { loadCustomerList } from "./ds_khachhang.js";

import { docdulieuLocalStorage } from "./readandwrite.js";

//Tải lại sản phẩm
export function renderData(){
    updateBang();
}
//Tải lại người dùng
export function renderUser() {
loadCustomerList();
}
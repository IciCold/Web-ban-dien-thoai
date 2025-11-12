import { loadCustomerList } from "./ds_khachhang.js";
import {updateTable} from "./ds_donhang.js";
import { docdulieuLocalStorage } from "./readandwrite.js";
import {updateBang} from "./ds_sanpham.js";
//Tải lại sản phẩm
export function renderData(){
    console.log("SẢN PHẨM CÓ SỰ THAY ĐỔI");
    updateBang();
}
//Tải lại người dùng
export function renderUser() {
loadCustomerList();
}

//Tải lại danh sách hoá đơn
export function renderOrder(){
 console.log("Đã cập nhật lại đơn hàng");
 const dsdonhang = docdulieuLocalStorage("orders") || [];
 if(dsdonhang) updateTable(dsdonhang);
}

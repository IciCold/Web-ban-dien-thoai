export function docdulieuLocalStorage(tenmang) {
  try {
    const saved = localStorage.getItem(tenmang);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
    return [];
  }
}

export function ghidulieuLocalStorage(tenmang, datamang) {
  try {
    localStorage.setItem(tenmang, JSON.stringify(datamang));
    console.log(`Dữ liệu '${tenmang}' đã được lưu.`);
  } catch (error) {
    console.error(`Lỗi khi ghi dữ liệu '${tenmang}':`, error);
  }
}
//ham doc và ghi dulieu localStorage su dung cho các file code khác

export async function docJSONvaLuuLocalStorage(tenmang, duongdanJSON) {
  try {
    // 1️⃣ Kiểm tra xem localStorage đã có dữ liệu chưa
    const saved = localStorage.getItem(tenmang);
    if (saved) {
      console.log(`✅ Mảng '${tenmang}' đã có dữ liệu, không cần đọc lại JSON.`);
      return JSON.parse(saved); // Dừng tại đây, trả về dữ liệu cũ
    }

    // 2️⃣ Nếu chưa có, đọc dữ liệu từ file JSON
    const response = await fetch(duongdanJSON);
    if (!response.ok) {
      throw new Error(`Không thể đọc file JSON: ${response.status}`);
    }

    const data = await response.json();

    // 3️⃣ Lưu dữ liệu vào localStorage
    localStorage.setItem(tenmang, JSON.stringify(data));
    console.log(`Dữ liệu '${tenmang}' đã được lưu vào localStorage.`);

    return data; // Trả về dữ liệu mới
  } catch (error) {
    console.error(`Lỗi khi đọc/lưu dữ liệu '${tenmang}':`, error);
    return [];
  }
}
//đây là hàm khởi tạo 
// Hàm định dạng ngày tin nhắn dạng "dài" (có thể hiển thị giờ nếu là hôm nay/hôm qua)
export const formatMessageDateLong = (date) => {
    const now = new Date(); // Lấy thời gian hiện tại
    const inputDate = new Date(date); // Chuyển input thành Date object

    if (isToday(inputDate)) { // Nếu là ngày hôm nay
        return inputDate.toLocaleTimeString([], { // chỉ hiển thị giờ và phút
            hour: "2-digit",
            minute: "2-digit"
        })
    } else if (isYesterday(inputDate)) { // Nếu là ngày hôm qua
        return (
            "Yesterday " +  // thêm chữ Yesterday
            inputDate.toLocaleTimeString([], { // hiển thị giờ và phút
                hour: "2-digit",
                minute: "2-digit"
            })
        )
    } else if (inputDate.getFullYear() === now.getFullYear()) { 
        // Nếu là cùng năm với năm hiện tại nhưng không phải hôm nay/hôm qua
        return inputDate.toLocaleDateString([], { // hiển thị ngày và tháng
            day: "2-digit",
            month: "short"
        })
    } else {
        // Nếu là năm khác năm hiện tại, hiển thị đầy đủ ngày/tháng/năm
        return inputDate.toLocaleDateString();
    }
}

// Hàm định dạng ngày tin nhắn dạng "ngắn" (chỉ hiển thị giờ hoặc ngày, bỏ giờ nếu hôm qua)
export const formatMessageDateShort = (date) => {
    const now = new Date();
    const inputDate = new Date(date);

    if (isToday(inputDate)) { // hôm nay → chỉ giờ và phút
        return inputDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    } else if (isYesterday(inputDate)) { // hôm qua → chỉ hiện chữ Yesterday
        return "Yesterday"
    } else if (inputDate.getFullYear() === now.getFullYear()) { 
        // cùng năm → hiển thị ngày tháng
        return inputDate.toLocaleDateString([], {
            day: "2-digit",
            month: "short"
        })
    } else {
        // năm khác → hiển thị đầy đủ
        return inputDate.toLocaleDateString()
    }
}

// Kiểm tra xem date có phải hôm nay không
export const isToday = (date) => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() && // cùng ngày
        date.getMonth() === today.getMonth() && // cùng tháng
        date.getFullYear() === today.getFullYear() // cùng năm
    );
};

// Kiểm tra xem date có phải hôm qua không
export const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Lấy ngày hôm qua
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
};

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

// Kiểm tra file có phải là ảnh hay không
export const isImage = (attachment) => {
    // Lấy kiểu MIME của file (vd: "image/png", "video/mp4")
    let mime = attachment.mime || attachment.type;

    // Tách MIME thành 2 phần: loại / định dạng
    // vd: "image/png" → ["image", "png"]
    mime = mime.split("/");

    // Kiểm tra phần loại có phải "image" không
    return mime[0].toLowerCase() === "image";
};

// Kiểm tra file có phải video
export const isVideo = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split("/");
    return mime[0].toLowerCase() === "video";
};

// Kiểm tra file có phải audio
export const isAudio = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split("/");
    return mime[0].toLowerCase() === "audio";
};

// Kiểm tra file có phải PDF
export const isPDF = (attachment) => {
    let mime = attachment.mime || attachment.type;
    // PDF không có dạng "pdf/..." mà là "application/pdf"
    return mime === "application/pdf";
};

// Kiểm tra file có thể xem preview được không
// (image, video, audio hoặc PDF)
export const isPreviewable = (attachment) => {
    return (
        isImage(attachment) ||
        isVideo(attachment) ||
        isAudio(attachment) ||
        isPDF(attachment)
    );
};

// Format dung lượng byte thành KB/MB/GB
export const formatBytes = (bytes, decimals = 2) => {
    // Nếu không có bytes → trả về 0 Bytes
    if (!bytes) return "0 Bytes";

    const k = 1024; // 1 KB = 1024 bytes
    const dm = decimals < 0 ? 0 : decimals; // Số chữ số thập phân
    const sizes = ["Bytes", "KB", "MB", "GB"]; // Đơn vị hỗ trợ

    let i = 0;      // vị trí đơn vị (0 = Bytes, 1 = KB...)
    let size = bytes; 

    // Chia dần cho 1024 cho đến khi nhỏ hơn 1024
    while (size >= k && i < sizes.length - 1) {
        size /= k;
        i++;
    }

    // Trả về chuỗi ví dụ: "12.34 MB"
    return `${parseFloat(size.toFixed(dm))} ${sizes[i]}`;
};
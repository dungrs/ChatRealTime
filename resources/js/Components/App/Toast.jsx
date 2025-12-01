import { useEventBus } from "@/EventBus" // hook tự tạo để lắng nghe event
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid" // tạo ID duy nhất cho mỗi toast

export default function Toast() {
    // state lưu danh sách các toast đang hiển thị
    const [toasts, setToasts] = useState([])
    
    // lấy phương thức 'on' từ EventBus để lắng nghe sự kiện
    const { on } = useEventBus();

    useEffect(() => {
        // lắng nghe event 'toast.show'
        on("toast.show", (message) => {
            const uuid = uuidv4(); // tạo id duy nhất cho toast mới

            // thêm toast mới vào state
            setToasts((oldToasts) => [...oldToasts, { message, uuid }])

            // tự động xoá toast sau 3s (cần sửa thời gian và filter)
            setTimeout(() => {
                setToasts((oldToasts) => {
                    // filter ra toast vừa tạo để xóa
                    return oldToasts.filter((toast) => toast.uuid !== uuid)
                    // Lưu ý: trong code gốc bạn thiếu 'return', sẽ không xóa được toast
                })
            }, 3000) // 3000ms = 3 giây
        })
    }, []) // chỉ chạy 1 lần khi mount

    return (
        // container cho các toast
        <div className="toast toast-top toast-right min-w-[280px]">
            {toasts.map((toast) => (
                // mỗi toast là một alert
                <div 
                    key={toast.uuid} 
                    className="alert alert-success py-3 px-4 text-gray-100 rounded-md min-w-[240px] shadow-md"
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    )
}

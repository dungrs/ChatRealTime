import { useEventBus } from "@/EventBus"; // hook tự tạo để lắng nghe event
import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // tạo ID duy nhất cho mỗi toast
import UserAvatar from "./UserAvatar";

export default function NewMessageNotification() {
    // state lưu danh sách các toast đang hiển thị
    const [toasts, setToasts] = useState([]);

    // lấy phương thức 'on' từ EventBus để lắng nghe sự kiện
    const { on } = useEventBus();

    useEffect(() => {
        // lắng nghe event 'newMessageNotification'
        on("newMessageNotification", ({ user, group_id, message }) => {
            // nếu user không tồn tại và không có group_id, bỏ qua
            if (!user && !group_id) return;

            const uuid = uuidv4(); // tạo id duy nhất cho toast mới

            // thêm toast mới vào state
            setToasts((oldToasts) => [...oldToasts, { message, uuid, user, group_id }]);
            // tự động xoá toast sau 3s
            setTimeout(() => {
                setToasts((oldToasts) =>
                    oldToasts.filter((toast) => toast.uuid !== uuid)
                );
            }, 3000);
        });
    }, []);

    return (
        // container cho các toast
        <div className="toast toast-top toast-right min-w-[280px]">
            {toasts
                .filter(toast => toast.user || toast.group_id) // lọc toast hợp lệ
                .map((toast) => (
                    <div
                        key={toast.uuid}
                        className="alert alert-success py-3 px-4 text-gray-100 rounded-md min-w-[240px] shadow-md"
                    >
                        <Link
                            href={
                                toast.group_id
                                    ? route("chat.group", toast.group_id)
                                    : route("chat.user", toast.user?.id) // optional chaining
                            }
                            className="flex items-center gap-2"
                        >
                            {toast.user && <UserAvatar user={toast.user} />}
                            <span>{toast.message}</span>
                        </Link>
                    </div>
                ))}
        </div>
    );
}
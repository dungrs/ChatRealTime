import { useEventBus } from "@/EventBus";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

// Các component UI
import Modal from "../Modal";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import InputError from "../InputError";
import TextAreaInput from "../TextAreaInput";
import UserPicker from "./UserPicker";

export default function GroupModal({ show = false, onClose = () => {} }) {
    // Lấy props từ Inertia (bao gồm conversations)
    const page = usePage();
    const conversations = page.props.conversations;

    // EventBus dùng để lắng nghe sự kiện mở Modal
    const { on, emit } = useEventBus();

    // State lưu thông tin nhóm đang chỉnh sửa
    const [group, setGroup] = useState({})

    // useForm để xử lý form (Inertia)
    const { data, setData, processing, reset, post, put, errors } = useForm({
        id: "",
        name: "",
        description: "",
        user_ids: [], // danh sách user đã chọn
    });

    // Lấy danh sách user từ conversations (lọc ra các cuộc trò chuyện 1-1)
    const users = conversations.filter((c) => !c.is_group);
    
    // Hàm tạo hoặc cập nhật nhóm
    const createOrUpdateGroup = (e) => {
        e.preventDefault();
        
        // Trường hợp update group
        if (group.id) {
            put(route("group.update", group.id), {
                onSuccess: () => {
                    closeModal();
                    emit("toast.show", `Group "${data.name}" was updated`)
                }
            });

            return;
        }

        // Trường hợp tạo group mới
        post(route("group.store"), {
            onSuccess: () => {
                closeModal();
                emit("toast.show", `Group ${data.name} was created`);
            }
        })
    }

    // Hàm đóng modal và reset form
    const closeModal = () => {
        reset();
        onClose();
    }

    // Khi event "GroupModal.show" được gọi -> mở modal và load dữ liệu group
    useEffect(() => {
        return on("GroupModal.show", (group) => {
            setData({
                name: group.name,
                description: group.description,

                // Lọc ra user trong group (ngoại trừ owner)
                user_ids: group.users
                        .filter((u) => group.owner_id !== u.id)
                        .map((u) => u.id)
            })

            setGroup(group)
        })
    }, [on])

    return (
        <Modal show={show} onClose={closeModal}>
            <form
                onSubmit={createOrUpdateGroup}
                className="p-6 overflow-y-auto"
            >   
                {/* Tiêu đề modal */}
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
                    {group.id 
                        ? `Edit Group ${group.name}`
                        : "Create new Group"}
                </h2>
                
                {/* Nhập tên group */}
                <div className="mt-8">
                    <InputLabel htmlFor="name" value="Name" />
                    
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        readOnly={!!group.id} // sửa từ disabled -> readOnly
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        isFocused
                    />

                    <InputError htmlFor="mt-2" message={errors.name} />
                </div>

                {/* Mô tả group */}
                <div className="mt-4">
                    <InputLabel htmlFor="description" value="Description" />
                    
                    <TextAreaInput
                        id="description"
                        rows="3"
                        className="mt-1 block w-full"
                        value={data.description || ""}
                        onChange={(e) => setData("description", e.target.value)}
                        
                    />

                    <InputError htmlFor="mt-2" message={errors.description} />
                </div>

                {/* Chọn users */}
                <div className="mt-4">
                    <InputLabel value="Select User" />

                    <UserPicker
                        value={
                            users.filter(
                                (u) => group.owner_id !== u.id &&
                                data.user_ids.includes(u.id)
                            )
                        }
                        options={users} // danh sách users hiển thị
                        onSelect={(users) => {
                            setData(
                                "user_ids",
                                users.map((u) => u.id)
                            )
                        }}
                    />

                    <InputError htmlFor="mt-2" message={errors.users_id} />
                </div>

                {/* Nút thao tác */}
                <div className="mt-6 flex justify-ent">
                    <SecondaryButton onClick={closeModal}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton className="ms-3" disabled={processing}>
                        {group.id ? "Update" : "Create"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
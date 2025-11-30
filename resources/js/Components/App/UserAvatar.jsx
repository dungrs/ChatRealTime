import React from "react";

const UserAvatar = ({ user, online = null, profile = false }) => {
    if (!user) return null;

    // DaisyUI lớp trạng thái
    const onlineClass =
        online === true ? "online" : online === false ? "offline" : "";

    // Kích thước avatar
    const sizeClass = profile ? "w-40 h-40" : "w-8 h-8";

    // Lấy chữ cái đầu
    const firstLetter = user?.name
        ? user.name.substring(0, 1).toUpperCase()
        : "?";

    return (
        <div className={`avatar ${onlineClass}`}>
            <div className={`${sizeClass} rounded-full overflow-hidden`}>
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.name || "Avatar"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="bg-gray-400 text-gray-800 flex items-center justify-center w-full h-full">
                        <span className={profile ? "text-4xl" : "text-sm"}>
                            {firstLetter}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAvatar;
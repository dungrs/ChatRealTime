<?php

namespace App\Observers;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use Illuminate\Support\Facades\Storage;

class MessageObserver
{
    // Hàm này sẽ chạy **trước khi xóa một Message** (được gọi tự động bởi Eloquent Observer)
    public function deleting(Message $message)
    {
        // 1️⃣ Xóa tất cả file attachments liên quan
        $message->attachments()->each(function ($attachment) {
            // Lấy thư mục chứa file attachment
            $dir = dirname($attachment->path);

            // Xóa toàn bộ thư mục chứa file (trên disk 'public')
            Storage::disk('public')->deleteDirectory($dir);
        });

        // Sau khi xóa file vật lý, xóa luôn record trong database
        $message->attachments()->delete();

        // 2️⃣ Cập nhật lại last_message_id nếu message đang bị xóa là last_message của group/conversation

        if ($message->group_id) {
            // Nếu message thuộc group
            $group = Group::where('last_message_id', $message->id)->first();

            if ($group) {
                // Tìm tin nhắn trước đó trong cùng group (không phải message hiện tại)
                $prevMessage = Message::where('group_id', $message->group_id)
                    ->where('id', '!=', $message->id)
                    ->latest() // sắp xếp theo thời gian mới nhất
                    ->limit(1)
                    ->first();

                if ($prevMessage) {
                    // Cập nhật last_message_id của group thành message trước đó
                    $group->last_message_id = $prevMessage->id;
                    $group->save();
                }
            }
        } else {
            // Nếu message thuộc conversation 1-1 (không phải group)
            $conversation = Conversation::where('last_message_id', $message->id)->first();

            if ($conversation) {
                // Tìm tin nhắn trước đó trong conversation này
                $prevMessage = Message::where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id)
                        ->orWhere('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id);
                })->where('id', '!=', $message->id)
                    ->latest() // lấy tin nhắn mới nhất trước message này
                    ->limit(1)
                    ->first();
                
                if ($prevMessage) {
                    // Cập nhật last_message_id của conversation
                    $conversation->last_message_id = $prevMessage->id;
                    $conversation->save();
                }
            }
        }
    }
}
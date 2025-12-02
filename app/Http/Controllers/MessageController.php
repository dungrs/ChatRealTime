<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    
    public function byUser(User $user) {
        $messages = Message::where('sender_id', Auth::id())
                        ->where('receiver_id', $user->id)
                        ->orWhere('sender_id', $user->id)
                        ->where('receiver_id', Auth::id())
                        ->latest()
                        ->paginate(10);

        return inertia("Home", [
            'selectedConversation' => $user->toConservationArray(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function byGroup(Group $group) {
        $messages = Message::where('group_id', $group->id)
                    ->latest()
                    ->paginate(10);

        return inertia("Home", [
            'selectedConversation' => $group->toConversationGroup(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function loadOlder(Message $message) {
        if ($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
                                ->where('group_id', $message->group_id)
                                ->latest()
                                ->paginate(10);
        } else {
            $messages = Message::where('created_at', '<', $message->created_at)
                                ->where(function($query) use ($message) {
                                    $query->where('sender_id', $message->sender_id)
                                        ->where('receiver_id', $message->receiver_id)
                                        ->orWhere('sender_id', $message->receiver_id)
                                        ->where('receiver_id', $message->sender_id);
                                })
                                ->latest()
                                ->paginate(10);
        }
        
        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request) {
        $data = $request->validated();
        $data['sender_id'] = Auth::id();
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;
        $files = $data['attachments'] ?? [];

        $message = Message::create($data);

        $attachments = [];
        
        if ($files) {
            foreach ($files as $file) {
                $directory = 'attachments/' . Str::random(32);
                Storage::makeDirectory($directory);
                
                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $file->store($directory, 'public')
                ];

                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }
            $message->attachments = $attachments;
        }

        if ($receiverId) {
            Conversation::updateConversationWithMessage($receiverId, Auth::id(), $message);
        }

        if ($groupId) {
            Group::updateGroupWithMessage($groupId, $message);
        }

        SocketMessage::dispatch($message);

        return new MessageResource($message);
    }

    public function destroy(Message $message) {
        // 1️⃣ Kiểm tra xem người xóa có phải là người gửi tin nhắn không
        // Nếu không phải, trả về lỗi Forbidden (400)
        if ($message->sender_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 400);
        }

        // 2️⃣ Khởi tạo biến để lưu group hoặc conversation liên quan
        $group = null;
        $conversation = null;

        // 3️⃣ Kiểm tra tin nhắn thuộc group hay conversation 1-1
        if ($message->group_id) {
            // Nếu tin nhắn thuộc group, lấy group có last_message_id = message này
            $group = Group::where('last_message_id', $message->id)->first();
        } else {
            // Nếu tin nhắn thuộc conversation 1-1 (không phải group)
            $conversation = Conversation::where('last_message_id', $message->id)->first();
        }
        
        // 5️⃣ Xóa tin nhắn
        $message->delete();

        // 4️⃣ Lấy thông tin lastMessage trước khi xóa
        if ($group) {
            // Nếu là group, tìm lại group (có thể redundant)
            $groupPrev = Group::find($group->id);
            $lastMessage = $groupPrev->lastMessage; // Lấy tin nhắn cuối cùng hiện tại của group
        } else if ($conversation) {
            // Nếu là conversation 1-1
            $conversationPrev = Conversation::find($conversation->id);
            $lastMessage = $conversationPrev->lastMessage; // Lấy tin nhắn cuối cùng hiện tại của conversation
        }


        // 6️⃣ Trả về response JSON
        // Nếu có tin nhắn cuối cùng (lastMessage) → trả về MessageResource của nó
        // Nếu không còn tin nhắn nào → trả về null
        return response()->json([
            'message' => $lastMessage ? new MessageResource($lastMessage) : null
        ]);
    }
}

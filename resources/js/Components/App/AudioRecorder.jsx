import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

const AudioRecorder = ({ fileReady }) => {
    // trạng thái ghi âm
    const [recording, setRecording] = useState(false)
    // lưu MediaRecorder để stop khi cần
    const [mediaRecorder, setMediaRecorder] = useState(null)

    const onMicrophoneClick = async () => {
        if (recording) {
            // nếu đang ghi âm, stop ghi âm
            setRecording(false);
            if (mediaRecorder) {
                mediaRecorder.stop(); // trigger sự kiện stop
                setMediaRecorder(null); // reset MediaRecorder
            }
            return; // dừng ở đây, không tạo MediaRecorder mới
        }

        // nếu chưa ghi âm, bắt đầu ghi
        setRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const newMediaRecorder = new MediaRecorder(stream);
            const chunks = []; // lưu dữ liệu audio tạm thời

            // mỗi khi có dữ liệu sẵn sàng, push vào chunks
            newMediaRecorder.addEventListener("dataavailable", (event) => {
                chunks.push(event.data);
            });

            // khi dừng ghi âm
            newMediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
                const audioFile = new File([audioBlob], "recorded_audio.ogg", { type: "audio/ogg; codecs=opus" });
                const url = URL.createObjectURL(audioFile);
                // trả về cho component cha
                fileReady(audioFile, url);
            });

            newMediaRecorder.start(); // bắt đầu ghi âm
            setMediaRecorder(newMediaRecorder); // lưu MediaRecorder để stop sau này
        } catch (error) {
            setRecording(false); // nếu lỗi, reset trạng thái
            console.log("Lỗi ghi âm:", error);
        }
    }

    return (
        <label
            onClick={onMicrophoneClick}
            className="p-2 rounded-full hover:bg-slate-700 cursor-pointer relative"
        >
            {recording
                ? <StopCircleIcon className="w-6 h-6 text-red-600" />
                : <MicrophoneIcon className="w-6 h-6 text-slate-300" />}
        </label>
    )
}

export default AudioRecorder;
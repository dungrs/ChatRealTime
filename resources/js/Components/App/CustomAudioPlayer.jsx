import { PauseCircleIcon, PlayCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import React, { useRef, useState } from "react";

const CustomAudioPlayer = ({ file, showVolume = true }) => {
    const audioRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const vol = e.target.value;
        audioRef.current.volume = vol;
        setVolume(vol);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
    };

    const handleSeekChange = (e) => {
        const time = e.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800 border border-slate-700 shadow-sm w-full">
            {/* Audio element */}
            <audio
                ref={audioRef}
                src={file.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(audioRef.current.duration)}
                className="hidden"
            />

            {/* Play/Pause */}
            <button
                onClick={togglePlayPause}
                className="flex-shrink-0 hover:text-blue-400 transition"
            >
                {isPlaying ? (
                    <PauseCircleIcon className="w-8 h-8 text-gray-300" />
                ) : (
                    <PlayCircleIcon className="w-8 h-8 text-gray-300" />
                )}
            </button>

            {/* Progress */}
            <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.01"
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="w-full h-1 rounded-lg accent-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
            </div>

            {/* Volume */}
            {showVolume && (
                <div className="flex items-center gap-1">
                    {volume > 0 ? (
                        <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                        <SpeakerXMarkIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 rounded-lg accent-blue-500 cursor-pointer"
                    />
                </div>
            )}
        </div>
    );
};

export default CustomAudioPlayer;
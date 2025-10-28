// v 1.0

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  fileName?: string;
  className?: string;
  mimeType?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  fileName = 'Audio',
  className = '',
  mimeType = 'audio/webm',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 10; // Prevent infinite retries

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log(
      'AudioPlayer: Setting up audio with src:',
      src,
      'mimeType:',
      mimeType
    );
    audio.src = src;
    // audio.currentTime = 0; // Ensure we start at the beginning
    // setCurrentTime(0);
    audio.load(); // Force metadata loading

    const applyDurationWorkaround = () => {
      if (audio.duration === Infinity && retryCount.current < maxRetries) {
        console.log('Applying WebM duration workaround: Seeking to large time');
        const largeTime = 999999; // Arbitrary large value to trigger file end probe
        audio.currentTime = largeTime;
        retryCount.current++;

        // Listen for 'seeked' event to capture updated duration
        const handleSeeked = () => {
          console.log(
            'Seeked for workaround, new duration:',
            audio.duration,
            'currentTime:',
            audio.currentTime
          );
          if (
            isFinite(audio.duration) &&
            audio.duration > 0 &&
            audio.duration !== Infinity
          ) {
            setDuration(audio.duration);
            setIsLoaded(true);
            console.log('Duration fixed via workaround:', audio.duration);
          } else {
            // Retry workaround if still Infinity
            setTimeout(applyDurationWorkaround, 100);
          }
          audio.removeEventListener('seeked', handleSeeked);
        };
        audio.addEventListener('seeked', handleSeeked);

        // Fallback: Reset currentTime if seek fails
        setTimeout(() => {
          if (audio.currentTime === largeTime) {
            audio.currentTime = 0;
          }
        }, 500);
      } else if (retryCount.current >= maxRetries) {
        console.error('Max retries reached for duration workaround');
      }
    };

    const checkDuration = setInterval(() => {
      const currentDur = audio.duration;
      console.log(
        'Interval check - duration:',
        currentDur,
        'readyState:',
        audio.readyState
      );

      if (isFinite(currentDur) && currentDur > 0 && currentDur !== Infinity) {
        setDuration(currentDur);
        setIsLoaded(true);
        console.log('Duration loaded via interval:', currentDur);
        clearInterval(checkDuration);
        retryCount.current = 0; // Reset retries
      } else if (currentDur === Infinity) {
        // Trigger workaround for Infinity
        applyDurationWorkaround();
      }
    }, 500); // Check every 500ms

    const handleLoadedMetadata = () => {
      console.log(
        'Audio metadata loaded, duration:',
        audio.duration,
        'readyState:',
        audio.readyState
      );
      const dur = audio.duration;
      if (isFinite(dur) && dur > 0 && dur !== Infinity) {
        setDuration(dur);
        setIsLoaded(true);
        console.log('Audio loaded successfully with duration:', dur);
        clearInterval(checkDuration);
        retryCount.current = 0;
      } else if (dur === Infinity) {
        // Trigger workaround immediately
        applyDurationWorkaround();
      }
    };

    const handleLoadedData = () => {
      console.log('Audio data loaded, duration:', audio.duration);
      const dur = audio.duration;
      if (!isLoaded && isFinite(dur) && dur > 0 && dur !== Infinity) {
        setDuration(dur);
        setIsLoaded(true);
        console.log('Audio loaded via loadeddata event');
        clearInterval(checkDuration);
        retryCount.current = 0;
      }
    };

    const handleCanPlay = () => {
      console.log('Audio can play, duration:', audio.duration);
      const dur = audio.duration;
      if (!isLoaded && isFinite(dur) && dur > 0 && dur !== Infinity) {
        setDuration(dur);
        setIsLoaded(true);
        console.log('Audio loaded via canplay event');
        // clearInterval(checkDuration);
        // Don't reset currentTime here as it might interfere with user seeking
        retryCount.current = 0;
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      if (isFinite(currentTime)) {
        setCurrentTime(currentTime);
        // Debug: Log when time updates (only occasionally to avoid spam)
        if (Math.floor(currentTime) % 5 === 0 && currentTime > 0) {
          console.log('Time update:', currentTime.toFixed(1), 'seconds');
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Reset audio to beginning
      if (audio.currentTime > 0) {
        audio.currentTime = 0;
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio loading error:', {
        error: e,
        errorCode: audio?.error?.code,
        errorMessage: audio?.error?.message,
        src,
        mimeType,
      });
      setIsLoaded(false);
      clearInterval(checkDuration);
    };

    const handleSeeked = () => {
      // General seeked handler for normal seeking
      const currentTime = audio.currentTime;
      if (isFinite(currentTime)) {
        setCurrentTime(currentTime);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('seeked', handleSeeked);

    return () => {
      clearInterval(checkDuration);
      retryCount.current = 0;
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('seeked', handleSeeked);
    };
  }, [src, mimeType]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log(
      'Toggle play/pause - currentTime:',
      audio.currentTime,
      'duration:',
      audio.duration,
      'isPlaying:',
      isPlaying
    );

    if (!isPlaying) {
      // Only reset to start if we're at the end (finished playing)
      if (audio.currentTime >= audio.duration) {
        console.log('Audio finished, resetting to start');
        audio.currentTime = 0;
        setCurrentTime(0);
      } else {
        console.log('Playing from current position:', audio.currentTime);
      }
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      console.log('Audio paused at:', audio.currentTime);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          console.log('Audio started playing from:', audio.currentTime);
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    console.log('Audio seeked to:', newTime, 'seconds');
  };

  if (!src) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 max-w-sm sm:max-w-md ${className}`}
    >
      <audio ref={audioRef} preload="metadata" controls={false} playsInline>
        <source src={src} type={mimeType} />
        Your browser does not support the audio element.
      </audio>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 bg-(--primary) hover:opacity-90 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
          disabled={!isLoaded}
          title={!isLoaded ? 'Loading...' : ''}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {fileName}
            </span>
          </div>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={!isLoaded}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{isLoaded ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>
        </div>
      </div>

      {!isLoaded && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Loading audio duration...
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Hls from "hls.js";
import {
  FaArrowLeft,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaClosedCaptioning,
} from "react-icons/fa";
import "./VideoPlayer.css";

interface Subtitle {
  id: number;
  language: string;
  url: string;
}

interface SubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
}

const VideoPlayer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const imdbId = searchParams.get("imdbId");
  const movieTitle = searchParams.get("title");
  const quality = searchParams.get("quality") || "720p";

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(
    null
  );
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("");
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);

  // Auto-hide controls timeout
  const controlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!imdbId) {
      navigate("/");
      return;
    }

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch available subtitles
        try {
          const subtitlesResponse = await fetch(
            `http://localhost:3000/movies/subtitles/${imdbId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          if (subtitlesResponse.ok) {
            const subtitlesData: Subtitle[] = await subtitlesResponse.json();
            setSubtitles(subtitlesData);
          }
        } catch (subtitleError) {
          console.warn("Failed to fetch subtitles:", subtitleError);
        }

        // First, initiate the stream
        const streamResponse = await fetch(
          `http://localhost:3000/torrent/stream/${imdbId}?quality=${quality}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!streamResponse.ok) {
          throw new Error("Failed to initiate stream");
        }

        // Wait a moment for the stream to be ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the playlist URL
        const playlistUrl = `http://localhost:3000/torrent/getStreamPlaylist/${imdbId}/${quality}`;

        if (videoRef.current) {
          if (Hls.isSupported()) {
            // Initialize HLS
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }

            hlsRef.current = new Hls({
              // HLS.js will automatically handle segment requests based on the playlist URLs
              debug: false,
              xhrSetup: (xhr: any, url: string) => {
                // Add credentials to all HLS requests (playlist and segments)
                xhr.withCredentials = true;

                // Check if this is a segment request and redirect to the correct endpoint
                if (url.includes(".ts")) {
                  // Extract segment name from the URL
                  const segmentName = url.split("/").pop();
                  if (segmentName) {
                    // Redirect to the proper segment endpoint
                    const segmentUrl = `http://localhost:3000/torrent/getSegment/${imdbId}/${quality}/${segmentName}`;
                    xhr.open("GET", segmentUrl, true);
                    return;
                  }
                }
              },
            });

            hlsRef.current.loadSource(playlistUrl);
            hlsRef.current.attachMedia(videoRef.current);

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              // Try to set initial duration from video element or manifest
              if (
                videoRef.current &&
                videoRef.current.duration &&
                !isNaN(videoRef.current.duration)
              ) {
                setDuration(videoRef.current.duration);
              }
              // HLS.js sometimes provides duration in event data
              // (untyped, so we check for it)
              // If you want, you can log the event data here for debugging
            });

            hlsRef.current.on(Hls.Events.FRAG_LOADING, () => {
              setIsRequestPending(true);
            });

            hlsRef.current.on(Hls.Events.FRAG_LOADED, () => {
              setIsRequestPending(false);
            });

            hlsRef.current.on(Hls.Events.ERROR, () => {
              setIsRequestPending(false);
            });

            hlsRef.current.on(Hls.Events.LEVEL_UPDATED, (_: any, data: any) => {
              // Use the actual playlist duration from segments
              if (data.details && data.details.fragments) {
                const segments = data.details.fragments;
                if (segments.length > 0) {
                  const lastSegment = segments[segments.length - 1];
                  const playlistDuration =
                    lastSegment.start + lastSegment.duration;
                  setDuration((prev) =>
                    playlistDuration > prev ? playlistDuration : prev
                  );
                }
              } else if (data.details && data.details.totalduration) {
                setDuration((prev) =>
                  data.details.totalduration > prev
                    ? data.details.totalduration
                    : prev
                );
              }
              // Fallback: if video element has a longer duration, use it
              if (
                videoRef.current &&
                videoRef.current.duration &&
                !isNaN(videoRef.current.duration)
              ) {
                setDuration((prev) =>
                  videoRef.current!.duration > prev
                    ? videoRef.current!.duration
                    : prev
                );
              }
            });

            hlsRef.current.on(Hls.Events.ERROR, () => {
              // console.error('HLS error:', data);
              // setError(`Streaming error: ${data.details}`);
              // setIsLoading(false);
            });
          } else if (
            videoRef.current.canPlayType("application/vnd.apple.mpegurl")
          ) {
            // Native HLS support (Safari)
            videoRef.current.src = playlistUrl;
            setIsLoading(false);
          } else {
            setError("HLS is not supported in this browser");
            setIsLoading(false);
          }
        }
      } catch {
        // console.error('Error initializing stream:', error);
        // setError('Failed to load video stream');
        // setIsLoading(false);
      }
    };

    initializeStream();

    // Reset controls timeout when mouse moves
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 1000);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".subtitle-menu")) {
        setShowSubtitleMenu(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("click", handleClickOutside);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [imdbId, quality, navigate]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Update subtitle text if subtitles are loaded
      if (selectedSubtitle && subtitleCues.length > 0) {
        updateSubtitleText(videoRef.current.currentTime);
      }
      // Don't update duration from video element for live streams
      // Duration is managed by HLS LEVEL_UPDATED events
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // For live streams, don't use video element duration
      // Always start from the beginning
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsLoading(false);
    }
  };

  const handleDurationChange = () => {
    // For sliding window live streams, ignore video element duration changes
    // Duration is managed by HLS LEVEL_UPDATED events only
  };

  const handleWaiting = () => {
    // Only set buffering if the video is actually trying to play
    if (videoRef.current && !videoRef.current.paused) {
      setIsBuffering(true);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setIsBuffering(false);
    setIsRequestPending(false);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
    setIsRequestPending(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSubtitleSelect = async (subtitle: Subtitle | null) => {
    if (videoRef.current) {
      // Clear any existing subtitles
      setCurrentSubtitleText("");
      setSubtitleCues([]);

      if (subtitle) {
        try {
          console.log("Loading subtitle:", {
            language: subtitle.language,
            url: `http://localhost:3000/${subtitle.url}`,
            originalUrl: subtitle.url,
          });

          setSelectedSubtitle(subtitle);

          // Load subtitle manually using our SRT parser
          await loadSubtitleManually(subtitle);
        } catch (error) {
          console.error("Error loading subtitle:", error);
        }
      } else {
        setSelectedSubtitle(null);
        setSubtitleCues([]);
        setCurrentSubtitleText("");
      }
    }
    setShowSubtitleMenu(false);
  };

  const toggleSubtitleMenu = () => {
    setShowSubtitleMenu(!showSubtitleMenu);
  };

  // Alternative method to load subtitles manually if needed
  const loadSubtitleManually = async (subtitle: Subtitle) => {
    try {
      const response = await fetch(`http://localhost:3000/${subtitle.url}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subtitle: ${response.status}`);
      }

      // For Arabic and other special languages, ensure proper text handling
      let srtContent: string;
      if (subtitle.language === "Arabic") {
        // Handle Arabic encoding explicitly
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        srtContent = decoder.decode(arrayBuffer);
      } else {
        srtContent = await response.text();
      }

      console.log(
        "Subtitle content loaded:",
        srtContent.substring(0, 200) + "..."
      );

      // Parse SRT content into cues
      const cues = parseSRT(srtContent);
      setSubtitleCues(cues);
      console.log("Parsed subtitle cues:", cues.length);

      // Debug Arabic content specifically
      if (subtitle.language === "Arabic") {
        console.log("Arabic subtitle sample:", cues.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load subtitle manually:", error);
    }
  };

  // Parse SRT format to subtitle cues
  const parseSRT = (srtText: string) => {
    const cues = [];
    const blocks = srtText.trim().split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(
          /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/
        );
        if (timeMatch) {
          const startTime =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3]) +
            parseInt(timeMatch[4]) / 1000;

          const endTime =
            parseInt(timeMatch[5]) * 3600 +
            parseInt(timeMatch[6]) * 60 +
            parseInt(timeMatch[7]) +
            parseInt(timeMatch[8]) / 1000;

          // For Arabic and RTL languages, preserve the text better
          let text = lines.slice(2).join("\n");

          // Only remove HTML tags but preserve text formatting for RTL languages
          text = text.replace(/<[^>]*>/g, "");

          // Clean up any BOM or invisible characters that might affect RTL rendering
          text = text.replace(/\uFEFF/g, "").trim();

          cues.push({
            startTime,
            endTime,
            text,
          });
        }
      }
    }

    return cues;
  };

  // Update subtitle text based on current time
  const updateSubtitleText = (currentTime: number) => {
    if (subtitleCues.length === 0) {
      setCurrentSubtitleText("");
      return;
    }

    const currentCue = subtitleCues.find(
      (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
    );

    const newText = currentCue ? currentCue.text : "";

    // Debug Arabic specifically
    if (
      selectedSubtitle?.language === "Arabic" &&
      newText !== currentSubtitleText
    ) {
      console.log("Arabic subtitle update:", {
        time: currentTime,
        text: newText,
        cue: currentCue,
      });
    }

    setCurrentSubtitleText(newText);
  };

  if (!imdbId) {
    return null;
  }

  return (
    <div className="h-screen bg-black flex flex-col relative">
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-gray-300 transition"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-white text-lg font-semibold truncate mx-4">
            {movieTitle ? decodeURIComponent(movieTitle) : "Video Player"}
          </h1>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative flex items-center justify-center">
        {(isLoading || error || (isBuffering && isRequestPending)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center">
              {(isLoading || (isBuffering && isRequestPending)) && !error && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                  {/* <p className="text-white"> */}
                  {/* </p> */}
                </>
              )}
              {error && (
                <div className="text-center">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-white text-lg mb-2">Error loading video</p>
                  <p className="text-gray-300 text-sm">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleDurationChange}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onClick={togglePlayPause}
          crossOrigin="anonymous"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>

        {/* Manual Subtitle Display */}
        {selectedSubtitle && currentSubtitleText && (
          <div
            className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-4xl ${
              selectedSubtitle.language === "Arabic"
                ? "rtl subtitle-arabic"
                : "ltr"
            }`}
          >
            <div
              className={`text-lg leading-relaxed ${
                selectedSubtitle.language === "Arabic" ? "arabic-text" : ""
              }`}
              style={{
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                fontSize:
                  selectedSubtitle.language === "Arabic" ? "20px" : "18px",
                fontWeight: "normal",
                direction:
                  selectedSubtitle.language === "Arabic" ? "rtl" : "ltr",
                textAlign:
                  selectedSubtitle.language === "Arabic" ? "right" : "center",
                unicodeBidi: "embed",
                fontFamily:
                  selectedSubtitle.language === "Arabic"
                    ? "'Noto Sans Arabic', 'Arial Unicode MS', 'Tahoma', sans-serif"
                    : "inherit",
              }}
            >
              {currentSubtitleText.split("\n").map((line, index) => (
                <div
                  key={index}
                  style={{
                    direction:
                      selectedSubtitle.language === "Arabic" ? "rtl" : "ltr",
                    textAlign:
                      selectedSubtitle.language === "Arabic"
                        ? "right"
                        : "center",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                (currentTime / duration) * 100
              }%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
            }}
          />
          <div className="flex justify-between text-white text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-red-500 transition text-2xl"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition"
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Subtitle Button */}
            <div className="relative subtitle-menu">
              <button
                onClick={toggleSubtitleMenu}
                className={`text-white hover:text-red-500 transition ${
                  selectedSubtitle ? "text-red-500" : ""
                }`}
                title="Subtitles"
              >
                <FaClosedCaptioning />
              </button>

              {/* Subtitle Menu */}
              {showSubtitleMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-lg p-2 min-w-48 max-h-60 overflow-y-auto">
                  <div className="text-white text-sm font-semibold mb-2 px-2">
                    Subtitles
                  </div>
                  <button
                    onClick={() => handleSubtitleSelect(null)}
                    className={`block w-full text-left px-2 py-1 text-sm rounded transition ${
                      !selectedSubtitle
                        ? "bg-red-500 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Off
                  </button>
                  {subtitles.map((subtitle) => (
                    <button
                      key={subtitle.id}
                      onClick={() => handleSubtitleSelect(subtitle)}
                      className={`block w-full text-left px-2 py-1 text-sm rounded transition ${
                        selectedSubtitle?.id === subtitle.id
                          ? "bg-red-500 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {subtitle.language}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-red-500 transition text-xl"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaArrowLeft,
  FaClosedCaptioning,
} from "react-icons/fa";
import "./VideoPlayer.css";
import api from "../services/api.ts";

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
          const subtitlesResponse = await api.get(`/movies/subtitles/${imdbId}`);
          setSubtitles(subtitlesResponse.data);
        } catch (subtitleError) {
          console.warn("Failed to fetch subtitles:", subtitleError);
        }

        // First, initiate the stream
        await api.get(`/torrent/stream/${imdbId}?quality=${quality}`);

        // Axios automatically throws for error status codes, so if we reach here, it was successful

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
              // Always start from the beginning of the playlist
              startPosition: 0,
              liveSyncDurationCount: 3,
              liveMaxLatencyDurationCount: Infinity,
              // Force starting from beginning for live streams
              backBufferLength: 90,
              maxBufferLength: 30,
              maxMaxBufferLength: 600,
              // Start playback from the beginning of available segments
              startLevel: -1,
              xhrSetup: (xhr: XMLHttpRequest, url: string) => {
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

            hlsRef.current.on(Hls.Events.LEVEL_UPDATED, (_, data) => {
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
                  data.details &&
                    data.details.totalduration &&
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
      const response = await api.get(`/${subtitle.url}`, {
        responseType: 'arraybuffer'
      });

      let srtContent: string;

      if (subtitle.language === "Arabic") {
        // For Arabic, try multiple encoding methods
        const arrayBuffer = response.data;

        // Try different encodings for Arabic
        const encodings = ["utf-8", "windows-1256", "iso-8859-6"];
        let decodedContent = "";
        let bestEncoding = "utf-8";

        for (const encoding of encodings) {
          try {
            const decoder = new TextDecoder(encoding, { fatal: false });
            const testContent = decoder.decode(arrayBuffer);

            console.log(`Testing ${encoding}:`, testContent.substring(0, 100));

            // Check if the content contains valid Arabic characters
            const arabicRegex = /[\u0600-\u06FF]/;
            const hasQuestionMarks =
              testContent.includes("?") || testContent.includes("�");

            if (arabicRegex.test(testContent) && !hasQuestionMarks) {
              decodedContent = testContent;
              bestEncoding = encoding;
              console.log(
                `Arabic subtitles decoded successfully with ${encoding}`
              );
              break;
            }
          } catch (e) {
            console.warn(`Failed to decode with ${encoding}:`, e);
          }
        }

        // If no encoding worked perfectly, try windows-1256 specifically for Arabic
        if (!decodedContent || decodedContent.includes("�")) {
          try {
            console.log(
              "Trying windows-1256 manual conversion as last resort..."
            );
            const uint8Array = new Uint8Array(arrayBuffer);
            let windows1256Content = "";

            // Windows-1256 to Unicode mapping for Arabic characters
            const windows1256Map: { [key: number]: string } = {
              0x80: "\u20AC",
              0x81: "\u067E",
              0x82: "\u201A",
              0x83: "\u0192",
              0x84: "\u201E",
              0x85: "\u2026",
              0x86: "\u2020",
              0x87: "\u2021",
              0x88: "\u02C6",
              0x89: "\u2030",
              0x8a: "\u0679",
              0x8b: "\u2039",
              0x8c: "\u0152",
              0x8d: "\u0686",
              0x8e: "\u0698",
              0x8f: "\u0688",
              0x90: "\u06AF",
              0x91: "\u2018",
              0x92: "\u2019",
              0x93: "\u201C",
              0x94: "\u201D",
              0x95: "\u2022",
              0x96: "\u2013",
              0x97: "\u2014",
              0x98: "\u06A9",
              0x99: "\u2122",
              0x9a: "\u0691",
              0x9b: "\u203A",
              0x9c: "\u0153",
              0x9d: "\u200C",
              0x9e: "\u200D",
              0x9f: "\u06BA",
              0xa0: "\u00A0",
              0xa1: "\u060C",
              0xa2: "\u00A2",
              0xa3: "\u00A3",
              0xa4: "\u00A4",
              0xa5: "\u00A5",
              0xa6: "\u00A6",
              0xa7: "\u00A7",
              0xa8: "\u00A8",
              0xa9: "\u00A9",
              0xaa: "\u06BE",
              0xab: "\u00AB",
              0xac: "\u00AC",
              0xad: "\u00AD",
              0xae: "\u00AE",
              0xaf: "\u00AF",
              0xb0: "\u00B0",
              0xb1: "\u00B1",
              0xb2: "\u00B2",
              0xb3: "\u00B3",
              0xb4: "\u00B4",
              0xb5: "\u00B5",
              0xb6: "\u00B6",
              0xb7: "\u00B7",
              0xb8: "\u00B8",
              0xb9: "\u00B9",
              0xba: "\u061B",
              0xbb: "\u00BB",
              0xbc: "\u00BC",
              0xbd: "\u00BD",
              0xbe: "\u00BE",
              0xbf: "\u061F",
              0xc0: "\u06C1",
              0xc1: "\u0621",
              0xc2: "\u0622",
              0xc3: "\u0623",
              0xc4: "\u0624",
              0xc5: "\u0625",
              0xc6: "\u0626",
              0xc7: "\u0627",
              0xc8: "\u0628",
              0xc9: "\u0629",
              0xca: "\u062A",
              0xcb: "\u062B",
              0xcc: "\u062C",
              0xcd: "\u062D",
              0xce: "\u062E",
              0xcf: "\u062F",
              0xd0: "\u0630",
              0xd1: "\u0631",
              0xd2: "\u0632",
              0xd3: "\u0633",
              0xd4: "\u0634",
              0xd5: "\u0635",
              0xd6: "\u0636",
              0xd7: "\u00D7",
              0xd8: "\u0637",
              0xd9: "\u0638",
              0xda: "\u0639",
              0xdb: "\u063A",
              0xdc: "\u0640",
              0xdd: "\u0641",
              0xde: "\u0642",
              0xdf: "\u0643",
              0xe0: "\u00E0",
              0xe1: "\u0644",
              0xe2: "\u00E2",
              0xe3: "\u0645",
              0xe4: "\u0646",
              0xe5: "\u0647",
              0xe6: "\u0648",
              0xe7: "\u00E7",
              0xe8: "\u00E8",
              0xe9: "\u00E9",
              0xea: "\u00EA",
              0xeb: "\u00EB",
              0xec: "\u0649",
              0xed: "\u064A",
              0xee: "\u00EE",
              0xef: "\u00EF",
              0xf0: "\u064B",
              0xf1: "\u064C",
              0xf2: "\u064D",
              0xf3: "\u064E",
              0xf4: "\u00F4",
              0xf5: "\u064F",
              0xf6: "\u0650",
              0xf7: "\u00F7",
              0xf8: "\u0651",
              0xf9: "\u00F9",
              0xfa: "\u0652",
              0xfb: "\u00FB",
              0xfc: "\u00FC",
              0xfd: "\u200E",
              0xfe: "\u200F",
              0xff: "\u06D2",
            };

            // Manual conversion from Windows-1256 to Unicode
            for (let i = 0; i < uint8Array.length; i++) {
              const byte = uint8Array[i];
              if (byte < 0x80) {
                // ASCII characters
                windows1256Content += String.fromCharCode(byte);
              } else {
                // Use the mapping table for characters >= 0x80
                windows1256Content +=
                  windows1256Map[byte] || String.fromCharCode(byte);
              }
            }

            console.log(
              "Manual Windows-1256 conversion result:",
              windows1256Content.substring(0, 100)
            );

            if (windows1256Content && !windows1256Content.includes("�")) {
              decodedContent = windows1256Content;
              bestEncoding = "manual-windows-1256";
              console.log("Manual Windows-1256 conversion successful");
            }
          } catch (e) {
            console.warn("Manual conversion failed:", e);
          }
        }

        // Final fallback with error tolerance
        if (!decodedContent) {
          console.warn(
            "All encoding attempts failed, using UTF-8 with error tolerance"
          );
          const decoder = new TextDecoder("utf-8", { fatal: false });
          decodedContent = decoder.decode(arrayBuffer);
        }

        console.log(`Final encoding used: ${bestEncoding}`);

        srtContent = decodedContent;
      } else {
        // For non-Arabic, get text response
        const textResponse = await api.get(`/${subtitle.url}`, {
          responseType: 'text'
        });
        srtContent = textResponse.data;
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

          let text = lines.slice(2).join("\n");

          // Remove HTML tags
          text = text.replace(/<[^>]*>/g, "");

          // Clean up common encoding issues for Arabic text
          text = text
            .replace(/\uFEFF/g, "") // Remove BOM
            .replace(/\u200E/g, "") // Remove LTR mark
            .replace(/\u200F/g, "") // Remove RTL mark
            .replace(/\u00A0/g, " ") // Replace non-breaking spaces
            .trim();

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

    // Debug Arabic text specifically
    if (
      selectedSubtitle?.language === "Arabic" &&
      newText &&
      newText !== currentSubtitleText
    ) {
      console.log("Arabic subtitle text:", {
        time: currentTime,
        text: newText,
        chars: newText.split("").map((c) => c.charCodeAt(0)),
        hasArabic: /[\u0600-\u06FF]/.test(newText),
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
        className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
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
            className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-4xl ${selectedSubtitle.language === "Arabic" ? "rtl" : "ltr"
              }`}
          >
            <div
              className="text-lg leading-relaxed"
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
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
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
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / duration) * 100
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
                className={`text-white hover:text-red-500 transition ${selectedSubtitle ? "text-red-500" : ""
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
                    className={`block w-full text-left px-2 py-1 text-sm rounded transition ${!selectedSubtitle
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
                      className={`block w-full text-left px-2 py-1 text-sm rounded transition ${selectedSubtitle?.id === subtitle.id
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

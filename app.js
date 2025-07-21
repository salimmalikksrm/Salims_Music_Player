// app.js

// Get DOM elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const rewind10Btn = document.getElementById('rewind-10-btn');
const forward10Btn = document.getElementById('forward-10-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeMuteIcon = document.getElementById('volume-mute-icon');
const volumeLowIcon = document.getElementById('volume-low-icon');
const volumeHighIcon = document.getElementById('volume-high-icon');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const albumArt = document.getElementById('album-art');
const progressBar = document.getElementById('progress-bar');
const currentTimeSpan = document.getElementById('current-time'); // New
const totalDurationSpan = document.getElementById('total-duration'); // New
const playlistElement = document.getElementById('playlist');

// Define your music playlist
// IMPORTANT: Replace these with your actual music file paths on GitHub.
// Ensure they are in a 'music/' directory relative to your index.html.
const playlist = [
    {
        title: "06 - Nee Prashnalu - SenSongsMp3.co",
        artist: "Chillwave Collective",
        src: "06 - Nee Prashnalu - SenSongsMp3.co.mp3", // Placeholder: Replace with your actual file
        cover: "https://placehold.co/192x192/4A5568/CBD5E0?text=Sunset"
    },
    {
        title: "Sooryudinye-SenSongsMp3.Co",
        artist: "Beat Makers",
        src: "Sooryudinye-SenSongsMp3.Co.mp3", // Placeholder: Replace with your actual file
        cover: "https://placehold.co/192x192/4A5568/CBD5E0?text=Groove"
    },
    {
        title: "Theme Music - SenSongsMp3.Co",
        artist: "Dream Weaver",
        src: "Theme Music - SenSongsMp3.Co.mp3", // Placeholder: Replace with your actual file
        cover: "https://placehold.co/192x192/4A5568/CBD5E0?text=Rain"
    },
    {
        title: "mix_12m52s (audio-joiner.com)",
        artist: "Orchestra X",
        src: "mix_12m52s (audio-joiner.com).mp3", // Placeholder: Replace with your actual file
        cover: "https://placehold.co/192x192/4A5568/CBD5E0?text=Epic"
    }
];

let currentSongIndex = 0;
let isPlaying = false;

// Helper function to format time from seconds to MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
}

// Function to load and play a song
function loadSong(song) {
    audioPlayer.src = song.src;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumArt.src = song.cover;

    // Reset time display when new song loads
    currentTimeSpan.textContent = '0:00';
    totalDurationSpan.textContent = '0:00';

    // Update Media Session metadata for lock screen/notification controls
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: 'Salim\'s Music Player', // Updated album name
            artwork: [
                { src: song.cover, sizes: '192x192', type: 'image/png' },
                { src: song.cover, sizes: '512x512', type: 'image/png' }
            ]
        });
    }

    // Update active class in playlist
    const allPlaylistItems = playlistElement.querySelectorAll('li');
    allPlaylistItems.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (isPlaying) {
        audioPlayer.play();
    }
}

// Function to play the current song
function playSong() {
    isPlaying = true;
    audioPlayer.play();
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');

    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
}

// Function to pause the current song
function pauseSong() {
    isPlaying = false;
    audioPlayer.pause();
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');

    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
}

// Play/Pause button event listener
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

// Play next song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(playlist[currentSongIndex]);
    playSong();
}

// Play previous song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(playlist[currentSongIndex]);
    playSong();
}

nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// Rewind 10 seconds
rewind10Btn.addEventListener('click', () => {
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
});

// Forward 10 seconds
forward10Btn.addEventListener('click', () => {
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
});

// Function to update the displayed volume icon based on current volume
function updateVolumeIcon() {
    const volume = audioPlayer.volume;
    // Hide all icons first
    volumeMuteIcon.classList.add('hidden');
    volumeLowIcon.classList.add('hidden');
    volumeHighIcon.classList.add('hidden');

    // Show the appropriate icon
    if (volume === 0) {
        volumeMuteIcon.classList.remove('hidden');
    } else if (volume > 0 && volume <= 0.5) {
        volumeLowIcon.classList.remove('hidden');
    } else { // volume > 0.5
        volumeHighIcon.classList.remove('hidden');
    }
}

// Volume control
volumeSlider.addEventListener('input', (event) => {
    audioPlayer.volume = event.target.value;
    updateVolumeIcon(); // Update icon when slider changes
});

// When a song ends, play the next one
audioPlayer.addEventListener('ended', nextSong);

// Update progress bar and time display
audioPlayer.addEventListener('timeupdate', () => {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
});

// Update total duration when metadata is loaded
audioPlayer.addEventListener('loadedmetadata', () => {
    totalDurationSpan.textContent = formatTime(audioPlayer.duration);
});


// Populate playlist
function populatePlaylist() {
    playlist.forEach((song, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="song-number">${index + 1}.</span>
            <span class="song-details flex-grow truncate">
                <span class="font-medium">${song.title}</span> - <span class="text-gray-400">${song.artist}</span>
            </span>
        `;
        listItem.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(playlist[currentSongIndex]);
            playSong();
        });
        playlistElement.appendChild(listItem);
    });
}

// Initialize Media Session API for OS-level media controls
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
        playSong();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        pauseSong();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextSong();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevSong();
    });
    // Add seek handlers for 10-second skip
    navigator.mediaSession.setActionHandler('seekbackward', (event) => {
        const seekTime = event.seekOffset || 10; // Default to 10 seconds if no offset is provided
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - seekTime);
    });
    navigator.mediaSession.setActionHandler('seekforward', (event) => {
        const seekTime = event.seekOffset || 10; // Default to 10 seconds if no offset is provided
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + seekTime);
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') // Register sw.js from the root
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Initial load of the first song and populate playlist
window.addEventListener('DOMContentLoaded', () => {
    populatePlaylist();
    loadSong(playlist[currentSongIndex]);
    audioPlayer.volume = volumeSlider.value; // Set initial volume from slider
    updateVolumeIcon(); // Set initial volume icon
});

const tracks = [
    {
      url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
      name: 'Sevish - nbsp',
      artist: 'Sevish',
      album: 'Unknown Album',
      duration: '3:25' // Example duration
    },
    {
      url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
      name: 'Kangaroo MusiQue - The Neverwritten Role Playing Game',
      artist: 'Kangaroo MusiQue',
      album: 'The Neverwritten Album',
      duration: '4:12' // Example duration
    }
  ];
  
  let currentTrackIndex = 0;
  const audioPlayer = document.getElementById('audioPlayer');
  const volumeSlider = document.getElementById('volumeSlider');
  const seekBar = document.getElementById('seekBar');
  const currentTime = document.getElementById('currentTime');
  const duration = document.getElementById('duration');
  const trackName = document.getElementById('trackName');
  const artistAlbum = document.getElementById('artistAlbum');
  const playPauseButton = document.getElementById('playPause');
  const shuffleButton = document.getElementById('shuffle');
  const repeatButton = document.getElementById('repeat');
  const visualizerCanvas = document.getElementById('visualizerCanvas');
  const visualizerCtx = visualizerCanvas.getContext('2d');
  const trackList = document.getElementById('trackList');
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  let shuffledTracks = [];
  let isShuffled = false;
  let isRepeated = false;
  
  // Web Audio API variables
  let audioContext;
  let analyser;
  let dataArray;
  const bufferLength = 256;
  
  document.addEventListener('DOMContentLoaded', () => {
    // Populate the playlist
    tracks.forEach((track, index) => {
      const li = document.createElement('li');
      li.textContent = track.name;
      li.addEventListener('click', () => playTrack(index));
      trackList.appendChild(li);
    });
  
    // Set up event listeners for controls
    document.getElementById('prev').addEventListener('click', () => {
      if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
      }
    });
  
    document.getElementById('next').addEventListener('click', () => {
      if (currentTrackIndex < tracks.length - 1) {
        playTrack(currentTrackIndex + 1);
      }
    });
  
    playPauseButton.addEventListener('click', togglePlayPause);
    shuffleButton.addEventListener('click', toggleShuffle);
    repeatButton.addEventListener('click', toggleRepeat);
    darkModeToggle.addEventListener('click', toggleDarkMode);
  
    // Volume control
    volumeSlider.addEventListener('input', () => {
      audioPlayer.volume = volumeSlider.value;
    });
  
    // Seek bar
    audioPlayer.addEventListener('timeupdate', updateSeekBar);
    seekBar.addEventListener('input', () => {
      const seekTime = audioPlayer.duration * (seekBar.value / 100);
      audioPlayer.currentTime = seekTime;
    });
  
    audioPlayer.addEventListener('ended', () => {
      if (!isRepeated) {
        if (currentTrackIndex < tracks.length - 1) {
          playTrack(currentTrackIndex + 1);
        } else {
          playTrack(currentTrackIndex);
        }
      }
    });
  
    // Initialize the audio visualizer
    initVisualizer();
  
    // Initialize the first track
    playTrack(0);
  });
  
  function initVisualizer() {
    // Initialize the AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  
    const source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  
    // Set up the visualizer canvas
    visualizerCanvas.width = bufferLength * 2.5;
    visualizerCanvas.height = 100;
  
    drawVisualizer();
  }
  
  function drawVisualizer() {
    analyser.getByteFrequencyData(dataArray);
  
    visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
  
    const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
  
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * 2;
  
      visualizerCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
      visualizerCtx.fillRect(x, visualizerCanvas.height - barHeight / 2, barWidth, barHeight);
  
      x += barWidth + 1;
    }
  
    requestAnimationFrame(drawVisualizer);
  }
  
  function toggleRepeat() {
    isRepeated = !isRepeated;
  
    repeatButton.classList.toggle('active', isRepeated);
  
    if (isRepeated) {
      audioPlayer.loop = true; // Enable loop for audio player
    } else {
      audioPlayer.loop = false; // Disable loop for audio player
    }
  }
  
  function playTrack(index) {
    currentTrackIndex = index;
    const track = shuffledTracks.length > 0 ? shuffledTracks[index] : tracks[index];
    audioPlayer.src = track.url;
    audioPlayer.load();
    audioPlayer.play();
    trackName.textContent = track.name;
    artistAlbum.textContent = `${track.artist} - ${track.album}`;
    duration.textContent = track.duration;
    updateTrackList();
  }
  
  function updateTrackList() {
    const trackListItems = document.getElementById('trackList').children;
    for (let i = 0; i < trackListItems.length; i++) {
      if (i === currentTrackIndex) {
        trackListItems[i].classList.add('active');
      } else {
        trackListItems[i].classList.remove('active');
      }
    }
  }
  
  function togglePlayPause() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      audioPlayer.pause();
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
  }
  
  function toggleShuffle() {
    isShuffled = !isShuffled;
  
    if (isShuffled) {
      // Shuffle the tracks
      shuffledTracks = shuffleArray(tracks);
      playTrack(0); // Start playing from the beginning of the shuffled array
    } else {
      shuffledTracks = [];
      playTrack(currentTrackIndex); // Resume playing from the original track
    }
  
    shuffleButton.classList.toggle('active', isShuffled);
  }
  
  function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  function updateSeekBar() {
    const currentTimeValue = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekBar.value = currentTimeValue.toFixed(2);
    currentTime.textContent = formatTime(audioPlayer.currentTime);
  }
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }
  
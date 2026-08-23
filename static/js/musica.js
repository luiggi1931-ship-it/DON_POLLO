document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURACIÓN DE CANCIONES ---
    const songs = [
        {
            title: "pollitos dicen",
            artist: "ZZZ",
            src: "static/musica/pollitosdicen.mp3" 
        },
        {
            title: "El pollito pío",
            artist: "ZZZ",
            src: "static/musica/elpollitopio.mp3" 
        },
        {
            title: "lavaca",
            artist: "ZZZ",
            src: "static/musica/lavaca.mp3" 
        },
        {
            title: "Night Monitoring",
            artist: "Dev Mode",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
        },
        {
            title: "Nature Sounds",
            artist: "Relax",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
        }
    ];

    let songIndex = 0;

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const audio = document.getElementById('audio-player');
    
    // Controles
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Información e interfaz
    const titleEl = document.getElementById('song-title');
    const artistEl = document.getElementById('song-artist');
    const progressContainer = document.getElementById('progress-container');
    const progress = document.getElementById('progress');
    const volumeSlider = document.getElementById('volume-slider');
    
    // Icono del botón Play
    const playIcon = playBtn.querySelector('i');

    // --- FUNCIONES DEL REPRODUCTOR ---

    // 1. Cargar la canción en el objeto de audio
    function loadSong(song) {
        titleEl.innerText = song.title;
        artistEl.innerText = song.artist;
        audio.src = song.src;
    }

    // 2. Reproducir
    function playSong() {
        audio.parentElement.classList.add('playing');
        if(playIcon) {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        }
        audio.play();
    }

    // 3. Pausar
    function pauseSong() {
        audio.parentElement.classList.remove('playing');
        if(playIcon) {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
        audio.pause();
    }

    // 4. Anterior canción
    function prevSong() {
        songIndex--;
        if (songIndex < 0) {
            songIndex = songs.length - 1;
        }
        loadSong(songs[songIndex]);
        playSong();
    }

    // 5. Siguiente canción
    function nextSong() {
        songIndex++;
        if (songIndex > songs.length - 1) {
            songIndex = 0;
        }
        loadSong(songs[songIndex]);
        playSong();
    }

    // 6. Actualizar barra de progreso (mientras suena)
    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        if(progress) {
            progress.style.width = `${progressPercent}%`;
        }
    }

    // 7. Cambiar posición al hacer click en la barra
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // 8. Control de Volumen
    function setVolume() {
        audio.volume = volumeSlider.value;
        
        // Cambio visual del icono de volumen según el nivel
        const volIcon = document.querySelector('.volume-control i');
        if(volIcon) {
            if(audio.volume === 0) {
                volIcon.className = 'fas fa-volume-mute small-icon';
            } else if(audio.volume < 0.5) {
                volIcon.className = 'fas fa-volume-down small-icon';
            } else {
                volIcon.className = 'fas fa-volume-up small-icon';
            }
        }
    }

    // --- EVENT LISTENERS (ESCUCHAR CLICS) ---
    
    // Cargar canción inicial al abrir la página
    loadSong(songs[songIndex]);

    // Botón Play/Pause
    playBtn.addEventListener('click', () => {
        const isPlaying = audio.parentElement.classList.contains('playing');
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    // Botones de navegación
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    
    // Barra de tiempo
    audio.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', setProgress);
    
    // Cuando termina la canción, pasa a la siguiente
    audio.addEventListener('ended', nextSong);

    // Volumen
    volumeSlider.addEventListener('input', setVolume);
});
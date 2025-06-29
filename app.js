// ======================================
// Lógica de Navegación entre Secciones
// ======================================
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    // Ocultar el reproductor de música cuando se cambia de sección, excepto cuando se abre la carta
    const musicPlayerContainer = document.getElementById('musicPlayerContainer');
    if (id !== 'section-letter') { // Si NO estamos en la sección de la carta
        musicPlayerContainer.classList.add('hidden'); // Ocultar el reproductor
        pauseTrack(); // Pausar la música si estaba sonando
    } else {
        // Cuando volvemos a la sección de la carta, podrías decidir si lo quieres visible por defecto
        // Actualmente, se mantiene oculto/minimizado hasta que el usuario abre la carta de nuevo.
    }
}

// Mostrar solo la primera sección al cargar
// Asegura que solo la sección de la carta sea visible al inicio
document.addEventListener('DOMContentLoaded', () => {
    showSection('section-letter');
});


// ======================================
// Lógica de la carta (abrir/cerrar sobre)
// ======================================
const envelopeWrapper = document.querySelector('.envelope-wrapper'); // Selecciona el contenedor principal del sobre

if (envelopeWrapper) { // Asegúrate de que el elemento existe antes de añadir el event listener
    envelopeWrapper.addEventListener('click', () => {
        envelopeWrapper.classList.toggle('flap');
        console.log("Clase 'flap' toggled en envelope-wrapper."); // Para depuración

        // Cuando se abre la carta (se añade 'flap'), mostrar el reproductor de música
        const musicPlayerContainer = document.getElementById('musicPlayerContainer');
        const musicContainer = document.querySelector('.music-container');

        if (envelopeWrapper.classList.contains('flap')) {
            musicPlayerContainer.classList.remove('hidden');
            musicContainer.classList.remove('minimized'); // Asegura que esté "abierto"
        } else {
            // Cuando se cierra la carta, lo minimizamos
            musicContainer.classList.add('minimized');
            // musicPlayerContainer.classList.add('hidden'); // Podrías ocultarlo completamente si lo prefieres
            pauseTrack(); // Pausa la música si se cierra la carta
        }
    });
}


// ======================================
// Lógica del Reproductor de Música
// ======================================

const musicContainer = document.querySelector('.music-container');
const playPauseBtn = document.querySelector('.playpause-track');
const playPauseIcon = document.getElementById('playPauseIcon');
const prevBtn = document.querySelector('.prev-track');
const nextBtn = document.querySelector('.next-track');
const trackName = document.querySelector('.trackname');
const trackArtist = document.querySelector('.trackartist');
const togglePlayerBtn = document.querySelector('.toggle-player');
const togglePlayerIcon = togglePlayerBtn ? togglePlayerBtn.querySelector('img') : null; // Añadir chequeo de nulidad
const soundBarsLottie = document.querySelector('.sound-bars');

// Lista de canciones
const trackList = [
    {
        name: "2 Much",
        artist: "Justin Bieber",
        path: "music/2 Much.mp3"
    },
    {
        name: "Anyone",
        artist: "Justin Bieber",
        path: "music/Anyone.mp3"
    },
    {
        name: "Can't Feel My Face",
        artist: "The Weeknd",
        path: "music/Can't Feel My Face.mp3"
    }
];

let trackIndex = 0;
let isPlaying = false;
let currentTrack = new Audio();
let animation; // Lottie animation instance

// Función para cargar la animación de Lottie
function loadLottieAnimation() {
    if (!soundBarsLottie) {
        console.warn("Elemento .sound-bars no encontrado para la animación Lottie.");
        return;
    }
    // Reemplaza 'lottie/sound_bars_animation.json' con la ruta real de tu archivo JSON.
    animation = lottie.loadAnimation({
        container: soundBarsLottie,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'lottie/sound_bars_animation.json'
    });

    animation.goToAndStop(0, true);

    currentTrack.onplay = () => {
        if (animation) animation.play();
        musicContainer.classList.remove('paused');
    };
    currentTrack.onpause = () => {
        if (animation) animation.pause();
        musicContainer.classList.add('paused');
    };
    currentTrack.onended = () => {
        if (animation) {
            animation.pause();
            animation.goToAndStop(0, true);
        }
        nextTrack();
    };

    animation.addEventListener('error', (error) => {
        console.error('Lottie animation error:', error);
    });
}

// Función para cargar la canción
function loadTrack(trackIndex) {
    if (trackList.length === 0) {
        console.warn("No hay canciones en la lista.");
        trackName.textContent = "No Track";
        trackArtist.textContent = "";
        return;
    }
    currentTrack.src = trackList[trackIndex].path;
    currentTrack.load();

    trackName.textContent = trackList[trackIndex].name;
    trackArtist.textContent = trackList[trackIndex].artist;

    if (animation) {
        animation.goToAndStop(0, true);
        if (isPlaying) {
            animation.play();
        } else {
            animation.pause();
        }
    }
    updatePlayPauseButton();
}

function playTrack() {
    currentTrack.play()
        .then(() => {
            isPlaying = true;
            updatePlayPauseButton();
            if (musicContainer) musicContainer.classList.remove('paused');
            if (animation) animation.play();
        })
        .catch(error => {
            console.error("Error al intentar reproducir el audio (posiblemente Autoplay Policy):", error);
            isPlaying = false;
            updatePlayPauseButton();
            if (musicContainer) musicContainer.classList.add('paused');
            if (animation) animation.pause();
            // Solo alerta la primera vez que falla por autoplay
            if (error.name === 'NotAllowedError') {
                alert("El navegador bloqueó la reproducción automática. Por favor, haz clic en el botón de Play para iniciar la música.");
            }
        });
}

function pauseTrack() {
    currentTrack.pause();
    isPlaying = false;
    updatePlayPauseButton();
    if (musicContainer) musicContainer.classList.add('paused');
    if (animation) animation.pause();
}

function nextTrack() {
    trackIndex++;
    if (trackIndex > trackList.length - 1) {
        trackIndex = 0;
    }
    loadTrack(trackIndex);
    playTrack();
}

function prevTrack() {
    trackIndex--;
    if (trackIndex < 0) {
        trackIndex = trackList.length - 1;
    }
    loadTrack(trackIndex);
    playTrack();
}

function updatePlayPauseButton() {
    if (playPauseIcon) {
        if (isPlaying) {
            playPauseIcon.src = 'icons/pause.svg';
        } else {
            playPauseIcon.src = 'icons/play.svg';
        }
    }
}

// Función para alternar la visibilidad y el estado minimizado del reproductor
function toggleMusicPlayer() {
    const playerDiv = document.querySelector('.music-container');
    const playerContainer = document.getElementById('musicPlayerContainer');

    if (!playerDiv || !playerContainer || !togglePlayerIcon) return; // Salir si no se encuentran los elementos

    if (playerDiv.classList.contains('minimized')) {
        playerDiv.classList.remove('minimized');
        playerContainer.classList.remove('hidden'); // Asegura que el contenedor esté visible
        togglePlayerIcon.src = 'icons/close.svg';
    } else {
        playerDiv.classList.add('minimized');
        togglePlayerIcon.src = 'icons/open.svg'; // Asegúrate de tener un icono 'open.svg'
        pauseTrack(); // Pausa la música al minimizar
    }
}


// Event Listeners para los controles del reproductor
if (playPauseBtn) playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
});

if (prevBtn) prevBtn.addEventListener('click', prevTrack);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (togglePlayerBtn) togglePlayerBtn.addEventListener('click', toggleMusicPlayer);


// Cargar la primera canción y la animación Lottie al inicio
// Asegurarse de que el DOM esté completamente cargado antes de inicializar el reproductor
document.addEventListener('DOMContentLoaded', () => {
    loadTrack(trackIndex);
    loadLottieAnimation();
    updateCountdown(); // También iniciar el contador
});


// ======================================
// Lógica del Contador de Tiempo
// ======================================

function updateCountdown() {
    // Current date is Friday, June 28, 2024. Your provided date is August 13, 2024.
    // The previous calculation was designed for past dates. For future dates, it needs adjustment
    // Or you intend to show how much time passed since August 13, 2024 (which is in the future now).
    // Let's assume you want to show how much time has passed since August 13, 2024, when it arrives.
    // If you want a countdown TO August 13, 2024, the logic would be different.
    
    // As per your original code, let's keep the logic for elapsed time.
    // So for now, until Aug 13, 2024, years, months, and days will be 0.
    const startDate = new Date('2024-08-13T00:00:00'); // Formato ISO para compatibilidad
    const now = new Date();
    
    // If the start date is in the future, display 0 for now.
    if (now < startDate) {
        document.getElementById('years').textContent = 0;
        document.getElementById('months').textContent = 0;
        document.getElementById('days').textContent = 0;
        return;
    }

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
        days += prevMonth.getDate(); // Add days in previous month
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    document.getElementById('years').textContent = years >= 0 ? years : 0;
    document.getElementById('months').textContent = months >= 0 ? months : 0;
    document.getElementById('days').textContent = days >= 0 ? days : 0;
}

// Actualizar el contador cada hora (o con la frecuencia que desees)
// Si quieres que los segundos se actualicen, ponlo en 1000
setInterval(updateCountdown, 1000 * 60 * 60);
// Ya se llama a updateCountdown() en DOMContentLoaded

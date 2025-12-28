// YouTubePlayer.js
class YouTubePlayer {
    constructor(playerContainerId, onReadyCallback, onErrorCallback) {
        this.playerContainerId = playerContainerId;
        this.onReadyCallback = onReadyCallback;
        this.onErrorCallback = onErrorCallback;
        this.player = null;
        this.isReady = false;
        this.apiReady = false;
        
        console.log('🎬 [DEBUG] YouTubePlayer créé');
    }

    // Initialiser le player YouTube
    init() {
        console.log('🎬 [DEBUG] Initialisation YouTubePlayer...');
        
        if (!window.YT) {
            console.log('📦 [DEBUG] Chargement de l\'API YouTube...');
            this.loadYouTubeAPI();
        } else if (window.YT.Player) {
            this.apiReady = true;
            this.createPlayer();
        } else {
            console.log('⏳ [DEBUG] API YouTube en cours de chargement...');
        }
    }

    // Charger l'API YouTube
    loadYouTubeAPI() {
        // Vérifier si le script est déjà en cours de chargement
        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            console.log('⚠️ [DEBUG] API YouTube déjà en cours de chargement');
            return;
        }
        
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        
        // S'assurer qu'on a une référence au callback
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            console.log('✅ [DEBUG] API YouTube chargée');
            this.apiReady = true;
            this.createPlayer();
            // Appeler aussi l'original si existant
            if (typeof originalCallback === 'function') {
                originalCallback();
            }
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Créer l'instance du player
    createPlayer() {
        console.log('🎬 [DEBUG] Création du player YouTube...');
        
        if (!window.YT || !window.YT.Player) {
            console.error('❌ [DEBUG] API YouTube non disponible');
            return;
        }
        
        try {
            this.player = new YT.Player(this.playerContainerId, {
                height: '100%',
                width: '100%',
                playerVars: {
                    'controls': 0,
                    'modestbranding': 1,
                    'showinfo': 0,
                    'rel': 0,
                    'iv_load_policy': 3,
                    'disablekb': 1,
                    'fs': 0,
                    'playsinline': 1,
                    'autoplay': 1,
                    'mute': 0,
                    'origin': window.location.origin // Important pour éviter les erreurs CORS
                },
                events: {
                    'onReady': (event) => {
                        console.log('✅ [DEBUG] YouTube Player prêt');
                        this.isReady = true;
                        if (this.onReadyCallback) this.onReadyCallback(event);
                    },
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': (event) => {
                        console.error('❌ [DEBUG] Erreur YouTube Player:', event.data);
                        if (this.onErrorCallback) this.onErrorCallback(event);
                    }
                }
            });
        } catch (error) {
            console.error('❌ [DEBUG] Erreur lors de la création du player:', error);
            if (this.onErrorCallback) this.onErrorCallback(error);
        }
    }

    onPlayerStateChange(event) {
        console.log(`🎬 [DEBUG] YouTube state change: ${event.data}`);
        
        // Codes d'état YouTube
        // -1 = non démarré
        // 0 = terminé
        // 1 = en lecture
        // 2 = en pause
        // 3 = mise en tampon
        // 5 = vidéo en attente (pub)
        
        if (event.data === YT.PlayerState.PLAYING) {
            console.log('▶️ [DEBUG] YouTube: Lecture démarrée');
        }
        
        if (event.data === YT.PlayerState.ENDED) {
            console.log('⏹️ [DEBUG] YouTube: Vidéo terminée');
            // On ne rejoue plus automatiquement
        }
        
        if (event.data === 5) { // CUED
            console.log('🔄 [DEBUG] YouTube: Vidéo en attente (pub probable)');
        }
    }

    // Charger et jouer une vidéo
    loadVideo(videoId, startTime) {
        console.log(`🎬 [DEBUG] Chargement vidéo: ${videoId} à ${startTime}s`);
        
        if (!this.isReady || !this.player) {
            console.warn('⚠️ [DEBUG] Player non prêt, tentative dans 500ms...');
            setTimeout(() => this.loadVideo(videoId, startTime), 500);
            return;
        }
        
        try {
            this.player.loadVideoById({
                videoId: videoId,
                startSeconds: startTime,
                suggestedQuality: 'medium'
            });
            console.log(`✅ [DEBUG] Vidéo ${videoId} chargée à ${startTime}s`);
        } catch (error) {
            console.error('❌ [DEBUG] Erreur loadVideoById:', error);
            if (this.onErrorCallback) this.onErrorCallback(error);
        }
    }

    // Jouer la vidéo
    play() {
        if (this.isReady && this.player && this.player.playVideo) {
            try {
                this.player.playVideo();
                console.log('▶️ [DEBUG] YouTube: play() appelé');
            } catch (error) {
                console.error('❌ [DEBUG] Erreur lors de la lecture:', error);
            }
        }
    }

    // Arrêter la vidéo
    stop() {
        if (this.isReady && this.player && this.player.stopVideo) {
            try {
                this.player.stopVideo();
                console.log('⏹️ [DEBUG] YouTube: stop() appelé');
            } catch (error) {
                console.error('❌ [DEBUG] Erreur lors de l\'arrêt:', error);
            }
        }
    }

    // Activer/désactiver le son
    mute() {
        if (this.isReady && this.player && this.player.mute) {
            this.player.mute();
            console.log('🔇 [DEBUG] YouTube: mute()');
        }
    }

    unmute() {
        if (this.isReady && this.player && this.player.unMute) {
            this.player.unMute();
            console.log('🔊 [DEBUG] YouTube: unmute()');
        }
    }

    // Vérifier si le player est prêt
    isPlayerReady() {
        return !!(window.YT && window.YT.Player);
    }
}
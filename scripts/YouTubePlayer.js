// YouTubePlayer.js
class YouTubePlayer {
    constructor(playerContainerId, onReadyCallback, onErrorCallback) {
        this.playerContainerId = playerContainerId;
        this.onReadyCallback = onReadyCallback;
        this.onErrorCallback = onErrorCallback;
        this.player = null;
        this.isReady = false;
        this.apiReady = false;
        
        // S'abonner à l'événement global de l'API YouTube
        if (window.YT && window.YT.Player) {
            this.apiReady = true;
        } else {
            // Attendre que l'API soit chargée
            window.onYouTubeIframeAPIReady = () => {
                this.apiReady = true;
                if (this.playerContainerId) {
                    this.createPlayer();
                }
            };
        }
    }

    // Initialiser le player YouTube
    init() {
        console.log('🎬 Initialisation YouTubePlayer...');
        
        if (!window.YT) {
            this.loadYouTubeAPI();
        } else if (window.YT.Player) {
            this.apiReady = true;
            this.createPlayer();
        } else {
            // L'API est en cours de chargement, on attend
            console.log('⏳ API YouTube en cours de chargement...');
        }
    }

    // Charger l'API YouTube
    loadYouTubeAPI() {
        console.log('📥 Chargement de l\'API YouTube...');
        
        // Vérifier si le script est déjà en cours de chargement
        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            console.log('⚠️ API YouTube déjà en cours de chargement');
            return;
        }
        
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        
        // S'assurer qu'on a une référence au callback
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
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
        console.log('🔄 Création du player YouTube...');
        
        if (!window.YT || !window.YT.Player) {
            console.error('❌ API YouTube non disponible');
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
                    'mute': 0
                },
                events: {
                    'onReady': (event) => {
                        console.log('✅ YouTube Player prêt');
                        this.isReady = true;
                        if (this.onReadyCallback) this.onReadyCallback(event);
                    },
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': (event) => {
                        console.error('❌ Erreur YouTube Player:', event.data);
                        if (this.onErrorCallback) this.onErrorCallback(event);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erreur lors de la création du player:', error);
            if (this.onErrorCallback) this.onErrorCallback(error);
        }
    }

    onPlayerStateChange(event) {
        // Rejouer la vidéo en boucle
        if (event.data === YT.PlayerState.ENDED) {
            console.log('🔁 Vidéo terminée, relecture...');
            this.play();
        }
    }

    // Charger et jouer une vidéo
    loadVideo(videoId, startTime) {
        console.log(`🎬 Chargement vidéo: ${videoId} à ${startTime}s`);
        
        // COMME L'ANCIEN CODE : On charge sans vérifier le retour
        // YouTube gère lui-même les erreurs
        try {
            this.player.loadVideoById({
                videoId: videoId,
                startSeconds: startTime,
                suggestedQuality: 'medium'
            });
            // Pas de return, comme avant
        } catch (error) {
            console.error('❌ Erreur technique loadVideoById:', error);
            // L'erreur sera gérée par onError callback
        }
    }

    // Jouer la vidéo
    play() {
        if (this.isReady && this.player && this.player.playVideo) {
            try {
                this.player.playVideo();
            } catch (error) {
                console.error('❌ Erreur lors de la lecture:', error);
            }
        }
    }

    // Arrêter la vidéo
    stop() {
        if (this.isReady && this.player && this.player.stopVideo) {
            try {
                this.player.stopVideo();
            } catch (error) {
                console.error('❌ Erreur lors de l\'arrêt:', error);
            }
        }
    }

    // Activer/désactiver le son
    mute() {
        if (this.isReady && this.player && this.player.mute) {
            this.player.mute();
        }
    }

    unmute() {
        if (this.isReady && this.player && this.player.unMute) {
            this.player.unMute();
        }
    }

    // Vérifier si le player est prêt
    isPlayerReady() {
        // Retourne vrai si l'API YouTube existe, pas besoin d'attendre onReady
        return !!(window.YT && window.YT.Player);
    }
}
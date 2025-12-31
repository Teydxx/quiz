// scripts/YouTubePlayer.js
class YouTubePlayer {
    constructor(playerContainerId, onReadyCallback, onErrorCallback) {
        this.playerContainerId = playerContainerId;
        this.onReadyCallback = onReadyCallback;
        this.onErrorCallback = onErrorCallback;
        this.player = null;
        this.isReady = false;
        this.apiReady = false;
        this.loadAttempts = 0;
        this.MAX_LOAD_ATTEMPTS = 5;
        
        this.videoQueue = [];
        
        console.log('🎬 Initialisation YouTubePlayer');
    }

    init() {
        console.log('🎬 Initialisation YouTubePlayer...');
        
        if (!window.YT) {
            this.loadYouTubeAPI();
        } else if (window.YT.Player) {
            this.apiReady = true;
            this.createPlayer();
        } else {
            console.log('⏳ API YouTube en cours de chargement...');
            this.waitForYouTubeAPI();
        }
    }

    waitForYouTubeAPI() {
        const checkInterval = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkInterval);
                this.apiReady = true;
                this.createPlayer();
                console.log('✅ API YouTube maintenant disponible');
            }
        }, 500);
    }

    loadYouTubeAPI() {
        console.log('📦 Chargement de l\'API YouTube...');
        
        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            console.log('⚠️ API YouTube déjà en cours de chargement');
            this.waitForYouTubeAPI();
            return;
        }
        
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        
        window.onYouTubeIframeAPIReady = () => {
            console.log('✅ API YouTube chargée');
            this.apiReady = true;
            this.createPlayer();
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    createPlayer() {
        console.log('🎬 Création du player YouTube...');
        
        if (!window.YT || !window.YT.Player) {
            console.error('❌ API YouTube non disponible');
            setTimeout(() => this.createPlayer(), 1000);
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
                    'playsinline': 1
                },
                events: {
                    'onReady': (event) => {
                        console.log('✅ YouTube Player prêt');
                        this.isReady = true;
                        
                        if (this.videoQueue.length > 0) {
                            console.log(`📋 Traitement de ${this.videoQueue.length} vidéo(s) en attente`);
                            this.videoQueue.forEach(video => {
                                this.loadVideo(video.videoId, video.startTime);
                            });
                            this.videoQueue = [];
                        }
                        
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
            setTimeout(() => this.createPlayer(), 2000);
        }
    }

    onPlayerStateChange(event) {
        console.log(`🎬 État YouTube: ${event.data}`);
        
        if (event.data === YT.PlayerState.ENDED) {
            console.log('🔁 Vidéo terminée, relecture...');
            this.play();
        }
    }

    loadVideo(videoId, startTime) {
        console.log(`🎬 Chargement: ${videoId} à ${startTime}s`);
        
        if (!this.isReady || !this.player) {
            console.log('⏳ Player non prêt, mise en file d\'attente...');
            this.videoQueue.push({ videoId, startTime });
            return;
        }
        
        this.loadAttempts++;
        
        if (this.loadAttempts > this.MAX_LOAD_ATTEMPTS) {
            console.error(`❌ Trop de tentatives (${this.loadAttempts}), arrêt`);
            if (this.onErrorCallback) this.onErrorCallback('Trop de tentatives');
            return;
        }
        
        try {
            this.player.loadVideoById({
                videoId: videoId,
                startSeconds: startTime,
                suggestedQuality: 'medium'
            });
            console.log(`✅ Vidéo ${videoId} chargée à ${startTime}s`);
            this.loadAttempts = 0;
        } catch (error) {
            console.error('❌ Erreur loadVideoById:', error);
            if (this.onErrorCallback) this.onErrorCallback(error);
        }
    }

    play() {
        if (this.isReady && this.player && this.player.playVideo) {
            try {
                this.player.playVideo();
            } catch (error) {
                console.error('❌ Erreur lors de la lecture:', error);
            }
        }
    }

    stop() {
        if (this.isReady && this.player && this.player.stopVideo) {
            try {
                this.player.stopVideo();
            } catch (error) {
                console.error('❌ Erreur lors de l\'arrêt:', error);
            }
        }
    }

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

    resetLoadAttempts() {
        this.loadAttempts = 0;
        this.videoQueue = [];
        console.log('🔄 Compteur de tentatives réinitialisé');
    }
}
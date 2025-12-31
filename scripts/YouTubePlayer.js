// scripts/YouTubePlayer.js - VERSION SIMPLE
class YouTubePlayer {
    constructor(playerContainerId, onReadyCallback, onErrorCallback) {
        this.playerContainerId = playerContainerId;
        this.onReadyCallback = onReadyCallback;
        this.onErrorCallback = onErrorCallback;
        this.player = null;
        this.isReady = false;
        
        console.log('🎬 YouTubePlayer initialisé');
    }

    init() {
        console.log('🎬 Initialisation YouTubePlayer...');
        
        if (!window.YT) {
            this.loadYouTubeAPI();
        } else if (window.YT.Player) {
            this.createPlayer();
        } else {
            this.waitForYouTubeAPI();
        }
    }

    waitForYouTubeAPI() {
        const checkInterval = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkInterval);
                this.createPlayer();
            }
        }, 500);
    }

    loadYouTubeAPI() {
        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            this.waitForYouTubeAPI();
            return;
        }
        
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        
        window.onYouTubeIframeAPIReady = () => {
            this.createPlayer();
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    createPlayer() {
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
                        this.isReady = true;
                        if (this.onReadyCallback) this.onReadyCallback(event);
                    },
                    'onStateChange': (event) => {
                        // Rejouer si fini
                        if (event.data === YT.PlayerState.ENDED) {
                            this.play();
                        }
                    },
                    'onError': (event) => {
                        // SEULEMENT erreur 150
                        if (event.data === 150 && this.onErrorCallback) {
                            this.onErrorCallback(event);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur création player:', error);
        }
    }

    loadVideo(videoId, startTime) {
        if (!this.isReady || !this.player) {
            return;
        }
        
        try {
            this.player.loadVideoById({
                videoId: videoId,
                startSeconds: startTime,
                suggestedQuality: 'medium'
            });
        } catch (error) {
            console.error('Erreur loadVideo:', error);
        }
    }

    play() {
        if (this.isReady && this.player) {
            try {
                this.player.playVideo();
            } catch (error) {}
        }
    }

    stop() {
        if (this.isReady && this.player) {
            try {
                this.player.stopVideo();
            } catch (error) {}
        }
    }

    unmute() {
        if (this.isReady && this.player) {
            try {
                this.player.unMute();
            } catch (error) {}
        }
    }
}
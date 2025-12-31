// scripts/GameManager.js - AVEC DÉTECTION AUTO DES VIDÉOS DÉFAILLANTES
class GameManager {
    constructor() {
        this.currentQuestion = 0;
        this.isPlaying = false;
        this.hasUserInteracted = false;
        this.startTime = null;
        
        // SESSION SUPPORT (optionnel)
        this.sessionId = null;
        this.session = null;
        this.sessionManager = null;
        this.isSessionMode = false;
        
        // Modules - SERONT INITIALISÉS PLUS TARD
        this.youtubePlayer = null;
        this.phaseManager = null;
        this.questionManager = null;
        
        // NOUVEAU : Détection vidéos défaillantes
        this.videoLoadAttempts = 0;
        this.MAX_VIDEO_ATTEMPTS = 3;
        this.currentGame = null;
        
        console.log('🎮 GameManager créé');
    }

    init() {
        console.log('🎮 Initialisation du GameManager...');
        
        // 1. Vérifier le mode (session ou classique)
        this.detectMode();
        
        // 2. Initialiser le QuestionManager
        this.questionManager = new QuestionManager();
        
        // 3. Configurer selon le mode
        if (this.isSessionMode && this.session) {
            console.log(`🎮 Mode Session: ${this.sessionId}`);
            
            // CORRIGÉ : Vérifier si la méthode existe
            if (typeof this.questionManager.initWithGames === 'function') {
                this.questionManager.initWithGames(this.session.games);
            } else {
                // Fallback : utiliser init normal
                this.questionManager.init(this.session.settings.totalQuestions);
            }
            
            // Mettre à jour la configuration
            CONFIG.TOTAL_QUESTIONS = this.session.settings.totalQuestions;
            CONFIG.PHASE1_TIME = this.session.settings.phase1Time;
            CONFIG.PHASE2_TIME = this.session.settings.phase2Time;
            
            this.updateUIForSession();
            
            if (this.sessionManager) {
                this.sessionManager.startSession(this.sessionId);
            }
        } else {
            console.log('🎮 Mode Classique');
            this.questionManager.init(CONFIG.TOTAL_QUESTIONS);
        }
        
        // 4. Initialiser PhaseManager
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => {
            console.log('⏱️ Phase terminée, passage question suivante');
            setTimeout(() => this.nextQuestion(), 500);
        };
        
        // 5. Initialiser YouTube Player avec détection d'erreurs
        this.initYouTubePlayerWithErrorDetection();
        
        // 6. Configurer les boutons
        this.setupDeleteButton();
        
        // 7. Événements
        const startBtn = document.getElementById('start-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        // 8. Audio
        this.setupAudioInteraction();
        
        console.log('✅ GameManager initialisé');
    }
    
    // INIT YOUTUBE AVEC DÉTECTION D'ERREURS
    initYouTubePlayerWithErrorDetection() {
        this.youtubePlayer = new YouTubePlayer(
            'player-container',
            () => this.onYouTubeReady(),
            (error) => this.onYouTubeError(error)
        );
        
        // SURCHARGE : Ajouter un timeout de détection
        this.youtubePlayer.loadVideo = (videoId, startTime) => {
            console.log(`🎵 Tentative chargement: ${videoId} à ${startTime}s`);
            
            // NOUVEAU : Démarrer un timeout de détection
            this.startVideoLoadTimeout(videoId);
            
            // Appeler la méthode originale
            this.youtubePlayer.originalLoadVideo(videoId, startTime);
        };
        
        // Sauvegarder la méthode originale
        this.youtubePlayer.originalLoadVideo = this.youtubePlayer.loadVideo;
        
        this.youtubePlayer.init();
    }
    
    // TIMEOUT DE DÉTECTION VIDÉO (15 secondes max)
    startVideoLoadTimeout(videoId) {
        this.videoLoadTimeout = setTimeout(() => {
            console.log(`⏰ Timeout vidéo détecté pour: ${videoId}`);
            this.handleVideoLoadFailure(this.currentGame, 'Timeout de chargement (15s)');
        }, 15000); // 15 secondes timeout
    }
    
    clearVideoLoadTimeout() {
        if (this.videoLoadTimeout) {
            clearTimeout(this.videoLoadTimeout);
            this.videoLoadTimeout = null;
        }
    }
    
    // GESTION ERREUR VIDÉO YOUTUBE
    onYouTubeError(error) {
        console.error('❌ Erreur YouTube:', error);
        
        // Arrêter le timeout
        this.clearVideoLoadTimeout();
        
        // Gérer l'erreur
        this.handleVideoLoadFailure(this.currentGame, `Erreur YouTube: ${error}`);
        
        // Afficher message utilisateur
        this.showError('Vidéo non disponible - Passage à la suivante');
    }
    
    // NOUVEAU : GESTION D'ÉCHEC DE CHARGEMENT VIDÉO
    handleVideoLoadFailure(game, reason) {
        if (!game) return;
        
        this.videoLoadAttempts++;
        
        console.log(`⚠️ Échec vidéo #${this.videoLoadAttempts}: ${game.name}`);
        console.log(`📋 Raison: ${reason}`);
        console.log(`🎬 ID YouTube: ${game.videoId}`);
        
        if (this.videoLoadAttempts >= this.MAX_VIDEO_ATTEMPTS) {
            // VIDÉO DÉFAILLANTE - AJOUTER À LA LISTE
            this.markVideoAsFailed(game, reason);
            
            // Réinitialiser compteur
            this.videoLoadAttempts = 0;
            
            // Passer à la question suivante
            setTimeout(() => this.nextQuestion(), 2000);
        } else {
            // Réessayer avec une nouvelle position
            console.log(`🔄 Réessai #${this.videoLoadAttempts + 1}...`);
            setTimeout(() => this.retryVideoLoad(game), 2000);
        }
    }
    
    // NOUVEAU : RÉESSAYER LE CHARGEMENT
    retryVideoLoad(game) {
        if (!game || !this.youtubePlayer) return;
        
        const newStartTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🔄 Réessai: ${game.name} à ${newStartTime}s`);
        
        this.youtubePlayer.loadVideo(game.videoId, newStartTime);
    }
    
    // NOUVEAU : MARQUER VIDÉO COMME DÉFAILLANTE
    markVideoAsFailed(game, reason) {
        console.log(`🚫 Marquage comme défaillante: ${game.name}`);
        
        const failedVideoData = {
            name: game.name,
            videoId: game.videoId,
            date: new Date().toLocaleString(),
            reason: reason,
            attempts: this.videoLoadAttempts,
            lastTry: new Date().toISOString()
        };
        
        // 1. AJOUTER AUX VIDÉOS SUPPRIMÉES (pour vérification manuelle)
        if (window.DeletedGamesStorage) {
            console.log(`📝 Ajout à DeletedGamesStorage: ${game.name}`);
            DeletedGamesStorage.add(failedVideoData);
        } else {
            console.warn('⚠️ DeletedGamesStorage non disponible');
        }
        
        // 2. AJOUTER AU STOCKAGE LOCAL (sauvegarde)
        this.saveToFailedVideosStorage(failedVideoData);
        
        // 3. RETIRER DU QUIZ (selon mode)
        this.removeGameFromQuiz(game);
        
        // 4. NOTIFICATION
        this.showFailedVideoNotification(game);
    }
    
    // NOUVEAU : SAUVEGARDER DANS UN STOCKAGE DÉDIÉ
    saveToFailedVideosStorage(videoData) {
        try {
            // Récupérer la liste existante
            const failedVideos = JSON.parse(localStorage.getItem('failedVideos') || '[]');
            
            // Vérifier si déjà présente
            const alreadyExists = failedVideos.some(v => 
                v.name === videoData.name && v.videoId === videoData.videoId
            );
            
            if (!alreadyExists) {
                failedVideos.push(videoData);
                localStorage.setItem('failedVideos', JSON.stringify(failedVideos));
                console.log(`💾 Sauvegardé dans failedVideos: ${videoData.name}`);
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde failedVideos:', error);
        }
    }
    
    // NOUVEAU : RETIRER LE JEU DU QUIZ
    removeGameFromQuiz(game) {
        if (this.isSessionMode && this.session) {
            // Mode Session: retirer de la session
            const gameIndex = this.session.games.findIndex(g => 
                g.name === game.name && g.videoId === game.videoId
            );
            
            if (gameIndex !== -1) {
                this.session.games.splice(gameIndex, 1);
                if (this.sessionManager && this.sessionManager.saveSessions) {
                    this.sessionManager.saveSessions();
                }
                console.log(`✅ ${game.name} retiré de la session`);
            }
        } else {
            // Mode Classique: retirer de GAMES
            const gameIndex = GAMES.findIndex(g => 
                g.name === game.name && g.videoId === game.videoId
            );
            
            if (gameIndex !== -1) {
                GAMES.splice(gameIndex, 1);
                console.log(`✅ ${game.name} retiré de GAMES`);
            }
        }
    }
    
    // NOUVEAU : NOTIFICATION VIDÉO DÉFAILLANTE
    showFailedVideoNotification(game) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = 'video-failed-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 71, 87, 0.9);
                color: white;
                padding: 15px;
                border-radius: 10px;
                z-index: 9999;
                max-width: 400px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            ">
                <strong>⚠️ Vidéo défaillante détectée</strong>
                <p style="margin: 8px 0; font-size: 14px;">
                    "${game.name}"<br>
                    <small>ID: ${game.videoId}</small>
                </p>
                <p style="font-size: 12px; opacity: 0.9;">
                    Ajoutée à la liste des vidéos supprimées
                </p>
                <button onclick="this.parentElement.remove()" 
                        style="
                            background: white;
                            color: #ff4757;
                            border: none;
                            padding: 5px 10px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 8px;
                            font-size: 12px;
                        ">
                    Fermer
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 8 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }
    
    // CHARGEMENT VIDÉO AVEC SURVEILLANCE
    async loadAndStartVideo() {
        this.currentGame = this.questionManager.getCurrentGame();
        if (!this.currentGame) return;
        
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🎵 Chargement: ${this.currentGame.name} à ${this.startTime}s`);
        
        // Réinitialiser compteur d'essais pour cette vidéo
        this.videoLoadAttempts = 0;
        
        // ATTENDRE que YouTube soit prêt
        if (!this.youtubePlayer.isReady) {
            console.log('⏳ En attente du player YouTube...');
            await this.waitForYouTubeReady();
        }
        
        // Charger la vidéo (avec timeout de détection)
        this.youtubePlayer.loadVideo(this.currentGame.videoId, this.startTime);
        this.youtubePlayer.unmute();
    }
    
    // QUESTION SUIVANTE (avec nettoyage)
    nextQuestion() {
        console.log('⏭️ Question suivante');
        
        // Arrêter le timeout de détection
        this.clearVideoLoadTimeout();
        
        // Réinitialiser compteur vidéo
        this.videoLoadAttempts = 0;
        this.currentGame = null;
        
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
        
        if (this.youtubePlayer.resetLoadAttempts) {
            this.youtubePlayer.resetLoadAttempts();
        }
        
        this.youtubePlayer.stop();
        this.phaseManager.reset();
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
        
        setTimeout(() => this.startQuestion(), 1000);
    }
    
    // AUTRES MÉTHODES (inchangées sauf petits ajustements)
    
    detectMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.sessionId = urlParams.get('session');
        
        if (this.sessionId) {
            this.isSessionMode = true;
            this.sessionManager = new SessionManager();
            this.session = this.sessionManager.getSession(this.sessionId);
            
            if (!this.session) {
                console.error('❌ Session non trouvée, basculement en mode classique');
                this.isSessionMode = false;
                this.sessionId = null;
            }
        } else {
            this.isSessionMode = false;
        }
    }
    
    setupDeleteButton() {
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteCurrentVideo();
            });
            deleteBtn.style.display = 'none';
        }
    }

    deleteCurrentVideo() {
        if (!confirm('Supprimer cette vidéo du quiz et passer à la suivante ?')) return;
        
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        console.log(`🗑️ Suppression manuelle: ${currentGame.name}`);
        
        // Ajouter aux vidéos défaillantes aussi
        this.markVideoAsFailed(currentGame, 'Suppression manuelle');
        
        this.nextQuestion();
    }

    startGame() {
        console.log('🚀 Démarrage du jeu');
        
        const homeScreen = document.getElementById('home-screen');
        const quizScreen = document.getElementById('quiz-screen');
        
        if (homeScreen && quizScreen) {
            homeScreen.classList.remove('active');
            homeScreen.classList.add('hidden');
            quizScreen.classList.remove('hidden');
            quizScreen.classList.add('active');
        }
        
        setTimeout(() => this.startQuestion(), 100);
    }

    // ... [les autres méthodes restent similaires] ...

    waitForYouTubeReady() {
        return new Promise((resolve) => {
            if (this.youtubePlayer.isReady) {
                resolve();
                return;
            }
            
            const checkInterval = setInterval(() => {
                if (this.youtubePlayer.isReady) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    showError(message) {
        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.innerHTML = `⚠️ ${message}`;
            resultEl.className = 'result active incorrect';
        }
    }
}

window.GameManager = GameManager;
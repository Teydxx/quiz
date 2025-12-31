// scripts/GameManager.js - VERSION COMPLÈTE CORRIGÉE
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
        this.questionManager = null;  // CORRIGÉ : pas d'instanciation ici
        
        // NOUVEAU : Détection vidéos défaillantes
        this.videoLoadAttempts = 0;
        this.MAX_VIDEO_ATTEMPTS = 2;
        this.currentGame = null;
        this.videoLoadTimeout = null;
        
        console.log('🎮 GameManager créé');
    }

    // Initialiser le jeu
    init() {
        console.log('🎮 Initialisation du GameManager...');
        
        // 1. Vérifier le mode (session ou classique)
        this.detectMode();
        
        // 2. Initialiser le QuestionManager (CORRIGÉ : juste référence)
        this.questionManager = new QuestionManager();
        
        // 3. Configurer selon le mode
        if (this.isSessionMode && this.session) {
            // Mode Session
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
            
            // CORRIGÉ : Mettre à jour l'interface (fonction manquante ajoutée)
            this.updateUIForSession();
            
            // Démarrer la session
            if (this.sessionManager && typeof this.sessionManager.startSession === 'function') {
                this.sessionManager.startSession(this.sessionId);
            }
        } else {
            // Mode Classique
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
        
        console.log('✅ GameManager initialisé en mode:', this.isSessionMode ? 'Session' : 'Classique');
    }
    
    // CORRIGÉ : Fonction manquante ajoutée
    updateUIForSession() {
        if (!this.isSessionMode || !this.session) return;
        
        // Mettre à jour le nombre total de questions
        const totalQuestionsEl = document.getElementById('total-questions');
        if (totalQuestionsEl && this.session.settings) {
            totalQuestionsEl.textContent = this.session.settings.totalQuestions;
        }
        
        // Ajouter le code de session au titre
        const titleEl = document.querySelector('.title');
        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-gamepad"></i> QUIZ - ${this.sessionId}`;
        }
        
        // Afficher les joueurs (mode session multi)
        this.displayPlayers();
    }
    
    // Afficher les joueurs (mode session multi)
    displayPlayers() {
        if (!this.isSessionMode || !this.session || !this.session.players || this.session.players.length <= 1) return;
        
        const statsContainer = document.querySelector('.stats');
        if (statsContainer) {
            const playersEl = document.createElement('div');
            playersEl.className = 'stat';
            playersEl.innerHTML = `
                <i class="fas fa-users"></i>
                Joueurs: ${this.session.players.length}
            `;
            statsContainer.insertBefore(playersEl, statsContainer.firstChild);
        }
    }
    
    // Détecter le mode de jeu
    detectMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.sessionId = urlParams.get('session');
        
        if (this.sessionId) {
            // Mode Session
            this.isSessionMode = true;
            this.sessionManager = new SessionManager();
            this.session = this.sessionManager.getSession(this.sessionId);
            
            if (!this.session) {
                console.error('❌ Session non trouvée, basculement en mode classique');
                this.isSessionMode = false;
                this.sessionId = null;
            }
        } else {
            // Mode Classique
            this.isSessionMode = false;
        }
    }
    
    // INIT YOUTUBE AVEC DÉTECTION D'ERREURS
    initYouTubePlayerWithErrorDetection() {
        this.youtubePlayer = new YouTubePlayer(
            'player-container',
            () => this.onYouTubeReady(),
            (error) => this.onYouTubeError(error)
        );
        
        // SURCHARGE : Ajouter un timeout de détection
        const originalLoadVideo = this.youtubePlayer.loadVideo;
        this.youtubePlayer.loadVideo = (videoId, startTime) => {
            console.log(`🎵 Tentative chargement: ${videoId} à ${startTime}s`);
            
            // NOUVEAU : Démarrer un timeout de détection
            this.startVideoLoadTimeout(videoId);
            
            // Appeler la méthode originale
            originalLoadVideo.call(this.youtubePlayer, videoId, startTime);
        };
        
        this.youtubePlayer.init();
    }
    
    // TIMEOUT DE DÉTECTION VIDÉO (10 secondes max)
    startVideoLoadTimeout(videoId) {
        this.clearVideoLoadTimeout();
        this.videoLoadTimeout = setTimeout(() => {
            console.log(`⏰ Timeout vidéo détecté pour: ${videoId}`);
            if (this.currentGame) {
                this.handleVideoLoadFailure(this.currentGame, 'Timeout de chargement (10s)');
            }
        }, 10000); // 10 secondes timeout
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
        if (this.currentGame) {
            this.handleVideoLoadFailure(this.currentGame, `Erreur YouTube: ${error}`);
        }
        
        // Afficher message utilisateur
        this.showError('Vidéo non disponible - Passage à la suivante');
    }
    
    onYouTubeReady() {
        console.log('✅ YouTube Player prêt');
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
            setTimeout(() => this.retryVideoLoad(game), 1000);
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
        
        // 1. AJOUTER AUX VIDÉOS DÉFAILLANTES (si la fonction existe)
        if (window.markVideoAsFailed) {
            window.markVideoAsFailed(game, reason);
        }
        
        // 2. AJOUTER AU STOCKAGE LOCAL (sauvegarde)
        this.saveToFailedVideosStorage(failedVideoData);
        
        // 3. NOTIFICATION
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
                    Ajoutée à la liste des vidéos défaillantes
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
    
    // Configurer le bouton de suppression
    setupDeleteButton() {
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteCurrentVideo();
            });
            deleteBtn.style.display = 'none';
            console.log('✅ Bouton suppression configuré');
        }
    }

    // Supprimer la vidéo courante
    deleteCurrentVideo() {
        if (!confirm('Supprimer cette vidéo du quiz et passer à la suivante ?')) return;
        
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        console.log(`🗑️ Suppression manuelle: ${currentGame.name}`);
        
        // 1. Ajouter aux vidéos supprimées
        if (window.DeletedGamesStorage && typeof window.DeletedGamesStorage.add === 'function') {
            DeletedGamesStorage.add(currentGame);
        }
        
        // 2. Retirer selon le mode
        if (this.isSessionMode && this.session) {
            // Mode Session: retirer de la session
            const gameIndex = this.session.games.findIndex(g => 
                g.name === currentGame.name && g.videoId === currentGame.videoId
            );
            
            if (gameIndex !== -1) {
                this.session.games.splice(gameIndex, 1);
                if (this.sessionManager && typeof this.sessionManager.saveSessions === 'function') {
                    this.sessionManager.saveSessions();
                }
                console.log(`✅ ${currentGame.name} retiré de la session`);
            }
        } else {
            // Mode Classique: retirer de GAMES
            const gameIndex = GAMES.findIndex(g => 
                g.name === currentGame.name && g.videoId === currentGame.videoId
            );
            
            if (gameIndex !== -1) {
                GAMES.splice(gameIndex, 1);
                console.log(`✅ ${currentGame.name} retiré des jeux`);
            }
        }
        
        // 3. Ajouter aux supprimés définitifs
        if (window.addToPermanentlyDeleted && typeof window.addToPermanentlyDeleted === 'function') {
            window.addToPermanentlyDeleted(currentGame);
        }
        
        // 4. Passer à la suivante
        this.nextQuestion();
    }

    // Démarrer le jeu
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

    // Démarrer une question
    async startQuestion() {
        const maxQuestions = this.isSessionMode && this.session ? 
            this.session.settings.totalQuestions : CONFIG.TOTAL_QUESTIONS;
        
        if (this.currentQuestion >= maxQuestions || 
            !this.questionManager.hasMoreQuestions()) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.isPlaying = true;
        
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'flex';
        }
        
        const questionReady = this.questionManager.prepareQuestion(this.currentQuestion);
        if (!questionReady) {
            this.endGame();
            return;
        }
        
        // ATTENDRE le chargement de la vidéo avant de continuer
        await this.loadAndStartVideo();
        
        // Démarrer la phase SEULEMENT quand la vidéo est chargée
        this.phaseManager.startPhase(1);
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
    
    // Attendre que YouTube soit prêt
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

    // Terminer le jeu
    endGame() {
        console.log('🏁 Fin du jeu');
        
        // Calculer résultats
        const results = {
            total: this.currentQuestion,
            correct: this.questionManager.getCorrectCount(),
            percentage: Math.round((this.questionManager.getCorrectCount() / this.currentQuestion) * 100)
        };
        
        // Sauvegarder si mode session
        if (this.isSessionMode && this.sessionManager && this.sessionId) {
            if (typeof this.sessionManager.completeSession === 'function') {
                this.sessionManager.completeSession(this.sessionId, results);
            }
        }
        
        // Arrêter tout
        this.youtubePlayer.stop();
        this.phaseManager.clearTimers();
        
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
        
        const answersSection = document.querySelector('.answers-section');
        const videoSection = document.querySelector('.video-section');
        const nextBtn = document.getElementById('next-btn');
        
        if (answersSection) answersSection.style.display = 'none';
        if (videoSection) videoSection.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        
        // Écran de fin
        this.showEndScreen(results);
    }
    
    // Afficher l'écran de fin
    showEndScreen(results) {
        const resultContainer = document.querySelector('.result-container') || document.createElement('div');
        if (!resultContainer.classList) {
            resultContainer.className = 'result-container';
            document.querySelector('.quiz-content').appendChild(resultContainer);
        }
        
        let buttonsHtml = '';
        
        if (this.isSessionMode) {
            buttonsHtml = `
                <button onclick="location.href='lobby.html'" class="btn-next" style="background: #3742fa;">
                    <i class="fas fa-home"></i> Retour au Lobby
                </button>
                <button onclick="location.href='index.html'" class="btn-next">
                    <i class="fas fa-redo"></i> Nouvelle partie
                </button>
            `;
        } else {
            buttonsHtml = `
                <button onclick="location.href='index.html'" class="btn-next">
                    <i class="fas fa-redo"></i> REJOUER
                </button>
                <button onclick="location.href='lobby.html'" class="btn-next" style="background: #3742fa;">
                    <i class="fas fa-users"></i> Essayer le Mode Lobby
                </button>
            `;
        }
        
        resultContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🏆</div>
                <h1 style="font-size: 2.5rem; margin-bottom: 20px;">QUIZ TERMINÉ !</h1>
                <div style="font-size: 1.8rem; margin-bottom: 30px;">
                    Score: <span style="color: #2ed573; font-weight: bold;">${results.correct}/${results.total}</span>
                </div>
                <div style="font-size: 1.5rem; margin-bottom: 40px;">
                    Pourcentage: <span style="color: #3742fa; font-weight: bold;">${results.percentage}%</span>
                </div>
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    ${buttonsHtml}
                </div>
                ${this.isSessionMode ? `
                    <p style="margin-top: 30px; color: #a4b0be; font-size: 0.9rem;">
                        Code session: <strong>${this.sessionId}</strong>
                    </p>
                ` : ''}
            </div>
        `;
        resultContainer.className = 'result-container active';
    }

    // Configurer l'interaction audio
    setupAudioInteraction() {
        let audioContext = null;
        const unlockAudio = () => {
            if (this.hasUserInteracted) return;
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const buffer = audioContext.createBuffer(1, 1, 22050);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                this.hasUserInteracted = true;
                console.log('🔊 Audio débloqué');
            } catch (error) {
                console.warn('⚠️ Audio non débloqué:', error);
            }
        };
        document.addEventListener('click', unlockAudio, { once: true });
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', unlockAudio, { once: true });
        }
    }

    showError(message) {
        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.innerHTML = `⚠️ ${message}`;
            resultEl.className = 'result active incorrect';
        }
    }

    getGameState() {
        return {
            sessionId: this.sessionId,
            currentQuestion: this.currentQuestion,
            isPlaying: this.isPlaying,
            totalQuestions: this.isSessionMode && this.session ? 
                this.session.settings.totalQuestions : CONFIG.TOTAL_QUESTIONS,
            mode: this.isSessionMode ? 'session' : 'classic'
        };
    }
}

// Exposer pour debug
window.GameManager = GameManager;
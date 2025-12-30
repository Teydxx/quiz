// scripts/GameManager.js - VERSION UNIFIÉE (Classique + Session)
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
        
        // Modules
        this.youtubePlayer = null;
        this.phaseManager = null;
        this.questionManager = null;
        
        // Éléments DOM
        this.homeScreen = document.getElementById('home-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.deleteBtn = document.getElementById('delete-video-btn');
    }

    // Initialiser le jeu (détecte automatiquement le mode)
    init() {
        console.log('🎮 Initialisation du GameManager...');
        
        // 1. Vérifier le mode (session ou classique)
        this.detectMode();
        
        // 2. Initialiser le QuestionManager selon le mode
        this.questionManager = new QuestionManager();
        
        if (this.isSessionMode && this.session) {
            // Mode Session
            console.log(`🎮 Mode Session: ${this.sessionId}`);
            this.questionManager.initWithGames(this.session.games);
            
            // Mettre à jour la configuration
            CONFIG.TOTAL_QUESTIONS = this.session.settings.totalQuestions;
            CONFIG.PHASE1_TIME = this.session.settings.phase1Time;
            CONFIG.PHASE2_TIME = this.session.settings.phase2Time;
            
            // Mettre à jour l'interface
            this.updateUIForSession();
            
            // Démarrer la session
            this.sessionManager.startSession(this.sessionId);
        } else {
            // Mode Classique
            console.log('🎮 Mode Classique');
            this.questionManager.init(CONFIG.TOTAL_QUESTIONS);
        }
        
        // 3. Initialiser les autres modules
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => {
            console.log('📝 Phase terminée, passage question suivante');
            setTimeout(() => this.nextQuestion(), 500);
        };
        
        // 4. Initialiser YouTube
        this.initYouTubePlayer();
        
        // 5. Configurer les boutons
        this.setupDeleteButton();
        
        // 6. Événements
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startGame());
        }
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // 7. Audio
        this.setupAudioInteraction();
        
        console.log('✅ GameManager initialisé en mode:', this.isSessionMode ? 'Session' : 'Classique');
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
    
    // Mettre à jour l'UI pour le mode session
    updateUIForSession() {
        if (!this.isSessionMode || !this.session) return;
        
        // Mettre à jour le nombre total de questions
        const totalQuestionsEl = document.getElementById('total-questions');
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = this.session.settings.totalQuestions;
        }
        
        // Ajouter le code de session au titre
        const titleEl = document.querySelector('.title');
        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-gamepad"></i> QUIZ - ${this.sessionId}`;
        }
        
        // Afficher les joueurs
        this.displayPlayers();
    }
    
    // Afficher les joueurs (mode session multi)
    displayPlayers() {
        if (!this.isSessionMode || !this.session || this.session.players.length <= 1) return;
        
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
    
    // [TOUT LE RESTE DU CODE RESTE IDENTIQUE À TON ANCIEN GameManager.js]
    // Je copie ici TOUTES tes méthodes existantes, en ajoutant seulement
    // les vérifications this.isSessionMode où nécessaire
    
    // Configurer le bouton de suppression
    setupDeleteButton() {
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => {
                this.deleteCurrentVideo();
            });
            this.deleteBtn.style.display = 'none';
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
        DeletedGamesStorage.add(currentGame);
        
        // 2. Retirer selon le mode
        if (this.isSessionMode && this.session) {
            // Mode Session: retirer de la session
            const gameIndex = this.session.games.findIndex(g => 
                g.name === currentGame.name && g.videoId === currentGame.videoId
            );
            
            if (gameIndex !== -1) {
                this.session.games.splice(gameIndex, 1);
                this.sessionManager.saveSessions();
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
        if (window.addToPermanentlyDeleted) {
            window.addToPermanentlyDeleted(currentGame);
        }
        
        // 4. Passer à la suivante
        this.nextQuestion();
    }

    // Initialiser YouTube (identique)
    initYouTubePlayer() {
        this.youtubePlayer = new YouTubePlayer(
            'player-container',
            () => this.onYouTubeReady(),
            (error) => this.onYouTubeError(error)
        );
        
        this.youtubePlayer.init();
    }

    // Démarrer le jeu
    startGame() {
        console.log('🚀 Démarrage du jeu');
        
        if (this.homeScreen && this.quizScreen) {
            this.homeScreen.classList.remove('active');
            this.homeScreen.classList.add('hidden');
            this.quizScreen.classList.remove('hidden');
            this.quizScreen.classList.add('active');
        }
        
        setTimeout(() => this.startQuestion(), 100);
    }

    // Démarrer une question
    startQuestion() {
        const maxQuestions = this.isSessionMode && this.session ? 
            this.session.settings.totalQuestions : CONFIG.TOTAL_QUESTIONS;
        
        if (this.currentQuestion >= maxQuestions || 
            !this.questionManager.hasMoreQuestions()) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.isPlaying = true;
        
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'flex';
        }
        
        const questionReady = this.questionManager.prepareQuestion(this.currentQuestion);
        if (!questionReady) {
            this.endGame();
            return;
        }
        
        this.loadAndStartVideo();
        this.phaseManager.startPhase(1);
    }

    // Charger vidéo
    loadAndStartVideo() {
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🎵 Chargement: ${currentGame.name} à ${this.startTime}s`);
        
        this.youtubePlayer.loadVideo(currentGame.videoId, this.startTime);
        this.youtubePlayer.unmute();
    }

    // Question suivante
    nextQuestion() {
        console.log('➡️ Question suivante');
        
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'none';
        }
        
        if (this.youtubePlayer.resetLoadAttempts) {
            this.youtubePlayer.resetLoadAttempts();
        }
        
        this.youtubePlayer.stop();
        this.phaseManager.reset();
        this.nextBtn.style.display = 'none';
        
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
            this.sessionManager.completeSession(this.sessionId, results);
        }
        
        // Arrêter tout
        this.youtubePlayer.stop();
        this.phaseManager.clearTimers();
        
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'none';
        }
        
        const answersSection = document.querySelector('.answers-section');
        const videoSection = document.querySelector('.video-section');
        if (answersSection) answersSection.style.display = 'none';
        if (videoSection) videoSection.style.display = 'none';
        this.nextBtn.style.display = 'none';
        
        // Écran de fin
        this.showEndScreen(results);
    }
    
    // Afficher l'écran de fin
    showEndScreen(results) {
        const resultEl = document.querySelector('.result');
        if (!resultEl) return;
        
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
        
        resultEl.innerHTML = `
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
        resultEl.className = 'result active correct';
    }

    // Autres méthodes (identiques à ton code)
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
        if (this.startBtn) {
            this.startBtn.addEventListener('click', unlockAudio, { once: true });
        }
    }

    onYouTubeReady() {
        console.log('✅ YouTube Player prêt');
    }

    onYouTubeError(error) {
        console.error('❌ Erreur YouTube:', error);
        this.showError('Erreur vidéo - Passage à la question suivante');
        setTimeout(() => this.nextQuestion(), 2000);
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
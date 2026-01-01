// scripts/GameManager.js - VERSION AVEC MODE INFINI
class GameManager {
    constructor() {
        this.currentQuestion = 0;
        this.isPlaying = false;
        this.hasUserInteracted = false;
        this.startTime = null;
        
        // MODE INFINI
        this.isInfiniteMode = false;
        
        // SESSION SUPPORT (optionnel)
        this.sessionId = null;
        this.session = null;
        this.sessionManager = null;
        this.isSessionMode = false;
        
        // Modules
        this.youtubePlayer = null;
        this.phaseManager = null;
        this.questionManager = null;
        
        console.log('🎮 GameManager créé');
    }

    // Initialiser le jeu
    init() {
        console.log('🎮 Initialisation du GameManager...');
        
        // 1. Vérifier le mode (session, infini, ou classique)
        this.detectMode();
        
        // 2. Initialiser le QuestionManager
        this.questionManager = new QuestionManager();
        
        // 3. Configurer selon le mode
        if (this.isSessionMode && this.session) {
            // Mode Session
            console.log(`🎮 Mode Session: ${this.sessionId}`);
            
            if (typeof this.questionManager.initWithGames === 'function') {
                this.questionManager.initWithGames(this.session.games);
            } else {
                this.questionManager.init(this.session.settings.totalQuestions);
            }
            
            // Mettre à jour la configuration
            CONFIG.TOTAL_QUESTIONS = this.session.settings.totalQuestions;
            CONFIG.PHASE1_TIME = this.session.settings.phase1Time;
            CONFIG.PHASE2_TIME = this.session.settings.phase2Time;
            
            // Mettre à jour l'interface
            const totalQuestionsEl = document.getElementById('total-questions');
            if (totalQuestionsEl) {
                totalQuestionsEl.textContent = this.session.settings.totalQuestions;
            }
            
            const titleEl = document.querySelector('.title');
            if (titleEl) {
                titleEl.innerHTML = `<i class="fas fa-gamepad"></i> QUIZ - ${this.sessionId}`;
            }
            
            // Démarrer la session
            if (this.sessionManager && this.sessionManager.startSession) {
                this.sessionManager.startSession(this.sessionId);
            }
            
        } else if (this.isInfiniteMode) {
            // MODE INFINI
            console.log('∞ Mode Infini activé');
            
            // Initialiser avec un grand nombre (999 = pratique pour l'infini)
            this.questionManager.init(999);
            
            // Mettre à jour l'affichage
            const totalQuestionsEl = document.getElementById('total-questions');
            if (totalQuestionsEl) {
                totalQuestionsEl.textContent = '∞';
            }
            
            const titleEl = document.querySelector('.title');
            if (titleEl) {
                titleEl.innerHTML = `<i class="fas fa-infinity"></i> QUIZ INFINI`;
            }
            
            // Cacher le bouton de suppression en mode infini
            const deleteBtn = document.getElementById('delete-video-btn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            
        } else {
            // Mode Classique (désactivé maintenant, gardé pour compatibilité)
            console.log('🎮 Mode Classique (10 questions)');
            this.questionManager.init(CONFIG.TOTAL_QUESTIONS);
        }
        
        // 4. Initialiser PhaseManager
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => {
            console.log('⏱️ Phase terminée, passage question suivante');
            setTimeout(() => this.nextQuestion(), 500);
        };
        
        // 5. Initialiser YouTube Player
        this.initYouTubePlayer();
        
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
    
    // Détecter le mode de jeu
    detectMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.sessionId = urlParams.get('session');
        const modeParam = urlParams.get('mode');
        
        if (this.sessionId) {
            // Mode Session
            this.isSessionMode = true;
            this.isInfiniteMode = false;
            this.sessionManager = new SessionManager();
            this.session = this.sessionManager.getSession(this.sessionId);
            
            if (!this.session) {
                console.error('❌ Session non trouvée');
                this.isSessionMode = false;
                this.sessionId = null;
            }
        } else if (modeParam === 'infinite') {
            // MODE INFINI
            this.isInfiniteMode = true;
            this.isSessionMode = false;
            console.log('∞ Mode Infini détecté');
        } else {
            // Mode Classique (désactivé)
            this.isSessionMode = false;
            this.isInfiniteMode = false;
        }
    }
    
    // Configurer le bouton de suppression
    setupDeleteButton() {
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteCurrentVideo();
            });
            deleteBtn.style.display = 'none';
        }
    }

    // Supprimer la vidéo courante
    deleteCurrentVideo() {
        if (!confirm('Supprimer cette vidéo du quiz et passer à la suivante ?')) return;
        
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        console.log(`🗑️ Suppression manuelle: ${currentGame.name}`);
        
        // Ajouter aux vidéos supprimées
        if (window.DeletedGamesStorage && DeletedGamesStorage.add) {
            DeletedGamesStorage.add(currentGame);
        }
        
        // Passer à la suivante
        this.nextQuestion();
    }

    // Initialiser YouTube
    initYouTubePlayer() {
        this.youtubePlayer = new YouTubePlayer(
            'player-container',
            () => this.onYouTubeReady(),
            (error) => this.onYouTubeError(error)
        );
        
        this.youtubePlayer.init();
    }

    onYouTubeError(error) {
        console.log('❌ Erreur YouTube 150 détectée');
        
        const currentGame = this.questionManager?.getCurrentGame();
        if (!currentGame) return;
        
        // Ajouter automatiquement aux supprimés
        if (window.DeletedGamesStorage && DeletedGamesStorage.add) {
            DeletedGamesStorage.add({
                name: currentGame.name,
                videoId: currentGame.videoId,
                reason: 'Erreur YouTube 150 (auto)'
            });
            console.log(`✅ "${currentGame.name}" ajouté aux supprimés`);
        }
        
        // Passer à la question suivante
        this.youtubePlayer.stop();
        
        setTimeout(() => {
            console.log('⏭️ Passage vidéo suivante');
            this.startQuestion();
        }, 1000);
    }

    onYouTubeReady() {
        console.log('✅ YouTube Player prêt');
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
        // MODE INFINI : pas de limite de questions
        if (!this.isInfiniteMode) {
            // Vérifier limite pour mode session ou classique
            const maxQuestions = this.isSessionMode && this.session ? 
                this.session.settings.totalQuestions : CONFIG.TOTAL_QUESTIONS;
            
            if (this.currentQuestion >= maxQuestions || 
                !this.questionManager.hasMoreQuestions()) {
                this.endGame();
                return;
            }
        }
        
        this.currentQuestion++;
        this.isPlaying = true;
        
        // Afficher le numéro de question
        const countEl = document.getElementById('question-count');
        if (countEl) {
            if (this.isInfiniteMode) {
                countEl.textContent = this.currentQuestion;
            } else {
                countEl.textContent = this.currentQuestion;
            }
        }
        
        const deleteBtn = document.getElementById('delete-video-btn');
        if (deleteBtn && !this.isInfiniteMode) {
            deleteBtn.style.display = 'flex';
        }
        
        const questionReady = this.questionManager.prepareQuestion(this.currentQuestion);
        if (!questionReady) {
            this.endGame();
            return;
        }
        
        // Charger la vidéo
        await this.loadAndStartVideo();
        
        // Démarrer la phase
        this.phaseManager.startPhase(1);
    }

    // Charger vidéo
    async loadAndStartVideo() {
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🎵 Chargement: ${currentGame.name} à ${this.startTime}s`);
        
        // Attendre que YouTube soit prêt
        if (!this.youtubePlayer.isReady) {
            console.log('⏳ En attente du player YouTube...');
            await this.waitForYouTubeReady();
        }
        
        // Charger la vidéo
        this.youtubePlayer.loadVideo(currentGame.videoId, this.startTime);
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

    nextQuestion() {
        console.log('⏭️ Question suivante');
        
        // Arrêter la vidéo
        if (this.youtubePlayer) {
            this.youtubePlayer.stop();
        }
        
        // Reset PhaseManager
        if (this.phaseManager) {
            this.phaseManager.reset();
        }
        
        // Cacher bouton suivant
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.style.display = 'none';
        
        // Nettoyer l'affichage
        const answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) answerDisplay.remove();
        
        // Démarrer nouvelle question
        setTimeout(() => {
            this.startQuestion();
        }, 500);
    }

    // Terminer le jeu
    endGame() {
        // MODE INFINI : ne jamais terminer automatiquement
        if (this.isInfiniteMode) {
            console.log('∞ Mode Infini - Continuer indéfiniment');
            // Réinitialiser juste l'affichage du compteur si trop grand
            if (this.currentQuestion > 999) {
                this.currentQuestion = 0;
            }
            return;
        }
        
        console.log('🏁 Fin du jeu');
        
        // Calculer résultats
        const results = {
            total: this.currentQuestion,
            correct: this.questionManager.getCorrectCount(),
            percentage: Math.round((this.questionManager.getCorrectCount() / this.currentQuestion) * 100)
        };
        
        // Sauvegarder si mode session
        if (this.isSessionMode && this.sessionManager && this.sessionId) {
            if (this.sessionManager.completeSession) {
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
        const resultEl = document.querySelector('.result');
        if (!resultEl) {
            // Créer un élément si nécessaire
            const resultContainer = document.createElement('div');
            resultContainer.className = 'result';
            document.querySelector('.quiz-content').appendChild(resultContainer);
            resultEl = resultContainer;
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
            isInfiniteMode: this.isInfiniteMode,
            isSessionMode: this.isSessionMode,
            totalQuestions: this.isInfiniteMode ? '∞' : 
                          (this.isSessionMode && this.session ? 
                           this.session.settings.totalQuestions : CONFIG.TOTAL_QUESTIONS),
            mode: this.isInfiniteMode ? 'infinite' : 
                  (this.isSessionMode ? 'session' : 'classic')
        };
    }

    // Nettoyer l'affichage
    cleanAnswerDisplay() {
        console.log('🧹 Nettoyage de l\'affichage des réponses');
        
        const answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) {
            answerDisplay.remove();
        }
        
        const grid = document.getElementById('answers-grid');
        if (grid) {
            grid.innerHTML = '';
        }
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
            nextBtn.classList.remove('show');
        }
    }
}

// Exposer pour debug
window.GameManager = GameManager;
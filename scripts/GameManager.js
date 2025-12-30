// scripts/GameManager.js - VERSION AVEC SESSION SUPPORT
class GameManager {
    constructor() {
        this.currentQuestion = 0;
        this.isPlaying = false;
        this.hasUserInteracted = false;
        this.startTime = null;
        
        // SESSION SUPPORT
        this.sessionId = null;
        this.session = null;
        this.sessionManager = null;
        
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

    // Initialiser le jeu avec session
    init() {
        console.log('ðŸŽ® Initialisation du jeu avec session...');
        
        // 1. Vérifier si on a une session
        this.checkSession();
        
        if (!this.session) {
            console.error('âŒ Pas de session valide, redirection vers lobby');
            setTimeout(() => {
                window.location.href = 'lobby.html';
            }, 2000);
            return;
        }
        
        // 2. Initialiser les modules avec les jeux de la session
        this.questionManager = new QuestionManager();
        this.questionManager.initWithGames(this.session.games);
        
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => {
            console.log('ðŸ”„ Phase terminÃ©e, passage question suivante');
            setTimeout(() => this.nextQuestion(), 500);
        };
        
        // 3. Initialiser le lecteur YouTube
        this.initYouTubePlayer();
        
        // 4. Configurer le bouton de suppression
        this.setupDeleteButton();
        
        // 5. Événements
        if (this.homeScreen && this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startGame());
        }
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // 6. DÃ©bloquer l'audio
        this.setupAudioInteraction();
        
        // 7. Démarrer la session
        this.sessionManager.startSession(this.sessionId);
        
        console.log('âœ… Jeu initialisÃ© avec session:', this.sessionId);
    }

    // Vérifier et charger la session
    checkSession() {
        const urlParams = new URLSearchParams(window.location.search);
        this.sessionId = urlParams.get('session');
        
        if (!this.sessionId) {
            console.warn('âš ï¸ Pas de session ID dans l\'URL');
            return;
        }
        
        this.sessionManager = new SessionManager();
        this.session = this.sessionManager.getSession(this.sessionId);
        
        if (this.session) {
            console.log(`ðŸ“‹ Session chargÃ©e: ${this.sessionId} (${this.session.games.length} jeux)`);
            
            // Mettre à jour la configuration avec les paramètres de la session
            CONFIG.PHASE1_TIME = this.session.settings.phase1Time;
            CONFIG.PHASE2_TIME = this.session.settings.phase2Time;
            CONFIG.TOTAL_QUESTIONS = this.session.settings.totalQuestions;
            
            // Mettre à jour l'interface
            this.updateUIWithSession();
        } else {
            console.error('âŒ Session non trouvÃ©e:', this.sessionId);
        }
    }
    
    // Mettre à jour l'UI avec les infos de session
    updateUIWithSession() {
        const totalQuestionsEl = document.getElementById('total-questions');
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = this.session.settings.totalQuestions;
        }
        
        // Mettre à jour le titre avec le code de session
        const titleEl = document.querySelector('.title');
        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-gamepad"></i> QUIZ - ${this.sessionId}`;
        }
        
        // Afficher les joueurs
        this.displayPlayers();
    }
    
    // Afficher la liste des joueurs
    displayPlayers() {
        const statsContainer = document.querySelector('.stats');
        if (statsContainer && this.session.players.length > 1) {
            const playersEl = document.createElement('div');
            playersEl.className = 'stat';
            playersEl.innerHTML = `
                <i class="fas fa-users"></i>
                Joueurs: ${this.session.players.length}
            `;
            statsContainer.insertBefore(playersEl, statsContainer.firstChild);
        }
    }

    // Configurer le bouton de suppression
    setupDeleteButton() {
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => {
                this.deleteCurrentVideo();
            });
            this.deleteBtn.style.display = 'none'; // CachÃ© au dÃ©but
            console.log('âœ… Bouton suppression configurÃ©');
        } else {
            console.error('âŒ Bouton suppression non trouvÃ©');
        }
    }

    // Supprimer la vidÃ©o courante
    deleteCurrentVideo() {
        if (!confirm('Supprimer cette vidÃ©o du quiz et passer Ã  la suivante ?')) {
            return;
        }
        
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        console.log(`ðŸ—‘ï¸ Suppression manuelle: ${currentGame.name}`);
        
        // 1. Ajouter aux vidÃ©os supprimÃ©es (pour vÃ©rification manuelle)
        DeletedGamesStorage.add(currentGame);
        
        // 2. Retirer de la session actuelle
        const gameIndex = this.session.games.findIndex(g => 
            g.name === currentGame.name && g.videoId === currentGame.videoId
        );
        
        if (gameIndex !== -1) {
            this.session.games.splice(gameIndex, 1);
            
            // Mettre à jour dans SessionManager
            this.sessionManager.saveSessions();
            
            console.log(`âœ… ${currentGame.name} retirÃ© de la session`);
        }
        
        // 3. Ajouter aux supprimÃ©s dÃ©finitifs (pour tracking)
        if (window.addToPermanentlyDeleted) {
            window.addToPermanentlyDeleted(currentGame);
        }
        
        // 4. Passer Ã  la question suivante
        this.nextQuestion();
    }

    // Initialiser le lecteur YouTube
    initYouTubePlayer() {
        this.youtubePlayer = new YouTubePlayer(
            'player-container',
            () => this.onYouTubeReady(),
            (error) => this.onYouTubeError(error)
        );
        
        this.youtubePlayer.init();
    }

    // DÃ©bloquer l'audio
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
                console.log('ðŸ”Š Audio dÃ©bloquÃ© et context prÃªt');
                
            } catch (error) {
                console.warn('âš ï¸ Impossible de dÃ©bloquer l\'audio:', error);
            }
        };
        
        document.addEventListener('click', unlockAudio, { once: true });
        if (this.startBtn) {
            this.startBtn.addEventListener('click', unlockAudio, { once: true });
        }
    }

    // YouTube est prÃªt
    onYouTubeReady() {
        console.log('âœ… YouTube Player prÃªt');
    }

    // Erreur YouTube
    onYouTubeError(error) {
        console.error('âŒ Erreur YouTube:', error);
        this.showError('Erreur vidÃ©o - Passage Ã  la question suivante');
        setTimeout(() => this.nextQuestion(), 2000);
    }

    // DÃ©marrer le jeu (avec ou sans écran d'accueil)
    startGame() {
        console.log('ðŸš€ DÃ©marrage du jeu');
        
        if (this.homeScreen && this.quizScreen) {
            this.homeScreen.classList.remove('active');
            this.homeScreen.classList.add('hidden');
            this.quizScreen.classList.remove('hidden');
            this.quizScreen.classList.add('active');
            console.log('âœ… Ã‰crans switchÃ©s');
        }
        
        setTimeout(() => this.startQuestion(), 100);
    }

    // DÃ©marrer une question
    startQuestion() {
        if (this.currentQuestion >= this.session.settings.totalQuestions || 
            !this.questionManager.hasMoreQuestions()) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.isPlaying = true;
        
        // AFFICHER le bouton de suppression
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'flex';
        }
        
        // PrÃ©parer la question
        const questionReady = this.questionManager.prepareQuestion(this.currentQuestion);
        if (!questionReady) {
            this.endGame();
            return;
        }
        
        // Charger et dÃ©marrer la vidÃ©o
        this.loadAndStartVideo();
        
        // DÃ©marrer la phase 1
        this.phaseManager.startPhase(1);
    }

    // Charger et dÃ©marrer la vidÃ©o
    loadAndStartVideo() {
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`ðŸŽ¬ Chargement: ${currentGame.name} Ã  ${this.startTime}s`);
        
        this.youtubePlayer.loadVideo(currentGame.videoId, this.startTime);
        this.youtubePlayer.unmute();
        console.log(`âœ… VidÃ©o ${currentGame.name} demandÃ©e`);
    }

    // Passer Ã  la question suivante
    nextQuestion() {
        console.log('âž¡ï¸ Question suivante');
        
        // CACHER le bouton de suppression
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'none';
        }
        
        // RÃ©initialiser les tentatives YouTube
        if (this.youtubePlayer.resetLoadAttempts) {
            this.youtubePlayer.resetLoadAttempts();
        }
        
        // ArrÃªter la vidÃ©o
        this.youtubePlayer.stop();
        
        // RÃ‰INITIALISER LES PHASES
        this.phaseManager.reset();
        
        // Masquer le rÃ©sultat et rÃ©initialiser les rÃ©ponses
        this.nextBtn.style.display = 'none';
        
        // DÃ©marrer la question suivante
        setTimeout(() => this.startQuestion(), 1000);
    }

    // Afficher une erreur
    showError(message) {
        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.innerHTML = `âš ï¸ ${message}`;
            resultEl.className = 'result active incorrect';
        }
    }

    // Terminer le jeu avec sauvegarde des résultats
    endGame() {
        console.log('ðŸ Fin du jeu');
        
        // Calculer le score
        const results = {
            total: this.currentQuestion,
            correct: this.questionManager.getCorrectCount(),
            percentage: Math.round((this.questionManager.getCorrectCount() / this.currentQuestion) * 100),
            details: this.questionManager.getResultsDetails()
        };
        
        // Sauvegarder les résultats
        if (this.sessionManager && this.sessionId) {
            this.sessionManager.completeSession(this.sessionId, results);
        }
        
        // ArrÃªter tout
        this.youtubePlayer.stop();
        this.phaseManager.clearTimers();
        
        // Cacher bouton suppression
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'none';
        }
        
        // Masquer les sections
        const answersSection = document.querySelector('.answers-section');
        const videoSection = document.querySelector('.video-section');
        if (answersSection) answersSection.style.display = 'none';
        if (videoSection) videoSection.style.display = 'none';
        this.nextBtn.style.display = 'none';
        
        // Afficher l'Ã©cran de fin
        const resultEl = document.querySelector('.result');
        if (resultEl) {
            resultEl.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">ðŸ†</div>
                    <h1 style="font-size: 2.5rem; margin-bottom: 20px;">QUIZ TERMINÃ‰ !</h1>
                    <div style="font-size: 1.8rem; margin-bottom: 30px;">
                        Score: <span style="color: #2ed573; font-weight: bold;">${results.correct}/${results.total}</span>
                    </div>
                    <div style="font-size: 1.5rem; margin-bottom: 40px;">
                        Pourcentage: <span style="color: #3742fa; font-weight: bold;">${results.percentage}%</span>
                    </div>
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button onclick="location.href='lobby.html'" class="btn-next" style="background: #3742fa;">
                            <i class="fas fa-home"></i> Retour au Lobby
                        </button>
                        <button onclick="location.reload()" class="btn-next">
                            <i class="fas fa-redo"></i> REJOUER
                        </button>
                    </div>
                    <p style="margin-top: 30px; color: #a4b0be; font-size: 0.9rem;">
                        <i class="fas fa-share-alt"></i>
                        <a href="#" onclick="shareResults()" style="color: #ff4757; text-decoration: none;">
                            Partager mon score
                        </a>
                    </p>
                </div>
            `;
            resultEl.className = 'result active correct';
        }
    }

    // Obtenir l'Ã©tat du jeu
    getGameState() {
        return {
            sessionId: this.sessionId,
            currentQuestion: this.currentQuestion,
            isPlaying: this.isPlaying,
            totalQuestions: this.session ? this.session.settings.totalQuestions : CONFIG.TOTAL_QUESTIONS,
            players: this.session ? this.session.players : []
        };
    }
}

// Fonction pour partager les résultats
function shareResults() {
    const gameManager = window.gameManager;
    if (gameManager && gameManager.session) {
        const results = gameManager.questionManager ? {
            correct: gameManager.questionManager.getCorrectCount(),
            total: gameManager.currentQuestion
        } : { correct: 0, total: 0 };
        
        const text = `ðŸŽ® J'ai terminé le quiz "Jeux Vidéos" avec un score de ${results.correct}/${results.total} !\n\nCode session: ${gameManager.session.id}\n\nVenez me défier !`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz Jeux Vidéos',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('Score copié dans le presse-papier ! Partagez-le avec vos amis.');
            });
        }
    }
}

// Exposer la fonction globalement
window.shareResults = shareResults;
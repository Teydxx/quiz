class GameManager {
    constructor() {
        this.currentQuestion = 0;
        this.isPlaying = false;
        this.hasUserInteracted = false;
        this.startTime = null;
        this.isTransitioning = false; // NOUVEAU: empêcher les transitions simultanées
        
        // Modules
        this.youtubePlayer = null;
        this.phaseManager = null;
        this.questionManager = null;
        
        // Éléments DOM
        this.homeScreen = document.getElementById('home-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
    }

    // Initialiser le jeu
    init() {
        console.log('🎮 [DEBUG] Initialisation du jeu...');
        
        // DÉSACTIVER le bouton suivant au début
        this.nextBtn.disabled = true;
        this.nextBtn.style.opacity = '0.5';
        this.nextBtn.style.display = 'none'; // Caché au début
        
        // Initialiser les modules
        this.questionManager = new QuestionManager();
        this.questionManager.init(CONFIG.TOTAL_QUESTIONS);
        
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => {
            console.log('🔔 [DEBUG] PhaseManager.onPhaseComplete() appelé');
            if (!this.isTransitioning) {
                this.isTransitioning = true;
                setTimeout(() => {
                    this.nextQuestion();
                    this.isTransitioning = false;
                }, 500);
            }
        };
        
        // Initialiser le lecteur YouTube
        this.initYouTubePlayer();
        
        // Événements
        this.startBtn.addEventListener('click', () => this.startGame());
        this.nextBtn.addEventListener('click', () => {
            console.log('🖱️ [DEBUG] Bouton suivant cliqué');
            this.nextQuestion();
        });
        
        // Débloquer l'audio
        this.setupAudioInteraction();
        
        console.log('✅ [DEBUG] Jeu initialisé');
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

    // Débloquer l'audio
    setupAudioInteraction() {
        const unlockAudio = () => {
            if (this.hasUserInteracted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createBufferSource();
                source.buffer = audioContext.createBuffer(1, 1, 22050);
                source.connect(audioContext.destination);
                source.start();
                audioContext.resume();
                
                this.hasUserInteracted = true;
                console.log('🔊 [DEBUG] Audio débloqué');
            } catch (error) {
                console.warn('⚠️ [DEBUG] Impossible de débloquer l\'audio:', error);
            }
        };
        
        // Débloquer au premier clic
        document.addEventListener('click', unlockAudio, { once: true });
    }

    // YouTube est prêt
    onYouTubeReady() {
        console.log('✅ [DEBUG] YouTube Player prêt');
        // Activer le bouton suivant maintenant
        this.nextBtn.disabled = false;
        this.nextBtn.style.opacity = '1';
    }

    // Erreur YouTube
    onYouTubeError(error) {
        console.error('❌ [DEBUG] Erreur YouTube:', error);
        this.showError('Erreur vidéo - Passage à la question suivante');
        setTimeout(() => this.nextQuestion(), 2000);
    }

    // Démarrer le jeu
    startGame() {
        console.log('🚀 [DEBUG] Démarrage du jeu');
        
        // Changer d'écran
        this.homeScreen.classList.remove('active');
        this.homeScreen.classList.add('hidden');
        this.quizScreen.classList.remove('hidden');
        this.quizScreen.classList.add('active');
        
        console.log('✅ [DEBUG] Écrans switchés');
        
        // Attendre que l'UI se stabilise
        setTimeout(() => {
            console.log('⏰ [DEBUG] Démarrage première question...');
            this.startQuestion();
        }, 500);
    }

    // Démarrer une question
    startQuestion() {
        console.log(`❓ [DEBUG] Début startQuestion(), question ${this.currentQuestion}`);
        
        // Vérifier si on a atteint la limite
        if (this.currentQuestion >= CONFIG.TOTAL_QUESTIONS || 
            !this.questionManager.hasMoreQuestions()) {
            console.log('🏁 [DEBUG] Fin du jeu atteinte');
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.isPlaying = true;
        
        console.log(`📝 [DEBUG] Préparation question ${this.currentQuestion}`);
        
        // Préparer la question
        const questionReady = this.questionManager.prepareQuestion(this.currentQuestion);
        if (!questionReady) {
            console.error('❌ [DEBUG] Échec préparation question');
            this.endGame();
            return;
        }
        
        console.log('🎮 [DEBUG] Question prête, chargement vidéo...');
        
        // Charger et démarrer la vidéo
        this.loadAndStartVideo();
        
        // DÉMARRER LA PHASE 1
        console.log('⏱️ [DEBUG] Démarrage Phase 1 via PhaseManager');
        if (this.phaseManager) {
            this.phaseManager.startPhase(1);
        } else {
            console.error('❌ [DEBUG] PhaseManager non initialisé!');
        }
        
        console.log('✅ [DEBUG] startQuestion() terminé');
    }

    // Charger et démarrer la vidéo
    loadAndStartVideo() {
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        // Temps de départ aléatoire
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🎬 [DEBUG] Chargement: ${currentGame.name} à ${this.startTime}s`);
        
        this.youtubePlayer.loadVideo(currentGame.videoId, this.startTime);
        this.youtubePlayer.unmute();
        console.log(`✅ [DEBUG] Vidéo ${currentGame.name} demandée`);
    }

    // Passer à la question suivante
    nextQuestion() {
        console.log(`🔄 [DEBUG] nextQuestion() appelé, question actuelle: ${this.currentQuestion}`);
        
        // Masquer le bouton suivant
        this.nextBtn.style.display = 'none';
        
        // Arrêter la vidéo
        this.youtubePlayer.stop();
        
        // Réinitialiser les phases
        if (this.phaseManager) {
            this.phaseManager.reset();
        }
        
        // Masquer le résultat
        this.questionManager.hideResult();
        
        console.log('⏳ [DEBUG] Attente 1s avant prochaine question...');
        
        // Délai avant la question suivante
        setTimeout(() => {
            this.startQuestion();
        }, 1000);
    }

    // Afficher une erreur
    showError(message) {
        const resultEl = document.getElementById('result');
        resultEl.innerHTML = `⚠️ ${message}`;
        resultEl.className = 'result active incorrect';
    }

    // Terminer le jeu
    endGame() {
        console.log('🏁 [DEBUG] Fin du jeu');
        
        // Arrêter tout
        this.youtubePlayer.stop();
        if (this.phaseManager) {
            this.phaseManager.clearTimers();
        }
        
        // Masquer les sections
        document.querySelector('.answers-section').style.display = 'none';
        document.querySelector('.video-section').style.display = 'none';
        this.nextBtn.style.display = 'none';
        
        // Afficher l'écran de fin
        this.questionManager.resultEl.innerHTML = `
            🏆 <strong>QUIZ TERMINÉ !</strong><br>
            <span style="font-size: 1.5rem; margin: 20px 0;">Vous avez terminé ${this.currentQuestion} questions</span><br><br>
            <button onclick="location.reload()" class="btn-next" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> REJOUER
            </button>
        `;
        this.questionManager.resultEl.className = 'result active correct';
    }

    // Obtenir l'état du jeu
    getGameState() {
        return {
            currentQuestion: this.currentQuestion,
            isPlaying: this.isPlaying,
            totalQuestions: CONFIG.TOTAL_QUESTIONS
        };
    }
}
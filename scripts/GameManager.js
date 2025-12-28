class GameManager {
    constructor() {
        this.currentQuestion = 0;
        this.isPlaying = false;
        this.hasUserInteracted = false;
        this.startTime = null;
        
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
        console.log('🎮 Initialisation du jeu...');
        
        // Initialiser les modules
        this.questionManager = new QuestionManager();
        this.questionManager.init(CONFIG.TOTAL_QUESTIONS);
        
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => this.nextQuestion();
        
        // Initialiser le lecteur YouTube
        this.initYouTubePlayer();
        
        // Événements
        this.startBtn.addEventListener('click', () => this.startGame());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // Débloquer l'audio
        this.setupAudioInteraction();
        
        console.log('✅ Jeu initialisé');
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
                console.log('🔊 Audio débloqué');
            } catch (error) {
                console.warn('⚠️ Impossible de débloquer l\'audio:', error);
            }
        };
        
        // Débloquer au premier clic
        document.addEventListener('click', unlockAudio, { once: true });
    }

    // YouTube est prêt
    onYouTubeReady() {
        console.log('✅ YouTube Player prêt');
        // Prêt à démarrer le jeu
    }

    // Erreur YouTube
    onYouTubeError(error) {
        console.error('❌ Erreur YouTube:', error);
        this.showError('Erreur vidéo - Passage à la question suivante');
        setTimeout(() => this.nextQuestion(), 2000);
    }

    // Démarrer le jeu
    startGame() {
        console.log('🚀 Démarrage du jeu');
        
        // DEBUG
        console.log('Home avant:', this.homeScreen.style.display);
        console.log('Quiz avant:', this.quizScreen.style.display);
        
        // Changer d'écran (méthode plus agressive)
        this.homeScreen.style.display = 'none';
        this.quizScreen.style.display = 'block';
        
        // Assurer les classes aussi
        this.homeScreen.classList.remove('active');
        this.quizScreen.classList.add('active');
        
        console.log('Home après:', this.homeScreen.style.display);
        console.log('Quiz après:', this.quizScreen.style.display);
        
        // Démarrer la première question
        this.startQuestion();
    }

    // Démarrer une question
    startQuestion() {
        if (this.currentQuestion >= CONFIG.TOTAL_QUESTIONS || 
            !this.questionManager.hasMoreQuestions()) {
            this.endGame();
            return;
        }

        this.currentQuestion++;
        this.isPlaying = true;
        
        // Préparer la question
        const questionReady = this.questionManager.prepareQuestion(this.currentQuestion);
        if (!questionReady) {
            this.endGame();
            return;
        }
        
        // Charger et démarrer la vidéo
        this.loadAndStartVideo();
        
        // Démarrer la phase 1
        this.phaseManager.startPhase(1);
    }

    // Charger et démarrer la vidéo
    loadAndStartVideo() {
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        // Temps de départ aléatoire
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🎬 Chargement: ${currentGame.name} à ${this.startTime}s`);
        
        this.youtubePlayer.loadVideo(currentGame.videoId, this.startTime);
        this.youtubePlayer.unmute();
    }

    // Passer à la question suivante
    nextQuestion() {
        console.log('⏭️ Question suivante');
        
        // Arrêter la vidéo
        this.youtubePlayer.stop();
        
        // Réinitialiser les phases
        this.phaseManager.reset();
        
        // Masquer le bouton suivant
        this.questionManager.hideResult();
        
        // Démarrer la question suivante
        setTimeout(() => this.startQuestion(), 500);
    }

    // Afficher une erreur
    showError(message) {
        const resultEl = document.getElementById('result');
        resultEl.innerHTML = `⚠️ ${message}`;
        resultEl.className = 'result active incorrect';
    }

    // Terminer le jeu
    endGame() {
        console.log('🏁 Fin du jeu');
        
        // Arrêter tout
        this.youtubePlayer.stop();
        this.phaseManager.clearTimers();
        
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
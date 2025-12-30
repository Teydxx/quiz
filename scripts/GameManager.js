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
        this.deleteBtn = null; // Bouton de suppression
    }

    // Initialiser le jeu
    init() {
        console.log('🎮 Initialisation du jeu...');
        
        // Initialiser les modules
        this.questionManager = new QuestionManager();
        this.questionManager.init(CONFIG.TOTAL_QUESTIONS);
        
        this.phaseManager = new PhaseManager();
        this.phaseManager.onPhaseComplete = () => {
            console.log('🔄 Phase terminée, passage question suivante');
            setTimeout(() => this.nextQuestion(), 500);
        };
        
        // Initialiser le lecteur YouTube
        this.initYouTubePlayer();
        
        // Créer le bouton de suppression
        this.createDeleteButton();
        
        // Événements
        this.startBtn.addEventListener('click', () => this.startGame());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // Débloquer l'audio
        this.setupAudioInteraction();
        
        console.log('✅ Jeu initialisé');
    }

    // Créer le bouton de suppression
    createDeleteButton() {
        const btn = document.createElement('button');
        btn.id = 'delete-video-btn';
        btn.className = 'btn-delete';
        btn.innerHTML = '<i class="fas fa-trash-alt"></i> Supprimer cette vidéo';
        btn.style.display = 'none';
        
        btn.addEventListener('click', () => {
            this.deleteCurrentVideo();
        });
        
        const videoSection = document.querySelector('.video-section');
        if (videoSection) {
            videoSection.appendChild(btn);
        }
        
        this.deleteBtn = btn;
        return btn;
    }

    // Supprimer la vidéo courante
    deleteCurrentVideo() {
        if (!confirm('Supprimer cette vidéo du quiz et passer à la suivante ?')) {
            return;
        }
        
        const currentGame = this.questionManager.getCurrentGame();
        if (!currentGame) return;
        
        console.log(`🗑️ Suppression manuelle: ${currentGame.name}`);
        
        // 1. Ajouter aux vidéos supprimées
        DeletedGamesStorage.add(currentGame);
        
        // 2. Retirer du tableau GAMES pour éviter qu'elle réapparaisse
        const gameIndex = GAMES.findIndex(g => 
            g.name === currentGame.name && g.videoId === currentGame.videoId
        );
        
        if (gameIndex !== -1) {
            GAMES.splice(gameIndex, 1);
            console.log(`✅ ${currentGame.name} retiré de la liste des jeux`);
        }
        
        // 3. Passer à la question suivante
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

    // Débloquer l'audio
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
                console.log('🔊 Audio débloqué et context prêt');
                
            } catch (error) {
                console.warn('⚠️ Impossible de débloquer l\'audio:', error);
            }
        };
        
        document.addEventListener('click', unlockAudio, { once: true });
        this.startBtn.addEventListener('click', unlockAudio, { once: true });
    }

    // YouTube est prêt
    onYouTubeReady() {
        console.log('✅ YouTube Player prêt');
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
        
        this.homeScreen.classList.remove('active');
        this.homeScreen.classList.add('hidden');
        this.quizScreen.classList.remove('hidden');
        this.quizScreen.classList.add('active');
        
        console.log('✅ Écrans switchés');
        
        setTimeout(() => this.startQuestion(), 100);
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
        
        // AFFICHER le bouton de suppression
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'block';
        }
        
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
        
        this.startTime = Math.floor(
            Math.random() * (CONFIG.MAX_START_TIME - CONFIG.MIN_START_TIME)
        ) + CONFIG.MIN_START_TIME;
        
        console.log(`🎬 Chargement: ${currentGame.name} à ${this.startTime}s`);
        
        this.youtubePlayer.loadVideo(currentGame.videoId, this.startTime);
        this.youtubePlayer.unmute();
        console.log(`✅ Vidéo ${currentGame.name} demandée`);
    }

    // Passer à la question suivante
    nextQuestion() {
        console.log('➡️ Question suivante');
        
        // CACHER le bouton de suppression
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'none';
        }
        
        // Réinitialiser les tentatives YouTube
        if (this.youtubePlayer.resetLoadAttempts) {
            this.youtubePlayer.resetLoadAttempts();
        }
        
        // Arrêter la vidéo
        this.youtubePlayer.stop();
        
        // RÉINITIALISER LES PHASES
        this.phaseManager.reset();
        
        // Masquer le résultat et réinitialiser les réponses
        this.nextBtn.style.display = 'none';
        
        // Démarrer la question suivante
        setTimeout(() => this.startQuestion(), 1000);
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
        
        // Cacher bouton suppression
        if (this.deleteBtn) {
            this.deleteBtn.style.display = 'none';
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
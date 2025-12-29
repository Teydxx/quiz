class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.fadeInterval = null;
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.videoOverlay = document.getElementById('video-overlay');
        this.resultOverlay = document.getElementById('result-overlay');
        this.timerOverlay = document.getElementById('timer-overlay');
        this.timerCount = document.querySelector('.timer-count');
        
        // Éléments résultat
        this.resultIcon = document.querySelector('.result-icon');
        this.resultGameName = document.querySelector('.result-game-name');
        this.resultStatus = document.querySelector('.result-status');
    }
    
    // Démarrer une phase
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        // Toujours commencer avec overlay vidéo à 100%
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        
        switch(phaseNumber) {
            case 1:
                // Phase 1 : Écoute (20s)
                this.phaseTimer = CONFIG.PHASE1_TIME;
                
                // Afficher timer, cacher résultat
                this.timerOverlay.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultOverlay.classList.remove('active');
                break;
                
            case 2:
                // Phase 2 : Révélation (10s)
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // Cacher timer, afficher résultat
                this.timerOverlay.classList.add('hidden');
                this.showResult();
                
                // Animation overlay vidéo : 100% → 0% → 100%
                this.animateVideoOverlay();
                break;
        }
        
        // Démarrer timer
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // Afficher le résultat
    showResult() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        // Finaliser la réponse
        qm.finalizeAnswer();
        qm.revealAnswers();
        
        // Préparer contenu
        let resultClass = 'no-answer';
        let resultIcon = '❌';
        let statusText = 'PAS DE RÉPONSE';
        
        if (qm.hasUserAnswered()) {
            if (qm.userAnswerCorrect) {
                resultClass = 'correct';
                resultIcon = '🎉';
                statusText = 'CORRECT !';
            } else {
                resultClass = 'incorrect';
                resultIcon = '❌';
                statusText = 'INCORRECT';
            }
        }
        
        // Mettre à jour DOM
        this.resultIcon.textContent = resultIcon;
        this.resultGameName.textContent = currentGame.name;
        this.resultStatus.textContent = statusText;
        
        // Appliquer classe résultat
        this.resultOverlay.className = `result-overlay ${resultClass}`;
        
        // Afficher
        setTimeout(() => {
            this.resultOverlay.classList.add('active');
        }, 50);
    }
    
    // Animation overlay vidéo
    animateVideoOverlay() {
        console.log('🎬 Animation overlay (10s)');
        
        // 0-3s : Devenir transparent (fade out)
        setTimeout(() => {
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        }, 0);
        
        // 7-10s : Redevenir noir (fade in)
        setTimeout(() => {
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        }, 7000);
        
        // 10s : Cacher résultat
        setTimeout(() => {
            this.resultOverlay.classList.remove('active');
        }, 10000);
    }
    
    // Mettre à jour timer
    updatePhaseTimer() {
        this.phaseTimer--;
        
        if (this.currentPhase === 1) {
            this.timerCount.textContent = this.phaseTimer;
        }
        
        if (this.phaseTimer <= 0) {
            if (this.currentPhase < 2) {
                this.startPhase(2);
            } else {
                this.clearTimers();
                this.endPhase();
            }
        }
    }
    
    // Fin de phase
    endPhase() {
        // S'assurer que tout est bien opaque
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.resultOverlay.classList.remove('active');
        
        // Délai pour éviter le "PAF"
        setTimeout(() => {
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 200);
    }
    
    // Arrêter timers
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
    }
    
    // Réinitialiser
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        // Réinitialiser overlays
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.videoOverlay.style.transition = 'background-color 0.5s ease';
        
        this.timerOverlay.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        
        this.resultOverlay.classList.remove('active');
        this.resultOverlay.className = 'result-overlay';
    }
}
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.fadeInterval = null;
        this.layerOpacity = 1;
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.overlay = document.getElementById('video-overlay');
        this.overlayIcon = document.getElementById('overlay-icon');
        this.phaseInfo = document.getElementById('phase-info');
        this.phaseTimerEl = document.getElementById('phase-timer');
    }

    triggerAutoReveal() {
    // Appeler autoRevealAnswer si l'utilisateur n'a pas répondu
    if (window.gameManager && 
        window.gameManager.questionManager && 
        !window.gameManager.questionManager.hasUserAnswered()) {
        
        const result = window.gameManager.questionManager.autoRevealAnswer();
        
        // Configurer la phase 3 avec le résultat
        if (result) {
            this.setupPhase3(result.gameName, result.isCorrect, result.userAnswered);
        }
    }
    }

    // Démarrer une phase spécifique
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        // Réinitialiser l'opacité
        this.layerOpacity = 1;
        this.overlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
        this.overlay.classList.remove('transparent');
        
        // Réafficher tous les éléments
        this.overlayIcon.classList.remove('hidden');
        this.phaseInfo.classList.remove('hidden');
        this.phaseTimerEl.classList.remove('hidden');
        
        // Configurer la phase
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = CONFIG.PHASE1_TIME;
                this.overlayIcon.textContent = '🎧';
                this.phaseInfo.textContent = 'Écoutez le gameplay (15 secondes)';
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                this.overlayIcon.textContent = '👁️';
                this.phaseInfo.textContent = 'Regardez la vidéo (5 secondes)';
                this.startLayerFade();
                break;
                
            case 3:
                this.phaseTimer = CONFIG.PHASE3_TIME;
                
                // AUTO-RÉVÉLATION SI PAS DE RÉPONSE
                if (!window.gameManager.questionManager.hasUserAnswered()) {
                    this.triggerAutoReveal();
                }
                
                // Rétablir l'opacité à 100%
                this.layerOpacity = 1;
                this.overlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
                this.overlay.classList.remove('transparent');
                
                // Mettre à jour l'icône et le texte
                if (window.gameManager.questionManager.hasUserAnswered()) {
                    const isCorrect = window.gameManager.questionManager.resultEl.classList.contains('correct');
                    this.overlayIcon.textContent = isCorrect ? '🎉' : '❌';
                    this.phaseInfo.textContent = isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse';
                } else {
                    this.overlayIcon.textContent = '🔍';
                    const currentGame = window.gameManager.questionManager.getCurrentGame();
                    this.phaseInfo.textContent = currentGame ? `Réponse: ${currentGame.name}` : 'Réponse';
                }
                break;
        }
        
        // Démarrer le timer
        this.phaseTimerEl.textContent = this.phaseTimer;
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }

    // Transition d'opacité pour la phase 2
    startLayerFade() {
        const opacityDecrement = 1 / CONFIG.PHASE2_TIME;
        
        this.fadeInterval = setInterval(() => {
            this.layerOpacity = Math.max(0, this.layerOpacity - opacityDecrement);
            
            this.overlay.style.backgroundColor = `rgba(15, 12, 41, ${this.layerOpacity})`;
            this.overlayIcon.style.opacity = this.layerOpacity;
            this.phaseInfo.style.opacity = this.layerOpacity;
            this.phaseTimerEl.style.opacity = this.layerOpacity;
            
            if (this.layerOpacity <= 0) {
                this.overlay.classList.add('transparent');
                this.overlayIcon.classList.add('hidden');
                this.phaseInfo.classList.add('hidden');
                this.phaseTimerEl.classList.add('hidden');
                clearInterval(this.fadeInterval);
            }
        }, 1000);
    }

    // Mettre à jour le timer de phase
    updatePhaseTimer() {
        this.phaseTimer--;
        this.phaseTimerEl.textContent = this.phaseTimer;
        
        if (this.phaseTimer <= 0) {
            if (this.currentPhase < 3) {
                this.startPhase(this.currentPhase + 1);
            } else {
                this.clearTimers();
                if (this.onPhaseComplete) {
                    this.onPhaseComplete();
                }
            }
        }
    }

    // Configurer la phase 3 après une réponse
    setupPhase3(gameName, isCorrect, userAnswered) {
        this.overlayIcon.textContent = isCorrect ? '🎉' : '❌';
        
        if (userAnswered) {
            this.phaseInfo.textContent = isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse';
        } else {
            this.phaseInfo.textContent = `Réponse: ${gameName}`;
        }
        
        this.startPhase(3);
    }

    // Arrêter tous les timers
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

    // Réinitialiser pour une nouvelle question
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.layerOpacity = 1;
        
        // Réinitialiser l'UI
        this.overlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
        this.overlay.classList.remove('transparent');
        this.overlayIcon.classList.remove('hidden');
        this.phaseInfo.classList.remove('hidden');
        this.phaseTimerEl.classList.remove('hidden');
        this.overlayIcon.style.opacity = 1;
        this.phaseInfo.style.opacity = 1;
        this.phaseTimerEl.style.opacity = 1;
        
        this.phaseTimerEl.textContent = this.phaseTimer;
    }

    // Vérifier si on est en phase de réponse
    isAnswerPhase() {
        return this.currentPhase === 3;
    }
}
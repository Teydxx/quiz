class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.blackOverlay = document.getElementById('black-overlay');
        this.resultBox = document.getElementById('result-box');
        this.timerBox = document.getElementById('timer-box');
        this.timerCount = document.querySelector('.timer-count');
        this.answersSection = document.getElementById('answers-section');
        
        // Éléments résultat
        this.resultIcon = document.querySelector('.result-icon');
        this.resultGameName = document.querySelector('.result-game-name');
        this.resultStatus = document.querySelector('.result-status');
    }
    
    // Démarrer une phase
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        switch(phaseNumber) {
            case 1:
                // Phase 1 : Écoute (20s)
                this.phaseTimer = CONFIG.PHASE1_TIME;
                
                // 1. Overlay noir à 100%
                this.setBlackOverlayOpacity(1);
                
                // 2. Montrer timer, cacher résultat
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                
                // 3. Montrer les réponses
                this.answersSection.classList.remove('hidden');
                
                break;
                
            case 2:
                // Phase 2 : Révélation (10s)
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // 1. Cacher timer
                this.timerBox.classList.add('hidden');
                
                // 2. Cacher les réponses
                this.answersSection.classList.add('hidden');
                
                // 3. Afficher résultat
                this.showResult();
                
                // 4. Animation overlay : 100% → 0% en 3s
                this.fadeOutBlackOverlay();
                
                // 5. Après 7s, animation overlay : 0% → 100% en 3s
                setTimeout(() => {
                    this.fadeInBlackOverlay();
                }, 7000);
                
                break;
        }
        
        // Démarrer timer
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // FADE OUT : 100% → 0% en 3 secondes
    fadeOutBlackOverlay() {
        if (!this.blackOverlay) return;
        
        let opacity = 1;
        const duration = 3000;
        const steps = 30;
        const stepDuration = duration / steps;
        const decrement = 1 / steps;
        
        let step = 0;
        const fade = () => {
            opacity -= decrement;
            this.setBlackOverlayOpacity(Math.max(0, opacity));
            
            step++;
            if (step < steps) {
                setTimeout(fade, stepDuration);
            } else {
                this.setBlackOverlayOpacity(0);
            }
        };
        
        setTimeout(fade, stepDuration);
    }
    
    // FADE IN : 0% → 100% en 3 secondes
    fadeInBlackOverlay() {
        if (!this.blackOverlay) return;
        
        let opacity = 0;
        const duration = 3000;
        const steps = 30;
        const stepDuration = duration / steps;
        const increment = 1 / steps;
        
        let step = 0;
        const fade = () => {
            opacity += increment;
            this.setBlackOverlayOpacity(Math.min(1, opacity));
            
            step++;
            if (step < steps) {
                setTimeout(fade, stepDuration);
            } else {
                this.setBlackOverlayOpacity(1);
            }
        };
        
        setTimeout(fade, stepDuration);
    }
    
    // Définir l'opacité de l'overlay noir
    setBlackOverlayOpacity(opacity) {
        if (this.blackOverlay) {
            this.blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
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
        this.resultBox.className = `result-box ${resultClass}`;
        
        // Afficher
        setTimeout(() => {
            this.resultBox.classList.add('active');
        }, 100);
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
        this.clearTimers();
        
        // Cacher résultat
        this.resultBox.classList.remove('active');
        
        // S'assurer que l'overlay est à 100%
        this.setBlackOverlayOpacity(1);
        
        // Appeler le callback
        setTimeout(() => {
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 300);
    }
    
    // Arrêter timer
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
    }
    
    // Réinitialiser
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        // Réinitialiser tout
        this.setBlackOverlayOpacity(1);
        
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        
        this.resultBox.classList.remove('active');
        this.resultBox.className = 'result-box';
        
        this.answersSection.classList.remove('hidden');
    }
}
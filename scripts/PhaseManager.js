// scripts/PhaseManager.js
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        // FADE OUT OBLIGATOIRE selon config.js
        this.fadeStartSeconds = CONFIG.FADE_OUT_SECONDS;
        this.isFading = false;
        
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
        
        console.log(`⏱️ PhaseManager - Fade out audio: ${this.fadeStartSeconds}s avant la fin`);
    }
    
    // Démarrer une phase
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        this.isFading = false;
        
        switch(phaseNumber) {
            case 1:
                // Phase 1 : Écoute
                this.phaseTimer = CONFIG.PHASE1_TIME;
                
                // Réinitialiser le volume à 100%
                this.resetAudioVolume();
                
                // Setup UI
                this.setBlackOverlayOpacity(1);
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                this.answersSection.classList.remove('hidden');
                
                break;
                
            case 2:
                // Phase 2 : Révélation
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                this.timerBox.classList.add('hidden');
                this.answersSection.classList.add('hidden');
                this.showResult();
                this.fadeOutBlackOverlay();
                
                setTimeout(() => {
                    this.fadeInBlackOverlay();
                }, 7000);
                
                break;
        }
        
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // Mettre à jour timer avec fade out OBLIGATOIRE
updatePhaseTimer() {
    this.phaseTimer--;
    
    if (this.currentPhase === 1) {
        this.timerCount.textContent = this.phaseTimer;
        
        // SIMPLE FADE OUT
        if (window.gameManager?.youtubePlayer) {
            const player = window.gameManager.youtubePlayer;
            
            if (this.phaseTimer === 2) player.setVolume(70);
            else if (this.phaseTimer === 1) player.setVolume(40);
            else if (this.phaseTimer === 0) player.setVolume(20);
        }
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
    
    // Gérer le fade out audio (OBLIGATOIRE)
    handleAudioFade() {
        if (!window.gameManager || !window.gameManager.youtubePlayer) return;
        
        const youtubePlayer = window.gameManager.youtubePlayer;
        const timeLeft = this.phaseTimer;
        
        // Si on est dans la période de fade out configurée
        if (timeLeft <= this.fadeStartSeconds && timeLeft > 0) {
            if (!this.isFading) {
                this.isFading = true;
                console.log(`🔉 Fade out audio (${timeLeft}/${this.fadeStartSeconds}s)`);
            }
            
            // Volume proportionnel au temps restant
            // Ex avec 3s: 3s→100%, 2s→66%, 1s→33%, 0s→0%
            const volumePercent = (timeLeft / this.fadeStartSeconds) * 100;
            youtubePlayer.setVolume(volumePercent);
            
        } 
        // Timer à 0 = son coupé
        else if (timeLeft === 0) {
            youtubePlayer.setVolume(0);
        }
        // Si bug: on sort du fade, on remet à 100%
        else if (this.isFading && timeLeft > this.fadeStartSeconds) {
            this.isFading = false;
            youtubePlayer.setVolume(100);
        }
    }
    
    // Réinitialiser le volume audio
    resetAudioVolume() {
        if (window.gameManager && window.gameManager.youtubePlayer) {
            window.gameManager.youtubePlayer.resetVolume();
            this.isFading = false;
        }
    }
    
    // === MÉTHODES EXISTANTES (inchangées) ===
    
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
    
    setBlackOverlayOpacity(opacity) {
        if (this.blackOverlay) {
            this.blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
    }
    
    showResult() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        qm.finalizeAnswer();
        qm.revealAnswers();
        
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
        
        this.resultIcon.textContent = resultIcon;
        this.resultGameName.textContent = currentGame.name;
        this.resultStatus.textContent = statusText;
        this.resultBox.className = `result-box ${resultClass}`;
        
        setTimeout(() => {
            this.resultBox.classList.add('active');
        }, 100);
    }
    
    endPhase() {
        this.clearTimers();
        this.resultBox.classList.remove('active');
        this.setBlackOverlayOpacity(1);
        this.resetAudioVolume();
        
        setTimeout(() => {
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 300);
    }
    
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
    }
    
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.isFading = false;
        
        this.setBlackOverlayOpacity(1);
        this.resetAudioVolume();
        
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        
        this.resultBox.classList.remove('active');
        this.resultBox.className = 'result-box';
        
        this.answersSection.classList.remove('hidden');
    }
}
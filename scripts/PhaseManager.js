class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.fadeInterval = null;
        this.videoOverlayOpacity = 1; // 100% opaque au départ
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.videoOverlay = document.getElementById('video-overlay');
        this.revealOverlay = document.getElementById('reveal-overlay');
        this.timerOverlay = document.getElementById('timer-overlay');
        
        // Éléments timer
        this.timerIcon = document.querySelector('.timer-icon');
        this.timerText = document.querySelector('.timer-text');
        this.timerCount = document.querySelector('.timer-count');
        
        // Éléments révélation
        this.revealIcon = document.querySelector('.reveal-icon');
        this.revealGameName = document.querySelector('.reveal-game-name');
        this.revealStatus = document.querySelector('.reveal-status');
    }
    
    // Démarrer une phase spécifique
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        // Réinitialiser l'overlay vidéo à 100% opaque
        this.videoOverlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
        this.videoOverlayOpacity = 1;
        
        switch(phaseNumber) {
            case 1:
                // Phase 1 : Écoute (20 secondes)
                this.phaseTimer = CONFIG.PHASE1_TIME;
                
                // Afficher le timer
                this.timerOverlay.classList.remove('hidden');
                this.timerIcon.textContent = '🎵';
                this.timerText.textContent = 'Écoutez la musique';
                this.timerCount.textContent = this.phaseTimer;
                
                // Cacher la révélation
                this.revealOverlay.classList.remove('active');
                
                break;
                
            case 2:
                // Phase 2 : Révélation (10 secondes)
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // Cacher le timer
                this.timerOverlay.classList.add('hidden');
                
                // Préparer et afficher la révélation
                this.prepareRevealContent();
                this.revealOverlay.classList.add('active');
                
                // Démarrer l'animation de fade de l'overlay vidéo
                this.startVideoOverlayAnimation();
                
                break;
        }
        
        // Démarrer le timer interne
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // Préparer le contenu de la révélation
    prepareRevealContent() {
        let resultClass = 'no-answer';
        let resultIcon = '❌';
        let statusText = 'PAS DE RÉPONSE';
        let gameName = '';
        
        if (window.gameManager && window.gameManager.questionManager) {
            const qm = window.gameManager.questionManager;
            const currentGame = qm.getCurrentGame();
            
            if (currentGame) {
                gameName = currentGame.name;
                
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
                
                // Finaliser la réponse
                qm.finalizeAnswer();
                qm.revealAnswers();
            }
        }
        
        // Mettre à jour l'overlay de révélation
        if (this.revealIcon) this.revealIcon.textContent = resultIcon;
        if (this.revealGameName) this.revealGameName.textContent = gameName;
        if (this.revealStatus) this.revealStatus.textContent = statusText;
        
        // Appliquer la classe de résultat
        this.revealOverlay.className = `reveal-overlay ${resultClass}`;
    }
    
    // Animation de l'overlay vidéo pendant la phase 2
    startVideoOverlayAnimation() {
        console.log('🎬 Début animation overlay vidéo (10s)');
        
        const startTime = Date.now();
        const totalTime = CONFIG.PHASE2_TIME * 1000; // 10 secondes
        
        this.fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < CONFIG.FADE_OUT_DURATION * 1000) {
                // 0-3s : Fade out (100% → 0%)
                const progress = elapsed / (CONFIG.FADE_OUT_DURATION * 1000);
                this.videoOverlayOpacity = 1 - progress;
                
            } else if (elapsed < (CONFIG.FADE_OUT_DURATION + CONFIG.FULL_VIEW_DURATION) * 1000) {
                // 3-7s : Vue complète (0%)
                this.videoOverlayOpacity = 0;
                
            } else if (elapsed < totalTime) {
                // 7-10s : Fade in (0% → 100%)
                const timeInFadeIn = elapsed - (CONFIG.FADE_OUT_DURATION + CONFIG.FULL_VIEW_DURATION) * 1000;
                const progress = timeInFadeIn / (CONFIG.FADE_IN_DURATION * 1000);
                this.videoOverlayOpacity = progress;
                
            } else {
                // Fin : 100% opaque
                this.videoOverlayOpacity = 1;
            }
            
            // Appliquer l'opacité (avec une transition fluide)
            this.videoOverlay.style.backgroundColor = `rgba(15, 12, 41, ${this.videoOverlayOpacity})`;
            
        }, 16); // ~60fps
    }
    
    // Mettre à jour le timer de phase
    updatePhaseTimer() {
        this.phaseTimer--;
        
        // Afficher le timer SEULEMENT en phase 1
        if (this.currentPhase === 1) {
            this.timerCount.textContent = this.phaseTimer;
        }
        
        if (this.phaseTimer <= 0) {
            if (this.currentPhase < 2) {
                this.startPhase(this.currentPhase + 1);
            } else {
                this.clearTimers();
                
                // S'assurer que l'overlay vidéo est à 100% avant de continuer
                this.videoOverlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
                
                if (this.onPhaseComplete) {
                    this.onPhaseComplete();
                }
            }
        }
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
        
        // Cacher l'overlay de révélation
        if (this.revealOverlay) {
            this.revealOverlay.classList.remove('active');
        }
    }
    
    // Réinitialiser pour une nouvelle question
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.videoOverlayOpacity = 1;
        
        // Réinitialiser les overlays
        this.videoOverlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
        this.timerOverlay.classList.remove('hidden');
        this.revealOverlay.classList.remove('active');
        
        // Réinitialiser le timer
        this.timerCount.textContent = this.phaseTimer;
        this.timerText.textContent = 'Écoutez la musique';
        this.timerIcon.textContent = '🎵';
    }
}
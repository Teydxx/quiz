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
                this.phaseInfo.textContent = 'Écoutez la musique (20 secondes)';
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // Révéler le nom du jeu
                if (window.gameManager && window.gameManager.questionManager) {
                    const currentGame = window.gameManager.questionManager.getCurrentGame();
                    if (currentGame) {
                        this.overlayIcon.textContent = '🎮';
                        this.phaseInfo.textContent = `${currentGame.name}`;
                        this.phaseInfo.style.fontSize = '1.8rem';
                        this.phaseInfo.style.fontWeight = 'bold';
                    }
                }
                
                // Démarrer l'animation fade in/out
                this.startRevealAnimation();
                break;
        }
        
        // Démarrer le timer
        this.phaseTimerEl.textContent = this.phaseTimer;
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }

    // Animation fade in/out pour la phase 2
    startRevealAnimation() {
        console.log('🎨 Début animation révélation');
        
        const totalTime = CONFIG.PHASE2_TIME * 1000; // en ms
        const fadeDuration = CONFIG.FADE_DURATION * 1000; // en ms
        
        // État: 0 = opaque (100%), 1 = transparent (0%), 2 = opaque (100%)
        let animationState = 0;
        let startTime = Date.now();
        
        this.fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / totalTime;
            
            // Calculer l'opacité en fonction du temps
            if (progress < fadeDuration / totalTime) {
                // Phase 1: fade out (100% → 0%)
                animationState = 0;
                this.layerOpacity = 1 - (elapsed / fadeDuration);
            } else if (progress > 1 - (fadeDuration / totalTime)) {
                // Phase 3: fade in (0% → 100%)
                animationState = 2;
                const timeInFadeIn = elapsed - (totalTime - fadeDuration);
                this.layerOpacity = timeInFadeIn / fadeDuration;
            } else {
                // Phase 2: complètement transparent
                animationState = 1;
                this.layerOpacity = 0;
            }
            
            // Appliquer l'opacité
            this.overlay.style.backgroundColor = `rgba(15, 12, 41, ${this.layerOpacity})`;
            this.overlayIcon.style.opacity = this.layerOpacity;
            this.phaseInfo.style.opacity = this.layerOpacity;
            this.phaseTimerEl.style.opacity = this.layerOpacity;
            
            // Cacher/montrer selon l'opacité
            if (this.layerOpacity <= 0.1 && animationState === 1) {
                this.overlay.classList.add('transparent');
                this.overlayIcon.classList.add('hidden');
                this.phaseInfo.classList.add('hidden');
                this.phaseTimerEl.classList.add('hidden');
            } else {
                this.overlay.classList.remove('transparent');
                this.overlayIcon.classList.remove('hidden');
                this.phaseInfo.classList.remove('hidden');
                this.phaseTimerEl.classList.remove('hidden');
            }
        }, 50); // Mise à jour toutes les 50ms pour animation fluide
    }

    // Mettre à jour le timer de phase
    updatePhaseTimer() {
        this.phaseTimer--;
        this.phaseTimerEl.textContent = this.phaseTimer;
        
        if (this.phaseTimer <= 0) {
            if (this.currentPhase < 2) {
                this.startPhase(this.currentPhase + 1);
            } else {
                this.clearTimers();
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
        this.phaseInfo.style.fontSize = ''; // Réinitialiser la taille
        this.phaseInfo.style.fontWeight = ''; // Réinitialiser le poids
        
        this.phaseTimerEl.textContent = this.phaseTimer;
    }
}
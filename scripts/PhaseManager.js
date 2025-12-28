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
                
                // Cacher temporairement les infos pendant le fade
                this.overlayIcon.style.opacity = '0';
                this.phaseInfo.style.opacity = '0';
                this.phaseTimerEl.style.opacity = '0';
                
                // Déterminer la couleur et l'icône selon la réponse
                let resultColor = '#ff4757'; // Rouge par défaut (pas de réponse/mauvaise)
                let resultIcon = '❌';
                let resultText = 'Pas de réponse';
                
                if (window.gameManager && window.gameManager.questionManager) {
                    const qm = window.gameManager.questionManager;
                    if (qm.hasUserAnswered()) {
                        if (qm.userAnswerCorrect) {
                            resultColor = '#2ed573'; // Vert si bonne réponse
                            resultIcon = '🎉';
                            resultText = 'CORRECT !';
                        } else {
                            resultColor = '#ff4757'; // Rouge si mauvaise
                            resultIcon = '❌';
                            resultText = 'INCORRECT';
                        }
                    }
                    
                    // Afficher le nom du jeu au centre
                    const currentGame = qm.getCurrentGame();
                    if (currentGame) {
                        // Créer ou récupérer l'élément d'affichage du résultat
                        let resultDisplay = this.overlay.querySelector('.result-display');
                        if (!resultDisplay) {
                            resultDisplay = document.createElement('div');
                            resultDisplay.className = 'result-display';
                            this.overlay.appendChild(resultDisplay);
                        }
                        
                        // Mettre à jour le contenu
                        resultDisplay.innerHTML = `
                            <div class="result-icon-big">${resultIcon}</div>
                            <div class="result-game-name" style="color: ${resultColor}">${currentGame.name}</div>
                            <div class="result-status" style="color: ${resultColor}">${resultText}</div>
                        `;
                        
                        resultDisplay.style.display = 'block';
                    }
                    if (window.gameManager && window.gameManager.questionManager) {
        window.gameManager.questionManager.hideAnswersForReveal();
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

    // Dans clearTimers(), ajouter :
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        
        // Cacher l'affichage du résultat
        const resultDisplay = this.overlay.querySelector('.result-display');
        if (resultDisplay) {
            resultDisplay.style.display = 'none';
        }
    }

    // Dans reset(), ajouter :
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.layerOpacity = 1;
        
        // Réinitialiser l'UI
        this.overlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
        this.overlay.classList.remove('transparent');
        
        // Réafficher les éléments standards
        this.overlayIcon.style.opacity = '1';
        this.phaseInfo.style.opacity = '1';
        this.phaseTimerEl.style.opacity = '1';
        this.overlayIcon.classList.remove('hidden');
        this.phaseInfo.classList.remove('hidden');
        this.phaseTimerEl.classList.remove('hidden');
        
        // Réinitialiser les infos
        this.overlayIcon.textContent = '🎧';
        this.phaseInfo.textContent = 'Écoutez la musique (20 secondes)';
        this.phaseInfo.style.fontSize = '';
        this.phaseInfo.style.fontWeight = '';
        
        this.phaseTimerEl.textContent = this.phaseTimer;
        
        // Cacher l'affichage du résultat
        const resultDisplay = this.overlay.querySelector('.result-display');
        if (resultDisplay) {
            resultDisplay.style.display = 'none';
        }
    }
}
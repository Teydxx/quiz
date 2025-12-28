class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.fadeInterval = null; // IMPORTANT: initialiser ici
        this.layerOpacity = 1;
        this.onPhaseComplete = null;
        this.resultOverlay = null; // AJOUT: initialiser
        
        // Éléments DOM
        this.overlay = document.getElementById('video-overlay');
        this.overlayIcon = document.getElementById('overlay-icon');
        this.phaseInfo = document.getElementById('phase-info');
        this.phaseTimerEl = document.getElementById('phase-timer');
        
        // Créer l'overlay de résultat
        this.createResultOverlay();
    }
    
    // NOUVELLE MÉTHODE : Créer l'overlay de résultat
    createResultOverlay() {
        this.resultOverlay = document.createElement('div');
        this.resultOverlay.className = 'result-overlay';
        this.resultOverlay.innerHTML = `
            <div class="result-content">
                <div class="result-icon-big"></div>
                <div class="result-game-name"></div>
                <div class="result-status"></div>
            </div>
        `;
        
        // Ajouter au conteneur vidéo
        const videoSection = document.querySelector('.video-section');
        if (videoSection) {
            videoSection.appendChild(this.resultOverlay);
        }
    }
    
    // Démarrer une phase spécifique
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers(); // IMPORTANT: arrêter tous les timers d'abord
        
        // CACHER IMMÉDIATEMENT l'overlay principal
        this.overlayIcon.style.opacity = '0';
        this.phaseInfo.style.opacity = '0';
        this.phaseTimerEl.style.opacity = '0';
        
        // Masquer complètement les éléments après un court délai
        setTimeout(() => {
            this.overlayIcon.classList.add('hidden');
            this.phaseInfo.classList.add('hidden');
            this.phaseTimerEl.classList.add('hidden');
        }, 50);

        // Gérer les classes CSS pour les phases
        this.overlay.classList.remove('phase-1', 'phase-2');
        this.overlay.classList.add(`phase-${phaseNumber}`);
        
        switch(phaseNumber) {
            case 1:
                // Phase 1 : réafficher tout
                this.phaseTimer = CONFIG.PHASE1_TIME;
                this.overlayIcon.textContent = '🎧';
                this.phaseInfo.textContent = 'Écoutez la musique (20 secondes)';
                
                // Montrer les éléments
                this.overlayIcon.style.opacity = '1';
                this.phaseInfo.style.opacity = '1';
                this.phaseTimerEl.style.opacity = '1';
                this.overlayIcon.classList.remove('hidden');
                this.phaseInfo.classList.remove('hidden');
                this.phaseTimerEl.classList.remove('hidden');
                
                // Cacher l'overlay de résultat
                if (this.resultOverlay) {
                    this.resultOverlay.classList.remove('active');
                }
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // DÉTERMINER LE RÉSULTAT
                let resultClass = 'result-noanswer';
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
                                resultClass = 'result-correct';
                                resultIcon = '🎉';
                                statusText = 'CORRECT !';
                            } else {
                                resultClass = 'result-incorrect';
                                resultIcon = '❌';
                                statusText = 'INCORRECT';
                            }
                        }
                    }
                }
                
                // METTRE À JOUR L'OVERLAY DE RÉSULTAT
                if (this.resultOverlay) {
                    const iconEl = this.resultOverlay.querySelector('.result-icon-big');
                    const nameEl = this.resultOverlay.querySelector('.result-game-name');
                    const statusEl = this.resultOverlay.querySelector('.result-status');
                    
                    if (iconEl) iconEl.textContent = resultIcon;
                    if (nameEl) nameEl.textContent = gameName;
                    if (statusEl) statusEl.textContent = statusText;
                    
                    // Appliquer la classe de résultat
                    this.resultOverlay.className = `result-overlay ${resultClass}`;
                    
                    // Afficher l'overlay
                    setTimeout(() => {
                        this.resultOverlay.classList.add('active');
                    }, 10);
                }
                
                // CACHER LES RÉPONSES
                if (window.gameManager && window.gameManager.questionManager) {
                    window.gameManager.questionManager.hideAnswersForReveal();
                }
                
                // DÉMARRER L'ANIMATION (sans timer visible)
                this.startRevealAnimation();
                break;
        }
        
        // Démarrer le timer interne (mais pas affiché pour phase 2)
        if (phaseNumber === 1) {
            this.phaseTimerEl.textContent = this.phaseTimer;
        }
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // Animation pour la phase 2
    startRevealAnimation() {
        console.log('🎨 Début animation révélation (10s)');
        
        const totalTime = CONFIG.PHASE2_TIME * 1000;
        const fadeDuration = CONFIG.FADE_DURATION * 1000;
        
        let startTime = Date.now();
        
        this.fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / totalTime;
            
            // Animation du fond de l'overlay principal
            if (progress < fadeDuration / totalTime) {
                // Fade out (100% → 0%)
                this.layerOpacity = 1 - (elapsed / fadeDuration);
            } else if (progress > 1 - (fadeDuration / totalTime)) {
                // Fade in (0% → 100%)
                const timeInFadeIn = elapsed - (totalTime - fadeDuration);
                this.layerOpacity = timeInFadeIn / fadeDuration;
            } else {
                // Transparent au milieu
                this.layerOpacity = 0;
            }
            
            // Appliquer au fond principal seulement
            this.overlay.style.backgroundColor = `rgba(15, 12, 41, ${this.layerOpacity})`;
        }, 50);
    }
    
    // Mettre à jour le timer de phase
    updatePhaseTimer() {
        this.phaseTimer--;
        
        // Afficher le timer SEULEMENT en phase 1
        if (this.currentPhase === 1) {
            this.phaseTimerEl.textContent = this.phaseTimer;
        }
        
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
    
    // Arrêter tous les timers - CORRIGÉ
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
        
        // AJOUT: arrêter aussi le fadeInterval
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        
        // Cacher l'overlay de résultat
        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('active');
        }
    }
    
    // Réinitialiser pour une nouvelle question
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.layerOpacity = 1;
        
        // Réinitialiser l'overlay principal
        this.overlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
        this.overlay.classList.remove('transparent');
        
        // Réafficher les éléments de phase 1
        this.overlayIcon.style.opacity = '1';
        this.phaseInfo.style.opacity = '1';
        this.phaseTimerEl.style.opacity = '1';
        this.overlayIcon.classList.remove('hidden');
        this.phaseInfo.classList.remove('hidden');
        this.phaseTimerEl.classList.remove('hidden');
        
        this.overlayIcon.textContent = '🎧';
        this.phaseInfo.textContent = 'Écoutez la musique (20 secondes)';
        this.phaseTimerEl.textContent = this.phaseTimer;
        
        // Cacher l'overlay de résultat
        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('active');
        }

        // Gérer les classes CSS
        this.overlay.classList.remove('phase-1', 'phase-2');
        this.overlay.classList.add('phase-1');
    }
}
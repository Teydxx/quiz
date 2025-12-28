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
        
        console.log('⏱️ [DEBUG] PhaseManager initialisé');
    }

    // Démarrer une phase spécifique
    startPhase(phaseNumber) {
        console.log(`🔄 [DEBUG] PhaseManager.startPhase(${phaseNumber}) appelé`);
        
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
                console.log('🎧 [DEBUG] Phase 1: Audio seul démarré');
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                this.overlayIcon.textContent = '👁️';
                this.phaseInfo.textContent = 'Regardez la vidéo (5 secondes)';
                this.startLayerFade();
                console.log('👁️ [DEBUG] Phase 2: Vidéo démarrée');
                break;
                
            case 3:
                this.phaseTimer = CONFIG.PHASE3_TIME;
                
                // Rétablir l'opacité à 100%
                this.layerOpacity = 1;
                this.overlay.style.backgroundColor = 'rgba(15, 12, 41, 1)';
                this.overlay.classList.remove('transparent');
                
                // Détecter si l'utilisateur a répondu
                if (window.gameManager && window.gameManager.questionManager) {
                    const qm = window.gameManager.questionManager;
                    if (qm.hasUserAnswered()) {
                        this.overlayIcon.textContent = qm.resultEl.classList.contains('correct') ? '🎉' : '❌';
                        this.phaseInfo.textContent = qm.resultEl.classList.contains('correct') 
                            ? 'Bonne réponse !' 
                            : 'Mauvaise réponse';
                    } else {
                        // Réponse automatique
                        const result = qm.autoRevealAnswer();
                        this.overlayIcon.textContent = '🔍';
                        this.phaseInfo.textContent = `Réponse: ${result.gameName}`;
                    }
                } else {
                    this.overlayIcon.textContent = '🔍';
                    this.phaseInfo.textContent = 'Révélation de la réponse';
                }
                
                console.log('🔍 [DEBUG] Phase 3: Révélation démarrée');
                break;
        }
        
        // Démarrer le timer
        this.phaseTimerEl.textContent = this.phaseTimer;
        console.log(`⏳ [DEBUG] Timer phase ${phaseNumber}: ${this.phaseTimer}s`);
        
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }

    // Transition d'opacité pour la phase 2
    startLayerFade() {
        console.log('🎨 [DEBUG] Début du fade de l\'overlay');
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
                console.log('🎨 [DEBUG] Fade terminé, overlay transparent');
            }
        }, 1000);
    }

    // Mettre à jour le timer de phase
    updatePhaseTimer() {
        this.phaseTimer--;
        this.phaseTimerEl.textContent = this.phaseTimer;
        
        console.log(`⏳ [DEBUG] Timer phase ${this.currentPhase}: ${this.phaseTimer}s restant`);
        
        if (this.phaseTimer <= 0) {
            console.log(`⏰ [DEBUG] Phase ${this.currentPhase} terminée`);
            
            if (this.currentPhase < 3) {
                // Passer à la phase suivante
                console.log(`🔄 [DEBUG] Passage à la phase ${this.currentPhase + 1}`);
                this.startPhase(this.currentPhase + 1);
            } else {
                // Toutes les phases terminées
                console.log('✅ [DEBUG] Toutes les phases terminées');
                this.clearTimers();
                
                // Afficher le bouton suivant
                if (window.gameManager && window.gameManager.nextBtn) {
                    window.gameManager.nextBtn.style.display = 'flex';
                    console.log('🔼 [DEBUG] Bouton suivant affiché');
                }
                
                // Appeler le callback de fin
                if (this.onPhaseComplete) {
                    console.log('🔔 [DEBUG] Appel de onPhaseComplete()');
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
            console.log('🛑 [DEBUG] Timer phase arrêté');
        }
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            console.log('🛑 [DEBUG] Fade timer arrêté');
        }
    }

    // Réinitialiser pour une nouvelle question
    reset() {
        console.log('🔄 [DEBUG] PhaseManager.reset()');
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
        console.log('✅ [DEBUG] PhaseManager réinitialisé');
    }

    // Vérifier si on est en phase de réponse
    isAnswerPhase() {
        return this.currentPhase === 3;
    }
}
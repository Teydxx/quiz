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
        this.videoOverlay.style.transition = 'background-color 0.3s linear';
        
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
                
                // Animation overlay vidéo
                this.startFadeAnimation();
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
        
        // Afficher avec un petit délai
        setTimeout(() => {
            this.resultOverlay.classList.add('active');
        }, 100);
    }
    
    // Animation FADE progressive
    startFadeAnimation() {
        console.log('🎬 Début animation fade (10s total)');
        
        // ÉTAPE 1: Fade out 100% → 0% sur 3 secondes
        console.log('0-3s: Fade out (noir → transparent)');
        this.startFadeOut();
        
        // ÉTAPE 2: Après 7 secondes, commencer le fade in
        setTimeout(() => {
            console.log('7-10s: Fade in (transparent → noir)');
            this.startFadeIn();
        }, 7000);
        
        // ÉTAPE 3: Après 10 secondes, fin de phase
        setTimeout(() => {
            console.log('10s: Fin de phase');
            this.endPhase();
        }, 10000);
    }
    
    // Fade out progressif sur 3 secondes - CORRIGÉ
    startFadeOut() {
        let opacity = 1;
        const fadeOutDuration = 3000; // 3 secondes
        const steps = 30; // Moins d'étapes pour être plus fluide
        const stepDuration = fadeOutDuration / steps;
        const opacityDecrement = 1 / steps;
        
        let step = 0;
        this.fadeInterval = setInterval(() => {
            // Appliquer l'opacité d'abord
            opacity -= opacityDecrement;
            this.videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${Math.max(0, opacity)})`;
            
            // Ensuite incrémenter le compteur
            step++;
            
            // Arrêter quand on a fait toutes les étapes
            if (step >= steps) {
                clearInterval(this.fadeInterval);
                // Forcer à 0% pour être sûr
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                console.log('✓ Fade out terminé (opacité 0%)');
            }
            
        }, stepDuration);
    }
    
    // Fade in progressif sur 3 secondes - CORRIGÉ
    startFadeIn() {
        // Arrêter tout interval précédent
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }
        
        let opacity = 0;
        const fadeInDuration = 3000; // 3 secondes
        const steps = 30;
        const stepDuration = fadeInDuration / steps;
        const opacityIncrement = 1 / steps;
        
        let step = 0;
        this.fadeInterval = setInterval(() => {
            // Appliquer l'opacité d'abord
            opacity += opacityIncrement;
            this.videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(1, opacity)})`;
            
            // Ensuite incrémenter le compteur
            step++;
            
            // Arrêter quand on a fait toutes les étapes
            if (step >= steps) {
                clearInterval(this.fadeInterval);
                // Forcer à 100% pour être sûr
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                console.log('✓ Fade in terminé (opacité 100%)');
            }
            
        }, stepDuration);
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
        
        // S'assurer que tout est bien opaque
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.resultOverlay.classList.remove('active');
        
        console.log('🏁 Phase 2 terminée, appel callback...');
        
        // Petit délai pour être sûr que tout est stable
        setTimeout(() => {
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 300);
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
    
    // Réinitialiser pour nouvelle question
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        // Réinitialiser overlays à l'état initial
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.videoOverlay.style.transition = 'background-color 0.3s linear';
        
        this.timerOverlay.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        
        this.resultOverlay.classList.remove('active');
        this.resultOverlay.className = 'result-overlay';
        
        console.log('🔄 PhaseManager réinitialisé');
    }
}
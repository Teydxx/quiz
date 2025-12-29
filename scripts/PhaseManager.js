class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.fadeInterval = null;
        this.onPhaseComplete = null;
        
        // Éléments DOM - vérifier qu'ils existent
        this.videoOverlay = document.getElementById('video-overlay');
        console.log('🎯 video-overlay trouvé:', !!this.videoOverlay);
        
        if (this.videoOverlay) {
            // TEST IMMÉDIAT : rendre l'overlay ROUGE pour vérifier
            this.videoOverlay.style.backgroundColor = 'rgba(255, 0, 0, 1)';
            console.log('🔴 TEST: Overlay mis en ROUGE');
            
            // Après 1 seconde, remettre en noir
            setTimeout(() => {
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                console.log('⚫ TEST: Overlay remis en NOIR');
            }, 1000);
        }
        
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
        
        // S'assurer qu'on a l'élément
        if (!this.videoOverlay) {
            this.videoOverlay = document.getElementById('video-overlay');
            if (!this.videoOverlay) {
                console.error('❌ video-overlay introuvable !');
                return;
            }
        }
        
        switch(phaseNumber) {
            case 1:
                // Phase 1 : Écoute (20s) - Overlay 100% noir
                this.phaseTimer = CONFIG.PHASE1_TIME;
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                
                // Afficher timer, cacher résultat
                this.timerOverlay.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultOverlay.classList.remove('active');
                break;
                
            case 2:
                // Phase 2 : Révélation (10s)
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // Cacher timer
                this.timerOverlay.classList.add('hidden');
                
                // Afficher résultat
                this.showResult();
                
                // FADE OUT : 100% → 0% en 3 secondes
                this.startFadeOut();
                
                // Après 7 secondes, FADE IN : 0% → 100%
                setTimeout(() => {
                    this.startFadeIn();
                }, 7000);
                
                break;
        }
        
        // Démarrer timer
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // FADE OUT simple et efficace
    startFadeOut() {
        console.log('🎬 Fade out: 100% → 0% en 3s');
        
        let opacity = 1;
        const duration = 3000; // 3 secondes
        const startTime = Date.now();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            opacity = 1 - progress;
            
            // Appliquer l'opacité
            this.videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
            
            if (progress < 1) {
                // Continuer l'animation
                requestAnimationFrame(fade);
            } else {
                // Forcer à 0% pour être sûr
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                console.log('✅ Fade out terminé (0%)');
            }
        };
        
        // Démarrer l'animation
        requestAnimationFrame(fade);
    }
    
    // FADE IN simple et efficace
    startFadeIn() {
        console.log('🎬 Fade in: 0% → 100% en 3s');
        
        let opacity = 0;
        const duration = 3000; // 3 secondes
        const startTime = Date.now();
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            opacity = progress;
            
            // Appliquer l'opacité
            this.videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
            
            if (progress < 1) {
                // Continuer l'animation
                requestAnimationFrame(fade);
            } else {
                // Forcer à 100% pour être sûr
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                console.log('✅ Fade in terminé (100%)');
            }
        };
        
        // Démarrer l'animation
        requestAnimationFrame(fade);
    }
    
    // Afficher le résultat (inchangé)
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
        
        // S'assurer que l'overlay est à 100%
        if (this.videoOverlay) {
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        }
        
        // Cacher résultat
        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('active');
        }
        
        // Appeler le callback
        setTimeout(() => {
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 500);
    }
    
    // Arrêter tous les timers
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
    }
    
    // Réinitialiser pour nouvelle question
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        // Réinitialiser overlays
        if (this.videoOverlay) {
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        }
        
        if (this.timerOverlay) {
            this.timerOverlay.classList.remove('hidden');
            if (this.timerCount) {
                this.timerCount.textContent = this.phaseTimer;
            }
        }
        
        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('active');
            this.resultOverlay.className = 'result-overlay';
        }
        
        console.log('🔄 PhaseManager réinitialisé');
    }
}
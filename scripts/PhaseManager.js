class PhaseManager {
    constructor() {
        console.log('🎯 PhaseManager constructor appelé');
        
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.videoOverlay = document.getElementById('video-overlay');
        this.resultOverlay = document.getElementById('result-overlay');
        this.timerOverlay = document.getElementById('timer-overlay');
        this.timerCount = document.querySelector('.timer-count');
        
        console.log('🎯 Éléments trouvés:');
        console.log('- video-overlay:', this.videoOverlay ? '✅' : '❌');
        console.log('- result-overlay:', this.resultOverlay ? '✅' : '❌');
        console.log('- timer-overlay:', this.timerOverlay ? '✅' : '❌');
        
        // Éléments résultat
        this.resultIcon = document.querySelector('.result-icon');
        this.resultGameName = document.querySelector('.result-game-name');
        this.resultStatus = document.querySelector('.result-status');
    }
    
    // Démarrer une phase
    startPhase(phaseNumber) {
        console.log(`🚀 START PHASE ${phaseNumber} appelé`);
        
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        switch(phaseNumber) {
            case 1:
                console.log('🎯 Phase 1: Écoute (20s)');
                this.phaseTimer = CONFIG.PHASE1_TIME;
                
                // Overlay vidéo 100% noir, résultat caché
                if (this.videoOverlay) {
                    this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                    console.log('🎨 video-overlay: rgba(0,0,0,1)');
                }
                if (this.resultOverlay) {
                    this.resultOverlay.classList.remove('active');
                }
                
                // Afficher timer
                if (this.timerOverlay) {
                    this.timerOverlay.classList.remove('hidden');
                }
                if (this.timerCount) {
                    this.timerCount.textContent = this.phaseTimer;
                }
                break;
                
            case 2:
                console.log('🎯 Phase 2: Révélation (10s) - DÉBUT');
                this.phaseTimer = CONFIG.PHASE2_TIME;
                
                // Cacher timer
                if (this.timerOverlay) {
                    this.timerOverlay.classList.add('hidden');
                }
                
                // Afficher résultat
                this.showResult();
                
                // FADE OUT progressif sur 3 secondes
                this.startFadeOut();
                
                // Après 7 secondes, FADE IN progressif
                setTimeout(() => {
                    this.startFadeIn();
                }, 7000);
                
                break;
        }
        
        // Démarrer timer
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // FADE OUT progressif
    startFadeOut() {
        console.log('🎬 FADE OUT: 100% → 0% en 3s');
        
        if (!this.videoOverlay) return;
        
        let opacity = 1;
        const duration = 3000; // 3 secondes
        const steps = 60; // 60 images
        const stepDuration = duration / steps;
        const decrement = 1 / steps;
        
        let step = 0;
        const fade = () => {
            // Baisser l'opacité
            opacity -= decrement;
            
            // Appliquer AUX DEUX OVERLAYS
            this.videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${Math.max(0, opacity)})`;
            
            // AUSSI rendre le result-overlay plus transparent pendant le fade
            if (this.resultOverlay && opacity < 0.5) {
                this.resultOverlay.style.opacity = `${opacity * 2}`; // Fade out plus rapide
            }
            
            step++;
            
            if (step < steps) {
                setTimeout(fade, stepDuration);
            } else {
                // Forcer à 0%
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                console.log('✅ FADE OUT terminé (vidéo visible)');
            }
        };
        
        // Démarrer l'animation
        setTimeout(fade, stepDuration);
    }
    
    // FADE IN progressif
    startFadeIn() {
        console.log('🎬 FADE IN: 0% → 100% en 3s');
        
        if (!this.videoOverlay) return;
        
        let opacity = 0;
        const duration = 3000; // 3 secondes
        const steps = 60; // 60 images
        const stepDuration = duration / steps;
        const increment = 1 / steps;
        
        let step = 0;
        const fade = () => {
            // Augmenter l'opacité
            opacity += increment;
            
            // Appliquer AUX DEUX OVERLAYS
            this.videoOverlay.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(1, opacity)})`;
            
            // AUSSI rendre le result-overlay moins transparent pendant le fade
            if (this.resultOverlay && opacity > 0.5) {
                this.resultOverlay.style.opacity = '1'; // Revenir à opaque
            }
            
            step++;
            
            if (step < steps) {
                setTimeout(fade, stepDuration);
            } else {
                // Forcer à 100%
                this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                console.log('✅ FADE IN terminé (vidéo cachée)');
            }
        };
        
        // Démarrer l'animation
        setTimeout(fade, stepDuration);
    }
    
    // Afficher le résultat
    showResult() {
        console.log('📊 showResult() appelé');
        
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        console.log('🎮 Jeu courant:', currentGame.name);
        
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
        
        console.log('📊 Résultat:', statusText);
        
        // Mettre à jour DOM
        if (this.resultIcon) this.resultIcon.textContent = resultIcon;
        if (this.resultGameName) this.resultGameName.textContent = currentGame.name;
        if (this.resultStatus) this.resultStatus.textContent = statusText;
        
        // Appliquer classe résultat
        if (this.resultOverlay) {
            this.resultOverlay.className = `result-overlay ${resultClass}`;
            
            // IMPORTANT: S'assurer qu'il a une opacité de 1 au début
            this.resultOverlay.style.opacity = '1';
            
            // Afficher
            setTimeout(() => {
                this.resultOverlay.classList.add('active');
                console.log('📊 Overlay résultat affiché');
            }, 100);
        }
    }
    
    // Mettre à jour timer
    updatePhaseTimer() {
        this.phaseTimer--;
        
        console.log(`⏱️ Timer phase ${this.currentPhase}: ${this.phaseTimer}s`);
        
        if (this.currentPhase === 1 && this.timerCount) {
            this.timerCount.textContent = this.phaseTimer;
        }
        
        if (this.phaseTimer <= 0) {
            console.log(`⏱️ Timer ${this.currentPhase} terminé`);
            
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
        console.log('🏁 endPhase() appelé');
        this.clearTimers();
        
        // S'assurer que l'overlay vidéo est à 100%
        if (this.videoOverlay) {
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        }
        
        // Cacher résultat et remettre son opacité à 1
        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('active');
            this.resultOverlay.style.opacity = '1';
        }
        
        // Appeler le callback
        setTimeout(() => {
            console.log('🏁 Appel de onPhaseComplete');
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 500);
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
        console.log('🔄 reset() appelé');
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        // Réinitialiser overlays
        if (this.videoOverlay) {
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        }
        
        if (this.timerOverlay) {
            this.timerOverlay.classList.remove('hidden');
        }
        
        if (this.timerCount) {
            this.timerCount.textContent = this.phaseTimer;
        }
        
        if (this.resultOverlay) {
            this.resultOverlay.classList.remove('active');
            this.resultOverlay.className = 'result-overlay';
            this.resultOverlay.style.opacity = '1'; // Important !
        }
    }
}
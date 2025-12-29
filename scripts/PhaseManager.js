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
                
                // Overlay 100% noir
                if (this.videoOverlay) {
                    this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                    console.log('🎨 Overlay mis à: rgba(0,0,0,1)');
                }
                
                // Afficher timer, cacher résultat
                if (this.timerOverlay) {
                    this.timerOverlay.classList.remove('hidden');
                }
                if (this.timerCount) {
                    this.timerCount.textContent = this.phaseTimer;
                }
                if (this.resultOverlay) {
                    this.resultOverlay.classList.remove('active');
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
                
                console.log('🎬 Appel de startFadeOut()');
                
                // FADE OUT IMMÉDIAT et SIMPLE
                this.startSimpleFadeOut();
                
                break;
        }
        
        // Démarrer timer
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    // FADE OUT ULTRA SIMPLE - ça DOIT marcher
    startSimpleFadeOut() {
        console.log('🎬 FADE OUT DÉBUT');
        
        if (!this.videoOverlay) {
            console.error('❌ video-overlay introuvable dans startSimpleFadeOut()');
            return;
        }
        
        // TEST: Rendre l'overlay ROUGE d'abord pour vérifier
        console.log('🔴 TEST: Mise en rouge pour vérification');
        this.videoOverlay.style.backgroundColor = 'rgba(255, 0, 0, 1)';
        
        // Après 500ms, commencer le fade vers transparent
        setTimeout(() => {
            console.log('🎬 Début fade vers transparent');
            
            // Méthode SIMPLE: juste changer la couleur directement
            this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            console.log('✅ Overlay mis à: rgba(0,0,0,0) - VIDÉO DEVRAIT APPARAÎTRE');
            
            // Programmer le fade in après 4 secondes
            setTimeout(() => {
                this.startSimpleFadeIn();
            }, 4000);
            
        }, 500);
    }
    
    // FADE IN ULTRA SIMPLE
    startSimpleFadeIn() {
        console.log('🎬 FADE IN DÉBUT');
        
        if (!this.videoOverlay) {
            console.error('❌ video-overlay introuvable dans startSimpleFadeIn()');
            return;
        }
        
        // Méthode SIMPLE: juste changer la couleur directement
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        console.log('✅ Overlay mis à: rgba(0,0,0,1) - VIDÉO DEVRAIT DISPARAÎTRE');
    }
    
    // Afficher le résultat
    showResult() {
        console.log('📊 showResult() appelé');
        
        if (!window.gameManager || !window.gameManager.questionManager) {
            console.warn('⚠️ gameManager ou questionManager non disponible');
            return;
        }
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) {
            console.warn('⚠️ currentGame non disponible');
            return;
        }
        
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
        }
    }
}
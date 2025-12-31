// scripts/PhaseManager.js
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        console.log('⏱️ PhaseManager initialisé');
    }
    
    startPhase(phaseNumber) {
        console.log(`🔄 Début phase ${phaseNumber}`);
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = CONFIG.PHASE1_TIME; // 20 secondes
                this.setBlackOverlayOpacity(1);
                this.showTimerBox();
                this.hideResultBox();
                this.showAnswersSection();
                this.startPhaseTimer();
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME; // 10 secondes
                this.hideTimerBox();
                this.hideAnswersSection();
                this.showAnswerDisplay();
                this.showResultBox();
                this.fadeOutBlackOverlay();
                this.startPhaseTimer();
                
                // Passer automatiquement à la suivante après 10 secondes
                setTimeout(() => {
                    this.endPhase();
                }, this.phaseTimer * 1000);
                break;
        }
    }
    
    startPhaseTimer() {
        this.clearTimers();
        this.phaseInterval = setInterval(() => {
            this.phaseTimer--;
            
            if (this.currentPhase === 1) {
                const timerCount = document.querySelector('.timer-count');
                if (timerCount) {
                    timerCount.textContent = this.phaseTimer;
                }
            }
            
            if (this.phaseTimer <= 0) {
                if (this.currentPhase === 1) {
                    this.startPhase(2);
                }
            }
        }, 1000);
    }
    
    fadeOutBlackOverlay() {
        const blackOverlay = document.getElementById('black-overlay');
        if (!blackOverlay) return;
        
        console.log('🌅 Début du fondu du masque noir');
        blackOverlay.style.transition = 'background-color 3s ease';
        blackOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    }
    
    fadeInBlackOverlay() {
        const blackOverlay = document.getElementById('black-overlay');
        if (!blackOverlay) return;
        
        console.log('🌑 Réapparition du masque noir');
        blackOverlay.style.transition = 'background-color 1s ease';
        blackOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
    }
    
    setBlackOverlayOpacity(opacity) {
        const blackOverlay = document.getElementById('black-overlay');
        if (blackOverlay) {
            blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
            blackOverlay.style.transition = 'none';
        }
    }
    
    showAnswerDisplay() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        // Supprimer l'ancien affichage
        let answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) {
            answerDisplay.innerHTML = '';
        } else {
            answerDisplay = document.createElement('div');
            answerDisplay.id = 'current-answer-display';
            answerDisplay.className = 'answer-display';
            document.querySelector('.answers-column').insertBefore(
                answerDisplay,
                document.getElementById('next-btn')
            );
        }
        
        // Déterminer le statut
        let resultClass = 'no-answer';
        let statusText = 'PAS DE RÉPONSE';
        let icon = '❌';
        
        if (qm.hasUserAnswered()) {
            if (qm.userAnswerCorrect) {
                resultClass = 'correct';
                statusText = 'CORRECT !';
                icon = '🎉';
            } else {
                resultClass = 'incorrect';
                statusText = 'INCORRECT';
                icon = '❌';
            }
        }
        
        // Créer le contenu
        answerDisplay.innerHTML = `
            <div class="answer-display-content ${resultClass}">
                <div class="answer-icon">${icon}</div>
                <div class="answer-game-name">${currentGame.name}</div>
                <div class="answer-status">${statusText}</div>
                <div class="answer-description">
                    <i class="fas fa-info-circle"></i>
                    La réponse était : <strong>${currentGame.name}</strong>
                </div>
            </div>
        `;
        
        // Afficher
        setTimeout(() => {
            answerDisplay.classList.add('active');
        }, 100);
        
        // Afficher le bouton suivant
        this.showNextButton();
    }
    
    showNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'flex';
            nextBtn.classList.add('show');
        }
    }
    
    showTimerBox() {
        const timerBox = document.getElementById('timer-box');
        if (timerBox) {
            timerBox.classList.remove('hidden');
        }
        const timerCount = document.querySelector('.timer-count');
        if (timerCount) {
            timerCount.textContent = this.phaseTimer;
        }
    }
    
    hideTimerBox() {
        const timerBox = document.getElementById('timer-box');
        if (timerBox) {
            timerBox.classList.add('hidden');
        }
    }
    
    showAnswersSection() {
        const answersSection = document.getElementById('answers-section');
        if (answersSection) {
            answersSection.style.display = 'block';
        }
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'grid';
        }
    }
    
    hideAnswersSection() {
        const answersSection = document.getElementById('answers-section');
        if (answersSection) {
            answersSection.style.display = 'none';
        }
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'none';
        }
    }
    
    showResultBox() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
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
        
        const resultIconEl = document.querySelector('.result-icon');
        const resultGameNameEl = document.querySelector('.result-game-name');
        const resultStatusEl = document.querySelector('.result-status');
        const resultBox = document.getElementById('result-box');
        
        if (resultIconEl) resultIconEl.textContent = resultIcon;
        if (resultGameNameEl) resultGameNameEl.textContent = currentGame.name;
        if (resultStatusEl) resultStatusEl.textContent = statusText;
        
        if (resultBox) {
            resultBox.className = `result-box ${resultClass}`;
            setTimeout(() => {
                resultBox.classList.add('active');
            }, 100);
        }
    }
    
    hideResultBox() {
        const resultBox = document.getElementById('result-box');
        if (resultBox) {
            resultBox.classList.remove('active');
        }
    }
    
    endPhase() {
        console.log('🏁 Fin de phase 2');
        
        this.clearTimers();
        this.hideResultBox();
        this.fadeInBlackOverlay();
        
        // Attendre 1 seconde puis passer à la suivante
        setTimeout(() => {
            if (this.onPhaseComplete) {
                console.log('📞 Appel onPhaseComplete');
                this.onPhaseComplete();
            }
        }, 1000);
    }
    
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
    }
    
    reset() {
        console.log('🔄 Reset PhaseManager');
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        this.setBlackOverlayOpacity(1);
        this.showTimerBox();
        this.hideResultBox();
        this.showAnswersSection();
        
        // Supprimer l'affichage de la réponse
        const answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) {
            answerDisplay.remove();
        }
        
        // Cacher le bouton suivant
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
            nextBtn.classList.remove('show');
        }
    }
}
// scripts/PhaseManager.js
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.blackOverlay = document.getElementById('black-overlay');
        this.resultBox = document.getElementById('result-box');
        this.timerBox = document.getElementById('timer-box');
        this.timerCount = document.querySelector('.timer-count');
        this.answersSection = document.getElementById('answers-section');
        
        // Éléments résultat
        this.resultIcon = document.querySelector('.result-icon');
        this.resultGameName = document.querySelector('.result-game-name');
        this.resultStatus = document.querySelector('.result-status');
    }
    
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = CONFIG.PHASE1_TIME;
                this.setBlackOverlayOpacity(1);
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                this.answersSection.classList.remove('hidden');
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                this.timerBox.classList.add('hidden');
                this.answersSection.classList.add('hidden');
                this.showResult();
                this.fadeOutBlackOverlay();
                
                setTimeout(() => {
                    this.fadeInBlackOverlay();
                }, 7000);
                break;
        }
        
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
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
    
    fadeOutBlackOverlay() {
        if (!this.blackOverlay) return;
        
        let opacity = 1;
        const duration = 3000;
        const steps = 30;
        const stepDuration = duration / steps;
        const decrement = 1 / steps;
        
        let step = 0;
        const fade = () => {
            opacity -= decrement;
            this.setBlackOverlayOpacity(Math.max(0, opacity));
            
            step++;
            if (step < steps) {
                setTimeout(fade, stepDuration);
            } else {
                this.setBlackOverlayOpacity(0);
            }
        };
        
        setTimeout(fade, stepDuration);
    }
    
    fadeInBlackOverlay() {
        if (!this.blackOverlay) return;
        
        let opacity = 0;
        const duration = 3000;
        const steps = 30;
        const stepDuration = duration / steps;
        const increment = 1 / steps;
        
        let step = 0;
        const fade = () => {
            opacity += increment;
            this.setBlackOverlayOpacity(Math.min(1, opacity));
            
            step++;
            if (step < steps) {
                setTimeout(fade, stepDuration);
            } else {
                this.setBlackOverlayOpacity(1);
            }
        };
        
        setTimeout(fade, stepDuration);
    }
    
    setBlackOverlayOpacity(opacity) {
        if (this.blackOverlay) {
            this.blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
    }
    
// Dans PhaseManager.js - Remplacer la fonction showResult()
showResult() {
    if (!window.gameManager || !window.gameManager.questionManager) return;
    
    const qm = window.gameManager.questionManager;
    const currentGame = qm.getCurrentGame();
    
    if (!currentGame) return;
    
    qm.finalizeAnswer();
    qm.revealAnswers();
    
    // NOUVEAU : Afficher le résultat dans la colonne de réponses
    this.displayAnswerInColumn();
}

// NOUVELLE FONCTION dans PhaseManager.js
displayAnswerInColumn() {
    if (!window.gameManager || !window.gameManager.questionManager) return;
    
    const qm = window.gameManager.questionManager;
    const currentGame = qm.getCurrentGame();
    if (!currentGame) return;
    
    // Cacher la grille de réponses
    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) {
        answersGrid.style.display = 'none';
    }
    
    // Créer ou réutiliser le conteneur de résultat
    let resultContainer = document.getElementById('answer-result-container');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'answer-result-container';
        resultContainer.className = 'answer-result-container';
        document.querySelector('.answers-section').appendChild(resultContainer);
    }
    
    // Déterminer le statut
    let statusClass = 'no-answer';
    let statusIcon = '❌';
    let statusText = 'PAS DE RÉPONSE';
    
    if (qm.hasUserAnswered()) {
        if (qm.userAnswerCorrect) {
            statusClass = 'correct';
            statusIcon = '🎉';
            statusText = 'CORRECT !';
        } else {
            statusClass = 'incorrect';
            statusIcon = '❌';
            statusText = 'INCORRECT';
        }
    }
    
    // Mettre à jour le contenu
    resultContainer.innerHTML = `
        <div class="answer-result-content ${statusClass}">
            <div class="answer-result-icon">${statusIcon}</div>
            <h3 class="answer-result-title">${statusText}</h3>
            <div class="answer-result-game">
                <div class="game-label">JEU :</div>
                <div class="game-name">${currentGame.name}</div>
            </div>
            <div class="answer-result-stats">
                <div class="stats-row">
                    <span>Votre réponse :</span>
                    <span class="user-answer">${qm.hasUserAnswered() ? qm.selectedButton?.textContent || 'Aucune' : 'Aucune'}</span>
                </div>
            </div>
        </div>
    `;
    
    resultContainer.style.display = 'block';
}
    
    endPhase() {
        this.clearTimers();
        this.resultBox.classList.remove('active');
        this.setBlackOverlayOpacity(1);
        
        setTimeout(() => {
            if (this.onPhaseComplete) {
                this.onPhaseComplete();
            }
        }, 300);
    }
    
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
    }
    
// Dans PhaseManager.js - Modifier la fonction reset()
reset() {
    this.clearTimers();
    this.currentPhase = 1;
    this.phaseTimer = CONFIG.PHASE1_TIME;
    
    this.setBlackOverlayOpacity(1);
    this.timerBox.classList.remove('hidden');
    this.timerCount.textContent = this.phaseTimer;
    
    // NOUVEAU : Cacher la boîte de résultat sur la vidéo
    this.resultBox.classList.remove('active');
    this.resultBox.className = 'result-box';
    
    this.answersSection.classList.remove('hidden');
}
}
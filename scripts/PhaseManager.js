// scripts/PhaseManager.js - VERSION CORRIGÉE
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
        this.answersGrid = document.getElementById('answers-grid');
        
        // Éléments résultat
        this.resultIcon = document.querySelector('.result-icon');
        this.resultGameName = document.querySelector('.result-game-name');
        this.resultStatus = document.querySelector('.result-status');
        
        console.log('⏱️ PhaseManager initialisé');
    }
    
    startPhase(phaseNumber) {
        console.log(`🔄 Début phase ${phaseNumber}`);
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        // Mettre à jour la classe du body pour le CSS
        document.body.className = '';
        document.body.classList.add(`phase-${phaseNumber}`);
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = CONFIG.PHASE1_TIME;
                this.setBlackOverlayOpacity(1);
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                
                // Afficher les réponses
                this.showAnswersSection();
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                this.timerBox.classList.add('hidden');
                
                // Cacher les réponses IMMÉDIATEMENT
                this.hideAnswersSection();
                
                // Créer et afficher l'affichage de la réponse
                this.showAnswerDisplay();
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
    
    // NOUVELLE MÉTHODE : Afficher l'affichage de la réponse
    showAnswerDisplay() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        console.log(`📝 Affichage réponse: ${currentGame.name}`);
        
        // Créer ou mettre à jour l'affichage de la réponse
        let answerDisplay = document.getElementById('current-answer-display');
        
        if (answerDisplay) {
            answerDisplay.remove();
        }
        
        answerDisplay = document.createElement('div');
        answerDisplay.id = 'current-answer-display';
        answerDisplay.className = 'answer-display';
        
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
        
        // Insérer dans la colonne de réponses
        const answersColumn = document.querySelector('.answers-column');
        const nextBtn = document.getElementById('next-btn');
        
        if (answersColumn && nextBtn) {
            answersColumn.insertBefore(answerDisplay, nextBtn);
        } else if (answersColumn) {
            answersColumn.appendChild(answerDisplay);
        }
        
        // Ajouter la classe active pour l'animation
        setTimeout(() => {
            answerDisplay.classList.add('active');
        }, 100);
        
        // Afficher le bouton suivant
        this.showNextButton();
    }
    
    // NOUVELLE MÉTHODE : Afficher le bouton suivant
    showNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            setTimeout(() => {
                nextBtn.style.display = 'flex';
                nextBtn.classList.add('show');
                console.log('▶️ Bouton suivant affiché');
            }, 500);
        }
    }
    
    // NOUVELLE MÉTHODE : Afficher la section réponses
    showAnswersSection() {
        if (this.answersSection) {
            this.answersSection.style.display = 'block';
            this.answersSection.style.opacity = '1';
            this.answersSection.classList.remove('hidden');
        }
        if (this.answersGrid) {
            this.answersGrid.style.display = 'grid';
            this.answersGrid.style.opacity = '1';
        }
    }
    
    // NOUVELLE MÉTHODE : Cacher la section réponses
    hideAnswersSection() {
        if (this.answersSection) {
            this.answersSection.style.display = 'none';
            this.answersSection.style.opacity = '0';
            this.answersSection.classList.add('hidden');
        }
        if (this.answersGrid) {
            this.answersGrid.style.display = 'none';
            this.answersGrid.style.opacity = '0';
        }
    }
    
    showResult() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        qm.finalizeAnswer();
        qm.revealAnswers();
        
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
        
        this.resultIcon.textContent = resultIcon;
        this.resultGameName.textContent = currentGame.name;
        this.resultStatus.textContent = statusText;
        this.resultBox.className = `result-box ${resultClass}`;
        
        setTimeout(() => {
            this.resultBox.classList.add('active');
        }, 100);
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
    
    reset() {
        console.log('🔄 Reset PhaseManager');
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        // Réinitialiser les classes du body
        document.body.className = 'phase-1';
        
        this.setBlackOverlayOpacity(1);
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        this.resultBox.classList.remove('active');
        this.resultBox.className = 'result-box';
        
        // Réafficher les réponses
        this.showAnswersSection();
        
        // Supprimer l'affichage de la réponse
        const answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) {
            answerDisplay.remove();
        }
        
        // Cacher le bouton suivant
        this.hideNextButton();
    }
    
    // NOUVELLE MÉTHODE : Cacher le bouton suivant
    hideNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
            nextBtn.classList.remove('show');
        }
    }
}
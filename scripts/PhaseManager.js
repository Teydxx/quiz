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
        this.answersGrid = document.getElementById('answers-grid');
        
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
                
                // AFFICHER LES BOUTONS EN PHASE 1
                if (this.answersSection) {
                    this.answersSection.classList.remove('hidden');
                    this.answersSection.style.display = 'block';
                }
                if (this.answersGrid) {
                    this.answersGrid.style.display = 'flex';
                    this.answersGrid.style.opacity = '1';
                }
                
                // NETTOYER L'AFFICHAGE DE RÉPONSE PRÉCÉDENT
                const oldAnswerDisplay = document.getElementById('current-answer-display');
                if (oldAnswerDisplay) oldAnswerDisplay.remove();
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                this.timerBox.classList.add('hidden');
                
                // CACHER LES BOUTONS EN PHASE 2
                if (this.answersSection) {
                    this.answersSection.classList.add('hidden');
                    this.answersSection.style.display = 'none';
                }
                if (this.answersGrid) {
                    this.answersGrid.style.display = 'none';
                    this.answersGrid.style.opacity = '0';
                }
                
                // AFFICHER LA RÉPONSE DANS LA COLONNE DROITE
                this.showAnswerInColumn();
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
    
    // NOUVELLE MÉTHODE : Afficher la réponse dans la colonne droite
    showAnswerInColumn() {
        console.log('📋 Affichage réponse dans colonne droite');
        
        const qm = window.gameManager?.questionManager;
        if (!qm) return;
        
        const game = qm.getCurrentGame();
        if (!game) return;
        
        // Finaliser la sélection si l'utilisateur n'a pas répondu
        if (!qm.userAnswered) {
            qm.finalizeAnswer();
        }
        
        // Révéler les réponses
        qm.revealAnswers();
        
        // Nettoyer ancien affichage
        const oldAnswer = document.getElementById('current-answer-display');
        if (oldAnswer) oldAnswer.remove();
        
        // Créer l'affichage de réponse
        const answersSection = document.querySelector('.answers-section');
        if (!answersSection) return;
        
        const isCorrect = qm.userAnswerCorrect;
        const color = isCorrect ? '#2ed573' : (qm.userAnswered ? '#ff4757' : '#747d8c');
        const text = isCorrect ? 'CORRECT !' : (qm.userAnswered ? 'INCORRECT' : 'PAS DE RÉPONSE');
        const icon = isCorrect ? '🎉' : (qm.userAnswered ? '❌' : '⌛');
        
        const answerDiv = document.createElement('div');
        answerDiv.id = 'current-answer-display';
        answerDiv.className = 'answer-display';
        answerDiv.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            animation: fadeIn 0.5s ease !important;
            width: 100%;
            padding: 20px;
            border: 3px solid ${color};
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            margin: 20px 0;
            text-align: center;
        `;
        answerDiv.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px; color: ${color}">
                ${icon}
            </div>
            
            <h3 style="color: ${color}; margin-bottom: 25px; font-size: 1.8rem;">
                ${text}
            </h3>
            
            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin: 15px 0;">
                <div style="color: #a4b0be; font-size: 0.9rem; margin-bottom: 10px;">
                    LA RÉPONSE ÉTAIT :
                </div>
                <div style="color: white; font-size: 2rem; font-weight: bold;">
                    ${game.name}
                </div>
            </div>
        `;
        
        answersSection.appendChild(answerDiv);
        
        // Afficher bouton suivant
        setTimeout(() => {
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn) {
                nextBtn.style.display = 'flex';
            }
        }, 500);
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
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        this.setBlackOverlayOpacity(1);
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        this.resultBox.classList.remove('active');
        this.resultBox.className = 'result-box';
        
        // RÉAFFICHER LES BOUTONS
        if (this.answersSection) {
            this.answersSection.classList.remove('hidden');
            this.answersSection.style.display = 'block';
        }
        if (this.answersGrid) {
            this.answersGrid.style.display = 'flex';
            this.answersGrid.style.opacity = '1';
        }
        
        // NETTOYER L'AFFICHAGE DE RÉPONSE
        const answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) answerDisplay.remove();
        
        // CACHER BOUTON SUIVANT
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    }
}
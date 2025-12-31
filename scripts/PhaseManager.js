// scripts/PhaseManager.js - VERSION SIMPLE
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
    }
    
    startPhase(phaseNumber) {
        console.log(`▶️ Phase ${phaseNumber}`);
        
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        const phase1Time = CONFIG.PHASE1_TIME;
        const phase2Time = CONFIG.PHASE2_TIME;
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = phase1Time;
                
                // Afficher le timer
                const timerBox = document.getElementById('timer-box');
                const timerCount = document.querySelector('.timer-count');
                if (timerBox) timerBox.classList.remove('hidden');
                if (timerCount) timerCount.textContent = this.phaseTimer;
                
                // Afficher les boutons
                const grid = document.getElementById('answers-grid');
                if (grid) grid.style.display = 'grid';
                
                // Cacher la réponse précédente
                const answerDisplay = document.getElementById('current-answer-display');
                if (answerDisplay) answerDisplay.remove();
                break;
                
            case 2:
                this.phaseTimer = phase2Time;
                
                // Cacher le timer
                const timerBox2 = document.getElementById('timer-box');
                if (timerBox2) timerBox2.classList.add('hidden');
                
                // Cacher les boutons
                const grid2 = document.getElementById('answers-grid');
                if (grid2) grid2.style.display = 'none';
                
                // Finaliser la sélection
                const qm = window.gameManager?.questionManager;
                if (qm && !qm.userAnswered) {
                    qm.finalizeSelection();
                }
                
                // Afficher la réponse
                this.showAnswerInColumn();
                break;
        }
        
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    updatePhaseTimer() {
        this.phaseTimer--;
        
        if (this.currentPhase === 1) {
            const timerCount = document.querySelector('.timer-count');
            if (timerCount) timerCount.textContent = this.phaseTimer;
            
            if (this.phaseTimer <= 0) {
                this.startPhase(2);
            }
        } else if (this.currentPhase === 2) {
            if (this.phaseTimer <= 0) {
                this.clearTimers();
                if (this.onPhaseComplete) {
                    this.onPhaseComplete();
                }
            }
        }
    }
    
    showAnswerInColumn() {
        console.log('📋 Affichage réponse');
        
        const qm = window.gameManager?.questionManager;
        if (!qm) return;
        
        const game = qm.getCurrentGame();
        if (!game) return;
        
        // S'assurer que les boutons sont cachés
        const grid = document.getElementById('answers-grid');
        if (grid) grid.style.display = 'none';
        
        // Nettoyer ancienne réponse
        const oldAnswer = document.getElementById('current-answer-display');
        if (oldAnswer) oldAnswer.remove();
        
        // Créer la réponse
        const answersSection = document.querySelector('.answers-section');
        if (!answersSection) return;
        
        const isCorrect = qm.userAnswerCorrect;
        const color = isCorrect ? '#2ed573' : (qm.userAnswered ? '#ff4757' : '#747d8c');
        const text = isCorrect ? 'CORRECT !' : (qm.userAnswered ? 'INCORRECT' : 'PAS DE RÉPONSE');
        const icon = isCorrect ? '🎉' : (qm.userAnswered ? '❌' : '⏰');
        
        const answerDiv = document.createElement('div');
        answerDiv.id = 'current-answer-display';
        answerDiv.className = 'answer-display';
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
            if (nextBtn) nextBtn.style.display = 'flex';
        }, 500);
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
        
        // Réafficher les boutons
        const grid = document.getElementById('answers-grid');
        if (grid) grid.style.display = 'grid';
    }
}
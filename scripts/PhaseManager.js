// scripts/PhaseManager.js - VERSION QUI VALIDE À LA FIN DE LA PHASE 1
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        console.log('⏱️ PhaseManager initialisé - Changement réponse permis en phase 1');
    }
    
    startPhase(phaseNumber) {
        console.log(`🔄 Début phase ${phaseNumber}`);
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = CONFIG.PHASE1_TIME;
                this.setBlackOverlayOpacity(1);
                this.showTimerBox();
                this.showAnswersSection();
                this.startPhaseTimer();
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME;
                this.hideTimerBox();
                
                // IMPORTANT : Valider la réponse maintenant (fin phase 1)
                this.finalizeUserAnswer();
                
                // Cacher les boutons
                this.hideAnswersSection();
                
                // Afficher la réponse sur le côté
                this.showAnswerDisplay();
                
                // FONDU pour voir la vidéo
                this.fadeOutBlackOverlay();
                
                // Démarrer le timer de phase 2
                this.startPhaseTimer();
                
                // Passer automatiquement après 10 secondes
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
                    console.log('⏰ Fin phase 1 - Passage en phase 2');
                    this.startPhase(2);
                }
            }
        }, 1000);
    }
    
    // VALIDER LA RÉPONSE UTILISATEUR
    finalizeUserAnswer() {
        if (!window.gameManager || !window.gameManager.questionManager) {
            console.error('❌ GameManager ou QuestionManager non disponible');
            return;
        }
        
        const qm = window.gameManager.questionManager;
        console.log('🔒 Validation réponse utilisateur (fin phase 1)');
        console.log('- Bouton sélectionné:', qm.selectedButton?.textContent);
        
        // Valider la réponse sélectionnée
        if (typeof qm.finalizeSelection === 'function') {
            qm.finalizeSelection();
        }
        
        // Révéler les réponses
        if (typeof qm.revealAnswers === 'function') {
            qm.revealAnswers();
        }
        
        console.log('- Réponse validée:', qm.userAnswered);
        console.log('- Correct ?', qm.userAnswerCorrect);
    }
    
    // ... (les autres méthodes restent les mêmes que précédemment)
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
    
    // Dans PhaseManager.js, MODIFIER showAnswerDisplay()
showAnswerDisplay() {
    if (!window.gameManager || !window.gameManager.questionManager) return;
    
    const qm = window.gameManager.questionManager;
    const currentGame = qm.getCurrentGame();
    
    if (!currentGame) return;
    
    console.log(`📝 Affichage réponse côté: ${currentGame.name}`);
    
    // Créer ou mettre à jour l'affichage de la réponse
    let answerDisplay = document.getElementById('current-answer-display');
    
    if (answerDisplay) {
        answerDisplay.innerHTML = '';
    } else {
        answerDisplay = document.createElement('div');
        answerDisplay.id = 'current-answer-display';
        answerDisplay.className = 'answer-display';
        const answersColumn = document.querySelector('.answers-column');
        const nextBtn = document.getElementById('next-btn');
        
        if (answersColumn && nextBtn) {
            answersColumn.insertBefore(answerDisplay, nextBtn);
        }
    }
    
    // DÉTERMINER CE QU'ON AFFICHE
    let resultClass = 'no-answer';
    let statusText = 'PAS DE RÉPONSE';
    let icon = '❌';
    let userAnswerText = 'Aucune réponse donnée';
    let correctAnswerText = currentGame.name;
    let description = '';
    
    if (qm.hasUserAnswered()) {
        // L'utilisateur a répondu
        const userAnswer = qm.finalAnswer || qm.selectedButton?.textContent || 'Inconnu';
        userAnswerText = userAnswer;
        
        if (qm.userAnswerCorrect) {
            resultClass = 'correct';
            statusText = 'CORRECT !';
            icon = '🎉';
            description = `
                <div class="answer-detail">
                    <i class="fas fa-check-circle"></i>
                    Vous avez répondu : <strong>${userAnswerText}</strong>
                </div>
                <div class="answer-detail">
                    <i class="fas fa-trophy"></i>
                    Bravo ! C'était bien <strong>${correctAnswerText}</strong>
                </div>
            `;
        } else {
            resultClass = 'incorrect';
            statusText = 'INCORRECT';
            icon = '❌';
            description = `
                <div class="answer-detail">
                    <i class="fas fa-times-circle"></i>
                    Vous avez répondu : <strong>${userAnswerText}</strong>
                </div>
                <div class="answer-detail">
                    <i class="fas fa-lightbulb"></i>
                    La bonne réponse était : <strong>${correctAnswerText}</strong>
                </div>
            `;
        }
    } else {
        // Pas de réponse
        description = `
            <div class="answer-detail">
                <i class="fas fa-clock"></i>
                Temps écoulé ! Aucune réponse donnée.
            </div>
            <div class="answer-detail">
                <i class="fas fa-info-circle"></i>
                La réponse était : <strong>${correctAnswerText}</strong>
            </div>
        `;
    }
    
    // Créer le contenu
    answerDisplay.innerHTML = `
        <div class="answer-display-content ${resultClass}">
            <div class="answer-icon">${icon}</div>
            <div class="answer-game-name">${currentGame.name}</div>
            <div class="answer-status">${statusText}</div>
            <div class="answer-description">
                ${description}
            </div>
        </div>
    `;
    
    // Afficher avec animation
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
            answersSection.style.opacity = '1';
        }
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'grid';
            answersGrid.style.opacity = '1';
        }
    }
    
    hideAnswersSection() {
        const answersSection = document.getElementById('answers-section');
        if (answersSection) {
            answersSection.style.display = 'none';
            answersSection.style.opacity = '0';
        }
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'none';
            answersGrid.style.opacity = '0';
        }
    }
    
    endPhase() {
        console.log('🏁 Fin de phase 2');
        
        this.clearTimers();
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
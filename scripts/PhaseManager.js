// scripts/PhaseManager.js - VERSION SIMPLIFIÉE ET CORRIGÉE
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
        
        console.log('⏱️ PhaseManager initialisé avec config:', CONFIG);
    }
    
    startPhase(phaseNumber) {
        console.log(`🔄 Début phase ${phaseNumber}`);
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = CONFIG.PHASE1_TIME; // 20 secondes
                this.setBlackOverlayOpacity(1);
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                
                // Afficher les réponses
                this.showAnswersSection();
                this.startPhaseTimer();
                break;
                
            case 2:
                this.phaseTimer = CONFIG.PHASE2_TIME; // 10 secondes
                this.timerBox.classList.add('hidden');
                
                // Cacher les réponses
                this.hideAnswersSection();
                
                // Afficher la réponse
                this.showAnswerDisplay();
                this.showResult();
                
                // FONDU du masque noir pour révéler la vidéo
                this.fadeOutBlackOverlay();
                
                // DÉMARRER LE TIMER POUR LA PHASE 2
                this.startPhaseTimer();
                
                // Après 10 secondes, passer à la question suivante
                setTimeout(() => {
                    console.log('⏰ 10 secondes écoulées - Fin phase 2');
                    this.endPhase();
                }, this.phaseTimer * 1000);
                
                break;
        }
    }
    
    // NOUVELLE MÉTHODE : Démarrer le timer
    startPhaseTimer() {
        this.clearTimers();
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    updatePhaseTimer() {
        this.phaseTimer--;
        
        if (this.currentPhase === 1) {
            this.timerCount.textContent = this.phaseTimer;
        }
        
        if (this.phaseTimer <= 0) {
            if (this.currentPhase === 1) {
                this.startPhase(2);
            }
        }
    }
    
    fadeOutBlackOverlay() {
        if (!this.blackOverlay) return;
        
        console.log('🌅 Début du fondu du masque noir (3 secondes)');
        
        // Animation simple avec transition CSS
        this.blackOverlay.style.transition = 'background-color 3s ease';
        this.blackOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        
        // Vérifier que c'est bien appliqué
        setTimeout(() => {
            console.log('✅ Masque noir devrait être transparent');
        }, 3100);
    }
    
    fadeInBlackOverlay() {
        if (!this.blackOverlay) return;
        
        console.log('🌑 Réapparition du masque noir (1 seconde)');
        
        // Réappliquer le masque noir
        this.blackOverlay.style.transition = 'background-color 1s ease';
        this.blackOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
    }
    
    setBlackOverlayOpacity(opacity) {
        if (this.blackOverlay) {
            this.blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
    }
    
    showAnswerDisplay() {
        if (!window.gameManager || !window.gameManager.questionManager) return;
        
        const qm = window.gameManager.questionManager;
        const currentGame = qm.getCurrentGame();
        
        if (!currentGame) return;
        
        console.log(`📝 Affichage réponse: ${currentGame.name}`);
        
        // Créer l'affichage de la réponse
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
        
        // Afficher après un délai
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
    
    showAnswersSection() {
        if (this.answersSection) {
            this.answersSection.style.display = 'block';
            this.answersSection.style.opacity = '1';
        }
        if (this.answersGrid) {
            this.answersGrid.style.display = 'grid';
            this.answersGrid.style.opacity = '1';
        }
    }
    
    hideAnswersSection() {
        if (this.answersSection) {
            this.answersSection.style.display = 'none';
            this.answersSection.style.opacity = '0';
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
        
        // Mettre à jour la boîte de résultat
        const resultIconEl = document.querySelector('.result-icon');
        const resultGameNameEl = document.querySelector('.result-game-name');
        const resultStatusEl = document.querySelector('.result-status');
        
        if (resultIconEl) resultIconEl.textContent = resultIcon;
        if (resultGameNameEl) resultGameNameEl.textContent = currentGame.name;
        if (resultStatusEl) resultStatusEl.textContent = statusText;
        
        const resultBox = document.getElementById('result-box');
        if (resultBox) {
            resultBox.className = `result-box ${resultClass}`;
            setTimeout(() => {
                resultBox.classList.add('active');
            }, 100);
        }
    }
    
    endPhase() {
        console.log('🏁 Fin de phase 2');
        
        this.clearTimers();
        
        const resultBox = document.getElementById('result-box');
        if (resultBox) {
            resultBox.classList.remove('active');
        }
        
        // Réappliquer le masque noir
        this.fadeInBlackOverlay();
        
        // Attendre 1 seconde puis passer à la question suivante
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
        
        const timerBox = document.getElementById('timer-box');
        if (timerBox) {
            timerBox.classList.remove('hidden');
        }
        
        const timerCount = document.querySelector('.timer-count');
        if (timerCount) {
            timerCount.textContent = this.phaseTimer;
        }
        
        const resultBox = document.getElementById('result-box');
        if (resultBox) {
            resultBox.classList.remove('active');
        }
        
        // Réafficher les réponses
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
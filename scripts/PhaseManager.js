// scripts/PhaseManager.js - Version corrigée
class PhaseManager {
    constructor() {
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME; // Utilise la config par défaut
        this.phaseInterval = null;
        this.onPhaseComplete = null;
        
        // Éléments DOM
        this.blackOverlay = document.getElementById('black-overlay');
        this.resultBox = document.getElementById('result-box');
        this.timerBox = document.getElementById('timer-box');
        this.timerCount = document.querySelector('.timer-count');
        this.answersSection = document.getElementById('answers-section');
        
        // NOUVEAU : Obtenir la configuration dynamique du GameManager
        this.getDynamicConfig();
    }
    
    // NOUVELLE MÉTHODE : Récupérer la configuration dynamique
    getDynamicConfig() {
        if (window.gameManager) {
            // Vérifier si on est en mode session
            if (window.gameManager.session && window.gameManager.session.settings) {
                this.phase1Time = window.gameManager.session.settings.phase1Time;
                this.phase2Time = window.gameManager.session.settings.phase2Time;
            } else {
                // Mode solo : utiliser CONFIG
                this.phase1Time = CONFIG.PHASE1_TIME;
                this.phase2Time = CONFIG.PHASE2_TIME;
            }
        } else {
            // Fallback à CONFIG
            this.phase1Time = CONFIG.PHASE1_TIME;
            this.phase2Time = CONFIG.PHASE2_TIME;
        }
        
        console.log(`⏱️ Configuration dynamique : Phase1=${this.phase1Time}s, Phase2=${this.phase2Time}s`);
    }
    
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        // Mettre à jour la configuration dynamique
        this.getDynamicConfig();
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = this.phase1Time; // Utiliser le temps dynamique
                this.setBlackOverlayOpacity(1);
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                this.answersSection.classList.remove('hidden');
                break;
                
            case 2:
                this.phaseTimer = this.phase2Time; // Utiliser le temps dynamique
                this.timerBox.classList.add('hidden');
                this.answersSection.classList.add('hidden');
                
                // NOUVEAU : Utiliser le temps de fade dynamique
                const fadeDuration = Math.min(this.phase2Time * 300, 7000); // Maximum 7 secondes
                
                // Afficher le résultat dans la colonne
                this.displayAnswerInColumn();
                
                // Effets visuels sur la vidéo
                setTimeout(() => {
                    this.fadeOutBlackOverlay(fadeDuration);
                }, 1000);
                
                setTimeout(() => {
                    this.fadeInBlackOverlay(fadeDuration);
                }, 1000 + fadeDuration);
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
    
    fadeOutBlackOverlay(duration = 3000) {
        if (!this.blackOverlay) return;
        
        let opacity = 1;
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
    
    fadeInBlackOverlay(duration = 3000) {
        if (!this.blackOverlay) return;
        
        let opacity = 0;
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
    
// Dans PhaseManager.js - MODIFIER displayAnswerInColumn()
displayAnswerInColumn() {
    if (!window.gameManager || !window.gameManager.questionManager) return;
    
    const qm = window.gameManager.questionManager;
    const currentGame = qm.getCurrentGame();
    if (!currentGame) return;
    
    // NOUVEAU : Appeler les fonctions pour finaliser et révéler
    if (typeof qm.finalizeAnswer === 'function') {
        qm.finalizeAnswer();
    }
    
    if (typeof qm.revealAnswers === 'function') {
        qm.revealAnswers();
    }
    
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
        
        // S'assurer qu'on l'ajoute au bon endroit
        const answersSection = document.querySelector('.answers-section');
        if (answersSection) {
            // Placer AVANT le bouton suivant
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn && nextBtn.parentNode === answersSection) {
                answersSection.insertBefore(resultContainer, nextBtn);
            } else {
                answersSection.appendChild(resultContainer);
            }
        }
    }
    
    // Déterminer le statut
    let statusClass = 'no-answer';
    let statusIcon = '❌';
    let statusText = 'PAS DE RÉPONSE';
    
    if (qm.hasUserAnswered && qm.hasUserAnswered()) {
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
    
    // Obtenir la réponse de l'utilisateur
    let userAnswerText = 'Aucune';
    if (qm.hasUserAnswered && qm.hasUserAnswered()) {
        if (qm.selectedButton && qm.selectedButton.textContent) {
            userAnswerText = qm.selectedButton.textContent;
        }
    }
    
    // Mettre à jour le contenu
    resultContainer.innerHTML = `
        <div class="answer-result-content ${statusClass}">
            <div class="answer-result-icon">${statusIcon}</div>
            <h3 class="answer-result-title">${statusText}</h3>
            
            <div class="answer-result-game">
                <div class="game-label">RÉPONSE :</div>
                <div class="game-name">${currentGame.name}</div>
            </div>
            
            <div class="answer-result-stats">
                <div class="stats-row">
                    <span>Votre choix :</span>
                    <span class="user-answer ${qm.userAnswerCorrect ? 'correct' : 'incorrect'}">
                        ${userAnswerText}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    resultContainer.style.display = 'block';
    
    // NOUVEAU : Afficher le bouton suivant
    setTimeout(() => {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'flex';
        }
    }, 1000);
}
    
    // Le reste du code reste identique...
    setBlackOverlayOpacity(opacity) {
        if (this.blackOverlay) {
            this.blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
    }
    
    endPhase() {
        this.clearTimers();
        
        // Cacher les résultats sur la vidéo
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
        
        // Recharger la config dynamique
        this.getDynamicConfig();
        this.phaseTimer = this.phase1Time;
        
        this.setBlackOverlayOpacity(1);
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        
        // Cacher les résultats
        this.resultBox.classList.remove('active');
        this.resultBox.className = 'result-box';
        this.answersSection.classList.remove('hidden');
        
        // Cacher le résultat dans la colonne
        const resultContainer = document.getElementById('answer-result-container');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
    }
}
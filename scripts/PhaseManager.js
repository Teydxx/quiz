// scripts/PhaseManager.js - VERSION CORRECTE
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
        
        // Configuration dynamique
        this.getDynamicConfig();
    }
    
    getDynamicConfig() {
        if (window.gameManager && window.gameManager.session && window.gameManager.session.settings) {
            this.phase1Time = window.gameManager.session.settings.phase1Time;
            this.phase2Time = window.gameManager.session.settings.phase2Time;
        } else {
            this.phase1Time = CONFIG.PHASE1_TIME;
            this.phase2Time = CONFIG.PHASE2_TIME;
        }
    }
    
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        this.getDynamicConfig();
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = this.phase1Time;
                this.setBlackOverlayOpacity(1);
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                this.resultBox.classList.remove('active');
                this.answersSection.classList.remove('hidden');
                break;
                
            case 2:
                this.phaseTimer = this.phase2Time;
                this.timerBox.classList.add('hidden');
                this.answersSection.classList.add('hidden');
                
                // AFFICHER LA RÉPONSE DANS LA COLONNE
                this.showAnswerInColumn();
                
                // Faire apparaître la vidéo
                setTimeout(() => {
                    this.fadeOutBlackOverlay(3000);
                }, 500);
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
    
    // LA FONCTION IMPORTANTE : Affiche la réponse dans la colonne
    showAnswerInColumn() {
        const qm = window.gameManager?.questionManager;
        if (!qm) return;
        
        const currentGame = qm.getCurrentGame();
        if (!currentGame) return;
        
        // FINALISER la réponse
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
        
        // Créer l'affichage de la réponse
        const answersSection = document.querySelector('.answers-section');
        if (!answersSection) return;
        
        // DÉTERMINER LES COULEURS
        let statusColor = '#747d8c'; // Gris
        let statusText = 'PAS DE RÉPONSE';
        let statusIcon = '⏰';
        
        if (qm.hasUserAnswered()) {
            if (qm.userAnswerCorrect) {
                statusColor = '#2ed573'; // Vert
                statusText = 'CORRECT !';
                statusIcon = '🎉';
            } else {
                statusColor = '#ff4757'; // Rouge
                statusText = 'INCORRECT';
                statusIcon = '❌';
            }
        }
        
        // HTML de la réponse
        const answerHTML = `
            <div id="current-answer-display" style="
                border: 3px solid ${statusColor};
                background: ${statusColor}15;
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
                text-align: center;
                animation: fadeIn 0.5s ease;
            ">
                <div style="font-size: 3rem; margin-bottom: 15px; color: ${statusColor}">
                    ${statusIcon}
                </div>
                
                <h3 style="color: ${statusColor}; margin-bottom: 25px; font-size: 1.8rem;">
                    ${statusText}
                </h3>
                
                <div style="
                    background: rgba(0,0,0,0.2);
                    padding: 20px;
                    border-radius: 10px;
                    border-left: 5px solid ${statusColor};
                    margin: 15px 0;
                ">
                    <div style="color: #a4b0be; font-size: 0.9rem; margin-bottom: 10px;">
                        LA RÉPONSE ÉTAIT :
                    </div>
                    <div style="color: white; font-size: 2rem; font-weight: bold;">
                        ${currentGame.name}
                    </div>
                </div>
                
                ${qm.hasUserAnswered() ? `
                    <div style="
                        background: rgba(255,255,255,0.05);
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #a4b0be;">Votre choix :</span>
                            <span style="color: ${qm.userAnswerCorrect ? '#2ed573' : '#ff4757'}; font-weight: bold;">
                                ${qm.selectedButton?.textContent || 'Aucune'}
                            </span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Ajouter après le titre
        const title = answersSection.querySelector('h3');
        if (title) {
            title.insertAdjacentHTML('afterend', answerHTML);
        } else {
            answersSection.innerHTML = `<h3>RÉSULTAT</h3>` + answerHTML;
        }
        
        // Afficher le bouton suivant
        setTimeout(() => {
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn) nextBtn.style.display = 'flex';
        }, 1000);
    }
    
    setBlackOverlayOpacity(opacity) {
        if (this.blackOverlay) {
            this.blackOverlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
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
    
    // RESET : SUPPRIME LA RÉPONSE AFFICHÉE
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = this.phase1Time;
        
        this.setBlackOverlayOpacity(1);
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        this.resultBox.classList.remove('active');
        this.answersSection.classList.remove('hidden');
        
        // SUPPRIMER LA RÉPONSE AFFICHÉE
        const answerDisplay = document.getElementById('current-answer-display');
        if (answerDisplay) {
            answerDisplay.remove();
        }
        
        // RÉAFFICHER LA GRILLE
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'grid';
        }
    }
}
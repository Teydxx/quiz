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
        
        console.log('⏱️ PhaseManager initialisé');
    }
    
    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        // Récupérer config dynamique
        let phase1Time = CONFIG.PHASE1_TIME;
        let phase2Time = CONFIG.PHASE2_TIME;
        
        if (window.gameManager && window.gameManager.session && window.gameManager.session.settings) {
            phase1Time = window.gameManager.session.settings.phase1Time || CONFIG.PHASE1_TIME;
            phase2Time = window.gameManager.session.settings.phase2Time || CONFIG.PHASE2_TIME;
        }
        
        console.log(`▶️ Démarrage Phase ${phaseNumber}: ${phaseNumber === 1 ? phase1Time : phase2Time}s`);
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = phase1Time;
                this.setBlackOverlayOpacity(1);
                
                // AFFICHER le timer
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                
                // CACHER le résultat
                this.resultBox.classList.remove('active');
                
                // FORCER l'affichage de la grille de réponses
                this.showAnswerButtons();
                
                break;
                
            case 2:
                this.phaseTimer = phase2Time;
                
                // CACHER le timer
                this.timerBox.classList.add('hidden');
                
                // Faire apparaître la vidéo
                setTimeout(() => {
                    this.fadeOutBlackOverlay(3000);
                }, 500);
                
                // AFFICHER la réponse dans la colonne
                setTimeout(() => {
                    this.showAnswerInColumn();
                }, 1000);
                
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
    
    // Affiche la réponse dans la colonne
    showAnswerInColumn() {
        console.log('📋 Affichage réponse dans colonne');
        
        const qm = window.gameManager?.questionManager;
        if (!qm) {
            console.error('❌ QuestionManager non trouvé');
            return;
        }
        
        const currentGame = qm.getCurrentGame();
        if (!currentGame) {
            console.error('❌ Jeu actuel non trouvé');
            return;
        }
        
        // CACHER les boutons de réponse
        this.hideAnswerButtons();
        
        // Finaliser la réponse
        if (typeof qm.finalizeAnswer === 'function') {
            qm.finalizeAnswer();
        }
        
        if (typeof qm.revealAnswers === 'function') {
            qm.revealAnswers();
        }
        
        // Nettoyer toute ancienne réponse
        this.cleanAnswerDisplay();
        
        // Créer la nouvelle réponse
        const answersSection = document.querySelector('.answers-section');
        if (!answersSection) {
            console.error('❌ Section réponses non trouvée');
            return;
        }
        
        // Déterminer couleurs et texte
        let statusColor = '#747d8c';
        let statusText = 'PAS DE RÉPONSE';
        let statusIcon = '⏰';
        
        if (qm.hasUserAnswered && qm.hasUserAnswered()) {
            if (qm.userAnswerCorrect) {
                statusColor = '#2ed573';
                statusText = 'CORRECT !';
                statusIcon = '🎉';
            } else {
                statusColor = '#ff4757';
                statusText = 'INCORRECT';
                statusIcon = '❌';
            }
        }
        
        // Créer l'élément de réponse
        const answerDiv = document.createElement('div');
        answerDiv.id = 'current-answer-display';
        answerDiv.className = 'answer-display';
        answerDiv.style.cssText = `
            border: 3px solid ${statusColor};
            background: ${statusColor}15;
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            text-align: center;
            animation: fadeIn 0.5s ease;
        `;
        
        // Contenu
        let userChoiceHTML = '';
        if (qm.hasUserAnswered && qm.hasUserAnswered()) {
            const userAnswer = qm.selectedButton?.textContent || 'Aucune';
            const choiceColor = qm.userAnswerCorrect ? '#2ed573' : '#ff4757';
            userChoiceHTML = `
                <div style="
                    background: rgba(255,255,255,0.05);
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 15px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #a4b0be;">Votre choix :</span>
                        <span style="color: ${choiceColor}; font-weight: bold;">
                            ${userAnswer}
                        </span>
                    </div>
                </div>
            `;
        }
        
        answerDiv.innerHTML = `
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
            
            ${userChoiceHTML}
        `;
        
        // Ajouter après le titre
        const title = answersSection.querySelector('h3');
        if (title) {
            title.insertAdjacentElement('afterend', answerDiv);
        } else {
            answersSection.innerHTML = `<h3>RÉSULTAT</h3>`;
            answersSection.appendChild(answerDiv);
        }
        
        // Afficher le bouton suivant
        setTimeout(() => {
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn) {
                nextBtn.style.display = 'flex';
            }
        }, 1000);
        
        console.log('✅ Réponse affichée:', currentGame.name);
    }
    
    // Afficher les boutons de réponse
    showAnswerButtons() {
        console.log('🔧 Affichage boutons de réponse...');
        
        // S'assurer que la section est visible
        if (this.answersSection) {
            this.answersSection.style.display = 'block';
            this.answersSection.style.opacity = '1';
            console.log('✅ Section réponses visible');
        }
        
        // S'assurer que la grille est visible
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'grid';
            answersGrid.style.opacity = '1';
            answersGrid.style.visibility = 'visible';
            answersGrid.style.gridTemplateColumns = '1fr';
            
            // Vérifier si des boutons sont présents
            const buttons = answersGrid.querySelectorAll('.answer-btn');
            console.log(`✅ ${buttons.length} boutons dans la grille`);
            
            if (buttons.length === 0) {
                console.warn('⚠️ Aucun bouton trouvé !');
                
                // Forcer le QuestionManager à recréer les boutons
                if (window.gameManager && window.gameManager.questionManager) {
                    console.log('🔄 Recréation des boutons...');
                    window.gameManager.questionManager.createAnswerButtons();
                }
            }
        } else {
            console.error('❌ answers-grid non trouvé !');
        }
    }
    
    // Cacher les boutons de réponse
    hideAnswerButtons() {
        console.log('🔧 Masquage des boutons de réponse...');
        
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'none';
            answersGrid.style.opacity = '0';
            console.log('✅ Boutons masqués');
        }
    }
    
    // Nettoie l'affichage de réponse
    cleanAnswerDisplay() {
        // Supprimer par ID
        const oldAnswer = document.getElementById('current-answer-display');
        if (oldAnswer) {
            oldAnswer.remove();
            console.log('🗑️ Ancienne réponse supprimée');
        }
        
        // Nettoyer aussi d'autres éléments possibles
        const answersSection = document.querySelector('.answers-section');
        if (answersSection) {
            // Garder seulement h3, #answers-grid, #next-btn
            const elements = answersSection.querySelectorAll('*');
            elements.forEach(el => {
                if (el.tagName !== 'H3' && 
                    el.id !== 'answers-grid' && 
                    el.id !== 'next-btn' &&
                    !el.classList.contains('answers-grid')) {
                    el.remove();
                }
            });
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
    
    // Reset complet
    reset() {
        console.log('🔄 PhaseManager reset');
        
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        this.setBlackOverlayOpacity(1);
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        this.resultBox.classList.remove('active');
        
        // Nettoyer réponse
        this.cleanAnswerDisplay();
        
        // Réafficher grille
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'grid';
        }
        
        // S'assurer que la section est visible
        if (this.answersSection) {
            this.answersSection.style.display = 'block';
        }
    }
}
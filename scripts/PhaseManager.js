// scripts/PhaseManager.js - VERSION COMPLÈTE CORRIGÉE
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
        
        console.log('⏱️ PhaseManager initialisé');
    }
    
    startPhase(phaseNumber) {
        console.log(`▶️ Phase ${phaseNumber}`);
        
        this.currentPhase = phaseNumber;
        this.clearTimers();
        
        let phase1Time = CONFIG.PHASE1_TIME;
        let phase2Time = CONFIG.PHASE2_TIME;
        
        if (window.gameManager && window.gameManager.session && window.gameManager.session.settings) {
            phase1Time = window.gameManager.session.settings.phase1Time || CONFIG.PHASE1_TIME;
            phase2Time = window.gameManager.session.settings.phase2Time || CONFIG.PHASE2_TIME;
        }
        
        switch(phaseNumber) {
            case 1:
                this.phaseTimer = phase1Time;
                this.setBlackOverlayOpacity(1);
                
                // AFFICHER le timer
                this.timerBox.classList.remove('hidden');
                this.timerCount.textContent = this.phaseTimer;
                
                // CACHER le résultat
                this.resultBox.classList.remove('active');
                
                // AFFICHER les boutons
                this.showAnswerButtons();
                
                break;
                
            case 2:
                this.phaseTimer = phase2Time;
                
                // CACHER le timer
                this.timerBox.classList.add('hidden');
                
                // FINALISER la sélection
                const qm = window.gameManager?.questionManager;
                if (qm && !qm.userAnswered) {
                    qm.finalizeSelection();
                }
                
                // CACHER les boutons
                this.hideAnswerButtons();
                
                // Faire apparaître la vidéo
                setTimeout(() => {
                    this.fadeOutBlackOverlay(2000);
                }, 500);
                
                // Afficher la réponse
                setTimeout(() => {
                    this.showAnswerInColumn();
                }, 1500);
                break;
        }
        
        this.phaseInterval = setInterval(() => this.updatePhaseTimer(), 1000);
    }
    
    updatePhaseTimer() {
        this.phaseTimer--;
        
        if (this.currentPhase === 1) {
            this.timerCount.textContent = this.phaseTimer;
            
            if (this.phaseTimer <= 0) {
                console.log('⏱️ Temps écoulé - Passage phase 2');
                this.startPhase(2);
            }
        } else if (this.currentPhase === 2) {
            if (this.phaseTimer <= 0) {
                this.clearTimers();
                this.endPhase();
            }
        }
    }
    
    // Affiche la réponse dans la colonne
    showAnswerInColumn() {
    console.log('\n📋 ========== AFFICHAGE RÉPONSE PHASE 2 ==========');
    
    // D'ABORD, cacher définitivement les boutons
    this.hideAnswerButtons();
    
    // Ensuite, afficher la réponse
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
    
    console.log(`📋 Jeu: ${currentGame.name}`);
    
    // Finaliser l'affichage des réponses
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
    
    // S'assurer que la section est visible
    answersSection.style.display = 'block';
    answersSection.style.opacity = '1';
    
    // Déterminer couleurs et texte
    let statusColor = '#747d8c';
    let statusText = 'PAS DE RÉPONSE';
    let statusIcon = '⏰';
    
    if (qm.hasUserAnswered()) {
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
    if (qm.hasUserAnswered()) {
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
    
    // VIDER la section et ajouter la réponse
    answersSection.innerHTML = '';
    answersSection.appendChild(answerDiv);
    
    // Afficher le bouton suivant EN DESSOUS
    setTimeout(() => {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'flex';
            nextBtn.style.marginTop = '20px';
            console.log('✅ Bouton suivant affiché');
        }
    }, 500);
    
    console.log('✅ Réponse affichée dans la colonne (boutons cachés)');
}
    
    // Afficher les boutons
    showAnswerButtons() {
        const answersGrid = document.getElementById('answers-grid');
        if (answersGrid) {
            answersGrid.style.display = 'grid';
            answersGrid.style.opacity = '1';
        }
    }
    
    // Cacher les boutons
    hideAnswerButtons() {
    console.log('🔧 Masquage des boutons pour phase 2');
    
    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) {
        // Masquer COMPLÈTEMENT la grille
        answersGrid.style.display = 'none';
        answersGrid.style.opacity = '0';
        answersGrid.style.visibility = 'hidden';
        answersGrid.style.height = '0';
        answersGrid.style.overflow = 'hidden';
        
        // Masquer aussi le titre "Quel est ce jeu vidéo ?"
        const answersSection = document.querySelector('.answers-section');
        if (answersSection) {
            const title = answersSection.querySelector('h3');
            if (title) {
                title.style.display = 'none';
            }
        }
        
        console.log('✅ Boutons masqués pour phase 2');
    }
}
    
    fadeOutBlackOverlay(duration = 2000) {
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
        }, 500);
    }
    
    clearTimers() {
        if (this.phaseInterval) {
            clearInterval(this.phaseInterval);
            this.phaseInterval = null;
        }
    }
    
    // Reset
    reset() {
        this.clearTimers();
        this.currentPhase = 1;
        this.phaseTimer = CONFIG.PHASE1_TIME;
        
        this.setBlackOverlayOpacity(1);
        this.timerBox.classList.remove('hidden');
        this.timerCount.textContent = this.phaseTimer;
        this.resultBox.classList.remove('active');
        
        this.cleanAnswerDisplay();
        this.showAnswerButtons();
    }
}
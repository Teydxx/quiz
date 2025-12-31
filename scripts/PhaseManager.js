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
    this.phaseTimer = this.phase2Time;
    this.timerBox.classList.add('hidden');
    
    // SIMPLE : Appeler la fonction
    this.displayAnswerInColumn();
    
    // Fade de la vidéo
    setTimeout(() => {
        if (this.fadeOutBlackOverlay) {
            this.fadeOutBlackOverlay(3000);
        }
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
    
displayAnswerInColumn() {
    console.log('🔄 Affichage réponse dans colonne...');
    
    // 1. Cacher les boutons de réponse
    const answersGrid = document.getElementById('answers-grid');
    if (answersGrid) {
        answersGrid.style.display = 'none';
    }
    
    // 2. Récupérer les données MANUELLEMENT
    const qm = window.gameManager?.questionManager;
    if (!qm) {
        console.error('❌ QuestionManager non trouvé');
        return;
    }
    
    // FORCER la récupération des données
    const currentGame = qm.getCurrentGame ? qm.getCurrentGame() : null;
    if (!currentGame) {
        console.error('❌ Jeu actuel non trouvé');
        return;
    }
    
    console.log('✅ Jeu trouvé:', currentGame.name);
    
    // 3. Afficher DIRECTEMENT dans answers-section
    const answersSection = document.querySelector('.answers-section');
    if (!answersSection) return;
    
    // Sauvegarder le h3 original
    const originalTitle = answersSection.querySelector('h3');
    
    // Créer le HTML de la réponse
    const resultHTML = `
        <div class="simple-result">
            <div class="result-status">
                ${qm.hasUserAnswered?.() ? (qm.userAnswerCorrect ? '🎉 CORRECT' : '❌ FAUX') : '⏰ PAS DE RÉPONSE'}
            </div>
            <div class="result-game">
                <div class="game-label">LA RÉPONSE ÉTAIT :</div>
                <div class="game-name">${currentGame.name}</div>
            </div>
            ${qm.hasUserAnswered?.() ? `
                <div class="user-choice">
                    Votre choix : <strong>${qm.selectedButton?.textContent || 'Aucune'}</strong>
                </div>
            ` : ''}
        </div>
    `;
    
    // Ajouter après le titre
    if (originalTitle) {
        originalTitle.insertAdjacentHTML('afterend', resultHTML);
    } else {
        answersSection.innerHTML = `<h3>RÉSULTAT</h3>` + resultHTML;
    }
    
    // 4. Appeler revealAnswers() pour les boutons
    if (typeof qm.revealAnswers === 'function') {
        qm.revealAnswers();
    }
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
    this.phaseTimer = this.phase1Time;
    
    this.setBlackOverlayOpacity(1);
    this.timerBox.classList.remove('hidden');
    this.timerCount.textContent = this.phaseTimer;
    
    // S'assurer que la section réponse est réinitialisée
    const answersSection = document.getElementById('answers-section');
    if (answersSection) {
        answersSection.classList.remove('hidden');
        answersSection.style.display = 'block';
    }
    
    console.log('🔄 PhaseManager réinitialisé');
}
}
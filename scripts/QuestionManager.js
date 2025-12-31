// scripts/QuestionManager.js - VERSION CORRIGÉE
class QuestionManager {
    constructor() {
        console.log('✅ QuestionManager initialisé');
        this.remainingGames = [...GAMES];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
    }

    init(totalQuestions) {
        this.totalQuestions = totalQuestions;
        const totalEl = document.getElementById('total-questions');
        if (totalEl) totalEl.textContent = totalQuestions;
        
        shuffleArray(this.remainingGames);
    }

    prepareQuestion(questionNumber) {
        console.log(`✅ Question ${questionNumber}`);
        
        // RESET COMPLET de l'état
        this.resetQuestionState();
        
        const countEl = document.getElementById('question-count');
        if (countEl) countEl.textContent = questionNumber;
        
        if (this.remainingGames.length === 0) {
            this.remainingGames = [...GAMES];
            shuffleArray(this.remainingGames);
        }
        
        // Sélectionner un jeu
        const index = Math.floor(Math.random() * this.remainingGames.length);
        this.currentGame = this.remainingGames[index];
        this.remainingGames.splice(index, 1);
        
        console.log(`🎮 Jeu: ${this.currentGame.name}`);
        
        // Créer les boutons
        this.createAnswerButtons();
        
        return true;
    }

    createAnswerButtons() {
        if (!this.currentGame) return;
        
        const correctAnswer = this.currentGame.name;
        const wrongGames = GAMES.filter(g => g.name !== correctAnswer);
        const wrongAnswers = shuffleArray([...wrongGames])
            .slice(0, 5)
            .map(g => g.name);
        
        const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
        const grid = document.getElementById('answers-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        allAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.dataset.correct = (answer === correctAnswer).toString();
            
            // CORRECTION : Gestion du clic
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectAnswer(button);
            });
            
            grid.appendChild(button);
        });
        
        grid.style.display = 'grid';
    }

    // CORRECTION CRITIQUE : Cette méthode doit bien enregistrer la réponse
    selectAnswer(clickedButton) {
        console.log(`🎯 Clic sur: ${clickedButton.textContent}`);
        
        // Si déjà répondu, on ne fait rien
        if (this.userAnswered) {
            console.log('⚠️ Déjà répondu');
            return;
        }
        
        // Si même bouton, désélectionner
        if (this.selectedButton === clickedButton) {
            console.log('↩️ Désélection');
            clickedButton.classList.remove('user-selected');
            this.selectedButton = null;
            return;
        }
        
        // Désélectionner ancien
        if (this.selectedButton) {
            this.selectedButton.classList.remove('user-selected');
        }
        
        // Sélectionner nouveau
        this.selectedButton = clickedButton;
        clickedButton.classList.add('user-selected');
        
        console.log(`✅ Réponse sélectionnée: ${clickedButton.textContent}`);
        
        // ENREGISTRER LA RÉPONSE IMMÉDIATEMENT
        this.userAnswered = true;
        this.userAnswerCorrect = clickedButton.dataset.correct === 'true';
        
        console.log(`📊 Correct ? ${this.userAnswerCorrect}`);
    }

    // Cette méthode est appelée par PhaseManager
    finalizeSelection() {
        console.log('🔒 Finalisation de la sélection');
        
        if (!this.selectedButton && !this.userAnswered) {
            console.log('❌ Aucune réponse donnée');
            this.userAnswered = false;
            this.userAnswerCorrect = false;
            return;
        }
        
        // Si on a déjà répondu via selectAnswer(), on ne fait rien
        if (this.userAnswered) {
            console.log('✅ Réponse déjà enregistrée');
            return;
        }
        
        // Sinon, enregistrer maintenant
        if (this.selectedButton) {
            this.userAnswered = true;
            this.userAnswerCorrect = this.selectedButton.dataset.correct === 'true';
            console.log(`📝 Réponse finalisée: ${this.userAnswerCorrect ? 'CORRECT' : 'INCORRECT'}`);
        }
    }

    // AJOUTER CETTE MÉTHODE POUR LE SCORE
    registerAnswer() {
        if (this.userAnswered && this.userAnswerCorrect) {
            this.correctAnswersCount++;
            console.log(`🎯 Score: ${this.correctAnswersCount}`);
        }
    }

    resetQuestionState() {
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        const grid = document.getElementById('answers-grid');
        if (grid) {
            grid.innerHTML = '';
            grid.style.display = 'grid';
        }
    }

    getCurrentGame() {
        return this.currentGame;
    }

    hasUserAnswered() {
        return this.userAnswered;
    }

    getCorrectCount() {
        return this.correctAnswersCount;
    }

    hasMoreQuestions() {
        return true;
    }

    // NOUVELLE MÉTHODE pour révéler les réponses
    revealAnswers() {
        console.log('🔍 Révélation des réponses');
        
        const buttons = document.querySelectorAll('.answer-btn');
        const currentGame = this.getCurrentGame();
        
        if (!currentGame) return;
        
        buttons.forEach(button => {
            const isCorrect = button.dataset.correct === 'true';
            
            if (isCorrect) {
                button.classList.add('correct');
                button.classList.add('correct-answer');
            } else if (button.classList.contains('user-selected')) {
                button.classList.add('incorrect');
            }
            
            button.disabled = true;
        });
        
        // Enregistrer le score
        this.registerAnswer();
    }
}
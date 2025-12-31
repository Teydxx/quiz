// scripts/QuestionManager.js - VERSION SIMPLE
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
            
            button.addEventListener('click', () => {
                this.selectAnswer(button);
            });
            
            grid.appendChild(button);
        });
        
        // Afficher la grille
        grid.style.display = 'grid';
    }

    selectAnswer(clickedButton) {
        if (this.userAnswered) return;
        
        console.log(`🎯 Clic: ${clickedButton.textContent}`);
        
        // Si même bouton, désélectionner
        if (this.selectedButton === clickedButton) {
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
    }

    finalizeSelection() {
        console.log('🔒 Finalisation');
        
        if (!this.selectedButton) {
            this.userAnswered = false;
            this.userAnswerCorrect = false;
            return;
        }
        
        this.userAnswered = true;
        this.userAnswerCorrect = this.selectedButton.dataset.correct === 'true';
        
        // Enregistrer
        const countEl = document.getElementById('question-count');
        this.resultsDetails.push({
            question: countEl ? parseInt(countEl.textContent) : 0,
            game: this.currentGame.name,
            userAnswer: this.selectedButton.textContent,
            isCorrect: this.userAnswerCorrect
        });
        
        if (this.userAnswerCorrect) {
            this.correctAnswersCount++;
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
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
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


// scripts/QuestionManager.js - AJOUTER ces méthodes à la classe

// AJOUTER cette méthode pour finaliser la réponse
finalizeAnswer() {
    console.log('✅ Finalisation de la réponse');
    this.finalizeSelection();
}

// AJOUTER cette méthode pour révéler les réponses
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
}

// AJOUTER cette méthode pour vider la grille
clearAnswersGrid() {
    const grid = document.getElementById('answers-grid');
    if (grid) {
        grid.innerHTML = '';
    }
}
}
// scripts/QuestionManager.js - VERSION QUI PERMET DE CHANGER D'AVIS
class QuestionManager {
    constructor() {
        console.log('✅ QuestionManager initialisé');
        this.remainingGames = [...GAMES];
        this.currentGame = null;
        
        // ÉTAT DE LA QUESTION COURANTE
        this.userAnswered = false;        // Finalisé ? (seulement en phase 2)
        this.userAnswerCorrect = false;   // La réponse finale est correcte ?
        this.selectedButton = null;       // Bouton actuellement sélectionné
        this.finalAnswer = null;          // Réponse finale validée
        
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
        
        // RESET COMPLET pour nouvelle question
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
            button.dataset.answer = answer;
            
            button.addEventListener('click', () => {
                this.selectAnswer(button);
            });
            
            grid.appendChild(button);
        });
        
        grid.style.display = 'grid';
    }

    // PERMET DE CHANGER D'AVIS PENDANT LA PHASE 1
    selectAnswer(clickedButton) {
        console.log(`🎯 Clic sur: ${clickedButton.textContent}`);
        
        // Pendant la phase 1, on peut toujours changer
        // (userAnswered = false tant que pas en phase 2)
        
        // Si on clique sur le même bouton, on le désélectionne
        if (this.selectedButton === clickedButton) {
            console.log('↩️ Désélection du bouton');
            clickedButton.classList.remove('user-selected');
            this.selectedButton = null;
            return;
        }
        
        // Désélectionner l'ancien bouton si existe
        if (this.selectedButton) {
            this.selectedButton.classList.remove('user-selected');
        }
        
        // Sélectionner le nouveau bouton
        this.selectedButton = clickedButton;
        clickedButton.classList.add('user-selected');
        
        console.log(`✅ Bouton sélectionné: ${clickedButton.textContent}`);
        console.log(`   (Pas encore validé - peut encore changer)`);
    }

    // VALIDATION FINALE (appelée à la fin de la phase 1)
    finalizeSelection() {
        console.log('🔒 VALIDATION FINALE de la réponse');
        
        if (!this.selectedButton) {
            console.log('❌ Aucune réponse sélectionnée');
            this.userAnswered = false;
            this.userAnswerCorrect = false;
            this.finalAnswer = null;
            return;
        }
        
        // Enregistrer la réponse finale
        this.userAnswered = true;
        this.userAnswerCorrect = this.selectedButton.dataset.correct === 'true';
        this.finalAnswer = this.selectedButton.textContent;
        
        console.log(`📝 Réponse validée: ${this.finalAnswer}`);
        console.log(`📊 Correct ? ${this.userAnswerCorrect}`);
        
        // Marquer le bouton comme "réponse finale"
        this.selectedButton.classList.add('final-selection');
    }

    // Calcul du score (appelé en phase 2)
    registerAnswer() {
        if (this.userAnswered && this.userAnswerCorrect) {
            this.correctAnswersCount++;
            console.log(`🏆 Score: ${this.correctAnswersCount}`);
        }
    }

    resetQuestionState() {
        // Réinitialiser pour nouvelle question
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.finalAnswer = null;
        
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

    // Révéler les bonnes/mauvaises réponses (phase 2)
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
            } else if (button === this.selectedButton) {
                // Si c'est le bouton que l'utilisateur a sélectionné (même si pas bon)
                button.classList.add('incorrect');
            }
            
            button.disabled = true;
        });
        
        // Enregistrer le score
        this.registerAnswer();
    }
}
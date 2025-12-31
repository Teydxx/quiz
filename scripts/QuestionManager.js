// scripts/QuestionManager.js
class QuestionManager {
    constructor() {
        this.remainingGames = [...GAMES];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        // Statistiques
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
        
        // Éléments DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.nextBtn = document.getElementById('next-btn');
        this.answersSection = document.getElementById('answers-section');
    }

    // Initialiser pour mode solo
    init(totalQuestions) {
        this.totalQuestions = totalQuestions;
        this.totalQuestionsEl.textContent = totalQuestions;
        this.resetStats();
        shuffleArray(this.remainingGames);
    }

    // Initialiser avec jeux spécifiques (mode session)
    initWithGames(games) {
        this.remainingGames = [...games];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.resetStats();
        
        shuffleArray(this.remainingGames);
        
        console.log(`📦 QuestionManager initialisé avec ${games.length} jeux de session`);
    }

    // Prépare une nouvelle question
    prepareQuestion(questionNumber) {
        if (this.remainingGames.length === 0) {
            return false;
        }

        this.resetQuestionState();
        this.questionCountEl.textContent = questionNumber;
        
        // Sélectionner un jeu aléatoire
        const randomIndex = Math.floor(Math.random() * this.remainingGames.length);
        this.currentGame = this.remainingGames[randomIndex];
        this.remainingGames.splice(randomIndex, 1);
        
        // Préparer les réponses
        this.prepareAnswers();
        
        return true;
    }

    // Prépare les boutons de réponse (6 choix maintenant)
    prepareAnswers() {
        const correctAnswer = this.currentGame.name;
        const wrongGames = GAMES.filter(game => game.name !== correctAnswer);
        
        // Prendre 5 mauvaises réponses au hasard
        const shuffledWrong = shuffleArray([...wrongGames]).slice(0, 5);
        const wrongAnswers = shuffledWrong.map(game => game.name);
        
        // Mélanger les 6 réponses (1 bonne + 5 mauvaises)
        const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        this.answersGrid.innerHTML = '';
        this.selectedButton = null;
        
        allAnswers.forEach((answer) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.dataset.correct = (answer === correctAnswer).toString();
            button.addEventListener('click', () => this.selectAnswer(button));
            this.answersGrid.appendChild(button);
        });
        
        this.userAnswered = false;
        this.userAnswerCorrect = false;
    }

    // Sélectionner une réponse
    selectAnswer(clickedButton) {
        if (!this.currentGame) return;
        
        // Désélectionner le bouton précédent
        if (this.selectedButton && this.selectedButton !== clickedButton) {
            this.selectedButton.classList.remove('user-selected');
        }
        
        // Sélectionner le nouveau bouton
        this.selectedButton = clickedButton;
        clickedButton.classList.add('user-selected');
        
        // Enregistrer la réponse
        this.userAnswered = true;
        this.userAnswerCorrect = clickedButton.dataset.correct === 'true';
        
        // Enregistrer pour statistiques
        this.recordAnswer(clickedButton.textContent, this.userAnswerCorrect);
        
        console.log(`🎯 Réponse: ${clickedButton.textContent} (${this.userAnswerCorrect ? 'correcte' : 'incorrecte'})`);
    }

    // Finaliser la réponse à la fin des 20s
    finalizeAnswer() {
        console.log('⏱️ Finalisation de la réponse');
        
        if (!this.userAnswered || !this.currentGame) {
            console.log('⏱️ Pas de réponse donnée');
            this.autoRevealAnswer();
            return;
        }
        
        // Désactiver tous les boutons
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        // Marquer la réponse finale
        if (this.selectedButton) {
            if (this.userAnswerCorrect) {
                this.selectedButton.classList.add('correct');
            } else {
                this.selectedButton.classList.add('incorrect');
            }
        }
        
        console.log(`📊 Réponse finalisée: ${this.userAnswerCorrect ? 'Correcte' : 'Incorrecte'}`);
    }

    // Révéler les réponses (phase 2)
    revealAnswers() {
        console.log('🔍 Révélation des réponses');
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        
        // Montrer la réponse correcte
        buttons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct-answer');
                btn.classList.add('correct');
            }
        });
        
        // Afficher le bouton suivant
        setTimeout(() => {
            this.showNextButton();
        }, 7000);
    }

    // Réponse automatique (temps écoulé sans réponse)
    autoRevealAnswer() {
        console.log('⏱️ autoRevealAnswer() - pas de réponse');
        
        if (this.userAnswered || !this.currentGame) return null;
        
        this.userAnswered = true;
        this.userAnswerCorrect = false;
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        console.log(`🔍 Pas de réponse - bonne réponse: ${this.currentGame.name}`);
        
        return {
            isCorrect: false,
            gameName: this.currentGame.name,
            userAnswered: false
        };
    }

    // Afficher le bouton suivant
    showNextButton() {
        if (this.nextBtn) {
            this.nextBtn.style.display = 'flex';
        }
    }

    // Réinitialiser pour nouvelle question
    reset() {
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        // Réafficher la grille de réponses
        this.answersGrid.style.display = 'grid';
        this.answersGrid.style.opacity = '1';
        this.answersGrid.style.transform = 'translateY(0)';
        this.answersGrid.style.transition = '';
        this.answersGrid.innerHTML = '';
        
        // Cacher le bouton suivant
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
        }
    }

    // Réinitialiser état question (sans reset stats)
    resetQuestionState() {
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        this.answersGrid.style.display = 'grid';
        this.answersGrid.style.opacity = '1';
        this.answersGrid.style.transform = 'translateY(0)';
        this.answersGrid.innerHTML = '';
        
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
        }
    }

    // Enregistrer une réponse pour statistiques
    recordAnswer(answer, isCorrect) {
        this.resultsDetails.push({
            question: this.questionCountEl ? parseInt(this.questionCountEl.textContent) : 0,
            game: this.currentGame ? this.currentGame.name : 'Inconnu',
            userAnswer: answer,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        });
        
        if (isCorrect) {
            this.correctAnswersCount++;
        }
    }

    // Réinitialiser les statistiques
    resetStats() {
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
    }

    // Obtenir le nombre de bonnes réponses
    getCorrectCount() {
        return this.correctAnswersCount;
    }

    // Obtenir les détails des résultats
    getResultsDetails() {
        return this.resultsDetails;
    }

    // Vérifier si l'utilisateur a répondu
    hasUserAnswered() {
        return this.userAnswered;
    }

    // Obtenir le jeu actuel
    getCurrentGame() {
        return this.currentGame;
    }

    // Vérifier s'il reste des questions
    hasMoreQuestions() {
        return this.remainingGames.length > 0;
    }

    // Cacher les réponses pour révélation
    hideAnswersForReveal() {
        console.log('🎮 Cacher les réponses pour révélation');
        
        this.answersGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.answersGrid.style.opacity = '0';
        this.answersGrid.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.answersGrid.style.display = 'none';
        }, 300);
    }
}

// Pas de double déclaration ici !
// Si tu as une autre déclaration "class QuestionManager" plus bas, SUPPRIME-LA
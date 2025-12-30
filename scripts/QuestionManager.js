class QuestionManager {
    constructor() {
        this.remainingGames = [...GAMES];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        // Éléments DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.nextBtn = document.getElementById('next-btn');
        this.answersSection = document.getElementById('answers-section'); // AJOUTÉ
    }

    // Initialiser
    init(totalQuestions) {
        this.totalQuestions = totalQuestions;
        this.totalQuestionsEl.textContent = totalQuestions;
        shuffleArray(this.remainingGames);
    }

    // Préparer une nouvelle question
    prepareQuestion(questionNumber) {
        if (this.remainingGames.length === 0) {
            return false;
        }

        this.reset();
        this.questionCountEl.textContent = questionNumber;
        
        // Sélectionner un jeu aléatoire
        const randomIndex = Math.floor(Math.random() * this.remainingGames.length);
        this.currentGame = this.remainingGames[randomIndex];
        this.remainingGames.splice(randomIndex, 1);
        
        // Préparer les réponses
        this.prepareAnswers();
        
        return true;
    }

    // Préparer les boutons de réponse
    prepareAnswers() {
        const correctAnswer = this.currentGame.name;
        const wrongGames = GAMES.filter(game => game.name !== correctAnswer);
        const shuffledWrong = shuffleArray([...wrongGames]).slice(0, 3);
        const wrongAnswers = shuffledWrong.map(game => game.name);
        
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

    // Sélectionner une réponse (pendant les 20s)
    selectAnswer(clickedButton) {
        if (!this.currentGame) return;
        
        // Désélectionner le bouton précédent s'il existe
        if (this.selectedButton && this.selectedButton !== clickedButton) {
            this.selectedButton.classList.remove('user-selected');
        }
        
        // Sélectionner le nouveau bouton
        this.selectedButton = clickedButton;
        clickedButton.classList.add('user-selected');
        
        // Enregistrer la réponse
        this.userAnswered = true;
        this.userAnswerCorrect = clickedButton.dataset.correct === 'true';
        
        console.log(`🎯 Réponse sélectionnée: ${clickedButton.textContent} (${this.userAnswerCorrect ? 'correcte' : 'incorrecte'})`);
    }

    // Finaliser la réponse à la fin des 20s
    finalizeAnswer() {
        console.log('⏰ Finalisation de la réponse (20s écoulées)');
        
        if (!this.userAnswered || !this.currentGame) {
            console.log('⏰ Pas de réponse donnée');
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
        
        console.log(`🏁 Réponse finalisée: ${this.userAnswerCorrect ? 'Correcte' : 'Incorrecte'}`);
    }

    // Révéler les réponses (appelé pendant la phase 2)
    revealAnswers() {
        console.log('🔍 Révélation des réponses (phase 2)');
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        
        // Maintenant on montre la réponse correcte
        buttons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct-answer');
                btn.classList.add('correct');
            }
        });
        
        // Afficher le bouton suivant APRÈS 7 secondes (quand le fade in commence)
        setTimeout(() => {
            this.showNextButton();
        }, 7000);
    }

    // Réponse automatique (temps écoulé sans réponse)
    autoRevealAnswer() {
        console.log('⏰ autoRevealAnswer() - temps écoulé sans réponse');
        
        if (this.userAnswered || !this.currentGame) return null;
        
        this.userAnswered = true;
        this.userAnswerCorrect = false;
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        console.log(`🔍 Pas de réponse - réponse correcte: ${this.currentGame.name}`);
        
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

    // Masquer le résultat (supprimé car non utilisé)
    // hideResult() {
    //     // Supprimé - cette fonction n'est plus nécessaire
    // }

    // Cacher les réponses pour révélation
    hideAnswersForReveal() {
        console.log('🎮 Cacher les réponses pour révélation');
        
        // Animation de disparition
        this.answersGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.answersGrid.style.opacity = '0';
        this.answersGrid.style.transform = 'translateY(20px)';
        
        // Cacher complètement après l'animation
        setTimeout(() => {
            this.answersGrid.style.display = 'none';
        }, 300);
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
}
// scripts/QuestionManager.js - AJOUTER CES MÉTHODES

class QuestionManager {
    constructor() {
        // ... code existant ...
        
        // AJOUTER:
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
    }
    
    // Initialiser avec des jeux spécifiques (pour session)
    initWithGames(games) {
        this.remainingGames = [...games];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
        
        // Mélanger les jeux
        shuffleArray(this.remainingGames);
        
        console.log(`ðŸ“‹ QuestionManager initialisé avec ${games.length} jeux de session`);
    }
    
    // ... reste du code existant ...
    
    // AJOUTER À LA FIN DE selectAnswer():
    selectAnswer(clickedButton) {
        // ... code existant ...
        
        // Enregistrer pour statistiques
        this.recordAnswer(clickedButton.textContent, this.userAnswerCorrect);
    }
    
    // Enregistrer une réponse
    recordAnswer(answer, isCorrect) {
        this.resultsDetails.push({
            question: this.currentQuestionNumber || 1,
            game: this.currentGame ? this.currentGame.name : 'Inconnu',
            userAnswer: answer,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        });
        
        if (isCorrect) {
            this.correctAnswersCount++;
        }
    }
    
    // Obtenir le nombre de bonnes réponses
    getCorrectCount() {
        return this.correctAnswersCount;
    }
    
    // Obtenir les détails des résultats
    getResultsDetails() {
        return this.resultsDetails;
    }
    
    // Réinitialiser les statistiques
    resetStats() {
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
    }
}
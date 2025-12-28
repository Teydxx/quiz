class QuestionManager {
    constructor() {
        this.remainingGames = [...GAMES];
        this.currentGame = null;
        this.userAnswered = false;
        
        // Éléments DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.resultEl = document.getElementById('result');
        this.nextBtn = document.getElementById('next-btn');
    }

        hasUserAnswered() {
            return this.userAnswered;
        }

        // S'assurer que autoRevealAnswer() retourne bien l'objet :
        autoRevealAnswer() {
            if (this.userAnswered || !this.currentGame) return null;
            
            this.userAnswered = true;
            const buttons = this.answersGrid.querySelectorAll('.answer-btn');
            
            buttons.forEach(btn => {
                btn.disabled = true;
                if (btn.dataset.correct === 'true') {
                    btn.classList.add('correct');
                }
            });
            
            this.showResult(false);
            
            return {
                isCorrect: false,
                gameName: this.currentGame.name,
                userAnswered: false
            };
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
            return false; // Plus de jeux disponibles
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
        
        const allAnswers = [correctAnswer, ...wrongAnswers];
        shuffleArray(allAnswers);
        
        this.answersGrid.innerHTML = '';
        allAnswers.forEach((answer) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.dataset.correct = (answer === correctAnswer).toString();
            button.addEventListener('click', () => this.checkAnswer(button));
            this.answersGrid.appendChild(button);
        });
        
        this.userAnswered = false;
    }

    // Vérifier la réponse
    checkAnswer(clickedButton) {
        if (this.userAnswered || !this.currentGame) return;
        
        this.userAnswered = true;
        const isCorrect = clickedButton.dataset.correct === 'true';
        
        // Désactiver tous les boutons
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        // Marquer les bonnes/mauvaises réponses
        buttons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === clickedButton) {
                btn.classList.add('incorrect');
            }
        });
        
        // Afficher le résultat
        this.showResult(isCorrect);
        
        return {
            isCorrect: isCorrect,
            gameName: this.currentGame.name,
            userAnswered: true
        };
    }

    // Réponse automatique (temps écoulé)
    autoRevealAnswer() {
        if (this.userAnswered || !this.currentGame) return;
        
        this.userAnswered = true;
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            }
        });
        
        this.showResult(false);
        
        return {
            isCorrect: false,
            gameName: this.currentGame.name,
            userAnswered: false
        };
    }

    // Afficher le résultat
    showResult(isCorrect) {
        this.resultEl.innerHTML = isCorrect 
            ? `🎉 <strong>Correct !</strong><br><small>${this.currentGame.name}</small>`
            : `❌ <strong>Incorrect</strong><br><small>La réponse était: ${this.currentGame.name}</small>`;
        
        this.resultEl.className = `result active ${isCorrect ? 'correct' : 'incorrect'}`;
        this.nextBtn.style.display = 'flex';
    }

    // Masquer le résultat
    hideResult() {
        this.resultEl.className = 'result';
        this.nextBtn.style.display = 'none';
    }

    // Réinitialiser pour nouvelle question
    reset() {
        this.userAnswered = false;
        this.hideResult();
        this.answersGrid.innerHTML = '';
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
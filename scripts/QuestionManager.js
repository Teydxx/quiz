class QuestionManager {
    constructor() {
        this.remainingGames = [...GAMES];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        
        // Éléments DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.resultEl = document.getElementById('result');
        this.nextBtn = document.getElementById('next-btn');
    }

    // Initialiser
    // Dans init(), remplacer par :
init(totalQuestions) {
    this.totalQuestions = totalQuestions;
    this.totalQuestionsEl.textContent = totalQuestions;
    
    // Mélanger les jeux de manière plus aléatoire
    this.remainingGames = shuffleArray([...GAMES]);
    
    // Si on a moins de jeux que de questions, on en duplique
    if (this.remainingGames.length < totalQuestions) {
        console.warn(`⚠️ Seulement ${this.remainingGames.length} jeux disponibles pour ${totalQuestions} questions`);
        // Dupliquer et remélanger
        const needed = totalQuestions - this.remainingGames.length;
        const extraGames = [];
        
        for (let i = 0; i < needed; i++) {
            const randomIndex = Math.floor(Math.random() * GAMES.length);
            extraGames.push({...GAMES[randomIndex]});
        }
        
        this.remainingGames = [...this.remainingGames, ...extraGames];
        this.remainingGames = shuffleArray(this.remainingGames);
    }
    
    console.log(`🎲 ${this.remainingGames.length} jeux préparés pour le quiz`);
}

// Dans prepareQuestion(), modifier la sélection :
prepareQuestion(questionNumber) {
    if (this.remainingGames.length === 0) {
        // Si plus de jeux, remélanger depuis le début
        this.remainingGames = shuffleArray([...GAMES]);
        console.log('🔄 Plus de jeux, remélange...');
    }

    this.reset();
    this.questionCountEl.textContent = questionNumber;
    
    // Prendre le premier jeu du tableau mélangé
    this.currentGame = this.remainingGames.shift(); // shift() prend le premier
    
    // Préparer les réponses avec exclusion du jeu actuel
    this.prepareAnswers();
    
    return true;
}

// Modifier prepareAnswers() pour éviter les doublons :
prepareAnswers() {
    const correctAnswer = this.currentGame.name;
    
    // Filtrer tous les jeux SAUF le jeu actuel
    const availableGames = GAMES.filter(game => game.name !== correctAnswer);
    
    // Mélanger et prendre 3 jeux différents
    const shuffledWrong = shuffleArray([...availableGames]).slice(0, 3);
    const wrongAnswers = shuffledWrong.map(game => game.name);
    
    // Mélanger toutes les réponses
    const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
    
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
    this.userAnswerCorrect = false;
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
        this.userAnswerCorrect = false;
    }

    // Vérifier la réponse (appelé pendant la phase 1)
    checkAnswer(clickedButton) {
        if (this.userAnswered || !this.currentGame) return;
        
        this.userAnswered = true;
        this.userAnswerCorrect = clickedButton.dataset.correct === 'true';
        
        // Désactiver tous les boutons
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        // Marquer la réponse de l'utilisateur
        buttons.forEach(btn => {
            if (btn === clickedButton) {
                btn.classList.add('user-selected');
                if (this.userAnswerCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
            }
        });
        
        // Marquer la réponse correcte en vert
        buttons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct-answer');
            }
        });
        
        return {
            isCorrect: this.userAnswerCorrect,
            gameName: this.currentGame.name,
            userAnswered: true
        };
    }

    // Révéler les réponses (appelé pendant la phase 2)
    revealAnswers() {
        console.log('🔍 Révélation des réponses');
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        
        // Cacher tous les boutons
        this.answersGrid.style.opacity = '0';
        setTimeout(() => {
            this.answersGrid.innerHTML = '';
            
            // Afficher le résultat final
            const resultDiv = document.createElement('div');
            resultDiv.className = 'final-result';
            
            if (this.userAnswered) {
                resultDiv.innerHTML = `
                    <div class="result-icon">${this.userAnswerCorrect ? '🎉' : '❌'}</div>
                    <div class="result-text">
                        <strong>${this.userAnswerCorrect ? 'CORRECT !' : 'INCORRECT'}</strong><br>
                        <small>${this.currentGame.name}</small>
                    </div>
                `;
                resultDiv.classList.add(this.userAnswerCorrect ? 'correct-final' : 'incorrect-final');
            } else {
                resultDiv.innerHTML = `
                    <div class="result-icon">🔍</div>
                    <div class="result-text">
                        <strong>RÉPONSE</strong><br>
                        <small>${this.currentGame.name}</small>
                    </div>
                `;
                resultDiv.classList.add('no-answer-final');
            }
            
            this.answersGrid.appendChild(resultDiv);
            this.answersGrid.style.opacity = '1';
        }, 300);
    }

    // Afficher le bouton suivant
    showNextButton() {
        if (this.nextBtn) {
            this.nextBtn.style.display = 'flex';
        }
    }

    // Masquer le résultat
    hideResult() {
        this.resultEl.className = 'result';
        this.answersGrid.style.opacity = '1';
        this.answersGrid.innerHTML = '';
    }

    // Réinitialiser pour nouvelle question
    reset() {
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.hideResult();
        this.answersGrid.innerHTML = '';
        this.answersGrid.style.opacity = '1';
        
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

    // Ajouter cette méthode :
hideAnswersForReveal() {
    console.log('🎭 Cacher les réponses pour révélation');
    
    // Animation de disparition
    this.answersGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    this.answersGrid.style.opacity = '0';
    this.answersGrid.style.transform = 'translateY(20px)';
    
    // Cacher complètement après l'animation
    setTimeout(() => {
        this.answersGrid.style.display = 'none';
    }, 300);
}

// Et dans reset(), ajouter :
reset() {
    this.userAnswered = false;
    this.userAnswerCorrect = false;
    this.hideResult();
    this.answersGrid.innerHTML = '';
    
    // Réafficher la grille de réponses
    this.answersGrid.style.display = 'grid';
    this.answersGrid.style.opacity = '1';
    this.answersGrid.style.transform = 'translateY(0)';
    this.answersGrid.style.transition = '';
    
    // Cacher le bouton suivant
    if (this.nextBtn) {
        this.nextBtn.style.display = 'none';
    }
}
}


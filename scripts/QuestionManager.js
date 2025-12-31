// scripts/QuestionManager.js - VERSION CORRECTE
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
        
        // Références DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.nextBtn = document.getElementById('next-btn');
        
        console.log('✅ QuestionManager initialisé');
    }

    init(totalQuestions) {
        this.totalQuestions = totalQuestions;
        this.totalQuestionsEl.textContent = totalQuestions;
        this.resetStats();
        shuffleArray(this.remainingGames);
    }

    initWithGames(games) {
        this.remainingGames = [...games];
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.resetStats();
        
        shuffleArray(this.remainingGames);
        console.log(`✅ QuestionManager initialisé avec ${games.length} jeux`);
    }

    // PRÉPARE une nouvelle question
    prepareQuestion(questionNumber) {
        console.log(`✅ Préparation question ${questionNumber}`);
        
        if (this.remainingGames.length === 0) {
            console.error('❌ Plus de jeux disponibles');
            return false;
        }

        this.resetQuestionState();
        this.questionCountEl.textContent = questionNumber;
        
        // SÉLECTIONNER un jeu
        const randomIndex = Math.floor(Math.random() * this.remainingGames.length);
        this.currentGame = this.remainingGames[randomIndex];
        this.remainingGames.splice(randomIndex, 1);
        
        console.log(`🎮 Jeu sélectionné: ${this.currentGame.name} (ID: ${this.currentGame.videoId})`);
        
        // CRÉER LES BOUTONS DE RÉPONSE IMMÉDIATEMENT
        this.createAnswerButtons();
        
        // FORCER l'affichage des boutons
        this.forceShowButtons();
        
        return true;
    }

    // CRÉE les 6 boutons de réponse
    createAnswerButtons() {
        console.log('🔄 Création des 6 boutons de réponse');
        
        if (!this.currentGame) {
            console.error('❌ Pas de jeu courant pour créer les boutons');
            return;
        }
        
        const correctAnswer = this.currentGame.name;
        const wrongGames = GAMES.filter(game => game.name !== correctAnswer);
        
        // Prendre 5 mauvaises réponses
        const shuffledWrong = shuffleArray([...wrongGames]).slice(0, 5);
        const wrongAnswers = shuffledWrong.map(game => game.name);
        
        // Mélanger les 6 réponses
        const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        // VIDER et CRÉER
        if (!this.answersGrid) {
            console.error('❌ answers-grid non trouvé');
            this.answersGrid = document.getElementById('answers-grid');
            if (!this.answersGrid) return;
        }
        
        this.answersGrid.innerHTML = '';
        this.selectedButton = null;
        
        // CRÉER CHAQUE BOUTON
        allAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.dataset.correct = (answer === correctAnswer).toString();
            button.dataset.index = index;
            
            // ÉVÉNEMENT CLICK
            button.addEventListener('click', (e) => {
                console.log(`🎯 Clic sur: ${answer}`);
                this.selectAnswer(button);
            });
            
            this.answersGrid.appendChild(button);
        });
        
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        
        // FORCER l'affichage
        this.answersGrid.style.display = 'grid';
        this.answersGrid.style.opacity = '1';
        this.answersGrid.style.visibility = 'visible';
        
        console.log(`✅ ${allAnswers.length} boutons créés`);
    }

    // SÉLECTIONNER une réponse
    selectAnswer(clickedButton) {
        if (!this.currentGame || this.userAnswered) return;
        
        console.log(`🎯 Sélection: ${clickedButton.textContent}`);
        
        // Désélectionner précédent
        if (this.selectedButton && this.selectedButton !== clickedButton) {
            this.selectedButton.classList.remove('user-selected');
        }
        
        // Sélectionner nouveau
        this.selectedButton = clickedButton;
        clickedButton.classList.add('user-selected');
        
        // Enregistrer
        this.userAnswered = true;
        this.userAnswerCorrect = clickedButton.dataset.correct === 'true';
        
        this.recordAnswer(clickedButton.textContent, this.userAnswerCorrect);
    }

    // FORCER l'affichage des boutons
    forceShowButtons() {
        console.log('🔧 Forcer affichage des boutons...');
        
        if (this.answersGrid) {
            // S'assurer que la grille est visible
            this.answersGrid.style.display = 'grid';
            this.answersGrid.style.opacity = '1';
            this.answersGrid.style.visibility = 'visible';
            
            // S'assurer qu'elle n'est pas masquée par CSS
            this.answersGrid.classList.remove('hidden');
            
            console.log('✅ Grille forcée à être visible');
            
            // Vérifier combien de boutons sont présents
            const buttons = this.answersGrid.querySelectorAll('.answer-btn');
            console.log(`✅ ${buttons.length} boutons trouvés dans la grille`);
        } else {
            console.error('❌ answers-grid non trouvé !');
            
            // Essayer de récupérer l'élément
            this.answersGrid = document.getElementById('answers-grid');
            if (this.answersGrid) {
                console.log('✅ answers-grid trouvé par ID, réessayer...');
                this.forceShowButtons();
            }
        }
    }

    // FINALISER la réponse
    finalizeAnswer() {
        console.log('⏱️ Finalisation réponse');
        
        if (!this.currentGame) return;
        
        // Désactiver tous les boutons
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn === this.selectedButton) {
                if (this.userAnswerCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
            }
        });
    }

    // RÉVÉLER les réponses
    revealAnswers() {
        console.log('🔍 Révélation réponses');
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        
        // Montrer la bonne réponse
        buttons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct-answer', 'correct');
            }
        });
        
        // Afficher bouton suivant
        setTimeout(() => {
            if (this.nextBtn) {
                this.nextBtn.style.display = 'flex';
            }
        }, 1000);
    }

    // AUTO si pas de réponse
    autoRevealAnswer() {
        console.log('⏰ Auto-révélation (pas de réponse)');
        
        if (this.userAnswered || !this.currentGame) return null;
        
        this.userAnswered = true;
        this.userAnswerCorrect = false;
        
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
        
        return {
            isCorrect: false,
            gameName: this.currentGame.name,
            userAnswered: false
        };
    }

    // Afficher bouton suivant
    showNextButton() {
        if (this.nextBtn) {
            this.nextBtn.style.display = 'flex';
        }
    }

    // RÉINITIALISER pour nouvelle question
    resetQuestionState() {
        console.log('🔄 Réinitialisation état question');
        
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        // NETTOYER mais garder la structure
        if (this.answersGrid) {
            // Vider le contenu
            this.answersGrid.innerHTML = '';
            
            // REMETTRE les styles d'affichage
            this.answersGrid.style.display = 'grid';
            this.answersGrid.style.opacity = '1';
            this.answersGrid.style.visibility = 'visible';
            this.answersGrid.style.gridTemplateColumns = '1fr';
            this.answersGrid.style.gap = '12px';
            
            // Forcer un reflow
            this.answersGrid.offsetHeight;
            
            console.log('✅ Grille réinitialisée pour nouvelle question');
        }
        
        // Cacher bouton suivant
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
        }
    }

    // Enregistrer statistiques
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

    // Réinitialiser stats
    resetStats() {
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
    }

    // GETTERS
    getCorrectCount() {
        return this.correctAnswersCount;
    }

    getResultsDetails() {
        return this.resultsDetails;
    }

    hasUserAnswered() {
        return this.userAnswered;
    }

    getCurrentGame() {
        return this.currentGame;
    }

    hasMoreQuestions() {
        return this.remainingGames.length > 0;
    }
}
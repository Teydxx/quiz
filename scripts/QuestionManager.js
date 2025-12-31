// scripts/QuestionManager.js - VERSION COMPLÈTE CORRIGÉE
class QuestionManager {
    constructor() {
        console.log('✅ QuestionManager initialisé');
        
        // Réinitialiser les jeux
        this.resetAllGames();
        
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.tempSelection = null; // Pour la sélection temporaire
        
        // Statistiques
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
        this.totalQuestions = 10;
        
        // Références DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.nextBtn = document.getElementById('next-btn');
        
        console.log(`✅ ${this.remainingGames.length} jeux disponibles`);
    }

    resetAllGames() {
        this.remainingGames = [...GAMES];
        shuffleArray(this.remainingGames);
    }

    init(totalQuestions) {
        console.log(`✅ QuestionManager.init(${totalQuestions})`);
        
        this.totalQuestions = totalQuestions;
        
        // Obtenir les références DOM si pas déjà fait
        if (!this.answersGrid) this.answersGrid = document.getElementById('answers-grid');
        if (!this.questionCountEl) this.questionCountEl = document.getElementById('question-count');
        if (!this.totalQuestionsEl) this.totalQuestionsEl = document.getElementById('total-questions');
        if (!this.nextBtn) this.nextBtn = document.getElementById('next-btn');
        
        if (this.totalQuestionsEl) {
            this.totalQuestionsEl.textContent = totalQuestions;
        }
        
        this.resetStats();
        this.resetAllGames();
    }

    prepareQuestion(questionNumber) {
        console.log(`\n🎮 QUESTION ${questionNumber}`);
        
        // Réinitialiser l'état
        this.resetQuestionState();
        
        if (this.questionCountEl) {
            this.questionCountEl.textContent = questionNumber;
        }
        
        // Vérifier s'il reste des jeux
        if (this.remainingGames.length === 0) {
            this.resetAllGames();
        }
        
        // Sélectionner un jeu
        const randomIndex = Math.floor(Math.random() * this.remainingGames.length);
        this.currentGame = this.remainingGames[randomIndex];
        this.remainingGames.splice(randomIndex, 1);
        
        console.log(`🎮 Jeu: ${this.currentGame.name}`);
        
        // CRÉER LES BOUTONS
        this.createAnswerButtons();
        
        return true;
    }

    // CRÉE les 6 boutons de réponse
    createAnswerButtons() {
        console.log('🔧 Création des boutons...');
        
        if (!this.currentGame || !this.answersGrid) {
            console.error('❌ Données manquantes');
            return;
        }
        
        const correctAnswer = this.currentGame.name;
        const wrongGames = GAMES.filter(game => game.name !== correctAnswer);
        
        // Prendre 5 mauvaises réponses
        const shuffledWrong = shuffleArray([...wrongGames]).slice(0, 5);
        const wrongAnswers = shuffledWrong.map(game => game.name);
        
        // Mélanger les 6 réponses
        const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        // VIDER ET CRÉER
        this.answersGrid.innerHTML = '';
        
        allAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.dataset.correct = (answer === correctAnswer).toString();
            button.dataset.index = index;
            
            // CLICK: sélection temporaire uniquement
            button.addEventListener('click', () => {
                this.handleButtonClick(button);
            });
            
            this.answersGrid.appendChild(button);
        });
        
        // FORCER L'AFFICHAGE
        this.answersGrid.style.display = 'grid';
        this.answersGrid.style.opacity = '1';
        this.answersGrid.style.visibility = 'visible';
        
        console.log(`✅ ${allAnswers.length} boutons créés`);
    }

    // Gestion du clic (sélection temporaire)
    handleButtonClick(clickedButton) {
        if (this.userAnswered) return; // Déjà validé
        
        console.log(`🎯 Clic sur: ${clickedButton.textContent}`);
        
        // Si on reclique sur le même bouton, on le désélectionne
        if (this.tempSelection === clickedButton) {
            clickedButton.classList.remove('user-selected');
            this.tempSelection = null;
            console.log('↩️ Désélectionné');
            return;
        }
        
        // Désélectionner l'ancien
        if (this.tempSelection) {
            this.tempSelection.classList.remove('user-selected');
        }
        
        // Sélectionner le nouveau
        this.tempSelection = clickedButton;
        clickedButton.classList.add('user-selected');
        
        console.log('✅ Sélectionné (temporaire)');
    }

    // Finaliser la sélection quand le temps est écoulé
    finalizeSelection() {
        console.log('🔒 Finalisation sélection');
        
        if (!this.tempSelection) {
            console.log('⚠️ Pas de sélection à finaliser');
            this.userAnswered = false;
            this.userAnswerCorrect = false;
            return;
        }
        
        // Convertir la sélection temporaire en sélection finale
        this.selectedButton = this.tempSelection;
        this.userAnswered = true;
        this.userAnswerCorrect = this.selectedButton.dataset.correct === 'true';
        
        this.recordAnswer(this.selectedButton.textContent, this.userAnswerCorrect);
        
        console.log(`📊 Réponse: ${this.userAnswerCorrect ? 'CORRECT' : 'INCORRECT'}`);
    }

    // Finaliser l'affichage des réponses
    finalizeAnswer() {
        console.log('⏱️ Finalisation réponse');
        
        if (!this.currentGame) return;
        
        // Désactiver tous les boutons
        const buttons = this.answersGrid ? this.answersGrid.querySelectorAll('.answer-btn') : [];
        buttons.forEach(btn => {
            btn.disabled = true;
            if (this.selectedButton && btn === this.selectedButton) {
                if (this.userAnswerCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
            }
        });
    }

    // Révéler les bonnes réponses
    revealAnswers() {
        console.log('🔍 Révélation réponses');
        
        const buttons = this.answersGrid ? this.answersGrid.querySelectorAll('.answer-btn') : [];
        
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

    // RÉINITIALISER pour nouvelle question
    resetQuestionState() {
        console.log('🔄 resetQuestionState()');
        
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        this.tempSelection = null;
        
        // NETTOYER mais garder la structure
        if (this.answersGrid) {
            this.answersGrid.innerHTML = '';
            this.answersGrid.style.display = 'grid';
            this.answersGrid.style.opacity = '1';
            this.answersGrid.style.visibility = 'visible';
        }
        
        // Cacher bouton suivant
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
        }
    }

    // Masquer les boutons
    hideButtons() {
        if (this.answersGrid) {
            this.answersGrid.style.display = 'none';
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
        if (this.remainingGames.length === 0) {
            this.resetAllGames();
        }
        return true;
    }
}
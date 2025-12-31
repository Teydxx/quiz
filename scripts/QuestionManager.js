// scripts/QuestionManager.js - VERSION CORRIGÉE
class QuestionManager {
    constructor() {
        console.log('🔄 QuestionManager - Constructeur appelé');
        
        // Réinitialiser complètement les jeux
        this.resetAllGames();
        
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        // Statistiques
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
        this.totalQuestions = 10;
        
        // Références DOM - Sera initialisé plus tard
        this.answersGrid = null;
        this.questionCountEl = null;
        this.totalQuestionsEl = null;
        this.nextBtn = null;
        
        console.log(`✅ QuestionManager initialisé avec ${this.remainingGames.length} jeux`);
    }

    // Réinitialiser complètement la liste des jeux
    resetAllGames() {
        console.log('🔄 Réinitialisation de tous les jeux');
        this.remainingGames = [...GAMES];
        shuffleArray(this.remainingGames);
    }

    init(totalQuestions) {
        console.log(`✅ QuestionManager.init(${totalQuestions})`);
        
        this.totalQuestions = totalQuestions;
        
        // Obtenir les références DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.nextBtn = document.getElementById('next-btn');
        
        if (this.totalQuestionsEl) {
            this.totalQuestionsEl.textContent = totalQuestions;
        }
        
        this.resetStats();
        
        // Réinitialiser les jeux
        this.resetAllGames();
        
        console.log(`✅ ${this.remainingGames.length} jeux disponibles`);
        console.log(`✅ Références DOM:`, {
            answersGrid: !!this.answersGrid,
            questionCountEl: !!this.questionCountEl,
            totalQuestionsEl: !!this.totalQuestionsEl,
            nextBtn: !!this.nextBtn
        });
    }

    initWithGames(games) {
        console.log(`✅ QuestionManager.initWithGames(${games.length})`);
        
        this.remainingGames = [...games];
        shuffleArray(this.remainingGames);
        
        this.currentGame = null;
        this.userAnswered = false;
        this.userAnswerCorrect = false;
        this.selectedButton = null;
        
        // Obtenir les références DOM
        this.answersGrid = document.getElementById('answers-grid');
        this.questionCountEl = document.getElementById('question-count');
        this.totalQuestionsEl = document.getElementById('total-questions');
        this.nextBtn = document.getElementById('next-btn');
        
        this.resetStats();
        
        console.log(`✅ QuestionManager initialisé avec ${games.length} jeux`);
    }

    // PRÉPARE une nouvelle question
    prepareQuestion(questionNumber) {
        console.log(`\n🎮 ========== PRÉPARATION QUESTION ${questionNumber} ==========`);
        
        // Réinitialiser l'état de la question actuelle
        this.resetQuestionState();
        
        if (this.questionCountEl) {
            this.questionCountEl.textContent = questionNumber;
        }
        
        // Vérifier s'il reste des jeux
        if (this.remainingGames.length === 0) {
            console.error('❌ Plus de jeux disponibles !');
            this.resetAllGames(); // Réinitialiser pour éviter le blocage
            console.log('🔄 Jeux réinitialisés');
        }
        
        if (this.remainingGames.length === 0) {
            console.error('❌ Toujours aucun jeu disponible après réinitialisation');
            return false;
        }
        
        // SÉLECTIONNER un jeu
        const randomIndex = Math.floor(Math.random() * this.remainingGames.length);
        this.currentGame = this.remainingGames[randomIndex];
        this.remainingGames.splice(randomIndex, 1);
        
        console.log(`🎮 Jeu sélectionné: ${this.currentGame.name}`);
        console.log(`🎮 ID YouTube: ${this.currentGame.videoId}`);
        console.log(`🎮 Jeux restants: ${this.remainingGames.length}`);
        
        // CRÉER LES BOUTONS DE RÉPONSE
        this.createAnswerButtons();
        
        return true;
    }

    // CRÉE les 6 boutons de réponse
    createAnswerButtons() {
        console.log('🔧 Création des boutons de réponse...');
        
        if (!this.currentGame) {
            console.error('❌ Pas de jeu courant pour créer les boutons');
            return;
        }
        
        // S'assurer que answersGrid existe
        if (!this.answersGrid) {
            console.error('❌ answers-grid non trouvé, tentative de récupération...');
            this.answersGrid = document.getElementById('answers-grid');
            
            if (!this.answersGrid) {
                console.error('❌ ÉCHEC: Impossible de trouver answers-grid');
                return;
            }
        }
        
        const correctAnswer = this.currentGame.name;
        const wrongGames = GAMES.filter(game => game.name !== correctAnswer);
        
        // Prendre 5 mauvaises réponses
        const shuffledWrong = shuffleArray([...wrongGames]).slice(0, 5);
        const wrongAnswers = shuffledWrong.map(game => game.name);
        
        // Mélanger les 6 réponses
        const allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        // VIDER complètement la grille
        this.answersGrid.innerHTML = '';
        
        console.log(`🔧 Création de ${allAnswers.length} boutons...`);
        
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
        this.selectedButton = null;
        
        // FORCER l'affichage
        this.forceShowButtons();
        
        console.log(`✅ ${allAnswers.length} boutons créés`);
    }

    // FORCER l'affichage des boutons
    forceShowButtons() {
        console.log('🔧 ForceShowButtons()');
        
        if (this.answersGrid) {
            // Réinitialiser tous les styles
            this.answersGrid.style.display = 'grid';
            this.answersGrid.style.opacity = '1';
            this.answersGrid.style.visibility = 'visible';
            this.answersGrid.style.gridTemplateColumns = '1fr';
            this.answersGrid.style.gap = '12px';
            
            // Enlever les classes qui pourraient cacher
            this.answersGrid.classList.remove('hidden');
            
            // Forcer un reflow
            this.answersGrid.offsetHeight;
            
            console.log('✅ Grille forcée à être visible');
            
            // Vérifier combien de boutons sont présents
            const buttons = this.answersGrid.querySelectorAll('.answer-btn');
            console.log(`✅ ${buttons.length} boutons trouvés dans la grille`);
            
            // Log des boutons pour debug
            buttons.forEach((btn, i) => {
                console.log(`  ${i + 1}. ${btn.textContent} (correct: ${btn.dataset.correct})`);
            });
        } else {
            console.error('❌ answers-grid non trouvé dans forceShowButtons!');
        }
    }

    // SÉLECTIONNER une réponse
    selectAnswer(clickedButton) {
        if (!this.currentGame || this.userAnswered) {
            console.log('⚠️ Déjà répondu ou pas de jeu');
            return;
        }
        
        console.log(`\n🎯 ========== SÉLECTION RÉPONSE ==========`);
        console.log(`🎯 Choix: ${clickedButton.textContent}`);
        console.log(`🎯 Correct: ${clickedButton.dataset.correct === 'true'}`);
        
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
        
        console.log(`✅ Réponse enregistrée: ${this.userAnswerCorrect ? 'CORRECT' : 'INCORRECT'}`);
    }

    // FINALISER la réponse
    finalizeAnswer() {
        console.log('⏱️ Finalisation réponse');
        
        if (!this.currentGame) return;
        
        // Désactiver tous les boutons
        const buttons = this.answersGrid ? this.answersGrid.querySelectorAll('.answer-btn') : [];
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
                console.log('✅ Bouton suivant affiché');
            }
        }, 1000);
    }

    // RÉINITIALISER pour nouvelle question
    resetQuestionState() {
        console.log('🔄 resetQuestionState()');
        
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
        } else {
            console.error('❌ answers-grid non trouvé dans resetQuestionState');
        }
        
        // Cacher bouton suivant
        if (this.nextBtn) {
            this.nextBtn.style.display = 'none';
            console.log('✅ Bouton suivant caché');
        }
    }

    // Masquer les boutons
    hideButtons() {
        console.log('🔧 hideButtons()');
        
        if (this.answersGrid) {
            this.answersGrid.style.display = 'none';
            this.answersGrid.style.opacity = '0';
            console.log('✅ Boutons masqués');
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
        
        console.log(`📊 Stats: ${this.correctAnswersCount} correct(s) sur ${this.resultsDetails.length}`);
    }

    // Réinitialiser stats
    resetStats() {
        this.correctAnswersCount = 0;
        this.resultsDetails = [];
        console.log('📊 Statistiques réinitialisées');
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
        // Toujours retourner true si on peut réinitialiser
        if (this.remainingGames.length === 0) {
            this.resetAllGames();
        }
        return true; // On peut toujours continuer
    }
}
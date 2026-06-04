// =========================================================
// DEVHABIT APP INTEGRATION
// =========================================================

const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');

// Redirect to login if not authenticated
if (!token) {
    window.location.href = 'index.html?auth=login';
}

// Global active data
let activeCourseId = null;
let activeCourseSlug = null;
let currentExercises = [];
let currentExerciseIndex = 0;
let userAnswers = [];
let currentLessonId = null;
let lifeRecoveryInterval = null;
let profileData = null; // Local profile cache

// =========================================================
// 1. FUNÇÕES GLOBAIS (WINDOW SCOPE FOR HTML HANDLERS)
// =========================================================

// Highlight active tab
window.highlightActiveTab = function(courseId) {
    const tabs = document.querySelectorAll('.sidebar-course-tab');
    tabs.forEach(tab => {
        if (tab.id === `course-tab-${courseId}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
};

// Seleciona Curso e carrega trilha
window.selectCourse = async function(courseId, courseSlug) {
    activeCourseId = courseId;
    activeCourseSlug = courseSlug;
    localStorage.setItem('selected_course_id', courseId);
    localStorage.setItem('selected_course_slug', courseSlug);

    highlightActiveTab(courseId);

    // Fechar a sidebar no mobile se estiver aberta ao selecionar uma trilha
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }

    await loadCourseTrail(courseId);
};

// Matricular no Curso
window.enrollInCourse = async function(courseId) {
    try {
        const response = await fetch(`${API_URL}/learning/languages/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadUserProfile(); // Refresh XP/Level
            await loadCourseTrail(courseId);
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao se inscrever na trilha.');
        }
    } catch (err) {
        console.error('Enroll error:', err);
        alert('Erro ao se conectar ao servidor.');
    }
};

// Iniciar Lição (Duolingo modal)
window.startLesson = async function(lessonId, lessonName) {
    currentLessonId = lessonId;
    
    // Check lives first
    const livesRes = await fetch(`${API_URL}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (livesRes.ok) {
        const profile = (await livesRes.json()).data;
        if (profile.lives <= 0) {
            alert('Você está sem vidas! Aguarde a recuperação para poder fazer lições.');
            return;
        }
    }

    try {
        const response = await fetch(`${API_URL}/learning/lessons/${lessonId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.message || 'Erro ao carregar detalhes da lição.');
            return;
        }

        const data = await response.json();
        currentExercises = data.data.exercises;
        
        if (currentExercises.length === 0) {
            alert('Essa lição não possui exercícios cadastrados.');
            return;
        }

        currentExerciseIndex = 0;
        userAnswers = [];
        
        // Show modal and load first question
        const modal = document.getElementById('exercise-modal');
        modal.classList.remove('hidden');
        
        // Update lives in modal
        updateModalLives(profileData ? profileData.lives : 5);

        renderCurrentExercise();
    } catch (err) {
        console.error('Start lesson error:', err);
        alert('Erro ao se conectar ao servidor.');
    }
};

// =========================================================
// 2. CONTROLES DO MODAL DE EXERCÍCIOS
// =========================================================

function updateModalLives(count) {
    const livesDiv = document.getElementById('exercise-lives-count');
    if (livesDiv) {
        livesDiv.innerHTML = `<i class="ri-heart-3-fill"></i> ${count}`;
    }
}

function renderCurrentExercise() {
    const bodyContent = document.getElementById('exercise-body-content');
    const checkBtn = document.getElementById('exercise-check-btn');
    const ex = currentExercises[currentExerciseIndex];

    // Progress Bar
    const progressPct = (currentExerciseIndex / currentExercises.length) * 100;
    const progressFill = document.getElementById('exercise-progress-bar');
    const progressText = document.getElementById('exercise-progress-text');
    if (progressFill) progressFill.style.width = `${progressPct}%`;
    if (progressText) progressText.innerText = `Exercício ${currentExerciseIndex + 1} de ${currentExercises.length}`;

    // Reset check button
    checkBtn.disabled = true;
    checkBtn.innerText = currentExerciseIndex === currentExercises.length - 1 ? 'Finalizar Aula' : 'Avançar';
    checkBtn.onclick = handleAdvanceExercise;

    let html = `<h3 class="exercise-question-title">${ex.question_text}</h3>`;

    // Code Snippet
    if (ex.code_snippet) {
        html += `
        <div class="exercise-code-container">
            <pre><code>${escapeHTML(ex.code_snippet)}</code></pre>
        </div>`;
    }

    // Input elements based on type
    if (ex.type === 'multiple_choice' || ex.type === 'code_output') {
        html += `<div class="exercise-options">`;
        ex.options.forEach((opt, idx) => {
            html += `
            <button class="option-card" onclick="selectOption(this, '${escapeQuotes(opt)}')">
                <span class="option-index">${String.fromCharCode(65 + idx)}</span>
                <span>${escapeHTML(opt)}</span>
            </button>`;
        });
        html += `</div>`;
    } else if (ex.type === 'fill_in_the_blank') {
        html += `
        <div style="text-align: center;">
            <input type="text" class="blank-input" id="blank-answer" placeholder="Digite a palavra que falta..." oninput="handleBlankInput(this)">
        </div>`;
    }

    bodyContent.innerHTML = html;
}

window.selectOption = function(element, optionText) {
    // Deselect others
    const options = document.querySelectorAll('.option-card');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Select this
    element.classList.add('selected');

    // Save answer
    const ex = currentExercises[currentExerciseIndex];
    userAnswers[currentExerciseIndex] = {
        exerciseId: ex.id,
        answer: optionText
    };

    // Enable check button
    document.getElementById('exercise-check-btn').disabled = false;
};

window.handleBlankInput = function(element) {
    const val = element.value.trim();
    const checkBtn = document.getElementById('exercise-check-btn');
    const ex = currentExercises[currentExerciseIndex];

    if (val.length > 0) {
        userAnswers[currentExerciseIndex] = {
            exerciseId: ex.id,
            answer: val
        };
        checkBtn.disabled = false;
    } else {
        checkBtn.disabled = true;
    }
};

function handleAdvanceExercise() {
    currentExerciseIndex++;
    if (currentExerciseIndex < currentExercises.length) {
        renderCurrentExercise();
    } else {
        submitLessonAnswers();
    }
}

async function submitLessonAnswers() {
    const bodyContent = document.getElementById('exercise-body-content');
    const checkBtn = document.getElementById('exercise-check-btn');
    
    bodyContent.innerHTML = `
    <div class="lesson-result-screen">
        <i class="ri-loader-4-line ri-spin success-color" style="font-size: 3rem;"></i>
        <h3 class="result-title">Enviando respostas...</h3>
    </div>`;
    checkBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/learning/lessons/${currentLessonId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers: userAnswers })
        });

        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            const result = data.data;
            
            // Success view
            if (result.success) {
                bodyContent.innerHTML = `
                <div class="lesson-result-screen">
                    <div class="lesson-result-icon success-color"><i class="ri-trophy-fill"></i></div>
                    <h3 class="result-title success-color">Parabéns! Aula Concluída</h3>
                    <p class="result-desc">${result.message}</p>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <span class="stat-val">+${result.xp_earned} XP</span>
                            <span class="stat-lbl">Experiência</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-val">Lvl. ${result.new_level}</span>
                            <span class="stat-lbl">Nível</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-val"><i class="ri-fire-fill" style="color: #ff9f43;"></i> ${result.streak}</span>
                            <span class="stat-lbl">Streak</span>
                        </div>
                    </div>
                </div>`;
                
                checkBtn.innerText = 'Continuar';
                checkBtn.disabled = false;
                checkBtn.onclick = () => {
                    closeExerciseModal();
                    // Reload data
                    loadUserProfile();
                    loadCourseTrail(activeCourseId);
                };
            } else {
                // Failure view
                let errorHtml = `
                <div class="lesson-result-screen">
                    <div class="lesson-result-icon fail-color"><i class="ri-heart-close-fill"></i></div>
                    <h3 class="result-title fail-color">Lição Incompleta</h3>
                    <p class="result-desc">${result.message}</p>
                    
                    <div class="error-review-list">`;
                
                result.incorrectExercises.forEach(wrong => {
                    errorHtml += `
                    <div class="review-item">
                        <div class="review-question">${escapeHTML(wrong.questionText)}</div>
                        <div class="review-answers">
                            <span class="user-answer">Sua resposta: <strong>${escapeHTML(wrong.userAnswer || '(vazia)')}</strong></span>
                            <span class="correct-answer">Resposta correta: <strong>${escapeHTML(wrong.correctAnswer)}</strong></span>
                        </div>
                        ${wrong.explanation ? `<div class="review-explanation">${escapeHTML(wrong.explanation)}</div>` : ''}
                    </div>`;
                });

                errorHtml += `
                    </div>
                </div>`;

                bodyContent.innerHTML = errorHtml;
                updateModalLives(result.lives);

                checkBtn.innerText = 'Tentar Novamente';
                checkBtn.disabled = false;
                checkBtn.onclick = () => {
                    // Reset and restart
                    startLesson(currentLessonId, 'DevHabit');
                };
            }
        } else {
            bodyContent.innerHTML = `
            <div class="lesson-result-screen">
                <div class="lesson-result-icon fail-color"><i class="ri-close-circle-fill"></i></div>
                <h3 class="result-title fail-color">Erro na Submissão</h3>
                <p class="result-desc">${data.message || 'Falha ao processar suas respostas.'}</p>
            </div>`;
            checkBtn.innerText = 'Fechar';
            checkBtn.disabled = false;
            checkBtn.onclick = closeExerciseModal;
        }
    } catch (err) {
        console.error('Submit answers error:', err);
        bodyContent.innerHTML = `
        <div class="lesson-result-screen">
            <div class="lesson-result-icon fail-color"><i class="ri-close-circle-fill"></i></div>
            <h3 class="result-title fail-color">Erro de Conexão</h3>
            <p class="result-desc">Não foi possível se comunicar com o servidor.</p>
        </div>`;
        checkBtn.innerText = 'Fechar';
        checkBtn.disabled = false;
        checkBtn.onclick = closeExerciseModal;
    }
}

function closeExerciseModal() {
    const modal = document.getElementById('exercise-modal');
    if (modal) modal.classList.add('hidden');
}

// =========================================================
// 3. ATUALIZAÇÕES DO PERFIL E TIMER DE VIDAS
// =========================================================

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            handleLogout();
            return;
        }

        const data = await response.json();
        profileData = data.data;

        // Render profile elements
        const nameHeader = document.querySelector('.profile-header h4');
        const streakMini = document.querySelector('.streak-mini');
        const levelBadge = document.querySelector('.level-badge');
        const xpBarFill = document.querySelector('.xp-bar-fill');
        const xpText = document.querySelector('.xp-text');

        if (nameHeader) nameHeader.innerText = profileData.name;
        if (streakMini) streakMini.innerHTML = `<i class="ri-fire-fill"></i> ${profileData.streak}`;
        if (levelBadge) levelBadge.innerText = `Lvl. ${profileData.level}`;

        // XP bar calculation
        const minXp = (profileData.level - 1) * 100;
        const maxXp = profileData.level * 100;
        const currentXpInLevel = profileData.current_xp - minXp;
        const xpNeededInLevel = maxXp - minXp;
        const xpPct = Math.max(0, Math.min(100, (currentXpInLevel / xpNeededInLevel) * 100));

        if (xpBarFill) xpBarFill.style.width = `${xpPct}%`;
        if (xpText) xpText.innerText = `${currentXpInLevel}/${xpNeededInLevel} XP para Lvl. ${profileData.level + 1}`;

        // Hearts rendering
        renderHearts(profileData.lives, profileData.last_life_loss_time);

        // Update profile tab if active
        const activeTab = document.body.getAttribute('data-active-tab');
        if (activeTab === 'profile') {
            renderProfileTab();
        }

    } catch (err) {
        console.error('Failed to load user profile:', err);
    }
}

function renderHearts(livesCount, lastLossTime) {
    const livesContainer = document.querySelector('.lives');
    if (!livesContainer) return;

    livesContainer.innerHTML = '';
    
    // Draw full hearts
    for (let i = 0; i < livesCount; i++) {
        const heart = document.createElement('i');
        heart.className = 'ri-heart-3-fill';
        livesContainer.appendChild(heart);
    }

    // Draw empty/recovering hearts
    const emptyCount = 5 - livesCount;
    for (let i = 0; i < emptyCount; i++) {
        const heart = document.createElement('i');
        heart.className = 'ri-heart-3-line';
        
        // Show tooltip on the first empty heart
        if (i === 0 && lastLossTime) {
            heart.classList.add('heart-recovering');
            heart.setAttribute('data-tooltip', 'Recuperando...');
            startLifeRecoveryTimer(heart, lastLossTime);
        } else {
            heart.style.opacity = '0.5';
        }
        livesContainer.appendChild(heart);
    }
}

function startLifeRecoveryTimer(element, lastLossTime) {
    if (lifeRecoveryInterval) clearInterval(lifeRecoveryInterval);

    const updateTimer = () => {
        const RECOVERY_MS = 2 * 60 * 60 * 1000; // 2 hours
        const lastLoss = new Date(lastLossTime).getTime();
        const nextRecovery = lastLoss + RECOVERY_MS;
        const diff = nextRecovery - Date.now();

        if (diff <= 0) {
            clearInterval(lifeRecoveryInterval);
            loadUserProfile(); // Re-fetch profile to update lives from backend
            return;
        }

        // Format diff to HH:MM:SS
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const hoursStr = hours > 0 ? `${hours}h ` : '';
        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');

        element.setAttribute('data-tooltip', `Recupera em: ${hoursStr}${minStr}:${secStr}`);
    };

    updateTimer();
    lifeRecoveryInterval = setInterval(updateTimer, 1000);
}

// =========================================================
// 4. TRILHA DE APRENDIZADO E SELETOR DE CURSOS
// =========================================================

async function loadCoursesDropdown() {
    try {
        const response = await fetch(`${API_URL}/learning/languages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        const languages = data.data;

        const container = document.getElementById('sidebar-courses-list');
        if (!container) return;

        container.innerHTML = '';
        
        languages.forEach(lang => {
            const item = document.createElement('div');
            item.className = 'sidebar-course-tab';
            item.id = `course-tab-${lang.id}`;
            
            // Map icon & color
            let iconClass = 'ri-code-box-line';
            let color = 'var(--color-purple)';
            if (lang.slug === 'html-css') { iconClass = 'ri-html5-fill'; color = '#e34f26'; }
            else if (lang.slug === 'javascript') { iconClass = 'ri-javascript-fill'; color = '#f7df1e'; }
            else if (lang.slug === 'react') { iconClass = 'ri-reactjs-fill'; color = '#61dafb'; }
            else if (lang.slug === 'java') { iconClass = 'ri-cup-fill'; color = '#e76f51'; }
            else if (lang.slug === 'python') { iconClass = 'ri-terminal-box-line'; color = '#3776ab'; }

            item.innerHTML = `<i class="${iconClass}" style="color: ${color};"></i> <span>${lang.name}</span>`;
            item.onclick = () => selectCourse(lang.id, lang.slug);
            container.appendChild(item);
        });

        // Set default course on first load
        const savedId = localStorage.getItem('selected_course_id');
        const savedSlug = localStorage.getItem('selected_course_slug');
        
        const defaultCourse = languages.find(l => l.id === savedId) || languages[0];
        if (defaultCourse) {
            activeCourseId = defaultCourse.id;
            activeCourseSlug = defaultCourse.slug;
            highlightActiveTab(defaultCourse.id);
            loadCourseTrail(defaultCourse.id);
        }
    } catch (err) {
        console.error('Failed to load languages sidebar:', err);
    }
}

async function loadCourseTrail(languageId) {
    const lessonsContainer = document.getElementById('lessons-container');
    if (!lessonsContainer) return;

    lessonsContainer.innerHTML = `
    <div style="text-align: center; padding: 40px;">
        <i class="ri-loader-4-line ri-spin success-color" style="font-size: 2.5rem;"></i>
        <p style="margin-top: 10px; color: var(--text-secondary);">Carregando trilha...</p>
    </div>`;

    try {
        const response = await fetch(`${API_URL}/learning/languages/${languageId}/trail`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            lessonsContainer.innerHTML = `
            <div class="enroll-prompt-card">
                <i class="ri-close-circle-line enroll-icon" style="color: #e53935;"></i>
                <h3>Erro ao Carregar Trilha</h3>
                <p>${data.message || 'Não foi possível recuperar a trilha de aprendizado.'}</p>
            </div>`;
            return;
        }

        const trail = data.data;
        
        // Highlight active tab
        highlightActiveTab(trail.language.id);

        // Check if user is enrolled
        const langListRes = await fetch(`${API_URL}/learning/languages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const langListData = await langListRes.json();
        const currentLangInfo = langListData.data.find(l => l.id === languageId);

        if (currentLangInfo && !currentLangInfo.enrolled) {
            // Render loading screen during background auto-enrollment
            lessonsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="ri-loader-4-line ri-spin success-color" style="font-size: 2.5rem;"></i>
                <p style="margin-top: 10px; color: var(--text-secondary);">Iniciando trilha automaticamente...</p>
            </div>`;

            try {
                const enrollResponse = await fetch(`${API_URL}/learning/languages/${languageId}/enroll`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (enrollResponse.ok) {
                    await loadUserProfile(); // Refresh XP/Level and cache
                    // Reload course trail now that it is enrolled
                    await loadCourseTrail(languageId);
                    return;
                } else {
                    const data = await enrollResponse.json();
                    lessonsContainer.innerHTML = `
                    <div class="enroll-prompt-card">
                        <i class="ri-close-circle-line enroll-icon" style="color: #e53935;"></i>
                        <h3>Erro ao Iniciar Trilha</h3>
                        <p>${data.message || 'Não foi possível se inscrever na trilha automaticamente.'}</p>
                    </div>`;
                    return;
                }
            } catch (err) {
                console.error('Auto-enroll error:', err);
                lessonsContainer.innerHTML = `
                <div class="enroll-prompt-card">
                    <i class="ri-close-circle-line enroll-icon" style="color: #e53935;"></i>
                    <h3>Erro de Conexão</h3>
                    <p>Falha ao conectar com o servidor para inscrição automática.</p>
                </div>`;
                return;
            }
        }

        // Render learning modules & lessons
        let html = '';
        let totalLessons = 0;
        let completedCount = 0;
        
        // Gather all lessons to check overall sequence unlocking
        let allLessonsSeq = [];
        trail.modules.sort((a, b) => a.order_index - b.order_index).forEach(mod => {
            mod.lessons.sort((a, b) => a.order_index - b.order_index).forEach(les => {
                allLessonsSeq.push(les);
                totalLessons++;
                if (les.completed) completedCount++;
            });
        });

        // Set header progress
        const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        document.getElementById('module-title').innerText = trail.language.name;
        document.querySelector('.progress-bar').style.width = `${pct}%`;
        document.querySelector('.progress-text').innerText = `${pct}% Concluído (${completedCount}/${totalLessons} aulas)`;

        // Sequential unlocking algorithm
        let previousCompleted = true;

        trail.modules.sort((a, b) => a.order_index - b.order_index).forEach(mod => {
            html += `
            <div class="module-section" style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px; color: white;">${mod.name}</h3>`;
            
            mod.lessons.sort((a, b) => a.order_index - b.order_index).forEach(les => {
                const isLessonCompleted = les.completed;
                const isLessonLocked = !previousCompleted;

                // Update lock for next iteration
                previousCompleted = isLessonCompleted;

                if (isLessonCompleted) {
                    html += `
                    <div class="lesson-card completed">
                        <div class="card-status-line"></div>
                        <div class="lesson-details">
                            <h4>${escapeHTML(les.name)}</h4>
                            <span class="lesson-type"><i class="ri-book-open-line"></i> Concluída (+${les.xp_reward} XP)</span>
                        </div>
                        <i class="ri-checkbox-circle-fill status-icon" style="color: var(--color-green); font-size: 1.5rem;"></i>
                    </div>`;
                } else if (!isLessonLocked) {
                    html += `
                    <div class="lesson-card active">
                        <div class="card-status-line"></div>
                        <div class="lesson-details">
                            <h4>${escapeHTML(les.name)}</h4>
                            <span class="lesson-type"><i class="ri-code-s-slash-line"></i> Prática (+${les.xp_reward} XP)</span>
                        </div>
                        <button class="start-btn" onclick="startLesson('${les.id}', '${escapeQuotes(les.name)}')">Bora!</button>
                    </div>`;
                } else {
                    html += `
                    <div class="lesson-card locked">
                        <div class="card-status-line"></div>
                        <div class="lesson-details">
                            <h4>${escapeHTML(les.name)}</h4>
                            <span class="lesson-type"><i class="ri-lock-line"></i> Bloqueada</span>
                        </div>
                        <i class="ri-lock-fill locked-badge"></i>
                    </div>`;
                }
            });

            html += `</div>`;
        });

        lessonsContainer.innerHTML = html;

    } catch (err) {
        console.error('Error loading trail:', err);
        lessonsContainer.innerHTML = `
        <div class="enroll-prompt-card">
            <i class="ri-close-circle-line enroll-icon" style="color: #e53935;"></i>
            <h3>Erro de Conexão</h3>
            <p>Não foi possível obter a trilha de aulas do servidor.</p>
        </div>`;
    }
}

// =========================================================
// 5. NOVA ABA DE PERFIL E SISTEMA DE CONQUISTAS (ACHIEVEMENTS)
// =========================================================

async function renderProfileTab() {
    const profName = document.getElementById('profile-full-name');
    const profEmail = document.getElementById('profile-email');
    const profLvl = document.getElementById('profile-level-badge');
    const profXp = document.getElementById('profile-xp-total');
    const profStreak = document.getElementById('profile-streak-badge');
    const achievementsContainer = document.getElementById('achievements-grid-container');

    if (!profileData || !profName) return;

    // Load cached email from user object
    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = cachedUser.email || 'usuario@devhabit.com';

    profName.innerText = profileData.name;
    profEmail.innerText = userEmail;
    profLvl.innerText = `Lvl. ${profileData.level}`;
    profXp.innerText = `${profileData.current_xp} XP Total`;
    profStreak.innerHTML = `<i class="ri-fire-fill"></i> ${profileData.streak} Dias`;

    // Fetch languages to count enrollments
    let enrolledLangsCount = 0;
    try {
        const response = await fetch(`${API_URL}/learning/languages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            enrolledLangsCount = data.data.filter(l => l.enrolled).length;
        }
    } catch (err) {
        console.error('Error counting enrolled languages:', err);
    }

    if (achievementsContainer) {
        achievementsContainer.innerHTML = '';

        // Achievements definition
        const achievementsList = [
            {
                title: 'Primeiro Código',
                desc: 'Conclua a sua primeira lição prática.',
                icon: 'ri-flashlight-fill',
                theme: 'purple-theme',
                current: profileData.current_xp >= 20 ? 1 : 0,
                max: 1,
                label: 'aula'
            },
            {
                title: 'Poliglota do Dev',
                desc: 'Inscreva-se em pelo menos 2 trilhas de linguagens.',
                icon: 'ri-global-fill',
                theme: 'gold-theme',
                current: enrolledLangsCount,
                max: 2,
                label: 'trilhas'
            },
            {
                title: 'Hábito Diário',
                desc: 'Mantenha uma ofensiva (streak) de 3 dias seguidos.',
                icon: 'ri-fire-fill',
                theme: 'gold-theme',
                current: profileData.streak,
                max: 3,
                label: 'dias'
            },
            {
                title: 'Caçador de XP',
                desc: 'Alcance o marco de 200 de XP total ganho.',
                icon: 'ri-medal-fill',
                theme: 'green-theme',
                current: profileData.current_xp,
                max: 200,
                label: 'XP'
            },
            {
                title: 'Desenvolvedor Pleno',
                desc: 'Evolua seus conhecimentos e atinja o Nível 5.',
                icon: 'ri-award-fill',
                theme: 'purple-theme',
                current: profileData.level,
                max: 5,
                label: 'nível'
            }
        ];

        achievementsList.forEach(ach => {
            const isUnlocked = ach.current >= ach.max;
            const pct = Math.max(0, Math.min(100, (ach.current / ach.max) * 100));

            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked ' + ach.theme : 'locked'}`;

            card.innerHTML = `
                <div class="achievement-icon-wrapper">
                    <i class="${ach.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                    
                    ${!isUnlocked ? `
                    <div class="achievement-progress-container">
                        <div class="achievement-progress-bar-bg">
                            <div class="achievement-progress-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                        <span class="achievement-progress-text">${ach.current}/${ach.max} ${ach.label}</span>
                    </div>
                    ` : ''}
                </div>
                <span class="achievement-status-badge ${isUnlocked ? 'unlocked-label' : 'locked-label'}">
                    ${isUnlocked ? 'Concluído' : 'Bloqueado'}
                </span>
            `;
            achievementsContainer.appendChild(card);
        });
    }
}

// =========================================================
// 6. INICIALIZAÇÃO GERAL E EVENTOS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Check elements
    const logoutBtn = document.getElementById('logout-btn');
    const closeExerciseBtn = document.getElementById('close-exercise-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (closeExerciseBtn) {
        closeExerciseBtn.addEventListener('click', closeExerciseModal);
    }

    // --- ABA NAVEGAÇÃO ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    document.body.setAttribute('data-active-tab', 'lessons');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const tabName = targetId.replace('tab-', '');

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === targetId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            document.body.setAttribute('data-active-tab', tabName);
            
            if (tabName === 'profile') {
                setTimeout(() => {
                    renderProfileTab();
                }, 50);
            }
        });
    });

    // --- MOBILE MENU EVENTS ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    // Fechar sidebar ao clicar fora no mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && (!mobileMenuToggle || !mobileMenuToggle.contains(e.target))) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Load initial data
    loadUserProfile();
    loadCoursesDropdown();
});

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (lifeRecoveryInterval) clearInterval(lifeRecoveryInterval);
    window.location.href = 'index.html?auth=login';
}

// =========================================================
// 7. UTILS DE SEGURANÇA E AUXILIARES
// =========================================================

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}
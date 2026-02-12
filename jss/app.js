// =========================================================
// 1. DADOS E FUNÇÕES GLOBAIS (SIDEBAR)
// Precisam estar fora do DOMContentLoaded para o HTML enxergar
// =========================================================

const courseData = {
    'html': { title: 'Desenvolvedor Web Iniciante', icon: 'ri-html5-fill', color: '#e34f26', label: 'HTML & CSS' },
    'js': { title: 'Lógica com JavaScript', icon: 'ri-javascript-fill', color: '#f7df1e', label: 'JavaScript' },
    'react': { title: 'React para Iniciantes', icon: 'ri-reactjs-fill', color: '#61dafb', label: 'React' }
};

// Abre/Fecha Menu da Sidebar
function toggleSidebarCourseMenu() {
    const menu = document.getElementById('sidebar-course-dropdown');
    if(menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('show');
    }
}

// Seleciona Curso
function selectCourse(courseKey) {
    const data = courseData[courseKey];
    
    // Atualiza ícone e texto na sidebar
    const iconBox = document.getElementById('active-course-icon-box');
    const nameBox = document.getElementById('active-course-name');
    const moduleTitle = document.getElementById('module-title');
    
    if(iconBox) iconBox.innerHTML = `<i class="${data.icon}" style="color: ${data.color};"></i>`;
    if(nameBox) nameBox.innerText = data.label;
    if(moduleTitle) moduleTitle.innerText = data.title;

    // Fecha o menu após selecionar
    toggleSidebarCourseMenu();
}


// =========================================================
// 2. INICIALIZAÇÃO DO APP (GRÁFICOS, ABAS, TRACKER)
// Roda apenas quando a página termina de carregar
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- A. NAVEGAÇÃO DE ABAS ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Define aba inicial
    document.body.setAttribute('data-active-tab', 'lessons');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const tabName = targetId.replace('tab-', '');

            // Atualiza botões
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Atualiza conteúdo (troca hidden)
            tabContents.forEach(content => {
                if(content.id === targetId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            // Atualiza atributo global
            document.body.setAttribute('data-active-tab', tabName);
            
            // SE FOR A ABA PROGRESSO, FORÇA O DESENHO
            if(tabName === 'calendar') {
                setTimeout(() => {
                    renderTrackerGlobally();
                    renderChartGlobally();
                }, 50);
            }
        });
    });

    // --- B. GRÁFICO (Chart.js) ---
    function renderChartGlobally() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        // Se já existe gráfico, destrói para não bugar
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 15}, (_, i) => i + 1), 
                datasets: [{
                    label: 'XP Ganho',
                    data: [20, 50, 30, 80, 40, 60, 50, 90, 30, 40, 80, 60, 70, 90, 100],
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#0f1015',
                    pointBorderColor: '#4ade80',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#23252e',
                        titleColor: '#4ade80',
                        bodyColor: '#e1e1e6',
                        borderColor: '#4ade80',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: function(context) { return 'Dia ' + context[0].label; },
                            label: function(context) { return `XP Ganho: ${context.raw}`; }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#666' } },
                    y: { grid: { color: '#333' }, ticks: { color: '#666' } }
                }
            }
        });
    }

    // --- C. TRACKER DE HÁBITOS ---
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    
    // Popula selects se existirem
    if (yearSelect && monthSelect) {
        const currentYear = new Date().getFullYear();
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        yearSelect.innerHTML = ''; monthSelect.innerHTML = '';

        for(let y = currentYear - 1; y <= currentYear + 1; y++) {
            const opt = document.createElement('option');
            opt.value = y; opt.innerText = y;
            if(y === currentYear) opt.selected = true;
            yearSelect.appendChild(opt);
        }

        const currentMonth = new Date().getMonth();
        months.forEach((m, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.innerText = m;
            if(index === currentMonth) opt.selected = true;
            monthSelect.appendChild(opt);
        });

        // Função de renderizar (disponível para o escopo interno)
        function renderTrackerGlobally() {
            const year = parseInt(yearSelect.value);
            const month = parseInt(monthSelect.value);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const headerList = document.getElementById('header-days-list');
            if(!headerList) return;

            document.documentElement.style.setProperty('--days-count', daysInMonth);
            
            headerList.innerHTML = '';
            for(let i = 1; i <= daysInMonth; i++) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('day-number');
                dayEl.innerText = i;
                headerList.appendChild(dayEl);
            }

            const habits = ['aulas', 'exercicios', 'leitura'];
            habits.forEach(habit => {
                const row = document.getElementById(`dots-row-${habit}`);
                if (!row) return;
                
                row.innerHTML = '';
                row.style.gridTemplateColumns = `repeat(${daysInMonth}, 1fr)`;
                headerList.style.gridTemplateColumns = `repeat(${daysInMonth}, 1fr)`;

                for(let d = 1; d <= daysInMonth; d++) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    dot.innerHTML = '<i class="ri-check-line"></i>';
                    
                    const storageKey = `habit-${habit}-${year}-${month}-${d}`;
                    if(localStorage.getItem(storageKey) === 'true') {
                        dot.classList.add('checked');
                    }

                    dot.addEventListener('click', () => {
                        dot.classList.toggle('checked');
                        if(dot.classList.contains('checked')) {
                            localStorage.setItem(storageKey, 'true');
                        } else {
                            localStorage.removeItem(storageKey);
                        }
                    });
                    row.appendChild(dot);
                }
            });
        }

        // Eventos de troca de data
        yearSelect.addEventListener('change', renderTrackerGlobally);
        monthSelect.addEventListener('change', renderTrackerGlobally);
        
        // Inicializa a primeira vez
        renderTrackerGlobally();
    }
});
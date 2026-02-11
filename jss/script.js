document.addEventListener('DOMContentLoaded', () => {
    
    // ==============================
    // 1. NAVEGAÇÃO DE ABAS
    // ==============================
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Define aba inicial
    document.body.setAttribute('data-active-tab', 'lessons');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const tabName = targetId.replace('tab-', '');

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if(content.id === targetId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            document.body.setAttribute('data-active-tab', tabName);
            
            // SE FOR A ABA PROGRESSO, FORÇA O DESENHO DO TRACKER E GRÁFICO
            if(tabName === 'calendar') {
                // Pequeno delay para garantir que o container não está mais "hidden"
                setTimeout(() => {
                    if(typeof window.renderTracker === 'function') window.renderTracker();
                    if(typeof window.renderChart === 'function') window.renderChart();
                }, 50);
            }
        });
    });

    // ==============================
    // 2. GRÁFICO (Chart.js)
    // ==============================
    window.renderChart = function() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        // Se já existe, destrói antes de criar um novo
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 15}, (_, i) => i + 1), // Dias 1 a 15
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
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
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
                            // PERSONALIZAÇÃO: "Dia X" e "XP / Lições"
                            title: function(context) { 
                                return 'Dia ' + context[0].label; 
                            },
                            label: function(context) { 
                                let xp = context.raw;
                                let licoes = Math.floor(xp / 20); // Simulação: 1 lição a cada 20 XP
                                // Retorna array para pular linha no tooltip
                                return [`XP Ganho: ${xp}`, `Lições Feitas: ${licoes}`]; 
                            }
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

    // ==============================
    // 3. TRACKER DE HÁBITOS
    // ==============================
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    // Verifica se os elementos existem antes de rodar
    if (yearSelect && monthSelect) {
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';
        monthSelect.innerHTML = '';

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

        // Função Global do Tracker
        window.renderTracker = function() {
            const year = parseInt(yearSelect.value);
            const month = parseInt(monthSelect.value);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const headerList = document.getElementById('header-days-list');
            // Se não achar o header, para a função (evita erros)
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
                if (!row) return; // Segurança extra
                
                row.innerHTML = '';
                
                // Reaplica o estilo de grid para garantir
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

        yearSelect.addEventListener('change', window.renderTracker);
        monthSelect.addEventListener('change', window.renderTracker);
        
        // Roda uma vez para garantir
        window.renderTracker();
    }
});

// ==============================
// 4. LÓGICA DA SIDEBAR
// ==============================
const courseData = {
    'html': { title: 'Desenvolvedor Web Iniciante', icon: 'ri-html5-fill', color: '#e34f26', label: 'HTML & CSS' },
    'js': { title: 'Lógica com JavaScript', icon: 'ri-javascript-fill', color: '#f7df1e', label: 'JavaScript' },
    'react': { title: 'React para Iniciantes', icon: 'ri-reactjs-fill', color: '#61dafb', label: 'React' }
};

function toggleSidebarCourseMenu() {
    const menu = document.getElementById('sidebar-course-dropdown');
    if(menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('show');
    }
}

function selectCourse(courseKey) {
    const data = courseData[courseKey];
    
    const iconBox = document.getElementById('active-course-icon-box');
    const nameBox = document.getElementById('active-course-name');
    const moduleTitle = document.getElementById('module-title');
    
    if(iconBox) iconBox.innerHTML = `<i class="${data.icon}" style="color: ${data.color};"></i>`;
    if(nameBox) nameBox.innerText = data.label;
    if(moduleTitle) moduleTitle.innerText = data.title;

    toggleSidebarCourseMenu();
}
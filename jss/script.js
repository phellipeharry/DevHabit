document.addEventListener('DOMContentLoaded', () => {
    
    // ==============================
    // 1. LÓGICA DE NAVEGAÇÃO (Abas no Topo)
    // ==============================
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const body = document.body;

    body.setAttribute('data-active-tab', 'lessons');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-target');
            const tabName = targetTabId.replace('tab-', '');

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            body.setAttribute('data-active-tab', tabName);
        });
    });

    // ==============================
    // 2. GRÁFICO INTERATIVO (Chart.js)
    // ==============================
    const ctx = document.getElementById('progressChart');
    if (ctx) {
        // Dados simulados para o gráfico (Dias 1 a 22)
        const labels = Array.from({length: 22}, (_, i) => i + 1);
        const dataPoints = [2, 5, 2, 4, 3, 5, 4, 2, 4, 3, 2, 1, 3, 4, 3, 5, 4, 5, 3, 4, 5, 4];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lições Concluídas',
                    data: dataPoints,
                    borderColor: '#4ade80', /* Verde Neon */
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#0f1015',
                    pointBorderColor: '#4ade80',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true, /* Preenche abaixo da linha */
                    tension: 0.3 /* Suaviza as curvas */
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
                    legend: { display: false }, /* Oculta a legenda superior */
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
                            label: function(context) { return 'Concluídas: ' + context.raw + ' lições'; }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false, drawBorder: false }, ticks: { color: '#a8a8b3' } },
                    y: { 
                        grid: { color: '#23252e', drawBorder: false }, 
                        ticks: { color: '#a8a8b3', stepSize: 1 },
                        min: 0, max: 6
                    }
                }
            }
        });
    }


    // ==============================
    // 3. GERADOR DA GRADE (Tracker Interativo)
    // ==============================
    
    // Função para gerar os dots (quadradinhos)
    function generateTrackerDots(seedModifier = 0) {
        const numberOfDays = 22;
        const habitRowsIds = ['dots-row-1', 'dots-row-2', 'dots-row-3'];
        
        habitRowsIds.forEach((rowId, index) => {
            const rowContainer = document.getElementById(rowId);
            if (rowContainer) {
                rowContainer.innerHTML = ''; // Limpa os dots existentes antes de gerar novos

                for(let i = 0; i < numberOfDays; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    
                    // Adiciona o ícone de check (invisível por padrão via CSS)
                    const icon = document.createElement('i');
                    icon.classList.add('ri-check-line');
                    dot.appendChild(icon);

                    // Lógica de simulação aleatória (alterada pelo seedModifier do filtro)
                    let isChecked = false;
                    // Simulação: usa o índice, o dia e o modificador para criar padrões "aleatórios" diferentes
                    if ((i + index + seedModifier) % 3 === 0 || (i % 5 === 0 && index === 0)) {
                        isChecked = true;
                    }
                    
                    if (isChecked) dot.classList.add('checked');
                    rowContainer.appendChild(dot);
                }
            }
        });
    }

    // Gerar cabeçalho dos dias apenas uma vez
    const headerDaysContainer = document.getElementById('grid-header-days');
    if (headerDaysContainer && headerDaysContainer.innerHTML === '') {
        headerDaysContainer.innerHTML = '<div style="width: 200px; flex-shrink: 0;"></div><div class="dots-container" id="header-days-list"></div>';
        const headerList = document.getElementById('header-days-list');
        for(let i = 1; i <= 22; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('day-number');
            dayEl.innerText = i;
            headerList.appendChild(dayEl);
        }
    }
    
    // Chama a função inicial para gerar Fevereiro
    generateTrackerDots(0);


    // ==============================
    // 4. INTERATIVIDADE (Cliques e Filtro)
    // ==============================

    // A) Tornar os Dots Clicáveis (Event Delegation)
    const gridWrapper = document.getElementById('habits-grid-interactive');
    if (gridWrapper) {
        gridWrapper.addEventListener('click', function(e) {
            // Verifica se o que foi clicado é um .dot ou está dentro de um
            const clickedDot = e.target.closest('.dot');
            
            if (clickedDot) {
                // Alterna a classe 'checked' para marcar/desmarcar
                clickedDot.classList.toggle('checked');
                
                // Opcional: Adicionar som ou feedback tátil aqui
                // navigator.vibrate(50); // Vibra no celular (se suportado)
            }
        });
    }

    // B) Filtro de Mês
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.addEventListener('change', function() {
            const selectedMonth = this.value;
            console.log("Filtro alterado para:", selectedMonth);

            // Simula o carregamento de novos dados baseados na seleção
            // Usamos um "seed" diferente para cada mês para mudar o padrão dos checks
            let simulationSeed = 0;
            if (selectedMonth === 'jan-26') simulationSeed = 5;
            if (selectedMonth === 'mar-26') simulationSeed = 2;
            if (selectedMonth === 'abr-26') simulationSeed = 8;

            // Regenera os dots com o novo padrão
            generateTrackerDots(simulationSeed);
        });
    }
}); // Fim do DOMContentLoaded
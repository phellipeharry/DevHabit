// js/landing.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Seleciona o botão de entrar
    const enterAppBtn = document.querySelector('.cta-button-pulse');
    const landingContainer = document.querySelector('.landing-container');

    if (enterAppBtn && landingContainer) {
        enterAppBtn.addEventListener('click', (e) => {
            // Previne a mudança de página imediata
            e.preventDefault();
            
            // Pega o link de destino (app.html)
            const targetUrl = enterAppBtn.getAttribute('href');

            // Adiciona a classe que faz o site sumir devagar (fade-out)
            landingContainer.classList.add('fade-out');

            // Espera 0.5s (tempo da animação CSS) e muda de página
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        });
    }
});
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const landingContainer = document.querySelector('.landing-container');
    const ctaStartBtn = document.getElementById('cta-start-btn');
    const openLoginBtn = document.getElementById('open-login-btn');
    
    // Elements of modal
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth-btn');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Check if user is already logged in
    const token = localStorage.getItem('token');

    // Auto-redirect if URL has query param for auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'login') {
        openModal('login');
    }

    // Modal Control
    function openModal(tab = 'login') {
        authModal.classList.remove('hidden');
        switchTab(tab);
    }

    function closeModal() {
        authModal.classList.add('hidden');
        loginForm.reset();
        registerForm.reset();
        loginError.classList.add('hidden');
        registerError.classList.add('hidden');
    }

    function switchTab(tab) {
        if (tab === 'login') {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', closeModal);
    }

    if (tabLoginBtn) {
        tabLoginBtn.addEventListener('click', () => switchTab('login'));
    }
    
    if (tabRegisterBtn) {
        tabRegisterBtn.addEventListener('click', () => switchTab('register'));
    }

    // Close modal clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // Start coding button logic
    if (ctaStartBtn) {
        ctaStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (token) {
                // If logged in, go to app
                fadeAndRedirect('app.html');
            } else {
                // If not logged in, show auth modal
                openModal('login');
            }
        });
    }

    function fadeAndRedirect(targetUrl) {
        landingContainer.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    }

    // Submit handlers
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                closeModal();
                fadeAndRedirect('app.html');
            } else {
                loginError.innerText = data.message || 'Dados de login incorretos.';
                loginError.classList.remove('hidden');
            }
        } catch (err) {
            loginError.innerText = 'Falha de conexão com o servidor.';
            loginError.classList.remove('hidden');
            console.error('Login error:', err);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.classList.add('hidden');
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                alert('Conta criada com sucesso! Por favor, faça login.');
                switchTab('login');
                document.getElementById('login-email').value = email;
            } else {
                registerError.innerText = data.message || 'Erro ao registrar conta.';
                registerError.classList.remove('hidden');
            }
        } catch (err) {
            registerError.innerText = 'Falha de conexão com o servidor.';
            registerError.classList.remove('hidden');
            console.error('Registration error:', err);
        }
    });
});
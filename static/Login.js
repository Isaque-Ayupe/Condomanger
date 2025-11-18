document.addEventListener('DOMContentLoaded', function () {

    // --- Seletores ---
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const emailinput = document.getElementById('email');
    const loginForm = document.getElementById('login-form');

    // --- DADOS DE LOGIN SIMULADOS ---
    // (Em um sistema real, isso viria de um banco de dados)
    // Vamos usar um CPF válido para nosso teste:
    const cpfCorreto = '711.622.051-80';
    const senhaCorreta = '1234';
    

    // =================================================================
    // --- LÓGICA para Mostrar/Ocultar Senha (Sem alteração) ---
    // =================================================================
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            // ... (código para ver/ocultar senha permanece o mesmo) ...
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('ri-eye-line');
            this.classList.toggle('ri-eye-off-line');
        });
    }

    // =================================================================
    // --- LÓGICA de Submissão do Formulário (ATUALIZADA) ---
    // =================================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailDigitado = emailinput.value;
            const senhaDigitada = passwordInput.value;


            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailDigitado,
                        senha: senhaDigitada
                    })
                });

                // Se o login deu certo, o Flask vai redirecionar ou renderizar
                const data = await response.json();

                if (data.ok) {
                    window.location.href = data.redirect;
                } else {
                    alert(data.msg);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao conectar com o servidor.');
            }
        });
    }
});
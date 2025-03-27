document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    const loginContainer = document.querySelector('.login-container');

    const nameInput = document.getElementById('name');
    const matriculaInput = document.getElementById('matricula');
    const nameError = document.getElementById('name-error');
    const matriculaError = document.getElementById('matricula-error');
    const cam = document.getElementById('cam');

    // Função para validar o formulário
    function validateForm() {
        let isValid = true;
        
        // Validação do nome
        if (!nameInput.value.trim()) {
            nameError.style.display = 'block';
            isValid = false;
        } else {
            nameError.style.display = 'none';
        }
        
        // Validação da matricula
        if (!matriculaInput.value.trim()) {
            matriculaError.style.display = 'block';
            isValid = false;
        } else {
            matriculaError.style.display = 'none';
        }
        
        return isValid;
    }

    // Evento de submit do formulário
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const matricula = matriculaInput.value;
            cam.style.display = 'block';

            loginContainer.style.display = 'none'; 

            faceAuth(matricula);
        }
    });

    // Validação em tempo real ao sair do campo
    nameInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            nameError.style.display = 'block';
        } else {
            nameError.style.display = 'none';
        }
    });

    matriculaInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            matriculaError.style.display = 'block';
        } else {
            matriculaError.style.display = 'none';
        }
    });

    nameInput.focus();
});
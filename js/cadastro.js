// Script for handling user registration form

document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.getElementById('cadastroForm');
    
    // Format input fields as user types
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            this.value = formatCPF(this.value);
        });
    }
    
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            this.value = formatPhone(this.value);
        });
    }
    
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            this.value = formatCEP(this.value);
        });
    }
    
    // Handle form submission
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate form
            if (!this.checkValidity()) {
                event.stopPropagation();
                this.classList.add('was-validated');
                return;
            }
            
            // Validate CPF
            const cpf = cpfInput.value;
            if (!validateCPF(cpf)) {
                const cpfFeedback = document.getElementById('cpfFeedback');
                cpfFeedback.textContent = 'CPF inválido. Por favor, verifique.';
                cpfInput.setCustomValidity('CPF inválido');
                this.classList.add('was-validated');
                return;
            }
            
            // Collect form data
            const userData = {
                nome: document.getElementById('nome').value,
                dataNascimento: document.getElementById('dataNascimento').value,
                cpf: cpfInput.value,
                rg: document.getElementById('rg').value,
                email: document.getElementById('email').value,
                telefone: telefoneInput.value,
                pis: document.getElementById('pis').value,
                profissao: document.getElementById('profissao').value,
                banco: document.getElementById('banco').value,
                agencia: document.getElementById('agencia').value,
                conta: document.getElementById('conta').value,
                cep: cepInput.value,
                logradouro: document.getElementById('logradouro').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value
            };
            
            // Save user data
            if (saveUser(userData)) {
                // Show success message
                Swal.fire({
                    title: 'Cadastro Realizado!',
                    text: 'Seus dados foram cadastrados com sucesso.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    // Reset form
                    cadastroForm.reset();
                    cadastroForm.classList.remove('was-validated');
                    
                    // Redirect to home page
                    window.location.href = 'index.html';
                });
            }
        });
    }
});
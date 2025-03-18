// Utility functions for form handling and data storage

// Function to format CPF: 000.000.000-00
function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

// Function to format phone: (00) 00000-0000
function formatPhone(phone) {
    phone = phone.replace(/\D/g, '');
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}

// Function to format CEP: 00000-000
function formatCEP(cep) {
    cep = cep.replace(/\D/g, '');
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

// Function to validate CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cpf.charAt(9)) !== checkDigit1) return false;
    
    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(cpf.charAt(10)) === checkDigit2;
}

// Function to save user data to localStorage
function saveUser(userData) {
    // Get existing users or initialize empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Add timestamp for when the user was registered
    userData.dataCadastro = new Date().toISOString();
    
    // Add the new user to the array
    users.push(userData);
    
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
}

// Function to get all users from localStorage
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Function to get user by CPF
function getUserByCPF(cpf) {
    const users = getAllUsers();
    return users.find(user => user.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''));
}

// Function to delete user by CPF
function deleteUserByCPF(cpf) {
    let users = getAllUsers();
    users = users.filter(user => user.cpf.replace(/\D/g, '') !== cpf.replace(/\D/g, ''));
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

// Function to update user data
function updateUserByCPF(cpf, updatedData) {
    let users = getAllUsers();
    const index = users.findIndex(user => user.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''));
    
    if (index !== -1) {
        // Preserve the original registration date
        updatedData.dataCadastro = users[index].dataCadastro;
        
        // Update the user data
        users[index] = updatedData;
        
        // Save back to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }
    
    return false;
}

// Function to update dashboard statistics
function updateDashboardStats() {
    const users = getAllUsers();
    
    // Update total users count
    const totalUsersElement = document.querySelector('.card.bg-primary .card-body h2');
    if (totalUsersElement) {
        totalUsersElement.textContent = users.length;
    }
    
    // Update today's registrations count
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const todayRegistrations = users.filter(user => {
        const registrationDate = new Date(user.dataCadastro).toISOString().split('T')[0];
        return registrationDate === today;
    }).length;
    
    const todayRegistrationsElement = document.querySelector('.card.bg-success .card-body h2');
    if (todayRegistrationsElement) {
        todayRegistrationsElement.textContent = todayRegistrations;
    }
}


// Function to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Function to get bank name from code
function getBankName(bankCode) {
    const banks = {
        '001': 'Banco do Brasil',
        '033': 'Santander',
        '104': 'Caixa Econômica Federal',
        '237': 'Bradesco',
        '341': 'Itaú',
        '260': 'Nubank',
        '077': 'Inter',
        'outros': 'Outros'
    };
    return banks[bankCode] || bankCode;
}

// Function to populate the users table in the admin dashboard
function populateUsersTable() {
    const users = getAllUsers();
    const tableBody = document.querySelector('#usersTable tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        // If no users, display a message
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8" class="text-center">Nenhum usuário cadastrado</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Add each user to the table
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.cpf}</td>
            <td>${user.email}</td>
            <td>${user.telefone}</td>
            <td>${getBankName(user.banco)}</td>
            <td>${user.pis}</td>
            <td>${formatDate(user.dataCadastro)}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-info view-user" data-cpf="${user.cpf.replace(/\D/g, '')}"><i class="bi bi-eye"></i></button>
                <button class="btn btn-sm btn-warning edit-user" data-cpf="${user.cpf.replace(/\D/g, '')}"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger delete-user" data-cpf="${user.cpf.replace(/\D/g, '')}"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view, delete, and export buttons
    addUserActionEventListeners();
}

// Function to add event listeners to user action buttons
function addUserActionEventListeners() {
    // View user details
    document.querySelectorAll('.view-user').forEach(button => {
        button.addEventListener('click', function() {
            const cpf = this.getAttribute('data-cpf');
            const user = getUserByCPF(cpf);
            if (user) {
                // Populate modal with user data
                document.getElementById('modalNome').textContent = user.nome;
                document.getElementById('modalCpf').textContent = user.cpf;
                document.getElementById('modalRg').textContent = user.rg;
                document.getElementById('modalNascimento').textContent = formatDate(user.dataNascimento);
                document.getElementById('modalEmail').textContent = user.email;
                document.getElementById('modalTelefone').textContent = user.telefone;
                document.getElementById('modalPis').textContent = user.pis;
                document.getElementById('modalProfissao').textContent = user.profissao || 'Não informado';
                document.getElementById('modalBanco').textContent = getBankName(user.banco);
                document.getElementById('modalAgencia').textContent = user.agencia;
                document.getElementById('modalConta').textContent = user.conta;
                
                // Populate address fields
                document.getElementById('modalCep').textContent = user.cep || 'Não informado';
                document.getElementById('modalLogradouro').textContent = user.logradouro || 'Não informado';
                document.getElementById('modalNumero').textContent = user.numero || 'Não informado';
                document.getElementById('modalComplemento').textContent = user.complemento || 'Não informado';
                document.getElementById('modalBairro').textContent = user.bairro || 'Não informado';
                document.getElementById('modalCidade').textContent = user.cidade || 'Não informado';
                document.getElementById('modalEstado').textContent = user.estado || 'Não informado';
                
                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
                modal.show();
            }
        });
    });
    
    // Edit user
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', function() {
            const cpf = this.getAttribute('data-cpf');
            const user = getUserByCPF(cpf);
            
            if (user) {
                // Load edit modal content if not already loaded
                const editModalContainer = document.getElementById('editUserModalContainer');
                if (!editModalContainer.innerHTML.trim()) {
                    fetch('editUserModal.html')
                        .then(response => response.text())
                        .then(html => {
                            editModalContainer.innerHTML = html;
                            populateEditForm(user);
                            setupEditFormEvents(cpf);
                        })
                        .catch(error => {
                            console.error('Error loading edit modal:', error);
                            Swal.fire('Erro', 'Não foi possível carregar o formulário de edição.', 'error');
                        });
                } else {
                    populateEditForm(user);
                    setupEditFormEvents(cpf);
                }
            }
        });
    });
    
    // Delete user
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const cpf = this.getAttribute('data-cpf');
            const user = getUserByCPF(cpf);
            
            if (user) {
                // Confirm deletion
                Swal.fire({
                    title: 'Confirmar exclusão',
                    text: `Deseja realmente excluir o usuário ${user.nome}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sim, excluir',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Delete the user
                        if (deleteUserByCPF(cpf)) {
                            Swal.fire(
                                'Excluído!',
                                'O usuário foi excluído com sucesso.',
                                'success'
                            );
                            // Refresh the table and stats
                            populateUsersTable();
                            updateDashboardStats();
                        }
                    }
                });
            }
        });
    });
    
    // Export user data (PDF, Excel, CSV)
    document.querySelectorAll('.export-pdf, .export-excel, .export-csv').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const cpf = this.getAttribute('data-cpf');
            const user = getUserByCPF(cpf);
            
            if (user) {
                // Determine export type based on class
                if (this.classList.contains('export-pdf')) {
                    exportToPDF([user]);
                } else if (this.classList.contains('export-excel')) {
                    exportToExcel([user]);
                } else if (this.classList.contains('export-csv')) {
                    exportToCSV([user]);
                }
            } else {
                Swal.fire('Erro', 'Usuário não encontrado.', 'error');
            }
        });
    });
}

// Function to populate the edit form with user data
function populateEditForm(user) {
    // Set the hidden CPF field
    document.getElementById('editUserCpf').value = user.cpf.replace(/\D/g, '');
    
    // Populate personal data
    document.getElementById('editNome').value = user.nome;
    document.getElementById('editRg').value = user.rg;
    document.getElementById('editDataNascimento').value = user.dataNascimento;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editTelefone').value = user.telefone;
    
    // Populate professional and bank data
    document.getElementById('editPis').value = user.pis;
    document.getElementById('editProfissao').value = user.profissao || '';
    document.getElementById('editBanco').value = user.banco;
    document.getElementById('editAgencia').value = user.agencia;
    document.getElementById('editConta').value = user.conta;
    
    // Populate address data
    document.getElementById('editCep').value = user.cep;
    document.getElementById('editLogradouro').value = user.logradouro;
    document.getElementById('editNumero').value = user.numero;
    document.getElementById('editComplemento').value = user.complemento || '';
    document.getElementById('editBairro').value = user.bairro;
    document.getElementById('editCidade').value = user.cidade;
    document.getElementById('editEstado').value = user.estado;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

// Function to setup edit form events
function setupEditFormEvents(cpf) {
    // Format input fields as user types
    const telefoneInput = document.getElementById('editTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            this.value = formatPhone(this.value);
        });
    }
    
    const cepInput = document.getElementById('editCep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            this.value = formatCEP(this.value);
        });
    }
    
    // Save button event
    document.getElementById('saveEditBtn').addEventListener('click', function() {
        const form = document.getElementById('editUserForm');
        
        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Collect form data
        const updatedData = {
            nome: document.getElementById('editNome').value,
            dataNascimento: document.getElementById('editDataNascimento').value,
            cpf: getUserByCPF(cpf).cpf, // Keep the original formatted CPF
            rg: document.getElementById('editRg').value,
            email: document.getElementById('editEmail').value,
            telefone: document.getElementById('editTelefone').value,
            pis: document.getElementById('editPis').value,
            profissao: document.getElementById('editProfissao').value,
            banco: document.getElementById('editBanco').value,
            agencia: document.getElementById('editAgencia').value,
            conta: document.getElementById('editConta').value,
            cep: document.getElementById('editCep').value,
            logradouro: document.getElementById('editLogradouro').value,
            numero: document.getElementById('editNumero').value,
            complemento: document.getElementById('editComplemento').value,
            bairro: document.getElementById('editBairro').value,
            cidade: document.getElementById('editCidade').value,
            estado: document.getElementById('editEstado').value
        };
        
        // Update user data
        if (updateUserByCPF(cpf, updatedData)) {
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            
            // Show success message
            Swal.fire({
                title: 'Dados Atualizados!',
                text: 'Os dados do usuário foram atualizados com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Refresh the table
                populateUsersTable();
            });
        } else {
            Swal.fire('Erro', 'Não foi possível atualizar os dados do usuário.', 'error');
        }
    });
}

// Function to handle search in the admin dashboard
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#usersTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Function to handle bank filtering in the admin dashboard
function setupBankFilter() {
    const bankFilter = document.getElementById('bankFilter');
    if (!bankFilter) return;
    
    bankFilter.addEventListener('change', function() {
        const selectedBank = this.value;
        const rows = document.querySelectorAll('#usersTable tbody tr');
        
        rows.forEach(row => {
            if (!selectedBank) {
                row.style.display = '';
                return;
            }
            
            const bankCell = row.cells[4]; // Bank is in the 5th column (index 4)
            if (bankCell) {
                const bankText = bankCell.textContent;
                row.style.display = bankText.includes(getBankName(selectedBank)) ? '' : 'none';
            }
        });
    });
}

// Function to handle state filtering in the admin dashboard
function setupStateFilter() {
    const stateFilter = document.getElementById('stateFilter');
    if (!stateFilter) return;
    
    stateFilter.addEventListener('change', function() {
        const selectedState = this.value;
        if (!selectedState) {
            // If no state is selected, show all users
            populateUsersTable();
            return;
        }
        
        // Get all users and filter by state
        const users = getAllUsers();
        const filteredUsers = users.filter(user => user.estado === selectedState);
        
        // Update the table with filtered users
        const tableBody = document.querySelector('#usersTable tbody');
        tableBody.innerHTML = '';
        
        if (filteredUsers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="text-center">Nenhum usuário encontrado para o estado selecionado</td>`;
            tableBody.appendChild(row);
            return;
        }
        
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.cpf}</td>
                <td>${user.email}</td>
                <td>${user.telefone}</td>
                <td>${getBankName(user.banco)}</td>
                <td>${user.pis}</td>
                <td>${formatDate(user.dataCadastro)}</td>
                <td>
                    <button class="btn btn-sm btn-info view-user" data-cpf="${user.cpf.replace(/\D/g, '')}"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-danger delete-user" data-cpf="${user.cpf.replace(/\D/g, '')}"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to the new buttons
        addUserActionEventListeners();
    });
}

// Function to export data to PDF
function exportToPDF(users) {
    // Create a new jsPDF instance
    const doc = new jspdf.jsPDF ? new jspdf.jsPDF() : new window.jspdf.jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Relatório de Usuários Cadastrados', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data de geração: ${formatDate(new Date().toISOString())}`, 14, 30);
    
    // Define the columns for the table
    const columns = [
        {header: 'Nome', dataKey: 'nome'},
        {header: 'CPF', dataKey: 'cpf'},
        {header: 'Email', dataKey: 'email'},
        {header: 'Telefone', dataKey: 'telefone'},
        {header: 'Banco', dataKey: 'banco'},
        {header: 'PIS/PASEP', dataKey: 'pis'},
        {header: 'Data Cadastro', dataKey: 'dataCadastro'}
    ];
    
    // Prepare the data
    const data = users.map(user => ({
        nome: user.nome,
        cpf: user.cpf,
        email: user.email,
        telefone: user.telefone,
        banco: getBankName(user.banco),
        pis: user.pis,
        dataCadastro: formatDate(user.dataCadastro)
    }));
    
    // Generate the table
    doc.autoTable({
        startY: 40,
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => item[col.dataKey])),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Save the PDF
    doc.save('usuarios_cadastrados.pdf');
    
    Swal.fire('Exportação Concluída', 'Os dados foram exportados com sucesso no formato PDF.', 'success');
}

// Function to export data to CSV
function exportToCSV(users) {
    // Create CSV content
    let csvContent = 'Nome,CPF,Email,Telefone,Banco,PIS/PASEP,Data Cadastro\n';
    
    users.forEach(user => {
        csvContent += `"${user.nome}","${user.cpf}","${user.email}","${user.telefone}","${getBankName(user.banco)}","${user.pis}","${formatDate(user.dataCadastro)}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'usuarios_cadastrados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire('Exportação Concluída', 'Os dados foram exportados com sucesso no formato CSV.', 'success');
}

// Function to export data to Excel
function exportToExcel(users) {
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
        'Nome': user.nome,
        'CPF': user.cpf,
        'Email': user.email,
        'Telefone': user.telefone,
        'Banco': getBankName(user.banco),
        'PIS/PASEP': user.pis,
        'Data Cadastro': formatDate(user.dataCadastro)
    })));
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuários');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'usuarios_cadastrados.xlsx');
    
    Swal.fire('Exportação Concluída', 'Os dados foram exportados com sucesso no formato Excel.', 'success');
}

// Function to export data to PDF
function exportToPDF(users) {
    // Create a new jsPDF instance
    const doc = new jspdf.jsPDF ? new jspdf.jsPDF() : new window.jspdf.jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Relatório de Usuários Cadastrados', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data de geração: ${formatDate(new Date().toISOString())}`, 14, 30);
    
    // Define the columns for the table
    const columns = [
        {header: 'Nome', dataKey: 'nome'},
        {header: 'CPF', dataKey: 'cpf'},
        {header: 'Email', dataKey: 'email'},
        {header: 'Telefone', dataKey: 'telefone'},
        {header: 'Banco', dataKey: 'banco'},
        {header: 'PIS/PASEP', dataKey: 'pis'},
        {header: 'Data Cadastro', dataKey: 'dataCadastro'}
    ];
    
    // Prepare the data
    const data = users.map(user => ({
        nome: user.nome,
        cpf: user.cpf,
        email: user.email,
        telefone: user.telefone,
        banco: getBankName(user.banco),
        pis: user.pis,
        dataCadastro: formatDate(user.dataCadastro)
    }));
    
    // Generate the table
    doc.autoTable({
        startY: 40,
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => item[col.dataKey])),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Save the PDF
    doc.save('usuarios_cadastrados.pdf');
    
    Swal.fire('Exportação Concluída', 'Os dados foram exportados com sucesso no formato PDF.', 'success');
}

// Initialize the dashboard
function initDashboard() {
    updateDashboardStats();
    populateUsersTable();
    setupSearch();
    setupBankFilter();
    setupStateFilter();
}
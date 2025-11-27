document.addEventListener('DOMContentLoaded', function() {
    // =================================================================
    // --- CONFIGURAÇÕES E SELETORES GLOBAIS ---
    // =================================================================

    // --- Seletores (Junção dos dois arquivos) ---
    const mainTitle = document.getElementById('main-title');
    const contentSections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const menuButton = document.getElementById('menu-toggle');
    
    // USUARIOS
    const residentsList = document.querySelector('.residents-list');
    const addModal = document.getElementById('add-resident-modal');
    const editModal = document.getElementById('edit-resident-modal');
    const deleteModal = document.getElementById('delete-confirm-modal');
    const addResidentPhotoInput = document.getElementById('add-resident-photo-input');
    const addResidentPhotoPreview = document.getElementById('add-resident-photo-preview');
    const editResidentPhotoInput = document.getElementById('edit-resident-photo-input');
    const editResidentPhotoPreview = document.getElementById('edit-resident-photo-preview');
    const defaultResidentPhoto = 'https://i.pravatar.cc/100?u=new';

    // Comunicados
    const announcementsGrid = document.querySelector('.announcements-grid');
    const announcementModal = document.getElementById('announcement-modal');
    const announcementForm = document.getElementById('announcement-form');
    const addAnnouncementBtn = document.getElementById('add-announcement-btn');

    // Reservas 
    const amenityLinks = document.querySelectorAll('.amenity-link');
    const amenityViews = document.querySelectorAll('.amenity-view');
    const bookingModal = document.getElementById('booking-modal');
    const bookingModalDate = document.getElementById('booking-modal-date');
    const bookingList = document.getElementById('booking-list');
    const bookingForm = document.getElementById('booking-form');
    const bookingResidentSelect = document.getElementById('booking-resident-select');
    const bookingTimeSlotsContainer = document.getElementById('booking-time-slots');
    const bookingAmenityIdInput = document.getElementById('booking-amenity-id');
    const bookingDateInput = document.getElementById('booking-date');
    const bookingViewContainer = document.getElementById('booking-view-container');
    const bookingAddView = document.getElementById('booking-add-view');
    const goToAdicionarBtn = document.getElementById('go-to-add-booking-btn');
    const backToViewBtn = bookingModal ? bookingModal.querySelector('.cancel-add-view-btn') : null;

    // Classificados
    const classifiedsGrid = document.querySelector(".classifieds-grid");
    const addClassifiedBtn = document.getElementById('add-classified-btn');
    const addClassifiedModal = document.getElementById('add-classified-modal');
    const addClassifiedForm = document.getElementById('add-classified-form');
    const addClassifiedPhotoInput = document.getElementById('add-classified-photo-input');
    const addClassifiedPhotoPreview = document.getElementById('add-classified-photo-preview');
    const editClassifiedModal = document.getElementById('edit-classified-modal');
    const editClassifiedForm = document.getElementById('edit-classified-form');
    const addClassifiedPhoneInput = document.getElementById('classified-phone');
    const editClassifiedPhoneInput = document.getElementById('edit-classified-phone');


    // Manutencao
    const maintenanceGrid = document.querySelector('.maintenance-grid');
    const maintenanceModal = document.getElementById('maintenance-modal');
    const maintenanceForm = document.getElementById('maintenance-form');
    const addMaintenanceBtn = document.getElementById('add-maintenance-btn');

    // Variáveis de Estado 
    let residentIdToModify = null;
    let announcementIdToModify = null;
    let classifiedIdToModify = null;
    let reservaIdToCancel = null;
    let todosOsMoradores = [];
    let todasAsReservas = [];
    let todosOsComunicados = [];
    let todosOsClassificados = [];
    let maintenanceIdToModify = null;
    let ordemAtual = "crescente"; 

    // =================================================================
    // --- LÓGICA DE TEMA E LOGOUT 
    // =================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    // 
    const htmlEl = document.documentElement; 

    function toggleTheme() {
        // Verifica se o atributo está na tag HTML
        const isDark = htmlEl.getAttribute('data-theme') === 'dark';
        const icon = themeToggleBtn.querySelector('i');
        const text = themeToggleBtn.querySelector('span');

        if (isDark) {
            // Voltar para Claro
            htmlEl.removeAttribute('data-theme');
            icon.className = 'ri-moon-line';
            text.textContent = 'Modo Escuro';
        } else {
            // Mudar para Escuro
            htmlEl.setAttribute('data-theme', 'dark');
            icon.className = 'ri-sun-line';
            text.textContent = 'Modo Claro';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (confirm("Deseja realmente sair do sistema?")) {

            const response = await fetch('/logout', { method: 'POST' });
            const data = await response.json();

            window.location.href = data.redirect;
        }
    });
}


/*
    logica para alterar a senha
*/
const changePasswordBtn = document.getElementById('open-change-password-btn');
const changePasswordModal = document.getElementById('change-password-modal');
const changePasswordForm = document.getElementById('change-password-form');

if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        if (changePasswordForm) changePasswordForm.reset();
        changePasswordModal.classList.add('active');
    });
}

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-new-password').value;

        if (newPass !== confirmPass) {
            alert("A nova senha e a confirmação não conferem.");
            return;
        }

        if (currentPass === newPass) {
            alert("A nova senha não pode ser igual à senha atual.");
            return;
        }

        try {
            const response = await fetch("/alterar_senha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    current_password: currentPass,
                    new_password: newPass
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Erro ao alterar senha.");
                return;
            }

            alert("Senha alterada com sucesso!");
            changePasswordModal.classList.remove('active');
            changePasswordForm.reset();

        } catch (err) {
            console.error(err);
            alert("Erro de conexão com o servidor.");
        }
    });
}

    // =================================================================
    // --- FUNÇÕES 
    // =================================================================

    async function carregarMoradores() {
        try {
            const response = await fetch("/usuarios", {method: 'GET'});
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
            todosOsMoradores = await response.json();
            renderizarMoradores(todosOsMoradores);
            atualizarDashboard();
        } catch (error) {
            console.error('Falha ao buscar moradores:', error);
            if (residentsList) residentsList.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os moradores.</p>`;
        }
    }

    async function editarMorador(id) {
    const formData = new FormData();

    const nome = document.querySelector('#edit-resident-name').value.trim();
    const endereco = document.querySelector('#edit-resident-unit').value.trim();
    const email = document.querySelector('#edit-resident-email').value.trim();
    const telefone = document.querySelector('#edit-resident-phone').value.trim();
    const foto = document.querySelector('#edit-resident-photo-input').files[0];

    formData.append("nome", nome);
    formData.append("endereco", endereco);
    formData.append("email", email);
    formData.append("telefone", telefone);

    if (foto) {
        formData.append("foto", foto);
    }

    try {
        const response = await fetch(`/usuarios/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) throw new Error("Erro ao atualizar");

        return await response.json();
    } catch (error) {
        console.error("Falha ao editar usuario:", error);
        return null;
    }
}

    async function deletarMorador(id) {
        try {
            const response = await fetch(`/usuarios/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar morador');
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar usuarios:', error);
            alert('Não foi possível deletar o usuarios.');
            return null;
        }
    }

    async function carregarComunicados() {
        try {
            const response = await fetch(`/comunicados`,{method: 'GET'});
            if (!response.ok) throw new Error('Erro ao buscar comunicados');
            todosOsComunicados = await response.json();
            renderizarComunicados(todosOsComunicados);
        } catch (error) {
            console.error('Falha ao carregar comunicados:', error);
            if (announcementsGrid) announcementsGrid.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os comunicados.</p>`;
        }
    }


    async function adicionarComunicado(comunicadoData) {
        try {
            const response = await fetch(`/comunicados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comunicadoData),
            });
            if (!response.ok) throw new Error('Erro ao salvar comunicado');
            return await response.json();
        } catch (error) {
            console.error('Falha ao adicionar comunicado:', error);
            alert('Não foi possível salvar o comunicado.');
            return null;
        }
    }

    async function editarComunicado(id, comunicadoData) {
        try {
            const response = await fetch(`/comunicados/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comunicadoData),
            });
            if (!response.ok) throw new Error('Erro ao editar comunicado');
            return await response.json();
        } catch (error) {
            console.error('Falha ao editar comunicado:', error);
            alert('Não foi possível editar o comunicado.');
            return null;
        }
    }

    async function deletarComunicado(comunicadoId) {
        try {
            const response = await fetch(`/comunicados/${comunicadoId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar comunicado');
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar comunicado:', error);
            alert('Não foi possível deletar o comunicado.');
            return null;
        }
    }

    //funcao de carregar logs
    async function carregarLogs() {
    const container = document.getElementById("logs-container");
    container.innerHTML = "<p>Carregando logs...</p>";

    try {
        const response = await fetch("/reserva/logs", {method:'GET'});
        const logs = await response.json();

        if (!logs || logs.length === 0) {
            container.innerHTML = "<p>Nenhum log encontrado.</p>";
            return;
        }

        let html = `
            <table class="logs-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ação</th>
                        <th>Usuário_cadastrado</th>
                        <th>Data/Hora</th>
                        <th>Local</th>
                    </tr>
                </thead>
                <tbody>
        `;

        logs.forEach(log => {
            html += `
                <tr>
                    <td>${log.id_reservas}</td>
                    <td class="acao-${log.acao_log.toLowerCase()}">${log.acao_log}</td>
                    <td>${log.usuario_cadastrado}</td>
                    <td>${log.data_hora.toLocaleString()}</td>
                    <td>
                        ${log.local_area || "—"}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = "<p>Erro ao carregar logs.</p>";
        console.error("Erro ao buscar logs:", error);
    }
}
document.querySelector("#btn-logs a").addEventListener("click", () => {
    document.querySelectorAll(".amenity-view").forEach(v => v.classList.remove("active"));
    document.getElementById("logs-reservas").classList.add("active");

    carregarLogs();
});

    //funcao para puxar reservas
    async function carregarReservas() {
    try {
        // Garantimos que a lista esteja vazia antes de carregar
        todasAsReservas = []; 
        
        // Chamada para a rota Python corrigida
        const response = await fetch(`/reservas`); 
        if (!response.ok) throw new Error('Erro ao buscar reservas');
        todasAsReservas = await response.json();
        const activeAmenity = document.querySelector('.amenity-view.active');
        if (activeAmenity) renderCalendar(activeAmenity.id);
    } catch (error) {
        console.error('Falha ao carregar reservas:', error);
    }
}

    //adicionar reserva
   async function adicionarReserva(reservaData) {
    try {
        const response = await fetch(`/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservaData),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.erro || "Erro ao criar reserva.");
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error('Falha ao criar reserva:', error);
        alert('Não foi possível criar a reserva.');
        return null;
    }
}

    //deleta reserva
    async function deletarReserva(id_reserva) {
        try {
            const response = await fetch(`/reservas/${id_reserva}`, { method: 'DELETE' });
            
            if (!response.ok) {
                // Se der erro (404, 400), pega a mensagem JSON do Python
                const data = await response.json();
                throw new Error(data.erro || 'Erro ao deletar reserva');
            }
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar reserva:', error);
            
            document.getElementById('delete-modal-title').textContent = "Erro de Cancelamento";
            document.getElementById('delete-modal-text').textContent = `Falha ao cancelar: ${error.message}`;
            document.getElementById('confirm-delete-btn').style.display = 'none'; // Esconde o botão de confirmação
            
        return null;
    }
}

    //função de get classificados
    async function carregarClassificados() {
        try {
            const response = await fetch(`/classificados`, {method: 'GET'});
            if (!response.ok) throw new Error('Erro ao buscar classificados');
            todosOsClassificados = await response.json();
            classificadosAtuais = [...todosOsClassificados];
            renderClassifieds(todosOsClassificados);
        } catch (error) {
            console.error('Falha ao carregar classificados:', error);
            if (classifiedsGrid) classifiedsGrid.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os classificados.</p>`;
        }
    }


/* 
filtro entre meu anuncio e todos
*/
let classificadosAtuais = [];
const btnAll = document.getElementById("filter-all-classifieds");
const btnMine = document.getElementById("filter-my-classifieds");

btnAll.addEventListener("click", () => {
    btnAll.classList.add("active");
    btnMine.classList.remove("active");

    classificadosAtuais = [...todosOsClassificados];
    aplicarOrdenacao(classificadosAtuais);
});

btnMine.addEventListener("click", async () => {
    btnMine.classList.add("active");
    btnAll.classList.remove("active");

    const response = await fetch("/meus_classificados");
    const meus = await response.json();

    classificadosAtuais = [...meus]; // <-- e aqui também
    aplicarOrdenacao(classificadosAtuais);
});

// ==========================
// Botão de Ordenação
// ==========================
const btnOrdenar = document.getElementById("btn-ordenar");

if (btnOrdenar) {
    btnOrdenar.addEventListener("click", () => {
        ordemAtual = ordemAtual === "crescente" ? "decrescente" : "crescente";

        // Atualiza visual da seta
        document.getElementById("seta").style.transform =
            ordemAtual === "crescente" ? "rotate(0deg)" : "rotate(180deg)";

           aplicarOrdenacao(classificadosAtuais); // ← a magia tá aqui
    });
}

//funcao de ordenacao 
function aplicarOrdenacao(lista) {
    let ordenada = [...lista];

    ordenada.sort((a, b) => {
        const precoA = parseFloat(a.preco);
        const precoB = parseFloat(b.preco);

        return ordemAtual === "crescente"
            ? precoA - precoB
            : precoB - precoA;
    });

    renderClassifieds(ordenada);
}

//crud de classificados
async function adicionarClassificado(formData) {
    try {
        const response = await fetch(`/classificados`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error(`Erro ao salvar: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Falha ao adicionar classificado:', error);
        alert('Não foi possível adicionar o classificado. Tente novamente.');
        return null;
    }
}

async function editarClassificado(id, classificadoData) {
    try {
        const response = await fetch(`/classificados/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classificadoData),
        });
        if (!response.ok) throw new Error(`Erro ao editar: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Falha ao editar classificado:', error);
        alert('Não foi possível editar o classificado. Tente novamente.');
        return null;
    }
}

async function deletarClassificado(id) {
    try {
        const response = await fetch(`/classificados/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro ao deletar classificado');
        return await response.json();
    } catch (error) {
        console.error('Falha ao deletar classificado:', error);
        alert('Não foi possível deletar o classificado.');
        return null;
    }
}


    // =================================================================
    // ---LÓGICA DE MANUTENÇÃO ---
    // =================================================================
let maintenanceData = [];

//carregar manutencao
async function carregarManutencoes() {
    try {
        const response = await fetch("/manutencao", { method: "GET" });
        if (!response.ok) throw new Error("Erro ao buscar manutenções");

        maintenanceData = await response.json();
        renderMaintenanceReports();
    } catch (error) {
            console.error('Falha ao buscar manutencoes:', error);
            if (maintenanceGrid) maintenanceGrid.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar as manutencoes.</p>`;
        }
    }

document.addEventListener("DOMContentLoaded", carregarManutencoes);


//  CRIAR CARD DA MANUTENÇÃO
function createMaintenanceElement({ id, titulo, descricao, data, status }) {
    const card = document.createElement('div');
    card.className = 'maintenance-card';
    card.dataset.id = id;

    const formattedDate = new Date(data).toLocaleDateString(
        'pt-BR',
        { day: '2-digit', month: 'long', year: 'numeric' }
    );

    card.innerHTML = `
        <div class="card-content">
            <h3>${titulo}</h3>
            <div class="card-meta">
                <p class="date"><i class="ri-calendar-line"></i> ${formattedDate}</p>
                <span class="status-badge ${status}"></span>
            </div>
            <p class="description">${descricao}</p>
        </div>
        <div class="card-actions">
            <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
            <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
        </div>`;
    
    return card;
}

// =========================
//  RENDERIZAR GRID
// =========================
function renderMaintenanceReports() {
    if (!maintenanceGrid) return;
    maintenanceGrid.innerHTML = '';

    maintenanceData
        .slice()
        .reverse()
        .forEach(report => {
            maintenanceGrid.appendChild(createMaintenanceElement(report));
        });
}

// =========================
//  AÇÕES (EDITAR / EXCLUIR)
// =========================
function handleMaintenanceActions(e) {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');


    // ----- EDITAR -----
    if (editBtn) {
        const card = editBtn.closest('.maintenance-card');
        maintenanceIdToModify = card.dataset.id;

        const report = maintenanceData.find(m => m.id == maintenanceIdToModify);
        if (report) {
            maintenanceModal.querySelector('#maintenance-modal-title').textContent = "Editar Relatório";
            maintenanceModal.querySelector('#maintenance-id').value = report.id;
            maintenanceModal.querySelector('#maintenance-title').value = report.titulo;
            maintenanceModal.querySelector('#maintenance-desc').value = report.descricao;
            maintenanceModal.querySelector('#maintenance-status').value = report.status;

            maintenanceModal.classList.add('active');
        }
    }

    // ----- EXCLUIR -----
    if (deleteBtn) {
        maintenanceIdToModify = deleteBtn.closest('.maintenance-card').dataset.id;

        document.getElementById('delete-modal-title').textContent = "Excluir Relatório";
        document.getElementById('delete-modal-text').textContent =
            "Tem certeza de que deseja excluir este relatório de manutenção?";

        document.getElementById('delete-confirm-modal').classList.add('active');
    }
}

// BOTÃO DE CONFIRMAR EXCLUSÃO
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.querySelector(".cancel-delete-btn");
const deleteConfirmModal = document.getElementById("delete-confirm-modal");

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
        if (!maintenanceIdToModify) return;

        const result = await deletarmanutencao(maintenanceIdToModify);

        if (result) {
            // fechar modal
            deleteConfirmModal.classList.remove("active");

            // recarregar lista
            await carregarManutencoes();  // nome da função que você usa para listar
        }
    });
}

// FECHAR AO CANCELAR
if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
        deleteConfirmModal.classList.remove("active");
    });
}

// =========================
//  FUNÇÃO: ADICIONAR
// =========================
async function adicionarmanutencao(data) {
    try {
        const response = await fetch("/manutencao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        return await response.json();
    } catch (error) {
        console.error("Erro ao adicionar:", error);
        return null;
    }
}

// =========================
//  FUNÇÃO: EDITAR
// =========================
async function editarmanutencao(id, data) {
    try {
        const response = await fetch(`/manutencao/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        return await response.json();
    } catch (error) {
        console.error("Erro ao editar:", error);
        return null;
    }
}

// =========================
//  FUNÇÃO: DELETAR
// =========================
async function deletarmanutencao(id) {
    try {
        const response = await fetch(`/manutencao/${id}`, {
            method: "DELETE"
        });

        return await response.json();
    } catch (error) {
        console.error("Erro ao apagar:", error);
        return null;
    }
}

// =========================
//  SUBMIT DO FORMULÁRIO
// =========================
async function handleMaintenanceSubmit(e) {
    e.preventDefault();

    const id = maintenanceForm.querySelector('#maintenance-id').value;

    const data = {
        titulo: maintenanceForm.querySelector('#maintenance-title').value,
        descricao: maintenanceForm.querySelector('#maintenance-desc').value,
        status: maintenanceForm.querySelector('#maintenance-status').value,
        usuario: userId // se quiser
    };

    let result;

    if (id) {
        result = await editarmanutencao(id, data);
    } else {
        result = await adicionarmanutencao(data);
    }

    if (result) {
        carregarManutencoes();
        maintenanceModal.classList.remove('active');
    }
}

// =========================
//  LISTENERS
// =========================
if (maintenanceGrid) {
    maintenanceGrid.addEventListener('click', handleMaintenanceActions);
}

if (addMaintenanceBtn) {
    addMaintenanceBtn.addEventListener('click', () => {
        maintenanceForm.reset();
        maintenanceModal.querySelector('#maintenance-id').value = '';
        maintenanceModal.querySelector('#maintenance-modal-title').textContent = 'Novo Relatório de Manutenção';
        maintenanceModal.querySelector('#maintenance-status').value = 'pending';
        maintenanceModal.classList.add('active');
    });
}

if (maintenanceForm) {
    maintenanceForm.addEventListener('submit', handleMaintenanceSubmit);
}





    // =================================================================
    // --- LÓGICA DO DASHBOARD ---
    // =================================================================
function atualizarDashboard() {
    // Se a lista ainda não carregou, pare para evitar erros
    if (!todasAsReservas) return;

    const elTotalMoradores = document.getElementById('total-moradores');
    const elReservasHoje = document.getElementById('reservas-semana'); 
    const elReservasMes = document.getElementById('reservas-mes');
    const ctx = document.getElementById('reservas-chart');

    // 1. Atualiza Total de Moradores
    if (elTotalMoradores) {
        elTotalMoradores.textContent = todosOsMoradores.length;
    }

    // --- CRIAÇÃO DA DATA DE HOJE (LOCAL) ---
    const dataHoje = new Date();
    const ano = dataHoje.getFullYear();
    const mes = String(dataHoje.getMonth() + 1).padStart(2, '0');
    const dia = String(dataHoje.getDate()).padStart(2, '0');
    
    // Formato exato que vem do Python: "YYYY-MM-DD"
    const hojeString = `${ano}-${mes}-${dia}`; 
    
    console.log("--- DEBUG DASHBOARD ---");
    console.log("Data de Hoje (Sistema):", hojeString);
    console.log("Total de Reservas Carregadas:", todasAsReservas.length);

    // --- CÁLCULO DAS RESERVAS ---
    
    // Contagem: Reservas de HOJE
    const countHoje = todasAsReservas.filter(r => {
        if (!r.data) return false;
        // Pega os 10 primeiros caracteres da data da reserva
        const dataReserva = String(r.data).substring(0, 10);
        return dataReserva === hojeString;
    }).length;

    // Contagem: Reservas do MÊS ATUAL
    const countMes = todasAsReservas.filter(r => {
        if (!r.data) return false;
        const dataReserva = String(r.data).substring(0, 10);
        const [rAno, rMes] = dataReserva.split('-'); // Separa "2023", "11", "25"
        
        // Compara Ano e Mês iguais
        return rAno == ano && rMes == mes;
    }).length;

    console.log("Contagem Hoje:", countHoje);
    console.log("Contagem Mês:", countMes);

    // --- ATUALIZAÇÃO DA TELA ---

    if (elReservasHoje) {
        elReservasHoje.textContent = countHoje;
        // Ajusta o título do card para fazer sentido
        const cardTitle = elReservasHoje.parentElement.querySelector('p');
        if (cardTitle) cardTitle.textContent = 'Reservas de Hoje';
    }

    if (elReservasMes) {
        elReservasMes.textContent = countMes;
    }

    // --- GRÁFICO ---
    if (ctx) {
        // Zera contadores
        let stats = {
            'salao-festas': 0, 'academia': 0, 'piscina': 0, 'quadra-tenis': 0
        };

        // Conta
        todasAsReservas.forEach(r => {
            // Normaliza a chave (remove espaços ou diferenças se houver)
            if (stats[r.area] !== undefined) {
                stats[r.area]++;
            }
        });

        if (window.myChart instanceof Chart) window.myChart.destroy();

        const styles = getComputedStyle(document.body);
        const cardBg = styles.getPropertyValue('--card-background').trim() || '#fff';
        const textColor = styles.getPropertyValue('--text-color').trim() || '#333';

        window.myChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut', 
            data: { 
                labels: ['Salão de Festas', 'Academia', 'Piscina', 'Quadra'], 
                datasets: [{ 
                    label: 'Total', 
                    data: [stats['salao-festas'], stats['academia'], stats['piscina'], stats['quadra-tenis']],
                    backgroundColor: ['#4A55E1', '#34D399', '#F59E0B', '#EF4444'], 
                    borderColor: cardBg, 
                    borderWidth: 2 
                }] 
            },
            options: { 
                responsive: true, 
                plugins: { legend: { position: 'top', labels: { color: textColor } } } 
            }
        });
    }
}

    // =================================================================
    // --- FUNÇÕES DE RENDERIZAÇÃO E LÓGICA DO FRONTEND ---
    // =================================================================
    
    //funcao que renderiza a grade de moradores
    function renderizarMoradores(moradores) {
    if (!residentsList) return;

    residentsList.innerHTML = '';

    if (!moradores || moradores.length === 0) {
        residentsList.innerHTML = `<p style="text-align: center;">Nenhum morador cadastrado.</p>`;
        return;
    }

    moradores.forEach(morador => {
        const newItem = document.createElement('div');
        newItem.className = 'resident-item';

        newItem.dataset.id = morador.id_usuario;
        newItem.dataset.nome = morador.nome;
        newItem.dataset.unit = morador.endereco;     
        newItem.dataset.email = morador.email;
        newItem.dataset.telefone = morador.telefone;

        const fotoSrc = morador.foto_url 
            ? morador.foto_url 
            : `https://i.pravatar.cc/50?u=${morador.id}`;

        newItem.innerHTML = `
            <div class="resident-info">
                <img src="${fotoSrc}" alt="${morador.nome}">
                <div>
                    <p class="resident-name">${morador.nome}</p>
                    <p class="resident-details">Unidade ${morador.endereco} | ${morador.email}</p> 
                </div>
            </div>
            <div class="resident-actions">
                <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
                <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
            </div>
        `;

        residentsList.appendChild(newItem);
    });
}

    //funçao que renderiza grade de comunicados
    function renderizarComunicados(comunicados) {
        if (!announcementsGrid) return;
        announcementsGrid.innerHTML = '';
        comunicados.slice().reverse().forEach(comunicado => {
            const card = document.createElement('div');
            card.className = 'announcement-card';
            card.dataset.id = comunicado.id;
            card.dataset.titulo = comunicado.titulo;
            card.dataset.descricao = comunicado.descricao;
            const formattedDate = new Date(comunicado.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            card.innerHTML = `
                <div class="card-content">
                    <h3>${comunicado.titulo}</h3>
                    <div class="announcement-meta"><p class="date"><i class="ri-calendar-line"></i> ${formattedDate}</p></div>
                    <p class="description">${comunicado.descricao}</p>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
                    <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
                </div>`;
            announcementsGrid.appendChild(card);
        });
    }

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const hojeReal = new Date();
    hojeReal.setHours(0, 0, 0, 0);
    let calendarStates = { 'salao-festas': new Date(), 'academia': new Date(), 'piscina': new Date(), 'quadra-tenis': new Date() };

   function renderCalendar(amenityId) {
    const amenityView = document.getElementById(amenityId);
    if (!amenityView) return;
    const date = calendarStates[amenityId];
    const year = date.getFullYear();
    const month = date.getMonth();
    const calendarGrid = amenityView.querySelector('.calendar-grid');
    amenityView.querySelector('.calendar-header h2').textContent = `${meses[month]} ${year}`;
    calendarGrid.innerHTML = '';

        // Preparação dos Nomes dos Dias da Semana
    ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'day-name'; dayEl.textContent = day; calendarGrid.appendChild(dayEl);
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // ➡️ Lógica para obter e normalizar a data atual
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    // --------------------------------------------------

    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        const dayDate = new Date(year, month, i);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        dayEl.dataset.date = dateString;

        // ➡️ Lógica para obter e normalizar a data do dia em iteração
        const dataDia = new Date(year, month, i);
        dataDia.setHours(0,0,0,0);
        // ----------------------------------------------------------

        // 🎯 LÓGICA DE DIA PASSADO (INSERIDO AQUI)
        if (dataDia < hoje) {
            dayEl.classList.add('past-unavailable');  // aplica estilo cinza
            dayEl.innerHTML = `
                <span>${i}</span>
                <p class="status">Indisponível</p>
            `;
            // Não adiciona listener de clique e pula a checagem de reservas
            calendarGrid.appendChild(dayEl); 
            continue; // Vai para a próxima iteração do loop
        }
        
        // 🎯 FILTRO À PROVA DE FALHAS: Checa se a área E a data existem antes de filtrar
        const bookingsForDay = todasAsReservas.filter(r => 
            r.area && r.data && // Garante que a área e a data existem (não são null/undefined)
            r.area === amenityId && 
            String(r.data).substring(0, 10) === dateString 
        );
        // ---------------------------------------------------------------------------------------
        
        let statusSpan = '';
        const totalSlotsForAmenity = generateTimeSlots(amenityId).length;
        
        if (totalSlotsForAmenity > 0 && bookingsForDay.length >= totalSlotsForAmenity) {
            dayEl.classList.add('booked'); statusSpan = `<span class="status">Reservado</span>`;
        } else if (bookingsForDay.length > 0) {
            dayEl.classList.add('partial-booked'); statusSpan = `<span class="status">Parcial</span>`;
        } else {
            dayEl.classList.add('available'); statusSpan = `<span class="status">Disponível</span>`;
        }

        dayEl.innerHTML = `<p>${i}</p>${statusSpan}`;
        

        
        // Adiciona o listener de clique apenas para dias *futuros ou o dia atual*
        dayEl.addEventListener('click', () => openBookingModal(amenityId, dateString));
        
        // Adiciona classe de 'current-day' apenas se for *exatamente* hoje (00:00:00.000)
        if (dataDia.getTime() === hoje.getTime()) dayEl.classList.add('current-day');
        
        calendarGrid.appendChild(dayEl);
    }
}

    function openBookingModal(amenityId, dateString) {
    if (!bookingModal) return;
    const [year, month, day] = dateString.split('-');
    bookingModalDate.textContent = `${day}/${month}/${year}`;
    bookingAmenityIdInput.value = amenityId;
    bookingDateInput.value = dateString;
    
  // 1. Filtra TODAS as reservas daquele dia e área
    const bookingsForDay = todasAsReservas.filter(r => 
        r.area && r.data && 
        r.area === amenityId && 
        String(r.data).substring(0, 10) === dateString
    );
    // ---------------------------------------------------------------------------------------

    const totalSlots = generateTimeSlots(amenityId).length;
    const availableSlots = totalSlots - bookingsForDay.length;
    
    if (bookingsForDay.length > 0) {
        bookingList.innerHTML = '';
        bookingsForDay.forEach(booking => {
            const item = document.createElement('div');
            item.className = 'booking-item';
            
            // ✅ CORREÇÃO: Usando booking.nome
            item.innerHTML = `<div class="booking-item-info"><span class="resident-name">${booking.nome}</span><span class="time-slot">${booking.horario}</span></div>`;
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-danger';
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.onclick = () => {
                reservaIdToCancel = booking.id_reserva;
                if(deleteModal) {
                    deleteModal.querySelector('#delete-modal-title').textContent = "Cancelar Reserva";
                    
                    // ✅ CORREÇÃO: Usando booking.nome
                    deleteModal.querySelector('#delete-modal-text').textContent = `Tem certeza que deseja cancelar a reserva de ${booking.nome} para ${booking.horario}?`;

                    deleteModal.classList.add('active');
                }
            };
            item.appendChild(cancelBtn);
            bookingList.appendChild(item);
        });
        goToAdicionarBtn.style.display = availableSlots > 0 ? 'inline-flex' : 'none';
        bookingViewContainer.style.display = 'block';
        bookingAddView.style.display = 'none';
    } else {
        populateAddBookingForm(amenityId, dateString);
        bookingViewContainer.style.display = 'none';
        bookingAddView.style.display = 'block';
    }
    bookingModal.classList.add('active');
}

    function populateAddBookingForm(amenityId, dateString) {
        if (!bookingResidentSelect || !bookingTimeSlotsContainer) return;
        bookingResidentSelect.innerHTML = '<option value="" disabled selected>-- Escolha um morador --</option>';
        todosOsMoradores.forEach(morador => {
            bookingResidentSelect.add(new Option(`${morador.nome} (Unid. ${morador.endereco})`, morador.id_usuario));
        });
        bookingTimeSlotsContainer.innerHTML = '';
        const allSlots = generateTimeSlots(amenityId);
        const bookedSlots = todasAsReservas.filter(r => r.area === amenityId && r.data === dateString).map(r => r.horario);
        allSlots.forEach((slot, index) => {
            const isBooked = bookedSlots.includes(slot);
            const label = document.createElement('label');
            label.className = `time-slot-label ${isBooked ? 'disabled' : ''}`;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'time-slot';
            radio.value = slot;
            radio.id = `slot-${index}`;
            radio.disabled = isBooked;
            const span = document.createElement('span');
            span.textContent = slot;
            label.appendChild(radio);
            label.appendChild(span);
            bookingTimeSlotsContainer.appendChild(label);
        });
    }

    
    function generateTimeSlots(amenityId) {
        const gen = (s, e) => Array.from({length: e - s}, (_, i) => `${String(s + i).padStart(2, '0')}:00 - ${String(s + i + 1).padStart(2, '0')}:00`);
        switch (amenityId) {
            case 'salao-festas': return ['10:30 - 15:00', '18:00 - 22:00'];
            case 'academia': return gen(7, 22);
            case 'piscina': return gen(9, 22);
            case 'quadra-tenis': return gen(8, 20);
            default: return [];
        }
    }

    function phoneMaskHandler(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '').substring(0, 11);
        if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
        input.value = value;
    }

    //funçao de pegar quem ta vendendo 
    function getResidentById(id) {
        if (!todosOsMoradores) return { name: 'Carregando...', avatar: '' };
        const resident = todosOsMoradores.find(m => String(m.id) === String(id));
        if (!resident) return { name: 'Vendedor não encontrado', avatar: defaultResidentPhoto };
        const fotoSrc = resident.foto_url ? `${resident.foto_url}` : `https://i.pravatar.cc/50?u=${resident.id}`;
        return { name: resident.nome, avatar: fotoSrc };
    }


    //cards de classificado
    function createClassifiedElement(item) {
    const card = document.createElement('div');
    card.className = 'classified-card';
    card.dataset.id = item.id_classificados;

    const imageUrl = item.foto_url_class 
        ? item.foto_url_class 
        : 'https://via.placeholder.com/300x200.png?text=Sem+Foto';

    const formattedPrice = `R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}`;

    card.innerHTML = `
        <div class="card-actions">
            <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
            <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
        </div>

        <img src="${imageUrl}" alt="${item.titulo_classificados}" class="classified-card-img">

        <div class="card-content">
            <h4>${item.titulo_classificados}</h4>
            <p class="price">${formattedPrice}</p>
            <p class="description">${item.descricao}</p>

            ${item.contato ? `<p class="contact-phone"><i class="ri-phone-line"></i> ${item.contato}</p>` : ''}

            <div class="author-info">
                <img src="/static/img/default-avatar.png">
                <span>Vendido por <strong>${item.vendedor}</strong></span>
            </div>
        </div>
    `;

    return card;
    }


    //renderizar classificados
    function renderClassifieds(classificados) {
        if (!classifiedsGrid) return;
        classifiedsGrid.innerHTML = '';
        if (!classificados || classificados.length === 0) {
            classifiedsGrid.innerHTML = `<p style="text-align: center;">Nenhum item nos classificados.</p>`;
        } else {
            classificados.forEach(item => { 
                classifiedsGrid.appendChild(createClassifiedElement(item)); 
            });
        }
    }

    function populateSellerDropdown(selectElement, selectedId = null) {
        if (!selectElement) return;
        selectElement.innerHTML = '';
        todosOsMoradores.forEach(morador => {
            const option = new Option(morador.nome, morador.id);
            if (String(morador.id) === String(selectedId)) option.selected = true;
            selectElement.add(option);
        });
    }

    function handlePhotoPreview(input, preview) {
        if (!input || !preview) return;
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { preview.src = e.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }

    // =================================================================
    // --- EVENT LISTENERS (A JUNÇÃO DOS DOIS MUNDOS) ---
    // =================================================================
    

    //botao de edição de morador
    const inviteBtn = document.getElementById('invite-resident-btn');
    if (inviteBtn) inviteBtn.addEventListener('click', () => { 
        addForm.reset();
        addResidentPhotoPreview.src = 'https://via.placeholder.com/100.png?text=Foto';
        addModal.classList.add('active'); 
    });
    
    if (residentsList) {
        residentsList.addEventListener('click', (e) => {
            const item = e.target.closest('.resident-item');
            if (!item) return;
    
            residentIdToModify = item.dataset.id;
    
            if (e.target.closest('.edit-btn')) {
                if (!editModal) {
                    console.error("ERRO: O modal de edição com id='edit-resident-modal' não foi encontrado no HTML.");
                    return;
                }
                editModal.querySelector('#edit-resident-photo-preview').src = item.querySelector('img').src;
                editModal.querySelector('#edit-resident-name').value = item.dataset.nome;
                editModal.querySelector('#edit-resident-unit').value = item.dataset.unit;
                editModal.querySelector('#edit-resident-email').value = item.dataset.email;
                editModal.querySelector('#edit-resident-phone').value = item.dataset.telefone || '';
                editModal.classList.add('active');
            }
    
            if (e.target.closest('.delete-btn')) {
                if (!deleteModal) {
                    console.error("ERRO: O modal de deleção com id='delete-confirm-modal' não foi encontrado no HTML.");
                    return;
                }
                deleteModal.querySelector('#delete-modal-title').textContent = "Excluir Morador";
                deleteModal.querySelector('#delete-modal-text').textContent = `Tem certeza que deseja excluir ${item.dataset.nome}?`;
                deleteModal.classList.add('active');
            }
        });
    }

    //função para adicionar morador
    const addForm = document.getElementById('add-resident-form');

    if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        formData.append('nome', form.querySelector('#resident-name').value.trim());
        formData.append('endereco', form.querySelector('#resident-unit').value.trim());
        formData.append('email', form.querySelector('#resident-email').value.trim());
        formData.append('telefone', form.querySelector('#resident-phone').value.trim());
        formData.append('senha', form.querySelector('#resident-senha').value.trim());

        // FOTO, se existir
        const photoInput = document.getElementById('add-resident-photo-input');
        if (photoInput && photoInput.files.length > 0) {
            formData.append('foto', photoInput.files[0]);
        }

        console.log("Enviando dados para o backend...");
        for (let p of formData.entries()) console.log(p);

        try {
            const response = await fetch('/usuarios', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error("Erro ao salvar morador");
            }

            alert("Morador cadastrado!");

            form.reset();
            document.getElementById("add-resident-modal").classList.remove("active");

            await carregarMoradores();

        } catch (error) {
            console.error("Falha ao enviar morador:", error);
        }
    });
}

    //funçao para editar morador
    const editForm = document.getElementById('edit-resident-form');
    if(editForm) editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const moradorData = {
            nome: editForm.querySelector('#edit-resident-name').value.trim(),
            endereco: editForm.querySelector('#edit-resident-unit').value.trim(),
            email: editForm.querySelector('#edit-resident-email').value.trim(),
            telefone: editForm.querySelector('#edit-resident-phone').value.trim(),
            foto_url: editForm.querySelector('#edit-resident-photo-input').value.trim(),

        };
        const resultado = await editarMorador(residentIdToModify, moradorData);
        if (resultado) {
            editModal.classList.remove('active');
            await carregarMoradores();
        }
    });


    //botao de comunicado
    if (addAnnouncementBtn) {
        addAnnouncementBtn.addEventListener('click', () => {
            announcementForm.reset();
            announcementForm.querySelector('#announcement-id').value = '';
            announcementModal.querySelector('#announcement-modal-title').textContent = 'Novo Comunicado';
            announcementModal.classList.add('active');
        });
    }

    if(announcementForm) announcementForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = announcementForm.querySelector('#announcement-id').value;
    const data = {
        titulo: announcementForm.querySelector('#announcement-title').value.trim(),
        descricao: announcementForm.querySelector('#announcement-desc').value.trim()
    };
    
    let resultado;
    if (id) {
        resultado = await editarComunicado(id, data);
    } else {
        resultado = await adicionarComunicado(data); // <-- CORRIGIDO
    }
    if (resultado) {
        announcementModal.classList.remove('active');
        await carregarComunicados();
    }
});

    //grade de comunicado
    if(announcementsGrid) {
        announcementsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.announcement-card');
            if (!card) return;
            announcementIdToModify = card.dataset.id;
    
            if(e.target.closest('.edit-btn')) {
                if (!announcementModal) {
                    console.error("ERRO: O modal de comunicado com id='announcement-modal' não foi encontrado no HTML.");
                    return;
                }
                announcementModal.querySelector('#announcement-modal-title').textContent = 'Editar Comunicado';
                announcementModal.querySelector('#announcement-id').value = announcementIdToModify;
                announcementModal.querySelector('#announcement-title').value = card.dataset.titulo;
                announcementModal.querySelector('#announcement-desc').value = card.dataset.descricao;
                announcementModal.classList.add('active');
            }
    
            if(e.target.closest('.delete-btn')) {
                if (!deleteModal) {
                     console.error("ERRO: O modal de exclusão com id='delete-confirm-modal' não foi encontrado no HTML.");
                     return;
                }
                deleteModal.querySelector('#delete-modal-title').textContent = "Excluir Comunicado";
                deleteModal.querySelector('#delete-modal-text').textContent = `Tem certeza que deseja excluir "${card.dataset.titulo}"?`;
                deleteModal.classList.add('active');
            }
        });
    }
    




    //mais coisa de reserva que eu nao quero saber 
    if(goToAdicionarBtn) goToAdicionarBtn.addEventListener('click', () => {
        populateAddBookingForm(bookingAmenityIdInput.value, bookingDateInput.value);
        if(bookingViewContainer) bookingViewContainer.style.display = 'none';
        if(bookingAddView) bookingAddView.style.display = 'block';
    });
    if(backToViewBtn) backToViewBtn.addEventListener('click', () => {
        if(bookingViewContainer) bookingViewContainer.style.display = 'block';
        if(bookingAddView) bookingAddView.style.display = 'none';
    });
    if(bookingForm) bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reservaData = {
            area: bookingAmenityIdInput.value,
            data_reserva: bookingDateInput.value,
            usuario: bookingResidentSelect.value,
            horario: bookingForm.querySelector('input[name="time-slot"]:checked')?.value
        };
        if (Object.values(reservaData).every(val => val)) {
            const resultado = await adicionarReserva(reservaData);
            if(resultado) {
                bookingModal.classList.remove('active');
                await carregarReservas();
                alert('Reserva realizada com sucesso!');
            }
        } else {
            alert('Por favor, preencha todos os campos da reserva.');
        }
    });


    //botao para criar classificado
    if (addClassifiedBtn) {
        addClassifiedBtn.addEventListener('click', () => {
            addClassifiedForm.reset();
            addClassifiedPhotoPreview.src = 'https://via.placeholder.com/150.png?text=Foto';
            populateSellerDropdown(document.getElementById('classified-seller'));
            addClassifiedModal.classList.add('active');
        });
    }

    //cria classificado
    if (addClassifiedForm) {
        addClassifiedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData();
            formData.append('titulo_classificados', form.querySelector('#classified-title').value);
            formData.append('preco', form.querySelector('#classified-price').value);
            formData.append('contato', form.querySelector('#classified-phone').value);
            formData.append('descricao_classificados', form.querySelector('#classified-desc').value);
            const photoInput = form.querySelector('#add-classified-photo-input');
            if (photoInput.files[0]) {
                formData.append('foto', photoInput.files[0]);
            }
            const resultado = await adicionarClassificado(formData);
            if (resultado) {
                form.reset();
                addClassifiedModal.classList.remove('active');
                await carregarClassificados();
            }
        });
    }

    //editar classificado
    if (classifiedsGrid) {
        classifiedsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.classified-card');
            if (!card) return;
            classifiedIdToModify = card.dataset.id;
            const itemData = todosOsClassificados.find(item => String(item.id_classificados) === classifiedIdToModify);
            if (!itemData) return;
            if (e.target.closest('.delete-btn')) {
                if (!deleteModal) {
                    console.error("ERRO: O modal de deleção com id='delete-confirm-modal' não foi encontrado no HTML.");
                    return;
                }
                deleteModal.querySelector('#delete-modal-title').textContent = "Excluir Classificado";
                deleteModal.querySelector('#delete-modal-text').textContent = `Tem certeza que deseja excluir "${itemData.titulo_classificados}"?`;
                deleteModal.classList.add('active');
            }
            if (e.target.closest('.edit-btn')) {
                if (!editClassifiedModal) {
                    console.error("ERRO: O modal de edição de classificado com id='edit-classified-modal' não foi encontrado no HTML.");
                    return;
                }
                editClassifiedModal.querySelector('#edit-classified-photo-preview').src = card.querySelector('img').src;
                editClassifiedModal.querySelector('#edit-classified-title').value = itemData.titulo_classificados;
                editClassifiedModal.querySelector('#edit-classified-price').value = itemData.preco;
                editClassifiedModal.querySelector('#edit-classified-phone').value = itemData.contato;
                editClassifiedModal.querySelector('#edit-classified-desc').value = itemData.descricao;
                populateSellerDropdown(editClassifiedModal.querySelector('#edit-classified-seller'), itemData.morador_id);
                editClassifiedModal.classList.add('active');
            }
        });
    }
    if (editClassifiedForm) {
        editClassifiedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const classificadoData = {
                titulo: form.querySelector('#edit-classified-title').value,
                preco: form.querySelector('#edit-classified-price').value,
                contato: form.querySelector('#edit-classified-phone').value,
                descricao: form.querySelector('#edit-classified-desc').value,
                descricao: form.querySelector('#edit-classified-photo').value,
            };
            const resultado = await editarClassificado(classifiedIdToModify, classificadoData);
            if (resultado) {
                editClassifiedModal.classList.remove('active');
                await carregarClassificados();
            }
        });
    }

    if(deleteModal) {
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            const activeSection = document.querySelector('.content-section.active');
            const activeSectionId = activeSection ? activeSection.id : null;

            if (reservaIdToCancel) {
                await deletarReserva(reservaIdToCancel);
                bookingModal.classList.remove('active');
                await carregarReservas();
                reservaIdToCancel = null;
            } else if (activeSectionId === 'residents' && residentIdToModify) {
                await deletarMorador(residentIdToModify);
                await carregarMoradores();
                residentIdToModify = null;
            } else if (activeSectionId === 'announcements' && announcementIdToModify) {
                await deletarComunicado(announcementIdToModify);
                await carregarComunicados();
                announcementIdToModify = null;
            } else if (activeSectionId === 'classifieds' && classifiedIdToModify) {
                await deletarClassificado(classifiedIdToModify);
                await carregarClassificados();
                classifiedIdToModify = null;
            }
            deleteModal.classList.remove('active');
        });
    }

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal || e.target.closest('.close-modal-btn') || e.target.closest('.cancel-btn') || e.target.closest('.cancel-delete-btn')) {
                modal.classList.remove('active');
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('href');
            if(mainTitle) mainTitle.textContent = this.querySelector('span').textContent;
            contentSections.forEach(s => s.classList.toggle('active', '#' + s.id === targetId));
            if (targetId === '#dashboard') atualizarDashboard();
        });
    });

    amenityLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.amenities-sidebar li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');
            const targetId = this.getAttribute('href');
            amenityViews.forEach(v => v.classList.toggle('active', '#' + v.id === targetId));
            renderCalendar(targetId.substring(1));
        });
    });

    if(menuButton && sidebarNav) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarNav.classList.toggle('open');
        });
    }

        // --- CONTROLES DE NAVEGAÇÃO DO CALENDÁRIO (PRÓXIMO / ANTERIOR MÊS) ---
amenityViews.forEach(view => {
    const amenityId = view.id;

    const prevBtn = view.querySelector('.prev-month-btn');
    const nextBtn = view.querySelector('.next-month-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            calendarStates[amenityId].setMonth(calendarStates[amenityId].getMonth() - 1);
            renderCalendar(amenityId);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            calendarStates[amenityId].setMonth(calendarStates[amenityId].getMonth() + 1);
            renderCalendar(amenityId);
        });
    }
});

    if(menuButton && sidebarNav) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarNav.classList.toggle('open');
        });
    }

    // =================================================================
    // --- INICIALIZAÇÃO ---
    // =================================================================
    async function init() {
        await atualizarDashboard();
        await carregarMoradores();
        await carregarComunicados();
        await carregarReservas();
        await carregarClassificados();
        await carregarManutencoes();

        const initialActiveLink = document.querySelector('.sidebar-nav .nav-link.active');
        if (initialActiveLink) {
            const initialSectionId = initialActiveLink.getAttribute('href');
            contentSections.forEach(s => s.classList.toggle('active', '#' + s.id === initialSectionId));
            if(mainTitle) mainTitle.textContent = initialActiveLink.querySelector('span').textContent;
        }

        const activeAmenityLink = document.querySelector('.amenities-sidebar li.active a');
        if(activeAmenityLink) {
            renderCalendar(activeAmenityLink.getAttribute('href').substring(1));
        }

        handlePhotoPreview(addResidentPhotoInput, addResidentPhotoPreview);
        handlePhotoPreview(editResidentPhotoInput, editResidentPhotoPreview);
        handlePhotoPreview(addClassifiedPhotoInput, addClassifiedPhotoPreview);
        if (addClassifiedPhoneInput) addClassifiedPhoneInput.addEventListener('input', phoneMaskHandler);
        if (editClassifiedPhoneInput) editClassifiedPhoneInput.addEventListener('input', phoneMaskHandler);
    }

    init();
});



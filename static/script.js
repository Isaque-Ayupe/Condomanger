document.addEventListener('DOMContentLoaded', function() {
    // =================================================================
    // --- CONFIGURAÇÕES E SELETORES GLOBAIS ---
    // =================================================================
    const API_BASE_URL = "http://127.0.0.1:5000";

    // --- Seletores (Junção dos dois arquivos) ---
    const mainTitle = document.getElementById('main-title');
    const contentSections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const menuButton = document.getElementById('menu-toggle');
    
    // Moradores
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

    // Reservas (Calendário)
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

    // Classificados (Novo!)
    const classifiedsGrid = document.querySelector('.classifieds-grid');
    const addClassifiedBtn = document.getElementById('add-classified-btn');
    const addClassifiedModal = document.getElementById('add-classified-modal');
    const addClassifiedForm = document.getElementById('add-classified-form');
    const addClassifiedPhotoInput = document.getElementById('add-classified-photo-input');
    const addClassifiedPhotoPreview = document.getElementById('add-classified-photo-preview');
    const editClassifiedModal = document.getElementById('edit-classified-modal');
    const editClassifiedForm = document.getElementById('edit-classified-form');
    const addClassifiedPhoneInput = document.getElementById('classified-phone');
    const editClassifiedPhoneInput = document.getElementById('edit-classified-phone');

    // --- Variáveis de Estado ---
    let residentIdToModify = null;
    let announcementIdToModify = null;
    let classifiedIdToModify = null;
    let reservaIdToCancel = null;
    let todosOsMoradores = [];
    let todasAsReservas = [];
    let todosOsComunicados = [];
    let todosOsClassificados = []; // << ADICIONADO

    // =================================================================
    // --- FUNÇÕES DE API (O "CÉREBRO" - CONEXÃO COM O BACKEND) ---
    // =================================================================

    async function carregarMoradores() {
        try {
            const response = await fetch(`${API_BASE_URL}/moradores`);
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
            todosOsMoradores = await response.json();
            renderizarMoradores(todosOsMoradores);
            atualizarDashboard(); // Atualiza o dashboard com os dados reais
        } catch (error) {
            console.error('Falha ao buscar moradores:', error);
            if (residentsList) residentsList.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os moradores.</p>`;
        }
    }

    async function adicionarMoradorAPI(formData) { // Alterado para receber FormData
        try {
            const response = await fetch(`${API_BASE_URL}/moradores`, {
                method: 'POST',
                // Removido o header 'Content-Type', o navegador define automaticamente para FormData
                body: formData,
            });
            if (!response.ok) throw new Error(`Erro ao salvar: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao adicionar morador:', error);
            alert('Não foi possível adicionar o morador. Tente novamente.');
            return null;
        }
    }
    
    // << SUBSTITUÍDO >>
    async function editarMoradorAPI(id, moradorData) {
        try {
            const response = await fetch(`${API_BASE_URL}/moradores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(moradorData),
            });
            if (!response.ok) throw new Error(`Erro ao editar: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao editar morador:', error);
            alert('Não foi possível editar o morador. Tente novamente.');
            return null;
        }
    }

    // << SUBSTITUÍDO >>
    async function deletarMoradorAPI(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/moradores/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar morador');
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar morador:', error);
            alert('Não foi possível deletar o morador.');
            return null;
        }
    }

    async function carregarComunicados() {
        try {
            const response = await fetch(`${API_BASE_URL}/comunicados`);
            if (!response.ok) throw new Error('Erro ao buscar comunicados');
            todosOsComunicados = await response.json();
            renderizarComunicados(todosOsComunicados);
        } catch (error) {
            console.error('Falha ao carregar comunicados:', error);
            if (announcementsGrid) announcementsGrid.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os comunicados.</p>`;
        }
    }

    async function adicionarComunicadoAPI(comunicadoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/comunicados`, {
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

    async function deletarComunicadoAPI(comunicadoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/comunicados/${comunicadoId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar comunicado');
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar comunicado:', error);
            alert('Não foi possível deletar o comunicado.');
            return null;
        }
    }

    async function carregarReservas() {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`);
            if (!response.ok) throw new Error('Erro ao buscar reservas');
            todasAsReservas = await response.json();
            const activeAmenity = document.querySelector('.amenity-view.active');
            if (activeAmenity) renderCalendar(activeAmenity.id);
        } catch (error) {
            console.error('Falha ao carregar reservas:', error);
        }
    }

    async function adicionarReservaAPI(reservaData) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaData),
            });
            if (!response.ok) throw new Error('Erro ao criar reserva');
            return await response.json();
        } catch (error) {
            console.error('Falha ao criar reserva:', error);
            alert('Não foi possível criar a reserva.');
            return null;
        }
    }

    async function deletarReservaAPI(reservaId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar reserva');
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar reserva:', error);
            alert('Não foi possível deletar a reserva.');
            return null;
        }
    }

    // << CÓDIGO NOVO ADICIONADO >>
    // --- Funções de API para Classificados ---
    async function carregarClassificados() {
        try {
            const response = await fetch(`${API_BASE_URL}/classificados`);
            if (!response.ok) throw new Error('Erro ao buscar classificados');
            todosOsClassificados = await response.json();
            renderClassifieds(todosOsClassificados); // Renderiza com dados reais
        } catch (error) {
            console.error('Falha ao carregar classificados:', error);
            if (classifiedsGrid) classifiedsGrid.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os classificados.</p>`;
        }
    }

    async function adicionarClassificadoAPI(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/classificados`, {
                method: 'POST',
                body: formData, // Usa FormData para a foto
            });
            if (!response.ok) throw new Error(`Erro ao salvar: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao adicionar classificado:', error);
            alert('Não foi possível adicionar o classificado. Tente novamente.');
            return null;
        }
    }

    async function editarClassificadoAPI(id, classificadoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/classificados/${id}`, {
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

    async function deletarClassificadoAPI(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/classificados/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao deletar classificado');
            return await response.json();
        } catch (error) {
            console.error('Falha ao deletar classificado:', error);
            alert('Não foi possível deletar o classificado.');
            return null;
        }
    }
    // << FIM DO CÓDIGO NOVO >>

    // =================================================================
    // --- LÓGICA DO DASHBOARD (UPGRADE DO AMIGO) ---
    // =================================================================
    function atualizarDashboard() {
        if (!document.getElementById('total-moradores')) return;
        document.getElementById('total-moradores').textContent = todosOsMoradores.length;
        document.getElementById('reservas-semana').textContent = Math.floor(Math.random() * 10);
        document.getElementById('reservas-mes').textContent = Math.floor(Math.random() * 40);
        const ctx = document.getElementById('reservas-chart').getContext('2d');
        if (window.myChart instanceof Chart) { window.myChart.destroy(); }
        window.myChart = new Chart(ctx, {
            type: 'doughnut', 
            data: { 
                labels: ['Salão de Festas', 'Academia', 'Piscina', 'Quadra'], 
                datasets: [{ 
                    label: 'Reservas', 
                    data: [12, 19, 3, 5],
                    backgroundColor: ['#4A55E1', '#34D399', '#F59E0B', '#EF4444'], 
                    borderColor: '#FFFFFF', 
                    borderWidth: 2 
                }] 
            },
            options: { responsive: true, plugins: { legend: { position: 'top' } } }
        });
    }

    // =================================================================
    // --- FUNÇÕES DE RENDERIZAÇÃO E LÓGICA DO FRONTEND ---
    // =================================================================

    function renderizarMoradores(moradores) {
        if (!residentsList) return;
        residentsList.innerHTML = '';
        if (!moradores || moradores.length === 0) {
            residentsList.innerHTML = `<p style="text-align: center;">Nenhum morador cadastrado.</p>`;
        } else {
            moradores.forEach(morador => {
                const newItem = document.createElement('div');
                newItem.className = 'resident-item';
                newItem.dataset.id = morador.id;
                newItem.dataset.unit = morador.unidade;
                newItem.dataset.nome = morador.nome;
                newItem.dataset.email = morador.email;
                newItem.dataset.telefone = morador.telefone;

                // Alterado para usar foto da API
                const fotoSrc = morador.foto_url ? `${API_BASE_URL}${morador.foto_url}` : `https://i.pravatar.cc/50?u=${morador.id}`;

                newItem.innerHTML = `
                    <div class="resident-info">
                        <img src="${fotoSrc}" alt="${morador.nome}">
                        <div><p class="resident-name">${morador.nome}</p><p class="resident-details">Unidade ${morador.unidade} | ${morador.email}</p></div>
                    </div>
                    <div class="resident-actions">
                        <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
                        <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
                    </div>`;
                residentsList.appendChild(newItem);
            });
        }
    }

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
        // ... (seu código de renderizar calendário original)
    }
    function openBookingModal(amenityId, dateString) {
        // ... (seu código de abrir modal de reserva original)
    }
    function populateAddBookingForm(amenityId, dateString) {
        // ... (seu código de popular formulário de reserva original)
    }
    function generateTimeSlots(amenityId) {
        // ... (seu código de gerar horários original)
    }

    function phoneMaskHandler(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '').substring(0, 11);
        if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
        input.value = value;
    }

    function getResidentById(id) {
        const resident = todosOsMoradores.find(m => String(m.id) === String(id));
        if (!resident) return { name: 'Vendedor não encontrado', avatar: defaultResidentPhoto };
        const fotoSrc = resident.foto_url ? `${API_BASE_URL}${resident.foto_url}` : `https://i.pravatar.cc/50?u=${resident.id}`;
        return { name: resident.nome, avatar: fotoSrc };
    }

    function createClassifiedElement({ id, titulo, preco, descricao, foto_url, morador_id, contato }) {
        const card = document.createElement('div');
        card.className = 'classified-card';
        card.dataset.id = id;
        const seller = getResidentById(morador_id);
        const formattedPrice = `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
        const imageUrl = foto_url ? `${API_BASE_URL}${foto_url}` : 'https://via.placeholder.com/300x200.png?text=Sem+Foto';

        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
                <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
            </div>
            <img src="${imageUrl}" alt="${titulo}" class="classified-card-img">
            <div class="card-content">
                <h4>${titulo}</h4>
                <p class="price">${formattedPrice}</p>
                <p class="description">${descricao}</p>
                ${contato ? `<p class="contact-phone"><i class="ri-phone-line"></i> ${contato}</p>` : ''}
                <div class="author-info">
                    <img src="${seller.avatar}" alt="${seller.name}">
                    <span>Vendido por <strong>${seller.name}</strong></span>
                </div>
            </div>`;
        return card;
    }

    // << SUBSTITUÍDO >>
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
    
    // --- Listeners de Moradores (Upgrade do Amigo) ---
    const inviteBtn = document.getElementById('invite-resident-btn');
    if (inviteBtn) inviteBtn.addEventListener('click', () => { 
        addResidentPhotoPreview.src = 'https://via.placeholder.com/100.png?text=Foto';
        addModal.classList.add('active'); 
    });
    
    if (residentsList) residentsList.addEventListener('click', (e) => {
        const item = e.target.closest('.resident-item');
        if (!item) return;
        
        residentIdToModify = item.dataset.id;
        if (e.target.closest('.edit-btn')) {
            editModal.querySelector('#edit-resident-photo-preview').src = item.querySelector('img').src;
            editModal.querySelector('#edit-resident-name').value = item.dataset.nome;
            editModal.querySelector('#edit-resident-unit').value = item.dataset.unit;
            editModal.querySelector('#edit-resident-email').value = item.dataset.email;
            editModal.querySelector('#edit-resident-phone').value = item.dataset.telefone || '';
            editModal.classList.add('active');
        }
        if (e.target.closest('.delete-btn')) {
            deleteModal.querySelector('#delete-modal-title').textContent = "Excluir Morador";
            deleteModal.querySelector('#delete-modal-text').textContent = `Tem certeza que deseja excluir ${item.dataset.nome}?`;
            deleteModal.classList.add('active');
        }
    });

    const addForm = document.getElementById('add-resident-form');
    if(addForm) addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();
        formData.append('nome', form.querySelector('#resident-name').value.trim());
        formData.append('unidade', form.querySelector('#resident-unit').value.trim());
        formData.append('email', form.querySelector('#resident-email').value.trim());
        formData.append('telefone', form.querySelector('#resident-phone').value.trim());
        
        const photoInput = form.querySelector('#add-resident-photo-input');
        if (photoInput.files[0]) {
            formData.append('foto', photoInput.files[0]);
        }

        const resultado = await adicionarMoradorAPI(formData);
        if (resultado) {
            form.reset();
            addModal.classList.remove('active');
            await carregarMoradores();
        }
    });

    const editForm = document.getElementById('edit-resident-form');
    if(editForm) editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const moradorData = {
            nome: editForm.querySelector('#edit-resident-name').value.trim(),
            unidade: editForm.querySelector('#edit-resident-unit').value.trim(),
            email: editForm.querySelector('#edit-resident-email').value.trim(),
            telefone: editForm.querySelector('#edit-resident-phone').value.trim()
        };
        const resultado = await editarMoradorAPI(residentIdToModify, moradorData);
        if (resultado) {
            editModal.classList.remove('active');
            await carregarMoradores();
        }
    });

    // --- Listeners de Comunicados ---
    // ... (seu código de listeners de comunicados original)

    // --- Listeners de Reservas ---
    // ... (seu código de listeners de reservas original)

    // --- Listeners de Classificados (Novo!) ---
    if (addClassifiedBtn) {
        addClassifiedBtn.addEventListener('click', () => {
            addClassifiedForm.reset();
            addClassifiedPhotoPreview.src = 'https://via.placeholder.com/150.png?text=Foto';
            populateSellerDropdown(document.getElementById('classified-seller'));
            addClassifiedModal.classList.add('active');
        });
    }

    if (addClassifiedForm) {
        addClassifiedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData();
            formData.append('titulo', form.querySelector('#classified-title').value);
            formData.append('preco', form.querySelector('#classified-price').value);
            formData.append('contato', form.querySelector('#classified-phone').value);
            formData.append('descricao', form.querySelector('#classified-desc').value);
            formData.append('morador_id', form.querySelector('#classified-seller').value);
            
            const photoInput = form.querySelector('#add-classified-photo-input');
            if (photoInput.files[0]) {
                formData.append('foto', photoInput.files[0]);
            }

            const resultado = await adicionarClassificadoAPI(formData);
            if (resultado) {
                form.reset();
                addClassifiedModal.classList.remove('active');
                await carregarClassificados();
            }
        });
    }

    if (classifiedsGrid) {
        classifiedsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.classified-card');
            if (!card) return;

            classifiedIdToModify = card.dataset.id;
            const itemData = todosOsClassificados.find(item => String(item.id) === classifiedIdToModify);
            if (!itemData) return;

            if (e.target.closest('.delete-btn')) {
                deleteModal.querySelector('#delete-modal-title').textContent = "Excluir Classificado";
                deleteModal.querySelector('#delete-modal-text').textContent = `Tem certeza que deseja excluir "${itemData.titulo}"?`;
                deleteModal.classList.add('active');
            }

            if (e.target.closest('.edit-btn')) {
                editClassifiedModal.querySelector('#edit-classified-photo-preview').src = card.querySelector('img').src;
                editClassifiedModal.querySelector('#edit-classified-title').value = itemData.titulo;
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
                morador_id: form.querySelector('#edit-classified-seller').value,
            };

            const resultado = await editarClassificadoAPI(classifiedIdToModify, classificadoData);
            if (resultado) {
                editClassifiedModal.classList.remove('active');
                await carregarClassificados();
            }
        });
    }
    // << FIM DO CÓDIGO NOVO >>

    // --- Listener Universal de Exclusão ---
    if(deleteModal) {
        document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
            const activeSectionId = document.querySelector('.content-section.active').id;

            if (activeSectionId === 'residents' && residentIdToModify) {
                await deletarMoradorAPI(residentIdToModify);
                await carregarMoradores();
                residentIdToModify = null;
            } else if (activeSectionId === 'announcements' && announcementIdToModify) {
                await deletarComunicadoAPI(announcementIdToModify);
                await carregarComunicados();
                announcementIdToModify = null;
            } else if (activeSectionId === 'classifieds' && classifiedIdToModify) { // << SUBSTITUÍDO
                await deletarClassificadoAPI(classifiedIdToModify);
                await carregarClassificados();
                classifiedIdToModify = null;
            } else if (reservaIdToCancel) {
                await deletarReservaAPI(reservaIdToCancel);
                bookingModal.classList.remove('active');
                await carregarReservas();
                reservaIdToCancel = null;
            }
            deleteModal.classList.remove('active');
        });
    }

    // --- Listeners Gerais da Interface ---
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
    
    // =================================================================
    // --- INICIALIZAÇÃO ---
    // =================================================================
    async function init() {
        // Carrega todos os dados REAIS do backend primeiro
        await carregarMoradores(); // Essencial carregar moradores primeiro para popular dropdowns
        await carregarComunicados();
        await carregarReservas();
        await carregarClassificados(); // << ADICIONADO

        // Configura a seção inicial a ser exibida
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

        // Liga as funcionalidades de preview de foto e máscaras
        handlePhotoPreview(addResidentPhotoInput, addResidentPhotoPreview);
        handlePhotoPreview(editResidentPhotoInput, editResidentPhotoPreview);
        handlePhotoPreview(addClassifiedPhotoInput, addClassifiedPhotoPreview);
        if (addClassifiedPhoneInput) addClassifiedPhoneInput.addEventListener('input', phoneMaskHandler);
        if (editClassifiedPhoneInput) editClassifiedPhoneInput.addEventListener('input', phoneMaskHandler);
    }

    init();
});
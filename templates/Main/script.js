document.addEventListener('DOMContentLoaded', function () {

	// --- Seletores Globais ---
	const mainTitle = document.getElementById('main-title');
	const contentSections = document.querySelectorAll('.content-section');
	const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
	const sidebarNav = document.querySelector('.sidebar-nav');
	const menuButton = document.getElementById('menu-toggle');
	const CURRENT_USER_ID = 'nola-name-1';

	// =================================================================
	// --- LÓGICA DO DASHBOARD ---
	// =================================================================
	function atualizarDashboard() {
		function getWeekBounds(date) {
			const now = new Date(date.getTime());
			const dayOfWeek = now.getDay();
			const startOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
			startOfWeek.setHours(0, 0, 0, 0);
			const endOfWeek = new Date(startOfWeek.getTime());
			endOfWeek.setDate(endOfWeek.getDate() + 6);
			endOfWeek.setHours(23, 59, 59, 999);
			return { start: startOfWeek, end: endOfWeek };
		}
		function isDateInWeek(date, weekBounds) {
			return date >= weekBounds.start && date <= weekBounds.end;
		}
		function isDateInMonth(date, month, year) {
			return date.getMonth() === month && date.getFullYear() === year;
		}

		const totalMoradores = document.querySelectorAll('.resident-item').length;
		const totalMoradoresEl = document.getElementById('total-moradores');
		if (totalMoradoresEl) totalMoradoresEl.textContent = totalMoradores;

		let reservasSemana = 0;
		let reservasMes = 0;
		const reservasPorArea = { 'salao-festas': 0, 'academia': 0, 'piscina': 0, 'quadra-tenis': 0 };
		const labelsPorArea = { 'salao-festas': 'Salão de Festas', 'academia': 'Academia', 'piscina': 'Piscina', 'quadra-tenis': 'Quadra' };
		const hoje = new Date();
		const mesAtual = hoje.getMonth();
		const anoAtual = hoje.getFullYear();
		const limitesSemana = getWeekBounds(hoje);

		for (const amenityId in calendarioReservas) {
			if (reservasPorArea.hasOwnProperty(amenityId)) {
				const datesForAmenity = calendarioReservas[amenityId];
				for (const dateString in datesForAmenity) {
					const bookings = datesForAmenity[dateString];
					const [year, month, day] = dateString.split('-').map(Number);
					const bookingDate = new Date(year, month - 1, day);
					const numBookings = bookings.length;
					reservasPorArea[amenityId] += numBookings;
					if (isDateInWeek(bookingDate, limitesSemana)) {
						reservasSemana += numBookings;
					}
					if (isDateInMonth(bookingDate, mesAtual, anoAtual)) {
						reservasMes += numBookings;
					}
				}
			}
		}

		const reservasSemanaEl = document.getElementById('reservas-semana');
		if (reservasSemanaEl) reservasSemanaEl.textContent = reservasSemana;
		const reservasMesEl = document.getElementById('reservas-mes');
		if (reservasMesEl) reservasMesEl.textContent = reservasMes;

		const ctxEl = document.getElementById('reservas-chart');
		if (!ctxEl) return;
		const ctx = ctxEl.getContext('2d');
		if (window.myChart instanceof Chart) { window.myChart.destroy(); }
		const chartLabels = Object.keys(reservasPorArea).map(id => labelsPorArea[id]);
		const chartData = Object.values(reservasPorArea);
		window.myChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: chartLabels,
				datasets: [{
					label: 'Reservas',
					data: chartData,
					backgroundColor: ['#4A55E1', '#34D399', '#F59E0B', '#EF4444'],
					borderColor: '#FFFFFF',
					borderWidth: 2
				}]
			},
			options: { responsive: true, plugins: { legend: { position: 'top' } } }
		});
	}

	// =================================================================
	// --- LÓGICA DO CALENDÁRIO DINÂMICO (RESERVAS) ---
	// =================================================================
	const amenityLinks = document.querySelectorAll('.amenity-link');
	const amenityViews = document.querySelectorAll('.amenity-view');
	const bookingModal = document.getElementById('booking-modal');
	const bookingForm = document.getElementById('booking-form');
	const bookingResidentSelect = document.getElementById('booking-resident-select');
	const bookingTimeSlotsContainer = document.getElementById('booking-time-slots');
	const bookingAmenityIdInput = document.getElementById('booking-amenity-id');
	const bookingDateInput = document.getElementById('booking-date');
	const goToAdicionarBtn = document.getElementById('go-to-add-booking-btn');
	const backToViewBtn = bookingModal.querySelector('.cancel-add-view-btn');
	const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
	const hojeReal = new Date();
	hojeReal.setHours(0, 0, 0, 0);

	let calendarioReservas = {
		'salao-festas': { '2025-10-20': [{ time: '18:00 - 22:00', residentId: 'nola-name-1', residentName: 'Nola Name' }] },
		'academia': { '2025-10-22': [{ time: '08:00 - 09:00', residentId: 'unit-021-2', residentName: 'Unit 021' }] },
	};
	let calendarStates = { 'salao-festas': new Date(), 'academia': new Date(), 'piscina': new Date(), 'quadra-tenis': new Date() };

	function generateHourlyIntervals(startHour, endHour) { const slots = []; for (let i = startHour; i < endHour; i++) { slots.push(`${String(i).padStart(2, '0')}:00 - ${String(i + 1).padStart(2, '0')}:00`); } return slots; }
	function generateTimeSlots(amenityId) { switch (amenityId) { case 'salao-festas': return ['10:30 - 15:00', '18:00 - 22:00']; case 'academia': return generateHourlyIntervals(7, 22); case 'piscina': return generateHourlyIntervals(9, 22); case 'quadra-tenis': return generateHourlyIntervals(8, 20); default: return []; } }

	function cancelBooking(amenityId, dateString, time) {
		if (confirm(`Tem certeza que deseja cancelar a reserva do horário ${time}?`)) {
			const bookingsForDay = calendarioReservas[amenityId][dateString];
			calendarioReservas[amenityId][dateString] = bookingsForDay.filter(booking => booking.time !== time);
			if (calendarioReservas[amenityId][dateString].length === 0) {
				delete calendarioReservas[amenityId][dateString];
			}
			bookingModal.classList.remove('active');
			renderCalendar(amenityId);
			atualizarDashboard();
		}
	}

	function openBookingModal(amenityId, dateString) {
		const [year, month, day] = dateString.split('-');
		document.getElementById('booking-modal-date').textContent = `${day}/${month}/${year}`;
		bookingAmenityIdInput.value = amenityId;
		bookingDateInput.value = dateString;
		const bookingsForDay = calendarioReservas[amenityId]?.[dateString] || [];
		const totalSlots = generateTimeSlots(amenityId).length;
		if (bookingsForDay.length > 0) {
			document.getElementById('booking-list').innerHTML = '';
			bookingsForDay.forEach(booking => {
				const item = document.createElement('div');
				item.className = 'booking-item';
				item.innerHTML = `<div class="booking-item-info"><span class="resident-name">${booking.residentName}</span><span class="time-slot">${booking.time}</span></div>`;
				const cancelBtn = document.createElement('button');
				cancelBtn.className = 'btn btn-danger';
				cancelBtn.textContent = 'Cancelar';
				cancelBtn.onclick = () => cancelBooking(amenityId, dateString, booking.time);
				item.appendChild(cancelBtn);
				document.getElementById('booking-list').appendChild(item);
			});
			goToAdicionarBtn.style.display = bookingsForDay.length < totalSlots ? 'inline-flex' : 'none';
			document.getElementById('booking-view-container').style.display = 'block';
			document.getElementById('booking-add-view').style.display = 'none';
		} else {
			document.getElementById('booking-view-container').style.display = 'none';
			document.getElementById('booking-add-view').style.display = 'block';
			populateAddBookingForm(amenityId, dateString);
		}
		bookingModal.classList.add('active');
	}

	function populateAddBookingForm(amenityId, dateString) {
		bookingResidentSelect.innerHTML = '<option value="" disabled selected>-- Escolha um morador --</option>';
		document.querySelectorAll('.resident-item').forEach(item => { const option = new Option(`${item.querySelector('.resident-name').textContent} (Unid. ${item.dataset.unit})`, item.dataset.id); option.dataset.name = item.querySelector('.resident-name').textContent; bookingResidentSelect.add(option); });
		bookingTimeSlotsContainer.innerHTML = '';
		const allSlots = generateTimeSlots(amenityId);
		const bookedSlots = (calendarioReservas[amenityId]?.[dateString] || []).map(b => b.time);
		allSlots.forEach((slot, index) => {
			if (bookedSlots.includes(slot)) return;
			const label = document.createElement('label');
			label.className = 'time-slot-label';
			const radio = document.createElement('input');
			radio.type = 'radio'; radio.name = 'time-slot'; radio.value = slot; radio.id = `slot-${index}`;
			const span = document.createElement('span');
			span.textContent = slot;
			label.appendChild(radio); label.appendChild(span);
			radio.addEventListener('change', () => { document.querySelectorAll('.time-slot-label').forEach(l => l.style.backgroundColor = ''); if (radio.checked) { label.style.backgroundColor = 'var(--primary-color)'; } });
			bookingTimeSlotsContainer.appendChild(label);
		});
	}

	if (goToAdicionarBtn) goToAdicionarBtn.addEventListener('click', () => { const amenityId = bookingAmenityIdInput.value; const dateString = bookingDateInput.value; populateAddBookingForm(amenityId, dateString); document.getElementById('booking-view-container').style.display = 'none'; document.getElementById('booking-add-view').style.display = 'block'; });
	if (backToViewBtn) backToViewBtn.addEventListener('click', () => { const bookingsForDay = calendarioReservas[bookingAmenityIdInput.value]?.[bookingDateInput.value] || []; if (bookingsForDay.length > 0) { document.getElementById('booking-view-container').style.display = 'block'; document.getElementById('booking-add-view').style.display = 'none'; } else { bookingModal.classList.remove('active'); } });

	// Lógica do calendário alterada (Dias anteriores ficam escrito "indisponíveis" e marcados com a cor cinza)
	function renderCalendar(amenityId) {
		const amenityView = document.getElementById(amenityId);
		if (!amenityView) return;
		const date = calendarStates[amenityId];
		const year = date.getFullYear();
		const month = date.getMonth();
		const calendarHeader = amenityView.querySelector('.calendar-header h2');
		const calendarGrid = amenityView.querySelector('.calendar-grid');
		const prevMonthBtn = amenityView.querySelector('.prev-month-btn');
		calendarHeader.textContent = `${meses[month]} ${year}`;
		calendarGrid.innerHTML = '';
		
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
			const dayNameEl = document.createElement('div');
			dayNameEl.className = 'day-name';
			dayNameEl.textContent = day;
			calendarGrid.appendChild(dayNameEl);
		});
		
        const firstDayOfMonth = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		
        for (let i = 0; i < firstDayOfMonth; i++) {
			const emptyDay = document.createElement('div');
			emptyDay.className = 'day other-month';
			calendarGrid.appendChild(emptyDay);
		}
		
        const totalSlotsForAmenity = generateTimeSlots(amenityId).length;

		for (let i = 1; i <= daysInMonth; i++) {
			const dayEl = document.createElement('div');
			dayEl.className = 'day';
			const dayDate = new Date(year, month, i);
			const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
			dayEl.dataset.date = dateString;
			
            const bookingsForDay = calendarioReservas[amenityId]?.[dateString] || [];
			let statusSpan = '';

            // Lógica original de disponibilidade
			if (totalSlotsForAmenity > 0 && bookingsForDay.length === totalSlotsForAmenity) {
				dayEl.classList.add('booked');
				statusSpan = `<span class="status">Reservado</span>`;
			} else if (bookingsForDay.length > 0) {
				dayEl.classList.add('partial-booked');
				statusSpan = `<span class="status">Parcial</span>`;
			} else {
				dayEl.classList.add('available');
				statusSpan = `<span class="status">Disponível</span>`;
			}

            // --- ALTERAÇÃO AQUI: Verifica se o dia já passou ---
            if (dayDate < hojeReal) {
                // Remove classes de status anteriores para evitar conflito de cores
                dayEl.classList.remove('booked', 'partial-booked', 'available');
                // Adiciona classe de passado
                dayEl.classList.add('past');
                // Altera o texto do badge
                statusSpan = `<span class="status">Indisponível</span>`;
            }

			dayEl.innerHTML = `<p>${i}</p>${statusSpan}`;

            // Adiciona evento de clique apenas se NÃO for passado
			if (dayDate < hojeReal) {
				// Opcional: manter classe other-month se preferir o visual antigo, 
                // mas a classe .past definida no CSS acima cuidará do visual cinza.
			} else {
				dayEl.addEventListener('click', () => openBookingModal(amenityId, dateString));
			}
			
            if (dayDate.getTime() === hojeReal.getTime()) {
				dayEl.classList.add('current-day');
			}
			calendarGrid.appendChild(dayEl);
		}
		
        const firstDayOfCurrentMonth = new Date(hojeReal.getFullYear(), hojeReal.getMonth(), 1);
		if (prevMonthBtn) prevMonthBtn.disabled = (new Date(year, month, 1) < firstDayOfCurrentMonth);
	}

	if (bookingForm) bookingForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const amenityId = bookingAmenityIdInput.value;
		const date = bookingDateInput.value;
		const residentId = bookingResidentSelect.value;
		const selectedOption = bookingResidentSelect.options[bookingResidentSelect.selectedIndex];
		const selectedTimeSlot = bookingForm.querySelector('input[name="time-slot"]:checked');
		if (!residentId) { alert('Por favor, selecione um morador.'); return; }
		if (!selectedTimeSlot) { alert('Por favor, selecione um horário.'); return; }
		const time = selectedTimeSlot.value;
		const residentName = selectedOption.dataset.name;
		if (!calendarioReservas[amenityId]) { calendarioReservas[amenityId] = {}; }
		if (!calendarioReservas[amenityId][date]) { calendarioReservas[amenityId][date] = []; }
		calendarioReservas[amenityId][date].push({ time, residentId, residentName });
		bookingModal.classList.remove('active');
		renderCalendar(amenityId);
		atualizarDashboard();
	});

	document.querySelectorAll('.amenity-view').forEach(view => { const amenityId = view.id; view.querySelector('.prev-month-btn').addEventListener('click', () => { calendarStates[amenityId].setMonth(calendarStates[amenityId].getMonth() - 1); renderCalendar(amenityId); }); view.querySelector('.next-month-btn').addEventListener('click', () => { calendarStates[amenityId].setMonth(calendarStates[amenityId].getMonth() + 1); renderCalendar(amenityId); }); });
	Object.keys(calendarStates).forEach(id => renderCalendar(id));

	// =================================================================
	// --- LÓGICA DOS COMUNICADOS ---
	// =================================================================
	const announcementsGrid = document.querySelector('.announcements-grid');
	const announcementModal = document.getElementById('announcement-modal');
	const announcementForm = document.getElementById('announcement-form');
	const addAnnouncementBtn = document.getElementById('add-announcement-btn'); // Este ID não existe no seu HTML
	let announcementIdToModify = null;
	let announcementsData = [];

	function createAnnouncementElement({ id, title, description, date }) {
		const card = document.createElement('div');
		card.className = 'announcement-card';
		card.dataset.id = id;
		const formattedDate = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
		card.innerHTML = `<div class="card-content"><h3>${title}</h3><div class="card-meta"><p class="date"><i class="ri-calendar-line"></i> ${formattedDate}</p></div><p class="description">${description}</p></div><div class="card-actions"><button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button><button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button></div>`;
		return card;
	}

	function renderAnnouncements() {
		if (!announcementsGrid) return;
		announcementsGrid.innerHTML = '';
		announcementsData.slice().reverse().forEach(announcement => { announcementsGrid.appendChild(createAnnouncementElement(announcement)); });
	}

	function handleAnnouncementActions(e) {
		const editBtn = e.target.closest('.edit-btn');
		const deleteBtn = e.target.closest('.delete-btn');
		if (editBtn) {
			const card = editBtn.closest('.announcement-card');
			announcementIdToModify = card.dataset.id;
			const announcement = announcementsData.find(a => a.id === announcementIdToModify);
			if (announcement) {
				announcementModal.querySelector('#announcement-modal-title').textContent = 'Editar Comunicado';
				announcementModal.querySelector('#announcement-id').value = announcement.id;
				announcementModal.querySelector('#announcement-title').value = announcement.title;
				announcementModal.querySelector('#announcement-desc').value = announcement.description;
				announcementModal.classList.add('active');
			}
		}
		if (deleteBtn) {
			announcementIdToModify = deleteBtn.closest('.announcement-card').dataset.id;
			document.getElementById('delete-modal-title').textContent = "Excluir Comunicado";
			document.getElementById('delete-modal-text').textContent = "Tem certeza de que deseja excluir este comunicado? A ação é permanente.";
			document.getElementById('delete-confirm-modal').classList.add('active');
		}
	}

	function handleAnnouncementSubmit(e) {
		e.preventDefault();
		const id = announcementForm.querySelector('#announcement-id').value;
		const title = announcementForm.querySelector('#announcement-title').value.trim();
		const description = announcementForm.querySelector('#announcement-desc').value.trim();
		if (title && description) {
			if (id) {
				const index = announcementsData.findIndex(a => a.id === id);
				if (index > -1) { announcementsData[index].title = title; announcementsData[index].description = description; }
			} else {
				announcementsData.push({ id: `anno-${Date.now()}`, title, description, date: new Date() });
			}
			announcementModal.classList.remove('active');
			renderAnnouncements();
		}
	}

	if (announcementsGrid) { announcementsGrid.addEventListener('click', handleAnnouncementActions); }
	// Adicionando verificação se o botão existe
	if (addAnnouncementBtn) { addAnnouncementBtn.addEventListener('click', () => { announcementForm.reset(); announcementModal.querySelector('#announcement-id').value = ''; announcementModal.querySelector('#announcement-modal-title').textContent = 'Novo Comunicado'; announcementModal.classList.add('active'); }); }
	if (announcementForm) { announcementForm.addEventListener('submit', handleAnnouncementSubmit); }

	// =================================================================
	// --- LÓGICA DE MORADORES ---
	// =================================================================
	const residentsList = document.querySelector('.residents-list');
	const addModal = document.getElementById('add-resident-modal');
	const editModal = document.getElementById('edit-resident-modal');
	const deleteModal = document.getElementById('delete-confirm-modal');
	const addResidentPhotoInput = document.getElementById('add-resident-photo-input');
	const addResidentPhotoPreview = document.getElementById('add-resident-photo-preview');
	const editResidentPhotoInput = document.getElementById('edit-resident-photo-input');
	const editResidentPhotoPreview = document.getElementById('edit-resident-photo-preview');
	const defaultResidentPhoto = 'https://i.pravatar.cc/100?u=new';
	let residentIdToModify = null;

	function handlePhotoPreview(input, preview) {
		if (!input || !preview) return;
		input.addEventListener('change', function () {
			const file = this.files[0];
			if (file) { const reader = new FileReader(); reader.onload = (e) => { preview.src = e.target.result; }; reader.readAsDataURL(file); }
		});
	}
	handlePhotoPreview(addResidentPhotoInput, addResidentPhotoPreview);
	handlePhotoPreview(editResidentPhotoInput, editResidentPhotoPreview);

	if (addModal && editModal && deleteModal) {
		const addForm = document.getElementById('add-resident-form');
		const editForm = document.getElementById('edit-resident-form');
		const inviteBtn = document.getElementById('invite-resident-btn');
		if (inviteBtn) inviteBtn.addEventListener('click', () => { addResidentPhotoPreview.src = defaultResidentPhoto; addModal.classList.add('active'); });

		if (residentsList) residentsList.addEventListener('click', (e) => {
			const editBtn = e.target.closest('.edit-btn');
			const deleteBtn = e.target.closest('.delete-btn');
			if (editBtn) {
				const item = editBtn.closest('.resident-item');
				residentIdToModify = item.dataset.id;
				const details = item.querySelector('.resident-details').textContent.split('|');
				const currentPhotoSrc = item.querySelector('img').src;
				editModal.querySelector('#edit-resident-photo-preview').src = currentPhotoSrc;
				editModal.querySelector('#edit-resident-name').value = item.querySelector('.resident-name').textContent;
				editModal.querySelector('#edit-resident-unit').value = item.dataset.unit || details[0].replace('Unidade', '').trim();
				editModal.querySelector('#edit-resident-email').value = details[1].trim();
				editModal.classList.add('active');
			}
			if (deleteBtn) {
				residentIdToModify = deleteBtn.closest('.resident-item').dataset.id;
				document.getElementById('delete-modal-title').textContent = "Confirmar Exclusão de Morador";
				document.getElementById('delete-modal-text').textContent = "Tem certeza de que deseja excluir este morador? Esta ação não pode ser desfeita.";
				deleteModal.classList.add('active');
			}
		});

		if (addForm) addForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const name = addForm.querySelector('#resident-name').value.trim();
			const unit = addForm.querySelector('#resident-unit').value.trim();
			const email = addForm.querySelector('#resident-email').value.trim();
			const photoSrc = addResidentPhotoPreview.src;
			if (name && unit && email) {
				const id = `res-${Date.now()}`;
				const newItem = document.createElement('div');
				newItem.className = 'resident-item';
				newItem.dataset.id = id;
				newItem.dataset.unit = unit;
				newItem.innerHTML = `<div class="resident-info"><img src="${photoSrc}" alt="${name}"><div><p class="resident-name">${name}</p><p class="resident-details">Unidade ${unit} | ${email}</p></div></div><div class="resident-actions"><button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button><button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button></div>`;
				residentsList.appendChild(newItem);
				addForm.reset();
				addModal.classList.remove('active');
				atualizarDashboard();
			}
		});

		if (editForm) editForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const name = editForm.querySelector('#edit-resident-name').value.trim();
			const unit = editForm.querySelector('#edit-resident-unit').value.trim();
			const email = editForm.querySelector('#edit-resident-email').value.trim();
			const newPhotoSrc = editResidentPhotoPreview.src;
			const item = residentsList.querySelector(`.resident-item[data-id="${residentIdToModify}"]`);
			if (item) {
				item.querySelector('img').src = newPhotoSrc;
				item.querySelector('.resident-name').textContent = name;
				item.querySelector('.resident-details').textContent = `Unidade ${unit} | ${email}`;
				item.dataset.unit = unit;
			}
			editModal.classList.remove('active');
		});
	}

	// =================================================================
	// --- LÓGICA DE CLASSIFICADOS (MERCADO DIGITAL) ---
	// =================================================================
	const classifiedsGrid = document.querySelector('.classifieds-grid');
	const addClassifiedBtn = document.getElementById('add-classified-btn');
	const addClassifiedModal = document.getElementById('add-classified-modal');
	const addClassifiedForm = document.getElementById('add-classified-form');
	const addClassifiedPhotoInput = document.getElementById('add-classified-photo-input');
	const addClassifiedPhotoPreview = document.getElementById('add-classified-photo-preview');
	const editClassifiedModal = document.getElementById('edit-classified-modal');
	const editClassifiedForm = document.getElementById('edit-classified-form');
	const editClassifiedPhotoInput = document.getElementById('edit-classified-photo-input');
	const editClassifiedPhotoPreview = document.getElementById('edit-classified-photo-preview');
	const addClassifiedPhoneInput = document.getElementById('classified-phone');
	const editClassifiedPhoneInput = document.getElementById('edit-classified-phone');
	const defaultClassifiedPhoto = 'https://via.placeholder.com/150';
	let classifiedIdToModify = null;
	const filterAllBtn = document.getElementById('filter-all-classifieds');
	const filterMyBtn = document.getElementById('filter-my-classifieds');

    // DADOS REMOVIDOS AQUI
	let classifiedsData = [];

	function phoneMaskHandler(event) {
		const input = event.target;
		let value = input.value.replace(/\D/g, '');
		value = value.substring(0, 11);
		if (value.length > 2) { value = `(${value.substring(0, 2)}) ${value.substring(2)}`; }
		if (value.length > 9) { value = `${value.substring(0, 10)}-${value.substring(10)}`; }
		input.value = value;
	}

	function getResidentById(id) {
		const residentEl = residentsList.querySelector(`.resident-item[data-id="${id}"]`);
		if (!residentEl) { return { name: 'Desconhecido', avatar: defaultResidentPhoto }; }
		return { name: residentEl.querySelector('.resident-name').textContent, avatar: residentEl.querySelector('img').src };
	}

	function createClassifiedElement({ id, title, price, description, imageUrl, sellerId, phone }) {
		const card = document.createElement('div');
		card.className = 'classified-card';
		card.dataset.id = id;
		const seller = getResidentById(sellerId);
		const formattedPrice = `R$ ${price.toFixed(2).replace('.', ',')}`;
		const isOwner = (sellerId === CURRENT_USER_ID);
		card.innerHTML = `
			<div class="card-actions">
				${isOwner ? `
				<button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
				<button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
				` : ''}
			</div>
			<img src="${imageUrl}" alt="${title}" class="classified-card-img">
			<div class="card-content">
				<h4>${title}</h4>
				<p class="price">${formattedPrice}</p>
				<p class="description">${description}</p>
				${phone ? `<p class="contact-phone"><i class="ri-phone-line"></i> ${phone}</p>` : ''}
				<div class="author-info">
					<img src="${seller.avatar}" alt="${seller.name}">
					<span>Vendido por <strong>${seller.name}</strong></span>
				</div>
			</div>`;
		return card;
	}

	function renderClassifieds(filter = 'all') {
		if (!classifiedsGrid) return;
		classifiedsGrid.innerHTML = '';
		const itemsToRender = classifiedsData.filter(item => {
			if (filter === 'mine') { return item.sellerId === CURRENT_USER_ID; }
			return true;
		});
		if (itemsToRender.length === 0) {
			if (filter === 'mine') { classifiedsGrid.innerHTML = '<p>Você ainda não publicou nenhum anúncio.</p>'; } else { classifiedsGrid.innerHTML = '<p>Nenhum anúncio encontrado.</p>'; }
			return;
		}
		itemsToRender.forEach(item => { classifiedsGrid.appendChild(createClassifiedElement(item)); });
	}

	function getActiveClassifiedFilter() {
		return filterMyBtn.classList.contains('active') ? 'mine' : 'all';
	}

	if (filterAllBtn && filterMyBtn) {
		filterAllBtn.addEventListener('click', () => {
			filterAllBtn.classList.add('active');
			filterMyBtn.classList.remove('active');
			renderClassifieds('all');
		});
		filterMyBtn.addEventListener('click', () => {
			filterMyBtn.classList.add('active');
			filterAllBtn.classList.remove('active');
			renderClassifieds('mine');
		});
	}

	function populateSellerDropdown(selectElement, selectedId = null) {
		selectElement.innerHTML = '';
		document.querySelectorAll('.resident-item').forEach(item => {
			const name = item.querySelector('.resident-name').textContent;
			const id = item.dataset.id;
			const option = new Option(name, id);
			if (id === selectedId) { option.selected = true; }
			selectElement.add(option);
		});
	}

	if (addClassifiedBtn) {
		addClassifiedBtn.addEventListener('click', () => {
			addClassifiedForm.reset();
			addClassifiedPhotoPreview.src = defaultClassifiedPhoto;
			const sellerDropdown = document.getElementById('classified-seller');
			populateSellerDropdown(sellerDropdown, CURRENT_USER_ID);
			addClassifiedModal.classList.add('active');
		});
	}

	if (addClassifiedForm) {
		addClassifiedForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const newClassified = {
				id: `class-${Date.now()}`,
				title: document.getElementById('classified-title').value,
				price: parseFloat(document.getElementById('classified-price').value),
				phone: document.getElementById('classified-phone').value,
				description: document.getElementById('classified-desc').value,
				imageUrl: addClassifiedPhotoPreview.src,
				sellerId: document.getElementById('classified-seller').value
			};
			classifiedsData.unshift(newClassified);
			renderClassifieds(getActiveClassifiedFilter());
			addClassifiedModal.classList.remove('active');
		});
	}

	if (classifiedsGrid) classifiedsGrid.addEventListener('click', (e) => {
		const editBtn = e.target.closest('.edit-btn');
		const deleteBtn = e.target.closest('.delete-btn');
		if (editBtn) {
			classifiedIdToModify = editBtn.closest('.classified-card').dataset.id;
			const itemData = classifiedsData.find(item => item.id === classifiedIdToModify);
			if (itemData) {
				document.getElementById('edit-classified-id').value = itemData.id;
				document.getElementById('edit-classified-title').value = itemData.title;
				document.getElementById('edit-classified-price').value = itemData.price;
				document.getElementById('edit-classified-phone').value = itemData.phone || '';
				document.getElementById('edit-classified-desc').value = itemData.description;
				editClassifiedPhotoPreview.src = itemData.imageUrl;
				populateSellerDropdown(document.getElementById('edit-classified-seller'), itemData.sellerId);
				editClassifiedModal.classList.add('active');
			}
		}
		if (deleteBtn) {
			classifiedIdToModify = deleteBtn.closest('.classified-card').dataset.id;
			document.getElementById('delete-modal-title').textContent = "Excluir Anúncio";
			document.getElementById('delete-modal-text').textContent = "Tem certeza de que deseja excluir este anúncio? A ação é permanente.";
			deleteModal.classList.add('active');
		}
	});

	if (editClassifiedForm) editClassifiedForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const id = document.getElementById('edit-classified-id').value;
		const itemIndex = classifiedsData.findIndex(item => item.id === id);
		if (itemIndex > -1) {
			classifiedsData[itemIndex] = {
				...classifiedsData[itemIndex],
				title: document.getElementById('edit-classified-title').value,
				price: parseFloat(document.getElementById('edit-classified-price').value),
				phone: document.getElementById('edit-classified-phone').value,
				description: document.getElementById('edit-classified-desc').value,
				imageUrl: editClassifiedPhotoPreview.src,
				sellerId: document.getElementById('edit-classified-seller').value
			};
			renderClassifieds(getActiveClassifiedFilter());
		}
		editClassifiedModal.classList.remove('active');
	});

	handlePhotoPreview(addClassifiedPhotoInput, addClassifiedPhotoPreview);
	handlePhotoPreview(editClassifiedPhotoInput, editClassifiedPhotoPreview);
	if (addClassifiedPhoneInput) addClassifiedPhoneInput.addEventListener('input', phoneMaskHandler);
	if (editClassifiedPhoneInput) editClassifiedPhoneInput.addEventListener('input', phoneMaskHandler);

	// =================================================================
	// --- NOVA LÓGICA DE MANUTENÇÃO ---
	// =================================================================
	const maintenanceGrid = document.querySelector('.maintenance-grid');
	const maintenanceModal = document.getElementById('maintenance-modal');
	const maintenanceForm = document.getElementById('maintenance-form');
	const addMaintenanceBtn = document.getElementById('add-maintenance-btn');
	let maintenanceIdToModify = null;

	// Banco de Dados Simulado: Relatórios de Manutenção
    // DADOS REMOVIDOS AQUI
	let maintenanceData = [];

	// Helper para traduzir o status
	function getStatusText(status) {
		switch (status) {
			case 'pending': return 'Pendente';
			case 'in-progress': return 'Em Andamento';
			case 'resolved': return 'Resolvido';
			default: return 'Desconhecido';
		}
	}

	// Manutenção (Helper): Cria o elemento HTML do card.
	function createMaintenanceElement({ id, title, description, date, status }) {
		const card = document.createElement('div');
		card.className = 'maintenance-card';
		card.dataset.id = id;
		const formattedDate = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

		// O card-meta contém a data e o novo status badge
		card.innerHTML = `
			<div class="card-content">
				<h3>${title}</h3>
				<div class="card-meta">
					<p class="date"><i class="ri-calendar-line"></i> ${formattedDate}</p>
					<span class="status-badge ${status}">${getStatusText(status)}</span>
				</div>
				<p class="description">${description}</p>
			</div>
			<div class="card-actions">
				<button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
				<button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
			</div>`;
		return card;
	}

	// Manutenção (Render): Renderiza os cards no grid (mural).
	function renderMaintenanceReports() {
		if (!maintenanceGrid) return;
		maintenanceGrid.innerHTML = '';
		// .slice().reverse() para mostrar os mais novos primeiro
		maintenanceData.slice().reverse().forEach(report => {
			maintenanceGrid.appendChild(createMaintenanceElement(report));
		});
	}

	// Manutenção (Actions): Gerencia cliques de "editar" e "excluir".
	function handleMaintenanceActions(e) {
		const editBtn = e.target.closest('.edit-btn');
		const deleteBtn = e.target.closest('.delete-btn');
		if (editBtn) {
			const card = editBtn.closest('.maintenance-card');
			maintenanceIdToModify = card.dataset.id;
			const report = maintenanceData.find(m => m.id === maintenanceIdToModify);
			if (report) {
				maintenanceModal.querySelector('#maintenance-modal-title').textContent = 'Editar Relatório';
				maintenanceModal.querySelector('#maintenance-id').value = report.id;
				maintenanceModal.querySelector('#maintenance-title').value = report.title;
				maintenanceModal.querySelector('#maintenance-desc').value = report.description;
				maintenanceModal.querySelector('#maintenance-status').value = report.status; // Define o status
				maintenanceModal.classList.add('active');
			}
		}
		if (deleteBtn) {
			maintenanceIdToModify = deleteBtn.closest('.maintenance-card').dataset.id;
			document.getElementById('delete-modal-title').textContent = "Excluir Relatório";
			document.getElementById('delete-modal-text').textContent = "Tem certeza de que deseja excluir este relatório de manutenção?";
			document.getElementById('delete-confirm-modal').classList.add('active');
		}
	}

	// Manutenção (Create/Update): Salva o relatório.
	function handleMaintenanceSubmit(e) {
		e.preventDefault();
		const id = maintenanceForm.querySelector('#maintenance-id').value;
		const title = maintenanceForm.querySelector('#maintenance-title').value.trim();
		const description = maintenanceForm.querySelector('#maintenance-desc').value.trim();
		const status = maintenanceForm.querySelector('#maintenance-status').value; // Pega o status

		if (title && description && status) {
			if (id) {
				// Lógica de Update
				const index = maintenanceData.findIndex(m => m.id === id);
				if (index > -1) {
					maintenanceData[index].title = title;
					maintenanceData[index].description = description;
					maintenanceData[index].status = status;
				}
			} else {
				// Lógica de Create
				maintenanceData.push({
					id: `maint-${Date.now()}`,
					title,
					description,
					date: new Date(),
					status // Salva o status
				});
			}
			maintenanceModal.classList.remove('active');
			renderMaintenanceReports();
		}
	}

	// Listeners de Manutenção
	if (maintenanceGrid) { maintenanceGrid.addEventListener('click', handleMaintenanceActions); }
	if (addMaintenanceBtn) {
		addMaintenanceBtn.addEventListener('click', () => {
			maintenanceForm.reset();
			maintenanceModal.querySelector('#maintenance-id').value = '';
			maintenanceModal.querySelector('#maintenance-modal-title').textContent = 'Novo Relatório de Manutenção';
			maintenanceModal.querySelector('#maintenance-status').value = 'pending'; // Define o status padrão
			maintenanceModal.classList.add('active');
		});
	}
	if (maintenanceForm) { maintenanceForm.addEventListener('submit', handleMaintenanceSubmit); }


	// =================================================================
	// --- LÓGICA GERAL E DE INICIALIZAÇÃO ---
	// =================================================================

	document.getElementById('confirm-delete-btn').addEventListener('click', () => {
		const activeSectionId = document.querySelector('.content-section.active').id;

		if (activeSectionId === 'residents' && residentIdToModify) {
			const residentToDelete = residentsList.querySelector(`.resident-item[data-id="${residentIdToModify}"]`);
			if (residentToDelete) { residentToDelete.remove(); }
			atualizarDashboard();
			residentIdToModify = null;
		} else if (activeSectionId === 'announcements' && announcementIdToModify) {
			announcementsData = announcementsData.filter(a => a.id !== announcementIdToModify);
			renderAnnouncements();
			announcementIdToModify = null;
		} else if (activeSectionId === 'classifieds' && classifiedIdToModify) {
			classifiedsData = classifiedsData.filter(item => item.id !== classifiedIdToModify);
			renderClassifieds(getActiveClassifiedFilter());
			classifiedIdToModify = null;
		} else if (activeSectionId === 'maintenance' && maintenanceIdToModify) {
			// NOVO: Deletar Relatório de Manutenção
			maintenanceData = maintenanceData.filter(m => m.id !== maintenanceIdToModify);
			renderMaintenanceReports();
			maintenanceIdToModify = null;
		}
		deleteModal.classList.remove('active');
	});

	// Modal: Lógica global para fechar qualquer modal
	document.querySelectorAll('.modal-overlay').forEach(modal => {
		modal.addEventListener('click', e => {
			if (e.target === modal || e.target.closest('.close-modal-btn') || e.target.closest('.cancel-btn') || e.target.closest('.cancel-delete-btn')) {
				modal.classList.remove('active');
			}
		});
	});

	// Navegação SPA: Esconde todas as seções e mostra apenas a ativa.
	function showSection(targetId) {
		contentSections.forEach(section => {
			section.classList.toggle('active', '#' + section.id === targetId);
		});
	}

	// Inicialização: Ponto de entrada da aplicação.
	function init() {
		renderAnnouncements();
		renderClassifieds('all');
		renderMaintenanceReports(); // NOVO: Renderiza os relatórios na inicialização

		const initialActiveLink = document.querySelector('.sidebar-nav .nav-link.active');
		if (initialActiveLink) {
			const initialSectionId = initialActiveLink.getAttribute('href');
			if (initialSectionId === '#dashboard') {
				atualizarDashboard();
			}
			showSection(initialSectionId);
			mainTitle.textContent = initialActiveLink.querySelector('span').textContent;
		} else {
			const firstLink = navLinks[0];
			if (firstLink) {
				firstLink.classList.add('active');
				const targetId = firstLink.getAttribute('href');
				mainTitle.textContent = firstLink.querySelector('span').textContent;
				showSection(targetId);
				if (targetId === '#dashboard') {
					atualizarDashboard();
				}
			}
		}
	}

	// Navegação SPA: Event listener para os links da sidebar
	navLinks.forEach(link => {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			navLinks.forEach(navLink => navLink.classList.remove('active'));
			this.classList.add('active');
			const targetId = this.getAttribute('href');
			const linkText = this.querySelector('span').textContent;
			mainTitle.textContent = linkText;
			showSection(targetId);
			if (window.innerWidth <= 992) { sidebarNav.classList.remove('open'); }
		});
	});

	// Navegação Abas: Troca entre os calendários (Salão, Academia)
	amenityLinks.forEach(link => {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			document.querySelectorAll('.amenities-sidebar li').forEach(li => li.classList.remove('active'));
			this.parentElement.classList.add('active');
			const targetId = this.getAttribute('href');
			amenityViews.forEach(view => {
				view.classList.toggle('active', '#' + view.id === targetId);
			});
		});
	});

	// Responsivo: Lógica para abrir/fechar o menu
	if (menuButton) menuButton.addEventListener('click', (e) => { e.stopPropagation(); sidebarNav.classList.toggle('open'); });
	document.addEventListener('click', function (event) {
		if (window.innerWidth <= 992 && sidebarNav.classList.contains('open')) {
			const isClickInsideNav = sidebarNav.contains(event.target);
			const isClickOnMenuButton = menuButton.contains(event.target);
			if (!isClickInsideNav && !isClickOnMenuButton) { sidebarNav.classList.remove('open'); }
		}
	});

	init();
});
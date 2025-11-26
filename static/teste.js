document.addEventListener("DOMContentLoaded", () => {
    // ======= Estado =======
    let todosOsClassificados = [];
    let classificadosAtuais = [];
    let ordemAtual = "crescente";

    // ======= Seletores (pegados depois do DOM) =======
    const classifiedsGrid = document.querySelector(".classifieds-grid");
    const btnAll = document.getElementById("filter-all-classifieds");
    const btnMine = document.getElementById("filter-my-classifieds");
    const btnOrdenar = document.getElementById("btn-ordenar");
    const setaElem = document.getElementById("seta");
    const inputBusca = document.getElementById("filtro-busca");

    if (!classifiedsGrid) console.error("Elemento .classifieds-grid NÃO encontrado!");
    if (!btnAll) console.error("#filter-all-classifieds NÃO encontrado!");
    if (!btnMine) console.error("#filter-my-classifieds NÃO encontrado!");
    if (!btnOrdenar) console.error("#btn-ordenar NÃO encontrado!");
    if (!setaElem) console.warn("#seta não encontrado (apenas visual)");

    // ======= Funções =======
    function createClassifiedElement(item) {
        try {
            const card = document.createElement('div');
            card.className = 'classified-card';
            card.dataset.id = item.id_classificados;

            const imageUrl = item.foto_url_class ? item.foto_url_class : 'https://via.placeholder.com/300x200.png?text=Sem+Foto';
            const formattedPrice = `R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}`;

            const ehMeu = item.id_usuario == window.userId; // cuidado com tipo (== int/str)

            const botoesAcoes = ehMeu ? `
                <div class="card-actions">
                    <button class="action-btn edit-btn"><i class="ri-pencil-line"></i></button>
                    <button class="action-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
                </div>
            ` : "";

            card.innerHTML = `
                ${botoesAcoes}
                <img src="${imageUrl}" alt="${item.titulo_classificados}" class="classified-card-img">
                <div class="card-content">
                    <h4>${item.titulo_classificados}</h4>
                    <p class="price">${formattedPrice}</p>
                    <p class="description">${item.descricao || item.descricao_classificados || ""}</p>
                    ${item.contato ? `<p class="contact-phone"><i class="ri-phone-line"></i> ${item.contato}</p>` : ''}
                    <div class="author-info">
                        <img src="/static/img/default-avatar.png">
                        <span>Vendido por <strong>${item.vendedor || item.nome || ''}</strong></span>
                    </div>
                </div>
            `;
            return card;
        } catch (err) {
            console.error("Erro createClassifiedElement:", err, item);
            return document.createElement('div'); // devolve algo pra não quebrar o loop
        }
    }

    function renderClassifieds(classificados) {
        console.log("renderClassifieds chamado com", classificados && classificados.length, "itens");
        const grid = document.querySelector(".classifieds-grid"); // pega sempre atual
        if (!grid) {
            console.error("renderClassifieds: .classifieds-grid NÃO encontrado no DOM");
            return;
        }
        grid.innerHTML = "";

        if (!classificados || classificados.length === 0) {
            grid.innerHTML = `<p style="text-align: center;">Nenhum item nos classificados.</p>`;
            return;
        }

        classificados.forEach(item => {
            const card = createClassifiedElement(item);
            grid.appendChild(card);
        });
    }

    function aplicarOrdenacao(lista) {
        if (!Array.isArray(lista)) lista = [];
        console.log("aplicarOrdenacao: ordem =", ordemAtual, "tamanho lista =", lista.length);

        const ordenada = [...lista].sort((a, b) => {
            const precoA = parseFloat(a.preco || 0);
            const precoB = parseFloat(b.preco || 0);
            return ordemAtual === "crescente" ? precoA - precoB : precoB - precoA;
        });

        classificadosAtuais = ordenada; // mantém estado
        renderClassifieds(ordenada);
    }

    async function carregarClassificados() {
        try {
            console.log("carregarClassificados() -> fetch /classificados");
            const resp = await fetch("/classificados");
            if (!resp.ok) throw new Error("Status " + resp.status);
            todosOsClassificados = await resp.json();
            console.log("todosOsClassificados carregados:", todosOsClassificados.length);
            classificadosAtuais = [...todosOsClassificados];
            aplicarOrdenacao(classificadosAtuais);
        } catch (err) {
            console.error("Erro ao carregar classificados:", err);
            if (classifiedsGrid) classifiedsGrid.innerHTML = `<p style="color:red">Erro ao carregar classificados.</p>`;
        }
    }

    // ======= Event listeners =======
    if (btnAll) {
        btnAll.addEventListener("click", () => {
            btnAll.classList.add("active");
            btnMine.classList.remove("active");
            classificadosAtuais = [...todosOsClassificados];
            aplicarOrdenacao(classificadosAtuais);
        });
    }

    if (btnMine) {
        btnMine.addEventListener("click", async () => {
            btnMine.classList.add("active");
            btnAll.classList.remove("active");
            try {
                console.log("fetch /meus_classificados");
                const r = await fetch("/meus_classificados");
                if (!r.ok) throw new Error("Status " + r.status);
                const meus = await r.json();
                console.log("meus_classificados retornou:", meus.length);
                classificadosAtuais = [...meus];
                aplicarOrdenacao(classificadosAtuais);
            } catch (err) {
                console.error("Erro ao buscar meus_classificados:", err);
            }
        });
    }

    if (btnOrdenar) {
        btnOrdenar.addEventListener("click", () => {
            ordemAtual = ordemAtual === "crescente" ? "decrescente" : "crescente";
            if (setaElem) setaElem.style.transform = ordemAtual === "crescente" ? "rotate(0deg)" : "rotate(180deg)";
            aplicarOrdenacao(classificadosAtuais);
        });
    }

    if (inputBusca) {
        inputBusca.addEventListener("input", (e) => {
            const q = e.target.value.trim().toLowerCase();
            const filtrados = classificadosAtuais.filter(it => (it.titulo_classificados || "").toLowerCase().includes(q));
            renderClassifieds(filtrados);
        });
    }

    // ======= Inicializa =======
    carregarClassificados();
});
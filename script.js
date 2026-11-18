
(function () {
    // Evita executar o script duas vezes
    if (window.dukaInicializado) return;
    window.dukaInicializado = true;

    // MENU PARA CELULAR
    const menuToggle = document.getElementById("menuToggle");
    const menu = document.getElementById("menu");

    if (menuToggle && menu) {
        menuToggle.addEventListener("click", () => {
            menu.classList.toggle("ativo");
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("ativo");
            });
        });
    }

    // CHATBOT DUKA
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");

    function adicionarMensagem(texto, tipo) {
        if (!chatMessages) return;

        const mensagem = document.createElement("div");
        mensagem.className = `mensagem ${tipo}`;
        mensagem.textContent = texto;

        chatMessages.appendChild(mensagem);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function gerarResposta(texto) {
        const mensagem = texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Primeiro verifica sentimentos negativos
        if (
            mensagem.includes("nao estou bem") ||
            mensagem.includes("nao estou muito bem") ||
            mensagem.includes("estou mal") ||
            mensagem.includes("triste") ||
            mensagem.includes("mal")
        ) {
            return "Sinto muito que você não esteja bem. Quer me contar o que aconteceu? Estou aqui para te ouvir.";
        }

        if (
            mensagem.includes("ansioso") ||
            mensagem.includes("ansiedade")
        ) {
            return "Entendo. Tente respirar com calma. Quer conversar sobre o que está causando essa ansiedade?";
        }

        if (
            mensagem.includes("feliz") ||
            mensagem.includes("estou bem")
        ) {
            return "Que bom! Fico feliz que esteja tendo um momento positivo. Como foi seu dia?";
        }

        if (
            mensagem.includes("cansado") ||
            mensagem.includes("cansada")
        ) {
            return "Parece que você está precisando de um descanso. Como foi seu dia?";
        }

        if (
            mensagem.includes("obrigado") ||
            mensagem.includes("obrigada")
        ) {
            return "Não precisa agradecer! Estou aqui para conversar com você.";
        }

        if (
            mensagem.includes("oi") ||
            mensagem.includes("ola")
        ) {
            return "Olá! Como você está se sentindo hoje?";
        }

        return "Entendi. Quer me contar um pouco mais sobre isso? Estou aqui para ajudar você a organizar seus pensamentos.";
    }

    function enviarMensagem(texto) {
        if (!chatInput || !chatMessages) return;

        texto = texto.trim();

        if (texto === "") return;

        adicionarMensagem(texto, "usuario");
        chatInput.value = "";

        setTimeout(() => {
            adicionarMensagem(gerarResposta(texto), "bot");
        }, 500);
    }

    if (chatForm && chatInput) {
        chatForm.addEventListener("submit", function (evento) {
            evento.preventDefault();
            enviarMensagem(chatInput.value);
        });
    }

    // BOTÕES DE SUGESTÕES
    document.querySelectorAll("[data-message]").forEach(botao => {
        botao.type = "button";

        botao.addEventListener("click", (evento) => {
            evento.preventDefault();
            enviarMensagem(botao.dataset.message);
        });
    });

    // DIÁRIO EMOCIONAL
    const journalForm = document.getElementById("journalForm");
    const journalText = document.getElementById("journalText");
    const journalFeedback = document.getElementById("journalFeedback");
    const journalEntries = document.getElementById("journalEntries");

    let emocaoSelecionada = "";
    const CHAVE_DIARIO = "dukaRegistros";

    // ESCOLHER EMOÇÃO
    document.querySelectorAll("[data-mood]").forEach(botao => {
        botao.addEventListener("click", () => {
            emocaoSelecionada = botao.dataset.mood;

            document.querySelectorAll("[data-mood]").forEach(item => {
                item.classList.remove("selecionado");
            });

            botao.classList.add("selecionado");
        });
    });

    // BUSCAR REGISTROS
    function obterRegistros() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_DIARIO)) || [];
        } catch {
            return [];
        }
    }

    // MOSTRAR REGISTROS
    function mostrarRegistros() {
        if (!journalEntries) return;

        journalEntries.innerHTML = "";

        const registros = obterRegistros();

        if (registros.length === 0) {
            journalEntries.textContent = "Seus registros aparecerão aqui.";
            return;
        }

        registros.slice().reverse().forEach(registro => {
            const cartao = document.createElement("div");
            cartao.className = "registro";

            const data = document.createElement("p");
            data.textContent = registro.data;

            const emocao = document.createElement("strong");
            emocao.textContent = registro.emocao;

            const texto = document.createElement("p");
            texto.textContent = registro.texto;

            const excluir = document.createElement("button");
            excluir.textContent = "Excluir";
            excluir.type = "button";

            excluir.addEventListener("click", () => {
                const atualizados = obterRegistros().filter(item => {
                    return item.id !== registro.id;
                });

                localStorage.setItem(
                    CHAVE_DIARIO,
                    JSON.stringify(atualizados)
                );

                mostrarRegistros();
            });

            cartao.append(data, emocao, texto, excluir);
            journalEntries.appendChild(cartao);
        });
    }

    // SALVAR REGISTRO
    if (journalForm) {
        journalForm.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const texto = journalText.value.trim();

            if (texto === "" || emocaoSelecionada === "") {
                if (journalFeedback) {
                    journalFeedback.textContent =
                        "Escolha uma emoção e escreva seu registro.";
                }
                return;
            }

            const registros = obterRegistros();

            registros.push({
                id: Date.now(),
                data: new Date().toLocaleString("pt-BR"),
                emocao: emocaoSelecionada,
                texto: texto
            });

            localStorage.setItem(
                CHAVE_DIARIO,
                JSON.stringify(registros)
            );

            journalText.value = "";
            emocaoSelecionada = "";

            document.querySelectorAll("[data-mood]").forEach(botao => {
                botao.classList.remove("selecionado");
            });

            if (journalFeedback) {
                journalFeedback.textContent =
                    "Registro salvo com sucesso!";
            }

            mostrarRegistros();
        });
    }

    mostrarRegistros();
})();

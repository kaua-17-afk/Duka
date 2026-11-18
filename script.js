
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
    const mensagem = document.createElement("div");

    mensagem.className = `mensagem ${tipo}`;
    mensagem.textContent = texto;

    chatMessages.appendChild(mensagem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function gerarResposta(texto) {
    texto = texto.toLowerCase();

    if (texto.includes("triste") || texto.includes("mal")) {
        return "Sinto muito que esteja se sentindo assim. Quer me contar o que aconteceu?";
    }

    if (texto.includes("ansioso") || texto.includes("ansiedade")) {
        return "Tente respirar com calma. O que está deixando você preocupado?";
    }

    if (texto.includes("feliz") || texto.includes("bem")) {
        return "Que bom! Fico feliz que esteja tendo um momento positivo. Como foi seu dia?";
    }

    if (texto.includes("cansado")) {
        return "Não se esqueça de respeitar seu tempo. Você merece descansar também.";
    }

    if (texto.includes("oi") || texto.includes("olá")) {
        return "Olá! Que bom ter você aqui. Como está se sentindo hoje?";
    }

    if (texto.includes("obrigado") || texto.includes("obrigada")) {
        return "Por nada! Sempre é importante reconhecer e expressar seus sentimentos.";
    }

    return "Entendi. Quer me contar um pouco mais sobre isso? Estou aqui para ajudar você a organizar seus pensamentos.";
}

function enviarMensagem(texto) {
    texto = texto.trim();

    if (texto === "") return;

    adicionarMensagem(texto, "usuario");
    chatInput.value = "";

    setTimeout(() => {
        adicionarMensagem(gerarResposta(texto), "bot");
    }, 500);
}

chatForm.addEventListener("submit", function(evento) {
    evento.preventDefault();
    enviarMensagem(chatInput.value);
});

// BOTÕES DE SUGESTÕES
document.querySelectorAll("[data-message]").forEach(botao => {
    botao.addEventListener("click", () => {
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
    return JSON.parse(localStorage.getItem(CHAVE_DIARIO)) || [];
}

// MOSTRAR REGISTROS
function mostrarRegistros() {
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

            localStorage.setItem(CHAVE_DIARIO, JSON.stringify(atualizados));
            mostrarRegistros();
        });

        cartao.append(data, emocao, texto, excluir);
        journalEntries.appendChild(cartao);
    });
}

// SALVAR REGISTRO
journalForm.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const texto = journalText.value.trim();

    if (texto === "" || emocaoSelecionada === "") {
        journalFeedback.textContent = "Escolha uma emoção e escreva seu registro.";
        return;
    }

    const registros = obterRegistros();

    registros.push({
        id: Date.now(),
        data: new Date().toLocaleString("pt-BR"),
        emocao: emocaoSelecionada,
        texto: texto
    });

    localStorage.setItem(CHAVE_DIARIO, JSON.stringify(registros));

    journalText.value = "";
    emocaoSelecionada = "";

    document.querySelectorAll("[data-mood]").forEach(botao => {
        botao.classList.remove("selecionado");
    });

    journalFeedback.textContent = "Registro salvo com sucesso!";

    mostrarRegistros();
});

mostrarRegistros();


// ========================================
// DUKA - CHATBOT COM IA NO NAVEGADOR
// Sem chave privada e sem servidor externo
// ========================================

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";

let modeloIA = null;
let carregandoModelo = false;
let historicoConversa = [];

const mensagensChat = document.getElementById("chatMessages");
const formularioChat = document.getElementById("chatForm");
const campoChat = document.getElementById("chatInput");

// Instruções principais do Duka
const instrucoesDuka = `
Você é o Duka, um assistente virtual de acolhimento emocional.
Converse em português brasileiro, com linguagem simples,
respeitosa, acolhedora e natural.

REGRAS:
- Escute sem julgar e responda com empatia.
- Faça perguntas simples quando precisar entender melhor.
- Não diga que é psicólogo ou profissional de saúde.
- Não faça diagnósticos nem indique tratamentos.
- Não prometa sigilo ou confidencialidade.
- Não incentive a pessoa a depender exclusivamente de você.
- Incentive a conversa com familiares, responsáveis,
  professores ou outros adultos de confiança.
- Se a pessoa demonstrar estar em perigo ou precisar
  de ajuda urgente, oriente-a a procurar imediatamente
  um adulto de confiança e os serviços de emergência.
- No Brasil, o SAMU é 192 e o CVV é 188.
- Seja breve, claro e acolhedor.
- Você não substitui acompanhamento profissional.
`;

// ----------------------------------------
// MENU MOBILE
// ----------------------------------------

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
        menu.classList.toggle("ativo");
    });
}

// ----------------------------------------
// MENSAGENS DO CHAT
// ----------------------------------------

function adicionarMensagem(texto, tipo) {
    if (!mensagensChat) return;

    const mensagem = document.createElement("div");
    mensagem.className = `mensagem ${tipo === "user" ? "usuario" : "bot"}`;
    mensagem.textContent = texto;

    mensagensChat.appendChild(mensagem);
    mensagensChat.scrollTop = mensagensChat.scrollHeight;
}

function atualizarStatus(texto) {
    let status = document.getElementById("chatStatus");

    if (!status && mensagensChat) {
        status = document.createElement("p");
        status.id = "chatStatus";
        status.className = "chat-status";
        mensagensChat.parentElement?.appendChild(status);
    }

    if (status) {
        status.textContent = texto;
    }
}

// ----------------------------------------
// CARREGAMENTO DA IA
// ----------------------------------------

async function carregarModelo() {
    if (modeloIA) return modeloIA;

    if (carregandoModelo) {
        while (carregandoModelo) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        if (modeloIA) return modeloIA;
    }

    carregandoModelo = true;
    atualizarStatus("Preparando a inteligência artificial...");

    try {
        const { pipeline, env } = await import(
            "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2"
        );

        env.allowLocalModels = false;
        env.useBrowserCache = true;

        try {
            atualizarStatus("Carregando IA com aceleração gráfica...");

            modeloIA = await pipeline(
                "text-generation",
                MODEL_ID,
                {
                    device: "webgpu",
                    dtype: "q4"
                }
            );
        } catch (erroWebGPU) {
            console.warn("WebGPU indisponível. Tentando modo CPU.", erroWebGPU);

            atualizarStatus("Carregando IA no modo compatível...");

            modeloIA = await pipeline(
                "text-generation",
                MODEL_ID,
                {
                    dtype: "q4"
                }
            );
        }

        atualizarStatus("Duka está pronto para conversar!");
        return modeloIA;

    } catch (erro) {
        console.error("Erro ao carregar IA:", erro);

        atualizarStatus(
            "Não foi possível carregar a IA. Verifique sua internet e tente novamente."
        );

        throw erro;

    } finally {
        carregandoModelo = false;
    }
}

// ----------------------------------------
// VERIFICAÇÃO DE SITUAÇÕES URGENTES
// ----------------------------------------

function verificarSituacaoUrgente(texto) {
    const palavras = [
        "quero me machucar",
        "vou me machucar",
        "quero me matar",
        "não quero mais viver",
        "vou tirar minha vida",
        "estou em perigo",
        "quero acabar com tudo"
    ];

    const mensagem = texto.toLowerCase();

    return palavras.some(palavra => mensagem.includes(palavra));
}

function respostaDeSeguranca() {
    return (
        "Sinto muito que você esteja passando por isso. " +
        "É importante não enfrentar essa situação sozinho. " +
        "Procure agora um adulto de confiança e conte o que está acontecendo. " +
        "Se houver perigo imediato, ligue para o SAMU (192) ou peça ajuda " +
        "a alguém próximo. O CVV (188) também oferece apoio emocional."
    );
}

// ----------------------------------------
// GERAÇÃO DA RESPOSTA
// ----------------------------------------

async function gerarResposta(textoUsuario) {
    if (verificarSituacaoUrgente(textoUsuario)) {
        return respostaDeSeguranca();
    }

    const modelo = await carregarModelo();

    historicoConversa.push({
        role: "user",
        content: textoUsuario
    });

    // Mantém apenas as mensagens mais recentes.
    const mensagensRecentes = historicoConversa.slice(-8);

    const mensagens = [
        {
            role: "system",
            content: instrucoesDuka
        },
        ...mensagensRecentes
    ];

    const prompt = await modelo.tokenizer.apply_chat_template(
        mensagens,
        {
            tokenize: false,
            add_generation_prompt: true
        }
    );

    const resultado = await modelo(prompt, {
        max_new_tokens: 160,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false
    });

    let resposta = resultado[0].generated_text;

    if (typeof resposta !== "string") {
        resposta = String(resposta);
    }

    resposta = resposta.trim();

    if (!resposta) {
        resposta = "Pode me contar um pouco mais sobre o que você está sentindo?";
    }

    historicoConversa.push({
        role: "assistant",
        content: resposta
    });

    return resposta;
}

// ----------------------------------------
// ENVIO DA MENSAGEM
// ----------------------------------------

async function enviarMensagem(texto) {
    const mensagem = texto.trim();

    if (!mensagem) return;

    adicionarMensagem(mensagem, "user");

    if (campoChat) campoChat.value = "";

    if (formularioChat) {
        const botao = formularioChat.querySelector("button[type='submit']");
        if (botao) botao.disabled = true;
    }

    atualizarStatus("Duka está preparando uma resposta...");

    try {
        const resposta = await gerarResposta(mensagem);
        adicionarMensagem(resposta, "bot");
        atualizarStatus("Duka está pronto para conversar!");

    } catch (erro) {
        console.error(erro);

        adicionarMensagem(
            "Não consegui responder agora. Confira sua conexão com a internet e tente novamente.",
            "bot"
        );

        atualizarStatus("Não foi possível carregar a IA.");

    } finally {
        if (formularioChat) {
            const botao = formularioChat.querySelector("button[type='submit']");
            if (botao) botao.disabled = false;
        }

        campoChat?.focus();
    }
}

if (formularioChat && campoChat) {
    formularioChat.addEventListener("submit", evento => {
        evento.preventDefault();
        enviarMensagem(campoChat.value);
    });
}

// ----------------------------------------
// BOTÕES DE SUGESTÕES
// ----------------------------------------

document.querySelectorAll("[data-message]").forEach(botao => {
    botao.addEventListener("click", () => {
        enviarMensagem(botao.dataset.message || "");
    });
});

// ----------------------------------------
// DIÁRIO EMOCIONAL
// ----------------------------------------

const formularioDiario = document.getElementById("journalForm");
const campoDiario = document.getElementById("journalText");
const feedbackDiario = document.getElementById("journalFeedback");
const listaRegistros = document.getElementById("journalEntries");

const CHAVE_DIARIO = "dukaRegistros";

let emocaoSelecionada = "";

document.querySelectorAll("[data-mood]").forEach(botao => {
    botao.addEventListener("click", () => {
        emocaoSelecionada = botao.dataset.mood;

        document.querySelectorAll("[data-mood]").forEach(item => {
            item.classList.remove("selecionado");
        });

        botao.classList.add("selecionado");
    });
});

function obterRegistros() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_DIARIO)) || [];
    } catch {
        return [];
    }
}

function salvarRegistros(registros) {
    localStorage.setItem(CHAVE_DIARIO, JSON.stringify(registros));
}

function mostrarRegistros() {
    if (!listaRegistros) return;

    listaRegistros.replaceChildren();

    const registros = obterRegistros();

    if (registros.length === 0) {
        listaRegistros.textContent = "Seus registros aparecerão aqui.";
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
        excluir.type = "button";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", () => {
            const atualizados = obterRegistros().filter(
                item => item.id !== registro.id
            );

            salvarRegistros(atualizados);
            mostrarRegistros();
        });

        cartao.append(data, emocao, texto, excluir);
        listaRegistros.appendChild(cartao);
    });
}

if (formularioDiario && campoDiario) {
    formularioDiario.addEventListener("submit", evento => {
        evento.preventDefault();

        const texto = campoDiario.value.trim();

        if (!texto || !emocaoSelecionada) {
            if (feedbackDiario) {
                feedbackDiario.textContent =
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

        salvarRegistros(registros);

        campoDiario.value = "";
        emocaoSelecionada = "";

        document.querySelectorAll("[data-mood]").forEach(botao => {
            botao.classList.remove("selecionado");
        });

        if (feedbackDiario) {
            feedbackDiario.textContent = "Registro salvo com sucesso!";
        }

        mostrarRegistros();
    });
}

mostrarRegistros();


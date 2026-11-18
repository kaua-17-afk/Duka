
(function () {
    // Evita inicializar o Duka mais de uma vez
    if (window.dukaInicializado) return;
    window.dukaInicializado = true;

    // =====================================
    // MENU MOBILE
    // =====================================

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

    // =====================================
    // CHATBOT DUKA
    // =====================================

    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");

    let ultimoAssunto = "";
    let ultimaResposta = "";
    let conversaIniciada = false;

    function normalizar(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function contem(texto, palavras) {
        return palavras.some(palavra => {
            return texto.includes(palavra);
        });
    }

    function adicionarMensagem(texto, tipo) {
        if (!chatMessages) return;

        const mensagem = document.createElement("div");
        mensagem.className = `mensagem ${tipo}`;
        mensagem.textContent = texto;

        chatMessages.appendChild(mensagem);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // RESPOSTAS VARIADAS
    const respostas = {
        saudacao: [
            "Olá! Que bom ter você por aqui. Como está se sentindo hoje?",
            "Oi! Como foi seu dia até agora?",
            "Olá! Pode conversar comigo. O que está passando pela sua cabeça?",
            "Oii! Como você está? Quero saber como foi seu dia.",
            "Que bom que veio conversar! Como você está se sentindo?"
        ],

        tristeza: [
            "Sinto muito que esteja passando por isso. Quer me contar o que aconteceu?",
            "Parece que hoje não está sendo um dia fácil. O que mais está pesando para você?",
            "Tudo bem não estar bem o tempo todo. Quer conversar um pouco sobre isso?",
            "Imagino que não seja fácil. Você sabe o que fez você se sentir assim?",
            "Obrigado por compartilhar isso comigo. O que você gostaria que fosse diferente neste momento?",
            "Às vezes, colocar os sentimentos em palavras ajuda a organizar os pensamentos. Quer tentar?"
        ],

        ansiedade: [
            "Entendo. Às vezes, a cabeça fica cheia de preocupações. O que está deixando você ansioso?",
            "Vamos com calma, uma coisa de cada vez. O que mais está preocupando você?",
            "Você sente essa ansiedade por causa de alguma situação específica ou ela aparece sem motivo claro?",
            "Talvez seja bom fazer uma pequena pausa e respirar tranquilamente. Quer me contar o que aconteceu?",
            "Não precisa resolver tudo agora. Qual é a preocupação que mais chama sua atenção?"
        ],

        solidao: [
            "Sentir solidão pode ser difícil. Você sente falta de alguém específico ou de ter companhia?",
            "Mesmo quando existem pessoas por perto, às vezes podemos nos sentir sozinhos. Você consegue explicar um pouco esse sentimento?",
            "Você tem alguém com quem se sente confortável para conversar?",
            "O que costuma ajudar você a se sentir mais conectado com as pessoas?",
            "Obrigado por falar sobre isso. Você sente essa solidão há muito tempo?"
        ],

        estresse: [
            "Parece que muita coisa está acontecendo ao mesmo tempo. O que está exigindo mais de você?",
            "Vamos tentar separar as coisas. Qual problema você gostaria de resolver primeiro?",
            "Você sente que está tendo tempo suficiente para descansar?",
            "Às vezes, uma pausa pode ajudar a organizar as ideias. O que está mais difícil neste momento?",
            "O que poderia tornar seu dia um pouco mais tranquilo?"
        ],

        raiva: [
            "Parece que alguma coisa realmente incomodou você. Quer me contar o que aconteceu?",
            "É válido sentir raiva. O importante é encontrar uma maneira segura de lidar com ela. O que aconteceu?",
            "Você está mais chateado com a situação ou com alguém envolvido nela?",
            "Quer conversar sobre o que causou essa irritação?",
            "O que você gostaria que tivesse acontecido de outra forma?"
        ],

        medo: [
            "Entendo que isso possa assustar você. Quer me contar do que está com medo?",
            "Você sabe o que está causando esse sentimento?",
            "Não precisa falar de tudo de uma vez. Podemos conversar aos poucos.",
            "O que ajudaria você a se sentir mais seguro neste momento?",
            "Você tem alguém de confiança com quem possa conversar sobre isso?"
        ],

        cansaco: [
            "Parece que você está precisando de um descanso. Como foi seu dia?",
            "Você sente mais cansaço físico ou mental?",
            "Às vezes, precisamos respeitar nosso próprio ritmo. Você conseguiu ter algum momento de descanso hoje?",
            "O que mais tem consumido sua energia ultimamente?",
            "Que tal reservar um tempinho para fazer algo tranquilo?"
        ],

        felicidade: [
            "Que notícia boa! O que aconteceu para deixar seu dia melhor?",
            "Adorei saber disso! Quer me contar mais?",
            "Que bom que você está se sentindo assim. O que deixou você feliz?",
            "Momentos positivos também merecem ser valorizados. Como foi essa experiência?",
            "Isso é ótimo! O que você mais gostou nesse momento?"
        ],

        escola: [
            "A escola pode trazer muitos desafios. O que está acontecendo por lá?",
            "É alguma dificuldade com as matérias, provas ou com as pessoas?",
            "Você está se sentindo sobrecarregado com as atividades?",
            "Qual parte da rotina escolar está sendo mais difícil?",
            "Tem alguma coisa na escola que está deixando você preocupado?"
        ],

        amizade: [
            "Amizades podem ser complicadas às vezes. Quer me contar o que aconteceu?",
            "Você sente que essa amizade está fazendo bem para você?",
            "Foi alguma atitude de alguém que deixou você chateado?",
            "Você já conseguiu conversar com essa pessoa sobre o que sente?",
            "O que você gostaria que mudasse nessa amizade?"
        ],

        familia: [
            "A convivência familiar nem sempre é simples. Quer conversar sobre o que aconteceu?",
            "Você sente que está conseguindo expressar o que pensa em casa?",
            "O que mais está incomodando você nessa situação?",
            "Existe alguém da família com quem você se sente confortável para conversar?",
            "Quer me explicar um pouco melhor o que está acontecendo?"
        ],

        futuro: [
            "Pensar no futuro pode trazer muitas dúvidas. O que mais preocupa você?",
            "Você está pensando nos estudos, na carreira ou em outras escolhas?",
            "Não é necessário ter todas as respostas agora. O que você gostaria de descobrir primeiro?",
            "Existe algum objetivo que você gostaria muito de alcançar?",
            "O que você imagina para os próximos anos?"
        ],

        tedio: [
            "Às vezes, tudo parece meio parado mesmo. O que você costuma gostar de fazer?",
            "Quer me contar como está sendo seu dia?",
            "Você está procurando alguma coisa para fazer ou só quer conversar?",
            "Qual foi a última coisa que realmente despertou seu interesse?",
            "Se pudesse escolher uma atividade agora, o que faria?"
        ],

        agradecimento: [
            "Não precisa agradecer! É sempre válido conversar sobre o que sentimos.",
            "Fico contente que a conversa esteja ajudando. Quer falar de mais alguma coisa?",
            "Pode continuar compartilhando seus pensamentos.",
            "Que bom poder ajudar você a organizar suas ideias!"
        ],

        despedida: [
            "Tudo bem! Cuide de você e lembre-se de que pode procurar alguém de confiança quando precisar.",
            "Até mais! Espero que seu dia fique mais tranquilo.",
            "Foi bom conversar com você. Não esqueça de cuidar de si!",
            "Até a próxima! Você não precisa enfrentar tudo sozinho."
        ],

        desconhecido: [
            "Entendi. Pode me contar um pouco mais sobre isso?",
            "Quero entender melhor. O que aconteceu depois?",
            "E como você se sentiu nessa situação?",
            "O que mais passou pela sua cabeça naquele momento?",
            "Você gostaria de conversar sobre o que pode fazer a respeito?",
            "Entendo. Tem alguma parte dessa situação que está incomodando mais?",
            "Pode continuar, estou acompanhando o que você está contando.",
            "O que você acha que seria mais importante resolver agora?",
            "Você já tinha passado por algo parecido antes?",
            "Como você gostaria que essa situação terminasse?"
        ]
    };

    function escolherResposta(lista) {
        let opcoes = lista.filter(resposta => {
            return resposta !== ultimaResposta;
        });

        if (opcoes.length === 0) {
            opcoes = lista;
        }

        const resposta = opcoes[
            Math.floor(Math.random() * opcoes.length)
        ];

        ultimaResposta = resposta;
        return resposta;
    }

    // IDENTIFICA O ASSUNTO
    function identificarAssunto(texto) {
        const mensagem = normalizar(texto);

        // Situações que precisam de atenção especial
        if (
            contem(mensagem, [
                "quero me machucar",
                "quero me ferir",
                "nao quero mais viver",
                "quero desaparecer para sempre"
            ])
        ) {
            return "ajuda";
        }

        // Sentimentos negativos primeiro
        if (
            contem(mensagem, [
                "nao estou bem",
                "nao to bem",
                "nao estou muito bem",
                "estou triste",
                "me sinto triste",
                "estou mal",
                "me sinto mal",
                "decepcionado",
                "decepcionada",
                "desanimado",
                "desanimada",
                "chateado",
                "chateada"
            ])
        ) return "tristeza";

        if (
            contem(mensagem, [
                "ansioso", "ansiosa", "ansiedade",
                "nervoso", "nervosa", "preocupado",
                "preocupada", "panico"
            ])
        ) return "ansiedade";

        if (
            contem(mensagem, [
                "sozinho", "sozinha", "solitario",
                "solitaria", "ninguem me entende",
                "sem amigos", "me sinto isolado"
            ])
        ) return "solidao";

        if (
            contem(mensagem, [
                "estressado", "estressada", "estresse",
                "sobrecarregado", "sobrecarregada",
                "muita coisa", "pressao"
            ])
        ) return "estresse";

        if (
            contem(mensagem, [
                "com raiva", "irritado", "irritada",
                "bravo", "brava", "odio", "me irrita"
            ])
        ) return "raiva";

        if (
            contem(mensagem, [
                "medo", "assustado", "assustada",
                "com receio", "inseguro", "insegura"
            ])
        ) return "medo";

        if (
            contem(mensagem, [
                "cansado", "cansada", "exausto",
                "exausta", "sem energia", "esgotado",
                "esgotada"
            ])
        ) return "cansaco";

        if (
            contem(mensagem, [
                "escola", "prova", "professor",
                "professora", "trabalho escolar",
                "nota", "estudar", "estudos"
            ])
        ) return "escola";

        if (
            contem(mensagem, [
                "amigo", "amiga", "amizade",
                "colega", "namoro", "relacionamento",
                "brigamos", "discuti com"
            ])
        ) return "amizade";

        if (
            contem(mensagem, [
                "familia", "mae", "pai", "irmao",
                "irma", "casa", "meus pais"
            ])
        ) return "familia";

        if (
            contem(mensagem, [
                "futuro", "profissao", "carreira",
                "faculdade", "emprego", "trabalho",
                "nao sei o que fazer da vida"
            ])
        ) return "futuro";

        if (
            contem(mensagem, [
                "entediado", "entediada", "tedio",
                "sem nada para fazer", "sem fazer nada"
            ])
        ) return "tedio";

        if (
            contem(mensagem, [
                "feliz", "muito bem", "estou bem",
                "contente", "animado", "animada",
                "foi um dia bom", "consegui"
            ])
        ) return "felicidade";

        if (
            contem(mensagem, [
                "obrigado", "obrigada", "valeu",
                "agradeco", "agradecer"
            ])
        ) return "agradecimento";

        if (
            contem(mensagem, [
                "tchau", "ate mais", "ate logo",
                "vou sair", "ate depois"
            ])
        ) return "despedida";

        if (
            contem(mensagem, [
                "oi", "ola", "bom dia",
                "boa tarde", "boa noite", "eai"
            ])
        ) return "saudacao";

        return "desconhecido";
    }

    function gerarResposta(texto) {
        const mensagem = normalizar(texto);
        const assunto = identificarAssunto(texto);

        // Respostas de segurança
        if (assunto === "ajuda") {
            return "Sinto muito que você esteja passando por algo tão difícil. Você merece apoio de verdade. Procure agora um adulto de confiança e conte como está se sentindo. Se houver perigo imediato, peça ajuda ao SAMU (192). O CVV (188) também oferece apoio emocional gratuito.";
        }

        // Respostas curtas de continuidade
        if (
            ["sim", "nao", "mais ou menos", "talvez",
             "nao sei", "acho que sim", "acho que nao"].includes(mensagem)
        ) {
            if (ultimoAssunto !== "") {
                const continuacoes = {
                    tristeza: [
                        "Entendi. Você consegue identificar o que mais está deixando você assim?",
                        "Tudo bem. Quer falar sobre o que aconteceu antes de se sentir assim?",
                        "Você gostaria de conversar sobre isso ou prefere pensar em algo que possa ajudar agora?"
                    ],
                    ansiedade: [
                        "Entendi. Qual pensamento está aparecendo com mais frequência?",
                        "Você sente isso mais em algum momento específico do dia?",
                        "Vamos por partes. O que seria mais importante resolver primeiro?"
                    ],
                    solidao: [
                        "Você gostaria de se aproximar de alguém ou sente dificuldade para fazer isso?",
                        "Tem alguma pessoa com quem gostaria de conversar?",
                        "O que costuma fazer você se sentir acolhido?"
                    ],
                    estresse: [
                        "Qual dessas coisas você gostaria de tirar da frente primeiro?",
                        "Existe algo que você possa deixar para depois?",
                        "O que ajudaria a deixar sua rotina um pouco mais leve?"
                    ],
                    amizade: [
                        "Você gostaria de conversar com essa pessoa sobre o assunto?",
                        "O que você gostaria que ela entendesse sobre seus sentimentos?",
                        "Essa situação já aconteceu outras vezes?"
                    ],
                    escola: [
                        "Qual matéria ou atividade está sendo mais complicada?",
                        "Você sente que precisa de mais tempo ou de ajuda para estudar?",
                        "O que poderia facilitar sua rotina escolar?"
                    ]
                };

                const lista = continuacoes[ultimoAssunto];

                if (lista) return escolherResposta(lista);
            }

            return escolherResposta(respostas.desconhecido);
        }

        if (assunto === "desconhecido" && mensagem.length < 5) {
            return escolherResposta(respostas.desconhecido);
        }

        if (assunto === "desconhecido") {
            if (ultimoAssunto === "tristeza") {
                return escolherResposta([
                    "Quero entender melhor o que você está sentindo. Pode continuar.",
                    "E o que aconteceu depois disso?",
                    "Você acha que essa situação tem afetado outras partes do seu dia?"
                ]);
            }

            return escolherResposta(respostas.desconhecido);
        }

        ultimoAssunto = assunto;
        return escolherResposta(respostas[assunto]);
    }

    function enviarMensagem(texto) {
        if (!chatInput || !chatMessages) return;

        texto = texto.trim();
        if (!texto) return;

        adicionarMensagem(texto, "usuario");
        chatInput.value = "";

        if (!conversaIniciada) {
            conversaIniciada = true;
        }

        setTimeout(() => {
            const resposta = gerarResposta(texto);
            adicionarMensagem(resposta, "bot");
        }, 450);
    }

    if (chatForm && chatInput) {
        chatForm.addEventListener("submit", evento => {
            evento.preventDefault();
            enviarMensagem(chatInput.value);
        });
    }

    // BOTÕES DE MENSAGENS PRONTAS
    document.querySelectorAll("[data-message]").forEach(botao => {
        botao.type = "button";

        botao.addEventListener("click", evento => {
            evento.preventDefault();
            enviarMensagem(botao.dataset.message);
        });
    });

    // =====================================
    // DIÁRIO EMOCIONAL
    // =====================================

    const journalForm = document.getElementById("journalForm");
    const journalText = document.getElementById("journalText");
    const journalFeedback = document.getElementById("journalFeedback");
    const journalEntries = document.getElementById("journalEntries");

    let emocaoSelecionada = "";
    const CHAVE_DIARIO = "dukaRegistros";

    // SELECIONAR HUMOR
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
            return JSON.parse(
                localStorage.getItem(CHAVE_DIARIO)
            ) || [];
        } catch {
            return [];
        }
    }

    function mostrarRegistros() {
        if (!journalEntries) return;

        journalEntries.innerHTML = "";

        const registros = obterRegistros();

        if (registros.length === 0) {
            journalEntries.textContent =
                "Seus registros aparecerão aqui.";
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
    if (journalForm && journalText) {
        journalForm.addEventListener("submit", evento => {
            evento.preventDefault();

            const texto = journalText.value.trim();

            if (!texto || !emocaoSelecionada) {
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
                    "Seu registro foi salvo com sucesso!";
            }

            mostrarRegistros();
        });
    }

    mostrarRegistros();

})();


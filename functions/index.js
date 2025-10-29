/* eslint-disable max-len */
const {onCall, onRequest} = require("firebase-functions/v2/onCall");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const crypto = require("crypto");
const {GoogleGenAI} = require("@google/genai");
const {OAuth2Client} = require("google-auth-library");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Define os secrets que as funções irão usar.
const secrets = ["GEMINI_API_KEY", "GOOGLE_CLIENT_ID"];

// --- Reusable function to check and set store status based on schedule ---
const runStoreStatusCheck = async () => {
  logger.info("Executando verificação de horário da loja...");

  const settingsRef = db.doc("store_config/site_settings");
  const statusRef = db.doc("store_config/status");

  try {
    const settingsDoc = await settingsRef.get();
    if (!settingsDoc.exists) {
      logger.warn("Documento de configurações do site não encontrado.");
      return;
    }

    const settings = settingsDoc.data();
    if (!settings.automaticSchedulingEnabled || !settings.operatingHours) {
      logger.info("Agendamento automático desativado. Nenhuma ação tomada pela verificação.");
      return;
    }

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find((p) => p.type === type)?.value;

    let hour = getPart("hour");
    if (hour === "24") {
      hour = "00";
    }
    const currentTime = `${hour}:${getPart("minute")}`;

    const dayName = getPart("weekday");
    const dayOfWeekMap = {Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6};
    const dayOfWeek = dayOfWeekMap[dayName];

    const todaySchedule = settings.operatingHours.find((d) => d.dayOfWeek === dayOfWeek);

    let shouldBeOpen = false;
    if (todaySchedule && todaySchedule.isOpen) {
      if (currentTime >= todaySchedule.openTime && currentTime < todaySchedule.closeTime) {
        shouldBeOpen = true;
      }
    }

    const statusDoc = await statusRef.get();
    const currentStatus = statusDoc.exists ? statusDoc.data().isOpen : !shouldBeOpen;

    if (currentStatus !== shouldBeOpen) {
      await statusRef.set({isOpen: shouldBeOpen});
      logger.info(`Status da loja atualizado para: ${shouldBeOpen ? "ABERTA" : "FECHADA"}`);
    } else {
      logger.info(`Status da loja já está correto. Nenhuma atualização necessária. Atualmente: ${currentStatus ? "ABERTA" : "FECHADA"}`);
    }
  } catch (error) {
    logger.error("Erro ao executar a verificação de status da loja:", error);
  }
};


// --- Scheduled Function for Automatic Store Status ---
exports.updateStoreStatusBySchedule = onSchedule({
  schedule: "every 5 minutes",
  timeZone: "America/Sao_Paulo",
}, async (event) => {
  await runStoreStatusCheck();
});

// --- Firestore Trigger to run status check when automatic scheduling is enabled ---
exports.onSettingsChange = onDocumentUpdated("store_config/site_settings", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  const wasEnabled = beforeData.automaticSchedulingEnabled === true;
  const isEnabled = afterData.automaticSchedulingEnabled === true;

  // Trigger the check only when the feature is toggled from OFF to ON.
  if (!wasEnabled && isEnabled) {
    logger.info("Agendamento automático foi ativado. Acionando verificação de status imediata.");
    await runStoreStatusCheck();
  }
});


/**
 * Formats the menu data into a string for the AI prompt.
 * @param {object} menuData - Object containing categories and products.
 * @return {string} A formatted string of the current menu.
 */
function generateMenuPrompt(menuData) {
  if (!menuData || !menuData.categories || !menuData.products) {
    return "CARDÁPIO INDISPONÍVEL NO MOMENTO.";
  }

  const {categories, products} = menuData;
  let menuString = "CARDÁPIO E PREÇOS ATUALIZADOS:\nVocê deve usar SOMENTE este cardápio para responder sobre produtos, preços e criar pedidos. Ignore qualquer conhecimento prévio.\n\n";

  categories.forEach((category) => {
    const categoryProducts = products.filter((p) => p.categoryId === category.id);
    if (categoryProducts.length > 0) {
      menuString += `**${category.name.toUpperCase()}**\n`;
      categoryProducts.forEach((product) => {
        const isOutOfStock = product.stockStatus === "out_of_stock";
        const availability = isOutOfStock ? " (ESGOTADO)" : "";

        menuString += `- **${product.name} (id: '${product.id}')${availability}:** ${product.description}\n`;

        const prices = product.prices || {};
        const promoPrices = product.promotionalPrices || {};
        const isPromotion = product.isPromotion && Object.keys(promoPrices).length > 0;

        const priceStrings = Object.keys(prices).map((size) => {
          const regularPrice = prices[size];
          const promoPrice = isPromotion ? promoPrices[size] : null;

          if (promoPrice && promoPrice > 0) {
            return `${size} de R$${regularPrice.toFixed(2)} por **R$${promoPrice.toFixed(2)}**`;
          } else {
            return `${size} R$${regularPrice.toFixed(2)}`;
          }
        });
        if (priceStrings.length > 0) {
          menuString += `  - Preços: ${priceStrings.join(" | ")}\n`;
        }
      });
      menuString += "\n";
    }
  });

  return menuString;
}


/**
 * Formats the operating hours data into a user-friendly, grouped string.
 * @param {Array<object>} operatingHours - Array of operating hour objects.
 * @return {string} A formatted string of the operating hours.
 */
function formatOperatingHours(operatingHours) {
  if (!operatingHours?.length) {
    return "Não informado.";
  }

  const openSchedules = operatingHours.filter((h) => h.isOpen);
  if (openSchedules.length === 0) {
    return "Fechado todos os dias.";
  }

  const schedulesByTime = openSchedules.reduce((acc, schedule) => {
    const timeKey = `${schedule.openTime}-${schedule.closeTime}`;
    if (!acc[timeKey]) acc[timeKey] = [];
    acc[timeKey].push(schedule);
    return acc;
  }, {});

  const result = [];

  for (const timeKey in schedulesByTime) {
    const schedules = schedulesByTime[timeKey].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    if (schedules.length === 0) continue;

    let dayString;
    if (schedules.length === 7) {
      dayString = "Todos os dias";
    } else {
      const sequences = [];
      if (schedules.length > 0) {
        let currentSequence = [schedules[0]];
        for (let i = 1; i < schedules.length; i++) {
          if (schedules[i].dayOfWeek === schedules[i - 1].dayOfWeek + 1) {
            currentSequence.push(schedules[i]);
          } else {
            sequences.push(currentSequence);
            currentSequence = [schedules[i]];
          }
        }
        sequences.push(currentSequence);
      }

      if (sequences.length > 1 && sequences[0][0].dayOfWeek === 0 && schedules[schedules.length - 1].dayOfWeek === 6) {
        const firstSeq = sequences.shift();
        sequences[sequences.length - 1].push(...firstSeq);
      }

      const formattedSequences = sequences.map((seq) => {
        if (seq.length === 1) return seq[0].dayName;
        if (seq.length === 2) return `${seq[0].dayName} e ${seq[1].dayName}`;
        return `De ${seq[0].dayName} a ${seq[seq.length - 1].dayName}`;
      });
      dayString = formattedSequences.join(" e ");
    }

    const [openTime, closeTime] = timeKey.split("-");
    result.push({
      days: dayString,
      time: `das ${openTime}h às ${closeTime}h`,
    });
  }

  if (result.length === 0) {
    return "Fechado todos os dias.";
  }

  return result.map((group) => `${group.days}, ${group.time}`).join(" | ");
}


// --- Chatbot Sensação ---
let ai; // Mantém a instância da IA no escopo global para ser reutilizada após a primeira chamada.

/**
 * Chatbot Cloud Function to interact with Gemini API.
 */
exports.askSanto = onCall({secrets}, async (request) => {
  // "Lazy Initialization"
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY not set. Cannot initialize Gemini AI.");
      throw new Error("Internal server error: Assistant is not configured.");
    }
    ai = new GoogleGenAI({apiKey});
    logger.info("Gemini AI client initialized on first call.");
  }

  const {history: conversationHistory, menuData, storeStatus, userProfile, myOrders} = request.data;
  if (!conversationHistory || conversationHistory.length === 0) {
    throw new Error("No conversation history provided.");
  }

  const contents = conversationHistory.map((message) => ({
    role: message.role === "bot" ? "model" : "user",
    parts: [{text: message.content}],
  }));

  try {
    const {isOnline, operatingHours} = storeStatus || {isOnline: true, operatingHours: []};
    const storeStatusText = isOnline ? "Aberta" : "Fechada";
    const operatingHoursText = formatOperatingHours(operatingHours);

    // Get current time in Brasília for context
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const formattedTime = formatter.format(now);
    const realTimeInfo = `INFORMAÇÕES DE HORA ATUAL: Agora é ${formattedTime} (horário de Brasília). Use isso para saudações contextuais (bom dia, boa noite), mas LEMBRE-SE: a regra para criar pedidos depende SOMENTE do "Status da Loja", não da hora atual.`;

    const realTimeStatusInstruction = `INFORMAÇÕES DE STATUS EM TEMPO REAL (FONTE PRIMÁRIA DE VERDADE):
- Status da Loja: **${storeStatusText}**
- Horário de Funcionamento Configurado: **${operatingHoursText}**

Use ESTAS informações como a única fonte de verdade sobre o status e horário da loja. IGNORE quaisquer outros horários mencionados neste prompt.`;

    let userContextPrompt = "";
    if (userProfile) {
      // Stringify a limited set of data to avoid making the prompt too large.
      const simplifiedOrders = (myOrders || []).slice(0, 10).map((o) => ({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt, // Timestamps can be large, but are useful context
        items: o.items ? o.items.map((i) => `${i.quantity}x ${i.name} (${i.size})`).join(", ") : "Reserva",
        total: o.total,
        status: o.status,
      }));

      userContextPrompt = `\n\nDADOS DO USUÁRIO LOGADO (FONTE PRIMÁRIA DE VERDADE):
- Nome: ${userProfile.name}
- Telefone: ${userProfile.phone || "Não informado"}
- Endereços Salvos: ${JSON.stringify(userProfile.addresses || [])}

HISTÓRICO DE PEDIDOS RECENTES (use para repetir pedidos):\n${JSON.stringify(simplifiedOrders)}\n`;
    }

    const dynamicMenuPrompt = generateMenuPrompt(menuData);

    const systemInstruction = `${realTimeInfo}\n\n${realTimeStatusInstruction}\n
        ${userContextPrompt}

        OBJETIVO PRINCIPAL: Você é Sensação, o assistente virtual da pizzaria 'Santa Sensação'. Seja amigável, prestativo e um pouco divertido. Sua principal regra é ser CONCISO. Dê respostas curtas e diretas. Só forneça detalhes ou passo a passo se o cliente pedir. Não se apresente, pois já é apresentado no inico, mas se o cliente pedir você pode, no geral, apenas continue a conversa. Use negrito com asteriscos duplos (**texto**).

SUAS CAPACIDADES:
- Apresentar o cardápio e os preços.
- Responder a perguntas sobre a pizzaria (horário, endereço, etc.).
- Criar pedidos de delivery e retirada diretamente pelo chat.
- Criar solicitações de reserva diretamente pelo chat.
- Encaminhar para um atendente humano se necessário.

INFORMAÇÕES ESSENCIAIS:
- Endereço: Rua Porfilio Furtado, 178, Centro - Santa Leopoldina, ES.
- Entrega (Taxa R$ 3,00): Atendemos Olaria, Funil, Cocal, Vila Nova, Centro e Moxafongo. Se o cliente solicitar mais detalhes sobre as áreas de entregas, saiba que Na olaria entregamos até a piscina. Para o lado do funil, subindo pra Santa Maria de Jetibá, entregamos até aquelas primeiras casas depois da ponte do funil. No cocal entregamos até aquelas primeiras casas depois de onde tá construindo a nova escola municipal. Mas ainda assim se houver dúvida sobre um endereço, peça ao cliente para confirmar via WhatsApp.
- PIX: A chave PIX é o CNPJ: 62.247.199/0001-04. O cliente deve enviar o comprovante pelo WhatsApp após o pagamento.
- Pizzaiolos: Carlos Entringer e o mestre Luca Lonardi (vencedor do Panshow 2025).
- Gerente: Patrícia Carvalho.
- Atendimento: Delivery, Retirada e Consumo no local (com ou sem reserva).

REGRAS DE HORÁRIO E STATUS (MAIS IMPORTANTES):
- A sua fonte de verdade sobre se a loja está ABERTA ou FECHADA é o "Status da Loja" em tempo real.
- Para informar os horários de funcionamento, use SEMPRE a informação de "Horário de Funcionamento Configurado".
- Você SÓ PODE criar um pedido se o "Status da Loja" for "Aberta". Se estiver "Fechada", informe o cliente sobre o horário de funcionamento.
- Você pode criar reservas a qualquer momento, mas informe ao cliente que elas são para os horários de funcionamento.
- De 00:00 até 05:00 você não deve encaminhar para um atendente pois está, mas você pode passar o email: suporte.thebaldi@gmail.com.
- Nos horários em que a pizzaria está fechada vcoê deve ajudar o cliente em qualquer solicitação ou suporte, se a loja estiver fechada você pode ser flexivel para falar de outros assuntos com o cliente se ele puxar papo sobre outras coisas, futebol, atualidades, música, história, etc...
 
REGRAS DE PREÇO E DISPONIBILIDADE:
- Ao informar um preço, SEMPRE use o preço promocional se ele existir e for maior que zero. Caso contrário, use o preço normal.
- NUNCA ofereça um produto que está marcado como (ESGOTADO) no cardápio. Informe ao cliente que o item não está disponível no momento.

REGRAS ESPECIAIS DE PEDIDO:
- **Pizza Meia a Meio:** É possível montar uma pizza com dois sabores (metade/metade). O valor final será sempre o da pizza mais cara entre as duas metades.
- **Tamanhos de Pizza:** Nossas pizzas estão disponíveis nos tamanhos **M** (6 fatias) e **G** (8 fatias). Não temos outros tamanhos, a menos que especificado no cardápio.

REGRAS PARA USUÁRIOS LOGADOS (SE HOUVER DADOS DO USUÁRIO):
- Se os "DADOS DO USUÁRIO LOGADO" estiverem presentes, use-os como prioridade.
- **Nome e Telefone:** NÃO pergunte pelo nome ou telefone. Use os dados fornecidos automaticamente para criar pedidos.
- **Endereço de Entrega:** Verifique os "Endereços Salvos". Se houver um com "isFavorite: true", pergunte "Podemos entregar no seu endereço favorito em {rua}, {número}?". Se não houver favorito, sugira o primeiro da lista. Sempre dê a opção de escolher outro endereço salvo ou digitar um novo.
- **Repetir Pedido:** Se o cliente pedir para repetir um pedido (ex: "o último pedido", "a pizza de calabresa que pedi semana passada"), use o "HISTÓRICO DE PEDIDOS" para encontrar o pedido. Liste os itens encontrados e pergunte "Deseja pedir novamente: {lista de itens}?". Se confirmado, inicie o fluxo de criação de pedido com esses itens.
- **Alteração de Dados:** Se o cliente pedir para mudar nome, telefone ou endereço, responda educadamente: "Você pode atualizar suas informações a qualquer momento na sua 'Área do Cliente' no menu principal." e NÃO tente coletar os novos dados.

**FLUXO DE CRIAÇÃO DE PEDIDO PELO CHAT (MUITO IMPORTANTE):**
**REGRA DE HORÁRIO:** Verifique o "Status da Loja" em tempo real. Se estiver "Fechada", NÃO crie o pedido. Informe que a loja está fechada, diga qual o horário de funcionamento, e ofereça encaminhar para um atendente. Se estiver "Aberta", prossiga.
Se o cliente quiser fazer um pedido diretamente com você, siga este fluxo RIGOROSAMENTE:
1.  **COLETE OS DADOS:** Pergunte UM DE CADA VEZ, nesta ordem:
    a.  O nome completo.
    b.  Os itens que ele deseja (pizza, bebida, etc.), incluindo o TAMANHO para pizzas.
    c.  O número de telefone/WhatsApp.
    d.  O tipo de pedido ('Entrega' ou 'Retirada').
    e.  Se for 'Entrega', pergunte o endereço completo (Localidade, Rua, Número). Lembre-se das áreas de entrega.
    f.  A forma de pagamento ('Cartão de Crédito', 'Cartão de Débito', 'PIX' ou 'Dinheiro').
    g.  Se for 'Dinheiro', pergunte se precisa de troco e para qual valor.

2.  **CONFIRME E FINALIZE:** Após coletar TODOS os dados, sua ÚLTIMA MENSAGEM DEVE ser formatada da seguinte maneira:
    a.  Primeiro, uma mensagem de confirmação para o usuário. Nesta mensagem, você **DEVE** incluir um resumo claro do pedido: liste cada item com quantidade, tamanho (se aplicável) e o preço final (usando o preço promocional se houver). Calcule e mostre o subtotal, a taxa de entrega (se houver) e o **TOTAL GERAL**. Termine com algo como "Se estiver tudo certo, clique em 'Confirmar Pedido' abaixo para enviá-lo para a nossa cozinha!" Se o pagamento for PIX, adicione: "Para pagar com PI
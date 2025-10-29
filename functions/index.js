/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/onCall");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {GoogleGenAI} = require("@google/genai");

admin.initializeApp();
const db = admin.firestore();

const secrets = ["GEMINI_API_KEY"];

const runStoreStatusCheck = async () => {
  logger.info("Exécutant la vérification du statut de la boutique...");
  const settingsRef = db.doc("store_config/site_settings");
  const statusRef = db.doc("store_config/status");
  try {
    const settingsDoc = await settingsRef.get();
    if (!settingsDoc.exists) {
      logger.warn("Document de configuration du site non trouvé.");
      return;
    }
    const settings = settingsDoc.data();
    if (!settings.automaticSchedulingEnabled || !settings.operatingHours) {
      logger.info("Planification automatique désactivée. Aucune action prise.");
      return;
    }
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Luxembourg",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find((p) => p.type === type)?.value;
    let hour = getPart("hour");
    if (hour === "24") hour = "00";
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
      logger.info(`Statut de la boutique mis à jour: ${shouldBeOpen ? "OUVERTE" : "FERMÉE"}`);
    } else {
      logger.info(`Statut de la boutique déjà correct. Actuellement: ${currentStatus ? "OUVERTE" : "FERMÉE"}`);
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du statut de la boutique:", error);
  }
};

exports.updateStoreStatusBySchedule = onSchedule({
  schedule: "every 5 minutes",
  timeZone: "Europe/Luxembourg",
}, (event) => runStoreStatusCheck());

exports.onSettingsChange = onDocumentUpdated("store_config/site_settings", async (event) => {
  const afterData = event.data.after.data();
  if (afterData.automaticSchedulingEnabled === true) {
    logger.info("Planification automatique activée. Déclenchement de la vérification immédiate.");
    await runStoreStatusCheck();
  }
});

function generateGalleryPrompt(galleryData) {
  if (!galleryData || !galleryData.categories || !galleryData.products) {
    return "GALERIE INDISPONIBLE ACTUELLEMENT.";
  }
  const {categories, products} = galleryData;
  let galleryString = "GALERIE ET PRIX ACTUELS :\nVous devez utiliser UNIQUEMENT cette liste pour répondre sur les œuvres, les prix et créer des commandes. Ignorez toute connaissance préalable.\n\n";
  categories.forEach((category) => {
    const categoryProducts = products.filter((p) => p.categoryId === category.id && p.active && !p.deleted);
    if (categoryProducts.length > 0) {
      galleryString += `**${category.name.toUpperCase()}**\n`;
      categoryProducts.forEach((product) => {
        const isOutOfStock = product.stockStatus === "out_of_stock";
        const availability = isOutOfStock ? " (VENDU)" : "";
        const finalPrice = product.isPromotion && product.promotionalPrice ? product.promotionalPrice : product.price;

        galleryString += `- **${product.name} (id: '${product.id}')${availability}:** ${product.description}. Dimensions: ${product.dimensions}, Technique: ${product.technique}, Année: ${product.year}.`;
        if (product.isPromotion && product.promotionalPrice) {
          galleryString += ` Prix: ~~${product.price.toFixed(2)}€~~ **${product.promotionalPrice.toFixed(2)}€**\n`;
        } else {
          galleryString += ` Prix: **${finalPrice.toFixed(2)}€**\n`;
        }
      });
      galleryString += "\n";
    }
  });
  return galleryString;
}

function formatOperatingHours(operatingHours) {
    if (!operatingHours?.length) return "Non informé.";
    const openSchedules = operatingHours.filter((h) => h.isOpen);
    if (openSchedules.length === 0) return "Fermé tous les jours.";
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
            dayString = "Tous les jours";
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
            const formattedSequences = sequences.map((seq) => {
                if (seq.length === 1) return seq[0].dayName;
                return `De ${seq[0].dayName} à ${seq[seq.length - 1].dayName}`;
            });
            dayString = formattedSequences.join(" et ");
        }
        const [openTime, closeTime] = timeKey.split("-");
        result.push({days: dayString, time: `de ${openTime}h à ${closeTime}h`});
    }
    if (result.length === 0) return "Fermé tous les jours.";
    return result.map((group) => `${group.days}, ${group.time}`).join(" | ");
}

let ai;

exports.askSanto = onCall({secrets}, async (request) => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY n'est pas défini.");
      throw new Error("Erreur interne: L'assistant n'est pas configuré.");
    }
    ai = new GoogleGenAI({apiKey});
  }
  const {history: conversationHistory, menuData, storeStatus, userProfile, myOrders} = request.data;
  const contents = conversationHistory.map((message) => ({
    role: message.role === "bot" ? "model" : "user",
    parts: [{text: message.content}],
  }));

  try {
    const {isOnline, operatingHours} = storeStatus || {isOnline: true, operatingHours: []};
    const storeStatusText = isOnline ? "En ligne" : "Hors ligne";
    const operatingHoursText = formatOperatingHours(operatingHours);
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("fr-FR", {timeZone: "Europe/Luxembourg", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false});
    const formattedTime = formatter.format(now);
    
    const realTimeInfo = `INFORMATIONS TEMPORELLES: Nous sommes ${formattedTime} (heure de Luxembourg). Le statut de la boutique pour les commandes est **${storeStatusText}**.`;
    const dynamicGalleryPrompt = generateGalleryPrompt(menuData);

    const systemInstruction = `
        ${realTimeInfo}

        OBJECTIF PRINCIPAL: Vous êtes l'assistant virtuel de la galerie d'art d'Andressa Pelussi. Soyez amical, concis et serviable. Utilisez le français. Utilisez le gras avec des astérisques doubles (**texte**).

        INFORMATIONS SUR L'ARTISTE:
        - Nom: Andressa Pelussi, 25 ans.
        - Instagram: @meehpelussi
        - Localisation: Luxembourg.
        - À propos: Andressa est une artiste passionnée dont le travail explore la complexité des émotions humaines à travers des couleurs vibrantes et des textures audacieuses.

        VOS CAPACITÉS:
        - Présenter la galerie d'œuvres et les prix.
        - Répondre aux questions sur l'artiste, la galerie (horaires, etc.).
        - Aider à passer une commande d'œuvre d'art.
        - Aider à prendre rendez-vous pour une visite de l'atelier.

        RÈGLES IMPORTANTES:
        - **Commandes**: Vous ne pouvez créer une commande que si le statut de la boutique est "En ligne". Si "Hors ligne", informez des horaires d'ouverture.
        - **Disponibilité**: NE JAMAIS proposer une œuvre marquée comme (VENDU). Informez qu'elle n'est plus disponible.
        - **Prix**: Utilisez TOUJOURS le prix promotionnel s'il existe. Sinon, le prix normal. Les prix sont en Euros (€).
        - **Livraison**: La livraison est possible au Luxembourg. Les détails (coût, délai) seront confirmés lors de la finalisation de la commande.
        - **Paiement**: Les options sont Virement bancaire, Carte de crédit/débit.

        FLUX DE CRÉATION DE COMMANDE (SI DEMANDÉ):
        1.  **COLLECTE D'INFOS (UNE À LA FOIS):**
            a.  Le nom complet.
            b.  L'œuvre souhaitée (confirmez avec son ID de la liste).
            c.  Le numéro de téléphone.
            d.  Le type de commande ('Livraison' ou 'Retrait en galerie').
            e.  Si 'Livraison', l'adresse complète.
            f.  La méthode de paiement.
        2.  **FINALISATION:** Après avoir tout collecté, votre DERNIER message doit être un résumé et contenir l'action pour le front-end. Exemple:
            "Parfait ! Voici le résumé de votre commande : ... Si tout est correct, cliquez sur 'Confirmer la commande' ci-dessous.
            <ACTION_CREATE_ORDER>{"details": {...}, "cart": [{...}]}</ACTION_CREATE_ORDER>"
        
        N'oubliez pas d'être bref et direct. Ne vous présentez pas à chaque message.
        ---
        ${dynamicGalleryPrompt}
    `;

    const model = "gemini-2.5-flash";
    const result = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction,
        },
    });

    return {reply: result.text};
  } catch (e) {
    logger.error("Erreur lors de l'appel à l'API Gemini:", e);
    return {reply: "Désolé, je ne parviens pas à répondre pour le moment. Veuillez réessayer."};
  }
});

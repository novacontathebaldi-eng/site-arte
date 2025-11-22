'use server';

interface BrevoStats {
  subscribers: number;
  clients: number;
  campaigns: number;
}

export async function getBrevoStats(): Promise<BrevoStats> {
  const apiKey = process.env.BREVO_API_KEY;
  const newsletterListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : 2;
  const clientListId = process.env.BREVO_WELCOME_LIST_ID ? Number(process.env.BREVO_WELCOME_LIST_ID) : 7;

  if (!apiKey) return { subscribers: 0, clients: 0, campaigns: 0 };

  try {
    const headers = { 'accept': 'application/json', 'api-key': apiKey };

    // Fetch Newsletter List Stats
    const listRes = await fetch(`https://api.brevo.com/v3/contacts/lists/${newsletterListId}`, { headers });
    const listData = await listRes.json();

    // Fetch Client List Stats
    const clientListRes = await fetch(`https://api.brevo.com/v3/contacts/lists/${clientListId}`, { headers });
    const clientListData = await clientListRes.json();

    return {
        subscribers: listData.uniqueSubscribers || 0,
        clients: clientListData.uniqueSubscribers || 0,
        campaigns: 12 // Mock or fetch real campaign count if needed
    };
  } catch (error) {
    console.error("Brevo Stats Error:", error);
    return { subscribers: 0, clients: 0, campaigns: 0 };
  }
}

export async function logAudit(action: string, details: string, userEmail: string) {
    // In a real scenario, write to a secure collection via Admin SDK
    console.log(`AUDIT [${new Date().toISOString()}] ${userEmail}: ${action} - ${details}`);
}

'use server'

const BREVO_API_KEY = "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";
const LIST_ID = 5;

interface NewsletterState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
  };
}

export async function subscribeToNewsletter(prevState: any, formData: FormData): Promise<NewsletterState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Validação básica server-side
  if (!name || name.length < 2) {
    return { success: false, message: "Please enter a valid name." };
  }
  if (!email || !email.includes('@')) {
    return { success: false, message: "Please enter a valid email address." };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        listIds: [LIST_ID],
        attributes: {
          NOME: name
        },
        updateEnabled: true // Atualiza se o contato já existir, evitando erros 400 de duplicidade
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      
      // Se o erro for algo diferente de usuário já existente (que updateEnabled deve cobrir), retornamos erro
      if (errorData.code !== 'duplicate_parameter') {
         return { success: false, message: "Unable to subscribe at this moment. Please try again." };
      }
    }

    return { success: true, message: `Welcome to the circle, ${name.split(' ')[0]}.` };

  } catch (error) {
    console.error("Newsletter Action Error:", error);
    return { success: false, message: "Network error. Please try again later." };
  }
}

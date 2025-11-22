'use server';

interface NewsletterState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
  };
}

export async function subscribeToNewsletter(prevState: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Validação Básica
  if (!name || name.length < 2) {
    return { success: false, message: 'Invalid name' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Invalid email' };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : 2; // Fallback para lista 2 se não definido

  if (!apiKey) {
    console.error('BREVO_API_KEY is missing');
    return { success: false, message: 'Service unavailable' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          NOME: name,
          FIRSTNAME: name.split(' ')[0] // Tenta extrair o primeiro nome
        },
        listIds: [listId],
        updateEnabled: true // Se já existir, atualiza os dados
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Tratamento de erro específico do Brevo
      if (data.code === 'duplicate_parameter') {
        return { success: true, message: 'already_subscribed' }; // Consideramos sucesso para UX, mas avisamos
      }
      throw new Error(data.message || 'Failed to subscribe');
    }

    return { success: true, message: 'success' };

  } catch (error) {
    console.error('Brevo Error:', error);
    return { success: false, message: 'generic_error' };
  }
}
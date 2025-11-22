'use server';

interface RegisterState {
  success: boolean;
  message?: string;
}

export async function registerClientToBrevo(email: string, name: string): Promise<RegisterState> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_WELCOME_LIST_ID ? Number(process.env.BREVO_WELCOME_LIST_ID) : 7; // Default to 7 for new clients

  if (!apiKey) {
    console.error('BREVO_API_KEY is missing');
    return { success: false, message: 'Configuration Error' };
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
          FIRSTNAME: name.split(' ')[0],
          ROLE: 'CLIENT'
        },
        listIds: [listId],
        updateEnabled: true
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.warn('Brevo Warning:', data);
      // Se duplicado, não é erro crítico
      if (data.code === 'duplicate_parameter') {
        return { success: true, message: 'Already registered' }; 
      }
      return { success: false, message: 'API Error' };
    }

    return { success: true };

  } catch (error) {
    console.error('Brevo Registration Error:', error);
    return { success: false, message: 'Network Error' };
  }
}
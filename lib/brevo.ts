// Brevo Email Configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_FROM_EMAIL = "suporte.thebaldi@gmail.com";
const BREVO_FROM_NAME = "Suporte Pelussi";

export const sendEmail = async (to: { email: string; name: string }, subject: string, htmlContent: string) => {
    if (!BREVO_API_KEY) {
        const errorMessage = "Brevo API Key is not configured. Please set BREVO_API_KEY in your environment variables.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
                to: [to],
                subject,
                htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Brevo API error: ${errorData.message || 'Unknown Error'}`);
        }
        
        return await response.json();

    } catch (error) {
        console.error("Failed to send email via Brevo:", error);
        throw error;
    }
};
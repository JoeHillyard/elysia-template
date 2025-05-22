import { Elysia } from 'elysia';
import { Resend } from 'resend';

type ResendOptions = {
	apiKey: string;
	defaultFrom?: string;
};

type ResendEmailData = {
	to: string | string[];
	from?: string;
	subject: string;
	text?: string;
	html?: string;
	attachments?: Array<{
		filename: string;
		content: Buffer | string;
		path?: string;
		contentType?: string;
	}>;
	cc?: string | string[];
	bcc?: string | string[];
	reply_to?: string;
	tags?: Array<{
		name: string;
		value: string;
	}>;
};

export const resendPlugin = ({ apiKey, defaultFrom }: ResendOptions) => {
	// Initialize Resend client
	const resend = new Resend(apiKey);

	return new Elysia()
		.decorate('sendEmail', async (emailData: ResendEmailData) => {
			try {
				// Add default from address if provided and not already in the email data
				const emailToSend = {
					...emailData,
					from: emailData.from || defaultFrom
				};

				// Ensure from address is set
				if (!emailToSend.from) {
					throw new Error('From address is required. Set it in the email data or as a default in plugin options.');
				}

				// Send the email
				const response = await resend.emails.send(emailToSend);

				if (response.error) {
					return {
						success: false,
						error: response.error.message,
					};
				}

				return {
					success: true,
					id: response.data?.id,
				};
			} catch (error) {
				console.error('Error sending email via Resend:', error);
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
				};
			}
		})
		.derive(({ sendEmail }) => {
			return {
				resend: {
					send: sendEmail
				}
			};
		});
};
import { Elysia } from 'elysia';
import sendgrid from '@sendgrid/mail';

type SendGridOptions = {
	apiKey: string;
	defaultFrom?: string;
};

type EmailData = {
	to: string | string[];
	from?: string;
	subject: string;
	text?: string;
	html?: string;
	attachments?: Array<{
		content: string;
		filename: string;
		type?: string;
		disposition?: 'attachment' | 'inline';
		contentId?: string;
	}>;
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string;
};

export const sendgridAdapter = ({ apiKey, defaultFrom }: SendGridOptions) => {
	// Initialize SendGrid with API key
	sendgrid.setApiKey(apiKey);

	return new Elysia()
		.decorate('sendEmail', async (emailData: EmailData) => {
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
				const response = await sendgrid.send(emailToSend);
				return {
					success: true,
					statusCode: response[0].statusCode,
					messageId: response[0].headers['x-message-id'],
				};
			} catch (error) {
				console.error('Error sending email via SendGrid:', error);
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error occurred',
				};
			}
		})
		.derive(({ sendEmail }) => {
			return {
				sendgrid: {
					send: sendEmail
				}
			};
		});
};
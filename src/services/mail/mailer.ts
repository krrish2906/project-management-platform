import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';
import { EmailTemplate } from './templates/EmailTemplate';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    template: 'welcome' | 'reset-password' | 'notification' | 'custom' | 'otp' | 'invite';
    data: {
        name?: string;
        title?: string;
        message?: string;
        buttonText?: string;
        buttonUrl?: string;
        [key: string]: any;
    };
    from?: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

transporter.verify((error: Error | null) => {
    if (error) {
        console.error('Error with email configuration:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

export async function sendEmail(options: EmailOptions) {
    try {
        const { to, subject, template, data, from } = options;

        const emailComponent = React.createElement(EmailTemplate, { 
            template, 
            data: {
                ...data,
                name: data.name || 'User',
                title: data.title || subject,
                message: data.message || '',
                buttonText: data.buttonText || 'Click Here',
                buttonUrl: data.buttonUrl || '#'
            } 
        });

        const emailHtml = await render(emailComponent, {
            pretty: true
        });

        const mailOptions = {
            from: from || process.env.EMAIL_FROM || 'OmniSync <noreply@omnisync.com>',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html: emailHtml,
            text: data.message || subject,
            headers: {
                'X-Laziness-level': '1000',
            },
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

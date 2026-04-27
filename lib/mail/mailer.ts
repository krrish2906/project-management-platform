import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';
import { EmailTemplate } from './templates/EmailTemplate';

/* Types */
export interface EmailOptions {
    to: string | string[];
    subject: string;
    template: 'welcome' | 'reset-password' | 'notification' | 'custom';
    data: {
        // Common fields that can be used across different templates
        name?: string;
        title?: string;
        message?: string;
        buttonText?: string;
        buttonUrl?: string;
        // Add any additional fields that your templates might need
        [key: string]: any;
    };
    from?: string;
}

/* Create a transporter using environment variables */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

/* Verify connection configuration */
transporter.verify((error: Error | null) => {
    if (error) {
        console.error('Error with email configuration:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

/*
   Send an email using the specified template
   @param options Email options including recipient, subject, template, and data
   @returns Promise with the result of the email sending operation
*/
export async function sendEmail(options: EmailOptions) {
    try {
        const { to, subject, template, data, from } = options;

        // Create the email template component
        const emailComponent = React.createElement(EmailTemplate, { 
            template, 
            data: {
                ...data,
                // Ensure required fields have default values
                name: data.name || 'User',
                title: data.title || subject,
                message: data.message || '',
                buttonText: data.buttonText || 'Click Here',
                buttonUrl: data.buttonUrl || '#'
            } 
        });

        // Render the email to HTML
        const emailHtml = await render(emailComponent, {
            pretty: true
        });

        // Setup email data
        const mailOptions = {
            from: from || process.env.EMAIL_FROM || 'ProjectHub <noreply@projecthub.com>',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html: emailHtml,
            text: data.message || subject, // Fallback to subject if no message
            headers: {
                'X-Laziness-level': '1000', // Just for testing
            },
        };

        // console.log('Sending email with options:', {
        //     to: mailOptions.to,
        //     subject: mailOptions.subject,
        //     from: mailOptions.from
        // });

        // Send email
        const info = await transporter.sendMail(mailOptions);
        // console.log('Message sent successfully:', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
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

/* Example usage:
async function exampleUsage() {
    const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Welcome to Our App!',
        template: 'welcome',
        data: {
            name: 'John Doe',
            message: 'Thank you for signing up!',
            buttonText: 'Get Started',
            buttonUrl: 'https://yourapp.com/dashboard',
        },
    });
    console.log('Email sent:', result);
}
*/

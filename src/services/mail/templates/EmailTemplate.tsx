import React from 'react';
import { Html, Head, Body, Container, Section, Text, Button } from '@react-email/components';

const baseStyles = `
    /* Base styles */
    body {
        margin: 0;
        padding: 0;
        background-color: #f7fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2d3748;
        line-height: 1.6;
    }

    /* Container */
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 0 20px;
    }

    /* Card */
    .email-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        overflow: hidden;
        margin: 20px 0;
    }

    /* Header */
    .email-header {
        background: #4f46e5;
        padding: 24px 32px;
        text-align: center;
        border-radius: 12px 12px 0 0;
    }

    .logo {
        max-width: 160px;
        height: auto;
        margin-bottom: 16px;
    }

    h1 {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 8px;
        line-height: 1.3;
    }

    .subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-weight: 400;
    }

    /* Content */
    .email-content {
        padding: 32px;
    }

    .greeting {
        font-size: 16px;
        color: #4a5568;
        margin: 0 0 24px;
    }

    p {
        margin: 0 0 20px;
        font-size: 15px;
        color: #4a5568;
        line-height: 1.7;
    }

    /* Button */
    .button-container {
        margin: 32px 0;
        text-align: center;
    }

    .button {
        display: inline-block;
        background: #4f46e5;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 15px;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
    }

    .button:hover {
        background: #4338ca;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
    }

    /* Footer */
    .email-footer {
        padding: 24px 32px;
        background: #f8fafc;
        border-top: 1px solid #edf2f7;
        border-radius: 0 0 12px 12px;
    }

    .footer-text {
        font-size: 14px;
        color: #718096;
        margin: 0 0 16px;
        text-align: center;
        line-height: 1.5;
    }

    .footer-links {
        text-align: center;
        margin: 20px 0;
    }

    .footer-link {
        display: inline-block;
        color: #4f46e5;
        text-decoration: none;
        font-size: 14px;
        margin: 0 12px;
    }

    .footer-small {
        font-size: 12px;
        color: #a0aec0;
        margin: 20px 0 0;
        text-align: center;
        line-height: 1.5;
    }

    /* Responsive */
    @media screen and (max-width: 600px) {
        .container {
            width: 100% !important;
            padding: 0 16px;
        }
        
        .email-content, 
        .email-header,
        .email-footer {
            padding: 24px 20px;
        }
        
        h1 {
            font-size: 22px;
        }
        
        .button {
            width: 100%;
            padding: 16px;
        }
    }
`;

interface EmailTemplateProps {
    template: 'welcome' | 'reset-password' | 'notification' | 'custom';
    data: {
        name?: string;
        title?: string;
        message?: string;
        buttonText?: string;
        buttonUrl?: string;
        [key: string]: any;
    };
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    template,
    data = {},
}) => {
    const {
        name = 'User',
        title = '',
        message = '',
        buttonText = '',
        buttonUrl = '#',
        ...rest
    } = data;

    const getTemplateContent = () => {
        switch (template) {
            case 'welcome':
                return {
                    title: title || 'Welcome to Our App!',
                    message: message || 'Thank you for joining us. We\'re excited to have you on board!',
                    buttonText: buttonText || 'Get Started',
                };
            case 'reset-password':
                return {
                    title: title || 'Reset Your Password',
                    message: message || 'You requested to reset your password. Click the button below to set a new password.',
                    buttonText: buttonText || 'Reset Password',
                };
            case 'notification':
                return {
                    title: title || 'Notification',
                    message: message || 'You have a new notification.',
                    buttonText: buttonText || 'View Notification',
                };
            default:
                return {
                    title: title || '',
                    message: message || '',
                    buttonText: buttonText || '',
                };
        }
    };

    const { title: templateTitle, message: templateMessage, buttonText: templateButtonText } = getTemplateContent();

    return (
        <Html>
            <Head>
                <style>{baseStyles}</style>
            </Head>
            <Body>
                <div className="container">
                    <div className="email-card">
                        <div className="email-header">
                            <h1>{templateTitle}</h1>
                            <p className="subtitle">
                                {template === 'welcome' ? 'Welcome to Project Hub' : 
                                 template === 'reset-password' ? 'Secure your account' : 
                                 'Important notification'}
                            </p>
                        </div>
                        
                        <div className="email-content">
                            <p className="greeting">Hello {name},</p>
                            <p>{templateMessage}</p>
                            
                            {buttonUrl && buttonUrl !== '#' && (
                                <div className="button-container">
                                    <a href={buttonUrl} className="button">
                                        {templateButtonText}
                                    </a>
                                </div>
                            )}
                            
                            {(template === 'reset-password' || template === 'notification') && (
                                <p style={{color: '#718096', fontSize: '14px', marginTop: '24px'}}>
                                    <strong>Note:</strong> This link will expire in 24 hours for security reasons.
                                </p>
                            )}
                            
                            <p style={{marginTop: '32px'}}>
                                Best regards,<br />
                                <strong>The Project Hub Team</strong>
                            </p>
                        </div>
                        
                        <div className="email-footer">
                            <div className="footer-links">
                                <a href="#" className="footer-link">Help Center</a>
                                <a href="#" className="footer-link">Contact Support</a>
                                <a href="#" className="footer-link">Privacy Policy</a>
                            </div>
                            <p className="footer-text">
                                © {new Date().getFullYear()} Project Hub. All rights reserved.<br />
                                123 Business Street, Tech City, 10001
                            </p>
                            <p className="footer-small">
                                If you didn't request this email, you can safely ignore it.<br />
                                This is an automated message, please do not reply directly.
                            </p>
                        </div>
                    </div>
                </div>
            </Body>
        </Html>
    );
};

export default EmailTemplate;

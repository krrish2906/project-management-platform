import React from 'react';
import { Html, Head, Body } from '@react-email/components';

const baseStyles = `
    body {
        margin: 0;
        padding: 0;
        background-color: #f8fafc;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        line-height: 1.6;
    }
    .container {
        max-width: 580px;
        margin: 0 auto;
        padding: 24px 16px;
    }
    .email-card {
        background: #ffffff;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        overflow: hidden;
    }
    .email-header {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        padding: 36px 32px;
        text-align: center;
        color: #ffffff;
    }
    .brand-logo {
        display: inline-block;
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        line-height: 44px;
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 12px;
    }
    h1 {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 6px;
        letter-spacing: -0.02em;
    }
    .subtitle {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.85);
        margin: 0;
    }
    .email-content {
        padding: 32px;
    }
    .greeting {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 16px;
    }
    p {
        margin: 0 0 20px;
        font-size: 15px;
        color: #475569;
        line-height: 1.6;
    }
    .otp-box {
        background: #f1f5f9;
        border: 2px dashed #4f46e5;
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        margin: 24px 0;
    }
    .otp-code {
        font-family: 'SF Mono', 'Courier New', monospace;
        font-size: 32px;
        font-weight: 800;
        color: #4f46e5;
        letter-spacing: 8px;
    }
    .button-container {
        margin: 28px 0;
        text-align: center;
    }
    .button {
        display: inline-block;
        background: #4f46e5;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }
    .email-footer {
        padding: 24px 32px;
        background: #f8fafc;
        border-top: 1px solid #f1f5f9;
        text-align: center;
    }
    .footer-text {
        font-size: 12px;
        color: #94a3b8;
        margin: 0;
    }
`;

interface EmailTemplateProps {
    template: 'welcome' | 'reset-password' | 'notification' | 'custom' | 'otp' | 'invite';
    data: {
        name?: string;
        title?: string;
        message?: string;
        buttonText?: string;
        buttonUrl?: string;
        otp?: string;
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
        otp,
    } = data;

    return (
        <Html>
            <Head>
                <style>{baseStyles}</style>
            </Head>
            <Body>
                <div className="container">
                    <div className="email-card">
                        <div className="email-header">
                            <div className="brand-logo">O</div>
                            <h1>{title || 'OmniSync Workspace'}</h1>
                            <p className="subtitle">
                                {template === 'welcome' ? 'Welcome to your engineering platform' :
                                 template === 'reset-password' ? 'Account Security Verification' :
                                 template === 'otp' ? 'Email Address Verification' :
                                 template === 'invite' ? 'Workspace Team Invitation' : 'Workspace Notification'}
                            </p>
                        </div>
                        
                        <div className="email-content">
                            <p className="greeting">Hello {name},</p>
                            <p>{message}</p>
                            
                            {otp && (
                                <div className="otp-box">
                                    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Your One-Time Verification Code</p>
                                    <div className="otp-code">{otp}</div>
                                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#94a3b8' }}>Valid for 10 minutes. Do not share this code with anyone.</p>
                                </div>
                            )}

                            {buttonUrl && buttonUrl !== '#' && (
                                <div className="button-container">
                                    <a href={buttonUrl} className="button">
                                        {buttonText || 'Accept Invitation'}
                                    </a>
                                </div>
                            )}
                            
                            <p style={{ marginTop: '32px', color: '#64748b', fontSize: '14px' }}>
                                Best regards,<br />
                                <strong>The OmniSync Team</strong>
                            </p>
                        </div>
                        
                        <div className="email-footer">
                            <p className="footer-text">
                                © {new Date().getFullYear()} OmniSync Platform Inc. All rights reserved.<br />
                                This is an automated transactional message.
                            </p>
                        </div>
                    </div>
                </div>
            </Body>
        </Html>
    );
};

export default EmailTemplate;

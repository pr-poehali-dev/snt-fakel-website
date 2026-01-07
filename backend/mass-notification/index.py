import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    '''Массовая отправка email уведомлений участникам СНТ'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        recipients = body.get('recipients', [])
        subject = body.get('subject', '')
        message = body.get('message', '')
        
        if not recipients or not subject or not message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields: recipients, subject, message'})
            }
        
        smtp_host = os.environ.get('YANDEX_SMTP_HOST')
        smtp_port = int(os.environ.get('YANDEX_SMTP_PORT', '465'))
        smtp_user = os.environ.get('YANDEX_SMTP_USER')
        smtp_password = os.environ.get('YANDEX_SMTP_PASS')
        from_email = os.environ.get('YANDEX_SMTP_FROM')
        
        if not all([smtp_host, smtp_user, smtp_password, from_email]):
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'SMTP configuration incomplete'})
            }
        
        sent_count = 0
        failed_count = 0
        errors = []
        
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
        
        with server:
            server.login(smtp_user, smtp_password)
            
            for recipient in recipients:
                try:
                    email = recipient.get('email')
                    first_name = recipient.get('firstName', '')
                    last_name = recipient.get('lastName', '')
                    plot_number = recipient.get('plotNumber', '')
                    
                    if not email:
                        failed_count += 1
                        continue
                    
                    personalized_message = f"""Уважаемый(ая) {first_name} {last_name}!

{message}

---
Участок №{plot_number}
СНТ "Факел", Нижний Новгород
"""
                    
                    msg = MIMEMultipart('alternative')
                    msg['Subject'] = subject
                    msg['From'] = from_email
                    msg['To'] = email
                    
                    text_part = MIMEText(personalized_message, 'plain', 'utf-8')
                    msg.attach(text_part)
                    
                    html_message = f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <p>Уважаемый(ая) <strong>{first_name} {last_name}</strong>!</p>
                        <div style="white-space: pre-line; line-height: 1.6;">
                            {message}
                        </div>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 14px;">
                            Участок №{plot_number}<br>
                            СНТ "Факел", Нижний Новгород
                        </p>
                    </div>
                    """
                    
                    html_part = MIMEText(html_message, 'html', 'utf-8')
                    msg.attach(html_part)
                    
                    server.send_message(msg)
                    sent_count += 1
                    
                except Exception as e:
                    failed_count += 1
                    errors.append({
                        'email': recipient.get('email', 'unknown'),
                        'error': str(e)
                    })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'sent': sent_count,
                'failed': failed_count,
                'errors': errors if errors else None
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
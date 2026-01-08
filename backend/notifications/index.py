import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Универсальная функция отправки уведомлений (массовая рассылка + уведомления админа)'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        notification_type = body.get('type', 'mass')
        
        smtp_host = os.environ.get('YANDEX_SMTP_HOST')
        smtp_port = int(os.environ.get('YANDEX_SMTP_PORT', '465'))
        smtp_user = os.environ.get('YANDEX_SMTP_USER')
        smtp_password = os.environ.get('YANDEX_SMTP_PASS')
        from_email = os.environ.get('YANDEX_SMTP_FROM')
        
        if not all([smtp_host, smtp_user, smtp_password, from_email]):
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'SMTP configuration incomplete'}),
                'isBase64Encoded': False
            }
        
        if notification_type == 'admin_registration':
            return handle_admin_notification(body, smtp_host, smtp_port, smtp_user, smtp_password, from_email)
        elif notification_type == 'mass':
            return handle_mass_notification(body, smtp_host, smtp_port, smtp_user, smtp_password, from_email)
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid notification type'}),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handle_admin_notification(body: dict, smtp_host: str, smtp_port: int, smtp_user: str, smtp_password: str, from_email: str):
    '''Отправка уведомления администратору о новой регистрации'''
    user_data = body.get('user_data', {})
    
    if not user_data:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing user_data'}),
            'isBase64Encoded': False
        }
    
    admin_email = os.environ.get('ADMIN_EMAIL')
    if not admin_email:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ADMIN_EMAIL not configured'}),
            'isBase64Encoded': False
        }
    
    registered_at = user_data.get('registeredAt', '')
    try:
        reg_date = datetime.fromisoformat(registered_at.replace('Z', '+00:00'))
        formatted_date = reg_date.strftime('%d.%m.%Y %H:%M')
    except:
        formatted_date = registered_at
    
    birth_date = user_data.get('birthDate', '')
    try:
        birth = datetime.fromisoformat(birth_date)
        formatted_birth = birth.strftime('%d.%m.%Y')
    except:
        formatted_birth = birth_date
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Новая регистрация в СНТ "Факел"</h2>
        <p>Зарегистрирован новый пользователь:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>ФИО:</strong> {user_data.get('lastName', '')} {user_data.get('firstName', '')} {user_data.get('middleName', '')}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {user_data.get('email', '')}</p>
            <p style="margin: 5px 0;"><strong>Телефон:</strong> {user_data.get('phone', '')}</p>
            <p style="margin: 5px 0;"><strong>Участок:</strong> №{user_data.get('plotNumber', '')}</p>
            <p style="margin: 5px 0;"><strong>Дата рождения:</strong> {formatted_birth}</p>
            <p style="margin: 5px 0;"><strong>Дата регистрации:</strong> {formatted_date}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Для управления пользователями перейдите в раздел "Управление ролями" в личном кабинете.</p>
    </div>
    """
    
    text_content = f"""
Новая регистрация в СНТ "Факел"

ФИО: {user_data.get('lastName', '')} {user_data.get('firstName', '')} {user_data.get('middleName', '')}
Email: {user_data.get('email', '')}
Телефон: {user_data.get('phone', '')}
Участок: №{user_data.get('plotNumber', '')}
Дата рождения: {formatted_birth}
Дата регистрации: {formatted_date}
    """
    
    subject = f"Новая регистрация: {user_data.get('lastName', '')} {user_data.get('firstName', '')}"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = admin_email
    
    msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))
    
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'success': True, 'message': 'Admin notified'}),
        'isBase64Encoded': False
    }

def handle_mass_notification(body: dict, smtp_host: str, smtp_port: int, smtp_user: str, smtp_password: str, from_email: str):
    '''Массовая отправка email уведомлений участникам СНТ'''
    recipients = body.get('recipients', [])
    subject = body.get('subject', '')
    message = body.get('message', '')
    
    if not recipients or not subject or not message:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields: recipients, subject, message'}),
            'isBase64Encoded': False
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
        }),
        'isBase64Encoded': False
    }

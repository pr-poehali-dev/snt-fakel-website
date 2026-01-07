import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Отправка уведомления администратору о новой регистрации'''
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
        user_data = body.get('user_data', {})
        
        if not user_data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing user_data'})
            }
        
        smtp_host = os.environ.get('YANDEX_SMTP_HOST')
        smtp_port = int(os.environ.get('YANDEX_SMTP_PORT', '465'))
        smtp_user = os.environ.get('YANDEX_SMTP_USER')
        smtp_password = os.environ.get('YANDEX_SMTP_PASSWORD')
        from_email = os.environ.get('YANDEX_SMTP_FROM')
        admin_email = os.environ.get('ADMIN_EMAIL')
        
        if not all([smtp_host, smtp_user, smtp_password, from_email, admin_email]):
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Configuration incomplete'})
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
        
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part2)
        
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
            'body': json.dumps({'success': True, 'message': 'Admin notified'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
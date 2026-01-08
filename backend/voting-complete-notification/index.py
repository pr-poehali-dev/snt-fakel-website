import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: dict, context) -> dict:
    '''Отправка email-уведомлений всем пользователям о завершении голосования'''
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body = json.loads(event.get('body', '{}'))
    voting_title = body.get('votingTitle', 'Голосование')
    voting_id = body.get('votingId')
    results = body.get('results', [])
    users = body.get('users', [])
    
    if not voting_id or not users:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'})
        }
    
    # Настройки SMTP
    smtp_host = os.environ.get('YANDEX_SMTP_HOST')
    smtp_port = int(os.environ.get('YANDEX_SMTP_PORT', 465))
    smtp_user = os.environ.get('YANDEX_SMTP_USER')
    smtp_pass = os.environ.get('YANDEX_SMTP_PASSWORD') or os.environ.get('YANDEX_SMTP_PASS')
    from_email = os.environ.get('YANDEX_SMTP_FROM')
    
    if not all([smtp_host, smtp_user, smtp_pass, from_email]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email configuration missing'})
        }
    
    # Формируем результаты для письма
    results_html = '<ul style="list-style: none; padding: 0;">'
    for result in results:
        results_html += f'''
        <li style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <strong>{result['option']}</strong>: {result['votes']} голосов ({result['percentage']}%)
        </li>
        '''
    results_html += '</ul>'
    
    sent_count = 0
    failed_count = 0
    
    for user in users:
        email = user.get('email')
        if not email:
            continue
        
        # Создаем HTML письмо
        html_content = f'''
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }}
                .footer {{ background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🗳️ Голосование завершено</h1>
                </div>
                <div class="content">
                    <p>Уважаемый(ая) {user.get('firstName', '')} {user.get('lastName', '')},</p>
                    <p>Голосование "<strong>{voting_title}</strong>" завершено.</p>
                    <h3>Результаты голосования:</h3>
                    {results_html}
                    <p>Всего участников: <strong>{len(users)}</strong></p>
                    <p style="margin-top: 30px;">
                        <a href="https://{event.get('requestContext', {}).get('domainName', 'sntfakel.ru')}" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            Перейти на сайт СНТ
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>СНТ "Факел" | Это автоматическое уведомление</p>
                </div>
            </div>
        </body>
        </html>
        '''
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'Завершено голосование: {voting_title}'
            msg['From'] = from_email
            msg['To'] = email
            
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            
            sent_count += 1
        except Exception as e:
            print(f'Failed to send email to {email}: {str(e)}')
            failed_count += 1
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'sent': sent_count,
            'failed': failed_count,
            'message': f'Отправлено {sent_count} уведомлений'
        })
    }

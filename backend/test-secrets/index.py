import json
import os

def handler(event: dict, context) -> dict:
    '''Проверка настроек SMTP секретов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    secrets_status = {
        'YANDEX_SMTP_HOST': {
            'exists': bool(os.environ.get('YANDEX_SMTP_HOST')),
            'value': os.environ.get('YANDEX_SMTP_HOST', 'NOT SET')
        },
        'YANDEX_SMTP_PORT': {
            'exists': bool(os.environ.get('YANDEX_SMTP_PORT')),
            'value': os.environ.get('YANDEX_SMTP_PORT', 'NOT SET')
        },
        'YANDEX_SMTP_USER': {
            'exists': bool(os.environ.get('YANDEX_SMTP_USER')),
            'value': os.environ.get('YANDEX_SMTP_USER', 'NOT SET')
        },
        'YANDEX_SMTP_PASS': {
            'exists': bool(os.environ.get('YANDEX_SMTP_PASS')),
            'value': 'HIDDEN' if os.environ.get('YANDEX_SMTP_PASS') else 'NOT SET',
            'length': len(os.environ.get('YANDEX_SMTP_PASS', ''))
        },
        'YANDEX_SMTP_FROM': {
            'exists': bool(os.environ.get('YANDEX_SMTP_FROM')),
            'value': os.environ.get('YANDEX_SMTP_FROM', 'NOT SET')
        }
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(secrets_status, ensure_ascii=False, indent=2)
    }

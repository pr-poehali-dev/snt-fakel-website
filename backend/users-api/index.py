import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import secrets
from datetime import datetime, timedelta
import pytz

# Force redeploy to fix network issues

def send_role_change_notification(email: str, full_name: str, old_role: str, new_role: str):
    '''Отправка уведомления о смене роли'''
    role_names = {
        'admin': 'Администратор',
        'chairman': 'Председатель',
        'board_member': 'Член правления',
        'member': 'Член СНТ',
        'guest': 'Гость'
    }
    
    old_role_name = role_names.get(old_role, old_role)
    new_role_name = role_names.get(new_role, new_role)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #f97316;">🔔 Изменение роли в СНТ Факел</h2>
            <p>Здравствуйте, {full_name}!</p>
            <p>Ваша роль в системе СНТ Факел была изменена.</p>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Предыдущая роль:</strong> {old_role_name}</p>
                <p><strong>Новая роль:</strong> {new_role_name}</p>
            </div>
            <p>Если у вас есть вопросы, пожалуйста, свяжитесь с администрацией.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">СНТ Факел - Система управления садовым товариществом</p>
        </div>
    </body>
    </html>
    """
    
    try:
        response = requests.post(
            'https://functions.poehali.dev/2672fb97-4151-4228-bb1c-4d0b3a502216',
            json={
                'to_email': email,
                'subject': 'Изменение роли в СНТ Факел',
                'html_content': html_content,
                'text_content': f'Ваша роль изменена с "{old_role_name}" на "{new_role_name}"'
            },
            timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        print(f'Error sending role change notification: {e}')
        return False

def handler(event: dict, context) -> dict:
    '''API для управления пользователями'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Database configuration missing'}),
                'isBase64Encoded': False
            }
        
        # Подключение к БД с таймаутом
        conn = psycopg2.connect(dsn, connect_timeout=5)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            action = query_params.get('action') if query_params else None
            
            if action == 'chat_messages':
                cur.execute('''
                    SELECT id, user_email, user_name, user_role, avatar, 
                           message_text, created_at, is_removed, removed_by
                    FROM chat_messages
                    ORDER BY created_at ASC
                ''')
                rows = cur.fetchall()
                
                moscow_tz = pytz.timezone('Europe/Moscow')
                messages = []
                for row in rows:
                    timestamp_utc = row['created_at']
                    if timestamp_utc:
                        if timestamp_utc.tzinfo is None:
                            timestamp_utc = pytz.utc.localize(timestamp_utc)
                        timestamp_moscow = timestamp_utc.astimezone(moscow_tz)
                        timestamp_str = timestamp_moscow.isoformat()
                    else:
                        timestamp_str = ''
                    
                    messages.append({
                        'id': row['id'],
                        'userEmail': row['user_email'],
                        'userName': row['user_name'],
                        'userRole': row['user_role'],
                        'avatar': row['avatar'],
                        'text': row['message_text'],
                        'timestamp': timestamp_str,
                        'deleted': row['is_removed'],
                        'deletedBy': row['removed_by']
                    })
                
                # Получить список заблокированных
                cur.execute('SELECT email, blocked_by, blocked_at, block_reason FROM blocked_chat_users')
                blocked_rows = cur.fetchall()
                
                blocked = []
                for row in blocked_rows:
                    blocked.append({
                        'email': row['email'],
                        'blockedBy': row['blocked_by'],
                        'blockedAt': row['blocked_at'].isoformat() if row['blocked_at'] else '',
                        'reason': row['block_reason']
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'messages': messages, 'blocked': blocked}),
                    'isBase64Encoded': False
                }
            
            if action == 'login':
                email = query_params.get('email')
                password = query_params.get('password')
                
                if not email or not password:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email and password required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT id, email, first_name, last_name, role, password, owner_is_same, plot_number
                    FROM users 
                    WHERE email = %s AND status = 'active'
                """, (email,))
                user = cur.fetchone()
                
                cur.close()
                conn.close()
                
                if user and user['password'] == password:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'success': True,
                            'user': {
                                'id': user['id'],
                                'email': user['email'],
                                'first_name': user['first_name'],
                                'last_name': user['last_name'],
                                'role': user['role'],
                                'owner_is_same': user['owner_is_same'],
                                'plot_number': user['plot_number']
                            }
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Invalid email or password'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute("""
                SELECT id, email, first_name, last_name, middle_name, phone, 
                       plot_number, birth_date, role, status, owner_is_same,
                       owner_first_name, owner_last_name, owner_middle_name,
                       land_doc_number, house_doc_number, email_verified, 
                       phone_verified, payment_status, registered_at
                FROM users 
                WHERE status = 'active'
                ORDER BY last_name, first_name
            """)
            users = cur.fetchall()
            
            users_list = []
            for user in users:
                user_dict = dict(user)
                if user_dict.get('birth_date'):
                    user_dict['birth_date'] = user_dict['birth_date'].isoformat()
                if user_dict.get('registered_at'):
                    user_dict['registered_at'] = user_dict['registered_at'].isoformat()
                users_list.append(user_dict)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'users': users_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                email = body.get('email')
                password = body.get('password')
                
                if not email or not password:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email and password required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT id, email, first_name, last_name, role, password, owner_is_same
                    FROM users 
                    WHERE email = %s AND status = 'active'
                """, (email,))
                user = cur.fetchone()
                
                cur.close()
                conn.close()
                
                if user and user['password'] == password:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'success': True,
                            'user': {
                                'id': user['id'],
                                'email': user['email'],
                                'first_name': user['first_name'],
                                'last_name': user['last_name'],
                                'role': user['role'],
                                'owner_is_same': user['owner_is_same']
                            }
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Invalid email or password'}),
                        'isBase64Encoded': False
                    }
            
            if action == 'request_password_reset':
                email = body.get('email')
                
                if not email:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email required'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем, существует ли пользователь
                cur.execute("SELECT id, first_name, last_name FROM users WHERE email = %s AND status = 'active'", (email,))
                user = cur.fetchone()
                
                if not user:
                    cur.close()
                    conn.close()
                    # Не раскрываем существование пользователя
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'message': 'If user exists, reset link will be sent'}),
                        'isBase64Encoded': False
                    }
                
                # Генерируем безопасный токен
                token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(hours=1)
                
                # Сохраняем токен в БД
                cur.execute('''
                    INSERT INTO password_reset_tokens (email, token, expires_at)
                    VALUES (%s, %s, %s)
                ''', (email, token, expires_at))
                conn.commit()
                
                # Формируем ссылку для восстановления
                reset_link = f"https://preview--snt-fakel-website.poehali.dev/reset-password?token={token}"
                
                # Отправляем email
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                        <h2 style="color: #f97316;">🔑 Восстановление пароля - СНТ Факел</h2>
                        <p>Здравствуйте, {user['first_name']} {user['last_name']}!</p>
                        <p>Вы запросили восстановление пароля для входа в личный кабинет СНТ Факел.</p>
                        <p>Для сброса пароля перейдите по ссылке:</p>
                        <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Восстановить пароль</a>
                        <p style="color: #666; font-size: 14px;">Ссылка действительна в течение 1 часа.</p>
                        <p style="color: #666; font-size: 14px;">Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888;">СНТ Факел - Система управления садовым товариществом</p>
                    </div>
                </body>
                </html>
                """
                
                try:
                    requests.post(
                        'https://functions.poehali.dev/2672fb97-4151-4228-bb1c-4d0b3a502216',
                        json={
                            'to_email': email,
                            'subject': 'Восстановление пароля - СНТ Факел',
                            'html_content': html_content,
                            'text_content': f'Восстановление пароля. Перейдите по ссылке: {reset_link}. Ссылка действительна в течение 1 часа.'
                        },
                        timeout=10
                    )
                except Exception as e:
                    print(f'Error sending password reset email: {e}')
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Password reset link sent'}),
                    'isBase64Encoded': False
                }
            
            if action == 'reset_password':
                token = body.get('token')
                new_password = body.get('password')
                
                if not token or not new_password:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Token and password required'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем токен
                cur.execute('''
                    SELECT email, expires_at, used FROM password_reset_tokens
                    WHERE token = %s
                ''', (token,))
                token_data = cur.fetchone()
                
                if not token_data:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Invalid or expired token'}),
                        'isBase64Encoded': False
                    }
                
                if token_data['used']:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Token already used'}),
                        'isBase64Encoded': False
                    }
                
                if datetime.now() > token_data['expires_at']:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Token expired'}),
                        'isBase64Encoded': False
                    }
                
                # Обновляем пароль
                cur.execute('''
                    UPDATE users
                    SET password = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE email = %s AND status = 'active'
                ''', (new_password, token_data['email']))
                
                # Помечаем токен как использованный
                cur.execute('''
                    UPDATE password_reset_tokens
                    SET used = TRUE, used_at = CURRENT_TIMESTAMP
                    WHERE token = %s
                ''', (token,))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'message': 'Password updated successfully'}),
                    'isBase64Encoded': False
                }
            
            if action == 'bulk_import':
                users_data = body.get('users', [])
                
                if not users_data:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'No users data provided'}),
                        'isBase64Encoded': False
                    }
                
                imported_count = 0
                errors = []
                
                for user_data in users_data:
                    try:
                        # Проверяем, не существует ли уже пользователь с таким email
                        cur.execute("SELECT id FROM users WHERE email = %s", (user_data['email'],))
                        existing = cur.fetchone()
                        
                        if existing:
                            errors.append(f"Email {user_data['email']} уже существует")
                            continue
                        
                        # Вставляем нового пользователя
                        cur.execute("""
                            INSERT INTO users (
                                email, password, first_name, last_name, middle_name, phone,
                                plot_number, birth_date, role, status, owner_is_same,
                                owner_first_name, owner_last_name, owner_middle_name,
                                land_doc_number, house_doc_number, email_verified, phone_verified,
                                payment_status, registered_at
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                            )
                        """, (
                            user_data['email'],
                            user_data['password'],
                            user_data['firstName'],
                            user_data['lastName'],
                            user_data.get('middleName', ''),
                            user_data['phone'],
                            user_data['plotNumber'],
                            user_data['birthDate'],
                            'member',  # По умолчанию все импортированные - члены СНТ
                            'active',  # Сразу активные
                            user_data.get('ownerIsSame', True),
                            user_data.get('ownerFirstName'),
                            user_data.get('ownerLastName'),
                            user_data.get('ownerMiddleName'),
                            user_data.get('landDocNumber'),
                            user_data.get('houseDocNumber'),
                            True,  # Email подтверждён
                            False,
                            'unpaid',
                            datetime.now().isoformat()
                        ))
                        
                        imported_count += 1
                        
                    except Exception as e:
                        errors.append(f"Ошибка импорта {user_data.get('email', 'unknown')}: {str(e)}")
                        continue
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'imported': imported_count,
                        'errors': errors if errors else []
                    }),
                    'isBase64Encoded': False
                }
            
            if action == 'send_message':
                # Отправить новое сообщение в чат
                cur.execute('''
                    INSERT INTO chat_messages 
                    (user_email, user_name, user_role, avatar, message_text)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, created_at
                ''', (
                    body['userEmail'],
                    body['userName'],
                    body['userRole'],
                    body['avatar'],
                    body['text']
                ))
                
                row = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': row['id'],
                        'timestamp': row['created_at'].strftime('%H:%M') if row['created_at'] else ''
                    }),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO users (
                    email, password, first_name, last_name, middle_name, phone,
                    plot_number, birth_date, role, status, owner_is_same,
                    owner_first_name, owner_last_name, owner_middle_name,
                    land_doc_number, house_doc_number, email_verified, phone_verified,
                    payment_status, registered_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                RETURNING id
            """, (
                body.get('email'),
                body.get('password'),
                body.get('firstName'),
                body.get('lastName'),
                body.get('middleName', ''),
                body.get('phone'),
                body.get('plotNumber'),
                body.get('birthDate'),
                body.get('role', 'member'),
                body.get('status', 'active'),
                body.get('ownerIsSame', True),
                body.get('ownerFirstName'),
                body.get('ownerLastName'),
                body.get('ownerMiddleName'),
                body.get('landDocNumber'),
                body.get('houseDocNumber'),
                body.get('emailVerified', False),
                body.get('phoneVerified', False),
                body.get('paymentStatus', 'unpaid'),
                body.get('registeredAt')
            ))
            
            new_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'id': new_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'delete_message':
                # Удалить сообщение в чате
                cur.execute('''
                    UPDATE chat_messages 
                    SET is_removed = TRUE, removed_by = %s
                    WHERE id = %s
                ''', (body['deletedBy'], body['messageId']))
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'block_user':
                # Заблокировать пользователя
                cur.execute('''
                    INSERT INTO blocked_chat_users (email, blocked_by, block_reason)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (email) DO UPDATE SET blocked_by = %s, block_reason = %s
                ''', (body['email'], body['blockedBy'], body.get('reason', ''), body['blockedBy'], body.get('reason', '')))
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            if action == 'update_online_status':
                email = body.get('email')
                if not email:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    INSERT INTO online_users (email, last_seen)
                    VALUES (%s, CURRENT_TIMESTAMP)
                    ON CONFLICT (email) DO UPDATE SET last_seen = CURRENT_TIMESTAMP
                ''', (email,))
                conn.commit()
                
                cur.execute('''
                    DELETE FROM online_users 
                    WHERE last_seen < CURRENT_TIMESTAMP - INTERVAL '2 minutes'
                ''')
                conn.commit()
                
                cur.execute('''
                    SELECT u.email, u.first_name, u.last_name, u.plot_number, u.role, o.last_seen
                    FROM online_users o
                    JOIN users u ON o.email = u.email
                    WHERE o.last_seen >= CURRENT_TIMESTAMP - INTERVAL '2 minutes'
                    ORDER BY o.last_seen DESC
                ''')
                rows = cur.fetchall()
                
                moscow_tz = pytz.timezone('Europe/Moscow')
                online_users = []
                for row in rows:
                    last_seen_utc = row['last_seen']
                    if last_seen_utc:
                        if last_seen_utc.tzinfo is None:
                            last_seen_utc = pytz.utc.localize(last_seen_utc)
                        last_seen_moscow = last_seen_utc.astimezone(moscow_tz)
                        last_seen_str = last_seen_moscow.isoformat()
                    else:
                        last_seen_str = ''
                    
                    online_users.append({
                        'email': row['email'],
                        'first_name': row['first_name'],
                        'last_name': row['last_name'],
                        'plot_number': row['plot_number'],
                        'role': row['role'],
                        'last_seen': last_seen_str
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'onlineUsers': online_users}),
                    'isBase64Encoded': False
                }
            
            if action == 'unblock_user':
                # Разблокировать пользователя - удаляем запись из таблицы
                cur.execute('DELETE FROM blocked_chat_users WHERE email = %s', (body['email'],))
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            user_id = body.get('id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'User ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT email, first_name, last_name, role
                FROM users 
                WHERE id = %s
            """, (user_id,))
            old_user_data = cur.fetchone()
            old_role = old_user_data['role'] if old_user_data else None
            
            cur.execute("""
                UPDATE users 
                SET role = %s, payment_status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (body.get('role'), body.get('paymentStatus'), user_id))
            
            conn.commit()
            
            new_role = body.get('role')
            if old_role and new_role and old_role != new_role and old_user_data:
                send_role_change_notification(
                    old_user_data['email'],
                    f"{old_user_data['first_name']} {old_user_data['last_name']}",
                    old_role,
                    new_role
                )
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'User ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE users 
                SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (user_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
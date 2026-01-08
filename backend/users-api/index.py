import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

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
                # Получить все сообщения чата
                cur.execute('''
                    SELECT id, user_email, user_name, user_role, avatar, 
                           message_text, created_at, is_removed, removed_by
                    FROM chat_messages
                    ORDER BY created_at ASC
                ''')
                rows = cur.fetchall()
                
                messages = []
                for row in rows:
                    messages.append({
                        'id': row['id'],
                        'userEmail': row['user_email'],
                        'userName': row['user_name'],
                        'userRole': row['user_role'],
                        'avatar': row['avatar'],
                        'text': row['message_text'],
                        'timestamp': row['created_at'].strftime('%H:%M') if row['created_at'] else '',
                        'deleted': row['is_removed'],
                        'deletedBy': row['removed_by']
                    })
                
                # Получить список заблокированных
                cur.execute('SELECT email, blocked_by, blocked_at, block_reason FROM blocked_chat_users WHERE blocked_by IS NOT NULL')
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
                    SELECT id, email, first_name, last_name, role, password
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
                                'role': user['role']
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
            
            if action == 'unblock_user':
                # Разблокировать пользователя
                cur.execute('UPDATE blocked_chat_users SET blocked_by = NULL WHERE email = %s', (body['email'],))
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
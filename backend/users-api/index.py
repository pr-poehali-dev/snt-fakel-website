import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления пользователями'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action')
            
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
            user_id = body.get('id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'User ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE users 
                SET role = %s, payment_status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (body.get('role'), body.get('paymentStatus'), user_id))
            
            conn.commit()
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
import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для синхронизации данных сайта: онлайн пользователи, голосования, статистика"""
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    data_type = query_params.get('type')  # 'online', 'votings', 'stats'

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-User-Role'
            },
            'body': ''
        }

    conn = None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cur = conn.cursor()

        # === ОНЛАЙН ПОЛЬЗОВАТЕЛИ ===
        if data_type == 'online':
            if method == 'POST':
                # Обновить статус активности пользователя
                body = json.loads(event.get('body', '{}'))
                user_email = body.get('userEmail')
                last_activity = body.get('lastActivity', int(datetime.now().timestamp() * 1000))
                
                if not user_email:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'userEmail required'})
                    }
                
                cur.execute("""
                    INSERT INTO user_online_status (user_email, last_activity, updated_at)
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_email) 
                    DO UPDATE SET last_activity = %s, updated_at = CURRENT_TIMESTAMP
                """, (user_email, last_activity, last_activity))
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif method == 'GET':
                # Получить количество онлайн пользователей
                timeout = 5 * 60 * 1000  # 5 минут в миллисекундах
                now = int(datetime.now().timestamp() * 1000)
                
                cur.execute("""
                    SELECT COUNT(*) FROM user_online_status 
                    WHERE %s - last_activity < %s
                """, (now, timeout))
                
                online_count = cur.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'onlineUsers': online_count})
                }

        # === ГОЛОСОВАНИЯ ===
        elif data_type == 'votings':
            if method == 'GET':
                # Получить все голосования
                cur.execute("""
                    SELECT id, title, description, options, start_date, end_date, status, archived, created_by
                    FROM votings
                    ORDER BY end_date DESC
                """)
                
                rows = cur.fetchall()
                votings = []
                
                for row in rows:
                    voting_id = row[0]
                    
                    # Получить голоса для этого голосования
                    cur.execute("""
                        SELECT user_email, option_index FROM voting_votes
                        WHERE voting_id = %s
                    """, (voting_id,))
                    
                    votes = cur.fetchall()
                    votes_dict = {vote[0]: vote[1] for vote in votes}
                    
                    votings.append({
                        'id': row[0],
                        'title': row[1],
                        'description': row[2],
                        'options': row[3],
                        'startDate': row[4].isoformat() if row[4] else None,
                        'endDate': row[5].isoformat() if row[5] else None,
                        'status': row[6],
                        'archived': row[7],
                        'createdBy': row[8],
                        'votes': votes_dict
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'votings': votings})
                }
            
            elif method == 'POST':
                # Создать новое голосование
                body = json.loads(event.get('body', '{}'))
                
                cur.execute("""
                    INSERT INTO votings (id, title, description, options, start_date, end_date, status, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    body['id'],
                    body['title'],
                    body.get('description', ''),
                    json.dumps(body['options']),
                    body['startDate'],
                    body['endDate'],
                    body.get('status', 'active'),
                    body.get('createdBy')
                ))
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif method == 'PUT':
                # Обновить голосование или добавить голос
                body = json.loads(event.get('body', '{}'))
                action = body.get('action')  # 'vote', 'update_status', 'archive'
                
                if action == 'vote':
                    # Добавить голос пользователя
                    cur.execute("""
                        INSERT INTO voting_votes (voting_id, user_email, option_index)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (voting_id, user_email) 
                        DO UPDATE SET option_index = %s, voted_at = CURRENT_TIMESTAMP
                    """, (body['votingId'], body['userEmail'], body['optionIndex'], body['optionIndex']))
                    
                elif action == 'update_status':
                    # Обновить статус голосования
                    cur.execute("""
                        UPDATE votings 
                        SET status = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    """, (body['status'], body['votingId']))
                
                elif action == 'archive':
                    # Архивировать голосование
                    cur.execute("""
                        UPDATE votings 
                        SET archived = TRUE, updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    """, (body['votingId'],))
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }

        # === СТАТИСТИКА ===
        elif data_type == 'stats':
            if method == 'GET':
                # Получить общую статистику
                timeout = 5 * 60 * 1000
                now = int(datetime.now().timestamp() * 1000)
                
                # Онлайн пользователи
                cur.execute("""
                    SELECT COUNT(*) FROM user_online_status 
                    WHERE %s - last_activity < %s
                """, (now, timeout))
                online_count = cur.fetchone()[0]
                
                # Всего пользователей
                cur.execute("SELECT COUNT(*) FROM users")
                total_users = cur.fetchone()[0]
                
                # Активные голосования
                cur.execute("SELECT COUNT(*) FROM votings WHERE status = 'active'")
                active_votings = cur.fetchone()[0]
                
                # Всего голосований
                cur.execute("SELECT COUNT(*) FROM votings")
                total_votings = cur.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'onlineUsers': online_count,
                        'totalUsers': total_users,
                        'activeVotings': active_votings,
                        'totalVotings': total_votings
                    })
                }

        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()

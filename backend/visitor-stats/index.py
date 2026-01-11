import json
import os
import psycopg2
from datetime import datetime, date

def handler(event: dict, context) -> dict:
    """API для синхронизации счётчиков посетителей сайта между устройствами"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    conn = None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cur = conn.cursor()

        if method == 'GET':
            # Получить текущую статистику
            today = date.today()
            
            # Получаем статистику за сегодня
            cur.execute("""
                SELECT daily_visitors, total_visitors, (
                    SELECT COUNT(*) FROM users WHERE role != 'guest'
                ) as registered_users
                FROM visitor_stats 
                WHERE stat_date = %s
            """, (today,))
            
            row = cur.fetchone()
            
            if row:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'today': row[0],
                        'total': row[1],
                        'registered': row[2] or 0
                    })
                }
            else:
                # Создаём запись для сегодняшнего дня
                cur.execute("""
                    INSERT INTO visitor_stats (stat_date, daily_visitors, total_visitors)
                    VALUES (%s, 0, 0)
                    RETURNING daily_visitors, total_visitors
                """, (today,))
                row = cur.fetchone()
                
                cur.execute("SELECT COUNT(*) FROM users WHERE role != 'guest'")
                registered = cur.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'today': row[0],
                        'total': row[1],
                        'registered': registered or 0
                    })
                }

        elif method == 'POST':
            # Увеличить счётчик посетителей
            today = date.today()
            
            # Проверяем, есть ли запись за сегодня
            cur.execute("""
                SELECT total_visitors FROM visitor_stats 
                WHERE stat_date = %s
            """, (today,))
            
            row = cur.fetchone()
            
            if row:
                # Обновляем существующую запись
                cur.execute("""
                    UPDATE visitor_stats 
                    SET daily_visitors = daily_visitors + 1,
                        total_visitors = total_visitors + 1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE stat_date = %s
                    RETURNING daily_visitors, total_visitors
                """, (today,))
            else:
                # Получаем последний total_visitors
                cur.execute("""
                    SELECT total_visitors FROM visitor_stats 
                    ORDER BY stat_date DESC LIMIT 1
                """)
                last_row = cur.fetchone()
                last_total = last_row[0] if last_row else 0
                
                # Создаём новую запись для сегодня
                cur.execute("""
                    INSERT INTO visitor_stats (stat_date, daily_visitors, total_visitors)
                    VALUES (%s, 1, %s)
                    RETURNING daily_visitors, total_visitors
                """, (today, last_total + 1))
            
            result = cur.fetchone()
            
            cur.execute("SELECT COUNT(*) FROM users WHERE role != 'guest'")
            registered = cur.fetchone()[0]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'today': result[0],
                    'total': result[1],
                    'registered': registered or 0
                })
            }

        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()

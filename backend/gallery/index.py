import json
import os
import psycopg2
import boto3
import base64
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления галереей фотографий СНТ"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email, X-User-Role'
            },
            'body': ''
        }

    conn = None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cur = conn.cursor()

        # Проверка прав доступа для модификаций
        user_role = event.get('headers', {}).get('X-User-Role', '').lower()
        user_email = event.get('headers', {}).get('X-User-Email', '')
        can_manage = user_role in ['admin', 'chairman']

        if method == 'GET':
            # Получить все видимые фото
            cur.execute("""
                SELECT id, title, description, image_url, season, display_order, 
                       is_visible, uploaded_by, created_at
                FROM gallery_photos 
                WHERE is_visible = TRUE
                ORDER BY display_order ASC, created_at DESC
            """)
            
            rows = cur.fetchall()
            photos = []
            for row in rows:
                photos.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'imageUrl': row[3],
                    'season': row[4],
                    'displayOrder': row[5],
                    'isVisible': row[6],
                    'uploadedBy': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'photos': photos})
            }

        elif method == 'POST':
            # Добавить новое фото
            if not can_manage:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Access denied'})
                }

            body = json.loads(event.get('body', '{}'))
            title = body.get('title', 'Без названия')
            description = body.get('description', '')
            season = body.get('season', '')
            image_base64 = body.get('imageData', '')

            if not image_base64:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Image data required'})
                }

            # Загрузка в S3
            try:
                s3 = boto3.client('s3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                )

                # Декодируем base64
                if ',' in image_base64:
                    image_base64 = image_base64.split(',')[1]
                
                image_data = base64.b64decode(image_base64)
                
                # Генерируем имя файла
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f'gallery/{timestamp}.jpg'
                
                # Загружаем в S3
                s3.put_object(
                    Bucket='files',
                    Key=filename,
                    Body=image_data,
                    ContentType='image/jpeg'
                )
                
                # CDN URL
                image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
                
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Upload failed: {str(e)}'})
                }

            # Сохраняем в БД
            cur.execute("""
                INSERT INTO gallery_photos 
                (title, description, image_url, season, uploaded_by)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, title, description, image_url, season, display_order, 
                          is_visible, uploaded_by, created_at
            """, (title, description, image_url, season, user_email))
            
            row = cur.fetchone()
            photo = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'imageUrl': row[3],
                'season': row[4],
                'displayOrder': row[5],
                'isVisible': row[6],
                'uploadedBy': row[7],
                'createdAt': row[8].isoformat() if row[8] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'photo': photo})
            }

        elif method == 'PUT':
            # Обновить фото (title, description, order, visibility)
            if not can_manage:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Access denied'})
                }

            body = json.loads(event.get('body', '{}'))
            photo_id = body.get('id')
            
            if not photo_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Photo ID required'})
                }

            updates = []
            params = []
            
            if 'title' in body:
                updates.append('title = %s')
                params.append(body['title'])
            if 'description' in body:
                updates.append('description = %s')
                params.append(body['description'])
            if 'season' in body:
                updates.append('season = %s')
                params.append(body['season'])
            if 'displayOrder' in body:
                updates.append('display_order = %s')
                params.append(body['displayOrder'])
            if 'isVisible' in body:
                updates.append('is_visible = %s')
                params.append(body['isVisible'])
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            params.append(photo_id)
            
            query = f"""
                UPDATE gallery_photos 
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, title, description, image_url, season, display_order, 
                          is_visible, uploaded_by, created_at
            """
            
            cur.execute(query, params)
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Photo not found'})
                }
            
            photo = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'imageUrl': row[3],
                'season': row[4],
                'displayOrder': row[5],
                'isVisible': row[6],
                'uploadedBy': row[7],
                'createdAt': row[8].isoformat() if row[8] else None
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'photo': photo})
            }

        elif method == 'DELETE':
            # Удалить фото
            if not can_manage:
                return {
                    'statusCode': 403,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Access denied'})
                }

            query_params = event.get('queryStringParameters', {}) or {}
            photo_id = query_params.get('id')
            
            if not photo_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Photo ID required'})
                }

            cur.execute("DELETE FROM gallery_photos WHERE id = %s", (photo_id,))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
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

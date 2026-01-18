import json
import os
import psycopg2
import boto3
import base64
from datetime import datetime, date

def handler(event: dict, context) -> dict:
    """Универсальное API для синхронизации контента сайта (новости, документы, страницы)"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Role, X-User-Email'
            },
            'body': ''
        }

    conn = None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cur = conn.cursor()

        user_role = event.get('headers', {}).get('X-User-Role', '').lower()
        user_email = event.get('headers', {}).get('X-User-Email', '')
        can_edit = user_role in ['admin', 'chairman', 'board_member']

        query_params = event.get('queryStringParameters', {}) or {}
        content_type = query_params.get('type')  # 'news', 'documents', 'pages'

        # ============ GET - Получить контент ============
        if method == 'GET':
            if content_type == 'news':
                cur.execute("""
                    SELECT id, title, date, category, text, images, 
                           show_on_main_page, main_page_expires_at,
                           created_by, created_at, last_edited_by, last_edited_at
                    FROM news
                    WHERE is_published = TRUE
                    ORDER BY date DESC, created_at DESC
                """)
                rows = cur.fetchall()
                news = []
                for row in rows:
                    news.append({
                        'id': row[0],
                        'title': row[1],
                        'date': row[2].isoformat() if row[2] else None,
                        'category': row[3],
                        'text': row[4],
                        'images': row[5] or [],
                        'showOnMainPage': row[6],
                        'mainPageExpiresAt': row[7].isoformat() if row[7] else None,
                        'createdBy': row[8],
                        'createdAt': row[9].isoformat() if row[9] else None,
                        'lastEditedBy': row[10],
                        'lastEditedAt': row[11].isoformat() if row[11] else None
                    })
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'news': news})
                }

            elif content_type == 'documents':
                cur.execute("""
                    SELECT id, title, category, date, file_size, description,
                           file_url, file_name, uploaded_by, uploaded_at
                    FROM documents
                    WHERE is_visible = TRUE
                    ORDER BY date DESC, uploaded_at DESC
                """)
                rows = cur.fetchall()
                documents = []
                for row in rows:
                    documents.append({
                        'id': row[0],
                        'title': row[1],
                        'category': row[2],
                        'date': row[3].isoformat() if row[3] else None,
                        'size': row[4],
                        'description': row[5],
                        'fileUrl': row[6],
                        'fileName': row[7],
                        'uploadedBy': row[8],
                        'uploadedAt': row[9].isoformat() if row[9] else None
                    })
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'documents': documents})
                }

            elif content_type == 'pages':
                page_key = query_params.get('key')
                if page_key:
                    cur.execute("SELECT content FROM page_content WHERE page_key = %s", (page_key,))
                    row = cur.fetchone()
                    if row:
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps(row[0])
                        }
                else:
                    # Все страницы
                    cur.execute("SELECT page_key, content FROM page_content")
                    rows = cur.fetchall()
                    pages = {row[0]: row[1] for row in rows}
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(pages)
                    }

        # ============ POST - Создать контент ============
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # Для документов разрешаем всем авторизованным пользователям
            if content_type != 'documents' and not can_edit:
                return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Access denied'})}

            if content_type == 'news':
                title = body.get('title')
                text = body.get('text')
                category = body.get('category', 'Объявления')
                images = body.get('images', [])
                show_on_main = body.get('showOnMainPage', False)
                expires_at = body.get('mainPageExpiresAt')
                news_id = body.get('id')  # ID из localStorage для проверки дубликатов

                # Проверка на дубликаты при миграции
                if news_id:
                    cur.execute("SELECT id FROM news WHERE id = %s", (news_id,))
                    if cur.fetchone():
                        return {
                            'statusCode': 409,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'News already exists', 'id': news_id})
                        }
                    
                    cur.execute("""
                        INSERT INTO news (id, title, text, category, images, show_on_main_page, main_page_expires_at, created_by)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, title, date, category, text, images, show_on_main_page, main_page_expires_at, created_by, created_at
                    """, (news_id, title, text, category, images, show_on_main, expires_at, user_email))
                else:
                    cur.execute("""
                        INSERT INTO news (title, text, category, images, show_on_main_page, main_page_expires_at, created_by)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, title, date, category, text, images, show_on_main_page, main_page_expires_at, created_by, created_at
                    """, (title, text, category, images, show_on_main, expires_at, user_email))
                row = cur.fetchone()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': row[0],
                        'title': row[1],
                        'date': row[2].isoformat(),
                        'category': row[3],
                        'text': row[4],
                        'images': row[5] or [],
                        'showOnMainPage': row[6],
                        'mainPageExpiresAt': row[7].isoformat() if row[7] else None,
                        'createdBy': row[8],
                        'createdAt': row[9].isoformat() if row[9] else None
                    })
                }

            elif content_type == 'documents':
                title = body.get('title')
                category = body.get('category')
                description = body.get('description', '')
                file_url_combined = body.get('fileUrl', '')
                file_data = body.get('fileData')
                file_name = body.get('fileName', '')
                file_size_str = body.get('size', '0 КБ')
                doc_id = body.get('id')

                # Поддержка двух форматов: fileUrl="name|base64" или fileData+fileName
                if file_url_combined and '|' in file_url_combined:
                    parts = file_url_combined.split('|', 1)
                    file_name = parts[0]
                    file_data = parts[1]
                elif not file_data or not file_name:
                    return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'File data required'})}

                # Загрузка в S3
                try:
                    s3 = boto3.client('s3',
                        endpoint_url='https://bucket.poehali.dev',
                        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                    )

                    if ',' in file_data:
                        file_data = file_data.split(',')[1]
                    
                    file_bytes = base64.b64decode(file_data)
                    file_size_bytes = len(file_bytes)
                    
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    s3_key = f'documents/{timestamp}_{file_name}'
                    
                    s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes)
                    file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
                    
                except Exception as e:
                    return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': f'Upload failed: {str(e)}'})}

                # Проверка дубликатов при миграции
                if doc_id:
                    cur.execute("SELECT id FROM documents WHERE id = %s", (doc_id,))
                    if cur.fetchone():
                        return {
                            'statusCode': 409,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Document already exists', 'id': doc_id})
                        }
                    cur.execute("""
                        INSERT INTO documents (id, title, category, description, file_url, file_name, file_size, uploaded_by)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, title, category, date, file_size, description, file_url, file_name, uploaded_by, uploaded_at
                    """, (doc_id, title, category, description, file_url, file_name, file_size_str, user_email))
                else:
                    cur.execute("""
                        INSERT INTO documents (title, category, description, file_url, file_name, file_size, uploaded_by)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, title, category, date, file_size, description, file_url, file_name, uploaded_by, uploaded_at
                    """, (title, category, description, file_url, file_name, file_size_str, user_email))
                row = cur.fetchone()

                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': row[0],
                        'title': row[1],
                        'category': row[2],
                        'date': row[3].isoformat() if row[3] else None,
                        'size': row[4],
                        'description': row[5],
                        'fileUrl': row[6],
                        'fileName': row[7],
                        'uploadedBy': row[8],
                        'uploadedAt': row[9].isoformat() if row[9] else None
                    })
                }

        # ============ PUT - Обновить контент ============
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            
            # Для документов разрешаем всем авторизованным пользователям
            if content_type != 'documents' and not can_edit:
                return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Access denied'})}

            if content_type == 'news':
                news_id = body.get('id')
                updates = []
                params = []

                for field in ['title', 'text', 'category', 'images', 'showOnMainPage', 'mainPageExpiresAt']:
                    if field in body:
                        db_field = {
                            'showOnMainPage': 'show_on_main_page',
                            'mainPageExpiresAt': 'main_page_expires_at'
                        }.get(field, field)
                        updates.append(f'{db_field} = %s')
                        params.append(body[field])

                if updates:
                    updates.append('last_edited_by = %s')
                    updates.append('last_edited_at = CURRENT_TIMESTAMP')
                    params.extend([user_email, news_id])

                    cur.execute(f"UPDATE news SET {', '.join(updates)} WHERE id = %s", params)
                
                return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True})}

            elif content_type == 'documents':
                doc_id = body.get('id')
                updates = []
                params = []

                if 'title' in body:
                    updates.append('title = %s')
                    params.append(body['title'])
                if 'category' in body:
                    updates.append('category = %s')
                    params.append(body['category'])
                if 'description' in body:
                    updates.append('description = %s')
                    params.append(body['description'])
                
                # Обновление файла (если указан)
                file_url_combined = body.get('fileUrl', '')
                if file_url_combined and '|' in file_url_combined:
                    parts = file_url_combined.split('|', 1)
                    file_name = parts[0]
                    file_data = parts[1]
                    
                    try:
                        s3 = boto3.client('s3',
                            endpoint_url='https://bucket.poehali.dev',
                            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                        )

                        if ',' in file_data:
                            file_data = file_data.split(',')[1]
                        
                        file_bytes = base64.b64decode(file_data)
                        file_size_bytes = len(file_bytes)
                        
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                        s3_key = f'documents/{timestamp}_{file_name}'
                        
                        s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes)
                        file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
                        
                        updates.append('file_url = %s')
                        params.append(file_url)
                        updates.append('file_name = %s')
                        params.append(file_name)
                        if 'size' in body:
                            updates.append('file_size = %s')
                            params.append(body['size'])
                    except Exception as e:
                        return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': f'Upload failed: {str(e)}'})}

                if updates:
                    params.append(doc_id)
                    cur.execute(f"UPDATE documents SET {', '.join(updates)} WHERE id = %s", params)
                
                return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True})}

            elif content_type == 'pages':
                page_key = body.get('key')
                content = body.get('content')

                cur.execute("""
                    INSERT INTO page_content (page_key, content, updated_by)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (page_key) 
                    DO UPDATE SET content = EXCLUDED.content, updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
                """, (page_key, json.dumps(content), user_email))

                return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True})}

        # ============ DELETE - Удалить контент ============
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id') or query_params.get('id')
            
            # Для документов разрешаем всем авторизованным пользователям
            if content_type != 'documents' and not can_edit:
                return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Access denied'})}

            if content_type == 'news':
                cur.execute("UPDATE news SET is_published = FALSE WHERE id = %s", (item_id,))
            elif content_type == 'documents':
                cur.execute("UPDATE documents SET is_visible = FALSE WHERE id = %s", (item_id,))

            return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True})}

        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid request'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': str(e)})}
    finally:
        if conn:
            conn.close()
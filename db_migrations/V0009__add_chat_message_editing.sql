-- Добавляем поля для редактирования сообщений в чате
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edited_by VARCHAR(255);
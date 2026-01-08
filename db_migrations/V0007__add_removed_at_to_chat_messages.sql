ALTER TABLE t_p47036165_snt_fakel_website.chat_messages 
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP;

COMMENT ON COLUMN t_p47036165_snt_fakel_website.chat_messages.removed_at IS 'Время удаления сообщения';
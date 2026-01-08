-- Создание таблицы для отслеживания онлайн статусов пользователей
CREATE TABLE IF NOT EXISTS online_users (
    email VARCHAR(255) PRIMARY KEY,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска активных пользователей
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen);

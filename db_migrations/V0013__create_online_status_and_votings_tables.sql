-- Таблица для отслеживания онлайн статуса пользователей
CREATE TABLE IF NOT EXISTS user_online_status (
    user_email VARCHAR(255) PRIMARY KEY,
    last_activity BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска активных пользователей
CREATE INDEX IF NOT EXISTS idx_user_online_activity ON user_online_status(last_activity);

-- Таблица для голосований (синхронизация между устройствами)
CREATE TABLE IF NOT EXISTS votings (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    archived BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для голосов пользователей
CREATE TABLE IF NOT EXISTS voting_votes (
    id SERIAL PRIMARY KEY,
    voting_id VARCHAR(50) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    option_index INTEGER NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(voting_id, user_email)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_votings_status ON votings(status);
CREATE INDEX IF NOT EXISTS idx_votings_end_date ON votings(end_date);
CREATE INDEX IF NOT EXISTS idx_voting_votes_voting_id ON voting_votes(voting_id);
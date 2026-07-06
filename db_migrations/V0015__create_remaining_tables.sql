-- Статистика посетителей сайта
CREATE TABLE IF NOT EXISTS visitor_stats (
    stat_date DATE PRIMARY KEY,
    daily_visitors INTEGER DEFAULT 0,
    total_visitors INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Онлайн-статус пользователей (для sync-data)
CREATE TABLE IF NOT EXISTS user_online_status (
    user_email VARCHAR(255) PRIMARY KEY,
    last_activity BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Голосования
CREATE TABLE IF NOT EXISTS votings (
    id BIGINT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    archived BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Голоса пользователей
CREATE TABLE IF NOT EXISTS voting_votes (
    id SERIAL PRIMARY KEY,
    voting_id BIGINT NOT NULL REFERENCES votings(id),
    user_email VARCHAR(255) NOT NULL,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(voting_id, user_email)
);

-- Фотографии галереи
CREATE TABLE IF NOT EXISTS gallery_photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    description TEXT,
    image_url TEXT NOT NULL,
    season VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_visible ON gallery_photos(is_visible);

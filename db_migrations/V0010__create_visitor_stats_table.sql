-- Таблица для синхронизации счётчиков посетителей между устройствами
CREATE TABLE IF NOT EXISTS visitor_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    daily_visitors INTEGER NOT NULL DEFAULT 0,
    total_visitors INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по дате
CREATE INDEX idx_visitor_stats_date ON visitor_stats(stat_date);

-- Вставляем запись для сегодняшнего дня, если её нет
INSERT INTO visitor_stats (stat_date, daily_visitors, total_visitors)
VALUES (CURRENT_DATE, 0, 0)
ON CONFLICT (stat_date) DO NOTHING;
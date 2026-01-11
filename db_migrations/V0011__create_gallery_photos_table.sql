-- Таблица для хранения фотографий галереи
CREATE TABLE IF NOT EXISTS gallery_photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    season VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрой сортировки
CREATE INDEX idx_gallery_display_order ON gallery_photos(display_order, created_at DESC);

-- Индекс для фильтрации видимых фото
CREATE INDEX idx_gallery_visible ON gallery_photos(is_visible);
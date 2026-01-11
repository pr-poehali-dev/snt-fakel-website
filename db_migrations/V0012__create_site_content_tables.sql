-- Таблица для новостей и объявлений
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    images TEXT[], -- Массив URL изображений
    show_on_main_page BOOLEAN DEFAULT FALSE,
    main_page_expires_at TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_edited_by VARCHAR(255),
    last_edited_at TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE
);

-- Таблица для истории редактирования новостей
CREATE TABLE IF NOT EXISTS news_history (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id),
    edited_by VARCHAR(255),
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_title VARCHAR(500),
    previous_text TEXT,
    change_summary TEXT
);

-- Таблица для документов
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_size INTEGER, -- Размер в байтах
    description TEXT,
    file_url TEXT NOT NULL, -- URL файла в S3
    file_name VARCHAR(255),
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_visible BOOLEAN DEFAULT TRUE
);

-- Таблица для контента статических страниц
CREATE TABLE IF NOT EXISTS page_content (
    id SERIAL PRIMARY KEY,
    page_key VARCHAR(100) NOT NULL UNIQUE, -- 'rules', 'contacts', 'gallery', 'home'
    content JSONB NOT NULL, -- JSON с содержимым страницы
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_show_main ON news(show_on_main_page, main_page_expires_at);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date DESC);
CREATE INDEX IF NOT EXISTS idx_page_content_key ON page_content(page_key);

-- Начальные данные для страниц
INSERT INTO page_content (page_key, content) VALUES
('rules', '{
  "title": "Правила и устав товарищества",
  "mainTitle": "Устав СНТ Факел",
  "mainText": "Садовое некоммерческое товарищество «Факел» создано в соответствии с законодательством РФ и осуществляет деятельность на основании настоящего устава.",
  "rulesTitle": "Основные положения:",
  "rulesItems": [
    "Соблюдение тишины с 22:00 до 08:00",
    "Своевременная уплата членских взносов",
    "Содержание участка в надлежащем состоянии",
    "Участие в общих субботниках",
    "Соблюдение правил пожарной безопасности"
  ],
  "behaviorTitle": "Правила поведения",
  "behaviorText": "Участники товарищества обязуются соблюдать порядок, уважать права соседей, поддерживать чистоту на общей территории и участвовать в жизни сообщества."
}'::jsonb),

('contacts', '{
  "title": "Контакты и реквизиты",
  "addressTitle": "Адрес",
  "addressText": "Московская область, Раменский район\\nСНТ «Факел»\\nд. Малое Уварово",
  "contactsTitle": "Контакты",
  "phone": "+7 (495) 123-45-67",
  "email": "info@snt-fakel.ru",
  "detailsTitle": "Реквизиты",
  "inn": "5012345678",
  "kpp": "501201001",
  "account": "40703810000000000000",
  "bik": "044525225"
}'::jsonb),

('gallery', '{
  "title": "Галерея фото территории",
  "enabled": true
}'::jsonb),

('home', '{
  "hero": {
    "title": "СНТ Факел",
    "subtitle": "Добро пожаловать в наше садовое товарищество",
    "description": "Уютное место для отдыха и общения"
  },
  "benefits": [
    {
      "id": 1,
      "title": "Удобное расположение",
      "description": "Близко к городу, хорошая транспортная доступность",
      "icon": "MapPin"
    },
    {
      "id": 2,
      "title": "Развитая инфраструктура",
      "description": "Электричество, вода, дороги",
      "icon": "Zap"
    },
    {
      "id": 3,
      "title": "Активное сообщество",
      "description": "Дружелюбные соседи и совместные мероприятия",
      "icon": "Users"
    }
  ],
  "about": {
    "title": "О нашем товариществе",
    "description": "СНТ Факел - это дружное сообщество садоводов"
  },
  "blockOrder": ["hero", "news", "benefits", "about"]
}'::jsonb)
ON CONFLICT (page_key) DO NOTHING;
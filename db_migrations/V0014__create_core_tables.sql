-- Таблица пользователей (авторизация)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    phone VARCHAR(20),
    plot_number VARCHAR(20),
    birth_date DATE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    owner_is_same BOOLEAN DEFAULT TRUE,
    is_plot_owner BOOLEAN DEFAULT FALSE,
    owner_first_name VARCHAR(100),
    owner_last_name VARCHAR(100),
    owner_middle_name VARCHAR(100),
    land_doc_number VARCHAR(100),
    house_doc_number VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Токены восстановления пароля
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Онлайн-пользователи
CREATE TABLE IF NOT EXISTS online_users (
    email VARCHAR(255) PRIMARY KEY,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Новости
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) DEFAULT 'Объявления',
    text TEXT,
    images TEXT[],
    show_on_main_page BOOLEAN DEFAULT FALSE,
    main_page_expires_at TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_edited_by VARCHAR(255),
    last_edited_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);

-- Документы
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_size INTEGER DEFAULT 0,
    description TEXT,
    file_url TEXT,
    file_name VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_visible ON documents(is_visible);

-- Обращения к правлению СНТ
CREATE TABLE IF NOT EXISTS board_appeals (
    id SERIAL PRIMARY KEY,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    plot_number VARCHAR(20),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_board_appeals_status ON board_appeals(status);
CREATE INDEX IF NOT EXISTS idx_board_appeals_email ON board_appeals(from_email);

-- Ответы на обращения к правлению
CREATE TABLE IF NOT EXISTS board_appeal_responses (
    id SERIAL PRIMARY KEY,
    appeal_id INTEGER NOT NULL REFERENCES board_appeals(id),
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    from_role VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_board_appeal_responses_appeal_id ON board_appeal_responses(appeal_id);

-- Сообщения чата (с видимостью удалённых для модерации)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50),
    avatar TEXT,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_removed BOOLEAN DEFAULT FALSE,
    removed_by VARCHAR(255),
    removed_at TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    edited_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_removed ON chat_messages(is_removed);

-- Заблокированные в чате пользователи
CREATE TABLE IF NOT EXISTS blocked_chat_users (
    email VARCHAR(255) PRIMARY KEY,
    blocked_by VARCHAR(255),
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    block_reason TEXT
);

-- Контент страниц (для редактора страниц)
CREATE TABLE IF NOT EXISTS page_content (
    page_key VARCHAR(100) PRIMARY KEY,
    content JSONB NOT NULL,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

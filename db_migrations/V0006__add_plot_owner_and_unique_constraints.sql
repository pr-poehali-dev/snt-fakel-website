ALTER TABLE t_p47036165_snt_fakel_website.users 
ADD COLUMN IF NOT EXISTS is_plot_owner BOOLEAN DEFAULT false;

COMMENT ON COLUMN t_p47036165_snt_fakel_website.users.is_plot_owner IS 'Является ли пользователь собственником участка';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON t_p47036165_snt_fakel_website.users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON t_p47036165_snt_fakel_website.users (phone);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_plot_owner ON t_p47036165_snt_fakel_website.users (plot_number) 
WHERE is_plot_owner = true;
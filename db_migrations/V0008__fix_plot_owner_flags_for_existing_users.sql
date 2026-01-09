-- Шаг 1: Помечаем тестового пользователя как НЕ собственника
UPDATE t_p47036165_snt_fakel_website.users 
SET owner_is_same = false, is_plot_owner = false
WHERE id = 291 AND email = 'andreyleontev2017@mail.ru';

-- Шаг 2: Устанавливаем is_plot_owner = true для самого раннего зарегистрированного владельца каждого участка
UPDATE t_p47036165_snt_fakel_website.users u
SET is_plot_owner = true
WHERE owner_is_same = true 
  AND is_plot_owner = false
  AND id IN (
    SELECT MIN(id) 
    FROM t_p47036165_snt_fakel_website.users 
    WHERE owner_is_same = true 
    GROUP BY plot_number
  );
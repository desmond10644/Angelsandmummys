ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users
SET role = 'user'
WHERE role = 'customer';

UPDATE users
SET role = 'admin'
WHERE LOWER(email) = 'admin@gmail.com';

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

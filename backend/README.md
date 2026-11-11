# Backend setup

The backend uses Express and PostgreSQL. The Neon connection string and signing
key belong in `backend/.env`; never put either value in frontend code or commit
the `.env` file.

## Local development

1. Make sure `backend/.env` has `DATABASE_URL`, a random `JWT_SECRET` of at
   least 32 characters, `PORT=5000`, and `FRONTEND_URL=http://localhost:5173`.
2. From the `backend` directory, run `npm run db:migrate` to create the tables
   and add the existing sample products. The migration is safe to rerun.
3. Run `npm run dev` from `backend`.
4. Run `npm run dev` from the project root to start the frontend. Its root
   `.env` should set `VITE_API_URL=http://localhost:5000`.
5. Check `http://localhost:5000/api/health` for the API/database health status.

## Promote an administrator

Register the intended account through the app first, then run this in the Neon
SQL editor, replacing the email with that account's address:

```sql
UPDATE users
SET role = 'admin'
WHERE email = LOWER('admin@example.com');
```

Sign out and sign in again after promotion so the new admin role is included in
the JWT.

## API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Check API and database connection |
| POST | `/api/auth/register` | Public | Create a customer account |
| POST | `/api/auth/login` | Public | Sign in and receive a JWT |
| GET | `/api/products` | Public | List active products; accepts `q` and `category` |
| GET | `/api/products/:id` | Public | Get an active product |
| POST | `/api/products` | Admin | Add inventory |
| PATCH | `/api/products/:id` | Admin | Update product or stock |
| DELETE | `/api/products/:id` | Admin | Deactivate a product |
| GET/PUT | `/api/account/cart` | Signed in | Read or replace the user's cart |
| GET | `/api/account/wishlist` | Signed in | Read the user's wishlist |
| PUT/DELETE | `/api/account/wishlist/:productId` | Signed in | Add or remove a wishlist item |
| POST | `/api/orders` | Signed in | Create an unpaid order |
| GET | `/api/orders` | Signed in | List the user's orders; admins see all |
| PATCH | `/api/orders/:id/status` | Admin | Update an order's fulfillment status |

Orders are recorded as unpaid; these endpoints do not collect or verify
payments. The server calculates totals from database prices and currently adds
a ₦3,000 delivery fee.

For hosting, configure the same backend variables in the hosting provider's
environment-variable settings, and set `FRONTEND_URL` to the deployed
frontend's origin. Set `VITE_API_URL` in the frontend build environment to the
deployed backend URL.

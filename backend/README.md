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

## Roles and initial administrator

Users have one of two roles: `user` or `admin`. Public registration always
creates a `user`. The role migration promotes an existing `admin@gmail.com`
account when `npm run db:migrate` is run. For initial setup, register that
address, then promote it from the `backend` directory:

```powershell
npm run admin:promote -- admin@gmail.com
```

Sign in through the same `/login` page used by regular users. The account role
determines whether the user is directed to the admin dashboard or storefront.
An authenticated administrator can create additional admin accounts in the
dashboard; the API does not allow public registration to assign the admin role.

## API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Check API and database connection |
| POST | `/api/auth/register` | Public | Create a `user` account |
| POST | `/api/auth/login` | Public | Sign in and receive a JWT |
| GET | `/api/account/profile` | Signed in | Read the current user's account details |
| GET | `/api/products` | Public | List active products; accepts `q` and `category` |
| GET | `/api/products/categories` | Public | List categories, images, and active product counts |
| POST | `/api/products/categories` | Admin | Add a category and optional image |
| PATCH | `/api/products/categories/:category` | Admin | Rename a category or replace its image |
| GET | `/api/products/:id` | Public | Get an active product |
| POST | `/api/products` | Admin | Add a product with a JPG, PNG, or WebP image upload |
| PATCH | `/api/products/:id` | Admin | Update product fields or replace its image |
| DELETE | `/api/products/:id` | Admin | Deactivate a product |
| GET/PUT | `/api/account/cart` | Signed in | Read or replace the user's cart |
| GET | `/api/account/admins` | Admin | List administrator accounts |
| POST | `/api/account/admins` | Admin | Create an administrator account |
| GET | `/api/account/wishlist` | Signed in | Read the user's wishlist |
| PUT/DELETE | `/api/account/wishlist/:productId` | Signed in | Add or remove a wishlist item |
| POST | `/api/orders` | Signed in | Create an unpaid order |
| GET | `/api/orders` | Signed in | List the user's orders; admins see all |
| PATCH | `/api/orders/:id/status` | Admin | Update an order's fulfillment status |
| GET | `/api/hero-slides` | Public | List published homepage hero slides |
| GET/POST | `/api/hero-slides/admin` | Admin | List slides or upload a slide image |
| PUT/DELETE | `/api/hero-slides/admin/:id` | Admin | Edit or delete a slide |
| PUT | `/api/hero-slides/admin/order` | Admin | Save homepage slide order |

Orders are recorded as unpaid; these endpoints do not collect or verify
payments. The server calculates totals from database prices and currently adds
a ₦3,000 delivery fee.

For hosting, configure the same backend variables in the hosting provider's
environment-variable settings, and set `FRONTEND_URL` to the deployed
frontend's origin. Set `VITE_API_URL` in the frontend build environment to the
deployed backend URL.

## Homepage hero slides

The hero slider uses the same Express server, PostgreSQL connection, and admin
accounts as the rest of the application. Sign in at `/login` and open
`/admin/hero-slides`. The dashboard supports
image upload, preview, replacement, deletion, slide text and button editing,
visibility, and ordering. Images must be JPG, PNG, or WebP and no larger than
8 MB. Uploaded files are served from `/uploads`; configure `UPLOAD_DIR` to a
persistent directory when deploying.

Product images use the same persistent upload directory and file constraints.
The product form requires an image when creating a product and allows replacing
it while editing. Admins can rename categories and add or replace category
images in the dashboard. A category image appears as the banner on that
category's shop page. Category image uploads must be JPG, PNG, or WebP and no
larger than 8 MB. Category records are migrated from existing product data and
stay in sync when products are added or recategorized.

The hero images page at `/admin/hero-slides` manages images shown in the
homepage hero section: add an image, replace an existing image, or delete it.

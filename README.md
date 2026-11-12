# Angels & Mummies

React storefront and Express/PostgreSQL backend for the Angels & Mummies shop.

## Local development

1. Install frontend dependencies with `npm install` in the project root.
2. Configure `backend/.env` using `backend/.env.example`. Set `DATABASE_URL`,
   a private `JWT_SECRET` of at least 32 characters, and
   `FRONTEND_URL=http://localhost:5173`.
3. From the `backend` directory, run `npm install`, then
   `npm run db:migrate` to create the database tables.
4. Start the API with `npm run dev` from `backend`.
5. Start the storefront with `npm run dev` from the project root. Set
   `VITE_API_URL=http://localhost:5000` in the root `.env` if needed.

The homepage has four bundled local hero images as a fallback when the API
cannot be reached or has no published slides.

## Manage the homepage slider

Sign in through the shared `/login` page with an administrator account, then
open `/admin/hero-slides`. Admins can upload multiple slides,
preview and replace images, edit headings/descriptions and button links,
toggle homepage visibility, rearrange slide order, and delete slides.

Slide images are stored on disk and slide details in PostgreSQL. Uploaded
images must be JPG, PNG, or WebP and no larger than 8 MB. In production, set
`UPLOAD_DIR` to persistent storage and configure `FRONTEND_URL` and
`VITE_API_URL` for the deployed origins.

## Manage products, customers, and orders

Register the intended account through the app first, then from the `backend`
directory run `npm run admin:promote -- admin@gmail.com` to enable the initial
administrator account. Existing `admin@gmail.com` accounts are promoted when
you run `npm run db:migrate`. Sign in at `/login`; administrators are sent to
the admin dashboard and regular users to the storefront. An administrator can
create more admin accounts from the dashboard's Admins section. Public
registration always creates a `user` account.

Admins can add products with an uploaded product image, replace product images,
edit all product details, and rename categories across the products assigned
to them. Product images accept JPG, PNG, or WebP files up to 8 MB; use a
persistent `UPLOAD_DIR` when deploying the backend.

## Customer shopping and orders

The storefront reads the catalog from the backend and refreshes it when the
page regains focus and every 30 seconds. Guest carts and wishlists stay in the
current browser; signing in syncs them to the customer account. Checkout
requires an account, and placed orders are saved on the backend and appear in
both the customer order history and admin dashboard.

Payment is not connected to a provider. Placing an order records it as unpaid;
it does not charge a customer. The backend verifies stock and calculates the
final order total when the order is submitted.

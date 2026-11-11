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

Register or use an existing account, then promote it to administrator using
the SQL instructions in [backend/README.md](./backend/README.md). Sign in to
the dashboard at `/admin/hero-slides`. Admins can upload multiple slides,
preview and replace images, edit headings/descriptions and button links,
toggle homepage visibility, rearrange slide order, and delete slides.

Slide images are stored on disk and slide details in PostgreSQL. Uploaded
images must be JPG, PNG, or WebP and no larger than 8 MB. In production, set
`UPLOAD_DIR` to persistent storage and configure `FRONTEND_URL` and
`VITE_API_URL` for the deployed origins.

## Manage products, customers, and orders

Register the intended account through the app first, then from the `backend`
directory run `npm run admin:promote -- admin@example.com`. Sign in at
`/admin/login` to manage the product catalog, customer directory, and order
fulfilment. Public registration always creates a customer account. The SQL
promotion option is also documented in [backend/README.md](./backend/README.md).

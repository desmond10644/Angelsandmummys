INSERT INTO hero_slides (
  image_url, eyebrow, heading, description,
  primary_button_text, primary_button_url,
  secondary_button_text, secondary_button_url,
  is_active, position
)
SELECT
  slides.image_url, slides.eyebrow, slides.heading, slides.description,
  slides.primary_button_text, slides.primary_button_url,
  slides.secondary_button_text, slides.secondary_button_url,
  TRUE, slides.position
FROM (
  VALUES
    (
      '/storefront-hero-images/image1.jpeg',
      'WELCOME TO ANGELS & MUMMIES',
      'Everything you need for motherhood and little ones.',
      'Discover quality products and everyday essentials for mothers, babies and growing children.',
      'Shop Now', '/shop', 'Explore Categories', '/categories', 0
    ),
    (
      '/storefront-hero-images/image2.jpeg',
      'LITTLE MOMENTS, BIG LOVE',
      'Beautiful finds for every stage of family life.',
      'Explore thoughtful picks for mum, baby and every growing little personality.',
      'Shop Now', '/shop', 'Explore Categories', '/categories', 1
    ),
    (
      '/storefront-hero-images/image3.jpeg',
      'MADE FOR YOUR LITTLE ONE',
      'A softer start for life''s sweetest adventures.',
      'Find practical baby essentials and joyful discoveries for your family''s next chapter.',
      'Shop Baby Care', '/baby-products', 'Explore Categories', '/categories', 2
    ),
    (
      '/storefront-hero-images/image4.jpeg',
      'PLAY, LEARN & GROW',
      'Little adventures start with the right essentials.',
      'Shop thoughtful picks for happy playtimes and memorable family moments.',
      'Shop Now', '/shop', 'Explore Categories', '/categories', 3
    )
) AS slides(
  image_url, eyebrow, heading, description,
  primary_button_text, primary_button_url,
  secondary_button_text, secondary_button_url, position
)
WHERE NOT EXISTS (SELECT 1 FROM hero_slides);

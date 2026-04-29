/// <reference path="./main.ts" />

// ======================================================
// Configuration & Types
// ======================================================

let products: Product[] = [];
let currentProduct: Product | null = null;
let currentQuantity: number = 1;
let selectedImageIndex: number = 0;

interface ReviewFormState {
  rating: number;
  name: string;
  email: string;
  review: string;
  saveInfo: boolean;
  touched: {
    name: boolean;
    email: boolean;
    review: boolean;
  };
}

type ReviewField = keyof ReviewFormState['touched'] | 'rating';

const reviewForm: ReviewFormState = {
  rating: 0,
  name: '',
  email: '',
  review: '',
  saveInfo: false,
  touched: {
    name: false,
    email: false,
    review: false,
  },
};

// ======================================================
// DOM Elements Cache
// ======================================================

let mainElement: HTMLElement | null = null;

// ======================================================
// URL Parameter Handling
// ======================================================

function getProductIdFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// ======================================================
// Data Loading
// ======================================================

interface ProductData {
  data?: Product[];
}

async function loadSingleProductDetails(): Promise<void> {
  const data = await loadJSON<Product[] | ProductData>('../assets/data.json');
  if (!data) {
    renderError();
    return;
  }

  products = Array.isArray(data) ? data : (data.data ?? []);

  const productId = getProductIdFromURL();
  currentProduct = products.find((p) => p.id === productId) ?? null;

  if (!currentProduct) {
    renderNotFound();
    return;
  }

  renderProductPage();
}

// ======================================================
// Product Page Rendering
// ======================================================

function renderProductPage(): void {
  if (!currentProduct || !mainElement) return;

  const productHTML = `
    <section class="product-details">
      <div class="product-details__container container">
        <div class="product-details__content">
          <div class="product-details__gallery">
            <div class="product-details__main-image">
              <img 
                src="../${currentProduct.imageUrl}" 
                alt="${currentProduct.name}"
                id="mainProductImage"
              />
              ${
                currentProduct.salesStatus
                  ? '<span class="product-details__badge">SALE</span>'
                  : ''
              }
            </div>
            <div class="product-details__thumbnails">
              ${generateThumbnails()}
            </div>
          </div>

          <div class="product-details__info">
            <h1 class="product-details__title">
              ${currentProduct.name}
            </h1>

            <div class="product-details__rating">
              <div class="product-details__rating-stars">
                ${renderStars(currentProduct.rating)}
              </div>

              <span class="product-details__rating-text"
                >(1 Customer Review)</span
              >
            </div>

            <div class="product-details__price" data-value="$">${
              currentProduct.price
            }</div>

            <div class="product-details__description">
              <p>
                The new ${currentProduct.name} is a bold
                reimagining of travel essentials, designed to elevate every
                journey. Made with at least 30% recycled materials, its
                lightweight yet impact-resistant shell combines eco-
                conscious innovation with rugged durability.
              </p>
              <p>
                The ergonomic handle and GlideMotion spinner wheels ensure
                effortless mobility while making a statement in sleek
                design. Inside, the modular compartments and adjustable
                straps keep your belongings secure and neatly organized, no
                matter the destination.
              </p>
            </div>

            <div class="product-details__options">
              <div class="product-details__option">
                <label class="product-details__label">Size</label>
                <div
                  class="custom-dropdown custom-dropdown--product"
                  data-type="size"
                >
                  <div class="custom-dropdown__selected">${
                    currentProduct.size
                  }</div>
                  <div class="custom-dropdown__options">
                    ${generateSizeOptions()}
                  </div>
                </div>
              </div>

              <div class="product-details__option">
                <label class="product-details__label">Color</label>
                <div
                  class="custom-dropdown custom-dropdown--product"
                  data-type="color"
                >
                  <div class="custom-dropdown__selected">${capitalizeFirst(
                    currentProduct.color,
                  )}</div>
                  <div class="custom-dropdown__options">
                    ${generateColorOptions()}
                  </div>
                </div>
              </div>

              <div class="product-details__option">
                <label class="product-details__label">Category</label>
                <div
                  class="custom-dropdown custom-dropdown--product"
                  data-type="category"
                >
                  <div class="custom-dropdown__selected">${capitalizeFirst(
                    currentProduct.category,
                  )}</div>
                  <div class="custom-dropdown__options">
                    ${generateCategoryOptions()}
                  </div>
                </div>
                </div>
              </div>

              <div class="product-details__actions">
                <div class="product-details__quantity">
                  <button class="product-details__qty-btn" id="qtyMinusBtn">
                    -
                  </button>
                  <span class="product-details__qty-value" id="qtyValue"
                    >${currentQuantity}</span
                  >
                  <button class="product-details__qty-btn" id="qtyPlusBtn">
                    +
                  </button>
                </div>
                <button
                  class="product-details__add-to-cart btn btn--primary"
                  id="addToCartBtn"
                >
                  Add To Cart
                </button>
              </div>

              <div class="product-details__payment">
                <span class="product-details__payment-label">Payment:</span>
                <div class="product-details__payment-icons">
                  <img src="../assets/icons/payment/visa.svg" alt="Visa" />
                  <img
                    src="../assets/icons/payment/american-express.svg"
                    alt="American Express"
                  />
                  <img
                    src="../assets/icons/payment/mastercard.svg"
                    alt="Mastercard"
                  />
                  <img
                    src="../assets/icons/payment/paypal.svg"
                    alt="PayPal"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="product-details__tabs">
            <div class="product-details__tab-buttons">
              <button
                class="product-details__tab-btn product-details__tab-btn--active"
                data-tab="details"
              >
                DETAILS
              </button>
              <button class="product-details__tab-btn" data-tab="reviews">
                REVIEWS
              </button>
              <button class="product-details__tab-btn" data-tab="shipping">
                SHIPPING POLICY
              </button>
            </div>

            <div class="product-details__tab-content">
              <div
                class="product-details__tab-panel product-details__tab-panel--active"
                data-panel="details"
              >
                <p>
                  Vestibulum commodo sapien non elit porttitor, vitae volutpat
                  nibh mollis. Nulla porta risus id neque tempor, in efficitur
                  justo imperdiet. Etiam a ex at ante tincidunt imperdiet.
                  Nunc congue ex vel massa viverra, sit amet aliquet lectus
                  ullamcorper. Praesent luctus lacus non lorem elementum, eu
                  tristique neque rutrum. Sed in magna magna. Quisque felis
                  dui, hendrerit dau ligula non. Pellentesque tristique
                  pincidunt dolor eu commodo. Proin iaculis nibh vitae lectus
                  mollis bibendum. Quisque varius eget urna sit amet luctus.
                  Suspendisse potenti. Durabitur ac placerat magna. Curabitur
                  tortor dui, pulvinar at tincidunt a, ultricies sed arcu.
                </p>
                <p>
                  Proin iaculis nibh vitae lectus mollis bibendum. Quisque
                  varius eget urna sit amet luctus. Suspendisse potenti.
                  Curabitur ac placerat est, sit amet sodales risus.
                  Pellentesque viverra in auctor, ullamcorper turpis pharetra,
                  facilisis augue. Proin iaculis nibh vitae lectus mollis
                  bibendum.
                </p>
                <p>
                  Quisque varius eget urna sit amet luctus. Suspendisse
                  potenti. Curabitur ac placerat est, sit amet sodales risus.
                  Pellentesque viverra dui auctor, ullamcorper turpis
                  pharetra, facilisis augue.
                </p>
              </div>

              <div class="product-details__tab-panel" data-panel="reviews">
                ${renderReviewsTab()}
              </div>

              <div class="product-details__tab-panel" data-panel="shipping">
                <p>
                  Nulla eleifend pulvinar purus, molestie euismod odio
                  imperdiet ac. Ut sit amet erat nec nibh rhoncus varius in
                  non lorem. Donec interdum, lectus in convallis pulvinar,
                  enim elit porta sapien, vel finibus erat felis sed neque.
                  Etiam aliquet neque sagittis erat tincidunt aliquam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="products-list products-list--product-details">
      <div class="products-list__container container">
        <div class="products-list__header header-block header-block--margin">
          <h2 class="header-block__title">You May Also Like</h2>
        </div>
        <ul class="products-list__list" id="youMayLikeList">
          ${renderYouMayAlsoLike()}
        </ul>
      </div>
    </section>
  `;

  mainElement.innerHTML = productHTML;
  setupProductEventListeners();
  initializeDropdowns();
}

// ======================================================
// Thumbnail Generation
// ======================================================

function generateThumbnails(): string {
  if (!currentProduct) return '';
  return Array(4)
    .fill(0)
    .map(
      (_, i) => `
        <div
          class="product-details__thumbnail ${
            i === 0 ? 'product-details__thumbnail--active' : ''
          }" data-index="${i}"
        >
          <img src="../${currentProduct!.imageUrl}" alt="${currentProduct!.name}" />
        </div>
      `,
    )
    .join('');
}

// ======================================================
// Dropdown Options Generation
// ======================================================

function generateSizeOptions(): string {
  if (!currentProduct) return '';
  const sizes = ['S', 'M', 'L', 'XL', 'S-L', 'S, M, XL'];
  return sizes
    .map(
      (size) => `
        <div
          class="custom-dropdown__option ${
            size === currentProduct!.size
              ? 'custom-dropdown__option--active'
              : ''
          }"
          data-value="${size}"
        >
        ${size}
        </div>
      `,
    )
    .join('');
}

function generateColorOptions(): string {
  if (!currentProduct) return '';
  const colors = ['Red', 'Blue', 'Green', 'Black', 'Grey', 'Yellow', 'Pink'];
  return colors
    .map(
      (color) => `
    <div class="custom-dropdown__option ${
      color.toLowerCase() === currentProduct!.color.toLowerCase()
        ? 'custom-dropdown__option--active'
        : ''
    }" data-value="${color.toLowerCase()}">
      ${color}
    </div>
  `,
    )
    .join('');
}

function generateCategoryOptions(): string {
  if (!currentProduct) return '';
  const categories = [
    'Suitcases',
    'Carry-ons',
    'Luggage Sets',
    "Kids' Luggage",
  ];
  return categories
    .map(
      (cat) => `
    <div class="custom-dropdown__option ${
      cat.toLowerCase() === currentProduct!.category.toLowerCase()
        ? 'custom-dropdown__option--active'
        : ''
    }" data-value="${cat.toLowerCase()}">
      ${cat}
    </div>
  `,
    )
    .join('');
}

// ======================================================
// Reviews Tab Rendering
// ======================================================

function renderReviewsTab(): string {
  if (!currentProduct) return '';
  return `
    <div class="reviews-section">
      <div class="reviews-section__content">
        <h3 class="reviews-section__title">
          1 review for ${currentProduct.name}
        </h3>

        <div class="reviews-section__list">
          <div class="review-item">
            <div class="review-item__header">
              <img
                src="../assets/images/testimonials/placeholder-ethan.jpg"
                alt="Ella Harper"
                class="review-item__avatar"
              />
              <div class="review-item__meta">
                <div class="review-item__info">
                  <h4 class="review-item__name">Ella Harper</h4>
                  <span class="review-item__date"
                    >/ June 11, 2025</span
                  >
                </div>
                <div class="review-item__rating">
                  ${renderStars(4)}
                </div>
              </div>
            </div>
            <p class="review-item__text">
              Proin iaculis nibh vitae lectus mollis bibendum.
              Quisque varius eget urna sit amet luctus.
              Suspendisse potenti curabitur ac placerat est, sit
              amet sodales risus.
            </p>
          </div>
        </div>
      </div>

      <div class="reviews-section__form-wrapper">
        <h3 class="reviews-section__form-title">Add Review</h3>
        <p class="reviews-section__form-subtitle">
          Your email address won't be shared with anybody.
          Required fields have the symbol *
        </p>

        <form class="review-form" id="reviewForm">
          <div class="review-form__rating">
            <label class="review-form__label">RATE PRODUCT</label>
            <div class="review-form__stars" id="ratingStars">
              ${Array(5)
                .fill(0)
                .map(
                  (_, i) => `
                  <button
                    type="button"
                    class="review-form__star"
                    data-rating="${i + 1}"
                  >
                    <img
                      src="../assets/icons/rating/star-btn.svg"
                      alt="star"
                    />
                  </button>
                `,
                )
                .join('')}
            </div>
            <div
              class="review-form__error"
              id="ratingError"
            ></div>
          </div>

          <div class="review-form__field">
            <textarea
              class="review-form__textarea textarea textarea--product-details"
              id="reviewText"
              name="review"
              placeholder="Your Review*"
              rows="6"
            ></textarea>
            <div
              class="review-form__error"
              id="reviewError"
            ></div>
          </div>

          <div class="review-form__row">
            <div class="review-form__field">
              <input
                type="text"
                class="review-form__input input input--product-details"
                id="reviewerName"
                name="name"
                placeholder="Your Name*"
              />
              <div
                class="review-form__error"
                id="nameError"
              ></div>
            </div>

            <div class="review-form__field">
              <input
                type="email"
                class="review-form__input input input--product-details"
                id="reviewerEmail"
                name="email"
                placeholder="Your Email*"
              />
              <div
                class="review-form__error"
                id="reviewEmailError"
              ></div>
            </div>
          </div>

          <div class="review-form__checkbox-wrapper">
            <input
              type="checkbox"
              id="saveReviewInfo"
              class="review-form__checkbox"
            />
            <label
              for="saveReviewInfo"
              class="review-form__checkbox-label"
            >
              Save my name, email, and website in this browser for
              when I leave another comment.
            </label>
          </div>

          <button
            type="submit"
            class="review-form__submit btn btn--action"
          >
            SUBMIT
          </button>
        </form>

        <div
          class="form__messages"
          id="reviewMessages"
        ></div>
      </div>
    </div>
  `;
}

// ======================================================
// You May Also Like Section
// ======================================================

function renderYouMayAlsoLike(): string {
  if (!currentProduct) return '';
  const otherProducts = products.filter((p) => p.id !== currentProduct!.id);
  const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);

  return selected
    .map((product) => {
      const productWithPath = {
        ...product,
        imageUrl: `../${product.imageUrl}`,
      };
      return createProductCard(productWithPath, {
        itemClass: 'products-list__item',
        action: 'add-to-cart',
        buttonLabel: 'Add To Cart',
        linkPrefix: './',
      });
    })
    .join('');
}

// ======================================================
// Error & Not Found Pages
// ======================================================

function renderNotFound(): void {
  if (!mainElement) return;
  mainElement.innerHTML = `
    <section class="error-state">
      <div class="error-state__container container">
        <div class="error-state__content header-block">
          <h1 class="header-block__title">Product Not Found</h1>
          <p class="header-block__subtitle">The product you're looking for doesn't exist.</p>
          <a href="./catalog.html" class="btn btn--primary">Back to Catalog</a>
        </div>
      </div>
    </section>
  `;
}

function renderError(): void {
  if (!mainElement) return;
  mainElement.innerHTML = `
    <section class="error-state">
      <div class="error-state__container container">
        <div class="error-state__content header-block">
          <h1 class="header-block__title">Something Went Wrong</h1>
          <p class="header-block__subtitle">We couldn't load the product details. Please try again later.</p>
          <a href="../index.html" class="btn btn--primary">Back to Home</a>
        </div>
      </div>
    </section>
  `;
}

// ======================================================
// Quantity Controls
// ======================================================

function updateProductDetailsQuantity(delta: number): void {
  currentQuantity = Math.max(1, currentQuantity + delta);
  const qtyValue = document.getElementById('qtyValue');
  if (qtyValue) {
    qtyValue.textContent = String(currentQuantity);
  }
}

// ======================================================
// Add to Cart
// ======================================================

function handleProductAddToCart(): void {
  if (!currentProduct) return;

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === currentProduct!.id);

  if (existingItem) {
    existingItem.quantity += currentQuantity;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      imageUrl: currentProduct.imageUrl,
      quantity: currentQuantity,
      size: currentProduct.size, // Fallback if no dynamic update
      color: currentProduct.color,
      addedAt: new Date().toISOString(),
    });
  }

  setCart(cart);
  updateGlobalCartCounter();
  animateCartCounter();

  // Reset quantity
  currentQuantity = 1;
  const qtyValue = document.getElementById('qtyValue');
  if (qtyValue) {
    qtyValue.textContent = String(currentQuantity);
  }

  // Show feedback
  showAddToCartFeedback();
}

function showAddToCartFeedback(): void {
  const btn = document.getElementById(
    'addToCartBtn',
  ) as HTMLButtonElement | null;
  if (!btn) return;

  const originalText = btn.textContent ?? 'Add To Cart';
  btn.textContent = 'Added to Cart!';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 1500);
}

// ======================================================
// Tab Switching
// ======================================================

function switchTab(tabName: string | undefined): void {
  if (!tabName) return;

  // Update buttons
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(
    '.product-details__tab-btn',
  );
  tabButtons.forEach((btn) => {
    btn.classList.toggle(
      'product-details__tab-btn--active',
      btn.dataset.tab === tabName,
    );
  });

  // Update panels
  const tabPanels = document.querySelectorAll<HTMLElement>(
    '.product-details__tab-panel',
  );
  tabPanels.forEach((panel) => {
    panel.classList.toggle(
      'product-details__tab-panel--active',
      panel.dataset.panel === tabName,
    );
  });
}

// ======================================================
// Image Gallery
// ======================================================

function handleThumbnailClick(index: number): void {
  selectedImageIndex = index;

  // Update thumbnail active state
  const thumbnails = document.querySelectorAll<HTMLElement>(
    '.product-details__thumbnail',
  );
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('product-details__thumbnail--active', i === index);
  });

  // Update main image
  const mainImage = document.getElementById(
    'mainProductImage',
  ) as HTMLImageElement | null;
  if (mainImage) {
    mainImage.style.opacity = '0';
    setTimeout(() => {
      mainImage.style.opacity = '1';
    }, 150);
  }
}

// ======================================================
// Custom Dropdowns
// ======================================================

function handleProductDetailsDropdownClick(
  e: MouseEvent,
  options: NodeListOf<HTMLElement>,
  selected: HTMLElement,
  dropdown: HTMLElement,
): void {
  e.stopPropagation();
  const option = e.currentTarget as HTMLElement;

  // Update active state
  options.forEach((opt) =>
    opt.classList.remove('custom-dropdown__option--active'),
  );
  option.classList.add('custom-dropdown__option--active');

  // Update display
  selected.textContent = option.textContent;

  // Close dropdown
  dropdown.classList.remove('custom-dropdown--open');
}

function initializeDropdowns(): void {
  const dropdowns = document.querySelectorAll<HTMLElement>(
    '.custom-dropdown--product',
  );

  dropdowns.forEach((dropdown) => {
    const options = dropdown.querySelectorAll<HTMLElement>(
      '.custom-dropdown__option',
    );
    const selected = dropdown.querySelector<HTMLElement>(
      '.custom-dropdown__selected',
    );

    if (!selected) return;

    options.forEach((option) => {
      option.addEventListener('click', (e: MouseEvent) => {
        handleProductDetailsDropdownClick(e, options, selected, dropdown);
      });
    });

    dropdown.addEventListener('mouseenter', () => {
      dropdown.classList.add('custom-dropdown--open');
    });

    dropdown.addEventListener('mouseleave', () => {
      dropdown.classList.remove('custom-dropdown--open');
    });
  });
}

// ======================================================
// Review Form Validation
// ======================================================

function validateReviewField(
  fieldName: string,
  value: string | number,
): string {
  switch (fieldName) {
    case 'name':
      return String(value).trim() === '' ? 'Name is required' : '';
    case 'email':
      if (String(value).trim() === '') return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))
        return 'Please enter a valid email';
      return '';
    case 'review':
      return String(value).trim() === '' ? 'Review is required' : '';
    case 'rating':
      return reviewForm.rating === 0 ? 'Please select a rating' : '';
    default:
      return '';
  }
}

function showReviewError(fieldName: string, message: string): void {
  let errorId = `${fieldName}Error`;
  if (fieldName === 'email') {
    errorId = 'reviewEmailError';
  }

  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = message ? 'block' : 'none';
  }

  let input: HTMLInputElement | HTMLTextAreaElement | null = null;
  if (fieldName === 'name') {
    input = document.getElementById('reviewerName') as HTMLInputElement | null;
  } else if (fieldName === 'email') {
    input = document.getElementById('reviewerEmail') as HTMLInputElement | null;
  } else if (fieldName === 'review') {
    input = document.getElementById('reviewText') as HTMLTextAreaElement | null;
  }

  if (input) {
    if (message) {
      input.classList.add('review-form__input--error');
    } else {
      input.classList.remove('review-form__input--error');
    }
  }
}

function clearReviewErrors(): void {
  ['name', 'email', 'review', 'rating'].forEach((field) => {
    showReviewError(field, '');
  });
}

function handleRatingClick(rating: number): void {
  reviewForm.rating = rating;

  const stars =
    document.querySelectorAll<HTMLButtonElement>('.review-form__star');
  stars.forEach((star, i) => {
    star.classList.toggle('review-form__star--active', i < rating);
    const img = star.querySelector('img');
    if (img) {
      img.src =
        i < rating
          ? '../assets/icons/rating/star.svg'
          : '../assets/icons/rating/star-btn.svg';
    }
  });

  showReviewError('rating', '');
}

function handleRatingHover(rating: number): void {
  const stars =
    document.querySelectorAll<HTMLButtonElement>('.review-form__star');
  stars.forEach((star, i) => {
    const img = star.querySelector('img');
    if (img) {
      img.src =
        i < rating
          ? '../assets/icons/rating/star.svg'
          : '../assets/icons/rating/star-btn.svg';
    }
  });
}

function handleRatingMouseLeave(): void {
  const stars =
    document.querySelectorAll<HTMLButtonElement>('.review-form__star');
  stars.forEach((star, i) => {
    const img = star.querySelector('img');
    if (img) {
      img.src =
        i < reviewForm.rating
          ? '../assets/icons/rating/star.svg'
          : '../assets/icons/rating/star-btn.svg';
    }
  });
}

function handleReviewInput(e: Event): void {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  const fieldName = target.name as ReviewField;

  if (fieldName !== 'rating' && reviewForm.touched[fieldName]) {
    const error = validateReviewField(fieldName, target.value);
    showReviewError(fieldName, error);
  }
}

function handleReviewBlur(e: Event): void {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  const fieldName = target.name as ReviewField;

  if (fieldName !== 'rating') {
    reviewForm.touched[fieldName] = true;
    const error = validateReviewField(fieldName, target.value);
    showReviewError(fieldName, error);
  }
}

function showReviewMessage(
  type: 'success' | 'error',
  title: string,
  text: string,
): void {
  const messagesContainer = document.getElementById('reviewMessages');
  if (!messagesContainer) return;

  messagesContainer.innerHTML = '';

  const messageDiv = document.createElement('div');
  messageDiv.className = `form__message form__message--${type}`;
  messageDiv.innerHTML = `
    <div class="form__message-content">
      <h3 class="form__message-title">${title}</h3>
      <p class="form__message-text">${text}</p>
    </div>
  `;

  messagesContainer.appendChild(messageDiv);

  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    messageDiv.style.opacity = '0';
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}

async function handleReviewSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault();
  const form = e.target as HTMLFormElement;

  // Mark all fields as touched
  (
    Object.keys(reviewForm.touched) as Array<keyof ReviewFormState['touched']>
  ).forEach((key) => {
    reviewForm.touched[key] = true;
  });

  // Validate all fields
  const nameInput = document.getElementById(
    'reviewerName',
  ) as HTMLInputElement | null;
  const emailInput = document.getElementById(
    'reviewerEmail',
  ) as HTMLInputElement | null;
  const reviewInput = document.getElementById(
    'reviewText',
  ) as HTMLTextAreaElement | null;

  const name = nameInput ? nameInput.value : '';
  const email = emailInput ? emailInput.value : '';
  const review = reviewInput ? reviewInput.value : '';

  const errors: Record<string, string> = {
    name: validateReviewField('name', name),
    email: validateReviewField('email', email),
    review: validateReviewField('review', review),
    rating: validateReviewField('rating', reviewForm.rating),
  };

  // Show errors
  Object.keys(errors).forEach((field) => {
    showReviewError(field, errors[field]);
  });

  // Check if form is valid
  const isValid = Object.keys(errors).every((key) => {
    const error = errors[key];
    return error === '';
  });

  if (!isValid) return;

  // Simulate form submission
  const submitBtn = form.querySelector(
    'button[type="submit"]',
  ) as HTMLButtonElement | null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-spinner"></span>
      Submitting...
    `;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    showReviewMessage(
      'success',
      'Review submitted successfully!',
      'Thank you for your feedback. Your review will be published shortly.',
    );

    // Reset form
    form.reset();
    reviewForm.rating = 0;

    document
      .querySelectorAll<HTMLElement>('.review-form__star')
      .forEach((star) => {
        star.classList.remove('review-form__star--active');
      });

    // Reset touched state
    const touchedKeys = Object.keys(reviewForm.touched) as Array<
      keyof ReviewFormState['touched']
    >;
    touchedKeys.forEach((key) => {
      reviewForm.touched[key] = false;
    });

    clearReviewErrors();
  } catch (error) {
    showReviewMessage(
      'error',
      'Oops! Something went wrong.',
      'Please try again later or contact us directly.',
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT';
    }
  }
}

// ======================================================
// Event Listeners Setup
// ======================================================

function setupProductEventListeners(): void {
  // Quantity controls
  const qtyMinusBtn = document.getElementById('qtyMinusBtn');
  const qtyPlusBtn = document.getElementById('qtyPlusBtn');
  if (qtyMinusBtn)
    qtyMinusBtn.addEventListener('click', () =>
      updateProductDetailsQuantity(-1),
    );
  if (qtyPlusBtn)
    qtyPlusBtn.addEventListener('click', () => updateProductDetailsQuantity(1));

  // Add to cart
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn)
    addToCartBtn.addEventListener('click', handleProductAddToCart);

  // Tab switching
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(
    '.product-details__tab-btn',
  );
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Thumbnails
  const thumbnails = document.querySelectorAll<HTMLElement>(
    '.product-details__thumbnail',
  );
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => handleThumbnailClick(index));
  });

  // Rating stars
  const ratingStars =
    document.querySelectorAll<HTMLButtonElement>('.review-form__star');
  ratingStars.forEach((star) => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating ?? '0');
      handleRatingClick(rating);
    });
    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.dataset.rating ?? '0');
      handleRatingHover(rating);
    });
  });

  // Rating container mouse leave
  const ratingContainer = document.getElementById('ratingStars');
  if (ratingContainer) {
    ratingContainer.addEventListener('mouseleave', handleRatingMouseLeave);
  }

  // Review form inputs
  const reviewInputs = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >('.review-form__input, .review-form__textarea');
  reviewInputs.forEach((input) => {
    input.addEventListener('input', handleReviewInput);
    input.addEventListener('blur', handleReviewBlur);
  });

  // Review form submission
  const reviewFormEl = document.getElementById(
    'reviewForm',
  ) as HTMLFormElement | null;
  if (reviewFormEl) {
    reviewFormEl.addEventListener('submit', handleReviewSubmit);
  }

  // You May Also Like - Add to Cart
  const youMayLikeList = document.getElementById('youMayLikeList');
  if (youMayLikeList) {
    youMayLikeList.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLElement>('[data-action="add-to-cart"]');
      if (btn) {
        e.stopPropagation();
        const card = btn.closest<HTMLElement>('.product-card');
        const productId = card?.dataset.productId;
        if (productId) {
          const product = products.find((p) => p.id === productId);
          if (product) addProductToCart(product);
        }
      }
    });
  }
}

// ======================================================
// Initialize
// ======================================================

async function initProduct(): Promise<void> {
  mainElement = document.querySelector('.main');
  if (!mainElement) return;

  await loadSingleProductDetails();
}

document.addEventListener('DOMContentLoaded', initProduct);

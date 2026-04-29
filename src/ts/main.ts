/// <reference path="./home.ts" />
/// <reference path="./catalog.ts" />
/// <reference path="./product.ts" />
/// <reference path="./cart.ts" />
/// <reference path="./about.ts" />
/// <reference path="./contact.ts" />

// ======================================================
// Types & Interfaces
// ======================================================

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  salesStatus: boolean;
  blocks: string[];
  category: string;
  color: string;
  size: string;
  popularity: number;
  rating: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size: string;
  color: string;
  addedAt: string;
}

interface ProductCardOptions {
  itemClass?: string;
  action?: string;
  buttonLabel?: string;
  linkPrefix?: string;
}

type ActionHandler = (product: Product, productId: string) => void;

interface ActionHandlers {
  [key: string]: ActionHandler;
}

// ======================================================
// Constants
// ======================================================

const MOBILE_BREAKPOINT = 560;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ======================================================
// Cart Utilities
// ======================================================

function getCart(): CartItem[] {
  const saved = localStorage.getItem('cart');
  return saved ? (JSON.parse(saved) as CartItem[]) : [];
}

function setCart(cart: CartItem[]): void {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateGlobalCartCounter(): void {
  const cartCounter = document.getElementById('cartCounter');
  if (!cartCounter) return;

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartCounter.textContent = String(totalItems);
  cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
}

function animateCartCounter(): void {
  const counter = document.getElementById('cartCounter');
  if (!counter) return;

  counter.style.animation = 'none';
  setTimeout(() => {
    counter.style.animation = 'cartBounce 0.3s ease';
  }, 10);
}

function addProductToCart(product: Product): void {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      size: '',
      color: '',
      addedAt: new Date().toISOString(),
    });
  }

  setCart(cart);
  updateGlobalCartCounter();
  animateCartCounter();
}

// ======================================================
// Product Card Component
// ======================================================

function createProductCard(
  product: Product,
  options: ProductCardOptions = {},
): string {
  const {
    itemClass = '',
    action = 'add-to-cart',
    buttonLabel = 'Add To Cart',
    linkPrefix = '',
  } = options;

  const card = `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__image-wrapper">
        <img 
          class="product-card__image" 
          src="${product.imageUrl}" 
          alt="${product.name}" 
          loading="lazy" 
        />
        ${product.salesStatus ? '<span class="product-card__badge">SALE</span>' : ''}
      </div>
      <div class="product-card__content">
        <h3 class="product-card__title">${product.name}</h3>
        <p class="product-card__price" data-value="$">${product.price}</p>
        <button class="product-card__button btn btn--card" data-action="${action}">
          ${buttonLabel}
        </button>
      </div>
      <a href="${linkPrefix}product-details.html?id=${product.id}" class="product-card__link"></a>
    </article>
  `;

  return itemClass ? `<li class="${itemClass}">${card}</li>` : card;
}

// ======================================================
// Header Scroll Effect
// ======================================================

function setupHeaderScroll(): void {
  const headerEl = document.querySelector<HTMLElement>('.header');
  if (!headerEl) return;

  // Capture in a const so TypeScript knows it's stable inside nested functions
  const header: HTMLElement = headerEl;
  let ticking = false;

  function updateHeader(): void {
    const currentScrollY = window.scrollY;

    if (window.innerWidth > MOBILE_BREAKPOINT) {
      if (currentScrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    } else {
      header.classList.remove('header--scrolled');
    }

    ticking = false;
  }

  function requestTick(): void {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  updateHeader();

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', updateHeader);
}

// ======================================================
// Navigation Utilities
// ======================================================

function setActiveNavLink(): void {
  const navLinks = document.querySelectorAll<HTMLAnchorElement>(
    '.nav__list .nav__link',
  );
  const currentPathname =
    window.location.pathname.split('/').pop()?.toLowerCase() ?? '';

  navLinks.forEach((link) => {
    const linkPathname =
      link.getAttribute('href')?.split('/').pop()?.toLowerCase() ?? '';

    const isRoot = currentPathname === '' || currentPathname === 'index.html';
    const isLinkRoot = linkPathname === 'index.html';

    if (isRoot && isLinkRoot) {
      link.classList.add('nav__link--active');
    } else if (
      !isRoot &&
      linkPathname.startsWith(currentPathname.split('?')[0])
    ) {
      link.classList.add('nav__link--active');
    } else {
      link.classList.remove('nav__link--active');
    }
  });
}

function toggleMenu(toggle: HTMLElement, list: HTMLElement): void {
  const isActive = toggle.classList.toggle('active');
  list.classList.toggle('active');
  toggle.setAttribute('aria-expanded', String(isActive));
  document.body.classList.toggle('no-scroll', isActive);
}

function closeMenu(toggle: HTMLElement, list: HTMLElement): void {
  toggle.classList.remove('active');
  list.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

function setupMobileMenu(): void {
  const navToggle = document.querySelector<HTMLElement>('.nav__toggle');
  const navList = document.querySelector<HTMLElement>('.nav__list');
  const navLinks = document.querySelectorAll<HTMLElement>('.nav__link');
  const filtersToggleBtn = document.getElementById('filtersToggleBtn');

  if (!navToggle || !navList) return;

  navToggle.addEventListener('click', () => {
    toggleMenu(navToggle, navList);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => closeMenu(navToggle, navList));
  });

  if (filtersToggleBtn) {
    filtersToggleBtn.addEventListener('click', () => {
      closeMenu(navToggle, navList);
    });
  }

  document.addEventListener('click', (e: MouseEvent) => {
    if (!(e.target as Element).closest('.nav')) {
      closeMenu(navToggle, navList);
    }
  });
}

function handleWindowResize(): void {
  const navToggle = document.querySelector<HTMLElement>('.nav__toggle');
  const navList = document.querySelector<HTMLElement>('.nav__list');

  if (navToggle && navList && window.innerWidth > MOBILE_BREAKPOINT) {
    if (navList.classList.contains('active')) {
      navToggle.classList.remove('active');
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  }
}

// ======================================================
// Log In Modal
// ======================================================

interface LoginTouched {
  email: boolean;
  password: boolean;
}

const loginTouched: LoginTouched = {
  email: false,
  password: false,
};

function createLoginModal(): void {
  if (document.getElementById('loginModal')) return;

  const isRootPage = !window.location.pathname.includes('/html/');
  const iconPath = isRootPage
    ? 'assets/icons/password/'
    : '../assets/icons/password/';

  const modalHTML = `
    <div class="login-modal modal--login" id="loginModal">
      <div class="login-modal__content">
        <form class="login-modal__form" id="loginForm" novalidate>
          <div class="login-modal__field-group">
            <label for="loginEmail" class="login-modal__label">
              Email address <span>*</span>
            </label>
            <input
              type="email"
              id="loginEmail"
              name="loginEmail"
              class="login-modal__input login-modal__input--email input input--login"
              required
            />
            <div class="login-modal__error" id="emailError"></div>
          </div>

          <div class="login-modal__field-group">
            <label for="loginPassword" class="login-modal__label">
              Password <span>*</span>
            </label>
            <div class="login-modal__password-wrapper">
              <input
                type="password"
                id="loginPassword"
                name="loginPassword"
                class="login-modal__input login-modal__input--password input input--login"
                required
              />
              <button
                type="button"
                class="login-modal__password-toggle"
                id="passwordToggleBtn"
                aria-label="Show password"
              >
                <img
                  src="${iconPath}eye-closed.svg"
                  alt="eye"
                  class="login-modal__password-toggle-icon"
                  id="toggleIcon"
                />
              </button>
            </div>
            <div class="login-modal__error" id="passwordError"></div>
          </div>

          <div class="login-modal__options">
            <div class="login-modal__remember-me">
              <input type="checkbox" id="remember" class="login-modal__checkbox" />
              <label for="remember" class="login-modal__checkbox-label">Remember me</label>
            </div>
            <a href="#" class="login-modal__link">Forgot Your Password?</a>
          </div>

          <button type="submit" class="login-modal__button btn btn--action">Log In</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openLoginModal(): void {
  createLoginModal();
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('login-modal--active');
    document.body.classList.add('no-scroll');
    setupLoginValidationListeners();
  }
}

function closeLoginModal(): void {
  const modal = document.getElementById('loginModal');
  if (!modal) return;

  modal.classList.remove('login-modal--active');
  document.body.classList.remove('no-scroll');

  const form = document.getElementById('loginForm') as HTMLFormElement | null;
  if (form) {
    form.reset();
    clearLoginErrors();
    loginTouched.email = false;
    loginTouched.password = false;
  }
}

function clearLoginErrors(): void {
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  if (emailError) emailError.textContent = '';
  if (passwordError) passwordError.textContent = '';
  if (emailInput) emailInput.classList.remove('login-modal__input--error');
  if (passwordInput)
    passwordInput.classList.remove('login-modal__input--error');
}

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateLoginField(
  fieldName: 'email' | 'password',
  value: string,
): string {
  switch (fieldName) {
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!validateEmail(value.trim()))
        return 'Please enter a valid email address';
      return '';
    case 'password':
      if (!value) return 'Password is required';
      return '';
    default:
      return '';
  }
}

function showLoginError(
  fieldName: 'email' | 'password',
  message: string,
): void {
  const errorElement = document.getElementById(`${fieldName}Error`);
  const inputElement = document.getElementById(
    fieldName === 'email' ? 'loginEmail' : 'loginPassword',
  );

  if (errorElement) errorElement.textContent = message;

  if (inputElement) {
    if (message) {
      inputElement.classList.add('login-modal__input--error');
    } else {
      inputElement.classList.remove('login-modal__input--error');
    }
  }
}

function handleLoginInputChange(e: Event): void {
  const target = e.target as HTMLInputElement;
  const fieldName: 'email' | 'password' =
    target.id === 'loginEmail' ? 'email' : 'password';

  if (loginTouched[fieldName]) {
    const error = validateLoginField(fieldName, target.value);
    showLoginError(fieldName, error);
  }
}

function handleLoginInputBlur(e: Event): void {
  const target = e.target as HTMLInputElement;
  const fieldName: 'email' | 'password' =
    target.id === 'loginEmail' ? 'email' : 'password';

  loginTouched[fieldName] = true;
  const error = validateLoginField(fieldName, target.value);
  showLoginError(fieldName, error);
}

function setupLoginValidationListeners(): void {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  if (emailInput) {
    emailInput.addEventListener('input', handleLoginInputChange);
    emailInput.addEventListener('blur', handleLoginInputBlur);
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', handleLoginInputChange);
    passwordInput.addEventListener('blur', handleLoginInputBlur);
  }
}

function handleLoginSubmit(e: Event): void {
  e.preventDefault();

  const emailInput = document.getElementById(
    'loginEmail',
  ) as HTMLInputElement | null;
  const passwordInput = document.getElementById(
    'loginPassword',
  ) as HTMLInputElement | null;

  if (!emailInput || !passwordInput) return;

  loginTouched.email = true;
  loginTouched.password = true;

  const emailError = validateLoginField('email', emailInput.value);
  const passwordError = validateLoginField('password', passwordInput.value);

  showLoginError('email', emailError);
  showLoginError('password', passwordError);

  if (!emailError && !passwordError) {
    console.log('Login successful');
    closeLoginModal();
  }
}

function togglePasswordVisibility(): void {
  const passwordInput = document.getElementById(
    'loginPassword',
  ) as HTMLInputElement | null;
  const toggleIcon = document.getElementById(
    'toggleIcon',
  ) as HTMLImageElement | null;
  const toggleBtn = document.getElementById('passwordToggleBtn');

  if (!passwordInput || !toggleIcon) return;

  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';

  const isRootPage = !window.location.pathname.includes('/html/');
  const iconPath = isRootPage
    ? 'assets/icons/password/'
    : '../assets/icons/password/';

  toggleIcon.src = iconPath + (isPassword ? 'eye-open.svg' : 'eye-closed.svg');

  if (toggleBtn) {
    toggleBtn.setAttribute(
      'aria-label',
      isPassword ? 'Hide password' : 'Show password',
    );
  }
}

function setupLoginModal(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as Element;

    if (target.closest('.user-controls__icon--profile')) {
      openLoginModal();
      return;
    }

    const modal = document.getElementById('loginModal');
    if (modal && e.target === modal) {
      closeLoginModal();
      return;
    }

    if (target.closest('#passwordToggleBtn')) {
      togglePasswordVisibility();
    }
  });

  document.addEventListener('submit', (e: SubmitEvent) => {
    const target = e.target as HTMLElement;
    if (target.id === 'loginForm') {
      handleLoginSubmit(e);
    }
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLoginModal();
    }
  });
}

// ======================================================
// Rating Stars Component
// ======================================================

function renderStars(
  rating: number,
  iconPath = '../assets/icons/rating/',
): string {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    const icon = i <= rating ? 'star.svg' : 'star-empty.svg';
    const altText = i <= rating ? 'star' : 'star-empty';
    const emptyClass = i <= rating ? '' : ' rating-star--empty';
    stars += `<img src="${iconPath}${icon}" alt="${altText}" class="rating-star${emptyClass}" />`;
  }
  return stars;
}

// ======================================================
// Data Loading Utilities
// ======================================================

async function loadJSON<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error('Error loading JSON:', error);
    return null;
  }
}

// ======================================================
// Event Delegation Helper
// ======================================================

function handleProductCardClick(
  e: MouseEvent,
  products: Product[],
  actionHandlers: ActionHandlers,
): void {
  const target = e.target as Element;
  const btn = target.closest<HTMLButtonElement>('button[data-action]');
  if (!btn) return;

  e.stopPropagation();

  const card = btn.closest<HTMLElement>('.product-card');
  const productId = card?.dataset.productId;
  if (!productId) return;

  const action = btn.dataset.action;
  if (!action) return;

  const handler = actionHandlers[action];
  if (handler) {
    const product = products.find((p) => p.id === productId);
    if (product) handler(product, productId);
  }
}

// ======================================================
// Dynamic Components HTML
// ======================================================

const HEADER_HTML = `
  <div class="container header__container">
    <div class="header__top">
      <div class="header__socials socials">
        <a href="#" class="socials__link socials__link--facebook" aria-label="Facebook">
          <img src="assets/icons/social/facebook.svg" alt="facebook-icon" />
        </a>
        <a href="#" class="socials__link socials__link--twitter" aria-label="Twitter">
          <img src="assets/icons/social/twitter.svg" alt="twitter-icon" />
        </a>
        <a href="#" class="socials__link socials__link--instagram" aria-label="Instagram">
          <img src="assets/icons/social/instagram.svg" alt="instagram-icon" />
        </a>
      </div>

      <div class="header__logo logo">
        <a href="index.html" class="logo__link">
          <img src="assets/icons/logo/logo.svg" alt="logo" class="logo__icon" />
          <span class="logo__text">BEST SHOP</span>
        </a>
      </div>

      <div class="header__user-controls user-controls">
        <button class="user-controls__icon user-controls__icon--profile">
          <img src="assets/icons/user-controls/user.svg" alt="user-icon" />
        </button>
        <a href="html/cart.html" class="user-controls__icon user-controls__icon--cart">
          <img src="assets/icons/user-controls/shopping-cart.svg" alt="shopping-cart-icon" />
          <span class="user-controls__cart-counter" id="cartCounter"></span>
        </a>
      </div>
    </div>

    <nav class="header__bottom nav">
      <button class="nav__toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span class="nav__toggle-line"></span>
        <span class="nav__toggle-line"></span>
        <span class="nav__toggle-line"></span>
      </button>

      <ul class="nav__list">
        <li class="nav__item">
          <a href="index.html" class="nav__link">Home</a>
        </li>
        <li class="nav__item nav__item--dropdown">
          <a href="html/catalog.html" class="nav__link">Catalog</a>
          <button class="nav__dropdown" id="filtersToggleBtn">
            <img src="assets/icons/arrows/arrow-down.svg" alt="arrow-down" />
          </button>
        </li>
        <li class="nav__item">
          <a href="html/about.html" class="nav__link">About Us</a>
        </li>
        <li class="nav__item">
          <a href="html/contact.html" class="nav__link">Contact Us</a>
        </li>
      </ul>
    </nav>
  </div>
`;

const FOOTER_HTML = `
  <div class="footer__benefits">
    <div class="footer__benefits-container container">
      <h3>Our Benefits</h3>
      <div class="footer__benefits-list">
        <div class="benefit-item">
          <img src="assets/icons/footer-benefits/footer-benefit-1.svg" alt="footer-benefit-1" class="benefit-item__icon" />
          <p class="benefit-item__text">Velit nisl sodales eget donec quis. volutpat orci.</p>
        </div>
        <div class="benefit-item">
          <img src="assets/icons/footer-benefits/footer-benefit-2.svg" alt="footer-benefit-2" class="benefit-item__icon" />
          <p class="benefit-item__text">Dolor eu varius. Morbi fermentum velit nisl.</p>
        </div>
        <div class="benefit-item">
          <img src="assets/icons/footer-benefits/footer-benefit-3.svg" alt="footer-benefit-3" class="benefit-item__icon" />
          <p class="benefit-item__text">Malesuada fames ac ante ipsum primis in faucibus.</p>
        </div>
        <div class="benefit-item">
          <img src="assets/icons/footer-benefits/footer-benefit-4.svg" alt="footer-benefit-4" class="benefit-item__icon" />
          <p class="benefit-item__text">Nisl sodales eget donec quis. volutpat orci.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="footer__main">
    <div class="footer__main-container container">
      <div class="footer__content">
        <div class="footer__columns">
          <div class="footer__col">
            <a href="html/about.html" class="footer__heading-link">
              <h4 class="footer__heading">About Us</h4>
            </a>
            <ul class="footer__list">
              <li class="footer__item"><a href="#" class="footer__link">Organisation</a></li>
              <li class="footer__item"><a href="#" class="footer__link">Partners</a></li>
              <li class="footer__item"><a href="#" class="footer__link">Clients</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4 class="footer__heading">Interesting Links</h4>
            <ul class="footer__list">
              <li class="footer__item"><a href="#" class="footer__link">Photo Gallery</a></li>
              <li class="footer__item"><a href="#" class="footer__link">Our Team</a></li>
              <li class="footer__item"><a href="#" class="footer__link">Socials</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4 class="footer__heading">Achievements</h4>
            <ul class="footer__list">
              <li class="footer__item"><a href="#" class="footer__link">Winning Awards</a></li>
              <li class="footer__item"><a href="#" class="footer__link">Press</a></li>
              <li class="footer__item"><a href="#" class="footer__link">Our Amazing Clients</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__shipping">
          <h4 class="footer__heading">Shipping Information</h4>
          <p class="footer__text">
            Nulla eleifend pulvinar purus, molestie euismod odio imperdiet ac.
            Ut sit amet erat nec nibh rhoncus varius in non lorem.
            Donec interdum, lectus in convallis pulvinar, enim elit porta sapien, vel finibus erat felis sed neque.
            Etiam aliquet neque sagittis erat tincidunt aliquam.
          </p>
        </div>
      </div>

      <div class="footer__contact contact">
        <div>
          <a href="html/contact.html" class="footer__heading-link">
            <h4 class="footer__heading">Contact Us</h4>
          </a>
          <p class="footer__text">
            Bendum dolor eu varius. Morbi fermentum velitsodales egetonec.
            volutpat orci. Sed ipsum felis, tristique egestas et, convallis ac velitn consequat nec luctus.
          </p>
        </div>
        <div class="contact__details contact-details">
          <div class="contact-details__item">
            <img src="assets/icons/footer-contact/footer-contact-1.svg" alt="footer-contact-icon-1" class="contact-details__icon" />
            <span class="footer__text">Phone: (+63) 236 6322</span>
          </div>
          <div class="contact-details__item">
            <img src="assets/icons/footer-contact/footer-contact-2.svg" alt="footer-contact-icon-2" class="contact-details__icon" />
            <span class="footer__text">public@news.com</span>
          </div>
          <div class="contact-details__item">
            <img src="assets/icons/footer-contact/footer-contact-3.svg" alt="footer-contact-icon-3" class="contact-details__icon" />
            <span class="footer__text">Mon - Fri: 10am - 6pm<br />Sat - Sun: 10am - 6pm</span>
          </div>
          <div class="contact-details__item">
            <img src="assets/icons/footer-contact/footer-contact-4.svg" alt="footer-contact-icon-4" class="contact-details__icon" />
            <span class="footer__text">639 Jade Valley,<br />Washington Dc</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer__copyright">
    <div class="container">
      <p>&copy; Copyright 2025</p>
    </div>
  </div>
`;

// ======================================================
// Component Loading Utility
// ======================================================

function loadDynamicComponents(): void {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  if (header) {
    header.innerHTML = HEADER_HTML;
    updateComponentPaths(header);
  }

  if (footer) {
    footer.innerHTML = FOOTER_HTML;
    updateComponentPaths(footer);
  }
}

// ======================================================
// Path Correction Utility
// ======================================================

function updateComponentPaths(componentElement: Element): void {
  const isNestedPage = window.location.pathname.includes('/html/');
  const prefix = isNestedPage ? '../' : '';

  const elements = componentElement.querySelectorAll<Element>('[src], [href]');

  elements.forEach((el) => {
    const originalHref = el.getAttribute('href');
    const originalSrc = el.getAttribute('src');

    if (originalSrc?.startsWith('assets/')) {
      el.setAttribute('src', prefix + originalSrc);
    }

    if (
      originalHref &&
      !originalHref.startsWith('#') &&
      !originalHref.includes('://')
    ) {
      if (originalHref === 'index.html' && isNestedPage) {
        el.setAttribute('href', '../index.html');
      } else if (originalHref.startsWith('html/') && isNestedPage) {
        el.setAttribute('href', originalHref.substring(5));
      }
    }
  });
}

// ======================================================
// Utility Functions
// ======================================================

function formatPrice(price: number): string {
  return `${price.toFixed(2)}`;
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function scrollToTopOnLoad(): void {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}

// ======================================================
// Initialize
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  scrollToTopOnLoad();
  loadDynamicComponents();
  setupHeaderScroll();
  setupLoginModal();
  setActiveNavLink();
  setupMobileMenu();
  updateGlobalCartCounter();
});

window.addEventListener('resize', handleWindowResize);

window.addEventListener('storage', (e: StorageEvent) => {
  if (e.key === 'cart') {
    updateGlobalCartCounter();
  }
});

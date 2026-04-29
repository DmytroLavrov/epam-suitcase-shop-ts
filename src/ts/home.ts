// import {
//   Product,
//   addProductToCart,
//   createProductCard,
//   getRandomItem,
//   loadJSON,
//   updateGlobalCartCounter,
// } from './main.js';

/// <reference path="./main.ts" />

// ======================================================
// Types
// ======================================================

interface SliderConfig {
  autoPlayDelay: number;
  mobileBreakpoint: number;
  resizeDebounce: number;
}

interface SliderState {
  isDragging: boolean;
  isAutoPlay: boolean;
  startX: number;
  startScrollLeft: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
  firstCardWidth: number;
}

interface CardData {
  image: string;
  title: string;
  description: string;
}

interface JsonResponse {
  data: Product[];
}

// ======================================================
// Slider Configuration & State
// ======================================================

const SLIDER_CONFIG: SliderConfig = {
  autoPlayDelay: 2500,
  mobileBreakpoint: 800,
  resizeDebounce: 250,
};

let sliderState: SliderState = {
  isDragging: false,
  isAutoPlay: true,
  startX: 0,
  startScrollLeft: 0,
  timeoutId: null,
  firstCardWidth: 0,
};

let wrapper: HTMLElement | null = null;
let sliderTrack: HTMLElement | null = null;
let arrowBtns: NodeListOf<HTMLElement>;

const cardData: CardData[] = [
  {
    image: 'assets/images/travel-suitcases/travel-suitcase-1.jpg',
    title: 'Premium Travel Collection',
    description:
      'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
  },
  {
    image: 'assets/images/travel-suitcases/travel-suitcase-2.jpg',
    title: 'Adventure Awaits You',
    description:
      'Phasellus risus turpis, pretium sit amet magna non, molestie ultricies.',
  },
  {
    image: 'assets/images/travel-suitcases/travel-suitcase-3.jpg',
    title: 'Journey in Style',
    description: 'Nullam pulvinar felis at metus consectetur adipiscing elit.',
  },
  {
    image: 'assets/images/travel-suitcases/travel-suitcase-4.jpg',
    title: 'Explore the World',
    description:
      'Curabitur vulputate arcu odio, ac facilisis diam accumsan ut.',
  },
  {
    image: 'assets/images/travel-suitcases/travel-suitcase-1.jpg',
    title: 'Luxury Travel Experience',
    description:
      'Perfect for your next adventure with premium quality materials.',
  },
  {
    image: 'assets/images/travel-suitcases/travel-suitcase-2.jpg',
    title: 'Modern Traveler Choice',
    description:
      'Designed for modern travelers who value both style and function.',
  },
];

const randomTitles: string[] = [
  'Duis vestibulum elit vel neque',
  'Neque vestibulum elit nequvel',
  'Elituis stibulum elit velneque',
  'Vel vestibulum elit tuvel euqen',
  'Premium Travel Collection',
  'Adventure Awaits You',
  'Journey in Style',
  'Explore the World',
  'Luxury Travel Experience',
  'Modern Traveler Choice',
  'Ultimate Comfort Design',
  'Travel Smart Collection',
];

const randomDescriptions: string[] = [
  'Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.',
  'Phasellus risus turpis, pretium sit amet magna non, molestie ultricies.',
  'Nullam pulvinar felis at metus consectetur adipiscing elit.',
  'Curabitur vulputate arcu odio, ac facilisis diam accumsan ut.',
  'Perfect for your next adventure with premium quality materials.',
  'Designed for modern travelers who value both style and function.',
  'Morbi fermentum velit sodales eget donec quis volutpat orci.',
  'Sed ipsum felis, tristique egestas et convallis ac velit.',
];

// ======================================================
// Slider Functions
// ======================================================

function createCard(data: CardData, useRandom = false): string {
  const title = useRandom ? getRandomItem(randomTitles) : data.title;
  const description = useRandom
    ? getRandomItem(randomDescriptions)
    : data.description;

  return `
    <article class="suitcase-card">
      <div class="suitcase-card__image-wrapper">
        <img
          src="${data.image}"
          alt="${title}"
          class="suitcase-card__image"
          draggable="false"
        />
      </div>
      <div class="suitcase-card__content">
        <h3 class="suitcase-card__title">${title}</h3>
        <p class="suitcase-card__description">${description}</p>
      </div>
    </article>
  `;
}

function initializeSlider(): number {
  if (!sliderTrack) return 0;

  sliderTrack.innerHTML = '';
  cardData.forEach((data) => {
    sliderTrack!.insertAdjacentHTML('beforeend', createCard(data, true));
  });

  const firstCard = sliderTrack.querySelector<HTMLElement>('.suitcase-card');
  if (!firstCard) return 0;

  const firstCardWidth = firstCard.offsetWidth;
  const cardPerView = Math.round(sliderTrack.offsetWidth / firstCardWidth);
  const cards = [...sliderTrack.children] as HTMLElement[];

  cards
    .slice(-cardPerView)
    .reverse()
    .forEach((card) => {
      sliderTrack!.insertAdjacentHTML('afterbegin', card.outerHTML);
    });

  cards.slice(0, cardPerView).forEach((card) => {
    sliderTrack!.insertAdjacentHTML('beforeend', card.outerHTML);
  });

  sliderTrack.classList.add('no-transition');
  sliderTrack.scrollLeft = sliderTrack.offsetWidth;
  sliderTrack.classList.remove('no-transition');

  return firstCardWidth;
}

function dragStart(e: MouseEvent | TouchEvent): void {
  sliderState.isDragging = true;
  sliderTrack?.classList.add('dragging');
  sliderState.startX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
  sliderState.startScrollLeft = sliderTrack?.scrollLeft ?? 0;
}

function dragging(e: MouseEvent | TouchEvent): void {
  if (!sliderState.isDragging || !sliderTrack) return;
  const x = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
  sliderTrack.scrollLeft =
    sliderState.startScrollLeft - (x - sliderState.startX);
}

function dragStop(): void {
  sliderState.isDragging = false;
  sliderTrack?.classList.remove('dragging');
}

function handleInfiniteScroll(): void {
  if (!sliderTrack || !wrapper) return;

  if (sliderTrack.scrollLeft <= 1) {
    sliderTrack.classList.add('no-transition');
    sliderTrack.scrollLeft =
      sliderTrack.scrollWidth - 2 * sliderTrack.offsetWidth;
    sliderTrack.classList.remove('no-transition');
  } else if (
    sliderTrack.scrollLeft >=
    sliderTrack.scrollWidth - sliderTrack.offsetWidth - 1
  ) {
    sliderTrack.classList.add('no-transition');
    sliderTrack.scrollLeft = sliderTrack.offsetWidth;
    sliderTrack.classList.remove('no-transition');
  }

  if (sliderState.timeoutId !== null) {
    clearTimeout(sliderState.timeoutId);
  }

  if (!wrapper.matches(':hover')) {
    autoPlay();
  }
}

function autoPlay(): void {
  if (
    window.innerWidth < SLIDER_CONFIG.mobileBreakpoint ||
    !sliderState.isAutoPlay
  )
    return;

  sliderState.timeoutId = setTimeout(() => {
    if (sliderTrack) {
      sliderTrack.scrollLeft += sliderState.firstCardWidth;
    }
  }, SLIDER_CONFIG.autoPlayDelay);
}

function setupSliderListeners(): void {
  if (!wrapper || !sliderTrack) return;

  arrowBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const direction = btn.id === 'left' ? -1 : 1;
      if (sliderTrack) {
        sliderTrack.scrollLeft += direction * sliderState.firstCardWidth;
      }
    });
  });

  sliderTrack.addEventListener('mousedown', dragStart);
  sliderTrack.addEventListener('mousemove', dragging);
  document.addEventListener('mouseup', dragStop);

  sliderTrack.addEventListener('touchstart', dragStart as EventListener, {
    passive: true,
  });
  sliderTrack.addEventListener('touchmove', dragging as EventListener, {
    passive: true,
  });
  sliderTrack.addEventListener('touchend', dragStop);

  sliderTrack.addEventListener('scroll', handleInfiniteScroll);

  wrapper.addEventListener('mouseenter', () => {
    if (sliderState.timeoutId !== null) {
      clearTimeout(sliderState.timeoutId);
    }
  });
  wrapper.addEventListener('mouseleave', autoPlay);

  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      sliderState.firstCardWidth = initializeSlider();
      autoPlay();
    }, SLIDER_CONFIG.resizeDebounce);
  });
}

function initSlider(): void {
  wrapper = document.querySelector<HTMLElement>(
    '.travel-suitcases__slider-wrapper',
  );
  sliderTrack = document.querySelector<HTMLElement>(
    '.travel-suitcases__slides-track',
  );
  arrowBtns = document.querySelectorAll<HTMLElement>('.slider__btn');

  if (!sliderTrack) return;

  sliderState.firstCardWidth = initializeSlider();
  setupSliderListeners();
  autoPlay();
}

// ======================================================
// Products Functions
// ======================================================

let productsHome: Product[] = [];

function filterProductsByBlock(blockName: string): Product[] {
  return productsHome.filter(
    (product) => product.blocks.indexOf(blockName) !== -1,
  );
}

function createHomeProductCard(
  product: Product,
  itemClass: string,
  action: string,
  buttonLabel: string,
): string {
  return createProductCard(product, {
    itemClass,
    action,
    buttonLabel,
    linkPrefix: 'html/',
  });
}

function renderProductSection(
  listId: string,
  blockName: string,
  action: string,
  buttonLabel: string,
): void {
  const list = document.getElementById(listId);
  if (!list) return;

  const filtered = filterProductsByBlock(blockName);
  if (filtered.length === 0) return;

  const itemClass =
    listId === 'productsListNew'
      ? 'products-new__item'
      : 'products-selected__item';

  list.innerHTML = filtered
    .map((product) =>
      createHomeProductCard(product, itemClass, action, buttonLabel),
    )
    .join('');
}

function renderHomeProducts(): void {
  renderProductSection(
    'productsListSelected',
    'Selected Products',
    'add-to-cart',
    'Add To Cart',
  );
  renderProductSection(
    'productsListNew',
    'New Products Arrival',
    'view-product',
    'View Product',
  );
}

function renderProductsError(): void {
  const productsListSelected = document.getElementById('productsListSelected');
  const productsListNew = document.getElementById('productsListNew');

  const errorHTML = `
    <li class="products-empty-state">
      <p class="products-empty-state__message">Something Went Wrong. Please try again later.</p>
    </li>
  `;

  if (productsListSelected) productsListSelected.innerHTML = errorHTML;
  if (productsListNew) productsListNew.innerHTML = errorHTML;
}

function renderProductsNotFound(): void {
  const productsListSelected = document.getElementById('productsListSelected');
  const productsListNew = document.getElementById('productsListNew');

  const notFoundHTML = `
    <li class="products-empty-state">
      <p class="products-empty-state__message">No products available in this section</p>
    </li>
  `;

  if (productsListSelected) productsListSelected.innerHTML = notFoundHTML;
  if (productsListNew) productsListNew.innerHTML = notFoundHTML;
}

function handleHomeAddToCart(productId: string): void {
  const product = productsHome.find((p) => p.id === productId);
  if (product) addProductToCart(product);
}

function handleProductClick(productId: string): void {
  window.location.href = `html/product-details.html?id=${productId}`;
}

function setupProductListeners(): void {
  const productsListSelected = document.getElementById('productsListSelected');
  const productsListNew = document.getElementById('productsListNew');

  if (productsListSelected) {
    productsListSelected.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as Element;
      const btn = target.closest<HTMLElement>('[data-action="add-to-cart"]');
      if (btn) {
        e.stopPropagation();
        const card = target.closest<HTMLElement>('.product-card');
        const productId = card?.dataset.productId;
        if (productId) handleHomeAddToCart(productId);
      }
    });
  }

  if (productsListNew) {
    productsListNew.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as Element;
      const btn = target.closest<HTMLElement>('[data-action="view-product"]');
      if (btn) {
        e.stopPropagation();
        const card = target.closest<HTMLElement>('.product-card');
        const productId = card?.dataset.productId;
        if (productId) handleProductClick(productId);
      }
    });
  }
}

// ======================================================
// Load data.json
// ======================================================

async function loadHomeProducts(): Promise<void> {
  const data = await loadJSON<JsonResponse>('assets/data.json');

  if (!data) {
    renderProductsError();
    return;
  }

  productsHome = data.data;

  if (!Array.isArray(productsHome) || productsHome.length === 0) {
    renderProductsNotFound();
    return;
  }

  renderHomeProducts();
  setupProductListeners();
}

// ======================================================
// Initialize
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  updateGlobalCartCounter();
  void loadHomeProducts();
});

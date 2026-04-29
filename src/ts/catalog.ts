/// <reference path="./main.ts" />

// ======================================================
// Configuration & Types
// ======================================================

const ITEMS_PER_PAGE = 12;

let catalogProducts: Product[] = [];
let filteredProducts: Product[] = [];
let currentPage: number = 1;
let currentSort: string = 'default';

interface Filters {
  size: string;
  color: string;
  category: string;
  sale: boolean;
}

// Filter state
let filters: Filters = {
  size: 'all',
  color: 'all',
  category: 'all',
  sale: false,
};

let productsGrid: HTMLElement | null;
let catalogContent: HTMLElement | null;
let resultsText: HTMLElement | null;
let prevBtn: HTMLButtonElement | null;
let nextBtn: HTMLButtonElement | null;
let pageNumbers: HTMLElement | null;
let searchInput: HTMLInputElement | null;
let searchBtn: HTMLButtonElement | null;
let modal: HTMLElement | null;
let modalCloseBtn: HTMLButtonElement | null;
let bestSets: HTMLElement | null;

let filtersPanel: HTMLElement | null;
let filtersToggleBtn: HTMLButtonElement | null;
let hideFiltersBtn: HTMLButtonElement | null;
let clearFiltersBtn: HTMLButtonElement | null;

// ======================================================
// DOM Elements Cache
// ======================================================

function cacheElements(): void {
  productsGrid = document.getElementById('productsGrid');
  catalogContent = document.getElementById('catalogContent');
  resultsText = document.getElementById('resultsText');
  prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
  nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
  pageNumbers = document.getElementById('pageNumbers');
  searchInput = document.getElementById(
    'searchInput',
  ) as HTMLInputElement | null;
  searchBtn = document.getElementById('searchBtn') as HTMLButtonElement | null;
  modal = document.getElementById('no-product-modal');
  modalCloseBtn = document.getElementById(
    'modalCloseBtn',
  ) as HTMLButtonElement | null;
  bestSets = document.getElementById('bestSets');

  // Filter elements
  filtersPanel = document.getElementById('filtersPanel');
  filtersToggleBtn = document.getElementById(
    'filtersToggleBtn',
  ) as HTMLButtonElement | null;
  hideFiltersBtn = document.getElementById(
    'hideFiltersBtn',
  ) as HTMLButtonElement | null;
  clearFiltersBtn = document.getElementById(
    'clearFiltersBtn',
  ) as HTMLButtonElement | null;
}

// ======================================================
// Data Loading
// ======================================================

interface ProductData {
  data?: Product[];
}

async function loadCatalogProducts(): Promise<boolean> {
  const data = await loadJSON<Product[] | ProductData>('../assets/data.json');

  if (!data) {
    renderCatalogError();
    return false;
  }

  catalogProducts = Array.isArray(data) ? data : data.data || [];

  if (catalogProducts.length === 0) {
    renderCatalogNotFound();
    return false;
  }

  filteredProducts = [...catalogProducts];
  return true;
}

// ======================================================
// Custom Dropdown Handlers
// ======================================================

function handleCatalogDropdownClick(
  e: MouseEvent,
  dropdown: HTMLElement,
  options: NodeListOf<HTMLElement>,
  selectedDisplay: HTMLElement,
  isSort: boolean,
  filterType: keyof Filters | undefined,
): void {
  e.stopPropagation();
  const option = e.currentTarget as HTMLElement;

  // Update active state
  options.forEach((opt) =>
    opt.classList.remove('custom-dropdown__option--active'),
  );
  option.classList.add('custom-dropdown__option--active');

  // Update display
  selectedDisplay.textContent = option.textContent;

  // Close dropdown
  dropdown.classList.remove('custom-dropdown--open');

  // Handle sort or filter
  if (isSort) {
    handleSort(option.dataset.value || '');
  } else if (filterType) {
    // Dynamically update the filter state
    let filterValue: string | boolean = option.dataset.value || 'all';

    if (filterValue === 'true') {
      filterValue = true;
    } else if (filterValue === 'false') {
      filterValue = false;
    }

    (filters as any)[filterType] = filterValue;

    applyFilters();
  }
}

function initCustomDropdowns(): void {
  const customDropdowns =
    document.querySelectorAll<HTMLElement>('.custom-dropdown');

  customDropdowns.forEach((dropdown) => {
    const options = dropdown.querySelectorAll<HTMLElement>(
      '.custom-dropdown__option',
    );
    const selectedDisplay = dropdown.querySelector<HTMLElement>(
      '.custom-dropdown__selected',
    );
    const isSort = dropdown.dataset.sort === 'true';
    const filterType = dropdown.dataset.filter as keyof Filters | undefined;

    if (!selectedDisplay) return;

    // Handle option clicks
    options.forEach((option) => {
      option.addEventListener('click', (e: MouseEvent) =>
        handleCatalogDropdownClick(
          e,
          dropdown,
          options,
          selectedDisplay,
          isSort,
          filterType,
        ),
      );
    });

    // Setup hover events
    dropdown.addEventListener('mouseenter', () => {
      dropdown.classList.add('custom-dropdown--open');
    });

    dropdown.addEventListener('mouseleave', () => {
      dropdown.classList.remove('custom-dropdown--open');
    });
  });
}

// ======================================================
// Filters
// ======================================================

function showFilters(): void {
  if (!filtersPanel || !filtersToggleBtn) return;
  filtersPanel.classList.toggle('filters-panel--active');
  filtersToggleBtn.setAttribute('aria-expanded', 'true');
}

function hideFilters(): void {
  if (!filtersPanel || !filtersToggleBtn) return;
  filtersPanel.classList.remove('filters-panel--active');
  filtersToggleBtn.setAttribute('aria-expanded', 'false');
}

function clearFilters(): void {
  filters = {
    size: 'all',
    color: 'all',
    category: 'all',
    sale: false,
  };

  // Reset filter dropdowns (not sort)
  const filterDropdowns = document.querySelectorAll<HTMLElement>(
    '.custom-dropdown[data-filter]',
  );
  filterDropdowns.forEach((dropdown) => {
    const options = dropdown.querySelectorAll<HTMLElement>(
      '.custom-dropdown__option',
    );
    const selectedDisplay = dropdown.querySelector<HTMLElement>(
      '.custom-dropdown__selected',
    );
    const firstOption = options[0];

    if (!firstOption || !selectedDisplay) return;

    options.forEach((opt) =>
      opt.classList.remove('custom-dropdown__option--active'),
    );
    firstOption.classList.add('custom-dropdown__option--active');
    selectedDisplay.textContent = firstOption.textContent;
  });

  // Reset checkbox
  const saleCheckbox = document.getElementById(
    'salesFilter',
  ) as HTMLInputElement | null;
  if (saleCheckbox) {
    saleCheckbox.checked = false;
  }

  applyFilters();
}

function handleSaleCheckbox(e: Event): void {
  const target = e.target as HTMLInputElement;
  filters.sale = target.checked;
  applyFilters();
}

function applyFilters(): void {
  filteredProducts = catalogProducts.filter((product) => {
    // Size filter
    if (filters.size !== 'all' && product.size !== filters.size) {
      return false;
    }

    // Color filter
    if (filters.color !== 'all' && product.color !== filters.color) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }

    // Sale filter
    return !filters.sale || product.salesStatus;
  });

  // Reapply current sort
  sortProducts();

  // Reset to first page
  currentPage = 1;

  renderProducts();
  renderPagination();
}

// ======================================================
// Sorting
// ======================================================

function handleSort(sortValue: string): void {
  currentSort = sortValue;

  applyFilters();
}

function sortProducts(): void {
  switch (currentSort) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
      filteredProducts.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }
}

// ======================================================
// Search
// ======================================================

function handleSearch(): void {
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim().toLowerCase();
  if (!searchTerm) return;

  const foundProduct = catalogProducts.find((product) =>
    product.name.toLowerCase().includes(searchTerm),
  );

  if (foundProduct) {
    window.location.href = `./product-details.html?id=${foundProduct.id}`;
    searchInput.value = '';
  } else {
    showModal();
  }
}

function showModal(): void {
  if (!modal) return;
  modal.classList.add('no-product-modal--active');
  document.body.classList.add('no-scroll');
}

function closeModal(): void {
  if (!modal) return;
  modal.classList.remove('no-product-modal--active');
  document.body.classList.remove('no-scroll');
}

// ======================================================
// Products Rendering
// ======================================================

function createCatalogProductCard(product: Product): string {
  const productWithCorrectedPath: Product = {
    ...product,
    imageUrl: `../${product.imageUrl}`,
  };

  return createProductCard(productWithCorrectedPath, {
    linkPrefix: './',
  });
}

function renderProducts(): void {
  if (!productsGrid) return;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, end);

  productsGrid.innerHTML = pageProducts
    .map((product) => createCatalogProductCard(product))
    .join('');

  updateResultsText();
}

function updateResultsText(): void {
  if (!resultsText) return;

  if (filteredProducts.length === 0) {
    resultsText.textContent = 'No Results Found';
    return;
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);
  const total = filteredProducts.length;

  resultsText.textContent = `Showing ${start}-${end} Of ${total} Results`;
}

// ======================================================
// Pagination
// ======================================================

function renderPagination(): void {
  if (!prevBtn || !nextBtn || !pageNumbers) return;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;

  pageNumbers.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      const btn = document.createElement('button');
      btn.className = `pagination__button ${
        i === currentPage ? 'pagination__button--active' : ''
      }`;
      btn.textContent = String(i);
      btn.addEventListener('click', () => changePage(i));
      pageNumbers.appendChild(btn);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      const span = document.createElement('span');
      span.textContent = '...';
      span.style.padding = '0 5px';
      pageNumbers.appendChild(span);
    }
  }
}

function changePage(page: number): void {
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderProducts();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================================================
// Best Sets
// ======================================================

function createBestSetCard(set: Product): string {
  return `
    <div class="best-set">
      <div class="best-set__image">
        <img src="../${set.imageUrl}" alt="suitcase-best-set" loading="lazy" />
      </div>
      <div class="best-set__content">
        <h4 class="best-set__title">${set.name}</h4>
        <div class="best-set__rating">${renderStars(set.rating)}</div>
        <div class="best-set__price">$${set.price}</div>
      </div>
      <a href="./product-details.html?id=${set.id}" class="best-set__link"></a>
    </div>
  `;
}

function renderBestSets(): void {
  if (!bestSets) return;

  const sets = catalogProducts.filter(
    (p) => p.category === 'luggage sets' || p.rating === 5,
  );
  const shuffled = [...sets].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  bestSets.innerHTML = selected.map((set) => createBestSetCard(set)).join('');
}

// ======================================================
// Error & Not Found Pages
// ======================================================

function renderCatalogError(): void {
  if (!catalogContent) return;

  catalogContent.innerHTML = `
    <div class="error-state">
      <div class="error-state__container container">
        <div class="error-state__content header-block">
          <h1 class="header-block__title">Something Went Wrong</h1>
          <p class="header-block__subtitle">
            We couldn't load the catalog. Please try again later.
          </p>
          <a href="../index.html" class="btn btn--primary">Back to Home</a>
        </div>
      </div>
    </div>
  `;

  // Hide pagination & best sets if shown
  if (pageNumbers) pageNumbers.innerHTML = '';
  if (resultsText) resultsText.textContent = '';
  if (bestSets) bestSets.innerHTML = '';
}

function renderCatalogNotFound(): void {
  if (!catalogContent) return;

  catalogContent.innerHTML = `
    <div class="error-state">
      <div class="error-state__container container">
        <div class="error-state__content header-block">
          <h1 class="header-block__title">No Products Found</h1>
          <p class="header-block__subtitle">
            The catalog is empty or unavailable right now.
          </p>
          <a href="../index.html" class="btn btn--primary">Back to Home</a>
        </div>
      </div>
    </div>
  `;

  if (pageNumbers) pageNumbers.innerHTML = '';
  if (resultsText) resultsText.textContent = '';
  if (bestSets) bestSets.innerHTML = '';
}

// ======================================================
// Event Listeners
// ======================================================

function setupCatalogEventListeners(): void {
  // Search
  searchBtn?.addEventListener('click', handleSearch);
  searchInput?.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Pagination
  prevBtn?.addEventListener('click', () => changePage(currentPage - 1));
  nextBtn?.addEventListener('click', () => changePage(currentPage + 1));

  // Modal
  modalCloseBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e: MouseEvent) => {
    if (e.target === modal) closeModal();
  });

  // Filters panel toggle
  filtersToggleBtn?.addEventListener('click', showFilters);
  hideFiltersBtn?.addEventListener('click', hideFilters);
  clearFiltersBtn?.addEventListener('click', clearFilters);

  // Sale checkbox
  const saleCheckbox = document.getElementById(
    'salesFilter',
  ) as HTMLInputElement | null;
  if (saleCheckbox) {
    saleCheckbox.addEventListener('change', handleSaleCheckbox);
  }

  // Add to cart
  productsGrid?.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-action="add-to-cart"]');

    if (btn) {
      e.stopPropagation();
      const card = btn.closest<HTMLElement>('.product-card');
      const productId = card?.dataset.productId;

      if (productId) {
        const product = catalogProducts.find((p) => p.id === productId);
        if (product) addProductToCart(product);
      }
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      const customDropdowns =
        document.querySelectorAll<HTMLElement>('.custom-dropdown');
      customDropdowns.forEach((dropdown) => {
        dropdown.classList.remove('custom-dropdown--open');
      });
    }
  });
}

// ======================================================
// Initialize
// ======================================================

async function initCatalog(): Promise<void> {
  cacheElements();
  const loaded = await loadCatalogProducts();
  if (!loaded) return;

  initCustomDropdowns();
  updateGlobalCartCounter();
  renderProducts();
  renderPagination();
  renderBestSets();
  setupCatalogEventListeners();
}

document.addEventListener('DOMContentLoaded', initCatalog);

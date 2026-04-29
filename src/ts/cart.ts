/// <reference path="./main.ts" />

// ======================================================
// Configuration & Types
// ======================================================

const DISCOUNT_THRESHOLD: number = 3000;
const DISCOUNT_RATE: number = 0.1;
const SHIPPING_COST: number = 30;
const THANK_YOU_DELAY: number = 3000;

let cartItems: CartItem[] = [];
let cartContent: HTMLElement | null = null;

interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

// ======================================================
// Cart Data Functions
// ======================================================

function saveCart(): void {
  setCart(cartItems);
  updateGlobalCartCounter();
}

function calculateTotals(): CartTotals {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = subtotal > DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
  const shipping = cartItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal - discount + shipping;

  return { subtotal, discount, shipping, total };
}

// ======================================================
// Cart Actions
// ======================================================

function updateCartItemQuantity(id: string, delta: number): void {
  const item = cartItems.find((i) => i.id === id);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
  renderCart();
}

function removeItem(id: string): void {
  cartItems = cartItems.filter((item) => item.id !== id);
  saveCart();
  renderCart();
}

function clearCart(): void {
  cartItems = [];
  saveCart();
  renderCart();
}

function checkout(): void {
  const modal = document.getElementById('thankYouModal');
  if (!modal) return;

  window.scrollTo(0, 0);

  modal.classList.add('thank-you-modal--visible');
  document.body.classList.add('no-scroll');

  cartItems = [];
  saveCart();

  setTimeout(() => {
    modal.classList.remove('thank-you-modal--visible');
    document.body.classList.remove('no-scroll');
    renderCart();
  }, THANK_YOU_DELAY);
}

// ======================================================
// Rendering Functions
// ======================================================

function renderCartItem(item: CartItem): string {
  return `
    <tr class="cart-item" data-id="${item.id}">
      <td class="cart-item__image">
        <img src="../${item.imageUrl}"  alt="${item.name}" class="cart-item__img" />
      </td>
      <td class="cart-item__name">${item.name}</td>
      <td class="cart-item__price" data-value="$">${item.price}</td>
      <td class="cart-item__quantity-controls">
        <div class="cart-item__quantity-wrapper">
          <button class="cart-item__quantity-btn cart-item__quantity-btn--minus" id="qtyMinusBtn">-</button>
          <span class="cart-item__quantity-value">${item.quantity}</span>
          <button class="cart-item__quantity-btn cart-item__quantity-btn--plus" id="qtyPlusBtn">+</button>
        </div>
      </td>
      <td class="cart-item__total" data-value="$">${item.price * item.quantity}</td>
      <td class="cart-item__delete">
        <button class="cart-item__delete-btn" id="removeItemBtn">
          <img src="../assets/icons/remove.svg" alt="remove-icon" class="cart-item__delete-icon" />
        </button>
      </td>
    </tr>
  `;
}

function renderSummaryRow(
  label: string,
  value: number,
  additionalClass: string = '',
): string {
  return `
    <div class="cart-summary__row ${additionalClass}">
      <span class="cart-summary__label">${label}</span>
      <span class="cart-summary__value" data-value="$">${value}</span>
    </div>
  `;
}

function renderEmptyState(): string {
  return `
    <div class="error-state">
      <div class="error-state__container container">
        <div class="error-state__content header-block">
          <h1 class="header-block__title">Your cart is empty</h1>
          <p class="header-block__subtitle">
            Use the catalog to add new items.
          </p>
          <a href="catalog.html" class="btn btn--primary">Back to Catalog</a>
        </div>
      </div>
    </div>
  `;
}

function renderCart(): void {
  if (!cartContent) return;

  if (cartItems.length === 0) {
    cartContent.innerHTML = renderEmptyState();
    return;
  }

  const { subtotal, discount, shipping, total } = calculateTotals();

  cartContent.innerHTML = `
    <div class="cart__table-wrapper">
      <table class="cart__table">
        <thead class="cart__table-header">
          <tr>
            <th class="cart__table-cell cart__table-cell--image">Image</th>
            <th class="cart__table-cell cart__table-cell--product-name">Product Name</th>
            <th class="cart__table-cell cart__table-cell--price">Price</th>
            <th class="cart__table-cell cart__table-cell--quantity">Quantity</th>
            <th class="cart__table-cell cart__table-cell--total">Total</th>
            <th class="cart__table-cell cart__table-cell--delete">Delete</th>
          </tr>
        </thead>
        <tbody class="cart__table-body">
          ${cartItems.map((item) => renderCartItem(item)).join('')}
        </tbody>
      </table>
    </div>

    <div class="cart__footer">
      <div class="cart__actions">
        <a href="./catalog.html" class="cart__btn cart__btn--continue btn btn--cart-actions">
          Continue Shopping
        </a>
        <button class="cart__btn cart__btn--clear btn btn--cart-actions" id="clearCartBtn">
          Clear Shopping Cart
        </button>
      </div>

      <div class="cart__cart-summary cart-summary">
        <div class="cart-summary__rows-wrapper">
          ${renderSummaryRow('Sub Total', subtotal)}
          ${
            discount > 0
              ? renderSummaryRow(
                  'Discount',
                  discount,
                  'cart-summary__row--discount',
                )
              : ''
          }
          ${renderSummaryRow('Shipping', shipping)}
          ${renderSummaryRow('Total', total, 'cart-summary__row--total')}
          
          <div class="cart-summary__checkout">
            <button class="cart-summary__btn-checkout btn btn--cart-summary" id="checkoutBtn">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ======================================================
// Event Listeners
// ======================================================

function setupCartEventListeners(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as Element;
    const btn = target.closest('button');
    if (!btn) return;

    const itemEl = target.closest<HTMLElement>('.cart-item');
    const id = itemEl?.dataset.id;

    switch (btn.id) {
      case 'qtyMinusBtn':
        if (id) updateCartItemQuantity(id, -1);
        break;
      case 'qtyPlusBtn':
        if (id) updateCartItemQuantity(id, 1);
        break;
      case 'removeItemBtn':
        if (id) removeItem(id);
        break;
      case 'clearCartBtn':
        clearCart();
        break;
      case 'checkoutBtn':
        checkout();
        break;
    }
  });
}

// ======================================================
// Initialize
// ======================================================

function initCart(): void {
  cartContent = document.getElementById('cartContent');
  cartItems = getCart();
  renderCart();
  setupCartEventListeners();
}

document.addEventListener('DOMContentLoaded', initCart);

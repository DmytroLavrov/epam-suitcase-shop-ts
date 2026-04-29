/// <reference path="./main.ts" />

// ======================================================
// Configuration & Types
// ======================================================

let contactForm: HTMLFormElement | null = null;

interface FormInputs {
  name: HTMLInputElement | null;
  email: HTMLInputElement | null;
  topic: HTMLInputElement | null;
  message: HTMLTextAreaElement | null;
}

type FieldName = keyof FormInputs;

let formInputs: FormInputs = {
  name: null,
  email: null,
  topic: null,
  message: null,
};

let touched: Record<FieldName, boolean> = {
  name: false,
  email: false,
  topic: false,
  message: false,
};

let isSubmitting: boolean = false;

// ======================================================
// DOM Elements Cache
// ======================================================

function cacheFormElements(): void {
  contactForm = document.querySelector(
    '.contact-form__fields',
  ) as HTMLFormElement | null;

  formInputs = {
    name: document.getElementById('name') as HTMLInputElement | null,
    email: document.getElementById('email') as HTMLInputElement | null,
    topic: document.getElementById('topic') as HTMLInputElement | null,
    message: document.getElementById('message') as HTMLTextAreaElement | null,
  };

  touched = {
    name: false,
    email: false,
    topic: false,
    message: false,
  };
}

// ======================================================
// Validation Functions
// ======================================================

function validateField(fieldName: string, value: string): string {
  switch (fieldName) {
    case 'name':
      return value.trim() === '' ? 'Name is required' : '';

    case 'email':
      if (value.trim() === '') return 'Email is required';
      if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
      return '';

    case 'topic':
      return value.trim() === '' ? 'Topic is required' : '';

    case 'message':
      return value.trim() === '' ? 'Message is required' : '';

    default:
      return '';
  }
}

function showError(fieldName: FieldName, errorMessage: string): void {
  const input = formInputs[fieldName];
  if (!input?.parentElement) return;

  // Remove any existing error message
  const existingError = input.parentElement.querySelector(
    '.contact-form__error',
  );
  if (existingError) {
    existingError.remove();
  }

  // Add error styling to input
  input.classList.add('contact-form__input--error');

  // Create and insert error message
  if (errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'contact-form__error';
    errorDiv.textContent = errorMessage;
    input.parentElement.appendChild(errorDiv);
  }
}

function clearError(fieldName: FieldName): void {
  const input = formInputs[fieldName];
  if (!input?.parentElement) return;

  // Remove error styling
  input.classList.remove('contact-form__input--error');

  // Remove error message
  const errorDiv = input.parentElement.querySelector('.contact-form__error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<FieldName, string>>;
}

function validateAllFields(): ValidationResult {
  let isValid = true;
  const errors: Partial<Record<FieldName, string>> = {};

  (Object.keys(formInputs) as FieldName[]).forEach((fieldName) => {
    const input = formInputs[fieldName];
    if (!input) return;

    const error = validateField(fieldName, input.value);

    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
}

// ======================================================
// Real-time Validation Handlers
// ======================================================

function handleInputChange(e: Event): void {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  const fieldName = target.name as FieldName;

  if (!fieldName) return;

  // Only validate if field has been touched
  if (touched[fieldName]) {
    const error = validateField(fieldName, target.value);

    if (error) {
      showError(fieldName, error);
    } else {
      clearError(fieldName);
    }
  }
}

function handleInputBlur(e: Event): void {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  const fieldName = target.name as FieldName;

  if (!fieldName) return;

  touched[fieldName] = true;

  const error = validateField(fieldName, target.value);

  if (error) {
    showError(fieldName, error);
  } else {
    clearError(fieldName);
  }
}

// ======================================================
// Form Submission
// ======================================================

function showSuccessMessage(): void {
  const messagesContainer = document.getElementById('formMessages');

  if (!messagesContainer) {
    console.error('Messages container not found!');
    return;
  }

  // Remove any existing messages
  messagesContainer.innerHTML = '';

  // Create success message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'form__message form__message--success';
  messageDiv.innerHTML = `
    <div class="form__message-content">
      <h3 class="form__message-title">Message sent successfully!</h3>
      <p class="form__message-text">Thank you for your feedback. We'll get back to you soon.</p>
    </div>
  `;

  messagesContainer.appendChild(messageDiv);

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Remove message after 5 seconds
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}

function showErrorMessage(): void {
  const messagesContainer = document.getElementById('formMessages');

  if (!messagesContainer) {
    console.error('Messages container not found!');
    return;
  }

  // Remove any existing messages
  messagesContainer.innerHTML = '';

  // Create error message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'form__message form__message--error';
  messageDiv.innerHTML = `
    <div class="form__message-content">
      <h3 class="form__message-title">Oops! Something went wrong.</h3>
      <p class="form__message-text">Please try again later or contact us directly.</p>
    </div>
  `;

  messagesContainer.appendChild(messageDiv);

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Remove message after 5 seconds
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}

function setSubmitButtonState(loading: boolean): void {
  if (!contactForm) return;

  const submitBtn = contactForm.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  if (!submitBtn) return;

  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-spinner"></span>
      Sending...
    `;
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'SEND';
  }
}

async function handleFormSubmit(e: Event): Promise<void> {
  e.preventDefault();

  if (isSubmitting || !contactForm) return;

  // Mark all fields as touched
  (Object.keys(touched) as FieldName[]).forEach((key) => {
    touched[key] = true;
  });

  // Validate all fields
  const { isValid, errors } = validateAllFields();

  // Show all errors
  (Object.keys(errors) as FieldName[]).forEach((fieldName) => {
    const errorMsg = errors[fieldName];
    if (errorMsg) {
      showError(fieldName, errorMsg);
    }
  });

  // Clear errors for valid fields
  (Object.keys(formInputs) as FieldName[]).forEach((fieldName) => {
    if (!errors[fieldName]) {
      clearError(fieldName);
    }
  });

  if (!isValid) {
    // Scroll to first error
    const firstErrorField = (Object.keys(errors) as FieldName[])[0];
    if (firstErrorField && formInputs[firstErrorField]) {
      formInputs[firstErrorField]?.focus();
    }
    return;
  }

  // Simulate form submission
  isSubmitting = true;
  setSubmitButtonState(true);

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Success
    showSuccessMessage();

    // Reset form
    contactForm.reset();

    // Clear all errors
    (Object.keys(formInputs) as FieldName[]).forEach((fieldName) => {
      clearError(fieldName);
    });

    // Reset touched state
    (Object.keys(touched) as FieldName[]).forEach((key) => {
      touched[key] = false;
    });
  } catch (error) {
    showErrorMessage();
  } finally {
    isSubmitting = false;
    setSubmitButtonState(false);
  }
}

// ======================================================
// Event Listeners Setup
// ======================================================

function setupContactEventListeners(): void {
  if (!contactForm) return;

  // Form submission
  contactForm.addEventListener('submit', handleFormSubmit);

  // Real-time validation on input
  (Object.keys(formInputs) as Array<keyof typeof formInputs>).forEach((key) => {
    const input = formInputs[key];

    if (input) {
      input.addEventListener('input', handleInputChange);
      input.addEventListener('blur', handleInputBlur);
    }
  });
}

// ======================================================
// Initialize
// ======================================================

function initContact(): void {
  cacheFormElements();

  if (contactForm) {
    setupContactEventListeners();
  }
}

document.addEventListener('DOMContentLoaded', initContact);

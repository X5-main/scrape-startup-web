document.addEventListener('DOMContentLoaded', () => {

  // --- 1. HANDLE REDIRECTED DATA ON PAGE LOAD ---
  const urlParams = new URLSearchParams(window.location.search);
  const prefillEmail = urlParams.get('prefill_email');
  const activateForm = urlParams.get('form_active');

  if (activateForm === 'true' || prefillEmail) {
    // Add class to body
    document.body.classList.add('--form-active');

    // Pre-fill the email field in the modal block
    const modalBlock = document.querySelector('#form-modal');
    if (modalBlock) {
      const targetInput = modalBlock.querySelector('input[name="email"], input[type="email"]');
      if (targetInput && prefillEmail) {
        targetInput.value = decodeURIComponent(prefillEmail);
        targetInput.dispatchEvent(new Event('input'));
      }
    }
  }

  // HubSpot Configuration
  const hsFormConfigs = {
    modal: {
      portalId: "243563631",
      formId: "396b2e6a-4dc7-4244-a2fc-79a7592e9dc9"
    },
    contact: {
      portalId: "243563631",
      formId: "abaf8485-f3cc-433a-845b-c89590a29d1f"
    }
  };

  /**
   * Field validation logic
   * @param {HTMLElement[]} fields 
   * @param {boolean} silent - If true, validation happens without showing error messages
   */
  function validateFields(fields, silent = false) {
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const processedRadios = new Set(); // Track radio groups to avoid double-checking

    fields.forEach(field => {
      const type = field.getAttribute('type');
      const required = field.hasAttribute('required');

      // Remove previous error state
      if (!silent) removeFieldError(field);

      // 1. Validation for Radio buttons (Yes/No questions)
      if (type === 'radio') {
        if (processedRadios.has(field.name)) return;
        processedRadios.add(field.name);

        const form = field.closest('form');
        const isChecked = form.querySelector(`input[name="${field.name}"]:checked`);

        if (required && !isChecked) {
          valid = false;
          // Target the container to show error below the Yes/No options
          const container = field.closest('.question-item__radio');
          if (!silent && container) showFieldError(container, 'Please select an option.');
        }
        return; // Skip standard text validation
      }

      // 2. Validation for File input (Resume)
      if (type === 'file') {
        if (required && field.files.length === 0) {
          valid = false;
          const container = field.closest('.cv-input__btn');
          if (!silent && container) showFieldError(container, 'Please attach your resume.');
        }
        return; // Skip standard text validation
      }

      // 3. Validation for standard Text, Email, Phone, and URL inputs
      const value = field.value.trim();

      if (required && !value) {
        valid = false;
        if (!silent) showFieldError(field, 'This field is required.');
      } else if (type === 'email' && value) {
        if (!emailRegex.test(value)) {
          valid = false;
          if (!silent) showFieldError(field, 'Please enter a valid email.');
        }
      } else if (type === 'tel' && value) {
        const validCharsRegex = /^[\+\d\-\s()]+$/;
        const digitCount = value.replace(/\D/g, '').length;
        if (!validCharsRegex.test(value) || digitCount < 7 || digitCount > 15) {
          valid = false;
          if (!silent) showFieldError(field, 'Please enter a valid phone number.');
        }
      } else if (type === 'url' && value) {
        // Basic URL validation pattern
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (!urlRegex.test(value)) {
          valid = false;
          if (!silent) showFieldError(field, 'Please enter a valid URL.');
        } else if (!value.startsWith('http')) {
          // Auto-prepend https:// if the user forgot it, to prevent Ashby API errors
          field.value = 'https://' + value;
        }
      }
    });

    return valid;
  }

  function showFieldError(field, message) {
    field.classList.add('error');
    let msg = field.nextElementSibling;
    if (!msg || !msg.classList.contains('field-error')) {
      msg = document.createElement('span');
      msg.className = 'field-error';
      field.insertAdjacentElement('afterend', msg);
    }
    msg.textContent = message;
    msg.style.color = 'red';
    msg.style.fontSize = '0.875rem';
  }

  function removeFieldError(field) {
    field.classList.remove('error');
    const msg = field.nextElementSibling;
    if (msg && msg.classList.contains('field-error')) {
      msg.remove();
    }
  }
	
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
	
	
  /**
   * Simple data collection without splitting names
   */
  function getFormData(form) {
    const data = {};
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(el => {
      const name = el.name;
      if (!name) return;
      data[name] = el.value.trim();
    });
    return data;
  }

  /**
   * Submission to HubSpot API for standard forms
   */
  function submitForm(form) {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    let messageEl = form.querySelector('.form-message') || document.createElement('div');

    if (!form.querySelector('.form-message')) {
      messageEl.className = 'form-message';
      form.appendChild(messageEl);
    }

    if (!validateFields(fields)) {
      messageEl.textContent = 'Please correct the errors above.';
      messageEl.style.color = 'red';
      return;
    }

    const data = getFormData(form);
	const pageUri = window.location.href;
    const pageName = document.title;

    const formType = form.dataset.formType;
    const config = hsFormConfigs[formType];

    if (!config) return;
	
	const hutk = getCookie('hubspotutk');
	const context = { pageUri, pageName };
	if (hutk) context.hutk = hutk;

    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${config.portalId}/${config.formId}`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: Object.keys(data).map(key => ({ name: key, value: data[key] })),
        context: context
      })
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(() => {
        messageEl.textContent = 'Thank you!';
        messageEl.style.color = 'green';
        form.reset();
        fields.forEach(removeFieldError);
      })
      .catch(() => {
        messageEl.textContent = 'Something went wrong.';
        messageEl.style.color = 'red';
      });
  }

  // --- MAIN FORM EVENT LISTENERS ---
  const forms = document.querySelectorAll('form[data-form-type]');

  forms.forEach(form => {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    // Visual validation on input for standard forms only
    fields.forEach(field => {
      field.addEventListener('input', () => {
        // Validation now triggers instantly for every keystroke or change
        validateFields([field]);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      const formType = form.dataset.formType;
      const actionUrl = form.getAttribute('data-action') || '/demo';

      if (formType === 'email') {
        const emailInput = form.querySelector('input[name="email"], input[type="email"]');
        const emailValue = emailInput ? emailInput.value.trim() : '';

        // Validate the email field (silent=false to show "Required" or "Invalid format" errors)
        const isEmailValid = validateFields([emailInput], false);

        if (isEmailValid) {
          // Only redirect if validation passes (field is not empty and format is correct)
          const url = new URL(actionUrl, window.location.origin);
          url.searchParams.set('prefill_email', emailValue);
          url.searchParams.set('form_active', 'true');
          window.location.href = url.toString();
        }
        // If invalid (empty or wrong format), the error message is displayed and redirect is blocked
      } else {
        // Normal submission for 'modal' and 'contact' types via HubSpot API
        submitForm(form);
      }
    });
  });

  // --- ASHBY API FORM EVENT LISTENER ---
  const ashbyForm = document.getElementById('ashby-apply-form');

  if (ashbyForm) {
    // 1. Handle dynamic file name display
    const fileInput = ashbyForm.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        const fileNameSpan = document.getElementById('filename-' + fileInput.name);
        if (fileNameSpan && this.files.length > 0) {
          fileNameSpan.textContent = this.files[0].name;
        }
      });
    }

    // --- REAL-TIME ERROR REMOVAL ---
    // Select all fields within the Ashby form
    const ashbyFields = Array.from(ashbyForm.querySelectorAll('input, select, textarea'));

    ashbyFields.forEach(field => {
      // Use 'change' for radios/files, and 'input' for text typing
      const eventType = (field.type === 'radio' || field.type === 'file') ? 'change' : 'input';

      field.addEventListener(eventType, () => {
        let targetElement = field;

        // For custom UI elements, the error is attached to the container, not the hidden input
        if (field.type === 'radio') {
          targetElement = field.closest('.question-item__radio');
        } else if (field.type === 'file') {
          targetElement = field.closest('.cv-input__btn');
        }

        // Remove the error styling and message as soon as the user interacts
        if (targetElement) {
          removeFieldError(targetElement);
        }
      });
    });

    // 2. Handle submission
    ashbyForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields = Array.from(ashbyForm.querySelectorAll('input, select, textarea'));

      // Use existing visual validation logic
      if (!validateFields(fields)) {
        return;
      }

      const submitBtn = ashbyForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Create or locate status message element
      let messageEl = ashbyForm.querySelector('.form-message');
      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-message';
        messageEl.style.marginTop = '15px';
        ashbyForm.appendChild(messageEl);
      }
      messageEl.textContent = '';

      // Gather form data, including files
      const formData = new FormData(ashbyForm);

      // Append WP AJAX action and Job Posting ID
      formData.append('action', 'submit_ashby_application');
      formData.append('jobPostingId', ashbyForm.dataset.postingId);

      // Submit via standard WP admin-ajax.php endpoint
      fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;

          if (data.success) {
            messageEl.textContent = 'Thank you! Your application has been submitted.';
            messageEl.style.color = 'green';
            ashbyForm.reset();
            fields.forEach(removeFieldError); // Reset visual styles
          } else {
            messageEl.textContent = data.data.message || 'Error submitting application.';
            messageEl.style.color = 'red';
            console.error('Ashby Error Details:', data.data.details);
          }
        })
        .catch(err => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          messageEl.textContent = 'Something went wrong. Please try again later.';
          messageEl.style.color = 'red';
        });
    });
  }
});
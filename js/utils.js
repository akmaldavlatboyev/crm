// Utility functions for the CRM application

// API Helper Functions
class APIClient {
  constructor() {
    this.baseURL = window.API_CONFIG.BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint)
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    })
  }
}

// Create global API client instance
window.apiClient = new APIClient()

// Form Validation Functions
const validators = {
  required: (value) => {
    return value && value.trim() !== "" ? null : "This field is required"
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : "Please enter a valid email address"
  },

  phone: (value) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s/g, "")) ? null : "Please enter a valid phone number"
  },

  minLength: (min) => (value) => {
    return value && value.length >= min ? null : `Must be at least ${min} characters`
  },
}

// Form validation helper
function validateForm(formData, rules) {
  const errors = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field]

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break // Stop at first error for this field
      }
    }
  }

  return errors
}

// Display form errors
function displayFormErrors(errors) {
  // Clear previous errors
  document.querySelectorAll(".form-error").forEach((el) => el.remove())

  // Display new errors
  for (const [field, message] of Object.entries(errors)) {
    const input = document.querySelector(`[name="${field}"]`)
    if (input) {
      const errorEl = document.createElement("div")
      errorEl.className = "form-error"
      errorEl.textContent = message
      input.parentNode.appendChild(errorEl)
    }
  }
}

// Clear form errors
function clearFormErrors() {
  document.querySelectorAll(".form-error").forEach((el) => el.remove())
}

// Loading state management
function showLoading(container) {
  container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `
}

function hideLoading() {
  document.querySelectorAll(".loading").forEach((el) => el.remove())
}

// Modal management
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = "auto"
  }
}

// Toast notifications
function showToast(message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "var(--success-green)" : "var(--danger-red)"};
            color: white;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        ">
            ${message}
        </div>
    `

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Date formatting
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Currency formatting
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Debounce function for search
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Mobile menu toggle
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")

  sidebar.classList.toggle("open")
  mainContent.classList.toggle("expanded")
}

// Initialize mobile menu button
document.addEventListener("DOMContentLoaded", () => {
  // Add mobile menu button if it doesn't exist
  if (window.innerWidth <= 768) {
    const header = document.querySelector(".page-header")
    if (header && !document.querySelector(".mobile-menu-btn")) {
      const menuBtn = document.createElement("button")
      menuBtn.className = "btn btn-secondary mobile-menu-btn"
      menuBtn.innerHTML = "☰"
      menuBtn.onclick = toggleSidebar
      header.insertBefore(menuBtn, header.firstChild)
    }
  }
})

// Add CSS animation for toast
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`
document.head.appendChild(style)

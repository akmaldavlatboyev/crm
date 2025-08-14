// Utility functions for CRM platform

// API helper functions
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body)
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
    return this.request(endpoint, { method: "GET" })
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
    })
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }
}

// Initialize API client
const api = new ApiClient(window.API_BASE)

// Form validation utilities
const validators = {
  required: (value) => {
    return value && value.toString().trim() !== ""
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  phone: (value) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/[\s\-$$$$]/g, ""))
  },

  minLength: (min) => (value) => {
    return value && value.length >= min
  },

  maxLength: (max) => (value) => {
    return !value || value.length <= max
  },
}

// Form validation function
function validateForm(formData, rules) {
  const errors = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field]

    for (const rule of fieldRules) {
      if (typeof rule === "string") {
        // Simple validator name
        if (!validators[rule](value)) {
          errors[field] = `${field} is ${rule}`
          break
        }
      } else if (typeof rule === "object") {
        // Validator with parameters
        const { validator, message, ...params } = rule
        if (!validators[validator](Object.values(params)[0])(value)) {
          errors[field] = message || `${field} validation failed`
          break
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// DOM utility functions
const DOM = {
  // Get element by ID
  get: (id) => document.getElementById(id),

  // Get elements by class name
  getByClass: (className) => document.getElementsByClassName(className),

  // Get elements by query selector
  query: (selector) => document.querySelector(selector),

  // Get all elements by query selector
  queryAll: (selector) => document.querySelectorAll(selector),

  // Create element with attributes
  create: (tag, attributes = {}, content = "") => {
    const element = document.createElement(tag)

    for (const [key, value] of Object.entries(attributes)) {
      if (key === "className") {
        element.className = value
      } else if (key === "innerHTML") {
        element.innerHTML = value
      } else {
        element.setAttribute(key, value)
      }
    }

    if (content) {
      element.textContent = content
    }

    return element
  },

  // Show element
  show: (element) => {
    if (typeof element === "string") {
      element = DOM.get(element)
    }
    element.classList.remove("hidden")
  },

  // Hide element
  hide: (element) => {
    if (typeof element === "string") {
      element = DOM.get(element)
    }
    element.classList.add("hidden")
  },

  // Toggle element visibility
  toggle: (element) => {
    if (typeof element === "string") {
      element = DOM.get(element)
    }
    element.classList.toggle("hidden")
  },
}

// Modal utility functions
const Modal = {
  show: (modalId) => {
    const modal = DOM.get(modalId)
    if (modal) {
      DOM.show(modal)
      document.body.style.overflow = "hidden"
    }
  },

  hide: (modalId) => {
    const modal = DOM.get(modalId)
    if (modal) {
      DOM.hide(modal)
      document.body.style.overflow = "auto"
    }
  },

  create: (id, title, content, actions = []) => {
    const modalHtml = `
      <div id="${id}" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" onclick="Modal.hide('${id}')">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          <div class="modal-footer">
            ${actions.map((action) => `<button class="${action.class}" onclick="${action.onclick}">${action.text}</button>`).join("")}
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Close modal when clicking overlay
    DOM.get(id).addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        Modal.hide(id)
      }
    })
  },
}

// Notification utility
const Notification = {
  show: (message, type = "info", duration = 3000) => {
    const notification = DOM.create("div", {
      className: `notification notification-${type}`,
      innerHTML: message,
    })

    // Add notification styles if not already added
    if (!document.querySelector("#notification-styles")) {
      const styles = DOM.create("style", { id: "notification-styles" })
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          color: white;
          font-weight: 500;
          z-index: 1001;
          animation: slideIn 0.3s ease;
        }
        .notification-success { background-color: var(--success); }
        .notification-error { background-color: var(--error); }
        .notification-warning { background-color: var(--warning); }
        .notification-info { background-color: var(--primary-color); }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(styles)
    }

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, duration)
  },
}

// Loading state utility
const Loading = {
  show: (elementId) => {
    const element = DOM.get(elementId)
    if (element) {
      element.innerHTML = '<div class="loading"></div>'
      element.disabled = true
    }
  },

  hide: (elementId, originalContent) => {
    const element = DOM.get(elementId)
    if (element) {
      element.innerHTML = originalContent
      element.disabled = false
    }
  },
}

// Export utilities to global scope
window.api = api
window.validators = validators
window.validateForm = validateForm
window.DOM = DOM
window.Modal = Modal
window.Notification = Notification
window.Loading = Loading

/**
 * O-SShadow Proxy - Modern App JavaScript
 * Author: GitHub Copilot
 * Description: Modern interactive features and enhancements
 */

class ModernApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollEffects();
    this.setupParallax();
    this.setupIntersectionObserver();
    this.setupSmootherAnimations();
    this.setupKeyboardNavigation();
    this.setupPerformanceOptimizations();
  }

  // Scroll Effects
  setupScrollEffects() {
    let ticking = false;
    
    const updateScrollEffects = () => {
      const scrollY = window.pageYOffset;
      const header = document.querySelector('.glass-header');
      
      if (header) {
        // Dynamic header opacity based on scroll
        const opacity = Math.min(scrollY / 100, 1);
        header.style.setProperty('--header-opacity', opacity);
        
        // Add scrolled class for additional styling
        if (scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      
      ticking = false;
    };

    const requestScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  }

  // Parallax Effects
  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      ticking = false;
    };

    const requestParallaxUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  }

  // Intersection Observer for Animations
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Add stagger effect for feature cards
          if (entry.target.classList.contains('feature-card')) {
            const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
            entry.target.style.animationDelay = `${delay}ms`;
          }
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animatedElements = document.querySelectorAll(
      '.feature-card, .stat-item, .floating-card, .hero-text, .hero-visual'
    );
    
    animatedElements.forEach(el => observer.observe(el));
  }

  // Smoother Animations
  setupSmootherAnimations() {
    // Add CSS for smoother animations
    const style = document.createElement('style');
    style.textContent = `
      .in-view {
        animation: slideInUp 0.6s ease-out forwards;
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .glass-header.scrolled {
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  // Keyboard Navigation
  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for interactive elements
    const focusableElements = 'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', (e) => {
      // Escape key to close any open modals or menus
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
      
      // Add visual indicator for keyboard navigation
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Remove keyboard navigation indicator on mouse use
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Add keyboard navigation styles
    const keyboardStyle = document.createElement('style');
    keyboardStyle.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--accent-primary) !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(keyboardStyle);
  }

  // Performance Optimizations
  setupPerformanceOptimizations() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize images with Intersection Observer
    this.setupLazyLoading();
    
    // Debounce resize events
    this.setupResizeHandler();
  }

  preloadCriticalResources() {
    const criticalResources = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap'
    ];

    criticalResources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  setupResizeHandler() {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Recalculate animations and layouts on resize
        this.recalculateAnimations();
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }

  recalculateAnimations() {
    // Restart any CSS animations that depend on viewport size
    const animatedElements = document.querySelectorAll('.gradient-layer-1, .gradient-layer-2, .gradient-layer-3');
    animatedElements.forEach(element => {
      element.style.animation = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.animation = null;
    });
  }

  closeAllModals() {
    // Close any open modals or dropdowns
    const openModals = document.querySelectorAll('.modal.open, .dropdown.open');
    openModals.forEach(modal => {
      modal.classList.remove('open');
    });
  }

  // Utility Methods
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Enhanced Settings Toggle
function toggleSettings() {
  const settingsModal = document.getElementById('settings-modal');
  
  if (!settingsModal) {
    // Create settings modal if it doesn't exist
    createSettingsModal();
  } else {
    settingsModal.classList.toggle('open');
  }
}

function createSettingsModal() {
  const modal = document.createElement('div');
  modal.id = 'settings-modal';
  modal.className = 'settings-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="toggleSettings()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Settings</h2>
        <button class="close-btn" onclick="toggleSettings()">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="setting-group">
          <h3>Appearance</h3>
          <label class="toggle-switch">
            <input type="checkbox" id="reduced-motion">
            <span class="slider"></span>
            Reduce motion
          </label>
          <label class="toggle-switch">
            <input type="checkbox" id="high-contrast">
            <span class="slider"></span>
            High contrast
          </label>
        </div>
        <div class="setting-group">
          <h3>Privacy</h3>
          <label class="toggle-switch">
            <input type="checkbox" id="analytics" checked>
            <span class="slider"></span>
            Analytics
          </label>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add styles for the modal
  const modalStyles = document.createElement('style');
  modalStyles.textContent = `
    .settings-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: var(--transition-normal);
    }
    
    .settings-modal.open {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    
    .modal-content {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(20px);
      padding: var(--spacing-lg);
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      transform: translateY(20px);
      transition: var(--transition-normal);
    }
    
    .settings-modal.open .modal-content {
      transform: translateY(0);
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-md);
    }
    
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
    }
    
    .close-btn:hover {
      background: var(--glass-border);
    }
    
    .setting-group {
      margin-bottom: var(--spacing-md);
    }
    
    .setting-group h3 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }
    
    .toggle-switch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      cursor: pointer;
      color: var(--text-secondary);
    }
    
    .slider {
      position: relative;
      width: 50px;
      height: 24px;
      background: var(--bg-tertiary);
      border-radius: 12px;
      transition: var(--transition-fast);
    }
    
    .slider:before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: var(--transition-fast);
    }
    
    input:checked + .slider {
      background: var(--accent-primary);
    }
    
    input:checked + .slider:before {
      transform: translateX(26px);
    }
    
    input[type="checkbox"] {
      display: none;
    }
  `;
  
  document.head.appendChild(modalStyles);
  
  // Initialize Lucide icons for the new elements
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Open the modal
  setTimeout(() => modal.classList.add('open'), 10);
}

// Smooth scrolling enhancement
function enhancedSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        const headerHeight = document.querySelector('.glass-header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Terminal typing effect
function initTerminalEffect() {
  const terminalLines = document.querySelectorAll('.terminal-line .command, .terminal-line .success');
  
  terminalLines.forEach((line, index) => {
    const text = line.textContent;
    line.textContent = '';
    
    setTimeout(() => {
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          line.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, Math.random() * 50 + 25);
        }
      };
      typeWriter();
    }, index * 1000);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ModernApp();
  enhancedSmoothScroll();
  
  // Initialize terminal effect with a delay
  setTimeout(initTerminalEffect, 2000);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModernApp, toggleSettings };
}

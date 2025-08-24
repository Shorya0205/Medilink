// MediLink - Enhanced Interaction Script
// Handles dynamic content, smooth scrolling, animations, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Navbar functionality
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Active nav link highlighting
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // CTA button handlers (including navbar CTA)
    const ctaButtons = document.querySelectorAll('#ctaButton, #ctaButtonMain, #navCtaButton');
    ctaButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // Enhanced CTA action - could integrate with actual signup flow
                showCTAModal();
            });
        }
    });
    
    // Smooth scroll for navigation links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animations
    const animatedElements = document.querySelectorAll('.problem-card, .feature-card, .step, .solution-mockup');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Enhanced phone mockup animation
    const scanArea = document.querySelector('.scan-area');
    if (scanArea) {
        setInterval(() => {
            scanArea.style.transform = 'scale(1.05)';
            setTimeout(() => {
                scanArea.style.transform = 'scale(1)';
            }, 300);
        }, 3000);
    }
    
    // Stagger animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Form validation and modal functionality
    function showCTAModal() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Get Started with MediLink</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Join thousands of users who are already managing their prescriptions smarter.</p>
                    <form class="signup-form">
                        <input type="email" placeholder="Enter your email address" required>
                        <button type="submit" class="btn-submit">Start Free Trial</button>
                    </form>
                    <p class="modal-note">No credit card required. 14-day free trial.</p>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                animation: slideUp 0.3s ease;
            }
            .modal-header {
                padding: 24px 24px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                color: var(--dark-green);
                margin: 0;
                font-size: 1.2rem;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                padding: 24px;
            }
            .modal-body p {
                margin-bottom: 20px;
                color: var(--text-gray);
            }
            .signup-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .signup-form input {
                padding: 12px 16px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            .signup-form input:focus {
                outline: none;
                border-color: var(--primary-green);
            }
            .btn-submit {
                background: var(--primary-green);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            .btn-submit:hover {
                background: var(--dark-green);
            }
            .modal-note {
                font-size: 0.9rem;
                color: #999;
                text-align: center;
                margin-top: 16px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        // Add styles to head if not already present
        if (!document.querySelector('#modal-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'modal-styles';
            styleEl.textContent = modalStyles;
            document.head.appendChild(styleEl);
        }
        
        document.body.appendChild(modalOverlay);
        
        // Close modal functionality
        const closeModal = () => {
            modalOverlay.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        };
        
        modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Form submission
        modalOverlay.querySelector('.signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate form submission
            this.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="color: var(--primary-green); font-size: 24px; margin-bottom: 10px;">✓</div>
                    <p>Thanks! We'll send you early access details soon.</p>
                </div>
            `;
            
            setTimeout(closeModal, 2000);
        });
        
        // Focus on email input
        setTimeout(() => {
            modalOverlay.querySelector('input[type="email"]').focus();
        }, 100);
    }
    
    // "Try MediLink" button functionality
    const ctaButton = document.getElementById('ctaButton');
    const ctaButtonMain = document.getElementById('ctaButtonMain');
    
    function navigateToChat() {
        // Navigate to the main chat interface
        window.location.href = '/';  // This will go to the main chat interface
        
        // Alternative options:
        // window.location.href = 'http://localhost:8002';  // Direct server URL
        // window.open('/', '_blank');  // Open in new tab
    }
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add button click animation
            ctaButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                ctaButton.style.transform = 'scale(1)';
                navigateToChat();
            }, 150);
        });
    }
    
    if (ctaButtonMain) {
        ctaButtonMain.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add button click animation
            ctaButtonMain.style.transform = 'scale(0.95)';
            setTimeout(() => {
                ctaButtonMain.style.transform = 'scale(1)';
                navigateToChat();
            }, 150);
        });
    }
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.querySelector('.modal-close').click();
            }
        }
    });
});

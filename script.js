// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Single-Step Waitlist Form Handler
let currentStep = 1;
const totalSteps = 1;

function showMessage(container, message, isError = false) {
    const messageEl = container.querySelector('.form-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `form-message ${isError ? 'error' : 'success'}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

function updateProgress(step) {
    const progressFill = document.getElementById('progress-fill');
    const currentStepEl = document.getElementById('current-step');
    const progress = (step / totalSteps) * 100;
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (currentStepEl) currentStepEl.textContent = step;
}

function validateStep(form, step) {
    const stepEl = form.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepEl) return false;
    
    const requiredInputs = stepEl.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ef4444';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
        }
    });
    
    return isValid;
}

function goToStep(form, step) {
    // Single step form - no navigation needed
    currentStep = step;
    updateProgress(step);
}

function populateConfirmationSummary(form) {
    const type = form.dataset.type;
    
    if (type === 'consumer') {
        const firstName = form.querySelector('input[name="first_name"]')?.value || '';
        const lastName = form.querySelector('input[name="last_name"]')?.value || '';
        const name = `${firstName} ${lastName}`.trim() || '-';
        const email = form.querySelector('input[name="email"]')?.value || '-';
        const zip = form.querySelector('input[name="zip_code"]')?.value || '-';
        const favoriteBrand = form.querySelector('select[name="favorite_brand"]')?.value || '';
        const brandDisplay = favoriteBrand ? favoriteBrand.charAt(0).toUpperCase() + favoriteBrand.slice(1).replace('-', ' ') : 'Not specified';
        
        document.getElementById('consumer-summary-name').textContent = name;
        document.getElementById('consumer-summary-email').textContent = email;
        document.getElementById('consumer-summary-zip').textContent = zip;
        document.getElementById('consumer-summary-brand').textContent = brandDisplay;
    } else if (type === 'brand') {
        const companyName = form.querySelector('input[name="company_name"]')?.value || '-';
        const email = form.querySelector('input[name="email"]')?.value || '-';
        const zip = form.querySelector('input[name="zip_code"]')?.value || '-';
        const brandType = form.querySelector('select[name="brand_type"]')?.value || '';
        const typeDisplay = brandType ? brandType.charAt(0).toUpperCase() + brandType.slice(1).replace('-', ' ') : 'Not specified';
        
        document.getElementById('brand-summary-company').textContent = companyName;
        document.getElementById('brand-summary-email').textContent = email;
        document.getElementById('brand-summary-zip').textContent = zip;
        document.getElementById('brand-summary-type').textContent = typeDisplay;
    }
}

function switchTab(tabType) {
    // Update tabs
    document.querySelectorAll('.waitlist-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.waitlist-tab[data-tab="${tabType}"]`)?.classList.add('active');
    
    // Update forms
    document.querySelectorAll('.multi-step-form').forEach(form => {
        form.classList.remove('active');
    });
    const activeForm = document.getElementById(`${tabType}-form`);
    if (activeForm) {
        activeForm.classList.add('active');
        // Reset to step 1 when switching tabs
        currentStep = 1;
    }
}

function collectFormData(form, type) {
    const formData = {
        type: type
    };
    
    // Collect all input fields
    const allInputs = form.querySelectorAll('input');
    allInputs.forEach(input => {
        if (input.value.trim()) {
            const name = input.name;
            if (name === 'first_name' || name === 'last_name') {
                // Combine first and last name for consumer
                if (!formData.name) formData.name = '';
                formData.name += (formData.name ? ' ' : '') + input.value.trim();
            } else if (name === 'company_name') {
                formData.company_name = input.value.trim();
            } else {
                formData[name] = input.value.trim();
            }
        }
    });
    
    // Collect select/dropdown fields
    const allSelects = form.querySelectorAll('select');
    allSelects.forEach(select => {
        if (select.value.trim()) {
            formData[select.name] = select.value.trim();
        }
    });
    
    return formData;
}

async function submitWaitlist(form, type) {
    const formData = collectFormData(form, type);
    const container = form.closest('.waitlist-form-container');
    
    // Validate email
    if (!formData.email || !formData.email.includes('@')) {
        showMessage(container, 'Please enter a valid email address', true);
        return;
    }
    
    // Disable submit button
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Submitting...';
    
    try {
        const response = await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showMessage(container, 'Successfully joined! We\'ll be in touch soon.');
            form.reset();
            // Reset to step 1
            currentStep = 1;
            goToStep(form, 1);
        } else if (response.status === 409) {
            showMessage(container, 'You\'re already on the waitlist!', true);
        } else {
            showMessage(container, data.message || 'Something went wrong. Please try again.', true);
        }
    } catch (error) {
        showMessage(container, 'Network error. Please check your connection and try again.', true);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Initialize multi-step forms
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.querySelectorAll('.waitlist-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.dataset.tab;
            switchTab(tabType);
        });
    });
    
    // Form submission for consumer form
    const consumerForm = document.getElementById('consumer-form');
    if (consumerForm) {
        consumerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep(consumerForm, 1)) {
                submitWaitlist(consumerForm, 'consumer');
            }
        });
    }
    
    // Form submission for brand form
    const brandForm = document.getElementById('brand-form');
    if (brandForm) {
        brandForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep(brandForm, 1)) {
                submitWaitlist(brandForm, 'brand');
            }
        });
    }
    
    // Initialize progress
    updateProgress(1);
});

// CTA button click handler
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    if (!button.closest('.waitlist-form')) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll to waitlist form
            const waitlistSection = document.querySelector('.final-cta');
            if (waitlistSection) {
                waitlistSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Focus on email input after scroll
                setTimeout(() => {
                    const emailInput = document.querySelector('.waitlist-form input[type="email"]');
                    if (emailInput) {
                        emailInput.focus();
                    }
                }, 800);
            }
        });
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe steps
document.querySelectorAll('.step').forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    step.style.transition = `all 0.6s ease ${index * 0.2}s`;
    observer.observe(step);
});

// Animate phone mockups on scroll
document.querySelectorAll('.phone-mockup').forEach((phone, index) => {
    phone.style.opacity = '0';
    phone.style.transition = `all 0.8s ease ${index * 0.2}s`;
    observer.observe(phone);
});

// Add subtle floating animation to phone mockups with 3D transforms
function animatePhones() {
    const phones = document.querySelectorAll('.phone-mockup');
    const time = Date.now() * 0.001;
    
    phones.forEach((phone, index) => {
        const offset = index * Math.PI * 0.66;
        const y = Math.sin(time + offset) * 10;
        const rotation = Math.cos(time + offset) * 2;
        
        if (phone.classList.contains('phone-1')) {
            phone.style.transform = `rotateY(25deg) rotateZ(${-5 + rotation}deg) translateY(${20 + y}px) translateX(-10px)`;
        } else if (phone.classList.contains('phone-2')) {
            phone.style.transform = `rotateY(-8deg) scale(1.1) translateY(${y}px) translateZ(50px)`;
        } else if (phone.classList.contains('phone-3')) {
            phone.style.transform = `rotateY(-25deg) rotateZ(${5 + rotation}deg) translateY(${20 + y}px) translateX(10px)`;
        }
    });
    
    requestAnimationFrame(animatePhones);
}

// Only animate if phones exist and user prefers motion
if (document.querySelector('.phone-mockup') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animatePhones();
}

// Parallax effect for floating shapes
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

function animateShapes() {
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    shapes.forEach((shape, index) => {
        const speed = (index % 3 + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
    requestAnimationFrame(animateShapes);
}

animateShapes();

// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
    z-index: 9999;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle phone screenshot loading
document.querySelectorAll('.phone-screenshot').forEach(img => {
    img.addEventListener('load', function() {
        this.classList.add('loaded');
        const placeholder = this.nextElementSibling;
        if (placeholder && placeholder.classList.contains('screenshot-placeholder')) {
            placeholder.classList.add('hidden');
        }
    });
    
    img.addEventListener('error', function() {
        // Image failed to load, ensure placeholder is visible
        this.style.display = 'none';
        const placeholder = this.nextElementSibling;
        if (placeholder && placeholder.classList.contains('screenshot-placeholder')) {
            placeholder.classList.remove('hidden');
        }
    });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statNumber = entry.target.querySelector('.stat-number');
            const text = statNumber.textContent;
            const number = parseInt(text.replace(/[^0-9]/g, ''));
            const prefix = text.match(/[^0-9]/g)?.join('') || '';
            
            animateCounter({
                textContent: '',
                set textContent(val) {
                    statNumber.textContent = val + prefix;
                }
            }, number, 2000);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// Dynamically load brand logos from assets folder
function initializeDynamicLogos() {
    const extensions = ['svg', 'png', 'jpg', 'jpeg', 'webp'];
    const cacheBuster = Date.now();

    document.querySelectorAll('.logo-slot .brand-logo-img').forEach(img => {
        const slot = img.closest('.logo-slot');
        const logoName = slot?.dataset.logoName;
        if (!slot || !logoName) {
            return;
        }

        let attemptIndex = 0;

        const tryLoad = () => {
            if (attemptIndex >= extensions.length) {
                return;
            }
            const ext = extensions[attemptIndex++];
            const testImage = new Image();
            testImage.onload = () => {
                img.src = testImage.src;
                slot.classList.add('logo-loaded');
            };
            testImage.onerror = tryLoad;
            testImage.src = `assets/logos/${logoName}.${ext}?v=${cacheBuster}`;
        };

        tryLoad();
    });
}

initializeDynamicLogos();

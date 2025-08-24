// QR Code Generation and Animation
document.addEventListener('DOMContentLoaded', function() {
    const qrContainer = document.getElementById('qr-code');
    
    // Show loading state initially
    showLoading();
    
    // Generate QR Code after a short delay for better UX
    setTimeout(() => {
        generateQRCode();
    }, 1000);
    
    // Add hover effects and interactions
    addInteractions();
});

function showLoading() {
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Generating QR Code...</p>
        </div>
    `;
}

function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    
    // URL that the QR code will point to (you can change this to your actual medical story URL)
    const qrData = 'https://medilink.example.com/medical-story?patient=demo';
    
    // QR Code options
    const options = {
        width: 180,
        height: 180,
        color: {
            dark: '#2E8B57',  // QR code color (matching your theme)
            light: '#FFFFFF'  // Background color
        },
        margin: 2,
        errorCorrectionLevel: 'M'
    };
    
    // Clear loading and generate QR code
    qrContainer.innerHTML = '';
    
    QRCode.toCanvas(qrContainer, qrData, options, function(error) {
        if (error) {
            console.error('QR Code generation failed:', error);
            showError();
        } else {
            console.log('QR Code generated successfully!');
            animateQRCode();
        }
    });
}

function showError() {
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = `
        <div class="loading">
            <p style="color: #e74c3c;">Failed to generate QR Code</p>
            <button onclick="generateQRCode()" style="margin-top: 10px; padding: 8px 16px; background: #2E8B57; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
        </div>
    `;
}

function animateQRCode() {
    const canvas = document.querySelector('#qr-code canvas');
    if (canvas) {
        canvas.style.opacity = '0';
        canvas.style.transform = 'scale(0.8)';
        canvas.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            canvas.style.opacity = '1';
            canvas.style.transform = 'scale(1)';
        }, 100);
    }
}

function addInteractions() {
    const qrFrame = document.querySelector('.qr-frame');
    const features = document.querySelectorAll('.feature');
    
    // QR Frame hover effect
    if (qrFrame) {
        qrFrame.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        qrFrame.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Click to regenerate QR (optional feature)
        qrFrame.addEventListener('click', function() {
            showLoading();
            setTimeout(generateQRCode, 500);
        });
    }
    
    // Feature cards animation on scroll
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
    
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(feature);
    });
}

// Pulse animation for the QR frame
function addPulseEffect() {
    const qrFrame = document.querySelector('.qr-frame');
    if (qrFrame) {
        setInterval(() => {
            qrFrame.style.boxShadow = '0 10px 30px rgba(46, 139, 87, 0.4)';
            setTimeout(() => {
                qrFrame.style.boxShadow = '0 10px 30px rgba(46, 139, 87, 0.2)';
            }, 1000);
        }, 3000);
    }
}

// Initialize pulse effect after QR code is generated
setTimeout(addPulseEffect, 2000);

// Optional: Add click-to-copy URL functionality
function copyQRUrl() {
    const url = 'https://medilink.example.com/medical-story?patient=demo';
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard!');
    }).catch(() => {
        console.log('Could not copy URL');
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2E8B57;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add CSS for toast animation
const style = document.createElement('style');
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
`;
document.head.appendChild(style);
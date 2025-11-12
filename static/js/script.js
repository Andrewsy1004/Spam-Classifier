// Example texts for demonstration
const EXAMPLE_TEXTS = {
    spam: "URGENT! You've won $1,000,000! Click here to claim your prize NOW! This is a limited time offer. Don't miss this amazing opportunity to become a millionaire! Call 1-800-123-4567 immediately!",
    ham: "Hi John, thanks for sending the meeting notes from yesterday. I've reviewed them and have some comments. Could we schedule a quick call tomorrow at 2 PM to discuss? Best regards, Sarah"
};

// Navigation functionality
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all pills
    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked pill
    event.target.classList.add('active');
    
    // Update browser history
    history.pushState(null, '', `#${sectionId}`);
}

// Fill textarea with example text
function fillExample(type) {
    const textarea = document.getElementById('emailText');
    textarea.value = EXAMPLE_TEXTS[type];
    textarea.focus();
    
    // Show a quick notification
    showNotification(`Loaded ${type} example`, 'success');
}

// Clear textarea
function clearText() {
    const textarea = document.getElementById('emailText');
    textarea.value = '';
    textarea.focus();
    
    // Hide any existing results
    const result = document.getElementById('result');
    result.classList.remove('show');
    
    showNotification('Text cleared', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#339af0'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const classifierForm = document.getElementById('classifierForm');
    
    if (classifierForm) {
        classifierForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailText = document.getElementById('emailText').value.trim();
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            
            // Validate input
            if (!emailText) {
                showNotification('Please enter some text to analyze', 'error');
                return;
            }
            
            if (emailText.length < 10) {
                showNotification('Please enter at least 10 characters', 'error');
                return;
            }
            
            // Show loading
            loading.classList.add('show');
            result.classList.remove('show');
            
            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: emailText })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Hide loading
                loading.classList.remove('show');
                
                // Show result
                result.classList.remove('spam', 'ham', 'error');
                
                if (data.prediction === 'Error') {
                    result.classList.add('error');
                    document.getElementById('resultIcon').textContent = '❌';
                    document.getElementById('resultText').textContent = 'ANALYSIS ERROR';
                    document.getElementById('confidence').textContent = 'Unable to analyze the text';
                } else {
                    result.classList.add(data.is_spam ? 'spam' : 'ham');
                    document.getElementById('resultIcon').textContent = data.is_spam ? '🚫' : '✅';
                    document.getElementById('resultText').textContent = 
                        data.is_spam ? 'SPAM DETECTED!' : 'LEGITIMATE EMAIL';
                    document.getElementById('confidence').textContent = 
                        `Confidence: ${(data.confidence * 100).toFixed(2)}%`;
                }
                
                document.getElementById('timestamp').textContent = 
                    `Analyzed at: ${formatTimestamp(data.timestamp)}`;
                
                result.classList.add('show');
                
                // Show success notification
                if (data.prediction !== 'Error') {
                    showNotification(
                        `Email classified as ${data.prediction} with ${(data.confidence * 100).toFixed(1)}% confidence`,
                        'success'
                    );
                }
                
            } catch (error) {
                loading.classList.remove('show');
                console.error('Error:', error);
                
                // Show error in result box
                result.classList.remove('spam', 'ham');
                result.classList.add('error');
                result.classList.add('show');
                
                document.getElementById('resultIcon').textContent = '❌';
                document.getElementById('resultText').textContent = 'NETWORK ERROR';
                document.getElementById('confidence').textContent = 'Unable to connect to the server';
                document.getElementById('timestamp').textContent = 
                    `Error at: ${formatTimestamp(new Date().toISOString())}`;
                
                showNotification('Error analyzing email. Please try again.', 'error');
            }
        });
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        }
    });
    
    // Check initial hash on load
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    }
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});
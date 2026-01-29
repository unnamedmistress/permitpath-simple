// PermitPath - Simple & Interactive JavaScript

let photos = [];
let projectName = '';
let messageCount = 0;

// Show Different Pages
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const page = document.getElementById(pageName + '-page');
    if (page) {
        page.classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update chat title if going to chat page
        if (pageName === 'chat') {
            projectName = document.getElementById('project-name')?.value || 'Your Project';
            document.getElementById('chat-title').textContent = `Let's Chat About: ${projectName}`;
        }
        
        // Update report project name
        if (pageName === 'report') {
            document.getElementById('report-project-name').textContent = projectName;
        }
    }
}

// Handle Photo Upload
function handlePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photos.push(e.target.result);
            displayPhotos();
        };
        reader.readAsDataURL(file);
    }
}

// Display Uploaded Photos
function displayPhotos() {
    const previewDiv = document.getElementById('photos-preview');
    const uploadArea = document.getElementById('photo-area');
    
    if (photos.length > 0) {
        uploadArea.style.display = 'none';
        previewDiv.style.display = 'grid';
        
        previewDiv.innerHTML = photos.map((photo, index) => `
            <div class="photo-preview">
                <img src="${photo}" alt="Photo ${index + 1}">
                <div class="photo-badge">✓ Added</div>
            </div>
        `).join('') + `
            <label class="photo-add-more">
                <span style="font-size: 2rem;">📸</span>
                <span>Add More</span>
                <input 
                    type="file" 
                    accept="image/*" 
                    style="display: none;"
                    onchange="handlePhoto(event)"
                />
            </label>
        `;
    }
}

// Enable/Disable Next Button
document.getElementById('project-name')?.addEventListener('input', function(e) {
    const nextBtn = document.getElementById('next-btn');
    if (e.target.value.trim()) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
});

// Send Chat Message
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // Simulate AI response after a short delay
        setTimeout(() => {
            const responses = [
                "Got it! Let me check what permits you need for that...",
                "Great question! For that type of work, you'll need a permit.",
                "I can help you with that! Based on what you told me, here's what you need to know...",
                "Perfect! I've looked into your project. Let me explain what you need..."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, 'ai');
            
            // Show report button after a few messages
            messageCount++;
            if (messageCount >= 2) {
                document.getElementById('see-report-btn').style.display = 'flex';
            }
        }, 1000);
    }
}

// Add Message to Chat
function addMessage(text, from) {
    const messagesDiv = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${from}`;
    
    if (from === 'ai') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
                <p>${text}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <p>${text}</p>
            </div>
            <div class="message-avatar">👤</div>
        `;
    }
    
    messagesDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle Enter Key in Chat
function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send Quick Message
function sendQuickMessage(type) {
    let message = '';
    let response = '';
    
    if (type === 'cost') {
        message = 'How much will the permit cost?';
        response = 'Great question! For a typical plumbing permit in Florida, it usually costs around $150-200. I can get you the exact price in your report!';
    } else if (type === 'time') {
        message = 'How long will it take?';
        response = 'Usually takes 3-5 business days to get approved. Sometimes it can be faster if everything is filled out correctly!';
    }
    
    addMessage(message, 'user');
    
    setTimeout(() => {
        addMessage(response, 'ai');
        messageCount++;
        if (messageCount >= 1) {
            document.getElementById('see-report-btn').style.display = 'flex';
        }
    }, 1000);
}

// Email Report (Demo)
function emailReport() {
    alert('📧 Great! We would send this report to your email.\n\n(This is a demo, so no email was actually sent.)');
}

// Initialize - Show Home Page
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

console.log('✨ PermitPath is ready! Super simple and easy to use!');

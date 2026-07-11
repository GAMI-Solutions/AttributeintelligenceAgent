// ui-controller.js - UI Management and Animation Module

const uiController = (function() {
    'use strict';
    
    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (notification && notificationText) {
            notificationText.textContent = message;
            notification.className = 'notification show ' + type;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }
    
    // Show loading overlay
    function showLoadingOverlay(text = 'Initializing AI Agent...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('.loading-text');
        
        if (overlay) {
            overlay.classList.add('active');
            if (loadingText) {
                loadingText.textContent = text;
            }
            animateProgressBar();
        }
    }
    
    // Hide loading overlay
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    // Show processing overlay
    function showProcessingOverlay(text = 'AI Processing Data...') {
        const overlay = document.getElementById('processingOverlay');
        if (overlay) {
            overlay.classList.add('active');
            if (text) {
                const statusEl = document.getElementById('processStatus');
                if (statusEl) {
                    statusEl.textContent = text;
                }
            }
        }
    }
    
    // Hide processing overlay
    function hideProcessingOverlay() {
        const overlay = document.getElementById('processingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    // Animate progress bar
    function animateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
        }
    }
    
    // Update element text
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    // Animate counter
    function animateCounter(elementId, start, end, duration, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const increment = (end - start) / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = (typeof end === 'number' && end % 1 !== 0) 
                ? current.toFixed(1) + suffix 
                : Math.floor(current) + suffix;
        }, 16);
    }
    
    // Create particles
    function createParticles() {
        const container = document.getElementById('particleContainer');
        if (!container) return;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (20 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }
    
    // Initialize UI animations
    function initAnimations() {
        // Create particles
        createParticles();
        
        // Animate header stats on load
        setTimeout(() => {
            animateCounter('dataPointsCount', 0, 0, 1000);
            animateCounter('accuracyRate', 0, 0, 1000, '%');
            animateCounter('processingTime', 0, 0, 1000, 's');
        }, 500);
    }
    
    // Smooth scroll to element
    function scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Toggle class
    function toggleClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className);
        }
    }
    
    // Add class
    function addClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
    }
    
    // Remove class
    function removeClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }
    
    return {
        showNotification,
        showLoadingOverlay,
        hideLoadingOverlay,
        showProcessingOverlay,
        hideProcessingOverlay,
        updateElement,
        animateCounter,
        initAnimations,
        scrollToElement,
        toggleClass,
        addClass,
        removeClass
    };
})();
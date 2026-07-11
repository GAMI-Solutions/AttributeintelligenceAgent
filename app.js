// app.js - Main Application Entry Point with Agentic AI

(function() {
    'use strict';
    
    // Initialize application
    function initApp() {
        console.log('Lululemon Attribute Intelligence Agent - Initializing...');
        
        // Show initial loading
        uiController.showLoadingOverlay('Initializing AI Agent...');
        
        // Initialize UI animations
        uiController.initAnimations();
        
        // Initialize data loader
        dataLoader.init();
        
        // Initialize Agentic AI System
        if (typeof agenticAI !== 'undefined') {
            setTimeout(() => {
                agenticAI.initialize();
                console.log('Agentic AI System initialized');
            }, 1000);
        }
        
        // Hide loading after initialization
        setTimeout(() => {
            uiController.hideLoadingOverlay();
            console.log('Application ready');
            
            // Show welcome notification
            uiController.showNotification('🤖 AI Agents ready. Load data to begin analysis.');
        }, 1500);
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Initialize autonomous features
        initAutonomousFeatures();
    }
    
    // Initialize autonomous features
    function initAutonomousFeatures() {
        // Auto-suggest actions based on data patterns
        setInterval(() => {
            if (dataLoader.getData().length > 0 && Math.random() > 0.8) {
                showAutonomousSuggestion();
            }
        }, 30000); // Every 30 seconds
    }
    
    // Show autonomous suggestion
    function showAutonomousSuggestion() {
        const suggestions = [
            {
                title: 'Inventory Optimization Opportunity',
                message: 'AI detected low stock for high-performing SKUs. Recommend immediate restock.',
                action: 'Restock Now'
            },
            {
                title: 'Price Adjustment Recommendation',
                message: 'Market analysis suggests 8% price increase opportunity for premium items.',
                action: 'Adjust Prices'
            },
            {
                title: 'Customer Segment Discovery',
                message: 'New high-value segment identified: Eco-conscious millennials.',
                action: 'Target Segment'
            }
        ];
        
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        // Create autonomous action notification
        const notification = document.createElement('div');
        notification.className = 'autonomous-action';
        notification.innerHTML = `
            <h4>⚡ ${suggestion.title}</h4>
            <p>${suggestion.message}</p>
            <div class="action-buttons">
                <button class="action-btn-approve" onclick="approveAction('${suggestion.action}')">
                    ${suggestion.action}
                </button>
                <button class="action-btn-reject" onclick="rejectAction()">
                    Dismiss
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 10000);
    }
    
    // Approve autonomous action
    window.approveAction = function(action) {
        uiController.showNotification(`✅ Autonomous action approved: ${action}`);
        
        // Log to agent communication
        if (typeof agenticAI !== 'undefined') {
            const commLog = document.getElementById('agentCommLog');
            if (commLog) {
                const entry = document.createElement('div');
                entry.className = 'comm-entry action';
                entry.innerHTML = `
                    <span class="comm-time">${new Date().toLocaleTimeString()}</span>
                    <span class="comm-message">Action Agent: Executed ${action}</span>
                `;
                commLog.insertBefore(entry, commLog.firstChild);
            }
        }
        
        // Remove notification
        const notification = document.querySelector('.autonomous-action');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.parentNode.removeChild(notification);
            }, 300);
        }
    };
    
    // Reject autonomous action
    window.rejectAction = function() {
        const notification = document.querySelector('.autonomous-action');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.parentNode.removeChild(notification);
            }, 300);
        }
    };
    
    // Setup keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to execute analysis
            if (e.ctrlKey && e.key === 'Enter') {
                analysisEngine.executeAnalysis();
            }
            
            // Ctrl+L to load sample data
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                dataLoader.loadSampleData();
            }
            
            // Ctrl+D to download sample CSV
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                resultsExporter.downloadCSV();
            }
            
            // Ctrl+A to toggle agents
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                if (typeof agenticAI !== 'undefined') {
                    agenticAI.toggleAgents();
                }
            }
            
            // Escape to close overlays
            if (e.key === 'Escape') {
                uiController.hideLoadingOverlay();
                uiController.hideProcessingOverlay();
            }
        });
    }
    
    // Window load event
    window.addEventListener('DOMContentLoaded', initApp);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Redraw chart if it exists
        if (window.chart) {
            window.chart.resize();
        }
    });
    
    // Expose global functions for onclick handlers
    window.dataLoader = dataLoader;
    window.analysisEngine = analysisEngine;
    window.resultsExporter = resultsExporter;
    window.uiController = uiController;
    window.agenticAI = agenticAI;
    
})();
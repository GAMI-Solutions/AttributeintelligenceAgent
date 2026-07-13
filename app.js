// app.js - Main Application Entry Point

(function() {
    'use strict';

    // Initialize application
    function initApp() {
        console.log('Lululemon Attribute Intelligence Agent - Initializing...');

        // Show initial loading
        uiController.showLoadingOverlay('Loading Attribute Intelligence Agent...');

        // Initialize UI animations
        uiController.initAnimations();

        // Initialize data loader
        dataLoader.init();

        // Initialize the agent activity dashboard (real events only - see agentic-ai.js)
        if (typeof agenticAI !== 'undefined') {
            setTimeout(() => {
                agenticAI.initialize();
                console.log('Agent activity dashboard initialized');
            }, 1000);
        }

        // Hide loading after initialization
        setTimeout(() => {
            uiController.hideLoadingOverlay();
            console.log('Application ready');

            // Show welcome notification
            uiController.showNotification('Ready. Load data to begin analysis.');
        }, 1500);

        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
    }

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

            // Ctrl+A to clear the agent activity log
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                if (typeof agenticAI !== 'undefined') {
                    agenticAI.clearLog();
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

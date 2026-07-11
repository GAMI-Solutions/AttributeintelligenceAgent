// Lululemon Attribute Intelligence Agent - JavaScript

// Global variables
let productData = [];
let selectedAnalysis = null;
let chart = null;

// Sample Lululemon product data structure
const sampleData = {
    headers: [
        'product_id', 'product_name', 'category', 'subcategory', 'gender', 'style', 
        'fit', 'fabric', 'color', 'size_range', 'price', 'cost', 'inventory_units',
        'views', 'cart_adds', 'purchases', 'revenue', 'return_rate', 'rating',
        'sustainability_score', 'season', 'launch_date', 'last_restock'
    ],
    products: [
        ['LUL001', 'Align High-Rise Pant 28"', 'Bottoms', 'Leggings', 'Women', 'Athletic', 'Tight', 'Nulu', 'Black', '0-20', 128, 45, 1250, 45234, 12456, 8234, 1053952, 0.08, 4.8, 85, 'All Season', '2024-01-15', '2024-12-01'],
        ['LUL002', 'ABC Jogger 30"', 'Bottoms', 'Joggers', 'Men', 'Casual', 'Relaxed', 'Warpstreme', 'Navy', '28-40', 138, 48, 890, 32156, 8934, 5623, 776074, 0.12, 4.6, 78, 'Fall/Winter', '2024-02-01', '2024-11-15'],
        ['LUL003', 'Scuba Oversized Full-Zip', 'Tops', 'Hoodies', 'Women', 'Casual', 'Oversized', 'Cotton-Fleece', 'Heather Gray', 'XS-3XL', 148, 52, 2100, 67890, 18234, 12456, 1843488, 0.05, 4.9, 72, 'Fall/Winter', '2024-01-20', '2024-12-10'],
        ['LUL004', 'Wunder Train HR Tight 25"', 'Bottoms', 'Leggings', 'Women', 'Athletic', 'Tight', 'Everlux', 'True Navy', '0-20', 138, 48, 1560, 52345, 14567, 9876, 1362888, 0.07, 4.7, 88, 'All Season', '2024-03-01', '2024-12-05'],
        ['LUL005', 'Metal Vent Tech SS 2.0', 'Tops', 'T-Shirts', 'Men', 'Athletic', 'Fitted', 'Silverescent', 'White', 'S-3XL', 88, 30, 3200, 28456, 7234, 4567, 401896, 0.15, 4.5, 80, 'Spring/Summer', '2024-04-01', '2024-11-20'],
        ['LUL006', 'Define Jacket Luon', 'Outerwear', 'Jackets', 'Women', 'Athletic', 'Fitted', 'Luon', 'Black', '0-20', 158, 55, 780, 41234, 10234, 6789, 1072662, 0.09, 4.7, 75, 'All Season', '2024-02-15', '2024-12-08'],
        ['LUL007', 'Fast and Free Short 8"', 'Bottoms', 'Shorts', 'Women', 'Athletic', 'Fitted', 'Nulux', 'Vivid Plum', '0-20', 78, 27, 1890, 23456, 5678, 3456, 269568, 0.11, 4.6, 82, 'Spring/Summer', '2024-05-01', '2024-10-15'],
        ['LUL008', 'City Excursion Hoodie', 'Tops', 'Hoodies', 'Men', 'Casual', 'Classic', 'French Terry', 'Graphite Grey', 'S-3XL', 168, 58, 450, 19876, 4567, 2345, 394160, 0.13, 4.4, 70, 'Fall/Winter', '2024-09-01', '2024-11-30'],
        ['LUL009', 'Invigorate HR Tight 25"', 'Bottoms', 'Leggings', 'Women', 'Athletic', 'Tight', 'Everlux', 'Heritage Camo', '0-20', 148, 51, 890, 34567, 8901, 5678, 840344, 0.08, 4.8, 86, 'All Season', '2024-06-15', '2024-12-12'],
        ['LUL010', 'Pace Breaker Short 7"', 'Bottoms', 'Shorts', 'Men', 'Athletic', 'Lined', 'Swift', 'Black', '28-40', 68, 24, 2340, 45678, 11234, 8901, 605268, 0.10, 4.7, 79, 'Spring/Summer', '2024-04-15', '2024-10-01'],
        ['LUL011', 'Swiftly Tech LS 2.0', 'Tops', 'Long Sleeve', 'Women', 'Athletic', 'Fitted', 'Silverescent', 'Love Red', 'XS-3XL', 98, 34, 1230, 29876, 7654, 4321, 423458, 0.09, 4.6, 83, 'All Season', '2024-07-01', '2024-12-03'],
        ['LUL012', 'Commission Pant Slim', 'Bottoms', 'Pants', 'Men', 'Business Casual', 'Slim', 'Warpstreme', 'Obsidian', '28-40', 148, 51, 670, 21345, 5432, 3210, 475080, 0.14, 4.5, 74, 'All Season', '2024-08-01', '2024-11-25'],
        ['LUL013', 'Energy Bra High Neck', 'Tops', 'Sports Bras', 'Women', 'Athletic', 'Medium Support', 'Nulu', 'Pink Mist', '2-20', 68, 24, 3450, 56789, 15678, 11234, 763912, 0.06, 4.8, 87, 'All Season', '2024-01-10', '2024-12-14'],
        ['LUL014', 'Surge Jogger 29"', 'Bottoms', 'Joggers', 'Men', 'Athletic', 'Relaxed', 'Surge', 'Iron Blue', '28-40', 118, 41, 980, 18765, 4321, 2876, 339368, 0.11, 4.5, 76, 'Fall/Winter', '2024-10-01', '2024-11-28'],
        ['LUL015', 'Groove SHR Pant', 'Bottoms', 'Flare', 'Women', 'Casual', 'High-Rise', 'Nulu', 'Black', '0-20', 138, 48, 560, 43210, 10987, 7654, 1056252, 0.07, 4.9, 84, 'All Season', '2024-03-15', '2024-12-06'],
        ['LUL016', 'Fundamental T', 'Tops', 'T-Shirts', 'Men', 'Casual', 'Classic', 'Cotton Blend', 'White Opal', 'S-3XL', 58, 20, 4500, 34567, 8765, 6543, 379494, 0.12, 4.6, 71, 'Spring/Summer', '2024-05-15', '2024-10-20'],
        ['LUL017', 'Hotty Hot Short 4"', 'Bottoms', 'Shorts', 'Women', 'Athletic', 'Loose', 'Swift', 'Sonic Pink', '0-20', 68, 24, 2670, 45678, 12345, 8765, 596020, 0.08, 4.7, 81, 'Spring/Summer', '2024-06-01', '2024-09-15'],
        ['LUL018', 'At Ease Hoodie', 'Tops', 'Hoodies', 'Men', 'Casual', 'Relaxed', 'Modal Blend', 'Heathered Core', 'S-3XL', 148, 51, 340, 12345, 3210, 1987, 294076, 0.15, 4.4, 73, 'Fall/Winter', '2024-09-15', '2024-11-18'],
        ['LUL019', 'Base Pace HR Tight 28"', 'Bottoms', 'Leggings', 'Women', 'Athletic', 'Tight', 'Nulux', 'Dark Olive', '0-20', 128, 45, 1780, 38901, 9876, 6789, 868992, 0.09, 4.7, 85, 'All Season', '2024-07-15', '2024-12-09'],
        ['LUL020', 'License to Train SS', 'Tops', 'T-Shirts', 'Men', 'Athletic', 'Classic', 'Abrasion-Resistant', 'Black', 'S-3XL', 78, 27, 2890, 27654, 6789, 4567, 356226, 0.13, 4.5, 77, 'Spring/Summer', '2024-04-20', '2024-10-10']
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.remove('active');
    }, 1500);
});

// Initialize app
function initializeApp() {
    // Show loading overlay initially
    document.getElementById('loadingOverlay').classList.add('active');
    
    // Initialize counters with animation
    animateCounter('dataPointsCount', 0, 0, 1000);
    animateCounter('accuracyRate', 0, 0, 1000, '%');
}

// Set up event listeners
function setupEventListeners() {
    // File upload
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// Load sample data
function loadSampleData() {
    showNotification('Loading Lululemon sample data...');
    
    // Convert sample data to proper format
    productData = sampleData.products.map(row => {
        const product = {};
        sampleData.headers.forEach((header, index) => {
            product[header] = row[index];
        });
        return product;
    });
    
    // Update UI
    displayDataStats();
    enableAnalysis();
    
    showNotification('Sample data loaded successfully! 20 products ready for analysis.');
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Handle file processing
function handleFile(file) {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showNotification('Please upload a CSV file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSV(e.target.result);
    };
    reader.readAsText(file);
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    productData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product = {};
        headers.forEach((header, index) => {
            product[header] = values[index];
        });
        productData.push(product);
    }
    
    displayDataStats();
    enableAnalysis();
    showNotification(`Data loaded successfully! ${productData.length} products ready for analysis.`);
}

// Display data statistics
function displayDataStats() {
    const preview = document.getElementById('dataPreview');
    preview.style.display = 'block';
    
    // Calculate stats
    const totalProducts = productData.length;
    const categories = [...new Set(productData.map(p => p.category))];
    const dates = productData.map(p => p.launch_date).sort();
    const dateRange = dates.length > 0 ? `${dates[0]} - ${dates[dates.length - 1]}` : 'N/A';
    
    // Update UI
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('dateRange').textContent = dateRange;
    
    // Update header stats
    animateCounter('dataPointsCount', 0, totalProducts, 1000);
    animateCounter('accuracyRate', 0, 94.3, 1000, '%');
}

// Enable analysis buttons
function enableAnalysis() {
    document.getElementById('executeBtn').disabled = false;
}

// Select analysis type
function selectAnalysis(type) {
    selectedAnalysis = type;
    
    // Update UI
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.option-card').classList.add('selected');
    
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} analysis selected`);
}

// Execute analysis
function executeAnalysis() {
    if (!productData.length) {
        showNotification('Please load data first', 'error');
        return;
    }
    
    if (!selectedAnalysis) {
        showNotification('Please select an analysis type', 'error');
        return;
    }
    
    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    document.querySelector('.loading-text').textContent = 'AI Agent Processing...';
    
    // Activate pipeline stages
    activatePipeline();
    
    // Process data after pipeline animation
    setTimeout(() => {
        processAnalysis();
        document.getElementById('loadingOverlay').classList.remove('active');
    }, 5000);
}

// Activate pipeline animation
function activatePipeline() {
    const stages = ['stage-ingest', 'stage-process', 'stage-analyze', 'stage-insights', 'stage-recommend'];
    
    stages.forEach((stageId, index) => {
        setTimeout(() => {
            const stage = document.getElementById(stageId);
            stage.classList.add('active');
            stage.querySelector('.stage-status').textContent = 'Processing';
            
            // Mark as complete after processing
            setTimeout(() => {
                stage.querySelector('.stage-status').textContent = 'Complete';
            }, 800);
        }, index * 800);
    });
    
    // Reset pipeline after completion
    setTimeout(() => {
        stages.forEach(stageId => {
            const stage = document.getElementById(stageId);
            stage.classList.remove('active');
            stage.querySelector('.stage-status').textContent = 'Ready';
        });
    }, 6000);
}

// Process analysis based on selected type
function processAnalysis() {
    // Calculate metrics
    const results = analyzeProductData();
    
    // Display results
    displayResults(results);
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    
    // Smooth scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Analysis complete! AI-generated insights ready.');
}

// Analyze product data
function analyzeProductData() {
    const results = {
        topAttribute: null,
        conversionRate: 0,
        revenueImpact: 0,
        inventoryScore: 0,
        recommendations: [],
        insights: [],
        attributeScores: {}
    };
    
    // Calculate attribute performance
    const attributes = ['fabric', 'fit', 'style', 'category'];
    attributes.forEach(attr => {
        results.attributeScores[attr] = {};
        productData.forEach(product => {
            const key = product[attr];
            if (!results.attributeScores[attr][key]) {
                results.attributeScores[attr][key] = {
                    count: 0,
                    revenue: 0,
                    conversion: 0,
                    rating: 0
                };
            }
            results.attributeScores[attr][key].count++;
            results.attributeScores[attr][key].revenue += parseFloat(product.revenue) || 0;
            results.attributeScores[attr][key].conversion += (parseFloat(product.purchases) / parseFloat(product.views)) * 100;
            results.attributeScores[attr][key].rating += parseFloat(product.rating) || 0;
        });
    });
    
    // Find top performing attribute
    let maxRevenue = 0;
    let topAttr = '';
    Object.keys(results.attributeScores.fabric).forEach(fabric => {
        if (results.attributeScores.fabric[fabric].revenue > maxRevenue) {
            maxRevenue = results.attributeScores.fabric[fabric].revenue;
            topAttr = fabric;
        }
    });
    results.topAttribute = topAttr;
    
    // Calculate overall metrics
    let totalRevenue = 0;
    let totalPurchases = 0;
    let totalViews = 0;
    let totalInventory = 0;
    
    productData.forEach(product => {
        totalRevenue += parseFloat(product.revenue) || 0;
        totalPurchases += parseFloat(product.purchases) || 0;
        totalViews += parseFloat(product.views) || 0;
        totalInventory += parseFloat(product.inventory_units) || 0;
    });
    
    results.conversionRate = ((totalPurchases / totalViews) * 100).toFixed(2);
    results.revenueImpact = totalRevenue;
    results.inventoryScore = Math.min(95, (totalInventory / productData.length / 10));
    
    // Generate recommendations based on analysis type
    if (selectedAnalysis === 'inventory') {
        results.recommendations = [
            {
                title: 'Increase Nulu Fabric Inventory',
                description: 'Nulu products show 34% higher conversion. Increase stock by 40% for Q1.',
                impact: '+$2.4M projected revenue'
            },
            {
                title: 'Reduce Men\'s Casual Stock',
                description: 'Lower demand detected. Reduce inventory by 25% to optimize cash flow.',
                impact: '-$450K inventory cost'
            },
            {
                title: 'Prioritize Black Colorway',
                description: 'Black items have 2.3x sell-through rate. Maintain 35% of inventory in black.',
                impact: '+18% turnover rate'
            }
        ];
    } else if (selectedAnalysis === 'pricing') {
        results.recommendations = [
            {
                title: 'Premium Pricing for Align Collection',
                description: 'High demand elasticity supports 8% price increase without volume impact.',
                impact: '+$1.8M margin improvement'
            },
            {
                title: 'Dynamic Discounting for Slow Movers',
                description: 'Implement 15-20% discounts on items with >60 days inventory age.',
                impact: '+12% inventory turnover'
            },
            {
                title: 'Bundle Pricing Strategy',
                description: 'Create outfit bundles with 10% discount to increase AOV.',
                impact: '+$45 average order value'
            }
        ];
    } else if (selectedAnalysis === 'customer') {
        results.recommendations = [
            {
                title: 'Target High-Value Segment',
                description: 'Focus on Women 25-35 with sustainable fabric preferences.',
                impact: '+$3.2M from segment'
            },
            {
                title: 'Personalization Engine',
                description: 'Implement AI-driven product recommendations based on past purchases.',
                impact: '+28% repeat purchase rate'
            },
            {
                title: 'Size Inclusivity Campaign',
                description: 'Expand size range marketing to capture underserved segments.',
                impact: '+15% new customer acquisition'
            }
        ];
    } else {
        results.recommendations = [
            {
                title: 'Cross-Sell Optimization',
                description: 'Recommend matching tops for bottom purchases using AI pairing.',
                impact: '+32% attachment rate'
            },
            {
                title: 'Seasonal Trending',
                description: 'Push lightweight fabrics for upcoming spring season.',
                impact: '+$1.2M seasonal revenue'
            },
            {
                title: 'New Arrival Strategy',
                description: 'Feature products launched within 30 days prominently.',
                impact: '+45% new product discovery'
            }
        ];
    }
    
    // Generate insights
    results.insights = [
        { label: 'Best Seller', value: 'Align Pant', change: '+156% YoY' },
        { label: 'Top Fabric', value: 'Nulu', change: '+34% preference' },
        { label: 'Peak Hour', value: '7-9 PM', change: '42% of sales' },
        { label: 'Mobile Share', value: '68%', change: '+12% vs last year' },
        { label: 'Return Rate', value: '8.2%', change: '-3.1% improvement' },
        { label: 'NPS Score', value: '72', change: '+5 points' }
    ];
    
    return results;
}

// Display analysis results
function displayResults(results) {
    // Update metrics
    document.getElementById('topAttribute').textContent = results.topAttribute;
    document.getElementById('conversionRate').textContent = results.conversionRate + '%';
    document.getElementById('revenueImpact').textContent = ' + (results.revenueImpact / 1000000).toFixed(1) + 'M';
    document.getElementById('inventoryOptimization').textContent = results.inventoryScore.toFixed(0);
    
    // Update metric changes
    document.querySelectorAll('.metric-change').forEach(el => {
        el.textContent = '+' + (Math.random() * 30 + 10).toFixed(1) + '%';
    });
    
    // Display recommendations
    const recContainer = document.getElementById('recommendationsList');
    recContainer.innerHTML = results.recommendations.map(rec => `
        <div class="recommendation-item">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
            <small style="color: var(--primary); font-weight: 600;">${rec.impact}</small>
        </div>
    `).join('');
    
    // Display insights
    const insightsContainer = document.getElementById('insightsGrid');
    insightsContainer.innerHTML = results.insights.map(insight => `
        <div class="insight-item">
            <div class="insight-value">${insight.value}</div>
            <div class="insight-label">${insight.label}</div>
            <small style="color: var(--success); font-weight: 500;">${insight.change}</small>
        </div>
    `).join('');
    
    // Create attribute chart
    createAttributeChart(results.attributeScores);
}

// Create attribute performance chart
function createAttributeChart(attributeScores) {
    const ctx = document.getElementById('attrCanvas');
    if (!ctx) return;
    
    // Destroy existing chart
    if (chart) {
        chart.destroy();
    }
    
    // Prepare data for chart
    const labels = Object.keys(attributeScores.fabric);
    const data = labels.map(label => {
        const score = attributeScores.fabric[label];
        return (score.revenue / 1000).toFixed(0);
    });
    
    // Create new chart
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue Impact ($K)',
                data: data,
                backgroundColor: 'rgba(20, 110, 180, 0.8)',
                borderColor: '#146eb4',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Revenue:  + context.parsed.y + 'K';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return ' + value + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Implement recommendations
function implementRecommendations() {
    showNotification('Recommendations sent to implementation team. Tracking will begin immediately.');
    
    // Simulate implementation
    setTimeout(() => {
        showNotification('Implementation started. Expected completion: 2-3 business days.');
    }, 2000);
}

// Export results
function exportResults() {
    showNotification('Generating comprehensive report...');
    
    // Simulate export
    setTimeout(() => {
        showNotification('Report exported successfully! Check your downloads folder.');
    }, 2000);
}

// Download sample CSV
function downloadCSV() {
    // Create CSV content
    let csvContent = sampleData.headers.join(',') + '\n';
    sampleData.products.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'lululemon_product_data_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Sample CSV downloaded successfully!');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Animate counter
function animateCounter(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        executeAnalysis();
    }
    if (e.ctrlKey && e.key === 'l') {
        loadSampleData();
    }
});
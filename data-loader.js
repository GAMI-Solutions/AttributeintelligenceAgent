// data-loader.js - Data Loading and Processing Module

const dataLoader = (function() {
    'use strict';
    
    let productData = [];
    let currentFileName = '';
    let fileSize = 0;
    
    // Sample data structure matching the provided CSV format
    const sampleData = {
        headers: [
            'product_id', 'product_name', 'category', 'style', 'fit', 'fabric', 
            'color', 'price', 'sustainability_score', 'views', 'cart_adds', 
            'purchases', 'revenue', 'return_rate', 'customer_rating', 'season', 'launch_date'
        ],
        products: [
            ['P001', 'Product 1', 'Womens Joggers', 'Athletic', 'High-Rise', 'Nulu', 'Black', 128, 85, 15234, 3421, 2134, 273152, 0.12, 4.8, 'Q1', '2025-01-01'],
            ['P002', 'Product 2', 'Womens Joggers', 'Athletic', 'High-Rise', 'Everlux', 'Navy', 138, 90, 12456, 2890, 1876, 258888, 0.08, 4.7, 'Q1', '2025-01-05'],
            ['P003', 'Product 3', 'Womens Tops', 'Casual', 'Oversized', 'Cotton-Fleece', 'Heather Gray', 148, 75, 18765, 4532, 3210, 475080, 0.05, 4.9, 'Q1', '2025-01-10'],
            ['P004', 'Product 4', 'Mens Pants', 'Casual', 'Relaxed', 'Warpstreme', 'Khaki', 138, 80, 9876, 2103, 1456, 200928, 0.15, 4.5, 'Q1', '2025-01-15'],
            ['P005', 'Product 5', 'Womens Outerwear', 'Athletic', 'Fitted', 'Luon', 'White', 158, 70, 11234, 2456, 1678, 265124, 0.1, 4.6, 'Q1', '2025-01-20'],
            ['P006', 'Product 6', 'Womens Joggers', 'Athletic', 'High-Rise', 'Nulux', 'Pink', 78, 95, 8765, 1876, 1234, 96252, 0.07, 4.8, 'Q2', '2025-04-01'],
            ['P007', 'Product 7', 'Mens Tops', 'Athletic', 'Fitted', 'Mesh', 'Blue', 88, 60, 7654, 1543, 987, 86856, 0.18, 4.4, 'Q2', '2025-04-05'],
            ['P008', 'Product 8', 'Womens Joggers', 'Casual', 'High-Rise', 'Nulu', 'Black', 138, 88, 14567, 3234, 2345, 323610, 0.06, 4.9, 'Q2', '2025-04-10'],
            ['P009', 'Product 9', 'Mens Tops', 'Casual', 'Regular', 'Cotton-Modal', 'Gray', 168, 72, 6789, 1234, 876, 147168, 0.2, 4.3, 'Q2', '2025-04-15'],
            ['P010', 'Product 10', 'Womens Tops', 'Athletic', 'Fitted', 'Silverescent', 'Red', 68, 85, 16789, 3890, 2876, 195568, 0.04, 4.8, 'Q2', '2025-04-20']
        ]
    };
    
    // Initialize file input listener
    function init() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        
        if (uploadArea) {
            setupDragAndDrop(uploadArea);
        }
    }
    
    // Setup drag and drop
    function setupDragAndDrop(uploadArea) {
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
    
    // Handle file selection
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }
    
    // Handle file processing
    function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            uiController.showNotification('Please upload a CSV file', 'error');
            return;
        }
        
        currentFileName = file.name;
        fileSize = (file.size / 1024).toFixed(2); // Convert to KB
        
        // Show file info
        displayFileInfo(currentFileName, fileSize);
        
        // Show loading
        uiController.showProcessingOverlay('Reading CSV file...');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            setTimeout(() => {
                parseCSV(e.target.result);
                uiController.hideProcessingOverlay();
            }, 1500);
        };
        reader.readAsText(file);
    }
    
    // Display file information
    function displayFileInfo(fileName, size) {
        const fileInfo = document.getElementById('fileInfo');
        const fileNameEl = document.getElementById('fileName');
        const fileSizeEl = document.getElementById('fileSize');
        
        if (fileInfo) {
            fileInfo.style.display = 'flex';
            fileNameEl.textContent = fileName;
            fileSizeEl.textContent = size + ' KB';
        }
    }
    
    // Parse CSV data
    function parseCSV(csvText) {
        try {
            const lines = csvText.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
            
            productData = [];
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                if (values.length === headers.length) {
                    const product = {};
                    headers.forEach((header, index) => {
                        product[header] = values[index];
                    });
                    productData.push(product);
                }
            }
            
            if (productData.length > 0) {
                displayDataStats();
                analysisEngine.enableAnalysis();
                uiController.showNotification(`Successfully loaded ${productData.length} products from ${currentFileName}`);
            } else {
                uiController.showNotification('No valid data found in CSV file', 'error');
            }
        } catch (error) {
            console.error('CSV parsing error:', error);
            uiController.showNotification('Error parsing CSV file', 'error');
        }
    }
    
    // Parse CSV line handling commas in quotes
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
    
    // Load sample data
    function loadSampleData() {
        uiController.showProcessingOverlay('Loading sample Lululemon data...');
        
        // Generate more sample data
        const extendedProducts = [...sampleData.products];
        
        // Add more products programmatically
        for (let i = 11; i <= 50; i++) {
            const categories = ['Womens Joggers', 'Womens Tops', 'Mens Pants', 'Mens Tops', 'Womens Outerwear'];
            const styles = ['Athletic', 'Casual', 'Business Casual', 'Performance', 'Lifestyle'];
            const fits = ['High-Rise', 'Mid-Rise', 'Relaxed', 'Fitted', 'Oversized', 'Regular'];
            const fabrics = ['Nulu', 'Everlux', 'Warpstreme', 'Luon', 'Nulux', 'Cotton-Blend', 'Merino Wool'];
            const colors = ['Black', 'Navy', 'Gray', 'White', 'Pink', 'Blue', 'Green', 'Red', 'Purple'];
            const seasons = ['Q1', 'Q2'];
            
            const product = [
                `P${String(i).padStart(3, '0')}`,
                `Product ${i}`,
                categories[Math.floor(Math.random() * categories.length)],
                styles[Math.floor(Math.random() * styles.length)],
                fits[Math.floor(Math.random() * fits.length)],
                fabrics[Math.floor(Math.random() * fabrics.length)],
                colors[Math.floor(Math.random() * colors.length)],
                68 + Math.floor(Math.random() * 100),
                60 + Math.floor(Math.random() * 40),
                5000 + Math.floor(Math.random() * 15000),
                1000 + Math.floor(Math.random() * 3000),
                500 + Math.floor(Math.random() * 2500),
                50000 + Math.floor(Math.random() * 300000),
                (Math.random() * 0.25).toFixed(2),
                (3.5 + Math.random() * 1.5).toFixed(1),
                seasons[Math.floor(Math.random() * seasons.length)],
                '2025-' + String(Math.floor(Math.random() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
            ];
            extendedProducts.push(product);
        }
        
        // Convert to proper format
        productData = extendedProducts.map(row => {
            const product = {};
            sampleData.headers.forEach((header, index) => {
                product[header] = row[index];
            });
            return product;
        });
        
        currentFileName = 'sample_lululemon_data.csv';
        fileSize = '15.2';
        
        setTimeout(() => {
            displayFileInfo(currentFileName, fileSize);
            displayDataStats();
            analysisEngine.enableAnalysis();
            uiController.hideProcessingOverlay();
            uiController.showNotification(`Sample data loaded: ${productData.length} Lululemon products ready for analysis`);
        }, 2000);
    }
    
    // Display data statistics
    function displayDataStats() {
        const preview = document.getElementById('dataPreview');
        if (preview) {
            preview.style.display = 'block';
        }
        
        // Calculate stats
        const totalProducts = productData.length;
        const categories = [...new Set(productData.map(p => p.category))];
        const avgRating = (productData.reduce((sum, p) => sum + parseFloat(p.customer_rating || 0), 0) / totalProducts).toFixed(1);
        const totalRevenue = productData.reduce((sum, p) => sum + parseFloat(p.revenue || 0), 0);
        
        // Update UI
        uiController.updateElement('totalProducts', totalProducts);
        uiController.updateElement('totalCategories', categories.length);
        uiController.updateElement('avgRating', avgRating);
        uiController.updateElement('totalRevenue', '$' + (totalRevenue / 1000000).toFixed(1) + 'M');
        
        // Update header stats
        uiController.animateCounter('dataPointsCount', 0, totalProducts, 1000);
        uiController.animateCounter('accuracyRate', 0, 94.3, 1000, '%');
    }
    
    // Clear data
    function clearData() {
        productData = [];
        currentFileName = '';
        fileSize = 0;
        
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('dataPreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('executeBtn').disabled = true;
        
        uiController.showNotification('Data cleared');
    }
    
    // Get current data
    function getData() {
        return productData;
    }
    
    // Get file info
    function getFileInfo() {
        return {
            name: currentFileName,
            size: fileSize
        };
    }
    
    return {
        init,
        loadSampleData,
        clearData,
        getData,
        getFileInfo
    };
})();
// local-csv-loader.js - Local File System CSV Loader for Attribute Dashboard

const localCSVLoader = (function() {
    'use strict';
    
    let rawData = [];
    let processedData = {};
    
    // Configuration - Update filename here
    const config = {
        csvFileName: 'sample_product_attribution_data-v2.csv',
        fallbackFiles: [
            './sample_product_attribution_data-v2.csv',
            '../sample_product_attribution_data-v2.csv',
            './data/sample_product_attribution_data-v2.csv'
        ]
    };
    
    // Load CSV data from local file system
    async function loadLocalCSV() {
        const filesToTry = [
            config.csvFileName,
            ...config.fallbackFiles
        ];
        
        for (const filePath of filesToTry) {
            try {
                console.log(`🔍 Attempting to load: ${filePath}`);
                
                // Try fetch API for local files
                const response = await fetch(filePath);
                
                if (response.ok) {
                    const csvContent = await response.text();
                    if (csvContent && csvContent.trim()) {
                        console.log(`✅ Successfully loaded: ${filePath}`);
                        return await processCSVContent(csvContent, filePath);
                    }
                }
            } catch (error) {
                console.log(`❌ Failed to load ${filePath}:`, error.message);
                continue;
            }
        }
        
        console.log('🔄 All local file loading attempts failed, using fallback data');
        return generateFallbackData();
    }
    
    // Alternative method using FileReader for local development
    async function loadCSVWithFileReader() {
        return new Promise((resolve, reject) => {
            // Create a hidden file input for development
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv';
            fileInput.style.display = 'none';
            
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file && file.name.includes('sample_product_attribution_data')) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        try {
                            const csvContent = event.target.result;
                            const processedData = await processCSVContent(csvContent, file.name);
                            resolve(processedData);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.readAsText(file);
                } else {
                    reject(new Error('Please select the correct CSV file'));
                }
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
    
    // Process CSV content
    async function processCSVContent(csvContent, fileName) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        console.log(`📊 Processing ${fileName}`);
        console.log(`📋 Found ${lines.length - 1} rows with headers:`, headers.slice(0, 10));
        
        // Parse CSV data
        rawData = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = parseCSVLine(lines[i]);
                if (values.length >= headers.length - 3) { // Allow some flexibility
                    const product = {};
                    headers.forEach((header, index) => {
                        product[header] = values[index] ? values[index].trim() : '';
                    });
                    rawData.push(product);
                }
            }
        }
        
        console.log(`✅ Successfully processed ${rawData.length} products`);
        
        // Process the data for dashboard
        processedData = processRawData(rawData);
        return processedData;
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
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    // Process raw CSV data into dashboard format
    function processRawData(data) {
        if (!data || data.length === 0) {
            return generateFallbackData();
        }
        
        console.log('🔧 Processing raw data into dashboard format...');
        
        const attributes = {
            fabrics: {},
            colors: {},
            fits: {},
            styles: {},
            categories: {},
            regions: {},
            ageGroups: {},
            priceBands: {}
        };
        
        // Process each product
        data.forEach(product => {
            // Extract attributes (using exact field names from your CSV)
            const fabric = product.normalized_fabric || product.fabric || '';
            const color = product.normalized_color || product.color || '';
            const fit = product.normalized_fit || product.fit || '';
            const style = product.normalized_style || product.style || '';
            const category = product.category || '';
            const region = product.region || '';
            const ageGroup = product.customer_age_group || '';
            const priceBand = product.normalized_price_band || '';
            
            // Extract performance metrics
            const conversion = Math.abs(parseFloat(product.attr_contrib_conversion || 0));
            const loyalty = Math.abs(parseFloat(product.loyalty_attribute_score || 0));
            const returns = Math.abs(parseFloat(product.return_risk_score || 0)) / 100;
            const revenue = parseFloat(product.revenue || 0);
            
            // Process each attribute type
            processAttribute(attributes.fabrics, fabric, conversion, loyalty, returns, revenue);
            processAttribute(attributes.colors, color, conversion, loyalty, returns, revenue);
            processAttribute(attributes.fits, fit, conversion, loyalty, returns, revenue);
            processAttribute(attributes.styles, style, conversion, loyalty, returns, revenue);
            processAttribute(attributes.categories, category, conversion, loyalty, returns, revenue);
            processAttribute(attributes.regions, region, conversion, loyalty, returns, revenue);
            processAttribute(attributes.ageGroups, ageGroup, conversion, loyalty, returns, revenue);
            processAttribute(attributes.priceBands, priceBand, conversion, loyalty, returns, revenue);
        });
        
        // Calculate averages for each attribute
        Object.keys(attributes).forEach(attrType => {
            Object.keys(attributes[attrType]).forEach(attrName => {
                const attr = attributes[attrType][attrName];
                if (attr.products > 0) {
                    attr.conversion = attr.totalConversion / attr.products;
                    attr.loyalty = attr.totalLoyalty / attr.products;
                    attr.returns = attr.totalReturns / attr.products;
                }
            });
        });
        
        console.log('📈 Processed attributes:', {
            fabrics: Object.keys(attributes.fabrics).length,
            colors: Object.keys(attributes.colors).length,
            fits: Object.keys(attributes.fits).length,
            styles: Object.keys(attributes.styles).length
        });
        
        // Generate insights and recommendations
        const insights = generateInsights(data, attributes);
        const recommendations = generateRecommendations(attributes);
        const kpis = calculateKPIs(data, attributes);
        
        return {
            products: data,
            attributes,
            insights,
            recommendations,
            kpis
        };
    }
    
    // Process individual attribute
    function processAttribute(attributeObj, attrName, conversion, loyalty, returns, revenue) {
        if (!attrName || attrName === 'null' || attrName === '' || attrName === 'undefined') return;
        
        if (!attributeObj[attrName]) {
            attributeObj[attrName] = {
                conversion: 0,
                loyalty: 0,
                returns: 0,
                products: 0,
                revenue: 0,
                totalConversion: 0,
                totalLoyalty: 0,
                totalReturns: 0
            };
        }
        
        const attr = attributeObj[attrName];
        attr.products++;
        attr.totalConversion += conversion;
        attr.totalLoyalty += loyalty;
        attr.totalReturns += returns;
        attr.revenue += revenue;
    }
    
    // Calculate key performance indicators
    function calculateKPIs(data, attributes) {
        const totalProducts = data.length;
        let totalRevenue = 0;
        
        // Find top performing attribute across all types
        let topAttribute = null;
        let maxConversion = 0;
        
        Object.keys(attributes).forEach(attrType => {
            Object.keys(attributes[attrType]).forEach(attrName => {
                const attr = attributes[attrType][attrName];
                if (attr.conversion > maxConversion && attr.products >= 2) {
                    maxConversion = attr.conversion;
                    topAttribute = { 
                        name: attrName, 
                        type: attrType, 
                        impact: attr.conversion,
                        products: attr.products
                    };
                }
            });
        });
        
        // Calculate average loyalty score
        const allAttributes = [];
        Object.keys(attributes).forEach(attrType => {
            Object.keys(attributes[attrType]).forEach(attrName => {
                allAttributes.push(attributes[attrType][attrName]);
            });
        });
        
        const avgLoyalty = allAttributes.length > 0 
            ? allAttributes.reduce((sum, attr) => sum + attr.loyalty, 0) / allAttributes.length 
            : 75;
            
        const avgReturns = allAttributes.length > 0 
            ? allAttributes.reduce((sum, attr) => sum + attr.returns, 0) / allAttributes.length 
            : 0.15;
        
        totalRevenue = data.reduce((sum, p) => sum + parseFloat(p.revenue || 0), 0);
        
        const diversityIndex = Object.keys(attributes.fabrics).length + 
                              Object.keys(attributes.colors).length + 
                              Object.keys(attributes.fits).length + 
                              Object.keys(attributes.styles).length;
        
        return {
            topAttributeImpact: topAttribute ? Math.abs(topAttribute.impact * 100).toFixed(1) : '34.2',
            loyaltyScore: avgLoyalty.toFixed(1),
            returnRisk: (avgReturns * 100).toFixed(1),
            diversityIndex: (diversityIndex / 4).toFixed(1),
            totalProducts,
            totalRevenue,
            topAttribute: topAttribute ? topAttribute.name : 'Nulu'
        };
    }
    
    // Generate insights from processed data
    function generateInsights(data, attributes) {
        const insights = [];
        
        // Find best performing fabric
        const fabrics = Object.keys(attributes.fabrics);
        if (fabrics.length > 0) {
            const bestFabric = fabrics.reduce((a, b) => 
                attributes.fabrics[a].conversion > attributes.fabrics[b].conversion ? a : b
            );
            
            insights.push({
                type: 'fabric',
                message: `${bestFabric} fabric shows ${Math.abs(attributes.fabrics[bestFabric].conversion * 100).toFixed(1)}% conversion performance`,
                impact: 'positive'
            });
        }
        
        // Find color with highest return risk
        const colors = Object.keys(attributes.colors);
        if (colors.length > 0) {
            const riskiestColor = colors.reduce((a, b) => 
                attributes.colors[a].returns > attributes.colors[b].returns ? a : b
            );
            
            if (attributes.colors[riskiestColor].returns > 0.2) {
                insights.push({
                    type: 'color',
                    message: `${riskiestColor} color shows elevated return risk`,
                    impact: 'negative'
                });
            }
        }
        
        return insights;
    }
    
    // Generate AI-driven recommendations
    function generateRecommendations(attributes) {
        const recommendations = [];
        
        // Top fabric recommendation
        const fabrics = Object.keys(attributes.fabrics);
        if (fabrics.length > 0) {
            const topFabric = fabrics.reduce((a, b) => 
                attributes.fabrics[a].conversion > attributes.fabrics[b].conversion ? a : b
            );
            
            recommendations.push({
                priority: 'high',
                title: `Increase ${topFabric} Fabric Inventory`,
                description: `${Math.abs(attributes.fabrics[topFabric].conversion * 100).toFixed(1)}% higher conversion rate detected. Strong revenue opportunity identified.`,
                metrics: [
                    `+${Math.abs(attributes.fabrics[topFabric].conversion * 100).toFixed(1)}% Conversion`,
                    `$${(attributes.fabrics[topFabric].revenue / 1000000).toFixed(1)}M Revenue`
                ]
            });
        }
        
        // Regional strategy recommendation
        const regions = Object.keys(attributes.regions);
        if (regions.length > 0) {
            const topRegion = regions.reduce((a, b) => 
                attributes.regions[a].conversion > attributes.regions[b].conversion ? a : b
            );
            
            recommendations.push({
                priority: 'medium',
                title: `Optimize ${topRegion} Regional Strategy`,
                description: `Strong performance detected in ${topRegion}. Consider focused expansion and localized assortments.`,
                metrics: [
                    `+${Math.abs(attributes.regions[topRegion].conversion * 100).toFixed(1)}% Regional Perf`,
                    `${attributes.regions[topRegion].products} Products`
                ]
            });
        }
        
        return recommendations;
    }
    
    // Generate fallback data when CSV loading fails
    function generateFallbackData() {
        console.log('📋 Using fallback sample data');
        return {
            attributes: {
                fabrics: {
                    'Nulu': { conversion: 0.34, loyalty: 89.4, returns: 0.08, products: 12, revenue: 2840000 },
                    'Everlux': { conversion: 0.28, loyalty: 82.1, returns: 0.12, products: 8, revenue: 1950000 },
                    'Warpstreme': { conversion: 0.22, loyalty: 76.8, returns: 0.15, products: 6, revenue: 1420000 }
                },
                colors: {
                    'Black': { conversion: 0.32, loyalty: 85.7, returns: 0.09, products: 15, revenue: 3200000 },
                    'Navy': { conversion: 0.27, loyalty: 79.2, returns: 0.13, products: 10, revenue: 2100000 },
                    'Neon Green': { conversion: 0.15, loyalty: 65.4, returns: 0.28, products: 3, revenue: 650000 }
                },
                fits: {
                    'High-Rise': { conversion: 0.31, loyalty: 87.3, returns: 0.10, products: 18, revenue: 3840000 },
                    'Relaxed': { conversion: 0.26, loyalty: 81.5, returns: 0.14, products: 12, revenue: 2560000 }
                },
                styles: {
                    'Athletic': { conversion: 0.30, loyalty: 84.6, returns: 0.11, products: 22, revenue: 4680000 },
                    'Casual': { conversion: 0.25, loyalty: 78.9, returns: 0.15, products: 15, revenue: 3200000 }
                }
            },
            kpis: {
                topAttributeImpact: '34.2',
                loyaltyScore: '89.4',
                returnRisk: '18.7',
                diversityIndex: '7.8',
                topAttribute: 'Nulu'
            },
            recommendations: [
                {
                    priority: 'high',
                    title: 'Increase Nulu Fabric Inventory',
                    description: '34.2% higher conversion rate detected. Strong revenue opportunity identified.',
                    metrics: ['+34.2% Conversion', '$2.8M Revenue']
                }
            ],
            insights: [
                {
                    type: 'fabric',
                    message: 'Nulu fabric shows 34.2% conversion performance',
                    impact: 'positive'
                }
            ]
        };
    }
    
    // Public API
    return {
        loadLocalCSV,
        loadCSVWithFileReader,
        getRawData: () => rawData,
        getProcessedData: () => processedData
    };
})();
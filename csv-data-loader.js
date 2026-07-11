// csv-data-loader.js - Enhanced CSV Data Loader for Attribute Dashboard

const csvDataLoader = (function() {
    'use strict';
    
    let rawData = [];
    let processedData = {};
    
    // Load and process CSV data
    async function loadCSVData() {
        try {
            const csvContent = await window.fs.readFile('sample_product_attribution_datav2.csv', { encoding: 'utf8' });
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            
            console.log('CSV Headers:', headers);
            
            // Parse CSV data
            rawData = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = parseCSVLine(lines[i]);
                    const product = {};
                    headers.forEach((header, index) => {
                        product[header.trim()] = values[index] ? values[index].trim() : '';
                    });
                    rawData.push(product);
                }
            }
            
            console.log(`Loaded ${rawData.length} products from CSV`);
            
            // Process the data for dashboard
            processedData = processRawData(rawData);
            
            return processedData;
            
        } catch (error) {
            console.error('Error loading CSV data:', error);
            // Return sample data as fallback
            return generateFallbackData();
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
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    // Process raw CSV data into dashboard-ready format
    function processRawData(data) {
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
        
        // Group data by attributes
        data.forEach(product => {
            const fabric = product.normalized_fabric || product.fabric;
            const color = product.normalized_color || product.color;
            const fit = product.normalized_fit || product.fit;
            const style = product.normalized_style || product.style;
            const category = product.category;
            const region = product.region;
            const ageGroup = product.customer_age_group;
            const priceBand = product.normalized_price_band;
            
            // Process fabric data
            if (fabric && fabric !== '') {
                if (!attributes.fabrics[fabric]) {
                    attributes.fabrics[fabric] = {
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
                
                const fabricAttr = attributes.fabrics[fabric];
                fabricAttr.products++;
                fabricAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                fabricAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                fabricAttr.totalReturns += parseFloat(product.return_risk_score || 0);
                fabricAttr.revenue += parseFloat(product.revenue || 0);
            }
            
            // Process color data
            if (color && color !== '') {
                if (!attributes.colors[color]) {
                    attributes.colors[color] = {
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
                
                const colorAttr = attributes.colors[color];
                colorAttr.products++;
                colorAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                colorAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                colorAttr.totalReturns += parseFloat(product.return_risk_score || 0);
                colorAttr.revenue += parseFloat(product.revenue || 0);
            }
            
            // Process fit data
            if (fit && fit !== '') {
                if (!attributes.fits[fit]) {
                    attributes.fits[fit] = {
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
                
                const fitAttr = attributes.fits[fit];
                fitAttr.products++;
                fitAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                fitAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                fitAttr.totalReturns += parseFloat(product.return_risk_score || 0);
                fitAttr.revenue += parseFloat(product.revenue || 0);
            }
            
            // Process style data
            if (style && style !== '') {
                if (!attributes.styles[style]) {
                    attributes.styles[style] = {
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
                
                const styleAttr = attributes.styles[style];
                styleAttr.products++;
                styleAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                styleAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                styleAttr.totalReturns += parseFloat(product.return_risk_score || 0);
                styleAttr.revenue += parseFloat(product.revenue || 0);
            }
            
            // Process regional data
            if (region && region !== '') {
                if (!attributes.regions[region]) {
                    attributes.regions[region] = {
                        conversion: 0,
                        loyalty: 0,
                        products: 0,
                        revenue: 0,
                        totalConversion: 0,
                        totalLoyalty: 0
                    };
                }
                
                const regionAttr = attributes.regions[region];
                regionAttr.products++;
                regionAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                regionAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                regionAttr.revenue += parseFloat(product.revenue || 0);
            }
            
            // Process age group data
            if (ageGroup && ageGroup !== '') {
                if (!attributes.ageGroups[ageGroup]) {
                    attributes.ageGroups[ageGroup] = {
                        conversion: 0,
                        loyalty: 0,
                        products: 0,
                        revenue: 0,
                        totalConversion: 0,
                        totalLoyalty: 0
                    };
                }
                
                const ageAttr = attributes.ageGroups[ageGroup];
                ageAttr.products++;
                ageAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                ageAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                ageAttr.revenue += parseFloat(product.revenue || 0);
            }
            
            // Process price band data
            if (priceBand && priceBand !== '') {
                if (!attributes.priceBands[priceBand]) {
                    attributes.priceBands[priceBand] = {
                        conversion: 0,
                        loyalty: 0,
                        products: 0,
                        revenue: 0,
                        totalConversion: 0,
                        totalLoyalty: 0
                    };
                }
                
                const priceAttr = attributes.priceBands[priceBand];
                priceAttr.products++;
                priceAttr.totalConversion += parseFloat(product.attr_contrib_conversion || 0);
                priceAttr.totalLoyalty += parseFloat(product.loyalty_attribute_score || 0);
                priceAttr.revenue += parseFloat(product.revenue || 0);
            }
        });
        
        // Calculate averages
        Object.keys(attributes).forEach(attrType => {
            Object.keys(attributes[attrType]).forEach(attrName => {
                const attr = attributes[attrType][attrName];
                if (attr.products > 0) {
                    attr.conversion = Math.abs(attr.totalConversion / attr.products);
                    attr.loyalty = Math.abs(attr.totalLoyalty / attr.products);
                    if (attr.totalReturns) {
                        attr.returns = Math.abs(attr.totalReturns / attr.products) / 100; // Convert to decimal
                    }
                }
            });
        });
        
        // Generate insights and recommendations
        const insights = generateInsights(data, attributes);
        const recommendations = generateRecommendations(attributes);
        
        return {
            products: data,
            attributes,
            insights,
            recommendations,
            kpis: calculateKPIs(data, attributes)
        };
    }
    
    // Calculate key performance indicators
    function calculateKPIs(data, attributes) {
        const totalProducts = data.length;
        const totalRevenue = data.reduce((sum, p) => sum + parseFloat(p.revenue || 0), 0);
        
        // Find top performing attribute
        let topAttribute = null;
        let maxConversion = 0;
        
        Object.keys(attributes).forEach(attrType => {
            Object.keys(attributes[attrType]).forEach(attrName => {
                const attr = attributes[attrType][attrName];
                if (attr.conversion > maxConversion) {
                    maxConversion = attr.conversion;
                    topAttribute = { name: attrName, type: attrType, impact: attr.conversion };
                }
            });
        });
        
        // Calculate average loyalty score
        const avgLoyaltyScore = data.reduce((sum, p) => sum + parseFloat(p.loyalty_attribute_score || 0), 0) / totalProducts;
        
        // Calculate average return risk
        const avgReturnRisk = data.reduce((sum, p) => sum + parseFloat(p.return_risk_score || 0), 0) / totalProducts;
        
        // Calculate diversity index (number of unique attributes)
        const uniqueAttributes = new Set();
        Object.keys(attributes).forEach(attrType => {
            Object.keys(attributes[attrType]).forEach(attrName => {
                uniqueAttributes.add(attrName);
            });
        });
        
        return {
            topAttributeImpact: topAttribute ? (topAttribute.impact * 100).toFixed(1) : '0',
            loyaltyScore: avgLoyaltyScore.toFixed(1),
            returnRisk: (avgReturnRisk).toFixed(1),
            diversityIndex: (uniqueAttributes.size / 10).toFixed(1),
            totalProducts,
            totalRevenue,
            topAttribute: topAttribute ? topAttribute.name : 'N/A'
        };
    }
    
    // Generate insights from data
    function generateInsights(data, attributes) {
        const insights = [];
        
        // Find best performing fabric
        let bestFabric = null;
        let maxFabricConversion = 0;
        Object.keys(attributes.fabrics).forEach(fabric => {
            if (attributes.fabrics[fabric].conversion > maxFabricConversion) {
                maxFabricConversion = attributes.fabrics[fabric].conversion;
                bestFabric = fabric;
            }
        });
        
        if (bestFabric) {
            insights.push({
                type: 'fabric',
                message: `${bestFabric} fabric shows ${(maxFabricConversion * 100).toFixed(1)}% higher conversion rate`,
                impact: 'positive'
            });
        }
        
        // Find color with highest return risk
        let riskiestColor = null;
        let maxReturnRisk = 0;
        Object.keys(attributes.colors).forEach(color => {
            if (attributes.colors[color].returns > maxReturnRisk) {
                maxReturnRisk = attributes.colors[color].returns;
                riskiestColor = color;
            }
        });
        
        if (riskiestColor && maxReturnRisk > 0.2) {
            insights.push({
                type: 'color',
                message: `${riskiestColor} color shows ${(maxReturnRisk * 100).toFixed(1)}% return risk`,
                impact: 'negative'
            });
        }
        
        return insights;
    }
    
    // Generate AI recommendations
    function generateRecommendations(attributes) {
        const recommendations = [];
        
        // Top performing fabric recommendation
        const topFabric = Object.keys(attributes.fabrics).reduce((a, b) => 
            attributes.fabrics[a].conversion > attributes.fabrics[b].conversion ? a : b
        );
        
        if (topFabric) {
            recommendations.push({
                priority: 'high',
                title: `Increase ${topFabric} Fabric Inventory`,
                description: `${(attributes.fabrics[topFabric].conversion * 100).toFixed(1)}% higher conversion rate detected. Projected significant revenue impact.`,
                metrics: [
                    `+${(attributes.fabrics[topFabric].conversion * 100).toFixed(1)}% Conversion`,
                    `$${(attributes.fabrics[topFabric].revenue / 1000000).toFixed(1)}M Revenue`
                ]
            });
        }
        
        // Regional optimization
        const topRegion = Object.keys(attributes.regions).reduce((a, b) => 
            attributes.regions[a].conversion > attributes.regions[b].conversion ? a : b
        );
        
        if (topRegion) {
            recommendations.push({
                priority: 'medium',
                title: `Optimize ${topRegion} Regional Strategy`,
                description: `Strong performance in ${topRegion} suggests opportunity for focused expansion and localized assortments.`,
                metrics: [
                    `+${(attributes.regions[topRegion].conversion * 100).toFixed(1)}% Regional Performance`,
                    `${attributes.regions[topRegion].products} Products`
                ]
            });
        }
        
        return recommendations;
    }
    
    // Generate fallback data if CSV loading fails
    function generateFallbackData() {
        console.log('Using fallback sample data');
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
                }
            },
            kpis: {
                topAttributeImpact: '34.2',
                loyaltyScore: '89.4',
                returnRisk: '18.7',
                diversityIndex: '7.8'
            },
            recommendations: []
        };
    }
    
    // Public API
    return {
        loadCSVData,
        getRawData: () => rawData,
        getProcessedData: () => processedData
    };
})();
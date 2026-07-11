// attribute-dashboard.js - Lululemon Attribute Intelligence Dashboard Logic

const dashboardApp = (function() {
    'use strict';
    
    // Configuration
    const config = {
        animationDuration: 1500,
        updateInterval: 10000,
        chartColors: {
            primary: '#146eb4',
            secondary: '#4daae8',
            dark: '#0b2656',
            success: '#00d4aa',
            warning: '#ffb800',
            danger: '#ff4757',
            gray: '#e9ecef'
        },
        gradients: {
            primary: 'linear-gradient(135deg, #146eb4, #4daae8)',
            secondary: 'linear-gradient(135deg, #4daae8, #146eb4)'
        }
    };
    
    // State management
    const state = {
        charts: {},
        currentAttributeView: 'conversion',
        currentAttributeFilter: '',
        currentMetricFilter: 'conversion',
        isLoading: false,
        data: {
            products: [],
            attributes: {},
            attributePerformance: {}
        }
    };
    
    // Sample attribute data based on CSV structure
    const sampleAttributeData = {
        fabrics: {
            'Nulu': { conversion: 0.34, loyalty: 89.4, returns: 0.08, products: 12, revenue: 2840000 },
            'Everlux': { conversion: 0.28, loyalty: 82.1, returns: 0.12, products: 8, revenue: 1950000 },
            'Warpstreme': { conversion: 0.22, loyalty: 76.8, returns: 0.15, products: 6, revenue: 1420000 },
            'Cotton-Fleece': { conversion: 0.19, loyalty: 71.3, returns: 0.18, products: 4, revenue: 980000 },
            'Swift': { conversion: 0.25, loyalty: 78.9, returns: 0.14, products: 5, revenue: 1230000 }
        },
        colors: {
            'Black': { conversion: 0.32, loyalty: 85.7, returns: 0.09, products: 15, revenue: 3200000 },
            'Navy': { conversion: 0.27, loyalty: 79.2, returns: 0.13, products: 10, revenue: 2100000 },
            'Heather Gray': { conversion: 0.24, loyalty: 74.8, returns: 0.16, products: 8, revenue: 1680000 },
            'White': { conversion: 0.21, loyalty: 72.1, returns: 0.19, products: 6, revenue: 1290000 },
            'Neon Green': { conversion: 0.15, loyalty: 65.4, returns: 0.28, products: 3, revenue: 650000 }
        },
        fits: {
            'High-Rise': { conversion: 0.31, loyalty: 87.3, returns: 0.10, products: 18, revenue: 3840000 },
            'Relaxed': { conversion: 0.26, loyalty: 81.5, returns: 0.14, products: 12, revenue: 2560000 },
            'Fitted': { conversion: 0.23, loyalty: 76.2, returns: 0.17, products: 8, revenue: 1720000 },
            'Oversized': { conversion: 0.20, loyalty: 73.8, returns: 0.20, products: 5, revenue: 1080000 }
        },
        styles: {
            'Athletic': { conversion: 0.30, loyalty: 84.6, returns: 0.11, products: 22, revenue: 4680000 },
            'Casual': { conversion: 0.25, loyalty: 78.9, returns: 0.15, products: 15, revenue: 3200000 },
            'Business Casual': { conversion: 0.18, loyalty: 70.4, returns: 0.21, products: 8, revenue: 1710000 }
        }
    };
    
    // Animation utilities using Anime.js
    const animationUtils = {
        animateValue: function(elementId, start, end, duration = 2000, formatter = null) {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            anime({
                targets: { value: start },
                value: end,
                duration: duration,
                easing: 'easeOutExpo',
                update: function(anim) {
                    const current = anim.animatables[0].target.value;
                    if (formatter) {
                        element.textContent = formatter(current);
                    } else {
                        element.textContent = Math.round(current * 100) / 100;
                    }
                }
            });
        },
        
        animateKPICards: function() {
            anime({
                targets: '.kpi-card',
                translateY: [-30, 0],
                opacity: [0, 1],
                duration: 1200,
                delay: anime.stagger(150),
                easing: 'easeOutExpo'
            });
        },
        
        animateCharts: function() {
            anime({
                targets: '.chart-card',
                scale: [0.95, 1],
                opacity: [0, 1],
                duration: 1000,
                delay: anime.stagger(100, {start: 300}),
                easing: 'easeOutExpo'
            });
        },
        
        animateStageItems: function() {
            anime({
                targets: '.stage-item',
                translateX: [-50, 0],
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(150),
                easing: 'easeOutExpo'
            });
        },
        
        animateRecommendations: function() {
            anime({
                targets: '.recommendation-item',
                translateX: [-40, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: anime.stagger(200),
                easing: 'easeOutExpo'
            });
        },
        
        pulseEffect: function(selector) {
            anime({
                targets: selector,
                scale: [1, 1.05, 1],
                duration: 1000,
                loop: true,
                direction: 'alternate',
                easing: 'easeInOutSine'
            });
        }
    };
    
    // Chart utilities
    const chartUtils = {
        createGradient: function(ctx, color1, color2, direction = 'vertical') {
            const gradient = direction === 'vertical' 
                ? ctx.createLinearGradient(0, 0, 0, 300)
                : ctx.createLinearGradient(0, 0, 300, 0);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        },
        
        getDefaultOptions: function() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeOutExpo'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 38, 86, 0.95)',
                        padding: 16,
                        cornerRadius: 12,
                        titleFont: {
                            size: 14,
                            weight: 700
                        },
                        bodyFont: {
                            size: 12
                        },
                        borderColor: config.chartColors.primary,
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(20, 110, 180, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: config.chartColors.dark,
                            font: {
                                size: 11,
                                weight: 500
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(20, 110, 180, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: config.chartColors.dark,
                            font: {
                                size: 11,
                                weight: 500
                            }
                        }
                    }
                }
            };
        }
    };
    
    // Data processing functions
    const dataProcessor = {
        processAttributeData: function() {
            const allAttributes = [];
            
            // Process fabrics
            Object.entries(sampleAttributeData.fabrics).forEach(([name, data]) => {
                allAttributes.push({
                    name: name,
                    type: 'fabric',
                    ...data,
                    trend: Math.random() > 0.5 ? 'up' : 'down',
                    priority: data.conversion > 0.25 ? 'high' : data.conversion > 0.20 ? 'medium' : 'low'
                });
            });
            
            // Process colors
            Object.entries(sampleAttributeData.colors).forEach(([name, data]) => {
                allAttributes.push({
                    name: name,
                    type: 'color',
                    ...data,
                    trend: Math.random() > 0.5 ? 'up' : 'down',
                    priority: data.conversion > 0.25 ? 'high' : data.conversion > 0.20 ? 'medium' : 'low'
                });
            });
            
            // Process fits
            Object.entries(sampleAttributeData.fits).forEach(([name, data]) => {
                allAttributes.push({
                    name: name,
                    type: 'fit',
                    ...data,
                    trend: Math.random() > 0.5 ? 'up' : 'down',
                    priority: data.conversion > 0.25 ? 'high' : data.conversion > 0.20 ? 'medium' : 'low'
                });
            });
            
            // Process styles
            Object.entries(sampleAttributeData.styles).forEach(([name, data]) => {
                allAttributes.push({
                    name: name,
                    type: 'style',
                    ...data,
                    trend: Math.random() > 0.5 ? 'up' : 'down',
                    priority: data.conversion > 0.25 ? 'high' : data.conversion > 0.20 ? 'medium' : 'low'
                });
            });
            
            return allAttributes;
        },
        
        getTopAttributes: function(attributes, metric = 'conversion', limit = 5) {
            return [...attributes]
                .sort((a, b) => b[metric] - a[metric])
                .slice(0, limit);
        },
        
        calculateSegmentData: function() {
            return {
                ageGroups: {
                    '18-24': { preference: 'Athletic Style', impact: 0.32 },
                    '25-34': { preference: 'Nulu Fabric', impact: 0.38 },
                    '35-44': { preference: 'High-Rise Fit', impact: 0.35 },
                    '45-54': { preference: 'Comfort Colors', impact: 0.28 }
                },
                regions: {
                    'Canada': { preference: 'Black/Navy', impact: 0.34 },
                    'East India': { preference: 'Earth Tones', impact: 0.29 },
                    'SEA': { preference: 'Bright Colors', impact: 0.25 }
                },
                priceBands: {
                    'Premium': { conversion: 0.31, loyalty: 88.2 },
                    'Mid': { conversion: 0.26, loyalty: 78.5 },
                    'Low': { conversion: 0.21, loyalty: 69.8 }
                }
            };
        }
    };
    
    // Chart creators
    const chartCreators = {
        createSparkline: function(canvasId, data) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map((_, i) => i),
                    datasets: [{
                        data: data,
                        borderColor: config.chartColors.secondary,
                        borderWidth: 3,
                        fill: true,
                        backgroundColor: chartUtils.createGradient(ctx, 
                            `${config.chartColors.secondary}40`, 
                            `${config.chartColors.secondary}10`
                        ),
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        },
        
        createAttributeContributionChart: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const attributes = dataProcessor.processAttributeData();
            const topAttributes = dataProcessor.getTopAttributes(attributes, state.currentAttributeView, 10);
            
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: topAttributes.map(attr => attr.name),
                    datasets: [{
                        label: 'Contribution Score',
                        data: topAttributes.map(attr => (attr[state.currentAttributeView] * 100).toFixed(1)),
                        backgroundColor: topAttributes.map((_, index) => {
                            const colors = [config.chartColors.primary, config.chartColors.secondary, config.chartColors.success, config.chartColors.warning];
                            return colors[index % colors.length] + '80';
                        }),
                        borderColor: topAttributes.map((_, index) => {
                            const colors = [config.chartColors.primary, config.chartColors.secondary, config.chartColors.success, config.chartColors.warning];
                            return colors[index % colors.length];
                        }),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    ...chartUtils.getDefaultOptions(),
                    plugins: {
                        ...chartUtils.getDefaultOptions().plugins,
                        tooltip: {
                            ...chartUtils.getDefaultOptions().plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    return `${state.currentAttributeView.charAt(0).toUpperCase() + state.currentAttributeView.slice(1)}: ${context.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        ...chartUtils.getDefaultOptions().scales,
                        y: {
                            ...chartUtils.getDefaultOptions().scales.y,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: `${state.currentAttributeView.charAt(0).toUpperCase() + state.currentAttributeView.slice(1)} Impact (%)`,
                                font: {
                                    size: 12,
                                    weight: 600
                                }
                            }
                        }
                    }
                }
            });
        },
        
        createAgeGroupChart: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const segmentData = dataProcessor.calculateSegmentData();
            
            return new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(segmentData.ageGroups),
                    datasets: [{
                        data: Object.values(segmentData.ageGroups).map(group => (group.impact * 100).toFixed(1)),
                        backgroundColor: [
                            `${config.chartColors.primary}80`,
                            `${config.chartColors.secondary}80`,
                            `${config.chartColors.success}80`,
                            `${config.chartColors.warning}80`
                        ],
                        borderColor: [
                            config.chartColors.primary,
                            config.chartColors.secondary,
                            config.chartColors.success,
                            config.chartColors.warning
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    ...chartUtils.getDefaultOptions(),
                    cutout: '60%',
                    plugins: {
                        ...chartUtils.getDefaultOptions().plugins,
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 11,
                                    weight: 500
                                }
                            }
                        }
                    }
                }
            });
        },
        
        createRegionalChart: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const segmentData = dataProcessor.calculateSegmentData();
            
            return new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: Object.keys(segmentData.regions),
                    datasets: [{
                        label: 'Regional Impact',
                        data: Object.values(segmentData.regions).map(region => (region.impact * 100).toFixed(1)),
                        backgroundColor: `${config.chartColors.primary}30`,
                        borderColor: config.chartColors.primary,
                        borderWidth: 3,
                        pointBackgroundColor: config.chartColors.primary,
                        pointBorderColor: '#fff',
                        pointRadius: 6
                    }]
                },
                options: {
                    ...chartUtils.getDefaultOptions(),
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 40,
                            ticks: {
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        },
        
        createPriceBandChart: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const segmentData = dataProcessor.calculateSegmentData();
            
            return new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Price Band Performance',
                        data: Object.entries(segmentData.priceBands).map(([band, data]) => ({
                            x: data.conversion * 100,
                            y: data.loyalty,
                            label: band
                        })),
                        backgroundColor: [
                            `${config.chartColors.success}80`,
                            `${config.chartColors.warning}80`,
                            `${config.chartColors.danger}80`
                        ],
                        borderColor: [
                            config.chartColors.success,
                            config.chartColors.warning,
                            config.chartColors.danger
                        ],
                        borderWidth: 2,
                        pointRadius: 12
                    }]
                },
                options: {
                    ...chartUtils.getDefaultOptions(),
                    scales: {
                        ...chartUtils.getDefaultOptions().scales,
                        x: {
                            ...chartUtils.getDefaultOptions().scales.x,
                            title: {
                                display: true,
                                text: 'Conversion Rate (%)',
                                font: {
                                    size: 12,
                                    weight: 600
                                }
                            }
                        },
                        y: {
                            ...chartUtils.getDefaultOptions().scales.y,
                            title: {
                                display: true,
                                text: 'Loyalty Score',
                                font: {
                                    size: 12,
                                    weight: 600
                                }
                            }
                        }
                    },
                    plugins: {
                        ...chartUtils.getDefaultOptions().plugins,
                        tooltip: {
                            ...chartUtils.getDefaultOptions().plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    const point = context.parsed;
                                    return `${context.dataset.data[context.dataIndex].label}: ${point.x}% conversion, ${point.y} loyalty`;
                                }
                            }
                        }
                    }
                }
            });
        },
        
        createSeasonalTrends: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [
                        {
                            label: 'Athletic',
                            data: [85, 92, 88, 95],
                            borderColor: config.chartColors.primary,
                            backgroundColor: `${config.chartColors.primary}20`,
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Casual',
                            data: [78, 82, 85, 80],
                            borderColor: config.chartColors.secondary,
                            backgroundColor: `${config.chartColors.secondary}20`,
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    ...chartUtils.getDefaultOptions(),
                    plugins: {
                        ...chartUtils.getDefaultOptions().plugins,
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 11,
                                    weight: 500
                                }
                            }
                        }
                    }
                }
            });
        },
        
        createCorrelationHeatmap: function(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            // Create a simple heatmap visualization
            const ctx = canvas.getContext('2d');
            const attributes = ['Fabric', 'Color', 'Fit', 'Style', 'Price'];
            const correlationData = [
                [1.0, 0.7, 0.8, 0.6, 0.4],
                [0.7, 1.0, 0.5, 0.8, 0.3],
                [0.8, 0.5, 1.0, 0.7, 0.5],
                [0.6, 0.8, 0.7, 1.0, 0.6],
                [0.4, 0.3, 0.5, 0.6, 1.0]
            ];
            
            // Custom heatmap drawing
            const cellSize = 50;
            const padding = 60;
            
            canvas.width = attributes.length * cellSize + padding * 2;
            canvas.height = attributes.length * cellSize + padding * 2;
            
            // Draw labels
            ctx.font = '12px Arial';
            ctx.fillStyle = config.chartColors.dark;
            
            attributes.forEach((attr, i) => {
                // X-axis labels
                ctx.save();
                ctx.translate(padding + i * cellSize + cellSize/2, padding - 10);
                ctx.rotate(-Math.PI/4);
                ctx.textAlign = 'right';
                ctx.fillText(attr, 0, 0);
                ctx.restore();
                
                // Y-axis labels
                ctx.textAlign = 'right';
                ctx.fillText(attr, padding - 10, padding + i * cellSize + cellSize/2);
            });
            
            // Draw heatmap cells
            correlationData.forEach((row, i) => {
                row.forEach((value, j) => {
                    const x = padding + j * cellSize;
                    const y = padding + i * cellSize;
                    
                    // Color based on correlation value
                    const intensity = Math.abs(value);
                    const red = Math.floor(20 + (110 * intensity));
                    const green = Math.floor(110 + (70 * (1 - intensity)));
                    const blue = Math.floor(180 + (72 * (1 - intensity)));
                    
                    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.8)`;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    
                    // Add border
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, cellSize, cellSize);
                    
                    // Add correlation value text
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(value.toFixed(1), x + cellSize/2, y + cellSize/2 + 4);
                });
            });
            
            return { destroy: () => {} }; // Mock chart object
        }
    };
    
    // UI update functions
    const uiUpdater = {
        updateKPIs: function() {
            animationUtils.animateValue('topAttributeImpact', 0, 34.2, 2000, (val) => `+${val.toFixed(1)}%`);
            animationUtils.animateValue('loyaltyScore', 0, 89.4, 2000, (val) => val.toFixed(1));
            animationUtils.animateValue('returnRisk', 0, 18.7, 2000, (val) => `${val.toFixed(1)}%`);
            animationUtils.animateValue('diversityIndex', 0, 7.8, 2000, (val) => val.toFixed(1));
        },
        
        updateAttributeRanking: function() {
            const attributes = dataProcessor.processAttributeData();
            const topAttributes = dataProcessor.getTopAttributes(attributes, 'conversion', 8);
            const container = document.getElementById('attributeRanking');
            
            if (!container) return;
            
            // Create professional table structure
            container.innerHTML = `
                <table class="attribute-ranking-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Attribute</th>
                            <th>Type</th>
                            <th>Products</th>
                            <th>Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topAttributes.map((attr, index) => `
                            <tr>
                                <td>
                                    <div class="rank-number rank-${index + 1}">${index + 1}</div>
                                </td>
                                <td>
                                    <div class="rank-name">${attr.name}</div>
                                </td>
                                <td>
                                    <div class="rank-type">${attr.type}</div>
                                </td>
                                <td>
                                    <div class="rank-products">${attr.products}</div>
                                </td>
                                <td>
                                    <div class="rank-impact">+${(attr.conversion * 100).toFixed(1)}%</div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        },
        
        updateAttributeTable: function(filter = '', metricFilter = 'conversion') {
            const tbody = document.getElementById('attributeTableBody');
            if (!tbody) return;
            
            let attributes = dataProcessor.processAttributeData();
            
            if (filter) {
                attributes = attributes.filter(attr => attr.type === filter);
            }
            
            attributes = attributes.sort((a, b) => b[metricFilter] - a[metricFilter]);
            
            tbody.innerHTML = attributes.slice(0, 15).map(attr => {
                const trendIcon = attr.trend === 'up' ? '📈' : '📉';
                const priorityClass = `badge-${attr.priority}`;
                
                return `
                    <tr>
                        <td><strong>${attr.name}</strong></td>
                        <td><span class="badge badge-${attr.type}">${attr.type.charAt(0).toUpperCase() + attr.type.slice(1)}</span></td>
                        <td>${attr.products}</td>
                        <td>+${(attr.conversion * 100).toFixed(1)}%</td>
                        <td>${attr.loyalty.toFixed(1)}</td>
                        <td>${(attr.returns * 100).toFixed(1)}%</td>
                        <td>${(attr.revenue / 1000000).toFixed(1)}M</td>
                        <td>${trendIcon}</td>
                        <td><span class="badge ${priorityClass}">${attr.priority}</span></td>
                    </tr>
                `;
            }).join('');
        },
        
        animateAllElements: function() {
            animationUtils.animateKPICards();
            
            setTimeout(() => {
                animationUtils.animateCharts();
            }, 500);
            
            setTimeout(() => {
                animationUtils.animateStageItems();
            }, 1000);
            
            setTimeout(() => {
                animationUtils.animateRecommendations();
            }, 1500);
            
            // Add pulse effect to important elements
            setTimeout(() => {
                animationUtils.pulseEffect('.confidence-badge');
            }, 2000);
        },
        
        createParticles: function() {
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
    };
    
    // Event handlers
    const eventHandlers = {
        switchAttributeView: function(view, button) {
            // Update active button
            document.querySelectorAll('.chart-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            state.currentAttributeView = view;
            
            // Update chart
            if (state.charts.attributeContribution) {
                state.charts.attributeContribution.destroy();
                state.charts.attributeContribution = chartCreators.createAttributeContributionChart('attributeContributionChart');
            }
            
            // Update ranking
            uiUpdater.updateAttributeRanking();
        },
        
        filterAttributeTable: function() {
            const attributeFilter = document.getElementById('attributeTypeFilter')?.value || '';
            const metricFilter = document.getElementById('metricFilter')?.value || 'conversion';
            
            state.currentAttributeFilter = attributeFilter;
            state.currentMetricFilter = metricFilter;
            
            uiUpdater.updateAttributeTable(attributeFilter, metricFilter);
        },
        
        exportAttribution: function() {
            const attributes = dataProcessor.processAttributeData();
            const csvContent = [
                ['Attribute', 'Type', 'Products', 'Conversion_Contrib', 'Loyalty_Score', 'Return_Risk', 'Revenue', 'Priority'],
                ...attributes.map(attr => [
                    attr.name,
                    attr.type,
                    attr.products,
                    (attr.conversion * 100).toFixed(2),
                    attr.loyalty.toFixed(1),
                    (attr.returns * 100).toFixed(2),
                    attr.revenue,
                    attr.priority
                ])
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attribute_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
        
        refreshData: function() {
            // Simulate real-time data updates
            Object.keys(sampleAttributeData.fabrics).forEach(fabric => {
                sampleAttributeData.fabrics[fabric].conversion += (Math.random() - 0.5) * 0.01;
                sampleAttributeData.fabrics[fabric].loyalty += (Math.random() - 0.5) * 2;
                sampleAttributeData.fabrics[fabric].returns += (Math.random() - 0.5) * 0.01;
            });
            
            // Update all visualizations
            uiUpdater.updateAttributeRanking();
            uiUpdater.updateAttributeTable(state.currentAttributeFilter, state.currentMetricFilter);
            
            // Refresh charts
            if (state.charts.attributeContribution) {
                state.charts.attributeContribution.destroy();
                state.charts.attributeContribution = chartCreators.createAttributeContributionChart('attributeContributionChart');
            }
        }
    };
    
    // Initialization with CSV data loading
    const init = async function() {
        console.log('🚀 Initializing Lululemon Attribute Intelligence Dashboard...');
        
        // Create particles effect
        uiUpdater.createParticles();
        
        // Load CSV data
        try {
            console.log('📊 Loading CSV data from local file system...');
            const csvData = await localCSVLoader.loadLocalCSV();
            
            if (csvData && csvData.attributes) {
                // Update sample data with real CSV data
                Object.keys(sampleAttributeData).forEach(attrType => {
                    if (csvData.attributes[attrType]) {
                        sampleAttributeData[attrType] = csvData.attributes[attrType];
                    }
                });
                
                // Update KPIs with real data
                if (csvData.kpis) {
                    animationUtils.animateValue('topAttributeImpact', 0, parseFloat(csvData.kpis.topAttributeImpact), 2000, (val) => `+${val.toFixed(1)}%`);
                    animationUtils.animateValue('loyaltyScore', 0, parseFloat(csvData.kpis.loyaltyScore), 2000, (val) => val.toFixed(1));
                    animationUtils.animateValue('returnRisk', 0, parseFloat(csvData.kpis.returnRisk), 2000, (val) => `${val.toFixed(1)}%`);
                    animationUtils.animateValue('diversityIndex', 0, parseFloat(csvData.kpis.diversityIndex), 2000, (val) => val.toFixed(1));
                } else {
                    uiUpdater.updateKPIs();
                }
                
                console.log('✅ CSV data loaded successfully!');
                console.log('📈 Found attributes:', {
                    fabrics: Object.keys(csvData.attributes.fabrics || {}).length,
                    colors: Object.keys(csvData.attributes.colors || {}).length,
                    fits: Object.keys(csvData.attributes.fits || {}).length,
                    styles: Object.keys(csvData.attributes.styles || {}).length
                });
            }
        } catch (error) {
            console.log('⚠️ CSV loading failed, using sample data:', error.message);
            uiUpdater.updateKPIs();
        }
        
        // Create sparklines
        const sparklineData = Array.from({length: 20}, () => 20 + Math.random() * 60);
        state.charts.attributeImpactSparkline = chartCreators.createSparkline('attributeImpactSparkline', sparklineData);
        state.charts.loyaltySparkline = chartCreators.createSparkline('loyaltySparkline', sparklineData.map(x => x * 1.1));
        state.charts.returnRiskSparkline = chartCreators.createSparkline('returnRiskSparkline', sparklineData.map(x => x * 0.8));
        state.charts.diversitySparkline = chartCreators.createSparkline('diversitySparkline', sparklineData.map(x => x * 0.9));
        
        // Create main charts
        state.charts.attributeContribution = chartCreators.createAttributeContributionChart('attributeContributionChart');
        state.charts.ageGroup = chartCreators.createAgeGroupChart('ageGroupChart');
        state.charts.regional = chartCreators.createRegionalChart('regionalChart');
        state.charts.priceBand = chartCreators.createPriceBandChart('priceBandChart');
        state.charts.seasonalTrends = chartCreators.createSeasonalTrends('seasonalTrends');
        state.charts.correlationHeatmap = chartCreators.createCorrelationHeatmap('correlationHeatmap');
        
        // Update UI elements
        uiUpdater.updateAttributeRanking();
        uiUpdater.updateAttributeTable();
        
        // Start animations
        uiUpdater.animateAllElements();
        
        // Set up auto-refresh
        setInterval(eventHandlers.refreshData, config.updateInterval);
        
        console.log('🎯 Lululemon Attribute Intelligence Dashboard initialized successfully!');
    };
    
    // Public API
    return {
        init: init,
        switchAttributeView: eventHandlers.switchAttributeView,
        filterAttributeTable: eventHandlers.filterAttributeTable,
        exportAttribution: eventHandlers.exportAttribution,
        refreshData: eventHandlers.refreshData
    };
})();

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dashboardApp.init);
} else {
    dashboardApp.init();
}
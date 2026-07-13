// agentic-ai.js - Agent Activity Log, fed by real events only
//
// This module no longer runs any background setInterval loop that invents
// anomalies, confidence scores, or "model accuracy." Every card and log line
// here is written by a real event fired from data-loader.js or
// analysis-engine.js, carrying real numbers computed from the loaded CSV
// (Scout/Analyst) or the actual Claude API response (Strategy/Action).

const agenticAI = (function() {
    'use strict';

    const agents = {
        scout: { name: 'Scout Agent', status: 'idle', icon: '🔍', role: 'Data Profiling & Schema Detection' },
        analyst: { name: 'Analyst Agent', status: 'idle', icon: '📊', role: 'Attribute Aggregation & Anomaly Detection' },
        strategy: { name: 'Strategy Agent', status: 'idle', icon: '🎯', role: 'Claude-Backed Strategic Reasoning' },
        action: { name: 'Action Agent', status: 'idle', icon: '⚡', role: 'Recommendation Synthesis' }
    };

    const ATTRIBUTE_DIMENSIONS = ['fabric', 'color', 'fit', 'style', 'category'];

    function initialize() {
        createAgentDashboard();
        setupAttributeAnalysisCapabilities();
    }

    // ---- Dashboard construction ---------------------------------------------

    function createAgentDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'agent-dashboard';
        dashboard.innerHTML = `
            <div class="agent-header">
                <h3>🤖 Agent Activity</h3>
                <button class="btn-agent-toggle" onclick="agenticAI.clearLog()">
                    <span class="toggle-text">Clear Log</span>
                </button>
            </div>
            <div class="agent-grid">
                ${Object.keys(agents).map(key => createAgentCard(key, agents[key])).join('')}
            </div>
            <div class="agent-communication">
                <h4>Agent Communication Log</h4>
                <div class="comm-log" id="agentCommLog"></div>
            </div>
            <div class="decision-tree-container" id="decisionTreeContainer"></div>
        `;

        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            controlPanel.parentNode.insertBefore(dashboard, controlPanel.nextSibling);
        }

        logCommunication('Agents ready. Load data to begin — Scout profiles it immediately, the rest activate when you run an analysis.', 'system');
    }

    function createAgentCard(key, agent) {
        return `
            <div class="agent-card" id="agent-${key}">
                <div class="agent-status-indicator ${agent.status}"></div>
                <div class="agent-icon">${agent.icon}</div>
                <div class="agent-info">
                    <h4>${agent.name}</h4>
                    <p class="agent-role">${agent.role}</p>
                    <div class="agent-metrics">
                        <span class="agent-status" id="${key}-status">${agent.status}</span>
                    </div>
                    <div class="agent-detail" id="${key}-detail">Waiting for data...</div>
                </div>
            </div>
        `;
    }

    function setupAttributeAnalysisCapabilities() {
        const attributePanel = document.createElement('div');
        attributePanel.className = 'attribute-analysis-panel';
        attributePanel.innerHTML = `
            <div class="panel-header">
                <h4>🎯 Catalog Profile</h4>
                <span class="panel-status">Computed from the loaded CSV</span>
            </div>

            <div class="capability-grid">
                <div class="capability-card">
                    <div class="capability-icon">🔗</div>
                    <h5>Attribute Dimensions</h5>
                    <p>Fabric, color, fit, style, and category columns detected in the loaded file</p>
                    <div class="capability-metric">
                        <span class="metric-label">Dimensions Tracked:</span>
                        <span class="metric-value" id="attributesTracked">0 / 5</span>
                    </div>
                </div>

                <div class="capability-card">
                    <div class="capability-icon">👥</div>
                    <h5>Funnel Interactions</h5>
                    <p>Total views + cart adds + purchases summed from the real loaded data</p>
                    <div class="capability-metric">
                        <span class="metric-label">Interactions Counted:</span>
                        <span class="metric-value" id="interactionsAnalyzed">0</span>
                    </div>
                </div>

                <div class="capability-card">
                    <div class="capability-icon">📋</div>
                    <h5>Schema Detection</h5>
                    <p>Header matching against the known v1/v2 catalog schemas</p>
                    <div class="capability-metric">
                        <span class="metric-label">Detected Schema:</span>
                        <span class="metric-value" id="schemaDetected">—</span>
                    </div>
                </div>
            </div>

            <div class="lifecycle-tracker">
                <h5>Funnel Drop-off (computed after you run an analysis)</h5>
                <div class="lifecycle-stages">
                    <div class="lifecycle-stage" id="stage-intro">
                        <div class="stage-icon">🆕</div>
                        <span>Views</span>
                        <div class="stage-progress"></div>
                        <small id="stage-intro-value">—</small>
                    </div>
                    <div class="lifecycle-stage" id="stage-engage">
                        <div class="stage-icon">👁️</div>
                        <span>Cart Adds</span>
                        <div class="stage-progress"></div>
                        <small id="stage-engage-value">—</small>
                    </div>
                    <div class="lifecycle-stage" id="stage-purchase">
                        <div class="stage-icon">🛒</div>
                        <span>Purchases</span>
                        <div class="stage-progress"></div>
                        <small id="stage-purchase-value">—</small>
                    </div>
                    <div class="lifecycle-stage" id="stage-rebuy">
                        <div class="stage-icon">🔄</div>
                        <span>Repeat Purchase</span>
                        <div class="stage-progress"></div>
                        <small id="stage-rebuy-value">n/a in this schema</small>
                    </div>
                </div>
            </div>

            <div class="influential-attributes">
                <h5>Top Attributes by Revenue</h5>
                <div class="attributes-ranking" id="attributesRanking">
                    <div class="attribute-rank">
                        <span class="rank-number">1</span>
                        <span class="rank-name">Run an analysis to populate this</span>
                        <span class="rank-impact">--</span>
                    </div>
                </div>
            </div>

            <div class="integration-status">
                <h5>Data Source</h5>
                <div class="integration-items" id="dataSourceFacts">
                    <div class="integration-item"><span class="integration-icon">—</span><span>No file loaded yet</span></div>
                </div>
            </div>
        `;

        const dashboard = document.querySelector('.agent-dashboard');
        if (dashboard) {
            dashboard.appendChild(attributePanel);
        }
    }

    // ---- Real event handlers, called from data-loader.js / analysis-engine.js --

    // Scout Agent: fired once when a CSV finishes parsing. Pure data profiling.
    function onDataLoaded(profile) {
        setAgentStatus('scout', 'done', `${profile.rowCount} rows, schema: ${profile.schema}`);
        logCommunication(
            `Scout Agent: parsed "${profile.fileName || 'uploaded file'}" — ${profile.rowCount} rows, ${profile.columnCount} columns, schema detected as ${profile.schema}` +
            (profile.missingColumns && profile.missingColumns.length ? `, missing: ${profile.missingColumns.join(', ')}` : ', no required columns missing') +
            `. Data completeness: ${profile.completeness.toFixed(1)}%.`,
            'scout'
        );

        const tracked = ATTRIBUTE_DIMENSIONS.filter(dim => (profile.columns || []).includes(dim));
        setText('attributesTracked', `${tracked.length} / ${ATTRIBUTE_DIMENSIONS.length}`);
        setText('schemaDetected', profile.schema);

        const factsEl = document.getElementById('dataSourceFacts');
        if (factsEl) {
            factsEl.innerHTML = `
                <div class="integration-item"><span class="integration-icon">📄</span><span>${escapeHtml(profile.fileName || 'uploaded file')}</span></div>
                <div class="integration-item"><span class="integration-icon">${profile.schema === 'unknown' ? '⚠️' : '✅'}</span><span>Schema: ${escapeHtml(profile.schema)}</span></div>
                <div class="integration-item"><span class="integration-icon">${profile.missingColumns.length ? '⚠️' : '✅'}</span><span>${profile.missingColumns.length ? profile.missingColumns.length + ' missing column(s)' : 'All core columns present'}</span></div>
                <div class="integration-item"><span class="integration-icon">✅</span><span>${profile.rowCount} rows profiled</span></div>
            `;
        }

        // Reset the downstream agents for the new dataset.
        setAgentStatus('analyst', 'idle', 'Waiting for you to run an analysis...');
        setAgentStatus('strategy', 'idle', 'Waiting for you to run an analysis...');
        setAgentStatus('action', 'idle', 'Waiting for you to run an analysis...');
    }

    // Analyst Agent: real aggregation results are already computed synchronously
    // by analysisEngine.analyzeProductData() before the network call goes out.
    function onAnalysisStart(analysisType, results) {
        const anomalyCount = (results.anomalies || []).length;
        const outlierCount = (results.anomalies || []).filter(a => a.flag === 'outlier').length;
        const smallSampleCount = (results.anomalies || []).filter(a => a.flag === 'small_sample').length;

        setAgentStatus('analyst', 'done', `${anomalyCount} flags (${outlierCount} outliers, ${smallSampleCount} small-sample)`);
        logCommunication(
            `Analyst Agent: aggregated ${results.catalogSummary.totalProducts} products across ${Object.keys(results.attributeAggregates).length} dimensions. ` +
            `Top revenue attribute: ${results.topAttribute} (${results.topAttributeDimension}). Flagged ${anomalyCount} statistical/sample-size anomalies.`,
            'analyst'
        );

        updateFunnelStages(results.funnelStats);
        updateAttributeRanking(results.attributeAggregates);

        const interactions = (results.funnelStats.totalViews || 0) + (results.funnelStats.totalCartAdds || 0) + (results.funnelStats.totalPurchases || 0);
        setText('interactionsAnalyzed', Math.round(interactions).toLocaleString());

        setAgentStatus('strategy', 'processing', `Sending ${analysisType} aggregates to Claude...`);
        logCommunication(`Strategy Agent: requesting ${analysisType} analysis from Claude via /.netlify/functions/analyze (aggregates only, no raw CSV sent).`, 'strategy');

        renderTopRecommendation(null, 'waiting');
    }

    // Strategy + Action Agents: fired once the Netlify Function returns.
    function onAnalysisComplete(apiResponse, results) {
        const narrative = (apiResponse && apiResponse.agentNarrative) || {};

        setAgentStatus('strategy', 'done', 'Received reasoning from Claude');
        if (narrative.strategy) {
            logCommunication(`Strategy Agent: ${narrative.strategy}`, 'strategy');
        }

        const recs = (apiResponse && apiResponse.recommendations) || [];
        setAgentStatus('action', 'done', `${recs.length} recommendation(s) ranked`);
        if (narrative.action) {
            logCommunication(`Action Agent: ${narrative.action}`, 'action');
        }

        renderTopRecommendation(recs[0] || null, 'done');
    }

    function onAnalysisError(message) {
        setAgentStatus('strategy', 'error', 'Claude call failed');
        setAgentStatus('action', 'error', 'No recommendations to rank');
        logCommunication(`Strategy Agent: request failed — ${message}. Showing computed aggregates instead of AI narrative.`, 'system');
        renderTopRecommendation(null, 'error');
    }

    function updateFunnelStages(funnelStats) {
        const views = funnelStats.totalViews || 0;
        const cartAdds = funnelStats.totalCartAdds || 0;
        const purchases = funnelStats.totalPurchases || 0;

        setStage('stage-intro', 100, `${Math.round(views).toLocaleString()} views`);
        setStage('stage-engage', views > 0 ? (cartAdds / views) * 100 : 0, funnelStats.viewToCartRate !== null ? (funnelStats.viewToCartRate * 100).toFixed(1) + '% of views' : 'n/a');
        setStage('stage-purchase', views > 0 ? (purchases / views) * 100 : 0, funnelStats.overallConversionRate !== null ? (funnelStats.overallConversionRate * 100).toFixed(1) + '% of views' : 'n/a');
        // Repeat-purchase rate is not computed by this schema/pipeline — say so rather than invent it.
        setStage('stage-rebuy', 0, 'n/a in this schema');
    }

    function setStage(stageId, widthPercent, label) {
        const stage = document.getElementById(stageId);
        if (!stage) return;
        const progress = stage.querySelector('.stage-progress');
        if (progress) {
            progress.style.width = Math.max(0, Math.min(100, widthPercent)) + '%';
            progress.style.background = '#146eb4';
            progress.style.height = '3px';
        }
        const valueEl = document.getElementById(`${stageId}-value`);
        if (valueEl) valueEl.textContent = label;
    }

    function updateAttributeRanking(attributeAggregates) {
        const all = [];
        Object.keys(attributeAggregates).forEach(dim => {
            (attributeAggregates[dim] || []).slice(0, 3).forEach(row => {
                all.push({ dim, value: row.value, revenue: row.revenue, count: row.count });
            });
        });
        all.sort((a, b) => b.revenue - a.revenue);
        const top3 = all.slice(0, 3);

        const container = document.getElementById('attributesRanking');
        if (container) {
            container.innerHTML = top3.map((attr, index) => `
                <div class="attribute-rank">
                    <span class="rank-number">${index + 1}</span>
                    <span class="rank-name">${escapeHtml(attr.dim)}: ${escapeHtml(attr.value)}</span>
                    <span class="rank-impact">$${Math.round(attr.revenue).toLocaleString()} (n=${attr.count})</span>
                </div>
            `).join('');
        }
    }

    function renderTopRecommendation(rec, state) {
        const container = document.getElementById('decisionTreeContainer');
        if (!container) return;

        if (state === 'waiting') {
            container.innerHTML = `<h4>Top Recommendation</h4><div class="decision-tree"><div class="tree-node root"><span>Waiting on Claude's response...</span></div></div>`;
            return;
        }
        if (state === 'error' || !rec) {
            container.innerHTML = `<h4>Top Recommendation</h4><div class="decision-tree"><div class="tree-node root"><span>${state === 'error' ? 'Unavailable — AI call failed.' : 'No recommendation returned.'}</span></div></div>`;
            return;
        }

        container.innerHTML = `
            <h4>Top Recommendation</h4>
            <div class="decision-tree">
                <div class="tree-node root">
                    <span>${escapeHtml(rec.action || 'Recommendation')}</span>
                </div>
                <div class="tree-branches">
                    <div class="tree-branch">
                        <div class="tree-node option">
                            <span>${escapeHtml(rec.rationale || '')}</span>
                        </div>
                    </div>
                </div>
                <div class="tree-outcome">
                    <span>Evidence: ${escapeHtml(rec.evidence || 'n/a')}</span>
                </div>
            </div>
        `;
    }

    function setAgentStatus(agentKey, status, detail) {
        agents[agentKey].status = status;
        const card = document.getElementById(`agent-${agentKey}`);
        if (card) {
            const statusIndicator = card.querySelector('.agent-status-indicator');
            const statusText = card.querySelector('.agent-status');
            if (statusIndicator) statusIndicator.className = `agent-status-indicator ${status}`;
            if (statusText) statusText.textContent = status;
        }
        setText(`${agentKey}-detail`, detail || '');
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function logCommunication(message, type) {
        const commLog = document.getElementById('agentCommLog');
        if (commLog) {
            const entry = document.createElement('div');
            entry.className = `comm-entry ${type}`;
            entry.innerHTML = `
                <span class="comm-time">${new Date().toLocaleTimeString()}</span>
                <span class="comm-message">${escapeHtml(message)}</span>
            `;
            commLog.insertBefore(entry, commLog.firstChild);
            while (commLog.children.length > 15) {
                commLog.removeChild(commLog.lastChild);
            }
        }
    }

    function clearLog() {
        const commLog = document.getElementById('agentCommLog');
        if (commLog) commLog.innerHTML = '';
        logCommunication('Log cleared.', 'system');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str == null ? '' : str);
        return div.innerHTML;
    }

    function getAgentStatus() {
        return agents;
    }

    return {
        initialize,
        onDataLoaded,
        onAnalysisStart,
        onAnalysisComplete,
        onAnalysisError,
        clearLog,
        getAgentStatus
    };
})();

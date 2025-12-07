let chart = null;
let websiteChart = null;
let currentView = 'daily';
let currentFilter = 'today';

// Wait for Chart.js to load
function waitForChart(callback) {
    if (typeof Chart !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForChart(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Chart.js to be available
    waitForChart(() => {
        initializeStats();
    });
});

async function initializeStats() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const exportDataBtn = document.getElementById('exportData');
    const clearDataBtn = document.getElementById('clearData');
    const goBackBtn = document.getElementById('goBack');
    const chartTitle = document.getElementById('chartTitle');

    // View selector
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            updateChartTitle();
            loadStats();
        });
    });

    // Filter selector for website usage
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadWebsiteUsage();
        });
    });

    // Export data
    exportDataBtn.addEventListener('click', async () => {
        const result = await chrome.storage.local.get(['usageStats']);
        const dataStr = JSON.stringify(result.usageStats || {}, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `social-media-usage-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    });

    // Clear data
    clearDataBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all usage data? This cannot be undone.')) {
            await chrome.storage.local.set({ usageStats: {}, todayStats: { timeSaved: 0, blocks: 0 } });
            loadStats();
            alert('All data has been cleared.');
        }
    });

    // Go back
    goBackBtn.addEventListener('click', () => {
        window.close();
    });

    const updateChartTitle = () => {
        const titles = {
            daily: 'Daily Usage (Last 30 Days)',
            weekly: 'Weekly Usage (Last 12 Weeks)',
            monthly: 'Monthly Usage (Last 12 Months)'
        };
        chartTitle.textContent = titles[currentView] || 'Usage Statistics';
    };

    const loadStats = async () => {
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        let processedData = processData(stats, currentView);
        await updateOverview(processedData);
        updateChart(processedData);
        updateDetailedStats(processedData);
        loadWebsiteUsage();
    };

    // Load website usage data
    const loadWebsiteUsage = async () => {
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        const websiteData = processWebsiteData(stats, currentFilter);
        updateWebsiteChart(websiteData);
    };

    // Process website usage data by domain
    const processWebsiteData = (stats, filter) => {
        const today = new Date();
        const websiteTime = {}; // domain -> total minutes
        
        let startDate = new Date();
        if (filter === 'today') {
            startDate.setHours(0, 0, 0, 0);
        } else if (filter === '7days') {
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (filter === '30days') {
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        }

        // Iterate through all dates in the range
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toDateString();
            const dayStats = stats[dateStr];
            
            if (dayStats) {
                // Use domainUsage if available (most accurate)
                if (dayStats.domainUsage) {
                    Object.keys(dayStats.domainUsage).forEach(domain => {
                        if (!websiteTime[domain]) {
                            websiteTime[domain] = 0;
                        }
                        websiteTime[domain] += dayStats.domainUsage[domain] || 0;
                    });
                }
                
                // Fallback: Process active sessions if domainUsage not available
                if (dayStats.activeSessions && Object.keys(dayStats.activeSessions).length > 0) {
                    Object.keys(dayStats.activeSessions).forEach(domain => {
                        const session = dayStats.activeSessions[domain];
                        if (session && session.startTime) {
                            const timeSpent = Math.floor((Date.now() - session.startTime) / 1000 / 60);
                            if (!websiteTime[domain]) {
                                websiteTime[domain] = 0;
                            }
                            websiteTime[domain] += timeSpent;
                        }
                    });
                }
                
                // Fallback: Estimate from entry attempts if no other data
                if (dayStats.entryAttempts && (!dayStats.domainUsage || Object.keys(dayStats.domainUsage).length === 0)) {
                    dayStats.entryAttempts.forEach(entry => {
                        if (entry.allowed && !entry.blocked) {
                            const domain = entry.domain.replace('www.', '').toLowerCase();
                            if (!websiteTime[domain]) {
                                websiteTime[domain] = 0;
                            }
                            // Estimate 2 minutes per visit
                            websiteTime[domain] += 2;
                        }
                    });
                }
            }
        }

        // Convert to array and sort by time
        const websiteArray = Object.keys(websiteTime)
            .filter(domain => websiteTime[domain] > 0) // Only show domains with usage
            .map(domain => ({
                domain: domain,
                time: websiteTime[domain]
            }))
            .sort((a, b) => b.time - a.time)
            .slice(0, 15); // Top 15 websites

        return websiteArray;
    };

    // Update website usage chart
    const updateWebsiteChart = (data) => {
        const ctx = document.getElementById('websiteUsageChart');
        if (!ctx) {
            console.error('Website usage chart canvas not found');
            return;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }
        
        const chartCtx = ctx.getContext('2d');
        
        if (websiteChart) {
            websiteChart.destroy();
        }

        if (data.length === 0) {
            // Show empty state - create a simple message chart
            websiteChart = new Chart(chartCtx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'No usage data available',
                        data: [0],
                        backgroundColor: 'rgba(200, 200, 200, 0.3)',
                        borderColor: 'rgba(200, 200, 200, 0.5)',
                        borderWidth: 1
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
                            enabled: false
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: false
                        }
                    }
                }
            });
            
            // Add text overlay
            const container = ctx.parentElement;
            let emptyMsg = container.querySelector('.empty-message');
            if (!emptyMsg) {
                emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-message';
                emptyMsg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #666; font-size: 16px; pointer-events: none;';
                emptyMsg.textContent = 'No website usage data available for this period';
                container.style.position = 'relative';
                container.appendChild(emptyMsg);
            }
            return;
        }
        
        // Remove empty message if it exists
        const container = ctx.parentElement;
        const emptyMsg = container.querySelector('.empty-message');
        if (emptyMsg) {
            emptyMsg.remove();
        }

        // Truncate long domain names
        const labels = data.map(d => {
            const domain = d.domain;
            return domain.length > 20 ? domain.substring(0, 17) + '...' : domain;
        });

        websiteChart = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Time Spent (minutes)',
                    data: data.map(d => d.time),
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal bar chart
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const minutes = context.parsed.x;
                                const hours = Math.floor(minutes / 60);
                                const mins = minutes % 60;
                                return `Time: ${hours > 0 ? hours + 'h ' : ''}${mins}m`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Spent (minutes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Website'
                        }
                    }
                }
            }
        });
    };

    const processData = (stats, view) => {
        const today = new Date();
        const data = [];

        if (view === 'daily') {
            // Last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toDateString();
                const dayStats = stats[dateStr] || { timeSaved: 0, blocks: 0, visits: 0 };
                data.push({
                    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    date: dateStr,
                    timeSaved: dayStats.timeSaved || 0,
                    blocks: dayStats.blocks || 0,
                    visits: dayStats.visits || 0
                });
            }
        } else if (view === 'weekly') {
            // Last 12 weeks
            for (let i = 11; i >= 0; i--) {
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
                weekStart.setHours(0, 0, 0, 0);
                
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                let weekTimeSaved = 0;
                let weekBlocks = 0;
                let weekVisits = 0;
                
                for (let d = 0; d < 7; d++) {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + d);
                    const dateStr = date.toDateString();
                    const dayStats = stats[dateStr] || {};
                    weekTimeSaved += dayStats.timeSaved || 0;
                    weekBlocks += dayStats.blocks || 0;
                    weekVisits += dayStats.visits || 0;
                }
                
                data.push({
                    label: `Week ${12 - i}`,
                    date: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
                    timeSaved: weekTimeSaved,
                    blocks: weekBlocks,
                    visits: weekVisits
                });
            }
        } else if (view === 'monthly') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthStr = month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                
                let monthTimeSaved = 0;
                let monthBlocks = 0;
                let monthVisits = 0;
                
                Object.keys(stats).forEach(dateStr => {
                    const date = new Date(dateStr);
                    if (date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()) {
                        const dayStats = stats[dateStr] || {};
                        monthTimeSaved += dayStats.timeSaved || 0;
                        monthBlocks += dayStats.blocks || 0;
                        monthVisits += dayStats.visits || 0;
                    }
                });
                
                data.push({
                    label: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    date: monthStr,
                    timeSaved: monthTimeSaved,
                    blocks: monthBlocks,
                    visits: monthVisits
                });
            }
        }

        return data;
    };

    const updateOverview = async (data) => {
        let totalTimeSaved = 0;
        let totalBlocks = 0;
        let daysWithData = 0;

        data.forEach(day => {
            if (day.timeSaved > 0 || day.blocks > 0) {
                totalTimeSaved += day.timeSaved;
                totalBlocks += day.blocks;
                daysWithData++;
            }
        });

        const avgDaily = daysWithData > 0 ? Math.round(totalTimeSaved / daysWithData) : 0;
        
        // Calculate streak
        let streak = 0;
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            if (stats[dateStr] && (stats[dateStr].blocks > 0 || stats[dateStr].timeSaved > 0)) {
                streak++;
            } else {
                break;
            }
        }

        const hours = Math.floor(totalTimeSaved / 60);
        const mins = totalTimeSaved % 60;
        document.getElementById('totalTimeSaved').textContent = hours > 0 ? `${hours}h ${mins}m` : `${totalTimeSaved}m`;
        document.getElementById('totalBlocks').textContent = totalBlocks;
        document.getElementById('avgDaily').textContent = `${avgDaily}m`;
        document.getElementById('streak').textContent = streak;
    };

    const updateChart = (data) => {
        const ctx = document.getElementById('usageChart').getContext('2d');
        
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [
                    {
                        label: 'Time Saved (minutes)',
                        data: data.map(d => d.timeSaved),
                        backgroundColor: 'rgba(102, 126, 234, 0.6)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Blocks',
                        data: data.map(d => d.blocks),
                        backgroundColor: 'rgba(118, 75, 162, 0.6)',
                        borderColor: 'rgba(118, 75, 162, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Saved (minutes)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Blocks'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    };

    const updateDetailedStats = (data) => {
        const container = document.getElementById('detailedStats');
        
        if (data.length === 0 || data.every(d => d.timeSaved === 0 && d.blocks === 0)) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">No data available for this period</div>
                </div>
            `;
            return;
        }

        container.innerHTML = data.reverse().map(day => {
            const hours = Math.floor(day.timeSaved / 60);
            const mins = day.timeSaved % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${day.timeSaved}m`;
            
            return `
                <div class="stat-row">
                    <div class="stat-row-date">${day.date}</div>
                    <div class="stat-row-data">
                        <div class="stat-row-item">
                            <span class="stat-row-item-value">${timeStr}</span>
                            <span class="stat-row-item-label">Time Saved</span>
                        </div>
                        <div class="stat-row-item">
                            <span class="stat-row-item-value">${day.blocks}</span>
                            <span class="stat-row-item-label">Blocks</span>
                        </div>
                        <div class="stat-row-item">
                            <span class="stat-row-item-value">${day.visits}</span>
                            <span class="stat-row-item-label">Visits</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    updateChartTitle();
    loadStats();
}


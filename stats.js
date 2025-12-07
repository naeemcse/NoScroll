let chart = null;
let currentView = 'daily';

document.addEventListener('DOMContentLoaded', async () => {
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
});


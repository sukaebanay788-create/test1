// Конфигурация API
const API_URL = 'https://api.coingecko.com/api/v3';
const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top'
        },
        title: {
            display: true,
            text: 'Динамика цены'
        }
    },
    scales: {
        y: {
            beginAtZero: false,
            ticks: {
                callback: function(value) {
                    return '$' + value.toLocaleString();
                }
            }
        },
        x: {
            ticks: {
                maxRotation: 45,
                minRotation: 45
            }
        }
    }
};

// Инициализация графика
const ctx = document.getElementById('price-chart').getContext('2d');
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Цена (USD)',
            data: [],
            borderColor: '#3a86ff',
            backgroundColor: 'rgba(58, 134, 255, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#3a86ff'
        }]
    },
    options: CHART_OPTIONS
});

// Получение списка монет
async function fetchCoins() {
    try {
        const response = await fetch(`${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
        const coins = await response.json();
        renderCoins(coins);
    } catch (error) {
        console.error('Ошибка загрузки монет:', error);
    }
}

// Отрисовка списка монет
function renderCoins(coins) {
    const container = document.getElementById('coins-container');
    container.innerHTML = coins.map(coin => `
        <div class="coin-card" onclick="selectCoin('${coin.id}')">
            <div class="coin-info">
                <img src="${coin.image}" alt="${coin.name}" width="30">
                <span class="coin-name">${coin.name}</span>
                <span class="coin-symbol">(${coin.symbol.toUpperCase()})</span>
            </div>
            <div class="coin-price-info">
                <span class="coin-price">$${coin.current_price.toLocaleString()}</span>
                <span class="coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    ${coin.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                    ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
            </div>
        </div>
    `).join('');
}

// Выбор монеты из списка
function selectCoin(coinId) {
    document.getElementById('coin-selector').value = coinId;
    updateChart();
}

// Получение истории цен и обновление графика
async function updateChart() {
    const coinId = document.getElementById('coin-selector').value;
    const interval = document.getElementById('interval-selector').value;
    
    try {
        // Подписываемся на загрузку
        document.getElementById('chart-canvas').innerHTML = '<div class="loading">Загрузка данных...</div>';
        
        const response = await fetch(`${API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${interval}`);
        const data = await response.json();
        
        // Форматируем данные для графика
        const prices = data.prices.map(price => price[1]);
        const labels = data.prices.map(price => {
            const date = new Date(price[0]);
            return interval === 'max' 
                ? date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' }) 
                : date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        });
        
        // Обновляем график
        chart.data.labels = labels;
        chart.data.datasets[0].data = prices;
        chart.update();
        
        // Обновляем заголовок графика
        const coinName = document.getElementById('coin-selector').selectedOptions[0].text;
        const intervalText = document.getElementById('interval-selector').selectedOptions[0].text;
        chart.options.plugins.title.text = `${coinName} — ${intervalText}`;
        
    } catch (error) {
        console.error('Ошибка загрузки графика:', error);
        document.getElementById('chart-canvas').innerHTML = '<div class="error">Ошибка загрузки данных</div>';
    }
}

// Обработчики событий
document.getElementById('coin-selector').addEventListener('change', updateChart);
document.getElementById('interval-selector').addEventListener('change', updateChart);

// Инициализация при загрузке
fetchCoins();
updateChart();

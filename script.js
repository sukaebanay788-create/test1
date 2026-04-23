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
            text: 'Динамика цены за 7 дней'
        }
    },
    scales: {
        y: {
            beginAtZero: false
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
            tension: 0.4
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
        <div class="coin-card">
            <div class="coin-info">
                <img src="${coin.image}" alt="${coin.name}" width="30">
                <span class="coin-name">${coin.name}</span>
                <span class="coin-symbol">(${coin.symbol.toUpperCase()})</span>
            </div>
            <span class="coin-price">$${coin.current_price.toLocaleString()}</span>
        </div>
    `).join('');
}

// Получение истории цен и обновление графика
async function fetchPriceHistory(coinId) {
    try {
        const response = await fetch(`${API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=7`);
        const data = await response.json();
        
        const prices = data.prices.map(price => price[1]);
        const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString());
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = prices;
        chart.update();
    } catch (error) {
        console.error('Ошибка загрузки графика:', error);
    }
}

// Обработчик выбора монеты
document.getElementById('coin-selector').addEventListener('change', (e) => {
    fetchPriceHistory(e.target.value);
});

// Инициализация при загрузке
fetchCoins();
fetchPriceHistory('bitcoin');

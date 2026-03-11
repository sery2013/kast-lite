// ============ TABS ============
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ============ YIELD DATA (Demo Gauntlet) ============
const vaults = [
  { name: 'Gauntlet USD Alpha', apy: 6.2, tvl: '73.8M', risk: 'Low' },
  { name: 'Solana Lending Pool', apy: 8.1, tvl: '12.4M', risk: 'Medium' },
  { name: 'Stable Yield Strategy', apy: 4.5, tvl: '45.2M', risk: 'Very Low' },
  { name: 'DeFi Optimized', apy: 9.3, tvl: '8.7M', risk: 'High' },
  { name: 'Treasury Bills Proxy', apy: 5.1, tvl: '120M', risk: 'Very Low' }
];

document.getElementById('apyList').innerHTML = vaults.map(v => `
  <div class="apy-item">
    <div class="name">${v.name}</div>
    <div class="apy">${v.apy}% APY</div>
    <div class="tvl">TVL: $${v.tvl} | Риск: ${v.risk}</div>
  </div>
`).join('');

// ============ COMPOUND CALCULATOR ============
let selectedYears = 5;
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedYears = parseInt(btn.dataset.years);
    document.getElementById('years').value = selectedYears;
  });
});

let yieldChartInstance = null;

document.getElementById('calcYield').addEventListener('click', () => {
  const P = parseFloat(document.getElementById('principal').value) || 0;
  const apy = parseFloat(document.getElementById('apy').value) || 0;
  const t = selectedYears;
  const r = apy / 100;
  
  const data = [];
  for (let year = 0; year <= t; year++) {
    const amount = P * Math.pow(1 + r, year);
    data.push({ x: `Год ${year}`, y: amount });
  }
  
  const final = data[data.length - 1].y;
  const earned = final - P;
  
  document.getElementById('yieldResult').innerHTML = `
    <b>💰 Итоговая сумма:</b> $${final.toLocaleString('ru-RU', {minimumFractionDigits: 2})}<br>
    <b>📈 Прибыль:</b> $${earned.toLocaleString('ru-RU', {minimumFractionDigits: 2})}<br>
    <b>📊 ROI:</b> ${((earned/P)*100).toFixed(1)}% за ${t} лет
  `;
  
  // Chart
  const ctx = document.getElementById('yieldChart');
  if (yieldChartInstance) yieldChartInstance.destroy();
  
  yieldChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.x),
      datasets: [{
        label: 'Баланс ($)',
        data: data.map(d => d.y),
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff', font: { size: 14 } } },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: (ctx) => `$${ctx.parsed.y.toLocaleString('ru-RU', {minimumFractionDigits: 2})}`
          }
        }
      },
      scales: {
        x: { 
          ticks: { color: '#fff' }, 
          grid: { color: 'rgba(255,255,255,0.1)' } 
        },
        y: { 
          ticks: { 
            color: '#fff',
            callback: (v) => '$' + v.toLocaleString('ru-RU', {notation: 'compact'})
          }, 
          grid: { color: 'rgba(255,255,255,0.1)' } 
        }
      }
    }
  });
});

// Export Chart as PNG
document.getElementById('exportChart').addEventListener('click', () => {
  if (yieldChartInstance) {
    const link = document.createElement('a');
    link.download = 'kast-yield-chart.png';
    link.href = yieldChartInstance.toBase64Image('image/png', 1);
    link.click();
  }
});

// ============ RISK ADJUSTED CALCULATOR ============
const riskCoefficients = { low: 0.9, medium: 0.75, high: 0.5 };

document.getElementById('calcRisk').addEventListener('click', () => {
  const P = parseFloat(document.getElementById('principal').value) || 0;
  const apy = parseFloat(document.getElementById('apy').value) || 0;
  const risk = document.getElementById('riskLevel').value;
  const coeff = riskCoefficients[risk];
  const adjustedApy = apy * coeff;
  const t = selectedYears;
  
  const final = P * Math.pow(1 + adjustedApy/100, t);
  const earned = final - P;
  
  document.getElementById('riskResult').innerHTML = `
    <b>📉 APY с поправкой на риск:</b> ${adjustedApy.toFixed(2)}%<br>
    <b>💰 Итоговая сумма:</b> $${final.toLocaleString('ru-RU', {minimumFractionDigits: 2})}<br>
    <b>📈 Прибыль:</b> $${earned.toLocaleString('ru-RU', {minimumFractionDigits: 2})}<br>
    <small>Коэффициент риска (${risk}): ${coeff}</small>
  `;
});

// ============ REBALANCE SIMULATOR ============
document.getElementById('calcRebalance').addEventListener('click', () => {
  const P = parseFloat(document.getElementById('rebalancePrincipal').value) || 0;
  const freq = parseInt(document.getElementById('rebalanceFreq').value) || 30;
  const apy = parseFloat(document.getElementById('apy').value) || 6.2;
  
  // Симуляция: ребалансировка добавляет ~0.5-2% к доходности
  const boost = 0.015; // 1.5% бонус от ребалансировки
  const effectiveApy = apy + boost;
  
  const withoutRebalance = P * Math.pow(1 + apy/100, 5);
  const withRebalance = P * Math.pow(1 + effectiveApy/100, 5);
  const difference = withRebalance - withoutRebalance;
  
  document.getElementById('rebalanceResult').innerHTML = `
    <b>🔄 Частота ребалансировки:</b> каждые ${freq} дней<br>
    <b>📊 Без ребалансировки (5 лет):</b> $${withoutRebalance.toLocaleString('ru-RU', {minimumFractionDigits: 2})}<br>
    <b>✅ С ребалансировкой (5 лет):</b> $${withRebalance.toLocaleString('ru-RU', {minimumFractionDigits: 2})}<br>
    <b>💚 Дополнительная прибыль:</b> $${difference.toLocaleString('ru-RU', {minimumFractionDigits: 2})}
  `;
});

// ============ COUNTRIES DATA (170+) ============
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currencies: ['USD'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currencies: ['PHP', 'USD'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currencies: ['NGN', 'USD'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currencies: ['MXN', 'USD'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currencies: ['BRL', 'USD'] },
  { code: 'IN', name: 'India', flag: '🇮🇳', currencies: ['INR', 'USD'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currencies: ['IDR', 'USD'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currencies: ['VND', 'USD'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currencies: ['THB', 'USD'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currencies: ['KES', 'USD'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currencies: ['GHS', 'USD'] },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currencies: ['EGP', 'USD'] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currencies: ['PKR', 'USD'] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currencies: ['BDT', 'USD'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currencies: ['COP', 'USD'] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currencies: ['ARS', 'USD'] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currencies: ['CLP', 'USD'] },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', currencies: ['PEN', 'USD'] },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', currencies: ['UAH', 'USD'] },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currencies: ['PLN', 'EUR'] },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', currencies: ['RON', 'EUR'] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', currencies: ['TRY', 'USD'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currencies: ['ZAR', 'USD'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currencies: ['GBP'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currencies: ['EUR'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', currencies: ['EUR'] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currencies: ['EUR'] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currencies: ['EUR'] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currencies: ['EUR'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currencies: ['JPY'] },
  { code: 'CN', name: 'China', flag: '🇨🇳', currencies: ['CNY'] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currencies: ['KRW'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currencies: ['AUD'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currencies: ['CAD'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currencies: ['SGD'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currencies: ['MYR'] },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currencies: ['AED', 'USD'] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currencies: ['SAR'] }
].sort((a, b) => a.name.localeCompare(b.name));

// Populate country selector
const countrySelect = document.getElementById('countrySelect');
countrySelect.innerHTML = '<option value="">Выберите страну...</option>' + 
  countries.map(c => `<option value="${c.code}">${c.flag} ${c.name}</option>`).join('');

// Country search
document.getElementById('countrySearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = countries.filter(c => c.name.toLowerCase().includes(query));
  countrySelect.innerHTML = '<option value="">Выберите страну...</option>' + 
    filtered.map(c => `<option value="${c.code}">${c.flag} ${c.name}</option>`).join('');
});

// Show country info
countrySelect.addEventListener('change', (e) => {
  const country = countries.find(c => c.code === e.target.value);
  const infoDiv = document.getElementById('selectedCountry');
  if (country) {
    infoDiv.innerHTML = `
      <span class="country-flag">${country.flag}</span>
      <div class="country-details">
        <h4>${country.name}</h4>
        <p>Валюты: ${country.currencies.join(', ')}</p>
        <p>Доступно для KAST Pay ✅</p>
      </div>
    `;
  } else {
    infoDiv.innerHTML = '';
  }
});

// ============ CURRENCIES ============
const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD',
  'SEK', 'KRW', 'NOK', 'NZD', 'INR', 'MXN', 'TWD', 'ZAR', 'BRL', 'DKK',
  'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'SAR',
  'MYR', 'NGN', 'EGP', 'PKR', 'VND', 'KES', 'GHS', 'TRY', 'ARS', 'COP'
];

const fromCur = document.getElementById('fromCur');
const toCur = document.getElementById('toCur');
currencies.forEach(c => {
  fromCur.innerHTML += `<option value="${c}">${c}</option>`;
  toCur.innerHTML += `<option value="${c}">${c}</option>`;
});
fromCur.value = 'USD';
toCur.value = 'EUR';

// ============ EXCHANGE RATE API ============
let exchangeRates = {};

async function fetchRates(base = 'USD') {
  try {
    // Публичный API (без ключа, лимитированный)
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    const data = await res.json();
    exchangeRates = data.rates;
    document.getElementById('rateSource').textContent = 
      `✅ Курсы обновлены: ${new Date().toLocaleDateString('ru-RU')} | Источник: exchangerate-api.com`;
    return true;
  } catch (err) {
    // Демо-курсы при ошибке
    exchangeRates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24,
      AUD: 1.53, CAD: 1.36, CHF: 0.88, PHP: 56.5, NGN: 1550,
      MXN: 17.2, BRL: 5.05, INR: 83.2, KRW: 1320, ZAR: 18.9
    };
    document.getElementById('rateSource').textContent = 
      `⚠️ Демонстрационные курсы (API недоступен)`;
    return false;
  }
}

// Загрузить курсы при старте
fetchRates();

document.getElementById('convertBtn').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const from = document.getElementById('fromCur').value;
  const to = document.getElementById('toCur').value;
  
  // Если нужно, обновить курсы
  if (!exchangeRates[from] || !exchangeRates[to]) {
    await fetchRates(from);
  }
  
  // Конвертация через USD как базу
  const inUSD = amount / (exchangeRates[from] || 1);
  const result = inUSD * (exchangeRates[to] || 1);
  const rate = (exchangeRates[to] || 1) / (exchangeRates[from] || 1);
  
  document.getElementById('convertResult').innerHTML = `
    <b>${amount.toLocaleString()} ${from}</b> = <b>${result.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ${to}</b><br>
    <small>Курс: 1 ${from} = ${rate.toFixed(4)} ${to}</small>
  `;
});

// ============ FEE CALCULATOR ============
document.getElementById('calcFee').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('feeAmount').value) || 0;
  
  const kastFee = 0

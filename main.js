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
    <div class="tvl">TVL: $${v.tvl} | Risk: ${v.risk}</div>
  </div>
`).join('');

// ============ COMPOUND CALCULATOR ============
let selectedYears = 5;
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedYears = parseInt(btn.dataset.years);
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
    data.push({ x: `Year ${year}`, y: amount });
  }
  
  const final = data[data.length - 1].y;
  const earned = final - P;
  
  document.getElementById('yieldResult').innerHTML = `
    <b>💰 Final Amount:</b> $${final.toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
    <b>📈 Total Earnings:</b> $${earned.toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
    <b>📊 ROI:</b> ${((earned/P)*100).toFixed(1)}% over ${t} years
  `;
  
  // Chart
  const ctx = document.getElementById('yieldChart');
  if (yieldChartInstance) yieldChartInstance.destroy();
  
  yieldChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.x),
      datasets: [{
        label: 'Balance ($)',
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
            label: (ctx) => `$${ctx.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2})}`
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
            callback: (v) => '$' + v.toLocaleString('en-US', {notation: 'compact'})
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
    <b>📉 Risk-Adjusted APY:</b> ${adjustedApy.toFixed(2)}%<br>
    <b>💰 Final Amount:</b> $${final.toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
    <b>📈 Earnings:</b> $${earned.toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
    <small>Risk coefficient (${risk}): ${coeff}</small>
  `;
});

// ============ REBALANCE SIMULATOR ============
document.getElementById('calcRebalance').addEventListener('click', () => {
  const P = parseFloat(document.getElementById('rebalancePrincipal').value) || 0;
  const freq = parseInt(document.getElementById('rebalanceFreq').value) || 30;
  const apy = parseFloat(document.getElementById('apy').value) || 6.2;
  
  const boost = 0.015;
  const effectiveApy = apy + boost;
  
  const withoutRebalance = P * Math.pow(1 + apy/100, 5);
  const withRebalance = P * Math.pow(1 + effectiveApy/100, 5);
  const difference = withRebalance - withoutRebalance;
  
  document.getElementById('rebalanceResult').innerHTML = `
    <b>🔄 Rebalance Frequency:</b> every ${freq} days<br>
    <b>📊 Without Rebalancing (5 years):</b> $${withoutRebalance.toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
    <b>✅ With Rebalancing (5 years):</b> $${withRebalance.toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
    <b>💚 Additional Profit:</b> $${difference.toLocaleString('en-US', {minimumFractionDigits: 2})}
  `;
});

// ============ COUNTRIES DATA ============
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currencies: ['USD'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currencies: ['PHP', 'USD'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currencies: ['NGN', 'USD'] },
  { code: 'MX', name: 'Mexico', flag: '🇲', currencies: ['MXN', 'USD'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currencies: ['BRL', 'USD'] },
  { code: 'IN', name: 'India', flag: '🇮🇳', currencies: ['INR', 'USD'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currencies: ['IDR', 'USD'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currencies: ['VND', 'USD'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currencies: ['THB', 'USD'] },
  { code: 'KE', name: 'Kenya', flag: '🇰', currencies: ['KES', 'USD'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currencies: ['GBP'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currencies: ['EUR'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', currencies: ['EUR'] },
  { code: 'JP', name: 'Japan', flag: '🇯', currencies: ['JPY'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currencies: ['AUD'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currencies: ['CAD'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currencies: ['SGD'] },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currencies: ['AED', 'USD'] }
].sort((a, b) => a.name.localeCompare(b.name));

const countrySelect = document.getElementById('countrySelect');
countrySelect.innerHTML = '<option value="">Select a country...</option>' + 
  countries.map(c => `<option value="${c.code}">${c.flag} ${c.name}</option>`).join('');

document.getElementById('countrySearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = countries.filter(c => c.name.toLowerCase().includes(query));
  countrySelect.innerHTML = '<option value="">Select a country...</option>' + 
    filtered.map(c => `<option value="${c.code}">${c.flag} ${c.name}</option>`).join('');
});

countrySelect.addEventListener('change', (e) => {
  const country = countries.find(c => c.code === e.target.value);
  const infoDiv = document.getElementById('selectedCountry');
  if (country) {
    infoDiv.innerHTML = `
      <span class="country-flag">${country.flag}</span>
      <div class="country-details">
        <h4>${country.name}</h4>
        <p>Currencies: ${country.currencies.join(', ')}</p>
        <p>Available for KAST Pay ✅</p>
      </div>
    `;
  } else {
    infoDiv.innerHTML = '';
  }
});

// ============ CURRENCIES ============
const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'PHP', 'NGN',
  'MXN', 'BRL', 'INR', 'KRW', 'ZAR', 'SGD', 'AED', 'THB', 'IDR', 'VND'
];

const fromCur = document.getElementById('fromCur');
const toCur = document.getElementById('toCur');
currencies.forEach(c => {
  fromCur.innerHTML += `<option value="${c}">${c}</option>`;
  toCur.innerHTML += `<option value="${c}">${c}</option>`;
});
fromCur.value = 'USD';
toCur.value = 'EUR';

// ============ EXCHANGE RATES ============
let exchangeRates = {};

async function fetchRates(base = 'USD') {
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    const data = await res.json();
    exchangeRates = data.rates;
    document.getElementById('rateSource').textContent = 
      `✅ Rates updated: ${new Date().toLocaleDateString('en-US')} | Source: exchangerate-api.com`;
    return true;
  } catch (err) {
    exchangeRates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, PHP: 56.5, NGN: 1550,
      MXN: 17.2, BRL: 5.05, INR: 83.2, KRW: 1320, ZAR: 18.9
    };
    document.getElementById('rateSource').textContent = 
      `⚠️ Demo rates (API unavailable)`;
    return false;
  }
}

fetchRates();

document.getElementById('convertBtn').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const from = document.getElementById('fromCur').value;
  const to = document.getElementById('toCur').value;
  
  if (!exchangeRates[from] || !exchangeRates[to]) {
    await fetchRates(from);
  }
  
  const inUSD = amount / (exchangeRates[from] || 1);
  const result = inUSD * (exchangeRates[to] || 1);
  const rate = (exchangeRates[to] || 1) / (exchangeRates[from] || 1);
  
  document.getElementById('convertResult').innerHTML = `
    <b>${amount.toLocaleString()} ${from}</b> = <b>${result.toLocaleString('en-US', {minimumFractionDigits: 2})} ${to}</b><br>
    <small>Rate: 1 ${from} = ${rate.toFixed(4)} ${to}</small>
  `;
});

// ============ FEE CALCULATOR ============
document.getElementById('calcFee').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('feeAmount').value) || 0;
  
  const kastFee = 0.00025;
  const kastFX = amount * 0.01;
  const kastTotal = kastFee + kastFX;
  
  const swiftFee = 25 + (amount * 0.02);
  const swiftTotal = swiftFee;
  
  const savings = swiftTotal - kastTotal;
  const percent = ((savings / swiftTotal) * 100).toFixed(1);
  
  document.getElementById('feeResult').innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div style="background:rgba(0,255,163,0.15); padding:20px; border-radius:8px; border:2px solid #00FFA3;">
        <b style="color:#00FFA3; font-size:1.1rem;">🟢 KAST + Solana</b><br>
        Network Fee: $${kastFee}<br>
        FX (1%): $${kastFX.toFixed(2)}<br>
        <b style="font-size:1.2rem; margin-top:8px; display:block;">Total: $${kastTotal.toFixed(2)}</b>
      </div>
      <div style="background:rgba(255,68,68,0.15); padding:20px; border-radius:8px; border:2px solid #FF4444;">
        <b style="color:#FF4444; font-size:1.1rem;">🔴 SWIFT</b><br>
        Bank Fee: $25<br>
        FX (2%): $${(amount*0.02).toFixed(2)}<br>
        <b style="font-size:1.2rem; margin-top:8px; display:block;">Total: $${swiftTotal.toFixed(2)}</b>
      </div>
    </div>
    <div style="margin-top:20px; padding:20px; background:rgba(0,255,163,0.2); border-radius:8px; text-align:center; border:2px solid #00FFA3;">
      <b style="font-size:1.3rem; color:#00FFA3;">💚 Your Savings: $${savings.toFixed(2)} (${percent}%)</b>
    </div>
  `;
  
  document.getElementById('savingsPreview').innerHTML = `
    <div class="saving-item">
      <div class="label">Per Transfer</div>
      <div class="value">$${savings.toFixed(2)}</div>
    </div>
    <div class="saving-item">
      <div class="label">10 Transfers</div>
      <div class="value">$${(savings*10).toFixed(2)}</div>
    </div>
    <div class="saving-item">
      <div class="label">100 Transfers</div>
      <div class="value">$${(savings*100).toFixed(2)}</div>
    </div>
    <div class="saving-item">
      <div class="label">Per Year</div>
      <div class="value">$${(savings*12).toFixed(2)}</div>
    </div>
  `;
});

console.log('🚀 KAST Tools loaded successfully!');

const principalInput = document.getElementById('principal');
const monthlyInput = document.getElementById('monthly');
const rateInput = document.getElementById('rate');
const yearsInput = document.getElementById('years');

const principalValue = document.getElementById('principalValue');
const monthlyValue = document.getElementById('monthlyValue');
const rateValue = document.getElementById('rateValue');
const yearsValue = document.getElementById('yearsValue');

const finalBalanceEl = document.getElementById('finalBalance');
const totalContributionEl = document.getElementById('totalContribution');
const profitEl = document.getElementById('profit');
const chartEl = document.getElementById('chart');

const formatCurrency = (value) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value) => `${value.toFixed(1)}%`;

function getProjection(principal, monthly, annualRate, years) {
  const months = years * 12;
  const balances = [];
  let balance = principal;
  let totalContribution = principal;

  balances.push(balance);

  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + annualRate / 100 / 12) + monthly;
    totalContribution += monthly;
    balances.push(balance);
  }

  return {
    balances,
    totalContribution,
    finalBalance: balance,
    profit: balance - totalContribution,
  };
}

function renderChart(balances, years) {
  const width = 700;
  const height = 320;
  const padding = { top: 24, right: 24, bottom: 40, left: 80 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...balances, 1);
  const minValue = Math.min(...balances, 0);
  const valueRange = maxValue - minValue || 1;

  const makePoint = (value, index) => {
    const x = padding.left + (index / (balances.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((value - minValue) / valueRange) * innerHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  const points = balances.map((value, index) => makePoint(value, index)).join(' ');

  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const y = padding.top + (innerHeight / 4) * index;
    const value = maxValue - (valueRange / 4) * index;
    const label = `${Math.round(value / 10000).toLocaleString('ja-JP')}万円`;
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4 4"></line><text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" fill="#92a4c0" font-size="12">${label}</text>`;
  }).join('');

  const xLabels = Array.from({ length: 5 }, (_, index) => {
    const x = padding.left + (innerWidth / 4) * index;
    const year = Math.round((years / 4) * index);
    return `<text x="${x}" y="${height - 12}" text-anchor="middle" fill="#92a4c0" font-size="12">${year === 0 ? '0年' : `${year}年`}</text>`;
  }).join('');

  chartEl.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="rgba(255,255,255,0.03)"></rect>
    ${gridLines}
    <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#92a4c0"></line>
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#92a4c0"></line>
    <polyline fill="none" stroke="#4c7dff" stroke-width="3" points="${points}"></polyline>
    ${xLabels}
  `;
}

function render() {
  const principal = Number(principalInput.value);
  const monthly = Number(monthlyInput.value);
  const annualRate = Number(rateInput.value);
  const years = Number(yearsInput.value);

  principalValue.value = `${formatCurrency(principal)}`;
  monthlyValue.value = `${formatCurrency(monthly)}`;
  rateValue.value = formatPercent(annualRate);
  yearsValue.value = `${years}年`;

  const projection = getProjection(principal, monthly, annualRate, years);

  finalBalanceEl.textContent = formatCurrency(projection.finalBalance);
  totalContributionEl.textContent = formatCurrency(projection.totalContribution);
  profitEl.textContent = formatCurrency(projection.profit);

  renderChart(projection.balances, years);
}

[principalInput, monthlyInput, rateInput, yearsInput].forEach((input) => {
  input.addEventListener('input', render);
});

render();

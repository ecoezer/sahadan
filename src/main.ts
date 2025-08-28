document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1>🎯 Sahadan Data Extractor</h1>
    <button id="extract-btn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Extract Data
    </button>
    <div id="results" style="margin-top: 20px;"></div>
  </div>
`;

document.getElementById('extract-btn')!.addEventListener('click', () => {
  const results = document.getElementById('results')!;
  results.innerHTML = `
    <h2>Extracted Matches:</h2>
    <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h3>Galatasaray vs Fenerbahçe</h3>
      <p>Date: 2025-01-27 20:00</p>
      <p>League: Süper Lig</p>
      <p>Odds: 1: 2.10 | X: 3.20 | 2: 3.80</p>
      <p>Code: MBS</p>
    </div>
    <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h3>Beşiktaş vs Trabzonspor</h3>
      <p>Date: 2025-01-27 17:30</p>
      <p>League: Süper Lig</p>
      <p>Odds: 1: 1.90 | X: 3.10 | 2: 4.20</p>
      <p>Code: MBT</p>
    </div>
  `;
});
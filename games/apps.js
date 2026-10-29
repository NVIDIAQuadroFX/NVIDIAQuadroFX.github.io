document.addEventListener('DOMContentLoaded', () => {
  const gameGrid = document.getElementById('gameGrid');
  const emptyState = document.getElementById('emptyState');
  const filterButtons = document.querySelectorAll('.filter-option');

  let allGames = [];
  let activeFilter = 'all';

  const typeMap = {
    wasm: 'WASM',
    browser: 'Browser',
    classic: 'Classic',
    arcade: 'Arcade'
  };

  const defaultThumbs = [
    'linear-gradient(135deg, rgba(102,192,244,0.45), rgba(94, 141, 255, 0.28))',
    'linear-gradient(135deg, rgba(122,223,142,0.5), rgba(82, 160, 108, 0.28))',
    'linear-gradient(135deg, rgba(243,199,109,0.45), rgba(197, 110, 45, 0.28))',
    'linear-gradient(135deg, rgba(162, 118, 255, 0.5), rgba(85, 110, 220, 0.25))'
  ];

  const buttonText = (game) => {
    if (game.buttonText) return game.buttonText;
    return game.status && game.status.toLowerCase() === 'limited' ? 'Play Game' : 'Launch';
  };

  const safeURL = (url) => url || '#';

  function renderStats(games) {
    const count = games.length;
    const wasmCount = games.filter(g => String(g.type || '').toLowerCase() === 'wasm').length;
    const webCount = games.filter(g => String(g.type || '').toLowerCase() === 'browser').length;
    const featuredCount = games.filter(g => g.featured).length;

    const e = {
      gameCount: document.getElementById('gameCount'),
      wasmCount: document.getElementById('wasmCount'),
      webCount: document.getElementById('webCount'),
      featuredCount: document.getElementById('featuredCount')
    };

    if (e.gameCount) e.gameCount.textContent = count;
    if (e.wasmCount) e.wasmCount.textContent = wasmCount;
    if (e.webCount) e.webCount.textContent = webCount;
    if (e.featuredCount) e.featuredCount.textContent = featuredCount;
  }

  function renderGames() {
    const filtered = allGames.filter((game) => {
      if (activeFilter === 'all') return true;
      const type = String(game.type || 'browser').toLowerCase();
      if (type === activeFilter) return true;
      return (game.tags || []).some(tag => String(tag).toLowerCase() === activeFilter);
    });

    gameGrid.innerHTML = filtered.map((game, index) => {
      const bg = game.banner
        ? `background: url('${game.banner}') center/cover no-repeat;`
        : `background: ${defaultThumbs[index % defaultThumbs.length]};`;

      const tags = (game.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');
      const status = game.status ? `<span class="status-pill">${game.status}</span>` : '';

      return `
        <article class="game-card">
          <div class="game-thumb" style="${bg}">
            <span class="game-badge">${game.featured ? 'Featured' : 'Game'}</span>
            ${status}
          </div>
          <div class="game-body">
            <div class="game-meta">
              <h3>${game.title}</h3>
              <span class="game-type">${typeMap[game.type] || 'Browser'}</span>
            </div>
            <p>${game.description || 'A new title added to the library.'}</p>
            <div class="tags">${tags || '<span class="tag">new</span>'}</div>
            <div class="game-actions">
              <a class="steam-button" href="${safeURL(game.url)}" target="_blank" rel="noreferrer">${buttonText(game)}</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    emptyState.style.display = filtered.length ? 'none' : 'block';
  }

  function bindFilters() {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
        renderGames();
      });
    });
  }

  async function loadGames() {
    try {
      const response = await fetch('games.json');
      if (!response.ok) throw new Error('Unable to load games.json');
      const data = await response.json();
      allGames = Array.isArray(data) ? data : (data.games || []);
      renderStats(allGames);
      renderGames();
    } catch (error) {
      console.error(error);
      if (gameGrid) {
        gameGrid.innerHTML = `
          <div class="empty-state" style="display:block;">
            Failed to load games.json. Add your game entries to populate the library.
          </div>
        `;
      }
    }
  }

  bindFilters();
  loadGames();
});

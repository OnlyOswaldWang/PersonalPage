(() => {
  const discovery = document.querySelector('#discovery-dialog');
  const interests = document.querySelector('#interest-dialog');
  const avatar = document.querySelector('#profile-avatar');
  const entries = {
    games: {title:'Worlds to get lost in',copy:'Open worlds, memorable stories and one more match. Explore a wall of games from my own collection.',tags:['Exploration','Stories','Competition'],link:'games.html',label:'Open my game library ↗'},
    travel: {title:'A little further from home',copy:'From my hometown of Fuqing to Manchester, with city walks, coastlines and mountain trails across China, South Korea and the UK. I love hiking; Japan is still on the wishlist.',tags:['China','United Kingdom','South Korea'],link:'travel.html',label:'Explore the places ↗'},
    mbti: {title:'INTP, and curious',copy:'A little shorthand for my personality. I’m a Sherlock Holmes fan, and curiosity feels like a good place to start.',tags:['INTP','Curiosity','Sherlock Holmes'],link:'life.html#personality',label:'Meet my other side ↗'},
    films: {title:'Stories that stay with me',copy:'Metal Family is a personal favourite. I also enjoy Sherlock, Breaking Bad, Better Call Saul, Detective Conan, Naruto, House of Cards, and the film worlds of Miyazaki, Shinkai and Harry Potter.',tags:['Metal Family','Series','Animation'],link:'screen.html',label:'More from my screen ↗'},
    music: {title:'The soundtrack to my days',copy:'Glass Animals is my favourite band. A small part of my world away from code, papers and projects.',tags:['Glass Animals','Music'],link:'life.html#music',label:'More from my playlist ↗'},
    everyday: {title:'Small habits, ordinary days',copy:'Away from the screen, I make time for regular movement and a little curiosity about everyday life. Small habits keep the days in balance.',tags:['Everyday life','Small habits','Curiosity'],link:'life.html#everyday',label:'A little everyday life ↗'}
  };
  function bindDialog(dialog, closeSelector) {
    if (!dialog) return;
    dialog.querySelectorAll(closeSelector).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => document.body.classList.remove('discovery-open'));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  }
  avatar?.addEventListener('click', () => {discovery.showModal();document.body.classList.add('discovery-open');});
  document.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => {
    const item = entries[button.dataset.interest];
    if (!interests || !item) return;
    interests.querySelector('#interest-title').textContent = item.title;
    interests.querySelector('.interest-copy').textContent = item.copy;
    interests.querySelector('.interest-icon').replaceChildren(button.querySelector('svg').cloneNode(true));
    interests.querySelector('.interest-tags').replaceChildren(...item.tags.map(text => {const tag = document.createElement('span');tag.textContent = text;return tag;}));
    const preview = interests.querySelector('.interest-preview');
    preview.replaceChildren();preview.hidden=button.dataset.interest!=='games';
    interests.classList.toggle('games-interest',button.dataset.interest==='games');
    if(!preview.hidden)[['1172470','Apex Legends'],['730','Counter-Strike 2'],['1422450','Deadlock']].forEach(([id,title])=>{const img=document.createElement('img');img.src=`assets/games/${id}.jpg`;img.alt=`${title} English cover artwork`;preview.append(img);});
    const link = interests.querySelector('.interest-more');
    link.href = item.link;link.textContent = item.label;
    interests.showModal();document.body.classList.add('discovery-open');
  }));
  bindDialog(discovery, '.discovery-close,.discovery-stay');
  bindDialog(interests, '.interest-close');
})();

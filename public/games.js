(() => {
  const wall=document.querySelector('.game-wall');
  const tiles=[...wall.querySelectorAll('[data-game]')];
  const filters=[...document.querySelectorAll('[data-filter]')];
  const search=document.querySelector('[type="search"]');
  const dialog=document.querySelector('#game-dialog');
  let category='All';
  function filter(){
    const term=search.value.trim().toLocaleLowerCase('en-GB');let count=0;
    tiles.forEach(tile=>{const visible=(category==='All'||tile.dataset.category===category)&&tile.getAttribute('aria-label').toLocaleLowerCase('en-GB').includes(term);tile.hidden=!visible;if(visible)count++;});
    wall.classList.toggle('filtered',category!=='All'||Boolean(term));
    document.querySelector('.library-count').textContent=`${count} ${count===1?'game':'games'} on this wall`;
    document.querySelector('.no-games').hidden=count!==0;
  }
  filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;filters.forEach(x=>x.setAttribute('aria-pressed',String(x===button)));filter();}));
  search.addEventListener('input',filter);
  tiles.forEach(tile=>tile.addEventListener('click',()=>{
    const img=tile.querySelector('img'),large=dialog.querySelector('.game-detail-art');large.src=img.src;large.alt=img.alt;
    dialog.querySelector('#game-title').textContent=tile.querySelector('strong').textContent;
    dialog.querySelector('.game-detail-category').textContent=tile.dataset.category;
    dialog.showModal();document.body.style.overflow='hidden';
  }));
  dialog.querySelectorAll('.game-close,.game-return').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>{document.body.style.overflow='';});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
})();

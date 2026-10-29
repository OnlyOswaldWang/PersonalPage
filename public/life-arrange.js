(() => {
  const grid=document.querySelector('.life-bento'),toggle=document.querySelector('#life-arrange'),reset=document.querySelector('#life-layout-reset'),hint=document.querySelector('#arrange-hint'),status=document.querySelector('#layout-status');
  if(!grid)return;
  const cards=[...grid.children],defaults=cards.map((card,i)=>{card.dataset.cardKey=String(i);return String(i);});
  const labels=['Introduction','Manchester time','Calendar','Personality','Travel photograph','Everyday','Music','Games','Films','Travel notes'];
  const key='oswald-life-layout-v2';let order=[...defaults],editing=false,selected=null,drag=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function announce(text){status.textContent=text;}
  function save(){try{localStorage.setItem(key,JSON.stringify(order));}catch{}}
  function render(animate=false){
    const before=new Map(cards.map(c=>[c,c.getBoundingClientRect()]));
    grid.classList.toggle('custom-layout',order.some((x,i)=>x!==defaults[i]));
    order.forEach(id=>grid.append(cards[Number(id)]));
    if(animate&&!reduced.matches)cards.forEach(c=>{const a=before.get(c),b=c.getBoundingClientRect();if(a.x!==b.x||a.y!==b.y)c.animate([{transform:`translate(${a.x-b.x}px,${a.y-b.y}px)`},{transform:'translate(0,0)'}],{duration:350,easing:'cubic-bezier(.2,.8,.2,1)'});});
  }
  try{const stored=JSON.parse(localStorage.getItem(key));if(Array.isArray(stored)&&stored.length===defaults.length&&new Set(stored).size===defaults.length&&stored.every(x=>defaults.includes(x)))order=stored;}catch{}
  function clearSelection(){selected=null;cards.forEach(c=>{c.classList.remove('card-picked','card-drop-target');c.querySelector('.card-drag-handle')?.setAttribute('aria-pressed','false');});}
  function swap(a,b){if(a===b)return;const ia=order.indexOf(a.dataset.cardKey),ib=order.indexOf(b.dataset.cardKey);[order[ia],order[ib]]=[order[ib],order[ia]];render(true);save();announce(`${labels[Number(a.dataset.cardKey)]} and ${labels[Number(b.dataset.cardKey)]} swapped.`);clearSelection();}
  function choose(card){if(selected===card){clearSelection();return;}if(selected){swap(selected,card);return;}selected=card;card.classList.add('card-picked');card.querySelector('.card-drag-handle').setAttribute('aria-pressed','true');announce(`${labels[Number(card.dataset.cardKey)]} selected. Choose another card to swap.`);}
  cards.forEach((card,i)=>{
    const handle=document.createElement('button');handle.className='card-drag-handle';handle.type='button';handle.textContent='⠿';handle.setAttribute('aria-label',`Move ${labels[i]} card`);handle.setAttribute('aria-pressed','false');handle.title='Drag to swap, or select two cards';card.append(handle);
    handle.addEventListener('click',()=>{if(handle.dataset.dragged){delete handle.dataset.dragged;return;}if(editing)choose(card);});
    handle.addEventListener('pointerdown',e=>{if(!editing||e.button!==0)return;drag={card,handle,x:e.clientX,y:e.clientY,moved:false,target:null};handle.setPointerCapture(e.pointerId);});
    handle.addEventListener('pointermove',e=>{if(!drag||drag.handle!==handle)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;card.classList.add('card-dragging');}if(!drag.moved)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.bento');cards.forEach(c=>c.classList.toggle('card-drop-target',c===target&&c!==card));drag.target=target&&target!==card?target:null;});
    function end(e){if(!drag||drag.handle!==handle)return;const current=drag;drag=null;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);card.classList.remove('card-dragging');cards.forEach(c=>c.classList.remove('card-drop-target'));if(current.moved){handle.dataset.dragged='true';if(e.type==='pointerup'&&current.target)swap(card,current.target);}}
    handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
  });
  toggle.addEventListener('click',()=>{editing=!editing;grid.classList.toggle('is-arranging',editing);toggle.setAttribute('aria-pressed',String(editing));toggle.innerHTML=editing?'Done arranging ✓':'Arrange cards <span aria-hidden="true">⠿</span>';hint.hidden=!editing;clearSelection();});
  reset.addEventListener('click',()=>{order=[...defaults];clearSelection();render(true);save();announce('Default layout restored.');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')clearSelection();});render();
})();

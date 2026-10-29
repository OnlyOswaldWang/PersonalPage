(() => {
  const root=document.documentElement,theme=document.querySelector('#life-theme');
  function setTheme(value){root.dataset.theme=value;const dark=value==='dark';theme.textContent=dark?'Light ◐':'Dark ◐';theme.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');theme.setAttribute('aria-pressed',String(dark));document.querySelector('meta[name="theme-color"]').content=dark?'#14121d':'#f2eff8';}
  setTheme(root.dataset.theme);theme.addEventListener('click',()=>{const value=root.dataset.theme==='dark'?'light':'dark';setTheme(value);});
  const dialog=document.querySelector('#collection-dialog'),image=document.querySelector('#collection-full'),title=document.querySelector('#collection-dialog-title'),caption=document.querySelector('#collection-caption'),prev=document.querySelector('#collection-prev'),next=document.querySelector('#collection-next');
  const album=document.querySelector('.album-grid'),screen=document.querySelector('.screen-wall');
  let dataset=null,loading=null,current=0,visible=[];
  async function data(){if(dataset)return dataset;if(!loading)loading=fetch(album?'assets/travel/album.json':'assets/screen/library.json').then(r=>{if(!r.ok)throw Error('Could not load collection');return r.json();});dataset=await loading;return dataset;}
  function open(){if(!dialog.open)dialog.showModal();document.body.classList.add('collection-dialog-open');}
  function showPhoto(index){const p=dataset.photos[index];current=index;dialog.classList.remove('screen-detail');title.textContent=p.label;image.src=p.full;image.alt=p.alt;caption.textContent=`${visible.indexOf(index)+1} / ${visible.length} · Personal album`;prev.hidden=next.hidden=visible.length<2;open();}
  function photoFilter(value){const cards=[...album.querySelectorAll('[data-photo]')];visible=[];cards.forEach(card=>{const show=value==='All photos'||card.dataset.country===value||card.dataset.tag===value;card.hidden=!show;if(show)visible.push(Number(card.dataset.photo));});document.querySelectorAll('[data-photo-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.photoFilter===value)));document.querySelector('#photo-count').textContent=`${visible.length} ${visible.length===1?'photograph':'photographs'}`;}
  function error(){if(album)document.querySelector('#photo-count').textContent='This image could not load. Please refresh and try again.';}
  if(album){
    photoFilter('All photos');
    document.querySelectorAll('[data-photo-filter]').forEach(button=>button.addEventListener('click',()=>photoFilter(button.dataset.photoFilter)));
    album.addEventListener('click',async event=>{const card=event.target.closest('[data-photo]');if(!card)return;try{await data();showPhoto(Number(card.dataset.photo));}catch{error();}});
    function move(delta){const i=visible.indexOf(current);showPhoto(visible[(i+delta+visible.length)%visible.length]);}
    prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
    dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}});
  }
  if(screen){
    document.querySelectorAll('[data-screen-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.screenFilter;document.querySelectorAll('[data-screen-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));screen.classList.toggle('is-filtered',filter!=='All favourites');screen.querySelectorAll('[data-screen]').forEach(card=>card.hidden=filter!=='All favourites'&&card.dataset.screenCategory!==filter);}));
    screen.addEventListener('click',async event=>{const card=event.target.closest('[data-screen]');if(!card)return;try{await data();const item=dataset.items.find(x=>x.id===card.dataset.screen);if(!item)return;dialog.classList.add('screen-detail');title.textContent=item.title;image.src=item.src;image.alt=card.querySelector('img').alt;caption.replaceChildren();caption.append(document.createTextNode(item.note));const link=document.createElement('a');link.href=item.link;link.target='_blank';link.rel='noopener';link.textContent=item.id==='metal-family'?'Official English channel ↗':'Official page ↗';caption.append(link);prev.hidden=next.hidden=true;open();}catch{title.textContent='Image unavailable';image.removeAttribute('src');caption.textContent='Please refresh and try again.';prev.hidden=next.hidden=true;open();}});
  }
  document.querySelector('#collection-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.classList.remove('collection-dialog-open');image.removeAttribute('src');});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
})();

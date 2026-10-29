(() => {
  const list=document.querySelector('#region-list');if(!list)return;
  const names={dalian:'Dalian',fujian:'Fujian · home',guangdong:'Guangdong',shanghai:'Shanghai',chongqing:'Chongqing','hong-kong':'Hong Kong',macau:'Macau',korea:'Busan & Jeju',leeds:'Leeds',manchester:'Manchester',mountains:'On the trail','night-skies':'Night skies'};
  const order=['fujian','dalian','shanghai','chongqing','guangdong','hong-kong','macau','mountains','night-skies','korea','manchester','leeds'];
  const groups=new Map(),stageImage=document.querySelector('#region-image'),stageTitle=document.querySelector('#region-title'),description=document.querySelector('#region-description'),eyebrow=document.querySelector('#region-eyebrow'),progress=document.querySelector('#region-progress'),bar=document.querySelector('#region-progress-bar');
  const dialog=document.querySelector('#collection-dialog'),full=document.querySelector('#collection-full'),dialogTitle=document.querySelector('#collection-dialog-title'),caption=document.querySelector('#collection-caption');
  let active='fujian',index=0,timer=null,albumVisible=false;
  const current=()=>groups.get(active)||[];
  function render(){
    const set=current();if(!set.length)return;
    const photo=set[index];stageImage.src=photo.full;stageImage.alt=photo.alt;
    stageTitle.textContent=names[active]||photo.label;
    description.textContent=photo.alt.replace(' · from my travel album','');
    eyebrow.textContent=`${photo.country.toUpperCase()} / PERSONAL ALBUM`;
    progress.textContent=`${index+1} / ${set.length}`;bar.style.width=`${(index+1)*100/set.length}%`;
    document.querySelector('#region-prev').disabled=set.length<2;document.querySelector('#region-next').disabled=set.length<2;
    if(dialog.open){full.src=photo.full;full.alt=photo.alt;caption.textContent=`${index+1} / ${set.length} · Personal album`;}
  }
  function advance(delta){const set=current();if(!set.length)return;index=(index+delta+set.length)%set.length;render();}
  function animate(){clearInterval(timer);if(document.hidden||!albumVisible||current().length<2||dialog.open)return;timer=setInterval(()=>advance(1),5200);}
  new IntersectionObserver(entries=>{albumVisible=entries[0].isIntersecting;animate();},{rootMargin:'120px'}).observe(document.querySelector('#album'));
  function select(group){if(!groups.has(group))return;active=group;index=0;document.querySelectorAll('[data-region]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.region===group)));render();animate();}
  fetch('assets/travel/album.json').then(response=>{if(!response.ok)throw Error('Album unavailable');return response.json();}).then(data=>{
    data.photos.forEach(photo=>{if(!groups.has(photo.group))groups.set(photo.group,[]);groups.get(photo.group).push(photo);});
    order.filter(group=>groups.has(group)).forEach(group=>{
      const set=groups.get(group),button=document.createElement('button');button.type='button';button.className='region-choice';button.dataset.region=group;button.setAttribute('aria-pressed','false');
      const thumb=document.createElement('img');thumb.src=set[0].src;thumb.alt='';thumb.loading='lazy';
      const copy=document.createElement('span'),name=document.createElement('strong'),count=document.createElement('small');name.textContent=names[group]||set[0].label;count.textContent=`${set.length} ${set.length===1?'photo':'photos'}`;copy.append(name,count);button.append(thumb,copy);
      button.addEventListener('mouseenter',()=>select(group));button.addEventListener('focus',()=>select(group));button.addEventListener('click',()=>select(group));list.append(button);
    });document.querySelectorAll('.earth-point[data-region]').forEach(button=>{button.addEventListener('mouseenter',()=>select(button.dataset.region));button.addEventListener('focus',()=>select(button.dataset.region));button.addEventListener('click',()=>select(button.dataset.region));});select(active);
  }).catch(()=>{description.textContent='The album could not load. Please refresh and try again.';});
  document.querySelector('#region-prev').addEventListener('click',()=>{advance(-1);animate();});
  document.querySelector('#region-next').addEventListener('click',()=>{advance(1);animate();});
  document.querySelector('#region-image-open').addEventListener('click',()=>{
    const photo=current()[index];if(!photo)return;dialog.classList.remove('screen-detail');dialogTitle.textContent=names[active]||photo.label;full.src=photo.full;full.alt=photo.alt;caption.textContent=`${index+1} / ${current().length} · Personal album`;
    document.querySelector('#collection-prev').hidden=document.querySelector('#collection-next').hidden=current().length<2;
    if(!dialog.open)dialog.showModal();document.body.classList.add('collection-dialog-open');animate();
  });
  document.querySelector('#collection-prev').addEventListener('click',()=>advance(-1));
  document.querySelector('#collection-next').addEventListener('click',()=>advance(1));
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();advance(-1);}if(event.key==='ArrowRight'){event.preventDefault();advance(1);}});
  dialog.addEventListener('close',animate);document.addEventListener('visibilitychange',animate);
})();

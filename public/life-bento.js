(() => {
  const root=document.documentElement;
  const dialog=document.querySelector('#personal-dialog');
  const content=document.querySelector('#personal-dialog-body');
  const themeButton=document.querySelector('#life-theme');
  const nudges=['Follow one small curiosity.','Leave room for a good surprise.','Take the scenic route, just once.','Send someone a little hello.','Try something without needing to be good at it.','Save a moment you would like to remember.','Make room for one good song.','Look up from the screen for a moment.'];
  const resets=['A little movement. A little breathing room.','Step away from the screen for a few minutes.','Put on a song and let it finish.','Take a short walk with no particular mission.','Notice one ordinary thing you would normally miss.','Leave a little space in the day.'];
  const londonFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  const localParts=()=>Object.fromEntries(londonFormat.formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
  let today=localParts();
  let selectedDate=`${today.year}-${today.month}-${today.day}`;
  let viewYear=Number(today.year),viewMonth=Number(today.month)-1;
  let nudgeIndex=(Number(today.year)+Number(today.month)*31+Number(today.day))%nudges.length;
  let resetIndex=0;
  document.querySelector('#daily-nudge').textContent=nudges[nudgeIndex];
  function applyTheme(theme){
    root.dataset.theme=theme;
    const dark=theme==='dark';
    themeButton.innerHTML=`${dark?'Light':'Dark'} <span aria-hidden="true">◐</span>`;
    themeButton.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');
    themeButton.setAttribute('aria-pressed',String(dark));
    document.querySelector('meta[name="theme-color"]').setAttribute('content',dark?'#14121d':'#f2eff8');
  }
  applyTheme(root.dataset.theme);
  themeButton.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';applyTheme(next);});
  document.querySelectorAll('.bento').forEach(card=>card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect();card.style.setProperty('--mouse-x',`${event.clientX-r.left}px`);card.style.setProperty('--mouse-y',`${event.clientY-r.top}px`);}));
  const segmentMap={0:'abcedf',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgecd',7:'abc',8:'abcdefg',9:'abfgcd'};
  const digitRoot=document.querySelector('.clock-digits');
  digitRoot.innerHTML=Array.from({length:6},(_,i)=>`${i===2||i===4?'<span class="clock-colon"></span>':''}<span class="clock-digit">${[...'abcdefg'].map(x=>`<i class="clock-seg seg-${x}"></i>`).join('')}</span>`).join('');
  const digits=[...digitRoot.querySelectorAll('.clock-digit')];
  let lastDay='';
  function updateClock(){
    const parts=localParts(),text=parts.hour+parts.minute+parts.second;
    digits.forEach((digit,i)=>{if(digit.dataset.value===text[i])return;digit.dataset.value=text[i];[...digit.children].forEach(segment=>segment.classList.toggle('on',segmentMap[text[i]].includes(segment.classList[1].slice(-1))));});
    const time=document.querySelector('#life-clock');time.dateTime=new Date().toISOString();time.setAttribute('aria-label',`${parts.hour}:${parts.minute}:${parts.second}, Manchester time`);
    document.querySelector('#clock-date').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'long',day:'numeric',month:'short',year:'numeric'}).format(new Date());
    document.querySelector('#clock-zone').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',timeZoneName:'short'}).formatToParts(new Date()).find(x=>x.type==='timeZoneName')?.value||'UK TIME';
    const day=parts.year+parts.month+parts.day;if(day!==lastDay){today=parts;lastDay=day;renderCalendar();}
  }
  function renderCalendar(){
    const first=new Date(Date.UTC(viewYear,viewMonth,1)),count=new Date(Date.UTC(viewYear,viewMonth+1,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7;
    const heading=document.querySelector('#calendar-month');heading.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',month:'short',year:'numeric'}).format(first);
    const days=document.querySelector('#calendar-days');days.setAttribute('aria-label',heading.textContent);
    days.replaceChildren();
    for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');days.append(blank);}
    const todayKey=`${today.year}-${today.month}-${today.day}`;
    for(let d=1;d<=count;d++){
      const key=`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const button=document.createElement('button');button.type='button';button.textContent=String(d);button.dataset.date=key;button.setAttribute('aria-pressed',String(key===selectedDate));if(key===todayKey)button.setAttribute('aria-current','date');button.setAttribute('aria-label',new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${key}T12:00:00Z`)));days.append(button);
    }
  }
  document.querySelectorAll('[data-month-step]').forEach(button=>button.addEventListener('click',()=>{const date=new Date(Date.UTC(viewYear,viewMonth+Number(button.dataset.monthStep),1));viewYear=date.getUTCFullYear();viewMonth=date.getUTCMonth();renderCalendar();}));
  document.querySelector('#calendar-days').addEventListener('click',event=>{const button=event.target.closest('[data-date]');if(!button)return;selectedDate=button.dataset.date;document.querySelector('#calendar-selection').textContent=`Selected ${button.getAttribute('aria-label')}`;renderCalendar();document.querySelector(`[data-date="${selectedDate}"]`)?.focus({preventScroll:true});});
  document.querySelector('#calendar-today').addEventListener('click',()=>{today=localParts();viewYear=Number(today.year);viewMonth=Number(today.month)-1;selectedDate=`${today.year}-${today.month}-${today.day}`;renderCalendar();});
  updateClock();let ticker=setInterval(updateClock,1000);
  document.addEventListener('visibilitychange',()=>{clearInterval(ticker);if(!document.hidden){updateClock();ticker=setInterval(updateClock,1000);}});
  document.querySelector('#life-year').textContent=today.year;
  document.querySelector('#nudge-next').addEventListener('click',()=>{nudgeIndex=(nudgeIndex+1)%nudges.length;document.querySelector('#daily-nudge').textContent=nudges[nudgeIndex];});
  document.querySelector('#everyday-next').addEventListener('click',()=>{resetIndex=(resetIndex+1)%resets.length;document.querySelector('#everyday-prompt').textContent=resets[resetIndex];});
  const views={
    photo:()=>'<p class="kicker">FROM MY TRAVEL ALBUM / CHINA</p><h2 id="personal-dialog-title">The way up.</h2><img class="personal-photo" src="assets/travel/album-37-full.jpg" alt="Full-frame mountain ridge and steps at sunrise from my travel album"><p class="photo-caption">From my mountain album, shown with its full background.</p>',
    music:()=>'<p class="kicker">MY FAVOURITE BAND</p><h2 id="personal-dialog-title">Glass Animals.</h2><p>The soundtrack to my days. Explore their music in the official artist player.</p><iframe class="spotify-frame" title="Glass Animals official Spotify artist player" src="https://open.spotify.com/embed/artist/4yvcSjfu4PC0CYQyLy4wSq?utm_source=generator&amp;theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><a class="spotify-fallback" href="https://open.spotify.com/artist/4yvcSjfu4PC0CYQyLy4wSq" target="_blank" rel="noopener">Open Glass Animals on Spotify <span>↗</span></a>',
  };
  function openDetail(action){if(action==='surprise')action=['photo','travel','music','films'][Math.floor(Math.random()*4)];const route={travel:'travel.html',films:'screen.html'}[action];if(route){location.href=route;return;}if(!views[action])return;content.innerHTML=views[action]();dialog.showModal();dialog.scrollTop=0;document.body.classList.add('personal-dialog-open');}
  document.querySelectorAll('[data-personal-action]').forEach(button=>button.addEventListener('click',()=>openDetail(button.dataset.personalAction)));
  document.querySelector('#personal-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{content.replaceChildren();document.body.classList.remove('personal-dialog-open');});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
})();

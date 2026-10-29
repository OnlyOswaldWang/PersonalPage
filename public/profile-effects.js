(() => {
  const sidebar = document.querySelector('.profile-sidebar');
  if (!sidebar) return;
  const canvas = sidebar.querySelector('.profile-particles');
  const context = canvas?.getContext('2d');
  const toggle = sidebar.querySelector('.motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches, width = 0, height = 0, frame = 0, previous = 0;
  let visible = true;
  const points = Array.from({length:34},(_,i)=>({x:(i*.61803398875)%1,y:(i*.41421356237)%1,speed:.000002+(i%5)*.0000007,radius:.6+(i%3)*.35}));
  function updatePause() {
    sidebar.classList.toggle('motion-paused',paused);
    document.body.classList.toggle('portfolio-motion-paused',paused);
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
    cancelAnimationFrame(frame);previous=0;
    if (context && !paused && visible && !document.hidden) frame=requestAnimationFrame(draw);
  }
  function resize() {
    if (!context) return;
    width=sidebar.clientWidth;height=sidebar.clientHeight;
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=width*ratio;canvas.height=height*ratio;context.setTransform(ratio,0,0,ratio,0,0);
    paint();
  }
  function paint() {
    if (!context) return;
    context.clearRect(0,0,width,height);
    for (let i=0;i<points.length;i++) {
      const p=points[i], x=p.x*width,y=p.y*height;
      context.fillStyle='rgba(137,192,220,.5)';context.beginPath();context.arc(x,y,p.radius,0,Math.PI*2);context.fill();
      for(let j=i+1;j<points.length;j++) {
        const q=points[j],dx=x-q.x*width,dy=y-q.y*height,distance=Math.hypot(dx,dy);
        if(distance<65){context.strokeStyle=`rgba(137,192,220,${.12*(1-distance/65)})`;context.beginPath();context.moveTo(x,y);context.lineTo(q.x*width,q.y*height);context.stroke();}
      }
    }
  }
  function draw(time) {
    if(paused||!visible||document.hidden)return;
    if(time-previous>33){const delta=previous?Math.min(time-previous,80):33;previous=time;points.forEach(p=>p.y=(p.y-p.speed*delta+1)%1);paint();}
    frame=requestAnimationFrame(draw);
  }
  toggle.addEventListener('click',()=>{paused=!paused;updatePause();});
  preference.addEventListener('change',event=>{paused=event.matches;updatePause();});
  document.addEventListener('visibilitychange',updatePause);
  sidebar.addEventListener('pointermove',event=>{const rect=sidebar.getBoundingClientRect();sidebar.style.setProperty('--glow-x',`${event.clientX-rect.left}px`);sidebar.style.setProperty('--glow-y',`${event.clientY-rect.top}px`);});
  new ResizeObserver(resize).observe(sidebar);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updatePause();}).observe(sidebar);
  resize();updatePause();
})();

(() => {
  const canvas=document.querySelector('#life-galaxy'),ctx=canvas?.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,frame=0,last=0,phase=0,scrollUntil=0;
  let seed=81017;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const stars=Array.from({length:210},()=>({x:random(),y:random(),r:.3+random()*1.3,a:.2+random()*.7,p:random()*Math.PI*2}));
  const arms=Array.from({length:270},(_,i)=>{const r=Math.sqrt(random());return{r,a:r*6.8+(i%3)*Math.PI*2/3+(random()-.5)*.6,z:(random()-.5)*.14,size:.3+random()*.9,alpha:.15+random()*.65};});
  function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.25);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);paint();}
  function paint(){
    const light=document.documentElement.dataset.theme==='light';
    ctx.clearRect(0,0,width,height);
    const cx=width*.57,cy=height*.43,r=Math.max(width,height)*.65;
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    glow.addColorStop(0,light?'rgba(160,128,205,.18)':'rgba(155,119,224,.20)');
    glow.addColorStop(.35,light?'rgba(187,159,224,.13)':'rgba(108,74,170,.15)');glow.addColorStop(1,'rgba(109,86,158,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    stars.forEach(s=>{const alpha=s.a*(.65+.35*Math.sin(phase*2+s.p));ctx.fillStyle=light?`rgba(104,77,145,${alpha*.55})`:`rgba(220,212,249,${alpha})`;ctx.beginPath();ctx.arc(s.x*width,s.y*height,s.r,0,Math.PI*2);ctx.fill();});
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.42);
    arms.forEach(s=>{const a=s.a+phase*.035,x=Math.cos(a)*s.r*r,y=Math.sin(a)*s.r*r*.33+s.z*r;ctx.fillStyle=light?`rgba(123,87,168,${s.alpha*.35})`:`rgba(194,167,239,${s.alpha*.7})`;ctx.beginPath();ctx.arc(x,y,s.size,0,Math.PI*2);ctx.fill();});ctx.restore();
  }
  function paused(){return reduced.matches||document.hidden;}
  function tick(time){frame=0;if(paused())return;if(time-last>70&&time>scrollUntil){phase+=Math.min((time-last)/1000,.16);last=time;paint();}frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(frame);frame=0;paint();if(!paused()){last=performance.now();frame=requestAnimationFrame(tick);}}
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);addEventListener('resize',resize);addEventListener('scroll',()=>{scrollUntil=performance.now()+140;},{passive:true});resize();sync();
})();

(() => {
  const shell=document.querySelector('.earth-shell');
  const canvas=document.querySelector('#earth-map');
  if(!shell||!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true});
  const points=[...shell.querySelectorAll('.earth-point')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const rad=Math.PI/180;
  const centreLat=20*rad;
  const continents=[
    [[-167,68],[-146,72],[-125,61],[-110,58],[-96,49],[-82,50],[-72,43],[-82,25],[-98,15],[-111,26],[-123,31],[-136,54]],
    [[-79,12],[-62,12],[-49,2],[-36,-8],[-47,-24],[-54,-39],[-69,-56],[-75,-30]],
    [[-13,37],[-10,55],[5,59],[20,70],[43,71],[60,63],[89,60],[110,57],[130,51],[151,59],[162,49],[141,37],[130,27],[122,16],[105,2],[92,8],[76,6],[61,25],[49,28],[38,42],[25,40],[10,35]],
    [[-17,34],[12,36],[34,31],[47,10],[42,-13],[31,-32],[16,-35],[5,-28],[-7,-8],[-16,14]],
    [[112,-11],[132,-10],[153,-22],[148,-39],[115,-37]],
    [[-53,82],[-28,72],[-43,59],[-58,63]],
    [[43,-13],[51,-14],[50,-25],[44,-25]],
    [[122,-1],[131,-2],[139,-7],[138,-11],[128,-8]],
    [[130,31],[136,34],[141,41],[146,43],[143,34]],
    [[126,39],[129,38],[129,34],[126,34]],
    [[166,-35],[178,-41],[176,-48],[168,-46]]
  ];
  function inside(x,y,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;}
  const land=[];
  for(let lat=-78;lat<=82;lat+=3.2)for(let lon=-178;lon<=178;lon+=3.2){if(continents.some(poly=>inside(lon,lat,poly)))land.push([lat,lon]);}
  let size=340,frame=0,last=0,longitude=74,visible=false,pauseUntil=0,drag=null,scrollUntil=0;
  function project(latitude,longitudeValue){
    const phi=latitude*rad,delta=(longitudeValue-longitude)*rad;
    const x=Math.cos(phi)*Math.sin(delta);
    const y=-(Math.sin(phi)*Math.cos(centreLat)-Math.cos(phi)*Math.cos(delta)*Math.sin(centreLat));
    const depth=Math.sin(phi)*Math.sin(centreLat)+Math.cos(phi)*Math.cos(delta)*Math.cos(centreLat);
    return {x:size/2+x*size*.46,y:size/2+y*size*.46,depth};
  }
  function gridLine(samples){ctx.beginPath();let started=false;for(const [lat,lon] of samples){const p=project(lat,lon);if(p.depth>.025){if(!started)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);started=true;}else started=false;}ctx.stroke();}
  function draw(){
    ctx.clearRect(0,0,size,size);
    ctx.strokeStyle='rgba(220,199,250,.16)';ctx.lineWidth=.8;
    for(const lat of [-60,-30,0,30,60])gridLine(Array.from({length:91},(_,i)=>[lat,-180+i*4]));
    for(let lon=-180;lon<=180;lon+=30)gridLine(Array.from({length:43},(_,i)=>[-84+i*4,lon]));
    ctx.fillStyle='rgba(214,191,241,.66)';
    for(const [lat,lon] of land){const p=project(lat,lon);if(p.depth>0){const d=Math.max(.8,1.5*p.depth);ctx.fillRect(p.x,p.y,d,d);}}
    for(const button of points){const p=project(Number(button.dataset.lat),Number(button.dataset.lon));const front=p.depth>.07;button.style.left=`${p.x/size*100}%`;button.style.top=`${p.y/size*100}%`;button.style.opacity=front?'1':'0';button.style.pointerEvents=front?'auto':'none';button.tabIndex=front?0:-1;}
  }
  function resize(){size=Math.max(1,Math.round(shell.getBoundingClientRect().width));const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(size*dpr);canvas.height=Math.round(size*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function tick(now){frame=0;if(!visible)return;if(now-last>=60){const elapsed=Math.min(now-last,100);last=now;if(!reduced.matches&&!drag&&now>pauseUntil&&now>scrollUntil)longitude=(longitude+elapsed*.0045)%360;draw();}frame=requestAnimationFrame(tick);}
  new ResizeObserver(resize).observe(shell);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!frame){last=performance.now();frame=requestAnimationFrame(tick);}else if(!visible){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'120px'}).observe(shell);
  addEventListener('scroll',()=>{scrollUntil=performance.now()+160;},{passive:true});
  points.forEach(button=>{
    button.addEventListener('mouseenter',()=>{pauseUntil=performance.now()+7000;});
    button.addEventListener('focus',()=>{pauseUntil=performance.now()+7000;});
    button.addEventListener('click',()=>{longitude=Number(button.dataset.lon);pauseUntil=performance.now()+9000;draw();});
  });
  shell.addEventListener('pointerdown',event=>{if(event.target.closest('.earth-point'))return;drag={id:event.pointerId,x:event.clientX,start:longitude};shell.setPointerCapture(event.pointerId);pauseUntil=performance.now()+8000;});
  shell.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;longitude=drag.start-(event.clientX-drag.x)*.55;draw();});
  function end(event){if(drag?.id===event.pointerId){drag=null;if(shell.hasPointerCapture(event.pointerId))shell.releasePointerCapture(event.pointerId);}}
  shell.addEventListener('pointerup',end);shell.addEventListener('pointercancel',end);
  resize();
})();

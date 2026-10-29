(() => {
  const form=document.querySelector('#guestbook-form');if(!form)return;
  const list=document.querySelector('#guestbook-list');
  const dialog=document.querySelector('#guestbook-dialog');
  const status=document.querySelector('#guestbook-status');
  const submit=form.querySelector('[type="submit"]');
  const api=(location.hostname.toLowerCase()==='onlyoswaldwang.github.io'?'https://zhicheng-wang-robotics-portfolio.alightjam34.chatgpt.site':'')+'/api/guestbook';
  function noteCard(note){
    const article=document.createElement('article');article.className='guestbook-note';
    const header=document.createElement('header'),name=document.createElement('strong'),time=document.createElement('time'),message=document.createElement('p');
    name.textContent=note.name;time.dateTime=note.created_at;
    time.textContent=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/London'}).format(new Date(note.created_at));
    message.textContent=note.message;header.append(name,time);article.append(header,message);return article;
  }
  async function load(){
    list.innerHTML='<p class="guestbook-loading">Loading notes…</p>';
    try{
      const response=await fetch(api,{headers:{accept:'application/json'}});
      if(!response.ok)throw Error('Guestbook unavailable');
      const data=await response.json();list.replaceChildren();
      if(data.notes.length)data.notes.forEach(note=>list.append(noteCard(note)));
      else list.innerHTML='<p class="guestbook-empty">No notes yet. You could be the first.</p>';
    }catch(error){console.error('Guestbook notes could not load:',error);list.innerHTML='<p class="guestbook-empty">Notes are unavailable right now. Please try again later.</p>';}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    submit.disabled=true;status.textContent='Sending your note…';
    try{
      const body=Object.fromEntries(new FormData(form));
      const response=await fetch(api,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify(body)});
      const result=await response.json();if(!response.ok)throw Error(result.error||'Your note could not be sent.');
      form.reset();status.textContent='Your note is here. Thank you for leaving it.';await load();
    }catch(error){status.textContent=error.message||'Your note could not be sent. Please try again.';}
    finally{submit.disabled=false;}
  });
  document.querySelector('#guestbook-refresh').addEventListener('click',load);
  document.querySelector('#guestbook-open')?.addEventListener('click',()=>{dialog.showModal();document.body.classList.add('guestbook-dialog-open');load();});
  document.querySelector('#guestbook-close')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('close',()=>document.body.classList.remove('guestbook-dialog-open'));
  dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  if(location.hash==='#guestbook'){dialog.showModal();document.body.classList.add('guestbook-dialog-open');}
  load();
})();

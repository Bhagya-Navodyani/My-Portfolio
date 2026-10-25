const root=document.documentElement;const button=document.getElementById('theme');let theme;try{theme=localStorage.getItem('bhagya-theme')}catch(e){}if(theme==='light'||theme==='dark')root.dataset.theme=theme;button.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('bhagya-theme',root.dataset.theme)}catch(e){}});document.getElementById('menu').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav').classList.remove('open')));document.getElementById('year').textContent=new Date().getFullYear();

// V10: full-card navigation; inner links remain independently operable
document.querySelectorAll('.project[data-project-url]').forEach(card=>{const open=()=>window.open(card.dataset.projectUrl,'_blank','noopener,noreferrer');card.addEventListener('click',e=>{if(!e.target.closest('a'))open()});card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();open()}})});


// V11: client-side GitHub API integration. No personal access token is needed.
// On every page load public repositories/updated dates are fetched; changes pushed to
// existing repositories do not require redeploying the portfolio.
(()=>{
  const owner='Bhagya-Navodyani';
  const grid=document.getElementById('extra-project-grid');
  const toggle=document.getElementById('toggle-more-projects');
  const panel=document.getElementById('more-projects');
  const status=document.getElementById('github-sync-status');
  if(!grid||!toggle||!panel)return;
  const fallback=[
    {name:'Deep_Learning_Breast_Cancer_Classification',html_url:'https://github.com/Bhagya-Navodyani/Deep_Learning_Breast_Cancer_Classification',description:'Deep learning research project for breast cancer classification.',language:'Python'},
    {name:'BoardingBuddy',html_url:'https://github.com/Bhagya-Navodyani/BoardingBuddy',description:'Boarding and accommodation discovery project.',language:null},
    {name:'SeaGuardian-Mobile-App',html_url:'https://github.com/Bhagya-Navodyani/SeaGuardian-Mobile-App',description:'Flutter-based smart fisherman safety and monitoring application. Code updates will appear on GitHub after you push them.',language:'Dart'}
  ];
  const featuredTerms=['seaguardian','smartcampus','smart-campus','smartfood','smart-food','taskworkflow','task-workflow'];
  const priority=['Deep_Learning_Breast_Cancer_Classification','BoardingBuddy','SeaGuardian-Mobile-App'];
  function iconFor(name){let x=name.toLowerCase();return x.includes('cancer')?'🧬':x.includes('boarding')?'🏠':x.includes('guardian')?'📱':x.includes('medicine')?'💊':x.includes('coconut')?'🥥':x.includes('boat')?'⛵':x.includes('food')?'🥗':'💻'}
  function card(repo){
    const a=document.createElement('a');a.className='repo-card';a.href=repo.html_url;a.target='_blank';a.rel='noopener noreferrer';
    const top=document.createElement('div');top.className='repo-card-top';
    const img=document.createElement('img');img.className='repo-cover';const k=repo.name.toLowerCase();img.src=k.includes('cancer')?'assets/cancer-cover.webp':k.includes('boarding')?'assets/boarding-cover.webp':'assets/mobile-cover.webp';img.alt='Concept cover for '+repo.name;a.append(img); const icon=document.createElement('span');icon.className='repo-emoji';icon.textContent=iconFor(repo.name);
    const title=document.createElement('span');title.className='repo-name';title.textContent=repo.name.replaceAll('_',' ').replaceAll('-',' ');
    top.append(icon,title);a.append(top);
    const desc=document.createElement('p');desc.className='repo-description';desc.textContent=repo.description||'Explore the source code, documentation, and latest development on GitHub.';a.append(desc);
    const meta=document.createElement('div');meta.className='repo-meta';
    if(repo.language){const tag=document.createElement('span');tag.textContent=repo.language;meta.append(tag)}
    if(repo.updated_at||repo.pushed_at){const date=document.createElement('span');date.textContent='Updated '+new Date(repo.pushed_at||repo.updated_at).toLocaleDateString('en-US',{month:'short',year:'numeric'});meta.append(date)}
    if(meta.childNodes.length)a.append(meta);
    const foot=document.createElement('div');foot.className='repo-footer';foot.textContent='Explore Repository  ↗';a.append(foot);
    return a;
  }
  function render(repos,synced){
    grid.replaceChildren();
    const unique=new Map();repos.forEach(r=>{if(r.name&&r.html_url)unique.set(r.name.toLowerCase(),r)});
    let items=priority.map(name=>unique.get(name.toLowerCase())).filter(Boolean);
    items.sort((a,b)=>{const ai=priority.findIndex(n=>n.toLowerCase()===a.name.toLowerCase());const bi=priority.findIndex(n=>n.toLowerCase()===b.name.toLowerCase());if(ai!==-1||bi!==-1)return (ai<0?999:ai)-(bi<0?999:bi);return new Date(b.pushed_at||b.updated_at||0)-new Date(a.pushed_at||a.updated_at||0)});
    items.forEach(r=>grid.append(card(r)));
    status.textContent=synced?'3 selected projects · GitHub details refreshed':'3 selected projects · Showing saved details';
  }
  render(fallback,false);
  toggle.addEventListener('click',e=>{e.preventDefault();const show=panel.hasAttribute('hidden');if(show)panel.removeAttribute('hidden');else panel.setAttribute('hidden','');toggle.setAttribute('aria-expanded',String(show));toggle.textContent=show?'Show Fewer Projects  ↑':'View More Projects  ↓';if(show)panel.scrollIntoView({behavior:'smooth',block:'nearest'})});
  const repoPromise=fetch('https://api.github.com/users/'+owner+'/repos?per_page=100&sort=updated',{headers:{'Accept':'application/vnd.github+json'}}).then(r=>{if(!r.ok)throw Error('GitHub API unavailable');return r.json()}).then(repos=>{if(!Array.isArray(repos))throw Error('Invalid API response');
    // Include requested projects if hidden from API temporarily, but do not invent new repos.
    const names=new Set(repos.map(r=>r.name.toLowerCase()));fallback.forEach(r=>{if(!names.has(r.name.toLowerCase()))repos.push(r)});
    render(repos,true);
    // Turn existing featured project search links into direct repo links where the title matches.
    document.querySelectorAll('.project[data-project-url]').forEach(card=>{
      const title=(card.querySelector('h3')?.textContent||'').toLowerCase();
      const normalized=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
      const match=repos.find(r=>normalized(r.name)===normalized(title)||normalized(r.name).includes(normalized(title)));
      if(match){card.dataset.projectUrl=match.html_url;const inner=card.querySelector('.p-content a');if(inner){inner.href=match.html_url;inner.textContent='View GitHub Repository ↗'}}
    });
  }).catch(()=>render(fallback,false));
})();

// Resume selector: click, outside-click, Escape and keyboard support
(()=>{const menu=document.getElementById('resume-menu');const toggle=document.getElementById('resume-toggle');if(!menu||!toggle)return;const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')};toggle.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(!menu.contains(e.target))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close))})();

const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

const drawer = $('#drawer');
const backdrop = $('#drawerBackdrop');
function toggleDrawer(force){
  if(!drawer || !backdrop) return;
  const shouldOpen = typeof force === 'boolean' ? force : !drawer.classList.contains('open');
  drawer.classList.toggle('open', shouldOpen);
  backdrop.classList.toggle('open', shouldOpen);
  document.body.style.overflow = shouldOpen ? 'hidden' : '';
}
$('#menuBtn')?.addEventListener('click',()=>toggleDrawer(true));
$('#drawerClose')?.addEventListener('click',()=>toggleDrawer(false));
backdrop?.addEventListener('click',()=>toggleDrawer(false));
$$('#drawer a').forEach(a=>a.addEventListener('click',()=>toggleDrawer(false)));

document.addEventListener('keydown', e=>{ if(e.key==='Escape'){toggleDrawer(false); closeModal();} });

const modal = $('#bookingModal');
function openModal(region){
  if(!modal) return;
  const select = $('#regionSelect');
  if(select && region) select.value = region;
  modal.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  if(!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow='';
}
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.book || '')));
$('#modalClose')?.addEventListener('click',closeModal);
modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
$('#bookingForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const note=$('#successNote');
  if(note){ note.style.display='block'; note.textContent='Inquiry saved for this prototype. Connect this form to your backend or email service for live submissions.'; }
});

const searchInput = $('#nationSearch');
searchInput?.addEventListener('input',()=>{
  const q=searchInput.value.trim().toLowerCase();
  $$('.package-card').forEach(card=>{
    const hay=(card.dataset.search||card.textContent).toLowerCase();
    card.style.display=!q||hay.includes(q)?'block':'none';
  });
});
searchInput?.addEventListener('keydown',e=>{
  if(e.key!=='Enter') return;
  const first=$$('.package-card').find(c=>c.style.display!=='none');
  const link=first?.querySelector('.view-btn');
  if(link) location.href=link.href;
});

$$('[data-scroll-featured]').forEach(btn=>btn.addEventListener('click',()=>$('#featured')?.scrollIntoView({behavior:'smooth'})));

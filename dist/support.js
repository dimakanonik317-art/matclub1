(() => {
  const trigger = document.getElementById('supportProject');
  const dialog = document.getElementById('supportDialog');
  if (!trigger || !dialog) return;
  trigger.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  document.getElementById('copySupportCard')?.addEventListener('click',async()=>{
    const field=document.getElementById('supportCardNumber'),status=document.getElementById('supportCopyStatus');
    try{await navigator.clipboard.writeText(field.value.replace(/\s/g,''));status.textContent='Номер скопирован. Перевод можно выполнить в приложении банка.'}catch{field.focus();field.select();field.setSelectionRange(0,field.value.length);status.textContent='Номер выделен. Нажми «Копировать» в меню устройства.'}
  });
  dialog.addEventListener('close', () => trigger.focus());
})();

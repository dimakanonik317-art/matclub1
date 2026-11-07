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
  dialog.addEventListener('close', () => trigger.focus());
})();

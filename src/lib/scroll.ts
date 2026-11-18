export function scrollToSection(hashOrId: string): boolean {
  const id = hashOrId.replace(/^#/, '').trim();
  if (!id) return false;

  const target =
    document.getElementById(id) ||
    (id === 'contato' ? document.getElementById('contato-rodape') : null);

  if (!target) return false;

  const headerOffset = 80;
  const top = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - headerOffset,
  );

  window.scrollTo({ top, behavior: 'smooth' });
  return true;
}

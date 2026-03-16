import { getTourOverview } from '@/config/tourOverviews';
import { getTourStepsForPath } from '@/config/tourSteps';

export interface TourStepInput {
  element?: HTMLElement | null;
  title: string;
  intro: string;
}

/** Resolve elemento pelo id: dentro do container ou no document. */
function resolveElement(container: HTMLElement, id: string): HTMLElement | null {
  if (!id.trim()) return null;
  const inContainer = container.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  if (inContainer) return inContainer;
  return document.getElementById(id);
}

const MAX_BUTTONS = 5;
const MAX_FIELDS_WITHOUT_FORM = 5;
const MIN_LIST_ITEMS = 3;

function isVisible(el: HTMLElement): boolean {
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.getAttribute('data-tour-skip') !== null) return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getElementLabel(el: HTMLElement, fallback: string): string {
  const dataTitle = el.getAttribute('data-tour-title');
  if (dataTitle?.trim()) return dataTitle.trim();
  const aria = el.getAttribute('aria-label');
  if (aria?.trim()) return aria.trim();
  const placeholder = el.getAttribute('placeholder');
  if (placeholder?.trim()) return placeholder.trim();
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
  if (text.length > 0) return text.length > 35 ? text.slice(0, 32) + '...' : text;
  return fallback;
}

function getElementIntro(el: HTMLElement, defaultIntro: string): string {
  const dataIntro = el.getAttribute('data-tour-intro');
  if (dataIntro?.trim()) return dataIntro.trim();
  return defaultIntro;
}

function isInsideAny(elt: HTMLElement, parents: HTMLElement[]): boolean {
  return parents.some((p) => p.contains(elt));
}

export function buildTourSteps(container: HTMLElement | null, pathname: string): TourStepInput[] {
  const steps: TourStepInput[] = [];
  if (!container) return steps;

  const definedSteps = getTourStepsForPath(pathname);
  if (definedSteps.length > 0) {
    for (const def of definedSteps) {
      const element = def.id ? resolveElement(container, def.id) : null;
      steps.push({
        element: element ?? undefined,
        title: def.title,
        intro: def.intro,
      });
    }
    return steps;
  }

  const overview = getTourOverview(pathname);
  steps.push({ title: overview.title, intro: overview.intro });

  const allForms = Array.from(container.querySelectorAll<HTMLElement>('form')).filter(isVisible);
  const allButtons = Array.from(container.querySelectorAll<HTMLElement>('button, [type="submit"], a[role="button"]')).filter(isVisible);
  const buttonsOutsideForms = allButtons.filter((btn) => !isInsideAny(btn, allForms));

  const h1 = container.querySelector<HTMLElement>('h1, h2');
  if (h1 && isVisible(h1)) {
    const title = getElementLabel(h1, 'Título da página');
    steps.push({ element: h1, title: 'Título', intro: title ? `"${title}"` : 'Título da página.' });
  }

  for (const btn of buttonsOutsideForms.slice(0, MAX_BUTTONS)) {
    const label = getElementLabel(btn, 'Botão de ação');
    const defaultIntro = `Use este botão para: ${label}.`;
    steps.push({
      element: btn,
      title: 'Ação',
      intro: getElementIntro(btn, defaultIntro),
    });
  }

  for (const form of allForms) {
    steps.push({
      element: form,
      title: 'Formulário',
      intro: getElementIntro(form, 'Preencha os campos deste formulário conforme indicado.'),
    });
  }

  const inputsWithoutForm = container.querySelectorAll<HTMLElement>('input:not([type="hidden"]), textarea, select');
  const standaloneFields = Array.from(inputsWithoutForm).filter((el) => {
    if (!isVisible(el)) return false;
    return el.closest('form') === null;
  });
  for (const field of standaloneFields.slice(0, MAX_FIELDS_WITHOUT_FORM)) {
    const label = getElementLabel(field, 'Campo');
    const defaultIntro = label ? `Campo: ${label}.` : 'Preencha este campo.';
    steps.push({
      element: field,
      title: 'Campo',
      intro: getElementIntro(field, defaultIntro),
    });
  }

  const tables = Array.from(container.querySelectorAll<HTMLElement>('table, [role="grid"]')).filter(isVisible);
  for (const table of tables) {
    steps.push({
      element: table,
      title: 'Tabela',
      intro: 'Lista ou tabela de dados.',
    });
  }

  const lists = Array.from(container.querySelectorAll<HTMLElement>('ul, ol')).filter((el) => {
    if (!isVisible(el)) return false;
    const items = el.querySelectorAll('li');
    return items.length >= MIN_LIST_ITEMS;
  });
  for (const list of lists.slice(0, 2)) {
    steps.push({
      element: list,
      title: 'Lista',
      intro: 'Lista de itens.',
    });
  }

  const nav = container.querySelector<HTMLElement>('nav, [role="navigation"]');
  if (nav && isVisible(nav)) {
    steps.push({
      element: nav,
      title: 'Navegação',
      intro: 'Menu de navegação para acessar outras páginas.',
    });
  }

  if (steps.length <= 1) {
    steps.push({
      title: 'Conteúdo',
      intro: 'O conteúdo principal desta página está nesta área.',
    });
  }

  return steps;
}

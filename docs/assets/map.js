/* Global renderer for a single book data file. No server or build step required. */
(function () {
  const data = window.BOOK_DATA;
  if (!data) throw new Error('book.js did not load.');

  const { metadata, books, circles, people, ties, circlePresentation, profileAtChapter, characterRecap, relationshipRecap } = data;
  const maxChapter = Math.max(...books.map((book) => book.end));
  const byId = new Map(people.map((person) => [person.id, person]));
  const principalIds = new Set(metadata.principalIds || []);
  let chapter = 1;
  let selectedId = metadata.defaultPersonId || people[0]?.id;
  let focus = null;
  let openDrawers = new Set();
  let collapsedCircles = new Set();

  const $ = (id) => document.getElementById(id);
  const position = (number) => {
    const book = books.find((entry) => number >= entry.start && number <= entry.end) || books.at(-1);
    return `Book ${book.roman} · Chapter ${number}`;
  };
  const visiblePeople = () => people.filter((person) => person.introduced <= chapter);
  const visibleTies = () => {
    const ids = new Set(visiblePeople().map((person) => person.id));
    return ties.filter((tie) => tie.introduced <= chapter && (!tie.through || chapter <= tie.through) && ids.has(tie.from) && ids.has(tie.to));
  };
  const rememberDrawers = () => {
    openDrawers = new Set([...document.querySelectorAll('details.relations[open]')].map((drawer) => drawer.dataset.circle));
    collapsedCircles = new Set([...document.querySelectorAll('details.household:not([open])')].map((household) => household.dataset.circle));
  };
  const tieIndex = (tie) => ties.indexOf(tie);
  const selectedTie = (index) => Number.isInteger(index) && ties[index] ? ties[index] : null;

  function relationshipBranch(tie) {
    const left = byId.get(tie.from);
    const right = byId.get(tie.to);
    return `<div class="branch">
      <button class="tree-person" data-person="${left.id}" data-tie="${tieIndex(tie)}"><span>${left.initials}</span>${left.name}</button>
      <span class="tree-link"><i></i><em>${tie.label}</em><i></i></span>
      <button class="tree-person tone-${circles.find((circle) => circle.id === right.circle)?.tone || 'violet'}" data-person="${right.id}" data-tie="${tieIndex(tie)}"><span>${right.initials}</span>${right.name}</button>
    </div>`;
  }

  function personCard(person) {
    const profile = profileAtChapter(person, chapter);
    const importance = principalIds.has(person.id) ? 'main' : 'minor';
    const nickname = person.nickname ? `<span class="nickname">Also called ${person.nickname}</span>` : '';
    return `<button class="card ${importance} ${person.id === selectedId ? 'selected' : ''}" data-person="${person.id}">
      <span class="initials">${person.initials}</span><span class="name">${person.name}</span>${nickname}
      <span class="role">${profile.role}</span><span class="chev">›</span>
    </button>`;
  }

  function relationshipMap(person, personTies) {
    if (!personTies.length) return '<p class="relationship-note">No named tie is visible at this reading position yet.</p>';
    const nodes = personTies.map((tie, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / personTies.length;
      return { tie, other: byId.get(tie.from === person.id ? tie.to : tie.from), x: 50 + Math.cos(angle) * 39, y: 50 + Math.sin(angle) * 36 };
    });
    return `<div class="radial"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${nodes.map((node) => `<line x1="50" y1="50" x2="${node.x}" y2="${node.y}"/>`).join('')}</svg>
      <div class="center"><span>${person.initials}</span><strong>${person.name}</strong></div>
      ${nodes.map((node) => `<button class="node ${focus === node.tie ? 'active' : ''}" style="left:${node.x}%;top:${node.y}%" data-person="${person.id}" data-tie="${tieIndex(node.tie)}"><span>${node.other.initials}</span><strong>${node.other.name}</strong></button>`).join('')}
    </div>`;
  }

  function detailPanel(person, personTies, row) {
    const profile = profileAtChapter(person, chapter);
    const active = focus && personTies.includes(focus) ? focus : null;
    const other = active ? byId.get(active.from === person.id ? active.to : active.from) : null;
    const label = active ? 'Relationship at this chapter' : 'This person at this chapter';
    const note = active ? relationshipRecap(person, other, active, chapter) : characterRecap(person, chapter);
    return `<aside class="details" style="grid-row:${row}">
      <div class="detail-top"><span>Selected person</span><span>First shown: ${position(person.introduced)}</span></div>
      <div class="identity"><div class="big-initials">${person.initials}</div><div><h2>${person.name}</h2><p>${profile.role}</p></div></div>
      <p class="detail-copy">${profile.detail}</p><div class="rule"></div><p class="detail-label">Relationship map</p>
      ${relationshipMap(person, personTies)}<div class="rule"></div><p class="detail-label">${label}</p><span class="relationship-note">${note}</span>
    </aside>`;
  }

  function render() {
    const peopleNow = visiblePeople();
    const availableIds = new Set(peopleNow.map((person) => person.id));
    if (!availableIds.has(selectedId)) selectedId = peopleNow[0]?.id;
    const person = byId.get(selectedId);
    const tiesNow = visibleTies();
    if (focus) focus = tiesNow.find((tie) => tie.from === focus.from && tie.to === focus.to) || null;
    const circlesNow = circles.filter((circle) => peopleNow.some((entry) => entry.circle === circle.id));
    const row = circlesNow.findIndex((circle) => circle.id === person.circle) + 1;
    const currentBook = books.find((book) => chapter >= book.start && chapter <= book.end);

    $('slider').value = chapter;
    $('badge').textContent = position(chapter);
    $('position').textContent = position(chapter);
    $('chapter-count').textContent = `Continuous numbering · Chapter ${chapter} of ${maxChapter}`;
    $('earlier').disabled = chapter === 1;
    $('later').disabled = chapter === maxChapter;
    $('summary').textContent = `${peopleNow.length} people · ${tiesNow.length} named ties`;
    $('book-index').innerHTML = books.map((book) => `<span class="${book === currentBook ? 'current' : ''}"><b>Book ${book.roman}</b><small>Ch. ${book.start}–${book.end}</small></span>`).join('');

    const sections = circlesNow.map((circle, index) => {
      const members = peopleNow.filter((entry) => entry.circle === circle.id);
      const presentation = circlePresentation(circle, chapter);
      const related = tiesNow.filter((tie) => byId.get(tie.from).circle === circle.id);
      return `<details class="circle household tone-${circle.tone}" data-circle="${circle.id}" style="grid-row:${index + 1}" ${collapsedCircles.has(circle.id) ? '' : 'open'}>
        <summary class="circle-head"><div><p>${presentation.eyebrow}</p><h2>${presentation.title}</h2></div><span class="count">${members.length}</span></summary>
        <div class="household-content"><div class="cards">${members.map(personCard).join('')}</div>
        ${related.length ? `<details class="relations" data-circle="${circle.id}" ${openDrawers.has(circle.id) ? 'open' : ''}><summary>${related.length} relationship${related.length === 1 ? '' : 's'} shown so far</summary><div class="tree">${related.map(relationshipBranch).join('')}</div></details>` : ''}</div>
      </details>`;
    }).join('');
    const personTies = tiesNow.filter((tie) => tie.from === person.id || tie.to === person.id);
    $('layout').innerHTML = `${sections}${detailPanel(person, personTies, row)}`;
  }

  function setChapter(nextChapter) {
    rememberDrawers();
    chapter = Math.min(maxChapter, Math.max(1, nextChapter));
    render();
  }

  function select(personId, tie) {
    rememberDrawers();
    selectedId = personId;
    focus = tie;
    render();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-person]');
    if (!button) return;
    select(button.dataset.person, selectedTie(button.dataset.tie === undefined ? NaN : Number(button.dataset.tie)));
  });
  $('slider').addEventListener('input', (event) => setChapter(Number(event.target.value)));
  $('earlier').addEventListener('click', () => setChapter(chapter - 1));
  $('later').addEventListener('click', () => setChapter(chapter + 1));

  document.title = `${metadata.title} — spoiler-safe character map`;
  $('eyebrow').textContent = metadata.eyebrow || 'A reader’s companion';
  $('title').textContent = metadata.title;
  $('subtitle').textContent = metadata.subtitle || 'Character map, one chapter at a time.';
  $('reading-prompt').textContent = metadata.readingPrompt || 'Move to the chapter you’ve finished. Later people and connections stay out of sight.';
  if (metadata.theme?.accent) document.documentElement.style.setProperty('--violet', metadata.theme.accent);
  if (metadata.theme?.accentPale) document.documentElement.style.setProperty('--violet-pale', metadata.theme.accentPale);
  $('slider').max = maxChapter;
  render();
})();

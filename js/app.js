/* ==========================================================
   SHARED HELPERS
   Shortcuts for selecting one element or a list of elements.
   ========================================================== */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Lock page scrolling while the inquiry dialog is open.
function updateScrollLock() {
    document.body.style.overflow = modal?.classList.contains('open') ? 'hidden' : '';
}

/* ==========================================================
   BOOKING / CONTACT INQUIRY
   Contact Us and existing inquiry buttons open the same form.
   ========================================================== */
const modal = $('#bookingModal');
let modalTrigger = null;

// Open the inquiry dialog and optionally select a destination.
function openModal(region) {
    if (!modal) return;

    modalTrigger = document.activeElement;
    const select = $('#regionSelect');
    if (select && region) select.value = region;

    modal.classList.add('open');
    updateScrollLock();
    $('#modalClose')?.focus();
}

// Close the dialog and return keyboard focus to its opening control.
function closeModal() {
    if (!modal?.classList.contains('open')) return;

    modal.classList.remove('open');
    updateScrollLock();
    modalTrigger?.focus();
}

$$('[data-book]').forEach(button => {
    button.addEventListener('click', event => {
        event.preventDefault();
        openModal(button.dataset.book || '');
    });
});

$('#modalClose')?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
});

// Preserve the prototype submission message; no server request is made.
$('#bookingForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const note = $('#successNote');

    if (note) {
        note.style.display = 'block';
        note.textContent = 'Inquiry saved for this prototype. Connect this form to your backend or email service for live submissions.';
    }
});

document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeModal();
});

/* ==========================================================
   DESTINATION SEARCH AND FEATURED LINKS
   These controls are optional and only run where present.
   ========================================================== */
const searchInput = $('#nationSearch');

// Filter package cards using their search keywords or visible text.
searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    $$('.package-card').forEach(card => {
        const content = (card.dataset.search || card.textContent).toLowerCase();
        card.style.display = !query || content.includes(query) ? 'block' : 'none';
    });
});

// Open the first matching package when the visitor presses Enter.
searchInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;

    const first = $$('.package-card').find(card => card.style.display !== 'none');
    const link = first?.querySelector('.view-btn');
    if (link) location.href = link.href;
});

$$('[data-scroll-featured]').forEach(button => {
    button.addEventListener('click', () => {
        $('#featured')?.scrollIntoView({ behavior: 'smooth' });
    });
});

/* ==========================================================
   DESTINATION DATA
   Edit this list to update the dropdown. The slug matches each
   page filename, icon filename, and nation color class in CSS.
   ========================================================== */
const destinations = [
    { name: 'Mondstadt', slug: 'mondstadt', description: 'The City of Freedom' },
    { name: 'Liyue', slug: 'liyue', description: 'The Harbor of Stone & Commerce' },
    { name: 'Inazuma', slug: 'inazuma', description: 'The Realm of the Thunder' },
    { name: 'Sumeru', slug: 'sumeru', description: 'The Land of Wisdom & Rainforest' },
    { name: 'Fontaine', slug: 'fontaine', description: 'Capital of Justice, Steam, & Aquatics' },
    { name: 'Natlan', slug: 'natlan', description: 'The Land of Ash, Hot Springs, and Valor' },
    { name: 'Snezhnaya', slug: 'snezhnaya', description: 'The Eternal White Tundra' }
];

// Return the current filename; queries and hashes do not affect the result.
function getCurrentPage() {
    return window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
}

// Mark the current destination and its parent navigation control.
function updateActiveNavigation() {
    const currentPage = getCurrentPage();
    let destinationIsActive = false;

    $$('.tt-region').forEach(link => {
        const isCurrent = link.getAttribute('href') === currentPage;
        link.removeAttribute('aria-current');
        link.querySelector('.tt-current-label')?.remove();

        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
            const label = document.createElement('span');
            label.className = 'tt-current-label';
            link.querySelector('[data-destination-name]').parentElement.append(label);
            destinationIsActive = true;
        }
    });

    $('#ttDestinationToggle')?.classList.toggle('is-active', destinationIsActive);

    // About Us has its own active state, without highlighting a destination.
    const aboutLink = $('.tt-navigation a[href="about.html"]');
    aboutLink?.removeAttribute('aria-current');
    if (currentPage === 'about.html') aboutLink?.setAttribute('aria-current', 'page');
}

// Build the dropdown from one HTML template, without duplicating markup.
function renderDestinations() {
    const list = $('#destinationList');
    const template = $('#destinationTemplate');
    if (!list || !template) return;

    const fragment = document.createDocumentFragment();

    destinations.forEach(destination => {
        const item = template.content.cloneNode(true);
        const link = item.querySelector('a');
        const icon = item.querySelector('img');

        link.href = `${destination.slug}.html`;
        link.classList.add(`nav-nation-${destination.slug}`);
        icon.src = `assets/images/${destination.slug}_icon.webp`;
        item.querySelector('[data-destination-name]').textContent = destination.name;
        item.querySelector('[data-destination-description]').textContent = destination.description;
        fragment.append(item);
    });

    // Replacing the children also prevents duplicates if rendered again.
    list.replaceChildren(fragment);
    updateActiveNavigation();
}

renderDestinations();

/* ==========================================================
   UPGRADED NAVBAR
   Shared desktop/mobile navigation with an accessible disclosure.
   ========================================================== */
// Attach dropdown and mobile navigation events once after rendering.
function initializeNavigation() {
    const header = document.querySelector('.tt-header');
    if (!header) return;

    const menuButton = document.getElementById('ttMenuToggle');
    const nav = document.getElementById('ttNavigation');
    const destinationButton = document.getElementById('ttDestinationToggle');
    const destinationMenu = document.getElementById('ttDestinations');
    const panel = document.getElementById('ttDestinationPanel');
    // Hide a missing decorative icon without an inline HTML handler.
    header.querySelectorAll('img').forEach(icon => {
        icon.addEventListener('error', () => { icon.hidden = true; });
        if (icon.complete && !icon.naturalWidth) icon.hidden = true;
    });

    // Keep the visible panel and screen-reader state in sync.
    function setDestinations(open) {
        destinationButton.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
    }
    // Collapse the destination list whenever the mobile menu closes.
    function setNavigation(open) {
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        menuButton.firstElementChild.textContent = open ? '×' : '☰';
        nav.classList.toggle('is-open', open);
        if (!open) setDestinations(false);
    }
    destinationButton.addEventListener('click', () => setDestinations(panel.hidden));
    menuButton.addEventListener('click', () => setNavigation(menuButton.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', event => {
        if (!destinationMenu.contains(event.target)) setDestinations(false);
        if (!header.contains(event.target)) setNavigation(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (!panel.hidden) {
            setDestinations(false);
            destinationButton.focus();
        } else if (nav.classList.contains('is-open')) {
            setNavigation(false);
            menuButton.focus();
        }
    });
    header.addEventListener('focusout', event => {
        if (!destinationMenu.contains(event.relatedTarget)) setDestinations(false);
        if (!header.contains(event.relatedTarget)) setNavigation(false);
    });
    nav.addEventListener('click', event => {
        if (event.target.closest('a')) setNavigation(false);
    });
    // Clear mobile state when switching between narrow and wide layouts.
    window.matchMedia('(max-width:720px)').addEventListener('change', () => setNavigation(false));
}

initializeNavigation();

/* ==========================================================
   PRIVACY AND TERMS RETURN LINKS
   Carry the source page in the link so Back also works when
   HTML files are opened directly, without a server referrer.
   ========================================================== */
(function initializeLegalNavigation() {
    // Booking owns the close buttons when Terms is inside its overlay.
    if (window.self !== window.top) return;

    const siteDirectory = new URL('.', window.location.href);
    const returnPages = new Set([
        'index.html', 'about.html',
        ...destinations.map(destination => `${destination.slug}.html`)
    ]);
    const legalPages = new Set(['privacy.html', 'terms.html']);

    // Accept only known pages in this project, never another site or folder.
    function getLocalPage(value, allowedPages) {
        if (!value) return null;
        try {
            const url = new URL(value, siteDirectory);
            if (url.protocol !== siteDirectory.protocol ||
                url.origin !== siteDirectory.origin ||
                !url.pathname.startsWith(siteDirectory.pathname)) return null;

            const filename = url.pathname.slice(siteDirectory.pathname.length) || 'index.html';
            return allowedPages.has(filename) ? url : null;
        } catch {
            return null;
        }
    }

    function relativePath(url) {
        const filename = url.pathname.slice(siteDirectory.pathname.length) || 'index.html';
        return filename + url.search + url.hash;
    }

    function updateLegalLinks() {
        const source = getLocalPage(window.location.href, returnPages);
        if (!source) return;

        document.querySelectorAll('a[href]').forEach(link => {
            const target = getLocalPage(link.getAttribute('href'), legalPages);
            if (!target) return;
            target.searchParams.set('returnTo', relativePath(source));
            link.setAttribute('href', relativePath(target));
        });
    }

    const returnPage = getLocalPage(new URLSearchParams(window.location.search).get('returnTo'), returnPages)
        || getLocalPage(document.referrer, returnPages)
        || new URL('index.html', siteDirectory);

    document.querySelectorAll('[data-legal-return]').forEach(link => {
        link.setAttribute('href', relativePath(returnPage));
    });

    updateLegalLinks();
    // Keep the selected section when the visitor follows an in-page anchor.
    window.addEventListener('hashchange', updateLegalLinks);
})();

/* INLINE FORM CONFIRMATION
   Booking: validate -> confirmation -> acknowledgment.
   Inquiry: validate -> acknowledgment.
   Cancel/Escape preserves input. Done resets the form for a new request.
   Connect a backend before using the acknowledgment as a real receipt.
*/
document.querySelectorAll('[data-inline-form]').forEach(form => {
    const confirmation = document.getElementById('form-confirmation');
    const acknowledgment = document.getElementById('form-acknowledgment');
    const adults = form.querySelector('#adults');
    const children = form.querySelector('#children');
    const submitButton = form.querySelector('[type="submit"]');
    let confirmed = false;

    // Initial values remain zero; a request must include at least one traveler.
    function validateTravelers() {
        if (!adults || !children) return;
        const count = Number(adults.value) + Number(children.value);
        adults.setCustomValidity(count > 0 ? '' : 'Please add at least one traveler.');
    }

    adults?.addEventListener('input', validateTravelers);
    children?.addEventListener('input', validateTravelers);
    validateTravelers();

    form.addEventListener('submit', event => {
        event.preventDefault();
        validateTravelers();
        if (!form.reportValidity()) return;
        confirmed = false;
        if (confirmation) {
            confirmation.showModal();
        } else {
            acknowledgment.showModal();
        }
    });

    confirmation?.querySelector('[data-cancel-request]').addEventListener('click', () => {
        confirmation.close();
        submitButton.focus();
    });

    // Escape has the same effect as Cancel; it never confirms the request.
    confirmation?.addEventListener('cancel', () => { confirmed = false; });

    confirmation?.querySelector('[data-confirm-request]').addEventListener('click', () => {
        if (confirmed) return;
        confirmed = true;
        confirmation.close();
        acknowledgment.showModal();
    });

    acknowledgment.querySelector('[data-finish-request]').addEventListener('click', () => {
        acknowledgment.close();
    });

    // Closing a completed acknowledgment begins a fresh form with 0 / 0 counts.
    acknowledgment.addEventListener('close', () => {
        form.reset();
        confirmed = false;
        validateTravelers();
        form.querySelector('input:not([readonly]), select, textarea')?.focus();
    });
});

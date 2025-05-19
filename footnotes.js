// Polymorphic footnote panel logic
const footnotes = [
  { id: 'get-back' },
  { id: 'unable-to-get-back' },
  { id: 'why-get-back' },
  { id: 'suss-out' }
  // Add more footnotes here as needed
];

const closeBtnClass = 'text-gray-400 hover:text-accent text-2xl font-bold';
const footnoteLinkBtnClass = 'border-b border-dotted border-accent text-accent font-semibold cursor-pointer focus:outline-none';
const footnoteContentClass = 'text-dark space-y-4 text-sm p-6';

let openFootnoteStack = [];
let lastOpenedFromFootnote = false;

function showFootnotePanel(id) {
  // If already open, bring to top and close panels above
  const existingIdx = openFootnoteStack.indexOf(id);
  if (existingIdx !== -1) {
    // Close all panels above this one
    for (let i = openFootnoteStack.length - 1; i > existingIdx; i--) {
      hideFootnotePanel(openFootnoteStack[i], false);
    }
    return;
  }
  if (!lastOpenedFromFootnote) {
    // Opened from main page, clear stack
    openFootnoteStack.forEach(fid => hideFootnotePanel(fid, false));
    openFootnoteStack = [];
  }
  openFootnoteStack.push(id);
  updateFootnotePanels();
  lastOpenedFromFootnote = false;
}

function hideFootnotePanel(id, update = true) {
  const idx = openFootnoteStack.indexOf(id);
  if (idx !== -1) {
    // Close this and all panels above
    for (let i = openFootnoteStack.length - 1; i >= idx; i--) {
      const panel = document.querySelector(`.footnote[data-footnote="${openFootnoteStack[i]}"]`);
      if (panel) {
        panel.classList.add('hidden');
        panel.style.transform = '';
        panel.style.top = '';
        panel.style.zIndex = '';
      }
      openFootnoteStack.pop();
    }
    if (update) updateFootnotePanels();
  }
}

function updateFootnotePanels() {
  // Overlay logic: show if any footnote is open
  const overlay = document.getElementById('footnote-overlay');
  if (overlay) {
    if (openFootnoteStack.length > 0) {
      overlay.style.display = 'block';
      overlay.classList.remove('hidden');
      overlay.style.opacity = '1';
    } else {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
      overlay.style.opacity = '0';
    }
  }
  // Hide all panels first
  document.querySelectorAll('.footnote').forEach(panel => {
    panel.classList.add('hidden');
    panel.style.transform = '';
    panel.style.top = '';
    panel.style.zIndex = '';
  });
  let offset = 0;
  openFootnoteStack.forEach((id, i) => {
    const panel = document.querySelector(`.footnote[data-footnote="${id}"]`);
    if (panel) {
      panel.classList.remove('hidden');
      panel.classList.add('fixed', 'right-0', 'w-96', 'max-w-full', 'bg-white', 'shadow-2xl', 'z-50', 'border-l', 'border-accent', 'transition-transform', 'duration-300', 'flex', 'flex-col');
      panel.style.left = '';
      panel.style.right = '0';
      panel.style.width = '24rem';
      panel.style.maxWidth = '100%';
      panel.style.zIndex = 50 + i;
      panel.style.height = 'calc(100vh - ' + offset + 'px)';
      // Only the last (topmost) panel shows content
      const contentDiv = panel.querySelector('.footnote-content');
      if (contentDiv) {
        if (i === openFootnoteStack.length - 1) {
          contentDiv.style.display = '';
          contentDiv.style.overflowY = 'auto';
          contentDiv.style.flex = '1 1 auto';
          contentDiv.style.maxHeight = '100%';
        } else {
          contentDiv.style.display = 'none';
          contentDiv.style.overflowY = '';
          contentDiv.style.flex = '';
          contentDiv.style.maxHeight = '';
        }
      }
      // Position panel below previous headers
      panel.style.top = offset + 'px';
      // Get header height
      const header = panel.querySelector('.footnote-header');
      if (header) {
        header.style.cursor = (i < openFootnoteStack.length - 1) ? 'pointer' : '';
        if (i < openFootnoteStack.length - 1) {
          header.onclick = () => {
            // Close all panels below this one (i.e., with index > i)
            while (openFootnoteStack.length > i + 1) {
              hideFootnotePanel(openFootnoteStack[openFootnoteStack.length - 1], false);
            }
            updateFootnotePanels();
          };
        } else {
          header.onclick = null;
        }
        // Attach close button logic: close this and all below
        const closeBtn = header.querySelector('.close-btn');
        if (closeBtn) {
          closeBtn.onclick = (e) => {
            e.stopPropagation();
            // Close this and all panels below (i.e., with index >= i)
            while (openFootnoteStack.length > i) {
              hideFootnotePanel(openFootnoteStack[openFootnoteStack.length - 1], false);
            }
            updateFootnotePanels();
          };
        }
        offset += header.offsetHeight;
      }
    }
  });
}

// Attach event listeners and classes for all footnote links
footnotes.forEach(({ id }) => {
  const btnEls = document.querySelectorAll(`[data-footnote-link="${id}"]`);
  btnEls.forEach(btnEl => {
    btnEl.className = footnoteLinkBtnClass;
    // Set tooltip to the title if available
    const titleDiv = document.querySelector(`.footnote[data-footnote="${id}"] .footnote-title`);
    if (titleDiv) {
      btnEl.title = titleDiv.textContent.trim();
    }
    btnEl.addEventListener('click', function (e) {
      // If the link is inside a footnote panel, set cascading
      lastOpenedFromFootnote = !!btnEl.closest('.footnote:not(.hidden)');
      showFootnotePanel(id);
    });
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    // Close only the topmost (last opened and visible) footnote
    if (openFootnoteStack.length > 0) {
      hideFootnotePanel(openFootnoteStack[openFootnoteStack.length - 1]);
    }
  }
});

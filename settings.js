/**
 * @typedef {Object} DomainGroup
 * @property {number} delay - Delay in seconds for this group
 * @property {string[]} domains - List of domains in this group
 */

/** @type {HTMLElement} */
const groupsContainer = document.getElementById('groups');

/** @type {HTMLButtonElement} */
const addGroupBtn = document.getElementById('addGroup');

/** @type {HTMLButtonElement} */
const saveButton = document.getElementById('save');

/** @type {HTMLElement} */
const savedMessage = document.getElementById('saved');

/**
 * Current number of groups (used for generating IDs).
 * @type {number}
 */
let groupCount = 0;

/**
 * Create a new group element and append it to the container.
 * @param {number} [delay=5] - The delay in seconds
 * @param {string[]} [domains=[]] - Array of domain strings
 * @returns {HTMLElement} The created group element
 */
function createGroupElement(delay = 5, domains = []) {
  groupCount++;
  const groupIndex = groupCount;

  const group = document.createElement('div');
  group.className = 'group';
  group.dataset.index = groupIndex.toString();

  group.innerHTML = `
    <div class="group-header">
      <span class="group-title">Group ${groupIndex}</span>
      <button type="button" class="delete-btn" data-index="${groupIndex}">Delete</button>
    </div>
    <div class="setting">
      <label>Delay (seconds)</label>
      <input type="number" class="group-delay" min="1" max="300" value="${delay}">
    </div>
    <div class="setting">
      <label>Domains (one per line)</label>
      <textarea class="group-domains" placeholder="example.com&#10;twitter.com">${domains.join('\n')}</textarea>
      <div class="hint">Enter domain names without http:// or www.</div>
    </div>
  `;

  // Add delete handler
  const deleteBtn = group.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    group.remove();
    renumberGroups();
    updateEmptyState();
  });

  groupsContainer.appendChild(group);
  updateEmptyState();

  return group;
}

/**
 * Renumber all groups after a deletion to maintain sequential numbering.
 */
function renumberGroups() {
  const groups = groupsContainer.querySelectorAll('.group');
  groups.forEach((group, index) => {
    const title = group.querySelector('.group-title');
    if (title) {
      title.textContent = `Group ${index + 1}`;
    }
  });
}

/**
 * Show or hide the empty state message based on whether there are groups.
 */
function updateEmptyState() {
  const existingEmpty = groupsContainer.querySelector('.empty-state');
  const groups = groupsContainer.querySelectorAll('.group');

  if (groups.length === 0 && !existingEmpty) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = '<p>No groups configured. Pages will load without delay.</p>';
    groupsContainer.appendChild(emptyState);
  } else if (groups.length > 0 && existingEmpty) {
    existingEmpty.remove();
  }
}

/**
 * Collect all groups from the DOM and return as an array.
 * Filters out groups with no domains.
 * @returns {DomainGroup[]} Array of domain groups
 */
function collectGroups() {
  const groups = groupsContainer.querySelectorAll('.group');
  const result = [];

  groups.forEach(group => {
    const delayInput = group.querySelector('.group-delay');
    const domainsTextarea = group.querySelector('.group-domains');

    const delay = parseInt(delayInput.value) || 5;
    const domainsText = domainsTextarea.value.trim();
    const domains = domainsText
      ? domainsText.split('\n').map(d => d.trim().toLowerCase()).filter(d => d)
      : [];

    // Only include groups that have at least one domain
    if (domains.length > 0) {
      result.push({ delay, domains });
    }
  });

  return result;
}

/**
 * Load saved settings from storage and populate the UI.
 */
function loadSettings() {
  browser.storage.local.get(['groups']).then((result) => {
    const groups = result.groups || [];

    if (groups.length === 0) {
      updateEmptyState();
    } else {
      groups.forEach(group => {
        createGroupElement(group.delay, group.domains);
      });
    }
  });
}

/**
 * Save current settings to storage.
 */
function saveSettings() {
  const groups = collectGroups();

  browser.storage.local.set({ groups }).then(() => {
    savedMessage.classList.add('show');
    setTimeout(() => {
      savedMessage.classList.remove('show');
    }, 2000);
  });
}

// Event listeners
addGroupBtn.addEventListener('click', () => {
  createGroupElement();
});

saveButton.addEventListener('click', saveSettings);

// Initial load
loadSettings();

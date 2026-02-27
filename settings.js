/**
 * @typedef {Object} DomainGroup
 * @property {number} delay - Delay in seconds for this group
 * @property {string[]} domains - List of domains in this group
 * @property {boolean} [requireFocus] - If true, countdown only runs when page is focused
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
 * @param {boolean} [requireFocus=false] - If true, countdown only runs when page is focused
 * @returns {HTMLElement} The created group element
 */
function createGroupElement(delay = 5, domains = [], requireFocus = false) {
  groupCount++;
  const groupIndex = groupCount;

  // Create group container
  const group = document.createElement('div');
  group.className = 'group';
  group.dataset.index = groupIndex.toString();

  // Create header
  const header = document.createElement('div');
  header.className = 'group-header';

  const title = document.createElement('span');
  title.className = 'group-title';
  title.textContent = `Group ${groupIndex}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.dataset.index = groupIndex.toString();
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    group.remove();
    renumberGroups();
    updateEmptyState();
  });

  header.appendChild(title);
  header.appendChild(deleteBtn);

  // Create delay setting
  const delaySetting = document.createElement('div');
  delaySetting.className = 'setting';

  const delayLabel = document.createElement('label');
  delayLabel.textContent = 'Delay (seconds)';

  const delayInput = document.createElement('input');
  delayInput.type = 'number';
  delayInput.className = 'group-delay';
  delayInput.min = '1';
  delayInput.max = '300';
  delayInput.value = delay.toString();

  delaySetting.appendChild(delayLabel);
  delaySetting.appendChild(delayInput);

  // Create Advanced section
  const advancedSection = document.createElement('div');
  advancedSection.className = 'advanced-section';

  const advancedToggle = document.createElement('button');
  advancedToggle.type = 'button';
  advancedToggle.className = 'advanced-toggle';
  advancedToggle.textContent = 'Advanced';
  advancedToggle.addEventListener('click', () => {
    advancedSection.classList.toggle('open');
  });

  const advancedContent = document.createElement('div');
  advancedContent.className = 'advanced-content';

  // Focus setting
  const focusSetting = document.createElement('div');
  focusSetting.className = 'setting checkbox-setting';

  const focusLabel = document.createElement('label');
  focusLabel.className = 'checkbox-label';

  const focusCheckbox = document.createElement('input');
  focusCheckbox.type = 'checkbox';
  focusCheckbox.className = 'group-require-focus';
  focusCheckbox.checked = requireFocus;

  const focusText = document.createElement('span');
  focusText.textContent = 'Only countdown when page is focused';

  focusLabel.appendChild(focusCheckbox);
  focusLabel.appendChild(focusText);
  focusSetting.appendChild(focusLabel);

  // Assemble advanced section
  advancedContent.appendChild(focusSetting);
  advancedSection.appendChild(advancedToggle);
  advancedSection.appendChild(advancedContent);

  // Create domains setting
  const domainsSetting = document.createElement('div');
  domainsSetting.className = 'setting';

  const domainsLabel = document.createElement('label');
  domainsLabel.textContent = 'Domains (one per line)';

  const domainsTextarea = document.createElement('textarea');
  domainsTextarea.className = 'group-domains';
  domainsTextarea.placeholder = 'example.com\ntwitter.com';
  domainsTextarea.value = domains.join('\n');

  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = 'Enter domain names without http:// or www.';

  domainsSetting.appendChild(domainsLabel);
  domainsSetting.appendChild(domainsTextarea);
  domainsSetting.appendChild(hint);

  // Assemble group
  group.appendChild(header);
  group.appendChild(delaySetting);
  group.appendChild(domainsSetting);
  group.appendChild(advancedSection);

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

    const message = document.createElement('p');
    message.textContent = 'No groups configured. Pages will load without delay.';
    emptyState.appendChild(message);

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
    const focusCheckbox = group.querySelector('.group-require-focus');

    const delay = parseInt(delayInput.value) || 5;
    const requireFocus = focusCheckbox ? focusCheckbox.checked : false;
    const domainsText = domainsTextarea.value.trim();
    const domains = domainsText
      ? domainsText.split('\n').map(d => d.trim().toLowerCase()).filter(d => d)
      : [];

    // Only include groups that have at least one domain
    if (domains.length > 0) {
      result.push({ delay, domains, requireFocus });
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
        createGroupElement(group.delay, group.domains, group.requireFocus || false);
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

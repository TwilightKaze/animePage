// ===== Configuration =====
const SEARCH_ENGINES = {
    bing: { url: 'https://www.bing.com/search?q=', icon: 'ph-bing-logo' },
    google: { url: 'https://www.google.com/search?q=', icon: 'ph-google-logo' }
};

const DEFAULT_SHORTCUTS = [
    { name: 'Github', url: 'https://github.com', icon: 'G' },
    { name: '翻译', url: 'https://translate.google.com', icon: '翻' }
];

// ===== State =====
const state = {
    theme: localStorage.getItem('theme') || 'light',
    engine: localStorage.getItem('engine') || 'bing',
    notes: JSON.parse(localStorage.getItem('notes')) || [],
    shortcuts: JSON.parse(localStorage.getItem('shortcuts')) || DEFAULT_SHORTCUTS,
    settings: JSON.parse(localStorage.getItem('settings')) || {
        wallpaper: '',
        themeColor: '#a85068',
        hideLogo: false,
        hideFooter: false,
        darkMask: false,
        showShortcuts: false
    },
    currentNoteId: null
};

// ===== DOM Elements =====
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSearch();
    initSettings();
    initShortcuts();
    initAppearance();
    initModals();
    initNotes();
    updateStorageUsage();
});

// ===== Theme & Appearance System =====
function initTheme() {
    applyTheme(state.theme);

    $('#themeBtn').addEventListener('click', () => {
        toggleTheme();
    });

    // Sync toggle in settings
    $('#darkModeToggle').checked = state.theme === 'dark';
    $('#darkModeToggle').addEventListener('change', () => {
        toggleTheme();
    });
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    applyTheme(state.theme);
    $('#darkModeToggle').checked = state.theme === 'dark';
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const iconClass = theme === 'light' ? 'ph-moon' : 'ph-sun';
    $('#themeBtn i').className = `ph ${iconClass}`;
    applyAppearance(); // Re-apply masks if needed
}

function initAppearance() {
    // Theme Color
    const picker = $('#themeColorPicker');
    picker.value = state.settings.themeColor;
    applyThemeColor(state.settings.themeColor);

    picker.addEventListener('input', (e) => {
        const color = e.target.value;
        state.settings.themeColor = color;
        applyThemeColor(color);
        saveSettings();
    });

    $('#resetThemeColor').addEventListener('click', () => {
        const defaultColor = '#a85068';
        state.settings.themeColor = defaultColor;
        picker.value = defaultColor;
        applyThemeColor(defaultColor);
        saveSettings();
    });

    // Wallpapers
    if (state.settings.wallpaper) setWallpaper(state.settings.wallpaper);

    $('#bgUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                alert('图片太大，请选择小于 3MB 的图片');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setWallpaper(e.target.result);
                saveSettings();
            };
            reader.readAsDataURL(file);
        }
    });

    $('#bgBing').addEventListener('click', () => {
        // Using a reliable Unsplash nature image as "Daily" stand-in
        const url = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920';
        setWallpaper(url);
        saveSettings();
    });

    $('#bgAnime').addEventListener('click', () => {
        const url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920';
        setWallpaper(url);
        saveSettings();
    });

    $('#bgLandscape').addEventListener('click', () => {
        const url = 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920';
        setWallpaper(url);
        saveSettings();
    });

    // Reset Wallpapers
    $('#bgResetLight').addEventListener('click', () => {
        setWallpaper(''); // Clear custom wallpaper
        // Logic to switch to light theme? User said "Reset to default light wallpaper".
        // Usually implies clearing the custom image so the CSS background applies.
        // If they want to force light theme too:
        if (state.theme !== 'light') toggleTheme();
        saveSettings();
    });

    $('#bgResetDark').addEventListener('click', () => {
        setWallpaper('');
        if (state.theme !== 'dark') toggleTheme();
        saveSettings();
    });

    // Toggles
    setupToggle('hideLogoToggle', 'hideLogo', () => {
        $('.brand-title').style.display = state.settings.hideLogo ? 'none' : 'block';
    });

    setupToggle('hideFooterToggle', 'hideFooter', () => {
        $('.footer').style.display = state.settings.hideFooter ? 'none' : 'block';
    });

    setupToggle('darkMaskToggle', 'darkMask', applyAppearance);

    // Initial Apply
    if (state.settings.hideLogo) $('.brand-title').style.display = 'none';
    if (state.settings.hideFooter) $('.footer').style.display = 'none';
}

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    document.body.style.setProperty('--accent-color', color);
}

function setupToggle(id, key, callback) {
    const el = $(`#${id}`);
    if (!el) return;
    el.checked = state.settings[key];
    el.addEventListener('change', () => {
        state.settings[key] = el.checked;
        saveSettings();
        if (callback) callback();
    });
}

function applyAppearance() {
    const overlay = $('#background .overlay') || createOverlay();

    // Dark Mask Logic
    if (state.theme === 'dark' && state.settings.darkMask) {
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    } else {
        overlay.style.backgroundColor = 'transparent';
    }
}

function createOverlay() {
    let bg = $('#background');
    if (!bg) {
        bg = document.createElement('div');
        bg.id = 'background';
        bg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;background-size:cover;background-position:center;transition:background-image 0.5s;';
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;transition:background 0.3s;';
        bg.appendChild(overlay);
        document.body.prepend(bg);
        return overlay;
    }
    return bg.querySelector('.overlay');
}

function setWallpaper(url) {
    state.settings.wallpaper = url;
    const bg = $('#background') || createOverlay().parentNode;

    if (url) {
        bg.style.backgroundImage = `url(${url})`;
        $('#wallpaperPreview').style.backgroundImage = `url(${url})`;
        $('#wallpaperPreview').innerHTML = '';
    } else {
        bg.style.backgroundImage = '';
        $('#wallpaperPreview').style.backgroundImage = '';
        $('#wallpaperPreview').innerHTML = '<span>图片预览</span>';
    }
}

// ===== Shortcuts System =====
function initShortcuts() {
    // One-time cleanup for Bilibili if strictly requested to remove "from default"
    // but user data persists. We can filter it out if we assume they want it gone.
    state.shortcuts = state.shortcuts.filter(s => s.name !== 'bilibili');
    localStorage.setItem('shortcuts', JSON.stringify(state.shortcuts));

    renderShortcuts();

    $('#confirmShortcutBtn').addEventListener('click', () => {
        const name = $('#newShortcutName').value.trim();
        let url = $('#newShortcutUrl').value.trim();

        if (name && url) {
            if (!url.startsWith('http')) url = 'https://' + url;
            state.shortcuts.push({ name, url, icon: name[0].toUpperCase() });
            localStorage.setItem('shortcuts', JSON.stringify(state.shortcuts));
            renderShortcuts();
            closeModal('addShortcutModal');
            $('#newShortcutName').value = '';
            $('#newShortcutUrl').value = '';
        }
    });

    $('#cancelShortcutBtn').addEventListener('click', () => closeModal('addShortcutModal'));
}

function renderShortcuts() {
    const grid = $('#shortcutsGrid');
    grid.innerHTML = '';

    state.shortcuts.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'shortcut-item';
        let iconHtml = item.icon;

        try {
            const domain = new URL(item.url).hostname;
            // Google Favicon service
            iconHtml = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" onerror="this.parentElement.innerText='${item.icon}'">`;
        } catch (e) { }

        el.innerHTML = `
            <div class="shortcut-icon">${iconHtml}</div>
            <span>${item.name}</span>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'shortcut-delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('确定删除此捷径吗？')) {
                state.shortcuts.splice(index, 1);
                localStorage.setItem('shortcuts', JSON.stringify(state.shortcuts));
                renderShortcuts();
            }
        });

        el.appendChild(deleteBtn);

        el.addEventListener('click', () => {
            window.open(item.url, '_blank');
        });

        grid.appendChild(el);
    });

    // Add Button
    const addBtn = document.createElement('button');
    addBtn.className = 'shortcut-item add-shortcut';
    addBtn.innerHTML = `
        <div class="shortcut-icon">+</div>
        <span>添加捷径</span>
    `;
    addBtn.addEventListener('click', () => openModal('addShortcutModal'));
    grid.appendChild(addBtn);

    // Also render main page shortcuts if visible
    if (state.settings.showShortcuts) renderMainShortcuts();
}

function renderMainShortcuts() {
    const container = $('#mainShortcuts');
    if (!container) return;
    container.innerHTML = '';

    state.shortcuts.forEach(item => {
        const a = document.createElement('a');
        a.href = item.url;
        a.target = '_blank';
        a.className = 'main-shortcut-item';

        const iconHtml = getIconHtml(item);

        a.innerHTML = `
            <div class="main-shortcut-icon">${iconHtml}</div>
            <span>${item.name}</span>
        `;
        container.appendChild(a);
    });
}

function getIconHtml(item) {
    let iconHtml = item.icon || item.name[0].toUpperCase();
    try {
        const domain = new URL(item.url).hostname;
        iconHtml = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="${item.name}" onerror="this.replaceWith(this.getAttribute('alt')[0])">`;
    } catch (e) { }
    return iconHtml;
}

// ===== Settings & Data =====
function initSettings() {
    // Engine Toggle
    updateSettingsEngineBtn();
    $('#engineSelectBtn').addEventListener('click', () => {
        const engines = Object.keys(SEARCH_ENGINES);
        let currentIndex = engines.indexOf(state.engine);
        // Fallback if current engine not found
        if (currentIndex === -1) currentIndex = 0;

        const next = engines[(currentIndex + 1) % engines.length];
        state.engine = next;
        localStorage.setItem('engine', state.engine);
        updateSettingsEngineBtn();
        updateSearchIcon();
    });

    // Shortcuts Toggle
    const scToggle = $('#showShortcutsToggle');
    if (scToggle) {
        scToggle.checked = state.settings.showShortcuts;
        scToggle.addEventListener('change', (e) => {
            state.settings.showShortcuts = e.target.checked;
            saveSettings();
            updateMainShortcutsVisibility();
        });
    }

    // Apply initial visibility
    updateMainShortcutsVisibility();
}

function updateMainShortcutsVisibility() {
    const container = $('#mainShortcuts');
    if (!container) return;

    if (state.settings.showShortcuts) {
        container.style.display = 'flex';
        renderMainShortcuts();
    } else {
        container.style.display = 'none';
    }
}

function updateStorageUsage() {
    let total = 0;
    for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
            total += ((localStorage[x].length + x.length) * 2);
        }
    }
    const kb = (total / 1024).toFixed(2);
    const mb = (total / 1024 / 1024).toFixed(2);
    $('#storageUsage').textContent = `已使用 ${kb} KB`;
    $('#storageTotal').textContent = `共 5.00 MB / 当前占用的本地总容量`;
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(state.settings));
    updateStorageUsage();
}


// ===== Search System =====
function initSearch() {
    updateSearchIcon();
    $('#searchSubmit').addEventListener('click', performSearch);
    $('#searchInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
}

function updateSearchIcon() {
    // Ensure we account for missing keys
    const current = SEARCH_ENGINES[state.engine] ? state.engine : 'bing';
    const map = { bing: 'ph-bing-logo', google: 'ph-google-logo' };
    $('#currentEngineIcon i').className = `ph ${map[current] || 'ph-magnifying-glass'}`;
}

function updateSettingsEngineBtn() {
    const current = SEARCH_ENGINES[state.engine] ? state.engine : 'bing';
    const map = { bing: '必应', google: 'Google' };
    const iconMap = { bing: 'ph-bing-logo', google: 'ph-google-logo' };
    $('#engineSelectBtn').innerHTML = `<i class="ph ${iconMap[current]}"></i> ${map[current]}`;
}

function performSearch() {
    const query = $('#searchInput').value.trim();
    if (!query) return;
    const engine = SEARCH_ENGINES[state.engine] || SEARCH_ENGINES.bing;
    window.location.href = engine.url + encodeURIComponent(query);
}

// ===== Modal System =====
function initModals() {
    $('#moreBtn').addEventListener('click', () => openModal('moreModal'));
    $('#closeMoreModal').addEventListener('click', () => closeModal('moreModal'));
    $('#notesBtn').addEventListener('click', () => { openModal('notesModal'); renderNotesList(); });
    $('#closeNotesModal').addEventListener('click', () => closeModal('notesModal'));
    $$('.modal-overlay').forEach(overlay => overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); }));
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ===== Notes System =====
function initNotes() {
    $('#createNoteBtn').addEventListener('click', createNote);
    $('#noteContent').addEventListener('input', (e) => { if (state.currentNoteId) updateCurrentNote(e.target.value); });
    renderNotesList();
}

function createNote() {
    const newNote = { id: Date.now(), content: '', date: new Date().toISOString() };
    state.notes.unshift(newNote);
    localStorage.setItem('notes', JSON.stringify(state.notes));
    renderNotesList();
    selectNote(newNote.id);
}

function selectNote(id) {
    state.currentNoteId = id;
    const note = state.notes.find(n => n.id === id);
    if (note) {
        $('#noteContent').value = note.content;
        $('#noteContent').disabled = false;
        $('#noteContent').focus();
        $$('.note-item').forEach(el => el.classList.remove('active'));
        const active = document.querySelector(`.note-item[data-id="${id}"]`);
        if (active) active.classList.add('active');
    }
}

function updateCurrentNote(content) {
    const note = state.notes.find(n => n.id === state.currentNoteId);
    if (note) {
        note.content = content;
        localStorage.setItem('notes', JSON.stringify(state.notes));
        const active = document.querySelector(`.note-item[data-id="${note.id}"]`);
        if (active) active.textContent = note.content.split('\n')[0].substring(0, 20) || '新便签';
    }
}

function renderNotesList() {
    const list = $('#notesList');
    list.innerHTML = '';
    state.notes.forEach((note, index) => {
        const el = document.createElement('div');
        el.className = 'note-item';
        el.dataset.id = note.id;

        // Create text span for note title
        const textSpan = document.createElement('span');
        textSpan.className = 'note-title';
        textSpan.textContent = note.content.split('\n')[0].substring(0, 20) || '新便签';
        el.appendChild(textSpan);

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note-delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('确定删除此便签吗？')) {
                deleteNote(note.id);
            }
        });
        el.appendChild(deleteBtn);

        if (note.id === state.currentNoteId) el.classList.add('active');
        el.addEventListener('click', () => selectNote(note.id));
        list.appendChild(el);
    });
}

function deleteNote(id) {
    const index = state.notes.findIndex(n => n.id === id);
    if (index !== -1) {
        state.notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(state.notes));

        // If the deleted note was the current one, clear the editor
        if (state.currentNoteId === id) {
            state.currentNoteId = null;
            $('#noteContent').value = '';
            $('#noteContent').disabled = true;
        }

        renderNotesList();
        updateStorageUsage();
    }
}

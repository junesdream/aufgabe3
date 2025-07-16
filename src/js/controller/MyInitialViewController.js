/**
 * @author Jörn Kreutel
 * MWF1: Listenansicht mit MediaItems und Künstlern
 * MWF2: Aktionsmenü für Listenelemente
 * MWF3: Dialog zur Erstellung und Modifikation
 * FINALE VERSION - ALLE PROBLEME BEHOBEN
 */
import {mwf} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export default class MyInitialViewController extends mwf.ViewController {

    args;
    root;
    currentView = "medien";
    artistsData = null;
    currentDialogItem = null;
    isEditMode = false;

   // FRM1: Neue Eigenschaften für Bildauswahl
    selectedImageFile = null;
    selectedImageUrl = null;
    originalItemData = null;

    // FRM2: Neue Eigenschaften für Lokal/Remote Handling
    selectedStorageType = 'local';
    remoteServerUrl = 'https://mwf-server.herokuapp.com';
    currentFilter = 'all';

    constructor() {
        super();

        // MAP1: Neue Eigenschaften für Ansichts-Management
        this.currentViewMode = "list";
        this.availableViewModes = ["list", "map"];

        // MAP2
        this.map = null;
        this.markers = [];
        this.mapInitialized = false;
    }

    async oncreate() {
        this.root.innerHTML = `
            <header class="mwf-top">
                <h1>
                    <span class="mwf-icon-bars" id="toggleBtn"></span>
                    <span id="headerTitle">Medien</span>
                </h1>
                <!-- MAP1: Ansichtswechsel-Buttons in der Kopfzeile -->
            <div class="view-switcher" id="viewSwitcher">
                <button class="view-btn active" id="listViewBtn" data-view="list">
                    <span class="mwf-icon-list"></span>
                </button>
                <button class="view-btn" id="mapViewBtn" data-view="map">
                    <span class="mwf-icon-map"></span>
                </button>
            </div>
                <button class="mwf-icon-plus" id="addBtn"></button>
            </header>
            
            <main class="mwf-scrollcontainer">
             <!-- MAP1: Listenansicht (bestehend) -->
            <div id="listView" class="view-container active">
                <ul class="mwf-listview" id="itemsList">
                </ul>
            </div>
            <!-- MAP1: Kartenansicht (neu) -->
            <div id="mapView" class="view-container" style="display: none;">
                <div id="mapContainer" style="height: 100%; width: 100%;">
                    <!-- Hier wird die Karte geladen -->
                    <div class="map-placeholder">
                        <h3>🗺️ Kartenansicht</h3>
                        <p>Die Karte wird hier angezeigt</p>
                        <small>MAP2 Implementierung folgt...</small>
                    </div>
                </div>
            </div>     
          </main>
            
            <!-- MWF2: Dialog für Aktionsmenü -->
            <div id="actionDialog" class="dialog-overlay" style="display: none;">
                <div class="dialog-content">
                    <h3 id="dialogTitle"></h3>
                    <div class="dialog-actions">
                        <button id="deleteBtn" class="dialog-btn delete-btn">Löschen</button>
                        <button id="editBtn" class="dialog-btn edit-btn">Editieren</button>
                    </div>
                </div>
            </div>
            
            <!-- // FRM2: ERWEITERTE Dialog-Struktur mit Lokal/Remote Auswahl-->
        <div id="textDialog" class="dialog-overlay" style="display: none;">
              <div class="dialog-content">
                    <h3 id="textDialogTitle">NEUES MEDIUM</h3>
        
            <!-- FRM1: Bildauswahl-Bereich -->
            <div class="image-selection-container">
            <div class="image-preview empty" id="imagePreview">
                <span>Kein Bild ausgewählt</span>
            </div>
            <button type="button" class="image-select-btn" id="imageSelectBtn">
                📁 Bild auswählen
            </button>
            <input type="file" id="fileInput" accept="image/*" style="display: none;">
            </div>
        
        <!-- FRM2: NEU - Lokal/Remote Speicher-Auswahl -->
        <div class="storage-selection-container" id="storageContainer">
            <label class="storage-label">Speicherort:</label>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="storageType" value="local" id="radioLocal" checked>
                    <span class="radio-custom"></span>
                    <span class="radio-text">💾 Lokal speichern</span>
                </label>
                <label class="radio-option">
                    <input type="radio" name="storageType" value="remote" id="radioRemote">
                    <span class="radio-custom"></span>
                    <span class="radio-text">☁️ Remote speichern</span>
                </label>
            </div>
        </div>
        
        <!-- Titel-Eingabe -->
        <div class="text-input-container">
            <input type="text" id="titleInput" placeholder="Titel eingeben..." maxlength="50">
            <div class="error-message" id="titleError" style="display: none;">
                Titel ist erforderlich
            </div>
        </div>
        
        <!-- Dialog-Aktionen -->
        <div class="dialog-actions">
            <button id="cancelBtn" class="dialog-btn cancel-btn">Abbrechen</button>
            <button id="saveBtn" class="dialog-btn save-btn">Hinzufügen</button>
        </div>
    </div>
</div>
            <!-- FRM3: Lösch-Bestätigungs-Dialog -->
<div id="deleteConfirmDialog" class="dialog-overlay" style="display: none;">
    <div class="dialog-content delete-dialog">
        <h3>MEDIUM LÖSCHEN</h3>
        <p id="deleteMessage">Möchten Sie das Medium löschen?</p>
        <div class="dialog-actions">
            <button id="deleteAbbrechen" class="dialog-btn cancel-btn">ABBRECHEN</button>
            <button id="deleteLöschen" class="dialog-btn delete-btn">LÖSCHEN</button>
        </div>
    </div>
</div>
            <!-- FRM2: Filter Footer -->
<footer class="mwf-bottom">
    <div class="filter-footer" id="filterFooter">
        <div class="filter-container">
            <button class="filter-btn active" id="filterAll" data-filter="all">
                Alle <span class="filter-count" id="countAll">0</span>
            </button>
            <button class="filter-btn" id="filterLocal" data-filter="local">
                💾 Lokal <span class="filter-count" id="countLocal">0</span>
            </button>
            <button class="filter-btn" id="filterRemote" data-filter="remote">
                ☁️ Remote <span class="filter-count" id="countRemote">0</span>
            </button>
        </div>
    </div>
</footer>
            
            <!-- MWF4: Leseansicht -->
<div id="readingView" class="reading-view" style="display: none;">
    <header class="mwf-top">
        <h1>
            <span class="mwf-icon-arrow-back" id="backBtn"></span>
            <span id="readingTitle">MediaItem Titel</span>
        </h1>
        <button class="mwf-icon-delete" id="deleteInReadingBtn"></button>
    </header>
    
    <main class="reading-main">
        <img id="readingImage" src="" alt="" class="reading-image">
    </main>
</div>
        `;

        // MWF1: Event Listener für Sandwich-Icon (Toggle)
        const toggleBtn = this.root.querySelector('#toggleBtn');
        toggleBtn.addEventListener('click', () => {
            this.toggleContentType();
        });

        // MWF3: Event Listener für + Button (öffnet Textfeld-Dialog)
        const addBtn = this.root.querySelector('#addBtn');
        addBtn.addEventListener('click', () => {
            if (this.currentView === "medien") {
                this.showTextDialog('create');
            }
        });

        this.setupViewSwitcherListeners();

        this.setupDialogListeners();

        await this.loadArtistsData();
        await this.createTestDataIfNeeded();
        await this.loadCurrentView();
        this.setupFilterListeners();

        super.oncreate();
    }

    // ========== MWF1: NAVIGATION FUNKTIONEN ==========

    // MAP1: Event Listeners für Ansichtswechsel-Buttons
    setupViewSwitcherListeners() {
        const listViewBtn = this.root.querySelector('#listViewBtn');
        const mapViewBtn = this.root.querySelector('#mapViewBtn');

        listViewBtn.addEventListener('click', () => {
            this.switchViewMode('list');
        });

        mapViewBtn.addEventListener('click', () => {
            this.switchViewMode('map');
        });

        console.log('✅ MAP1: View switcher listeners set up');
    }

    // MAP1: Ansichtsmodus wechseln (Hauptfunktion)
    switchViewMode(newMode) {
        if (!this.availableViewModes.includes(newMode)) {
            console.error('❌ MAP1: Invalid view mode:', newMode);
            return;
        }

        if (this.currentViewMode === newMode) {
            console.log('📝 MAP1: Already in', newMode, 'mode');
            return;
        }

        console.log('🔄 MAP1: Switching from', this.currentViewMode, 'to', newMode);

        this.currentViewMode = newMode;
        this.updateViewDisplay();
        this.updateViewSwitcherButtons();

        if (newMode === 'list') {
            this.loadCurrentView();
        } else if (newMode === 'map') {
            this.loadMapView();
        }

        console.log('✅ MAP1: View mode switched to:', newMode);
    }

    // MAP1: UI für aktuelle Ansicht aktualisieren
    updateViewDisplay() {
        const listView = this.root.querySelector('#listView');
        const mapView = this.root.querySelector('#mapView');

        if (this.currentViewMode === 'list') {
            listView.style.display = 'block';
            listView.classList.add('active');
            mapView.style.display = 'none';
            mapView.classList.remove('active');
        } else if (this.currentViewMode === 'map') {
            listView.style.display = 'none';
            listView.classList.remove('active');
            mapView.style.display = 'block';
            mapView.classList.add('active');
        }

        console.log('🎨 MAP1: View display updated for mode:', this.currentViewMode);
    }

    // MAP1: Ansichtswechsel-Buttons visuell aktualisieren
    updateViewSwitcherButtons() {
        const listViewBtn = this.root.querySelector('#listViewBtn');
        const mapViewBtn = this.root.querySelector('#mapViewBtn');

        listViewBtn.classList.remove('active');
        mapViewBtn.classList.remove('active');

        if (this.currentViewMode === 'list') {
            listViewBtn.classList.add('active');
        } else if (this.currentViewMode === 'map') {
            mapViewBtn.classList.add('active');
        }

        console.log('🎯 MAP1: View switcher buttons updated');
    }

    // MAP2
    async loadMapView() {
        console.log('🗺️ MAP2: Loading real map view...');

        if (!this.mapInitialized) {
            await this.initializeMap();
        }

        await this.loadMapData();
    }

    async initializeMap() {
        const mapContainer = this.root.querySelector('#mapContainer');

        if (!document.querySelector('#leaflet-css')) {
            const css = document.createElement('link');
            css.id = 'leaflet-css';
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);

            const js = document.createElement('script');
            js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            document.head.appendChild(js);

            await new Promise(resolve => {
                js.onload = resolve;
            });
        }

        mapContainer.innerHTML = '<div id="leafletMap" style="height: 100%; width: 100%;"></div>';

        this.map = L.map('leafletMap').setView([52.5200, 13.4050], 12); // Berlin

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.mapInitialized = true;
        console.log('✅ MAP2: Map initialized');
    }

    async loadMapData() {
        if (!this.map) return;

        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        let items = [];
        if (this.currentView === "medien") {
            items = await this.readFromIndexedDB();
            items = this.filterItemsByStorageType(items);
        } else {
            items = this.artistsData || [];
        }

        items.forEach((item, index) => {
            const lat = 52.5200 + (Math.random() - 0.5) * 0.1;
            const lng = 13.4050 + (Math.random() - 0.5) * 0.1;

            const marker = L.marker([lat, lng]).addTo(this.map);

            const title = item.title || item.artist || 'Unbekannt';
            marker.bindPopup(`<strong>${title}</strong>`);

            marker.on('click', () => {
                if (this.currentView === "medien") {
                    this.showReadingView(item);
                }
            });

            this.markers.push(marker);
        });

        console.log(`✅ MAP2: ${this.markers.length} markers added`);
    }

    filterItemsByStorageType(items) {
        if (this.currentFilter === 'local') {
            return items.filter(item => !item.isRemote);
        } else if (this.currentFilter === 'remote') {
            return items.filter(item => item.isRemote);
        }
        return items;
    }

    // MWF1: Künstler-Daten aus JSON laden
    async loadArtistsData() {
        try {
            const response = await fetch('data/artists.json');
            this.artistsData = await response.json();
        } catch (error) {
            console.error("Error loading artists data:", error);

            this.artistsData = [
                {
                    img: "img/img7.png",
                    artist: "Scrambles, Anthems and...",
                    songCount: "12 SONGS",
                    date: "23. OKTOBER 2015"
                },
                {
                    img: "img/img8.png",
                    artist: "Das ewige Leben (Original...",
                    songCount: "17 SONGS",
                    date: "27. FEBRUAR 2015"
                },
                {
                    img: "img/img1.png",
                    artist: "Superluminal",
                    songCount: "10 SONGS",
                    date: "14. SEPTEMBER 2012"
                },
                {
                    img: "img/img2.png",
                    artist: "Blindside",
                    songCount: "9 SONGS",
                    date: "26. MÄRZ 2010"
                },
                {
                    img: "img/img3.png",
                    artist: "Sofa Surfers",
                    songCount: "10 SONGS",
                    date: "28. OKTOBER 2005"
                },
                {
                    img: "img/img4.png",
                    artist: "Encounters",
                    songCount: "13 SONGS",
                    date: "30. NOVEMBER 2001"
                },
                {
                    img: "img/img5.png",
                    artist: "Constructions",
                    songCount: "14 SONGS",
                    date: "30. NOVEMBER 1999"
                },
                {
                    img: "img/img1.png",
                    artist: "Prelude & Fugue",
                    songCount: "8 SONGS",
                    date: "15. APRIL 2018"
                }
            ];
        }
    }

    // MAP1: Bestehende toggleView() umbenennen
    toggleContentType() {
        if (this.currentView === "medien") {
            this.currentView = "künstler";
            this.root.querySelector('#headerTitle').textContent = "KÜNSTLER";
        } else {
            this.currentView = "medien";
            this.root.querySelector('#headerTitle').textContent = "Medien";
        }

        if (this.currentViewMode === 'list') {
            this.loadCurrentView();
        } else if (this.currentViewMode === 'map') {
            this.loadMapView();
        }
    }

    // MAP1: loadCurrentView() erweitern
    async loadCurrentView() {
        try {
            console.log('🔄 MAP1: Loading current view:', this.currentView, 'mode:', this.currentViewMode);

            // MAP1: Nur bei Listenansicht die bestehende Logik ausführen
            if (this.currentViewMode !== 'list') {
                console.log('📝 MAP1: Skipping list load - not in list mode');
                return;
            }

            const list = this.root.querySelector("#itemsList");
            list.innerHTML = "";

            const addBtn = this.root.querySelector('#addBtn');
            if (addBtn) {
                if (this.currentView === "medien") {
                    addBtn.style.display = 'block';
                    addBtn.style.visibility = 'visible';
                    console.log('✅ + Button made visible for Medien view');
                } else {
                    addBtn.style.display = 'none';
                    console.log('🔒 + Button hidden for Künstler view');
                }
            }

            if (this.currentView === "medien") {
                await this.loadMediaItems();
            } else {
                this.loadArtists();
            }

            console.log('✅ MAP1: Current view loaded:', this.currentView);

        } catch (error) {
            console.error('❌ MAP1: Error loading current view:', error);
        }
    }

    // ========== MWF1: MEDIEN FUNKTIONEN (IndexedDB) ==========

    async loadMediaItems() {
        try {
            const items = await this.readFromIndexedDB();
            console.log('🔍 Items loaded from IndexedDB:', items.length, items);

            // FRM2: Mit Filter anzeigen
            this.displayFilteredMediaItems(items);

        } catch (error) {
            console.error("Error loading MediaItems:", error);
        }
    }

    displayMediaItems(items) {
        console.log('🎨 displayMediaItems called with:', items.length, 'items');

        const list = this.root.querySelector("#itemsList");
        list.innerHTML = "";
        list.classList.remove("artist-view");

        items.forEach((item, index) => {
            console.log(`📝 Creating item ${index + 1}:`, item.title);

            const li = document.createElement("li");
            li.className = "mwf-listitem";

            li.setAttribute("data-mwf-id", item.id);

            const storageBadge = item.isRemote ?
                '<div class="storage-badge remote">☁️ Remote</div>' :
                '<div class="storage-badge local">💾 Lokal</div>';

            li.innerHTML = `
                <img src="${item.src}" alt="${item.title}" class="mwf-img-listitem">
                <div class="mwf-listitem-content">
                    <h3>${item.title}</h3>
                        <p>${new Date(item.created).toLocaleDateString()}</p>
                </div>
             ${storageBadge}
              <button class="mwf-icon-more-vert" data-item-id="${item.id}" data-type="media"></button>
`;

            li.addEventListener('click', (event) => {
                if (!event.target.classList.contains('mwf-icon-more-vert')) {
                    event.stopPropagation();
                    this.showReadingView(item);
                }
            });

            const optionsBtn = li.querySelector('.mwf-icon-more-vert');
            optionsBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.showDialog(item, 'media');
            });

            list.appendChild(li);
            console.log(`✅ Item ${index + 1} appended to list`);
        });
        console.log('🏁 displayMediaItems finished. DOM items:',
            this.root.querySelectorAll('#itemsList li').length);
    }

    // ========== MWF1: KÜNSTLER FUNKTIONEN (JSON-Daten) ==========

    loadArtists() {
        if (this.artistsData) {
            this.displayArtists(this.artistsData);
        }
    }

    displayArtists(artists) {
        const list = this.root.querySelector("#itemsList");
        list.innerHTML = "";
        list.classList.add("artist-view");

        artists.forEach((artist, index) => {
            const li = document.createElement("li");
            li.className = "mwf-listitem";
            li.setAttribute("data-mwf-id", index);
            li.innerHTML = `
                <img src="${artist.img}" alt="${artist.artist}" class="mwf-img-listitem">
                <div class="mwf-listitem-content">
                    <h3>${artist.artist}</h3>
                    <p>${artist.songCount} • ${artist.date}</p>
                </div>
                <button class="mwf-icon-more-vert" data-item-id="${index}" data-type="artist"></button>
            `;

            const optionsBtn = li.querySelector('.mwf-icon-more-vert');
            optionsBtn.addEventListener('click', (event) => {
                this.showDialog(artist, 'artist');
            });

            list.appendChild(li);
        });
    }

    // ========== MWF1: INDEXEDDB FUNKTIONEN (nur für MediaItems) ==========

    async readFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                // Store nur anlegen, wenn er noch nicht existiert
                if (!db.objectStoreNames.contains("MediaItem")) {
                    db.createObjectStore("MediaItem", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readonly");
                const store = transaction.objectStore("MediaItem");
                const getAll = store.getAll();

                getAll.onsuccess = () => {
                    resolve(getAll.result);
                };

                getAll.onerror = () => {
                    reject(getAll.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async writeToIndexedDB(item) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("MediaItem")) {
                    db.createObjectStore("MediaItem", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readwrite");
                const store = transaction.objectStore("MediaItem");

                if (item.created && !item.id) {
                    item.id = item.created;
                } else if (!item.id) {
                    // Neuer Timestamp für beide Felder
                    const timestamp = Date.now();
                    item.id = timestamp;
                    item.created = timestamp;
                }

                console.log('💾 Saving item with ID:', item.id, 'created:', item.created);

                const add = store.add(item);
                add.onsuccess = () => {
                    resolve(item);
                };
                add.onerror = () => {
                    reject(add.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // MWF1: Test-Daten erstellen - VERBESSERT mit nur vorhandenen Bildern
    async createTestDataIfNeeded() {
        try {
            const existingItems = await this.readFromIndexedDB();
            if (existingItems.length === 0) {
                const testItems = [
                    {
                        title: "Albumcover 1",
                        src: "img/img1.png",
                        created: Date.now() - 86400000,
                        id: Date.now() - 86400000  // Gleicher Wert!
                    },
                    {
                        title: "Albumcover 2",
                        src: "img/img2.png",
                        created: Date.now() - 172800000,
                        id: Date.now() - 172800000  // Gleicher Wert!
                    },
                    {
                        title: "Albumcover 3",
                        src: "img/img3.png",
                        created: Date.now() - 259200000,
                        id: Date.now() - 259200000  // Gleicher Wert!
                    },
                    {
                        title: "Musiksammlung",
                        src: "img/img4.png",
                        created: Date.now() - 345600000,
                        id: Date.now() - 345600000  // Gleicher Wert!
                    },
                    {
                        title: "Vinyl Collection",
                        src: "img/img5.png",
                        created: Date.now() - 432000000,
                        id: Date.now() - 432000000  // Gleicher Wert!
                    }
                ];

                for (let item of testItems) {
                    await this.writeToIndexedDB(item);
                }
            }
        } catch (error) {
            console.error("Error creating test data:", error);
        }
    }
    // ========== MWF2: AKTIONSMENÜ DIALOG FUNKTIONEN ==========

    setupDialogListeners() {
        const dialog = this.root.querySelector('#actionDialog');
        const deleteBtn = this.root.querySelector('#deleteBtn');
        const editBtn = this.root.querySelector('#editBtn');

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                this.closeDialog();
            }
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteItem();
        });

        editBtn.addEventListener('click', () => {
            console.log('Edit button clicked, currentDialogItem:', this.currentDialogItem);

            if (this.currentDialogItem) {
                if (this.currentDialogItem.type === 'media') {
                    try {

                        const tempItem = {
                            item: { ...this.currentDialogItem.item },
                            type: this.currentDialogItem.type
                        };

                        console.log('Saved temp item for edit:', tempItem);
                        this.closeDialog();

                        if (tempItem.item && tempItem.item.title) {
                            this.showTextDialog('edit', tempItem);
                        } else {
                            console.error('Missing item data for edit:', tempItem);
                            alert('Fehler: Item-Daten nicht vollständig');
                        }
                    } catch (error) {
                        console.error('Error in edit handler:', error);
                        alert('Fehler beim Öffnen des Bearbeitungsdialoges');
                    }
                } else if (this.currentDialogItem.type === 'artist') {
                    alert('Künstler können nicht bearbeitet werden');
                    this.closeDialog();
                }
            } else {
                console.error('No currentDialogItem available');
                alert('Fehler: Kein Item ausgewählt');
            }
        });

        this.setupTextDialogListeners();
    }

    showDialog(item, type) {
        console.log('showDialog called with:', { item, type });

        if (!item) {
            console.error('showDialog: item is null or undefined');
            return;
        }

        this.currentDialogItem = { item, type };
        const dialog = this.root.querySelector('#actionDialog');
        const title = this.root.querySelector('#dialogTitle');

        let displayTitle;
        if (type === 'media') {
            displayTitle = item.title || 'Unbekanntes Medium';
        } else {
            displayTitle = item.artist || 'Unbekannter Künstler';
        }

        title.textContent = displayTitle;
        dialog.style.display = 'flex';

        console.log('Dialog opened for:', displayTitle);
    }

    closeDialog() {
        const dialog = this.root.querySelector('#actionDialog');
        dialog.style.display = 'none';

        setTimeout(() => {
            this.currentDialogItem = null;
        }, 50);
    }

    // FRM3: Lösch-Dialog anzeigen statt direkt löschen
    async deleteItem() {
        if (!this.currentDialogItem) {
            console.error('No currentDialogItem for deletion');
            return;
        }

        const { item, type } = this.currentDialogItem;

        if (type === 'media') {

            this.closeDialog();

            this.showDeleteConfirmDialog(item);
        } else {
            alert('Künstler können nicht gelöscht werden (statische Daten)');
            this.closeDialog();
        }
    }

    async deleteFromIndexedDB(itemId) {
        return new Promise((resolve, reject) => {
            console.log('🔄 Starting IndexedDB deletion for ID:', itemId, typeof itemId);

            const request = indexedDB.open("mwftutdb", 1);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("MediaItem")) {
                    db.createObjectStore("MediaItem", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readwrite");
                const store = transaction.objectStore("MediaItem");

                const getRequest = store.get(itemId);

                getRequest.onsuccess = () => {
                    const foundItem = getRequest.result;
                    console.log('🔍 Found item for deletion:', foundItem);

                    if (foundItem) {

                        const deleteRequest = store.delete(itemId);

                        deleteRequest.onsuccess = () => {
                            console.log('✅ Item successfully deleted from IndexedDB:', itemId);
                        };

                        deleteRequest.onerror = () => {
                            console.error('❌ Delete operation failed:', deleteRequest.error);
                            reject(deleteRequest.error);
                        };
                    } else {
                        console.warn('⚠️ Item not found in IndexedDB:', itemId);

                        resolve();
                    }
                };

                getRequest.onerror = () => {
                    console.error('❌ Error finding item:', getRequest.error);
                    reject(getRequest.error);
                };

                transaction.oncomplete = () => {
                    console.log('✅ Delete transaction completed successfully');
                    resolve();
                };

                transaction.onerror = () => {
                    console.error('❌ Delete transaction failed:', transaction.error);
                    reject(transaction.error);
                };
            };

            request.onerror = () => {
                console.error('❌ Error opening IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    removeItemFromUI(itemId) {
        console.log('🗑️ Removing item from UI:', itemId);
        const listItem = this.root.querySelector(`[data-mwf-id="${itemId}"]`);
        if (listItem) {
            console.log('✅ UI element removed successfully');
            // Smooth Animation beim Entfernen
            listItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            listItem.style.opacity = '0';
            listItem.style.transform = 'translateX(-100%)';

            setTimeout(() => {
                if (listItem.parentNode) {
                    listItem.parentNode.removeChild(listItem);
                    console.log('✅ UI element removed successfully');
                }
            }, 300);
        } else {
            console.warn('⚠️ UI element not found for ID:', itemId);
            console.warn('Available elements:', this.root.querySelectorAll('[data-mwf-id]'));
        }
    }

    async debugShowAllItems() {
        try {
            const items = await this.readFromIndexedDB();
            console.log('📋 All items in IndexedDB (' + items.length + '):', items);
            items.forEach(item => {
                console.log(`- ID: ${item.id}, Title: ${item.title}, Created: ${new Date(item.created).toLocaleString()}`);
            });
            return items;
        } catch (error) {
            console.error('Error reading items:', error);
        }
    }

    async debugClearDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readwrite");
                const store = transaction.objectStore("MediaItem");
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => {
                    console.log('✅ Database cleared successfully');
                    resolve();
                };
                clearRequest.onerror = () => reject(clearRequest.error);
            };
            request.onerror = () => reject(request.error);
        });
    }


    // ========== FRM1: TEIL 3   ==========

    setupTextDialogListeners() {
        const textDialog = this.root.querySelector('#textDialog');
        const cancelBtn = this.root.querySelector('#cancelBtn');
        const saveBtn = this.root.querySelector('#saveBtn');
        const titleInput = this.root.querySelector('#titleInput');

        const imageSelectBtn = this.root.querySelector('#imageSelectBtn');
        const fileInput = this.root.querySelector('#fileInput');

        const radioLocal = this.root.querySelector('#radioLocal');
        const radioRemote = this.root.querySelector('#radioRemote');

        textDialog.addEventListener('click', (e) => {
            if (e.target === textDialog) {
                this.closeTextDialog();
            }
        });

        cancelBtn.addEventListener('click', () => {
            this.closeTextDialog();
        });

        saveBtn.addEventListener('click', () => {
            this.saveTextDialogItem();
        });

        imageSelectBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleImageSelection(e.target.files[0]);
        });

        radioLocal.addEventListener('change', () => {
            if (radioLocal.checked) {
                this.selectedStorageType = 'local';
                console.log('📁 Storage type changed to: local');
            }
        });

        radioRemote.addEventListener('change', () => {
            if (radioRemote.checked) {
                this.selectedStorageType = 'remote';
                console.log('☁️ Storage type changed to: remote');
            }
        });

        titleInput.addEventListener('input', () => {
            this.validateForm();
        });

        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveTextDialogItem();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeTextDialog();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const isTextDialogOpen = textDialog.style.display === 'flex';
                const isActionDialogOpen = this.root.querySelector('#actionDialog').style.display === 'flex';

                if (isTextDialogOpen) {
                    e.preventDefault();
                    this.closeTextDialog();
                } else if (isActionDialogOpen) {
                    e.preventDefault();
                    this.closeDialog();
                }
            }
        });
    }

// ========== FRM2: TEIL 4 ==========
    showTextDialog(mode = 'create', item = null) {
        console.log('showTextDialog called with mode:', mode, 'item:', item);

        this.isEditMode = mode === 'edit';
        this.currentDialogItem = item;

        if (item && item.item) {
            this.originalItemData = { ...item.item };
        }

        const dialog = this.root.querySelector('#textDialog');
        const title = this.root.querySelector('#textDialogTitle');
        const saveBtn = this.root.querySelector('#saveBtn');
        const titleInput = this.root.querySelector('#titleInput');
        const preview = this.root.querySelector('#imagePreview');

        const storageContainer = this.root.querySelector('#storageContainer');
        const radioLocal = this.root.querySelector('#radioLocal');
        const radioRemote = this.root.querySelector('#radioRemote');

        if (this.isEditMode) {
            if (item && item.item && item.item.title) {
                title.textContent = 'MEDIUM BEARBEITEN';
                saveBtn.textContent = 'Speichern';
                titleInput.value = item.item.title;

                storageContainer.style.display = 'none';

                if (item.item.src) {
                    this.selectedImageUrl = item.item.src;
                    this.showImagePreview(item.item.src);
                }

                console.log('Edit mode set up with title:', item.item.title);
            } else {
                console.error('Edit mode but no valid item data:', item);
                alert('Fehler: Keine gültigen Item-Daten für Bearbeitung');
                return;
            }
        } else {
            title.textContent = 'NEUES MEDIUM';
            saveBtn.textContent = 'Hinzufügen';
            titleInput.value = '';

            storageContainer.style.display = 'block';
            radioLocal.checked = true;
            radioRemote.checked = false;
            this.selectedStorageType = 'local';

            this.resetImagePreview();

            console.log('Create mode set up');
        }

        dialog.style.display = 'flex';
        this.validateForm();

        setTimeout(() => {
            titleInput.focus();
            titleInput.select();
        }, 100);
    }

    // FRM2: Bild remote hochladen
    async saveImageRemotely(file) {
        try {
            console.log('☁️ Uploading image to remote server:', file.name);

            const formData = new FormData();
            formData.append('image', file);
            formData.append('filename', file.name);

            const response = await fetch(`${this.remoteServerUrl}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                }
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Remote upload successful:', result);

            return result.url || result.imageUrl || `${this.remoteServerUrl}/images/${result.filename}`;

        } catch (error) {
            console.error('❌ Remote upload failed:', error);

            console.log('🔄 Falling back to local storage...');
            return await this.saveImagePermanently(file);
        }
    }

// FRM2: Erweiterte Bildspeicherung je nach Storage-Type
    async saveImageByStorageType(file) {
        if (this.selectedStorageType === 'remote') {
            console.log('☁️ Saving image remotely...');
            return await this.saveImageRemotely(file);
        } else {
            console.log('💾 Saving image locally...');
            return await this.saveImagePermanently(file);
        }
    }

    resetImagePreview() {
        const preview = this.root.querySelector('#imagePreview');
        const fileInput = this.root.querySelector('#fileInput');

        preview.innerHTML = '<span>Kein Bild ausgewählt</span>';
        preview.classList.add('empty');
        fileInput.value = '';
        this.selectedImageFile = null;
        this.selectedImageUrl = null;
    }

    closeTextDialog() {

        if (this.isEditMode && this.originalItemData && this.currentDialogItem) {
            console.log('🔄 Reverting changes due to cancel');
        }

        const dialog = this.root.querySelector('#textDialog');
        const titleInput = this.root.querySelector('#titleInput');

        dialog.style.display = 'none';
        titleInput.value = '';
        this.isEditMode = false;
        this.currentDialogItem = null;
        this.originalItemData = null;

        this.resetImagePreview();
    }

    async saveTextDialogItem() {
        const titleInput = this.root.querySelector('#titleInput');
        const title = titleInput.value.trim();

        if (!title) {
            alert('Bitte geben Sie einen Titel ein!');
            titleInput.focus();
            return;
        }

        if (!this.selectedImageFile && !this.selectedImageUrl) {
            alert('Bitte wählen Sie ein Bild aus!');
            return;
        }

        try {
            if (this.isEditMode && this.currentDialogItem) {
                console.log('Updating item:', this.currentDialogItem.item.id, 'with title:', title);
                await this.updateMediaItem(this.currentDialogItem.item.id, title);
            } else {
                console.log('Creating new item with title:', title);
                await this.createNewMediaItemWithImageAndTitle(title);
            }

            this.closeTextDialog();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Fehler beim Speichern!');
        }
    }

    // FRM12: Teil 6
    async createNewMediaItemWithImageAndTitle(title) {
        try {
            console.log('🔄 Creating new MediaItem with selected image and storage type:', this.selectedStorageType);

            let finalImageUrl;

            if (this.selectedImageFile) {
                finalImageUrl = await this.saveImageByStorageType(this.selectedImageFile);
            } else if (this.selectedImageUrl) {
                finalImageUrl = this.selectedImageUrl;
            } else {
                throw new Error('Kein Bild ausgewählt!');
            }

            const newItem = {
                title: title,
                src: finalImageUrl,
                created: Date.now(),
                storageType: this.selectedStorageType,
                isRemote: this.selectedStorageType === 'remote'
            };

            console.log('📝 New MediaItem with storage info:', {
                title: newItem.title,
                storageType: newItem.storageType,
                isRemote: newItem.isRemote,
                srcType: finalImageUrl.startsWith('data:') ? 'Data URL' : 'Remote URL'
            });

            await this.writeToIndexedDB(newItem);

            this.selectedImageFile = null;
            this.selectedImageUrl = null;
            this.selectedStorageType = 'local'; // Reset

            setTimeout(async () => {
                await this.loadCurrentView();
                console.log("✅ FRM2: MediaItem mit Storage-Info erstellt!");
            }, 200);

        } catch (error) {
            console.error("❌ FRM2: Error creating MediaItem with storage:", error);
            throw error;
        }
    }


// FRM2: TEIL 7
    async updateMediaItemWithImage(itemId, newTitle) {
        try {
            console.log('🔄 FRM2: Updating MediaItem with image and preserving storage type:', itemId, newTitle);

            let finalImageUrl;
            let storageType;

            const originalItem = await this.getItemFromIndexedDB(itemId);
            storageType = originalItem.storageType || 'local';

            if (this.selectedImageFile) {

                if (storageType === 'remote') {
                    finalImageUrl = await this.saveImageRemotely(this.selectedImageFile);
                } else {
                    finalImageUrl = await this.saveImagePermanently(this.selectedImageFile);
                }
            } else {

                finalImageUrl = this.selectedImageUrl;
            }

            await this.updateInIndexedDBWithImageAndStorage(itemId, newTitle, finalImageUrl, storageType);

            setTimeout(async () => {
                await this.loadCurrentView();
                console.log('✅ FRM2: MediaItem updated with preserved storage type:', storageType);
            }, 200);

        } catch (error) {
            console.error('❌ FRM2: Error updating MediaItem with storage:', error);
            throw error;
        }
    }

    // FRM2: Hilfsmethode um Item aus IndexedDB zu holen
    async getItemFromIndexedDB(itemId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readonly");
                const store = transaction.objectStore("MediaItem");
                const getRequest = store.get(itemId);

                getRequest.onsuccess = () => {
                    resolve(getRequest.result);
                };

                getRequest.onerror = () => {
                    reject(getRequest.error);
                };
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // FRM2: Update in IndexedDB mit Storage-Info
    async updateInIndexedDBWithImageAndStorage(itemId, newTitle, newImageUrl, storageType) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readwrite");
                const store = transaction.objectStore("MediaItem");

                const getRequest = store.get(itemId);

                getRequest.onsuccess = () => {
                    const item = getRequest.result;
                    if (item) {
                        item.title = newTitle;
                        item.src = newImageUrl;
                        item.storageType = storageType;
                        item.isRemote = storageType === 'remote';

                        const updateRequest = store.put(item);
                        updateRequest.onsuccess = () => resolve();
                        updateRequest.onerror = () => reject(updateRequest.error);
                    } else {
                        reject(new Error('Item not found'));
                    }
                };

                getRequest.onerror = () => reject(getRequest.error);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // FRM1: Update in IndexedDB mit Bild
    async updateInIndexedDBWithImage(itemId, newTitle, newImageUrl) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readwrite");
                const store = transaction.objectStore("MediaItem");

                const getRequest = store.get(itemId);

                getRequest.onsuccess = () => {
                    const item = getRequest.result;
                    if (item) {
                        item.title = newTitle;
                        item.src = newImageUrl; // FRM1: Bild auch aktualisieren

                        const updateRequest = store.put(item);
                        updateRequest.onsuccess = () => resolve();
                        updateRequest.onerror = () => reject(updateRequest.error);
                    } else {
                        reject(new Error('Item not found'));
                    }
                };

                getRequest.onerror = () => reject(getRequest.error);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async createNewMediaItemWithTitle(title) {
        try {
            const availableImages = [
                "img/img1.png",
                "img/img2.png",
                "img/img3.png",
                "img/img4.png",
                "img/img5.png"
            ];

            let hash = 0;
            for (let i = 0; i < title.length; i++) {
                const char = title.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }

            const imageIndex = Math.abs(hash % availableImages.length);

            const newItem = {
                title: title,
                src: availableImages[imageIndex],
                created: Date.now()
            };

            await this.writeToIndexedDB(newItem);

            setTimeout(async () => {
                await this.loadCurrentView();
                console.log("✅ Neues MediaItem erstellt und UI aktualisiert:", newItem);
            }, 200);

        } catch (error) {
            console.error("❌ Error creating new MediaItem:", error);
            throw error;
        }
    }

    async updateMediaItem(itemId, newTitle) {
        try {
            console.log('🔄 Updating MediaItem:', itemId, 'with title:', newTitle);

            if (!itemId) {
                throw new Error('Item ID is required for update');
            }

            if (!newTitle || newTitle.trim() === '') {
                throw new Error('Title is required for update');
            }

            await this.updateInIndexedDB(itemId, newTitle);

            setTimeout(async () => {
                await this.loadCurrentView();
                console.log('✅ MediaItem successfully updated and UI refreshed:', itemId, newTitle);
            }, 200);

        } catch (error) {
            console.error('❌ Error updating MediaItem:', error);
            throw error;
        }
    }

    async updateInIndexedDB(itemId, newTitle) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("mwftutdb", 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["MediaItem"], "readwrite");
                const store = transaction.objectStore("MediaItem");

                const getRequest = store.get(itemId);

                getRequest.onsuccess = () => {
                    const item = getRequest.result;
                    if (item) {
                        item.title = newTitle;
                        const updateRequest = store.put(item);

                        updateRequest.onsuccess = () => resolve();
                        updateRequest.onerror = () => reject(updateRequest.error);
                    } else {
                        reject(new Error('Item not found'));
                    }
                };

                getRequest.onerror = () => reject(getRequest.error);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // ========== MWF4: LESEANSICHT FUNKTIONEN ==========

    showReadingView(item) {
        console.log('📖 Opening reading view for:', item);

        const mainElement = this.root.querySelector('main');
        const headerElement = this.root.querySelector('header');

        mainElement.style.display = 'none';
        headerElement.style.display = 'none';

        const readingView = this.root.querySelector('#readingView');
        const readingTitle = this.root.querySelector('#readingTitle');
        const readingImage = this.root.querySelector('#readingImage');

        readingTitle.textContent = item.title;
        readingImage.src = item.src;
        readingImage.alt = item.title;
        readingView.style.display = 'flex';

        this.setupReadingViewListeners(item);

        console.log('✅ Reading view opened successfully');
    }

    setupReadingViewListeners(item) {
        console.log('🔧 Setting up reading view listeners for:', item);

        const backBtn = this.root.querySelector('#backBtn');
        const deleteInReadingBtn = this.root.querySelector('#deleteInReadingBtn');

        if (!backBtn) {
            console.error('❌ Back button not found!');
            return;
        }
        if (!deleteInReadingBtn) {
            console.error('❌ Delete button not found!');
            return;
        }

        const controller = this;

        backBtn.onclick = null;
        deleteInReadingBtn.onclick = null;

        backBtn.onclick = function() {
            console.log('🔙 Back button clicked');

            const readingView = document.querySelector('#readingView');
            const mainElement = document.querySelector('main');
            const headerElement = document.querySelector('header');
            const addBtn = document.querySelector('#addBtn');

            if (readingView) readingView.style.display = 'none';
            if (mainElement) mainElement.style.display = 'block';
            if (headerElement) headerElement.style.display = 'flex';
            if (addBtn) {
                addBtn.style.display = 'flex';
                addBtn.style.visibility = 'visible';
            }

            controller.loadCurrentView();

            console.log('✅ Back navigation completed');
        };

        // FRM3: DELETE-BUTTON mit Bestätigungs-Dialog
        deleteInReadingBtn.onclick = function() {
            console.log('🗑️ Delete button clicked in reading view for:', item);

            const readingView = document.querySelector('#readingView');
            const mainElement = document.querySelector('main');
            const headerElement = document.querySelector('header');
            const addBtn = document.querySelector('#addBtn');

            if (readingView) readingView.style.display = 'none';
            if (mainElement) mainElement.style.display = 'block';
            if (headerElement) headerElement.style.display = 'block';
            if (addBtn) {
                addBtn.style.display = 'block';
                addBtn.style.visibility = 'visible';
            }

            controller.showDeleteConfirmDialog(item);
        };

        console.log('✅ Reading view listeners set up successfully');
    }


        closeReadingView() {
            console.log('🔙 Closing reading view');

            const readingView = this.root.querySelector('#readingView');
            readingView.style.display = 'none';

            const mainElement = this.root.querySelector('main');
            const headerElement = this.root.querySelector('header');

            mainElement.style.display = 'block';
            headerElement.style.display = 'flex';

            const addBtn = this.root.querySelector('#addBtn');
            if (addBtn) {
                addBtn.style.display = 'block';
                addBtn.style.visibility = 'visible';
                addBtn.style.width      = '';
            }

            const headerTitle = this.root.querySelector('#headerTitle');
            if (headerTitle) {
                if (this.currentView === "medien") {
                    headerTitle.textContent = "Medien";
                } else {
                    headerTitle.textContent = "KÜNSTLER";
                }
            }
            console.log('✅ Reading view closed, main view restored');
        }

// FRM1: Bildauswahl verarbeiten
    handleImageSelection(file) {
        if (!file) return;

        console.log('🖼️ Image selected:', file.name, file.size, 'bytes');

        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedImageUrl = e.target.result;
            this.showImagePreview(e.target.result);

            this.autoFillTitleFromFilename(file.name);
            this.validateForm();
        };

        reader.readAsDataURL(file);
        this.selectedImageFile = file;
    }

// FRM1: Bildvorschau anzeigen
    showImagePreview(imageSrc) {
        const preview = this.root.querySelector('#imagePreview');
        preview.innerHTML = `<img src="${imageSrc}" alt="Vorschau" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
        preview.classList.remove('empty');
        console.log('✅ Image preview updated');
    }

// FRM1: Titel automatisch aus Dateinamen setzen
    autoFillTitleFromFilename(filename) {
        const titleInput = this.root.querySelector('#titleInput');

        if (!titleInput.value.trim() && filename) {

            const title = filename.replace(/\.[^/.]+$/, "");
            titleInput.value = title;
            console.log('📝 Auto-filled title from filename:', title);
            this.validateForm();
        }
    }

    // FRM1: Formular-Validierung (Anforderung 5)
    validateForm() {
        const titleInput = this.root.querySelector('#titleInput');
        const saveBtn = this.root.querySelector('#saveBtn');
        const titleError = this.root.querySelector('#titleError');

        const hasTitle = titleInput.value.trim().length > 0;
        const hasImage = this.selectedImageFile !== null || this.selectedImageUrl !== null;

        console.log('🔍 Form validation check:', {
            hasTitle,
            hasImage,
            selectedFile: this.selectedImageFile?.name || 'none',
            selectedUrl: this.selectedImageUrl ? 'present' : 'none',
            titleValue: titleInput.value.trim()
        });

        saveBtn.disabled = !(hasTitle && hasImage);

        if (!hasTitle && titleInput.value.length > 0) {
            titleInput.classList.add('error');
            if (titleError) titleError.style.display = 'block';
        } else {
            titleInput.classList.remove('error');
            if (titleError) titleError.style.display = 'none';
        }

        if (hasTitle && hasImage) {
            saveBtn.style.background = '#4CAF50';
            saveBtn.style.cursor = 'pointer';
        } else {
            saveBtn.style.background = '#ccc';
            saveBtn.style.cursor = 'not-allowed';
        }
    }

// FRM1: Bild dauerhaft speichern
    async saveImagePermanently(file) {
        return new Promise((resolve) => {
            console.log('📸 Saving image permanently:', file.name, file.size, 'bytes');

            const reader = new FileReader();
            reader.onload = (e) => {
                const savedUrl = e.target.result;
                console.log('✅ Image converted to Data URL, size:', savedUrl.length, 'characters');
                resolve(savedUrl);
            };
            reader.onerror = (e) => {
                console.error('❌ Error reading file:', e);
                resolve(null);
            };
            reader.readAsDataURL(file);
        });
    }

    // FRM2: Filter Event Listeners setup
    setupFilterListeners() {
        const filterAll = this.root.querySelector('#filterAll');
        const filterLocal = this.root.querySelector('#filterLocal');
        const filterRemote = this.root.querySelector('#filterRemote');

        filterAll.addEventListener('click', () => this.setFilter('all'));
        filterLocal.addEventListener('click', () => this.setFilter('local'));
        filterRemote.addEventListener('click', () => this.setFilter('remote'));
    }

    // FRM2: Filter setzen
    setFilter(filterType) {
        console.log('🔍 Setting filter to:', filterType);

        this.currentFilter = filterType;

        this.updateFilterButtons();

        this.loadCurrentView();
    }

// FRM2: Filter-Buttons visuell aktualisieren
    updateFilterButtons() {
        const filterButtons = this.root.querySelectorAll('.filter-btn');

        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            }
        });
    }

// FRM2: Items nach Filter anzeigen
    displayFilteredMediaItems(items) {
        let filteredItems = items;

        if (this.currentFilter === 'local') {
            filteredItems = items.filter(item => !item.isRemote);
        } else if (this.currentFilter === 'remote') {
            filteredItems = items.filter(item => item.isRemote);
        }

        console.log(`🔍 Filtered items (${this.currentFilter}):`, filteredItems.length, 'of', items.length);

        this.updateFilterCounts(items);

        this.displayMediaItems(filteredItems);
    }

// FRM2: Filter-Counts aktualisieren
    updateFilterCounts(allItems) {
        const localCount = allItems.filter(item => !item.isRemote).length;
        const remoteCount = allItems.filter(item => item.isRemote).length;

        this.root.querySelector('#countAll').textContent = allItems.length;
        this.root.querySelector('#countLocal').textContent = localCount;
        this.root.querySelector('#countRemote').textContent = remoteCount;
    }

    // FRM3: Lösch-Bestätigungs-Dialog anzeigen
    showDeleteConfirmDialog(item) {
        console.log('🗑️ Showing delete confirmation for:', item.title);

        const dialog = this.root.querySelector('#deleteConfirmDialog');
        const message = this.root.querySelector('#deleteMessage');

        message.textContent = `Möchten Sie das Medium "${item.title}" wirklich löschen?`;
        dialog.style.display = 'flex';

        this.setupDeleteConfirmListeners(item);
    }

// FRM3: Event Listeners für Bestätigungs-Dialog
    setupDeleteConfirmListeners(item) {
        const dialog = this.root.querySelector('#deleteConfirmDialog');
        const abbrechenBtn = this.root.querySelector('#deleteAbbrechen');
        const löschenBtn = this.root.querySelector('#deleteLöschen');

        abbrechenBtn.onclick = null;
        löschenBtn.onclick = null;

        abbrechenBtn.onclick = () => {
            console.log('❌ Delete cancelled');
            dialog.style.display = 'none';
        };

        löschenBtn.onclick = async () => {
            console.log('✅ Delete confirmed');
            dialog.style.display = 'none';

            await this.performActualDelete(item);
        };

        dialog.onclick = (e) => {
            if (e.target === dialog) {
                dialog.style.display = 'none';
            }
        };
    }

// FRM3: Tatsächliches Löschen durchführen
    async performActualDelete(item) {
        try {
            console.log('🔄 Starting confirmed deletion process for:', item);

            this.removeItemFromUI(item.id);
            await this.deleteFromIndexedDB(item.id);

            setTimeout(async () => {
                await this.loadCurrentView();
            }, 1000);

            console.log('✅ Confirmed deletion process finished');

        } catch (error) {
            console.error('❌ Error during confirmed deletion:', error);
            await this.loadCurrentView();
            alert('Fehler beim Löschen: ' + error.message);
        }
    }
}

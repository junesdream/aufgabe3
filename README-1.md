# Aufgabe 3: FRM, MAP - Form Management & Kartenansicht

## Projektstruktur

```
aufgabe3/
├── dist/                           # Build-Verzeichnis
├── node_modules/                   # Dependencies (nicht in Abgabe)
├── src/
│   ├── css/
│   │   ├── myapp-style.css        # Haupt-Stylesheet + MAP CSS
│   │   └── myapp-theme.css        # Theme-Definitionen
│   ├── data/
│   │   ├── artists.json           # Künstler-Daten
│   │   └── media.json             # Media-Daten
│   ├── img/                       # Bildressourcen für MediaItems
│   └── js/
│       ├── controller/
│       │   ├── MyInitialViewController.js  # Haupt-Controller (FRM + MAP)
│       │   └── ViewControllerTemplate.js   # Template
│       └── model/
│           ├── Main.js            # Hauptanwendung
│           └── MyApplication.js   # App-Konfiguration
├── pwa/
│   ├── app.html                   # Haupt-HTML
│   ├── offline.manifest           # Offline-Funktionalität
│   └── OfflineCacheServiceWorker.js # Service Worker
├── .gitignore
├── LICENSE
├── package.json                   # NPM-Konfiguration
├── package-lock.json             # Dependency-Lock
└── README.md                     # Diese Datei
```

## Implementierte FRM & MAP Funktionen

### FRM1: Bildauswahl und Vorschau ✅
- **Datei:** `src/js/controller/MyInitialViewController.js`
- **Funktionen:**
    - File-Input für Bildauswahl
    - Live-Bildvorschau
    - Automatische Titel-Generierung aus Dateinamen
    - Data-URL Konvertierung für permanente Speicherung

### FRM2: Lokal/Remote Speicher-Management ✅
- **Datei:** `src/js/controller/MyInitialViewController.js`
- **Funktionen:**
    - Radio-Button Auswahl: Lokal vs. Remote
    - Remote-Upload zu Server (mit Fallback)
    - Storage-Type Erhaltung bei Bearbeitung
    - Filter nach Speicher-Typ (Footer-Buttons)

### FRM3: Erweiterte Lösch-Funktionalität ✅
- **Datei:** `src/js/controller/MyInitialViewController.js`
- **Funktionen:**
    - Bestätigungs-Dialog vor Löschung
    - Löschung aus Leseansicht möglich
    - UI-Animation beim Entfernen
    - Sichere IndexedDB-Operationen

### MAP1: Alternative Hauptansicht ✅
- **Datei:** `src/js/controller/MyInitialViewController.js`
- **Funktionen:**
    - View-Switcher Buttons in Kopfzeile
    - Wechsel zwischen Listen- und Kartenansicht
    - Ressourcenschonende Implementierung
    - Erhaltung des Content-Types (Medien/Künstler)

### MAP2: Leaflet Kartenansicht ✅
- **Datei:** `src/js/controller/MyInitialViewController.js`
- **Funktionen:**
    - Dynamisches Laden von Leaflet CSS/JS
    - OpenStreetMap Integration
    - Marker für MediaItems mit zufälligen Berlin-Koordinaten
    - Popup-Anzeige mit MediaItem-Titeln
    - Click-to-Reading-View Navigation

## Technische Details

### Formular-Management (FRM)
- **Bildverarbeitung:** FileReader API für Data-URLs
- **Validierung:** Titel + Bild erforderlich
- **Storage:** Unterscheidung lokal/remote mit Flags
- **UX:** Live-Vorschau und Auto-Fill Funktionen

### Kartenintegration (MAP)
- **Library:** Leaflet 1.9.4 (dynamisch geladen)
- **Kartenbasis:** OpenStreetMap Tiles
- **Koordinaten:** Berlin-Bereich (52.52, 13.405) mit Randomisierung
- **Interaktion:** Marker-Clicks öffnen Leseansicht

### Datenspeicherung
- **IndexedDB** mit Storage-Type Flags
- **Remote Server** Upload mit Fallback zu lokal
- **Filter-System** nach Speicherort
- **Persistenz** zwischen Sessions

## Installation und Ausführung

### Entwicklung
1. Projekt entpacken
2. Browser öffnen: `pwa/app.html`
3. Alle FRM/MAP Funktionen testen

### Features testen
1. **FRM:** Neues Medium mit Bild hinzufügen
2. **Storage:** Lokal/Remote Auswahl testen
3. **MAP:** Kartenansicht aktivieren (🗺️ Button)
4. **Filter:** Footer-Buttons für Lokal/Remote

## Browser-Kompatibilität

- ✅ **Chrome** (Desktop & Mobile) - Vollständig
- ✅ **Firefox** (Desktop & Mobile) - Vollständig
- ✅ **Safari** (Desktop & Mobile) - Vollständig
- ⚠️ **Internet Explorer** - Nicht unterstützt (IndexedDB/Leaflet)

## Externe Dependencies

### Leaflet (dynamisch geladen)
- **Version:** 1.9.4
- **CDN:** unpkg.com
- **Verwendung:** Kartenansicht (MAP2)

### OpenStreetMap
- **Tiles:** tile.openstreetmap.org
- **Attribution:** © OpenStreetMap Contributors

## FRM/MAP Features im Detail

### Bildauswahl (FRM1)
- Datei-Browser Integration
- Sofortige Vorschau
- Größen-optimierte Anzeige
- Permanente Data-URL Speicherung

### Storage-Management (FRM2)
- Intelligente Lokal/Remote Unterscheidung
- Server-Upload mit Error-Handling
- Visual Badges (💾/☁️) in Listen
- Filter-Funktionalität

### Lösch-Sicherheit (FRM3)
- Zweistufiger Lösch-Prozess
- Bestätigungs-Dialoge
- Multiple Einstiegspunkte (Liste/Leseansicht)

### Kartennavigation (MAP1/MAP2)
- Nahtloser View-Wechsel
- Marker-basierte MediaItem Darstellung
- Berlin-Fokus mit Verteilung
- Touch-optimierte Bedienung


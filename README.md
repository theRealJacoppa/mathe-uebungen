# Mathe üben

Übungsseiten für den Mathematikunterricht (Klasse 5). Läuft im Browser, ohne Anmeldung,
ohne Tracking und auch offline (ganzen Ordner herunterladen und `index.html` öffnen).

## Aufbau

```
index.html          Startseite mit Kacheln
vorlage/design.css  Design für alle Übungen
vorlage/uebung.js   Ablauf für alle Übungen (Level, Serie, Rückmeldung, Grafik)
themen/*.js         Inhalt pro Thema (Einheiten, Umrechnungszahlen, Level)
laengen/, gewichte/ Kleine Seite pro Thema, lädt Vorlage und Thema
```

Änderungen in `vorlage/` gelten für alle Themen.

## Neues Thema

1. `themen/neu.js` anlegen (zum Beispiel `laengen.js` kopieren und anpassen).
2. Ordner `neu/` mit `index.html` anlegen (zum Beispiel `laengen/index.html` kopieren,
   `laengen` durch `neu` ersetzen).
3. Kachel in `index.html` ergänzen.

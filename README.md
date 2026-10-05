# Mathe üben

Übungsseiten für den Mathematikunterricht (Klasse 5). Läuft im Browser, ohne Anmeldung,
ohne Tracking und auch offline (ganzen Ordner herunterladen und `index.html` öffnen).

Online: https://therealjacoppa.github.io/mathe-uebungen/

## Aufbau

```
index.html               Startseite (Kacheln aus themen/liste.js)
vorlage/design.css       Design für alle Übungen
vorlage/uebung.js        Ablauf und Aufgabentypen für alle Übungen
vorlage/thema-vorlage.js Muster mit allen Einstellungen einer Übung
themen/<id>.js           Inhalt und Einstellungen einer Übung
themen/liste.js          Welche Übungen auf der Startseite stehen
<id>/index.html          Seite einer Übung (lädt Vorlage und Thema)
```

Änderungen in `vorlage/` gelten für alle Übungen.
Eine neue Übung erstellen: siehe [NEUE-UEBUNG.md](NEUE-UEBUNG.md).

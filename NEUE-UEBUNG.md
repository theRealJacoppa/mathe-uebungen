# Neue Übung erstellen

Diese Anleitung ist für Claude und für Menschen.
Ziel: In einem neuen Chat in wenigen Schritten eine neue Übung erstellen.

## So startest du einen neuen Chat

Öffne in Claude Code den Ordner `mathe-uebungen` und schreibe zum Beispiel:

> Neue Übung: Zeit umrechnen (s, min, h, d). 3 Level: Eingabe runter, Eingabe hoch,
> Mehrfachauswahl. 15 insgesamt richtig zum Weiterkommen. Farbe: Rot.

Claude liest dann automatisch `CLAUDE.md` und diese Anleitung.

## Schritte (für Claude)

1. **Thema anlegen:** `vorlage/thema-vorlage.js` nach `themen/<id>.js` kopieren und ausfüllen.
   Alle Einstellungen sind dort erklärt.
2. **Seite anlegen:** `laengen/index.html` nach `<id>/index.html` kopieren.
   Darin `laengen` durch `<id>` und den Titel ersetzen.
3. **Startseite:** `<id>` in `themen/liste.js` ergänzen.
4. **Testen:** Lokal mit einem Webserver aus dem Ordner (z. B. `python3 -m http.server`)
   – alle Level durchspielen, Freischalten prüfen, auf 1280×720 ohne Scrollen,
   auf dem Handy lesbar.
5. **Hochladen:** committen und pushen. GitHub Pages aktualisiert sich nach etwa 1 Minute.
   Adresse: `https://therealjacoppa.github.io/mathe-uebungen/<id>/`

## Was pro Übung einstellbar ist

| Einstellung | Bedeutung |
|---|---|
| `titel`, `untertitel` | Überschrift und Zeile auf der Kachel |
| `farbe` | Akzentfarbe der Übung (jede Übung eine eigene) |
| `einheiten`, `faktoren` | Inhalt zum Umrechnen; die Grafik entsteht daraus automatisch |
| `grenze`, `zahlenBis` | Wie groß die Zahlen werden |
| `merksatz`, `grafik`, `hilfe` | Hilfe anpassen, ausblenden oder pro Level verstecken |
| `freischalten` | Level nacheinander freischalten oder alle offen |
| `ziel` | Anzahl richtiger Antworten, „in Folge“ oder „insgesamt“ (auch pro Level) |
| `level` | Beliebig viele; pro Level ein oder mehrere Aufgabentypen |
| `lob` | Eigene Lob-Wörter |

## Aufgabentypen

| Typ | Beispiel |
|---|---|
| `eingabe` | 4 cm = [ ] mm |
| `auswahl` | 500 cm = ? – mehrere Antworten ankreuzen |

Ein neuer Typ (z. B. Zuordnen, Schätzen, Lückentext) wird **einmal** in
`vorlage/uebung.js` im Bereich `AUFGABENTYPEN` gebaut. Danach kann ihn jede Übung benutzen.

## Regeln für alle Übungen

- Zielgruppe: Klasse 5, viele Schüler ohne Deutsch als Muttersprache.
  **Sehr einfache Sprache:** kurze Sätze, bekannte Wörter, keine Nebensätze, wenig Text.
- Keine externen Dateien, keine CDNs, keine Webschriften, kein Tracking, keine Anmeldung.
  Alles muss offline funktionieren.
- Nur ganze Zahlen, außer es ist ausdrücklich anders gewünscht.
- Große Zahlen in Dreiergruppen mit Leerzeichen (10 000). Eingabe ignoriert Leerzeichen und Punkte.
- Tastatur: Enter = prüfen, Enter = nächste Aufgabe.
- Farben: Akzentfarbe der Übung, Lila `#534AB7` für „geteilt“, Orange `#BA7517` für „mal“, sonst Grau.
- Design-Änderungen nur in `vorlage/` – sie gelten dann für alle Übungen.

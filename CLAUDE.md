# Mathe üben – Hinweise für Claude

Übungsseiten für Mathe Klasse 5, veröffentlicht mit GitHub Pages:
https://therealjacoppa.github.io/mathe-uebungen/ (Repository theRealJacoppa/mathe-uebungen, Branch main).

- Antworte auf Deutsch.
- **Neue Übung gewünscht?** Folge `NEUE-UEBUNG.md`. Alle Einstellungen stehen in
  `vorlage/thema-vorlage.js`. Fehlen Angaben (Level, Ziel, Farbe), wähle sinnvolle Werte,
  nenne sie kurz und frage nur, wenn etwas wirklich unklar ist.
- **Jede Übung ist eigenständig:** eigene Akzentfarbe, eigene Level, eigenes Ziel.
  Einstellungen einer Übung nicht an eine andere angleichen.
- **Design oder Ablauf ändern** nur in `vorlage/design.css` und `vorlage/uebung.js` –
  das betrifft alle Übungen, also danach alle Übungen kurz testen.
- Neue Aufgabentypen als Baustein im Bereich `AUFGABENTYPEN` in `vorlage/uebung.js`,
  dann in `vorlage/thema-vorlage.js` und `NEUE-UEBUNG.md` dokumentieren.
- Vor dem Hochladen im Browser testen (lokaler Webserver; `file://` lädt die Skripte
  in der Vorschau nicht). Prüfen: alle Level, Freischalten, kein Scrollen bei 1280×720,
  Handy-Ansicht.
- Kein Build-Schritt, keine Abhängigkeiten. Einfaches JavaScript, das auch auf älteren
  Schul-PCs läuft.

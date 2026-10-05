/* =============================================================
   MUSTER FÜR EINE NEUE ÜBUNG – alle Einstellungen mit Erklärung.
   Diese Datei wird nicht geladen. Für eine neue Übung:
   kopieren nach themen/<id>.js und anpassen.
   Nur "id", "titel" und "level" sind Pflicht.
   ============================================================= */
window.THEMA = {

  // ---------- Grunddaten ----------

  id: "beispiel",                 // kurz, ohne Leerzeichen und Umlaute; gleich wie Datei- und Ordnername
  titel: "Beispiel umrechnen",    // Überschrift der Seite und der Kachel
  untertitel: "a · b · c",        // kleine Zeile auf der Kachel der Startseite

  // Akzentfarbe der Übung: Knöpfe, Kästen, Punkte, Lob.
  // Jede Übung bekommt eine eigene Farbe. Dunkel genug für weiße Schrift.
  farbe: "#0F6E56",
  // farbeHell: "#E1F5EE",        // optional: Füllung der Kästen; sonst automatisch aus "farbe"
  // farbeSchrift: "#0B5241",     // optional: Schrift in den Kästen der Grafik; sonst "farbe"
  // Passt die Übung zu einem Hefteintrag, die Farben von dort übernehmen.

  // ---------- Inhalt (für Aufgaben zum Umrechnen) ----------

  einheiten: ["mm", "cm", "dm", "m", "km"],   // von klein nach groß
  faktoren: [10, 10, 10, 1000],               // Umrechnungszahl zwischen Nachbarn

  grenze: 100000,                 // größte Zahl in Aufgabe und Ergebnis (Standard 100 000)
  zahlenBis: 99,                  // größte "kleine" Zahl, z. B. 99 km (Standard 99)

  // ---------- Hilfe (linke Spalte) ----------

  // grafik: false,               // Grafik mit Bögen ausblenden
  // merksatz: false,             // Merksatz ausblenden
  // merksatz: "<p>Eigener Text mit <span class=\"lila\">lila</span> und <span class=\"orange\">orange</span></p>",
  hilfe: "an",                    // Standard für alle Level: "an" | "aus" (versteckt) | "keine" (kein Knopf)

  // ---------- Fortschritt ----------

  freischalten: true,             // true: Level nacheinander freischalten; false: alle Level offen
  ziel: { anzahl: 10, art: "folge" },   // "folge" = in Folge richtig, "gesamt" = insgesamt richtig

  // lob: ["Super!", "Richtig!", "Sehr gut!"],   // eigene Lob-Wörter

  // ---------- Level ----------
  // Beliebig viele. Jedes Level hat eine oder mehrere Aufgaben-Arten.
  // Bei mehreren wird jedes Mal zufällig eine gewählt.
  // Pro Level kann man "ziel" und "hilfe" überschreiben.

  level: [
    // Eingabe, eine Stufe zur kleineren Einheit: 4 cm = [ ] mm
    { typ: "eingabe", stufen: [1], richtung: "runter" },

    // Eingabe, eine Stufe zur größeren Einheit: 70 mm = [ ] cm
    { typ: "eingabe", stufen: [1], richtung: "hoch" },

    // Gemischt aus mehreren Aufgaben-Arten
    { aufgaben: [
        { typ: "eingabe", stufen: [1], richtung: "runter" },
        { typ: "eingabe", stufen: [1], richtung: "hoch" }
      ] },

    // Mehrere Stufen, eigene Zahlengrenze, 15 insgesamt richtig, Hilfe am Anfang versteckt
    { typ: "eingabe", stufen: [2, 3], richtung: "beide", grenze: 100000,
      ziel: { anzahl: 15, art: "gesamt" }, hilfe: "aus" },

    // Mehrfachauswahl: 4 Antworten, davon 1 bis 4 richtig (Liste = Häufigkeit)
    { typ: "auswahl", optionen: 4, richtig: [1, 1, 2, 2, 2, 3, 3, 4], grenze: 1000000 }
  ]
};

/* ---------- Aufgabentypen ----------

   "eingabe"   Zahl eintippen.            4 cm = [   ] mm
               stufen:    [1] | [2] | [2, 3] …   Abstand der Einheiten
               richtung:  "runter" (zur kleineren Einheit) | "hoch" | "beide"
               grenze, zahlenBis: wie oben, nur für dieses Level

   "auswahl"   Ankreuzen, mehrere richtig. 500 cm = ?  [ ] 5 m  [ ] 50 dm …
               optionen:  Anzahl der Antworten (Standard 4)
               richtig:   Liste möglicher Anzahlen richtiger Antworten
               grenze:    größte Zahl in den Antworten

   Weitere Typen (z. B. Zuordnen, Schätzen, Lückentext) werden in
   vorlage/uebung.js im Bereich AUFGABENTYPEN ergänzt.
*/

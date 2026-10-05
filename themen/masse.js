/* Übung: Masse umrechnen
   Alle Einstellungen erklärt: vorlage/thema-vorlage.js */
window.THEMA = {
  id: "masse",
  titel: "Masse umrechnen",
  untertitel: "mg · g · kg · t",
  // Farben wie im Hefteintrag "Masse umrechnen"
  farbe: "#993C1D",
  farbeHell: "#FAECE7",
  farbeSchrift: "#712B13",

  einheiten: ["mg", "g", "kg", "t"],
  faktoren: [1000, 1000, 1000],

  freischalten: true,
  ziel: { anzahl: 10, art: "folge" },
  hilfe: "an",

  level: [
    // 1: Eine Stufe zur kleineren Einheit (6 kg = ? g)
    { typ: "eingabe", stufen: [1], richtung: "runter" },
    // 2: Eine Stufe zur größeren Einheit (8000 mg = ? g)
    { typ: "eingabe", stufen: [1], richtung: "hoch" },
    // 3: Zwei Stufen (7 t = ? g), Zahlen bis 9 000 000
    { typ: "eingabe", stufen: [2], richtung: "beide", grenze: 9000000 },
    // 4: Mehrfachauswahl, 1 oder 2 Antworten richtig
    //    (3 richtige bräuchten 1 t = 1 000 000 000 mg)
    { typ: "auswahl", optionen: 4, richtig: [1, 2], grenze: 9000000 }
  ]
};

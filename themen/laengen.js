/* Thema: Längen umrechnen
   Nur Inhalt – Design und Ablauf kommen aus vorlage/. */
window.THEMA = {
  id: "laengen",
  titel: "Längen umrechnen",

  // Einheiten von klein nach groß
  einheiten: ["mm", "cm", "dm", "m", "km"],
  // Umrechnungszahlen zwischen den Nachbarn: mm–cm, cm–dm, dm–m, m–km
  faktoren: [10, 10, 10, 1000],

  level: [
    // 1: Eine Stufe zur kleineren Einheit (4 cm = ? mm)
    { typ: "eingabe", stufen: [1], richtung: "runter" },
    // 2: Eine Stufe zur größeren Einheit (70 mm = ? cm)
    { typ: "eingabe", stufen: [1], richtung: "hoch" },
    // 3: Zwei oder drei Stufen (3 m = ? cm)
    { typ: "eingabe", stufen: [2, 3], richtung: "beide" },
    // 4: Mehrfachauswahl, 1 bis 4 Antworten richtig
    { typ: "auswahl", richtig: [1, 1, 2, 2, 2, 3, 3, 4], grenze: 1000000 }
  ]
};

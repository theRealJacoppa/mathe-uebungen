/* Thema: Gewichte umrechnen
   Nur Inhalt – Design und Ablauf kommen aus vorlage/. */
window.THEMA = {
  id: "gewichte",
  titel: "Gewichte umrechnen",

  // Einheiten von klein nach groß
  einheiten: ["mg", "g", "kg", "t"],
  // Umrechnungszahlen zwischen den Nachbarn: mg–g, g–kg, kg–t
  faktoren: [1000, 1000, 1000],

  level: [
    // 1: Eine Stufe zur kleineren Einheit (6 kg = ? g)
    { typ: "eingabe", stufen: [1], richtung: "runter" },
    // 2: Eine Stufe zur größeren Einheit (8000 mg = ? g)
    { typ: "eingabe", stufen: [1], richtung: "hoch" },
    // 3: Zwei Stufen (7 t = ? g), Zahlen bis 9 000 000
    { typ: "eingabe", stufen: [2], richtung: "beide", grenze: 9000000 },
    // 4: Mehrfachauswahl, 1 oder 2 Antworten richtig
    //    (3 richtige bräuchten 1 t = 1 000 000 000 mg)
    { typ: "auswahl", richtig: [1, 2], grenze: 9000000 }
  ]
};

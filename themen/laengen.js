/* Übung: Längen umrechnen
   Alle Einstellungen erklärt: vorlage/thema-vorlage.js */
window.THEMA = {
  id: "laengen",
  titel: "Längen umrechnen",
  untertitel: "mm · cm · dm · m · km",
  farbe: "#0F6E56",
  farbeHell: "#E1F5EE",

  einheiten: ["mm", "cm", "dm", "m", "km"],
  faktoren: [10, 10, 10, 1000],

  freischalten: true,
  ziel: { anzahl: 10, art: "folge" },
  hilfe: "an",

  level: [
    // 1: Eine Stufe zur kleineren Einheit (4 cm = ? mm)
    { typ: "eingabe", stufen: [1], richtung: "runter" },
    // 2: Eine Stufe zur größeren Einheit (70 mm = ? cm)
    { typ: "eingabe", stufen: [1], richtung: "hoch" },
    // 3: Zwei oder drei Stufen (3 m = ? cm)
    { typ: "eingabe", stufen: [2, 3], richtung: "beide" },
    // 4: Mehrfachauswahl, 1 bis 4 Antworten richtig
    { typ: "auswahl", optionen: 4, richtig: [1, 1, 2, 2, 2, 3, 3, 4], grenze: 1000000 }
  ]
};

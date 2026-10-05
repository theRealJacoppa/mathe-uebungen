/* =============================================================
   Gemeinsames Programm für alle Übungen.
   Der Inhalt und alle Einstellungen kommen aus window.THEMA
   (Datei im Ordner themen/). Alle Möglichkeiten stehen in
   vorlage/thema-vorlage.js.
   Änderungen hier gelten für jede Übung.
   ============================================================= */
(function () {
  "use strict";

  var T = window.THEMA;

  // ---------- Einstellungen mit Standardwerten ----------

  var EINHEITEN = T.einheiten || [];
  var FAKTOR = T.faktoren || [];              // Umrechnungszahl zwischen Nachbarn
  var MAX = T.grenze || 100000;               // größte Zahl (Aufgabe und Ergebnis)
  var ZAHLEN_BIS = T.zahlenBis || 99;         // größte "kleine" Zahl, z. B. 99 km
  var LOB = T.lob || ["Super!", "Richtig!", "Sehr gut!", "Toll!", "Prima!"];
  var STANDARD_ZIEL = { anzahl: 10, art: "folge" };

  // Ein Level kann eine Aufgabe direkt enthalten oder eine Liste "aufgaben"
  var LEVEL = T.level.map(function (lv) {
    var kopie = {};
    for (var k in lv) kopie[k] = lv[k];
    if (!kopie.aufgaben) kopie.aufgaben = [lv];
    return kopie;
  });

  // Wie viel der kleinsten Einheit steckt in einer Einheit? (z. B. 1 m = 1000 mm)
  var BASIS = [1];
  for (var b = 0; b < FAKTOR.length; b++) BASIS.push(BASIS[b] * FAKTOR[b]);

  var STANDARD_MERKSATZ =
    '<p>Ich rechne von einer kleinen Einheit in eine große Einheit<br>' +
    '→ Ich rechne <span class="lila">geteilt ( : )</span></p>' +
    '<p>Ich rechne von einer großen Einheit in eine kleine Einheit<br>' +
    '→ Ich rechne <span class="orange">mal ( · )</span></p>';

  var SCHLOSS = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="#9a9a9a"/>' +
    '<path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#9a9a9a" stroke-width="2.5"/></svg>';

  // ---------- Farben ----------

  // Helle Variante: Farbe zu 12 % mit Weiß gemischt
  function hellVon(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.replace(/./g, "$&$&");
    var teile = [0, 2, 4].map(function (i) {
      var c = parseInt(h.substr(i, 2), 16);
      return Math.round(255 - (255 - c) * 0.12).toString(16).padStart(2, "0");
    });
    return "#" + teile.join("");
  }

  var AKZENT = T.farbe || "#0F6E56";
  var AKZENT_HELL = T.farbeHell || hellVon(AKZENT);
  var AKZENT_SCHRIFT = T.farbeSchrift || AKZENT;   // Schrift in den Kästen der Grafik
  document.documentElement.style.setProperty("--akzent", AKZENT);
  document.documentElement.style.setProperty("--akzent-hell", AKZENT_HELL);

  // ---------- Zustand ----------

  var zustand = {
    level: 1,
    freigeschaltet: T.freischalten === false ? LEVEL.length : 1,
    aufgabe: null,
    beantwortet: false,
    richtig: 0,
    gesamt: 0,
    serie: 0,
    zielErreicht: false,
    letzte: []
  };

  // ---------- Hilfsfunktionen ----------

  function zufall(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function waehle(liste) {
    return liste[zufall(0, liste.length - 1)];
  }

  function mischen(liste) {
    for (var i = liste.length - 1; i > 0; i--) {
      var j = zufall(0, i), t = liste[i];
      liste[i] = liste[j];
      liste[j] = t;
    }
    return liste;
  }

  // Meist kleine Zahlen, manchmal größere
  function zahl(max) {
    var r = Math.random();
    if (max <= 10 || r < 0.5) return zufall(1, Math.min(10, max));
    if (r < 0.8) return zufall(11, Math.min(50, max));
    return zufall(Math.min(51, max), max);
  }

  // Zahlen ab 10 000 in Dreiergruppen mit Leerzeichen
  function format(n) {
    var s = String(n);
    if (s.length < 5) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function mitEinheit(n, einheit) {
    return format(n) + " " + EINHEITEN[einheit];
  }

  function faktoren(a, b) {
    var lo = Math.min(a, b), hi = Math.max(a, b), f = [];
    for (var i = lo; i < hi; i++) f.push(FAKTOR[i]);
    return f;
  }

  function produkt(f) {
    return f.reduce(function (x, y) { return x * y; }, 1);
  }

  function leseZahl(text) {
    var s = text.replace(/[\s.  ]/g, "");
    if (!/^\d+$/.test(s)) return null;
    return parseInt(s, 10);
  }

  // "3 · 10 · 10 = 300 → 3 m = 300 cm"
  function rechenweg(von, nach, wert, ergebnis) {
    var zeichen = von > nach ? " · " : " : ";
    var teile = [format(wert)].concat(faktoren(von, nach).map(format));
    return teile.join(zeichen) + " = " + format(ergebnis) + " → " +
      mitEinheit(wert, von) + " = " + mitEinheit(ergebnis, nach);
  }

  function knoten(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // =============================================================
  //   AUFGABENTYPEN
  //   Jeder Typ ist ein Baustein mit denselben Teilen:
  //     html()          Bereich in der Aufgaben-Karte
  //     start()         Bereich mit Elementen verbinden
  //     erzeugen(spec)  neue Aufgabe (spec = Eintrag aus "aufgaben")
  //     schluessel(a)   Text, um Wiederholungen zu erkennen
  //     zeigen(a)       Aufgabe anzeigen
  //     pruefen(a)      true/false, oder null wenn die Eingabe fehlt
  //     loesung(a)      Liste von Zeilen für "So geht es:"
  //     taste(e, a)     optional: eigene Tasten
  //   Neuer Typ: hier ergänzen und in thema-vorlage.js beschreiben.
  // =============================================================

  var TYPEN = {};

  // ---------- Typ "eingabe": 4 cm = [ ] mm ----------

  TYPEN.eingabe = {
    html: function () {
      return '<div class="aufgabe" data-typ="eingabe">' +
        '<span class="wort" id="links"></span><span>=</span>' +
        '<input id="eingabe" type="text" inputmode="numeric" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Deine Antwort">' +
        '<span id="rechts"></span></div>';
    },

    start: function () {
      this.links = document.getElementById("links");
      this.rechts = document.getElementById("rechts");
      this.feld = document.getElementById("eingabe");
      this.feld.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          weiter();
        }
      });
    },

    // Alle erlaubten Paare (von, nach)
    paare: function (spec) {
      var grenze = spec.grenze || MAX, paare = [];
      var stufen = spec.stufen || [1], richtung = spec.richtung || "beide";
      for (var von = 0; von < EINHEITEN.length; von++) {
        for (var nach = 0; nach < EINHEITEN.length; nach++) {
          if (stufen.indexOf(Math.abs(von - nach)) === -1) continue;
          if (richtung === "runter" && von < nach) continue;
          if (richtung === "hoch" && von > nach) continue;
          if (Math.floor(grenze / produkt(faktoren(von, nach))) < 5) continue;
          paare.push([von, nach]);
        }
      }
      return paare;
    },

    erzeugen: function (spec) {
      var paare = this.paare(spec);
      if (!paare.length) throw new Error("Keine Eingabe-Aufgabe möglich. stufen, richtung und grenze prüfen.");
      var p = waehle(paare);
      var von = p[0], nach = p[1];
      var F = produkt(faktoren(von, nach));
      var max = Math.min(spec.zahlenBis || ZAHLEN_BIS, Math.floor((spec.grenze || MAX) / F));
      var wert, ergebnis;
      if (von > nach) {
        wert = zahl(max);          // groß → klein: mal
        ergebnis = wert * F;
      } else {
        ergebnis = zahl(max);      // klein → groß: geteilt
        wert = ergebnis * F;
      }
      return { von: von, nach: nach, wert: wert, ergebnis: ergebnis };
    },

    schluessel: function (a) {
      return a.wert + EINHEITEN[a.von] + EINHEITEN[a.nach];
    },

    zeigen: function (a) {
      this.links.textContent = mitEinheit(a.wert, a.von);
      this.rechts.textContent = EINHEITEN[a.nach];
      this.feld.value = "";
      this.feld.readOnly = false;
      this.feld.focus();
    },

    pruefen: function (a) {
      var antwort = leseZahl(this.feld.value);
      if (antwort === null) {
        this.feld.focus();
        return null;
      }
      this.feld.value = format(antwort);
      this.feld.readOnly = true;
      this.feld.focus();
      return antwort === a.ergebnis;
    },

    loesung: function (a) {
      return [rechenweg(a.von, a.nach, a.wert, a.ergebnis)];
    },

    fokus: function () { this.feld.focus(); }
  };

  // ---------- Typ "auswahl": 500 cm = ?  [ ] 5 m  [ ] 50 dm ... ----------

  TYPEN.auswahl = {
    html: function () {
      return '<div data-typ="auswahl">' +
        '<div class="aufgabe" id="mcFrage"></div>' +
        '<p class="mc-hinweis" id="mcHinweis"></p>' +
        '<div class="mc-liste" id="mcListe"></div></div>';
    },

    start: function () {
      this.frage = document.getElementById("mcFrage");
      this.hinweis = document.getElementById("mcHinweis");
      this.liste = document.getElementById("mcListe");
    },

    erzeugen: function (spec) {
      var anzahl = spec.optionen || 4;
      var richtigListe = spec.richtig || [1, 2];
      var k = Math.min(waehle(richtigListe), anzahl);
      while (k >= 1) {
        for (var versuch = 0; versuch < 2000; versuch++) {
          var a = this.versuch(k, anzahl, spec.grenze || MAX);
          if (a) {
            a.hinweis = this.hinweisText(richtigListe);
            return a;
          }
        }
        k--;                         // nicht möglich: weniger richtige
      }
      throw new Error("Keine Auswahl-Aufgabe möglich. Einstellungen prüfen.");
    },

    versuch: function (anzahlRichtig, anzahl, grenze) {
      var basis = zufall(0, EINHEITEN.length - 1);
      var menge = zahl(ZAHLEN_BIS) * BASIS[basis];   // in der kleinsten Einheit

      // Einheiten, in denen die Menge eine ganze Zahl ist
      var gueltig = [];
      for (var u = 0; u < EINHEITEN.length; u++) {
        if (menge % BASIS[u] === 0 && menge / BASIS[u] <= grenze) gueltig.push(u);
      }
      var quellen = gueltig.filter(function (u) { return menge / BASIS[u] <= MAX; });
      if (!quellen.length) return null;
      var von = waehle(quellen);
      var andere = mischen(gueltig.filter(function (u) { return u !== von; }));
      if (andere.length < anzahlRichtig) return null;

      var richtig = andere.slice(0, anzahlRichtig).map(function (u) {
        return { einheit: u, wert: menge / BASIS[u], richtig: true };
      });

      // Falsche Antworten: Fehler um 10, 100 oder 1000
      var falsch = [];
      andere.forEach(function (u) {
        var t = menge / BASIS[u];
        [10, 100, 1000].forEach(function (f) {
          [t * f, t / f].forEach(function (w) {
            if (w % 1 === 0 && w >= 1 && w <= grenze) {
              falsch.push({ einheit: u, wert: w, richtig: false, gewicht: f === 10 ? 4 : 1 });
            }
          });
        });
      });
      var noetig = anzahl - anzahlRichtig;
      if (falsch.length < noetig) return null;

      // Fehler um 10 kommen öfter vor
      var auswahl = [];
      while (auswahl.length < noetig) {
        var summe = falsch.reduce(function (s, o) { return s + o.gewicht; }, 0);
        var z = Math.random() * summe, i = 0;
        while (z >= falsch[i].gewicht) { z -= falsch[i].gewicht; i++; }
        auswahl.push(falsch.splice(i, 1)[0]);
      }

      return {
        von: von,
        wert: menge / BASIS[von],
        menge: menge,
        optionen: mischen(richtig.concat(auswahl))
      };
    },

    // "1, 2 oder 3 Antworten sind richtig."
    hinweisText: function (liste) {
      var zahlen = liste.filter(function (n, i) { return liste.indexOf(n) === i; });
      zahlen.sort(function (x, y) { return x - y; });
      if (zahlen.length === 1) {
        return zahlen[0] === 1 ? "1 Antwort ist richtig." : zahlen[0] + " Antworten sind richtig.";
      }
      return zahlen.slice(0, -1).join(", ") + " oder " + zahlen[zahlen.length - 1] +
        " Antworten sind richtig.";
    },

    schluessel: function (a) {
      return a.wert + EINHEITEN[a.von];
    },

    zeigen: function (a) {
      var liste = this.liste;
      this.frage.textContent = mitEinheit(a.wert, a.von) + " = ?";
      this.hinweis.textContent = a.hinweis;
      liste.innerHTML = "";
      a.optionen.forEach(function (o) {
        var label = knoten("label", "mc-option");
        var box = knoten("input");
        box.type = "checkbox";
        box.addEventListener("click", function (e) {
          if (zustand.beantwortet) e.preventDefault(); // nach dem Prüfen nicht mehr ändern
        });
        box.addEventListener("change", function () {
          label.classList.toggle("gewaehlt", box.checked);
        });
        label.appendChild(box);
        label.appendChild(knoten("span", "", mitEinheit(o.wert, o.einheit)));
        liste.appendChild(label);
      });
      // Kein Fokus auf einem Kästchen: Enter prüft, Zahlentasten kreuzen an
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    },

    pruefen: function (a) {
      var labels = this.liste.querySelectorAll(".mc-option");
      var alleRichtig = true;
      a.optionen.forEach(function (o, i) {
        var label = labels[i];
        if (label.querySelector("input").checked !== o.richtig) alleRichtig = false;
        label.classList.add("geprueft", o.richtig ? "wahr" : "unwahr");
        label.appendChild(knoten("span", "zeichen", o.richtig ? "✓" : "✗"));
      });
      return alleRichtig;
    },

    // Rechenweg für jede Einheit in den Antworten
    loesung: function (a) {
      var einheiten = [];
      a.optionen.forEach(function (o) {
        if (einheiten.indexOf(o.einheit) === -1) einheiten.push(o.einheit);
      });
      einheiten.sort(function (x, y) { return y - x; });
      return einheiten.map(function (u) {
        return rechenweg(a.von, u, a.wert, a.menge / BASIS[u]);
      });
    },

    // Zahlentasten 1, 2, 3 … kreuzen an
    taste: function (e) {
      if (!/^[1-9]$/.test(e.key)) return false;
      var box = this.liste.querySelectorAll("input")[Number(e.key) - 1];
      if (box) box.click();
      return true;
    }
  };

  // ---------- Grafik: Einheiten mit Bögen ----------

  function hilfeGrafik() {
    var n = EINHEITEN.length, ABSTAND = 180, BREITE = 110, RAND = 30;
    var inhaltBreite = 2 * RAND + (n - 1) * ABSTAND + BREITE;
    var W = Math.max(inhaltBreite, 640);          // Platz für den langen Pfeil
    var versatz = (W - inhaltBreite) / 2;         // wenige Einheiten: mittig
    var schrift = ' font-family="system-ui, Arial, sans-serif" text-anchor="middle" font-weight="700"';
    function mitte(i) { return versatz + RAND + BREITE / 2 + i * ABSTAND; }
    function spitze(id, farbe, groesse) {
      return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="' + groesse +
        '" markerHeight="' + groesse + '" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' +
        farbe + '"/></marker>';
    }

    var oben = "", obenText = "", unten = "", untenText = "", kaesten = "", namen = "";
    for (var i = 0; i < n; i++) {
      kaesten += '<rect x="' + (mitte(i) - BREITE / 2) + '" y="120" width="' + BREITE + '" height="70" rx="10"/>';
      namen += '<text x="' + mitte(i) + '" y="168">' + EINHEITEN[i] + '</text>';
      if (i === n - 1) continue;
      var x1 = mitte(i) + 25, x2 = mitte(i + 1) - 25, m = (x1 + x2) / 2;
      oben += '<path d="M' + x1 + ' 112 Q' + m + ' 30 ' + x2 + ' 112"/>';
      obenText += '<text x="' + m + '" y="52">: ' + FAKTOR[i] + '</text>';
      unten += '<path d="M' + x2 + ' 198 Q' + m + ' 280 ' + x1 + ' 198"/>';
      untenText += '<text x="' + m + '" y="278">· ' + FAKTOR[i] + '</text>';
    }
    var halb = Math.min(200, W / 2 - 190);
    var p1 = W / 2 - halb, p2 = W / 2 + halb;

    return '<svg viewBox="0 0 ' + W + ' 340" role="img" aria-label="Einheiten: ' + EINHEITEN.join(", ") +
      '. Nach rechts geteilt, nach links mal.">' +
      '<defs>' + spitze("spitzeLila", "#534AB7", 7) + spitze("spitzeOrange", "#BA7517", 7) +
      spitze("spitzeGrau", "#5f5f5f", 6) + '</defs>' +
      '<g fill="none" stroke="#534AB7" stroke-width="4" marker-end="url(#spitzeLila)">' + oben + '</g>' +
      '<g fill="#534AB7" font-size="30"' + schrift + '>' + obenText + '</g>' +
      '<g fill="' + AKZENT_HELL + '" stroke="' + AKZENT + '" stroke-width="3">' + kaesten + '</g>' +
      '<g fill="' + AKZENT_SCHRIFT + '" font-size="36"' + schrift + '>' + namen + '</g>' +
      '<g fill="none" stroke="#BA7517" stroke-width="4" marker-end="url(#spitzeOrange)">' + unten + '</g>' +
      '<g fill="#BA7517" font-size="30"' + schrift + '>' + untenText + '</g>' +
      '<line x1="' + p1 + '" y1="318" x2="' + p2 + '" y2="318" stroke="#5f5f5f" stroke-width="4" marker-end="url(#spitzeGrau)"/>' +
      '<g fill="#333" font-size="24" font-family="system-ui, Arial, sans-serif">' +
      '<text x="' + (p1 - 14) + '" y="326" text-anchor="end">kleine Einheit</text>' +
      '<text x="' + (p2 + 16) + '" y="326">große Einheit</text></g>' +
      '</svg>';
  }

  // ---------- Seite aufbauen ----------

  function baueSeite() {
    document.title = T.titel;
    var knoepfe = "";
    for (var i = 1; i <= LEVEL.length; i++) {
      knoepfe += '<button type="button" class="level-knopf" data-level="' + i + '">Level ' + i + '</button>';
    }
    // Nur die Typen einbauen, die diese Übung benutzt
    var bereiche = benutzteTypen().map(function (name) { return TYPEN[name].html(); }).join("");
    var hilfe = (T.grafik === false ? "" : hilfeGrafik()) +
      (T.merksatz === false ? "" : '<div class="merksatz">' + (T.merksatz || STANDARD_MERKSATZ) + '</div>');

    document.body.innerHTML =
      '<header class="kopf">' +
        '<h1>' + T.titel + '</h1>' +
        '<div class="level-reihe" role="group" aria-label="Level">' + knoepfe + '</div>' +
        '<div class="kopf-rechts">' +
          '<div class="serie"><span id="zielText"></span><span class="punkte-reihe" id="punkte"></span></div>' +
          '<div class="stand">Richtig: <span id="richtigZahl">0</span> von <span id="gesamtZahl">0</span></div>' +
          '<button type="button" id="hilfeKnopf" aria-pressed="true" aria-controls="hilfe">Hilfe</button>' +
        '</div>' +
      '</header>' +
      '<main class="inhalt" id="inhalt">' +
        '<section class="karte hilfe" id="hilfe">' + hilfe + '</section>' +
        '<section class="karte aufgabe-karte">' + bereiche +
          '<div class="knopf-reihe"><button type="button" class="primaer" id="pruefKnopf">Prüfen</button></div>' +
          '<div id="rueckmeldung" aria-live="polite"></div>' +
        '</section>' +
      '</main>' +
      '<div class="erfolg-hintergrund" id="erfolg" hidden>' +
        '<div class="erfolg-fenster" role="dialog" aria-modal="true" aria-labelledby="erfolgText">' +
          '<p id="erfolgText"></p>' +
          '<div class="erfolg-knoepfe">' +
            '<button type="button" class="primaer" id="weiterLevel"></button>' +
            '<button type="button" id="erfolgZu">Weiter üben</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function benutzteTypen() {
    var namen = [];
    LEVEL.forEach(function (lv) {
      lv.aufgaben.forEach(function (spec) {
        if (!TYPEN[spec.typ]) throw new Error("Unbekannter Aufgabentyp: " + spec.typ);
        if (namen.indexOf(spec.typ) === -1) namen.push(spec.typ);
      });
    });
    return namen;
  }

  baueSeite();
  benutzteTypen().forEach(function (name) { TYPEN[name].start(); });

  var el = {};
  ["inhalt", "hilfe", "hilfeKnopf", "pruefKnopf", "rueckmeldung", "richtigZahl", "gesamtZahl",
   "zielText", "punkte", "erfolg", "erfolgText", "weiterLevel", "erfolgZu"].forEach(function (id) {
    el[id] = document.getElementById(id);
  });
  el.levelKnoepfe = document.querySelectorAll(".level-knopf");
  el.bereiche = document.querySelectorAll("[data-typ]");

  // ---------- Level-Einstellungen ----------

  function aktuellesLevel() { return LEVEL[zustand.level - 1]; }

  function ziel() {
    var z = aktuellesLevel().ziel || T.ziel || {};
    return { anzahl: z.anzahl || STANDARD_ZIEL.anzahl, art: z.art || STANDARD_ZIEL.art };
  }

  function fortschritt() {
    return ziel().art === "gesamt" ? Math.min(zustand.richtig, ziel().anzahl) : zustand.serie;
  }

  // Hilfe pro Level: "an" (sichtbar), "aus" (versteckt, Knopf da), "keine" (ohne Knopf)
  function setzeHilfe(modus) {
    var keineHilfeDa = T.grafik === false && T.merksatz === false;
    if (keineHilfeDa) modus = "keine";
    el.hilfeKnopf.hidden = modus === "keine";
    zeigeHilfe(modus === "an");
  }

  function zeigeHilfe(sichtbar) {
    el.inhalt.classList.toggle("ohne-hilfe", !sichtbar);
    el.hilfeKnopf.setAttribute("aria-pressed", String(sichtbar));
  }

  // ---------- Anzeige ----------

  function zeigePunkte() {
    var z = ziel();
    el.richtigZahl.textContent = zustand.richtig;
    el.gesamtZahl.textContent = zustand.gesamt;
    el.zielText.textContent = z.anzahl + (z.art === "gesamt" ? " richtig:" : " in Folge:");
    var f = fortschritt();
    if (z.anzahl > 15) {
      el.punkte.innerHTML = '<span class="punkte-zahl">' + f + " / " + z.anzahl + "</span>";
      return;
    }
    var html = "";
    for (var i = 0; i < z.anzahl; i++) {
      html += '<span class="punkt' + (i < f ? " voll" : "") + '"></span>';
    }
    el.punkte.innerHTML = html;
  }

  function zeigeLevel() {
    el.levelKnoepfe.forEach(function (k) {
      var n = Number(k.dataset.level);
      var offen = n <= zustand.freigeschaltet;
      k.disabled = !offen;
      k.innerHTML = "Level " + n + (offen ? "" : SCHLOSS);
      k.setAttribute("aria-pressed", String(n === zustand.level));
    });
  }

  // Freigeschaltete Level bleiben bis zum Schließen des Tabs gespeichert
  var SPEICHER = "level-" + T.id;

  function ladeFreigabe() {
    if (T.freischalten === false) return;
    try {
      var n = Number(sessionStorage.getItem(SPEICHER));
      if (n >= 1 && n <= LEVEL.length) zustand.freigeschaltet = n;
    } catch (e) {}
  }

  function speichereFreigabe() {
    try { sessionStorage.setItem(SPEICHER, String(zustand.freigeschaltet)); } catch (e) {}
  }

  // ---------- Ablauf ----------

  function neueAufgabeErzeugen() {
    var lv = aktuellesLevel();
    var a, schluessel, versuche = 0;
    do {
      var spec = waehle(lv.aufgaben);
      a = TYPEN[spec.typ].erzeugen(spec);
      a.typ = spec.typ;
      schluessel = a.typ + ":" + TYPEN[a.typ].schluessel(a);
      versuche++;
    } while (zustand.letzte.indexOf(schluessel) !== -1 && versuche < 50);
    zustand.letzte.push(schluessel);
    if (zustand.letzte.length > 8) zustand.letzte.shift();
    return a;
  }

  function neueAufgabe() {
    var a = neueAufgabeErzeugen();
    zustand.aufgabe = a;
    zustand.beantwortet = false;
    el.rueckmeldung.className = "";
    el.rueckmeldung.innerHTML = "";
    el.pruefKnopf.textContent = "Prüfen";
    el.bereiche.forEach(function (b) { b.hidden = b.dataset.typ !== a.typ; });
    TYPEN[a.typ].zeigen(a);
  }

  function pruefen() {
    var a = zustand.aufgabe, typ = TYPEN[a.typ];
    var korrekt = typ.pruefen(a);
    if (korrekt === null) {
      el.rueckmeldung.className = "hinweis";
      el.rueckmeldung.textContent = "Bitte eine Antwort geben.";
      return;
    }
    zustand.beantwortet = true;
    zustand.gesamt++;

    var z = ziel(), erfolg = false;
    if (korrekt) {
      zustand.richtig++;
      zustand.serie++;
      el.rueckmeldung.className = "richtig";
      el.rueckmeldung.textContent = waehle(LOB);
      if (z.art === "gesamt") {
        if (zustand.richtig >= z.anzahl && !zustand.zielErreicht) {
          erfolg = true;
          zustand.zielErreicht = true;
        }
      } else if (zustand.serie >= z.anzahl) {
        erfolg = true;
        zustand.serie = 0;
      }
    } else {
      zustand.serie = 0;
      el.rueckmeldung.className = "falsch";
      el.rueckmeldung.textContent = "Noch nicht. So geht es:";
      typ.loesung(a).forEach(function (zeile) {
        el.rueckmeldung.appendChild(knoten("span", "rechnung", zeile));
      });
    }
    el.pruefKnopf.textContent = "Weiter →";
    zeigePunkte();
    if (erfolg) zeigeErfolg();
  }

  function weiter() {
    if (zustand.beantwortet) neueAufgabe();
    else pruefen();
  }

  function zeigeErfolg() {
    var z = ziel();
    var text = "Toll! " + z.anzahl + (z.art === "gesamt" ? " richtig!" : " richtig in Folge!");
    var naechstes = zustand.level + 1;
    if (naechstes <= LEVEL.length) {
      if (zustand.freigeschaltet < naechstes) {
        zustand.freigeschaltet = naechstes;
        speichereFreigabe();
        zeigeLevel();
      }
      el.erfolgText.textContent = text + " Jetzt Level " + naechstes + ".";
      el.weiterLevel.textContent = "Level " + naechstes + " →";
      el.weiterLevel.hidden = false;
    } else {
      el.erfolgText.textContent = text + " Du kannst alle Level!";
      el.weiterLevel.hidden = true;
    }
    el.erfolg.hidden = false;
    (el.weiterLevel.hidden ? el.erfolgZu : el.weiterLevel).focus();
  }

  function schliesseErfolg() {
    el.erfolg.hidden = true;
    neueAufgabe();
  }

  function setzeLevel(n) {
    if (n > zustand.freigeschaltet) return;
    zustand.level = n;
    zustand.richtig = 0;
    zustand.gesamt = 0;
    zustand.serie = 0;
    zustand.zielErreicht = false;
    zustand.letzte = [];
    el.erfolg.hidden = true;
    setzeHilfe(aktuellesLevel().hilfe || T.hilfe || "an");
    zeigeLevel();
    zeigePunkte();
    neueAufgabe();
  }

  // ---------- Ereignisse ----------

  document.addEventListener("keydown", function (e) {
    if (!el.erfolg.hidden) {
      if (e.key === "Escape") schliesseErfolg();
      return;                       // Enter drückt den Knopf im Fenster
    }
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;
    var a = zustand.aufgabe, typ = a && TYPEN[a.typ];
    if (typ && typ.taste && !zustand.beantwortet && typ.taste(e, a)) return;
    if (e.key !== "Enter" || e.target.tagName === "BUTTON") return;
    e.preventDefault();
    weiter();
  });

  el.pruefKnopf.addEventListener("click", weiter);
  el.erfolgZu.addEventListener("click", schliesseErfolg);
  el.weiterLevel.addEventListener("click", function () { setzeLevel(zustand.level + 1); });

  el.levelKnoepfe.forEach(function (k) {
    k.addEventListener("click", function () { setzeLevel(Number(k.dataset.level)); });
  });

  el.hilfeKnopf.addEventListener("click", function () {
    zeigeHilfe(el.inhalt.classList.contains("ohne-hilfe"));
    var typ = TYPEN[zustand.aufgabe.typ];
    if (typ.fokus) typ.fokus();
  });

  // ---------- Start ----------
  ladeFreigabe();
  setzeLevel(1);
})();

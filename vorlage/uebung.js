/* =============================================================
   Gemeinsames Programm für alle Übungen zum Umrechnen.
   Der Inhalt kommt aus window.THEMA (Datei im Ordner themen/).
   Änderungen hier gelten für jedes Thema.
   ============================================================= */
(function () {
  "use strict";

  var T = window.THEMA;
  var EINHEITEN = T.einheiten;
  var FAKTOR = T.faktoren;               // Umrechnungszahl zwischen Nachbarn
  var LEVEL = T.level;
  var MAX = T.grenze || 100000;          // größte Zahl in Level mit Eingabe
  var ZIEL_SERIE = 10;
  var LOB = ["Super!", "Richtig!", "Sehr gut!", "Toll!", "Prima!"];

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

  var zustand = {
    level: 1,
    freigeschaltet: 1,
    aufgabe: null,
    beantwortet: false,
    richtig: 0,
    gesamt: 0,
    serie: 0,
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

  // Faktoren zwischen zwei Einheiten
  function faktoren(a, b) {
    var lo = Math.min(a, b), hi = Math.max(a, b), f = [];
    for (var i = lo; i < hi; i++) f.push(FAKTOR[i]);
    return f;
  }

  function produkt(f) {
    return f.reduce(function (x, y) { return x * y; }, 1);
  }

  function leseEingabe(text) {
    var s = text.replace(/[\s.  ]/g, "");
    if (!/^\d+$/.test(s)) return null;
    return parseInt(s, 10);
  }

  function rechenweg(a) {
    var zeichen = a.von > a.nach ? " · " : " : ";
    var teile = [format(a.wert)].concat(a.faktoren.map(format));
    return teile.join(zeichen) + " = " + format(a.ergebnis) + " → " +
      mitEinheit(a.wert, a.von) + " = " + mitEinheit(a.ergebnis, a.nach);
  }

  // ---------- Aufgaben: Eingabe ----------

  function baueAufgabe(von, nach, grenze) {
    var f = faktoren(von, nach);
    var F = produkt(f);
    var max = Math.min(99, Math.floor(grenze / F));
    var wert, ergebnis;
    if (von > nach) {
      wert = zahl(max);            // groß → klein: mal
      ergebnis = wert * F;
    } else {
      ergebnis = zahl(max);        // klein → groß: geteilt
      wert = ergebnis * F;
    }
    return { von: von, nach: nach, wert: wert, ergebnis: ergebnis, faktoren: f };
  }

  // Alle erlaubten Paare (von, nach) für ein Level
  function paareFuer(lv) {
    var grenze = lv.grenze || MAX, paare = [];
    for (var von = 0; von < EINHEITEN.length; von++) {
      for (var nach = 0; nach < EINHEITEN.length; nach++) {
        var stufen = Math.abs(von - nach);
        if (lv.stufen.indexOf(stufen) === -1) continue;
        if (lv.richtung === "runter" && von < nach) continue;
        if (lv.richtung === "hoch" && von > nach) continue;
        // genug verschiedene Zahlen möglich?
        if (Math.floor(grenze / produkt(faktoren(von, nach))) < 5) continue;
        paare.push([von, nach]);
      }
    }
    return paare;
  }

  function aufgabeEingabe(lv) {
    var p = waehle(paareFuer(lv));
    return baueAufgabe(p[0], p[1], lv.grenze || MAX);
  }

  // ---------- Aufgaben: Mehrfachauswahl ----------

  function aufgabeAuswahl(lv) {
    var grenze = lv.grenze || MAX;
    var anzahlRichtig = waehle(lv.richtig);
    while (anzahlRichtig >= 1) {
      for (var versuch = 0; versuch < 2000; versuch++) {
        var a = versucheAuswahl(anzahlRichtig, grenze);
        if (a) return a;
      }
      anzahlRichtig--;              // nicht möglich: weniger richtige
    }
    return null;
  }

  function versucheAuswahl(anzahlRichtig, grenze) {
    var basis = zufall(0, EINHEITEN.length - 1);
    var menge = zahl(99) * BASIS[basis];   // in der kleinsten Einheit

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
    var noetig = 4 - anzahlRichtig;
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
      mc: true,
      von: von,
      wert: menge / BASIS[von],
      menge: menge,
      optionen: mischen(richtig.concat(auswahl))
    };
  }

  // "1, 2 oder 3 Antworten sind richtig."
  function auswahlHinweis(lv) {
    var zahlen = lv.richtig.filter(function (n, i) { return lv.richtig.indexOf(n) === i; });
    zahlen.sort(function (x, y) { return x - y; });
    if (zahlen.length === 1) {
      return zahlen[0] === 1 ? "1 Antwort ist richtig." : zahlen[0] + " Antworten sind richtig.";
    }
    return zahlen.slice(0, -1).join(", ") + " oder " + zahlen[zahlen.length - 1] +
      " Antworten sind richtig.";
  }

  function rechenwegeAuswahl(a) {
    var einheiten = [];
    a.optionen.forEach(function (o) {
      if (einheiten.indexOf(o.einheit) === -1) einheiten.push(o.einheit);
    });
    einheiten.sort(function (x, y) { return y - x; });
    return einheiten.map(function (u) {
      return rechenweg({
        von: a.von, nach: u, wert: a.wert,
        ergebnis: a.menge / BASIS[u], faktoren: faktoren(a.von, u)
      });
    });
  }

  function neueAufgabeErzeugen() {
    var lv = LEVEL[zustand.level - 1];
    var a, schluessel, versuche = 0;
    do {
      a = lv.typ === "auswahl" ? aufgabeAuswahl(lv) : aufgabeEingabe(lv);
      schluessel = a.mc
        ? a.wert + EINHEITEN[a.von] + a.optionen.length
        : a.wert + EINHEITEN[a.von] + EINHEITEN[a.nach];
      versuche++;
    } while (zustand.letzte.indexOf(schluessel) !== -1 && versuche < 50);
    zustand.letzte.push(schluessel);
    if (zustand.letzte.length > 8) zustand.letzte.shift();
    return a;
  }

  // ---------- Grafik: Einheiten mit Bögen ----------

  function hilfeGrafik() {
    var n = EINHEITEN.length, ABSTAND = 180, BREITE = 110, RAND = 30;
    var W = 2 * RAND + (n - 1) * ABSTAND + BREITE;
    var schrift = ' font-family="system-ui, Arial, sans-serif" text-anchor="middle" font-weight="700"';
    function mitte(i) { return RAND + BREITE / 2 + i * ABSTAND; }
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
      '<g fill="#E1F5EE" stroke="#0F6E56" stroke-width="3">' + kaesten + '</g>' +
      '<g fill="#0F6E56" font-size="36"' + schrift + '>' + namen + '</g>' +
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
    document.body.innerHTML =
      '<header class="kopf">' +
        '<h1>' + T.titel + '</h1>' +
        '<div class="level-reihe" role="group" aria-label="Level">' + knoepfe + '</div>' +
        '<div class="kopf-rechts">' +
          '<div class="serie" aria-label="Richtig in Folge"><span>10 in Folge:</span><span class="punkte-reihe" id="punkte"></span></div>' +
          '<div class="stand">Richtig: <span id="richtigZahl">0</span> von <span id="gesamtZahl">0</span></div>' +
          '<button type="button" id="hilfeKnopf" aria-pressed="true" aria-controls="hilfe">Hilfe</button>' +
        '</div>' +
      '</header>' +
      '<main class="inhalt" id="inhalt">' +
        '<section class="karte hilfe" id="hilfe">' + hilfeGrafik() +
          '<div class="merksatz">' + (T.merksatz || STANDARD_MERKSATZ) + '</div>' +
        '</section>' +
        '<section class="karte aufgabe-karte">' +
          '<div class="aufgabe" id="eingabeBlock">' +
            '<span class="wort" id="links"></span><span>=</span>' +
            '<input id="eingabe" type="text" inputmode="numeric" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Deine Antwort">' +
            '<span id="rechts"></span>' +
          '</div>' +
          '<div id="mc" hidden>' +
            '<div class="aufgabe" id="mcFrage"></div>' +
            '<p class="mc-hinweis" id="mcHinweis"></p>' +
            '<div class="mc-liste" id="mcListe"></div>' +
          '</div>' +
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

  baueSeite();

  var el = {};
  ["inhalt", "hilfeKnopf", "links", "rechts", "eingabe", "pruefKnopf", "rueckmeldung",
   "richtigZahl", "gesamtZahl", "punkte", "erfolg", "erfolgText", "weiterLevel", "erfolgZu",
   "eingabeBlock", "mc", "mcFrage", "mcHinweis", "mcListe"].forEach(function (id) {
    el[id] = document.getElementById(id);
  });
  el.levelKnoepfe = document.querySelectorAll(".level-knopf");

  // ---------- Anzeige ----------

  function zeigePunkte() {
    el.richtigZahl.textContent = zustand.richtig;
    el.gesamtZahl.textContent = zustand.gesamt;
    var html = "";
    for (var i = 0; i < ZIEL_SERIE; i++) {
      html += '<span class="punkt' + (i < zustand.serie ? " voll" : "") + '"></span>';
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
    try {
      var n = Number(sessionStorage.getItem(SPEICHER));
      if (n >= 1 && n <= LEVEL.length) zustand.freigeschaltet = n;
    } catch (e) {}
  }

  function speichereFreigabe() {
    try { sessionStorage.setItem(SPEICHER, String(zustand.freigeschaltet)); } catch (e) {}
  }

  function leereRueckmeldung() {
    el.rueckmeldung.className = "";
    el.rueckmeldung.innerHTML = "";
  }

  function neueAufgabe() {
    zustand.aufgabe = neueAufgabeErzeugen();
    zustand.beantwortet = false;
    leereRueckmeldung();
    el.pruefKnopf.textContent = "Prüfen";
    var istMc = !!zustand.aufgabe.mc;
    el.eingabeBlock.hidden = istMc;
    el.mc.hidden = !istMc;
    if (istMc) {
      zeigeAuswahl(zustand.aufgabe);
      return;
    }
    el.links.textContent = mitEinheit(zustand.aufgabe.wert, zustand.aufgabe.von);
    el.rechts.textContent = EINHEITEN[zustand.aufgabe.nach];
    el.eingabe.value = "";
    el.eingabe.readOnly = false;
    el.eingabe.focus();
  }

  function zeigeAuswahl(a) {
    el.mcFrage.textContent = mitEinheit(a.wert, a.von) + " = ?";
    el.mcHinweis.textContent = auswahlHinweis(LEVEL[zustand.level - 1]);
    el.mcListe.innerHTML = "";
    a.optionen.forEach(function (o) {
      var label = document.createElement("label");
      label.className = "mc-option";
      var box = document.createElement("input");
      box.type = "checkbox";
      box.addEventListener("click", function (e) {
        if (zustand.beantwortet) e.preventDefault(); // nach dem Prüfen nicht mehr ändern
      });
      box.addEventListener("change", function () {
        label.classList.toggle("gewaehlt", box.checked);
      });
      var text = document.createElement("span");
      text.textContent = mitEinheit(o.wert, o.einheit);
      label.appendChild(box);
      label.appendChild(text);
      el.mcListe.appendChild(label);
    });
    // Kein Fokus auf einem Kästchen: Enter prüft, Tasten 1–4 kreuzen an
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }

  function pruefeAuswahl() {
    var a = zustand.aufgabe;
    var labels = el.mcListe.querySelectorAll(".mc-option");
    var alleRichtig = true;
    a.optionen.forEach(function (o, i) {
      var label = labels[i];
      if (label.querySelector("input").checked !== o.richtig) alleRichtig = false;
      label.classList.add("geprueft", o.richtig ? "wahr" : "unwahr");
      var zeichen = document.createElement("span");
      zeichen.className = "zeichen";
      zeichen.textContent = o.richtig ? "✓" : "✗";
      label.appendChild(zeichen);
    });
    return alleRichtig;
  }

  function zeigeErfolg() {
    var naechstes = zustand.level + 1;
    if (naechstes <= LEVEL.length) {
      if (zustand.freigeschaltet < naechstes) {
        zustand.freigeschaltet = naechstes;
        speichereFreigabe();
        zeigeLevel();
      }
      el.erfolgText.textContent = "Toll! 10 richtig in Folge! Jetzt Level " + naechstes + ".";
      el.weiterLevel.textContent = "Level " + naechstes + " →";
      el.weiterLevel.hidden = false;
    } else {
      el.erfolgText.textContent = "Toll! 10 richtig in Folge! Du kannst alle Level!";
      el.weiterLevel.hidden = true;
    }
    el.erfolg.hidden = false;
    (el.weiterLevel.hidden ? el.erfolgZu : el.weiterLevel).focus();
  }

  function schliesseErfolg() {
    el.erfolg.hidden = true;
    neueAufgabe();
  }

  function pruefen() {
    var a = zustand.aufgabe;
    var istMc = !!a.mc;
    var antwort = istMc ? null : leseEingabe(el.eingabe.value);
    if (!istMc && antwort === null) {
      el.rueckmeldung.className = "hinweis";
      el.rueckmeldung.textContent = "Bitte eine Zahl schreiben.";
      el.eingabe.focus();
      return;
    }
    zustand.beantwortet = true;
    zustand.gesamt++;
    el.eingabe.readOnly = true;

    var korrekt = istMc ? pruefeAuswahl() : antwort === a.ergebnis;
    var erfolg = false;
    if (korrekt) {
      zustand.richtig++;
      zustand.serie++;
      el.rueckmeldung.className = "richtig";
      el.rueckmeldung.textContent = waehle(LOB);
      if (zustand.serie >= ZIEL_SERIE) {
        erfolg = true;
        zustand.serie = 0;
      }
    } else {
      zustand.serie = 0;
      el.rueckmeldung.className = "falsch";
      el.rueckmeldung.textContent = "Noch nicht. So geht es:";
      (istMc ? rechenwegeAuswahl(a) : [rechenweg(a)]).forEach(function (zeile) {
        var r = document.createElement("span");
        r.className = "rechnung";
        r.textContent = zeile;
        el.rueckmeldung.appendChild(r);
      });
    }
    el.pruefKnopf.textContent = "Weiter →";
    if (!istMc) {
      el.eingabe.value = format(antwort);
      el.eingabe.focus();
    }
    zeigePunkte();
    if (erfolg) zeigeErfolg();
  }

  function weiter() {
    if (zustand.beantwortet) neueAufgabe();
    else pruefen();
  }

  function setzeLevel(n) {
    if (n > zustand.freigeschaltet) return;
    zustand.level = n;
    zustand.richtig = 0;
    zustand.gesamt = 0;
    zustand.serie = 0;
    zustand.letzte = [];
    el.erfolg.hidden = true;
    zeigeLevel();
    zeigePunkte();
    neueAufgabe();
  }

  // ---------- Ereignisse ----------

  el.eingabe.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      weiter();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!el.erfolg.hidden) {
      if (e.key === "Escape") schliesseErfolg();
      return;                       // Enter drückt den Knopf im Fenster
    }
    if (e.target === el.eingabe) return;
    // Mehrfachauswahl: Tasten 1–4 kreuzen an
    if (zustand.aufgabe && zustand.aufgabe.mc && !zustand.beantwortet && /^[1-4]$/.test(e.key)) {
      var box = el.mcListe.querySelectorAll("input")[Number(e.key) - 1];
      if (box) box.click();
      return;
    }
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
    var zeigen = el.inhalt.classList.contains("ohne-hilfe");
    el.inhalt.classList.toggle("ohne-hilfe", !zeigen);
    el.hilfeKnopf.setAttribute("aria-pressed", String(zeigen));
    if (!zustand.aufgabe.mc) el.eingabe.focus();
  });

  // ---------- Start ----------
  ladeFreigabe();
  zeigeLevel();
  zeigePunkte();
  neueAufgabe();
})();

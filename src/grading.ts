// Simulated rubric grader for the Brightpath prototype.
// No AI service is called. Each question has a small rubric of criteria. A criterion is
// credited when the answer contains one of its accepted ideas (English or German, any
// inflection). Known misconceptions cap the suggested mark. The teacher always decides.
import type { Language, QuestionDefinition } from "./assessmentData";

type Bilingual = Record<Language, string>;

interface RubricCriterion {
  id: string;
  marks: number;
  /** Teacher-facing label, shown in "Why this mark?". */
  label: string;
  /** Child-facing sentences used to build the feedback suggestion. */
  praise: Bilingual;
  hint: Bilingual;
  /** Each pattern is one distinct accepted idea, written against folded text (see foldText). */
  patterns: string[];
  /** How many distinct ideas are needed for full marks (default 1). */
  need?: number;
  /** Award marks proportionally when fewer than `need` ideas are found. */
  partial?: boolean;
  /** Only credited when another criterion earned marks (e.g. a reason needs a correct claim). */
  dependsOn?: string;
  /** Phrasings that are correct even though they contain a negation word ("no difference"). */
  exempt?: string[];
  /** The criterion only asks for a word to be named (a plant part, "pollen"). It is then only
   *  cancelled by a negation right before the word ("no roots", "keinen Pollen"), not by a negated
   *  verb elsewhere in the clause ("the roots don't make food" still names the roots). */
  mentionOnly?: boolean;
}

interface RubricMisconception {
  patterns: string[];
  /** Teacher-facing description of what the answer appears to claim. */
  label: string;
  hint: Bilingual;
  /** Highest mark that can be suggested when this misconception is present. */
  cap: number;
}

interface Rubric {
  criteria: RubricCriterion[];
  misconceptions?: RubricMisconception[];
  /** Literal fragments copied from the prompt that must not count as evidence. */
  ignore?: string[];
}

export interface GradeResult {
  score: number;
  matchedTerms: string[];
  missingTerms: string[];
  feedback: string;
  rationale: string;
}

const b = (en: string, de: string): Bilingual => ({ en, de });

/** Lower-case, fold German umlauts/ß and typographic variants so one pattern covers both languages. */
export function foldText(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/½/g, "1/2").replace(/¼/g, "1/4").replace(/¾/g, "3/4")
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
    .replace(/[’‘`´]/g, "'")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1/$2")
    .replace(/\s+/g, " ")
    .trim();
}

const rubrics: Record<string, Rubric> = {
  "plant-parts": {
    criteria: [
      { id: "parts", marks: 2, need: 2, partial: true, mentionOnly: true, label: "Two plant parts named",
        praise: b("You named plant parts.", "Du hast Pflanzenteile genannt."),
        hint: b("Name two different plant parts, such as root, stem, leaf, or flower.", "Nenne zwei verschiedene Pflanzenteile, zum Beispiel Wurzel, Stängel, Blatt oder Blüte."),
        patterns: ["\\broots?\\b|wurzel", "\\bstems?\\b|stalk|stangel|stengel|stiel", "\\bleaf|\\bleaves|blatt", "flower|blossom|petal|blute", "\\bseeds?\\b|samen", "fruit|frucht"] },
      { id: "job", marks: 2, label: "Job of one part explained",
        praise: b("You explained what a part does.", "Du hast die Aufgabe eines Teils erklärt."),
        hint: b("Add what one part does, for example: roots take in water.", "Erkläre, was ein Teil macht, zum Beispiel: Die Wurzel nimmt Wasser auf."),
        patterns: [
          "(root|wurzel)\\w*\\b[^.!?]{0,40}\\b(take|taking|absorb|soak|suck|drink|get|pull|bring|nimm|nehm|saug|trink|hol|zieh)\\w*\\b[^.!?]{0,25}\\b(water|nutrient|food|wasser|nahrstoff|nahrung)|(root|wurzel)\\w*\\b[^.!?]{0,40}\\b(hold|anchor|keep|halt|veranker)\\w*\\b[^.!?]{0,30}\\b(ground|soil|place|boden|erde|fest)|\\b(water|wasser)\\b[^.!?]{0,40}\\b(by|durch|von|uber)\\s+(the\\s+|die\\s+|den\\s+)?(root|wurzel)",
          "(stem|stalk|stangel|stengel|stiel)\\w*\\b[^.!?]{0,40}\\b(hold|support|keep|carr|bring|transport|lift|halt|stutz|trag|leit)\\w*",
          "(leaf|leaves|blatt)\\w*\\b[^.!?]{0,40}\\b(make|making|produce|mach|bild|herstell|produzier)\\w*\\b[^.!?]{0,25}\\b(food|sugar|energy|nahrung|zucker|essen|energie)|(leaf|leaves|blatt)\\w*\\b[^.!?]{0,40}\\b(catch|collect|take in|absorb|fang|sammel|nehm|nimm)\\w*\\b[^.!?]{0,25}(sun|light|sonne|licht)|photosynth|fotosynth",
          "(flower|blossom|petal|blute)\\w*\\b[^.!?]{0,45}\\b(attract|lure|lock)\\w*\\b[^.!?]{0,25}(bee|insect|butterfl|biene|insekt|schmetterling)|(flower|blossom|blute)\\w*\\b[^.!?]{0,40}\\b(make|making|produce|turn|mach|bild|werden|wird)\\w*\\b[^.!?]{0,25}(seed|fruit|samen|frucht)",
        ] },
    ],
  },
  pollination: {
    criteria: [
      { id: "pollen", marks: 1, mentionOnly: true, label: "Pollen mentioned",
        praise: b("You knew that pollen is involved.", "Du wusstest, dass Pollen wichtig ist."),
        hint: b("Say what is carried: the pollen.", "Sage, was getragen wird: der Pollen (Blütenstaub)."),
        patterns: ["pollen|blutenstaub"] },
      { id: "transfer", marks: 1, label: "Carried from flower to flower",
        praise: b("You described how it gets from flower to flower.", "Du hast beschrieben, wie er von Blüte zu Blüte kommt."),
        hint: b("Explain who or what carries the pollen to another flower, such as bees or the wind.", "Erkläre, wer oder was den Pollen zu einer anderen Blüte trägt, zum Beispiel Bienen oder der Wind."),
        patterns: ["(one|another|next|other) flower|flower to flower|between (the )?flowers|from flower|von (einer )?blute|(nachste|andere)n? blute|zur nachsten|zwischen (den )?bluten|blute zu blute|\\b(carr|bring|brought|move|moving|take|took|transport|spread|deliver|trag|transportier|ubertrag|verteil)\\w*\\b[^.!?]{0,30}(pollen|blutenstaub|\\bit\\b|\\bihn\\b)"] },
      { id: "result", marks: 2, label: "Seeds or new plants as the result",
        praise: b("You linked pollination to making seeds.", "Du hast Bestäubung mit der Samenbildung verbunden."),
        hint: b("Finish the idea: after pollination the plant can make seeds.", "Führe den Gedanken zu Ende: Nach der Bestäubung kann die Pflanze Samen bilden."),
        patterns: ["\\bseeds?\\b|samen|new plants?|neue pflanze|fruit|frucht|baby plant"] },
    ],
    misconceptions: [
      { cap: 1, label: "the pollen or seeds are described as being eaten, or the plant as dying, instead of pollen being carried",
        hint: b("Think again about what the bee does with the pollen: it carries it to another flower, and then seeds can form.", "Überlege noch einmal, was die Biene mit dem Pollen macht: Sie trägt ihn zu einer anderen Blüte, dann können Samen entstehen."),
        patterns: ["\\b(eat|eats|ate|eating)\\s+(all\\s+|up\\s+)?(of\\s+)?(the\\s+)?(pollen|seeds?)\\b", "\\b(fress\\w*|frisst|isst|essen)\\s+((den|die|alle|allen)\\s+)*(pollen|samen|blutenstaub)", "(flower|plant|blume|blute|pflanze)\\w*\\s+(dies|stirbt)\\b"] },
    ],
  },
  "seed-dispersal": {
    criteria: [
      { id: "agent", marks: 2, label: "A way of travelling named (wind, water, animals)",
        praise: b("You named a way seeds travel.", "Du hast einen Weg genannt, wie Samen reisen."),
        hint: b("Name what moves the seed: wind, water, or an animal.", "Nenne, was den Samen bewegt: Wind, Wasser oder ein Tier."),
        patterns: ["\\bwind|\\bblow|\\bblas|\\bweh|\\bwater\\b|river|\\brain\\b|float|wasser|fluss|schwimm|animal|\\bbirds?\\b|\\bfur\\b|squirrel|\\bdogs?\\b|\\btiere?n?\\b|vogel|\\bfell\\b|eichhorn|\\bhund|explod|burst|\\bpop|platzen|schleuder|people|shoe|mensch|schuh"] },
      { id: "movement", marks: 2, dependsOn: "agent", label: "How the seed reaches a new place",
        praise: b("You explained how the seed gets to a new place.", "Du hast erklärt, wie der Samen an einen neuen Ort kommt."),
        hint: b("Add how it moves the seed away, for example: the wind carries it to a new place.", "Ergänze, wie der Samen wegkommt, zum Beispiel: Der Wind trägt ihn an einen neuen Ort."),
        patterns: ["carr|\\bblow|\\bblew|float|\\bfly|\\bflies|\\bflew|stick|stuck|\\bdrop|spread|\\btake|\\btook|\\bmove|\\bland|away|new place|somewhere else|\\bfar\\b|trag|\\bweh|\\bblas|schwimm|flieg|kleb|hang|verbreit|\\bfall|bring|\\bweg|neuen ort|woanders|\\bweit"] },
    ],
  },
  "plant-needs": {
    criteria: [
      { id: "needs", marks: 4, need: 4, partial: true, label: "Things a plant needs (1 mark each, up to 4)",
        praise: b("You listed things a plant needs.", "Du hast aufgezählt, was eine Pflanze braucht."),
        hint: b("A plant needs four things: water, sunlight, air, and nutrients from soil. Which ones are missing?", "Eine Pflanze braucht vier Dinge: Wasser, Sonnenlicht, Luft und Nährstoffe aus dem Boden. Was fehlt noch?"),
        patterns: ["\\bwater|wasser|giess", "\\bsun|\\blight|sonne|licht", "\\bair\\b|carbon dioxide|co2|\\bluft\\b|kohlendioxid|kohlenstoffdioxid", "\\bsoil\\b|nutrient|mineral|fertili|\\bdirt\\b|\\bearth\\b|boden|\\berde\\b|nahrstoff|dunger", "\\bwarm|\\bspace\\b|room to|\\bplatz\\b"] },
    ],
  },
  "fraction-meaning": {
    ignore: ["3/4"],
    criteria: [
      { id: "numerator", marks: 1, label: "Three parts are counted",
        praise: b("You said that three parts are counted.", "Du hast gesagt, dass drei Teile gezählt werden."),
        hint: b("Say how many parts are counted: the top number, 3.", "Sage, wie viele Teile gezählt werden: die obere Zahl, 3."),
        patterns: ["\\b(three|3|drei)\\b.{0,22}(part|piece|slice|\\bbit|teil|stuck)|\\b(three|3|drei)\\s+(out of|of|from|von|davon)\\b|\\b(have|has|take|takes|took|get|gets|got|eat|eats|ate|colou?r|shade|haben|habe|hat|nehmen|nimmt|nehme|bekomm\\w*|essen|isst|malen|male)\\s+(\\w+\\s+)?(three|3|drei)\\b"] },
      { id: "denominator", marks: 1, label: "The whole is split into four",
        praise: b("You said the whole is split into four parts.", "Du hast gesagt, dass das Ganze in vier Teile geteilt ist."),
        hint: b("Say how many parts the whole is split into: the bottom number, 4.", "Sage, in wie viele Teile das Ganze geteilt ist: die untere Zahl, 4."),
        patterns: ["\\b(four|4|vier)\\b.{0,25}(part|piece|slice|\\bbit|teil|stuck)|(cut|split|divid|share|broke|geteilt|teil|schneid|schnitt)\\w*.{0,25}\\b(four|4|vier|quarters|viertel)\\b|(out of|of|from|von)\\s+(the\\s+|den\\s+)?(four|4|vier)\\b|quarters|viertel"] },
      { id: "equal", marks: 1, label: "Parts are equal-sized",
        praise: b("You remembered that the parts are equal.", "Du hast daran gedacht, dass die Teile gleich groß sind."),
        hint: b("Add that the parts must be the same size.", "Ergänze, dass die Teile gleich groß sein müssen."),
        patterns: ["equal|same size|same-size|gleich|\\beven"] },
      { id: "whole", marks: 1, label: "Related to one whole",
        praise: b("You showed that it is part of a whole.", "Du hast gezeigt, dass es ein Teil von einem Ganzen ist."),
        hint: b("Say what the parts belong to: one whole.", "Sage, wozu die Teile gehören: zu einem Ganzen."),
        patterns: ["whole|ganze|out of|\\bof\\s+(the\\s+)?(four|4)\\b|\\bvon\\s+(den\\s+)?(vier|4)\\b|pizza|cake|kuchen|chocolate|schokolade|apple|apfel|\\bpie\\b|torte"] },
    ],
    misconceptions: [
      { cap: 1, label: "the two numbers are reversed or combined (for example \"4 out of 3\" or \"3 plus 4\")",
        hint: b("The bottom number, 4, tells how many equal parts make the whole. The top number, 3, counts how many we take.", "Die untere Zahl, 4, sagt, in wie viele gleiche Teile das Ganze geteilt ist. Die obere Zahl, 3, zählt, wie viele wir nehmen."),
        patterns: ["\\b(four|4|vier)\\b\\s+(\\w+\\s+){0,3}(out of|of|from|von)\\s+(the\\s+)?(three|3|drei)\\b", "\\b(three|3|drei)\\s+(and|plus|und|\\+|times|x|mal)\\s+(four|4|vier)\\b"] },
    ],
  },
  "compare-fractions": {
    criteria: [
      { id: "claim", marks: 2, label: "States that one half is larger",
        praise: b("You chose one half as the larger fraction.", "Du hast die Hälfte als den größeren Bruch gewählt."),
        hint: b("Decide which is larger: picture the same pizza cut into 2 pieces and into 4 pieces.", "Entscheide, was größer ist: Stell dir dieselbe Pizza in 2 und in 4 Stücken vor."),
        patterns: ["(half|1/2|halfte|halbe\\w*|ein halb)\\b.{0,14}\\b(larger|bigger|greater|more|grosser|mehr)\\b|(quarter|1/4|viertel|fourth)\\b.{0,14}\\b(smaller|less|kleiner|weniger)\\b|^\\W*(it is |its |it's |es ist )?(one |a |the |die |eine? )?(half|1/2|halfte|halbe)\\b"],
        exempt: ["(quarter|1/4|viertel|fourth)\\b[^.!?,]{0,12}\\b(not|nicht)\\s+(as big|as large|so gross|larger|bigger|grosser)"] },
      { id: "reason", marks: 2, dependsOn: "claim", label: "Reason uses the size or number of parts",
        praise: b("You explained it using the size of the pieces.", "Du hast es mit der Größe der Teile begründet."),
        hint: b("Explain why: when the same whole is cut into fewer pieces, each piece is bigger.", "Begründe: Wenn dasselbe Ganze in weniger Teile geteilt wird, ist jedes Teil größer."),
        patterns: ["(fewer|less|two|2|zwei|weniger|only|nur)\\s+(\\w+\\s+){0,2}(parts?|pieces?|slices?|teile?n?|stucke?n?)\\b|(bigger|larger|grosser\\w*|smaller|kleiner\\w*)\\s+(parts?|pieces?|slices?|teile?n?|stucke?n?)\\b|(each|every|jede\\w*)\\s+(part|piece|slice|teil|stuck)|same (whole|pizza|cake|size|thing)|(den|die|das|dem|der)selben? (ganze|pizza|kuchen)|gleiche\\w* (ganze|pizza|kuchen)|(split|\\bcut|divid|share|geteilt|\\bteilt|schneid|schnitt)\\w*|two quarters|2/4|zwei viertel|(part|piece|slice|teil|stuck)\\w*\\s+(is|are|ist|sind|get|gets|wird|werden)\\s+(bigger|larger|smaller|grosser|kleiner)|ein teil von zwei|(more|mehr)\\s+(\\w+\\s+){0,2}(parts?|pieces?|slices?|teile?n?|stucke?n?)\\b|(parts?|pieces?|slices?|teile?n?|stucke?n?)\\s+(\\w+\\s+)?(are|sind|get|werden)\\s+(smaller|kleiner|bigger|grosser)"] },
    ],
    misconceptions: [
      { cap: 0, label: "the quarter is treated as the larger fraction",
        hint: b("Careful: a bigger bottom number means more pieces, so each piece is smaller. 1/4 is smaller than 1/2.", "Achtung: Eine größere untere Zahl bedeutet mehr Teile, also ist jedes Teil kleiner. 1/4 ist kleiner als 1/2."),
        patterns: ["(quarter|1/4|viertel|fourth)\\s+(is|ist)\\s+(the\\s+|der\\s+)?(larger|bigger|greater|more|grosser\\w*|mehr)", "(half|1/2|halfte)\\s+(is|ist)\\s+(the\\s+)?(smaller|less|kleiner|weniger)", "\\b(4|four|vier)\\s+(is|ist)\\s+(bigger|larger|more|greater|grosser|mehr)\\s+(than|als)\\s+(2|two|zwei)\\b"] },
    ],
  },
  "fraction-model": {
    criteria: [
      { id: "fraction", marks: 2, label: "Correct fraction given (2/8 or 1/4)",
        praise: b("You found the right fraction.", "Du hast den richtigen Bruch gefunden."),
        hint: b("Write the slices eaten on top and all the slices on the bottom.", "Schreibe die gegessenen Stücke nach oben und alle Stücke nach unten."),
        patterns: ["\\b2/8\\b|\\b1/4\\b|two eighths?|one quarter|a quarter|one fourth|a fourth|zwei achtel|ein viertel|\\b(two|2|zwei)\\b\\s+(\\w+\\s+){0,2}(out of|of|from|von)\\s+(the\\s+|den\\s+)?(eight|8|acht)\\b"] },
      { id: "explain", marks: 2, dependsOn: "fraction", label: "Linked to slices eaten and slices in total",
        praise: b("You explained where the numbers come from.", "Du hast erklärt, woher die Zahlen kommen."),
        hint: b("Add a short reason: 2 slices eaten out of 8 slices in total.", "Ergänze eine kurze Begründung: 2 gegessene Stücke von insgesamt 8 Stücken."),
        patterns: ["slice|piece|stuck|\\bate\\b|eaten|\\beat\\b|gegessen|\\bass\\b|equal|gleich|\\btop\\b|bottom|\\boben\\b|\\bunten\\b|zahler|nenner|numerator|denominator|total|insgesamt|because|\\bweil\\b"] },
    ],
    misconceptions: [
      { cap: 1, label: "the numbers are reversed (8/2)",
        hint: b("The question asks about the slices you ate: 2 eaten out of 8 in total, so 2 goes on top.", "Gefragt sind die gegessenen Stücke: 2 von insgesamt 8, also steht die 2 oben."),
        patterns: ["\\b8/2\\b|\\b(eight|8|acht)\\b\\s+(\\w+\\s+){0,2}(out of|over|von|durch)\\s+(two|2|zwei)\\b"] },
    ],
  },
  "equivalent-fractions": {
    criteria: [
      { id: "fraction", marks: 2, label: "Equivalent fraction given",
        praise: b("You gave a fraction equal to one half.", "Du hast einen Bruch genannt, der gleich 1/2 ist."),
        hint: b("Try multiplying the top and bottom of 1/2 by the same number, for example 2.", "Multipliziere Zähler und Nenner von 1/2 mit derselben Zahl, zum Beispiel mit 2."),
        patterns: ["\\b(2/4|3/6|4/8|5/10|6/12|10/20|50/100)\\b|two (quarters|fourths)|zwei viertel|three sixths|drei sechstel|four eighths|vier achtel|five tenths|funf zehntel"] },
      { id: "reason", marks: 2, dependsOn: "fraction", label: "Explains why the value is the same",
        praise: b("You explained why they are worth the same.", "Du hast erklärt, warum beide gleich viel wert sind."),
        hint: b("Explain how you know: both fractions cover the same amount of the whole.", "Erkläre, woher du es weißt: Beide Brüche zeigen denselben Anteil vom Ganzen."),
        patterns: ["\\bsame\\b|\\bboth\\b|multipl|\\btimes\\b|doubl|half of|simplif|divid|selbe|\\bbeide|\\bmal\\b|verdoppel|erweiter|\\bkurz|halfte|\\bhalf\\b|gleich viel|genauso viel|as much"] },
    ],
  },
  "water-cycle": {
    criteria: [
      { id: "heat", marks: 1, label: "Sun warms the water",
        praise: b("You started with the sun warming the water.", "Du hast mit der Sonne begonnen, die das Wasser erwärmt."),
        hint: b("Start with what warms the puddle: the sun.", "Beginne damit, was die Pfütze erwärmt: die Sonne."),
        patterns: ["\\bsun|\\bheat|warm|\\bhot\\b|sonne|hitze|heiss"] },
      { id: "evaporation", marks: 1, label: "Water evaporates and rises",
        praise: b("You said the water rises into the air.", "Du hast gesagt, dass das Wasser in die Luft aufsteigt."),
        hint: b("Say what happens to the warm water: it evaporates and rises.", "Sage, was mit dem warmen Wasser passiert: Es verdunstet und steigt auf."),
        patterns: ["evaporat|vapou?r|steam|\\brise|goes up|go up|\\bdries|dry up|verdunst|verdampf|dampf|steigt|aufsteig|nach oben|trockn"] },
      { id: "cloud", marks: 1, label: "Clouds form",
        praise: b("You included clouds forming.", "Du hast die Wolkenbildung erwähnt."),
        hint: b("Add what forms in the sky: clouds.", "Ergänze, was am Himmel entsteht: Wolken."),
        patterns: ["cloud|condens|wolke|kondens"] },
      { id: "rain", marks: 1, label: "Water falls back as rain",
        praise: b("You finished with rain falling back down.", "Du hast mit dem Regen aufgehört, der wieder herunterfällt."),
        hint: b("Finish the cycle: how does the water come back to Earth?", "Beende den Kreislauf: Wie kommt das Wasser zurück zur Erde?"),
        patterns: ["\\brain|precipit|\\bfalls?\\b|\\bsnow|\\bhail|regen|regnet|niederschlag|\\bfallt|schnee|hagel"] },
    ],
    misconceptions: [
      { cap: 1, label: "the direction is reversed (rain or clouds are described as moving up, or the sun as coming down)",
        hint: b("Check the order: warm water rises as vapor, forms clouds, and then rain falls down.", "Prüfe die Reihenfolge: Warmes Wasser steigt als Dampf auf, bildet Wolken, und dann fällt der Regen herunter."),
        patterns: ["\\brain\\w*\\s+(falls?|goes|go|rises?|moves?)\\s+(up|into the sun|to the sun)", "\\bregen\\s+(fallt|steigt|geht)\\s+(nach oben|hoch|auf|in die sonne|zur sonne)", "(sun|sonne)\\s+(falls?|fallt)"] },
    ],
  },
  "measure-weather": {
    criteria: [
      { id: "tool", marks: 2, label: "Thermometer named",
        praise: b("You chose the right tool, a thermometer.", "Du hast das richtige Werkzeug gewählt: ein Thermometer."),
        hint: b("Name the tool that measures temperature: a thermometer.", "Nenne das Werkzeug, das die Temperatur misst: ein Thermometer."),
        patterns: ["thermomet|termomet"] },
      { id: "read", marks: 1, label: "Reading or measuring described",
        praise: b("You described taking the reading.", "Du hast das Ablesen beschrieben."),
        hint: b("Say how you get the number: read the thermometer.", "Sage, wie du den Wert bekommst: Lies das Thermometer ab."),
        patterns: ["measur|\\bread|\\bcheck|\\blook|\\bsee\\b|\\bmess|\\bmisst|ables|\\blies|\\blese|schau|gucke"] },
      { id: "record", marks: 1, label: "Recording the value",
        praise: b("You remembered to record the result.", "Du hast daran gedacht, den Wert zu notieren."),
        hint: b("Add how you keep the result: write the number down with °C.", "Ergänze, wie du den Wert festhältst: Schreibe die Zahl mit °C auf."),
        patterns: ["record|\\bwrit|\\bwrote|\\bnote|chart|table|\\blog\\b|notier|aufschreib|schreib|eintrag|\\btrage|tabelle|\\bheft"] },
    ],
    misconceptions: [
      { cap: 2, label: "the thermometer is described as measuring something other than temperature",
        hint: b("A thermometer measures temperature: how warm or cold it is.", "Ein Thermometer misst die Temperatur: wie warm oder kalt es ist."),
        patterns: ["thermomet\\w*\\s+(measures?|shows?|tells?|misst|zeigt)\\s+(how much\\s+|the\\s+|wie viel\\s+|den\\s+|die\\s+)?(rain|wind|regen|air pressure|luftdruck|humidity|luftfeuchtigkeit)"] },
    ],
  },
  "weather-patterns": {
    criteria: [
      { id: "water", marks: 2, label: "Clouds hold water droplets",
        praise: b("You knew that dark clouds hold water.", "Du wusstest, dass dunkle Wolken Wasser enthalten."),
        hint: b("Think about what a cloud is made of: tiny water droplets.", "Überlege, woraus eine Wolke besteht: aus winzigen Wassertropfen."),
        patterns: ["\\bwater|droplet|\\bdrops?\\b|moisture|\\bwet\\b|wasser|tropfen|tropfchen|feucht|\\bnass"] },
      { id: "heavy", marks: 2, label: "Many or heavy droplets, so rain can fall",
        praise: b("You explained that full, heavy clouds let rain fall.", "Du hast erklärt, dass volle, schwere Wolken Regen fallen lassen."),
        hint: b("Explain why dark means rain: the cloud is thick with droplets that get heavy and fall.", "Erkläre, warum dunkel Regen bedeutet: Die Wolke ist dicht mit Tropfen, die schwer werden und fallen."),
        patterns: ["heavy|\\bfull\\b|thick|a lot|\\blots\\b|\\bmuch\\b|\\bmany\\b|collect|gather|\\bcool|block\\w*.{0,12}(sun|light)|schwer|\\bvoll|\\bdick|\\bviel|sammel|kuhl|\\bdicht"] },
    ],
  },
  "length-measure": {
    criteria: [
      { id: "hundred", marks: 2, mentionOnly: true, label: "100 centimeters in one meter",
        praise: b("You knew that 100 centimeters make one meter.", "Du wusstest, dass 100 Zentimeter ein Meter sind."),
        hint: b("Remember how many centimeters fit into one meter: 100.", "Erinnere dich, wie viele Zentimeter in einen Meter passen: 100."),
        patterns: ["\\b100\\b|hundred|hundert"] },
      { id: "same", marks: 2, label: "Same length in different units",
        praise: b("You explained that both show the same length.", "Du hast erklärt, dass beides dieselbe Länge ist."),
        hint: b("Compare them: is 1 meter longer, shorter, or the same length as 100 centimeters?", "Vergleiche: Ist 1 Meter länger, kürzer oder gleich lang wie 100 Zentimeter?"),
        patterns: ["\\bsame\\b|\\bequal|gleich|selbe|just as long|genauso lang"],
        exempt: ["no differen|kein\\w* unterschied|not different|nicht verschieden|nicht anders|not longer|nicht langer"] },
    ],
    misconceptions: [
      { cap: 1, label: "a different conversion is used (10 or 1000 centimeters)",
        hint: b("Check the conversion: 1 meter is 100 centimeters.", "Prüfe die Umrechnung: 1 Meter sind 100 Zentimeter."),
        patterns: ["\\b(10|1000|1 000)\\s*(cm\\b|centim|zentim)"] },
    ],
  },
  "data-graph": {
    criteria: [
      { id: "compare", marks: 2, label: "Comparing amounts across categories",
        praise: b("You said a bar graph helps compare amounts.", "Du hast gesagt, dass man mit einem Balkendiagramm Mengen vergleichen kann."),
        hint: b("Say what you compare: how many there are in each category.", "Sage, was du vergleichst: wie viele es in jeder Kategorie gibt."),
        patterns: ["compar|vergleich|differen|unterschied|how (many|much)|wie viel|amount|\\bnumber|\\bmenge|anzahl|\\bcount|\\bzahl"] },
      { id: "extremes", marks: 2, label: "Finding the most or least from the bars",
        praise: b("You used the bars to find the most or least.", "Du hast mit den Balken das Meiste oder Wenigste gefunden."),
        hint: b("Look at the bar heights: how do you find which category has the most?", "Schau auf die Balkenhöhen: Wie findest du die Kategorie mit dem meisten?"),
        patterns: ["\\bmost\\b|\\bleast\\b|\\bmore\\b|\\bfewer\\b|\\bless\\b|biggest|smallest|highest|tallest|lowest|shortest|taller|higher|longest|meisten|wenigsten|\\bmehr\\b|\\bweniger\\b|grosste|kleinste|hochste|\\bhoher|langste|niedrigste|favou?rite|liebling|beliebt|popular"] },
    ],
  },
  "time-conversion": {
    criteria: [
      { id: "answer", marks: 2, label: "120 minutes",
        praise: b("You found 120 minutes.", "Du hast 120 Minuten herausgefunden."),
        hint: b("Work it out: 60 minutes plus another 60 minutes.", "Rechne: 60 Minuten plus noch einmal 60 Minuten."),
        patterns: ["\\b120\\b|hundred (and )?twenty|hundertzwanzig"] },
      { id: "reason", marks: 2, label: "Uses 60 minutes per hour",
        praise: b("You used 60 minutes for one hour.", "Du hast 60 Minuten für eine Stunde benutzt."),
        hint: b("Explain your thinking: one hour has 60 minutes, so two hours have 60 + 60.", "Erkläre deinen Rechenweg: Eine Stunde hat 60 Minuten, also haben zwei Stunden 60 + 60."),
        patterns: ["\\b60\\b|sixty|sechzig"] },
    ],
    misconceptions: [
      { cap: 1, label: "100 minutes per hour is used",
        hint: b("An hour has 60 minutes, not 100.", "Eine Stunde hat 60 Minuten, nicht 100."),
        patterns: ["\\b(100|200)\\s*(min\\b|minut)"] },
    ],
  },
  // ---- Questions added in the enhancement stage (rubric data only; the grading engine is unchanged) ----
  "life-cycle": {
    criteria: [
      { id: "start", marks: 2, label: "Seed comes before seedling",
        praise: b("You started the life cycle with the seed and the seedling.", "Du hast den Lebenszyklus mit Samen und Keimling begonnen."),
        hint: b("What does a bean plant start as? Put that stage first, then the next one.", "Womit beginnt eine Bohnenpflanze? Setze dieses Stadium an den Anfang, dann das nächste."),
        // Only the order seed -> seedling counts, with no other stage in between.
        patterns: ["\\bseeds?\\b(?!ling)(?:(?!adult|flower|plant)[^.!?]){0,30}seedling|samen(?:(?!pflanze|blute)[^.!?]){0,30}keimling"] },
      { id: "end", marks: 2, label: "Adult plant comes before the flower",
        praise: b("You knew the grown plant makes the flower.", "Du wusstest, dass die ausgewachsene Pflanze die Blüte bildet."),
        hint: b("Think about the end: which comes first, the grown plant or its flower?", "Denke an das Ende: Was kommt zuerst, die große Pflanze oder ihre Blüte?"),
        patterns: ["\\b(adult|grown|big|full)[ -]?(up\\s+)?plant(?:(?!seed)[^.!?]){0,40}flower|(ausgewachsene|erwachsene|grosse)\\s+pflanze(?:(?!samen|keimling)[^.!?]){0,40}blute"] },
    ],
  },
  "dark-cupboard": {
    ignore: ["dark cupboard", "dunklen schrank", "dunkler schrank"],
    criteria: [
      { id: "light", marks: 2, label: "No light (it is dark)",
        praise: b("You saw that the plant gets no light.", "Du hast erkannt, dass die Pflanze kein Licht bekommt."),
        hint: b("What is missing in a cupboard that a plant gets by a window?", "Was fehlt im Schrank, das eine Pflanze am Fenster bekommt?"),
        patterns: ["\\blight\\b|sunlight|\\bsun\\b|\\bdark|licht|sonne\\b|dunkel"],
        // Saying the light is missing is the correct idea, so it is not cancelled as a negation.
        exempt: ["\\b(no|not enough|not any|without|never gets?|doesn't get|does not get|can't get|cannot get|kein\\w*|nicht genug|ohne)\\s+(\\w+\\s+)?(sun)?(light|sun\\b|licht|sonne)"] },
      { id: "food", marks: 2, label: "Leaves need light to make food",
        praise: b("You linked light to the plant making its food.", "Du hast Licht mit der Nahrung der Pflanze verbunden."),
        hint: b("Explain why light matters: what do leaves make with it?", "Erkläre, warum Licht wichtig ist: Was machen die Blätter damit?"),
        patterns: ["food|sugar|energy|nahrung|zucker|energie|photosynth|fotosynth"],
        exempt: ["(make|making|produce|mach\\w*|bild\\w*|herstell\\w*)\\s+(\\w+\\s+)?(food|sugar|energy|nahrung|zucker|energie)", "(food|sugar|energy|nahrung|zucker|energie)\\s+(\\w+\\s+)?(make|produce|mach\\w*|bild\\w*|herstell\\w*)"] },
    ],
  },
  "fraction-of-set": {
    criteria: [
      { id: "answer", marks: 2, mentionOnly: true, label: "4 apples",
        praise: b("You found 4 red apples.", "Du hast 4 rote Äpfel gefunden."),
        hint: b("Share the 12 apples into 3 equal groups. How many are in one group?", "Verteile die 12 Äpfel auf 3 gleiche Gruppen. Wie viele sind in einer Gruppe?"),
        patterns: ["\\b4\\b|\\bfour\\b|\\bvier\\b"] },
      { id: "reason", marks: 2, dependsOn: "answer", label: "Shares 12 into 3 equal groups",
        praise: b("You showed how you shared the apples.", "Du hast gezeigt, wie du die Äpfel verteilt hast."),
        hint: b("Show your thinking: 12 shared into 3 equal groups.", "Zeige deinen Rechenweg: 12 auf 3 gleiche Gruppen verteilt."),
        patterns: ["12\\s*(÷|/|:|divided by|geteilt durch)\\s*3|\\b(three|3|drei)\\s+(equal\\s+|gleiche\\s+)?(groups?|parts?|piles?|teile?n?|gruppen|haufen)|shar\\w*|verteil|4\\s*\\+\\s*4\\s*\\+\\s*4|(3|three|drei)\\s*(x|×|\\*|times|mal)\\s*(4|four|vier)"] },
    ],
    misconceptions: [
      { cap: 1, label: "the denominator (3) is given as the answer",
        hint: b("1/3 means one of 3 equal groups, not 3 apples. Share the 12 apples into 3 groups first.", "1/3 bedeutet eine von 3 gleichen Gruppen, nicht 3 Äpfel. Verteile zuerst die 12 Äpfel auf 3 Gruppen."),
        patterns: ["\\b(3|three|drei)\\s+(red\\s+|rote\\s+)?(apples?|apfel)\\b"] },
    ],
  },
  "add-fractions": {
    criteria: [
      { id: "answer", marks: 2, label: "3/5",
        praise: b("You found 3/5.", "Du hast 3/5 herausgefunden."),
        hint: b("Count the fifths: one fifth and two more fifths.", "Zähle die Fünftel: ein Fünftel und noch zwei Fünftel."),
        patterns: ["\\b3/5\\b|three fifths|drei funftel"] },
      { id: "reason", marks: 2, dependsOn: "answer", label: "Adds the tops, keeps the fifths",
        praise: b("You explained that only the top numbers are added.", "Du hast erklärt, dass nur die oberen Zahlen addiert werden."),
        hint: b("Explain why: the pieces are all fifths, so you only add how many pieces there are.", "Erkläre warum: Alle Stücke sind Fünftel, also zählst du nur die Stücke zusammen."),
        patterns: ["1\\s*\\+\\s*2|(add|adding|added|plus|addier\\w*|zusammenzahl\\w*)\\s+(\\w+\\s+){0,2}(tops?|numerators?|zahler|oberen)|(bottom|denominator|fifths|nenner|funftel|untere\\w*)\\s+(\\w+\\s+){0,3}(same|stays?|bleib\\w*|gleich)|(same|gleiche\\w*)\\s+(bottom|denominator|nenner)"] },
    ],
    misconceptions: [
      { cap: 0, label: "the bottom numbers are added too (3/10)",
        hint: b("The pieces are still fifths. Add the top numbers only: 1 + 2 = 3, so 3/5.", "Die Stücke bleiben Fünftel. Addiere nur die oberen Zahlen: 1 + 2 = 3, also 3/5."),
        patterns: ["\\b3/10\\b|three tenths|drei zehntel"] },
    ],
  },
  "rain-gauge": {
    criteria: [
      { id: "tool", marks: 2, label: "Rain gauge named",
        praise: b("You chose the right tool, a rain gauge.", "Du hast das richtige Gerät gewählt: einen Regenmesser."),
        hint: b("Name the tool that collects rain so you can measure it.", "Nenne das Gerät, das Regen sammelt, damit man ihn messen kann."),
        patterns: ["rain ?gauge|rain ?gage|regenmesser|niederschlagsmesser|regenmessgerat"] },
      { id: "read", marks: 2, label: "How it is read (collects rain, read the level)",
        praise: b("You explained how to read it.", "Du hast erklärt, wie man es abliest."),
        hint: b("Say how it works: it collects the rain and you read the level.", "Sage, wie es funktioniert: Es sammelt den Regen und man liest die Höhe ab."),
        patterns: ["collect|catch|\\bfill|\\bline|\\bmark|ruler|scale|\\bmm\\b|millimet|\\bcm\\b|centimet|how high|water level|sammel|fang|fullt|strich|skala|lineal|zentimet|wie hoch|ables|\\blies"] },
    ],
    misconceptions: [
      { cap: 1, label: "a different weather tool is named (thermometer, barometer, wind gauge)",
        hint: b("A thermometer measures temperature. For rain you need a rain gauge.", "Ein Thermometer misst die Temperatur. Für Regen braucht man einen Regenmesser."),
        patterns: ["thermomet|termomet|barometer|anemomet|windmesser"] },
    ],
  },
  "puddle-sun": {
    criteria: [
      { id: "heat", marks: 2, label: "The sun warms the water",
        praise: b("You knew the sun warms the puddle.", "Du wusstest, dass die Sonne die Pfütze erwärmt."),
        hint: b("What does the sun do to the water in the puddle?", "Was macht die Sonne mit dem Wasser in der Pfütze?"),
        patterns: ["\\bsun\\b|\\bheat|warm|\\bhot\\b|sonne\\b|hitze|heiss"] },
      { id: "evaporation", marks: 2, dependsOn: "heat", label: "Warm water evaporates faster",
        praise: b("You explained that the warm water evaporates.", "Du hast erklärt, dass das warme Wasser verdunstet."),
        hint: b("Say where the water goes: it evaporates into the air.", "Sage, wohin das Wasser geht: Es verdunstet in die Luft."),
        patterns: ["evaporat|vapou?r|steam|into the air|goes up|go up|\\brises|turns into gas|verdunst|verdampf|dampf|in die luft|steigt"] },
    ],
  },
  "thunder-lightning": {
    criteria: [
      { id: "speed", marks: 2, label: "Speed is the reason",
        praise: b("You knew it is about speed.", "Du wusstest, dass es um Geschwindigkeit geht."),
        hint: b("Think about speed: which travels to you faster?", "Denke an die Geschwindigkeit: Was kommt schneller bei dir an?"),
        patterns: ["fast|quick|speed|schnell|geschwind"] },
      { id: "compare", marks: 2, dependsOn: "speed", label: "Light is faster than sound",
        praise: b("You compared light and sound correctly.", "Du hast Licht und Schall richtig verglichen."),
        hint: b("Compare the two: light and sound. Which one is faster?", "Vergleiche beide: Licht und Schall. Was ist schneller?"),
        patterns: ["\\blight\\b[^.!?]{0,30}(fast|quick)|\\blicht\\b[^.!?]{0,30}schnell|(sound|thunder|schall|donner|gerausch)[^.!?]{0,30}(slow|langsam)|(faster|quicker|schneller)\\s+(than|als)\\s+(the\\s+|der\\s+|das\\s+|den\\s+)?(sound|thunder|schall|donner)"] },
    ],
  },
  perimeter: {
    criteria: [
      { id: "answer", marks: 2, label: "16 cm",
        praise: b("You found 16 cm.", "Du hast 16 cm herausgefunden."),
        hint: b("Walk around the rectangle and add every side.", "Gehe einmal um das Rechteck herum und addiere jede Seite."),
        patterns: ["\\b16\\b|sixteen|sechzehn"] },
      { id: "method", marks: 2, dependsOn: "answer", label: "Adds all four sides",
        praise: b("You added all four sides.", "Du hast alle vier Seiten addiert."),
        hint: b("Show the sides you added: 5 + 3 + 5 + 3.", "Zeige, welche Seiten du addiert hast: 5 + 3 + 5 + 3."),
        patterns: ["5\\s*\\+\\s*3\\s*\\+\\s*5\\s*\\+\\s*3|5\\s*\\+\\s*5\\s*\\+\\s*3\\s*\\+\\s*3|(5|five|funf)\\s+(and|und)\\s+(3|three|drei)\\s+(and|und)\\s+(5|five|funf)|all (the\\s+)?(four\\s+)?sides|around|rundherum|alle (vier\\s+)?seiten|8\\s*(x|×|\\*|times|mal)\\s*2|2\\s*(x|×|\\*|times|mal)\\s*8"] },
    ],
    misconceptions: [
      { cap: 1, label: "the area (5 × 3 = 15) is given instead of the perimeter",
        hint: b("15 is the area (5 × 3). The perimeter is the distance all the way around: add the four sides.", "15 ist der Flächeninhalt (5 · 3). Der Umfang ist der Weg rundherum: Addiere die vier Seiten."),
        patterns: ["\\b15\\b|fifteen|funfzehn"] },
    ],
  },
  "grams-kilograms": {
    criteria: [
      { id: "answer", marks: 2, label: "2000 grams",
        praise: b("You found 2000 grams.", "Du hast 2000 Gramm herausgefunden."),
        hint: b("Remember how many grams are in one kilogram, then double it.", "Erinnere dich, wie viele Gramm ein Kilogramm hat, und verdopple es."),
        patterns: ["\\b2000\\b|\\b2 000\\b|\\b2\\.000\\b|two thousand|zweitausend"] },
      { id: "reason", marks: 2, dependsOn: "answer", label: "Uses 1000 g in 1 kg",
        praise: b("You used 1000 grams for one kilogram.", "Du hast 1000 Gramm für ein Kilogramm benutzt."),
        hint: b("Explain your thinking: 1 kg is 1000 g.", "Erkläre deinen Rechenweg: 1 kg sind 1000 g."),
        patterns: ["\\b1000\\b|\\b1 000\\b|\\b1\\.000\\b|one thousand|eintausend|(each|every|one|1|jedes?|ein)\\s+(kilo|kg|kilogram)\\w*\\s+(is|has|equals|=|hat|ist|sind)|1000\\s*(x|×|\\*|times|mal)\\s*2|2\\s*(x|×|\\*|times|mal)\\s*1000"] },
    ],
    misconceptions: [
      { cap: 1, label: "a different conversion is used (10 or 100 g per kg)",
        hint: b("Check the conversion: 1 kg is 1000 g.", "Prüfe die Umrechnung: 1 kg sind 1000 g."),
        patterns: ["\\b(20|200|20000)\\s*(g\\b|gram)"] },
    ],
  },
  "film-length": {
    criteria: [
      { id: "answer", marks: 2, label: "1 hour 30 minutes (90 minutes)",
        praise: b("You found how long the film is.", "Du hast herausgefunden, wie lange der Film dauert."),
        hint: b("Count on from 3:15: how long to 4:15, and then to 4:45?", "Zähle von 3:15 weiter: Wie lange bis 4:15 und dann bis 4:45?"),
        patterns: ["\\b90\\b|ninety|neunzig|(1|one|eine?)\\s*(hour|h|stunde)\\w*\\s*(and\\s+|und\\s+)?(30|thirty|dreissig|a half)|one and a half|an hour and a half|anderthalb|eineinhalb|1[.,]5\\s*(hours|stunden|h\\b)"] },
      { id: "reason", marks: 2, dependsOn: "answer", label: "Counts on in steps (one hour, then 30 minutes)",
        praise: b("You showed how you counted on.", "Du hast gezeigt, wie du weitergezählt hast."),
        hint: b("Show your steps: 3:15 to 4:15 is one hour, then 30 more minutes.", "Zeige deine Schritte: Von 3:15 bis 4:15 ist eine Stunde, dann noch 30 Minuten."),
        patterns: ["4:15|60\\s*\\+\\s*30|(one|1|eine)\\s+(hour|stunde)\\s+(later|to|until|bis|spater)|(then|plus|and|dann|und noch|noch)\\s+(\\w+\\s+)?(30|thirty|dreissig)\\s+(more\\s+)?(min|minut)|30\\s*(more|mehr)\\s+(min|minut)"] },
    ],
    misconceptions: [
      { cap: 1, label: "the times are subtracted like ordinary numbers (445 − 315 = 130)",
        hint: b("Clock times don’t subtract like normal numbers. Count on: one hour to 4:15, then 30 minutes.", "Uhrzeiten rechnet man nicht wie normale Zahlen. Zähle weiter: eine Stunde bis 4:15, dann 30 Minuten."),
        patterns: ["\\b130\\b"] },
    ],
  },
};

// ---- Teacher-written rubrics (enhancement stage) ----
// A teacher question carries its own criteria. They are converted to the same Rubric shape the built-in
// questions use and then run through the unchanged engine below (negation handling, "need", partial
// marks, wrong-idea caps). Built-in questions never use this path: their table entry always wins.

/** One criterion written by the teacher. Each line in `ideas` is one accepted idea; a line may list
 *  alternative wordings separated by " / " with spaces (for example "root / roots / Wurzel"), so that
 *  "3/4" without spaces stays one fraction. */
export interface CustomCriterion { id: string; label: string; marks: number; ideas: string[]; need?: number; partial?: boolean }
/** A wrong idea that caps the suggested mark when the answer states it. */
export interface CustomWrongIdea { label: string; ideas: string[]; cap: number }
export interface CustomRubric { criteria: CustomCriterion[]; wrongIdeas?: CustomWrongIdea[] }

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Turns one teacher line into a pattern. Wording is matched as plain text (never as a regular expression),
 *  after the same folding as answers; a word may be followed by an ending ("root" matches "roots"). */
export function customIdeaPattern(line: string) {
  const alternatives = line.split(/\s+\/\s+/).map((part) => foldText(part)).filter((part) => part.length > 0);
  if (alternatives.length === 0) return "";
  return alternatives.map((part) => `(?<![a-z0-9])${escapeRegex(part).replace(/ /g, "\\s+")}${/[0-9]$/.test(part) ? "(?![0-9])" : ""}`).join("|");
}

export function compileCustomRubric(rubric: CustomRubric): Rubric {
  return {
    criteria: rubric.criteria.map((criterion) => ({
      id: criterion.id,
      marks: criterion.marks,
      label: criterion.label,
      praise: b(`You included: ${criterion.label}.`, `Du hast daran gedacht: ${criterion.label}.`),
      hint: b(`Add this to your answer: ${criterion.label}.`, `Ergänze in deiner Antwort: ${criterion.label}.`),
      patterns: criterion.ideas.map(customIdeaPattern).filter((pattern) => pattern.length > 0),
      need: criterion.need,
      partial: criterion.partial,
    })),
    misconceptions: (rubric.wrongIdeas ?? []).map((wrong) => ({
      cap: wrong.cap,
      label: wrong.label,
      hint: b(`Check this part of your answer again: ${wrong.label}.`, `Prüfe diesen Teil deiner Antwort noch einmal: ${wrong.label}.`),
      patterns: wrong.ideas.map(customIdeaPattern).filter((pattern) => pattern.length > 0),
    })),
  };
}

// Negation handling. An idea is not credited when the clause it sits in negates it:
// "plants do not need water", "the wind cannot carry them", "2/4 is not the same".
// Clause boundaries (commas, "but", "aber") keep corrections such as
// "the roots don't make food, they take in water" from being penalised.
const NEGATION = /\b(not|no|never|cannot|neither|nor|nothing|nobody|nowhere|nicht|nichts|kein\w*|nie|niemals|weder|niemand|nirgends)\b|n't/;
const DOUBLE_NEGATION = /\b(without|ohne)\b/;
const NOT_ONLY = /\b(not only|not just|nicht nur|nicht bloss)\b/g;
const CLAUSE_BREAK = /[.,;:!?]|\b(but|aber|sondern|however)\b/;
// English negates right after the subject ("the wind cannot"). German often negates at the end of the
// clause ("der Wind kann Samen nicht wegtragen"), so up to three words may come first. "and/und/or/oder"
// end the look-ahead so "Wasser und kein Licht" still credits the water.
const NEGATION_AFTER = /^\s*((is|are|was|were|do|does|did|can|could|will|would|has|have|had)\s+(not|never|no)\b|\w+n't\b|cannot\b|never\b|(\w+\s+){0,3}(nicht|nichts|nie|niemals|kein\w*)\b)/;
const AFTER_BREAK = /\b(and|or|und|oder)\b/;
// "sieht nicht, wo am meisten ist": the clause after the comma is the object of the negated verb.
const OBJECT_CLAUSE_COMMA = /,\s+(?=(wo|was|wie|ob|dass|welche\w*|wer|which|what|where|whether|how)\b)/g;
const DIRECT_NEGATION = /\b(no|not|never|nicht|kein\w*|nie)\s+(\w+\s+)?$/;

function lastClause(value: string) {
  const pieces = value.split(CLAUSE_BREAK).filter((piece) => piece !== undefined);
  return pieces[pieces.length - 1] ?? "";
}

function isNegated(text: string, start: number, end: number, mentionOnly = false) {
  if (mentionOnly) {
    const before = lastClause(text.slice(0, start));
    return DIRECT_NEGATION.test(before) && !DOUBLE_NEGATION.test(before);
  }
  const matchText = text.slice(start, end);
  const insideBreak = CLAUSE_BREAK.test(matchText);
  // Words of the same clause that lead up to the idea (at most six), unless the match itself spans a clause break.
  const lead = insideBreak ? "" : lastClause(text.slice(0, start)).split(" ").slice(-7).join(" ");
  const clause = `${lead} ${lastClause(matchText)}`;
  const after = (text.slice(end).split(CLAUSE_BREAK)[0] ?? "").split(AFTER_BREAK)[0] ?? "";
  const negated = NEGATION.test(clause) || NEGATION_AFTER.test(after);
  // "Without water, light, air and soil a plant cannot grow": "without ... not" cancels out across the sentence.
  const sentence = text.slice(0, start).split(/[.!?]/).pop() ?? "";
  return negated && !DOUBLE_NEGATION.test(clause) && !DOUBLE_NEGATION.test(sentence);
}

function patternFound(text: string, pattern: string, mentionOnly = false) {
  const expression = new RegExp(pattern, "g");
  let match: RegExpExecArray | null;
  let negatedOnly = false;
  while ((match = expression.exec(text)) !== null) {
    if (match[0].length === 0) { expression.lastIndex += 1; continue; }
    if (isNegated(text, match.index, match.index + match[0].length, mentionOnly)) negatedOnly = true;
    else return { found: true, negated: false };
  }
  return { found: false, negated: negatedOnly };
}

function stem(term: string) {
  const folded = foldText(term);
  return folded.length > 4 ? folded.replace(/(en|er|es|e|s)$/, "") : folded;
}

/** Fallback for questions without a rubric (e.g. records from older saved data). */
function gradeByKeyTerms(question: QuestionDefinition, text: string): GradeResult {
  const folded = foldText(text);
  const matchedTerms = question.keyTerms.filter((term) => folded.includes(stem(term)));
  const missingTerms = question.keyTerms.filter((term) => !matchedTerms.includes(term));
  const score = question.keyTerms.length ? Math.round((matchedTerms.length / question.keyTerms.length) * question.maxScore) : 0;
  return {
    score,
    matchedTerms,
    missingTerms,
    feedback: score >= question.maxScore * 0.75 ? question.positiveFeedback : question.supportFeedback,
    rationale: `${matchedTerms.length} of ${question.keyTerms.length} expected ideas were found in the answer.`,
  };
}

/** Review (read-only): the marking guide for a question, as the grader uses it. Never changes a mark. */
export function rubricGuide(question: QuestionDefinition): { criteria: { label: string; marks: number; partial: boolean; need: number }[]; wrongIdeas: { label: string; cap: number }[] } {
  const rubric = rubrics[question.id] ?? (question.rubric ? compileCustomRubric(question.rubric) : undefined);
  if (!rubric) return { criteria: question.keyTerms.map((term) => ({ label: term, marks: Math.max(1, Math.round(question.maxScore / Math.max(1, question.keyTerms.length))), partial: false, need: 1 })), wrongIdeas: [] };
  return {
    criteria: rubric.criteria.map((criterion) => ({ label: criterion.label, marks: criterion.marks, partial: Boolean(criterion.partial), need: criterion.need ?? 1 })),
    wrongIdeas: (rubric.misconceptions ?? []).map((item) => ({ label: item.label, cap: item.cap })),
  };
}

/** Learning insights (read-only): the known wrong ideas an answer asserts, found with the same matching
 *  as gradeAnswer. It never changes a mark; gradeAnswer above is unchanged. */
export function findWrongIdeas(question: QuestionDefinition, text: string): string[] {
  const rubric = rubrics[question.id] ?? (question.rubric ? compileCustomRubric(question.rubric) : undefined);
  if (!rubric?.misconceptions?.length) return [];
  let folded = foldText(text);
  if (!folded) return [];
  (rubric.ignore ?? []).forEach((fragment) => { folded = folded.split(fragment).join(" "); });
  folded = folded.replace(NOT_ONLY, " ").replace(OBJECT_CLAUSE_COMMA, " ");
  return rubric.misconceptions.filter((item) => item.patterns.some((pattern) => patternFound(folded, pattern).found)).map((item) => item.label);
}

export function gradeAnswer(question: QuestionDefinition, text: string, language: Language): GradeResult {
  // Built-in rubric first (unchanged behaviour); a teacher-written rubric only for questions that have no built-in one.
  const rubric = rubrics[question.id] ?? (question.rubric ? compileCustomRubric(question.rubric) : undefined);
  if (!rubric) return gradeByKeyTerms(question, text);
  let folded = foldText(text);
  if (!folded) {
    return { score: 0, matchedTerms: [], missingTerms: rubric.criteria.map((criterion) => criterion.label), feedback: question.supportFeedback, rationale: "No answer text was found, so no marks are suggested. Check the original work." };
  }
  (rubric.ignore ?? []).forEach((fragment) => { folded = folded.split(fragment).join(" "); });
  folded = folded.replace(NOT_ONLY, " ").replace(OBJECT_CLAUSE_COMMA, " ");

  const earnedById: Record<string, number> = {};
  const negatedNotes: string[] = [];
  const blocked: string[] = [];
  rubric.criteria.forEach((criterion) => {
    const results = criterion.patterns.map((pattern) => patternFound(folded, pattern, Boolean(criterion.mentionOnly)));
    const exempt = (criterion.exempt ?? []).filter((pattern) => new RegExp(pattern).test(folded)).length;
    const distinct = results.filter((result) => result.found).length + exempt;
    if (results.some((result) => result.negated)) negatedNotes.push(criterion.label);
    const need = criterion.need ?? 1;
    let earned = criterion.partial ? Math.floor((criterion.marks * Math.min(distinct, need)) / need) : distinct >= need ? criterion.marks : 0;
    if (earned > 0 && criterion.dependsOn && !earnedById[criterion.dependsOn]) { earned = 0; blocked.push(criterion.label); }
    earnedById[criterion.id] = earned;
  });

  // A misconception only counts when the answer asserts it ("an hour is not 100 minutes" is fine).
  const misconceptions = (rubric.misconceptions ?? []).filter((item) => item.patterns.some((pattern) => patternFound(folded, pattern).found));
  const rawScore = rubric.criteria.reduce((sum, criterion) => sum + earnedById[criterion.id], 0);
  const cap = misconceptions.length ? Math.min(...misconceptions.map((item) => item.cap)) : question.maxScore;
  const score = Math.max(0, Math.min(question.maxScore, rawScore, cap));

  const met = rubric.criteria.filter((criterion) => earnedById[criterion.id] > 0);
  const unmet = rubric.criteria.filter((criterion) => earnedById[criterion.id] < criterion.marks);
  const matchedTerms = met.map((criterion) => `${criterion.label} (${earnedById[criterion.id]}/${criterion.marks})`);
  const missingTerms = unmet.map((criterion) => earnedById[criterion.id] > 0 ? `${criterion.label} (partly)` : criterion.label);

  const parts: string[] = [`Suggested ${score} of ${question.maxScore} marks.`];
  if (met.length) parts.push(`${cap < rawScore ? "Found in the text before the cap" : "Credited"}: ${matchedTerms.join("; ")}.`);
  if (unmet.length) parts.push(`Missing or incomplete: ${missingTerms.join("; ")}.`);
  if (blocked.length) parts.push(`Not credited without the first step: ${blocked.join("; ")}.`);
  if (negatedNotes.length) parts.push(`The answer negates an expected idea ("not", "no", "never"), so it was not credited: ${negatedNotes.join("; ")}. Please check the wording.`);
  if (misconceptions.length) parts.push(`Possible misconception: ${misconceptions.map((item) => item.label).join("; ")}. The suggestion is capped at ${cap} mark${cap === 1 ? "" : "s"}.`);

  let feedback: string;
  if (score >= question.maxScore) feedback = question.positiveFeedback;
  else if (misconceptions.length) feedback = misconceptions[0].hint[language];
  else if (score === 0) feedback = question.supportFeedback;
  else {
    const praise = met.slice(0, 2).map((criterion) => criterion.praise[language]).join(" ");
    const next = unmet[0];
    feedback = `${praise} ${language === "de" ? "Nächster Schritt:" : "Next step:"} ${next ? next.hint[language] : question.supportFeedback}`.trim();
  }
  return { score, matchedTerms, missingTerms, feedback, rationale: parts.join(" ") };
}

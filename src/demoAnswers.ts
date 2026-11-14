// Synthetic Grade 4 answers for the demo, written the way children actually write,
// plus a small OCR simulator that introduces the kind of slips a teacher has to correct.
import type { Language } from "./assessmentData";

export type DemoLevel = "strong" | "developing" | "emerging";

type AnswerSet = Record<DemoLevel, [string, string]>;

const bank: Record<string, Record<Language, AnswerSet>> = {
  "plant-parts": {
    en: {
      strong: ["The roots take in water and the stem holds the plant up. Leaves make food.", "A plant has leaves and roots. The roots drink water from the ground."],
      developing: ["leaf and flower and stem", "Roots and a stem. They are green."],
      emerging: ["the stem", "A plant has green bits and it grows."],
    },
    de: {
      strong: ["Die Wurzel nimmt Wasser auf und der Stängel hält die Pflanze. Blätter machen Nahrung.", "Eine Pflanze hat Blätter und Wurzeln. Die Wurzeln trinken Wasser aus dem Boden."],
      developing: ["Blatt und Blüte und Stängel", "Wurzeln und ein Stängel. Sie sind grün."],
      emerging: ["der Stängel", "Eine Pflanze hat grüne Sachen und wächst."],
    },
  },
  pollination: {
    en: {
      strong: ["Bees carry pollen from one flower to another, and then the plant can make seeds.", "The wind or a bee brings pollen to the next flower so new seeds can grow."],
      developing: ["Bees take the pollen to another flower.", "The bees go from flower to flower with pollen."],
      emerging: ["Bees like flowers.", "It helps the plant get bigger."],
    },
    de: {
      strong: ["Bienen tragen Pollen von einer Blüte zur nächsten. Dann kann die Pflanze Samen bilden.", "Der Wind oder eine Biene bringt Pollen zur nächsten Blüte, damit neue Samen wachsen."],
      developing: ["Bienen bringen den Pollen zu einer anderen Blüte.", "Die Bienen fliegen mit Pollen von Blüte zu Blüte."],
      emerging: ["Bienen mögen Blumen.", "Es hilft der Pflanze größer zu werden."],
    },
  },
  "seed-dispersal": {
    en: {
      strong: ["The wind can carry light seeds away from the parent plant.", "Some seeds stick to an animal's fur and drop off in a new place."],
      developing: ["By the wind.", "Animals and water."],
      emerging: ["They fall down.", "The seeds grow in the ground."],
    },
    de: {
      strong: ["Der Wind kann leichte Samen von der Mutterpflanze wegtragen.", "Manche Samen bleiben im Fell von einem Tier hängen und fallen an einem neuen Ort ab."],
      developing: ["Mit dem Wind.", "Tiere und Wasser."],
      emerging: ["Sie fallen runter.", "Die Samen wachsen in der Erde."],
    },
  },
  "plant-needs": {
    en: {
      strong: ["Plants need water, sunlight, air, and nutrients from soil to grow.", "It needs sun and water and good soil and air."],
      developing: ["Water and sun.", "You have to water it and put it in the light."],
      emerging: ["Water.", "It needs love and someone to look after it."],
    },
    de: {
      strong: ["Pflanzen brauchen Wasser, Sonnenlicht, Luft und Nährstoffe aus dem Boden.", "Sie braucht Sonne und Wasser und gute Erde und Luft."],
      developing: ["Wasser und Sonne.", "Man muss sie gießen und ins Licht stellen."],
      emerging: ["Wasser.", "Sie braucht Liebe und jemanden, der aufpasst."],
    },
  },
  "fraction-meaning": {
    en: {
      strong: ["It means three equal parts out of four equal parts.", "You cut a cake into 4 equal pieces and take 3 of them."],
      developing: ["There are 3 pieces and 4 pieces.", "You have 3 and the bottom is 4 pieces."],
      emerging: ["It means 4 parts out of 3.", "It is two numbers with a line."],
    },
    de: {
      strong: ["Es bedeutet drei gleich große Teile von vier gleich großen Teilen.", "Man schneidet einen Kuchen in 4 gleiche Stücke und nimmt 3 davon."],
      developing: ["Es gibt 3 Stücke und 4 Stücke.", "Man hat 3 und unten sind 4 Stücke."],
      emerging: ["Es bedeutet 4 Teile von 3.", "Es sind zwei Zahlen mit einem Strich."],
    },
  },
  "compare-fractions": {
    en: {
      strong: ["One half is larger. If a whole is split into the same size pieces, one half is more than one quarter.", "1/2 is bigger because the pizza is only cut into 2 pieces so each piece is bigger."],
      developing: ["One half is larger.", "1/2 because it is bigger."],
      emerging: ["1/4 is bigger because 4 is bigger than 2.", "They are both fractions."],
    },
    de: {
      strong: ["Eine Hälfte ist größer. Bei demselben Ganzen ist ein Teil von zwei größer als ein Teil von vier.", "1/2 ist größer, weil die Pizza nur in 2 Stücke geschnitten wird und jedes Stück größer ist."],
      developing: ["Die Hälfte ist größer.", "1/2, weil es größer ist."],
      emerging: ["1/4 ist größer, weil 4 größer als 2 ist.", "Beides sind Brüche."],
    },
  },
  "fraction-model": {
    en: {
      strong: ["I ate two slices out of eight, so I ate 2/8 of the pizza.", "2/8 because there are 8 slices and I ate 2."],
      developing: ["2/8", "It is one quarter."],
      emerging: ["8/2", "I ate 2 slices."],
    },
    de: {
      strong: ["Ich habe zwei von acht Stücken gegessen. Das ist 2/8 der Pizza.", "2/8, weil es 8 Stücke gibt und ich 2 gegessen habe."],
      developing: ["2/8", "Es ist ein Viertel."],
      emerging: ["8/2", "Ich habe 2 Stücke gegessen."],
    },
  },
  "equivalent-fractions": {
    en: {
      strong: ["2/4 is equal to 1/2 because both show the same half of a whole.", "4/8, because if you double the top and the bottom it is still the same amount."],
      developing: ["2/4", "I think 3/6."],
      emerging: ["1/4", "2/2 because it has a 2."],
    },
    de: {
      strong: ["2/4 ist gleich 1/2, weil beide denselben Anteil eines Ganzen zeigen.", "4/8, weil man oben und unten verdoppelt und es gleich viel bleibt."],
      developing: ["2/4", "Ich glaube 3/6."],
      emerging: ["1/4", "2/2, weil da eine 2 ist."],
    },
  },
  "water-cycle": {
    en: {
      strong: ["The sun warms water, and water vapor rises into clouds. It later falls as rain.", "The sun heats the puddle and the water evaporates. It makes a cloud and then it rains."],
      developing: ["It goes into a cloud and rains.", "The sun makes the puddle go away. Later it rains."],
      emerging: ["It rains.", "The puddle gets smaller."],
    },
    de: {
      strong: ["Die Sonne erwärmt Wasser. Wasserdampf steigt auf und bildet Wolken. Später fällt Regen.", "Die Sonne macht die Pfütze heiß und das Wasser verdunstet. Es wird eine Wolke und dann regnet es."],
      developing: ["Es geht in eine Wolke und regnet.", "Die Sonne macht die Pfütze weg. Später regnet es."],
      emerging: ["Es regnet.", "Die Pfütze wird kleiner."],
    },
  },
  "measure-weather": {
    en: {
      strong: ["Use a thermometer to measure the temperature, record the number, and include it in the forecast.", "I look at the thermometer every morning and write the number in a table."],
      developing: ["With a thermometer.", "You use a thermometer."],
      emerging: ["I go outside and feel if it is cold.", "Write down if it is hot or cold."],
    },
    de: {
      strong: ["Mit einem Thermometer messe ich die Temperatur, notiere den Wert und ergänze damit die Vorhersage.", "Ich schaue jeden Morgen auf das Thermometer und schreibe die Zahl in eine Tabelle."],
      developing: ["Mit einem Thermometer.", "Man benutzt ein Thermometer."],
      emerging: ["Ich gehe raus und fühle, ob es kalt ist.", "Aufschreiben, ob es heiß oder kalt ist."],
    },
  },
  "weather-patterns": {
    en: {
      strong: ["Clouds can cool as they rise. Water droplets collect and may become heavy enough to fall as rain.", "Dark clouds are full of water drops. When they get too heavy the rain falls."],
      developing: ["Because there is water in the cloud.", "The clouds have rain drops in them."],
      emerging: ["Because it gets dark.", "Dark clouds look scary and then it rains."],
    },
    de: {
      strong: ["Wolken können beim Aufsteigen abkühlen. Wassertropfen sammeln sich und fallen als Regen, wenn sie schwer genug sind.", "Dunkle Wolken sind voll mit Wassertropfen. Wenn sie zu schwer werden, fällt der Regen."],
      developing: ["Weil Wasser in der Wolke ist.", "In den Wolken sind Regentropfen."],
      emerging: ["Weil es dunkel wird.", "Dunkle Wolken sehen gruselig aus und dann regnet es."],
    },
  },
  "length-measure": {
    en: {
      strong: ["100 centimeters make 1 meter, so both measure the same length.", "There are 100 cm in a meter. They are the same, just different units."],
      developing: ["100 centimeters.", "A hundred."],
      emerging: ["10 centimeters.", "A meter is bigger."],
    },
    de: {
      strong: ["100 Zentimeter sind 1 Meter. Beide beschreiben dieselbe Länge.", "Ein Meter hat 100 cm. Das ist gleich lang, nur eine andere Einheit."],
      developing: ["100 Zentimeter.", "Hundert."],
      emerging: ["10 Zentimeter.", "Ein Meter ist größer."],
    },
  },
  "data-graph": {
    en: {
      strong: ["A bar graph shows categories so we can compare them and see which has the most.", "You can see how many there are of each thing and which bar is the tallest."],
      developing: ["You can compare things.", "Which one has the most."],
      emerging: ["It has bars.", "It shows colours."],
    },
    de: {
      strong: ["Ein Balkendiagramm zeigt Kategorien. Wir können sie vergleichen und sehen, wo es am meisten gibt.", "Man sieht, wie viele es von jeder Sache gibt und welcher Balken am höchsten ist."],
      developing: ["Man kann Sachen vergleichen.", "Wer am meisten hat."],
      emerging: ["Es hat Balken.", "Es zeigt Farben."],
    },
  },
  "time-conversion": {
    en: {
      strong: ["There are 60 minutes in one hour, so two hours have 120 minutes.", "120, because 60 + 60 = 120."],
      developing: ["120 minutes.", "One hour is 60 minutes."],
      emerging: ["200 minutes.", "Two hours is a long time."],
    },
    de: {
      strong: ["Eine Stunde hat 60 Minuten. Zwei Stunden haben also 120 Minuten.", "120, weil 60 + 60 = 120."],
      developing: ["120 Minuten.", "Eine Stunde hat 60 Minuten."],
      emerging: ["200 Minuten.", "Zwei Stunden sind eine lange Zeit."],
    },
  },
  // ---- Questions added in the enhancement stage ----
  "life-cycle": {
    en: {
      strong: ["Seed, then seedling, then adult plant, then flower.", "A seed grows into a seedling. Then it becomes an adult plant and makes a flower."],
      developing: ["seed, seedling, flower, adult plant", "First the seed and then it is a seedling."],
      emerging: ["The plant grows big and gets flowers.", "Flower, adult plant, seedling, seed."],
    },
    de: {
      strong: ["Samen, dann Keimling, dann ausgewachsene Pflanze, dann Blüte.", "Aus dem Samen wird ein Keimling. Dann wird es eine große Pflanze und bildet eine Blüte."],
      developing: ["Samen, Keimling, Blüte, ausgewachsene Pflanze", "Zuerst der Samen und dann ist es ein Keimling."],
      emerging: ["Die Pflanze wird groß und bekommt Blüten.", "Blüte, ausgewachsene Pflanze, Keimling, Samen."],
    },
  },
  "dark-cupboard": {
    en: {
      strong: ["There is no light in the cupboard, and the leaves need sunlight to make food.", "It is too dark. Without light the leaves cannot make food for the plant."],
      developing: ["Because it is dark in there.", "It needs the sun."],
      emerging: ["Because it is lonely in the cupboard.", "It needs more water."],
    },
    de: {
      strong: ["Im Schrank gibt es kein Licht, und die Blätter brauchen Sonnenlicht, um Nahrung zu machen.", "Es ist zu dunkel. Ohne Licht können die Blätter keine Nahrung machen."],
      developing: ["Weil es da drin dunkel ist.", "Sie braucht die Sonne."],
      emerging: ["Weil sie im Schrank einsam ist.", "Sie braucht mehr Wasser."],
    },
  },
  "fraction-of-set": {
    en: {
      strong: ["4 apples are red, because 12 shared into 3 equal groups is 4 in each group.", "12 ÷ 3 = 4, so 4 are red."],
      developing: ["4 apples.", "Four are red."],
      emerging: ["3 apples are red.", "12 apples."],
    },
    de: {
      strong: ["4 Äpfel sind rot, weil man 12 in 3 gleiche Gruppen aufteilt und in jeder Gruppe 4 sind.", "12 : 3 = 4, also sind 4 rot."],
      developing: ["4 Äpfel.", "Vier sind rot."],
      emerging: ["3 Äpfel sind rot.", "12 Äpfel."],
    },
  },
  "add-fractions": {
    en: {
      strong: ["3/5, because 1 + 2 = 3 fifths and the bottom stays the same.", "They ate 3/5. You add the tops and keep the fifths."],
      developing: ["3/5", "three fifths"],
      emerging: ["3/10", "2/5"],
    },
    de: {
      strong: ["3/5, weil 1 + 2 = 3 Fünftel sind und der Nenner gleich bleibt.", "Sie haben 3/5 gegessen. Man addiert die Zähler und die Fünftel bleiben."],
      developing: ["3/5", "drei Fünftel"],
      emerging: ["3/10", "2/5"],
    },
  },
  "rain-gauge": {
    en: {
      strong: ["A rain gauge. It collects the rain and you read the line in millimeters.", "You use a rain gauge. It catches the rain and you check how high the water is."],
      developing: ["A rain gauge.", "rain gauge"],
      emerging: ["A thermometer.", "An umbrella."],
    },
    de: {
      strong: ["Ein Regenmesser. Er sammelt den Regen und man liest die Millimeter ab.", "Man nimmt einen Regenmesser. Er fängt den Regen und man schaut, wie hoch das Wasser steht."],
      developing: ["Ein Regenmesser.", "Regenmesser"],
      emerging: ["Ein Thermometer.", "Ein Regenschirm."],
    },
  },
  "puddle-sun": {
    en: {
      strong: ["The sun heats the water, so it evaporates faster into the air.", "On a sunny day it is hot, and the water turns into vapor more quickly."],
      developing: ["Because the sun is hot.", "The sun warms it."],
      emerging: ["Because clouds are wet.", "The puddle goes into the ground."],
    },
    de: {
      strong: ["Die Sonne erwärmt das Wasser, darum verdunstet es schneller.", "An einem sonnigen Tag ist es heiß, und das Wasser wird schneller zu Dampf."],
      developing: ["Weil die Sonne heiß ist.", "Die Sonne wärmt sie."],
      emerging: ["Weil Wolken nass sind.", "Die Pfütze geht in den Boden."],
    },
  },
  "thunder-lightning": {
    en: {
      strong: ["Light travels faster than sound, so we see the flash before the thunder.", "The thunder sound is slow, and the light is very fast."],
      developing: ["Because it is fast.", "Lightning is quicker."],
      emerging: ["Because the thunder is far away.", "The lightning comes first."],
    },
    de: {
      strong: ["Licht ist schneller als Schall, darum sehen wir den Blitz vor dem Donner.", "Der Donner ist langsam, und das Licht ist sehr schnell."],
      developing: ["Weil es schnell ist.", "Der Blitz ist schneller."],
      emerging: ["Weil der Donner weit weg ist.", "Der Blitz kommt zuerst."],
    },
  },
  perimeter: {
    en: {
      strong: ["16 cm, because 5 + 3 + 5 + 3 = 16.", "You add all four sides: 5 and 3 and 5 and 3 is 16 cm."],
      developing: ["16 cm", "It is 16."],
      emerging: ["15 cm", "8 cm"],
    },
    de: {
      strong: ["16 cm, weil 5 + 3 + 5 + 3 = 16 ist.", "Man addiert alle vier Seiten: 5 und 3 und 5 und 3 sind 16 cm."],
      developing: ["16 cm", "Es sind 16."],
      emerging: ["15 cm", "8 cm"],
    },
  },
  "grams-kilograms": {
    en: {
      strong: ["2000 grams, because 1 kg is 1000 g.", "There are 1000 g in each kilo, so 2 kg is 2000 g."],
      developing: ["2000 g", "Two thousand grams."],
      emerging: ["200 grams", "2 grams"],
    },
    de: {
      strong: ["2000 Gramm, weil 1 kg 1000 g hat.", "In jedem Kilo sind 1000 g, also sind 2 kg 2000 g."],
      developing: ["2000 g", "Zweitausend Gramm."],
      emerging: ["200 Gramm", "2 Gramm"],
    },
  },
  "film-length": {
    en: {
      strong: ["1 hour and 30 minutes, because 3:15 to 4:15 is one hour and then 30 more minutes.", "90 minutes. 60 + 30 = 90."],
      developing: ["90 minutes.", "One and a half hours."],
      emerging: ["130 minutes.", "2 hours."],
    },
    de: {
      strong: ["1 Stunde und 30 Minuten, weil es von 3:15 bis 4:15 eine Stunde ist und dann noch 30 Minuten.", "90 Minuten. 60 + 30 = 90."],
      developing: ["90 Minuten.", "Eineinhalb Stunden."],
      emerging: ["130 Minuten.", "2 Stunden."],
    },
  },
};

/** Small stable hash so the same record always gets the same synthetic answer and OCR slip. */
export function hashSeed(value: string) {
  let hash = 7;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) % 100003;
  return hash;
}

export function demoAnswerFor(questionId: string, language: Language, level: DemoLevel, variant: number): string | undefined {
  const set = bank[questionId]?.[language]?.[level];
  return set ? set[Math.abs(variant) % set.length] : undefined;
}

const slips: Array<[RegExp, string]> = [
  [/rn/, "m"], [/m/, "rn"], [/cl/, "d"], [/ä/, "a"], [/ü/, "u"], [/ö/, "o"], [/ß/, "B"],
  [/l/, "1"], [/o/, "0"], [/e/, "c"], [/h/, "b"], [/i/, "l"], [/t/, "f"], [/s/, "5"],
];
const digitSlips: Array<[RegExp, string]> = [[/8/, "B"], [/0/, "O"], [/1/, "l"], [/5/, "S"], [/6/, "G"], [/2/, "Z"]];

function slipWord(word: string, seed: number, table: Array<[RegExp, string]>) {
  for (let offset = 0; offset < table.length; offset += 1) {
    const [from, to] = table[(seed + offset) % table.length];
    // Skip the first letter so the word stays recognisable, as real OCR slips usually do.
    const body = word.slice(1);
    if (from.test(body)) return word[0] + body.replace(from, to);
  }
  return word;
}

/** Returns the text as a scanner might read it: usually one misread word in a longer answer. */
export function simulateOcr(text: string, seed: number): { text: string; uncertain: string[]; confidence: number } {
  const clean = { text, uncertain: [], confidence: 93 + (seed % 6) };
  const tokens = text.split(/(\s+)/);
  const words = tokens.map((token, index) => ({ token, index })).filter(({ token }) => /^[A-Za-zÄÖÜäöüß]{5,}[.,;:!?]?$/.test(token));
  const numbers = tokens.map((token, index) => ({ token, index })).filter(({ token }) => /\d/.test(token));
  let target: { token: string; index: number } | undefined;
  let table = slips;
  if (words.length && (seed % 4 !== 3 || !numbers.length)) {
    const byLength = [...words].sort((a, c) => c.token.length - a.token.length || a.index - c.index);
    target = byLength[Math.min(byLength.length - 1, seed % 2)];
  } else if (numbers.length) {
    target = numbers[seed % numbers.length];
    table = digitSlips;
  }
  if (!target) return clean;
  const slipped = slipWord(target.token, seed, table);
  if (slipped === target.token) return clean;
  tokens[target.index] = slipped;
  return { text: tokens.join(""), uncertain: [slipped.replace(/[.,;:!?]$/, "")], confidence: 68 + (seed % 14) };
}

// Practise at home: one short, practical activity per topic, in English and German.
// Written for parents: everyday materials, about 10 minutes, no teacher knowledge needed.
import type { Language } from "./assessmentData";

export interface HomeActivity { title: string; need: string; steps: string[] }
type Bilingual = Record<Language, HomeActivity>;
const a = (title: string, need: string, steps: string[]): HomeActivity => ({ title, need, steps });

export const ACTIVITY_MINUTES = 10;

export const homeActivities: Record<string, Bilingual> = {
  "plant-vocabulary": {
    en: a("Plant part hunt", "A house plant or a plant outside", ["Find a plant together and point to the root (or where it goes into the soil), the stem, a leaf and a flower if there is one.", "For each part, ask your child: “What job does this part do?”", "Let your child draw the plant and label two parts with their jobs."]),
    de: a("Pflanzenteile-Suche", "Eine Zimmerpflanze oder eine Pflanze draußen", ["Sucht gemeinsam eine Pflanze und zeigt auf die Wurzel (oder wo sie in die Erde geht), den Stängel, ein Blatt und, wenn vorhanden, eine Blüte.", "Fragen Sie bei jedem Teil: „Welche Aufgabe hat dieser Teil?“", "Lassen Sie Ihr Kind die Pflanze zeichnen und zwei Teile mit ihrer Aufgabe beschriften."]),
  },
  "seed-dispersal": {
    en: a("How do seeds travel?", "A few seeds from fruit or a walk (apple pips, a dandelion, a maple seed)", ["Collect two or three different seeds together.", "Look at each one: is it light, sticky, inside a fruit, or does it have wings?", "Ask your child to guess how each seed could travel away from its plant, and test one by blowing or dropping it."]),
    de: a("Wie reisen Samen?", "Ein paar Samen aus Obst oder vom Spaziergang (Apfelkerne, Pusteblume, Ahornsamen)", ["Sammelt zusammen zwei oder drei verschiedene Samen.", "Schaut euch jeden an: Ist er leicht, klebrig, in einer Frucht oder hat er Flügel?", "Lassen Sie Ihr Kind raten, wie jeder Samen von seiner Pflanze wegkommen könnte, und probiert es mit Pusten oder Fallenlassen aus."]),
  },
  "plant-needs": {
    en: a("Two-plant experiment", "Two small cups, soil or cotton wool, a few beans or cress seeds", ["Plant seeds in both cups and water them.", "Put one cup by a window and one in a dark cupboard.", "Check together every day for a week and talk about what is different and why."]),
    de: a("Experiment mit zwei Pflanzen", "Zwei kleine Becher, Erde oder Watte, ein paar Bohnen oder Kressesamen", ["Säen Sie in beide Becher Samen und gießen Sie sie.", "Stellen Sie einen Becher ans Fenster und einen in einen dunklen Schrank.", "Schaut eine Woche lang jeden Tag nach und sprecht darüber, was anders ist und warum."]),
  },
  "plant-life-cycle": {
    en: a("Life cycle cards", "Paper and pencils", ["Draw four cards together: a seed, a seedling, a grown plant and a flower.", "Mix the cards up and let your child put them in order.", "Ask: “What does the flower make that starts the cycle again?”"]),
    de: a("Lebenszyklus-Karten", "Papier und Stifte", ["Malt zusammen vier Karten: einen Samen, einen Keimling, eine große Pflanze und eine Blüte.", "Mischen Sie die Karten und lassen Sie Ihr Kind sie ordnen.", "Fragen Sie: „Was bildet die Blüte, damit alles wieder von vorn beginnt?“"]),
  },
  "fraction-meaning": {
    en: a("Fraction snack", "A sandwich, pizza slice or bar of chocolate", ["Cut the food into 4 equal pieces together.", "Ask your child to take 3 pieces and say the fraction (3 out of 4 = 3/4).", "Try again with a different number of pieces."]),
    de: a("Bruch-Snack", "Ein Brot, ein Stück Pizza oder eine Tafel Schokolade", ["Schneidet das Essen zusammen in 4 gleich große Stücke.", "Lassen Sie Ihr Kind 3 Stücke nehmen und den Bruch sagen (3 von 4 = 3/4).", "Probiert es noch einmal mit einer anderen Anzahl von Stücken."]),
  },
  "fraction-comparison": {
    en: a("Bigger slice?", "Two paper circles of the same size, scissors", ["Fold one circle into 2 equal parts and the other into 4 equal parts, then cut them.", "Hold one half next to one quarter.", "Ask your child which piece is bigger and why: fewer pieces means bigger pieces."]),
    de: a("Welches Stück ist größer?", "Zwei gleich große Papierkreise, eine Schere", ["Falten Sie einen Kreis in 2 und den anderen in 4 gleich große Teile und schneiden Sie sie aus.", "Halten Sie eine Hälfte neben ein Viertel.", "Fragen Sie Ihr Kind, welches Stück größer ist und warum: weniger Stücke bedeuten größere Stücke."]),
  },
  "fraction-model": {
    en: a("Pizza fractions", "A real or paper pizza cut into 8 slices", ["Take away some slices and ask: “How many slices are gone, out of how many?”", "Write it as a fraction together, for example 3/8.", "Swap roles: your child takes slices and you say the fraction."]),
    de: a("Pizza-Brüche", "Eine echte oder gemalte Pizza in 8 Stücken", ["Nehmen Sie einige Stücke weg und fragen Sie: „Wie viele Stücke fehlen, von wie vielen?“", "Schreibt es zusammen als Bruch, zum Beispiel 3/8.", "Tauscht die Rollen: Ihr Kind nimmt Stücke und Sie sagen den Bruch."]),
  },
  "equivalent-fractions": {
    en: a("Same amount, different pieces", "Two paper strips of the same length", ["Fold one strip in half and the other into quarters.", "Lay them side by side: how many quarters cover one half?", "Talk about why 2/4 and 1/2 are the same amount."]),
    de: a("Gleich viel, andere Stücke", "Zwei gleich lange Papierstreifen", ["Falten Sie einen Streifen in der Mitte und den anderen in Viertel.", "Legt sie nebeneinander: Wie viele Viertel bedecken eine Hälfte?", "Sprecht darüber, warum 2/4 und 1/2 gleich viel sind."]),
  },
  "fraction-of-amount": {
    en: a("Fair sharing", "12 small things (pasta, buttons or coins) and 3 cups", ["Share the 12 things into the 3 cups, one at a time.", "Count one cup together: that is one third of 12.", "Try 1/2 of 10 or 1/4 of 8 the same way."]),
    de: a("Gerecht verteilen", "12 kleine Dinge (Nudeln, Knöpfe oder Münzen) und 3 Becher", ["Verteilt die 12 Dinge einzeln auf die 3 Becher.", "Zählt zusammen einen Becher: Das ist ein Drittel von 12.", "Probiert genauso 1/2 von 10 oder 1/4 von 8."]),
  },
  "fraction-addition": {
    en: a("Adding slices", "A paper strip folded into 5 equal parts", ["Colour 1 part red and 2 parts blue.", "Ask: “How many fifths are coloured altogether?”", "Talk about why the pieces are still fifths."]),
    de: a("Stücke zusammenzählen", "Ein Papierstreifen, in 5 gleiche Teile gefaltet", ["Malen Sie 1 Teil rot und 2 Teile blau an.", "Fragen Sie: „Wie viele Fünftel sind zusammen angemalt?“", "Sprecht darüber, warum die Stücke immer noch Fünftel sind."]),
  },
  "water-cycle": {
    en: a("Disappearing puddle", "A saucer of water and a sunny window", ["Put a saucer of water by a sunny window and one in the shade, and mark the water level.", "Check together the next day: which one has less water?", "Ask your child where the water went and what it might turn into."]),
    de: a("Die verschwundene Pfütze", "Eine Untertasse mit Wasser und ein sonniges Fenster", ["Stellen Sie eine Untertasse mit Wasser ans sonnige Fenster und eine in den Schatten und markieren Sie den Wasserstand.", "Schaut am nächsten Tag nach: Wo ist weniger Wasser?", "Fragen Sie Ihr Kind, wohin das Wasser gegangen ist und was daraus werden könnte."]),
  },
  "weather-observation": {
    en: a("Weather diary", "A notebook and, if you have one, a thermometer", ["Each evening for a week, look outside together and note the weather.", "If you have a thermometer, read it and write the number with °C.", "At the end of the week, find the warmest and coldest day."]),
    de: a("Wettertagebuch", "Ein Heft und, wenn vorhanden, ein Thermometer", ["Schaut eine Woche lang jeden Abend zusammen nach draußen und schreibt das Wetter auf.", "Wenn Sie ein Thermometer haben, lest es ab und schreibt die Zahl mit °C auf.", "Sucht am Ende der Woche den wärmsten und den kältesten Tag."]),
  },
  "weather-patterns": {
    en: a("Cloud watch", "A window or a short walk", ["Look at the clouds together and describe their colour and shape.", "Ask: “Do you think it will rain soon? Why?”", "Check later whether the guess was right and talk about it."]),
    de: a("Wolken beobachten", "Ein Fenster oder ein kurzer Spaziergang", ["Schaut euch zusammen die Wolken an und beschreibt Farbe und Form.", "Fragen Sie: „Glaubst du, dass es bald regnet? Warum?“", "Schaut später nach, ob die Vermutung stimmte, und sprecht darüber."]),
  },
  "measurement-units": {
    en: a("Measure the room", "A tape measure or ruler", ["Measure a table together in metres and then in centimetres.", "Compare the two numbers: is the table any longer?", "In the kitchen, find a pack that shows grams and talk about how many grams make a kilogram."]),
    de: a("Das Zimmer vermessen", "Ein Maßband oder Lineal", ["Messt zusammen einen Tisch in Metern und dann in Zentimetern.", "Vergleicht die beiden Zahlen: Ist der Tisch länger geworden?", "Sucht in der Küche eine Packung mit Grammangabe und sprecht darüber, wie viele Gramm ein Kilogramm sind."]),
  },
  "reading-data": {
    en: a("Family bar graph", "Paper and coloured pencils", ["Ask everyone at home their favourite fruit.", "Draw a bar for each fruit together, one square per person.", "Ask your child which fruit is the favourite and how they can tell."]),
    de: a("Familien-Balkendiagramm", "Papier und Buntstifte", ["Fragen Sie alle zu Hause nach ihrem Lieblingsobst.", "Malt zusammen für jedes Obst einen Balken, ein Kästchen pro Person.", "Fragen Sie Ihr Kind, welches Obst am beliebtesten ist und woran man das sieht."]),
  },
  "time-conversion": {
    en: a("How long until…?", "A clock or watch", ["Pick something coming up later today, like dinner or a TV show.", "Count on together from now in hours and minutes.", "Ask: “How many minutes is one hour? And two hours?”"]),
    de: a("Wie lange noch bis …?", "Eine Uhr", ["Sucht etwas, das heute noch kommt, zum Beispiel das Abendessen oder eine Sendung.", "Zählt von jetzt an zusammen in Stunden und Minuten weiter.", "Fragen Sie: „Wie viele Minuten hat eine Stunde? Und zwei Stunden?“"]),
  },
  perimeter: {
    en: a("Walk the edge", "A book or a table, a ruler", ["Measure each side of a book together.", "Add all four sides to find the distance all the way around.", "Ask your child to guess first, then check."]),
    de: a("Einmal rundherum", "Ein Buch oder ein Tisch, ein Lineal", ["Messt zusammen jede Seite eines Buches.", "Addiert alle vier Seiten, um den Weg einmal rundherum zu finden.", "Lassen Sie Ihr Kind zuerst schätzen und dann nachprüfen."]),
  },
  "overall-progress": {
    en: a("Talk about school", "Ten quiet minutes", ["Ask your child to show you one thing they learned this week.", "Let them explain it to you as if you were the student.", "Praise the effort, not only the result."]),
    de: a("Über die Schule sprechen", "Zehn ruhige Minuten", ["Bitten Sie Ihr Kind, Ihnen eine Sache zu zeigen, die es diese Woche gelernt hat.", "Lassen Sie es Ihnen das erklären, als wären Sie das Schulkind.", "Loben Sie die Mühe, nicht nur das Ergebnis."]),
  },
};

/** The activity for a topic, or a general one for topics without a written activity. */
export function getHomeActivity(topicKey: string, language: Language): HomeActivity {
  return (homeActivities[topicKey] ?? homeActivities["overall-progress"])[language];
}

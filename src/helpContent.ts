// Ask for Help: written support for every question, in English and German.
// The ladder is: small hint -> bigger hint -> worked example with a DIFFERENT question -> ask the teacher.
// Rules this content follows (and the data tests check): no text contains the model answer, and if a
// student copied any of it as their answer, the simulated grader would give at most 1 of 4 marks.
import type { Language } from "./assessmentData";

type Bilingual = Record<Language, string>;
export interface QuestionHelp { hint1: Bilingual; hint2: Bilingual; example: Bilingual }

const t = (en: string, de: string): Bilingual => ({ en, de });

export const questionHelp: Record<string, QuestionHelp> = {
  // ---- Science: Plants & Life Cycles ----
  "plant-parts": {
    hint1: t("Think of a plant you know. Which parts can you see above the ground, and which part is hidden under it?", "Denk an eine Pflanze, die du kennst. Welche Teile siehst du über der Erde, und welcher Teil ist darunter versteckt?"),
    hint2: t("Pick one part you can see. Ask yourself: what job does it do for the plant? Write the part and its job together.", "Such dir einen Teil aus, den du sehen kannst. Frag dich: Welche Aufgabe hat er für die Pflanze? Schreibe den Teil und seine Aufgabe zusammen auf."),
    example: t("Example with an animal: A bird has wings and a beak. The wings help it fly. (Name a part, then say its job.)", "Beispiel mit einem Tier: Ein Vogel hat Flügel und einen Schnabel. Die Flügel helfen ihm beim Fliegen. (Nenne einen Teil und dann seine Aufgabe.)"),
  },
  pollination: {
    hint1: t("Think about what a bee picks up when it lands on a flower.", "Denk daran, was eine Biene aufnimmt, wenn sie auf einer Blüte landet."),
    hint2: t("Where does the bee fly next? Then think about what the plant can make afterwards.", "Wohin fliegt die Biene danach? Überlege dann, was die Pflanze später bilden kann."),
    example: t("Example from a different topic: A letter carrier takes a letter from one house to another, so the message arrives. Something small is carried, and then something new can happen.", "Beispiel aus einem anderen Bereich: Ein Briefträger bringt einen Brief von einem Haus zum nächsten, damit die Nachricht ankommt. Etwas Kleines wird getragen, und dann kann etwas Neues entstehen."),
  },
  "seed-dispersal": {
    hint1: t("Imagine a seed that falls right under its parent plant. Why might it be hard for it to grow there?", "Stell dir einen Samen vor, der direkt unter seine Mutterpflanze fällt. Warum könnte es schwer sein, dort zu wachsen?"),
    hint2: t("Think of things outdoors that are always moving and could take a seed along.", "Denk an Dinge draußen, die sich immer bewegen und einen Samen mitnehmen könnten."),
    example: t("Example from a different topic: Burrs stick to your socks on a walk, and you carry them home without noticing.", "Beispiel aus einem anderen Bereich: Kletten bleiben beim Spaziergang an deinen Socken hängen, und du nimmst sie mit nach Hause, ohne es zu merken."),
  },
  "plant-needs": {
    hint1: t("Think about how you look after a plant at home. What do you give it?", "Denk daran, wie du dich zu Hause um eine Pflanze kümmerst. Was gibst du ihr?"),
    hint2: t("There are four things. Two come from the sky, and two come from the pot.", "Es sind vier Dinge. Zwei kommen vom Himmel, und zwei kommen aus dem Topf."),
    example: t("Example with an animal: A pet rabbit needs food, a safe home, exercise, and someone to care for it.", "Beispiel mit einem Tier: Ein Kaninchen braucht Futter, ein sicheres Zuhause, Bewegung und jemanden, der sich kümmert."),
  },
  "life-cycle": {
    hint1: t("Which of the four stages could you hold in your hand and plant in the soil?", "Welches der vier Stadien könntest du in die Hand nehmen und in die Erde stecken?"),
    hint2: t("Start with the smallest stage. Each next stage is what it grows into.", "Beginne mit dem kleinsten Stadium. Jedes nächste Stadium ist das, was daraus wächst."),
    example: t("Example with an animal: egg → caterpillar → chrysalis → butterfly. Each stage grows into the next one.", "Beispiel mit einem Tier: Ei → Raupe → Puppe → Schmetterling. Jedes Stadium wächst zum nächsten."),
  },
  "dark-cupboard": {
    hint1: t("Compare a plant by a sunny window with one in a cupboard. What is different?", "Vergleiche eine Pflanze am sonnigen Fenster mit einer im Schrank. Was ist anders?"),
    hint2: t("Leaves are like a little kitchen for the plant. What do they need to cook?", "Blätter sind wie eine kleine Küche für die Pflanze. Was brauchen sie zum Kochen?"),
    example: t("Example from a different topic: A wind-up toy car stops when its spring runs down. With nothing to power it, it can’t keep going.", "Beispiel aus einem anderen Bereich: Ein Spielzeugauto zum Aufziehen bleibt stehen, wenn die Feder abgelaufen ist. Ohne Antrieb kann es nicht weiterfahren."),
  },
  // ---- Math: Fractions in Everyday Life ----
  "fraction-meaning": {
    hint1: t("Look at the bottom number first. What does it tell you about the whole?", "Schau zuerst auf die untere Zahl. Was sagt sie über das Ganze?"),
    hint2: t("Draw a shape and cut it into as many same-size pieces as the bottom number. Then colour in as many as the top number.", "Zeichne eine Form und teile sie in so viele gleich große Stücke, wie die untere Zahl sagt. Male dann so viele aus, wie die obere Zahl sagt."),
    example: t("Example with different numbers: in 2/5, the 5 says how many same-size pieces there are, and the 2 says how many we take.", "Beispiel mit anderen Zahlen: Bei 2/5 sagt die 5, wie viele gleich große Stücke es gibt, und die 2, wie viele wir nehmen."),
  },
  "compare-fractions": {
    hint1: t("Imagine two pizzas of the same size. One is shared by 2 people, the other by 4 people.", "Stell dir zwei gleich große Pizzen vor. Eine teilen sich 2 Personen, die andere 4 Personen."),
    hint2: t("Who gets the bigger slice: someone sharing with 1 friend, or someone sharing with 3 friends?", "Wer bekommt das größere Stück: jemand, der mit 1 Freund teilt, oder jemand, der mit 3 Freunden teilt?"),
    example: t("Example with different numbers: 1/3 of a chocolate bar is more than 1/8 of the same bar, because fewer pieces means each piece is bigger.", "Beispiel mit anderen Zahlen: 1/3 einer Tafel Schokolade ist mehr als 1/8 derselben Tafel, weil weniger Stücke größere Stücke ergeben."),
  },
  "fraction-model": {
    hint1: t("Count all the slices the pizza was cut into. That number goes on the bottom.", "Zähle alle Stücke, in die die Pizza geschnitten wurde. Diese Zahl kommt nach unten."),
    hint2: t("Now count only the slices you ate. That number goes on the top.", "Zähle jetzt nur die Stücke, die du gegessen hast. Diese Zahl kommt nach oben."),
    example: t("Example with different numbers: a cake has 6 equal pieces and you eat 1, so you ate 1/6 of the cake.", "Beispiel mit anderen Zahlen: Ein Kuchen hat 6 gleich große Stücke und du isst 1, also hast du 1/6 des Kuchens gegessen."),
  },
  "equivalent-fractions": {
    hint1: t("A half means the top number is exactly half of the bottom number.", "Eine Hälfte bedeutet: Die obere Zahl ist genau die Hälfte der unteren Zahl."),
    hint2: t("Pick any even number for the bottom. What top number is half of it?", "Nimm eine gerade Zahl für unten. Welche Zahl oben ist die Hälfte davon?"),
    example: t("Example with a different fraction: 1/3 is worth as much as 2/6, because you double the top and the bottom.", "Beispiel mit einem anderen Bruch: 1/3 ist so viel wert wie 2/6, weil man oben und unten verdoppelt."),
  },
  "fraction-of-set": {
    hint1: t("1/3 means 3 equal groups. How could you share the apples fairly?", "1/3 bedeutet 3 gleiche Gruppen. Wie könntest du die Äpfel gerecht verteilen?"),
    hint2: t("Draw 3 circles and put the apples into them one by one until all 12 are used. Count one circle.", "Male 3 Kreise und lege die Äpfel einzeln hinein, bis alle 12 verteilt sind. Zähle einen Kreis."),
    example: t("Example with different numbers: 1/2 of 10 sweets. Share 10 sweets into 2 equal groups, so each group has 5.", "Beispiel mit anderen Zahlen: 1/2 von 10 Bonbons. Verteile 10 Bonbons auf 2 gleiche Gruppen, dann hat jede Gruppe 5."),
  },
  "add-fractions": {
    hint1: t("Are all the pieces the same size? What are they all called?", "Sind alle Stücke gleich groß? Wie heißen sie alle?"),
    hint2: t("When the pieces are the same size, you only count how many pieces there are altogether. The size of each piece doesn’t change.", "Wenn die Stücke gleich groß sind, zählst du nur, wie viele Stücke es zusammen sind. Die Größe der Stücke ändert sich nicht."),
    example: t("Example with different numbers: 1/7 + 3/7 = 4/7. The pieces are sevenths, so only the top numbers are added.", "Beispiel mit anderen Zahlen: 1/7 + 3/7 = 4/7. Die Stücke sind Siebtel, also werden nur die oberen Zahlen addiert."),
  },
  // ---- Science: Weather & Water ----
  "water-cycle": {
    hint1: t("What happens to a puddle on a warm day? Where does the water go?", "Was passiert mit einer Pfütze an einem warmen Tag? Wohin geht das Wasser?"),
    hint2: t("Water that goes up into the sky has to come back somehow. What do you see in the sky before it comes back?", "Wasser, das in den Himmel steigt, muss irgendwie zurückkommen. Was siehst du am Himmel, bevor es zurückkommt?"),
    example: t("Example from a different topic: When you breathe on a cold window, tiny drops appear on the glass. Water can change form and come back as drops.", "Beispiel aus einem anderen Bereich: Wenn du gegen ein kaltes Fenster hauchst, erscheinen kleine Tröpfchen auf dem Glas. Wasser kann seine Form ändern und wieder als Tröpfchen zurückkommen."),
  },
  "measure-weather": {
    hint1: t("Which tool tells you how hot or cold it is?", "Welches Gerät sagt dir, wie warm oder kalt es ist?"),
    hint2: t("After you look at the tool, how will you remember the number tomorrow?", "Wenn du auf das Gerät geschaut hast, wie merkst du dir die Zahl bis morgen?"),
    example: t("Example from a different topic: To follow how tall you grow, you stand by a ruler each month and keep the numbers in a notebook.", "Beispiel aus einem anderen Bereich: Um zu sehen, wie groß du wirst, stellst du dich jeden Monat an ein Lineal und hältst die Zahlen in einem Heft fest."),
  },
  "weather-patterns": {
    hint1: t("What are clouds made of? Think about what you would feel if you walked through one.", "Woraus bestehen Wolken? Überlege, was du spüren würdest, wenn du durch eine hindurchgehst."),
    hint2: t("Dark clouds let less sunlight through. What might be packed inside them?", "Dunkle Wolken lassen weniger Sonnenlicht durch. Was könnte in ihnen stecken?"),
    example: t("Example from a different topic: A sponge soaks up more and more until it cannot hold any more, and then it starts to drip.", "Beispiel aus einem anderen Bereich: Ein Schwamm saugt immer mehr auf, bis er nichts mehr halten kann, und dann läuft es aus ihm heraus."),
  },
  "rain-gauge": {
    hint1: t("Think of a container you could leave outside during rain. What would it need on its side?", "Denk an einen Behälter, den du bei Regen draußen stehen lassen könntest. Was bräuchte er an der Seite?"),
    hint2: t("Its name tells you what it does: it is a rain ___.", "Sein Name sagt, was er macht: Es ist ein Regen-…"),
    example: t("Example from a different topic: A measuring jug in the kitchen shows you how much milk is inside.", "Beispiel aus einem anderen Bereich: Ein Messbecher in der Küche zeigt dir, wie viel Milch darin ist."),
  },
  "puddle-sun": {
    hint1: t("Compare standing outside on a bright day and on a grey day. How do they feel different?", "Vergleiche, wie es sich draußen an einem hellen Tag und an einem grauen Tag anfühlt."),
    hint2: t("Water doesn’t just vanish. Where could the water from the puddle go?", "Wasser verschwindet nicht einfach. Wohin könnte das Wasser aus der Pfütze gehen?"),
    example: t("Example from a different topic: Wet laundry on a washing line dries faster on a bright, breezy day.", "Beispiel aus einem anderen Bereich: Nasse Wäsche auf der Leine trocknet an einem hellen, windigen Tag schneller."),
  },
  "thunder-lightning": {
    hint1: t("The flash and the bang happen at the same moment. So why don’t they reach you together?", "Blitz und Knall passieren im selben Moment. Warum kommen sie dann nicht gleichzeitig bei dir an?"),
    hint2: t("Think of a race between the flash and the bang. Which one wins?", "Denk an ein Wettrennen zwischen dem Blitz und dem Knall. Wer gewinnt?"),
    example: t("Example from a different topic: At a sports day far away, you see the puff of smoke from the starter’s pistol before you hear the bang.", "Beispiel aus einem anderen Bereich: Beim Sportfest siehst du von weit weg zuerst das Rauchwölkchen der Startpistole und hörst erst danach den Knall."),
  },
  // ---- Math: Measurement & Data ----
  "length-measure": {
    hint1: t("Look at a metre stick or a long ruler. How many small centimetre marks fit on it?", "Schau dir einen Meterstab oder ein langes Lineal an. Wie viele kleine Zentimeterstriche passen darauf?"),
    hint2: t("If you measure one table first in metres and then in centimetres, does the table itself change?", "Wenn du einen Tisch zuerst in Metern und dann in Zentimetern misst, verändert sich der Tisch selbst?"),
    example: t("Example with different units: 1 kilogram is 1000 grams. A bag of rice does not get heavier when you write it in grams; only the unit changes.", "Beispiel mit anderen Einheiten: 1 Kilogramm sind 1000 Gramm. Ein Sack Reis wird nicht schwerer, wenn du ihn in Gramm aufschreibst; nur die Einheit ändert sich."),
  },
  "data-graph": {
    hint1: t("Imagine a bar graph of the fruits your class likes. What could you find out by looking at the heights of the bars?", "Stell dir ein Balkendiagramm mit dem Obst vor, das deine Klasse mag. Was könntest du herausfinden, wenn du dir die Höhen der Balken anschaust?"),
    hint2: t("Put two bars next to each other. What can you say about them?", "Stell zwei Balken nebeneinander. Was kannst du über sie sagen?"),
    example: t("Example with another kind of chart: on a pictogram, each smiley stands for one pet in the class, and each row is one kind of pet.", "Beispiel mit einem anderen Diagramm: In einem Bilddiagramm steht jedes Smiley für ein Haustier in der Klasse, und jede Reihe ist eine andere Tierart."),
  },
  "time-conversion": {
    hint1: t("How many minutes are in one hour? Start there.", "Wie viele Minuten hat eine Stunde? Fang damit an."),
    hint2: t("Two hours means one hour and then one more hour. Add the minutes for each hour.", "Zwei Stunden sind eine Stunde und dann noch eine Stunde. Addiere die Minuten für jede Stunde."),
    example: t("Example with different units: 1 day has 24 hours, so 2 days have 24 + 24 = 48 hours.", "Beispiel mit anderen Einheiten: Ein Tag hat 24 Stunden, also haben 2 Tage 24 + 24 = 48 Stunden."),
  },
  perimeter: {
    hint1: t("Perimeter is the distance all the way around the shape. Imagine an ant walking along every edge.", "Der Umfang ist der Weg einmal rund um die Form. Stell dir eine Ameise vor, die an jeder Kante entlangläuft."),
    hint2: t("A rectangle has 4 sides: two long ones and two short ones. Write all four numbers and add them.", "Ein Rechteck hat 4 Seiten: zwei lange und zwei kurze. Schreibe alle vier Zahlen auf und addiere sie."),
    example: t("Example with different numbers: a square with 2 cm sides has a perimeter of 2 + 2 + 2 + 2 = 8 cm.", "Beispiel mit anderen Zahlen: Ein Quadrat mit 2 cm langen Seiten hat einen Umfang von 2 + 2 + 2 + 2 = 8 cm."),
  },
  "grams-kilograms": {
    hint1: t("How many grams make one kilogram? Start with that number.", "Wie viele Gramm sind ein Kilogramm? Fang mit dieser Zahl an."),
    hint2: t("You have 2 kilograms, so you need that number twice.", "Du hast 2 Kilogramm, also brauchst du diese Zahl zweimal."),
    example: t("Example with different units: 1 metre is 100 centimetres, so 3 metres are 300 centimetres.", "Beispiel mit anderen Einheiten: 1 Meter sind 100 Zentimeter, also sind 3 Meter 300 Zentimeter."),
  },
  "film-length": {
    hint1: t("Don’t subtract the times like normal numbers. Count on from the start time instead.", "Rechne Uhrzeiten nicht wie normale Zahlen. Zähle stattdessen von der Anfangszeit weiter."),
    hint2: t("First jump a whole hour from 3:15. Then count the minutes that are left until 4:45.", "Springe zuerst eine ganze Stunde von 3:15 weiter. Zähle dann die Minuten, die bis 4:45 übrig sind."),
    example: t("Example with different times: from 2:10 to 3:30 is one hour (up to 3:10) and then 20 minutes more, so 1 hour 20 minutes.", "Beispiel mit anderen Zeiten: Von 2:10 bis 3:30 ist es eine Stunde (bis 3:10) und dann noch 20 Minuten, also 1 Stunde 20 Minuten."),
  },
};

export type HelpStep = "hint1" | "hint2" | "example";

/** The written help for one step, or undefined for questions without written help (e.g. custom data). */
export function getHelpText(questionId: string, step: HelpStep, language: Language): string | undefined {
  return questionHelp[questionId]?.[step][language];
}

// ---- "Check your answer" (polish stage): questions a student can ask themselves before sending.
// They name what a full answer needs to cover, never the answer itself (checked by the data tests).
type CheckList = Record<Language, string[]>;
const c = (en: string[], de: string[]): CheckList => ({ en, de });

export const questionSelfCheck: Record<string, CheckList> = {
  "plant-parts": c(["Did you name two different parts?", "Did you say what one of them does?"], ["Hast du zwei verschiedene Teile genannt?", "Hast du gesagt, was einer davon macht?"]),
  pollination: c(["Did you say what the bee takes with it?", "Did you say what the plant can make afterwards?"], ["Hast du gesagt, was die Biene mitnimmt?", "Hast du gesagt, was die Pflanze danach bilden kann?"]),
  "seed-dispersal": c(["Did you name what moves the seed?", "Did you explain how it gets somewhere else?"], ["Hast du genannt, was den Samen bewegt?", "Hast du erklärt, wie er woandershin kommt?"]),
  "plant-needs": c(["Did you list more than one thing?", "Did you think of what comes from the sky and from the pot?"], ["Hast du mehr als eine Sache aufgezählt?", "Hast du an Dinge vom Himmel und aus dem Topf gedacht?"]),
  "life-cycle": c(["Did you start with the smallest stage?", "Does each stage grow into the next one?"], ["Hast du mit dem kleinsten Stadium angefangen?", "Wächst jedes Stadium zum nächsten?"]),
  "dark-cupboard": c(["Did you say what is missing in the cupboard?", "Did you say what the leaves need it for?"], ["Hast du gesagt, was im Schrank fehlt?", "Hast du gesagt, wofür die Blätter es brauchen?"]),
  "fraction-meaning": c(["Did you explain the bottom number?", "Did you explain the top number?"], ["Hast du die untere Zahl erklärt?", "Hast du die obere Zahl erklärt?"]),
  "compare-fractions": c(["Did you say which one is larger?", "Did you give a reason using the size of the pieces?"], ["Hast du gesagt, welcher Bruch größer ist?", "Hast du mit der Größe der Stücke begründet?"]),
  "fraction-model": c(["Is the number of slices you ate on top?", "Is the number of all the slices on the bottom?"], ["Steht die Zahl der gegessenen Stücke oben?", "Steht die Zahl aller Stücke unten?"]),
  "equivalent-fractions": c(["Did you write down a fraction?", "Did you explain why it is worth as much as one half?"], ["Hast du einen Bruch aufgeschrieben?", "Hast du erklärt, warum er so viel wert ist wie eine Hälfte?"]),
  "fraction-of-set": c(["Did you put the apples into equal groups?", "Did you write how many are in one group?"], ["Hast du die Äpfel in gleiche Gruppen gelegt?", "Hast du geschrieben, wie viele in einer Gruppe sind?"]),
  "add-fractions": c(["Did you add only the top numbers?", "Did you keep the bottom number as it was?"], ["Hast du nur die oberen Zahlen addiert?", "Hast du die untere Zahl so gelassen?"]),
  "water-cycle": c(["Did you start with what happens to the puddle?", "Did you finish with how the water comes back down?"], ["Hast du damit angefangen, was mit der Pfütze passiert?", "Hast du damit aufgehört, wie das Wasser zurückkommt?"]),
  "measure-weather": c(["Did you name a tool?", "Did you say how you keep the number?"], ["Hast du ein Gerät genannt?", "Hast du gesagt, wie du dir die Zahl merkst?"]),
  "weather-patterns": c(["Did you say what clouds are made of?", "Did you explain why dark clouds can mean rain is coming?"], ["Hast du gesagt, woraus Wolken bestehen?", "Hast du erklärt, warum dunkle Wolken bedeuten können, dass es bald regnet?"]),
  "rain-gauge": c(["Did you name the tool?", "Did you say how you find out the amount?"], ["Hast du das Gerät genannt?", "Hast du gesagt, wie man die Menge herausfindet?"]),
  "puddle-sun": c(["Did you say what is different on a bright day?", "Did you say where the water goes?"], ["Hast du gesagt, was an einem hellen Tag anders ist?", "Hast du gesagt, wohin das Wasser geht?"]),
  "thunder-lightning": c(["Did you compare the flash and the bang?", "Did you say which one reaches you first, and why?"], ["Hast du Blitz und Knall verglichen?", "Hast du gesagt, was zuerst ankommt und warum?"]),
  "length-measure": c(["Did you say how many centimetres make one metre?", "Did you say whether the length changes?"], ["Hast du gesagt, wie viele Zentimeter einen Meter ergeben?", "Hast du gesagt, ob sich die Länge ändert?"]),
  "data-graph": c(["Did you say what the graph helps you do?", "Did you use the bars in your answer?"], ["Hast du gesagt, wobei das Diagramm hilft?", "Hast du die Balken in deiner Antwort benutzt?"]),
  "time-conversion": c(["Did you use the number of minutes in one hour?", "Did you show how you worked it out?"], ["Hast du die Zahl der Minuten in einer Stunde benutzt?", "Hast du deinen Rechenweg gezeigt?"]),
  perimeter: c(["Did you add every side?", "Did you write the unit (cm)?"], ["Hast du jede Seite addiert?", "Hast du die Einheit (cm) aufgeschrieben?"]),
  "grams-kilograms": c(["Did you use how many grams make one kilogram?", "Did you write the unit?"], ["Hast du benutzt, wie viele Gramm ein Kilogramm ergeben?", "Hast du die Einheit aufgeschrieben?"]),
  "film-length": c(["Did you count on from the start time?", "Did you give the answer in hours and minutes, or in minutes?"], ["Hast du von der Anfangszeit weitergezählt?", "Hast du die Antwort in Stunden und Minuten oder in Minuten angegeben?"]),
};

export function getSelfCheck(questionId: string, language: Language): string[] | undefined {
  return questionSelfCheck[questionId]?.[language];
}

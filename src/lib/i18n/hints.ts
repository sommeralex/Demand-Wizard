import { Locale } from './index';

export interface Hint {
  id: string;
  title: string;
  description: string;
  example: string;
}

const hintsDE: Hint[] = [
  {
    id: 'problem',
    title: 'Problem',
    description: 'Was ist das aktuelle Problem oder die Herausforderung?',
    example: '„Unsere manuelle Rechnungsprüfung ist langsam und fehleranfällig, was zu verspäteten Zahlungen führt."'
  },
  {
    id: 'ziel',
    title: 'Ziel',
    description: 'Was soll mit der Idee erreicht oder verbessert werden?',
    example: '„Wir möchten den Prozess der Rechnungsprüfung automatisieren, um die Durchlaufzeit um 50% zu reduzieren und Fehler zu minimieren."'
  },
  {
    id: 'zielgruppe',
    title: 'Zielgruppe',
    description: 'Wer ist von diesem Problem betroffen oder profitiert von der Lösung?',
    example: '„Die Buchhaltungsabteilung (5 Mitarbeiter) und unsere Lieferanten."'
  },
  {
    id: 'aufwand',
    title: 'Aufwand & Budget',
    description: 'Gibt es erste Schätzungen zu Kosten oder internem Aufwand?',
    example: '„Wir schätzen den externen Kostenaufwand auf ca. 20.000 EUR und benötigen 30 Personentage aus der IT."'
  },
  {
    id: 'nutzen',
    title: 'Nutzen',
    description: 'Wie hilft die Idee, Zeit oder Geld zu sparen?',
    example: '„Durch die Automatisierung sparen wir wöchentlich 10 Arbeitsstunden und vermeiden Mahngebühren von ca. 5.000 EUR pro Jahr."'
  },
  {
    id: 'zeitplan',
    title: 'Zeitplan',
    description: 'Gibt es einen gewünschten Start- oder Endtermin?',
    example: '„Das Projekt sollte im nächsten Quartal starten und innerhalb von 6 Monaten abgeschlossen sein."'
  }
];

const hintsEN: Hint[] = [
  {
    id: 'problem',
    title: 'Problem',
    description: 'What is the current problem or challenge?',
    example: '"Our manual invoice verification is slow and error-prone, leading to delayed payments."'
  },
  {
    id: 'goal',
    title: 'Goal',
    description: 'What should be achieved or improved with the idea?',
    example: '"We want to automate the invoice verification process to reduce cycle time by 50% and minimize errors."'
  },
  {
    id: 'target-group',
    title: 'Target Group',
    description: 'Who is affected by this problem or benefits from the solution?',
    example: '"The accounting department (5 employees) and our suppliers."'
  },
  {
    id: 'effort',
    title: 'Effort & Budget',
    description: 'Are there initial estimates for costs or internal effort?',
    example: '"We estimate external costs of approximately 20,000 EUR and require 30 person-days from IT."'
  },
  {
    id: 'benefits',
    title: 'Benefits',
    description: 'How does the idea help save time or money?',
    example: '"Through automation, we save 10 work hours weekly and avoid late payment fees of approximately 5,000 EUR per year."'
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description: 'Is there a desired start or end date?',
    example: '"The project should start next quarter and be completed within 6 months."'
  }
];

export function getHints(locale: Locale): Hint[] {
  return locale === 'de' ? hintsDE : hintsEN;
}

export function getPlaceholder(locale: Locale): string {
  return locale === 'de'
    ? 'Beschreibe deine Idee hier. Orientiere dich dabei an den Beispielen und Erklärungen weiter unten.'
    : 'Describe your idea here. Refer to the examples and explanations below.';
}

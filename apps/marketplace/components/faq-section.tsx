"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {faqs.map((faq, idx) => (
        <AccordionItem
          key={faq.question}
          value={`item-${idx}`}
          className="rounded-lg border-border/50 bg-card/50"
        >
          <AccordionTrigger className="px-4 text-left font-medium hover:text-primary transition-colors">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "¿Puedo ver una demo del producto?",
    answer: "Puedes ver un video de demostración aquí."
  },
  {
    question: "¿Puedo usar los videos creados con fines comerciales?",
    answer: "Por supuesto. Hemos negociado los derechos para que puedas utilizar los videos generados con fines comerciales."
  },
  {
    question: "¿Los actores de IA otorgan permisos para usar Arcads?",
    answer: "Sí, todas las versiones de IA de nuestros actores se desarrollan con pleno consentimiento y cooperación. Están completamente informados y compensados por su trabajo. Nos aseguramos de que todos estén de acuerdo antes de usar su imagen en cualquier creación de IA."
  },
  {
    question: "¿Obtengo solo un actor hablando o un video final editado?",
    answer: "Obtendrás la actuación y el discurso más convincente. Recibes un video en bruto cautivador. Luego puedes transformarlo como quieras con tus propias herramientas de edición. También puedes solicitar una edición en la plataforma."
  },
  {
    question: "¿Cuánto tiempo tarda en generar mis videos con Arcads?",
    answer: "Alrededor de 2 minutos y 30 segundos."
  },
  {
    question: "¿Funciona en diferentes idiomas?",
    answer: "Sí, en 35 idiomas incluyendo 🇪🇸 Español (España), 🇲🇽 Español (México), 🇺🇸 Inglés (EE.UU.), 🇬🇧 Inglés (Reino Unido), 🇫🇷 Francés, 🇩🇪 Alemán, 🇮🇹 Italiano, 🇵🇹 Portugués, y muchos más."
  },
  {
    question: "¿Puedo controlar cómo se mueven los actores, cómo hablan y su fondo?",
    answer: "Hay muchas formas diferentes de controlar los resultados de los videos en Arcads. Todo suena atractivo y natural sin hacer nada. Pero también puedes cambiar la velocidad del habla y la entonación. Puedes elegir entre una variedad de actores de IA con diferentes fondos, emociones y energías en la biblioteca de actores."
  },
  {
    question: "¿Qué sucede si supero el límite mensual de mi plan?",
    answer: "Los usuarios Starter y Basic no pueden exceder sus límites. Para obtener más créditos inmediatamente, puedes actualizar tu plan. Los usuarios Pro pueden exceder sus límites y se les cobrará por los créditos adicionales utilizados en la factura del próximo mes."
  },
  {
    question: "¿Los créditos no utilizados se transfieren al mes siguiente?",
    answer: "Sí. Si no has alcanzado tu límite de créditos al final del período de facturación, los créditos adicionales se transferirán al siguiente. Sin embargo, si cancelas o reduces tu membresía, todos los créditos no utilizados se perderán."
  }
];

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  showSupport?: boolean;
}

export function FAQSection({ 
  title = "Preguntas Frecuentes",
  subtitle,
  faqs = defaultFAQs,
  showSupport = true
}: FAQSectionProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-zinc-400">{subtitle}</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-white/10 rounded-xl bg-white/[0.02] px-6 data-[state=open]:pb-6"
            >
              <AccordionTrigger className="py-6 text-left hover:no-underline">
                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {showSupport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">¿Tienes más preguntas?</h3>
          <p className="text-zinc-400 mb-6">¡Estamos aquí para ayudarte!</p>
          <Button
            className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Contactar soporte
          </Button>
        </motion.div>
      )}
    </div>
  );
} 
import { CheckCircle2, Clock, MapPin, ShieldCheck } from 'lucide-react';
import type { SiteSettings } from '../../types';

interface AboutSectionProps {
  settings: SiteSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const pillars = [
    {
      number: '01.',
      title: 'Inspeção Mecânica & Documental',
      text: 'Cada motocicleta passa por revisão completa de chassi, motor, eletrônica e histórico antes de chegar à vitrine.',
    },
    {
      number: '02.',
      title: 'Negociação Transparente',
      text: 'Avaliação justa de usada na troca, financiamento facilitado e entrega com documentação agilizada.',
    },
    {
      number: '03.',
      title: 'Curadoria de Performance',
      text: 'Estoque selecionado de modelos street, naked, esportiva, trail e scooter com procedência garantida.',
    },
  ];

  return (
    <section
      id="sobre"
      className="py-16 sm:py-20 bg-[#0D0F0F] border-b border-[#242727]"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7F21B]">
              Sobre a Palazzo Motos
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F3F3F3] mt-2 leading-tight">
              {settings.aboutTitle || 'ENGENHARIA, PROCEDÊNCIA E ATITUDE.'}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#858989] leading-relaxed">
              {settings.aboutText}
            </p>

            <div className="mt-8 pt-6 border-t border-[#242727] space-y-3 text-sm text-[#F3F3F3]/85">
              {settings.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B7F21B] shrink-0 mt-1" aria-hidden="true" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.openingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#B7F21B] shrink-0 mt-1" aria-hidden="true" />
                  <span>{settings.openingHours}</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#B7F21B] shrink-0 mt-1" aria-hidden="true" />
                <span>Garantia de procedência em todas as negociações</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.number}
                className="bg-[#141515] border border-[#242727] rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono-tabular text-sm font-semibold text-[#B7F21B]">
                    {pillar.number}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#F3F3F3] mt-3 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#858989] mt-2.5 leading-relaxed">
                    {pillar.text}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#242727] flex items-center gap-2 text-xs font-medium text-[#F3F3F3]/80">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F21B] shrink-0" aria-hidden="true" />
                  <span>Padrão Palazzo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { QRCodeSVG } from "qrcode.react";

import { BackofficeShell } from "@/components/backoffice/BackofficeShell";

const testPhoneNumber = "15551979100";

const localities = [
  {
    name: "Alcobaça",
    slug: "alcobaca",
  },
  {
    name: "Faro",
    slug: "faro",
  },
  {
    name: "Lourinhã",
    slug: "lourinha",
  },
];

export default function WhatsAppQrPage() {
  return (
    <BackofficeShell>
      <section className="flex min-h-full min-w-[936px] flex-col gap-6 bg-white px-8 py-6 mr-32 max-[1200px]:mr-8 max-[1200px]:gap-5 max-[1200px]:px-5 max-[1200px]:py-5">
        <div className="grid w-full grid-cols-3 items-center justify-center gap-4 max-[1200px]:gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] max-[1200px]:text-2xl">
              WhatsApp do Município
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Códigos QR para acompanhar os eventos locais.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span className="rounded-md border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-sm">
              {localities.length} municípios ativos
            </span>
          </div>

          <div className="flex justify-end" />
        </div>

        <section className="flex min-h-[80px] w-full flex-col gap-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-4 py-6 shadow-sm max-[1200px]:gap-3 max-[1200px]:px-3 max-[1200px]:py-4">
          <div className="flex items-end justify-between gap-4 max-[720px]:items-start max-[720px]:flex-col">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Códigos de acompanhamento
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Cada código abre uma conversa com a mensagem de adesão já preenchida.
              </p>
            </div>

            <span className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text-tertiary)]">
              Canal WhatsApp
            </span>
          </div>

          <div className="grid w-full grid-cols-3 gap-4 max-[1400px]:grid-cols-2 max-[1200px]:gap-3 max-[720px]:grid-cols-1">
            {localities.map((locality) => {
              const message = `Subscrever ${locality.slug}`;
              const whatsappUrl =
                `https://wa.me/${testPhoneNumber}?text=${encodeURIComponent(message)}`;

              return (
                <article
                  key={locality.slug}
                  className="flex min-h-[472px] flex-col rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {locality.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Seguir eventos
                      </p>
                    </div>

                    <span className="rounded-md border border-[var(--success-border)] bg-[var(--success-soft)] px-2 py-1 text-xs font-semibold text-[var(--success)]">
                      Ativo
                    </span>
                  </div>

                  <div className="mt-4 flex flex-1 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                    <div className="rounded-md border border-[var(--border-strong)] bg-white p-3 shadow-sm">
                      <QRCodeSVG
                        value={whatsappUrl}
                        size={220}
                        title={`Código QR do WhatsApp para ${locality.name}`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                    <p className="text-xs font-bold text-[var(--text-tertiary)]">
                      Mensagem automática
                    </p>
                    <code className="mt-1 block break-all text-sm font-semibold text-[var(--text-secondary)]">
                      {message}
                    </code>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 rounded-md border border-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  >
                    <span>Abrir no WhatsApp</span>
                    <span aria-hidden="true" className="text-base leading-none">
                      ›
                    </span>
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </BackofficeShell>
  );
}

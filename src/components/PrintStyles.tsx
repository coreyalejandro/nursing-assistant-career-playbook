import React from "react";

export default function PrintStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @media print {
            /* Hide general web interfaces */
            nav,
            button,
            header,
            footer,
            .no-print,
            aside,
            .mobile-only {
              display: none !important;
            }

            /* Main body optimization */
            body {
              background: #ffffff !important;
              color: #000000 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
              font-size: 11pt !important;
              line-height: 1.4 !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* Target resume print output styling */
            #ats-printable-cv {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
            }

            /* Restrict broken breaks inside blocks */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid !important;
              break-after: avoid !important;
              color: #000000 !important;
            }

            .mb-6, .mb-4, .space-y-4 > * {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            /* Custom column adjustments */
            .grid {
              display: block !important;
            }

            .grid-cols-2, .grid-cols-3, .grid-cols-12 {
              display: block !important;
              width: 100% !important;
            }

            .grid-cols-2 > *, .grid-cols-3 > *, .grid-cols-12 > * {
              margin-bottom: 8pt !important;
              width: 100% !important;
            }
          }
        `
      }}
    />
  );
}

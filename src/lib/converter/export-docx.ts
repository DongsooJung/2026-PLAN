import {
  Document,
  Paragraph,
  TextRun,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  Packer,
  BorderStyle,
  convertMillimetersToTwip,
} from "docx";
import type { GovDocument, GovDocNode } from "./govdoc-types";
import { GOVDOC_STYLES, METADATA_LABELS } from "./govdoc-constants";
import { formatNumber, getIndent } from "./numbering";

const BODY_FONT = GOVDOC_STYLES.fonts.body;
const HEADING_FONT = GOVDOC_STYLES.fonts.heading;
const LINE_SPACING = Math.round((GOVDOC_STYLES.lineSpacing / 100) * 240);

function makeTextRun(text: string, font: string, sizePt: number, bold = false): TextRun {
  return new TextRun({
    text,
    font,
    size: sizePt * 2,
    bold,
  });
}

function nodeToParas(node: GovDocNode): Paragraph[] {
  switch (node.type) {
    case "title":
      return [
        new Paragraph({
          children: [makeTextRun(node.content, HEADING_FONT, GOVDOC_STYLES.sizes.title, true)],
          spacing: { line: LINE_SPACING, after: 200 },
          alignment: AlignmentType.CENTER,
        }),
      ];

    case "subtitle1":
      return [
        new Paragraph({
          children: [makeTextRun(node.content, HEADING_FONT, GOVDOC_STYLES.sizes.subtitle1, true)],
          spacing: { line: LINE_SPACING, before: 200, after: 100 },
        }),
      ];

    case "subtitle2":
      return [
        new Paragraph({
          children: [makeTextRun(node.content, HEADING_FONT, GOVDOC_STYLES.sizes.subtitle2, true)],
          spacing: { line: LINE_SPACING, before: 150, after: 80 },
        }),
      ];

    case "body":
      return [
        new Paragraph({
          children: [makeTextRun(node.content, BODY_FONT, GOVDOC_STYLES.sizes.body)],
          spacing: { line: LINE_SPACING },
          indent: { firstLine: convertMillimetersToTwip(10) },
        }),
      ];

    case "numbered": {
      const prefix = formatNumber(node.level ?? 1, node.index ?? 0);
      const indent = getIndent(node.level ?? 1);
      return [
        new Paragraph({
          children: [
            makeTextRun(`${indent}${prefix} `, BODY_FONT, GOVDOC_STYLES.sizes.body, true),
            makeTextRun(node.content, BODY_FONT, GOVDOC_STYLES.sizes.body),
          ],
          spacing: { line: LINE_SPACING },
          indent: { left: convertMillimetersToTwip((node.level ?? 1) * 5) },
        }),
      ];
    }

    case "table": {
      if (!node.rows || node.rows.length === 0) return [];
      const table = new DocxTable({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: node.rows.map(
          (row, rowIdx) =>
            new DocxTableRow({
              children: row.map(
                (cell) =>
                  new DocxTableCell({
                    children: [
                      new Paragraph({
                        children: [
                          makeTextRun(
                            cell,
                            rowIdx === 0 ? HEADING_FONT : BODY_FONT,
                            GOVDOC_STYLES.sizes.body,
                            rowIdx === 0
                          ),
                        ],
                        spacing: { line: LINE_SPACING },
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  })
              ),
            })
        ),
      });
      return [table as unknown as Paragraph];
    }

    case "end-marker":
      return [
        new Paragraph({
          children: [makeTextRun("끝.", BODY_FONT, GOVDOC_STYLES.sizes.body)],
          spacing: { line: LINE_SPACING, before: 200 },
          alignment: AlignmentType.RIGHT,
        }),
      ];

    case "metadata-block":
      return [
        new Paragraph({
          children: [makeTextRun(node.content, BODY_FONT, GOVDOC_STYLES.sizes.body)],
          spacing: { line: LINE_SPACING },
          shading: { fill: "F5F5F5" },
        }),
      ];

    default:
      return [];
  }
}

function buildMetadataParagraphs(doc: GovDocument): Paragraph[] {
  const paras: Paragraph[] = [];
  const meta = doc.metadata;

  const fields = [
    { key: "recipient", value: meta.recipient },
    { key: "reference", value: meta.reference },
  ];

  for (const field of fields) {
    if (!field.value) continue;
    paras.push(
      new Paragraph({
        children: [
          makeTextRun(`${METADATA_LABELS[field.key]}: `, HEADING_FONT, GOVDOC_STYLES.sizes.body, true),
          makeTextRun(field.value, BODY_FONT, GOVDOC_STYLES.sizes.body),
        ],
        spacing: { line: LINE_SPACING },
      })
    );
  }

  if (paras.length > 0) {
    paras.push(new Paragraph({ spacing: { after: 200 } }));
  }

  return paras;
}

function buildFooterParagraphs(doc: GovDocument): Paragraph[] {
  const paras: Paragraph[] = [];
  const meta = doc.metadata;
  const footerFields = [
    { key: "drafter", value: meta.drafter },
    { key: "reviewer", value: meta.reviewer },
    { key: "approver", value: meta.approver },
  ];

  const filledFields = footerFields.filter((f) => f.value);
  if (filledFields.length > 0) {
    paras.push(new Paragraph({ spacing: { before: 400 } }));
    for (const field of filledFields) {
      paras.push(
        new Paragraph({
          children: [
            makeTextRun(`${METADATA_LABELS[field.key]}: `, HEADING_FONT, GOVDOC_STYLES.sizes.footer, true),
            makeTextRun(field.value, BODY_FONT, GOVDOC_STYLES.sizes.footer),
          ],
          spacing: { line: LINE_SPACING },
        })
      );
    }
  }

  const infoFields = [
    { key: "department", value: meta.department },
    { key: "contactInfo", value: meta.contactInfo },
    { key: "documentNumber", value: meta.documentNumber },
    { key: "enforcementDate", value: meta.enforcementDate },
  ];

  const filledInfo = infoFields.filter((f) => f.value);
  if (filledInfo.length > 0) {
    paras.push(new Paragraph({ spacing: { before: 200 } }));
    for (const field of filledInfo) {
      paras.push(
        new Paragraph({
          children: [
            makeTextRun(`${METADATA_LABELS[field.key]}: `, HEADING_FONT, GOVDOC_STYLES.sizes.footer, true),
            makeTextRun(field.value, BODY_FONT, GOVDOC_STYLES.sizes.footer),
          ],
          spacing: { line: LINE_SPACING },
        })
      );
    }
  }

  return paras;
}

export async function exportToDocx(doc: GovDocument): Promise<Blob> {
  const bodyChildren: Paragraph[] = [];

  bodyChildren.push(...buildMetadataParagraphs(doc));

  for (const node of doc.nodes) {
    bodyChildren.push(...nodeToParas(node));
  }

  bodyChildren.push(...buildFooterParagraphs(doc));

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(GOVDOC_STYLES.margins.top),
              bottom: convertMillimetersToTwip(GOVDOC_STYLES.margins.bottom),
              left: convertMillimetersToTwip(GOVDOC_STYLES.margins.left),
              right: convertMillimetersToTwip(GOVDOC_STYLES.margins.right),
            },
            size: {
              width: convertMillimetersToTwip(GOVDOC_STYLES.pageSize.width),
              height: convertMillimetersToTwip(GOVDOC_STYLES.pageSize.height),
            },
          },
        },
        headers: {
          default: new Header({
            children: [],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: BODY_FONT,
                    size: GOVDOC_STYLES.sizes.footer * 2,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  return Packer.toBlob(document);
}

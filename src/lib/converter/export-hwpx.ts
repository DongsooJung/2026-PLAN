import JSZip from "jszip";
import type { GovDocument, GovDocNode } from "./govdoc-types";
import { GOVDOC_STYLES, METADATA_LABELS } from "./govdoc-constants";
import { formatNumber } from "./numbering";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function ptToHu(pt: number): number {
  return pt * 100;
}

function mmToHu(mm: number): number {
  return Math.round(mm * 2834.645669);
}

function buildParaXml(
  text: string,
  fontName: string,
  fontSize: number,
  bold: boolean = false,
  align: string = "LEFT"
): string {
  const boldAttr = bold ? ' bold="true"' : "";
  return `
    <hp:p>
      <hp:paraPr>
        <hp:align horizontal="${align}" />
        <hp:spacing lineSpacing="${GOVDOC_STYLES.lineSpacing}" lineSpacingType="PERCENT" />
      </hp:paraPr>
      <hp:run>
        <hp:runPr>
          <hp:fontRef hangul="${escapeXml(fontName)}" latin="${escapeXml(fontName)}" />
          <hp:sz val="${ptToHu(fontSize)}"${boldAttr} />
        </hp:runPr>
        <hp:t>${escapeXml(text)}</hp:t>
      </hp:run>
    </hp:p>`;
}

function nodeToHwpxXml(node: GovDocNode): string {
  const { body, heading } = GOVDOC_STYLES.fonts;
  const sizes = GOVDOC_STYLES.sizes;

  switch (node.type) {
    case "title":
      return buildParaXml(node.content, heading, sizes.title, true, "CENTER");
    case "subtitle1":
      return buildParaXml(node.content, heading, sizes.subtitle1, true);
    case "subtitle2":
      return buildParaXml(node.content, heading, sizes.subtitle2, true);
    case "body":
      return buildParaXml(node.content, body, sizes.body);
    case "numbered": {
      const prefix = formatNumber(node.level ?? 1, node.index ?? 0);
      return buildParaXml(`${prefix} ${node.content}`, body, sizes.body);
    }
    case "end-marker":
      return buildParaXml("끝.", body, sizes.body, false, "RIGHT");
    case "metadata-block":
      return buildParaXml(node.content, body, sizes.body);
    case "table": {
      if (!node.rows || node.rows.length === 0) return "";
      const colCount = node.rows[0].length;
      const colWidth = Math.floor(mmToHu(170) / colCount);
      const rowsXml = node.rows
        .map(
          (row, rowIdx) => `
        <hp:tr>
          ${row
            .map(
              (cell) => `
            <hp:tc>
              <hp:tcPr>
                <hp:cellWidth val="${colWidth}" />
                <hp:border>
                  <hp:top type="SOLID" width="1" />
                  <hp:bottom type="SOLID" width="1" />
                  <hp:left type="SOLID" width="1" />
                  <hp:right type="SOLID" width="1" />
                </hp:border>
              </hp:tcPr>
              ${buildParaXml(cell, rowIdx === 0 ? heading : body, sizes.body, rowIdx === 0)}
            </hp:tc>`
            )
            .join("")}
        </hp:tr>`
        )
        .join("");

      return `
      <hp:tbl>
        <hp:tblPr>
          <hp:tblWidth type="ABSOLUTE" val="${mmToHu(170)}" />
        </hp:tblPr>
        ${rowsXml}
      </hp:tbl>`;
    }
    default:
      return "";
  }
}

function buildSectionXml(doc: GovDocument): string {
  const meta = doc.metadata;
  const { body: bodyFont, heading: headingFont } = GOVDOC_STYLES.fonts;
  const sizes = GOVDOC_STYLES.sizes;
  const margins = GOVDOC_STYLES.margins;

  let metaXml = "";
  if (meta.recipient) {
    metaXml += buildParaXml(`${METADATA_LABELS.recipient}: ${meta.recipient}`, bodyFont, sizes.body);
  }
  if (meta.reference) {
    metaXml += buildParaXml(`${METADATA_LABELS.reference}: ${meta.reference}`, bodyFont, sizes.body);
  }

  const nodesXml = doc.nodes.map(nodeToHwpxXml).join("\n");

  let footerXml = "";
  if (meta.drafter) footerXml += buildParaXml(`${METADATA_LABELS.drafter}: ${meta.drafter}`, bodyFont, sizes.footer);
  if (meta.reviewer) footerXml += buildParaXml(`${METADATA_LABELS.reviewer}: ${meta.reviewer}`, bodyFont, sizes.footer);
  if (meta.approver) footerXml += buildParaXml(`${METADATA_LABELS.approver}: ${meta.approver}`, bodyFont, sizes.footer);
  if (meta.department) footerXml += buildParaXml(`${METADATA_LABELS.department}: ${meta.department}`, bodyFont, sizes.footer);
  if (meta.documentNumber) footerXml += buildParaXml(`${METADATA_LABELS.documentNumber}: ${meta.documentNumber}`, bodyFont, sizes.footer);

  return `<?xml version="1.0" encoding="UTF-8"?>
<hp:sec xmlns:hp="http://www.hancom.co.kr/hwpml/2016/paragraph"
        xmlns:hs="http://www.hancom.co.kr/hwpml/2016/section">
  <hp:secPr>
    <hp:pageMargin
      top="${mmToHu(margins.top)}"
      bottom="${mmToHu(margins.bottom)}"
      left="${mmToHu(margins.left)}"
      right="${mmToHu(margins.right)}"
      header="4252"
      footer="4252" />
    <hp:pageSz width="${mmToHu(210)}" height="${mmToHu(297)}" />
  </hp:secPr>
  ${metaXml}
  ${nodesXml}
  ${footerXml}
</hp:sec>`;
}

function buildContentHpf(doc: GovDocument): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<hpf:hwpFile xmlns:hpf="http://www.hancom.co.kr/hwpml/2016/hwpFile">
  <hpf:fileInfo>
    <hpf:title>${escapeXml(doc.nodes.find((n) => n.type === "title")?.content ?? "문서")}</hpf:title>
  </hpf:fileInfo>
  <hpf:bodyText>
    <hpf:section href="Contents/section0.xml" />
  </hpf:bodyText>
</hpf:hwpFile>`;
}

function buildContainerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="Contents/content.hpf" media-type="application/hwp+zip" />
  </rootfiles>
</container>`;
}

export async function exportToHwpx(doc: GovDocument): Promise<Blob> {
  const zip = new JSZip();

  zip.file("mimetype", "application/hwp+zip");
  zip.file("META-INF/container.xml", buildContainerXml());
  zip.file("Contents/content.hpf", buildContentHpf(doc));
  zip.file("Contents/section0.xml", buildSectionXml(doc));

  return zip.generateAsync({ type: "blob", mimeType: "application/hwp+zip" });
}

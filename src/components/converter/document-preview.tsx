"use client";

import { forwardRef, useMemo } from "react";
import type { GovDocument, GovDocNode } from "@/lib/converter/govdoc-types";
import { formatNumber } from "@/lib/converter/numbering";
import { METADATA_LABELS } from "@/lib/converter/govdoc-constants";

function renderNode(node: GovDocNode, idx: number): React.ReactNode {
  switch (node.type) {
    case "title":
      return <h1 key={idx}>{node.content}</h1>;
    case "subtitle1":
      return <h2 key={idx}>{node.content}</h2>;
    case "subtitle2":
      return <h3 key={idx}>{node.content}</h3>;
    case "body":
      return <p key={idx}>{node.content}</p>;
    case "numbered": {
      const prefix = formatNumber(node.level ?? 1, node.index ?? 0);
      const indent = (node.level ?? 1) * 10;
      return (
        <div key={idx} className="numbered-item" style={{ paddingLeft: `${indent}px` }}>
          <strong>{prefix}</strong> {node.content}
        </div>
      );
    }
    case "table": {
      if (!node.rows || node.rows.length === 0) return null;
      return (
        <table key={idx}>
          <thead>
            <tr>
              {node.rows[0].map((cell, ci) => (
                <th key={ci}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {node.rows.slice(1).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "end-marker":
      return (
        <div key={idx} className="end-marker">
          {node.content}
        </div>
      );
    case "metadata-block":
      return (
        <div key={idx} style={{ background: "#f5f5f5", padding: "8px 12px", marginBottom: "8px" }}>
          {node.content}
        </div>
      );
    default:
      return null;
  }
}

interface DocumentPreviewProps {
  document: GovDocument | null;
}

export const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ document: doc }, ref) => {
    const content = useMemo(() => {
      if (!doc) {
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            마크다운을 입력하면 공문서 미리보기가 여기에 표시됩니다.
          </div>
        );
      }

      const meta = doc.metadata;
      const metaFields = [
        { key: "recipient", value: meta.recipient },
        { key: "reference", value: meta.reference },
      ].filter((f) => f.value);

      const footerFields = [
        { key: "drafter", value: meta.drafter },
        { key: "reviewer", value: meta.reviewer },
        { key: "approver", value: meta.approver },
      ].filter((f) => f.value);

      const infoFields = [
        { key: "department", value: meta.department },
        { key: "contactInfo", value: meta.contactInfo },
        { key: "documentNumber", value: meta.documentNumber },
        { key: "enforcementDate", value: meta.enforcementDate },
      ].filter((f) => f.value);

      return (
        <>
          {metaFields.map((f) => (
            <p key={f.key} style={{ textIndent: 0 }}>
              <span className="meta-label">
                {METADATA_LABELS[f.key]}:
              </span>{" "}
              {f.value}
            </p>
          ))}
          {metaFields.length > 0 && <div style={{ marginBottom: "16px" }} />}

          {doc.nodes.map((node, idx) => renderNode(node, idx))}

          {(footerFields.length > 0 || infoFields.length > 0) && (
            <div className="footer-section">
              {footerFields.map((f) => (
                <p key={f.key} style={{ textIndent: 0 }}>
                  <span className="meta-label">
                    {METADATA_LABELS[f.key]}:
                  </span>{" "}
                  {f.value}
                </p>
              ))}
              {infoFields.map((f) => (
                <p key={f.key} style={{ textIndent: 0 }}>
                  <span className="meta-label">
                    {METADATA_LABELS[f.key]}:
                  </span>{" "}
                  {f.value}
                </p>
              ))}
            </div>
          )}
        </>
      );
    }, [doc]);

    return (
      <div ref={ref} className="govdoc-preview">
        {content}
      </div>
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";

"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { QuoteLineItem } from "@/lib/types";

Font.register({
  family: "NotoSansJP",
  src: "https://fonts.gstatic.com/s/notosansjp/v53/-F6ofjtqLzI2JPCgQBnw7HFQei0q1H1hj-sNFQ.woff2",
});

const TAX_RATE = 0.1;

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    padding: 40,
    fontSize: 10,
    color: "#222",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#1a56db",
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#e8f0fe",
    padding: "4 8",
    marginBottom: 4,
    borderRadius: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f4ff",
    padding: "4 6",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    padding: "4 6",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  colTooth: { width: "20%" },
  colTreatment: { width: "38%" },
  colQty: { width: "12%", textAlign: "center" },
  colUnit: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  headerText: { fontWeight: "bold", fontSize: 9, color: "#444" },
  totalSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginBottom: 4,
  },
  totalLabel: { fontSize: 10, color: "#555", width: 80, textAlign: "right" },
  totalValue: { fontSize: 10, width: 80, textAlign: "right" },
  grandTotal: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#1a56db",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", width: 80, textAlign: "right" },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: "#1a56db", width: 80, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingTop: 8,
  },
  note: {
    marginTop: 8,
    fontSize: 8,
    color: "#888",
  },
});

function formatPrice(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

interface Props {
  items: QuoteLineItem[];
  createdAt: string;
}

export default function QuotePDF({ items, createdAt }: Props) {
  const grouped = items.reduce((acc, item) => {
    const key = item.categoryName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, QuoteLineItem[]>);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>自費診療 お見積書</Text>
        <Text style={styles.subtitle}>作成日: {createdAt}</Text>

        {Object.entries(grouped).map(([category, catItems]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colTooth, styles.headerText]}>部位</Text>
              <Text style={[styles.colTreatment, styles.headerText]}>治療内容</Text>
              <Text style={[styles.colQty, styles.headerText]}>数量</Text>
              <Text style={[styles.colUnit, styles.headerText]}>単価</Text>
              <Text style={[styles.colTotal, styles.headerText]}>小計</Text>
            </View>
            {catItems.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colTooth}>{item.toothLabel}</Text>
                <Text style={styles.colTreatment}>{item.treatmentName}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colUnit}>{formatPrice(item.unitPrice)}</Text>
                <Text style={styles.colTotal}>{formatPrice(item.unitPrice * item.quantity)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>小計（税抜）</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>消費税（10%）</Text>
            <Text style={styles.totalValue}>{formatPrice(tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>合計（税込）</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <Text style={styles.note}>※ この見積もりは診察時の状態に基づくものです。治療の進行により変更となる場合があります。</Text>

        <Text style={styles.footer}>自費診療見積書 — 本書は患者様への説明用資料です</Text>
      </Page>
    </Document>
  );
}

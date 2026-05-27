import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const FONT = "NotoSansJP";

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT,
    padding: 40,
    fontSize: 10,
    color: "#222",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: "6 10",
  },
  infoBoxTitle: {
    fontSize: 8,
    color: "#888",
    marginBottom: 4,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 9,
    color: "#555",
    width: 72,
  },
  infoValue: {
    fontSize: 9,
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8f0fe",
    padding: "5 6",
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginTop: 12,
  },
  tableRow: {
    flexDirection: "row",
    padding: "5 6",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "5 6",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fafafa",
  },
  headerText: { fontWeight: "bold", fontSize: 9, color: "#333" },
  colTooth:     { width: "18%" },
  colTreatment: { width: "34%" },
  colMaterial:  { width: "22%" },
  colShade:     { width: "14%", textAlign: "center" },
  colQty:       { width: "8%",  textAlign: "center" },
  colNote:      { width: "4%" },
  noteSection: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: "8 10",
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: "#333",
    lineHeight: 1.5,
  },
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#e8f0fe",
    padding: "4 8",
    marginBottom: 0,
    marginTop: 4,
  },
});

export interface LabOrderItem {
  toothLabel: string;
  treatmentName: string;
  material: string;
  shade: string;
  quantity: number;
  itemNote: string;
}

interface Props {
  patientName: string;
  patientCode: string;
  laboratoryName: string;
  doctorName: string;
  orderDate: string;
  dueDate: string;
  note: string;
  items: LabOrderItem[];
  createdAt: string;
}

export default function LabOrderPDFDoc({
  patientName,
  patientCode,
  laboratoryName,
  doctorName,
  orderDate,
  dueDate,
  note,
  items,
  createdAt,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>技工指示書</Text>
        <Text style={styles.subtitle}>作成日: {createdAt}</Text>

        {/* 情報グリッド */}
        <View style={styles.infoGrid}>
          {/* 患者・医院情報 */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>患者情報・担当医</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>患者コード</Text>
              <Text style={styles.infoValue}>{patientCode}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>患者氏名</Text>
              <Text style={styles.infoValue}>{patientName} 様</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>担当医</Text>
              <Text style={styles.infoValue}>{doctorName || "—"}</Text>
            </View>
          </View>

          {/* 技工所・日程情報 */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>技工所・日程</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>技工所</Text>
              <Text style={styles.infoValue}>{laboratoryName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発注日</Text>
              <Text style={styles.infoValue}>{orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>納品希望日</Text>
              <Text style={styles.infoValue}>{dueDate}</Text>
            </View>
          </View>
        </View>

        {/* 品目テーブル */}
        <Text style={styles.sectionLabel}>指示内容</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.colTooth,     styles.headerText]}>部位</Text>
          <Text style={[styles.colTreatment, styles.headerText]}>処置名</Text>
          <Text style={[styles.colMaterial,  styles.headerText]}>素材</Text>
          <Text style={[styles.colShade,     styles.headerText]}>シェード</Text>
          <Text style={[styles.colQty,       styles.headerText]}>数量</Text>
        </View>
        {items.map((item, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.colTooth}>{item.toothLabel}</Text>
            <Text style={styles.colTreatment}>{item.treatmentName}</Text>
            <Text style={styles.colMaterial}>{item.material || "—"}</Text>
            <Text style={styles.colShade}>{item.shade || "—"}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
          </View>
        ))}

        {/* 特記事項 */}
        {note ? (
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>特記事項</Text>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>技工指示書 — 本書は歯科技工依頼用資料です</Text>
      </Page>
    </Document>
  );
}

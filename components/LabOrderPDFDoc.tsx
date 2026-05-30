import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const FONT = "NotoSansJP";
const NAVY = "#1a3560";
const LIGHT_BLUE = "#dbe8f8";
const BORDER = "#1a3560";
const LINE = "#aab8cc";

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT,
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 30,
    fontSize: 9,
    color: "#111",
    backgroundColor: "#fff",
  },

  /* ── ヘッダー ── */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  headerLeft: {
    flex: 1,
  },
  clinicName: {
    fontSize: 10,
    fontWeight: "bold",
    color: NAVY,
    marginBottom: 2,
  },
  clinicSub: {
    fontSize: 8,
    color: "#555",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  docTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 4,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  issueMeta: {
    fontSize: 8,
    color: "#555",
    marginBottom: 2,
  },

  /* ── 太い区切り線 ── */
  thickRule: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    marginBottom: 8,
  },
  thinRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    marginBottom: 8,
  },

  /* ── 宛先バー ── */
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
    padding: "5 10",
    backgroundColor: "#f5f8ff",
  },
  addressLabel: {
    fontSize: 8,
    color: "#555",
    width: 48,
  },
  addressValue: {
    fontSize: 11,
    fontWeight: "bold",
    flex: 1,
  },
  addressSuffix: {
    fontSize: 9,
    color: "#444",
  },

  /* ── 情報グリッド（2列） ── */
  infoGrid: {
    flexDirection: "row",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoCol: {
    flex: 1,
  },
  infoColDivider: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    minHeight: 20,
  },
  infoRowLast: {
    flexDirection: "row",
    minHeight: 20,
  },
  infoLabel: {
    width: 64,
    fontSize: 8,
    color: "#fff",
    backgroundColor: NAVY,
    padding: "4 6",
    fontWeight: "bold",
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    padding: "4 6",
  },
  infoBold: {
    fontSize: 10,
    fontWeight: "bold",
  },

  /* ── 日程ボックス ── */
  datesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  dateBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: NAVY,
    padding: "5 8",
    width: 72,
    textAlign: "center",
  },
  dateValue: {
    fontSize: 10,
    fontWeight: "bold",
    padding: "4 10",
    flex: 1,
    textAlign: "center",
  },
  dueDateValue: {
    fontSize: 10,
    fontWeight: "bold",
    padding: "4 10",
    flex: 1,
    textAlign: "center",
    color: "#c00",
  },

  /* ── 指示内容テーブル ── */
  sectionHeader: {
    backgroundColor: NAVY,
    padding: "4 8",
    marginBottom: 0,
  },
  sectionHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
    marginBottom: 8,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: LIGHT_BLUE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    minHeight: 22,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    backgroundColor: "#f7faff",
    minHeight: 22,
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 22,
  },
  th: {
    fontSize: 8,
    fontWeight: "bold",
    color: NAVY,
    padding: "4 5",
    textAlign: "center",
  },
  td: {
    fontSize: 9,
    padding: "4 5",
    textAlign: "center",
  },
  tdLeft: {
    fontSize: 9,
    padding: "4 6",
  },
  colNo:        { width: "5%",  borderRightWidth: 0.5, borderRightColor: LINE },
  colTooth:     { width: "16%", borderRightWidth: 0.5, borderRightColor: LINE },
  colTreatment: { width: "33%", borderRightWidth: 0.5, borderRightColor: LINE },
  colMaterial:  { width: "22%", borderRightWidth: 0.5, borderRightColor: LINE },
  colShade:     { width: "12%", borderRightWidth: 0.5, borderRightColor: LINE },
  colQty:       { width: "8%",  borderRightWidth: 0.5, borderRightColor: LINE },
  colNote:      { width: "4%" },

  /* ── 特記事項 ── */
  noteSection: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: NAVY,
    padding: "3 8",
  },
  noteBody: {
    padding: "6 10",
    minHeight: 56,
  },
  noteText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: "#222",
  },
  notePlaceholder: {
    fontSize: 9,
    color: "#aaa",
  },

  /* ── 署名欄 ── */
  signRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  signBox: {
    borderWidth: 1,
    borderColor: BORDER,
    width: 140,
  },
  signLabel: {
    fontSize: 8,
    color: "#fff",
    backgroundColor: NAVY,
    padding: "3 8",
    textAlign: "center",
  },
  signSpace: {
    height: 36,
    padding: "4 8",
    fontSize: 9,
  },

  /* ── フッター ── */
  footer: {
    position: "absolute",
    bottom: 16,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 7,
    color: "#999",
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
  clinicName?: string;
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
  clinicName = "",
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── ヘッダー ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {clinicName ? (
              <Text style={styles.clinicName}>{clinicName}</Text>
            ) : null}
            <Text style={styles.clinicSub}>担当医: {doctorName || "　"}</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>技工指示書</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.issueMeta}>発行日: {createdAt}</Text>
          </View>
        </View>
        <View style={styles.thickRule} />

        {/* ── 宛先 ── */}
        <View style={styles.addressBar}>
          <Text style={styles.addressLabel}>技工所</Text>
          <Text style={styles.addressValue}>{laboratoryName || "　"}</Text>
          <Text style={styles.addressSuffix}>御中</Text>
        </View>

        {/* ── 患者情報 + 日程 ── */}
        <View style={styles.infoGrid}>
          {/* 左列: 患者情報 */}
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>患者コード</Text>
              <Text style={styles.infoValue}>{patientCode}</Text>
            </View>
            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>患者氏名</Text>
              <Text style={[styles.infoValue, styles.infoBold]}>{patientName} 様</Text>
            </View>
          </View>

          {/* 右列: 日程 */}
          <View style={styles.infoColDivider}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発注日</Text>
              <Text style={styles.infoValue}>{orderDate}</Text>
            </View>
            <View style={styles.infoRowLast}>
              <Text style={styles.infoLabel}>納品希望日</Text>
              <Text style={[styles.infoValue, styles.infoBold, { color: "#c00" }]}>{dueDate}</Text>
            </View>
          </View>
        </View>

        {/* ── 指示内容テーブル ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>■ 指示内容</Text>
        </View>
        <View style={styles.table}>
          {/* ヘッダー行 */}
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colNo]}>No.</Text>
            <Text style={[styles.th, styles.colTooth]}>部位</Text>
            <Text style={[styles.th, styles.colTreatment, { textAlign: "left", paddingLeft: 6 }]}>処置名 / 補綴物</Text>
            <Text style={[styles.th, styles.colMaterial, { textAlign: "left", paddingLeft: 6 }]}>素材</Text>
            <Text style={[styles.th, styles.colShade]}>シェード</Text>
            <Text style={[styles.th, styles.colQty]}>数量</Text>
            <Text style={[styles.th, styles.colNote]}>備考</Text>
          </View>

          {/* データ行 */}
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            const rowStyle = isLast
              ? styles.tableRowLast
              : i % 2 === 0
              ? styles.tableRow
              : styles.tableRowAlt;
            return (
              <View key={i} style={rowStyle}>
                <Text style={[styles.td, styles.colNo]}>{i + 1}</Text>
                <Text style={[styles.td, styles.colTooth]}>{item.toothLabel}</Text>
                <Text style={[styles.tdLeft, styles.colTreatment]}>{item.treatmentName}</Text>
                <Text style={[styles.tdLeft, styles.colMaterial]}>{item.material || "—"}</Text>
                <Text style={[styles.td, styles.colShade]}>{item.shade || "—"}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.colNote]}>{item.itemNote || ""}</Text>
              </View>
            );
          })}

          {/* 空行パディング（最低5行確保） */}
          {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
            <View key={`empty-${i}`} style={i === Math.max(0, 5 - items.length) - 1 ? styles.tableRowLast : styles.tableRow}>
              <Text style={[styles.td, styles.colNo]}> </Text>
              <Text style={[styles.td, styles.colTooth]}> </Text>
              <Text style={[styles.tdLeft, styles.colTreatment]}> </Text>
              <Text style={[styles.tdLeft, styles.colMaterial]}> </Text>
              <Text style={[styles.td, styles.colShade]}> </Text>
              <Text style={[styles.td, styles.colQty]}> </Text>
              <Text style={[styles.td, styles.colNote]}> </Text>
            </View>
          ))}
        </View>

        {/* ── 特記事項 ── */}
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>特記事項 / 備考</Text>
          <View style={styles.noteBody}>
            {note ? (
              <Text style={styles.noteText}>{note}</Text>
            ) : (
              <Text style={styles.notePlaceholder}> </Text>
            )}
          </View>
        </View>

        {/* ── 署名欄 ── */}
        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>歯科医師署名</Text>
            <View style={styles.signSpace}>
              <Text style={{ fontSize: 9 }}>{doctorName || ""}</Text>
            </View>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>印</Text>
            <View style={styles.signSpace} />
          </View>
        </View>

        {/* ── フッター ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>技工指示書 — 歯科技工依頼用</Text>
          <Text style={styles.footerText}>発行日: {createdAt}</Text>
        </View>

      </Page>
    </Document>
  );
}

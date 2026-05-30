import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const FONT = "NotoSansJP";
const NAVY = "#1a3560";
const LIGHT_BLUE = "#dbe8f8";
const BORDER = "#1a3560";
const LINE = "#aab8cc";

const CLINIC_POSTAL  = "〒650-0021";
const CLINIC_ADDRESS = "兵庫県神戸市中央区三宮町１−６−１１　三宮本通ビル2階";
const CLINIC_TEL     = "Tel: 078-381-9085";

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT,
    paddingTop: 16,
    paddingBottom: 26,
    paddingHorizontal: 20,
    fontSize: 8,
    color: "#111",
    backgroundColor: "#fff",
  },

  /* ── ヘッダー ── */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  headerLeft: {
    flex: 1,
  },
  clinicName: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: NAVY,
    marginBottom: 1,
  },
  clinicSub: {
    fontSize: 7,
    color: "#555",
    lineHeight: 1.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingTop: 2,
  },
  docTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 4,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 4,
  },
  issueMeta: {
    fontSize: 7,
    color: "#555",
    marginBottom: 2,
  },

  /* ── 区切り線 ── */
  thickRule: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    marginBottom: 5,
  },

  /* ── 宛先バー ── */
  addressBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 5,
    padding: "4 8",
    backgroundColor: "#f5f8ff",
  },
  addressLabel: {
    fontSize: 7,
    color: "#555",
    width: 40,
    paddingTop: 1,
  },
  addressMain: {
    flex: 1,
  },
  addressValue: {
    fontSize: 9.5,
    fontWeight: "bold",
  },
  addressSub: {
    fontSize: 7,
    color: "#555",
    marginTop: 1,
  },
  addressSuffix: {
    fontSize: 8,
    color: "#444",
    paddingTop: 2,
  },

  /* ── 患者情報グリッド ── */
  infoGrid: {
    flexDirection: "row",
    marginBottom: 5,
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
    minHeight: 17,
  },
  infoRowLast: {
    flexDirection: "row",
    minHeight: 17,
  },
  infoLabel: {
    width: 54,
    fontSize: 7.5,
    color: "#fff",
    backgroundColor: NAVY,
    padding: "3 5",
    fontWeight: "bold",
  },
  infoValue: {
    flex: 1,
    fontSize: 8,
    padding: "3 5",
  },
  infoBold: {
    fontSize: 9,
    fontWeight: "bold",
  },

  /* ── 指示内容テーブル ── */
  sectionHeader: {
    backgroundColor: NAVY,
    padding: "3 7",
  },
  sectionHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
    marginBottom: 5,
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
    minHeight: 16,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    backgroundColor: "#f7faff",
    minHeight: 16,
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 16,
  },
  th: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: NAVY,
    padding: "3 4",
    textAlign: "center",
  },
  td: {
    fontSize: 8,
    padding: "3 4",
    textAlign: "center",
  },
  tdLeft: {
    fontSize: 8,
    padding: "3 5",
  },
  colNo:        { width: "5%",  borderRightWidth: 0.5, borderRightColor: LINE },
  colTooth:     { width: "15%", borderRightWidth: 0.5, borderRightColor: LINE },
  colTreatment: { width: "33%", borderRightWidth: 0.5, borderRightColor: LINE },
  colMaterial:  { width: "22%", borderRightWidth: 0.5, borderRightColor: LINE },
  colShade:     { width: "13%", borderRightWidth: 0.5, borderRightColor: LINE },
  colQty:       { width: "8%",  borderRightWidth: 0.5, borderRightColor: LINE },
  colNote:      { width: "4%" },

  /* ── 預かり品 ── */
  depositSection: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 5,
  },
  depositLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: NAVY,
    padding: "3 7",
  },
  depositBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: "4 7",
    gap: 5,
  },
  depositChip: {
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 3,
    padding: "2 6",
    backgroundColor: LIGHT_BLUE,
  },
  depositChipText: {
    fontSize: 8,
    color: NAVY,
    fontWeight: "bold",
  },
  depositEmpty: {
    fontSize: 8,
    color: "#aaa",
    padding: "3 7",
  },

  /* ── 特記事項 ── */
  noteSection: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 5,
  },
  noteLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: NAVY,
    padding: "3 7",
  },
  noteBody: {
    padding: "5 8",
    minHeight: 40,
    maxHeight: 85,
    overflow: "hidden",
  },
  noteText: {
    fontSize: 8,
    lineHeight: 1.6,
    color: "#222",
  },

  /* ── フッター（クリニック情報） ── */
  footer: {
    position: "absolute",
    bottom: 8,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 4,
  },
  footerClinicName: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 1,
  },
  footerAddress: {
    fontSize: 6,
    color: "#666",
  },
  footerText: {
    fontSize: 6.5,
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
  laboratoryAddress?: string;
  laboratoryTel?: string;
  doctorName: string;
  orderDate: string;
  dueDate: string;
  note: string;
  items: LabOrderItem[];
  depositItems?: string[];
  createdAt: string;
}

export default function LabOrderPDFDoc({
  patientName,
  patientCode,
  laboratoryName,
  laboratoryAddress = "",
  laboratoryTel = "",
  doctorName,
  orderDate,
  dueDate,
  note,
  items,
  depositItems = [],
  createdAt,
}: Props) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>

        {/* ── ヘッダー ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft} />
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>技工指示書</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.issueMeta}>発行日: {createdAt}</Text>
            <Text style={styles.issueMeta}>担当医: {doctorName || "　"}</Text>
          </View>
        </View>
        <View style={styles.thickRule} />

        {/* ── 宛先（技工所） ── */}
        <View style={styles.addressBar}>
          <Text style={styles.addressLabel}>技工所</Text>
          <View style={styles.addressMain}>
            <Text style={styles.addressValue}>{laboratoryName || "　"}</Text>
            {(laboratoryAddress || laboratoryTel) ? (
              <Text style={styles.addressSub}>
                {[laboratoryAddress, laboratoryTel].filter(Boolean).join("　")}
              </Text>
            ) : null}
          </View>
          <Text style={styles.addressSuffix}>御中</Text>
        </View>

        {/* ── 患者情報 + 日程 ── */}
        <View style={styles.infoGrid}>
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
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colNo]}>No.</Text>
            <Text style={[styles.th, styles.colTooth]}>部位</Text>
            <Text style={[styles.th, styles.colTreatment, { textAlign: "left", paddingLeft: 6 }]}>処置名 / 補綴物</Text>
            <Text style={[styles.th, styles.colMaterial, { textAlign: "left", paddingLeft: 6 }]}>素材</Text>
            <Text style={[styles.th, styles.colShade]}>シェード</Text>
            <Text style={[styles.th, styles.colQty]}>数量</Text>
            <Text style={[styles.th, styles.colNote]}>備考</Text>
          </View>
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

        {/* ── 預かり品 ── */}
        <View style={styles.depositSection}>
          <Text style={styles.depositLabel}>預かり品</Text>
          {depositItems.length > 0 ? (
            <View style={styles.depositBody}>
              {depositItems.map((d, i) => (
                <View key={i} style={styles.depositChip}>
                  <Text style={styles.depositChipText}>✓ {d}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.depositEmpty}>（なし）</Text>
          )}
        </View>

        {/* ── 特記事項 ── */}
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>特記事項 / 備考</Text>
          <View style={styles.noteBody}>
            <Text style={styles.noteText}>{note || " "}</Text>
          </View>
        </View>

        {/* ── フッター（クリニック情報） ── */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerClinicName}>三宮はともとデンタルクリニック</Text>
            <Text style={styles.footerAddress}>
              {CLINIC_POSTAL}{"  "}{CLINIC_ADDRESS}{"  "}{CLINIC_TEL}
            </Text>
          </View>
          <Text style={styles.footerText}>発行日: {createdAt}</Text>
        </View>

      </Page>
    </Document>
  );
}

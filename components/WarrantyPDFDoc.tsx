import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { WARRANTY_TABLE, type WarrantyItem } from "@/lib/warrantyMap";

const FONT = "NotoSansJP";
const NAVY = "#1a3a5c";
const MID_BLUE = "#2c5f8a";
const LIGHT_BLUE = "#eef5fb";
const PALE_RED = "#fdf0ee";

const s = StyleSheet.create({
  page: { fontFamily: FONT, padding: 36, fontSize: 9, color: "#222" },

  title:    { fontSize: 22, fontWeight: "bold", textAlign: "center", color: NAVY, marginBottom: 4 },
  subtitle: { fontSize: 9, textAlign: "center", color: "#666", marginBottom: 18 },

  // セクションヘッダー（青帯）
  secBar: { backgroundColor: NAVY, color: "white", padding: "5 10", fontSize: 10, fontWeight: "bold", marginTop: 14, marginBottom: 0 },

  // 保証テーブル
  tbl:     { borderWidth: 1, borderColor: "#b0c4d8" },
  tblHead: { flexDirection: "row", backgroundColor: MID_BLUE },
  tblRow:  { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#b0c4d8", minHeight: 22 },
  tblRowAlt: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#b0c4d8", minHeight: 22, backgroundColor: LIGHT_BLUE },

  cType:   { width: "28%", padding: "3 6", justifyContent: "center" },
  cPeriod: { width: "12%", padding: "3 6", textAlign: "center", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },
  cY1:     { width: "14%", padding: "3 6", textAlign: "center", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },
  cY2:     { width: "15%", padding: "3 6", textAlign: "center", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },
  cY3:     { width: "16%", padding: "3 6", textAlign: "center", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },
  cY6:     { width: "15%", padding: "3 6", textAlign: "center", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },
  hText:   { color: "white", fontWeight: "bold", fontSize: 8 },
  bold:    { fontWeight: "bold" },
  gray:    { color: "#aaa" },

  // 脚注
  noteRow: { marginTop: 4 },
  note:    { fontSize: 7.5, color: "#555" },

  // 条件・対象外
  condRow: { flexDirection: "row", gap: 6, marginTop: 0 },
  condBox: { flex: 1, padding: 8 },
  condLeft:  { flex: 1, backgroundColor: LIGHT_BLUE, padding: 8 },
  condRight: { flex: 1, backgroundColor: PALE_RED, padding: 8 },
  condTitle: { fontWeight: "bold", fontSize: 9, marginBottom: 5 },
  condItem:  { fontSize: 8, marginBottom: 3 },

  importBox: { backgroundColor: "#fff9e6", borderWidth: 1, borderColor: "#e0b030", padding: "6 10", marginTop: 8, fontSize: 8, color: "#555" },

  // 医院情報
  clinicRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ddd", padding: "4 2", alignItems: "flex-start" },
  clinicLabel: { width: "15%", color: MID_BLUE, fontWeight: "bold", fontSize: 9 },
  clinicValue: { flex: 1, fontSize: 9 },

  // Page 2
  p2head: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 8, marginBottom: 18 },
  p2clinic: { fontSize: 13, fontWeight: "bold", color: NAVY },
  p2title:  { fontSize: 13, fontWeight: "bold", color: "#333" },

  patiSec: { marginBottom: 16 },
  patiRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333", marginTop: 6, paddingBottom: 4 },
  patiLabel: { color: MID_BLUE, fontWeight: "bold", fontSize: 10, width: 80 },
  patiValue: { flex: 1, fontSize: 10, borderBottomWidth: 0 },

  ttHead: { flexDirection: "row", backgroundColor: MID_BLUE },
  ttRow:  { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#b0c4d8", minHeight: 34 },
  ttRowAlt: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "#b0c4d8", minHeight: 34, backgroundColor: LIGHT_BLUE },
  ttDate: { width: "20%", padding: "4 6", justifyContent: "center" },
  ttType: { width: "32%", padding: "4 6", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },
  ttNote: { flex: 1, padding: "4 6", justifyContent: "center", borderLeftWidth: 0.5, borderLeftColor: "#b0c4d8" },

  sealWrap: { alignItems: "flex-end", marginTop: 24 },
  sealBox:  { width: 80, height: 80, borderWidth: 1, borderColor: "#ccc" },
  sealLabel: { fontSize: 8, color: "#999", marginTop: 3 },

  footer: { position: "absolute", bottom: 18, left: 36, right: 36, fontSize: 7, color: "#bbb", textAlign: "center" },
});

interface Props {
  patientName: string;
  patientCode: string;
  issuedDate: string;
  treatmentDate: string;
  items: WarrantyItem[];
}

// ページ2の治療記録行数は最低12行
const MIN_ROWS = 12;

export default function WarrantyPDFDoc({ patientName, patientCode, issuedDate, treatmentDate, items }: Props) {
  const filledItems = [
    ...items,
    ...Array.from({ length: Math.max(0, MIN_ROWS - items.length) }, () => null),
  ];

  return (
    <Document>
      {/* ====== Page 1: 保証内容 ====== */}
      <Page size="A4" style={s.page}>
        <Text style={s.title}>自費補綴保証書</Text>
        <Text style={s.subtitle}>自費診療補綴物に関する保証書</Text>

        {/* 保証内容テーブル */}
        <Text style={s.secBar}>■ 保証内容（段階保証）</Text>
        <View style={s.tbl}>
          <View style={s.tblHead}>
            <View style={s.cType}><Text style={s.hText}>補綴の種類</Text></View>
            <View style={s.cPeriod}><Text style={s.hText}>保証期間</Text></View>
            <View style={s.cY1}><Text style={s.hText}>1年目</Text></View>
            <View style={s.cY2}><Text style={s.hText}>2〜3年目</Text></View>
            <View style={s.cY3}><Text style={s.hText}>3〜5年目</Text></View>
            <View style={s.cY6}><Text style={s.hText}>6年目以降</Text></View>
          </View>
          {WARRANTY_TABLE.map((row, i) => {
            const RowStyle = i % 2 === 0 ? s.tblRow : s.tblRowAlt;
            const cell = (val: string) =>
              val === "対象外" ? <Text style={s.gray}>{val}</Text> : <Text style={s.bold}>{val}</Text>;
            return (
              <View key={row.category} style={RowStyle}>
                <View style={s.cType}><Text>{row.category}</Text></View>
                <View style={s.cPeriod}><Text>{row.period}</Text></View>
                <View style={s.cY1}>{cell(row.year1)}</View>
                <View style={s.cY2}>{cell(row.year2to3)}</View>
                <View style={s.cY3}>{cell(row.year3to5)}</View>
                <View style={s.cY6}>{cell(row.year6plus)}</View>
              </View>
            );
          })}
        </View>
        <View style={s.noteRow}>
          <Text style={s.note}>※ 負担割合は患者様のご負担割合（再製作・修理費用に対して）。保証期間の起算日は装着日とします。</Text>
          <Text style={s.note}>※ インレー・アンレー（詰め物）は段階保証なし。保証期間（2年間）中は全額無償対応いたします。</Text>
          <Text style={s.note}>※ インプラント体（フィクスチャー）は10年間全額無償保証。</Text>
        </View>

        {/* 保証の適用条件・対象外 */}
        <Text style={s.secBar}>■ 保証の適用条件・対象外事項</Text>
        <View style={s.condRow}>
          <View style={s.condLeft}>
            <Text style={s.condTitle}>【保証が適用される条件】</Text>
            <Text style={s.condItem}>・定期メンテナンス（年1回以上）を継続受診していること</Text>
            <Text style={s.condItem}>・当院の指示通りにご使用・ご自宅ケアを行っていること</Text>
            <Text style={s.condItem}>・材料の製造上の欠陥や技工上の不具合による場合</Text>
          </View>
          <View style={s.condRight}>
            <Text style={s.condTitle}>【保証対象外となる主な事例】</Text>
            <Text style={s.condItem}>・定期検診を受診されなかった場合</Text>
            <Text style={s.condItem}>・事故・外傷・スポーツ等による破損</Text>
            <Text style={s.condItem}>・他院での処置・改変が行われた場合</Text>
            <Text style={s.condItem}>・ナイトガード使用指示に従わなかった場合</Text>
            <Text style={s.condItem}>・虫歯・歯周病の進行による脱落・破損</Text>
            <Text style={s.condItem}>・タバコ・着色飲料による変色</Text>
          </View>
        </View>
        <View style={s.importBox}>
          <Text>【重要事項】 本保証書は再発行いたしません。大切に保管してください。　保証の適用には本保証書のご提示が必要です。　保証内容は予告なく変更になる場合があります。</Text>
        </View>

        {/* 発行医院情報 */}
        <Text style={s.secBar}>■ 発行医院情報</Text>
        <View style={{ marginTop: 4 }}>
          {[
            ["医院名", "三宮はともとデンタルクリニック"],
            ["院長",   "波戸本　亮"],
            ["住所",   "〒650-0021　兵庫県神戸市中央区\n三宮町1-6-11　三宮本通ビル2階"],
            ["電話",   "078-381-9085"],
          ].map(([label, value]) => (
            <View key={label} style={s.clinicRow}>
              <Text style={s.clinicLabel}>{label}</Text>
              <Text style={s.clinicValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={s.footer}>
          このたびは当院をご利用いただきありがとうございます。ご不明な点がございましたらお気軽にスタッフまでお申し付けください。
        </Text>
      </Page>

      {/* ====== Page 2: 患者情報・治療内容記録 ====== */}
      <Page size="A4" style={s.page}>
        <View style={s.p2head}>
          <Text style={s.p2clinic}>三宮はともとデンタルクリニック</Text>
          <Text style={s.p2title}>患者様情報・治療内容記録</Text>
        </View>

        {/* 患者情報 */}
        <Text style={s.secBar}>■ 患者様情報</Text>
        <View style={{ marginTop: 6 }}>
          <View style={s.patiRow}>
            <Text style={s.patiLabel}>患者様氏名</Text>
            <Text style={s.patiValue}>{patientName}</Text>
          </View>
        </View>

        {/* 治療内容テーブル */}
        <Text style={[s.secBar, { marginTop: 16 }]}>■ 治療内容</Text>
        <View style={s.tbl}>
          <View style={s.ttHead}>
            <View style={s.ttDate}><Text style={s.hText}>治療日</Text></View>
            <View style={s.ttType}><Text style={s.hText}>補綴の種類・部位</Text></View>
            <View style={s.ttNote}><Text style={s.hText}>治療内容・備考</Text></View>
          </View>
          {filledItems.map((item, i) => {
            const RowStyle = i % 2 === 0 ? s.ttRow : s.ttRowAlt;
            return (
              <View key={i} style={RowStyle}>
                <View style={s.ttDate}>
                  <Text>{item ? treatmentDate : ""}</Text>
                </View>
                <View style={s.ttType}>
                  <Text>{item ? `${item.warrantyCategory}\n${item.toothLabel}` : ""}</Text>
                </View>
                <View style={s.ttNote}>
                  <Text>{item ? item.treatmentName : ""}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 医院印 */}
        <View style={s.sealWrap}>
          <View style={s.sealBox} />
          <Text style={s.sealLabel}>（医院印）</Text>
        </View>

        <Text style={s.footer}>発行日：{issuedDate}　　三宮はともとデンタルクリニック</Text>
      </Page>
    </Document>
  );
}

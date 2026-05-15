import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "../prisma/dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS "Warranty" (
    "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
    "patientId"   INTEGER,
    "quoteId"     INTEGER,
    "patientName" TEXT NOT NULL,
    "patientCode" TEXT NOT NULL,
    "issuedDate"  TEXT NOT NULL,
    "items"       TEXT NOT NULL,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL,
    FOREIGN KEY ("quoteId")   REFERENCES "Quote"("id")   ON DELETE SET NULL
  );
`);

console.log("Warranty table created (or already exists)");
db.close();

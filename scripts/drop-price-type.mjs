import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "../prisma/dev.db"));

// SQLiteはカラム削除が直接できないので、テーブルを作り直す
db.exec(`
  PRAGMA foreign_keys = OFF;

  CREATE TABLE IF NOT EXISTS Treatment_new (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    categoryId INTEGER NOT NULL,
    unitPrice  INTEGER NOT NULL,
    unit       TEXT    NOT NULL DEFAULT '本',
    isActive   INTEGER NOT NULL DEFAULT 1,
    sortOrder  INTEGER NOT NULL DEFAULT 0,
    createdAt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES Category(id)
  );

  INSERT INTO Treatment_new (id, name, categoryId, unitPrice, unit, isActive, sortOrder, createdAt, updatedAt)
  SELECT id, name, categoryId, unitPrice, unit, isActive, sortOrder, createdAt, updatedAt
  FROM Treatment;

  DROP TABLE Treatment;
  ALTER TABLE Treatment_new RENAME TO Treatment;

  PRAGMA foreign_keys = ON;
`);

console.log("priceType カラムを削除しました");
db.close();

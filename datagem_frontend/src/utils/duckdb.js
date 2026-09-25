import * as duckdb from '@duckdb/duckdb-wasm';

let db = null;
let conn = null;

export const initDuckDB = async () => {
  if (db) return { db, conn };

  // Use the jsdelivr CDN to avoid Vite worker bundling nightmares
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  
  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
  );
  
  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);
  
  conn = await db.connect();
  console.log("DuckDB-WASM Initialized Successfully!");
  
  return { db, conn };
};

export const loadCSVToWASM = async (file, tableName = "dataset") => {
  if (!db || !conn) await initDuckDB();
  
  // Drop table if exists to allow re-uploading
  try { await conn.query(`DROP TABLE IF EXISTS ${tableName};`); } catch (e) {}

  const fileUrl = URL.createObjectURL(file);
  await db.registerFileURL(file.name, fileUrl, duckdb.DuckDBDataProtocol.HTTP, false);
  await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${file.name}');`);
  
  console.log(`Loaded ${file.name} into table ${tableName}`);
  return tableName;
};

export const executeWASMSQL = async (query) => {
  if (!conn) throw new Error("DuckDB not initialized. Upload a file first.");
  try {
    const result = await conn.query(query);
    // Convert Apache Arrow table to array of objects
    return result.toArray().map(row => row.toJSON());
  } catch (error) {
    console.error("WASM Execution Error:", error);
    throw error;
  }
};

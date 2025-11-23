import fs from "fs";
import oracledb from "oracledb";

console.log("✅ Node arch:", process.arch);
console.log("✅ OCI exists:", fs.existsSync("C:\\oracle\\instantclient_23_9\\oci.dll"));

try {
  oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_23_9" });
  console.log("🟢 Thick mode:", oracledb.thickMode);
} catch (err) {
  console.error("❌ Error loading Oracle client:");
  console.error(err);
}

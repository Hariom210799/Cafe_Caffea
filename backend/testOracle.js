import oracledb from "oracledb";

try {
  console.log("🟡 Initializing Oracle Client...");
  oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_23_9" });
  console.log("🟢 Thick mode:", oracledb.thickMode);
} catch (err) {
  console.error("❌ Oracle Client initialization failed:");
  console.error(err);
}

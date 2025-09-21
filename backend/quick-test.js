const { sequelize } = require('./utils/db.js');
// this is quick test file to check connection with railway mysql database 
// to run this file use command : node quick-test.js from backend directory
async function testConnection() {
  try {
    console.log("🔍 Testing connection with corrected port...");
    await sequelize.authenticate();
    console.log("✅ SUCCESS! Database connected with port 37629");
    
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log(`✅ Found ${tables.length} tables`);
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

const username = "vaultadmin";
const password = "Moneyman123@";
const name = "VaultGenesis Admin";
const email = "admin@vaultgenesis.com";
const openId = "admin_vaultadmin_seed";

// Hash the password
const passwordHash = await bcrypt.hash(password, 12);

try {
  // First, create or find the user record
  const [existingUsers] = await conn.execute(
    "SELECT id FROM users WHERE email = ? OR openId = ? LIMIT 1",
    [email, openId]
  );

  let userId;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
    // Update role to admin
    await conn.execute("UPDATE users SET role = 'admin', name = ? WHERE id = ?", [name, userId]);
    console.log(`✅ Updated existing user (id: ${userId}) to admin role`);
  } else {
    // Create new user
    const [result] = await conn.execute(
      "INSERT INTO users (openId, name, email, role, loginMethod, lastSignedIn, createdAt, updatedAt) VALUES (?, ?, ?, 'admin', 'credentials', NOW(), NOW(), NOW())",
      [openId, name, email]
    );
    userId = result.insertId;
    console.log(`✅ Created new admin user (id: ${userId})`);
  }

  // Check if admin credentials already exist
  const [existingCreds] = await conn.execute(
    "SELECT id FROM adminCredentials WHERE username = ? LIMIT 1",
    [username]
  );

  if (existingCreds.length > 0) {
    // Update existing credentials
    await conn.execute(
      "UPDATE adminCredentials SET passwordHash = ?, userId = ?, isActive = 1 WHERE username = ?",
      [passwordHash, userId, username]
    );
    console.log(`✅ Updated admin credentials for username: ${username}`);
  } else {
    // Insert new credentials
    await conn.execute(
      "INSERT INTO adminCredentials (userId, username, passwordHash, createdBy, isActive, createdAt) VALUES (?, ?, ?, ?, 1, NOW())",
      [userId, username, passwordHash, userId]
    );
    console.log(`✅ Created admin credentials for username: ${username}`);
  }

  console.log("\n🎉 Admin account ready!");
  console.log(`   Username: ${username}`);
  console.log(`   Login at: /admin/login`);
} catch (err) {
  console.error("❌ Error seeding admin:", err.message);
  console.error(err);
} finally {
  await conn.end();
}

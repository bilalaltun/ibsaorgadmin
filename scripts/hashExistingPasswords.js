import db from "../lib/db.js";
import { hashPassword } from "../lib/passwordUtils.js";

/**
 * Mevcut kullanıcıların şifrelerini hash'ler
 * Bu script'i sadece bir kez çalıştırın!
 */
async function hashExistingPasswords() {
  try {
    // Tüm kullanıcıları al
    const users = await db("Users").select("id", "username", "password");
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Şifre zaten hash'lenmiş mi kontrol et
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        continue;
      }
      
      // Şifreyi hash'le
      const hashedPassword = await hashPassword(user.password);
      
      // Veritabanını güncelle
      await db("Users")
        .where({ id: user.id })
        .update({ password: hashedPassword });
      
      updatedCount++;
    }
    
    
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    process.exit(0);
  }
}

// Script'i çalıştır
hashExistingPasswords(); 
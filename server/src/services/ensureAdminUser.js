const User = require('../models/User');

async function ensureAdminUser() {
  try {
    // 1. Ensure admin@zora.com
    let admin = await User.findOne({ email: 'admin@zora.com' }).select('+password');
    if (!admin) {
      await User.create({
        name: 'Zora Admin',
        email: 'admin@zora.com',
        password: 'Admin@2026',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Default Admin created: admin@zora.com / Admin@2026');
    } else {
      const match = await admin.matchPassword('Admin@2026');
      if (!match || admin.role !== 'admin' || !admin.isActive) {
        admin.password = 'Admin@2026';
        admin.role = 'admin';
        admin.isActive = true;
        await admin.save();
        console.log('✅ Default Admin credentials synced: admin@zora.com / Admin@2026');
      }
    }

    // 2. Ensure zorasolutions.official@gmail.com
    let officialAdmin = await User.findOne({ email: 'zorasolutions.official@gmail.com' }).select('+password');
    if (!officialAdmin) {
      await User.create({
        name: 'Zora Official Admin',
        email: 'zorasolutions.official@gmail.com',
        password: 'Admin@2026',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Official Admin created: zorasolutions.official@gmail.com / Admin@2026');
    } else {
      const match = await officialAdmin.matchPassword('Admin@2026');
      if (!match || officialAdmin.role !== 'admin' || !officialAdmin.isActive) {
        officialAdmin.password = 'Admin@2026';
        officialAdmin.role = 'admin';
        officialAdmin.isActive = true;
        await officialAdmin.save();
        console.log('✅ Official Admin credentials synced: zorasolutions.official@gmail.com / Admin@2026');
      }
    }

    // 3. Ensure manager@zora.com
    let manager = await User.findOne({ email: 'manager@zora.com' }).select('+password');
    if (!manager) {
      await User.create({
        name: 'Zora Manager',
        email: 'manager@zora.com',
        password: 'Manager@2026',
        role: 'manager',
        isActive: true,
      });
      console.log('✅ Default Manager created: manager@zora.com / Manager@2026');
    } else {
      const match = await manager.matchPassword('Manager@2026');
      if (!match || manager.role !== 'manager' || !manager.isActive) {
        manager.password = 'Manager@2026';
        manager.role = 'manager';
        manager.isActive = true;
        await manager.save();
      }
    }
  } catch (err) {
    console.error('⚠️ Error ensuring default admin/manager accounts:', err.message);
  }
}

module.exports = ensureAdminUser;

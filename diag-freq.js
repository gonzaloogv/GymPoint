const sequelize=require('./backend/node/config/database');
(async()=>{
  try{
    await sequelize.authenticate();
    const [rows] = await sequelize.query("SHOW CREATE TABLE frequency");
    console.log(rows[0]['Create Table']);
  }catch(e){ console.error('auth error', e); }
  finally{ await sequelize.close(); }
})();

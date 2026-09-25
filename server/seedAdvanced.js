require("dotenv").config();
const { sequelize } = require("./config/database");
const University = require("./models/University");
const UniversityExpertise = require("./models/UniversityExpertise");
const Faculty = require("./models/Faculty");

const universities = [
  { name:"IIT (ISM) Dhanbad", code:"IITISM", city:"Dhanbad", district:"Dhanbad", state:"Jharkhand", description:"Technical university profile for SIH matching." },
  { name:"BIT Mesra", code:"BIT", city:"Ranchi", district:"Ranchi", state:"Jharkhand", description:"Technical university profile for SIH matching." },
  { name:"National Institute of Technology Jamshedpur", code:"NITJSR", city:"Jamshedpur", district:"East Singhbhum", state:"Jharkhand", description:"Technical university profile for SIH matching." },
  { name:"Birsa Agricultural University", code:"BAU", city:"Ranchi", district:"Ranchi", state:"Jharkhand", description:"Agriculture-focused university profile for SIH matching." }
];

const expertise = {
  "IIT (ISM) Dhanbad":["Water Management","Energy","Environment","Infrastructure"],
  "BIT Mesra":["Digital Governance","Healthcare","Education","Energy","Infrastructure"],
  "National Institute of Technology Jamshedpur":["Transportation","Energy","Water Management","Public Safety"],
  "Birsa Agricultural University":["Agriculture","Water Management","Environment","Livelihoods"]
};

async function run(){
  await sequelize.authenticate();
  for (const item of universities){
    const [u] = await University.findOrCreate({where:{name:item.name},defaults:item});
    for (const domain of (expertise[item.name]||[])){
      await UniversityExpertise.findOrCreate({
        where:{universityId:u.id,domain},
        defaults:{universityId:u.id,domain,expertiseLevel:4,keywords:domain}
      });
    }
    const [faculty] = await Faculty.findOrCreate({
      where:{universityId:u.id,email:`innovation@${item.code.toLowerCase()}.example`},
      defaults:{universityId:u.id,name:"SIH Innovation Coordinator",email:`innovation@${item.code.toLowerCase()}.example`,department:"Innovation & Research",expertise:(expertise[item.name]||[]).join(", ")}
    });
  }
  console.log("Advanced SIH seed data created.");
  process.exit(0);
}
run().catch(e=>{console.error(e);process.exit(1)});

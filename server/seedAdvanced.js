require("dotenv").config();
const { sequelize } = require("./config/database");
const University = require("./models/University");
const UniversityExpertise = require("./models/UniversityExpertise");
const Faculty = require("./models/Faculty");

const universities = [
  { name:"COEP Technological University", code:"COEP", city:"Pune", district:"Pune", state:"Maharashtra", description:"Premier Maharashtra state technological university specializing in GovTech, IoT, and embedded systems." },
  { name:"Veermata Jijabai Technological Institute (VJTI)", code:"VJTI", city:"Mumbai", district:"Mumbai City", state:"Maharashtra", description:"Autonomous state institute leading research in enterprise cloud architectures and digital governance." },
  { name:"Visvesvaraya National Institute of Technology (VNIT)", code:"VNIT", city:"Nagpur", district:"Nagpur", state:"Maharashtra", description:"Institute of national importance partnering on distributed systems, AI middleware, and smart grids." },
  { name:"Mahatma Phule Krishi Vidyapeeth (MPKV)", code:"MPKV", city:"Rahuri", district:"Ahmednagar", state:"Maharashtra", description:"State agricultural university driving IoT irrigation and DBT direct benefit synchronization." }
];

const expertise = {
  "COEP Technological University":["Digital Governance","Energy","Environment","Infrastructure"],
  "Veermata Jijabai Technological Institute (VJTI)":["Digital Governance","Healthcare","Education","Energy","Infrastructure"],
  "Visvesvaraya National Institute of Technology (VNIT)":["Transportation","Energy","Water Management","Public Safety"],
  "Mahatma Phule Krishi Vidyapeeth (MPKV)":["Agriculture","Water Management","Environment","Livelihoods"]
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

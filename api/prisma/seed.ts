/**
 * Database seed script
 * Seeds the database with default session types
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultSessionTypes = [
  {
    name: "Deep Work",
    category: "Work",
    priority: 5,
  },
  {
    name: "Morning Meditation",
    category: "Health",
    priority: 4,
  },
  {
    name: "Workout",
    category: "Health",
    priority: 4,
  },
  {
    name: "Language Learning",
    category: "Learning",
    priority: 3,
  },
  {
    name: "Client Meeting",
    category: "Work",
    priority: 3,
  },
  {
    name: "Reading",
    category: "Learning",
    priority: 2,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Check if session types already exist
  const existingTypes = await prisma.sessionType.findMany();
  
  if (existingTypes.length > 0) {
    console.log(`✅ Database already has ${existingTypes.length} session types. Skipping seed.`);
    return;
  }

  // Create default session types
  for (const type of defaultSessionTypes) {
    await prisma.sessionType.create({
      data: type,
    });
    console.log(`✅ Created session type: ${type.name}`);
  }

  console.log(`🎉 Successfully seeded ${defaultSessionTypes.length} session types!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


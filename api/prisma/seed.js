/**
 * Database seed script (JavaScript version)
 * Seeds the database with default session types
 * 
 * Note: This script should be run from the api directory after Prisma client is generated
 * Run: npx prisma generate && npm run seed
 */
// For now, users can create session types via the UI
// This seed script can be run manually if needed via API calls
console.log("🌱 To seed the database, please:");
console.log("1. Start the API server: npm run dev");
console.log("2. Use the mobile app to create session types via Settings > Session Types");
console.log("3. Or use the API directly to create session types");
console.log("");
console.log("Default session types to create:");
console.log("- Deep Work (Work, Priority 5)");
console.log("- Morning Meditation (Health, Priority 4)");
console.log("- Workout (Health, Priority 4)");
console.log("- Language Learning (Learning, Priority 3)");
console.log("- Client Meeting (Work, Priority 3)");
console.log("- Reading (Learning, Priority 2)");
process.exit(0);

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


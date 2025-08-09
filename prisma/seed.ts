import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: { name: 'Engineering' },
    }),
    prisma.department.upsert({
      where: { name: 'Product' },
      update: {},
      create: { name: 'Product' },
    }),
    prisma.department.upsert({
      where: { name: 'Design' },
      update: {},
      create: { name: 'Design' },
    }),
    prisma.department.upsert({
      where: { name: 'Operations' },
      update: {},
      create: { name: 'Operations' },
    }),
  ]);

  console.log('✅ Created departments:', departments.map(d => d.name).join(', '));

  // Create current cycle
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  const startOfMonth = new Date(currentYear, now.getMonth(), 1);
  const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);

  const currentCycle = await prisma.cycle.upsert({
    where: { 
      year_month: { year: currentYear, month: currentMonth } 
    },
    update: {},
    create: {
      year: currentYear,
      month: currentMonth,
      startsAt: startOfMonth,
      endsAt: endOfMonth,
      isActive: true,
    },
  });

  console.log(`✅ Created current cycle: ${currentYear}-${String(currentMonth).padStart(2, '0')}`);

  // Create default questions for the current cycle
  const questions = await Promise.all([
    prisma.question.upsert({
      where: { 
        cycleId_order: { cycleId: currentCycle.id, order: 1 }
      },
      update: {},
      create: {
        cycleId: currentCycle.id,
        order: 1,
        text: 'What is the main reason for your score?',
      },
    }),
    prisma.question.upsert({
      where: { 
        cycleId_order: { cycleId: currentCycle.id, order: 2 }
      },
      update: {},
      create: {
        cycleId: currentCycle.id,
        order: 2,
        text: 'What could we do to improve your experience at Propellic?',
      },
    }),
  ]);

  console.log('✅ Created default questions for current cycle');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

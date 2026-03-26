import { prisma } from "./src/lib/db";

async function checkDetails() {
    const staff = await prisma.staff.findMany();
    console.log("Staff Details:");
    staff.forEach(s => console.log(`- ${s.name}: isActive=${s.isActive}, storeId=${s.storeId}`));

    const services = await prisma.service.findMany();
    console.log("Service Details:");
    services.forEach(s => console.log(`- ${s.name}: isActive=${s.isActive}, storeId=${s.storeId}`));
}

checkDetails();

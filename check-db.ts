import { prisma } from "./src/lib/db";

async function checkDb() {
    const stores = await prisma.store.findMany({
        include: {
            _count: {
                select: { services: true, staff: true, banners: true }
            }
        }
    });

    console.log("Stores Count:", stores.length);
    stores.forEach(s => {
        console.log(`Store: ${s.name} (ID: ${s.id}, Slug: ${s.slug})`);
        console.log(`- Services: ${s._count.services}`);
        console.log(`- Staff: ${s._count.staff}`);
        console.log(`- Banners: ${s._count.banners}`);
    });

    const activeStaff = await prisma.staff.count({ where: { isActive: true } });
    const inactiveStaff = await prisma.staff.count({ where: { isActive: false } });
    console.log(`Staff - Active: ${activeStaff}, Inactive: ${inactiveStaff}`);

    const activeServices = await prisma.service.count({ where: { isActive: true } });
    const inactiveServices = await prisma.service.count({ where: { isActive: false } });
    console.log(`Services - Active: ${activeServices}, Inactive: ${inactiveServices}`);
}

checkDb();

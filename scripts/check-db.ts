import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const owners = await prisma.owner.findMany()
    console.log('Owners:', JSON.stringify(owners, null, 2))

    if (owners.length > 0) {
        const stores = await prisma.store.findMany({ where: { ownerId: owners[0].id } })
        console.log('Stores for owner[0]:', JSON.stringify(stores, null, 2))
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

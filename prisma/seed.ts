import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/db"

async function main() {
  const password = await bcrypt.hash("password123", 10)
  
  const user = await prisma.user.upsert({
    where: { email: "admin@bfg-int.com" },
    update: {
      password: password,
    },
    create: {
      email: "admin@bfg-int.com",
      name: "Admin User",
      password: password,
      role: UserRole.ADMIN,
      department: "Management",
    },
  })

  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
      },
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching students' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const student = await prisma.student.create({
      data: {
        name: body.name,
        grade: body.grade,
        section: body.section,
        rollNo: body.rollNo,
        userId: body.userId,
      },
    })
    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating student' }, { status: 500 })
  }
}

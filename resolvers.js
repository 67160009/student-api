let students = [
  {
    id: 1,
    name: "สมชาย ใจดี",
    major: "วิทยาการคอมพิวเตอร์",
    email: "somchai@example.com",
    phone: "080-000-0001",
    courseIds: [101, 102],
  },
  {
    id: 2,
    name: "สมหญิง รักเรียน",
    major: "เทคโนโลยีสารสนเทศ",
    email: "somying@example.com",
    phone: "080-000-0002",
    courseIds: [102],
  },
];

let instructors = [
  { id: 201, name: "ดร.สมศักดิ์ รักสอน" },
  { id: 202, name: "ผศ.ดร.อัญชลี เรียนดี" }
];

let courses = [
  { id: 101, courseName: "การเขียนโปรแกรมเบื้องต้น", credit: 3, instructorId: 201 },
  { id: 102, courseName: "โครงสร้างข้อมูล", credit: 3, instructorId: 202 },
];  

let nextStudentId = 3;

function resolveStudent(student) {
  return {
    ...student,
    courses: courses
      .filter((c) => student.courseIds.includes(c.id))
      .map((c) => ({
        ...c,
        instructor: instructors.find((inst) => inst.id === c.instructorId) // ผูกอาจารย์เข้ากับวิชา
      }))
  };
}   

const root = {
  // ----- Read -----
  student: ({ id }) => {
    const student = students.find((s) => s.id === Number(id));
    return student ? resolveStudent(student) : null;
  },

  students: ({ major, sortBy, hasCourse }) => { // <--- เพิ่มตัวแปร hasCourse มารับค่า
    let result = students;

    // กรองด้วยสาขาวิชา (ถ้ามี)
    if (major) {
      result = result.filter((s) => s.major === major);
    }

    // ⭐ กรองด้วยรายวิชาที่ลงทะเบียน (โจทย์ข้อ 5)
    if (hasCourse) {
      result = result.filter((s) => s.courseIds.includes(Number(hasCourse)));
    }

    // เรียงลำดับ
    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result.map(resolveStudent);
  },

  studentCount: () => students.length,

  course: ({ id }) => courses.find((c) => c.id === Number(id)) || null,

  courses: ({ minCredit }) => {
    if (minCredit === undefined || minCredit === null) {
      return courses;
    }
    return courses.filter((c) => c.credit >= minCredit);
  },

  searchStudents: ({ keyword }) => {
    const lowerKeyword = keyword.toLowerCase();
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(lowerKeyword) ||
          s.major.toLowerCase().includes(lowerKeyword),
      )
      .map(resolveStudent);
  },

  // ----- Create -----
  createStudent: ({ input }) => {
    const newStudent = {
      id: nextStudentId++,
      name: input.name,
      major: input.major,
      email: input.email,
      phone: input.phone,
      courseIds: (input.courseIds || []).map(Number),
    };
    students.push(newStudent);
    return resolveStudent(newStudent);
  },

  // ----- Update -----
  updateStudent: ({ id, input }) => {
    const student = students.find((s) => s.id === Number(id));

    if (!student) {
      return null;
    }

    if (input.name !== undefined) student.name = input.name;
    if (input.major !== undefined) student.major = input.major;
    if (input.email !== undefined) student.email = input.email;
    if (input.phone !== undefined) student.phone = input.phone;
    if (input.courseIds !== undefined) {
      student.courseIds = input.courseIds.map(Number);
    }

    return resolveStudent(student);
  },

  // ----- Delete -----
  deleteStudent: ({ id }) => {
    const index = students.findIndex((s) => s.id === Number(id));

    if (index === -1) {
  return { success: false, message: "ไม่พบข้อมูลนักศึกษาที่ต้องการลบ" };
}

    students.splice(index, 1);
    return { success: true, message: "ลบข้อมูลนักศึกษาสำเร็จ" };
  },
};

module.exports = root;

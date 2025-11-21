export function parseStudentData(raw: string): {
  studentCode: string;
  fullName: string;
  dob?: string;
  faculty: string;
  courseYear: string;
  schoolName?: string;
} {
  try {
    const parsed = JSON.parse(raw);
    return {
      studentCode: parsed.studentCode || "",
      fullName: parsed.fullName || "",
      dob: parsed.dob || undefined,
      faculty: parsed.faculty || "",
      courseYear: parsed.courseYear || "",
      schoolName: parsed.schoolName || "Cao đẳng Công nghệ Thủ Đức",
    };
  } catch {
    const parts = raw.split(/[\|\:,;]/).map(p => p.trim());
    return {
      studentCode: parts[0] || "",
      fullName: parts[1] || "",
      dob: parts[2] || undefined,
      faculty: parts[3] || "",
      courseYear: parts[4] || "",
      schoolName: parts[5] || "Cao đẳng Công nghệ Thủ Đức",
    };
  }
}
export function validateStudentData(data: {
  studentCode: string;
  fullName: string;
  faculty: string;
  courseYear: string;
}) {
  const missingFields = [];

  if (!data.studentCode || data.studentCode.length < 5) missingFields.push("Mã số sinh viên");
if (!data.fullName || data.fullName === "Chưa rõ") missingFields.push("Họ và tên");
if (!data.faculty || data.faculty === "Chưa rõ") missingFields.push("Khoa");
if (!data.courseYear || data.courseYear === "Chưa rõ") missingFields.push("Khóa học");


  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

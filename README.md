# Open Research Statistics Lab

ห้องปฏิบัติการสถิติการวิจัยทางการศึกษา — ทดลองปรับข้อมูล ดูผลคำนวณ และฝึกรายงานผลตามแนวทาง APA 7

เว็บไซต์: https://sfwscoding.github.io/open-research-statistics-lab/

## เป้าหมาย

1. ศึกษาและจำลองการวิเคราะห์ทางสถิติที่เกี่ยวข้องกับงานวิจัยด้านการศึกษา
2. ปรับค่าพารามิเตอร์หรือข้อมูลดิบ แล้วตรวจสอบการเปลี่ยนแปลงของผลลัพธ์
3. สร้างตารางที่มีหมายเลข ชื่อเรื่อง หมายเหตุ และคำบรรยายผลตามแนวทาง APA 7 เพื่อเตรียมใช้กับข้อมูลวิจัยจริง

## ห้องทดลอง

| ห้อง | รายการที่มี |
| --- | --- |
| **Lab 01 – MCQ Item Analysis** | ความยากรายข้อ (p), corrected item-total correlation, D จากกลุ่มสูง/ต่ำ, ตัวลวง, KR-20, ตารางและคำบรรยาย APA |
| **Lab 02 – Rubric Reliability** | Cohen's Kappa ไม่ถ่วงน้ำหนัก; Weighted Kappa แบบ Linear และ Quadratic จากเมทริกซ์ 4 × 4; ตารางและคำบรรยาย APA |
| **Lab 03 – Learning Outcomes** | Exact Binomial (ทางเดียวและสองทาง), One-Sample t, Paired t, One-Sample Wilcoxon, Paired Wilcoxon; โหมดจำลองและข้อมูลดิบ; กราฟ; APA และ CI 95% สำหรับ t |
| **Lab 04 – Competency Tracking** | หลักฐาน KPA 12 ชั่วโมง; Rubric 5 เกณฑ์; Hybrid Rule 80/50/20; ข้อมูลโครงงานจำลอง 4 ชั่วโมง (13–16); ตาราง APA 3 ตาราง |
| **Lab 05 – Chapter 4 Builder** | แก้ข้อมูลและคำนวณใหม่ได้สำหรับ MCQ, Kappa, One-Sample, Paired, Exact Binomial, Hybrid Rule, KPA และโครงงาน; สร้างตาราง APA 8 ตาราง พร้อมคำบรรยายและปุ่มคัดลอก |

**สำคัญ:** Lab 05 ไม่ได้นำข้อมูลจาก Lab 01–04 มาเชื่อมอัตโนมัติ ต้องวางข้อมูลชุดที่ต้องการรายงานลงในช่องของ Lab 05 และกดสร้างรายงานใหม่ทุกครั้ง เพื่อป้องกันการนำตัวเลขจากชุดสาธิตไปใช้ผิดชุด

## ขอบเขตสำคัญทางสถิติ

- ใช้ข้อมูลสังเคราะห์เป็นค่าเริ่มต้น ทุกการทดสอบต้องตรวจสอบข้อมูลจริงและสมมติฐานก่อนรายงานผลวิจัย
- Hybrid Rule: ทุกเกณฑ์รูบริกต้องมีผู้เรียน **≥80% ที่ระดับ ≥2, ≥50% ที่ระดับ ≥3 และ ≥20% ที่ระดับ 4** (15 เงื่อนไข) เป็นเกณฑ์ปฏิบัติการที่ผู้วิจัยกำหนด ไม่ใช่มาตรฐานสากล
- KPA รายชั่วโมงและโครงงานรายชั่วโมงเป็นข้อมูล **เชิงพรรณนา** ไม่ใช่ผลทดสอบนัยสำคัญหรือการยืนยันสมรรถนะโดยลำพัง
- Exact Binomial ต้องมีข้อมูลสองผลลัพธ์ (ผ่าน/ไม่ผ่าน) และสมมติการสังเกตเป็นอิสระ
- Wilcoxon Signed-Rank ใช้การกำหนดเครื่องหมายแบบ conditional exact สำหรับผลต่างไม่เป็นศูนย์ (Wilcox zero method) และอาจมีอันดับซ้ำ ควรตรวจสมมติฐานความสมมาตรของผลต่างก่อนตีความเป็นผลต่างตำแหน่ง
- Weighted Kappa ใช้น้ำหนักความเห็นพ้องเชิงเส้นหรือกำลังสอง โดยต้องกำหนดรูปแบบน้ำหนักให้สอดคล้องกับลักษณะของคะแนนรูบริกก่อนวิเคราะห์
- **ยังไม่มี** ช่วงความเชื่อมั่นสำหรับ Kappa, การส่งไฟล์ Word โดยตรง, หรือการดึงข้อมูลจาก Google Classroom/Sheets อัตโนมัติ
- เว็บไซต์ประมวลผลภายในเบราว์เซอร์ ไม่ควรวางข้อมูลที่ระบุตัวตนนักเรียนลงในเครื่องมือสาธิตโดยไม่มีมาตรการคุ้มครองที่เหมาะสม
- ระบบยังเป็น **Research Prototype** ไม่ใช่เครื่องมือสถิติที่ผ่านการรับรองความถูกต้องสำหรับการตีพิมพ์โดยอัตโนมัติ ควรตรวจผลกับ R, JASP, jamovi หรือ SciPy

## การทดสอบ

ใช้ Node.js เพื่อรันทดสอบสถิติและรูปแบบรายงาน:
```bash
node tests/outcomes.test.js
node tests/stat-extensions.test.js
node tests/research-reporting.test.js
```

GitHub Actions จะรันชุดทดสอบอื่นที่ระบุใน `.github/workflows/statistics-tests.yml` ทุกครั้งที่ push ไปยัง `main`.

## แหล่งอ้างอิง

- [APA Style — Publication Manual, Seventh Edition](https://apastyle.apa.org/products/publication-manual-7th-edition)
- [Purdue OWL — Statistics in APA](https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/statistics_in_apa.html)
- [SciPy — Wilcoxon signed-rank](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.wilcoxon.html)
- [SciPy — Binomial exact test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html)
- [Penn State — Understanding Exam Analysis](https://teaching.psu.edu/scanning/UnderstandingExamAnalysisReport)
- [NIST/SEMATECH e-Handbook of Statistical Methods](https://www.itl.nist.gov/div898/handbook/)

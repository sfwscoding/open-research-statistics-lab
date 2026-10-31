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
| **Lab 01 – MCQ Item Analysis** | แยก 5 เมนู: ความยาก (p), corrected item-total r, อำนาจจำแนก D, ตัวลวง และ KR-20; เมนูละ 1 สถิติและ 1 ตาราง APA พร้อมคำบรรยายใต้ตาราง |
| **Lab 02 – Rubric Reliability** | แยก 4 เมนู: Cohen’s Kappa, Weighted Linear, Weighted Quadratic และ Exact Agreement (%); คะแนนผู้ประเมิน 2 คน × รูบริก 5 เกณฑ์ (23 คนจำลอง) หรือเมทริกซ์ 4×4; Bootstrap CI 95% สำหรับค่า κ; ตาราง APA เฉพาะสถิติที่เลือกอยู่ถัดจากผลทันที |
| **Lab 03 – Learning Outcomes** | แยก 5 วิธี: One-Sample t, One-Sample Wilcoxon, Paired t, Paired Wilcoxon และ Exact Binomial; โหมดจำลอง/ข้อมูลดิบ กราฟ และตาราง APA ของวิธีนั้นตรงใต้ผลทดสอบ; CI 95% สำหรับ t |
| **Lab 04 – Competency Tracking** | แยก 4 มุมมอง: หลักฐาน KPA 12 ชั่วโมง, Micro Task รายชั่วโมง, Hybrid Rule และโครงงาน 13–16; ในแต่ละมุมมองจะมีตาราง APA และคำบรรยายของหัวข้อนั้นทันที ไม่แสดงตารางอื่นปน |
| **Lab 05 – Chapter 4 Builder** | แยก 16 เมนูรายสถิติ ครอบคลุม MCQ 5 รายการ, Kappa 3, ผลการเรียนรู้ 5 และสมรรถนะ/หลักฐาน 3; เลือกวิธีแล้วเห็นเฉพาะช่องข้อมูล ผลคำนวณ ตาราง APA 7 และคำบรรยายของวิธีนั้น พร้อมคัดลอก/บันทึก .txt |

**เงื่อนไขการออกแบบ:** หนึ่งสถิติ = หนึ่งเมนู = หนึ่งมุมมอง ผลลัพธ์ของสถิตินั้นมีตาราง APA 7 ตามทันที และคำบรรยายอยู่ใต้ตาราง ไม่แสดงตารางของสถิติอื่นปนในมุมมองเดียวกัน

**สำคัญ:** Lab 05 ไม่เชื่อมข้อมูลจาก Lab 01–04 อัตโนมัติ ผู้ใช้ต้องวางข้อมูลของชุดวิจัยที่ต้องการรายงานเอง แต่ละกลุ่มข้อมูลคงอยู่เมื่อสลับเมนูภายในหน้าเดียวกัน และการคำนวณจะอัปเดตตามข้อมูลปัจจุบันของหัวข้อที่เลือก

## ขอบเขตสำคัญทางสถิติ

- ใช้ข้อมูลสังเคราะห์เป็นค่าเริ่มต้น ทุกการทดสอบต้องตรวจสอบข้อมูลจริงและสมมติฐานก่อนรายงานผลวิจัย
- Hybrid Rule: ทุกเกณฑ์รูบริกต้องมีผู้เรียน **≥80% ที่ระดับ ≥2, ≥50% ที่ระดับ ≥3 และ ≥20% ที่ระดับ 4** (15 เงื่อนไข) เป็นเกณฑ์ปฏิบัติการที่ผู้วิจัยกำหนด ไม่ใช่มาตรฐานสากล
- KPA รายชั่วโมงและโครงงานรายชั่วโมงเป็นข้อมูล **เชิงพรรณนา** ไม่ใช่ผลทดสอบนัยสำคัญหรือการยืนยันสมรรถนะโดยลำพัง
- Exact Binomial ต้องมีข้อมูลสองผลลัพธ์ (ผ่าน/ไม่ผ่าน) และสมมติการสังเกตเป็นอิสระ
- Wilcoxon Signed-Rank ใช้การกำหนดเครื่องหมายแบบ conditional exact สำหรับผลต่างไม่เป็นศูนย์ (Wilcox zero method) และอาจมีอันดับซ้ำ ควรตรวจสมมติฐานความสมมาตรของผลต่างก่อนตีความเป็นผลต่างตำแหน่ง
- Weighted Kappa ใช้น้ำหนักความเห็นพ้องเชิงเส้นหรือกำลังสอง โดยต้องกำหนดรูปแบบน้ำหนักให้สอดคล้องกับลักษณะของคะแนนรูบริกก่อนวิเคราะห์
- Lab 02 คำนวณค่า Kappa **แยกทั้ง 5 เกณฑ์** ไม่ใช้ค่าเฉลี่ยของ Kappa รายเกณฑ์แทนความเที่ยงของคะแนนรวม และไม่อนุมานค่าผ่านเกณฑ์สมรรถนะจากค่า Kappa
- ช่วงความเชื่อมั่น 95% ใน Lab 02 เป็น **paired percentile bootstrap** แบบ seed คงที่ 1,500 ครั้งต่อเกณฑ์ เพื่อใช้ทดลองศึกษาเท่านั้น; ในกลุ่มตัวอย่างขนาดเล็กอาจครอบคลุมค่าจริงได้ไม่ดี ควรเทียบกับวิธีอื่นก่อนใช้อ้างอิง
- **ยังไม่มี** การส่งไฟล์ Word โดยตรง หรือการดึงข้อมูลจาก Google Classroom/Sheets อัตโนมัติ; ช่วงความเชื่อมั่น Kappa ของ Lab 02 เป็นแบบ paired percentile bootstrap เชิงทดลอง ไม่ใช่วิธีมาตรฐานที่ผ่านการตรวจสอบในทุกสภาพข้อมูล
- เว็บไซต์ประมวลผลภายในเบราว์เซอร์ ไม่ควรวางข้อมูลที่ระบุตัวตนนักเรียนลงในเครื่องมือสาธิตโดยไม่มีมาตรการคุ้มครองที่เหมาะสม
- ระบบยังเป็น **Research Prototype** ไม่ใช่เครื่องมือสถิติที่ผ่านการรับรองความถูกต้องสำหรับการตีพิมพ์โดยอัตโนมัติ ควรตรวจผลกับ R, JASP, jamovi หรือ SciPy

## การทดสอบ

ใช้ Node.js เพื่อรันทดสอบสถิติและรูปแบบรายงาน:
```bash
node tests/outcomes.test.js
node tests/stat-extensions.test.js
node tests/research-reporting.test.js
node tests/rubric-reliability.test.js
```

GitHub Actions จะรันชุดทดสอบอื่นที่ระบุใน `.github/workflows/statistics-tests.yml` ทุกครั้งที่ push ไปยัง `main`.

## แหล่งอ้างอิง

- [APA Style — Publication Manual, Seventh Edition](https://apastyle.apa.org/products/publication-manual-7th-edition)
- [Purdue OWL — Statistics in APA](https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/statistics_in_apa.html)
- [SciPy — Wilcoxon signed-rank](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.wilcoxon.html)
- [SciPy — Binomial exact test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html)
- [Penn State — Understanding Exam Analysis](https://teaching.psu.edu/scanning/UnderstandingExamAnalysisReport)
- [NIST/SEMATECH e-Handbook of Statistical Methods](https://www.itl.nist.gov/div898/handbook/)

/* Lab 02: two-rater, four-level ordinal rubric agreement.
   Pure calculation module. Does not infer significance or rubric validity. */
(function (root) {
  "use strict";
  const LEVELS = 4;
  const DIMENSIONS = 5;
  const MODES = ["unweighted", "linear", "quadratic"];
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function integer(value, label, min, max) {
    const raw = String(value).trim();
    const result = Number(raw);
    assert(raw !== "" && Number.isSafeInteger(result) && result >= min && result <= max,
      label + " ต้องเป็นจำนวนเต็ม " + min + "–" + max);
    return result;
  }
  function emptyMatrix() { return Array.from({length: LEVELS}, () => Array(LEVELS).fill(0)); }
  function fromPairs(pairs) {
    assert(Array.isArray(pairs) && pairs.length > 0, "ต้องมีคะแนนผู้ประเมินอย่างน้อยหนึ่งคู่");
    const matrix = emptyMatrix();
    pairs.forEach(([a, b], i) => matrix[integer(a, "ผู้ประเมิน 1 คู่ที่ " + (i + 1), 1, 4) - 1]
      [integer(b, "ผู้ประเมิน 2 คู่ที่ " + (i + 1), 1, 4) - 1]++);
    return matrix;
  }
  function pairsFromMatrix(matrix) {
    validateMatrix(matrix);
    const pairs = [];
    matrix.forEach((row, i) => row.forEach((count, j) => {
      for (let k = 0; k < count; k++) pairs.push([i + 1, j + 1]);
    }));
    return pairs;
  }
  function validateMatrix(matrix) {
    assert(Array.isArray(matrix) && matrix.length === LEVELS &&
      matrix.every(row => Array.isArray(row) && row.length === LEVELS),
      "ตารางไขว้ต้องมี 4 แถว × 4 คอลัมน์");
    let n = 0;
    matrix.forEach((row, i) => row.forEach((value, j) => {
      n += integer(value, "จำนวนในช่อง " + (i + 1) + "–" + (j + 1), 0, 500);
    }));
    assert(n >= 1 && n <= 500, "จำนวนการประเมินรวมต้องอยู่ในช่วง 1–500 คู่");
    return n;
  }
  function weight(i, j, kind) {
    const distance = Math.abs(i - j) / (LEVELS - 1);
    return kind === "unweighted" ? Number(i === j)
      : kind === "linear" ? 1 - distance
      : 1 - distance * distance;
  }
  function statistics(matrix) {
    const n = validateMatrix(matrix);
    const r1 = matrix.map(row => row.reduce((sum, value) => sum + value, 0));
    const r2 = Array.from({length: LEVELS}, (_, j) =>
      matrix.reduce((sum, row) => sum + row[j], 0));
    const exact = matrix.reduce((sum, row, i) => sum + row[i], 0);
    const mad = matrix.reduce((sum, row, i) => sum + row.reduce((s, count, j) =>
      s + count * Math.abs(i - j), 0), 0) / n;
    const methods = {};
    for (const kind of MODES) {
      let observed = 0, expected = 0;
      for (let i = 0; i < LEVELS; i++) for (let j = 0; j < LEVELS; j++) {
        const w = weight(i, j, kind);
        observed += w * matrix[i][j] / n;
        expected += w * r1[i] * r2[j] / (n * n);
      }
      const denominator = 1 - expected;
      methods[kind] = {
        po: observed,
        pe: expected,
        kappa: Math.abs(denominator) < 1e-12 ? null : (observed - expected) / denominator,
      };
    }
    return {n, matrix, r1, r2, exact, exactPercent: exact / n * 100,
      meanAbsoluteDifference: mad, methods};
  }
  function splitCSV(text) {
    assert(typeof text === "string" && text.trim() !== "", "กรุณากรอกคะแนน CSV");
    const lines = text.replace(/\r/g, "").split("\n").filter(s => s.trim());
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    function parseLine(line) {
      const fields = []; let value = "", quoted = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { if (quoted && line[i+1] === '"') { value += '"'; i++; }
          else quoted = !quoted;
        } else if (c === delimiter && !quoted) { fields.push(value.trim()); value = ""; }
        else value += c;
      }
      assert(!quoted, "เครื่องหมายคำพูดใน CSV ไม่ครบคู่");
      fields.push(value.trim());
      return fields;
    }
    return lines.map(parseLine);
  }
  const HEAD = ["student_id", ...Array.from({length: 5}, (_, j) => "r1_c" + (j+1)),
    ...Array.from({length: 5}, (_, j) => "r2_c" + (j+1))];
  function readCSV(text) {
    const cells = splitCSV(text);
    assert(cells.length >= 2 && cells.length <= 501, "ต้องมีแถวหัวตารางและนักเรียน 1–500 คน");
    const normalized = cells[0].map(x => x.toLowerCase().replace(/\s/g, ""));
    assert(normalized.join(",") === HEAD.join(","),
      "หัวตารางต้องเรียง student_id,r1_c1…r1_c5,r2_c1…r2_c5 (คัดลอกแม่แบบได้)");
    const identifiers = new Set();
    const records = cells.slice(1).map((values, i) => {
      const index = i + 2;
      assert(values.length === 11, "แถวที่ " + index + " ต้องมี 11 คอลัมน์");
      const id = values[0].trim();
      assert(id !== "", "รหัสนักเรียนแถวที่ " + index + " ต้องไม่ว่าง");
      assert(!identifiers.has(id), "รหัสนักเรียนซ้ำ: " + id);
      identifiers.add(id);
      return {
        id,
        r1: values.slice(1, 6).map((v, j) => integer(v, "Rater 1 เกณฑ์ " + (j+1) + " แถว " + index, 1, 4)),
        r2: values.slice(6, 11).map((v, j) => integer(v, "Rater 2 เกณฑ์ " + (j+1) + " แถว " + index, 1, 4))
      };
    });
    return records;
  }
  function csvEscape(value) {
    const s = String(value);
    return /[,"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(records) {
    return [HEAD.join(","), ...records.map(r => [r.id, ...r.r1, ...r.r2].map(csvEscape).join(","))].join("\n");
  }
  function demoData(n = 23) {
    n = integer(n, "จำนวนนักเรียน", 3, 200);
    return Array.from({length: n}, (_, i) => {
      const r1 = Array.from({length: DIMENSIONS}, (_, j) => 1 + ((i * 7 + j * 11 + Math.floor(i/4)) % 4));
      const r2 = r1.map((v, j) => {
        const index = (i * 3 + j * 5 + Math.floor(i/3)) % 11;
        return index < 6 ? v : index < 9 ? Math.min(4, v + 1) : Math.max(1, v - 1);
      });
      return {id: "S" + String(i+1).padStart(3,"0"), r1, r2};
    });
  }
  function random(seed) {
    let x = seed >>> 0;
    return function () { x += 0x6d2b79f5; let t = x;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function quantile(data, q) {
    const i = (data.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
    return data[lo] + (data[hi] - data[lo]) * (i - lo);
  }
  function bootstrapCI(pairs, options = {}) {
    const n = pairs.length;
    const iterations = integer(options.iterations == null ? 1500 : options.iterations, "จำนวนครั้ง bootstrap", 200, 10000);
    const seed = (options.seed == null ? 230425 : options.seed) >>> 0;
    const rng = random(seed);
    const arrays = {unweighted:[], linear:[], quadratic:[]};
    if (n < 3) return {iterations, confidence:0.95,
      methods:Object.fromEntries(MODES.map(kind => [kind, {low:null, high:null, valid:0}]))};
    for (let b = 0; b < iterations; b++) {
      const matrix = emptyMatrix();
      for (let i = 0; i < n; i++) {
        const pair = pairs[Math.floor(rng() * n)];
        matrix[pair[0]-1][pair[1]-1]++;
      }
      const s = statistics(matrix);
      for (const kind of MODES) {
        if (Number.isFinite(s.methods[kind].kappa)) arrays[kind].push(s.methods[kind].kappa);
      }
    }
    const methods = {};
    for (const kind of MODES) {
      const vals = arrays[kind];
      vals.sort((a, b) => a-b);
      // Too many undefined resamples: no misleading interval.
      methods[kind] = vals.length >= Math.ceil(iterations * 0.8)
        ? {low:quantile(vals, .025), high:quantile(vals, .975), valid:vals.length}
        : {low:null, high:null, valid:vals.length};
    }
    return {iterations, confidence:0.95, methods};
  }
  function analyzeRecords(records, options = {}) {
    assert(Array.isArray(records) && records.length >= 1 && records.length <= 500,
      "ต้องมีนักเรียน 1–500 คน");
    const criteria = [];
    for (let j = 0; j < DIMENSIONS; j++) {
      const pairs = records.map(rec => [rec.r1[j], rec.r2[j]]);
      const m = fromPairs(pairs);
      const stats = statistics(m);
      const bootstrap = bootstrapCI(pairs, {iterations: options.iterations == null ? 1500 : options.iterations,
        seed: (options.seed == null ? 230425 : options.seed) + j * 13171});
      criteria.push({criterion:j+1, ...stats, bootstrap});
    }
    return {n:records.length, criteria};
  }
  function analyzeMatrix(matrix, options = {}) {
    const stats = statistics(matrix);
    return {...stats, bootstrap:bootstrapCI(pairsFromMatrix(matrix), options)};
  }
  root.RubricReliability = {HEAD, MODES, readCSV, toCSV, demoData, emptyMatrix, validateMatrix,
    statistics, analyzeRecords, analyzeMatrix, bootstrapCI, fromPairs, pairsFromMatrix};
})(typeof module !== "undefined" && module.exports ? module.exports : window);

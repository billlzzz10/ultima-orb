// ดึงข้อมูล Notion databases ทั้งหมดและบันทึกเป็นไฟล์ (แบบง่าย ไม่ใช้ AI)
const fs = require("fs");
const path = require("path");

// API Keys
const NOTION_TOKEN = "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";

/**
 * ดึงรายการ databases ทั้งหมด
 */
async function fetchAllDatabases() {
  console.info("🔗 ดึงรายการ databases ทั้งหมด...");

  try {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "database",
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.info(`✅ พบ ${data.results.length} databases`);
      return data.results;
    } else {
      console.info("❌ ดึงรายการ databases ไม่สำเร็จ:", response.status);
      return [];
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    return [];
  }
}

/**
 * ดึงข้อมูล database เฉพาะ
 */
async function fetchDatabaseContent(database) {
  console.info(
    `📄 ดึงข้อมูล database: ${database.title[0]?.plain_text || "Untitled"}`
  );

  try {
    // ดึงโครงสร้าง database
    const dbResponse = await fetch(
      `https://api.notion.com/v1/databases/${database.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (!dbResponse.ok) {
      console.info(
        `❌ ดึงโครงสร้าง database ${database.id} ไม่สำเร็จ:`,
        dbResponse.status
      );
      return null;
    }

    const dbData = await dbResponse.json();

    // ดึงข้อมูล pages (จำกัดที่ 100 pages ต่อ database)
    const pagesResponse = await fetch(
      `https://api.notion.com/v1/databases/${database.id}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      }
    );

    let pages = [];
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      pages = pagesData.results;
    }

    return {
      database: dbData,
      pages,
      total_pages: pages.length,
    };
  } catch (error) {
    console.error(
      `❌ เกิดข้อผิดพลาดในการดึงข้อมูล database ${database.id}:`,
      error
    );
    return null;
  }
}

/**
 * บันทึกข้อมูลเป็นไฟล์ JSON
 */
function saveToFile(data, filename) {
  try {
    const outputDir = path.resolve(__dirname, "..", "notion-outputs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.resolve(outputDir, filename);
    if (!filepath.startsWith(outputDir + path.sep)) {
      throw new Error(`Path traversal attempt detected for filename: ${filename}`);
    }

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
    console.info(`💾 บันทึกข้อมูลลงไฟล์: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการบันทึกไฟล์:", error);
    return null;
  }
}

/**
 * ดึงข้อมูลทั้งหมดและบันทึก
 */
async function fetchAllData() {
  console.info("🚀 เริ่มต้นดึงข้อมูล Notion ทั้งหมด...\n");

  const startTime = Date.now();
  const allData = {
    metadata: {
      fetched_at: new Date().toISOString(),
      total_databases: 0,
      total_pages: 0,
      processing_time_ms: 0,
    },
    databases: [],
    summary: {
      database_types: {},
      total_properties: 0,
      average_pages_per_database: 0,
    },
  };

  // ดึงรายการ databases
  const databases = await fetchAllDatabases();
  allData.metadata.total_databases = databases.length;

  console.info(`\n📊 เริ่มดึงข้อมูลจาก ${databases.length} databases...\n`);

  // ดึงข้อมูลแต่ละ database
  for (let i = 0; i < databases.length; i++) {
    const database = databases[i];
    console.info(
      `[${i + 1}/${databases.length}] กำลังดึงข้อมูล: ${
        database.title[0]?.plain_text || "Untitled"
      }`
    );

    const dbContent = await fetchDatabaseContent(database);
    if (dbContent) {
      allData.databases.push(dbContent);
      allData.metadata.total_pages += dbContent.total_pages;

      console.info(`✅ ดึงข้อมูลสำเร็จ: ${dbContent.total_pages} pages`);

      // บันทึกแต่ละ database แยกไฟล์
      const dbFilename = `notion-database-${database.id}-${Date.now()}.json`;
      saveToFile(dbContent, dbFilename);
    } else {
      console.info(`❌ ดึงข้อมูลไม่สำเร็จ`);
    }

    // รอสักครู่เพื่อไม่ให้ API rate limit
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // คำนวณสถิติ
  allData.metadata.processing_time_ms = Date.now() - startTime;
  allData.summary.average_pages_per_database =
    allData.metadata.total_pages / allData.metadata.total_databases;

  // นับ properties ทั้งหมด
  const allProperties = new Set();
  allData.databases.forEach((db) => {
    Object.keys(db.database.properties).forEach((prop) =>
      allProperties.add(prop)
    );
  });
  allData.summary.total_properties = allProperties.size;

  // บันทึกไฟล์รวม
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `notion-all-data-${timestamp}.json`;
  const filepath = saveToFile(allData, filename);

  // สรุปผล
  console.info("\n🎉 ดึงข้อมูลเสร็จสิ้น!");
  console.info(`📊 สรุปผล:`);
  console.info(`   - Databases: ${allData.metadata.total_databases}`);
  console.info(`   - Pages: ${allData.metadata.total_pages}`);
  console.info(`   - Properties: ${allData.summary.total_properties}`);
  console.info(
    `   - เวลาที่ใช้: ${(allData.metadata.processing_time_ms / 1000).toFixed(
      2
    )} วินาที`
  );
  console.info(`   - ไฟล์รวม: ${filepath}`);

  console.info(`\n📋 รายชื่อ Databases:`);
  allData.databases.forEach((db, index) => {
    console.info(
      `   ${index + 1}. ${db.database.title[0]?.plain_text || "Untitled"} (${
        db.total_pages
      } pages)`
    );
  });

  return allData;
}

// รันการดึงข้อมูล
fetchAllData().catch(console.error);

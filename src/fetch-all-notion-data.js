// ดึงข้อมูล Notion databases ทั้งหมดและบันทึกเป็นไฟล์
const fs = require("fs");
const path = require("path");

// API Keys
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";

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
      fetched_at: new Date().toISOString(),
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
 * ดึงข้อมูล page เฉพาะ
 */
async function fetchPageContent(pageId) {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.info(`❌ ดึงข้อมูล page ${pageId} ไม่สำเร็จ:`, response.status);
      return null;
    }
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการดึงข้อมูล page ${pageId}:`, error);
    return null;
  }
}

/**
 * ดึงข้อมูล blocks ของ page
 */
async function fetchPageBlocks(pageId) {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.info(
        `❌ ดึงข้อมูล blocks ของ page ${pageId} ไม่สำเร็จ:`,
        response.status
      );
      return null;
    }
  } catch (error) {
    console.error(
      `❌ เกิดข้อผิดพลาดในการดึงข้อมูล blocks ของ page ${pageId}:`,
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
    const outputDir = path.join(__dirname, "data");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.info(`💾 บันทึกข้อมูลลงไฟล์: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการบันทึกไฟล์:", error);
    return null;
  }
}

/**
 * วิเคราะห์ข้อมูล Notion
 */
function analyzeNotionData(databases) {
  console.info("🔍 วิเคราะห์ข้อมูล Notion...");

  const analysis = {
    summary: {
      total_databases: databases.length,
      total_pages: 0,
      total_properties: 0,
      property_types: {},
      created_dates: [],
      last_edited_dates: [],
    },
    databases: [],
    insights: [],
  };

  databases.forEach((db) => {
    // ตรวจสอบว่า db เป็น object ที่มี database property หรือไม่
    const databaseData = db.database || db;

    const dbAnalysis = {
      id: databaseData.id,
      title: databaseData.title?.[0]?.plain_text || "Untitled",
      url: databaseData.url,
      created_time: databaseData.created_time,
      last_edited_time: databaseData.last_edited_time,
      properties: Object.keys(databaseData.properties || {}),
      property_types: {},
      total_pages: db.pages?.length || 0,
    };

    // วิเคราะห์ properties
    if (databaseData.properties) {
      Object.entries(databaseData.properties).forEach(([key, prop]) => {
        const type = prop.type;
        dbAnalysis.property_types[key] = type;
        analysis.summary.property_types[type] =
          (analysis.summary.property_types[type] || 0) + 1;
      });
    }

    analysis.summary.total_pages += dbAnalysis.total_pages;
    analysis.summary.total_properties += dbAnalysis.properties.length;
    analysis.databases.push(dbAnalysis);
  });

  // สร้าง insights
  analysis.insights = generateInsights(analysis);

  return analysis;
}

/**
 * สร้าง insights จากข้อมูล
 */
function generateInsights(analysis) {
  const insights = [];

  // Insight 1: จำนวน databases และ pages
  insights.push({
    type: "summary",
    title: "ภาพรวมข้อมูล",
    description: `พบ ${analysis.summary.total_databases} databases และ ${analysis.summary.total_pages} pages`,
    data: {
      databases: analysis.summary.total_databases,
      pages: analysis.summary.total_pages,
    },
  });

  // Insight 2: ประเภท properties ที่ใช้บ่อย
  const topPropertyTypes = Object.entries(analysis.summary.property_types)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  insights.push({
    type: "properties",
    title: "ประเภท Properties ที่ใช้บ่อย",
    description: `ประเภท properties ที่ใช้บ่อยที่สุด: ${topPropertyTypes
      .map(([type, count]) => `${type} (${count})`)
      .join(", ")}`,
    data: topPropertyTypes,
  });

  // Insight 3: Databases ที่มี pages มากที่สุด
  const topDatabases = analysis.databases
    .sort((a, b) => b.total_pages - a.total_pages)
    .slice(0, 3);

  insights.push({
    type: "databases",
    title: "Databases ที่มี Pages มากที่สุด",
    description: `Databases ที่มี pages มากที่สุด: ${topDatabases
      .map((db) => `${db.title} (${db.total_pages} pages)`)
      .join(", ")}`,
    data: topDatabases,
  });

  return insights;
}

/**
 * ฟังก์ชันหลัก
 */
async function main() {
  console.info("🚀 เริ่มดึงข้อมูล Notion...");
  console.info("=".repeat(50));

  try {
    // 1. ดึงรายการ databases ทั้งหมด
    const databases = await fetchAllDatabases();
    if (databases.length === 0) {
      console.info("❌ ไม่พบ databases");
      return;
    }

    // 2. ดึงข้อมูลแต่ละ database
    const databaseContents = [];
    for (const database of databases) {
      const content = await fetchDatabaseContent(database);
      if (content) {
        databaseContents.push(content);
      }
      // รอสักครู่เพื่อไม่ให้เกิน rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 3. บันทึกข้อมูลดิบ
    const rawData = {
      fetched_at: new Date().toISOString(),
      total_databases: databaseContents.length,
      databases: databaseContents,
    };
    saveToFile(rawData, "notion-raw-data.json");

    // 4. วิเคราะห์ข้อมูล
    const analysis = analyzeNotionData(databaseContents);
    saveToFile(analysis, "notion-analysis.json");

    // 5. แสดงสรุป
    console.info("=".repeat(50));
    console.info("✅ ดึงข้อมูลเสร็จสิ้น!");
    console.info(
      `📊 สรุป: ${analysis.summary.total_databases} databases, ${analysis.summary.total_pages} pages`
    );
    console.info(
      `💾 ไฟล์ที่สร้าง: data/notion-raw-data.json, data/notion-analysis.json`
    );

    // แสดง insights
    console.info("\n🔍 Insights:");
    analysis.insights.forEach((insight, index) => {
      console.info(`${index + 1}. ${insight.title}: ${insight.description}`);
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในฟังก์ชันหลัก:", error);
  }
}

// รันฟังก์ชันหลัก
if (require.main === module) {
  main();
}

module.exports = {
  fetchAllDatabases,
  fetchDatabaseContent,
  fetchPageContent,
  fetchPageBlocks,
  analyzeNotionData,
  generateInsights,
  main,
};

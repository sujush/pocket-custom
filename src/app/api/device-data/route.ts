import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import csvParser from "csv-parser";
import { PassThrough } from "stream";

type CSVRow = Record<string, string>; 
// CSV 컬럼이 많다면 별도 interface를 정의하는 것도 가능

export async function GET() {
  // CSV 파일 경로 (예: 프로젝트 루트의 'public/data/Device_new_list.csv')
  const csvFilePath = path.join(process.cwd(), "public", "data", "Device_list.csv");

  try {
    // 1) CSV 파일을 읽어서 Buffer로 받음
    const fileData = await fs.readFile(csvFilePath);

    const rows: CSVRow[] = [];

    // 2) csv-parser를 이용해 Buffer 데이터를 스트리밍 & 파싱
    await new Promise<void>((resolve, reject) => {
      const bufferStream = new PassThrough();
      // 파일에서 읽은 Buffer를 스트림에 그대로 밀어넣기
      bufferStream.end(fileData);

      bufferStream
        .pipe(csvParser())
        .on("data", (row: CSVRow) => {
          rows.push(row);
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (err: unknown) => {
          if (err instanceof Error) {
            reject(err);
          } else {
            reject(new Error("Unknown error occurred during CSV parsing."));
          }
        });
    });

    // 3) 파싱 완료된 데이터를 JSON으로 반환
    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    );
  }
}

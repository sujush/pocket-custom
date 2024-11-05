// src/lib/db.ts
import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function createUser(email: string, password: string, name: string) {
  const params = {
    TableName: 'Users',
    Item: {
      email,
      password, // 실제 구현 시 비밀번호는 해싱 처리해야 합니다
      name,
      userType: 'free',
      hsCodeLookups: 0,
    },
  };

  await dynamodb.put(params).promise();
}

// 다른 데이터베이스 관련 함수들...
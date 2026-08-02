import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

@Injectable()
export class ObjectStorageService {
  constructor(private readonly config: ConfigService) {}
  private connection() {
    const bucket = this.config.get<string>("S3_BUCKET");
    const accessKeyId = this.config.get<string>("S3_ACCESS_KEY_ID");
    const secretAccessKey = this.config.get<string>("S3_SECRET_ACCESS_KEY");
    if (!bucket || !accessKeyId || !secretAccessKey) throw new ServiceUnavailableException("Object storage is not configured.");
    return { bucket, client: new S3Client({ region: this.config.get("AWS_REGION", "ap-southeast-2"), endpoint: this.config.get<string>("S3_ENDPOINT") || undefined, credentials: { accessKeyId, secretAccessKey } }) };
  }
  async put(accountId: string, body: Uint8Array, contentType: string) {
    const { bucket, client } = this.connection();
    const key = `${accountId}/${randomUUID()}`;
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, ServerSideEncryption: "AES256" }));
    return key;
  }
  async get(key: string) {
    const { bucket, client } = this.connection();
    return client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  }
}

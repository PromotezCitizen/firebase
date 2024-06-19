import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Database } from 'firebase-admin/lib/database/database';

const serviceAccount = (configService: ConfigService) => {
  return {
    type: configService.get<string>('firebase.admin.type'),
    project_id: configService.get<string>('firebase.projectId'),
    private_key_id: configService.get<string>('firebase.admin.privateKeyId'),
    private_key: configService.get<string>('firebase.admin.privateKey'),
    client_email: configService.get<string>('firebase.admin.clientEmail'),
    client_id: configService.get<string>('firebase.admin.clientId'),
    auth_uri: configService.get<string>('firebase.admin.URI.auth'),
    token_uri: configService.get<string>('firebase.admin.URI.token'),
    auth_provider_x509_cert_url: configService.get<string>('firebase.admin.URI.authCert'),
    client_x509_cert_url: configService.get<string>('firebase.admin.URI.clientCert'),
    universe_domain: configService.get<string>('firebase.admin.universeDomain'),
  };
};

@Injectable()
export class FirebaseService {
  private database: Database;
  constructor(private readonly configService: ConfigService) {
    admin.initializeApp({
      credential: admin.credential.cert(
        serviceAccount(configService) as admin.ServiceAccount,
      ),
      databaseURL: configService.get<string>('firebase.databaseUrl'),
    });
    this.database = admin.database();
  }

  // set은 해당 경로의 내용 상관 없이 입력한 데이터로 변경
  // push는 새로운 키를 만들고 그 밑에 입력한 데이터 추가
  async push(path: string, data) {
    const ref = this.getRef(path);
    await ref.push(data);
  }

  async set(path: string, data) {
    const ref = this.getRef(path);
    await ref.set(data);
  }

  // set은 내용 상관 없이 입력한 데이터로 변경
  // update는 있는 데이터만 업데이트 및 추가
  async update(path: string, data) {
    const ref = this.getRef(path);
    await ref.update(data);
  }

  async remove(path: string) {
    const ref = this.getRef(path);
    await ref.remove();
  }

  async get(path: string) {
    const ref = this.getRef(path);
    return await ref.get();
  }

  private getRef(path: string) {
    return this.database.ref(path);
  }
}

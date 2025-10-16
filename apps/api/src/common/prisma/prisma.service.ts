import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('📊 Connexion à la base de données établie');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📊 Connexion à la base de données fermée');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');
    
    return Promise.all(models.map((modelKey) => {
      const model = this[modelKey as keyof this] as any;
      return model.deleteMany();
    }));
  }
}

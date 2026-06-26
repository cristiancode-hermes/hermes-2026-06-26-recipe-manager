import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get<string>('database.url'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Static files (serves Angular frontend in production)
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const distPath = join(__dirname, '..', '..', 'frontend', 'dist', 'browser');
        try {
          require('fs').accessSync(distPath);
          return [
            {
              rootPath: distPath,
              exclude: ['/api*'],
            },
          ];
        } catch {
          return [];
        }
      },
    }),

    // Feature modules
    AuthModule,
    RecipesModule,
    IngredientsModule,
    MealPlansModule,
    ShoppingListModule,
    SeedModule,
  ],
})
export class AppModule {}
